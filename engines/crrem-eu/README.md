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

## Inputs (14)

| Field | Type | Unit | Req | Description |
|---|---|---|---|---|
| `asset_name` | `string` |  | ✓ | Building identifier |
| `reporting_year` | `integer` |  | ✓ | 2020â€“2024 |
| `country_code` | `enum` |  | ✓ | [CountryCode](#countrycode) — ISO 2-letter (30 European jurisdictions) |
| `property_type_code` | `enum` |  | ✓ | [PropertyType](#propertytype) — OFF, RHS, RSM, RWB, DWC, DWW, HOT, HEC, LEI, RMF |
| `floor_area` | `number` | m2 | ✓ | Gross internal area (IPMS 2) |
| `vacant_area` | `number` | m2 |  | For occupancy normalization |
| `gav` | `number` | EUR |  | Market value â€” needed for CVaR |
| `electricity_kwh` | `number` | kWh |  | Annual consumption (country-projected EF) |
| `natural_gas_kwh` | `number` | kWh |  | Static EF: 0.183 kgCO2e/kWh |
| `district_heating_kwh` | `number` | kWh |  | Steam â€” projected EF tracks grid |
| `fuel_oil_kwh` | `number` | kWh |  | Static EF: 0.247 kgCO2e/kWh |
| `district_cooling_kwh` | `number` | kWh |  | Projected EF |
| `renewable_onsite_kwh` | `number` | kWh |  | Generated and consumed on-site (EF=0) |
| `renewable_export_kwh` | `number` | kWh |  | Exported to grid (carbon credit) |

## Outputs (9)

| Field | Type | Unit | Description |
|---|---|---|---|
| `strandingYear` | `integer` |  | First year asset CI exceeds CRREM pathway |
| `baselineCarbonIntensity` | `number` | kgCO2e/mÂ²/yr | From reported energy and emission factors |
| `baselineEUI` | `number` | kWh/mÂ²/yr | Energy use intensity at floor area |
| `projectedCI` | `array` | kgCO2e/mÂ²/yr | Annual 2020â€“2050 projection |
| `cumulativeExcess` | `number` | tCO2e | Total above pathway through 2050 |
| `npvExcessCosts` | `number` | EUR | Net present value at 3% discount rate |
| `cvar` | `number` | % of GAV | NPV costs as share of gross asset value |
| `annualExcessCosts` | `array` | EUR/yr | Year-by-year excess emission costs |
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
| `RMF` | Residential Multi-Family |

### CountryCode

ISO 3166-1 alpha-2 country codes covered by CRREM EU

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

## Usage

```javascript
// Loaded dynamically by the platform when a user opens this model
await engine.init();
const result = await engine.calculate({ asset_name: ..., reporting_year: ..., country_code: ... });

// Batch: process all rows from a CSV file
const results = await engine.runBatch(csvText);
```
