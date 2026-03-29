// ============================================================
// KBOB LCA Data – API Wrapper Engine
// Queries the Swiss KBOB/ecobau life-cycle assessment database
// via lcadata.ch for construction material environmental impacts.
// No API key required; public endpoint.
// Coverage: Swiss construction materials (DE/FR labels).
// ============================================================

window.KbobLCA = (function () {

  const BASE = 'https://lcadata.ch/api/v1';

  function init() { return Promise.resolve(); }

  async function calculate(input) {
    const { material_id, search, language } = input;

    try {
      let url;
      if (material_id) {
        url = `${BASE}/materials/${material_id}`;
      } else if (search) {
        url = `${BASE}/materials?search=${encodeURIComponent(search)}`;
        if (language) url += `&language=${encodeURIComponent(language)}`;
      } else {
        return { error: 'Provide material_id or search query.' };
      }

      const resp = await fetch(url, {
        headers: { 'Accept': 'application/json' }
      });
      if (!resp.ok) return { error: 'KBOB API error: HTTP ' + resp.status };

      const json = await resp.json();

      // Single material by ID
      if (material_id) {
        return formatMaterial(json);
      }

      // Search results: return array
      const items = Array.isArray(json) ? json : (json.results || json.data || []);
      if (items.length === 0) {
        return { results: [], message: 'No materials found for query: ' + search };
      }

      return {
        count: items.length,
        results: items.slice(0, 20).map(formatMaterial)
      };
    } catch (err) {
      return { error: 'KBOB request failed: ' + err.message };
    }
  }

  function formatMaterial(m) {
    return {
      id: m.id || m.uuid || null,
      name_de: m.name_de || m.nameDE || m.name || null,
      name_fr: m.name_fr || m.nameFR || null,
      gwp_kgco2eq: m.gwp || m.GWP || m.gwp_total || null,
      primary_energy_mj: m.primary_energy || m.penrt || m.pe_total || null,
      ubp: m.ubp || m.UBP || m.ubp_total || null,
      unit: m.unit || m.functional_unit || null,
      density_kg_m3: m.density || m.rohdichte || null,
      category: m.category || m.group || null
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
      // Polite delay for public API
      await new Promise(r => setTimeout(r, 500));
    }
    return results;
  }

  return { init, calculate, parseCSV, runBatch };
})();
