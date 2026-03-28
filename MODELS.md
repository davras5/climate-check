# Climate Check — Model Directory Meta-Model

> 31 models for climate risk assessment in real estate.
> Last updated: 2026-03-28.

---

## Taxonomy

The directory classifies models along **five orthogonal dimensions**:

### 1. Risk Domain (what type of risk)

The real estate industry recognizes two fundamental climate risk types per TCFD/ISSB:

| Domain | Description | Models |
|--------|-------------|--------|
| **Transition risk** | Financial exposure from decarbonization policies, carbon pricing, stranding, obsolescence | CRREM (EU/NA/APAC), SBTi, NGFS, Climate Bonds |
| **Physical risk** | Financial exposure from climate hazards — acute (storms, floods, fire) and chronic (heat, drought, SLR) | CLIMADA, OpenQuake, SFINCS, OS-physrisk, HAZUS/FAST, JRC Flood Maps, WRI Aqueduct, Oasis LMF, IFC BRI, EIOPA CLIMADA-App |

Some models span both (NGFS scenarios cover transition + physical).

### 2. Assessment Type (what you measure)

| Type | Description | Models |
|------|-------------|--------|
| **Carbon accounting** | Measuring and reporting GHG emissions (operational or financed) | PCAF, BAFU CO2, eLCA, DGNB, BREEAM |
| **Energy performance** | Benchmarking operational energy use against baselines or peers | ENERGY STAR, NABERS, ASHRAE BEQ, Zero Tool, BETTER, TABULA, SRI |
| **Embodied carbon** | Lifecycle carbon in materials, construction, demolition | EC3, eLCA, EU Level(s), IFC EDGE |
| **Hazard modeling** | Probabilistic damage/loss estimation from natural hazards | CLIMADA, OpenQuake, SFINCS, HAZUS/FAST, Oasis LMF |
| **Stranding analysis** | When a building exceeds its decarbonization pathway | CRREM (EU/NA/APAC) |
| **Target setting** | Aligning portfolios with science-based pathways | SBTi, Climate Bonds |
| **Multi-criteria** | Holistic sustainability rating across multiple indicators | DGNB, BREEAM, EU Level(s) |

### 3. Building Lifecycle Phase

Based on simplified EN 15978 phases:

| Phase | What happens | Example models |
|-------|-------------|----------------|
| **Planning** | Design decisions, target-setting, feasibility | eLCA, EU Level(s), DGNB, IFC EDGE |
| **Production** | Raw materials, manufacturing | EC3, eLCA, SBTi, IFC EDGE |
| **Construction** | Transport to site, installation | eLCA, EU Level(s), DGNB, BREEAM, Climate Bonds |
| **Operation** | Energy use, maintenance, water, occupancy | CRREM, PCAF, ENERGY STAR, NABERS, BETTER, TABULA, and 10+ more |
| **End of life** | Demolition, waste processing, disposal | eLCA, EU Level(s), DGNB |
| **Circularity** | Reuse, recovery, recycling potential | DGNB |

Most models (19 of 31) focus on **Operation**. Only 3 cover **End of life** or **Circularity**.

### 4. Scale of Assessment

| Scale | Description | Models |
|-------|-------------|--------|
| **Building** | Single-asset assessment | EC3, IFC BRI, NABERS, ASHRAE BEQ, Zero Tool, IFC EDGE, DGNB, BREEAM, SRI, eLCA |
| **Portfolio** | Multi-asset portfolio analysis | PCAF, SBTi, OS-physrisk, NGFS, CLIMADA, EIOPA CLIMADA-App, Oasis LMF |
| **Both** | Works at building and portfolio level | CRREM (EU/NA/APAC), ENERGY STAR, BAFU CO2, BETTER, HAZUS/FAST |

### 5. Approach

| Approach | Description | Count |
|----------|-------------|-------|
| **Quantitative** | Produces numerical outputs (scores, projections, loss estimates) | 24 |
| **Mixed** | Combines quantitative metrics with qualitative assessment | 6 (SBTi, EU Level(s), IFC EDGE, SRI, DGNB, BREEAM) |
| **Qualitative** | Primarily descriptive/grade-based assessment | 1 (IFC BRI) |

---

## Model Attributes

Each model in `data/models.json` has the following schema:

### Identity

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | yes | Unique kebab-case identifier |
| `name` | string | yes | Display name |
| `version` | string | yes | Current version |
| `status` | enum | yes | `live` or `coming-soon` |
| `image` | string | yes | Path to card SVG |

