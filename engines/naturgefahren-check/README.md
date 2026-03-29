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
| `tolerance` | `number` | px |  | GeoAdmin identify tolerance (default 50) (default: `50`) |

## Outputs (12)

| Field | Type | Unit | Description |
|---|---|---|---|
| `flood_hazard` | `string` |  | [HazardLevel](#hazardlevel) — From BAFU/geodienste |
| `landslide_hazard` | `string` |  | [HazardLevel](#hazardlevel) —  |
| `avalanche_hazard` | `string` |  | [HazardLevel](#hazardlevel) —  |
| `rockfall_hazard` | `string` |  | [HazardLevel](#hazardlevel) —  |
| `debris_flow_hazard` | `string` |  | [HazardLevel](#hazardlevel) —  |
| `hail_hazard` | `string` |  | [HazardLevel](#hazardlevel) —  |
| `hail_details` | `string` |  | Hail size at 50yr/100yr return periods |
| `earthquake_risk` | `string` |  | Seismic risk classification |
| `earthquake_details` | `string` |  | Seismic zone, PGA |
| `overall_risk` | `string` |  | [HazardLevel](#hazardlevel) — Worst hazard level across all types |
| `dominated_by` | `string` |  | Which hazard type dominates |
| `protection_measures` | `array` |  | Recommended building protection measures |

## Reference Data

### HazardLevel

VKF hazard level classification

- `Low`
- `Medium`
- `High`
- `Very High`
- `Residual`

## Usage

```javascript
await engine.init();
const result = await engine.calculate({ latitude: ..., longitude: ..., tolerance: ... });
const results = await engine.runBatch(csvText);
```
