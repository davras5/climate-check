# Sonnendach.ch

> Solar energy potential for every roof in Switzerland. Calculates electricity/heat yield, system costs, and payback per building.

| | |
|---|---|
| **Status** | `live` |
| **Category** | energy-performance |
| **Region** | switzerland (CH) |
| **License** | Free â€” Swiss federal open data (OGD) |
| **Source** | [BFE / swisstopo](https://www.uvek-gis.admin.ch/BFE/sonnendach/) |
| **Author** | BFE (Federal Office of Energy) / MeteoSwiss / swisstopo |

## Files

```
engines/sonnendach/
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

## Outputs (7)

| Field | Type | Unit | Description |
|---|---|---|---|
| `roof_area_m2` | `number` | m2 | Gross roof area of the building |
| `suitable_area_m2` | `number` | m2 | Roof area suitable for solar panels |
| `pv_potential_kwh` | `number` | kWh/yr | Annual photovoltaic electricity generation potential |
| `thermal_potential_kwh` | `number` | kWh/yr | Annual solar thermal energy generation potential |
| `roof_pitch_deg` | `number` | deg | Average roof pitch in degrees |
| `roof_orientation` | `string` |  | [CardinalDirection](#cardinaldirection) — Cardinal direction (N/NE/E/SE/S/SW/W/NW) |
| `suitability_class` | `string` |  | [SolarSuitability](#solarsuitability) — Very good / Good / Moderate / Low / Not suitable |

## Reference Data

### SolarSuitability

BFE solar suitability classification for roofs

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
// Loaded dynamically by the platform when a user opens this model
await engine.init();
const result = await engine.calculate({ latitude: ..., longitude: ..., tolerance: ... });

// Batch: process all rows from a CSV file
const results = await engine.runBatch(csvText);
```
