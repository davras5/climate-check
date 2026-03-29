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

## Inputs (12)

| Field | Type | Unit | Req | Description |
|---|---|---|---|---|
| `latitude` | `number` |  | ✓ | WGS84 latitude |
| `longitude` | `number` |  | ✓ | WGS84 longitude |
| `system_capacity_kw` | `number` | kW | ✓ | Nameplate DC capacity (0.05-500000) |
| `module_type` | `enum` |  |  | [ModuleType](#moduletype) —  (default: `0`) |
| `array_type` | `enum` |  |  | [ArrayType](#arraytype) —  (default: `1`) |
| `tilt` | `number` | deg |  | Panel tilt angle (0-90) (default: `latitude`) |
| `azimuth` | `number` | deg |  | Panel azimuth (0-360, 180=south) (default: `180`) |
| `losses` | `number` | % |  | Total system losses (-5 to 99) (default: `14.08`) |
| `dc_ac_ratio` | `number` |  |  | DC to AC size ratio (default: `1.2`) |
| `gcr` | `number` |  |  | Ground coverage ratio (0.01-0.99) (default: `0.4`) |
| `inv_eff` | `number` | % |  | Inverter efficiency (90-99.5) (default: `96`) |
| `dataset` | `enum` |  |  | [Dataset](#dataset) — Solar resource dataset (default: `nsrdb`) |

## Outputs (7)

| Field | Type | Unit | Description |
|---|---|---|---|
| `ac_annual_kwh` | `number` | kWh/yr | Total annual AC energy production |
| `ac_monthly_kwh` | `array` | kWh/mo | 12-element array of monthly AC production |
| `dc_monthly_kwh` | `array` | kWh/mo | 12-element array of monthly DC production |
| `poa_monthly` | `array` | kWh/m2 | 12-element monthly plane-of-array irradiance |
| `solrad_annual` | `number` | kWh/m2/day | Annual average daily solar irradiance |
| `solrad_monthly` | `array` | kWh/m2/day | 12-element monthly solar irradiance |
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

Array mounting configuration

| Code | Value |
|---|---|
| `0` | Fixed - open rack |
| `1` | Fixed - roof mount |
| `2` | 1-axis tracking |
| `3` | 1-axis backtracking |
| `4` | 2-axis tracking |

### Dataset

Solar resource weather dataset

- `nsrdb`
- `tmy2`
- `tmy3`
- `intl`

## Usage

```javascript
await engine.init();
const result = await engine.calculate({ latitude: ..., longitude: ..., system_capacity_kw: ... });
const results = await engine.runBatch(csvText);
```
