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

## Inputs (7)

| Field | Type | Unit | Req | Description |
|---|---|---|---|---|
| `latitude` | `number` |  | ✓ | WGS84 latitude |
| `longitude` | `number` |  | ✓ | WGS84 longitude |
| `annual_kwh` | `number` | kWh/yr |  | Annual electricity consumption (one of annual_kwh or doe_reference_name required) |
| `doe_reference_name` | `enum` |  |  | [DOEReferenceBuilding](#doereferencebuilding) — DOE reference building for load profile |
| `roof_area_sqft` | `number` | sqft |  | Available roof area for PV |
| `blended_annual_rate` | `number` | $/kWh |  | Blended annual energy rate (when URDB not available) |
| `urdb_rate_id` | `string` |  |  | URDB utility rate label |

## Outputs (9)

| Field | Type | Unit | Description |
|---|---|---|---|
| `pv_size_kw` | `number` | kW | Recommended PV system capacity |
| `battery_size_kw` | `number` | kW | Recommended battery power capacity |
| `battery_size_kwh` | `number` | kWh | Recommended battery energy capacity |
| `npv_usd` | `number` | USD | Financial NPV of optimal system |
| `annual_savings_usd` | `number` | USD/yr | Year 1 bill savings |
| `simple_payback_years` | `number` | years | Simple payback period |
| `renewable_pct` | `number` | % | Fraction of load met by renewables |
| `lifecycle_co2_tonnes` | `number` | tonnes | Total lifecycle CO2 emissions |
| `annual_co2_tonnes` | `number` | tonnes | Year-1 CO2 emissions |

## Reference Data

### DOEReferenceBuilding

DOE commercial reference building types for load profiles

- `FullServiceRest`
- `FastFoodRest`
- `Hospital`
- `LargeHotel`
- `LargeOffice`
- `MediumOffice`
- `MidriseApartment`
- `Outpatient`
- `PrimarySchool`
- `RetailStore`
- `SecondarySchool`
- `SmallHotel`
- `SmallOffice`
- `StripMall`
- `Supermarket`
- `Warehouse`
- `FlatLoad`

## Usage

```javascript
await engine.init();
const result = await engine.calculate({ latitude: ..., longitude: ..., annual_kwh: ... });
const results = await engine.runBatch(csvText);
```
