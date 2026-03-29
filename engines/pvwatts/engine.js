// ============================================================
// PVWatts v8 – API Wrapper Engine
// Queries NREL PVWatts API for solar PV energy estimation.
// Requires free NREL API key: https://developer.nrel.gov/signup/
// Global coverage via NSRDB + TMY data.
// ============================================================

window.PVWatts = (function () {

  const BASE = 'https://developer.nrel.gov/api/pvwatts/v8.json';
  let apiKey = 'DEMO_KEY'; // Replace with real key for production

  function init(options) {
    if (options && options.apiKey) apiKey = options.apiKey;
    return Promise.resolve();
  }

  async function calculate(input) {
    const { latitude, longitude, system_capacity_kw } = input;
    if (!latitude || !longitude) return { error: 'latitude and longitude are required.' };
    if (!system_capacity_kw) return { error: 'system_capacity_kw is required.' };

    const params = new URLSearchParams({
      api_key: apiKey,
      lat: String(latitude),
      lon: String(longitude),
      system_capacity: String(system_capacity_kw),
      module_type: String(input.module_type ?? 0),
      array_type: String(input.array_type ?? 1),
      tilt: String(input.tilt ?? latitude),
      azimuth: String(input.azimuth ?? 180),
      losses: String(input.losses ?? 14.08)
    });

    const resp = await fetch(`${BASE}?${params}`);
    if (!resp.ok) return { error: 'NREL API error: ' + resp.status };
    const json = await resp.json();

    if (json.errors && json.errors.length)
      return { error: json.errors.join('; ') };

    const o = json.outputs;
    return {
      ac_annual_kwh: o.ac_annual,
      ac_monthly_kwh: o.ac_monthly,
      solrad_annual: o.solrad_annual,
      solrad_monthly: o.solrad_monthly,
      capacity_factor: o.capacity_factor
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
      // NREL rate limit: 1 req/sec on DEMO_KEY
      if (apiKey === 'DEMO_KEY') await new Promise(r => setTimeout(r, 1100));
    }
    return results;
  }

  return { init, calculate, parseCSV, runBatch };
})();
