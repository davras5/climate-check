# Swiss Federal Geoportal API - Layers for Real Estate Climate Risk Assessment

**Research Date:** 2026-03-28
**Base API:** `https://api3.geo.admin.ch/rest/services/api/MapServer`
**Coordinate System:** LV95 (EPSG:2056) for identify queries

## Query Pattern

All layers can be queried per-coordinate (building-level) using the identify endpoint:

```
GET https://api3.geo.admin.ch/rest/services/api/MapServer/identify
  ?geometry={easting},{northing}
  &geometryType=esriGeometryPoint
  &tolerance=50
  &layers=all:{layerId}
  &mapExtent={xmin},{ymin},{xmax},{ymax}
  &imageDisplay=1000,1000,96
  &sr=2056
```

Individual features can also be retrieved:
```
GET https://api3.geo.admin.ch/rest/services/api/MapServer/{layerId}/{featureId}
```

---

## 1. CLIMATE / CARBON RISK LAYERS

### 1.1 CO2 Emissions per Building
- **Layer ID:** `ch.bafu.klima-co2_ausstoss_gebaeude`
- **Name:** CO2-Emissionen Gebaeude (SIA 380/1)
- **Data:** Estimated direct CO2 emissions (kg/m2/year) for residential buildings based on SIA 380/1 standard. Returns CO2 emission range (0, 5-10, 20-25, >25), heating system type (boiler, heat pump, heat exchanger), energy source (oil, gas, wood, geothermal, district heat), data source origin.
- **Relevance:** CORE LAYER - Direct carbon risk per building. Essential for CRREM stranding analysis and CO2 cost projections.
- **Coordinate queryable:** YES - returns building-level data with address
- **Example:**
  ```
  .../identify?geometry=2600000,1200000&geometryType=esriGeometryPoint&tolerance=50&layers=all:ch.bafu.klima-co2_ausstoss_gebaeude&mapExtent=2550000,1150000,2650000,1250000&imageDisplay=1000,1000,96&sr=2056
  ```
- **Fields:** street address, postal code, co2_range, heating_type, energy_source, data_source

### 1.2 GWR: Heating Energy Source
- **Layer ID:** `ch.bfs.gebaeude_wohnungs_register_waermequelle_heizung`
- **Name:** GWR: Energie-/Waermequelle Heizung
- **Data:** Primary heating energy/heat source for each building from the federal building register (GWR). Color-coded by source type, with data currency indicator.
- **Relevance:** Identifies fossil fuel dependency. Buildings with oil/gas heating face transition risk and potential carbon tax exposure.
- **Coordinate queryable:** YES - building-level
- **Fields:** heating source (gwaerzh1), heating generation type (genh1), heating performance, update date

### 1.3 Minergie Certified Buildings
- **Layer ID:** `ch.bfe.minergiegebaeude`
- **Name:** Minergie
- **Data:** Buildings certified under Minergie energy efficiency standards. Returns certification level (Minergie, Minergie-P, Minergie-A, Minergie-Eco, and combinations), certificate number, canton, energy reference area (ebf).
- **Relevance:** Identifies energy-efficient buildings with lower carbon risk. Minergie-A buildings are near-zero energy. Certification affects property value and regulatory compliance.
- **Coordinate queryable:** YES
- **Fields:** canton, certificate, standard, ebf (energy reference area)

### 1.4 Solar Roof Suitability
- **Layer ID:** `ch.bfe.solarenergie-eignung-daecher`
- **Name:** Solarenergie: Eignung Daecher
- **Data:** Per-building roof assessment for photovoltaic and solar thermal installations. Shows which roofs are suitable with expected energy yield estimates.
- **Relevance:** Quantifies renewable energy self-generation potential. Critical for decarbonization pathway planning and future energy cost reduction.
- **Coordinate queryable:** YES - per building_id
- **Fields:** building_id, suitability classification

