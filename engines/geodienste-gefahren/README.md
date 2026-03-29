# Cantonal Hazard Maps (Gefahrenkarten)

> Legally binding cantonal hazard maps for flood, landslide, rockfall, and avalanche via WFS/OGC API. Determines building permits and insurance terms.

| | |
|---|---|
| **Status** | `live` |
| **Category** | physical-risk |
| **Region** | switzerland (CH) |
| **License** | Free â€” cantonal government data (terms vary by canton) |
| **Source** | [geodienste.ch](https://www.geodienste.ch/services/gefahrenkarten) |
| **Author** | Swiss Cantons via geodienste.ch (KGK/CGC) |

## Files

```
engines/geodienste-gefahren/
  engine.js    # API wrapper / calculation engine
  test.csv     # Example input data
  README.md    # This file
```

## Inputs (3)

| Field | Type | Unit | Req | Description |
|---|---|---|---|---|
| `latitude` | `number` |  | ✓ | WGS84 latitude |
| `longitude` | `number` |  | ✓ | WGS84 longitude |
| `buffer_m` | `number` | m |  | Search buffer in metres (default 10) (default: `10`) |

## Outputs (5)

| Field | Type | Unit | Description |
|---|---|---|---|
| `hazard_type` | `string` |  | Hochwasser / Rutschung / Lawine / Sturz / Murgang |
| `hazard_level` | `string` |  | [Gefahrenstufe](#gefahrenstufe) — Restgefaehrdung / Gering / Mittel / Erheblich |
| `return_period` | `string` |  | Scenario return period if available |
| `intensity` | `string` |  | [Intensitaet](#intensitaet) — Schwach / Mittel / Stark |
| `canton` | `string` |  | Cantonal source of the hazard map |

## Reference Data

### Gefahrenstufe

Official Swiss cantonal hazard level (Gefahrenstufe)

- `Restgefaehrdung`
- `Gering`
- `Mittel`
- `Erheblich`

### Intensitaet

Hazard intensity classification

- `Schwach`
- `Mittel`
- `Stark`

## Usage

```javascript
// Loaded dynamically by the platform when a user opens this model
await engine.init();
const result = await engine.calculate({ latitude: ..., longitude: ..., buffer_m: ... });

// Batch: process all rows from a CSV file
const results = await engine.runBatch(csvText);
```
