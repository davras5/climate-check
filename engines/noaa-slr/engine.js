// ============================================================
// NOAA Sea Level Rise – API Wrapper Engine
// Queries NOAA Digital Coast ArcGIS REST services for
// sea level rise inundation data at a given point.
// No API key required. Coverage: US coastal areas.
// Tests SLR scenarios from 1 ft to 10 ft.
// ============================================================

window.NoaaSLR = (function () {

  const BASE = 'https://coast.noaa.gov/arcgis/rest/services/dc_slr';

  function init() { return Promise.resolve(); }

  async function identifyAtLevel(lat, lon, level) {
    const mapServer = `slr_${level}ft`;
    const url = `${BASE}/${mapServer}/MapServer/identify`;

    // Build an envelope around the point for the identify call
    const tolerance = 2;
    const extent = {
      xmin: lon - 0.0001,
      ymin: lat - 0.0001,
      xmax: lon + 0.0001,
      ymax: lat + 0.0001,
      spatialReference: { wkid: 4326 }
    };

    const params = new URLSearchParams({
      geometry: `${lon},${lat}`,
      geometryType: 'esriGeometryPoint',
      sr: '4326',
      layers: 'all',
      tolerance: String(tolerance),
      mapExtent: `${extent.xmin},${extent.ymin},${extent.xmax},${extent.ymax}`,
      imageDisplay: '400,300,96',
      returnGeometry: 'false',
      f: 'json'
    });

    const resp = await fetch(`${url}?${params}`);
    if (!resp.ok) return null;

    const json = await resp.json();
    if (!json.results || json.results.length === 0) return null;

    const attrs = json.results[0].attributes || {};
    return {
      inundated: true,
      depth: attrs.Depth || attrs.depth || attrs.DEPTH || null,
      confidence: attrs.Confidence || attrs.confidence || null,
      layer: json.results[0].layerName || null
    };
  }

  async function calculate(input) {
    const { latitude, longitude, slr_feet } = input;
    if (latitude == null || longitude == null) {
      return { error: 'latitude and longitude are required.' };
    }

    try {
      // If a specific level is requested, query just that level
      if (slr_feet != null) {
        const level = Math.max(1, Math.min(10, Math.round(Number(slr_feet))));
        const result = await identifyAtLevel(Number(latitude), Number(longitude), level);
        return {
          slr_feet: level,
          inundated: result ? result.inundated : false,
          depth: result ? result.depth : null,
          confidence: result ? result.confidence : null
        };
      }

      // Otherwise test all levels 1-10
      const scenarios = [];
      for (let ft = 1; ft <= 10; ft++) {
        const result = await identifyAtLevel(Number(latitude), Number(longitude), ft);
        scenarios.push({
          slr_feet: ft,
          inundated: result ? true : false,
          depth: result ? result.depth : null,
          confidence: result ? result.confidence : null
        });
        // Small delay between requests
        await new Promise(r => setTimeout(r, 300));
      }

      // Find first inundation threshold
      const firstInundated = scenarios.find(s => s.inundated);
      return {
        first_inundation_ft: firstInundated ? firstInundated.slr_feet : null,
        scenarios: scenarios
      };
    } catch (err) {
      return { error: 'NOAA SLR request failed: ' + err.message };
    }
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
      // Rate limit: 1 req/sec for ArcGIS services
      await new Promise(r => setTimeout(r, 1000));
    }
    return results;
  }

  return { init, calculate, parseCSV, runBatch };
})();
