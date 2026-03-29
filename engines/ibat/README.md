# IBAT Biodiversity Screening

> Freemium tool providing proximity screening against IUCN Red List species, protected areas (WDPA), and Key Biodiversity Areas for project sites and portfolios.

| | |
|---|---|
| **Status** | `live` |
| **Category** | nature-biodiversity |
| **Region** | global (Global) |
| **License** | Free biodiversity maps; subscription for reports and data downloads |
| **Source** | [IBAT Alliance](https://www.ibat-alliance.org) |
| **Author** | BirdLife International / Conservation International / IUCN / UNEP-WCMC |

## Files

```
engines/ibat/
  engine.js    # API wrapper / calculation engine
  test.csv     # Example input data
  README.md    # This file
```

## Inputs (3)

| Field | Type | Unit | Req | Description |
|---|---|---|---|---|
| `latitude` | `number` |  | ✓ | WGS84 latitude |
| `longitude` | `number` |  | ✓ | WGS84 longitude |
| `buffer_km` | `number` | km |  | Search radius in km (default 5) (default: `5`) |

## Outputs (5)

| Field | Type | Unit | Description |
|---|---|---|---|
| `protected_areas_count` | `number` |  | Number of protected areas (WDPA) within buffer |
| `kba_count` | `number` |  | Number of KBAs within buffer |
| `iucn_red_list_species` | `number` |  | Number of IUCN Red List species within buffer |
| `critical_habitat` | `boolean` |  | Whether location is within or near critical habitat |
| `sensitivity_score` | `string` |  | High / Medium / Low |

## Usage

```javascript
await engine.init();
const result = await engine.calculate({ latitude: ..., longitude: ..., buffer_km: ... });
const results = await engine.runBatch(csvText);
```