### 1.5 Solar Facade Suitability
- **Layer ID:** `ch.bfe.solarenergie-eignung-fassaden`
- **Name:** Solarenergie: Eignung Fassaden
- **Data:** Building facade assessment for solar energy using 3D building models and radiation modeling.
- **Relevance:** Additional renewable potential beyond rooftops for urban buildings with limited roof area.
- **Coordinate queryable:** YES

### 1.6 Solar Irradiation Maps (4 layers)
- **Layer IDs:**
  - `ch.bfe.solarenergie-einstrahlung_0_grad` (horizontal)
  - `ch.bfe.solarenergie-einstrahlung_30_grad` (30 deg south)
  - `ch.bfe.solarenergie-einstrahlung_75_grad` (75 deg south)
  - `ch.bfe.solarenergie-einstrahlung_90_grad` (90 deg vertical south)
- **Data:** Solar radiation on surfaces at different inclinations, 50m grid, based on 2000-2020 data.
- **Relevance:** Baseline solar resource for PV feasibility calculations.
- **Coordinate queryable:** YES (raster/grid based)

### 1.7 Renewable Heating Advisory
- **Layer IDs:**
  - `ch.bfe.erneuerbarheizen` (single-family and small multi-family)
  - `ch.bfe.erneuerbarheizen-mehrfamilienhaeuser` (large multi-family, >6 units)
- **Data:** Locations of advisory services for transitioning to renewable heating.
- **Relevance:** Indicates government support infrastructure for heating transition.
- **Coordinate queryable:** YES (proximity)

### 1.8 District Heating / Thermal Networks
- **Layer ID:** `ch.bfe.thermische-netze`
- **Name:** Thermische Netze
- **Data:** District heating/cooling networks with operator, power (MW), energy (MWh/a), network length (km), number of house connections, energy source, operational start date.
- **Relevance:** Buildings near thermal networks have viable decarbonization options. Proximity to district heating reduces transition risk.
- **Coordinate queryable:** YES
- **Fields:** name, operator, power, energy, netlength, houseconnections, energysource, beginningofoperation

### 1.9 Heat Demand Density
- **Layer IDs:**
  - `ch.bfe.fernwaerme-nachfrage_wohn_dienstleistungsgebaeude` (residential/commercial)
  - `ch.bfe.fernwaerme-nachfrage_industrie` (industrial)
- **Data:** Thermal energy demand density mapping for buildings.
- **Relevance:** High heat demand density indicates district heating viability, affecting future energy transition options.
- **Coordinate queryable:** YES

### 1.10 Groundwater Heat Potential
- **Layer ID:** `ch.bfe.grundwasserwaermenutzungspotential`
- **Name:** Grundwasserwaermenutzungspotenzial
- **Data:** Maximum sustainably exploitable heat from groundwater resources.
- **Relevance:** Indicates feasibility of groundwater heat pump installations as fossil fuel replacement.
- **Coordinate queryable:** YES

### 1.11 Global Radiation Climate Normals
- **Layer ID:** `ch.meteoschweiz.klimanormwerte-globalstrahlung_aktuelle_periode`
- **Name:** Globalstrahlung 2004-2020 (Klimanormwerte)
- **Data:** Satellite-based long-term monthly and annual mean global radiation.
- **Relevance:** Baseline climate data for solar energy potential calculations.
- **Coordinate queryable:** YES

---

## 2. NATURAL HAZARD LAYERS

### 2.1 Flood Zones (Aquaprotect Series)
- **Layer IDs:**
  - `ch.bafu.aquaprotect_050` (50-year return period)
  - `ch.bafu.aquaprotect_100` (100-year return period)
  - `ch.bafu.aquaprotect_250` (250-year return period)
  - `ch.bafu.aquaprotect_500` (500-year return period)
- **Data:** Nationwide overview of potentially flooded areas for different return periods.
- **Relevance:** CORE LAYER - Direct flood risk assessment per location. The 100-year flood zone is the standard insurance reference. Buildings in flood zones face higher premiums and potential value depreciation.
- **Coordinate queryable:** YES
- **Example:**
  ```
  .../identify?geometry=2600000,1200000&geometryType=esriGeometryPoint&tolerance=10&layers=all:ch.bafu.aquaprotect_100&mapExtent=2599000,1199000,2601000,1201000&imageDisplay=1000,1000,96&sr=2056
  ```