### Description

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `description` | string | yes | 1-2 sentence summary |
| `longDescription` | string | no | Detailed paragraph for About tab |

### Classification

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `categories` | string[] | yes | From value list below |
| `tags` | string[] | yes | Free-form keywords |
| `region` | string[] | yes | From value list below |
| `sector` | string[] | yes | `commercial`, `residential`, or both |

### Provenance

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `author` | string | yes | Organization(s) |
| `license` | object | yes | `{type, name, url}` — type from value list below |
| `lastUpdated` | string | yes | ISO date (YYYY-MM-DD) |
| `citation` | string | no | How to cite in reports |
| `source` | object | yes | `{name, url, methodology?}` |

### Technical

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `scenario` | string | no | Climate scenario (e.g., "1.5C IEA NZE") |
| `scope` | string | no | What emissions/impacts are covered |
| `adoptedBy` | string[] | no | Frameworks/regulations that reference this model |
| `limitations` | string[] | no | Key caveats |

### Assessment Profile

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `lifecycleStages` | string[] | yes | From value list below |
| `complexity` | integer | yes | 1 (simple) to 10 (expert-only) |
| `maturity` | integer | yes | 1 (experimental) to 10 (industry standard) |
| `approach` | enum | yes | `quantitative`, `qualitative`, or `mixed` |

### Coverage

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `coverage.jurisdictionCodes` | string[] | no | ISO country codes |
| `coverage.jurisdictionCount` | integer | yes | Number of jurisdictions (0 if global/uncounted) |
| `coverage.propertyTypeList` | string[] | no | Supported building types |
| `coverage.propertyTypeCount` | integer | yes | Number of property types (0 if uncounted) |
| `coverage.timeRange` | string | yes | e.g., "2020-2050", "Annual", "Lifecycle" |

### Schema (for live models)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `inputs` | object[] | yes | Input field definitions (empty if coming-soon) |
| `outputs` | object[] | yes | Output field definitions (empty if coming-soon) |
| `database` | string | no | Path to data file (live models only) |
| `engine` | string | no | Path to calculation engine (live models only) |
| `testData` | string | no | Path to demo CSV (live models only) |

---

## Value Lists

### `categories` (enum, multi-select)

| Value | Description |
|-------|-------------|
| `transition-risk` | Carbon stranding, pathway misalignment, policy exposure |
| `physical-risk` | Climate hazard damage, loss estimation, resilience |
| `carbon-accounting` | GHG measurement, reporting, attribution |
| `energy-benchmarking` | Operational energy performance rating/scoring |
| `embodied-carbon` | Materials, construction, lifecycle carbon |
| `target-setting` | Science-based target alignment and validation |

### `region` (enum, multi-select)

| Value | Scope |
|-------|-------|
| `Global` | Worldwide applicability |
| `EU` | European Union member states |
| `NA` | North America (US + Canada) |
| `US` | United States only |
| `CA` | Canada only |
| `AU` | Australia only |
| `CH` | Switzerland only |
| `APAC` | Asia-Pacific |

### `license.type` (enum)

| Value | Description | Count |
|-------|-------------|-------|
| `open-source` | Source code available under OSI/FSF license | 9 |
| `free` | Free to use, no source code | 7 |
| `free-open-methodology` | Methodology docs publicly available | 5 |
| `free-non-commercial` | Free for non-commercial use, commercial license required | 4 |
| `free-open-access` | Freely downloadable, standard copyright | 3 |
| `free-open-api` | Free tool with open API | 3 |

### `lifecycleStages` (enum, multi-select)

| Value | EN 15978 equivalent |
|-------|---------------------|
| `Planning` | Pre-construction (A0) |
| `Production` | A1-A3 (materials, manufacturing) |
| `Construction` | A4-A5 (transport, installation) |
| `Operation` | B1-B7 (use, energy, water, maintenance) |
| `End of life` | C1-C4 (demolition, disposal) |
| `Circularity` | D (reuse, recovery, recycling) |

### `approach` (enum)

| Value | Description |
|-------|-------------|
| `quantitative` | Produces numerical outputs |
| `qualitative` | Primarily descriptive/grade-based |
| `mixed` | Combines both |

### `status` (enum)

| Value | Description |
|-------|-------------|
| `live` | Calculator engine implemented and functional |
| `coming-soon` | Cataloged with metadata, engine not yet built |

---

## Key Models — Expert Overview

### Transition Risk

