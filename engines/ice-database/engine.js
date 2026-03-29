// ============================================================
// ICE Database – Inventory of Carbon and Energy Lookup Engine
// Built-in lookup table of embodied carbon (EC) and embodied
// energy (EE) for common construction materials.
//
// Data source: ICE Database v3.0 (Circular Ecology / University of Bath)
//   - Originally developed by Prof. Geoff Hammond & Craig Jones
//   - Now maintained by Circular Ecology Ltd
//   - Published values are freely available for reference
//
// This engine works OFFLINE — no external API calls required.
// The ICE database is distributed as Excel spreadsheets with
// no API. The ~50 most common materials are embedded here as
// a JSON lookup table.
//
// Values included:
//   - Embodied carbon (EC) in kgCO2e/kg
//   - Embodied energy (EE) in MJ/kg
//   - Typical density in kg/m3 (for EC per m3 calculations)
//   - Data quality indicator
//   - Number of source studies
//
// Limitations:
//   - Subset of the full ICE database (~50 materials)
//   - Values are UK/European averages; regional variation exists
//   - EPD-specific values may differ from these generic averages
//   - Density values are typical/representative, not prescriptive
//   - Does not include transport, construction process, or end-of-life
// ============================================================

window.ICEDatabase = (function () {

  // ICE v3.0 material data
  // EC = embodied carbon (kgCO2e/kg), EE = embodied energy (MJ/kg)
  // density = typical density (kg/m3), quality = data quality (Good/Fair/Poor)
  // sources = approximate number of data sources used in ICE
  var MATERIALS = [
    // --- Concrete ---
    { name: 'Concrete (General, RC 30/37)',     category: 'Concrete', ec: 0.132, ee: 0.95, density: 2400, quality: 'Good', sources: 40 },
    { name: 'Concrete (RC 20/25)',              category: 'Concrete', ec: 0.107, ee: 0.78, density: 2350, quality: 'Good', sources: 35 },
    { name: 'Concrete (RC 32/40)',              category: 'Concrete', ec: 0.140, ee: 1.01, density: 2400, quality: 'Good', sources: 30 },
    { name: 'Concrete (RC 40/50)',              category: 'Concrete', ec: 0.163, ee: 1.17, density: 2450, quality: 'Good', sources: 25 },
    { name: 'Concrete (High Strength 50/60)',   category: 'Concrete', ec: 0.188, ee: 1.35, density: 2500, quality: 'Fair', sources: 15 },
    { name: 'Concrete (Precast)',               category: 'Concrete', ec: 0.176, ee: 1.38, density: 2400, quality: 'Good', sources: 20 },
    { name: 'Concrete (30% GGBS)',              category: 'Concrete', ec: 0.100, ee: 0.78, density: 2400, quality: 'Fair', sources: 12 },
    { name: 'Concrete (50% GGBS)',              category: 'Concrete', ec: 0.074, ee: 0.60, density: 2400, quality: 'Fair', sources: 10 },

    // --- Cement & Mortar ---
    { name: 'Portland Cement (CEM I)',          category: 'Cement', ec: 0.912, ee: 5.50, density: 1500, quality: 'Good', sources: 45 },
    { name: 'Cement (CEM II/B)',                category: 'Cement', ec: 0.670, ee: 4.20, density: 1500, quality: 'Fair', sources: 15 },
    { name: 'Mortar (1:3 Cement:Sand)',         category: 'Cement', ec: 0.208, ee: 1.33, density: 2000, quality: 'Fair', sources: 10 },

    // --- Steel ---
    { name: 'Steel (General, World Average)',   category: 'Steel', ec: 1.550, ee: 20.10, density: 7850, quality: 'Good', sources: 50 },
    { name: 'Steel Sections (UK)',              category: 'Steel', ec: 1.530, ee: 21.50, density: 7850, quality: 'Good', sources: 20 },
    { name: 'Steel Rebar',                      category: 'Steel', ec: 1.400, ee: 17.40, density: 7850, quality: 'Good', sources: 25 },
    { name: 'Steel Sheet (Galvanised)',         category: 'Steel', ec: 2.760, ee: 31.50, density: 7850, quality: 'Good', sources: 15 },
    { name: 'Steel Plate',                      category: 'Steel', ec: 1.730, ee: 25.40, density: 7850, quality: 'Fair', sources: 12 },
    { name: 'Stainless Steel',                  category: 'Steel', ec: 6.150, ee: 56.70, density: 7930, quality: 'Good', sources: 18 },

    // --- Timber ---
    { name: 'Timber (General, Softwood)',       category: 'Timber', ec: 0.510, ee: 10.00, density: 510, quality: 'Good', sources: 30 },
    { name: 'Timber (Hardwood)',                category: 'Timber', ec: 0.860, ee: 15.00, density: 680, quality: 'Fair', sources: 15 },
    { name: 'Glulam',                           category: 'Timber', ec: 0.650, ee: 12.00, density: 500, quality: 'Good', sources: 18 },
    { name: 'CLT (Cross Laminated Timber)',     category: 'Timber', ec: 0.590, ee: 10.90, density: 480, quality: 'Fair', sources: 12 },
    { name: 'Plywood',                          category: 'Timber', ec: 0.810, ee: 15.00, density: 600, quality: 'Good', sources: 15 },
    { name: 'OSB (Oriented Strand Board)',      category: 'Timber', ec: 0.590, ee: 15.00, density: 630, quality: 'Fair', sources: 10 },
    { name: 'MDF (Medium Density Fibreboard)',  category: 'Timber', ec: 0.720, ee: 11.00, density: 700, quality: 'Fair', sources: 10 },
    { name: 'Particleboard',                    category: 'Timber', ec: 0.590, ee: 10.30, density: 680, quality: 'Fair', sources: 8 },

    // --- Aluminium ---
    { name: 'Aluminium (General)',              category: 'Aluminium', ec: 9.160, ee: 155.00, density: 2700, quality: 'Good', sources: 25 },
    { name: 'Aluminium (Recycled)',             category: 'Aluminium', ec: 1.690, ee: 29.00,  density: 2700, quality: 'Good', sources: 15 },
    { name: 'Aluminium (Extruded)',             category: 'Aluminium', ec: 9.580, ee: 154.00, density: 2700, quality: 'Fair', sources: 10 },

    // --- Glass ---
    { name: 'Glass (General)',                  category: 'Glass', ec: 0.860, ee: 15.00, density: 2500, quality: 'Good', sources: 25 },
    { name: 'Glass (Toughened)',                category: 'Glass', ec: 1.270, ee: 23.50, density: 2500, quality: 'Fair', sources: 12 },
    { name: 'Glass (Double Glazing Unit)',      category: 'Glass', ec: 1.200, ee: 21.00, density: 2500, quality: 'Fair', sources: 10 },

    // --- Brick & Masonry ---
    { name: 'Brick (General)',                  category: 'Masonry', ec: 0.240, ee: 3.00, density: 1900, quality: 'Good', sources: 25 },
    { name: 'Brick (Facing)',                   category: 'Masonry', ec: 0.280, ee: 3.50, density: 2000, quality: 'Fair', sources: 12 },
    { name: 'Concrete Block',                   category: 'Masonry', ec: 0.093, ee: 0.67, density: 1400, quality: 'Good', sources: 15 },
    { name: 'Natural Stone',                    category: 'Masonry', ec: 0.079, ee: 1.00, density: 2500, quality: 'Fair', sources: 10 },

    // --- Insulation ---
    { name: 'Mineral Wool (Glass)',             category: 'Insulation', ec: 1.350, ee: 28.00, density: 25,  quality: 'Good', sources: 15 },
    { name: 'Mineral Wool (Stone/Rock)',        category: 'Insulation', ec: 1.120, ee: 16.80, density: 40,  quality: 'Good', sources: 15 },
    { name: 'EPS (Expanded Polystyrene)',       category: 'Insulation', ec: 3.290, ee: 88.60, density: 20,  quality: 'Good', sources: 15 },
    { name: 'XPS (Extruded Polystyrene)',       category: 'Insulation', ec: 3.480, ee: 88.60, density: 35,  quality: 'Good', sources: 12 },
    { name: 'PUR (Polyurethane Rigid Foam)',    category: 'Insulation', ec: 3.480, ee: 101.50, density: 30, quality: 'Fair', sources: 10 },
    { name: 'PIR (Polyisocyanurate)',           category: 'Insulation', ec: 3.400, ee: 99.00, density: 32,  quality: 'Fair', sources: 8 },
    { name: 'Cellulose Insulation',             category: 'Insulation', ec: 0.200, ee: 3.30, density: 50,   quality: 'Fair', sources: 8 },
    { name: 'Cork Insulation',                  category: 'Insulation', ec: 0.190, ee: 4.00, density: 120,  quality: 'Fair', sources: 6 },

    // --- Plasterboard & Finishes ---
    { name: 'Plasterboard (Gypsum)',            category: 'Finishes', ec: 0.390, ee: 6.75, density: 760,  quality: 'Good', sources: 15 },
    { name: 'Plaster (Gypsum)',                 category: 'Finishes', ec: 0.120, ee: 1.80, density: 1120, quality: 'Fair', sources: 10 },
    { name: 'Ceramic Tiles',                    category: 'Finishes', ec: 0.740, ee: 12.00, density: 2000, quality: 'Fair', sources: 10 },
    { name: 'Paint (Water-Based)',              category: 'Finishes', ec: 2.410, ee: 70.00, density: 1300, quality: 'Poor', sources: 5 },

    // --- Copper & Metals ---
    { name: 'Copper (General)',                 category: 'Metals', ec: 3.810, ee: 57.00, density: 8940, quality: 'Good', sources: 18 },
    { name: 'Copper (Recycled)',                category: 'Metals', ec: 1.260, ee: 16.50, density: 8940, quality: 'Fair', sources: 8 },
    { name: 'Lead',                             category: 'Metals', ec: 1.570, ee: 25.21, density: 11340, quality: 'Fair', sources: 10 },
    { name: 'Zinc',                             category: 'Metals', ec: 3.860, ee: 53.10, density: 7130, quality: 'Fair', sources: 8 },

    // --- Plastics & Membranes ---
    { name: 'PVC (General)',                    category: 'Plastics', ec: 3.100, ee: 77.20, density: 1380, quality: 'Good', sources: 15 },
    { name: 'HDPE',                             category: 'Plastics', ec: 1.930, ee: 76.70, density: 960,  quality: 'Good', sources: 12 },
    { name: 'Bitumen (Roofing Felt)',           category: 'Plastics', ec: 0.490, ee: 51.00, density: 1050, quality: 'Fair', sources: 8 },
    { name: 'EPDM Membrane',                   category: 'Plastics', ec: 2.770, ee: 87.40, density: 1150, quality: 'Fair', sources: 6 }
  ];

  // Index by lowercase name for fast lookup
  var INDEX = {};
  MATERIALS.forEach(function (m) {
    INDEX[m.name.toLowerCase()] = m;
  });

  function init(options) { return Promise.resolve(); }

  function getAllMaterials() {
    return MATERIALS.map(function (m) {
      return { name: m.name, category: m.category };
    });
  }

  function getCategories() {
    var cats = {};
    MATERIALS.forEach(function (m) { cats[m.category] = true; });
    return Object.keys(cats).sort();
  }

  function searchMaterials(query) {
    if (!query) return [];
    var q = query.toLowerCase().trim();
    return MATERIALS.filter(function (m) {
      return m.name.toLowerCase().indexOf(q) !== -1
          || m.category.toLowerCase().indexOf(q) !== -1;
    });
  }

  function lookupMaterial(name) {
    if (!name) return null;
    // Exact match
    var exact = INDEX[name.toLowerCase()];
    if (exact) return exact;
    // Partial match — return best
    var matches = searchMaterials(name);
    return matches.length ? matches[0] : null;
  }

  async function calculate(input) {
    var materialName = input.material || input.material_name || input.name;
    var quantity_kg = input.quantity_kg || null;
    var quantity_m3 = input.quantity_m3 || null;
    var listAll = input.list_all || false;
    var searchQuery = input.search || null;
    var category = input.category || null;

    // If listing all materials
    if (listAll) {
      return {
        materials: getAllMaterials(),
        categories: getCategories(),
        total_count: MATERIALS.length,
        source: 'ICE Database v3.0 (Circular Ecology)'
      };
    }

    // If searching
    if (searchQuery) {
      var found = searchMaterials(searchQuery);
      return {
        query: searchQuery,
        results: found.map(function (m) {
          return {
            name: m.name,
            category: m.category,
            ec_kgco2e_per_kg: m.ec,
            ee_mj_per_kg: m.ee,
            density_kg_m3: m.density
          };
        }),
        count: found.length,
        source: 'ICE Database v3.0 (Circular Ecology)'
      };
    }

    // If filtering by category
    if (category && !materialName) {
      var catLower = category.toLowerCase();
      var catMaterials = MATERIALS.filter(function (m) {
        return m.category.toLowerCase() === catLower;
      });
      return {
        category: category,
        materials: catMaterials.map(function (m) {
          return {
            name: m.name,
            ec_kgco2e_per_kg: m.ec,
            ee_mj_per_kg: m.ee,
            density_kg_m3: m.density,
            ec_kgco2e_per_m3: Math.round(m.ec * m.density * 100) / 100
          };
        }),
        count: catMaterials.length,
        source: 'ICE Database v3.0 (Circular Ecology)'
      };
    }

    // Single material lookup
    if (!materialName) {
      return {
        error: 'Provide a material name (material), search term (search), ' +
               'category, or set list_all: true. ' +
               'Available categories: ' + getCategories().join(', ')
      };
    }

    var mat = lookupMaterial(materialName);
    if (!mat) {
      var suggestions = searchMaterials(materialName.split(' ')[0]);
      return {
        error: 'Material not found: "' + materialName + '".',
        suggestions: suggestions.slice(0, 5).map(function (m) { return m.name; }),
        hint: 'Try a broader search term or use search: "keyword".'
      };
    }

    var result = {
      material_name: mat.name,
      category: mat.category,
      ec_kgco2e_per_kg: mat.ec,
      ec_kgco2e_per_m3: Math.round(mat.ec * mat.density * 100) / 100,
      ee_mj_per_kg: mat.ee,
      ee_mj_per_m3: Math.round(mat.ee * mat.density * 100) / 100,
      density_kg_m3: mat.density,
      data_quality: mat.quality,
      source_count: mat.sources
    };

    // If quantity provided, calculate totals
    if (quantity_kg) {
      result.quantity_kg = quantity_kg;
      result.total_ec_kgco2e = Math.round(mat.ec * quantity_kg * 100) / 100;
      result.total_ec_tco2e = Math.round(mat.ec * quantity_kg / 1000 * 1000) / 1000;
      result.total_ee_mj = Math.round(mat.ee * quantity_kg * 100) / 100;
      result.total_ee_kwh = Math.round(mat.ee * quantity_kg / 3.6 * 100) / 100;
    }

    if (quantity_m3) {
      var mass = quantity_m3 * mat.density;
      result.quantity_m3 = quantity_m3;
      result.equivalent_mass_kg = Math.round(mass);
      result.total_ec_kgco2e = Math.round(mat.ec * mass * 100) / 100;
      result.total_ec_tco2e = Math.round(mat.ec * mass / 1000 * 1000) / 1000;
      result.total_ee_mj = Math.round(mat.ee * mass * 100) / 100;
      result.total_ee_kwh = Math.round(mat.ee * mass / 3.6 * 100) / 100;
    }

    result.source = 'ICE Database v3.0 (Circular Ecology)';
    result.notes = 'Values are cradle-to-gate. Regional and product-specific variation exists. ' +
                   'Use EPDs for project-specific assessments.';

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