### 2.2 Surface Runoff Hazard Map
- **Layer ID:** `ch.bafu.gefaehrdungskarte-oberflaechenabfluss`
- **Name:** Gefaehrdungskarte Oberflaechenabfluss
- **Data:** Surface water runoff flood hazard zones for rare to very rare events.
- **Relevance:** Complements river flood maps. Many urban flood damages come from surface runoff, not rivers.
- **Coordinate queryable:** YES

### 2.3 Flood Warning (Real-time)
- **Layer ID:** `ch.bafu.hydroweb-warnkarte_national`
- **Name:** Hochwasserwarnkarte
- **Data:** Current flood danger levels (1-5) for all major waterways and lakes.
- **Relevance:** Real-time hazard monitoring. Less relevant for static risk assessment but useful for operational risk.
- **Coordinate queryable:** YES

### 2.4 Earthquake Zones (SIA 261)
- **Layer ID:** `ch.bafu.gefahren-gefaehrdungszonen`
- **Name:** Erdbebenzonen SIA 261
- **Data:** Earthquake zones per building code SIA 261, with design values for horizontal ground acceleration.
- **Relevance:** CORE LAYER - Determines seismic design requirements and earthquake risk rating for any building location.
- **Coordinate queryable:** YES

### 2.5 Seismic Building Ground Classes
- **Layer ID:** `ch.bafu.gefahren-baugrundklassen`
- **Name:** Seismische Baugrundklassen
- **Data:** Ground class categories (A-F) per SIA 261:2003 determining local seismic amplification.
- **Relevance:** Ground class modifies earthquake risk. Soft soils (class E, F) amplify shaking significantly. Combined with earthquake zone for full seismic risk picture.
- **Coordinate queryable:** YES
- **Fields:** bgk (ground class A-F), referenz (SIA261:2003)

### 2.6 Spectral Microzonation
- **Layer ID:** `ch.bafu.gefahren-spektral`
- **Name:** Spektrale Mikrozonierung
- **Data:** Perimeters of available spectral microzonation studies modeling earthquake wave amplification through local geology.
- **Relevance:** More detailed seismic hazard data where available.
- **Coordinate queryable:** YES

### 2.7 Historical Earthquakes
- **Layer ID:** `ch.bafu.gefahren-historische_erdbeben`
- **Name:** Historische Erdbeben
- **Data:** Earthquake catalog (ECOS09) for Switzerland and border regions since 250 AD.
- **Relevance:** Historical context for seismic risk assessment.
- **Coordinate queryable:** YES (proximity)

### 2.8 Avalanche Zones
- **Layer ID:** `ch.bafu.silvaprotect-lawinen`
- **Name:** Lawinen (SilvaProtect-CH)
- **Data:** Avalanche hazard indication zones based on terrain modeling.
- **Relevance:** Critical for mountain properties. Avalanche zones affect insurability and building permits.
- **Coordinate queryable:** YES

### 2.9 Debris Flow (Murgang)
- **Layer ID:** `ch.bafu.silvaprotect-murgang`
- **Name:** Murgang (SilvaProtect-CH)
- **Data:** Debris flow hazard indication map. Debris flows are fast-moving mixtures of water and solids (30-60% solid content).
- **Relevance:** Severe damage potential for buildings in affected areas. Relevant for mountain and hillside properties.
- **Coordinate queryable:** YES

### 2.10 Permafrost
- **Layer ID:** `ch.bafu.permafrost`
- **Name:** Permafrosthinweiskarte
- **Data:** Potential permafrost distribution above ~2400m. Climate change threatens to raise the permafrost boundary, triggering rockfall and landslides.
- **Relevance:** Relevant for high-altitude properties. Thawing permafrost creates new hazard zones.
- **Coordinate queryable:** YES

