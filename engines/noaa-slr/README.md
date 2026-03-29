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
| `slr_feet` | `enum` | ft |  | [SLRScenario](#slrscenario) — SLR scenario 1-10ft. If omitted, tests all levels. |

## Outputs (5)

| Field | Type | Unit | Description |
|---|---|---|---|
| `inundated` | `boolean` |  | Whether location is inundated at the given scenario |
| `depth` | `number` | ft | Water depth if inundated |
| `confidence` | `string` |  | DEM accuracy confidence level |
| `first_inundation_ft` | `number` | ft | Lowest SLR scenario causing inundation (all-scenarios mode) |
| `scenarios` | `array` |  | Array of 10 scenario objects with inundated/depth/confidence per level (all-scenarios mode) |

## Reference Data

### SLRScenario

NOAA SLR scenarios in feet above MHHW

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
await engine.init();
const result = await engine.calculate({ latitude: ..., longitude: ..., slr_feet: ... });
const results = await engine.runBatch(csvText);
```
