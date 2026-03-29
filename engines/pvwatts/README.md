# PVWatts Calculator

> NREL's free online calculator for estimating energy production and cost savings of grid-connected photovoltaic systems at any location worldwide.

| | |
|---|---|
| **Status** | `live` |
| **Category** | energy-performance |
| **Region** | global (Global) |
| **License** | Free public web tool (underlying PVWatts model in SAM/SSC is BSD-3-Clause) |
| **Source** | [NREL](https://pvwatts.nrel.gov) |
| **Author** | National Renewable Energy Laboratory (NREL) |

## Files

```
engines/pvwatts/
  engine.js    # API wrapper / calculation engine
  test.csv     # Example input data
  README.md    # This file
```

## Inputs (8)

| Field | Type | Unit | Req | Description |
|---|---|---|---|---|
| `latitude` | `number` |  | ✓ | WGS84 latitude |
| `longitude` | `number` |  | ✓ | WGS84 longitude |
| `system_capacity_kw` | `number` | kW | ✓ | Nameplate DC capacity of the PV system in kW |
| `module_type` | `enum` |  |  | [ModuleType](#moduletype) — 0=Standard, 1=Premium, 2=Thin film (default 0) (default: `0`) |
| `array_type` | `enum` |  |  | [ArrayType](#arraytype) — 0=Fixed open rack, 1=Fixed roof mount, 2=1-axis, 3=Backtracking, 4=2-axis (default 1) (default: `1`) |
| `tilt` | `number` | deg |  | Tilt angle in degrees (default = latitude) (default: `latitude`) |
| `azimuth` | `number` | deg |  | Azimuth angle (180=south, default 180) (default: `180`) |
| `losses` | `number` | % |  | Total system losses in percent (default 14.08) (default: `14.08`) |

## Outputs (5)

| Field | Type | Unit | Description |
|---|---|---|---|
| `ac_annual_kwh` | `number` | kWh/yr | Total annual AC energy production |
| `ac_monthly_kwh` | `array` | kWh/mo | 12-element array of monthly AC energy production |
| `solrad_annual` | `number` | kWh/m2/day | Annual plane-of-array solar irradiance |
| `solrad_monthly` | `array` |  | 12-element array of monthly solar irradiance |
| `capacity_factor` | `number` | % | AC capacity factor |

## Reference Data

### ModuleType

PV module technology

| Code | Value |
|---|---|
| `0` | Standard (crystalline silicon) |
| `1` | Premium (high efficiency) |
| `2` | Thin film |

### ArrayType

PV array mounting configuration

| Code | Value |
|---|---|
| `0` | Fixed - open rack |
| `1` | Fixed - roof mount |
| `2` | 1-axis tracking |
| `3` | 1-axis backtracking |
| `4` | 2-axis tracking |

## Usage

```javascript
// Loaded dynamically by the platform when a user opens this model
await engine.init();
const result = await engine.calculate({ latitude: ..., longitude: ..., system_capacity_kw: ... });

// Batch: process all rows from a CSV file
const results = await engine.runBatch(csvText);
```
