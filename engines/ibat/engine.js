// ============================================================
// IBAT (Integrated Biodiversity Assessment Tool) – API Wrapper Engine
// Queries the IBAT API for biodiversity and protected area
// proximity screening around a given location.
// Requires a subscription API key: https://www.ibat-alliance.org/
// Coverage: Global (WDPA, KBA, IUCN Red List).
// ============================================================

window.IBAT = (function () {

  const BASE = 'https://api.ibat-alliance.org/v1';
  let apiKey = '';

  function init(options) {
    if (options && options.apiKey) apiKey = options.apiKey;
    if (!apiKey) return Promise.reject(new Error('IBAT API key is required.'));
    return Promise.resolve();
  }

  function authHeaders() {
    return {
      'Authorization': 'Token ' + apiKey,
      'Accept': 'application/json'
    };
  }

  async function calculate(input) {
    const { latitude, longitude, buffer_km } = input;
    if (latitude == null || longitude == null) {
      return { error: 'latitude and longitude are required.' };
    }

    const buffer = buffer_km || 10; // default 10 km buffer

    try {
      const resp = await fetch(
        `${BASE}/sites/proximity?lat=${latitude}&lon=${longitude}&buffer=${buffer}`,
        { headers: authHeaders() }
      );

      if (resp.status === 401 || resp.status === 403) {
        return { error: 'IBAT authentication failed. Check API key.' };
      }
      if (!resp.ok) return { error: 'IBAT API error: HTTP ' + resp.status };

      const json = await resp.json();
      const data = json.results || json;

      // Count protected areas and KBAs
      const protectedAreas = Array.isArray(data.protected_areas)
        ? data.protected_areas : [];
      const kbas = Array.isArray(data.key_biodiversity_areas)
        ? data.key_biodiversity_areas : [];
      const species = Array.isArray(data.species)
        ? data.species : [];

      // Determine IUCN threatened species counts
      const threatCategories = {};
      species.forEach(s => {
        const cat = s.iucn_category || s.category || 'Unknown';
        threatCategories[cat] = (threatCategories[cat] || 0) + 1;
      });

      return {
        buffer_km: buffer,
        protected_areas_count: protectedAreas.length,
        protected_areas: protectedAreas.slice(0, 10).map(pa => ({
          name: pa.name,
          designation: pa.designation || pa.desig,
          iucn_category: pa.iucn_category || null
        })),
        kba_count: kbas.length,
        kbas: kbas.slice(0, 10).map(k => ({
          name: k.name,
          criteria: k.criteria || null
        })),
        iucn_species_count: species.length,
        iucn_species_by_category: threatCategories,
        critical_habitat: data.critical_habitat || null,
        sensitivity: data.sensitivity || data.biodiversity_risk || null
      };
    } catch (err) {
      return { error: 'IBAT request failed: ' + err.message };
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
      // IBAT rate limit: be conservative
      await new Promise(r => setTimeout(r, 1000));
    }
    return results;
  }

  return { init, calculate, parseCSV, runBatch };
})();
