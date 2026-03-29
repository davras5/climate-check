# WRI Aqueduct

> Global water risk atlas mapping 13 indicators including water stress, drought risk, and groundwater depletion with CMIP6 projections.

| | |
|---|---|
| **Status** | `live` |
| **Category** | physical-risk |
| **Region** | global (Global) |
| **License** | Creative Commons Attribution 4.0 International |
| **Source** | [WRI](https://www.wri.org/aqueduct) |
| **Author** | World Resources Institute + Utrecht University |

## Files

```
engines/wri-aqueduct/
  engine.js    # API wrapper / calculation engine
  test.csv     # Example input data
  README.md    # This file
```

## Inputs (4)

| Field | Type | Unit | Req | Description |
|---|---|---|---|---|
| `latitude` | `number` |  | ✓ | WGS84 latitude |
| `longitude` | `number` |  | ✓ | WGS84 longitude |
| `scenario` | `string` |  |  | optimistic / pessimistic / business_as_usual (default business_as_usual) (default: `business_as_usual`) |
| `year` | `integer` |  |  | 2030 / 2050 / 2080 (default 2030) (default: `2030`) |

## Outputs (6)

| Field | Type | Unit | Description |
|---|---|---|---|
| `overall_water_risk` | `string` |  | Low / Low-Medium / Medium-High / High / Extremely High |
| `baseline_water_stress` | `number` |  | Ratio of withdrawals to supply (0-5 scale) |
| `flood_occurrence` | `number` |  | Expected floods per year |
| `drought_severity` | `number` |  | Average drought severity index |
| `groundwater_decline` | `number` |  | Average decline in cm/year |
| `regulatory_risk` | `number` |  | Combined regulatory/reputational score (0-5) |

## Usage

```javascript
// Loaded dynamically by the platform when a user opens this model
await engine.init();
const result = await engine.calculate({ latitude: ..., longitude: ..., scenario: ... });

// Batch: process all rows from a CSV file
const results = await engine.runBatch(csvText);
```
