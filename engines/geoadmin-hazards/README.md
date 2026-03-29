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
| `landslide_hazard` | `string` |  | [HazardLevel](#hazardlevel) — From ch.bafu.gefahren-rutschungen |
| `avalanche_hazard` | `string` |  | [HazardLevel](#hazardlevel) — From ch.bafu.gefahren-lawinen |
| `rockfall_hazard` | `string` |  | [HazardLevel](#hazardlevel) — From ch.bafu.gefahren-sturz |
| `debris_flow_hazard` | `string` |  | [HazardLevel](#hazardlevel) — From ch.bafu.gefahren-murgaenge |
| `seismic_ground_class` | `string` |  | [SoilClass](#soilclass) — From ch.bafu.gefahren-baugrundklassen (A-F) |
| `source_layer` | `string` |  | GeoAdmin layer identifier |

## Reference Data

### HazardLevel

BAFU indicative hazard classification

- `Low`
- `Medium`
- `High`
- `Very High`

### SoilClass

SIA 261 seismic ground class

| Code | Value |
|---|---|
| `A` | Hard rock |
| `B` | Soft rock |
| `C` | Dense soil |
| `D` | Loose soil |
| `E` | Soft layer on rock |
| `F` | Special study needed |

## Usage

```javascript
await engine.init();
const result = await engine.calculate({ latitude: ..., longitude: ..., tolerance: ... });
const results = await engine.runBatch(csvText);
```
