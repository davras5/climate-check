// ============================================================
// Naturgefahren-Check – Combined Natural Hazard Assessment Engine
// Replicates the VKF (Vereinigung Kantonaler Feuerversicherungen)
// Naturgefahren-Check by combining:
//   1. GeoAdmin BAFU hazard indication layers (federal)
//   2. geodienste.ch WFS for cantonal hazard data
//   3. Additional hail (ch.bafu.gefahren-hagel) and earthquake
//      (ch.bafu.erdbeben) layers from GeoAdmin
//
// Limitations:
//   - Swiss coordinates only (WGS84 lat 45.8–47.9, lon 5.9–10.5)
//   - GeoAdmin layers are indicative, not legally binding
//   - Cantonal data availability varies by canton
//   - No API key required for GeoAdmin; geodienste.ch may require
//     registration for some cantons
// ============================================================

window.NaturgefahrenCheck = (function () {

  const GEOADMIN_BASE = 'https://api3.geo.admin.ch/rest/services/api/MapServer/identify';
  const GEODIENSTE_WFS = 'https://geodienste.ch/db/naturgefahren_v2';

  // Federal hazard indication layers (BAFU)
  const HAZARD_LAYERS = {
    flood:       'ch.bafu.gefahren-hochwasser',
    landslide:   'ch.bafu.gefahren-rutschungen',
    avalanche:   'ch.bafu.gefahren-lawinen',
    rockfall:    'ch.bafu.gefahren-sturz',
    debris_flow: 'ch.bafu.gefahren-murgaenge',
    hail:        'ch.bafu.gefahren-hagel',
    earthquake:  'ch.bafu.erdbeben'
  };

  // Seismic zone mapping from GeoAdmin earthquake layer
  const SEISMIC_ZONES = {
    1: { zone: 'Z1', label: 'Low',       pga_g: 0.06 },
    2: { zone: 'Z2', label: 'Moderate',  pga_g: 0.10 },
    3: { zone: 'Z3a', label: 'High',     pga_g: 0.13 },
    4: { zone: 'Z3b', label: 'Very High', pga_g: 0.16 }
  };

  const LEVEL_MAP = {
    1: 'Low', 2: 'Medium', 3: 'High', 4: 'Very High',
    'gering': 'Low', 'mittel': 'Medium', 'erheblich': 'High', 'gross': 'Very High',
    'residual': 'Residual', 'resgefahr': 'Residual'
  };

  // Protection-measure recommendations based on hazard type and level
  const PROTECTION_MEASURES = {
    flood: {
      Low:       ['Check drainage paths', 'Basic waterproofing'],
      Medium:    ['Flood barriers for openings', 'Backwater valves', 'Elevated utilities'],
      High:      ['Structural flood protection', 'Raised ground floor', 'Flood-resistant materials'],
      'Very High': ['Avoid building in zone', 'Major structural protection', 'Consult cantonal authority']
    },
    hail: {
      Low:       ['Standard building materials sufficient'],
      Medium:    ['Hail-resistant roof covering (HW3+)', 'Protected facade cladding'],
      High:      ['Hail-resistant materials HW4+', 'Laminated safety glass', 'Protected solar panels'],
      'Very High': ['Maximum hail protection HW5', 'Impact-rated glazing', 'Protected HVAC equipment']
    },
    earthquake: {
      Low:       ['Standard SIA 261 compliance'],
      Medium:    ['SIA 261 seismic design', 'Non-structural element bracing'],
      High:      ['Enhanced seismic design', 'Base isolation consideration', 'Expert structural review'],
      'Very High': ['Full seismic engineering', 'Base isolation recommended', 'Specialist geotechnical study']
    },
    storm: {
      Low:       ['Standard wind load design per SIA 261'],
      Medium:    ['Reinforced roof connections', 'Impact-resistant glazing'],
      High:      ['Enhanced wind bracing', 'Storm shutters', 'Debris-resistant envelope'],
      'Very High': ['Maximum wind load design', 'Safe room consideration']
    }
  };

  function init(options) { return Promise.resolve(); }

  async function queryGeoAdminLayer(layerId, lat, lon, tolerance) {
    const geom = JSON.stringify({ x: lon, y: lat, spatialReference: { wkid: 4326 } });
    const params = new URLSearchParams({
      geometryType: 'esriGeometryPoint',
      geometry: geom,
      layers: 'all:' + layerId,
      tolerance: String(tolerance || 50),
      mapExtent: [lon - 0.01, lat - 0.01, lon + 0.01, lat + 0.01].join(','),
      imageDisplay: '1000,1000,96',
      returnGeometry: 'false',
      lang: 'en',
      sr: '4326'
    });
    const resp = await fetch(GEOADMIN_BASE + '?' + params);
    if (!resp.ok) return null;
    const json = await resp.json();
    if (!json.results || !json.results.length) return null;
    return json.results[0].attributes || null;
  }

  async function queryCantonalWFS(lat, lon) {
    // geodienste.ch WFS query for cantonal hazard data
    // Some cantons require authentication; this attempts the public endpoint
    try {
      const params = new URLSearchParams({
        SERVICE: 'WFS',
        VERSION: '2.0.0',
        REQUEST: 'GetFeature',
        TYPENAMES: 'naturgefahren_v2:gefahrenkarte',
        SRSNAME: 'EPSG:4326',
        BBOX: [lat - 0.001, lon - 0.001, lat + 0.001, lon + 0.001].join(',') + ',EPSG:4326',
        OUTPUTFORMAT: 'application/json',
        COUNT: '10'
      });
      const resp = await fetch(GEODIENSTE_WFS + '?' + params);
      if (!resp.ok) return null;
      const json = await resp.json();
      if (!json.features || !json.features.length) return null;
      return json.features.map(function (f) { return f.properties; });
    } catch (e) {
      return null;
    }
  }

  function parseHazardLevel(attrs) {
    if (!attrs) return null;
    var raw = attrs.intensitaet || attrs.hazard_level || attrs.INTENSITAET
           || attrs.description || '';
    return LEVEL_MAP[raw] || LEVEL_MAP[String(raw).toLowerCase()] || raw || null;
  }

  function parseHailSize(attrs) {
    if (!attrs) return null;
    // Hail layer returns grain size in cm for various return periods
    return {
      hail_size_50yr_cm: Number(attrs.hagelgroesse_50) || null,
      hail_size_100yr_cm: Number(attrs.hagelgroesse_100) || null,
      hagelzone: attrs.hagelzone || null
    };
  }

  function parseEarthquake(attrs) {
    if (!attrs) return null;
    var zoneNum = Number(attrs.zone || attrs.ZONE) || null;
    var info = SEISMIC_ZONES[zoneNum] || null;
    return {
      seismic_zone: info ? info.zone : (attrs.zone || null),
      seismic_label: info ? info.label : null,
      pga_g: info ? info.pga_g : null
    };
  }

  function deriveOverallRisk(results) {
    var levels = ['Very High', 'High', 'Medium', 'Low', null];
    var worst = null;
    var dominated_by = null;
    Object.keys(results).forEach(function (k) {
      if (typeof results[k] === 'string' && levels.indexOf(results[k]) !== -1) {
        if (worst === null || levels.indexOf(results[k]) < levels.indexOf(worst)) {
          worst = results[k];
          dominated_by = k.replace('_hazard', '').replace('_risk', '');
        }
      }
    });
    return { overall_risk: worst || 'No data', dominated_by: dominated_by };
  }

  function getMeasures(hazardType, level) {
    var bucket = PROTECTION_MEASURES[hazardType];
    if (!bucket) return [];
    return bucket[level] || bucket['Low'] || [];
  }

  async function calculate(input) {
    var lat = input.latitude;
    var lon = input.longitude;
    var tolerance = input.tolerance || 50;

    if (!lat || !lon) return { error: 'latitude and longitude are required.' };
    if (lat < 45.8 || lat > 47.9 || lon < 5.9 || lon > 10.5) {
      return { error: 'Coordinates outside Switzerland.' };
    }

    var results = {};
    var promises = [];

    // Query all federal hazard layers
    Object.keys(HAZARD_LAYERS).forEach(function (key) {
      var layerId = HAZARD_LAYERS[key];
      promises.push(
        queryGeoAdminLayer(layerId, lat, lon, tolerance).then(function (attrs) {
          if (key === 'hail') {
            var hail = parseHailSize(attrs);
            results.hail_details = hail;
            results.hail_hazard = hail && hail.hagelzone ? 'Medium' : (attrs ? 'Low' : null);
          } else if (key === 'earthquake') {
            var eq = parseEarthquake(attrs);
            results.earthquake_details = eq;
            results.earthquake_risk = eq ? eq.seismic_label : null;
          } else {
            results[key + '_hazard'] = parseHazardLevel(attrs);
          }
        }).catch(function () {
          results[key + '_hazard'] = null;
        })
      );
    });

    // Query cantonal data in parallel
    promises.push(
      queryCantonalWFS(lat, lon).then(function (cantonal) {
        results.cantonal_data_available = cantonal !== null;
        if (cantonal && cantonal.length) {
          results.cantonal_hazard_count = cantonal.length;
        }
      }).catch(function () {
        results.cantonal_data_available = false;
      })
    );

    await Promise.all(promises);

    // Storm risk (not in a dedicated BAFU layer; use hail as proxy)
    results.storm_hazard = results.hail_hazard || null;

    // Derive overall risk
    var overall = deriveOverallRisk(results);
    results.overall_risk = overall.overall_risk;
    results.dominated_by = overall.dominated_by;

    // Collect protection measures
    var measures = [];
    var hazardKeys = ['flood', 'hail', 'earthquake', 'storm'];
    hazardKeys.forEach(function (h) {
      var level = results[h + '_hazard'] || results[h + '_risk'];
      if (level) {
        var m = getMeasures(h, level);
        if (m.length) measures.push({ hazard: h, level: level, measures: m });
      }
    });
    results.protection_measures = measures;
    results.source = 'GeoAdmin BAFU + geodienste.ch';

    return results;
  }

  function parseCSV(csvText) {
    var lines = csvText.trim().split('\n');
    var headers = lines[0].split(',').map(function (h) { return h.trim(); });
    return lines.slice(1).filter(function (l) { return l.trim(); }).map(function (line) {
      var vals = line.split(',').map(function (v) { return v.trim(); });
      var row = {};
      headers.forEach(function (h, i) { row[h] = isNaN(vals[i]) ? vals[i] : Number(vals[i]); });
      return row;
    });
  }

  async function runBatch(csvText) {
    var rows = parseCSV(csvText);
    var results = [];
    for (var i = 0; i < rows.length; i++) {
      var result = await calculate(rows[i]);
      results.push(Object.assign({}, rows[i], result));
    }
    return results;
  }

  return { init, calculate, parseCSV, runBatch };
})();
