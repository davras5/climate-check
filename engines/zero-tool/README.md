# Architecture 2030 Zero Tool

> Building energy benchmarking against zero-carbon targets. Normalizes by climate, space type, size, occupancy, and schedule using CBECS baselines.

| | |
|---|---|
| **Status** | `live` |
| **Category** | target-setting, energy-performance |
| **Region** | north-america (US, CA) |
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

## Inputs (4)

| Field | Type | Unit | Req | Description |
|---|---|---|---|---|
| `building_type` | `enum` |  | ✓ | CBECS space type (Office, Retail, Education, Healthcare, Lodging, etc.) |
| `climate_zone` | `string` |  | ✓ | ASHRAE climate zone (e.g. 4A, 5B) |
| `floor_area_sqft` | `number` |  | ✓ | Gross floor area in square feet |
| `year_built` | `integer` |  |  | Construction year |

## Outputs (4)

| Field | Type | Unit | Description |
|---|---|---|---|
| `baseline_eui` | `number` |  | National median EUI for this building type |
| `target_eui` | `number` |  | EUI target for zero carbon operation |
| `reduction_pct` | `number` |  | Percentage reduction needed from baseline to target |
| `estimated_site_eui` | `number` |  | Estimated EUI based on building characteristics |

## Usage

```javascript
// Loaded dynamically by the platform when a user opens this model
await engine.init();
const result = await engine.calculate({ building_type: ..., climate_zone: ..., floor_area_sqft: ... });

// Batch: process all rows from a CSV file
const results = await engine.runBatch(csvText);
```
