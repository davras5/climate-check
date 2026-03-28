# Climate Check — Model Directory Meta-Model

> 49 models for climate risk assessment in real estate.
> Last updated: 2026-03-28.

---

## Taxonomy

The directory classifies models along **five orthogonal dimensions**:

### 1. Risk Domain (what type of risk)

The real estate industry recognizes two fundamental climate risk types per TCFD/ISSB:

| Domain | Description | Models |
|--------|-------------|--------|
| **Transition risk** | Financial exposure from decarbonization policies, carbon pricing, stranding, obsolescence | CRREM (EU/NA/APAC), SBTi, NGFS, PACTA-CH |
| **Physical risk** | Financial exposure from climate hazards — acute (storms, floods, fire) and chronic (heat, drought, SLR) | CLIMADA, OpenQuake, SFINCS, OS-physrisk, HAZUS/FAST, JRC Flood Maps, WRI Aqueduct, Oasis LMF, IFC BRI, EIOPA CLIMADA-App, geo.admin.ch, Gefahrenkarten, ERM-CH23, NCCS CH2025, Naturgefahren-Check |

Some models span both (NGFS scenarios cover transition + physical).

### 2. Assessment Type (what you measure)

| Type | Description | Models |
|------|-------------|--------|
| **Carbon accounting** | Measuring and reporting GHG emissions (operational or financed) | PCAF, BAFU CO2, eLCA, DGNB, BREEAM, KBOB, PACTA-CH, Climate Bonds, Mobitool, geo.admin.ch |
| **Energy performance** | Benchmarking operational energy use against baselines or peers | ENERGY STAR, NABERS, ASHRAE BEQ, Zero Tool, BETTER, TABULA, SRI, pyBuildingEnergy, ResStock/ComStock, Sonnendach, SNBS, DGNB, BREEAM, IFC EDGE, BAFU CO2, geo.admin.ch |
| **Embodied carbon** | Lifecycle carbon in materials, construction, demolition | EC3, eLCA, EU Level(s), IFC EDGE, KBOB, DGNB, BREEAM, SNBS, Madaster |
| **Hazard modeling** | Probabilistic damage/loss estimation from natural hazards | CLIMADA, OpenQuake, SFINCS, HAZUS/FAST, Oasis LMF, ERM-CH23, Naturgefahren-Check |
| **Stranding analysis** | When a building exceeds its decarbonization pathway | CRREM (EU/NA/APAC) |
| **Target setting** | Aligning portfolios with science-based pathways | SBTi, Climate Bonds |
| **Multi-criteria** | Holistic sustainability rating across multiple indicators | DGNB, BREEAM, EU Level(s), SNBS, SSREI |
| **Grid optimization** | DER sizing, demand flexibility, storage, renewable optimization | REopt, FlexMeasures, DER-VET |
| **Indoor environment** | Thermal comfort, air quality, occupant health | CBE Thermal Comfort Tool, SNBS |

### 3. Building Lifecycle Phase

Based on simplified EN 15978 phases:

| Phase | What happens | Example models |
|-------|-------------|----------------|
| **Planning** | Design decisions, target-setting, feasibility | eLCA, EU Level(s), DGNB, IFC EDGE, SNBS, Sonnendach, Gefahrenkarten |
| **Production** | Raw materials, manufacturing | EC3, eLCA, SBTi, IFC EDGE, SNBS, KBOB, BAFU CO2, Madaster |
| **Construction** | Transport to site, installation | eLCA, EU Level(s), DGNB, BREEAM, Climate Bonds, KBOB, Madaster |
| **Operation** | Energy use, maintenance, water, occupancy | CRREM, PCAF, ENERGY STAR, NABERS, BETTER, TABULA, and 20+ more |
| **End of life** | Demolition, waste processing, disposal | eLCA, EU Level(s), DGNB, KBOB, SNBS, Madaster |
| **Circularity** | Reuse, recovery, recycling potential | DGNB, EU Level(s), SNBS, Madaster |

Most models (34 of 49) focus on **Operation**. 6 cover **End of life** and 4 cover **Circularity**.

### 4. Scale of Assessment

| Scale | Description | Models |
|-------|-------------|--------|
| **Building** | Single-asset assessment | EC3, IFC BRI, NABERS, ASHRAE BEQ, Zero Tool, IFC EDGE, DGNB, BREEAM, SRI, eLCA, OpenQuake, SFINCS, TABULA, Climate Bonds, pyBuildingEnergy, REopt, FlexMeasures, DER-VET, SNBS, Gefahrenkarten, ERM-CH23, Sonnendach, Naturgefahren-Check, KBOB, Madaster, Mobitool, CBE Thermal Comfort Tool |
| **Portfolio** | Multi-asset portfolio analysis | PCAF, SBTi, OS-physrisk, NGFS, CLIMADA, EIOPA CLIMADA-App, Oasis LMF, WRI Aqueduct, JRC Flood Maps, NCCS CH2025, PACTA-CH, SSREI |
| **Both** | Works at building and portfolio level | CRREM (EU/NA/APAC), ENERGY STAR, BAFU CO2, BETTER, HAZUS/FAST, ResStock/ComStock, geo.admin.ch |

