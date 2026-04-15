# Deployment Infrastructure

This directory contains scripts and reference configuration for deploying Behovskartan to AWS. The deploy pipeline itself lives in `.github/workflows/deploy.yml` — this folder only holds (a) the one-time AWS setup script and (b) the Dockerfile used to build the API image.

## Architecture

```
┌─────────────────────────┐         ┌─────────────────────────┐
│   S3 + CloudFront       │         │    AWS App Runner       │
│   (Static Frontend)     │ ──────► │    (API Container)      │
│                         │         │                         │
│   explorer/build/       │         │   Node.js + Express     │
│   - HTML/CSS/JS         │         │   + DuckDB + Parquet    │
└─────────────────────────┘         └─────────────────────────┘
```

| Component | Service | Approx. cost |
|-----------|---------|--------------|
| API | AWS App Runner | ~$25/mo |
| Explorer | S3 + CloudFront | ~$1/mo |
| Container registry | ECR | ~$0.15/mo |
| Data storage | S3 (private) | negligible |

## Authentication model: GitHub OIDC → AWS IAM

The pipeline **does not use long-lived AWS access keys**. Instead, GitHub Actions exchanges a short-lived OIDC token for temporary AWS credentials via an IAM role whose trust policy permits only this repository. The security boundary is the trust policy, not secrecy of any key.

This means:
- There are no `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` secrets to rotate or leak.
- Forks cannot deploy — their OIDC tokens don't match the trust policy.
- The `production` GitHub environment gates deploys behind required reviewers.

## Prerequisites

- AWS CLI configured with admin (or sufficient) credentials for initial setup
- Docker installed locally (only needed if you want to build images by hand)
- A GitHub repo with Actions enabled

## Initial setup (one-time per AWS account)

### 1. Create the OIDC identity provider in AWS

Only needed once per AWS account. Skip if GitHub is already registered.

```bash
aws iam create-open-id-connect-provider \
  --url https://token.actions.githubusercontent.com \
  --client-id-list sts.amazonaws.com \
  --thumbprint-list 6938fd4d98bab03faadb97b34396831e3780aea1
```

### 2. Create the deploy role with a scoped trust policy

Replace `<AWS_ACCOUNT_ID>` and `<GITHUB_ORG>/<REPO>` below. The `sub` claim restricts which branches can assume the role — here `production` and `staging` only.

```bash
cat > /tmp/trust-policy.json <<'EOF'
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {
      "Federated": "arn:aws:iam::<AWS_ACCOUNT_ID>:oidc-provider/token.actions.githubusercontent.com"
    },
    "Action": "sts:AssumeRoleWithWebIdentity",
    "Condition": {
      "StringEquals": {
        "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
      },
      "StringLike": {
        "token.actions.githubusercontent.com:sub": [
          "repo:<GITHUB_ORG>/<REPO>:ref:refs/heads/production",
          "repo:<GITHUB_ORG>/<REPO>:ref:refs/heads/staging",
          "repo:<GITHUB_ORG>/<REPO>:environment:production",
          "repo:<GITHUB_ORG>/<REPO>:environment:staging"
        ]
      }
    }
  }]
}
EOF

aws iam create-role \
  --role-name behovskartan-github-deploy \
  --assume-role-policy-document file:///tmp/trust-policy.json
```

Attach a policy granting the minimum needed: ECR push, App Runner update, S3 sync to the explorer bucket, CloudFront invalidation. An example policy is in `infrastructure/iam-deploy-policy.example.json` if present; otherwise compose one yourself based on the actions used in `.github/workflows/deploy.yml`.

### 3. Run the resource setup script

```bash
cd infrastructure
./setup.sh dev   # or staging, production
```

This creates, idempotently:
- ECR repository (`behovskartan-api`)
- Private S3 bucket for the Explorer static site
- Private S3 bucket for API data (read via instance role)
- CloudFront distribution with Origin Access Control
- App Runner service and its ECR-access + instance roles

It will print a summary of the ARNs / IDs you need to copy into GitHub (next step).

### 4. Push an initial Docker image

App Runner needs an image in ECR before the service can be created on first run. The setup script prints the exact commands; they look like:

```bash
aws ecr get-login-password --region eu-central-1 | \
  docker login --username AWS --password-stdin \
  <AWS_ACCOUNT_ID>.dkr.ecr.eu-central-1.amazonaws.com

docker build -f infrastructure/Dockerfile \
  -t <AWS_ACCOUNT_ID>.dkr.ecr.eu-central-1.amazonaws.com/behovskartan-api:latest .

docker push <AWS_ACCOUNT_ID>.dkr.ecr.eu-central-1.amazonaws.com/behovskartan-api:latest
```

