// ============================================================
// Wildfire Risk – USFS Wildfire Risk to Communities Engine
// Queries the USDA Forest Service ArcGIS ImageServer for wildfire
// risk data across the United States.
//
// Data source: USFS via GeoPlatform imagery services
//   https://imagery.geoplatform.gov/iipp/rest/services/Fire_Aviation/
//
// Available services (ImageServer):
//   - WHP:  Wildfire Hazard Potential (continuous 0-3000+)
//   - Burn: Burn Probability (CONUS)
//   - Risk: Conditional Risk to Potential Structures
//
// WHP value classification:
//   <1: Very Low, 1-500: Low, 501-1000: Moderate,
//   1001-2000: High, >2000: Very High
//
// Limitations:
//   - US coverage only (CONUS + Alaska + Hawaii)
//   - Raster resolution varies (typically 270m)
//   - Data is from the USFS 2020/2023 risk assessment cycle
//   - ImageServer/identify returns pixel values
//   - No API key required; public ArcGIS REST endpoints
// ============================================================

window.WildfireRisk = (function () {

  var BASE = 'https://imagery.geoplatform.gov/iipp/rest/services/Fire_Aviation';

  // Service endpoints (ImageServer) – migrated from apps.fs.usda.gov
  var SERVICES = {
    hazard:    BASE + '/USFS_EDW_RMRS_WildfireHazardPotentialContinuous/ImageServer',
    burn_prob: BASE + '/USFS_QWRA_BurnProbability_CONUS/ImageServer',
    risk:      BASE + '/USFS_EDW_RMRS_WRC_ConditionalRiskToPotentialStructures/ImageServer'
  };

  // WHP continuous value classification
  function classifyWHP(value) {
    if (value === null || value === undefined) return null;
    var v = Number(value);
    if (isNaN(v)) return null;
    if (v < 1)    return 'Very Low';
    if (v <= 500)  return 'Low';
    if (v <= 1000) return 'Moderate';
    if (v <= 2000) return 'High';
    return 'Very High';
  }

  function init(options) { return Promise.resolve(); }

  async function queryImageServer(serviceUrl, lat, lon) {
    // Use the identify endpoint with URL-encoded JSON geometry
    var geom = JSON.stringify({
      x: lon,
      y: lat,
      spatialReference: { wkid: 4326 }
    });

    var params = new URLSearchParams({
      geometry: geom,
      geometryType: 'esriGeometryPoint',
      returnGeometry: 'false',
      returnCatalogItems: 'false',
      f: 'json'
    });

    try {
      var resp = await fetch(serviceUrl + '/identify?' + params);
      if (!resp.ok) return null;
      var json = await resp.json();
      // ImageServer identify returns { value: "685", name: "Pixel" }
      if (json.value !== undefined && json.value !== 'NoData') {
        return Number(json.value);
      }
      // Some services return results in a different structure
      if (json.results && json.results.length) {
        var val = json.results[0].attributes
          ? json.results[0].attributes.Pixel_Value || json.results[0].attributes.value
          : null;
        return val !== null ? Number(val) : null;
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  function isInUS(lat, lon) {
    // Rough bounding box for CONUS + Alaska + Hawaii
    var conus = lat >= 24 && lat <= 50 && lon >= -125 && lon <= -66;
    var alaska = lat >= 51 && lat <= 72 && lon >= -180 && lon <= -129;
    var hawaii = lat >= 18 && lat <= 23 && lon >= -161 && lon <= -154;
    return conus || alaska || hawaii;
  }

  async function calculate(input) {
    var lat = input.latitude;
    var lon = input.longitude;

    if (!lat || !lon) return { error: 'latitude and longitude are required.' };
    if (!isInUS(lat, lon)) {
      return { error: 'Coordinates outside United States coverage.' };
    }

    // Query all ImageServer layers in parallel
    var queries = await Promise.all([
      queryImageServer(SERVICES.hazard, lat, lon),
      queryImageServer(SERVICES.burn_prob, lat, lon),
      queryImageServer(SERVICES.risk, lat, lon)
    ]);

    var whpVal      = queries[0];
    var burnProbVal = queries[1];
    var riskVal     = queries[2];

    return {
      wildfire_hazard_potential: {
        raw_value: whpVal,
        classification: classifyWHP(whpVal)
      },
      burn_probability: {
        raw_value: burnProbVal,
        probability: burnProbVal !== null
          ? Math.round(burnProbVal * 10000) / 10000
          : null
      },
      conditional_risk: {
        raw_value: riskVal
      },
      latitude: lat,
      longitude: lon,
      source: 'USFS Wildfire Risk (GeoPlatform Fire_Aviation ImageServer)',
      notes: 'Values are from USFS national risk assessment rasters at ~270m resolution.'
    };
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
