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

## Inputs (5)

| Field | Type | Unit | Req | Description |
|---|---|---|---|---|
| `latitude` | `number` |  | ✓ | WGS84 latitude |
| `longitude` | `number` |  | ✓ | WGS84 longitude |
| `return_period` | `number` | years |  | Seismic return period (default 475 per SIA 261) (default: `475`) |
| `spectral_period` | `number` | s |  | 0=PGA, or specific period (0.1, 0.2, 0.5, 1.0, 2.0) (default: `0`) |
| `soil_class` | `enum` |  |  | [SoilClass](#soilclass) — User-specified ground class (overrides GeoAdmin lookup) |

## Outputs (8)

| Field | Type | Unit | Description |
|---|---|---|---|
| `seismic_zone` | `string` |  | [SeismicZone](#seismiczone) — SIA 261 zone (Z1/Z2/Z3a/Z3b) |
| `zone_description` | `string` |  | Human-readable hazard level |
| `pga_rock_g` | `number` | g | Peak ground acceleration at reference rock |
| `soil_class` | `string` |  | [SoilClass](#soilclass) — Ground class A-F |
| `soil_description` | `string` |  | Human-readable soil class description |
| `soil_amplification` | `number` |  | Site amplification (1.0-1.4) |
| `pga_site_g` | `number` | g | Site-adjusted PGA (rock PGA x soil factor) |
| `spectral_acceleration_g` | `number` | g | SA at requested period (site-adjusted) |

## Reference Data

### SeismicZone

SIA 261 earthquake zone classification

| Code | Value |
|---|---|
| `Z1` | Low (agr < 0.6 m/s2) |
| `Z2` | Moderate (0.6-1.0 m/s2) |
| `Z3a` | Elevated (1.0-1.3 m/s2) |
| `Z3b` | High (> 1.3 m/s2) |

### SoilClass

SIA 261 ground class with amplification factors

| Code | Value |
|---|---|
| `A` | Hard rock (factor 1.0) |
| `B` | Soft rock / dense deposit (1.2) |
| `C` | Dense to medium-dense soil (1.15) |
| `D` | Loose soil (1.35) |
| `E` | Shallow soft layer on rock (1.4) |
| `F` | Special investigation needed |

## Usage

```javascript
await engine.init();
const result = await engine.calculate({ latitude: ..., longitude: ..., return_period: ... });
const results = await engine.runBatch(csvText);
```