### 5. Configure GitHub

**Repository Secrets** (Settings → Secrets and variables → Actions → Secrets):

| Secret | Description |
|--------|-------------|
| `MAPBOX_TOKEN` | Mapbox API token used by the Explorer's map views |

That's the only secret. Everything else is either a GitHub **variable** (not secret — these are the non-sensitive ARNs and URLs below) or handled by OIDC.

**Repository or Environment Variables** (Settings → Environments → `staging` / `production` → Variables):

| Variable | Example |
|----------|---------|
| `AWS_DEPLOY_ROLE_ARN` | `arn:aws:iam::<AWS_ACCOUNT_ID>:role/behovskartan-github-deploy` |
| `APP_RUNNER_SERVICE_ARN` | `arn:aws:apprunner:eu-central-1:<AWS_ACCOUNT_ID>:service/...` |
| `S3_BUCKET_EXPLORER` | `behovskartan-explorer-production` |
| `S3_DATA_BUCKET` | `behovskartan-data-production` |
| `CLOUDFRONT_DISTRIBUTION_ID` | `E1234567890ABC` |
| `CLOUDFRONT_DOMAIN` | `d1234567890.cloudfront.net` |
| `API_URL` | `https://xxx.eu-central-1.awsapprunner.com` |
| `ALLOWED_ORIGINS` | `https://d1234567890.cloudfront.net` |
| `MAPBOX_STYLE_LIGHT` | `mapbox://styles/...` |
| `DATA_VERSION` | `2026-04` (or whatever tag your data uses) |

### 6. Protect the production branch and environment

- Settings → Branches → add a protection rule on `production` requiring PR review and passing status checks.
- Settings → Environments → `production` → add required reviewers so a human must approve each deploy.

## Triggering a deploy

Deploys run automatically on push:

- Push to `staging` → deploys to the `staging` environment
- Push to `production` → deploys to the `production` environment (gated by required reviewers)

You can also run the workflow manually from the Actions tab (`Deploy` → `Run workflow`) and pick an environment.

**Normal flow:** merge work into `main`, then fast-forward `main` into `staging` to test, then into `production` to release.

## Manual deployment (fallback)

If the pipeline is broken and you need to ship by hand:

### API

```bash
cd api
docker build -f ../infrastructure/Dockerfile -t behovskartan-api ..
# tag, push to ECR, and trigger `aws apprunner update-service` — see deploy.yml for the exact JSON shape
```

### Explorer

```bash
cd explorer
VITE_API_BASE_URL=https://xxx.awsapprunner.com npm run build
aws s3 sync build/ s3://<S3_BUCKET_EXPLORER>/ --delete
aws cloudfront create-invalidation --distribution-id <CLOUDFRONT_DISTRIBUTION_ID> --paths "/*"
```

## Monitoring

- **App Runner console** — logs, metrics, deployment status
- **CloudWatch Logs** — API stdout/stderr is streamed here automatically
- **CloudFront console** — CDN metrics and cache hit rates

## Troubleshooting

### App Runner deployment fails

1. Check the image exists in ECR: `aws ecr describe-images --repository-name behovskartan-api`
2. Check App Runner application logs in CloudWatch
3. Verify the ECR-access role is still attached (`behovskartan-apprunner-ecr-access`)

### Explorer shows old content

1. Invalidate CloudFront: `aws cloudfront create-invalidation --distribution-id <id> --paths "/*"`
2. Confirm S3 has the new objects: `aws s3 ls s3://<S3_BUCKET_EXPLORER>/`

### API returns CORS errors

1. Verify `ALLOWED_ORIGINS` is set on the App Runner service and matches the explorer origin exactly (including `https://`, no trailing slash).
2. Confirm `NODE_ENV=production` is also set — dev mode has permissive CORS which masks misconfiguration.

### Deploy job fails with "Not authorized to perform sts:AssumeRoleWithWebIdentity"

The role trust policy's `sub` condition doesn't match the running job. Check:
- The workflow is running on `staging` or `production` branch (or via `workflow_dispatch` targeting one of those environments).
- The `<GITHUB_ORG>/<REPO>` in the trust policy matches the actual repo (including any rename after a fork).

## Cost notes

- App Runner can be paused when not in use (saves ~80%).
- CloudFront `PriceClass_100` (US/EU only) is the default in `setup.sh` — cheaper than global.
- ECR lifecycle rules to expire untagged images keep registry costs negligible.
