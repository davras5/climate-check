# CRREM EU Risk Assessment

> Paris-aligned stranding assessment for commercial and residential buildings across 30 European jurisdictions.

| | |
|---|---|
| **Status** | `live` |
| **Category** | transition-risk |
| **Region** | europe (EU) |
| **License** | Proprietary â€” free for non-commercial use; commercial license required |
| **Source** | [CRREM Foundation / IIO](https://www.crrem.eu) |
| **Author** | CRREM Foundation / IIÃ– Institut fÃ¼r ImmobilienÃ¶konomie |

## Files

```
engines/crrem-eu/
  engine.js    # API wrapper / calculation engine
  test.csv     # Example input data
  README.md    # This file
  data.db      # SQLite reference data
  docs/        # Research documents and methodology
```

## Inputs (18)

| Field | Type | Unit | Req | Description |
|---|---|---|---|---|
| `asset_name` | `string` |  | ✓ | Building identifier |
| `reporting_year` | `integer` |  | ✓ | 2020-2024 |
| `country_code` | `enum` |  | ✓ | [CountryCode](#countrycode) — ISO 2-letter (30 European jurisdictions) |
| `property_type_code` | `enum` |  | ✓ | [PropertyType](#propertytype) — Building use type code |
| `floor_area` | `number` | m2 | ✓ | Gross internal area (IPMS 2) |
| `vacant_area` | `number` | m2 |  | For occupancy normalization |
| `gav` | `number` | EUR |  | Market value — needed for CVaR |
| `electricity_kwh` | `number` | kWh |  | Annual consumption |
| `natural_gas_kwh` | `number` | kWh |  | Annual consumption (EF: 0.183 kgCO2e/kWh) |
| `district_heating_kwh` | `number` | kWh |  | Steam — projected EF |
| `fuel_oil_kwh` | `number` | kWh |  | Annual consumption (EF: 0.247 kgCO2e/kWh) |
| `district_cooling_kwh` | `number` | kWh |  | Projected EF |
| `other1_kwh` | `number` | kWh |  | Other fuel source 1 consumption |
| `other1_fuel_type` | `enum` |  |  | [FuelType](#fueltype) — Fuel type for Other 1 |
| `other2_kwh` | `number` | kWh |  | Other fuel source 2 consumption |
| `other2_fuel_type` | `enum` |  |  | [FuelType](#fueltype) — Fuel type for Other 2 |
| `renewable_onsite_kwh` | `number` | kWh |  | Generated and consumed on-site (EF=0) |
| `renewable_export_kwh` | `number` | kWh |  | Exported to grid (carbon credit) |

## Outputs (15)

| Field | Type | Unit | Description |
|---|---|---|---|
| `strandingYear` | `integer` |  | First year asset CI exceeds CRREM pathway (null if aligned) |
| `baselineCarbonIntensity` | `number` | kgCO2e/m2/yr | From reported energy and emission factors |
| `baselineEUI` | `number` | kWh/m2/yr | Energy use intensity at floor area |
| `totalEnergy` | `number` | kWh | Total annual energy consumption |
| `totalEmissions` | `number` | kgCO2e | Total annual GHG emissions |
| `projectedCI` | `array` | kgCO2e/m2/yr | Annual 2020-2050 projection (31 values) |
| `projectedEUI` | `array` | kWh/m2/yr | Annual 2020-2050 EUI projection (31 values) |
| `carbonPathway` | `array` | kgCO2e/m2/yr | Target decarbonization pathway (31 values) |
| `euiPathway` | `array` | kWh/m2/yr | Target energy pathway (31 values) |
| `cumulativeExcess` | `number` | tCO2e | Total above pathway through 2050 |
| `excessPerM2` | `number` | kgCO2e/m2 | Cumulative excess per floor area |
| `npvExcessCosts` | `number` | EUR | Net present value at 3% discount rate |
| `cvar` | `number` | % of GAV | NPV costs as share of gross asset value |
| `annualExcessCosts` | `array` | EUR/yr | Year-by-year excess emission costs (31 values) |
| `renewableShare` | `number` | % | On-site renewables as % of total energy |

## Reference Data

### PropertyType

CRREM building use type codes

| Code | Value |
|---|---|
| `OFF` | Office |
| `RHS` | Retail High Street |
| `RSM` | Shopping Centre |
| `RWB` | Retail Warehouse |
| `DWC` | Industrial Warehouse (Cooled) |
| `DWW` | Industrial Warehouse (Warm) |
| `HOT` | Hotel |
| `HEC` | Healthcare |
| `LEI` | Lodging / Leisure / Recreation |
| `MXU` | Mixed Use |
| `RMF` | Residential Multi-Family |

### CountryCode

ISO 3166-1 alpha-2 codes (30 European jurisdictions)

- `AT`
- `BE`
- `BG`
- `HR`
- `CY`
- `CZ`
- `DK`
- `EE`
- `FI`
- `FR`
- `DE`
- `GR`
- `HU`
- `IE`
- `IT`
- `LV`
- `LT`
- `LU`
- `MT`
- `NL`
- `NO`
- `PL`
- `PT`
- `RO`
- `SK`
- `SI`
- `ES`
- `SE`
- `CH`
- `GB`

### FuelType

Fuel types for 'other' energy sources

| Code | Value |
|---|---|
| `natural_gas` | Natural gas (0.183 kgCO2e/kWh) |
| `fuel_oil` | Fuel oil (0.247 kgCO2e/kWh) |
| `biogas` | Biogas |
| `wood_chips` | Wood chips |
| `wood_pellets` | Wood pellets |
| `coal` | Coal |
| `landfill_gas` | Landfill gas |
| `lpg` | LPG |

## Usage

```javascript
await engine.init();
const result = await engine.calculate({ asset_name: ..., reporting_year: ..., country_code: ... });
const results = await engine.runBatch(csvText);
```
