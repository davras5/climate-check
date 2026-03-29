// ============================================================
// Zero Tool – Architecture 2030 Zero Code Compliance Engine
// Implements the Zero Tool baseline EUI lookup and target
// reduction calculations based on CBECS (Commercial Buildings
// Energy Consumption Survey) data and Architecture 2030 targets.
//
// Data sources:
//   - CBECS 2018 baseline EUI data (US DOE/EIA)
//   - Architecture 2030 Challenge reduction targets
//   - Zero Tool methodology: https://zerotool.org/
//
// This engine works OFFLINE — all lookup data is built in.
// No external API calls are required. The CBECS baseline EUI
// values and Architecture 2030 reduction percentages are
// published/public data.
//
// Limitations:
//   - CBECS data is US-specific (kBtu/ft2); conversion provided
//     for kWh/m2
//   - Climate zone mapping uses ASHRAE 90.1 climate zones (1–8)
//   - Building types follow CBECS principal building activity
//   - Architecture 2030 targets are for new construction
//   - Actual EUI varies significantly by occupancy, schedule, etc.
// ============================================================

window.ZeroTool = (function () {

  // CBECS 2018 median site EUI by building type (kBtu/ft2)
  // Source: US EIA CBECS Table C1, supplemented by Zero Tool published values
  var BASELINE_EUI = {
    'Education':          68.2,
    'Food Sales':        199.0,
    'Food Service':      262.8,
    'Healthcare Inpatient': 177.9,
    'Healthcare Outpatient': 80.5,
    'Lodging':           100.0,
    'Retail (Non-Mall)':  56.3,
    'Retail (Mall)':      83.6,
    'Office':             60.0,
    'Public Assembly':    69.2,
    'Public Order/Safety':105.4,
    'Religious Worship':  39.6,
    'Service':            67.0,
    'Warehouse':          30.5,
    'Other':              77.8,
    'Mixed Use':          73.0,
    'Laboratory':        210.0,
    'Data Center':       550.0,
    'Multifamily Low-Rise':  55.0,
    'Multifamily High-Rise': 65.0,
    'Parking Garage':     12.5
  };

  // Climate zone adjustment factors (multiplier on baseline EUI)
  // ASHRAE climate zones 1–8, derived from CBECS regional analysis
  var CLIMATE_ZONE_FACTORS = {
    '1':  0.85,  // Very Hot – Humid (Miami)
    '1A': 0.85,
    '2':  0.90,  // Hot – Humid (Houston)
    '2A': 0.90,
    '2B': 0.88,  // Hot – Dry (Phoenix)
    '3':  0.92,  // Warm (Atlanta)
    '3A': 0.92,
    '3B': 0.88,  // Warm – Dry (LA)
    '3C': 0.82,  // Warm – Marine (SF)
    '4':  1.00,  // Mixed (Baltimore) – reference
    '4A': 1.00,
    '4B': 0.95,
    '4C': 0.92,
    '5':  1.08,  // Cool (Chicago)
    '5A': 1.08,
    '5B': 1.02,
    '5C': 0.98,
    '6':  1.15,  // Cold (Minneapolis)
    '6A': 1.15,
    '6B': 1.10,
    '7':  1.22,  // Very Cold (Duluth)
    '8':  1.30   // Subarctic (Fairbanks)
  };

  // Architecture 2030 Challenge: reduction targets from CBECS baseline
  // These represent the path to carbon-neutral by 2030
  var REDUCTION_TARGETS = {
    2015: 0.70,  // 70% reduction from baseline
    2020: 0.80,  // 80% reduction
    2025: 0.90,  // 90% reduction
    2030: 1.00,  // 100% = carbon neutral (net-zero)
    // For projects between milestone years, interpolate
  };

  // Conversion factors
  var KBTU_PER_FT2_TO_KWH_PER_M2 = 3.15459;  // 1 kBtu/ft2 = 3.15459 kWh/m2

  function init(options) { return Promise.resolve(); }

  function getBuildingTypes() {
    return Object.keys(BASELINE_EUI);
  }

  function normalizeClimateZone(cz) {
    if (!cz) return '4A';  // default to reference zone
    var s = String(cz).toUpperCase().trim();
    // Try exact match first
    if (CLIMATE_ZONE_FACTORS[s] !== undefined) return s;
    // Try numeric only
    var num = s.replace(/[^0-9]/g, '');
    if (CLIMATE_ZONE_FACTORS[num] !== undefined) return num;
    return '4A'; // fallback
  }

  function normalizeBuildingType(bt) {
    if (!bt) return null;
    var input = bt.toLowerCase().trim();
    // Exact match
    for (var key in BASELINE_EUI) {
      if (key.toLowerCase() === input) return key;
    }
    // Partial / fuzzy match
    var keywords = {
      'school':     'Education',
      'university': 'Education',
      'college':    'Education',
      'grocery':    'Food Sales',
      'supermarket':'Food Sales',
      'restaurant': 'Food Service',
      'cafe':       'Food Service',
      'hospital':   'Healthcare Inpatient',
      'clinic':     'Healthcare Outpatient',
      'medical':    'Healthcare Outpatient',
      'hotel':      'Lodging',
      'motel':      'Lodging',
      'store':      'Retail (Non-Mall)',
      'shop':       'Retail (Non-Mall)',
      'mall':       'Retail (Mall)',
      'office':     'Office',
      'church':     'Religious Worship',
      'mosque':     'Religious Worship',
      'synagogue':  'Religious Worship',
      'temple':     'Religious Worship',
      'warehouse':  'Warehouse',
      'storage':    'Warehouse',
      'lab':        'Laboratory',
      'data center':'Data Center',
      'datacenter': 'Data Center',
      'apartment':  'Multifamily Low-Rise',
      'multifamily':'Multifamily Low-Rise',
      'condo':      'Multifamily High-Rise',
      'parking':    'Parking Garage',
      'theater':    'Public Assembly',
      'theatre':    'Public Assembly',
      'museum':     'Public Assembly',
      'library':    'Public Assembly',
      'arena':      'Public Assembly',
      'police':     'Public Order/Safety',
      'fire station':'Public Order/Safety',
      'courthouse': 'Public Order/Safety'
    };
    for (var kw in keywords) {
      if (input.indexOf(kw) !== -1) return keywords[kw];
    }
    return null;
  }

  function getReductionTarget(year) {
    if (!year) year = new Date().getFullYear();
    year = Number(year);
    if (year >= 2030) return 1.0;
    if (year <= 2015) return 0.70;
    // Linear interpolation between milestone years
    var milestones = [2015, 2020, 2025, 2030];
    var reductions = [0.70, 0.80, 0.90, 1.00];
    for (var i = 0; i < milestones.length - 1; i++) {
      if (year >= milestones[i] && year <= milestones[i + 1]) {
        var t = (year - milestones[i]) / (milestones[i + 1] - milestones[i]);
        return reductions[i] + t * (reductions[i + 1] - reductions[i]);
      }
    }
    return 0.90;
  }

  async function calculate(input) {
    var buildingType = input.building_type;
    var climateZone = input.climate_zone;
    var targetYear = input.target_year || new Date().getFullYear();
    var grossArea_ft2 = input.gross_area_ft2 || null;
    var units = input.units || 'imperial'; // 'imperial' or 'metric'

    // Resolve building type
    var resolvedType = normalizeBuildingType(buildingType);
    if (!resolvedType) {
      return {
        error: 'Unknown building type: "' + buildingType + '". ' +
               'Available types: ' + getBuildingTypes().join(', ')
      };
    }

    // Get baseline EUI
    var baselineEUI = BASELINE_EUI[resolvedType]; // kBtu/ft2

    // Apply climate zone factor
    var czNorm = normalizeClimateZone(climateZone);
    var czFactor = CLIMATE_ZONE_FACTORS[czNorm] || 1.0;
    var adjustedBaseline = baselineEUI * czFactor;

    // Get Architecture 2030 reduction target
    var reductionPct = getReductionTarget(targetYear);
    var targetEUI = adjustedBaseline * (1 - reductionPct);

    // An estimated realistic site EUI (after typical energy measures)
    // Represents what is achievable with good design practices
    var estimatedSiteEUI = adjustedBaseline * (1 - reductionPct * 0.85);

    // Build result
    var result = {
      building_type: resolvedType,
      climate_zone: czNorm,
      climate_zone_factor: czFactor,
      target_year: Number(targetYear),
      baseline_eui_kbtu_ft2: Math.round(adjustedBaseline * 10) / 10,
      target_eui_kbtu_ft2: Math.round(targetEUI * 10) / 10,
      estimated_site_eui_kbtu_ft2: Math.round(estimatedSiteEUI * 10) / 10,
      reduction_pct: Math.round(reductionPct * 100),
      arch2030_target: reductionPct >= 1.0 ? 'Carbon Neutral' : (reductionPct * 100) + '% reduction'
    };

    // Add metric conversions
    if (units === 'metric' || input.include_metric) {
      result.baseline_eui_kwh_m2 = Math.round(adjustedBaseline * KBTU_PER_FT2_TO_KWH_PER_M2 * 10) / 10;
      result.target_eui_kwh_m2 = Math.round(targetEUI * KBTU_PER_FT2_TO_KWH_PER_M2 * 10) / 10;
      result.estimated_site_eui_kwh_m2 = Math.round(estimatedSiteEUI * KBTU_PER_FT2_TO_KWH_PER_M2 * 10) / 10;
    }

    // If gross area provided, estimate total energy
    if (grossArea_ft2) {
      result.estimated_annual_energy_kbtu = Math.round(estimatedSiteEUI * grossArea_ft2);
      result.estimated_annual_energy_kwh = Math.round(estimatedSiteEUI * grossArea_ft2 * 0.293071);
    }

    result.cbecs_baseline_eui_kbtu_ft2 = baselineEUI;
    result.source = 'CBECS 2018 + Architecture 2030 Challenge';
    result.notes = 'Baseline is CBECS median adjusted for climate zone. ' +
                   'Target is per Architecture 2030 Challenge reduction schedule.';

    return result;
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
