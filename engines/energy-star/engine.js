// ============================================================
// ENERGY STAR Portfolio Manager – API Wrapper Engine
// Queries the EPA ENERGY STAR Portfolio Manager web services
// for building energy performance metrics.
// Requires an EPA Portfolio Manager account (basic auth).
// Coverage: US commercial buildings with Portfolio Manager IDs.
// Docs: https://portfoliomanager.energystar.gov/webservices/home
// ============================================================

window.EnergyStar = (function () {

  const BASE = 'https://portfoliomanager.energystar.gov/ws';
  let username = '';
  let password = '';

  function init(options) {
    if (options && options.username) username = options.username;
    if (options && options.password) password = options.password;
    if (!username || !password) {
      return Promise.reject(new Error('EPA Portfolio Manager username and password are required.'));
    }
    return Promise.resolve();
  }

  function authHeaders() {
    const encoded = btoa(username + ':' + password);
    return {
      'Authorization': 'Basic ' + encoded,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };
  }

  async function calculate(input) {
    const { property_id, year, month } = input;
    if (!property_id) return { error: 'property_id is required.' };

    const period = year && month
      ? `?year=${year}&month=${month}`
      : '';

    try {
      const resp = await fetch(
        `${BASE}/property/${property_id}/metrics${period}`,
        { headers: authHeaders() }
      );
      if (resp.status === 401) return { error: 'Authentication failed. Check EPA credentials.' };
      if (!resp.ok) return { error: 'Portfolio Manager API error: HTTP ' + resp.status };

      const json = await resp.json();
      const metrics = json.metric || json.propertyMetrics || json;

      // Extract key metrics from response structure
      const findMetric = (name) => {
        if (Array.isArray(metrics)) {
          const m = metrics.find(x => x.name === name || x.metricName === name);
          return m ? (m.value || m.metricValue || null) : null;
        }
        return metrics[name] || null;
      };

      return {
        property_id: property_id,
        score: findMetric('score') || findMetric('ENERGY STAR Score'),
        site_eui_kbtu_ft2: findMetric('siteEUI') || findMetric('Site EUI (kBtu/ft²)'),
        source_eui_kbtu_ft2: findMetric('sourceEUI') || findMetric('Source EUI (kBtu/ft²)'),
        ghg_emissions_mtco2e: findMetric('totalGHGEmissions') || findMetric('Total GHG Emissions (MtCO2e)'),
        property_type: findMetric('primaryFunction') || findMetric('Property Type')
      };
    } catch (err) {
      return { error: 'Portfolio Manager request failed: ' + err.message };
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
      // EPA rate limit: be conservative, 1 req/sec
      await new Promise(r => setTimeout(r, 1000));
    }
    return results;
  }

  return { init, calculate, parseCSV, runBatch };
})();
