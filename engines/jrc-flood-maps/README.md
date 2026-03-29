# JRC Flood Hazard Maps

> Pre-computed flood maps for 10â€“500yr return periods. 100m EU, 90m global. Open data from Copernicus.

| | |
|---|---|
| **Status** | `live` |
| **Category** | physical-risk |
| **Region** | global (EU, Global) |
| **License** | Open data â€” Copernicus licence / CC BY 4.0 |
| **Source** | [JRC / Copernicus](https://data.jrc.ec.europa.eu/collection/id-0054) |
| **Author** | European Commission Joint Research Centre (JRC) |

## Files

```
engines/jrc-flood-maps/
  engine.js    # API wrapper / calculation engine
  test.csv     # Example input data
  README.md    # This file
```

## Inputs (3)

| Field | Type | Unit | Req | Description |
|---|---|---|---|---|
| `latitude` | `number` |  | ✓ | WGS84 latitude |
| `longitude` | `number` |  | ✓ | WGS84 longitude |
| `return_period` | `enum` | years |  | 10 / 20 / 50 / 100 / 200 / 500 (default 100) (default: `100`) |

## Outputs (3)

| Field | Type | Unit | Description |
|---|---|---|---|
| `flood_depth_m` | `number` |  | Modelled flood depth at location for the given return period |
| `flooded` | `boolean` |  | Whether the location is within the modelled flood extent |
| `dataset` | `string` |  | European (100m) or Global (1km) depending on location |

## Usage

```javascript
// Loaded dynamically by the platform when a user opens this model
await engine.init();
const result = await engine.calculate({ latitude: ..., longitude: ..., return_period: ... });

// Batch: process all rows from a CSV file
const results = await engine.runBatch(csvText);
```
