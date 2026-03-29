# BAFU CO2 Calculator for Buildings

> Swiss federal building-level CO2 emissions calculator using the GWR register and SIA 380/1 standard. Simulates heating system replacements and energy retrofits.

| | |
|---|---|
| **Status** | `live` |
| **Category** | energy-performance, carbon-accounting |
| **Region** | switzerland (CH) |
| **License** | Source available (R script, available on request from FOEN) |
| **Source** | [BAFU / FOEN](https://www.bafu.admin.ch/en/calculator-co2-buildings) |
| **Author** | Swiss Federal Office for the Environment (BAFU/FOEN), developed by WÃ¼est Partner AG |

## Files

```
engines/bafu-co2/
  engine.js    # API wrapper / calculation engine
  test.csv     # Example input data
  README.md    # This file
```

## Inputs (3)

| Field | Type | Unit | Req | Description |
|---|---|---|---|---|
| `latitude` | `number` |  | ✓ | WGS84 latitude of the building |
| `longitude` | `number` |  | ✓ | WGS84 longitude of the building |
| `egid` | `integer` |  |  | Swiss Federal Building Register ID (alternative to lat/lon) |

## Outputs (6)

| Field | Type | Unit | Description |
|---|---|---|---|
| `co2_kg_m2_yr` | `number` | kg CO2/m2/yr | Estimated annual CO2 emissions per square metre |
| `co2_class` | `string` |  | [CO2Class](#co2class) — Emission class (A-G) |
| `heating_system` | `string` |  | [HeatingSystem](#heatingsystem) — Primary heating type (oil, gas, heat pump, district heating, etc.) |
| `energy_source` | `string` |  | Primary energy source |
| `building_period` | `string` |  | Building construction period range |
| `energy_reference_area_m2` | `number` | m2 | Energy reference area from GWR |

## Reference Data

### CO2Class

BAFU building CO2 emission class

| Code | Value |
|---|---|
| `A` | < 5 kg CO2/m2/yr |
| `B` | 5-10 |
| `C` | 10-15 |
| `D` | 15-20 |
| `E` | 20-25 |
| `F` | 25-35 |
| `G` | > 35 |

### HeatingSystem

Primary heating system type from GWR

- `Heat pump (air)`
- `Heat pump (ground)`
- `Gas boiler`
- `Oil boiler`
- `District heating`
- `Wood pellets`
- `Wood chips`
- `Electric direct`
- `Solar thermal`
- `Other`

## Usage

```javascript
// Loaded dynamically by the platform when a user opens this model
await engine.init();
const result = await engine.calculate({ latitude: ..., longitude: ..., egid: ... });

// Batch: process all rows from a CSV file
const results = await engine.runBatch(csvText);
```
