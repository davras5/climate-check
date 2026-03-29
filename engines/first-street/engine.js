// ============================================================
// First Street Foundation – API Wrapper Engine
// Queries the First Street API for property-level climate risk
// scores (flood, fire, wind, heat, air quality).
// Requires a paid API key: https://firststreet.org/api/
// Coverage: United States (property-level).
// ============================================================

window.FirstStreet = (function () {

  const BASE = 'https://api.firststreet.org/v1';
  let apiKey = '';

  function init(options) {
    if (options && options.apiKey) apiKey = options.apiKey;
    if (!apiKey) return Promise.reject(new Error('First Street API key is required.'));
    return Promise.resolve();
  }

  function headers() {
    return {
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + apiKey
    };
  }

  async function resolveFSID(address) {
    const resp = await fetch(
      `${BASE}/location/search?q=${encodeURIComponent(address)}&limit=1`,
      { headers: headers() }
    );
    if (!resp.ok) return null;
    const json = await resp.json();
    if (json && json.length > 0) return json[0].fsid;
    return null;
  }

  async function fetchFactor(fsid, factor) {
    const resp = await fetch(
      `${BASE}/property/${fsid}/${factor}`,
      { headers: headers() }
    );
    if (!resp.ok) return null;
    return resp.json();
  }

  async function calculate(input) {
    const { fsid, address } = input;
    let id = fsid;

    if (!id) {
      if (!address) return { error: 'Provide fsid or address.' };
      try {
        id = await resolveFSID(address);
        if (!id) return { error: 'Could not resolve address to FSID.' };
      } catch (err) {
        return { error: 'Address lookup failed: ' + err.message };
      }
    }

    try {
      const factors = ['flood', 'fire', 'wind', 'heat', 'air'];
      const fetches = factors.map(f => fetchFactor(id, f));
      const responses = await Promise.all(fetches);

      const result = { fsid: id };
      factors.forEach((f, i) => {
        const data = responses[i];
        if (data && data.riskFactor != null) {
          result[f + '_score'] = data.riskFactor; // 1-10
        } else if (data && data.score != null) {
          result[f + '_score'] = data.score;
        } else {
          result[f + '_score'] = null;
        }
      });

      return result;
    } catch (err) {
      return { error: 'First Street API error: ' + err.message };
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
      // Rate limit: ~2 req/sec recommended
      await new Promise(r => setTimeout(r, 600));
    }
    return results;
  }

  return { init, calculate, parseCSV, runBatch };
})();
