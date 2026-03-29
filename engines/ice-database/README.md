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

## Inputs (4)

| Field | Type | Unit | Req | Description |
|---|---|---|---|---|
| `material_name` | `string` |  | ✓ | Material search term (e.g. 'concrete', 'steel') |
| `material_category` | `enum` |  |  | [MaterialCategory](#materialcategory) — ICE category filter |
| `quantity_kg` | `number` | kg |  | Mass quantity for total EC/EE calculation |
| `quantity_m3` | `number` | m3 |  | Volume quantity (converted via density) |

## Outputs (10)

| Field | Type | Unit | Description |
|---|---|---|---|
| `material_name` | `string` |  | Full ICE material name |
| `category` | `string` |  | ICE material category |
| `ec_kgco2e_per_kg` | `number` | kgCO2e/kg | Embodied carbon per kilogram |
| `ec_kgco2e_per_m3` | `number` | kgCO2e/m3 | Embodied carbon per cubic metre |
| `ee_mj_per_kg` | `number` | MJ/kg | Embodied energy per kilogram |
| `ee_mj_per_m3` | `number` | MJ/m3 | Embodied energy per cubic metre |
| `density_kg_m3` | `number` | kg/m3 | Material density |
| `total_ec_kgco2e` | `number` | kgCO2e | Total embodied carbon (when quantity provided) |
| `total_ee_mj` | `number` | MJ | Total embodied energy (when quantity provided) |
| `data_quality` | `string` |  | [DataQuality](#dataquality) — Good / Fair / Poor |

## Reference Data

### MaterialCategory

ICE v3.0 material categories

- `Concrete`
- `Cement`
- `Steel`
- `Timber`
- `Aluminium`
- `Glass`
- `Masonry`
- `Insulation`
- `Finishes`
- `Metals`
- `Plastics`

### DataQuality

ICE data quality rating

- `Good`
- `Fair`
- `Poor`

## Usage

```javascript
await engine.init();
const result = await engine.calculate({ material_name: ..., material_category: ..., quantity_kg: ... });
const results = await engine.runBatch(csvText);
```
