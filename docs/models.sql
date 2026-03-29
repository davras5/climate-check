-- ============================================================
-- Climate Check – Models Database Schema (normalized)
-- Reference document for data/models.db
-- 109 models as of 2026-03-29
-- ============================================================
--
-- All categorical columns use FOREIGN KEY constraints against
-- lookup tables prefixed with lu_. Many-to-many relationships
-- use junction tables. JSON columns are reserved for truly
-- variable-shape data (inputs, outputs, coverage arrays).
--
-- Requires SQLite 3.38+ (json1 built-in).
-- ============================================================

PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;


-- ============================================================
-- 1. LOOKUP / VALUE-LIST TABLES
-- ============================================================

-- Model availability status on the platform
CREATE TABLE lu_status (
    id          TEXT PRIMARY KEY,  -- slug used in code
    name        TEXT NOT NULL,     -- display label
    description TEXT NOT NULL,
    color       TEXT NOT NULL      -- Primer CSS color token for badge
);
INSERT INTO lu_status VALUES
  ('live',        'Live',        'Engine built and interactive on the platform',      'open'),
  ('coming-soon', 'Coming soon', 'Wrappable tool, planned for implementation',        'attention'),
  ('reference',   'Reference',   'Standard, framework, certification, or database',   'accent'),
  ('commercial',  'Commercial',  'Third-party paid product listed for awareness',      'done');


-- Software license classification
CREATE TABLE lu_license_type (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    description TEXT NOT NULL
);
INSERT INTO lu_license_type VALUES
  ('open-source',         'Open Source',          'Source code available under OSI/FSF-approved license (MIT, BSD, GPL, Apache, AGPL, MPL)'),
  ('free',                'Free',                 'Free to use including for commercial purposes; source code not available'),
  ('free-non-commercial', 'Free (non-commercial)','Free for research and personal use; commercial exploitation requires separate license'),
  ('freemium',            'Freemium',             'Free basic tier; advanced features, API access, or certification require payment'),
  ('commercial',          'Commercial',           'Paid license or subscription required for any use'),
  ('restricted',          'Restricted',           'Access limited to certified professionals, members, or authorized users');


-- Methodology approach type
CREATE TABLE lu_approach (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    description TEXT NOT NULL
);
INSERT INTO lu_approach VALUES
  ('quantitative', 'Quantitative', 'Numerical modeling, simulation, or calculation producing measurable outputs'),
  ('qualitative',  'Qualitative',  'Scoring, rating, checklist, or framework-based assessment'),
  ('mixed',        'Mixed',        'Combines quantitative calculations with qualitative scoring');


-- Geographic coverage region (for map display and primary filtering)
-- These are broad geographic zones, not political entities.
-- Every model gets exactly one map_region based on its primary coverage.
CREATE TABLE lu_map_region (
    id   TEXT PRIMARY KEY,
    name TEXT NOT NULL
);
INSERT INTO lu_map_region VALUES
  ('global',         'Global'),
  ('europe',         'Europe'),
  ('north-america',  'North America'),
  ('asia-pacific',   'Asia-Pacific'),
  ('switzerland',    'Switzerland'),
  ('africa',         'Africa'),
  ('latin-america',  'Latin America'),
  ('middle-east',    'Middle East'),
  ('oceania',        'Oceania');