### 5. Approach

| Approach | Description | Count |
|----------|-------------|-------|
| **Quantitative** | Produces numerical outputs (scores, projections, loss estimates) | 40 |
| **Mixed** | Combines quantitative metrics with qualitative assessment | 8 (SBTi, EU Level(s), IFC EDGE, SRI, DGNB, BREEAM, SNBS, SSREI) |
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

| Value | Description | Count |
|-------|-------------|-------|
| `energy-performance` | Operational energy performance rating, scoring, simulation | 17 |
| `physical-risk` | Climate hazard damage, loss estimation, resilience, insurance | 16 |
| `carbon-accounting` | GHG measurement, reporting, attribution | 10 |
| `embodied-carbon` | Materials, construction, lifecycle carbon | 9 |
| `transition-risk` | Carbon stranding, pathway misalignment, policy exposure | 6 |
| `multi-criteria` | Holistic sustainability certification across multiple dimensions | 5 |
| `grid-optimization` | DER sizing, demand flexibility, storage, renewable optimization | 3 |
| `target-setting` | Science-based target alignment and validation | 2 |
| `indoor-environment` | Thermal comfort, air quality, occupant health | 2 |

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
| `open-source` | Source code available under OSI/FSF license | 14 |
| `free` | Free to use, no source code | 13 |
| `free-open-methodology` | Methodology docs publicly available | 7 |
| `free-non-commercial` | Free for non-commercial use, commercial license required | 5 |
| `free-open-api` | Free tool with open API | 4 |
| `free-open-access` | Freely downloadable, standard copyright | 2 |
| `source-available` | Source code available on request, no formal OSS license | 1 |
| `proprietary` | Commercial product, documentation may be available for purchase | 1 |
| `membership` | Access requires organizational membership | 1 |
| `commercial` | Paid SaaS or subscription product | 1 |

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

**JRC Flood Hazard Maps** provide pre-computed open-data flood inundation maps for 10-500 year return periods at 100m resolution for Europe — the most accessible flood risk data for EU real estate portfolios.

### Carbon & Energy

**PCAF** is the global standard for measuring financed emissions (Scope 3, Category 15). The Third Edition (December 2025) covers 10 asset classes. For real estate, it defines attribution-based accounting for commercial real estate and mortgages with a 1-5 data quality scoring system.

**ENERGY STAR Portfolio Manager** is the US/Canada standard for operational energy benchmarking, producing a 1-100 score against the national median. Version 26.0 covers 20+ property types with a public API.

**eLCA + OKOBAUDAT** is the only free, open-source whole-building lifecycle assessment tool in the EU, mandatory for German federal buildings (BNB system). Uses the OKOBAUDAT standardized EPD database.

### Multi-Criteria / Certification

**BREEAM** (BRE, UK) is the world's most widely used sustainability assessment, operating in 100+ countries. Version 7 (2025) maps directly to EU Taxonomy technical screening criteria.

**DGNB** (Germany) is the EU's most rigorous full-lifecycle certification, evaluating 29 criteria across 6 quality areas from Planning through Circularity.

### Insurance

**Oasis LMF** is the open-source catastrophe modelling platform used by the insurance industry, with 100+ models from 21+ providers. BSD-licensed with web UI and REST API.

**EIOPA CLIMADA-App** wraps CLIMADA in a GUI for European insurers and supervisors to run NatCat loss scenarios without coding.

### Indoor Environment

**CBE Thermal Comfort Tool** (UC Berkeley) is the standard free online calculator for ASHRAE 55, ISO 7730, and EN 16798 thermal comfort assessment, with ~50,000 annual users. Open source (GPL-2.0). Calculates PMV/PPD, adaptive comfort, SET, and local discomfort.

### Grid Optimization

**REopt** (NREL) is the leading open-source platform for optimizing solar, battery, wind, and CHP sizing and dispatch at buildings. Web tool with API (Apache-2.0). Has supported 260+ MW of renewable energy decisions.

**FlexMeasures** (LF Energy) optimizes behind-the-meter flexibility for batteries, heat pumps, and EVs. API-first design, Apache 2.0 licensed.

**DER-VET** (EPRI) estimates value of distributed energy resources across grid service revenue streams.

