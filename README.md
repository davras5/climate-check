# climate-check
A curated overview of open-source tools and methods for climate risk and carbon emission assessments in real estate — including built-in calculators with map dashboards and PDF reporting.

---

## Data Model

Based on the CRREM Risk Assessment Tool V2.07. See [docs/research/CRREM/README.md](docs/research/CRREM/README.md) for the full conceptual data model, entity relationships, reference data, and methodology details.

### Model Inputs

#### Asset Identification

| Attribute | Format | Required | Description |
|---|---|---|---|
| Asset Name | String | Yes | Identifier for the building |
| Reporting Year | Selection | Yes | Year of the energy data (2020, 2021, 2022, 2023, or 2024) |
| Country / Jurisdiction | Selection | Yes | Location of the building (41 jurisdictions in V2.07) |
| Property Type | Selection | Yes | Building use classification (11 types EU/APAC, 16 types NA) |
| Total Gross Internal Area | Numeric (m²) | Yes | Floor area measured to IPMS 2 standard. Excludes outdoor areas and indoor parking. |
| Average Annual Vacant Area | Numeric (m²) | Yes | Unoccupied floor area for occupancy normalization |
| Gross Asset Value (GAV) | Numeric (EUR or USD) | No | Market value; required for Carbon Value at Risk. Currency depends on edition. |
| % Ownership | Numeric (%) | No | Partial ownership allocation |
| Reporting Period Start Month | Integer (1–12) | No | Month energy reporting begins |
| Reporting Period Length | Integer (months) | No | Duration of energy data (1–12); default annualized |
| Entity / Fund Name | String | No | Portfolio grouping identifier |
| City | String | No | City location |
| ZIP / Postal Code | String | No | Enables local HDD/CDD climate corrections and (in NA) automatic pathway assignment |
| Address | String | No | Full street address |
| Air Conditioning | Boolean | No | Whether the building has AC (affects energy projections) |
| Include / Exclude | Selection | No | Toggle asset in/out of portfolio analysis |

#### Energy Consumption

Each energy source collects three values to enable extrapolation for partial metering coverage. Users must normalize for operating hours before data entry. EV charging electricity must be excluded.

| Attribute | Format | Description |
|---|---|---|
| Grid Electricity | Numeric (kWh) | Annual grid electricity use (jurisdiction-specific projected emission factor) |
| Natural Gas | Numeric (kWh) | Annual natural gas use (static EF: 0.18316 kgCO₂e/kWh EU/APAC, 0.18105 NA) |
| Fuel Oil | Numeric (kWh) | Annual fuel oil consumption (static EF) |
| District Heating (steam) | Numeric (kWh) | Annual district heating use (dynamic EF coupled to electricity). Hot water DH goes under "Other". |
| District Cooling | Numeric (kWh) | Annual district cooling use (dynamic EF coupled to electricity) |
| Other Sources (×2) | Numeric (kWh) | Biogas, wood chips, wood pellets, coal, landfill gas, LPG |
| Data Coverage per source | Numeric (m²) | Metered floor area for that energy source |
| Max Coverage Area per source | Numeric (m²) | Total building area for that energy source |

#### Renewable Energy Generation

The tool collects three aggregate fields (not broken down by solar/wind/other):

| Attribute | Format | Description |
|---|---|---|
| On-site Generated and Consumed | Numeric (kWh/yr) | All on-site renewable energy used on-site (EF = 0) |
| On-site Generated and Exported | Numeric (kWh/yr) | All on-site renewable energy sold to grid (reduces carbon footprint) |
| Off-site Renewable Purchased | Numeric (kWh/yr) | Renewable energy contracts (location-based recommended, or market-based) |

#### Fugitive Emissions (Refrigerant Leakage)

| Attribute | Format | Description |
|---|---|---|
| Refrigerant Type (×2) | Selection | Gas type (e.g., R-410A, R-134a); 40+ types; converted via IPCC GWP |
| Annual Leakage Amount (×2) | Numeric (kg) | Annual refrigerant leakage; triggers CO₂e pathway benchmark |

#### Retrofit Scenarios (up to 3 per asset)

| Attribute | Format | Description |
|---|---|---|
| Retrofit Year | Integer (2020–2050) | Year the retrofit is planned or executed |
| Retrofit Investment | Numeric (EUR or USD) | Capital cost of the retrofit |
| Achieved Energy Reduction | Numeric (%) | Expected energy reduction |
| Embodied Carbon of Retrofit | Numeric (kgCO₂e) | Lifecycle carbon cost of the retrofit materials and works |

#### Configuration Settings

