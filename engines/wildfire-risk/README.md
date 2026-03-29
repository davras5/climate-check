# Wildfire Risk to Communities

> USDA Forest Service free tool mapping wildfire risk, likelihood, and exposure for every community and census tract in the conterminous United States.

| | |
|---|---|
| **Status** | `live` |
| **Category** | physical-risk |
| **Region** | north-america (US) |
| **License** | Free public access (US government data â€” USDA Forest Service) |
| **Source** | [USDA Forest Service](https://wildfirerisk.org) |
| **Author** | USDA Forest Service |

## Files

```
engines/wildfire-risk/
  engine.js    # API wrapper / calculation engine
  test.csv     # Example input data
  README.md    # This file
```

## Inputs (2)

| Field | Type | Unit | Req | Description |
|---|---|---|---|---|
| `latitude` | `number` |  | ✓ | WGS84 latitude (contiguous US) |
| `longitude` | `number` |  | ✓ | WGS84 longitude (contiguous US) |

## Outputs (4)

| Field | Type | Unit | Description |
|---|---|---|---|
| `risk_to_homes` | `string` |  | [WildfireRiskClass](#wildfireriskclass) — Very Low / Low / Moderate / High / Very High |
| `wildfire_likelihood` | `number` |  | Annual burn probability (0-1) |
| `flame_length_ft` | `number` | ft | Conditional flame length if fire occurs |
| `exposure_type` | `string` |  | [WUIExposure](#wuiexposure) — WUI / Intermix / Interface / Non-WUI |

## Reference Data

### WildfireRiskClass

USFS wildfire risk to homes classification

- `Very Low`
- `Low`
- `Moderate`
- `High`
- `Very High`

### WUIExposure

Wildland-Urban Interface exposure type

- `WUI Intermix`
- `WUI Interface`
- `Non-WUI Vegetated`
- `Non-WUI Non-Vegetated`

## Usage

```javascript
// Loaded dynamically by the platform when a user opens this model
await engine.init();
const result = await engine.calculate({ latitude: ..., longitude: ... });

// Batch: process all rows from a CSV file
const results = await engine.runBatch(csvText);
```
