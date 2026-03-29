// ============================================================
// ERM-CH23 – Swiss Earthquake Risk Model Engine
// Queries seismic hazard data for Swiss locations via:
//   1. EFEHR (European Facilities for Earthquake Hazard and Risk)
//      platform web services at http://www.efehr.ch/en/web-services/
//   2. GeoAdmin layer ch.bafu.erdbeben-shakemlevel for ShakeMap
//   3. GeoAdmin identify for seismic hazard zone layers
//
// The ERM-CH23 model (successor to ERM-CH14) provides earthquake
// hazard and risk data for Switzerland and Liechtenstein.
//
// Limitations:
//   - EFEHR API availability can be intermittent
//   - Swiss coverage only (WGS84 lat 45.8–47.9, lon 5.9–10.5)
//   - Spectral acceleration values are for reference rock conditions
//   - Soil amplification must be applied separately based on soil class
//   - No API key required for GeoAdmin; EFEHR is public
// ============================================================

window.ErmCH23 = (function () {

  const GEOADMIN_BASE = 'https://api3.geo.admin.ch/rest/services/api/MapServer/identify';

  // GeoAdmin seismic layers
  const LAYERS = {
    seismic_zone:    'ch.bafu.erdbeben-baugrundklassen',
    shakemap:        'ch.bafu.erdbeben-shakemlevel',
    hazard_zones:    'ch.bafu.erdbeben-gefahrenzonen'
  };

  // SIA 261 seismic zone definitions for Switzerland
  const SIA_ZONES = {
    'Z1':  { pga_475yr_g: 0.06, description: 'Low hazard' },
    'Z2':  { pga_475yr_g: 0.10, description: 'Moderate hazard' },
    'Z3a': { pga_475yr_g: 0.13, description: 'Elevated hazard' },
    'Z3b': { pga_475yr_g: 0.16, description: 'High hazard' }
  };

  // SIA 261 soil classes and amplification factors
  const SOIL_CLASSES = {
    A: { description: 'Hard rock',                  factor: 1.0 },
    B: { description: 'Soft rock / dense deposit',  factor: 1.2 },
    C: { description: 'Dense to medium-dense soil', factor: 1.15 },
    D: { description: 'Loose to medium-dense soil', factor: 1.35 },
    E: { description: 'Shallow soft layer on rock',  factor: 1.4 },
    F: { description: 'Special investigation needed', factor: null }
  };

  // Spectral acceleration shape factors per SIA 261 (approximate)
  var SPECTRAL_SHAPE = {
    periods: [0, 0.1, 0.2, 0.5, 1.0, 2.0],
    factors: [1.0, 2.5, 2.5, 1.6, 0.8, 0.4]
  };

  function init(options) { return Promise.resolve(); }

  async function queryGeoAdmin(layerId, lat, lon) {
    var geom = JSON.stringify({ x: lon, y: lat, spatialReference: { wkid: 4326 } });
    var params = new URLSearchParams({
      geometryType: 'esriGeometryPoint',
      geometry: geom,
      layers: 'all:' + layerId,
      tolerance: '50',
      mapExtent: [lon - 0.01, lat - 0.01, lon + 0.01, lat + 0.01].join(','),
      imageDisplay: '1000,1000,96',
      returnGeometry: 'false',
      lang: 'en',
      sr: '4326'
    });
    var resp = await fetch(GEOADMIN_BASE + '?' + params);
    if (!resp.ok) return null;
    var json = await resp.json();
    if (!json.results || !json.results.length) return null;
    return json.results[0].attributes || null;
  }

  async function queryEFEHR(lat, lon) {
    // EFEHR web service for ERM-CH23 hazard curves
    // The EFEHR API exposes hazard/disaggregation endpoints
    try {
      var url = 'http://www.efehr.ch/api/hazard/spectra?' +
        'longitude=' + lon + '&latitude=' + lat +
        '&vs30=800&return_period=475&imt=PGA';
      var resp = await fetch(url, { signal: AbortSignal.timeout(8000) });
      if (!resp.ok) return null;
      return await resp.json();
    } catch (e) {
      // EFEHR may not be reachable or the endpoint may differ
      return null;
    }
  }

  function computeSpectralAcceleration(pgaG, period) {
    // Interpolate from the SIA 261 spectral shape
    var periods = SPECTRAL_SHAPE.periods;
    var factors = SPECTRAL_SHAPE.factors;
    if (period <= periods[0]) return pgaG * factors[0];
    if (period >= periods[periods.length - 1]) return pgaG * factors[factors.length - 1];
    for (var i = 0; i < periods.length - 1; i++) {
      if (period >= periods[i] && period <= periods[i + 1]) {
        var t = (period - periods[i]) / (periods[i + 1] - periods[i]);
        var factor = factors[i] + t * (factors[i + 1] - factors[i]);
        return pgaG * factor;
      }
    }
    return pgaG;
  }

  function parseSoilClass(attrs) {
    if (!attrs) return null;
    var raw = attrs.baugrundklasse || attrs.soil_class || attrs.BAUGRUNDKLASSE || '';
    var cls = String(raw).toUpperCase().trim();
    if (SOIL_CLASSES[cls]) return cls;
    // Try to extract letter from longer strings
    var match = cls.match(/([A-F])/);
    return match ? match[1] : null;
  }

  function parseSeismicZone(attrs) {
    if (!attrs) return null;
    var raw = attrs.zone || attrs.ZONE || attrs.erdbebenzone || '';
    var zone = String(raw).toUpperCase().trim();
    // Normalise: Z1, Z2, Z3a, Z3b
    if (/^Z?3\s*B/i.test(zone)) return 'Z3b';
    if (/^Z?3\s*A?/i.test(zone)) return 'Z3a';
    if (/^Z?2/i.test(zone)) return 'Z2';
    if (/^Z?1/i.test(zone)) return 'Z1';
    return zone || null;
  }

  async function calculate(input) {
    var lat = input.latitude;
    var lon = input.longitude;
    var period = input.spectral_period || 0;  // seconds; 0 = PGA
    var soilOverride = input.soil_class || null;

    if (!lat || !lon) return { error: 'latitude and longitude are required.' };
    if (lat < 45.8 || lat > 47.9 || lon < 5.9 || lon > 10.5) {
      return { error: 'Coordinates outside Switzerland / Liechtenstein.' };
    }

    // Query GeoAdmin layers and EFEHR in parallel
    var results = await Promise.all([
      queryGeoAdmin(LAYERS.seismic_zone, lat, lon),
      queryGeoAdmin(LAYERS.hazard_zones, lat, lon),
      queryGeoAdmin(LAYERS.shakemap, lat, lon),
      queryEFEHR(lat, lon)
    ]);

    var soilAttrs = results[0];
    var zoneAttrs = results[1];
    var shakeAttrs = results[2];
    var efehrData = results[3];

    // Determine seismic zone
    var seismicZone = parseSeismicZone(zoneAttrs);
    var zoneInfo = seismicZone ? SIA_ZONES[seismicZone] : null;

    // Determine soil class
    var soilClass = soilOverride || parseSoilClass(soilAttrs);
    var soilInfo = soilClass ? SOIL_CLASSES[soilClass] : null;

    // Base PGA from zone
    var pgaRock = zoneInfo ? zoneInfo.pga_475yr_g : null;

    // If EFEHR returned data, prefer it
    if (efehrData && efehrData.pga) {
      pgaRock = efehrData.pga;
    }

    // Apply soil amplification
    var pgaSite = pgaRock;
    if (pgaRock !== null && soilInfo && soilInfo.factor) {
      pgaSite = pgaRock * soilInfo.factor;
    }

    // Compute spectral acceleration at requested period
    var sa = null;
    if (pgaSite !== null) {
      sa = computeSpectralAcceleration(pgaSite, period);
    }

    // ShakeMap info (recent events)
    var shakemapLevel = shakeAttrs ? (shakeAttrs.intensity || shakeAttrs.INTENSITY || null) : null;

    return {
      seismic_zone: seismicZone,
      zone_description: zoneInfo ? zoneInfo.description : null,
      pga_rock_g: pgaRock,
      soil_class: soilClass,
      soil_description: soilInfo ? soilInfo.description : null,
      soil_amplification: soilInfo ? soilInfo.factor : null,
      pga_site_g: pgaSite !== null ? Math.round(pgaSite * 1000) / 1000 : null,
      spectral_period_s: period,
      spectral_acceleration_g: sa !== null ? Math.round(sa * 1000) / 1000 : null,
      shakemap_intensity: shakemapLevel,
      efehr_available: efehrData !== null,
      source: 'GeoAdmin BAFU + EFEHR ERM-CH23',
      notes: 'PGA values are for 475-year return period per SIA 261.'
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