-- Market / jurisdiction region (for multi-select filtering)
-- Uses ISO 3166-1 alpha-2 for countries, custom codes for supranational.
-- This is NOT the full list of 179 countries on the SVG map — those are
-- stored in models.jurisdiction_codes (JSON array). This table holds the
-- regions that appear in the filter sidebar.
CREATE TABLE lu_region (
    id        TEXT PRIMARY KEY,  -- ISO 3166-1 alpha-2 or supranational code
    name      TEXT NOT NULL,
    type      TEXT NOT NULL CHECK (type IN ('country', 'supranational')),
    map_region TEXT REFERENCES lu_map_region(id)  -- parent geographic zone
);
INSERT INTO lu_region VALUES
  -- Supranational
  ('Global', 'Global',              'supranational', 'global'),
  ('EU',     'European Union',      'supranational', 'europe'),
  ('APAC',   'Asia-Pacific',        'supranational', 'asia-pacific'),
  -- Europe
  ('CH',     'Switzerland',         'country', 'switzerland'),
  ('UK',     'United Kingdom',      'country', 'europe'),
  ('DE',     'Germany',             'country', 'europe'),
  ('FR',     'France',              'country', 'europe'),
  ('BE',     'Belgium',             'country', 'europe'),
  ('NL',     'Netherlands',         'country', 'europe'),
  ('AT',     'Austria',             'country', 'europe'),
  ('SE',     'Sweden',              'country', 'europe'),
  ('NO',     'Norway',              'country', 'europe'),
  ('DK',     'Denmark',             'country', 'europe'),
  ('IT',     'Italy',               'country', 'europe'),
  ('ES',     'Spain',               'country', 'europe'),
  -- North America
  ('US',     'United States',       'country', 'north-america'),
  ('CA',     'Canada',              'country', 'north-america'),
  ('MX',     'Mexico',              'country', 'north-america'),
  -- Asia-Pacific
  ('AU',     'Australia',           'country', 'asia-pacific'),
  ('NZ',     'New Zealand',         'country', 'asia-pacific'),
  ('JP',     'Japan',               'country', 'asia-pacific'),
  ('CN',     'China',               'country', 'asia-pacific'),
  ('SG',     'Singapore',           'country', 'asia-pacific'),
  ('IN',     'India',               'country', 'asia-pacific'),
  ('KR',     'South Korea',         'country', 'asia-pacific'),
  ('HK',     'Hong Kong',           'country', 'asia-pacific'),
  -- Middle East & Africa
  ('AE',     'United Arab Emirates','country', 'middle-east'),
  ('SA',     'Saudi Arabia',        'country', 'middle-east'),
  ('ZA',     'South Africa',        'country', 'africa'),
  ('NG',     'Nigeria',             'country', 'africa'),
  ('KE',     'Kenya',               'country', 'africa'),
  -- Latin America
  ('BR',     'Brazil',              'country', 'latin-america'),
  ('CO',     'Colombia',            'country', 'latin-america'),
  ('CL',     'Chile',               'country', 'latin-america');


-- Model category / vertical
CREATE TABLE lu_category (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    description TEXT NOT NULL,
    sort_order  INTEGER NOT NULL DEFAULT 0
);
INSERT INTO lu_category VALUES
  ('physical-risk',       'Physical Risk',               'Hazard models, flood/fire/SLR screening, multi-hazard tools',        1),
  ('transition-risk',     'Transition Risk & Alignment',  'Stranding analysis, pathway alignment, taxonomy compliance',          2),
  ('energy-performance',  'Energy Performance',           'Building energy simulation, benchmarking, rating, solar estimation',  3),
  ('embodied-carbon',     'Embodied Carbon & LCA',        'Whole-life carbon calculators, LCA tools, material EC coefficients', 4),
  ('epd-database',        'EPD & LCA Databases',          'Environmental Product Declaration databases and material LCI data',  5),
  ('carbon-accounting',   'Carbon Accounting & Reporting', 'GHG protocols, whole-life carbon standards, operational benchmarks', 6),
  ('certification',       'Green Building Certification',  'Rating and certification systems (DGNB, BREEAM, MINERGIE, etc.)',   7),
  ('nature-biodiversity', 'Nature & Biodiversity',         'TNFD, biodiversity net gain, ecosystem services, nature risk',      8),
  ('circular-economy',    'Circular Economy & Materials',   'Material passports, waste tracking, reuse platforms, MFA',          9),
  ('target-setting',      'Target Setting & Pathways',      'Science-based targets, net-zero benchmarks, retrofit decisions',   10);


-- Real estate sector
CREATE TABLE lu_sector (
    id   TEXT PRIMARY KEY,
    name TEXT NOT NULL
);
INSERT INTO lu_sector VALUES
  ('commercial',     'Commercial'),
  ('residential',    'Residential'),
  ('industrial',     'Industrial'),
  ('infrastructure', 'Infrastructure'),
  ('mixed-use',      'Mixed-Use');


-- Building lifecycle stage (aligned with EN 15978 / EN 15804+A2)
-- Maps to the modular structure: A (before use), B (use), C (end of life), D (beyond)
CREATE TABLE lu_lifecycle_stage (
    id         TEXT PRIMARY KEY,
    name       TEXT NOT NULL,
    en15978    TEXT NOT NULL,   -- EN 15978 module code(s)
    sort_order INTEGER NOT NULL
);
INSERT INTO lu_lifecycle_stage VALUES
  ('Production',   'Product stage',       'A1–A3', 1),
  ('Construction', 'Construction stage',  'A4–A5', 2),
  ('Use',          'Use stage',           'B1–B5', 3),
  ('Operation',    'Operational energy & water', 'B6–B7', 4),
  ('End of life',  'End-of-life stage',   'C1–C4', 5),
  ('Circularity',  'Benefits beyond system boundary', 'D', 6);


