# NOAA Sea Level Rise Viewer

> Free interactive US coastal mapping tool showing inundation scenarios from 1â€“10 feet of sea level rise with flood frequency, marsh migration, and socioeconomic data layers.

| | |
|---|---|
| **Status** | `live` |
| **Category** | physical-risk |
| **Region** | north-america (US) |
| **License** | Free public access (US government data, public domain) |
| **Source** | [NOAA Office for Coastal Management](https://coast.noaa.gov/slr/) |
| **Author** | NOAA Office for Coastal Management |

## Files

```
engines/noaa-slr/
  engine.js    # API wrapper / calculation engine
  test.csv     # Example input data
  README.md    # This file
```

## Inputs (3)

| Field | Type | Unit | Req | Description |
|---|---|---|---|---|
| `latitude` | `number` |  | ✓ | WGS84 latitude (US coastal areas) |
| `longitude` | `number` |  | ✓ | WGS84 longitude (US coastal areas) |
| `slr_feet` | `number` | ft |  | [SLRScenario](#slrscenario) — SLR scenario in feet, 1-10 (default 3) (default: `3`) |

## Outputs (3)

| Field | Type | Unit | Description |
|---|---|---|---|
| `inundated` | `boolean` |  | Whether the location is inundated at the given SLR scenario |
| `depth_ft` | `number` | ft | Water depth at location if inundated |
| `confidence` | `string` |  | High / Medium / Low based on DEM accuracy |

## Reference Data

### SLRScenario

Sea level rise scenario in feet above MHHW

- `1`
- `2`
- `3`
- `4`
- `5`
- `6`
- `7`
- `8`
- `9`
- `10`

## Usage

```javascript
// Loaded dynamically by the platform when a user opens this model
await engine.init();
const result = await engine.calculate({ latitude: ..., longitude: ..., slr_feet: ... });

// Batch: process all rows from a CSV file
const results = await engine.runBatch(csvText);
```
