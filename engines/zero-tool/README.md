# Architecture 2030 Zero Tool

> Building energy benchmarking against zero-carbon targets. Normalizes by climate, space type, size, occupancy, and schedule using CBECS baselines.

| | |
|---|---|
| **Status** | `live` |
| **Category** | energy-performance, target-setting |
| **Region** | north-america (CA, US) |
| **License** | Free web tool by Architecture 2030 |
| **Source** | [Architecture 2030](https://www.zerotool.org/) |
| **Author** | Architecture 2030 |

## Files

```
engines/zero-tool/
  engine.js    # API wrapper / calculation engine
  test.csv     # Example input data
  README.md    # This file
```

## Inputs (5)

| Field | Type | Unit | Req | Description |
|---|---|---|---|---|
| `building_type` | `enum` |  | ✓ | [BuildingType](#buildingtype) — CBECS building activity type |
| `climate_zone` | `enum` |  | ✓ | [ClimateZone](#climatezone) — ASHRAE 90.1 climate zone |
| `floor_area_sqft` | `number` | sqft |  | Gross floor area for total energy estimation |
| `target_year` | `integer` |  |  | Architecture 2030 Challenge target year (default: `2030`) |
| `units` | `enum` |  |  | [UnitSystem](#unitsystem) — Output unit system (default: `imperial`) |

## Outputs (8)

| Field | Type | Unit | Description |
|---|---|---|---|
| `baseline_eui` | `number` | kBtu/ft2 | Climate-adjusted CBECS baseline EUI |
| `target_eui` | `number` | kBtu/ft2 | Architecture 2030 target EUI |
| `reduction_pct` | `number` | % | Required reduction from baseline |
| `cbecs_baseline_eui` | `number` | kBtu/ft2 | Raw CBECS national median (before CZ adjustment) |
| `climate_zone_factor` | `number` |  | Climate zone adjustment multiplier |
| `arch2030_target` | `string` |  | Architecture 2030 target description |
| `baseline_eui_kwh_m2` | `number` | kWh/m2 | Metric equivalent (when units=metric) |
| `target_eui_kwh_m2` | `number` | kWh/m2 | Metric equivalent (when units=metric) |

## Reference Data

### BuildingType

CBECS principal building activity types

- `Education`
- `Food Sales`
- `Food Service`
- `Healthcare Inpatient`
- `Healthcare Outpatient`
- `Lodging`
- `Retail (Non-Mall)`
- `Retail (Mall)`
- `Office`
- `Public Assembly`
- `Public Order/Safety`
- `Religious Worship`
- `Service`
- `Warehouse`
- `Other`
- `Mixed Use`
- `Laboratory`
- `Data Center`
- `Multifamily Low-Rise`
- `Multifamily High-Rise`
- `Parking Garage`

### ClimateZone

ASHRAE 90.1 climate zones

- `1`
- `1A`
- `2`
- `2A`
- `2B`
- `3`
- `3A`
- `3B`
- `3C`
- `4`
- `4A`
- `4B`
- `4C`
- `5`
- `5A`
- `5B`
- `5C`
- `6`
- `6A`
- `6B`
- `7`
- `8`

### UnitSystem

Output unit system

- `imperial`
- `metric`

## Usage

```javascript
await engine.init();
const result = await engine.calculate({ building_type: ..., climate_zone: ..., floor_area_sqft: ... });
const results = await engine.runBatch(csvText);
```
