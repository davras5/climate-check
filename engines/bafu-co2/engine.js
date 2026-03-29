// ============================================================
// BAFU CO2 Calculator – API Wrapper Engine
// Queries Swiss building CO2 emissions via GeoAdmin REST API.
// Uses Federal Building Register (GWR) data + BAFU emission model.
// No API key required. Swiss coverage only.
//
// Layer: ch.bafu.klima-co2_ausstoss_gebaeude (underscores!)
// Geometry format: simple lon,lat with tolerance=50
// ============================================================

window.BafuCO2 = (function () {

  const BASE = 'https://api3.geo.admin.ch/rest/services/api/MapServer';
  const LAYER = 'ch.bafu.klima-co2_ausstoss_gebaeude';

  function init() { return Promise.resolve(); }

  async function queryByCoord(lat, lon) {
    // Use simple lon,lat geometry format (confirmed working)
    const params = new URLSearchParams({
      geometryType: 'esriGeometryPoint',
      geometry: `${lon},${lat}`,
      sr: '4326',
      layers: 'all:' + LAYER,
      tolerance: '50',
      mapExtent: `${lon - 0.5},${lat - 0.5},${lon + 0.5},${lat + 0.5}`,
      imageDisplay: '1000,1000,96',
      returnGeometry: 'false',
      lang: 'en'
    });
    const resp = await fetch(`${BASE}/identify?${params}`);
    if (!resp.ok) return null;
    const json = await resp.json();
    return (json.results && json.results.length) ? json.results[0].attributes : null;
  }

  async function queryByEGID(egid) {
    const params = new URLSearchParams({
      layer: LAYER,
      searchField: 'egid',
      searchText: String(egid),
      returnGeometry: 'false'
    });
    const resp = await fetch(`${BASE}/find?${params}`);
    if (!resp.ok) return null;
    const json = await resp.json();
    return (json.results && json.results.length) ? json.results[0].attributes : null;
  }

  async function calculate(input) {
    const { latitude, longitude, egid } = input;

    let attrs = null;
    if (egid) {
      attrs = await queryByEGID(egid);
    } else if (latitude && longitude) {
      if (latitude < 45.8 || latitude > 47.9 || longitude < 5.9 || longitude > 10.5)
        return { error: 'Coordinates outside Switzerland.' };
      attrs = await queryByCoord(latitude, longitude);
    } else {
      return { error: 'Provide latitude/longitude or egid.' };
    }

    if (!attrs) return { error: 'No building data found.' };

    return {
      co2_range: attrs.co2_range || null,
      heating_system_de: attrs.genh1_de || null,
      heat_generator_de: attrs.gwaerzh1_de || null,
      address: attrs.strname_deinr || null,
      co2_calculator_link: attrs.linkco2 || null,
      // Keep legacy fields for backward compatibility
      co2_kg_m2_yr: attrs.co2_emission || attrs.co2 || attrs.co2_range || null,
      co2_class: attrs.co2_klasse || attrs.co2_class || null,
      energy_source: attrs.energietraeger || attrs.energy_source || attrs.genh1_de || null,
      building_period: attrs.bauperiode || attrs.construction_period || null,
      energy_reference_area_m2: attrs.ebf || attrs.energy_reference_area || null
    };
  }

  function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    return lines.slice(1).filter(l => l.trim()).map(line => {
      const vals = line.split(',').map(v => v.trim());
      const row = {};
      headers.forEach((h, i) => { row[h] = isNaN(vals[i]) ? vals[i] : Number(vals[i]); });
      return row;
    });
  }

  async function runBatch(csvText) {
    const rows = parseCSV(csvText);
    const results = [];
    for (const row of rows) {
      const result = await calculate(row);
      results.push({ ...row, ...result });
    }
    return results;
  }

  return { init, calculate, parseCSV, runBatch };
})();
