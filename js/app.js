// ============================================================
// climate-check — Model Directory
// ============================================================

const YEARS = Array.from({length:31}, (_,i) => 2020+i);
let models = [], currentModel = null, currentEngine = null, currentResults = [], charts = {};
let sortCol = 'strandingYear', sortAsc = true;
let filters = { q:'', categories:[], region:[], status:[], tags:[] };
let viewMode = 'gallery'; // gallery | list | map
let gallerySort = 'name'; // name | status | updated | region

// --- Icons ---
const ICON = {
  grid: '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><rect x="1" y="1" width="6" height="6" rx="1"/><rect x="9" y="1" width="6" height="6" rx="1"/><rect x="1" y="9" width="6" height="6" rx="1"/><rect x="9" y="9" width="6" height="6" rx="1"/></svg>',
  list: '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><rect x="1" y="2" width="14" height="2" rx="0.5"/><rect x="1" y="7" width="14" height="2" rx="0.5"/><rect x="1" y="12" width="14" height="2" rx="0.5"/></svg>',
  map: '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" stroke-width="1.3"/><ellipse cx="8" cy="8" rx="3" ry="6.5" fill="none" stroke="currentColor" stroke-width="1.1"/><line x1="1.5" y1="8" x2="14.5" y2="8" stroke="currentColor" stroke-width="1.1"/></svg>',
  back: '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M7.78 12.53a.75.75 0 01-1.06 0L2.47 8.28a.75.75 0 010-1.06l4.25-4.25a.75.75 0 011.06 1.06L4.81 7h7.44a.75.75 0 010 1.5H4.81l2.97 2.97a.75.75 0 010 1.06z"/></svg>',
};

// --- Helpers ---
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const fmt = v => v>=1e6?(v/1e6).toFixed(1)+'M':v>=1e3?(v/1e3).toFixed(0)+'K':v.toFixed(0);
const eur = v => '\u20AC'+fmt(v);
function riskTier(r) { if(!r.strandingYear) return 'low'; const d=r.strandingYear-r.reportingYear; return d<=5?'high':d<=15?'med':'low'; }
function riskName(t) { return {high:'High',med:'Medium',low:'Low'}[t]; }
function badge(t) {
  const c={high:'bgColor-danger-muted fgColor-danger',med:'bgColor-attention-muted fgColor-attention',low:'bgColor-success-muted fgColor-success'}[t]||'';
  return `<span class="IssueLabel ${c}">${riskName(t)}</span>`;
}
function strandTxt(r) { return r.strandingYear ? String(r.strandingYear) : 'Aligned'; }
function statusDot(s) {
  return s==='live'
    ? '<span class="IssueLabel bgColor-open-muted fgColor-open tag-click" data-g="status" data-v="live"><span aria-hidden="true">\u25cf</span> Live</span>'
    : '<span class="IssueLabel bgColor-attention-muted fgColor-attention tag-click" data-g="status" data-v="coming-soon"><span aria-hidden="true">\u25cb</span> Coming soon</span>';
}

// Search debounce
let _searchTimer = null;
function debounce(fn, ms) { return (...args) => { clearTimeout(_searchTimer); _searchTimer = setTimeout(() => fn(...args), ms); }; }

// ============================================================
// FILTER URL SYNC
// ============================================================
function filtersToParams() {
  const p = new URLSearchParams();
  if (filters.q) p.set('q', filters.q);
  if (filters.categories.length) p.set('categories', filters.categories.join(','));
  if (filters.region.length) p.set('region', filters.region.join(','));
  if (filters.status.length) p.set('status', filters.status.join(','));
  if (filters.tags.length) p.set('tags', filters.tags.join(','));
  if (viewMode !== 'gallery') p.set('view', viewMode);
  if (gallerySort !== 'name') p.set('sort', gallerySort);
  return p.toString();
}

function filtersFromParams() {
  const p = new URLSearchParams(location.search);
  filters.q = p.get('q') || '';
  filters.categories = p.get('categories') ? p.get('categories').split(',') : [];
  filters.region = p.get('region') ? p.get('region').split(',') : [];
  filters.status = p.get('status') ? p.get('status').split(',') : [];
  filters.tags = p.get('tags') ? p.get('tags').split(',') : [];
  viewMode = p.get('view') || 'gallery';
  gallerySort = p.get('sort') || 'name';
}

function pushFilterUrl() {
  const qs = filtersToParams();
  const url = location.pathname + (qs ? '?' + qs : '') + '#/';
  history.replaceState(null, '', url);
}

function galleryHref() {
  const qs = filtersToParams();
  return (qs ? '?' + qs : '') + '#/';
}

