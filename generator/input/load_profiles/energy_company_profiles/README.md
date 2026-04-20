# Energy Company Load Profiles

`analyze_load_curves.ipynb` derives normalized hourly profiles for `housing`, `services`, and `industry` segments in two Swedish regions ("south" / Skövde and "west" / Göteborg). The normalized outputs live one directory up as `profile_housing_{south,west}_2024.csv`, `profile_services_{south,west}_2024.csv`, and `profile_industry_{south,west}_2024.csv`.

## Expected inputs (not distributed)

The notebook reads two files that were shared confidentially by two Swedish regional utilities and **are not part of the repo** (see `.gitignore`):

- `TidsserierGE.xlsx` — Göteborg Energi hourly timeseries for 2024. Sheet `Sheet1`, hourly timestamps in column A, load values per customer category ("Hushåll", "Service", "Tillverkning", etc.) in subsequent columns.
- `Normaliserad typlastprofil branscher v. 1.csv` — Skövde Energi normalized hourly load profile per sector for 2024, Swedish column headers, hourly cadence.

Both files are aggregated to the sector level — no individual customer data — but the regional/sector decomposition is still considered commercially sensitive by the providers.

## Substituting public sources

A forker can reproduce sector-level load shapes from public data:

- **ENTSO-E Transparency Platform** — total load by bidding zone (SE1–SE4), hourly.
- **Svenska kraftnät Mimer / Kontrollrummet** — Swedish grid load and per-area breakdowns.
- **Energimyndigheten statistics** — sector splits (hushåll, industri, tjänster) for calibrating relative magnitudes.

Rewrite the first cells of the notebook to load from the public source(s) of your choice. The downstream logic (normalizing each sector to sum to 1.0 over the full year) is unchanged.

## Profile schema

Each output CSV has two columns:
- `hour` — integer, 0-based
- `value` — float

The row count matches the source data year: **8760 rows** for a non-leap year, **8784 rows** for a leap year (e.g. 2024). `value` sums to 1.0 across the full year. Preserve the leap-year hours — dropping Feb 29 would cascade a 1-day weekday misalignment through Mar–Dec downstream.
