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
| `return_period` | `enum` | years |  | [ReturnPeriod](#returnperiod) — If omitted, queries all available periods |

## Outputs (7)

| Field | Type | Unit | Description |
|---|---|---|---|
| `flood_depth_10yr_m` | `number` | m | Flood depth for 10-year return period |
| `flood_depth_100yr_m` | `number` | m | Flood depth for 100-year return period |
| `flood_depth_500yr_m` | `number` | m | Flood depth for 500-year return period |
| `flooded_10yr` | `boolean` |  | Inundated at 10-year return period |
| `flooded_100yr` | `boolean` |  | Inundated at 100-year return period |
| `flooded_500yr` | `boolean` |  | Inundated at 500-year return period |
| `dataset_source` | `string` |  | JRC European (100m) or GloFAS Global (1km) |

## Reference Data

### ReturnPeriod

Available return periods (years)

- `10`
- `20`
- `50`
- `100`
- `200`
- `500`

## Usage

```javascript
await engine.init();
const result = await engine.calculate({ latitude: ..., longitude: ..., return_period: ... });
const results = await engine.runBatch(csvText);
```
