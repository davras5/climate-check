# geo.admin.ch Hazard Layers

> Swiss federal geoportal with 50+ coordinate-queryable layers for CO2 emissions, natural hazards, building data, solar potential, and environmental risk.

| | |
|---|---|
| **Status** | `live` |
| **Category** | physical-risk |
| **Region** | switzerland (CH) |
| **License** | OGD â€” Swiss federal open data |
| **Source** | [swisstopo](https://map.geo.admin.ch/) |
| **Author** | swisstopo / BAFU / BFE / MeteoSwiss |

## Files

```
engines/geoadmin-hazards/
  engine.js    # API wrapper / calculation engine
  test.csv     # Example input data
  README.md    # This file
```

## Inputs (3)

| Field | Type | Unit | Req | Description |
|---|---|---|---|---|
| `latitude` | `number` |  | ✓ | WGS84 latitude (e.g. 47.3769) |
| `longitude` | `number` |  | ✓ | WGS84 longitude (e.g. 8.5417) |
| `tolerance` | `number` | m |  | Identify tolerance in metres (default 50) (default: `50`) |

## Outputs (6)

| Field | Type | Unit | Description |
|---|---|---|---|
| `flood_hazard` | `string` |  | [HazardLevel](#hazardlevel) — Low / Medium / High / Very High or null |
| `landslide_hazard` | `string` |  | [HazardLevel](#hazardlevel) — Low / Medium / High / Very High or null |
| `avalanche_hazard` | `string` |  | [HazardLevel](#hazardlevel) — Low / Medium / High / Very High or null |
| `rockfall_hazard` | `string` |  | [HazardLevel](#hazardlevel) — Low / Medium / High / Very High or null |
| `debris_flow_hazard` | `string` |  | [HazardLevel](#hazardlevel) — Low / Medium / High / Very High or null |
| `source_layer` | `string` |  | GeoAdmin layer identifier |

## Reference Data

### HazardLevel

BAFU indicative hazard classification

- `Low`
- `Medium`
- `High`
- `Very High`

## Usage

```javascript
// Loaded dynamically by the platform when a user opens this model
await engine.init();
const result = await engine.calculate({ latitude: ..., longitude: ..., tolerance: ... });

// Batch: process all rows from a CSV file
const results = await engine.runBatch(csvText);
```
