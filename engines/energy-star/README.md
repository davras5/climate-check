# ENERGY STAR Portfolio Manager

> US EPA tool that benchmarks building energy performance against national averages. Produces a 1â€“100 score where 50 is the median for similar buildings.

| | |
|---|---|
| **Status** | `live` |
| **Category** | energy-performance |
| **Region** | north-america (US, CA) |
| **License** | Free â€” US government program with public API |
| **Source** | [US EPA](https://www.energystar.gov/buildings/benchmark) |
| **Author** | US Environmental Protection Agency (EPA) |

## Files

```
engines/energy-star/
  engine.js    # API wrapper / calculation engine
  test.csv     # Example input data
  README.md    # This file
```

## Inputs (2)

| Field | Type | Unit | Req | Description |
|---|---|---|---|---|
| `property_id` | `integer` |  | ✓ | ENERGY STAR Portfolio Manager property ID |
| `year` | `integer` |  |  | Metrics reporting year (default: latest) |

## Outputs (5)

| Field | Type | Unit | Description |
|---|---|---|---|
| `energy_star_score` | `number` |  | Percentile-based energy performance score |
| `site_eui_kbtu_ft2` | `number` |  | Site energy use intensity |
| `source_eui_kbtu_ft2` | `number` |  | Source energy use intensity |
| `total_ghg_emissions_mtco2e` | `number` |  | Total direct + indirect GHG emissions |
| `property_type` | `string` |  | Building use type |

## Usage

```javascript
// Loaded dynamically by the platform when a user opens this model
await engine.init();
const result = await engine.calculate({ property_id: ..., year: ... });

// Batch: process all rows from a CSV file
const results = await engine.runBatch(csvText);
```
