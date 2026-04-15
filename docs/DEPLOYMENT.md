# Deployment

## Overview

The project deploys to AWS using GitHub Actions with OIDC authentication (no stored AWS keys).

| Component | Service |
|-----------|---------|
| API | App Runner (one service per environment) |
| Explorer | S3 + CloudFront (one bucket + distribution per environment) |

URLs, ARNs, and bucket names live in GitHub Actions environment variables — see `gh variable list --env staging` / `--env production`. The canonical production API is `https://api.behovskartan.se` and the production Explorer is served from its own CloudFront distribution.

## How to Deploy

The project has **two deployment branches**: `staging` and `production`. Pushing to either triggers `.github/workflows/deploy.yml`, which picks the environment based on the ref. Staging is the default path — merge `main` → `staging`, verify, then merge `staging` → `production`.

### Staging

```bash
git checkout staging
git merge main
git push origin staging
```

### Production

```bash
git checkout production
git merge staging   # (or main, if staging is up to date)
git push origin production
```

Either push runs the full pipeline: build API image → deploy to App Runner → build Explorer → sync to S3 → invalidate CloudFront cache.

### Manual (workflow dispatch)

Go to **Actions → Deploy → Run workflow** in GitHub and pick `staging` or `production`, or:

```bash
gh workflow run deploy.yml --ref staging -f environment=staging
```

## Pipeline

The workflow (`.github/workflows/deploy.yml`) runs three sequential jobs:

1. **build-api** — Builds the API Docker image and pushes to ECR
2. **deploy-api** — Updates App Runner with the new image, waits for it to become healthy
3. **deploy-explorer** — Builds SvelteKit static site, syncs to S3, invalidates CloudFront

## Branch Strategy

| Branch | Purpose |
|--------|---------|
| `main` | Development integration branch |
| `feature/*` | Feature branches, merged to `main` via PR |
| `staging` | Deployment trigger for the staging environment — merge `main` here to test on staging infra |
| `production` | Deployment trigger for the production environment — merge `staging` here to ship |

## AWS Infrastructure

All resources live in `eu-central-1`. Each environment (`staging`, `production`) has its own set of resources, suffixed accordingly. The AWS account ID is not hardcoded in the repo — the deploy role ARN is injected via the GitHub Actions variable `AWS_DEPLOY_ROLE_ARN`.

| Resource | Pattern |
|----------|---------|
| ECR repository | `behovskartan-api` (shared; image tagged per commit) |
| App Runner service | `behovskartan-api-staging`, `behovskartan-api-production` |
| S3 explorer bucket | `behovskartan-explorer-staging`, `behovskartan-explorer-production` |
| S3 data bucket | `behovskartan-data-staging`, `behovskartan-data-production` |
| CloudFront distribution | one per environment (IDs live in GitHub env vars) |
| OIDC provider | `token.actions.githubusercontent.com` |
| Deploy role | `behovskartan-github-deploy` |

### API data at runtime

The API Docker image is **not** baked with data. On container startup, `infrastructure/entrypoint.sh` downloads the current data version from `s3://behovskartan-data-{env}/{DATA_VERSION}/` into the container's `/data` directory before starting the Node server. This means:

- Data updates ship by uploading a new version to the data bucket and bumping the `DATA_VERSION` GitHub Actions variable — no image rebuild required.
- The API needs `S3_DATA_BUCKET` and `DATA_VERSION` env vars set (both are wired in the App Runner service config by the deploy workflow).
- Local development reads from the repo's `data/` directory directly.

### Explorer 404 handling

CloudFront `CustomErrorResponses` map both 403 and 404 from S3 → `/404.html` with a 404 status. SvelteKit's `adapter-static` is configured with `fallback: '404.html'`, so the build emits an SPA shell at that path; the client router then renders `src/routes/+error.svelte` for unknown URLs. This pattern lives in `infrastructure/setup.sh` for new distributions.

### Authentication

GitHub Actions authenticates via **OIDC federation** — no AWS access keys are stored as secrets. The IAM role `behovskartan-github-deploy` has a trust policy scoped to `repo:aidotse/behovskartan:*` and permissions for ECR, App Runner, S3, and CloudFront.

## GitHub Settings

### Environments: `staging` and `production`

Each environment has its own set of variables. List with `gh variable list --env staging` or `--env production`.

| Variable | Description |
|----------|-------------|
| `API_URL` | App Runner service URL |
| `APP_RUNNER_SERVICE_ARN` | App Runner service ARN |
| `S3_BUCKET_EXPLORER` | S3 bucket for Explorer static files |
| `S3_DATA_BUCKET` | S3 bucket the API downloads data from at startup |
| `DATA_VERSION` | Data version prefix inside the data bucket |
| `CLOUDFRONT_DISTRIBUTION_ID` | CloudFront distribution ID |
| `CLOUDFRONT_DOMAIN` | CloudFront domain (custom or `d*.cloudfront.net`) |
| `ALLOWED_ORIGINS` | CORS allowed origins for the API |
| `AWS_DEPLOY_ROLE_ARN` | IAM role ARN for OIDC auth |
| `MAPBOX_STYLE_LIGHT` | Mapbox light theme style URL |

Protection rules on the `production` environment gate the deploy jobs on required reviewers.

### Repository-level

| Type | Name | Description |
|------|------|-------------|
| Variable | `AWS_DEPLOY_ROLE_ARN` | Also set at repo level for the `build-api` job (no environment) |
| Secret | `MAPBOX_TOKEN` | Mapbox access token, passed as `VITE_MAPBOX_TOKEN` at build time |

## Environment Variables (Explorer)

The Explorer reads these at build time via Vite's `import.meta.env`:

| Variable | Local (`.env`) | CI |
|----------|---------------|----|
| `VITE_API_BASE_URL` | `http://localhost:4010` | From `vars.API_URL` |
| `VITE_MAPBOX_TOKEN` | Token value | From `secrets.MAPBOX_TOKEN` |
| `VITE_MAPBOX_STYLE_LIGHT` | Style URL | From `vars.MAPBOX_STYLE_LIGHT` |

## Troubleshooting

**Workflow fails at "Configure AWS credentials"**
- Check that the OIDC provider exists: `aws iam list-open-id-connect-providers`
- Check the role trust policy allows the repo: `aws iam get-role --role-name behovskartan-github-deploy`

**App Runner deployment hangs**
- The `wait service-running` step has a fallback (`|| echo`), so it won't block forever
- Check App Runner console for service events

**Explorer shows broken map**
- Verify `MAPBOX_TOKEN` secret is set: `gh secret list --repo aidotse/behovskartan`
- Locally, check `explorer/.env` has `VITE_MAPBOX_TOKEN`

**Need to redeploy only Explorer (skip API)**
- Use workflow dispatch, or push a commit that only touches `explorer/`
- Currently both always deploy; path filtering can be added later if needed
