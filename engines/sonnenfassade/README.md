# Sonnenfassade.ch

> Free Swiss tool by SFOE and swisstopo estimating solar electricity and heat generation potential on building facades across Switzerland.

| | |
|---|---|
| **Status** | `live` |
| **Category** | energy-performance |
| **Region** | switzerland (CH) |
| **License** | Free public tool (Swiss Federal Office of Energy); data open on opendata.swiss |
| **Source** | [SFOE / swisstopo](https://www.sonnenfassade.ch) |
| **Author** | Swiss Federal Office of Energy (SFOE) / swisstopo |

## Files

```
engines/sonnenfassade/
  engine.js    # API wrapper / calculation engine
  test.csv     # Example input data
  README.md    # This file
```

## Inputs (3)

| Field | Type | Unit | Req | Description |
|---|---|---|---|---|
| `latitude` | `number` |  | ✓ | WGS84 latitude of the building |
| `longitude` | `number` |  | ✓ | WGS84 longitude of the building |
| `tolerance` | `number` | m |  | Identify tolerance in metres (default 20) (default: `20`) |

## Outputs (6)

| Field | Type | Unit | Description |
|---|---|---|---|
| `facade_area_m2` | `number` | m2 | Gross facade area of the building |
| `suitable_area_m2` | `number` | m2 | Facade area suitable for building-integrated PV |
| `pv_potential_kwh` | `number` | kWh/yr | Annual PV electricity generation potential from facades |
| `thermal_potential_kwh` | `number` | kWh/yr | Annual solar thermal energy generation potential from facades |
| `orientation` | `string` |  | [CardinalDirection](#cardinaldirection) — Cardinal direction (N/NE/E/SE/S/SW/W/NW) |
| `suitability_class` | `string` |  | [SolarSuitability](#solarsuitability) — Very good / Good / Moderate / Low / Not suitable |

## Reference Data

### SolarSuitability

BFE solar suitability classification for facades

- `Very good`
- `Good`
- `Moderate`
- `Low`
- `Not suitable`

### CardinalDirection

Compass orientation

- `N`
- `NE`
- `E`
- `SE`
- `S`
- `SW`
- `W`
- `NW`

## Usage

```javascript
await engine.init();
const result = await engine.calculate({ latitude: ..., longitude: ..., tolerance: ... });
const results = await engine.runBatch(csvText);
```
