# ICE Database

> Free reference database of embodied carbon coefficients for 200+ building materials across 30+ categories. Widely used globally with 50,000+ downloads.

| | |
|---|---|
| **Status** | `live` |
| **Category** | embodied-carbon |
| **Region** | global (Global) |
| **License** | Free (Educational: no registration; Advanced: free registration required) |
| **Source** | [Circular Ecology](https://circularecology.com/embodied-carbon-footprint-database.html) |
| **Author** | Circular Ecology (originally University of Bath, Prof. Geoff Hammond & Dr. Craig Jones) |

## Files

```
engines/ice-database/
  engine.js    # API wrapper / calculation engine
  test.csv     # Example input data
  README.md    # This file
```

## Inputs (2)

| Field | Type | Unit | Req | Description |
|---|---|---|---|---|
| `material_name` | `string` |  | ✓ | Material search term (e.g. 'concrete', 'steel', 'timber', 'glass') |
| `material_category` | `string` |  |  | [MaterialCategory](#materialcategory) — ICE category filter (e.g. 'Concrete', 'Steel', 'Timber') |

## Outputs (6)

| Field | Type | Unit | Description |
|---|---|---|---|
| `material` | `string` |  | Full material name from ICE database |
| `ec_kgco2e_per_kg` | `number` |  | Cradle-to-gate embodied carbon coefficient |
| `ec_kgco2e_per_m3` | `number` |  | Volumetric embodied carbon if density available |
| `density_kg_m3` | `number` |  | Material density |
| `data_quality` | `string` |  | [DataQuality](#dataquality) — Good / Fair / Poor based on ICE data rating |
| `source_count` | `number` |  | Number of source studies |

## Reference Data

### DataQuality

ICE data quality rating based on source studies

- `Good`
- `Fair`
- `Poor`

### MaterialCategory

ICE v3.0 material category

- `Concrete`
- `Cement`
- `Steel`
- `Timber`
- `Aluminium`
- `Glass`
- `Bricks`
- `Insulation`
- `Plasterboard`
- `Copper`
- `Plastics`
- `Aggregates`

## Usage

```javascript
// Loaded dynamically by the platform when a user opens this model
await engine.init();
const result = await engine.calculate({ material_name: ..., material_category: ... });

// Batch: process all rows from a CSV file
const results = await engine.runBatch(csvText);
```
