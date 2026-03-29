# Schutz vor Naturgefahren

> Free address-level natural hazard check for any Swiss building. Combines flood, landslide, hail, avalanche, rockfall, and storm risk with protection recommendations.

| | |
|---|---|
| **Status** | `live` |
| **Category** | physical-risk |
| **Region** | switzerland (CH) |
| **License** | Free public tool |
| **Source** | [VKF/AECA](https://www.schutz-vor-naturgefahren.ch) |
| **Author** | VKF/AECA (Association of Cantonal Fire Insurance Institutes) |

## Files

```
engines/naturgefahren-check/
  engine.js    # API wrapper / calculation engine
  test.csv     # Example input data
  README.md    # This file
```

## Inputs (3)

| Field | Type | Unit | Req | Description |
|---|---|---|---|---|
| `latitude` | `number` |  | ✓ | WGS84 latitude |
| `longitude` | `number` |  | ✓ | WGS84 longitude |
| `address` | `string` |  |  | Swiss address (alternative to lat/lon) |

## Outputs (6)

| Field | Type | Unit | Description |
|---|---|---|---|
| `overall_risk` | `string` |  | [RiskLevel](#risklevel) — Low / Medium / High |
| `flood_risk` | `string` |  | Hazard level + protection recommendations |
| `hail_risk` | `string` |  | Hazard level |
| `storm_risk` | `string` |  | Hazard level |
| `earthquake_zone` | `string` |  | [SeismicZone](#seismiczone) — SIA zone classification |
| `protection_measures` | `array` |  | Recommended building protection measures |

## Reference Data

### RiskLevel

VKF overall natural hazard risk level

- `Low`
- `Medium`
- `High`

### SeismicZone

SIA 261 earthquake zone for Switzerland

- `Z1`
- `Z2`
- `Z3a`
- `Z3b`

## Usage

```javascript
// Loaded dynamically by the platform when a user opens this model
await engine.init();
const result = await engine.calculate({ latitude: ..., longitude: ..., address: ... });

// Batch: process all rows from a CSV file
const results = await engine.runBatch(csvText);
```
