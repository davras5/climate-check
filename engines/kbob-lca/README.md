# KBOB Ã–kobilanzdaten

> Authoritative Swiss LCA database for construction materials, building technology, and energy. Used by Minergie, SNBS, and all Swiss green building labels.

| | |
|---|---|
| **Status** | `live` |
| **Category** | epd-database, embodied-carbon |
| **Region** | switzerland (CH) |
| **License** | Free â€” data download and API via lcadata.ch |
| **Source** | [KBOB](https://www.kbob.admin.ch/de/oekobilanzdaten-im-baubereich) |
| **Author** | KBOB / ecobau / IPB (based on Ecoinvent) |

## Files

```
engines/kbob-lca/
  engine.js    # API wrapper / calculation engine
  test.csv     # Example input data
  README.md    # This file
```

## Inputs (3)

| Field | Type | Unit | Req | Description |
|---|---|---|---|---|
| `material_id` | `string` |  |  | KBOB material UUID |
| `material_name` | `string` |  |  | Material name (search query, e.g. 'Beton') |
| `category` | `string` |  |  | Material category filter (e.g. 'Beton', 'Holz', 'Metall') |

## Outputs (7)

| Field | Type | Unit | Description |
|---|---|---|---|
| `material_name_de` | `string` |  | German material name |
| `material_name_fr` | `string` |  | French material name |
| `gwp_kgco2e_per_unit` | `number` |  | Global warming potential per functional unit |
| `penr_kwh_per_unit` | `number` |  | Non-renewable primary energy per functional unit |
| `ubp_per_unit` | `number` |  | Ecological scarcity points per functional unit |
| `unit` | `string` |  | Reference unit (kg, m2, m3, etc.) |
| `density_kg_m3` | `number` |  | Material density if applicable |

## Usage

```javascript
// Loaded dynamically by the platform when a user opens this model
await engine.init();
const result = await engine.calculate({ material_id: ..., material_name: ..., category: ... });

// Batch: process all rows from a CSV file
const results = await engine.runBatch(csvText);
```
