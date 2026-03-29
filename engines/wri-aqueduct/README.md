# WRI Aqueduct

> Global water risk atlas mapping 13 indicators including water stress, drought risk, and groundwater depletion with CMIP6 projections.

| | |
|---|---|
| **Status** | `live` |
| **Category** | physical-risk |
| **Region** | global (Global) |
| **License** | Creative Commons Attribution 4.0 International |
| **Source** | [WRI](https://www.wri.org/aqueduct) |
| **Author** | World Resources Institute + Utrecht University |

## Files

```
engines/wri-aqueduct/
  engine.js    # API wrapper / calculation engine
  test.csv     # Example input data
  README.md    # This file
```

## Inputs (4)

| Field | Type | Unit | Req | Description |
|---|---|---|---|---|
| `latitude` | `number` |  | ✓ | WGS84 latitude |
| `longitude` | `number` |  | ✓ | WGS84 longitude |
| `scenario` | `string` |  |  | optimistic / pessimistic / business_as_usual (default business_as_usual) (default: `business_as_usual`) |
| `year` | `integer` |  |  | 2030 / 2050 / 2080 (default 2030) (default: `2030`) |

## Outputs (6)

| Field | Type | Unit | Description |
|---|---|---|---|
| `overall_water_risk` | `string` |  | Low / Low-Medium / Medium-High / High / Extremely High |
| `baseline_water_stress` | `number` |  | Ratio of withdrawals to supply (0-5 scale) |
| `flood_occurrence` | `number` |  | Expected floods per year |
| `drought_severity` | `number` |  | Average drought severity index |
| `groundwater_decline` | `number` |  | Average decline in cm/year |
| `regulatory_risk` | `number` |  | Combined regulatory/reputational score (0-5) |

## Reference Data

### WaterRiskLevel

Aqueduct 4.0 risk categories

| Code | Value |
|---|---|
| `0` | Low (0-1) |
| `1` | Low-Medium (1-2) |
| `2` | Medium-High (2-3) |
| `3` | High (3-4) |
| `4` | Extremely High (4-5) |
| `-1` | No Data |

### Scenario

Climate projection scenarios

| Code | Value |
|---|---|
| `opt` | Optimistic (SSP1 RCP2.6) |
| `bau` | Business as Usual (SSP3 RCP7.0) |
| `pes` | Pessimistic (SSP5 RCP8.5) |

### ProjectionYear

Future projection time periods

| Code | Value |
|---|---|
| `30` | 2030 (window 2015-2045) |
| `50` | 2050 (window 2035-2065) |
| `80` | 2080 (window 2065-2095) |

### WeightingScheme

Industry-specific risk weighting

| Code | Value |
|---|---|
| `def` | Default |
| `agr` | Agriculture |
| `che` | Chemicals |
| `con` | Construction |
| `elp` | Electric Power |
| `fnb` | Food & Beverage |
| `min` | Mining |
| `ong` | Oil & Gas |
| `smc` | Semiconductor |
| `tex` | Textile |

## Usage

```javascript
await engine.init();
const result = await engine.calculate({ latitude: ..., longitude: ..., scenario: ... });
const results = await engine.runBatch(csvText);
```