-- Allowed data types for input/output field schemas
CREATE TABLE lu_field_type (
    id          TEXT PRIMARY KEY,
    description TEXT NOT NULL
);
INSERT INTO lu_field_type VALUES
  ('string',  'Free-text string value'),
  ('number',  'Numeric value (integer or decimal)'),
  ('integer', 'Whole number'),
  ('boolean', 'True/false flag'),
  ('enum',    'Constrained to a defined set of allowed values (see constraints_def)'),
  ('array',   'Ordered list of values (typically JSON array)'),
  ('date',    'ISO 8601 date string (YYYY-MM-DD)');


-- ============================================================
-- 2. MAIN MODELS TABLE
-- ============================================================

CREATE TABLE models (
    -- Identity
    id                TEXT PRIMARY KEY,
    name              TEXT NOT NULL,
    version           TEXT,
    status            TEXT NOT NULL REFERENCES lu_status(id),
    description       TEXT,       -- short (1-2 sentences)
    long_description  TEXT,       -- detailed methodology explanation

    -- Attribution
    author            TEXT,
    citation          TEXT,
    scenario          TEXT,       -- climate scenario basis (e.g. "1.5C IEA NZE 2050")
    scope             TEXT,       -- what is measured / included

    -- Classification
    approach          TEXT REFERENCES lu_approach(id),
    complexity        INTEGER CHECK (complexity BETWEEN 1 AND 10),
    maturity          INTEGER CHECK (maturity BETWEEN 1 AND 10),

    -- Timestamps
    last_updated      TEXT CHECK (last_updated IS NULL OR last_updated GLOB '????-??-??'),

    -- Engine (only for status = 'live')
    engine            TEXT,       -- path to JS engine file
    test_data         TEXT,       -- path to example CSV
    database_path     TEXT,       -- path to model-specific .db if any

    -- Display
    card_image        TEXT,
    card_image_source TEXT,

    -- License (FK on type for filtering, free-text for specifics)
    license_type      TEXT REFERENCES lu_license_type(id),
    license_name      TEXT,       -- e.g. "BSD-3-Clause", "CC BY 4.0", "Proprietary"
    license_url       TEXT,

    -- Source / provenance
    source_name       TEXT,
    source_url        TEXT,
    source_docs       TEXT,
    source_methodology TEXT,

    -- Coverage (flat columns for efficient filtering)
    map_region         TEXT REFERENCES lu_map_region(id),
    jurisdiction_count INTEGER DEFAULT 0 CHECK (jurisdiction_count >= 0),
    property_type_count INTEGER DEFAULT 0 CHECK (property_type_count >= 0),
    time_range         TEXT,

    -- Variable-shape data (JSON)
    jurisdiction_codes TEXT,   -- JSON array: ["CH","DE","AT"]
    property_type_list TEXT,   -- JSON array: ["Office","Residential"]
    adopted_by         TEXT,   -- JSON array: ["GRESB","SBTi"]
    limitations        TEXT,   -- JSON array: ["Embodied carbon excluded", ...]
    inputs             TEXT,   -- JSON array of {field, label, type, unit, required, constraint, default, description}
    outputs            TEXT,   -- JSON array of {field, label, type, unit, constraint, description}
    constraints_def    TEXT    -- JSON object: {"HazardLevel": {"type":"enum","values":[...]}}
);

CREATE INDEX idx_models_status   ON models(status);
CREATE INDEX idx_models_approach ON models(approach);
CREATE INDEX idx_models_license  ON models(license_type);
CREATE INDEX idx_models_region   ON models(map_region);


-- ============================================================
-- 3. JUNCTION TABLES (many-to-many)
-- ============================================================

CREATE TABLE model_categories (
    model_id    TEXT NOT NULL REFERENCES models(id) ON DELETE CASCADE,
    category_id TEXT NOT NULL REFERENCES lu_category(id),
    PRIMARY KEY (model_id, category_id)
);

CREATE TABLE model_regions (
    model_id  TEXT NOT NULL REFERENCES models(id) ON DELETE CASCADE,
    region_id TEXT NOT NULL REFERENCES lu_region(id),
    PRIMARY KEY (model_id, region_id)
);

CREATE TABLE model_sectors (
    model_id  TEXT NOT NULL REFERENCES models(id) ON DELETE CASCADE,
    sector_id TEXT NOT NULL REFERENCES lu_sector(id),
    PRIMARY KEY (model_id, sector_id)
);

