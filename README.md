# climate-check

[![Models](https://img.shields.io/badge/models-49-0969da)](https://github.com/davras5/climate-check)
[![Categories](https://img.shields.io/badge/categories-9-1a7f37)](https://github.com/davras5/climate-check)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![Status](https://img.shields.io/badge/status-beta-bf8700)](https://github.com/davras5/climate-check)

**Open-source climate risk model directory for real estate** — 49 models across transition risk, physical risk, carbon accounting, energy performance, embodied carbon, and more.

![Preview](assets/Preview1.jpg)

---

## What is climate-check?

A curated, searchable directory of climate risk assessment models for the built environment. Browse, filter, compare, and (for live models) run calculations directly in the browser.

**For real estate professionals** who need to understand which climate models exist, what they measure, how mature they are, and how they relate to each other.

### Key Features

- **49 models** with verified metadata (author, license, scenario, scope, limitations, citations)
- **9 categories**: transition risk, physical risk, carbon accounting, energy performance, embodied carbon, target setting, multi-criteria, grid optimization, indoor environment
- **4 views**: gallery cards, sortable list, interactive world map, complexity/maturity scatter plot
- **Smart filtering**: category, lifecycle phase, license type, region, status, tags — all URL-synced and shareable
- **Model detail pages**: About, Schema, Try It tabs with collapsible metadata sections
- **Interactive scatter plot**: complexity vs. maturity bubble chart with zoom, pan, and labels
- **World map**: click a country to filter by region, hover for model coverage details
- **API documentation**: mock Swagger-style REST API docs
- **Zero dependencies**: vanilla JS, custom CSS design system, no build step
- **Dark mode**: automatic via `prefers-color-scheme`
- **Accessible**: ARIA roles, keyboard navigation, focus-visible, skip-link

![Preview](assets/Preview2.jpg)

---

## Models by Category

| Category | Count | Examples |
|----------|-------|---------|
| Energy Performance | 14 | ENERGY STAR, NABERS, ASHRAE BEQ, Sonnendach.ch |
| Physical Risk | 11 | CLIMADA, OpenQuake, SFINCS, JRC Flood Maps |
| Carbon Accounting | 6 | PCAF, BAFU CO2, KBOB LCA, Mobitool |
| Embodied Carbon | 6 | EC3, eLCA, Madaster, EU Level(s) |
| Transition Risk | 5 | CRREM (EU/NA/APAC), SBTi, PACTA CH |
| Multi-Criteria | 4 | DGNB, BREEAM, SNBS, SSREI |
| Grid Optimization | 3 | REopt, FlexMeasures, DER-VET |
| Target Setting | 2 | SBTi, Climate Bonds |
| Indoor Environment | 1 | CBE Thermal Comfort Tool |

### Swiss Coverage (14 models)

Deep coverage for Switzerland including: BAFU CO2 Calculator, SNBS Hochbau, geo.admin.ch Hazard Layers, Cantonal Hazard Maps, ERM-CH23 Earthquake Risk, Sonnendach.ch, NCCS CH2025 Climate Scenarios, Schutz vor Naturgefahren, KBOB Okobilanzdaten, PACTA CH, SSREI, Madaster CH, Mobitool.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vanilla JS (no framework, no build step) |
| Styling | Custom CSS design system with tokens (`tokens.css` + `style.css`) |
| Charts | Chart.js 4.4.7 + chartjs-plugin-zoom |
| Database | sql.js (SQLite in browser, for CRREM engine) |
| Maps | Inline SVG world map (CC BY-SA 3.0, flekschas/simple-world-map) |
| Data | JSON (`data/models.json` — 49 models with full metadata) |
| Images | Local JPGs in `assets/img/` (sourced from Unsplash) |

### Project Structure

```
climate-check/
  index.html                  Single-page app shell
  css/
    tokens.css                Design tokens (colors, spacing, fonts, shadows)
    style.css                 All styles (~1050 lines)
  js/
    app.js                    Main application (~1200 lines)
    engines/
      crrem-eu.js             CRREM EU calculation engine
  data/
    models.json               49 models with full metadata
    crrem-eu.db               CRREM EU reference data (SQLite)
  assets/
    world-map.svg             Interactive world map
    img/                      49 model card images
  models/
    {id}/
      card.svg                Fallback card image per model
      model.json              Legacy per-model metadata (deprecated)
      test.csv                Demo data (CRREM EU only)
  docs/
    MODELS.md                 Meta-model documentation & taxonomy
    research/
      CRREM/README.md          CRREM V2.07 methodology research
```

---

## Design System

**5 font sizes**: 12px (sm), 14px (base), 16px (lg), 22px (xl), 28px (2xl)
**6 spacing values**: 4, 8, 16, 24, 40, 64px
**4 z-layers**: base (1), dropdown (10), sticky (100), overlay (200)
**5 radii**: 4, 6, 10px + full (pill)
**3 shadows**: sm, md, lg
**2 durations**: fast (0.1s), normal (0.2s)
**Full dark mode** via `prefers-color-scheme` media query

All values are CSS custom properties in `tokens.css`. Zero hardcoded colors or font sizes in `style.css`.

---

## Roadmap

### Live Calculation Engines (Next)

Priority models for implementing browser-based calculators:

| Priority | Model | Status | Complexity |
|----------|-------|--------|-----------|
| 1 | **CRREM EU** | Live | Operational — full stranding analysis |
| 2 | **CRREM NA** | Planned | Same engine, NA pathways + grid EFs |
| 3 | **CRREM APAC** | Planned | Same engine, APAC pathways |
| 4 | **CBE Thermal Comfort** | Planned | Port pythermalcomfort to JS |
| 5 | **BAFU CO2 Calculator** | Planned | R script → JS port |
| 6 | **pyBuildingEnergy** | Planned | ISO 52016 Python → JS |

### API Implementation

The mock API docs at `#/api` define the target REST API:

- `GET /api/v1/models` — model directory with filtering
- `GET /api/v1/data/pathways` — CRREM decarbonization pathways
- `POST /api/v1/calculate/{id}` — run calculation engines
- Full OpenAPI spec planned

### Swiss Geo-API Integration

Priority layers from geo.admin.ch for coordinate-based building assessment:

| Layer | API | Data |
|-------|-----|------|
| CO2 Emissions per Building | REST Identify | CO2 range, heating type |
| Flood Zones (4 return periods) | REST Identify | Aquaprotect 50/100/250/500yr |
| Earthquake Zones | REST Identify | SIA 261 seismic zones |
| Storm Gust Peaks (4 periods) | REST Identify | Wind speed + uncertainty |
| Hail Hazard (4 periods) | REST Identify | Grain size by return period |
| Building Register (GWR) | REST Identify | 100+ fields per building |
| Solar Potential | REST Identify | kWh/yr per roof surface |

### Additional Models Under Research

- EU Taxonomy screening calculator
- Climate-adjusted property valuation (green premium / brown discount)
- Scope 3 tenant emissions splitting (GRESB/PCAF/CRREM methodology)
- EPC rating estimator (UK SAP/RdSAP methodology)

---

## Contributing

1. Fork the repository
2. Add a model to `data/models.json` following the schema in [docs/MODELS.md](docs/MODELS.md)
3. Create a card SVG in `models/{id}/card.svg`
4. Submit a pull request

See [docs/MODELS.md](docs/MODELS.md) for the full meta-model schema, taxonomy, and value lists.

---

## License

MIT License. See [LICENSE](LICENSE).

Model metadata in `data/models.json` is compiled from public sources. Individual models have their own licenses (see `license` field per model).

World map SVG: [CC BY-SA 3.0](https://github.com/flekschas/simple-world-map) by Al MacDonald, edited by Fritz Lekschas.

Card images sourced from [Unsplash](https://unsplash.com) (free license).