**CRREM** (EU / NA / APAC) is the industry standard for building-level stranding analysis. It translates the IEA NZE 1.5C carbon budget into property-type and jurisdiction-specific decarbonization pathways from 2020-2050. For each building, it projects when operational carbon intensity will exceed the science-based pathway ("stranding year") and calculates the net present value of excess emission costs. Adopted by GRESB, SBTi, and PCAF. The EU edition covers 30 European jurisdictions and 11 property types. V2.07 (July 2025) is the final Excel tool release — the CRREM Foundation is transitioning to disaggregated open-access pathway data.

**NGFS Climate Scenarios** provide the macro-level scenario framework used by central banks (ECB, BoE, Fed) for climate stress testing. Version 5.0 defines 7 scenarios spanning orderly transition (Net Zero 2050) through hot-house world (Current Policies). Essential context for interpreting building-level transition risk within macro-economic pathways.

### Physical Risk

**CLIMADA** (ETH Zurich) is the most comprehensive open-source multi-hazard risk platform, covering tropical cyclones, floods, droughts, heat, windstorms, and wildfire. Used by EIOPA for EU insurance supervision. Probabilistic framework with ~4km global resolution.

**OpenQuake** (GEM Foundation) is the gold standard for seismic risk assessment, with a global exposure model covering 200+ countries and 3,500+ building vulnerability typologies. Used by the World Bank and national geological surveys.

**SFINCS** (Deltares) is a fast compound flooding model that simulates coastal surge, riverine, and rainfall flooding 100-1000x faster than full hydrodynamic models, making it uniquely suited for climate scenario analysis.

**JRC Flood Hazard Maps** provide pre-computed open-data flood inundation maps for 10-500 year return periods at 25m resolution for Europe — the most accessible flood risk data for EU real estate portfolios.

### Carbon & Energy

**PCAF** is the global standard for measuring financed emissions (Scope 3, Category 15). The Third Edition (December 2025) covers 10 asset classes. For real estate, it defines attribution-based accounting for commercial real estate and mortgages with a 1-5 data quality scoring system.

**ENERGY STAR Portfolio Manager** is the US/Canada standard for operational energy benchmarking, producing a 1-100 score against the national median. Version 26.0 covers 20+ property types with a public API.

**eLCA + OKOBAUDAT** is the only free, open-source whole-building lifecycle assessment tool in the EU, mandatory for German federal buildings (BNB system). Uses the OKOBAUDAT standardized EPD database.

### Multi-Criteria / Certification

**BREEAM** (BRE, UK) is the world's most widely used sustainability assessment, operating in 100+ countries. Version 7 (July 2025) maps directly to EU Taxonomy technical screening criteria.

**DGNB** (Germany) is the EU's most rigorous full-lifecycle certification, evaluating 29 criteria across 6 quality areas from Planning through Circularity.

### Insurance

**Oasis LMF** is the open-source catastrophe modelling platform used by the insurance industry, with 100+ models from 21+ providers. BSD-licensed with web UI and REST API.

**EIOPA CLIMADA-App** wraps CLIMADA in a GUI for European insurers and supervisors to run NatCat loss scenarios without coding.

---

## Coverage Gaps

Based on expert assessment, the directory is missing or underrepresents:

1. **Retrofit cost estimation** — BETTER covers energy efficiency measures, but there is no dedicated tool for deep renovation cost modeling (labor, materials, disruption costs by building type and jurisdiction).

2. **Insurance pricing models** — We have cat models (CLIMADA, Oasis, HAZUS) but no tools for translating hazard into insurance premium impact or protection gap quantification at building level.

3. **Regulatory compliance checkers** — No EU Taxonomy screening tool, no EPBD/MEES compliance calculator, no EPC rating estimator.

4. **Climate-adjusted valuation** — No model connects climate risk directly to property valuation (cap rate adjustment, green premium/brown discount).

5. **Scope 3 supply chain** — No tool covers tenant emissions or supply chain carbon beyond PCAF's financial attribution.

6. **Indoor environmental quality** — EU Level(s) includes IEQ indicators but no dedicated tool models health/comfort impacts of climate change on building occupants.

7. **Grid interaction** — SRI covers smart readiness but no model quantifies demand-side flexibility value or renewable self-consumption optimization.

---

## Statistics

- **31 models** total (1 live, 30 coming-soon)
- **16 regions** represented (Global most common at 16 models)
- **6 categories** with energy-benchmarking (12) and physical-risk (11) most populated
- **6 license types** — 9 open-source, 7 free, 5 free-open-methodology
- **Complexity range**: 2-8 (median 5)
- **Maturity range**: 4-9 (median 7.5)
- **24 quantitative**, 6 mixed, 1 qualitative
- **19 of 31** cover the Operation phase; only 2 cover Circularity