### Retrofit Planning

**BETTER** (LBNL) identifies cost-effective energy efficiency measures with ranked retrofit recommendations. Open-source Python engine.

**ResStock/ComStock** (NREL) simulates energy use and retrofit costs across the entire US building stock. Open source, results at state/county level. ResStock identified $49B in potential annual savings.

### EPBD Compliance

**pyBuildingEnergy** (EURAC Research) implements ISO 52016-1:2018 in Python for EPBD-compliant energy performance calculation. Open source (MIT), wrappable as a web API.

### Switzerland

Switzerland has a uniquely comprehensive ecosystem of 13 building climate tools:

**BAFU CO2 Calculator** calculates building-level CO2 emissions using the Federal Register of Buildings (GWR) and SIA 380/1 standard. Source available on request from FOEN. Used in the PACTA Climate Test for Swiss financial institutions.

**PACTA Climate Test Switzerland** is the biennial government-commissioned climate alignment assessment for Swiss financial institutions. Measures building emission intensity against the Swiss net-zero 2050 pathway. Participation is free; 80% of the Swiss financial market participated in 2020.

**KBOB Okobilanzdaten** (v8.02) is the authoritative Swiss LCA database for construction materials, used by all major Swiss building labels (Minergie, SNBS, SIA 2032). Free data download via lcadata.ch.

**SNBS Hochbau** is the Swiss multi-criteria sustainability certification (35 criteria, 98 parameters) with Silver/Gold/Platinum ratings. Shares a common label platform with Minergie since November 2023.

**SSREI** is the leading sustainability assessment framework for Swiss institutional real estate portfolios (36 indicators). Recognized by GRESB as equivalent to operational green building certification.

**Sonnendach.ch** calculates solar energy potential for every roof in Switzerland with system sizing, costs, and payback. Open data via opendata.swiss.

**NCCS Climate Scenarios CH2025** provide official Swiss climate projections at 1km grid resolution under Global Warming Levels 1.5/2.0/2.5/3.0°C. Supersedes CH2018.

**geo.admin.ch Hazard Layers** expose 50+ coordinate-queryable layers via REST API including CO2 emissions per building, flood zones, earthquake zones, storm gusts, hail hazard, building register, solar potential, and noise exposure.

**Cantonal Hazard Maps (Gefahrenkarten)** are the legally binding natural hazard maps for Switzerland, aggregated via geodienste.ch. Determine building permits and insurance terms.

**ERM-CH23** is Switzerland's first national earthquake risk model, covering 2M+ buildings with financial loss estimation. Built on OpenQuake.

**Schutz vor Naturgefahren** provides free address-level multi-hazard checks for any Swiss building, combining all official hazard data with building protection recommendations.

**Madaster Switzerland** is the material passport platform for Swiss buildings, recording all materials from BIM data with circularity index and residual value calculation. Commercial SaaS.

**Mobitool** provides standardized environmental impact data for all Swiss transport modes, relevant for calculating Scope 3 transport emissions of building locations.

---

## Coverage Gaps

Remaining gaps:

1. **Deep renovation cost modeling** — ResStock/ComStock and BETTER cover efficiency measures, but no tool estimates full renovation costs (labor, materials, disruption) by building type and EU jurisdiction.

2. **Insurance pricing impact** — Cat models (CLIMADA, Oasis, HAZUS) estimate losses but no tool translates hazard into premium impact or building-level insurability assessment.

3. **EU Taxonomy screening calculator** — The EC provides guidance but no open web calculator for building-specific Taxonomy alignment checking.

4. **Climate-adjusted property valuation** — No open model connects climate risk to property values (cap rate adjustment, green premium/brown discount). DuPa 2.0 (Netherlands) is the closest but not yet open.

5. **Scope 3 tenant emissions** — GRESB/PCAF/CRREM provide methodology for landlord-tenant splitting but no dedicated calculator exists.

6. **EPC rating estimator** — UK SAP/RdSAP methodology is published but no open web implementation exists for estimating EPC ratings from building characteristics.

---

## Statistics

- **49 models** total (1 live, 48 coming-soon)
- **9 categories** — energy-performance (17) and physical-risk (16) most populated
- **110 unique tags** for fine-grained filtering
- **10 license types** — 14 open-source, 13 free, 7 free-open-methodology
- **13 Swiss-specific models** covering emissions, hazards, solar, LCA, certification, and transport
- **Complexity range**: 1-8 (median 5)
- **Maturity range**: 4-9 (median 8)
- **40 quantitative**, 8 mixed, 1 qualitative
- **34 of 49** cover the Operation phase; 6 cover End of life, 4 cover Circularity
