// ============================================================
// WRI Aqueduct – Water Risk Atlas Engine (STUB)
// World Resources Institute Aqueduct Water Risk Atlas
//
// Data source: https://www.wri.org/applications/aqueduct/water-risk-atlas/
//
// Approach & Limitations:
//   - WRI Aqueduct does NOT provide a public REST API for point queries.
//   - The Water Risk Atlas web app makes internal API calls to an ArcGIS
//     MapServer. The endpoints can be discovered by inspecting network
//     traffic on the atlas page (e.g., FeatureServer/query).
//   - Alternative approaches:
//       a) Download Aqueduct 4.0 GeoTIFF rasters and do local spatial join
//       b) Download the shapefile/GeoJSON from WRI Data Downloads and
//          perform point-in-polygon queries client-side
//       c) Use the ArcGIS FeatureServer endpoint (undocumented, may change)
//   - This engine is implemented as a STUB: the code structure is complete,
//     but actual API calls return sample/placeholder data with clear
//     "not yet connected" indicators.
//   - Global coverage (land only)
//
// To connect for real:
//   1. Inspect network requests at the atlas URL above
//   2. Find the MapServer/FeatureServer URL (typically an Esri service)
//   3. Replace the stub fetch in queryAqueduct() with the real endpoint
// ============================================================

window.WriAqueduct = (function () {

  // Placeholder — replace with the real ArcGIS FeatureServer URL
  var FEATURE_SERVER = 'https://services.arcgis.com/placeholder/AqueductWaterRisk/FeatureServer/0/query';

  // Aqueduct risk categories
  var RISK_LEVELS = {
    0: 'Low',
    1: 'Low-Medium',
    2: 'Medium-High',
    3: 'High',
    4: 'Extremely High'
  };

  // Aqueduct 4.0 indicator descriptions
  var INDICATORS = {
    bws:  'Baseline Water Stress',
    bwd:  'Baseline Water Depletion',
    iav:  'Interannual Variability',
    sev:  'Seasonal Variability',
    drr:  'Drought Risk',
    rfr:  'Riverine Flood Risk',
    cfr:  'Coastal Flood Risk',
    ucw:  'Unimproved/No Drinking Water',
    usa:  'Unimproved/No Sanitation',
    udw:  'Upstream Storage',
    rri:  'Regulatory & Reputational Risk',
    gtd:  'Groundwater Table Declining Trend'
  };

  var connected = false;

  function init(options) {
    if (options && options.featureServerUrl) {
      FEATURE_SERVER = options.featureServerUrl;
      connected = true;
    }
    return Promise.resolve();
  }

  async function queryAqueduct(lat, lon) {
    if (!connected) {
      // STUB: return null to indicate no real connection
      return null;
    }

    try {
      var params = new URLSearchParams({
        geometry: JSON.stringify({ x: lon, y: lat, spatialReference: { wkid: 4326 } }),
        geometryType: 'esriGeometryPoint',
        spatialRel: 'esriSpatialRelIntersects',
        outFields: '*',
        returnGeometry: 'false',
        f: 'json'
      });
      var resp = await fetch(FEATURE_SERVER + '?' + params);
      if (!resp.ok) return null;
      var json = await resp.json();
      if (!json.features || !json.features.length) return null;
      return json.features[0].attributes;
    } catch (e) {
      return null;
    }
  }

  function riskLabel(score) {
    if (score === null || score === undefined) return null;
    var idx = Math.min(4, Math.max(0, Math.round(score)));
    return RISK_LEVELS[idx];
  }

  function buildSampleData(lat, lon) {
    // Returns clearly-labelled sample data so downstream consumers
    // know this is not a real query result.
    return {
      _stub: true,
      _message: 'WRI Aqueduct is not yet connected. Values below are sample placeholders. ' +
                'Provide a featureServerUrl via init() to enable live queries.',
      overall_water_risk:       { score: null, label: null },
      baseline_water_stress:    { score: null, label: null },
      baseline_water_depletion: { score: null, label: null },
      interannual_variability:  { score: null, label: null },
      seasonal_variability:     { score: null, label: null },
      drought_risk:             { score: null, label: null },
      riverine_flood_risk:      { score: null, label: null },
      coastal_flood_risk:       { score: null, label: null },
      groundwater_decline:      { score: null, label: null },
      regulatory_risk:          { score: null, label: null },
      latitude: lat,
      longitude: lon,
      source: 'WRI Aqueduct 4.0 (stub – not connected)'
    };
  }

  function formatAttributes(attrs) {
    // Map raw ArcGIS attributes to a clean output
    return {
      _stub: false,
      overall_water_risk: {
        score: attrs.w_awr_def_tot_cat,
        label: riskLabel(attrs.w_awr_def_tot_cat)
      },
      baseline_water_stress: {
        score: attrs.bws_cat,
        label: riskLabel(attrs.bws_cat)
      },
      baseline_water_depletion: {
        score: attrs.bwd_cat,
        label: riskLabel(attrs.bwd_cat)
      },
      interannual_variability: {
        score: attrs.iav_cat,
        label: riskLabel(attrs.iav_cat)
      },
      seasonal_variability: {
        score: attrs.sev_cat,
        label: riskLabel(attrs.sev_cat)
      },
      drought_risk: {
        score: attrs.drr_cat,
        label: riskLabel(attrs.drr_cat)
      },
      riverine_flood_risk: {
        score: attrs.rfr_cat,
        label: riskLabel(attrs.rfr_cat)
      },
      coastal_flood_risk: {
        score: attrs.cfr_cat,
        label: riskLabel(attrs.cfr_cat)
      },
      groundwater_decline: {
        score: attrs.gtd_cat,
        label: riskLabel(attrs.gtd_cat)
      },
      regulatory_risk: {
        score: attrs.rri_cat,
        label: riskLabel(attrs.rri_cat)
      },
      source: 'WRI Aqueduct 4.0'
    };
  }

  async function calculate(input) {
    var lat = input.latitude;
    var lon = input.longitude;

    if (lat === undefined || lat === null || lon === undefined || lon === null) {
      return { error: 'latitude and longitude are required.' };
    }
    if (lat < -60 || lat > 85 || lon < -180 || lon > 180) {
      return { error: 'Coordinates out of valid range.' };
    }

    var attrs = await queryAqueduct(lat, lon);
    if (!attrs) {
      return buildSampleData(lat, lon);
    }
    var result = formatAttributes(attrs);
    result.latitude = lat;
    result.longitude = lon;
    return result;
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