### 2.11 Slope Classification (>30 degrees)
- **Layer IDs:**
  - `ch.swisstopo.hangneigung-ueber_30`
  - `ch.swisstopo-karto.hangneigung`
- **Data:** Slope classifications above 30 degrees from 10m resolution elevation data.
- **Relevance:** Slopes >30 degrees are prone to avalanches and landslides. Basic terrain risk indicator.
- **Coordinate queryable:** YES

---

## 3. STORM / WIND / HAIL HAZARD LAYERS

### 3.1 Storm Gust Peaks (4 return periods)
- **Layer IDs:**
  - `ch.bafu.sturm-boeenspitzen_30` (30-year)
  - `ch.bafu.sturm-boeenspitzen_50` (50-year)
  - `ch.bafu.sturm-boeenspitzen_100` (100-year)
  - `ch.bafu.sturm-boeenspitzen_300` (300-year)
- **Data:** Gust peak speeds in m/s and km/h with uncertainty ranges for different return periods.
- **Relevance:** CORE LAYER - Direct wind damage risk for buildings. The 50-year and 100-year values are most relevant for insurance and building design.
- **Coordinate queryable:** YES
- **Fields:** boenspitzen_ms_30, boenspitzen_ms_50, boenspitzen_kmh_30, boenspitzen_kmh_50

### 3.2 Storm Wind Pressure (4 return periods)
- **Layer IDs:**
  - `ch.bafu.sturm-staudruck_30` (30-year)
  - `ch.bafu.sturm-staudruck_50` (50-year)
  - `ch.bafu.sturm-staudruck_100` (100-year)
  - `ch.bafu.sturm-staudruck_300` (300-year)
- **Data:** Wind pressure data (dynamic pressure) for building structural assessment.
- **Relevance:** Direct engineering input for building envelope and structural risk assessment.
- **Coordinate queryable:** YES

### 3.3 Hail Hazard (4 return periods)
- **Layer IDs:**
  - `ch.meteoschweiz.hagelgefaehrdung-korngroesse_10_jahre` (10-year)
  - `ch.meteoschweiz.hagelgefaehrdung-korngroesse_20_jahre` (20-year)
  - `ch.meteoschweiz.hagelgefaehrdung-korngroesse_50_jahre` (50-year)
  - `ch.meteoschweiz.hagelgefaehrdung-korngroesse_100_jahre` (100-year)
- **Data:** Statistically estimated hail stone size (LEHA-100) on 100m2 reference surface for different return periods. Based on 2002-2020 radar data.
- **Relevance:** CORE LAYER - Hail is a major cause of building damage in Switzerland. Used by insurers for premium calculation. Affects roof, facade, and solar panel damage risk.
- **Coordinate queryable:** YES

### 3.4 Historical Storm Damage
- **Layer IDs:**
  - `ch.bafu.waldschadenflaechen-lothar` (Storm Lothar 1999)
  - `ch.bafu.waldschadenflaechen-vivian` (Storm Vivian 1990)
- **Data:** Mapped forest damage from historical extreme storm events.
- **Relevance:** Historical evidence of extreme wind exposure in specific areas.
- **Coordinate queryable:** YES

---

## 4. ENVIRONMENTAL RISK LAYERS

### 4.1 Radon Map
- **Layer ID:** `ch.bag.radonkarte`
- **Name:** Radonkarte
- **Data:** Probability (%) of exceeding radon reference value per location, with confidence index.
- **Relevance:** Health risk for building occupants. High radon areas may require mitigation measures, affecting renovation costs.
- **Coordinate queryable:** YES
- **Fields:** probability_prozent, confidence

### 4.2 Road Traffic Noise (Day/Night)
- **Layer IDs:**
  - `ch.bafu.laerm-strassenlaerm_tag` (daytime)
  - `ch.bafu.laerm-strassenlaerm_nacht` (nighttime)
- **Data:** Modeled road traffic noise exposure across ~45,000 km of Swiss roads, based on 2021 traffic data.
- **Relevance:** Noise pollution directly affects property values. Exceeding legal limits may require building owner action.
- **Coordinate queryable:** YES

