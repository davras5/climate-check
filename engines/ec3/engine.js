// ============================================================
// EC3 (Embodied Carbon in Construction Calculator) – API Wrapper Engine
// Queries the Building Transparency EC3 API for Environmental
// Product Declaration (EPD) statistics on construction materials.
// Requires a free API token: https://buildingtransparency.org/
// Coverage: Global EPD database.
// ============================================================

window.EC3 = (function () {

  const BASE = 'https://buildingtransparency.org/api';
  let apiToken = '';

  function init(options) {
    if (options && options.apiToken) apiToken = options.apiToken;
    if (options && options.apiKey) apiToken = options.apiKey;
    if (!apiToken) return Promise.reject(new Error('EC3 API token is required.'));
    return Promise.resolve();
  }

  function authHeaders() {
    return {
      'Authorization': 'Bearer ' + apiToken,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };
  }

  async function calculate(input) {
    const { category, country, postal_code, material_name } = input;

    if (!category && !material_name) {
      return { error: 'Provide category or material_name.' };
    }

    try {
      const params = new URLSearchParams();
      if (category) params.set('category', category);
      if (country) params.set('country', country);
      if (postal_code) params.set('postal_code', postal_code);
      if (material_name) params.set('search', material_name);

      const resp = await fetch(
        `${BASE}/materials?${params}`,
        { headers: authHeaders() }
      );

      if (resp.status === 401 || resp.status === 403) {
        return { error: 'EC3 authentication failed. Check API token.' };
      }
      if (!resp.ok) return { error: 'EC3 API error: HTTP ' + resp.status };

      const json = await resp.json();
      const items = Array.isArray(json) ? json : (json.results || json.data || []);

      if (items.length === 0) {
        return {
          epd_count: 0,
          message: 'No EPDs found for the given filters.'
        };
      }

      // Collect GWP values and compute statistics
      const gwpValues = items
        .map(item => item.gwp || item.gwp_per_unit || item.declared_unit_gwp)
        .filter(v => v != null && !isNaN(v))
        .sort((a, b) => a - b);

      const percentile = (arr, p) => {
        if (arr.length === 0) return null;
        const idx = (p / 100) * (arr.length - 1);
        const lo = Math.floor(idx);
        const hi = Math.ceil(idx);
        if (lo === hi) return arr[lo];
        return arr[lo] + (arr[hi] - arr[lo]) * (idx - lo);
      };

      const unit = items[0].declared_unit || items[0].unit || null;

      return {
        epd_count: items.length,
        gwp_median: percentile(gwpValues, 50),
        gwp_20th: percentile(gwpValues, 20),
        gwp_80th: percentile(gwpValues, 80),
        gwp_min: gwpValues.length > 0 ? gwpValues[0] : null,
        gwp_max: gwpValues.length > 0 ? gwpValues[gwpValues.length - 1] : null,
        unit: unit,
        best_practice: percentile(gwpValues, 20),
        category: category || null,
        country: country || null
      };
    } catch (err) {
      return { error: 'EC3 request failed: ' + err.message };
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
      // Rate limit: ~2 req/sec
      await new Promise(r => setTimeout(r, 600));
    }
    return results;
  }

  return { init, calculate, parseCSV, runBatch };
})();
