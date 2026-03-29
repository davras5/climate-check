# ERM-CH23 Earthquake Risk Model

> First national earthquake risk model for Switzerland. Estimates building vulnerability and financial losses for 2M+ buildings using OpenQuake.

| | |
|---|---|
| **Status** | `live` |
| **Category** | physical-risk |
| **Region** | switzerland (CH) |
| **License** | Free â€” publicly accessible |
| **Source** | [ETH SED](http://www.seismo.ethz.ch/en/knowledge/earthquake-hazard-and-risk/earthquake-risk-switzerland/Earthquake-Risk-Model/) |
| **Author** | ETH SED (Swiss Seismological Service) with BAFU and BABS |

## Files

```
engines/erm-ch23/
  engine.js    # API wrapper / calculation engine
  test.csv     # Example input data
  README.md    # This file
```

## Inputs (3)

| Field | Type | Unit | Req | Description |
|---|---|---|---|---|
| `latitude` | `number` |  | ✓ | WGS84 latitude |
| `longitude` | `number` |  | ✓ | WGS84 longitude |
| `return_period` | `number` | years |  | Scenario return period, e.g. 475 (default 475) (default: `475`) |

## Outputs (5)

| Field | Type | Unit | Description |
|---|---|---|---|
| `pga_g` | `number` | g | PGA at bedrock for given return period |
| `spectral_accel_03s` | `number` | g | Spectral acceleration at 0.3 seconds |
| `spectral_accel_1s` | `number` | g | Spectral acceleration at 1.0 seconds |
| `seismic_zone` | `string` |  | [SeismicZone](#seismiczone) — SIA 261 zone (Z1/Z2/Z3a/Z3b) |
| `soil_class` | `string` |  | [SoilClass](#soilclass) — Ground class (A-E) if available |

## Reference Data

### SeismicZone

SIA 261 earthquake zone classification

| Code | Value |
|---|---|
| `Z1` | agr < 0.6 m/s2 |
| `Z2` | 0.6-1.0 m/s2 |
| `Z3a` | 1.0-1.3 m/s2 |
| `Z3b` | > 1.3 m/s2 |

### SoilClass

SIA 261 ground class

| Code | Value |
|---|---|
| `A` | Rock |
| `B` | Gravel/dense sand |
| `C` | Loose sand/stiff clay |
| `D` | Soft soil |
| `E` | Alluvial surface layer |
| `F` | Special investigation needed |

## Usage

```javascript
// Loaded dynamically by the platform when a user opens this model
await engine.init();
const result = await engine.calculate({ latitude: ..., longitude: ..., return_period: ... });

// Batch: process all rows from a CSV file
const results = await engine.runBatch(csvText);
```
