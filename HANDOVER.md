# Handover

This document is shipped both in the public repository and in the private
handover tarball, so it can be read from either side.

## What this project is

"Energy Toolkit: Demand" (Behovskartan 2) — a framework for making, sharing
and visualizing Swedish energy demand forecasts. See [README.md](README.md)
and [CLAUDE.md](CLAUDE.md) for the full picture; the rest of this file
focuses only on what is needed to **take ownership** of the project.

## Components

The repo is a monorepo of three independent components:

1. **Generator** ([generator/](generator/)) — Python pipeline that turns raw
   inputs (load profiles, scenarios, geographies, population) into the
   parquet files consumed by the API.
2. **API** ([api/](api/)) — Node.js + DuckDB server backed by the generated
   parquet files, with an OpenAPI 3.1 spec and pre-rendered static endpoints.
3. **Explorer** ([explorer/](explorer/)) — SvelteKit web app that visualizes
   the API.

Each one has its own README; start there.

## How the data flows

```
generator/input/   →   generator/   →   data/   →   api/   →   explorer/
(raw sources)         (Python)        (parquet)    (DuckDB)    (SvelteKit)
```

- `generator/input/` holds raw sources (CSV, XLSX, GeoJSON, notebooks).
- Running the generator writes parquet + JSON into `data/` (gitignored).
- The API reads from `data/` (locally) or from an S3 bucket (in production).
- The Explorer reads from the API.

## What is in the public repo

Everything you need to **run** the project against pre-generated data:

- All source code for the three components.
- The full OpenAPI spec ([api/openapi.yaml](api/openapi.yaml)).
- The shared config ([config.yaml](config.yaml)).
- Most generator inputs that are openly licensed (geographies, population,
  energy agency scenarios, anonymised load-profile derivatives, scenario
  curve notebooks).
- Documentation in [docs/](docs/) and module READMEs.
- Infrastructure scripts in [infrastructure/](infrastructure/) and CI
  workflows in [.github/workflows/](.github/workflows/).

## What is **not** in the public repo

Two categories of files are missing from the public checkout:

1. **Generated data** (`/data/`, `/api/data/`) — large parquet files. Never
   committed; regenerated from inputs by the generator, or downloaded from
   S3 at API container startup in production.
2. **Private generator inputs** — a handful of raw load-profile files that
   were shared under restrictive terms and cannot be redistributed publicly.

If you have the **handover tarball**, it contains the private generator
inputs plus a `PRIVATE_FILES.md` that lists each one and where it belongs in
the tree. Unpack the tarball over a fresh checkout of the repo and you will
have a complete working copy.

If you do **not** have the handover tarball, the project will still run
against the production data in S3 (read-only), and you can develop and
deploy code changes — you just cannot regenerate the dataset from scratch.

## First-run checklist

1. Clone the repo.
2. If you have the handover tarball, extract it at the repo root:
   `tar -xzf behovskartan-handover.tar.gz -C /path/to/behovskartan`
3. Copy `explorer/.env.example` to `explorer/.env` and fill in the Mapbox
   token (a personal token from https://account.mapbox.com/access-tokens/
   works fine; the existing token is in the tarball if you want to keep
   continuity).
4. Install dependencies:
   - `cd api && npm install`
   - `cd explorer && npm install`
   - `cd generator && pip install -e .` (Python 3.11+, ideally in a venv)
5. Get data into `data/`:
   - **Option A (fastest):** sync the production bucket from S3 — see
     [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for the bucket name and the
     AWS credentials story.
   - **Option B (reproducible):** run the generator end-to-end. Requires
     the private inputs from the handover tarball. See
     [generator/README.md](generator/README.md).
6. Start the stack: `cd api && npm start` (port 4010), then
   `cd explorer && npm run dev` (port 5173) in another terminal.

## Deployment

Production deploys are triggered by pushes to the `production` branch
(not `main`). Workflow: merge into `main`, then merge `main` into
`production` and push. The deploy pipeline builds a Docker image, pushes
it to ECR, and deploys to AWS App Runner. API data is downloaded from S3
at container startup, not baked into the image. Full details in
[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Things that will bite a new owner

- **Mapbox token** — the one in `explorer/.env` belongs to the original
  author's personal account. Replace it with your own before deploying.
- **AWS account** — the deploy targets a specific AWS account (ECR repo,
  App Runner service, S3 data bucket). To take it over you will need
  either access to that account or to recreate the resources in your own.
  See [infrastructure/setup.sh](infrastructure/setup.sh).
- **DNS / domain** — production runs on a custom domain pointed at App
  Runner. Updating that is outside this repo.
- **Generator inputs are opinionated, not authoritative** — the load
  profiles in the private tarball were assembled from several sources
  with manual cleaning. If the underlying data updates, regenerating
  may require revisiting the notebooks under
  `generator/input/load_profiles/*/`.
- **LayerChart fragility** — see the LayerChart Rules section in
  [CLAUDE.md](CLAUDE.md) before touching any chart component.

## Where to ask questions

Original author: Viktor Bengtsson (viktor@vkbn.ltd). The handover tarball
is a one-shot snapshot — there is no ongoing private channel. After you
have it, the public repo is the source of truth.
