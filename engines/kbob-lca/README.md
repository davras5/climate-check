# KBOB Ã–kobilanzdaten

> Authoritative Swiss LCA database for construction materials, building technology, and energy. Used by Minergie, SNBS, and all Swiss green building labels.

| | |
|---|---|
| **Status** | `live` |
| **Category** | embodied-carbon, epd-database |
| **Region** | switzerland (CH) |
| **License** | Free â€” data download and API via lcadata.ch |
| **Source** | [KBOB](https://www.kbob.admin.ch/de/oekobilanzdaten-im-baubereich) |
| **Author** | KBOB / ecobau / IPB (based on Ecoinvent) |

## Files

```
engines/kbob-lca/
  engine.js    # API wrapper / calculation engine
  test.csv     # Example input data
  README.md    # This file
```

## Inputs (3)

| Field | Type | Unit | Req | Description |
|---|---|---|---|---|
| `material_id` | `string` |  |  | KBOB material UUID for direct lookup |
| `search` | `string` |  |  | Material search term (e.g. 'Beton', 'Stahl') |
| `language` | `enum` |  |  | [Language](#language) — Search language (default: `de`) |

## Outputs (9)

| Field | Type | Unit | Description |
|---|---|---|---|
| `id` | `string` |  | KBOB material identifier |
| `name_de` | `string` |  | German material name |
| `name_fr` | `string` |  | French material name |
| `gwp_kgco2eq` | `number` | kgCO2eq/unit | Global Warming Potential |
| `primary_energy_mj` | `number` | MJ/unit | Primary energy non-renewable total |
| `ubp` | `number` | UBP/unit | Ecological scarcity points |
| `unit` | `string` |  | Reference unit (kg, m2, m3) |
| `density_kg_m3` | `number` | kg/m3 | Bulk density |
| `category` | `string` |  | KBOB material category |

## Reference Data

### Language

KBOB data language

- `de`
- `fr`
- `it`

### KBOBCategory

KBOB material categories

| Code | Value |
|---|---|
| `01` | Beton (Concrete) |
| `02` | Mortel, Putze (Mortar) |
| `03` | Backsteine (Bricks) |
| `04` | Kalksandstein, Naturstein |
| `05` | Fenster, Sonnenschutz, Fassaden |
| `06` | Metallbaustoffe (Metals) |
| `07` | Holz (Wood) |
| `08` | Kunststoffe (Plastics) |
| `09` | Glas (Glass) |
| `10` | Warmedammstoffe (Insulation) |
| `11` | Bodenbelage (Floor coverings) |
| `12` | Anstriche (Paints) |

## Usage

```javascript
await engine.init();
const result = await engine.calculate({ material_id: ..., search: ..., language: ... });
const results = await engine.runBatch(csvText);
```
