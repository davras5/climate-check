// ============================================================
// Sonnenfassade.ch – API Wrapper Engine
// Queries Swiss facade solar potential via GeoAdmin REST API.
// No API key required. Swiss coverage only.
// ============================================================

window.Sonnenfassade = (function () {

  const BASE = 'https://api3.geo.admin.ch/rest/services/api/MapServer/identify';
  const LAYER = 'ch.bfe.solarenergie-eignung-fassaden';

  const SUITABILITY = {
    1: 'Very good', 2: 'Good', 3: 'Moderate', 4: 'Low', 5: 'Not suitable'
  };

  function init() { return Promise.resolve(); }

  async function calculate(input) {
    const { latitude, longitude, tolerance } = input;
    if (!latitude || !longitude) return { error: 'latitude and longitude are required.' };
    if (latitude < 45.8 || latitude > 47.9 || longitude < 5.9 || longitude > 10.5)
      return { error: 'Coordinates outside Switzerland.' };

    const geom = JSON.stringify({ x: longitude, y: latitude, spatialReference: { wkid: 4326 } });
    const params = new URLSearchParams({
      geometryType: 'esriGeometryPoint',
      geometry: geom,
      layers: 'all:' + LAYER,
      tolerance: String(tolerance || 20),
      mapExtent: `${longitude - 0.005},${latitude - 0.005},${longitude + 0.005},${latitude + 0.005}`,
      imageDisplay: '1000,1000,96',
      returnGeometry: 'false',
      lang: 'en',
      sr: '4326'
    });

    const resp = await fetch(`${BASE}?${params}`);
    if (!resp.ok) return { error: 'GeoAdmin API error: ' + resp.status };
    const json = await resp.json();

    if (!json.results || !json.results.length)
      return { error: 'No facade data found at this location.' };

    const a = json.results[0].attributes;
    return {
      facade_area_m2: a.flaeche || a.area || null,
      suitable_area_m2: a.geignete_flaeche || a.suitable_area || null,
      pv_potential_kwh: a.stromertrag || a.electricity_yield || null,
      thermal_potential_kwh: a.waermeertrag || a.heat_yield || null,
      orientation: a.ausrichtung || a.orientation || null,
      suitability_class: SUITABILITY[a.klasse || a.class] || a.klasse || null
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
