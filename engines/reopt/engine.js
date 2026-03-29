// ============================================================
// REopt v3 – API Wrapper Engine
// Queries NREL REopt API for optimal renewable energy system
// sizing (PV, battery, wind) and financial analysis.
// Requires free NREL API key: https://developer.nrel.gov/signup/
// Coverage: US locations (uses NREL utility rate + solar data).
// ============================================================

window.REopt = (function () {

  const BASE = 'https://developer.nrel.gov/api/reopt/v3';
  let apiKey = 'DEMO_KEY';
  const POLL_INTERVAL_MS = 2000;
  const MAX_POLLS = 90; // ~3 min max wait

  function init(options) {
    if (options && options.apiKey) apiKey = options.apiKey;
    return Promise.resolve();
  }

  function buildJobPayload(input) {
    const payload = {
      Settings: {},
      Site: {
        latitude: Number(input.latitude),
        longitude: Number(input.longitude)
      },
      ElectricLoad: {},
      PV: {},
      ElectricStorage: {}
    };

    // Optional load profile
    if (input.annual_kwh) {
      payload.ElectricLoad.annual_kwh = Number(input.annual_kwh);
    }
    if (input.doe_reference_name) {
      payload.ElectricLoad.doe_reference_name = input.doe_reference_name;
    }

    // Optional utility rate
    if (input.urdb_label) {
      payload.ElectricTariff = { urdb_label: input.urdb_label };
    } else if (input.blended_annual_rate) {
      payload.ElectricTariff = {
        blended_annual_energy_rate: Number(input.blended_annual_rate)
      };
    }

    return payload;
  }

  async function submitJob(payload) {
    const resp = await fetch(`${BASE}/job/?api_key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!resp.ok) {
      const text = await resp.text();
      throw new Error('Job submission failed: HTTP ' + resp.status + ' – ' + text);
    }
    const json = await resp.json();
    return json.run_uuid;
  }

  async function pollResults(runUuid) {
    for (let i = 0; i < MAX_POLLS; i++) {
      await new Promise(r => setTimeout(r, POLL_INTERVAL_MS));

      const resp = await fetch(
        `${BASE}/job/${runUuid}/results/?api_key=${apiKey}`
      );
      if (!resp.ok) continue;

      const json = await resp.json();
      const status = json.status || (json.outputs && json.outputs.Scenario && json.outputs.Scenario.status);

      if (status === 'optimal') return json;
      if (status === 'error' || status === 'infeasible') {
        throw new Error('REopt job failed with status: ' + status);
      }
      // Otherwise still running – continue polling
    }
    throw new Error('REopt job timed out after polling.');
  }

  async function calculate(input) {
    const { latitude, longitude } = input;
    if (latitude == null || longitude == null) {
      return { error: 'latitude and longitude are required.' };
    }

    try {
      const payload = buildJobPayload(input);
      const runUuid = await submitJob(payload);
      const json = await pollResults(runUuid);

      const outputs = json.outputs || {};
      const pv = outputs.PV || {};
      const batt = outputs.ElectricStorage || {};
      const fin = outputs.Financial || {};
      const site = outputs.Site || {};

      return {
        run_uuid: runUuid,
        pv_size_kw: pv.size_kw || null,
        battery_size_kw: batt.size_kw || null,
        battery_size_kwh: batt.size_kwh || null,
        npv_usd: fin.npv || fin.npv_us_dollars || null,
        annual_savings_usd: fin.annual_value_to_owner || null,
        renewable_fraction: site.renewable_electricity_fraction || null,
        lifecycle_co2_tonnes: site.lifecycle_emissions_tonnes_CO2 || null
      };
    } catch (err) {
      return { error: 'REopt error: ' + err.message };
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
      // REopt jobs are heavy; wait between submissions
      if (apiKey === 'DEMO_KEY') await new Promise(r => setTimeout(r, 5000));
      else await new Promise(r => setTimeout(r, 2000));
    }
    return results;
  }

  return { init, calculate, parseCSV, runBatch };
})();
