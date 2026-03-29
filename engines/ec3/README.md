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
| `material_category` | `enum` |  |  | [MaterialCategory](#materialcategory) — openEPD top-level category |
| `material_name` | `string` |  |  | Free-text search term (alternative to category) |
| `country` | `string` |  |  | ISO 2-letter country code filter |
| `postal_code` | `string` |  |  | Postal code for proximity search |

## Outputs (8)

| Field | Type | Unit | Description |
|---|---|---|---|
| `epd_count` | `number` |  | Number of EPDs matching the query |
| `gwp_median` | `number` | kgCO2e/unit | Median embodied carbon across matching EPDs |
| `gwp_20th` | `number` | kgCO2e/unit | 20th percentile for achievable targets |
| `gwp_80th` | `number` | kgCO2e/unit | 80th percentile (industry average) |
| `gwp_min` | `number` | kgCO2e/unit | Lowest GWP across matching EPDs |
| `gwp_max` | `number` | kgCO2e/unit | Highest GWP across matching EPDs |
| `unit` | `string` |  | EPD declared unit (kg, m3, m2, etc.) |
| `best_practice` | `number` | kgCO2e/unit | 20th percentile as achievable target |

## Reference Data

### MaterialCategory

openEPD top-level material categories

- `Concrete`
- `Steel`
- `Aluminum`
- `Wood`
- `Insulation`
- `Carpet`
- `Cladding`
- `Gypsum`
- `Masonry`
- `Glass`
- `CeilingPanel`
- `Conduit`
- `HvacDucts`
- `Plaster`
- `PrecastConcrete`

## Usage

```javascript
await engine.init();
const result = await engine.calculate({ material_category: ..., material_name: ..., country: ... });
const results = await engine.runBatch(csvText);
```