| Setting | Default | Format | Description |
|---|---|---|---|
| Normalize to 100% Occupancy | Yes | Boolean | Adjusts energy for vacancy |
| Normalize Current HDD/CDD | Yes | Boolean | Climate correction for comparison period |
| Climate Change Projection | RCP 4.5 | Selection (RCP 4.5 / RCP 8.5) | Future temperature scenario |
| Custom Electricity EF Schedule | Country default | Array (31 values, 2020–2050) | Override kgCO₂e/kWh per year |
| Custom DH / DC EF Schedules | Country default | Array (31 values, 2020–2050) | Override district heating/cooling EFs |
| Energy Prices | Country default | Numeric (EUR or USD/kWh) + escalation % | Electricity, gas, district heating, other |
| Carbon Price Schedule | 32 EUR/t (2023) → 250 EUR/t (2050) | Numeric + growth curve | Custom carbon price trajectory (per Reference Guide V2) |
| Discount Rate | 3% | Numeric (%) | NPV calculation for financial metrics |
| Custom Decarbonization Pathway | CRREM 1.5°C / 2°C | Array (31 values, kgCO₂e/m²/yr) | User-defined carbon budget pathway |

#### Property Types

Types differ by regional edition:

**EU / Asia-Pacific (11 types):** Office · Retail – High Street · Retail – Shopping Centre · Retail – Warehouse · Hotel · Health Care · Industrial – Distribution Warehouse (Warm) · Industrial – Distribution Warehouse (Cooled) · Lodging, Leisure & Recreation · Mixed Use · Residential – Multi-family

**North America (16 types):** Office · Retail – High Street · Enclosed Retail Mall · Strip Shopping Center · Retail Store · Hotel · Inpatient Healthcare · Outpatient Healthcare · Industrial – Distribution Warehouse (Warm) · Industrial – Distribution Warehouse (Cooled) · Leisure · Self Storage · Mixed Use · Residential – Multi-family High-Rise · Residential – Multi-family Low-Rise · Residential – Small Multi-family (US only)

---

### Model Outputs

#### Asset-Level Outputs

| Attribute | Format | Unit | Description |
|---|---|---|---|
| Baseline Carbon Intensity | Float | kgCO₂(e)/m²/yr | Calculated from reported energy and emission factors |
| Baseline Energy Intensity | Float | kWh/m²/yr | Energy consumption ÷ floor area |
| Projected Carbon Intensity Trajectory | Array (31 values) | kgCO₂(e)/m²/yr | Future trajectory (2020–2050) accounting for grid decarbonization, climate change |
| CRREM Decarbonization Pathway | Array (31 values) | kgCO₂(e)/m²/yr | Target pathway for jurisdiction × property type × scenario |
| Energy Reduction Pathway | Array (31 values) | kWh/m²/yr | Target energy pathway; min 2.9% annual reduction (UN SDG 7.3) |
| Stranding Year | Integer or null | Year | First year the asset trajectory exceeds the pathway |
| Cumulative Excess Emissions | Float | kgCO₂(e) | Total emissions above the pathway from stranding year to 2050 |
| Excess Emissions per Floor Area | Float | kgCO₂(e)/m² | Excess emissions normalized by floor area |
| Annual Cost of Excess Emissions | Array (31 values) | EUR or USD/yr | Excess emissions × projected carbon price per year |
| Carbon Value at Risk (CVaR) | Float (0–100+) | % of GAV | NPV of excess emission costs ÷ Gross Asset Value |
| Estimated Annual Energy Costs | Float | EUR or USD/yr | Consumption × energy prices by source |
| Whole Building GHG Emissions | Float | kgCO₂(e)/yr | Total annual operational emissions from all sources |
| Renewable Energy Share | Float (0–100) | % | On-site renewables as percentage of total consumption |

#### Retrofit Scenario Outputs (per retrofit, up to 3)

| Attribute | Format | Unit | Description |
|---|---|---|---|
| New Stranding Year | Integer or null | Year | Stranding year after applying the retrofit |
| Economic Payback | Float | Years | Break-even for investment vs. discounted energy savings (NPV) |
| Ecological Payback | Float | Years | Break-even for embodied carbon vs. operational emission savings |
| Cost to Comply | Float | EUR or USD | Estimated cost to reach pathway alignment by 2050 |

#### Portfolio-Level Outputs

| Attribute | Format | Description |
|---|---|---|
| Evolution of Stranding Over Time | Array (31 values, %) | Share of stranded assets per year (by count, floor area, or GAV) |
| Portfolio Emissions vs. Targets | Array (31 values, kgCO₂e) | Total portfolio emissions against 1.5°C and 2°C pathways |
| Portfolio GHG Intensity | Array (31 values, kgCO₂e/m²) | Floor-area-weighted carbon intensity evolution |
| Portfolio Excess Emission Costs | Array (31 values, EUR or USD/yr) + Aggregate CVaR (%) | Annual costs and aggregate Carbon Value at Risk |
| Stranding Events Timeline | Report | Summary of when assets strand, by GAV and floor area |
| Filtering Dimensions | Multi-select | Country, property type, entity/fund, reporting year, simulated sales |
