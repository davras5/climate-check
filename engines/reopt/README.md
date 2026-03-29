# REopt

> Techno-economic optimization platform for solar, battery, wind, and CHP at buildings and campuses. Calculates optimal sizing, dispatch, and financial returns.

| | |
|---|---|
| **Status** | `live` |
| **Category** | energy-performance |
| **Region** | north-america (US) |
| **License** | Apache License 2.0 |
| **Source** | [NREL](https://reopt.nrel.gov/tool) |
| **Author** | National Renewable Energy Laboratory (NREL), US DOE |

## Files

```
engines/reopt/
  engine.js    # API wrapper / calculation engine
  test.csv     # Example input data
  README.md    # This file
```

## Inputs (5)

| Field | Type | Unit | Req | Description |
|---|---|---|---|---|
| `latitude` | `number` |  | ✓ | WGS84 latitude |
| `longitude` | `number` |  | ✓ | WGS84 longitude |
| `annual_kwh` | `number` | kWh/yr | ✓ | Annual electricity consumption in kWh |
| `roof_area_sqft` | `number` | sqft |  | Available roof area for PV in square feet |
| `urdb_rate_id` | `string` |  |  | URDB utility rate label (US only) |

## Outputs (6)

| Field | Type | Unit | Description |
|---|---|---|---|
| `pv_size_kw` | `number` | kW | Recommended PV system capacity |
| `battery_size_kw` | `number` | kW | Recommended battery power capacity |
| `battery_size_kwh` | `number` | kWh | Recommended battery energy capacity |
| `npv_usd` | `number` | USD | Financial NPV of optimal system |
| `annual_savings_usd` | `number` | USD/yr | Year 1 bill savings |
| `renewable_pct` | `number` | % | Percentage of load served by renewables |

## Usage

```javascript
// Loaded dynamically by the platform when a user opens this model
await engine.init();
const result = await engine.calculate({ latitude: ..., longitude: ..., annual_kwh: ... });

// Batch: process all rows from a CSV file
const results = await engine.runBatch(csvText);
```