// ============================================================
// ROUTER
// ============================================================
async function route() {
  const h = location.hash || '#/';
  const m = h.match(/^#\/models\/([^/]+)/);
  if (m) { await showModel(m[1]); } else { filtersFromParams(); showGallery(); }
}

// ============================================================
// BOOT
// ============================================================
document.addEventListener('DOMContentLoaded', async () => {
  try {
    models = await fetch('data/models.json').then(r => { if (!r.ok) throw new Error('Failed to load'); return r.json(); });
  } catch(e) {
    $('#app').innerHTML = '<div class="gallery-empty"><p class="f3">Failed to load models</p><p class="f6 fgColor-muted">Check your connection and reload the page.</p></div>';
    return;
  }
  window.addEventListener('hashchange', route);
  await route();
});

// ============================================================
// GALLERY
// ============================================================
// Unsplash card images keyed by model id
const CARD_IMG = {
  'crrem-eu':    'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&h=300&fit=crop',
  'crrem-na':    'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=600&h=300&fit=crop',
  'pcaf':        'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=600&h=300&fit=crop',
  'sbti-crrem':  'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=600&h=300&fit=crop',
  'zero-tool':   'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=300&fit=crop',
  'ec3':         'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=300&fit=crop',
  'eu-levels':   'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=600&h=300&fit=crop',
  'ashrae-beq':  'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=600&h=300&fit=crop',
  'os-physrisk': 'https://images.unsplash.com/photo-1527482797697-8795b05a13fe?w=600&h=300&fit=crop',
  'ifc-bri':     'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?w=600&h=300&fit=crop',
  'energy-star': 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=600&h=300&fit=crop',
  'ngfs':        'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=600&h=300&fit=crop',
  'nabers':      'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=600&h=300&fit=crop',
  'ifc-edge':    'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=600&h=300&fit=crop',
  'crrem-apac':  'https://images.unsplash.com/photo-1480796927426-f609979314bd?w=600&h=300&fit=crop',
  'bafu-co2':    'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=600&h=300&fit=crop',
};

function addFilter(grp, val) {
  if (!filters[grp].includes(val)) filters[grp].push(val);
  pushFilterUrl();
  if (location.hash !== '#/') { location.hash = '#/'; } else { showGallery(); }
}
function removeFilter(grp, val) {
  filters[grp] = filters[grp].filter(x => x !== val);
  pushFilterUrl();
  showGallery();
}

// Build country→region map from model data
function countryRegionMap() {
  const m = {};
  models.forEach(mod => {
    const codes = mod.coverage && mod.coverage.jurisdictionCodes;
    if (codes) codes.forEach(c => { if (!m[c.toLowerCase()]) m[c.toLowerCase()] = mod.region[0]; });
  });
  return m;
}

// View toggle HTML
function viewToggleHtml() {
  const btn = (id, icon, label) => `<button class="view-btn${viewMode===id?' view-btn-active':''}" data-view="${id}" aria-label="${label}" title="${label}">${icon}</button>`;
  return `<div class="view-toggle" role="group" aria-label="View mode">${btn('gallery',ICON.grid,'Gallery view')}${btn('list',ICON.list,'List view')}${btn('map',ICON.map,'Map view')}</div>`;
}

// Render gallery card
function galleryCard(m) {
  const img = CARD_IMG[m.id] || m.image;
  const cats = (m.categories||[]);
  return `<div class="Box model-card" data-href="#/models/${m.id}">
    <div class="model-card-img-wrap">
      <img src="${img}" alt="${m.name}" class="model-card-img" loading="lazy">
      ${cats.length ? `<div class="model-card-cats">${cats.map(c => `<span class="cat-pill tag-click" data-g="categories" data-v="${c}">${c.replace(/-/g,' ')}</span>`).join('')}</div>` : ''}
      ${m.region.length ? `<div class="model-card-region">${m.region.map(r => `<span class="region-pill tag-click" data-g="region" data-v="${r}">${r}</span>`).join('')}</div>` : ''}
    </div>
    <div class="p-3">
      <div class="mb-1">
        <span class="f4 text-bold fgColor-default">${m.name}</span>
      </div>
      <p class="f6 fgColor-muted mb-2 line-clamp-2">${m.description}</p>
      <div class="d-flex flex-wrap gap-1">
        ${statusDot(m.status)}
        ${m.tags.slice(0,2).map(t=>`<span class="IssueLabel tag-click" data-g="tags" data-v="${t}">${t.replace(/-/g,' ')}</span>`).join('')}
      </div>
    </div>
  </div>`;
}

// Render list row
function listRow(m) {
  return `<tr class="border-bottom list-row" data-href="#/models/${m.id}" tabindex="0">
    <td class="py-2 px-3 text-bold">${m.name}</td>
    <td class="py-2 px-3">${statusDot(m.status)}</td>
    <td class="py-2 px-3">${(m.categories||[]).map(c=>`<span class="IssueLabel tag-click" data-g="categories" data-v="${c}">${c.replace(/-/g,' ')}</span>`).join(' ')}</td>
    <td class="py-2 px-3">${m.region.map(r=>`<span class="IssueLabel bgColor-accent-muted fgColor-accent tag-click" data-g="region" data-v="${r}">${r}</span>`).join('')}</td>
    <td class="py-2 px-3 fgColor-muted line-clamp-2">${m.description}</td>
  </tr>`;
}

function showGallery() {
  currentModel = null; currentEngine = null; currentResults = [];
  const app = $('#app');

  const vis = models.filter(m => {
    if (filters.q && !(m.name+' '+m.description).toLowerCase().includes(filters.q.toLowerCase())) return false;
    if (filters.categories.length && !filters.categories.some(c=>(m.categories||[]).includes(c))) return false;
    if (filters.region.length && !filters.region.some(r=>m.region.includes(r))) return false;
    if (filters.status.length && !filters.status.includes(m.status)) return false;
    if (filters.tags.length && !filters.tags.some(t=>m.tags.includes(t))) return false;
    return true;
  }).sort((a,b) => {
    if (gallerySort === 'updated') return (b.lastUpdated||'').localeCompare(a.lastUpdated||'');
    if (gallerySort === 'status') return (a.status==='live'?0:1) - (b.status==='live'?0:1) || a.name.localeCompare(b.name);
    if (gallerySort === 'region') return (a.region[0]||'').localeCompare(b.region[0]||'') || a.name.localeCompare(b.name);
    return a.name.localeCompare(b.name);
  });

  const activeFilters = [
    ...filters.categories.map(v => ({grp:'categories', val:v, lab:v.replace(/-/g,' ')})),
    ...filters.region.map(v => ({grp:'region', val:v, lab:v})),
    ...filters.status.map(v => ({grp:'status', val:v, lab:v==='live'?'Live':'Coming soon'})),
    ...filters.tags.map(v => ({grp:'tags', val:v, lab:v.replace(/-/g,' ')})),
  ];
  const hasFilters = activeFilters.length > 0;

  const allCats = [...new Set(models.flatMap(m=>m.categories||[]))].sort();
  const allReg = [...new Set(models.flatMap(m=>m.region))].sort();
  const allTags = [...new Set(models.flatMap(m=>m.tags))].sort();

  // Count models per filter value
  const countFor = (grp, val) => {
    return models.filter(m => {
      if (grp === 'categories') return (m.categories||[]).includes(val);
      if (grp === 'region') return m.region.includes(val);
      if (grp === 'status') return m.status === val;
      if (grp === 'tags') return m.tags.includes(val);
      return false;
    }).length;
  };

  const cb = (grp, val, lab) => {
    const checked = filters[grp].includes(val) ? ' checked' : '';
    const count = countFor(grp, val);
    return `<label class="filter-cb"><input type="checkbox" data-g="${grp}" data-v="${val}"${checked}><span>${lab}</span><span class="filter-count">${count}</span></label>`;
  };

  let h = `<div class="gallery-layout">
  <aside class="filter-panel" aria-label="Filter models">
    <div class="filter-panel-title">Filters</div>
    <div class="filter-group">
      <div class="filter-heading">Category</div>
      ${allCats.map(c => cb('categories', c, c.replace(/-/g,' '))).join('')}
    </div>
    <div class="filter-group">
      <div class="filter-heading">Region</div>
      ${allReg.map(r => cb('region', r, r)).join('')}
    </div>
    <div class="filter-group">
      <div class="filter-heading">Status</div>
      ${cb('status', 'live', 'Live')}
      ${cb('status', 'coming-soon', 'Coming soon')}
    </div>
    <div class="filter-group">
      <div class="filter-heading">Tags</div>
      ${allTags.slice(0,10).map(t => cb('tags', t, t.replace(/-/g,' '))).join('')}
      ${allTags.length > 10 ? `<div class="filter-tags-overflow" style="display:none">${allTags.slice(10).map(t => cb('tags', t, t.replace(/-/g,' '))).join('')}</div><button class="btn-link f6 mt-1" id="showAllTags">Show all ${allTags.length} tags</button>` : ''}
    </div>
  </aside>

  <section class="gallery-main">
    <div class="search-bar mb-3">
      <div class="gallery-search-wrap">
        <label for="gsearch" class="d-none">Search models</label>
        <svg class="gallery-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input class="gallery-search" type="search" id="gsearch" placeholder="Search models\u2026" value="${filters.q}" aria-label="Search models">
      </div>
      <div class="search-bar-controls">
        ${viewToggleHtml()}
        <select class="gallery-sort" id="gallerySort" aria-label="Sort models">
          <option value="name"${gallerySort==='name'?' selected':''}>A\u2013Z</option>
          <option value="updated"${gallerySort==='updated'?' selected':''}>Recently updated</option>
          <option value="status"${gallerySort==='status'?' selected':''}>Status</option>
          <option value="region"${gallerySort==='region'?' selected':''}>Region</option>
        </select>
      </div>
    </div>

    ${hasFilters ? `<div class="filter-bar" aria-label="Active filters">
      ${activeFilters.map(f => `<span class="filter-chip" data-g="${f.grp}" data-v="${f.val}">${f.lab}<button class="filter-chip-x" data-g="${f.grp}" data-v="${f.val}" aria-label="Remove ${f.lab} filter">\u00d7</button></span>`).join('')}
      <button class="filter-reset" id="resetFilters" aria-label="Reset all filters">Reset all</button>
    </div>` : ''}`;

  if (vis.length === 0) {
    h += `<div class="gallery-empty"><p class="f3">No models match your filters</p><p class="f6 fgColor-muted">Try removing some filters or clearing the search</p></div>`;
  } else if (viewMode === 'list') {
    h += `<div class="Box" style="overflow-x:auto"><table class="f6" style="width:100%;border-collapse:collapse" aria-label="Models list">
      <thead><tr class="bgColor-muted"><th class="py-2 px-3 text-left label-xs">Name</th><th class="py-2 px-3 text-left label-xs">Status</th><th class="py-2 px-3 text-left label-xs">Category</th><th class="py-2 px-3 text-left label-xs">Region</th><th class="py-2 px-3 text-left label-xs">Description</th></tr></thead>
      <tbody>${vis.map(m => listRow(m)).join('')}</tbody>
    </table></div>`;
  } else if (viewMode === 'map') {
    h += `<div id="galleryMap" class="coverage-map gallery-map-view"></div>`;
  } else {
    h += `<div class="model-grid">${vis.map(m => galleryCard(m)).join('')}</div>`;
  }

  h += `<p class="gallery-count">${vis.length} of ${models.length} models</p>
  </section>
  </div>`;
  app.innerHTML = h;
  pushFilterUrl();

  // Render map view
  if (viewMode === 'map') {
    renderGalleryMap();
  }

  // Events — mobile filter panel toggle
  const fp = $('.filter-panel-title');
  if (fp) fp.addEventListener('click', () => fp.closest('.filter-panel').classList.toggle('filter-panel-open'));
  // Events — sort
  $('#gallerySort').addEventListener('change', e => { gallerySort = e.target.value; showGallery(); });
  // Events — search (debounced)
  const searchHandler = debounce(() => { filters.q = $('#gsearch').value; showGallery(); }, 200);
  $('#gsearch').addEventListener('input', searchHandler);
  // Events — view toggle
  $$('.view-btn').forEach(b => b.addEventListener('click', () => {
    viewMode = b.dataset.view;
    showGallery();
  }));
  // Events — show all tags
  const sat = $('#showAllTags');
  if (sat) sat.addEventListener('click', () => {
    const overflow = $('.filter-tags-overflow');
    if (overflow) { overflow.style.display = 'block'; sat.remove(); }
  });
  // Events — sidebar checkboxes
  $$('.filter-cb input').forEach(el => el.addEventListener('change', () => {
    const g = el.dataset.g, v = el.dataset.v;
    if (el.checked) { if (!filters[g].includes(v)) filters[g].push(v); }
    else { filters[g] = filters[g].filter(x => x !== v); }
    showGallery();
  }));
  // Events — whole card / list row clickable
  $$('[data-href]').forEach(el => {
    el.addEventListener('click', () => { location.hash = el.dataset.href; });
    el.addEventListener('keydown', e => { if (e.key==='Enter') { e.preventDefault(); location.hash = el.dataset.href; } });
  });
  // Events — clickable IssueLabels add filter
  $$('.tag-click').forEach(el => el.addEventListener('click', e => {
    e.stopPropagation();
    addFilter(el.dataset.g, el.dataset.v);
  }));
  // Events — remove active filter chips
  $$('.filter-chip-x').forEach(b => b.addEventListener('click', () => {
    removeFilter(b.dataset.g, b.dataset.v);
  }));
  // Events — reset all filters
  const rst = $('#resetFilters');
  if (rst) rst.addEventListener('click', () => { filters.categories=[]; filters.region=[]; filters.status=[]; filters.tags=[]; showGallery(); });
}

// Gallery map view — load SVG, highlight covered countries, make clickable
async function renderGalleryMap() {
  const el = $('#galleryMap');
  if (!el) return;
  const svgText = await loadWorldMap();
  el.innerHTML = svgText;
  const svg = el.querySelector('svg');
  if (!svg) return;
  svg.removeAttribute('width');
  svg.removeAttribute('height');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', 'World map — click a highlighted country to filter by region');
  svg.style.width = '100%';
  svg.style.height = 'auto';

  const crMap = countryRegionMap();
  svg.querySelectorAll('path').forEach(p => p.classList.add('map-country'));

  // Highlight and make clickable
  Object.entries(crMap).forEach(([code, region]) => {
    const country = svg.querySelector('#' + code);
    if (!country) return;
    const paths = country.tagName === 'g' ? country.querySelectorAll('path') : [country];
    paths.forEach(p => {
      p.classList.add('map-active');
      p.style.cursor = 'pointer';
      p.addEventListener('click', () => { viewMode = 'gallery'; addFilter('region', region); });
    });
  });
}

// ============================================================
// MODEL PAGE
// ============================================================
let modelTab = 'about';

// ---- Coverage map: loads world-map.svg and highlights countries ----
let _worldMapSvg = null;
async function loadWorldMap() {
  if (_worldMapSvg) return _worldMapSvg;
  const resp = await fetch('assets/world-map.svg');
  _worldMapSvg = await resp.text();
  return _worldMapSvg;
}

async function renderCoverageMap(el, codes) {
  if (!el || !codes || !codes.length) return;
  const svgText = await loadWorldMap();
  el.innerHTML = svgText;
  const svg = el.querySelector('svg');
  if (!svg) return;
  svg.removeAttribute('width');
  svg.removeAttribute('height');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', codes.length + ' covered jurisdictions');
  svg.style.width = '100%';
  svg.style.height = 'auto';
  svg.querySelectorAll('path').forEach(p => p.classList.add('map-country'));
  codes.forEach(code => {
    const country = svg.querySelector('#' + code.toLowerCase());
    if (country) {
      if (country.tagName === 'g') {
        country.querySelectorAll('path').forEach(p => p.classList.add('map-active'));
      } else {
        country.classList.add('map-active');
      }
    }
  });
}

async function showModel(id) {
  const model = models.find(m=>m.id===id);
  if (!model) { location.hash='#/'; return; }
  currentModel = model; currentResults = [];
  const app = $('#app');
  const live = model.status === 'live';
  const cov = model.coverage || {};
  const img = CARD_IMG[model.id] || model.image;

  // Tabs: always show all three
  const tabs = [
    { id:'about', label:'About' },
    { id:'schema', label:'Schema' },
    { id:'tryit', label:'Try It' },
  ];
  if (!tabs.find(t=>t.id===modelTab)) modelTab = 'about';

  let h = `
  <nav class="breadcrumb mb-3" aria-label="Breadcrumb">
    <a href="${galleryHref()}">Models</a>
    <span class="breadcrumb-sep" aria-hidden="true">/</span>
    <span class="fgColor-muted">${model.name}</span>
  </nav>

  <div class="model-header mb-4">
    <div class="d-flex gap-4 flex-items-start">
      <div class="model-header-img-wrap"><img src="${img}" alt="${model.name}" class="model-header-img"></div>
      <div style="flex:1;min-width:0">
        <div class="d-flex flex-justify-between flex-items-start gap-3">
          <div>
            <div class="d-flex flex-items-center gap-2 mb-1 flex-wrap">
              <h1 class="f2">${model.name}</h1>
              ${model.version?`<span class="f6 fgColor-muted">v${model.version}</span>`:''}
            </div>
            <p class="fgColor-muted mb-2">${model.description}</p>
          </div>
          <a href="${galleryHref()}" class="btn btn-sm flex-shrink-0" aria-label="Back to models">${ICON.back} Back</a>
        </div>
        <div class="d-flex flex-wrap gap-1 mb-2">
          ${statusDot(model.status)}
          ${model.tags.map(t=>`<span class="IssueLabel tag-click tag-nav" data-g="tags" data-v="${t}">${t.replace(/-/g,' ')}</span>`).join('')}
          ${model.region.map(r=>`<span class="IssueLabel bgColor-accent-muted fgColor-accent tag-click tag-nav" data-g="region" data-v="${r}">${r}</span>`).join('')}
        </div>
      </div>
    </div>
  </div>

  <div class="tab-bar" role="tablist" aria-label="Model sections">
    ${tabs.map(t=>`<button class="tab-btn${modelTab===t.id?' tab-active':''}" data-tab="${t.id}" role="tab" aria-selected="${modelTab===t.id}" aria-controls="pane-${t.id}">${t.label}</button>`).join('')}
  </div>

  <div class="tab-content">`;

  // ---- About tab ----
  h += `<div class="tab-pane${modelTab==='about'?' tab-pane-active':''}" data-pane="about" id="pane-about" role="tabpanel">
    <p class="mb-4">${model.longDescription||model.description}</p>`;

  // Model details section
  const detailRows = [];
  if (model.version) detailRows.push(['Version', model.version]);
  if (model.source && model.source.url) detailRows.push(['Project', `<a href="${model.source.url}" target="_blank" rel="noopener">${model.source.url.replace(/^https?:\/\/(www\.)?/,'')}</a>`]);
  if (model.source && model.source.methodology) detailRows.push(['Methodology', `<a href="${model.source.methodology}" target="_blank" rel="noopener">Documentation \u2197</a>`]);
  if (model.author) detailRows.push(['Author', model.author]);
  if (model.scenario) detailRows.push(['Scenario', model.scenario]);
  if (model.scope) detailRows.push(['Scope', model.scope]);
  if (model.lastUpdated) detailRows.push(['Last updated', model.lastUpdated]);
  if (model.license) detailRows.push(['License', model.license.url ? `<a href="${model.license.url}" target="_blank" rel="noopener">${model.license.name}</a>` : model.license.name]);
  if (model.adoptedBy && model.adoptedBy.length) detailRows.push(['Adopted by', model.adoptedBy.join(', ')]);
  if (model.citation) detailRows.push(['Citation', `<span class="text-mono f6">${model.citation}</span>`]);

  if (detailRows.length) {
    h += `<details class="schema-section" open>
      <summary class="schema-header"><span class="chev"></span>Details <span class="Counter ml-1">${detailRows.length}</span></summary>
      <dl class="detail-list mt-1 mb-3">
        ${detailRows.map(([k,v]) => `<div class="detail-row"><dt>${k}</dt><dd>${v}</dd></div>`).join('')}
      </dl>
    </details>`;
  }

  // Limitations
  if (model.limitations && model.limitations.length) {
    h += `<details class="schema-section">
      <summary class="schema-header"><span class="chev"></span>Limitations <span class="Counter ml-1">${model.limitations.length}</span></summary>
      <ul class="limitations-list mt-1 mb-3">
        ${model.limitations.map(l => `<li>${l}</li>`).join('')}
      </ul>
    </details>`;
  }

  // Jurisdictions (before property types)
  if (cov.jurisdictionCodes && cov.jurisdictionCodes.length) {
    h += `<details class="schema-section" open>
      <summary class="schema-header"><span class="chev"></span>Jurisdictions <span class="Counter ml-1">${cov.jurisdictionCount}</span></summary>
      <div id="coverageMap" class="coverage-map mt-1 mb-3"></div>
    </details>`;
  }

  // Property types
  if (cov.propertyTypeList && cov.propertyTypeList.length) {
    h += `<details class="schema-section">
      <summary class="schema-header"><span class="chev"></span>Property Types <span class="Counter ml-1">${cov.propertyTypeCount}</span></summary>
      <ul class="coverage-list mt-1 mb-3">
        ${cov.propertyTypeList.map(t => `<li>${t}</li>`).join('')}
      </ul>
    </details>`;
  }

  h += '</div>';

  // ---- Schema tab ----
  h += `<div class="tab-pane${modelTab==='schema'?' tab-pane-active':''}" data-pane="schema" id="pane-schema" role="tabpanel">`;

  if (model.inputs.length) {
    let lastG = '';
    h += `<details class="schema-section" open>
      <summary class="schema-header"><span class="chev"></span>Inputs <span class="Counter ml-1">${model.inputs.length}</span></summary>
      <div class="border rounded-2 mt-2 mb-4" style="overflow-x:auto"><table class="f6" style="width:100%;border-collapse:collapse" aria-label="Input fields">
        <thead><tr class="bgColor-muted"><th class="py-2 px-3 text-left label-xs">Field</th><th class="py-2 px-3 label-xs"></th><th class="py-2 px-3 text-left label-xs">Type</th><th class="py-2 px-3 text-left label-xs">Description</th></tr></thead><tbody>`;
    model.inputs.forEach(inp => {
      if (inp.group && inp.group !== lastG) { lastG = inp.group; h += `<tr class="bgColor-muted"><td colspan="4" class="py-1 px-3 text-bold label-xs">${inp.group}</td></tr>`; }
      h += `<tr class="border-bottom"><td class="py-1 px-3"><code class="f6">${inp.field}</code></td><td class="py-1 px-3">${inp.required?'<span class="IssueLabel bgColor-open-muted fgColor-open">req</span>':''}</td><td class="py-1 px-3 fgColor-muted">${inp.type}${inp.unit?' ('+inp.unit+')':''}</td><td class="py-1 px-3 fgColor-muted">${inp.description}</td></tr>`;
    });
    h += '</tbody></table></div></details>';
  }

  if (model.outputs.length) {
    h += `<details class="schema-section" open>
      <summary class="schema-header"><span class="chev"></span>Outputs <span class="Counter ml-1">${model.outputs.length}</span></summary>
      <div class="border rounded-2 mt-2" style="overflow-x:auto"><table class="f6" style="width:100%;border-collapse:collapse" aria-label="Output fields">
        <thead><tr class="bgColor-muted"><th class="py-2 px-3 text-left label-xs">Output</th><th class="py-2 px-3 text-left label-xs">Unit</th><th class="py-2 px-3 text-left label-xs">Description</th></tr></thead><tbody>`;
    model.outputs.forEach(o => {
      h += `<tr class="border-bottom"><td class="py-1 px-3 text-bold">${o.label}</td><td class="py-1 px-3 fgColor-muted">${o.unit||o.type||''}</td><td class="py-1 px-3 fgColor-muted">${o.description}</td></tr>`;
    });
    h += '</tbody></table></div></details>';
  }

  if (!model.inputs.length && !model.outputs.length) {
    h += '<div class="tab-empty"><p class="f5 fgColor-muted">Schema under development</p><p class="f6 fgColor-faint">Input and output definitions will be published when this model is live.</p></div>';
  }

  h += '</div>';

  // ---- Try It tab ----
  h += `<div class="tab-pane${modelTab==='tryit'?' tab-pane-active':''}" data-pane="tryit" id="pane-tryit" role="tabpanel">`;

  if (live) {
    h += `<div class="drop p-5 text-center mb-3" id="dropZone" role="button" tabindex="0" aria-label="Upload CSV file">
        <p class="f5 mb-1"><strong>Drop CSV here</strong> or click to browse</p>
        <p class="f6 fgColor-muted">Headers should match the Schema tab</p>
        <input type="file" id="fileInput" accept=".csv">
      </div>
      <div class="d-flex flex-justify-center gap-3 f6">
        <button class="btn-link" id="dlTpl">Download template</button>
        <span class="fgColor-muted">\u00b7</span>
        <button class="btn-link" id="ldDemo">Load demo data</button>
      </div>
      <div id="status" class="mt-3 f6" role="status" aria-live="polite"></div>`;
  } else {
    h += '<div class="tab-empty"><p class="f5 fgColor-muted">Coming soon</p><p class="f6 fgColor-faint">This model is under development. The calculator will be available when the engine is ready.</p></div>';
  }

  h += '</div>';

  h += '</div>';
  h += '<div id="results"></div>';

  app.innerHTML = h;

  // Tab switching (accessible)
  $$('.tab-btn').forEach(btn => btn.addEventListener('click', () => {
    modelTab = btn.dataset.tab;
    $$('.tab-btn').forEach(b => { b.classList.toggle('tab-active', b.dataset.tab===modelTab); b.setAttribute('aria-selected', b.dataset.tab===modelTab); });
    $$('.tab-pane').forEach(p => p.classList.toggle('tab-pane-active', p.dataset.pane===modelTab));
  }));

  // Clickable IssueLabels → navigate to gallery with filter
  $$('.tag-click').forEach(el => el.addEventListener('click', e => {
    e.stopPropagation();
    addFilter(el.dataset.g, el.dataset.v);
  }));

  // Render coverage map
  if (cov.jurisdictionCodes) {
    renderCoverageMap($('#coverageMap'), cov.jurisdictionCodes);
  }

  // Load engine
  if (live && model.engine) {
    await initEngine(model);
    wireEvents();
  }
}

async function initEngine(model) {
  const map = { 'crrem-eu': 'CrremEU' };
  currentEngine = window[map[model.id]];
  if (!currentEngine) return;
  if (!currentEngine._ready) {
    await currentEngine.init(model.database);
    currentEngine._ready = true;
  }
}

function wireEvents() {
  const dz = $('#dropZone'), fi = $('#fileInput');
  if (!dz) return;
  dz.addEventListener('click', () => fi.click());
  dz.addEventListener('keydown', e => { if(e.key==='Enter'||e.key===' '){e.preventDefault();fi.click();} });
  dz.addEventListener('dragover', e => { e.preventDefault(); dz.classList.add('dragover'); });
  dz.addEventListener('dragleave', () => dz.classList.remove('dragover'));
  dz.addEventListener('drop', e => { e.preventDefault(); dz.classList.remove('dragover'); if(e.dataTransfer.files.length) readFile(e.dataTransfer.files[0]); });
  fi.addEventListener('change', () => { if(fi.files.length) readFile(fi.files[0]); });
  $('#dlTpl').addEventListener('click', () => {
    const b = new Blob([currentEngine.generateTemplate()],{type:'text/csv'});
    const u = URL.createObjectURL(b);
    Object.assign(document.createElement('a'),{href:u,download:currentModel.id+'-template.csv'}).click();
    URL.revokeObjectURL(u);
  });
  $('#ldDemo').addEventListener('click', loadDemo);
}

async function loadDemo() {
  if (!currentModel||!currentEngine) return;
  const st = $('#status');
  st.innerHTML = '<span class="fgColor-muted">Loading demo\u2026</span>';
  try {
    const txt = await fetch(currentModel.testData).then(r=>r.text());
    processCSV(txt, 'demo');
  } catch(e) { st.innerHTML = `<span class="fgColor-danger">${e.message}</span>`; }
}

function readFile(f) {
  if (!f.name.endsWith('.csv')) { $('#status').innerHTML='<span class="fgColor-danger">Need .csv file</span>'; return; }
  const r = new FileReader();
  r.onload = e => processCSV(e.target.result, f.name);
  r.readAsText(f);
}

function processCSV(txt, label) {
  const assets = currentEngine.parseCSV(txt);
  const st = $('#status');
  if (!assets.length) { st.innerHTML='<span class="fgColor-danger">No valid rows</span>'; return; }
  const res = assets.map(a => { const e=currentEngine.validate(a); return e.length?{error:e.join(', '),name:a.name}:currentEngine.calculate(a); });
  const ok = res.filter(r=>!r.error), bad = res.filter(r=>r.error);
  let msg = `<span class="fgColor-open">${ok.length} asset(s) processed from ${label}.</span>`;
  if (bad.length) msg += `<br><span class="fgColor-attention">${bad.length} skipped: ${bad.map(r=>r.name).join(', ')}</span>`;
  st.innerHTML = msg;
  if (ok.length) { currentResults = ok; renderDashboard(); }
}

// ============================================================
// RESULTS DASHBOARD
// ============================================================
function renderDashboard() {
  const el = $('#results'); if (!el) return;
  const R = currentResults, n = R.length;
  const hi = R.filter(r=>riskTier(r)==='high'), md = R.filter(r=>riskTier(r)==='med'), lo = R.filter(r=>riskTier(r)==='low');
  const tExc = R.reduce((a,r)=>a+r.cumulativeExcess,0);
  const tNPV = R.reduce((a,r)=>a+r.npvExcessCosts,0);
  const tArea = R.reduce((a,r)=>a+r.floorArea,0);
  const wCI = tArea>0?R.reduce((a,r)=>a+r.baselineCarbonIntensity*r.floorArea,0)/tArea:0;
  const hP=n?(hi.length/n*100):0, mP=n?(md.length/n*100):0, lP=n?(lo.length/n*100):0;

  const sorted = [...R].sort((a,b) => {
    let x,y;
    if(sortCol==='strandingYear'){x=a.strandingYear||2099;y=b.strandingYear||2099;}
    else if(sortCol==='name'){x=a.name.toLowerCase();y=b.name.toLowerCase();}
    else if(sortCol==='ci'){x=a.baselineCarbonIntensity;y=b.baselineCarbonIntensity;}
    else if(sortCol==='excess'){x=a.cumulativeExcess;y=b.cumulativeExcess;}
    else if(sortCol==='npv'){x=a.npvExcessCosts;y=b.npvExcessCosts;}
    else{x=0;y=0;}
    return sortAsc?(x<y?-1:x>y?1:0):(x>y?-1:x<y?1:0);
  });

  const th = (c,l) => { const ar=sortCol===c?(sortAsc?'\u25B2':'\u25BC'):'\u25B4'; return `<th class="py-2 px-3 text-uppercase label-xs${sortCol===c?' sorted':''}" data-s="${c}">${l}<span class="sa">${ar}</span></th>`; };

  let h = `<div class="slideup">
  <div class="gk mb-4">
    <div class="Box p-3 kpi-d"><div class="label-xs">High (\u22645yr)</div><div class="f2 text-bold fgColor-danger">${hi.length}<span class="f5 fgColor-muted">/${n}</span></div></div>
    <div class="Box p-3 kpi-a"><div class="label-xs">Med (5-15yr)</div><div class="f2 text-bold fgColor-attention">${md.length}<span class="f5 fgColor-muted">/${n}</span></div></div>
    <div class="Box p-3 kpi-s"><div class="label-xs">Low/Aligned</div><div class="f2 text-bold fgColor-success">${lo.length}<span class="f5 fgColor-muted">/${n}</span></div></div>
    <div class="Box p-3"><div class="label-xs">Excess</div><div class="f2 text-bold">${fmt(tExc/1000)}<span class="f5 fgColor-muted"> tCO2e</span></div></div>
    <div class="Box p-3"><div class="label-xs">NPV Cost</div><div class="f2 text-bold">${eur(tNPV)}</div></div>
    <div class="Box p-3"><div class="label-xs">Avg CI</div><div class="f2 text-bold">${wCI.toFixed(1)}<span class="f5 fgColor-muted"> kgCO2e/m\u00B2</span></div></div>
  </div>

  <div class="Box p-3 mb-4">
    <div class="rbar mb-2" role="img" aria-label="Risk distribution: ${hi.length} high, ${md.length} medium, ${lo.length} low">${hP?`<div class="rd" style="width:${hP}%">${hi.length}</div>`:''}${mP?`<div class="ra" style="width:${mP}%">${md.length}</div>`:''}${lP?`<div class="rs" style="width:${lP}%">${lo.length}</div>`:''}</div>
    <div class="d-flex gap-3 f6 fgColor-muted">
      <span><span class="d-inline-block rounded-1 mr-1" style="width:8px;height:8px;background:var(--bgColor-danger-emphasis)"></span>High</span>
      <span><span class="d-inline-block rounded-1 mr-1" style="width:8px;height:8px;background:var(--bgColor-attention-emphasis)"></span>Medium</span>
      <span><span class="d-inline-block rounded-1 mr-1" style="width:8px;height:8px;background:var(--bgColor-success-emphasis)"></span>Low / Aligned</span>
    </div>
  </div>

  <div class="Box mb-4">
    <div class="Box-header d-flex flex-justify-between flex-items-center">
      <strong>Portfolio</strong><span class="f6 fgColor-muted">Click row to drill down</span>
    </div>
    <div class="ptable-wrap"><table class="f6" style="width:100%;border-collapse:collapse" aria-label="Portfolio assets">
      <thead><tr class="bgColor-muted">${th('name','Asset')}${th('strandingYear','Stranding')}${th('ci','CI')}${th('excess','Excess (t)')}${th('npv','NPV')}<th class="py-2 px-3 label-xs">Risk</th></tr></thead>
      <tbody>`;

  sorted.forEach(r => {
    h += `<tr class="border-bottom" data-i="${R.indexOf(r)}" tabindex="0"><td class="py-2 px-3 text-bold">${r.name}<br><span class="f6 fgColor-muted text-normal">${r.country} \u00b7 ${r.propertyType}</span></td><td class="py-2 px-3">${strandTxt(r)}</td><td class="py-2 px-3 text-right text-mono">${r.baselineCarbonIntensity.toFixed(1)}</td><td class="py-2 px-3 text-right text-mono">${(r.cumulativeExcess/1000).toFixed(0)}</td><td class="py-2 px-3 text-right text-mono">${eur(r.npvExcessCosts)}</td><td class="py-2 px-3">${badge(riskTier(r))}</td></tr>`;
  });
  h += '</tbody></table></div></div><div id="detail"></div></div>';

  el.innerHTML = h;

  el.querySelectorAll('th[data-s]').forEach(t => t.addEventListener('click', () => {
    const c=t.dataset.s; if(sortCol===c)sortAsc=!sortAsc; else{sortCol=c;sortAsc=true;} renderDashboard();
  }));
  el.querySelectorAll('tr[data-i]').forEach(tr => {
    const go = () => { el.querySelectorAll('tr.sel').forEach(e=>e.classList.remove('sel')); tr.classList.add('sel'); showDetail(R[parseInt(tr.dataset.i)]); };
    tr.addEventListener('click', go);
    tr.addEventListener('keydown', e => { if(e.key==='Enter'||e.key===' '){e.preventDefault();go();} });
  });
}

// ============================================================
// ASSET DETAIL
// ============================================================
function showDetail(r) {
  const el = $('#detail'); if (!el) return;
  const t = riskTier(r);
  const kc = {high:'kpi-d',med:'kpi-a',low:'kpi-s'}[t];
  const fc = {high:'fgColor-danger',med:'fgColor-attention',low:'fgColor-success'}[t];

  let h = `<div class="Box slideup mt-4 p-4">
    <div class="d-flex flex-justify-between flex-items-start pb-3 mb-3 border-bottom">
      <div><h2 class="f3 mb-1">${r.name} ${badge(t)}</h2><p class="f6 fgColor-muted">${r.country} \u00b7 ${r.propertyType} \u00b7 ${r.floorArea.toLocaleString()} m\u00B2 \u00b7 ${r.reportingYear}</p></div>
      <button class="btn-octicon" id="closeD" aria-label="Close detail"><svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M3.72 3.72a.75.75 0 011.06 0L8 6.94l3.22-3.22a.75.75 0 111.06 1.06L9.06 8l3.22 3.22a.75.75 0 11-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 01-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 010-1.06z"/></svg></button>
    </div>
    <div class="ins p-3 mb-4 f5">${insight(r)}</div>
    <div class="gk mb-4">
      <div class="Box p-3 ${kc}"><div class="label-xs">Stranding</div><div class="f2 text-bold ${fc}">${strandTxt(r)}</div></div>
      <div class="Box p-3"><div class="label-xs">CI</div><div class="f3 text-bold">${r.baselineCarbonIntensity.toFixed(1)}<span class="f6 fgColor-muted"> kgCO2e/m\u00B2</span></div></div>
      <div class="Box p-3"><div class="label-xs">EUI</div><div class="f3 text-bold">${r.baselineEUI.toFixed(0)}<span class="f6 fgColor-muted"> kWh/m\u00B2</span></div></div>
      <div class="Box p-3"><div class="label-xs">Excess</div><div class="f3 text-bold">${(r.cumulativeExcess/1000).toFixed(0)}<span class="f6 fgColor-muted"> tCO2e</span></div></div>
      <div class="Box p-3"><div class="label-xs">NPV Cost</div><div class="f3 text-bold">${eur(r.npvExcessCosts)}</div></div>
      <div class="Box p-3"><div class="label-xs">CVaR</div><div class="f3 text-bold">${r.cvar!==null?r.cvar.toFixed(2)+'%':'N/A'}</div></div>
    </div>`;

  if (r.strandingYear) {
    const pct = ((r.strandingYear-2020)/30*100).toFixed(1);
    h += `<div class="mb-4"><div class="tbar" role="img" aria-label="Stranding timeline: ${r.strandingYear}"><div class="tok" style="flex:${pct}"></div><div class="tst" style="flex:${100-parseFloat(pct)}"></div></div><div class="d-flex flex-justify-between f6 fgColor-muted mt-1"><span>2020</span><span>${r.strandingYear}</span><span>2050</span></div></div>`;
  }

  h += `<div class="g2 mb-4"><div class="Box p-3"><div class="label-xs mb-2">Carbon Intensity</div><div class="cht"><canvas id="ch1"></canvas></div></div><div class="Box p-3"><div class="label-xs mb-2">Excess Costs</div><div class="cht"><canvas id="ch2"></canvas></div></div></div>`;

  h += `<details><summary class="f5 text-bold" style="cursor:pointer">Year-by-year data</summary><div class="mt-3 border rounded-2" style="max-height:360px;overflow-y:auto"><table class="f6" style="width:100%;border-collapse:collapse" aria-label="Year-by-year projections"><thead><tr class="bgColor-muted"><th class="py-1 px-3 text-left label-xs" style="position:sticky;top:0;background:var(--bgColor-muted)">Year</th><th class="py-1 px-3 text-right label-xs" style="position:sticky;top:0;background:var(--bgColor-muted)">Asset CI</th><th class="py-1 px-3 text-right label-xs" style="position:sticky;top:0;background:var(--bgColor-muted)">Pathway</th><th class="py-1 px-3 text-right label-xs" style="position:sticky;top:0;background:var(--bgColor-muted)">Excess</th><th class="py-1 px-3 text-right label-xs" style="position:sticky;top:0;background:var(--bgColor-muted)">Cost</th></tr></thead><tbody>`;
  for (let y=0;y<31;y++) {
    const x=Math.max(0,r.projectedCI[y]-r.carbonPathway[y]);
    h += `<tr class="border-bottom${x>0?' xr':''}"><td class="py-1 px-3">${YEARS[y]}</td><td class="py-1 px-3 text-right text-mono">${r.projectedCI[y].toFixed(2)}</td><td class="py-1 px-3 text-right text-mono">${r.carbonPathway[y].toFixed(2)}</td><td class="py-1 px-3 text-right text-mono${x>0?' fgColor-danger':''}">${x>0?x.toFixed(2):'\u2014'}</td><td class="py-1 px-3 text-right text-mono">${r.annualExcessCosts[y]>0?eur(r.annualExcessCosts[y]):'\u2014'}</td></tr>`;
  }
  h += '</tbody></table></div></details></div>';

  el.innerHTML = h;
  $('#closeD').addEventListener('click', () => { el.innerHTML=''; $$('tr.sel').forEach(e=>e.classList.remove('sel')); });

  Object.values(charts).forEach(c=>{if(c)c.destroy();});
  const co = (yl,tf) => ({responsive:true,maintainAspectRatio:false,interaction:{mode:'index',intersect:false},plugins:{legend:{position:'top',labels:{usePointStyle:true,pointStyle:'line',font:{size:11}}},tooltip:{callbacks:{label:c=>c.dataset.label+': '+tf(c.parsed.y)}}},scales:{x:{ticks:{maxTicksLimit:8,font:{size:10}},grid:{display:false}},y:{beginAtZero:true,title:{display:true,text:yl,font:{size:10}},ticks:{font:{size:10}}}}});

  charts.c1 = new Chart($('#ch1').getContext('2d'), {type:'line',data:{labels:YEARS,datasets:[
    {label:'Asset',data:r.projectedCI,borderColor:'#cf222e',borderWidth:2.5,pointRadius:0,tension:.2,fill:false},
    {label:'Pathway',data:r.carbonPathway,borderColor:'#1f883d',backgroundColor:'rgba(31,136,61,.06)',borderWidth:2.5,pointRadius:0,tension:.2,fill:true}
  ]},options:co('kgCO2e/m\u00B2',v=>v.toFixed(1))});

  charts.c2 = new Chart($('#ch2').getContext('2d'), {type:'bar',data:{labels:YEARS,datasets:[
    {data:r.annualExcessCosts,backgroundColor:r.annualExcessCosts.map(v=>v>0?'rgba(207,34,46,.45)':'rgba(31,136,61,.12)'),borderRadius:2}
  ]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>eur(c.parsed.y)}}},scales:{x:{ticks:{maxTicksLimit:8,font:{size:10}},grid:{display:false}},y:{beginAtZero:true,ticks:{callback:v=>eur(v),font:{size:10}}}}}});

  el.scrollIntoView({behavior:'smooth',block:'start'});
}

function insight(r) {
  if (!r.strandingYear) return `<strong>${r.name}</strong> stays aligned with the 1.5\u00B0C pathway through 2050 at ${r.baselineCarbonIntensity.toFixed(1)} kgCO2e/m\u00B2. No immediate action needed.`;
  const yl = r.strandingYear - r.reportingYear;
  const t = riskTier(r);
  const u = t==='high'?`<strong>High priority</strong> \u2014 strands in ${yl}yr, transition risk is imminent. `:t==='med'?`<strong>Medium risk</strong> \u2014 ${yl}yr until stranding. Start planning now. `:`${yl}yr runway provides time for action. `;
  return `<strong>${r.name}</strong> strands in <strong>${r.strandingYear}</strong>. ${u}Excess: <strong>${(r.cumulativeExcess/1000).toFixed(0)} tCO2e</strong>. ${r.npvExcessCosts>0?'NPV cost: <strong>'+eur(r.npvExcessCosts)+'</strong>. ':''}Consider efficiency retrofits or fuel switching.`;
}
