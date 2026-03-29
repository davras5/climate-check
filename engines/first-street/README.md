# First Street Risk Factor

> Freemium US property-level climate risk platform covering flood, fire, wind, heat, and air quality with 30-year forward-looking projections.

| | |
|---|---|
| **Status** | `live` |
| **Category** | physical-risk |
| **Region** | north-america (US) |
| **License** | Free basic property risk scores; paid for full reports, commercial data, and API |
| **Source** | [First Street Foundation](https://riskfactor.com) |
| **Author** | First Street Foundation |

## Files

```
engines/first-street/
  engine.js    # API wrapper / calculation engine
  test.csv     # Example input data
  README.md    # This file
```

## Inputs (4)

| Field | Type | Unit | Req | Description |
|---|---|---|---|---|
| `latitude` | `number` |  | ✓ | WGS84 latitude (US addresses) |
| `longitude` | `number` |  | ✓ | WGS84 longitude (US addresses) |
| `address` | `string` |  |  | US street address (alternative to lat/lon) |
| `fsid` | `string` |  |  | First Street property ID (alternative) |

## Outputs (5)

| Field | Type | Unit | Description |
|---|---|---|---|
| `flood_factor` | `number` |  | [RiskFactor](#riskfactor) — 30-year flood risk score |
| `fire_factor` | `number` |  | [RiskFactor](#riskfactor) — 30-year wildfire risk score |
| `heat_factor` | `number` |  | [RiskFactor](#riskfactor) — 30-year extreme heat risk score |
| `wind_factor` | `number` |  | [RiskFactor](#riskfactor) — 30-year wind risk score |
| `air_factor` | `number` |  | [RiskFactor](#riskfactor) — 30-year air quality risk score |

## Reference Data

### RiskFactor

First Street 30-year forward-looking risk score

| Code | Value |
|---|---|
| `1` | Minimal |
| `2` | Minor |
| `3` | Moderate |
| `4` | Major |
| `5-6` | Severe |
| `7-8` | Extreme |
| `9-10` | Almost certain |

## Usage

```javascript
// Loaded dynamically by the platform when a user opens this model
await engine.init();
const result = await engine.calculate({ latitude: ..., longitude: ..., address: ... });

// Batch: process all rows from a CSV file
const results = await engine.runBatch(csvText);
```
