# EC3 Embodied Carbon Calculator

> Benchmarking and reducing embodied carbon in construction materials using the world's largest EPD database. Open source with open API.

| | |
|---|---|
| **Status** | `live` |
| **Category** | embodied-carbon |
| **Region** | global (Global) |
| **License** | Free open access with paid enterprise API tier |
| **Source** | [Building Transparency](https://www.buildingtransparency.org/tools/ec3/) |
| **Author** | Building Transparency (501c3 nonprofit) |

## Files

```
engines/ec3/
  engine.js    # API wrapper / calculation engine
  test.csv     # Example input data
  README.md    # This file
```

## Inputs (4)

| Field | Type | Unit | Req | Description |
|---|---|---|---|---|
| `material_category` | `string` |  | ✓ | EC3 category (e.g. 'ReadyMix', 'Steel', 'Aluminum', 'Insulation') |
| `country` | `string` |  |  | ISO 2-letter country code filter |
| `postal_code` | `string` |  |  | Postal code for proximity search |
| `max_distance_km` | `number` |  |  | Maximum supplier distance in km |

## Outputs (6)

| Field | Type | Unit | Description |
|---|---|---|---|
| `epd_count` | `number` |  | Number of EPDs matching the query |
| `gwp_median_kgco2e` | `number` |  | Median embodied carbon across matching EPDs |
| `gwp_20th_pctile` | `number` |  | 20th percentile for achievable targets |
| `gwp_80th_pctile` | `number` |  | 80th percentile (industry average baseline) |
| `unit` | `string` |  | EPD declared unit (kg, m3, m2, etc.) |
| `best_practice_gwp` | `number` |  | Lowest available GWP in the category |

## Usage

```javascript
// Loaded dynamically by the platform when a user opens this model
await engine.init();
const result = await engine.calculate({ material_category: ..., country: ..., postal_code: ... });

// Batch: process all rows from a CSV file
const results = await engine.runBatch(csvText);
```
