# ThinkHazard!

> GFDRR/World Bank free multi-hazard screening tool providing hazard level classifications for any global location across 11 natural hazard types.

| | |
|---|---|
| **Status** | `live` |
| **Category** | physical-risk |
| **Region** | global (Global) |
| **License** | GNU GPL v3.0; content CC-BY-SA |
| **Source** | [GFDRR / World Bank](https://thinkhazard.org) |
| **Author** | GFDRR / World Bank |

## Files

```
engines/thinkhazard/
  engine.js    # API wrapper / calculation engine
  test.csv     # Example input data
  README.md    # This file
```

## Inputs (3)

| Field | Type | Unit | Req | Description |
|---|---|---|---|---|
| `latitude` | `number` |  | ✓ | WGS84 latitude |
| `longitude` | `number` |  | ✓ | WGS84 longitude |
| `admin_code` | `string` |  |  | GAUL admin division code (alternative to lat/lon) |

## Outputs (11)

| Field | Type | Unit | Description |
|---|---|---|---|
| `river_flood` | `string` |  | [HazardLevel](#hazardlevel) — Very low / Low / Medium / High |
| `coastal_flood` | `string` |  | [HazardLevel](#hazardlevel) — Very low / Low / Medium / High |
| `earthquake` | `string` |  | [HazardLevel](#hazardlevel) — Very low / Low / Medium / High |
| `landslide` | `string` |  | [HazardLevel](#hazardlevel) — Very low / Low / Medium / High |
| `cyclone` | `string` |  | [HazardLevel](#hazardlevel) — Very low / Low / Medium / High |
| `drought` | `string` |  | [HazardLevel](#hazardlevel) — Very low / Low / Medium / High |
| `extreme_heat` | `string` |  | [HazardLevel](#hazardlevel) — Very low / Low / Medium / High |
| `wildfire` | `string` |  | [HazardLevel](#hazardlevel) — Very low / Low / Medium / High |
| `water_scarcity` | `string` |  | [HazardLevel](#hazardlevel) — Very low / Low / Medium / High |
| `volcano` | `string` |  | [HazardLevel](#hazardlevel) — Very low / Low / Medium / High |
| `tsunami` | `string` |  | [HazardLevel](#hazardlevel) — Very low / Low / Medium / High |

## Reference Data

### HazardLevel

GFDRR hazard level classification

- `Very low`
- `Low`
- `Medium`
- `High`

## Usage

```javascript
// Loaded dynamically by the platform when a user opens this model
await engine.init();
const result = await engine.calculate({ latitude: ..., longitude: ..., admin_code: ... });

// Batch: process all rows from a CSV file
const results = await engine.runBatch(csvText);
```