### 4.3 Railway Noise (Day/Night)
- **Layer IDs:**
  - `ch.bafu.laerm-bahnlaerm_tag` (daytime)
  - `ch.bafu.laerm-bahnlaerm_nacht` (nighttime)
- **Data:** Railway noise burden based on 2021 emission data, ~4,165 km rail network.
- **Relevance:** Property value impact, especially for residential buildings near rail lines.
- **Coordinate queryable:** YES

### 4.4 Railway Noise - Detailed (Multiple layers)
- **Layer IDs (selection):**
  - `ch.bav.laermbelastung-eisenbahn_tatsaechliche_emissionen_tag` (actual emissions day)
  - `ch.bav.laermbelastung-eisenbahn_tatsaechliche_emissionen_nacht` (actual emissions night)
  - `ch.bav.laermbelastung-eisenbahn_effektive_immissionen_tag` (actual immissions day)
  - `ch.bav.laermbelastung-eisenbahn_effektive_immissionen_nacht` (actual immissions night)
  - `ch.bav.laermbelastung-eisenbahn_zulaessige_immissionen_tag` (permissible limits day)
  - `ch.bav.laermbelastung-eisenbahn_zulaessige_immissionen_nacht` (permissible limits night)
- **Data:** Detailed railway noise cadastre with actual vs. permissible immission levels in dB(A).
- **Relevance:** Shows whether legal noise limits are exceeded, which triggers mandatory remediation.
- **Coordinate queryable:** YES

### 4.5 Aircraft Noise (Multiple layers)
- **Layer IDs (selection):**
  - `ch.bazl.laermbelastungskataster-zivilflugplaetze_klein-grossflugzeuge` (small/large aircraft)
  - `ch.bazl.laermbelastungskataster-zivilflugplaetze_helikopter` (helicopters)
  - `ch.bazl.laermbelastungskataster-zivilflugplaetze_erste-nachtstunde` (first night hour)
  - `ch.bazl.laermbelastungskataster-zivilflugplaetze_letzte-nachtstunde` (last night hour)
- **Data:** Noise exposure contours around civil airfields.
- **Relevance:** Significant property value factor near airports.
- **Coordinate queryable:** YES

### 4.6 Air Quality Monitoring Stations
- **Layer ID:** `ch.bafu.nabelstationen`
- **Name:** Messstationen Luftqualitaet
- **Data:** National air quality monitoring network (NABEL) with 16 stations across Switzerland.
- **Relevance:** Air quality indicator for building locations. Limited to station proximity.
- **Coordinate queryable:** YES (station locations only)

### 4.7 Nitrogen Deposition / Critical Load Exceedance
- **Layer IDs:**
  - `ch.bafu.luftreinhaltung-stickstoffdeposition` (nitrogen deposition)
  - `ch.bafu.luftreinhaltung-stickstoff_kritischer_eintrag` (critical load exceedance)
  - `ch.bafu.luftreinhaltung-ammoniakkonzentration` (ammonia concentration)
- **Data:** Modeled air pollution indicators for nitrogen compounds.
- **Relevance:** Environmental quality indicator for location assessment.
- **Coordinate queryable:** YES

### 4.8 Contaminated Sites (Altlasten)
- **Layer IDs:**
  - `ch.bav.kataster-belasteter-standorte-oev` (public transport contaminated sites)
  - `ch.vbs.kataster-belasteter-standorte-militaer` (military contaminated sites, ~2,550 sites)
- **Data:** Public registry of contaminated sites from transport and military operations.
- **Relevance:** Contaminated sites near properties affect value and may indicate soil/groundwater issues. Note: Cantonal contaminated site registries (KbS) are not on the federal API but are critical - they must be queried at cantonal level.
- **Coordinate queryable:** YES

### 4.9 Atmospheric Radioactivity
- **Layer ID:** `ch.bag.radioaktivitaet-atmosphaere`
- **Data:** Aerosol-bound radioactivity concentration at 6 monitoring stations.
- **Relevance:** Niche environmental quality indicator.
- **Coordinate queryable:** YES (station proximity only)

