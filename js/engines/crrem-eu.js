// ============================================================
// CRREM EU Calculation Engine
// Pure calculation + CSV parsing. No DOM, no rendering.
// Loaded dynamically by app.js when user opens this model.
// ============================================================

window.CrremEU = (function () {

  let DB = null;
  const YEARS = [];
  for (let y = 2020; y <= 2050; y++) YEARS.push(y);

  // --- SQL helpers ---
  function queryAll(sql, params) {
    const stmt = DB.prepare(sql); stmt.bind(params || []);
    const rows = []; while (stmt.step()) rows.push(stmt.getAsObject()); stmt.free(); return rows;
  }
  function queryOne(sql, params) { const r = queryAll(sql, params); return r[0] || null; }
  function queryCol(sql, params) {
    const stmt = DB.prepare(sql); stmt.bind(params || []);
    const v = []; while (stmt.step()) v.push(stmt.get()[0]); stmt.free(); return v;
  }

  // --- Init: load the .db file ---
  async function init(dbPath) {
    const sqlPromise = initSqlJs({
      locateFile: f => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.11.0/${f}`
    });
    const [SQL, buf] = await Promise.all([sqlPromise, fetch(dbPath).then(r => r.arrayBuffer())]);
    DB = new SQL.Database(new Uint8Array(buf));
  }

  // --- Fuel EF cache ---
  let _fuelEFs = null;
  function fuelEFs() {
    if (!_fuelEFs) { _fuelEFs = {}; queryAll('SELECT fuel, ef FROM fuel_ef').forEach(r => { _fuelEFs[r.fuel] = r.ef; }); }
    return _fuelEFs;
  }

  // --- Core calculation ---
  function calculate(asset) {
    const cc = asset.country, pt = asset.propertyType;
    const reportYear = asset.reportingYear, yearIdx = reportYear - 2020;
    const floorArea = asset.floorArea, vacantArea = asset.vacantArea || 0;
    const occ = floorArea > 0 ? floorArea / (floorArea - vacantArea) : 1;

    const gridEFs = queryCol('SELECT ef FROM grid_ef WHERE country=? ORDER BY year', [cc]);
    const dhEFs = queryCol('SELECT ef FROM dh_ef WHERE country=? ORDER BY year', [cc]);
    const carbonPathway = queryCol('SELECT intensity FROM carbon_pathway WHERE country=? AND type=? ORDER BY year', [cc, pt]);
    const euiPathway = queryCol('SELECT intensity FROM eui_pathway WHERE country=? AND type=? ORDER BY year', [cc, pt]);
    const carbonPrices = queryCol('SELECT price FROM carbon_price ORDER BY year');

    if (!gridEFs.length || !carbonPathway.length || !euiPathway.length)
      return { error: `No pathway data for ${cc}_${pt}.` };

    const fe = fuelEFs();
    const clim = queryOne('SELECT hdd_base, cdd_base, hdd_change, cdd_change FROM climate WHERE country=?', [cc]);
    const hddB = clim ? clim.hdd_base : 0, cddB = clim ? clim.cdd_base : 0;
    const hddC = clim ? clim.hdd_change : 0, cddC = clim ? clim.cdd_change : 0;
    const hddR = hddB + hddC * (reportYear - 2015), cddR = cddB + cddC * (reportYear - 2015);

    function ext(kwh, dc, mc) { return (!kwh || kwh === 0) ? 0 : (dc > 0 && mc > 0 && dc < mc) ? kwh * mc / dc : kwh; }

    const nE = ext(asset.elec_kwh, asset.elec_dc, asset.elec_mc) * occ;
    const nG = ext(asset.gas_kwh, asset.gas_dc, asset.gas_mc) * occ;
    const nO = ext(asset.oil_kwh, asset.oil_dc, asset.oil_mc) * occ;
    const nDH = ext(asset.dh_kwh, asset.dh_dc, asset.dh_mc) * occ;
    const nDC = ext(asset.dc_kwh, asset.dc_dc, asset.dc_mc) * occ;
    const nO1 = ext(asset.oth1_kwh, asset.oth1_dc, asset.oth1_mc) * occ;
    const nO2 = ext(asset.oth2_kwh, asset.oth2_dc, asset.oth2_mc) * occ;
    const rOn = asset.renew_onsite || 0, rEx = asset.renew_export || 0;

    const totalEnergy = nE + nG + nO + nDH + nDC + nO1 + nO2 + rOn;
    const baselineEUI = floorArea > 0 ? totalEnergy / floorArea : 0;

    const gef0 = gridEFs[yearIdx] || gridEFs[0];
    const dhef0 = dhEFs.length ? (dhEFs[yearIdx] || dhEFs[0]) : 0.20431;
    const totalEm = nE * gef0 + nG * fe.natural_gas + nO * fe.fuel_oil + nDH * dhef0 + nDC * dhef0 +
      nO1 * (fe[asset.oth1_type] || 0) + nO2 * (fe[asset.oth2_type] || 0) - rEx * gef0;
    const baselineCI = floorArea > 0 ? totalEm / floorArea : 0;

    const projCI = [], projEUI = [], excEm = [], excCost = [];
    for (let y = 0; y < 31; y++) {
      const yr = 2020 + y;
      const gef = gridEFs[y], dhef = dhEFs.length ? (dhEFs[y] || 0) : 0.20431;
      const hR = hddR > 0 ? (hddB + hddC * (yr - 2015)) / hddR : 1;
      const cR = cddR > 0 ? (cddB + cddC * (yr - 2015)) / cddR : 1;

      const em = nE * gef + nG * hR * fe.natural_gas + nO * hR * fe.fuel_oil + nDH * hR * dhef +
        nDC * cR * dhef + nO1 * hR * (fe[asset.oth1_type] || 0) + nO2 * hR * (fe[asset.oth2_type] || 0) - rEx * gef;
      const ci = floorArea > 0 ? em / floorArea : 0;
      projCI.push(ci);
      const adjE = nE + nG * hR + nO * hR + nDH * hR + nDC * cR + nO1 * hR + nO2 * hR + rOn;
      projEUI.push(floorArea > 0 ? adjE / floorArea : 0);
      const exc = Math.max(0, ci - carbonPathway[y]) * floorArea;
      excEm.push(exc);
      excCost.push(exc * carbonPrices[y]);
    }

    let strandingYear = null;
    for (let y = 0; y < 31; y++) { if (projCI[y] > carbonPathway[y]) { strandingYear = 2020 + y; break; } }

    const cumExcess = excEm.reduce((a, b) => a + b, 0);
    let npv = 0; for (let y = 0; y < 31; y++) npv += excCost[y] / Math.pow(1.03, y);
    const cvar = asset.gav > 0 ? (npv / asset.gav) * 100 : null;

    return {
      name: asset.name || 'Unnamed', country: cc, propertyType: pt,
      floorArea, reportingYear: reportYear, gav: asset.gav || 0,
      baselineCarbonIntensity: baselineCI, baselineEUI, totalEnergy, totalEmissions: totalEm,
      projectedCI: projCI, projectedEUI: projEUI,
      carbonPathway: [...carbonPathway], euiPathway: [...euiPathway],
      strandingYear, cumulativeExcess: cumExcess,
      excessPerM2: floorArea > 0 ? cumExcess / floorArea : 0,
      annualExcessCosts: excCost, npvExcessCosts: npv, cvar,
      renewableShare: totalEnergy > 0 ? (rOn / totalEnergy) * 100 : 0
    };
  }

  // --- Validation ---
  function validate(a) {
    const e = [];
    if (!a.name) e.push('Asset Name required');
    if (!a.country) e.push('Country required');
    if (!a.propertyType) e.push('Property Type required');
    if (!a.floorArea || a.floorArea <= 0) e.push('Floor Area must be > 0');
    const kw = (a.elec_kwh||0)+(a.gas_kwh||0)+(a.oil_kwh||0)+(a.dh_kwh||0)+(a.dc_kwh||0)+(a.oth1_kwh||0)+(a.oth2_kwh||0);
    if (kw <= 0) e.push('At least one energy source required');
    return e;
  }

  // --- CSV parsing ---
  function parseCSV(text) {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];
    const hdr = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_'));
    const out = [];
    for (let i = 1; i < lines.length; i++) {
      const v = lines[i].split(',').map(s => s.trim());
      if (v.length < 3) continue;
      const r = {}; hdr.forEach((h, j) => r[h] = v[j]);
      out.push({
        name: r.asset_name || r.name || `Asset ${i}`,
        reportingYear: parseInt(r.reporting_year || r.year) || 2022,
        country: (r.country_code || r.country || '').toUpperCase(),
        propertyType: (r.property_type_code || r.property_type || '').toUpperCase(),
        floorArea: parseFloat(r.floor_area || r.gross_internal_area) || 0,
        vacantArea: parseFloat(r.vacant_area) || 0,
        gav: parseFloat(r.gav || r.gross_asset_value) || 0,
        elec_kwh: parseFloat(r.electricity_kwh || r.elec_kwh) || 0,
        elec_dc: parseFloat(r.elec_dc) || 0, elec_mc: parseFloat(r.elec_mc) || 0,
        gas_kwh: parseFloat(r.gas_kwh || r.natural_gas_kwh) || 0,
        gas_dc: parseFloat(r.gas_dc) || 0, gas_mc: parseFloat(r.gas_mc) || 0,
        oil_kwh: parseFloat(r.oil_kwh || r.fuel_oil_kwh) || 0,
        oil_dc: parseFloat(r.oil_dc) || 0, oil_mc: parseFloat(r.oil_mc) || 0,
        dh_kwh: parseFloat(r.dh_kwh || r.district_heating_kwh) || 0,
        dh_dc: parseFloat(r.dh_dc) || 0, dh_mc: parseFloat(r.dh_mc) || 0,
        dc_kwh: parseFloat(r.dc_kwh || r.district_cooling_kwh) || 0,
        dc_dc: parseFloat(r.dc_dc) || 0, dc_mc: parseFloat(r.dc_mc) || 0,
        oth1_kwh: parseFloat(r.other1_kwh) || 0,
        oth1_dc: parseFloat(r.other1_dc) || 0, oth1_mc: parseFloat(r.other1_mc) || 0,
        oth1_type: r.other1_fuel_type || 'natural_gas',
        oth2_kwh: parseFloat(r.other2_kwh) || 0,
        oth2_dc: parseFloat(r.other2_dc) || 0, oth2_mc: parseFloat(r.other2_mc) || 0,
        oth2_type: r.other2_fuel_type || 'natural_gas',
        renew_onsite: parseFloat(r.renewable_onsite_kwh) || 0,
        renew_export: parseFloat(r.renewable_export_kwh) || 0,
        renew_offsite: parseFloat(r.renewable_offsite_kwh) || 0
      });
    }
    return out;
  }

  function generateTemplate() {
    return 'asset_name,reporting_year,country_code,property_type_code,floor_area,vacant_area,gav,electricity_kwh,natural_gas_kwh,district_heating_kwh,fuel_oil_kwh,district_cooling_kwh,renewable_onsite_kwh,renewable_export_kwh\nSample Office Berlin,2022,DE,OFF,5000,200,15000000,450000,250000,100000,0,0,50000,10000\n';
  }

  return { init, calculate, validate, parseCSV, generateTemplate, YEARS };

})();
