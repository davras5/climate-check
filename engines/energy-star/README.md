# ENERGY STAR Portfolio Manager

> US EPA tool that benchmarks building energy performance against national averages. Produces a 1â€“100 score where 50 is the median for similar buildings.

| | |
|---|---|
| **Status** | `live` |
| **Category** | energy-performance |
| **Region** | north-america (CA, US) |
| **License** | Free â€” US government program with public API |
| **Source** | [US EPA](https://www.energystar.gov/buildings/benchmark) |
| **Author** | US Environmental Protection Agency (EPA) |

## Files

```
engines/energy-star/
  engine.js    # API wrapper / calculation engine
  test.csv     # Example input data
  README.md    # This file
```

## Inputs (3)

| Field | Type | Unit | Req | Description |
|---|---|---|---|---|
| `property_id` | `integer` |  | ✓ | ENERGY STAR Portfolio Manager property ID |
| `year` | `integer` |  |  | Metrics reporting year (default: latest) |
| `month` | `integer` |  |  | Metrics reporting month 1-12 (default: 12) (default: `12`) |

## Outputs (10)

| Field | Type | Unit | Description |
|---|---|---|---|
| `energy_star_score` | `number` |  | Percentile-based energy performance score (1-100) |
| `site_eui_kbtu_ft2` | `number` | kBtu/ft2 | Site energy use intensity |
| `source_eui_kbtu_ft2` | `number` | kBtu/ft2 | Source energy use intensity |
| `total_ghg_emissions_mtco2e` | `number` | MtCO2e | Total direct + indirect GHG emissions |
| `direct_ghg_mtco2e` | `number` | MtCO2e | Direct GHG emissions |
| `indirect_ghg_mtco2e` | `number` | MtCO2e | Indirect GHG emissions |
| `electricity_use_kbtu` | `number` | kBtu | Grid electricity consumption |
| `natural_gas_use_kbtu` | `number` | kBtu | Natural gas consumption |
| `property_type` | `string` |  | Building primary function |
| `gross_floor_area_ft2` | `number` | ft2 | Property gross floor area |

## Usage

```javascript
await engine.init();
const result = await engine.calculate({ property_id: ..., year: ..., month: ... });
const results = await engine.runBatch(csvText);
```