CREATE TABLE model_lifecycle_stages (
    model_id TEXT NOT NULL REFERENCES models(id) ON DELETE CASCADE,
    stage_id TEXT NOT NULL REFERENCES lu_lifecycle_stage(id),
    PRIMARY KEY (model_id, stage_id)
);

-- Tags are free-text (no FK constraint). They are user-facing keywords
-- for discovery. Avoid duplicating category, region, license, or sector
-- values as tags — those are already structured dimensions.
CREATE TABLE model_tags (
    model_id TEXT NOT NULL REFERENCES models(id) ON DELETE CASCADE,
    tag      TEXT NOT NULL CHECK (length(tag) >= 2),
    PRIMARY KEY (model_id, tag)
);

CREATE INDEX idx_mc_cat   ON model_categories(category_id);
CREATE INDEX idx_mr_reg   ON model_regions(region_id);
CREATE INDEX idx_ms_sec   ON model_sectors(sector_id);
CREATE INDEX idx_ml_stage ON model_lifecycle_stages(stage_id);
CREATE INDEX idx_mt_tag   ON model_tags(tag);


-- ============================================================
-- 4. VIEWS
-- ============================================================

-- Flat overview with aggregated many-to-many fields
CREATE VIEW v_models AS
SELECT
    m.id, m.name, m.version, m.status, m.description, m.author,
    m.approach, m.complexity, m.maturity, m.last_updated,
    m.engine, m.license_type, m.license_name,
    m.source_url, m.map_region,
    m.jurisdiction_count, m.property_type_count, m.time_range,
    (SELECT group_concat(category_id, ', ') FROM model_categories WHERE model_id = m.id) AS categories,
    (SELECT group_concat(region_id, ', ')   FROM model_regions    WHERE model_id = m.id) AS regions,
    (SELECT group_concat(sector_id, ', ')   FROM model_sectors    WHERE model_id = m.id) AS sectors,
    (SELECT group_concat(stage_id, ', ')    FROM model_lifecycle_stages WHERE model_id = m.id) AS lifecycle_stages,
    (SELECT count(*)                        FROM model_tags       WHERE model_id = m.id) AS tag_count
FROM models m;

-- Category-grouped listing
CREATE VIEW v_models_by_category AS
SELECT mc.category_id, lc.name AS category_name,
       m.id, m.name, m.status, m.license_type, m.map_region
FROM model_categories mc
JOIN lu_category lc ON lc.id = mc.category_id
JOIN models m ON m.id = mc.model_id
ORDER BY lc.sort_order, m.name;

-- All dimension values for UI filter dropdowns
CREATE VIEW v_filter_options AS
SELECT 'status'     AS dimension, id, name, NULL AS extra FROM lu_status
UNION ALL
SELECT 'license',   id, name, NULL FROM lu_license_type
UNION ALL
SELECT 'approach',  id, name, NULL FROM lu_approach
UNION ALL
SELECT 'category',  id, name, NULL FROM lu_category
UNION ALL
SELECT 'region',    id, name, type FROM lu_region
UNION ALL
SELECT 'sector',    id, name, NULL FROM lu_sector
UNION ALL
SELECT 'lifecycle', id, name, en15978 FROM lu_lifecycle_stage
UNION ALL
SELECT 'map_region', id, name, NULL FROM lu_map_region
ORDER BY dimension, id;


-- ============================================================
-- 5. SAMPLE INSERT
-- ============================================================

-- A live Swiss coordinate-lookup model with full junction rows
INSERT INTO models (id, name, version, status, description, author, approach,
  complexity, maturity, last_updated, engine, test_data, card_image,
  license_type, license_name, license_url,
  source_name, source_url,
  map_region, jurisdiction_count, time_range, jurisdiction_codes,
  inputs, outputs, constraints_def)
