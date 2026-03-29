// ============================================================
// JRC Flood Maps – European Commission Flood Hazard Engine (STUB)
// Joint Research Centre Global Flood Awareness System (GloFAS)
// and European Flood Awareness System (EFAS) flood maps.
//
// Data sources:
//   - JRC Data Catalogue: https://data.jrc.ec.europa.eu/
//   - GloFAS/EFAS WMS: https://floods.jrc.ec.europa.eu/geoserver/wms
//   - GeoTIFF rasters for flood depth (various return periods)
//
// Approach:
//   The JRC flood maps are primarily distributed as GeoTIFF rasters
//   (not as a point-query REST API). Two approaches are possible:
//     1. WMS GetFeatureInfo — query the WMS for pixel values at a point
//     2. Pre-process GeoTIFF tiles and serve via a local tile server
//   This engine implements approach (1) using the JRC GeoServer WMS.
//
// Limitations:
//   - WMS GetFeatureInfo may not be enabled on all layers
//   - Global/European coverage depending on the dataset
//   - Flood depth rasters have varying resolution (~30m to ~1km)
//   - Return periods typically: 10yr, 20yr, 50yr, 100yr, 200yr, 500yr
//   - This is a STUB — the WMS endpoint may require adjustments
//     based on the exact layer names available on the GeoServer
// ============================================================

window.JrcFloodMaps = (function () {

  var WMS_BASE = 'https://floods.jrc.ec.europa.eu/geoserver/wms';

  // Known / expected WMS layer names (may need verification)
  var LAYERS = {
    flood_depth_100yr: 'jrc:flood_depth_100yr',
    flood_depth_10yr:  'jrc:flood_depth_10yr',
    flood_depth_500yr: 'jrc:flood_depth_500yr',
    flood_extent:      'jrc:flood_extent_100yr'
  };

  // Fallback layer names (GloFAS naming convention)
  var GLOFAS_LAYERS = {
    flood_depth_100yr: 'glofas:flood_depth_rp100',
    flood_depth_10yr:  'glofas:flood_depth_rp10',
    flood_depth_500yr: 'glofas:flood_depth_rp500'
  };

  var activeLayerSet = LAYERS;
  var customWmsBase = null;

  function init(options) {
    if (options && options.wmsBaseUrl) {
      customWmsBase = options.wmsBaseUrl;
    }
    if (options && options.layerSet === 'glofas') {
      activeLayerSet = GLOFAS_LAYERS;
    }
    return Promise.resolve();
  }

  async function getFeatureInfo(layerName, lat, lon) {
    // WMS GetFeatureInfo: query pixel value at a given lat/lon
    var base = customWmsBase || WMS_BASE;
    // We construct a small 1x1 pixel request around the point
    var delta = 0.0005; // ~50m at equator
    var bbox = [lon - delta, lat - delta, lon + delta, lat + delta].join(',');

    var params = new URLSearchParams({
      SERVICE: 'WMS',
      VERSION: '1.1.1',
      REQUEST: 'GetFeatureInfo',
      LAYERS: layerName,
      QUERY_LAYERS: layerName,
      INFO_FORMAT: 'application/json',
      SRS: 'EPSG:4326',
      BBOX: bbox,
      WIDTH: '1',
      HEIGHT: '1',
      X: '0',
      Y: '0'
    });

    try {
      var resp = await fetch(base + '?' + params);
      if (!resp.ok) {
        return { connected: false, value: null };
      }
      var json = await resp.json();
      if (json.features && json.features.length > 0) {
        var props = json.features[0].properties || {};
        // The pixel value key varies by layer; try common names
        var depth = props.GRAY_INDEX || props.pixel_value || props.value
                 || props.flood_depth || props.depth || null;
        return { connected: true, value: depth !== null ? Number(depth) : null };
      }
      // Valid response but no features = location not flooded
      return { connected: true, value: 0 };
    } catch (e) {
      return { connected: false, value: null };
    }
  }

  function buildStubResult(lat, lon) {
    return {
      _stub: true,
      _message: 'JRC Flood Maps WMS query did not return data. This may mean: ' +
                '(1) the WMS layer names need updating, (2) GetFeatureInfo is not ' +
                'enabled, or (3) no flood data exists at this location. ' +
                'Verify layer names at: ' + (customWmsBase || WMS_BASE) +
                '?SERVICE=WMS&REQUEST=GetCapabilities',
      flood_depth_10yr_m:  null,
      flood_depth_100yr_m: null,
      flood_depth_500yr_m: null,
      flooded_10yr:  null,
      flooded_100yr: null,
      flooded_500yr: null,
      latitude: lat,
      longitude: lon,
      dataset_source: 'JRC / GloFAS (not connected)',
      source: 'JRC Flood Hazard Maps (stub)'
    };
  }

  async function calculate(input) {
    var lat = input.latitude;
    var lon = input.longitude;
    var returnPeriod = input.return_period || null; // optional: query single period

    if (lat === undefined || lat === null || lon === undefined || lon === null) {
      return { error: 'latitude and longitude are required.' };
    }
    if (lat < -60 || lat > 85 || lon < -180 || lon > 180) {
      return { error: 'Coordinates out of valid range.' };
    }

    // Determine which return periods to query
    var periodsToQuery = {};
    if (returnPeriod) {
      var key = 'flood_depth_' + returnPeriod + 'yr';
      if (activeLayerSet[key]) {
        periodsToQuery[returnPeriod] = activeLayerSet[key];
      } else {
        return { error: 'Unknown return period: ' + returnPeriod + '. Use 10, 100, or 500.' };
      }
    } else {
      // Query all available return periods
      if (activeLayerSet.flood_depth_10yr)  periodsToQuery['10']  = activeLayerSet.flood_depth_10yr;
      if (activeLayerSet.flood_depth_100yr) periodsToQuery['100'] = activeLayerSet.flood_depth_100yr;
      if (activeLayerSet.flood_depth_500yr) periodsToQuery['500'] = activeLayerSet.flood_depth_500yr;
    }

    // Query all requested layers in parallel
    var entries = Object.entries(periodsToQuery);
    var results = await Promise.all(
      entries.map(function (entry) {
        return getFeatureInfo(entry[1], lat, lon);
      })
    );

    // Check if any query actually connected
    var anyConnected = results.some(function (r) { return r.connected; });
    if (!anyConnected) {
      return buildStubResult(lat, lon);
    }

    // Build output
    var output = {
      _stub: false,
      latitude: lat,
      longitude: lon
    };

    entries.forEach(function (entry, idx) {
      var period = entry[0];
      var depth = results[idx].value;
      output['flood_depth_' + period + 'yr_m'] = depth;
      output['flooded_' + period + 'yr'] = depth !== null && depth > 0;
    });

    output.dataset_source = 'JRC / GloFAS';
    output.source = 'JRC Flood Hazard Maps via WMS GetFeatureInfo';
    output.notes = 'Flood depth in metres for the indicated return period. ' +
                   'Resolution varies by dataset (30m–1km).';

    return output;
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
