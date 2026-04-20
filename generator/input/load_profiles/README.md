# Load Curves

This folder contains normalized hourly load profiles for each segment.

## Shipped base profiles vs. raw inputs

The repo ships with pre-generated, normalized profiles (`profile_*_2024.csv`, `profile_*_2025.csv`, and the corresponding `*_patterns.json` files). These are the "base profiles" the generator consumes directly — a fresh fork of this repo can run the generator end-to-end without any private data.

The subfolders `datacenters/`, `energy_company_profiles/`, `transport_truck_profiles/`, `transport_car_profiles/`, and `transport_rail_profiles/` contain the notebooks that built those profiles from source data shared confidentially by external parties. **The raw source files are not distributed with this repo** (they are gitignored). The notebooks remain as methodology documentation: each subfolder's README describes the expected input schema and points to public substitutes a forker can use to regenerate profiles with their own data.

## Expected Files

Each segment needs a parquet file with a normalized hourly profile:

| File | Description | Segments Using |
|------|-------------|----------------|
| `housing.parquet` | Residential electricity profile | housing |
| `services.parquet` | Commercial/services profile | services |
| `industry.parquet` | Industrial base load profile | industry |
| `datacenters.parquet` | Datacenter profile (flat) | datacenters |
| `transport.parquet` | General transport profile | freight_transport |
| `personal_transport.parquet` | EV charging profile | personal_transport |
| `rail.parquet` | Rail transport profile | rail |

## Profile Format

Each year-based profile is a CSV with two columns (`hour`, `value`):
- **8760 rows** if the source data year is non-leap, **8784 rows** if it is leap (e.g. 2024).
- `value` sums to 1.0 across the full year.

Pattern-based profiles (transport, datacenters) are JSON with explicit
`hourly`, `weekday`, and `monthly` arrays — see the individual
`profile_*_patterns.json` files.

## Leap Year Handling

The generator (`behovskartan2.ipynb` Cell 14) builds a
`(month, weekday, hour) → value` lookup by synthesizing timestamps from
`source_year-01-01 + hour_index` and grouping. Leap-year hours fold
naturally into the existing weekday buckets (Feb 29 2024 was a
Thursday, so those 24 hours join the `(month=2, weekday=Thu, hour=X)`
bucket alongside the other four Thursdays in Feb).

**Do not drop Feb 29 from a leap-year source.** Compacting 8784 rows to
8760 by removing Feb 29 reindexes every row from Mar 1 onwards, which
silently mis-assigns each hour to the wrong weekday and cascades a
1-day shift through Mar–Dec in the generated 2025–2050 parquet.