---

## 5. BUILDING DATA LAYERS

### 5.1 GWR Building Register - Building Status
- **Layer ID:** `ch.bfs.gebaeude_wohnungs_register`
- **Name:** GWR: Gebaeudestatus
- **Data:** CORE BUILDING DATA. Contains 100+ fields including:
  - **Identifiers:** EGID (federal building ID), EGRID (property ID), building number
  - **Building characteristics:** construction year (gbauj), building class (gklas), category (gkat), number of stories (gastw), volume (gvol m3), floor area (garea m2)
  - **Dwelling data:** total dwelling count (ganzwhg), unit area (warea m2), room count (wazim), kitchen facilities
  - **Heating/energy:** primary and secondary heating sources and equipment, hot water sources
  - **Location:** canton, municipality, postal code, coordinates, street address
- **Relevance:** CORE LAYER - Foundation for all building-level analysis. Construction year indicates likely energy standard. Heating system data enables carbon risk classification.
- **Coordinate queryable:** YES - returns building-level data
- **Example:**
  ```
  .../identify?geometry=2600000,1200000&geometryType=esriGeometryPoint&tolerance=50&layers=all:ch.bfs.gebaeude_wohnungs_register&mapExtent=2599000,1199000,2601000,1201000&imageDisplay=1000,1000,96&sr=2056
  ```

### 5.2 GWR Building Statistics
- **Layer ID:** `ch.bfs.volkszaehlung-gebaeudestatistik_gebaeude`
- **Name:** Gebaeude (Gebaeude- und Wohnungsstatistik)
- **Data:** Census-based building statistics.
- **Relevance:** Aggregated building stock data for area analysis.
- **Coordinate queryable:** YES

### 5.3 GWR Dwelling Statistics
- **Layer ID:** `ch.bfs.volkszaehlung-gebaeudestatistik_wohnungen`
- **Name:** Wohnungen (Gebaeude- und Wohnungsstatistik)
- **Data:** Census-based dwelling statistics.
- **Relevance:** Dwelling-level data for residential property analysis.
- **Coordinate queryable:** YES

### 5.4 Official Building Address Directory
- **Layer ID:** `ch.swisstopo.amtliches-gebaeudeadressverzeichnis`
- **Name:** Amtliches Gebaeudeadressverzeichnis
- **Data:** All official building addresses in Switzerland and Liechtenstein.
- **Relevance:** Address geocoding and validation for building lookups.
- **Coordinate queryable:** YES

### 5.5 Building Footprints (VECTOR25)
- **Layer ID:** `ch.swisstopo.vec25-gebaeude`
- **Name:** Gebaeude VECTOR25
- **Data:** Building footprints from 1:25,000 topographic maps.
- **Relevance:** Building geometry for spatial analysis.
- **Coordinate queryable:** YES

---

## 6. ADDITIONAL RELEVANT LAYERS

### 6.1 Energy Cities Label
- **Layer ID:** `ch.bfe.energiestaedte`
- **Name:** Energiestaedte
- **Data:** Municipalities with the "Energy City" label for sustainable energy policy.
- **Relevance:** Indicates progressive local energy policy environment.
- **Coordinate queryable:** YES

### 6.2 Groundwater Quality (VOC, Nitrate)
- **Layer IDs:**
  - `ch.bafu.naqua-grundwasser_voc` (volatile organic compounds)
  - `ch.bafu.naqua-grundwasser_nitrat` (nitrate)
- **Data:** Groundwater contamination monitoring.
- **Relevance:** Environmental quality indicator, especially for properties with wells.
- **Coordinate queryable:** YES

### 6.3 Groundwater Vulnerability
- **Layer ID:** `ch.swisstopo.geologie-hydrogeologische_karte-grundwasservulnerabilitaet`
- **Data:** Groundwater vulnerability to contamination at 1:500,000 scale.
- **Relevance:** Indicates environmental sensitivity of the location.
- **Coordinate queryable:** YES

