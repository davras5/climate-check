// ============================================================
// ThinkHazard! – API Wrapper Engine
// Queries GFDRR ThinkHazard API for multi-hazard screening.
// No API key required. Global coverage (196 countries).
//
// The API requires an admin division code, not raw lat/lon.
// We use a 2-step approach:
//   1. Resolve lat/lon to an admin division via the search endpoint
//      (requires reverse-geocoding to a location name first)
//   2. Fetch hazard report for that division code
// ============================================================

window.ThinkHazard = (function () {

  const REPORT_BASE = 'https://thinkhazard.org/en/report';
  const ADMIN_SEARCH = 'https://thinkhazard.org/en/administrativedivision';

  const HAZARD_TYPES = {
    FL: 'river_flood',
    CF: 'coastal_flood',
    EQ: 'earthquake',
    LS: 'landslide',
    CY: 'cyclone',
    DG: 'drought',
    EH: 'extreme_heat',
    WF: 'wildfire',
    WS: 'water_scarcity',
    VO: 'volcano',
    TS: 'tsunami'
  };

  const LEVEL_MAP = {
    1: 'High', 2: 'Medium', 3: 'Low', 4: 'Very low'
  };

  function init() { return Promise.resolve(); }

  // Step 0: Reverse-geocode lat/lon to a place name using Nominatim
  async function reverseGeocode(lat, lon) {
    const resp = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=10`,
      { headers: { 'User-Agent': 'climate-check/1.0' } }
    );
    if (!resp.ok) return null;
    const json = await resp.json();
    // Try city/town/village, then county, then state
    const addr = json.address || {};
    return addr.city || addr.town || addr.village || addr.county || addr.state || json.display_name || null;
  }

  // Step 1: Search ThinkHazard admin divisions by location name
  async function resolveAdminDiv(lat, lon) {
    // First try the coordinate-based endpoint
    try {
      const resp = await fetch(`${REPORT_BASE}.json?lon=${lon}&lat=${lat}`);
      if (resp.ok) {
        const json = await resp.json();
        // If we get hazard data directly, return it with a special marker
        if (json && (Array.isArray(json) || json.hazard_categories)) {
          return { directData: json };
        }
      }
    } catch (e) {
      // Fall through to name-based search
    }

    // Fall back to reverse-geocode + name search
    const placeName = await reverseGeocode(lat, lon);
    if (!placeName) return null;

    try {
      const resp = await fetch(`${ADMIN_SEARCH}?q=${encodeURIComponent(placeName)}`);
      if (!resp.ok) return null;
      const json = await resp.json();
      if (json.data && json.data.length > 0) {
        return { code: json.data[0].code, name: json.data[0].name };
      }
      // Some responses may be a plain array
      if (Array.isArray(json) && json.length > 0) {
        return { code: json[0].code, name: json[0].name };
      }
    } catch (e) {
      // ignore
    }
    return null;
  }

  // Step 2: Get hazard report for an admin division code
  async function getHazards(adminCode) {
    // Build the report URL: /en/report/{code}.json
    const resp = await fetch(`${REPORT_BASE}/${adminCode}.json`);
    if (!resp.ok) return null;
    const json = await resp.json();
    return json;
  }

  async function calculate(input) {
    const { latitude, longitude, admin_code } = input;

    let hazards = null;

    if (admin_code) {
      hazards = await getHazards(admin_code);
    } else {
      if (!latitude || !longitude) return { error: 'Provide latitude/longitude or admin_code.' };

      const resolved = await resolveAdminDiv(latitude, longitude);
      if (!resolved) return { error: 'Could not resolve location to admin division.' };

      if (resolved.directData) {
        // We got hazard data directly from coordinate-based endpoint
        hazards = resolved.directData;
      } else {
        hazards = await getHazards(resolved.code);
      }
    }

    if (!hazards) return { error: 'No hazard data found.' };

    const result = {};
    // Initialize all to null
    Object.values(HAZARD_TYPES).forEach(f => { result[f] = null; });

    // Handle different response formats
    const hazardArray = Array.isArray(hazards)
      ? hazards
      : (hazards.hazard_categories || hazards.hazards || []);

    hazardArray.forEach(h => {
      const field = HAZARD_TYPES[h.hazardtype_code || h.type];
      if (field) result[field] = LEVEL_MAP[h.hazardlevel] || h.hazardlevel_name || h.level || null;
    });

    return result;
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
