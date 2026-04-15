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

Each profile should be a parquet file with:
- 8760 rows (one per hour of a non-leap year)
- Single column `value` with hourly weights
- Values should sum to 1.0 (normalized)

## How to Create Profiles

Use `generate_profiles.ipynb` to create profiles from historical data:

```python
# Example: Create housing profile from SVK data
import pandas as pd

# Load historical hourly data
historical = pd.read_parquet('historical_demand.parquet')

# Calculate average hourly pattern
profile = historical.groupby(historical['timestamp'].dt.hour)['value'].mean()

# Normalize to sum to 1.0
profile = profile / profile.sum()

# Save
profile.to_parquet('housing.parquet')
```

## Leap Year Handling

Profiles are stored as 8760 hours. The generator handles leap years by:
- Duplicating Feb 28 values for Feb 29
- Re-normalizing to maintain sum of 1.0