VALUES (
  'geoadmin-hazards',
  'geo.admin.ch Hazard Layers',
  '2024',
  'live',
  'Swiss federal natural hazard indication maps via GeoAdmin REST API.',
  'swisstopo / BAFU / BFE / MeteoSwiss',
  'quantitative',
  2, 8,
  '2024-01-01',
  'js/engines/geoadmin-hazards.js',
  'models/geoadmin-hazards/test.csv',
  'assets/img/geoadmin-hazards.jpg',
  'free', 'OGD – Swiss federal open data', 'https://www.swisstopo.admin.ch/en/free-geodata-ogd',
  'swisstopo / BAFU', 'https://map.geo.admin.ch/',
  'switzerland', 1, 'Current + return periods', '["CH"]',
  -- inputs
  '[
    {"field":"latitude",  "label":"Latitude",      "type":"number", "required":true,  "description":"WGS84 latitude"},
    {"field":"longitude", "label":"Longitude",     "type":"number", "required":true,  "description":"WGS84 longitude"},
    {"field":"tolerance", "label":"Search radius", "type":"number", "required":false, "unit":"m", "default":50, "description":"Identify tolerance in metres"}
  ]',
  -- outputs
  '[
    {"field":"flood_hazard",      "label":"Flood hazard level",     "type":"string", "constraint":"HazardLevel"},
    {"field":"landslide_hazard",  "label":"Landslide hazard level", "type":"string", "constraint":"HazardLevel"},
    {"field":"avalanche_hazard",  "label":"Avalanche hazard level", "type":"string", "constraint":"HazardLevel"},
    {"field":"rockfall_hazard",   "label":"Rockfall hazard level",  "type":"string", "constraint":"HazardLevel"},
    {"field":"debris_flow_hazard","label":"Debris flow hazard",     "type":"string", "constraint":"HazardLevel"}
  ]',
  -- constraints (named value lists referenced by inputs/outputs)
  '{"HazardLevel":{"type":"enum","description":"BAFU indicative hazard classification","values":["Low","Medium","High","Very High"]}}'
);

INSERT INTO model_categories VALUES ('geoadmin-hazards', 'physical-risk');
INSERT INTO model_regions    VALUES ('geoadmin-hazards', 'CH');
INSERT INTO model_sectors    VALUES ('geoadmin-hazards', 'commercial');
INSERT INTO model_sectors    VALUES ('geoadmin-hazards', 'residential');
INSERT INTO model_lifecycle_stages VALUES ('geoadmin-hazards', 'Operation');
INSERT INTO model_tags       VALUES ('geoadmin-hazards', 'hazard');
INSERT INTO model_tags       VALUES ('geoadmin-hazards', 'flood');
INSERT INTO model_tags       VALUES ('geoadmin-hazards', 'avalanche');


-- ============================================================
-- 6. QUERY EXAMPLES
-- ============================================================

-- All live models with engine path
SELECT id, name, engine
FROM models WHERE status = 'live' ORDER BY name;

-- Models in a category (relational join, no JSON)
SELECT m.id, m.name, m.status
FROM models m
JOIN model_categories mc ON mc.model_id = m.id
WHERE mc.category_id = 'physical-risk'
ORDER BY m.name;

-- Multi-category AND filter
SELECT m.id, m.name
FROM models m
WHERE EXISTS (SELECT 1 FROM model_categories WHERE model_id=m.id AND category_id='physical-risk')
  AND EXISTS (SELECT 1 FROM model_categories WHERE model_id=m.id AND category_id='energy-performance');

-- Open-source Swiss models
SELECT m.id, m.name, m.license_name
FROM models m
JOIN model_regions mr ON mr.model_id = m.id
WHERE m.license_type = 'open-source' AND mr.region_id = 'CH'
ORDER BY m.name;

-- Count per category (with zero-counts)
SELECT lc.id, lc.name, count(mc.model_id) AS n
FROM lu_category lc
LEFT JOIN model_categories mc ON mc.category_id = lc.id
GROUP BY lc.id ORDER BY lc.sort_order;

-- Count per status
SELECT ls.id, ls.name, count(m.id) AS n
FROM lu_status ls
LEFT JOIN models m ON m.status = ls.id
GROUP BY ls.id ORDER BY n DESC;

-- Models that accept lat/lon (JSON query on inputs)
SELECT m.id, m.name
FROM models m, json_each(m.inputs) je
WHERE json_extract(je.value, '$.field') = 'latitude';

-- Models with named constraint definitions
SELECT id, name,
  (SELECT group_concat(key, ', ') FROM json_each(constraints_def)) AS constraint_names
FROM models WHERE constraints_def IS NOT NULL ORDER BY name;

-- Flat overview
SELECT id, name, status, license_type, map_region, categories, regions
FROM v_models ORDER BY status, name;

-- All filter options (for populating UI dropdowns)
SELECT dimension, id, name, extra FROM v_filter_options;

-- Validate: find models with unknown lifecycle stages
SELECT mls.model_id, mls.stage_id
FROM model_lifecycle_stages mls
LEFT JOIN lu_lifecycle_stage ls ON ls.id = mls.stage_id
WHERE ls.id IS NULL;

-- FK violation test (should fail)
-- INSERT INTO models (id, name, status) VALUES ('__test', 'Test', 'invalid');
-- → FOREIGN KEY constraint failed
