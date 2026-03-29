// ============================================================
// geo.admin.ch Hazard Layers – API Wrapper Engine
// Queries BAFU natural hazard layers via GeoAdmin REST API.
// No API key required. Swiss coverage only.
//
// Note: Flood hazard (Hochwasser) is NOT available on GeoAdmin –
// use geodienste.ch WFS instead (geodienste-gefahren engine).
// ============================================================

window.GeoadminHazards = (function () {

  const BASE = 'https://api3.geo.admin.ch/rest/services/api/MapServer/identify';

  // BAFU hazard indication layers (confirmed working naming pattern)
  const LAYERS = {
    landslide:            'ch.bafu.gefahren-rutschungen',        // untested but same naming pattern
    avalanche:            'ch.bafu.gefahren-lawinen',            // untested
    rockfall:             'ch.bafu.gefahren-sturz',              // untested
    debris_flow:          'ch.bafu.gefahren-murgaenge',          // untested
    seismic_ground_class: 'ch.bafu.gefahren-baugrundklassen'     // CONFIRMED working
  };

  const LEVEL_MAP = {
    1: 'Low', 2: 'Medium', 3: 'High', 4: 'Very High',
    'gering': 'Low', 'mittel': 'Medium', 'erheblich': 'High', 'gross': 'Very High'
  };

  function init() { return Promise.resolve(); }

  async function queryLayer(layerId, lat, lon, tolerance) {
    // Use simple lon,lat geometry format (confirmed working)
    const params = new URLSearchParams({
      geometryType: 'esriGeometryPoint',
      geometry: `${lon},${lat}`,
      sr: '4326',
      layers: 'all:' + layerId,
      tolerance: String(tolerance || 50),
      mapExtent: `${lon - 0.5},${lat - 0.5},${lon + 0.5},${lat + 0.5}`,
      imageDisplay: '1000,1000,96',
      returnGeometry: 'false',
      lang: 'en'
    });
    const resp = await fetch(`${BASE}?${params}`);
    if (!resp.ok) return null;
    const json = await resp.json();
    if (!json.results || !json.results.length) return null;
    return json.results[0].attributes || null;
  }

  function parseHazardLevel(attrs) {
    if (!attrs) return null;
    const raw = attrs.intensitaet || attrs.hazard_level || attrs.INTENSITAET || '';
    return LEVEL_MAP[raw] || LEVEL_MAP[String(raw).toLowerCase()] || raw || null;
  }

  async function calculate(input) {
    const { latitude, longitude, tolerance } = input;
    if (!latitude || !longitude) return { error: 'latitude and longitude are required.' };
    if (latitude < 45.8 || latitude > 47.9 || longitude < 5.9 || longitude > 10.5)
      return { error: 'Coordinates outside Switzerland.' };

    const results = {};
    const queries = Object.entries(LAYERS).map(async ([key, layerId]) => {
      const attrs = await queryLayer(layerId, latitude, longitude, tolerance);
      results[key + '_hazard'] = parseHazardLevel(attrs);
    });
    await Promise.all(queries);

    results.source_layer = 'ch.bafu.gefahren-*';
    return results;
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
