# Security Policy

## Reporting a vulnerability

If you believe you've found a security issue in this project, please report it privately rather than opening a public issue.

**Preferred:** Use GitHub's private vulnerability reporting at <https://github.com/aidotse/behovskartan/security/advisories/new>.

**Alternative:** Email the maintainer listed in the repository's `package.json` `author` field. Please include:

- A description of the issue and the impact you believe it has
- Steps to reproduce (a minimal proof-of-concept is ideal)
- The commit SHA or release version you tested against
- Any suggested mitigation, if you have one in mind

We aim to acknowledge reports within a few working days. Please do not disclose the issue publicly until we've had a chance to investigate and, if needed, ship a fix.

## Scope

This project deploys a public-facing API (`api/local-server.js`) and a static SvelteKit site (`explorer/`). In-scope issues include:

- Authentication / authorization bypasses
- Injection vulnerabilities (SQL, path traversal, command injection)
- Cross-site scripting (XSS) in the explorer
- Server-side request forgery (SSRF)
- Sensitive data exposure (tokens, credentials, internal endpoints) committed to the repository
- Misconfigurations in the deployment pipeline (`.github/workflows/`, `infrastructure/`)

Out of scope:

- Issues in third-party dependencies that do not affect this project's actual usage of them — please report those upstream.
- Denial-of-service via resource exhaustion where mitigations already exist (rate limiting, CloudFront caching).
- Self-XSS or issues requiring the victim to paste attacker-controlled content into their own browser console.

## Security model

- **Deployment auth:** GitHub Actions → AWS via OIDC federation (no long-lived access keys). The trust policy scopes which branches can assume the deploy role; see `infrastructure/README.md`.
- **API surface:** JSON only; input validation via OpenAPI Backend + AJV; SQL queries are parameterized (`api/query-builder.js`); file paths are whitelisted via `safeDataPath()`; HTTP security headers via `helmet`; rate limiting on `/demand`.
- **Secrets:** The only GitHub secret used by the pipeline is `MAPBOX_TOKEN`. Everything else is either a non-sensitive GitHub variable or injected via AWS environment variables on App Runner.

## Known limitations

- Several build-time transitive dependencies (`@inlang/paraglide-sveltekit` → `@lix-js/client` → `sha.js`; `duckdb` → `node-gyp` → `tar`) have open advisories that have not been patched upstream. These do not affect runtime code served to end users — they run during `npm install` or `vite build`. Runtime-exposed advisories are tracked in `docs/DEPLOYMENT.md` and bumped as fixes become available.
