// ============================================================
// Geodienste Gefahrenkarten – API Wrapper Engine
// Queries the Swiss geodienste.ch OGC WFS for official cantonal
// hazard maps (Gefahrenkarten). Covers Switzerland only.
// No API key required; public OGC WFS 2.0.0 endpoint.
//
// The WFS endpoint is at wfs.geodienste.ch (not geodienste.ch/db).
// Feature types use the ms: prefix.
// BBOX for EPSG:4326 uses lat_min,lon_min,lat_max,lon_max order.
// Response is GML (XML), not JSON.
// ============================================================

window.GeodiensteGefahren = (function () {

  const BASE = 'https://wfs.geodienste.ch/gefahrenkarten_v1_3_0/deu';

  // Feature types with ms: prefix
  const FEATURE_TYPES = {
    flood:     'ms:gefahrengebiet_wasser',
    landslide: 'ms:gefahrengebiet_rutschung',
    rockfall:  'ms:gefahrengebiet_sturz',
    avalanche: 'ms:gefahrengebiet_lawine'
  };

  const BUFFER_DEG = 0.001; // ~100m buffer in degrees for WGS84

  function init() { return Promise.resolve(); }

  // Parse a GML value from an XML tag like <ms:gefahrenstufe>gering</ms:gefahrenstufe>
  function parseGMLTag(xml, tagName) {
    const re = new RegExp('<' + tagName + '>([^<]*)</' + tagName + '>', 'g');
    const matches = [];
    let m;
    while ((m = re.exec(xml)) !== null) {
      matches.push(m[1]);
    }
    return matches;
  }

  // Parse all features from GML response
  function parseFeaturesFromGML(xml, hazardType) {
    const features = [];
    // Extract gefahrenstufe values
    const levels = parseGMLTag(xml, 'ms:gefahrenstufe');
    const intensities = parseGMLTag(xml, 'ms:intensitaet');
    const periods = parseGMLTag(xml, 'ms:wiederkehrperiode');
    const cantons = parseGMLTag(xml, 'ms:kanton');

    const count = Math.max(levels.length, 1);
    for (let i = 0; i < count; i++) {
      if (levels.length === 0 && intensities.length === 0) break;
      features.push({
        hazard_type: hazardType,
        hazard_level: levels[i] || null,
        intensity: intensities[i] || null,
        return_period: periods[i] || null,
        canton: cantons[i] || null
      });
    }
    return features;
  }

  async function queryFeatureType(typeName, hazardType, lat, lon) {
    // BBOX for EPSG:4326: lat_min,lon_min,lat_max,lon_max,urn:ogc:def:crs:EPSG::4326
    const bbox = `${lat - BUFFER_DEG},${lon - BUFFER_DEG},${lat + BUFFER_DEG},${lon + BUFFER_DEG},urn:ogc:def:crs:EPSG::4326`;

    const params = new URLSearchParams({
      SERVICE: 'WFS',
      VERSION: '2.0.0',
      REQUEST: 'GetFeature',
      TYPENAMES: typeName,
      BBOX: bbox,
      COUNT: '50'
    });

    try {
      const resp = await fetch(`${BASE}?${params}`);
      if (!resp.ok) return [];
      const xml = await resp.text();
      return parseFeaturesFromGML(xml, hazardType);
    } catch (e) {
      return [];
    }
  }

  async function calculate(input) {
    const { latitude, longitude } = input;
    if (latitude == null || longitude == null) {
      return { error: 'latitude and longitude are required.' };
    }

    const lat = Number(latitude);
    const lon = Number(longitude);

    try {
      // Query all feature types in parallel
      const queryPromises = Object.entries(FEATURE_TYPES).map(
        ([hazardType, typeName]) => queryFeatureType(typeName, hazardType, lat, lon)
      );
      const results = await Promise.all(queryPromises);
      const hazard_zones = results.flat();

      if (hazard_zones.length === 0) {
        return {
          hazard_zones: [],
          message: 'No hazard zones found at this location.'
        };
      }

      return { hazard_zones };
    } catch (err) {
      return { error: 'Geodienste request failed: ' + err.message };
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
      // Respect server load – 500 ms between requests
      await new Promise(r => setTimeout(r, 500));
    }
    return results;
  }

  return { init, calculate, parseCSV, runBatch };
})();
