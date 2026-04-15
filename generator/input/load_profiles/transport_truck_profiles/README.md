# Truck Charging Load Profiles

`analyze_truck_profiles.ipynb` derives a normalized hourly profile for electric freight truck charging. The output lives one directory up as `profile_transport_trucks_2024.csv` and `profile_transport_trucks_patterns.json`.

## Expected inputs (not distributed)

The notebook reads four files that were shared with this project confidentially by AI Sweden and **are not part of the repo** (see `.gitignore`):

- `export_aisweden_monthsPerGroup_2_dayAgg_weekday_opp_both_20pct(...).csv` — daily charging aggregates at the 20th-percentile operational scenario.
- `export_aisweden_monthsPerGroup_2_dayAgg_weekday_opp_both_40pct(...).csv` — daily charging aggregates at the 40th-percentile scenario.
- `ai_sweden_95pct_daily_peak_power(ai_sweden_95pct_daily_peak_powe).csv` — 95th-percentile daily peak power.
- `explanations.csv` — column glossary for the three files above.

These are derived from real fleet telematics and contain operational details AI Sweden considers commercially sensitive.

## Substituting public sources

Reasonable public substitutes for freight/truck charging shapes:

- **Trafikanalys** (Swedish Transport Analysis Agency) — heavy-truck movement statistics.
- **IEA Global EV Outlook** — published EV-truck charging shapes and assumptions.
- **NREL FleetDNA / HDVeVS** — U.S. heavy-duty vehicle drive cycles and charging curves.
- **Volvo / Scania / Daimler public ESG reports** — high-level charging-window assumptions.

Rewrite the first cells of the notebook to load from the public source(s) of your choice. Downstream logic (daily-to-hourly expansion, weekday/weekend separation, normalization to sum-to-1.0) is unchanged.

## Profile schema

- `profile_transport_trucks_2024.csv` — 8760 rows, `hour` + `value`, sums to 1.0.
- `profile_transport_trucks_patterns.json` — monthly / weekday / hourly multiplier tables used by the generator for synthesis when a full 8760-row profile is not available.