---

## PRIORITY LAYERS FOR CLIMATE RISK SCORING

The following layers form the minimum viable dataset for a real estate climate risk assessment:

| Priority | Category | Layer ID | Use |
|----------|----------|----------|-----|
| P0 | Building | `ch.bfs.gebaeude_wohnungs_register` | Building master data, age, heating system |
| P0 | Carbon | `ch.bafu.klima-co2_ausstoss_gebaeude` | CO2 emissions per building |
| P0 | Flood | `ch.bafu.aquaprotect_100` | 100-year flood zone |
| P0 | Earthquake | `ch.bafu.gefahren-gefaehrdungszonen` | Earthquake zone |
| P0 | Earthquake | `ch.bafu.gefahren-baugrundklassen` | Seismic ground class |
| P0 | Storm | `ch.bafu.sturm-boeenspitzen_50` | 50-year gust peaks |
| P0 | Hail | `ch.meteoschweiz.hagelgefaehrdung-korngroesse_50_jahre` | 50-year hail size |
| P1 | Carbon | `ch.bfs.gebaeude_wohnungs_register_waermequelle_heizung` | Heating source detail |
| P1 | Carbon | `ch.bfe.minergiegebaeude` | Energy certification |
| P1 | Solar | `ch.bfe.solarenergie-eignung-daecher` | Roof solar potential |
| P1 | Flood | `ch.bafu.gefaehrdungskarte-oberflaechenabfluss` | Surface runoff risk |
| P1 | Flood | `ch.bafu.aquaprotect_500` | 500-year flood (extreme) |
| P1 | Noise | `ch.bafu.laerm-strassenlaerm_tag` | Road noise (day) |
| P1 | Noise | `ch.bafu.laerm-strassenlaerm_nacht` | Road noise (night) |
| P1 | Radon | `ch.bag.radonkarte` | Radon risk |
| P2 | Transition | `ch.bfe.thermische-netze` | District heating proximity |
| P2 | Transition | `ch.bfe.grundwasserwaermenutzungspotential` | Heat pump feasibility |
| P2 | Avalanche | `ch.bafu.silvaprotect-lawinen` | Avalanche zones |
| P2 | Debris | `ch.bafu.silvaprotect-murgang` | Debris flow zones |
| P2 | Solar | `ch.bfe.solarenergie-eignung-fassaden` | Facade solar potential |
| P2 | Noise | `ch.bafu.laerm-bahnlaerm_tag` | Railway noise |
| P2 | Contamination | `ch.bav.kataster-belasteter-standorte-oev` | Contaminated sites |

---

## IMPORTANT NOTES

1. **Coordinate System:** The identify API uses LV95 (EPSG:2056) coordinates. WGS84 coordinates (lat/lon) must be converted first.

2. **GEAK not available:** The GEAK (Gebaeudeenergieausweis der Kantone) energy label is NOT available on the federal geoportal. It is managed at cantonal level and would need to be sourced from cantonal APIs or the GEAK database directly.

3. **Cantonal hazard maps missing:** Detailed cantonal natural hazard maps (Gefahrenkarten) with legal force are NOT on the federal API. The federal layers (Aquaprotect, SilvaProtect) are indicative/overview layers. Legally binding hazard maps must be obtained from cantonal geoportals.

4. **Cantonal contaminated sites (KbS):** The comprehensive contaminated sites register is cantonal. Federal API only has transport and military sites.

5. **Insurance relevance:** Swiss cantonal building insurers (KGV) use their own hazard assessment systems. The layers here (especially Aquaprotect, storm, hail, earthquake) align with but do not directly replicate insurance zone classifications. The Hagelgefaehrdung layers from MeteoSwiss are used directly by insurers.

6. **Rate limiting:** The API does not require authentication but may have rate limits for bulk queries. Consider caching responses.

7. **Tolerance parameter:** For building-level queries, use tolerance=50 (meters) to ensure nearby buildings are captured. Reduce for dense urban areas.
