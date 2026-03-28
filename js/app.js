// ============================================================
// climate-check — Model Directory
// ============================================================

const YEARS = Array.from({length:31}, (_,i) => 2020+i);
let models = [], currentModel = null, currentEngine = null, currentResults = [], charts = {};
let sortCol = 'strandingYear', sortAsc = true;
let filters = { q:'', categories:[], lifecycle:[], license:[], region:[], status:[], tags:[] };
let viewMode = 'gallery'; // gallery | list | map
let gallerySort = 'name'; // name | status | updated | region

const ICON = {
  grid: '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><rect x="1" y="1" width="6" height="6" rx="1"/><rect x="9" y="1" width="6" height="6" rx="1"/><rect x="1" y="9" width="6" height="6" rx="1"/><rect x="9" y="9" width="6" height="6" rx="1"/></svg>',
  list: '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><rect x="1" y="2" width="14" height="2" rx="0.5"/><rect x="1" y="7" width="14" height="2" rx="0.5"/><rect x="1" y="12" width="14" height="2" rx="0.5"/></svg>',
  map: '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" stroke-width="1.3"/><ellipse cx="8" cy="8" rx="3" ry="6.5" fill="none" stroke="currentColor" stroke-width="1.1"/><line x1="1.5" y1="8" x2="14.5" y2="8" stroke="currentColor" stroke-width="1.1"/></svg>',
  back: '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M7.78 12.53a.75.75 0 01-1.06 0L2.47 8.28a.75.75 0 010-1.06l4.25-4.25a.75.75 0 011.06 1.06L4.81 7h7.44a.75.75 0 010 1.5H4.81l2.97 2.97a.75.75 0 010 1.06z"/></svg>',
  scatter: '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><circle cx="4" cy="5" r="2"/><circle cx="10" cy="3" r="2"/><circle cx="7" cy="10" r="2"/><circle cx="13" cy="8" r="2"/><line x1="1" y1="15" x2="1" y2="1" stroke="currentColor" stroke-width="1.2" fill="none"/><line x1="1" y1="15" x2="15" y2="15" stroke="currentColor" stroke-width="1.2" fill="none"/></svg>',
};

const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const fmt = v => v>=1e6?(v/1e6).toFixed(1)+'M':v>=1e3?(v/1e3).toFixed(0)+'K':v.toFixed(0);
const eur = v => '\u20AC'+fmt(v);
const humanize = s => s.replace(/-/g, ' ');
const COUNTRY_NAMES = {
  at:'Austria',au:'Australia',be:'Belgium',bg:'Bulgaria',br:'Brazil',ca:'Canada',ch:'Switzerland',
  cn:'China',cy:'Cyprus',cz:'Czech Republic',de:'Germany',dk:'Denmark',ee:'Estonia',es:'Spain',
  fi:'Finland',fr:'France',gb:'United Kingdom',gr:'Greece',hk:'Hong Kong',hr:'Croatia',hu:'Hungary',
  ie:'Ireland',in:'India',it:'Italy',jp:'Japan',kr:'South Korea',lt:'Lithuania',lu:'Luxembourg',
  lv:'Latvia',mt:'Malta',my:'Malaysia',nl:'Netherlands',no:'Norway',nz:'New Zealand',ph:'Philippines',
  pl:'Poland',pt:'Portugal',ro:'Romania',se:'Sweden',sg:'Singapore',si:'Slovenia',sk:'Slovakia',
  us:'United States'
};
const LIFECYCLE_PHASES = ['Planning','Production','Construction','Operation','End of life','Circularity'];
function riskTier(r) { if(!r.strandingYear) return 'low'; const d=r.strandingYear-r.reportingYear; return d<=5?'high':d<=15?'med':'low'; }
function riskName(t) { return {high:'High',med:'Medium',low:'Low'}[t]; }
function badge(t) {
  const c={high:'bgColor-danger-muted fgColor-danger',med:'bgColor-attention-muted fgColor-attention',low:'bgColor-success-muted fgColor-success'}[t]||'';
  return `<span class="IssueLabel ${c}">${riskName(t)}</span>`;
}
function strandTxt(r) { return r.strandingYear ? String(r.strandingYear) : 'Aligned'; }
function statusDot(s) {
  return s==='live'
    ? '<span class="IssueLabel bgColor-open-muted fgColor-open tag-click" data-g="status" data-v="live">Live</span>'
    : '<span class="IssueLabel bgColor-attention-muted fgColor-attention tag-click" data-g="status" data-v="coming-soon">Coming soon</span>';
}

function debounce(fn, ms) { let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); }; }

// ============================================================
// FILTER URL SYNC
// ============================================================
function filtersToParams() {
  const p = new URLSearchParams();
  if (filters.q) p.set('q', filters.q);
  if (filters.categories.length) p.set('categories', filters.categories.join(','));
  if (filters.lifecycle.length) p.set('lifecycle', filters.lifecycle.join(','));
  if (filters.license.length) p.set('license', filters.license.join(','));
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
  filters.lifecycle = p.get('lifecycle') ? p.get('lifecycle').split(',') : [];
  filters.license = p.get('license') ? p.get('license').split(',') : [];
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
  if (h === '#/api') { showApiDocs(); return; }
  const m = h.match(/^#\/models\/([^/]+)(?:\/(\w+))?/);
  if (m) {
    modelTab = m[2] || 'about';
    await showModel(m[1]);
  } else {
    filtersFromParams(); showGallery();
  }
}

// ============================================================
// BOOT
// ============================================================
document.addEventListener('DOMContentLoaded', async () => {
  try {
    models = await fetch('data/models.json').then(r => { if (!r.ok) throw new Error('Failed to load'); return r.json(); });
    cacheModelData();
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
  'climada':     'https://images.unsplash.com/photo-1509803874385-db7c23652552?w=600&h=300&fit=crop',
  'openquake':   'https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=600&h=300&fit=crop',
  'better':      'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&h=300&fit=crop',
  'tabula-episcope':'https://images.unsplash.com/photo-1460317442991-0ec209397118?w=600&h=300&fit=crop',
  'sfincs':      'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=600&h=300&fit=crop',
  'wri-aqueduct':'https://images.unsplash.com/photo-1468421870903-4df1664ac249?w=600&h=300&fit=crop',
  'climate-bonds':'https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?w=600&h=300&fit=crop',
  'elca-oekobaudat':'https://images.unsplash.com/photo-1590274853856-f22d5ee3d228?w=600&h=300&fit=crop',
  'sri':         'https://images.unsplash.com/photo-1558002038-1055907df827?w=600&h=300&fit=crop',
  'dgnb':        'https://images.unsplash.com/photo-1518005068251-37900150dfca?w=600&h=300&fit=crop',
  'breeam':      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=300&fit=crop',
  'hazus-fast':  'https://images.unsplash.com/photo-1559060017-445fb9722f2a?w=600&h=300&fit=crop',
  'jrc-flood-maps':'https://images.unsplash.com/photo-1446824505046-e43605ffb17f?w=600&h=300&fit=crop',
  'eiopa-climada':'https://images.unsplash.com/photo-1561484930-998b6a7b22e8?w=600&h=300&fit=crop',
  'oasis-lmf':   'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=300&fit=crop',
  'cbe-comfort': 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=600&h=300&fit=crop',
  'reopt':       'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600&h=300&fit=crop',
  'pybuildingenergy':'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=300&fit=crop',
  'flexmeasures':'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=600&h=300&fit=crop',
  'resstock-comstock':'https://images.unsplash.com/photo-1449844908441-8829872d2607?w=600&h=300&fit=crop',
  'der-vet':     'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=600&h=300&fit=crop',
  'snbs':        'https://images.unsplash.com/photo-1527576539890-dfa815648363?w=600&h=300&fit=crop',
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

let _allCats, _allLife, _allLic, _allReg, _allTags, _filterCounts, _countryRegionMap;

function cacheModelData() {
  _allCats = [...new Set(models.flatMap(m=>m.categories||[]))].sort();
  _allLife = LIFECYCLE_PHASES.filter(p => models.some(m => (m.lifecycleStages||[]).includes(p)));
  _allLic = [...new Set(models.map(m=>m.license&&m.license.type?m.license.type:'').filter(Boolean))].sort();
  _allReg = [...new Set(models.flatMap(m=>m.region))].sort();
  _allTags = [...new Set(models.flatMap(m=>m.tags))].sort();
  _filterCounts = {};
  const countFor = (grp, val) => models.filter(m => {
    if (grp === 'categories') return (m.categories||[]).includes(val);
    if (grp === 'lifecycle') return (m.lifecycleStages||[]).includes(val);
    if (grp === 'license') return m.license && m.license.type === val;
    if (grp === 'region') return m.region.includes(val);
    if (grp === 'status') return m.status === val;
    if (grp === 'tags') return m.tags.includes(val);
    return false;
  }).length;
  _allCats.forEach(v => { _filterCounts['categories:'+v] = countFor('categories',v); });
  _allLife.forEach(v => { _filterCounts['lifecycle:'+v] = countFor('lifecycle',v); });
  _allLic.forEach(v => { _filterCounts['license:'+v] = countFor('license',v); });
  _allReg.forEach(v => { _filterCounts['region:'+v] = countFor('region',v); });
  ['live','coming-soon'].forEach(v => { _filterCounts['status:'+v] = countFor('status',v); });
  _allTags.forEach(v => { _filterCounts['tags:'+v] = countFor('tags',v); });
  _countryRegionMap = {};
  models.forEach(mod => {
    const codes = mod.coverage && mod.coverage.jurisdictionCodes;
    if (codes) codes.forEach(c => { if (!_countryRegionMap[c.toLowerCase()]) _countryRegionMap[c.toLowerCase()] = mod.region[0]; });
  });
}

// View toggle HTML
function viewToggleHtml() {
  const btn = (id, icon, label) => `<button class="view-btn${viewMode===id?' view-btn-active':''}" data-view="${id}" aria-label="${label}" title="${label}">${icon}</button>`;
  return `<div class="view-toggle" role="group" aria-label="View mode">${btn('gallery',ICON.grid,'Gallery view')}${btn('list',ICON.list,'List view')}${btn('map',ICON.map,'Map view')}${btn('scatter',ICON.scatter,'Scatter plot')}</div>`;
}

function galleryCard(m) {
  const img = CARD_IMG[m.id] || m.image;
  const cats = (m.categories||[]);
  return `<div class="Box model-card" data-href="#/models/${m.id}">
    <div class="model-card-img-wrap">
      <img src="${img}" alt="${m.name}" class="model-card-img" loading="lazy">
      ${cats.length ? `<div class="model-card-cats">${cats.map(c => `<span class="overlay-pill cat-pill tag-click" data-g="categories" data-v="${c}">${humanize(c)}</span>`).join('')}</div>` : ''}
      ${m.region.length ? `<div class="model-card-region">${m.region.map(r => `<span class="overlay-pill region-pill tag-click" data-g="region" data-v="${r}">${r}</span>`).join('')}</div>` : ''}
    </div>
    <div class="p-3">
      <div class="mb-1">
        <span class="f4 text-bold fgColor-default">${m.name}</span>
      </div>
      <p class="f6 fgColor-muted mb-2 line-clamp-2">${m.description}</p>
      <div class="d-flex flex-wrap gap-1">
        ${statusDot(m.status)}
        ${m.tags.slice(0,2).map(t=>`<span class="IssueLabel tag-click" data-g="tags" data-v="${t}">${humanize(t)}</span>`).join('')}
      </div>
    </div>
  </div>`;
}

function listRow(m) {
  return `<tr class="border-bottom clickable-row" data-href="#/models/${m.id}" tabindex="0">
    <td class="py-2 px-3 text-bold" style="white-space:nowrap">${m.name}</td>
    <td class="py-2 px-3">${statusDot(m.status)}</td>
    <td class="py-2 px-3"><div class="d-flex flex-wrap gap-1">${(m.categories||[]).map(c=>`<span class="IssueLabel tag-click" data-g="categories" data-v="${c}">${humanize(c)}</span>`).join('')}</div></td>
    <td class="py-2 px-3"><div class="d-flex flex-wrap gap-1">${m.region.map(r=>`<span class="IssueLabel bgColor-accent-muted fgColor-accent tag-click" data-g="region" data-v="${r}">${r}</span>`).join('')}</div></td>
    <td class="py-2 px-3 fgColor-muted f6">${m.description}</td>
  </tr>`;
}

function showGallery() {
  currentModel = null; currentEngine = null; currentResults = [];
  const app = $('#app');

  const vis = models.filter(m => {
    if (filters.q && !(m.name+' '+m.description).toLowerCase().includes(filters.q.toLowerCase())) return false;
    if (filters.categories.length && !filters.categories.some(c=>(m.categories||[]).includes(c))) return false;
    if (filters.lifecycle.length && !filters.lifecycle.some(l=>(m.lifecycleStages||[]).includes(l))) return false;
    if (filters.license.length && !filters.license.some(l=>m.license && m.license.type === l)) return false;
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
    ...filters.categories.map(v => ({grp:'categories', val:v, lab:humanize(v)})),
    ...filters.lifecycle.map(v => ({grp:'lifecycle', val:v, lab:v})),
    ...filters.license.map(v => ({grp:'license', val:v, lab:humanize(v)})),
    ...filters.region.map(v => ({grp:'region', val:v, lab:v})),
    ...filters.status.map(v => ({grp:'status', val:v, lab:v==='live'?'Live':'Coming soon'})),
    ...filters.tags.map(v => ({grp:'tags', val:v, lab:humanize(v)})),
  ];
  const hasFilters = activeFilters.length > 0;

  const allCats = _allCats, allLife = _allLife, allLic = _allLic, allReg = _allReg, allTags = _allTags;

  const cb = (grp, val, lab) => {
    const checked = filters[grp].includes(val) ? ' checked' : '';
    const count = _filterCounts[grp+':'+val] || 0;
    return `<label class="filter-cb"><input type="checkbox" data-g="${grp}" data-v="${val}"${checked}><span>${lab}</span><span class="filter-count">${count}</span></label>`;
  };

  let h = `<div class="gallery-layout">
  <aside class="filter-panel" aria-label="Filter models">
    <div class="filter-panel-title label-xs">Filters</div>
    <details class="filter-group" open>
      <summary class="filter-heading label-xs"><span class="chev"></span>Status</summary>
      ${cb('status', 'live', 'Live')}
      ${cb('status', 'coming-soon', 'Coming soon')}
    </details>
    <details class="filter-group" open>
      <summary class="filter-heading label-xs"><span class="chev"></span>Category</summary>
      ${allCats.map(c => cb('categories', c, humanize(c))).join('')}
    </details>
    <details class="filter-group" open>
      <summary class="filter-heading label-xs"><span class="chev"></span>Region</summary>
      ${allReg.map(r => cb('region', r, r)).join('')}
    </details>
    <details class="filter-group" open>
      <summary class="filter-heading label-xs"><span class="chev"></span>License</summary>
      ${allLic.map(l => cb('license', l, humanize(l))).join('')}
    </details>
    <details class="filter-group">
      <summary class="filter-heading label-xs"><span class="chev"></span>Lifecycle</summary>
      ${allLife.map(l => cb('lifecycle', l, l)).join('')}
    </details>
    <details class="filter-group">
      <summary class="filter-heading label-xs"><span class="chev"></span>Tags</summary>
      ${allTags.slice(0,10).map(t => cb('tags', t, humanize(t))).join('')}
      ${allTags.length > 10 ? `<div class="filter-tags-overflow" style="display:none">${allTags.slice(10).map(t => cb('tags', t, humanize(t))).join('')}</div><button class="btn-link f6 mt-1" id="showAllTags">Show all ${allTags.length} tags</button>` : ''}
    </details>
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
    h += `<div class="Box overflow-x"><table class="f6 width-full list-table" aria-label="Models list">
      <thead><tr class="bgColor-muted"><th class="py-2 px-3 text-left label-xs">Name</th><th class="py-2 px-3 text-left label-xs">Status</th><th class="py-2 px-3 text-left label-xs">Category</th><th class="py-2 px-3 text-left label-xs">Region</th><th class="py-2 px-3 text-left label-xs">Description</th></tr></thead>
      <tbody>${vis.map(m => listRow(m)).join('')}</tbody>
    </table></div>`;
  } else if (viewMode === 'map') {
    h += `<div id="galleryMap" class="coverage-map gallery-map-view"></div>`;
  } else if (viewMode === 'scatter') {
    h += `<div class="scatter-wrap" id="scatterWrap">
      <div class="scatter-toolbar">
        <button class="scatter-btn" id="scFullscreen" title="Fullscreen">\u26F6</button>
        <button class="scatter-btn" id="scZoomIn" title="Zoom in">+</button>
        <button class="scatter-btn" id="scZoomOut" title="Zoom out">\u2212</button>
        <button class="scatter-btn" id="scReset" title="Reset view (Scroll=zoom, Shift+drag=pan, Ctrl+drag=zoom area)">\u2302</button>
      </div>
      <canvas id="scatterChart"></canvas>
    </div>`;
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
    renderGalleryMap(vis);
  } else if (viewMode === 'scatter') {
    renderScatterPlot(vis);
    const zi=$('#scZoomIn'),zo=$('#scZoomOut'),rs=$('#scReset'),fs=$('#scFullscreen');
    if (zi) zi.addEventListener('click', () => { if(_scatterChart) _scatterChart.zoom(1.3); });
    if (zo) zo.addEventListener('click', () => { if(_scatterChart) _scatterChart.zoom(0.7); });
    if (rs) rs.addEventListener('click', () => { if(_scatterChart) _scatterChart.resetZoom(); });
    if (fs) fs.addEventListener('click', () => {
      const wrap = $('#scatterWrap');
      if (!wrap) return;
      if (document.fullscreenElement) { document.exitFullscreen(); }
      else { wrap.requestFullscreen(); }
    });
  }

  const fp = $('.filter-panel-title');
  if (fp) fp.addEventListener('click', () => fp.closest('.filter-panel').classList.toggle('filter-panel-open'));
  $('#gallerySort').addEventListener('change', e => { gallerySort = e.target.value; showGallery(); });
  const searchHandler = debounce(() => { filters.q = $('#gsearch').value; showGallery(); }, 200);
  $('#gsearch').addEventListener('input', searchHandler);
  $$('.view-btn').forEach(b => b.addEventListener('click', () => { viewMode = b.dataset.view; showGallery(); }));
  const sat = $('#showAllTags');
  if (sat) sat.addEventListener('click', () => { const o=$('.filter-tags-overflow'); if(o){o.style.display='block';sat.remove();} });
  $$('.filter-cb input').forEach(el => el.addEventListener('change', () => {
    const g=el.dataset.g, v=el.dataset.v;
    if (el.checked) { if(!filters[g].includes(v)) filters[g].push(v); } else { filters[g]=filters[g].filter(x=>x!==v); }
    showGallery();
  }));
  $$('[data-href]').forEach(el => {
    el.addEventListener('click', () => { location.hash = el.dataset.href; });
    el.addEventListener('keydown', e => { if(e.key==='Enter'){e.preventDefault();location.hash=el.dataset.href;} });
  });
  $$('.tag-click').forEach(el => el.addEventListener('click', e => { e.stopPropagation(); addFilter(el.dataset.g, el.dataset.v); }));
  $$('.filter-chip-x').forEach(b => b.addEventListener('click', () => { removeFilter(b.dataset.g, b.dataset.v); }));
  const rst = $('#resetFilters');
  if (rst) rst.addEventListener('click', () => { filters.categories=[]; filters.lifecycle=[]; filters.license=[]; filters.region=[]; filters.status=[]; filters.tags=[]; showGallery(); });
}

async function injectWorldSvg(el, ariaLabel) {
  const svgText = await loadWorldMap();
  el.innerHTML = svgText;
  const svg = el.querySelector('svg');
  if (!svg) return null;
  svg.removeAttribute('width');
  svg.removeAttribute('height');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', ariaLabel);
  svg.style.width = '100%';
  svg.style.height = 'auto';
  svg.querySelectorAll('path').forEach(p => p.classList.add('map-country'));
  return svg;
}

function getMapTooltip() {
  let tip = $('#map-tooltip');
  if (!tip) {
    tip = document.createElement('div');
    tip.id = 'map-tooltip';
    tip.className = 'map-tooltip';
    document.body.appendChild(tip);
  }
  return tip;
}

function addMapHover(paths, name, detail) {
  const tip = getMapTooltip();
  paths.forEach(p => {
    p.addEventListener('mouseenter', () => {
      tip.innerHTML = '<strong>' + name + '</strong>' + (detail ? '<br><span class="f6 fgColor-muted">' + detail + '</span>' : '');
      tip.style.display = 'block';
    });
    p.addEventListener('mousemove', e => {
      tip.style.left = (e.pageX + 12) + 'px';
      tip.style.top = (e.pageY - 10) + 'px';
    });
    p.addEventListener('mouseleave', () => { tip.style.display = 'none'; });
  });
}

function highlightCountries(svg, codes, countryDetails) {
  codes.forEach(code => {
    const lc = code.toLowerCase();
    const country = svg.querySelector('#' + lc);
    if (!country) return;
    const paths = country.tagName === 'g' ? country.querySelectorAll('path') : [country];
    paths.forEach(p => p.classList.add('map-active'));
    const name = COUNTRY_NAMES[lc] || code.toUpperCase();
    const detail = countryDetails ? countryDetails[lc] : null;
    addMapHover(paths, name, detail);
  });
}

async function renderGalleryMap(filteredModels) {
  const el = $('#galleryMap');
  if (!el) return;
  const svg = await injectWorldSvg(el, 'World map \u2014 click a highlighted country to filter by region');
  if (!svg) return;

  // Build country → {region, models[]} from filtered models
  const countryInfo = {};
  (filteredModels || models).forEach(mod => {
    const codes = mod.coverage && mod.coverage.jurisdictionCodes;
    if (codes) codes.forEach(c => {
      const lc = c.toLowerCase();
      if (!countryInfo[lc]) countryInfo[lc] = { region: mod.region[0], models: [] };
      countryInfo[lc].models.push(mod.name);
    });
  });

  // Build detail strings and highlight
  const details = {};
  const allCodes = Object.keys(countryInfo);
  allCodes.forEach(code => {
    const info = countryInfo[code];
    const ms = info.models;
    details[code] = ms.length <= 3 ? ms.join(', ') : ms.slice(0,3).join(', ') + ' +' + (ms.length-3) + ' more';
  });
  highlightCountries(svg, allCodes, details);

  // Add click handlers for region filtering
  allCodes.forEach(code => {
    const info = countryInfo[code];
    const country = svg.querySelector('#' + code);
    if (!country) return;
    const paths = country.tagName === 'g' ? country.querySelectorAll('path') : [country];
    paths.forEach(p => {
      p.style.cursor = 'pointer';
      p.addEventListener('click', () => { viewMode = 'gallery'; addFilter('region', info.region); });
    });
  });
}

// ============================================================
// API DOCS
// ============================================================
function showApiDocs() {
  const app = $('#app');
  const base = 'https://api.climate-check.io/api/v1';

  const ep = (method, path, desc, params, resp) => {
    const mc = method === 'GET' ? 'api-method-get' : 'api-method-post';
    const paramHtml = params ? `<div class="api-params"><div class="label-xs mb-2">Parameters</div><table class="f6 width-full"><tbody>${params.map(p =>
      `<tr class="border-bottom"><td class="py-1 px-3"><code>${p[0]}</code></td><td class="py-1 px-3 fgColor-muted">${p[1]}</td><td class="py-1 px-3 fgColor-muted">${p[2]}</td></tr>`
    ).join('')}</tbody></table></div>` : '';
    const respHtml = resp ? `<div class="api-response mt-3"><div class="label-xs mb-2">Example Response</div><pre class="api-code">${resp}</pre></div>` : '';
    return `<details class="api-endpoint">
      <summary class="api-endpoint-header">
        <span class="api-method ${mc}">${method}</span>
        <code class="api-path">${path}</code>
        <span class="fgColor-muted f6">${desc}</span>
        <span class="chev" style="margin-left:auto"></span>
      </summary>
      <div class="api-endpoint-body">${paramHtml}${respHtml}</div>
    </details>`;
  };

  const sampleModel = models[0] ? JSON.stringify({
    id: models[0].id, name: models[0].name, version: models[0].version,
    status: models[0].status, categories: models[0].categories,
    region: models[0].region, maturity: models[0].maturity,
    complexity: models[0].complexity, approach: models[0].approach
  }, null, 2) : '{}';

  let h = `
  <nav class="breadcrumb mb-3" aria-label="Breadcrumb">
    <a href="#/">Models</a>
    <span class="breadcrumb-sep" aria-hidden="true">/</span>
    <span class="fgColor-muted">API Documentation</span>
  </nav>

  <div class="api-header mb-4">
    <div class="d-flex flex-justify-between flex-items-start gap-4 flex-wrap">
      <div>
        <h1 class="f2 mb-1">climate-check API <span class="IssueLabel fgColor-muted">v1</span></h1>
        <p class="fgColor-muted mb-3">Open API for climate risk model metadata, reference data, and calculation engines.</p>
        <div class="d-flex gap-2 flex-wrap">
          <span class="IssueLabel bgColor-open-muted fgColor-open">REST</span>
          <span class="IssueLabel bgColor-accent-muted fgColor-accent">JSON</span>
          <span class="IssueLabel">API Key Auth</span>
        </div>
      </div>
      <div class="api-base-url">
        <div class="label-xs mb-1">Base URL</div>
        <code class="f5">${base}</code>
      </div>
    </div>
  </div>

  <div class="api-section mb-4">
    <div class="label-xs mb-2">Authentication</div>
    <div class="Box p-3 f6">
      <p class="mb-2">Include your API key in the request header:</p>
      <pre class="api-code">X-API-Key: your-api-key-here</pre>
      <p class="fgColor-muted mt-2">Free tier: 100 requests/day, read-only. Pro tier: unlimited reads + calculation endpoints.</p>
    </div>
  </div>

  <div class="api-section mb-4">
    <h2 class="f4 text-bold mb-3">Models</h2>
    ${ep('GET', '/models', 'List all models with filtering, search, and sort', [
      ['q','string','Full-text search across name and description'],
      ['categories','string','Filter by category (comma-separated)'],
      ['region','string','Filter by region (comma-separated)'],
      ['status','string','Filter: live, coming-soon'],
      ['lifecycle','string','Filter by lifecycle phase'],
      ['license','string','Filter by license type'],
      ['tags','string','Filter by tags (comma-separated)'],
      ['sort','string','Sort: name, maturity, complexity, updated'],
      ['order','string','asc or desc (default: asc)'],
      ['page','integer','Page number (default: 1)'],
      ['per_page','integer','Items per page (default: 20, max: 100)']
    ], `{
  "data": [
    ${sampleModel}
  ],
  "meta": {
    "total": ${models.length},
    "page": 1,
    "per_page": 20,
    "total_pages": ${Math.ceil(models.length/20)}
  }
}`)}
    ${ep('GET', '/models/{id}', 'Get full model detail including metadata, coverage, and schema', [
      ['id','string','Model identifier (e.g., crrem-eu)']
    ], null)}
    ${ep('GET', '/models/{id}/schema', 'Get input and output field definitions', [
      ['id','string','Model identifier']
    ], null)}
    ${ep('GET', '/models/{id}/coverage', 'Get jurisdictions and property types', [
      ['id','string','Model identifier']
    ], null)}
  </div>

  <div class="api-section mb-4">
    <h2 class="f4 text-bold mb-3">Taxonomies</h2>
    ${ep('GET', '/categories', 'List all categories with model counts', null,
`{
  "data": [
    { "id": "energy-performance", "label": "Energy Performance", "count": 14 },
    { "id": "physical-risk", "label": "Physical Risk", "count": 11 },
    { "id": "carbon-accounting", "label": "Carbon Accounting", "count": 6 }
  ]
}`)}
    ${ep('GET', '/regions', 'List all regions with model counts', null, null)}
    ${ep('GET', '/lifecycle-stages', 'List 6 lifecycle phases with model counts', null, null)}
    ${ep('GET', '/license-types', 'List license type enum with model counts', null, null)}
    ${ep('GET', '/tags', 'List all tags with model counts', [
      ['min_count','integer','Only return tags with at least N models (default: 1)']
    ], null)}
  </div>

  <div class="api-section mb-4">
    <h2 class="f4 text-bold mb-3">Reference Data</h2>
    ${ep('GET', '/data/pathways', 'CRREM decarbonization pathways by jurisdiction and property type', [
      ['jurisdiction','string','ISO country code (e.g., DE, US)'],
      ['property_type','string','Property type code (e.g., OFF, RMF)'],
      ['scenario','string','1.5C or 2C (default: 1.5C)'],
      ['year_from','integer','Start year (default: 2020)'],
      ['year_to','integer','End year (default: 2050)']
    ], `{
  "jurisdiction": "DE",
  "property_type": "OFF",
  "scenario": "1.5C",
  "unit": "kgCO2e/m\u00b2/yr",
  "values": [
    { "year": 2020, "ci": 34.2 },
    { "year": 2025, "ci": 28.1 },
    { "year": 2030, "ci": 21.7 }
  ]
}`)}
    ${ep('GET', '/data/emission-factors', 'Grid and fuel emission factors by jurisdiction and year', [
      ['jurisdiction','string','ISO country code'],
      ['fuel_type','string','electricity, natural_gas, fuel_oil, district_heating'],
      ['year','integer','Projection year (2020\u20132050)']
    ], null)}
    ${ep('GET', '/data/climate-projections', 'HDD/CDD projections by jurisdiction', [
      ['jurisdiction','string','ISO country code'],
      ['scenario','string','RCP 4.5 or RCP 8.5']
    ], null)}
  </div>

  <div class="api-section mb-4">
    <h2 class="f4 text-bold mb-3">Calculation <span class="IssueLabel bgColor-attention-muted fgColor-attention">Pro</span></h2>
    ${ep('POST', '/calculate/{id}', 'Run single-asset calculation (live models only)', [
      ['id','string','Model identifier (e.g., crrem-eu)']
    ], `// Request body
{
  "asset_name": "HQ Berlin",
  "country_code": "DE",
  "property_type_code": "OFF",
  "floor_area": 12000,
  "reporting_year": 2024,
  "electricity_kwh": 480000,
  "natural_gas_kwh": 360000
}

// Response
{
  "strandingYear": 2031,
  "baselineCarbonIntensity": 42.1,
  "baselineEUI": 165.3,
  "cumulativeExcess": 3200,
  "npvExcessCosts": 95000,
  "cvar": 1.2
}`)}
    ${ep('POST', '/calculate/{id}/batch', 'Run portfolio batch calculation (CSV or JSON array)', [
      ['id','string','Model identifier'],
      ['format','string','csv or json (default: json)']
    ], null)}
    ${ep('POST', '/validate/{id}', 'Validate input data against model schema', [
      ['id','string','Model identifier']
    ], `// Request body
{
  "asset_name": "HQ Berlin",
  "floor_area": -100
}

// Response
{
  "valid": false,
  "errors": [
    "floor_area must be greater than 0"
  ]
}`)}
  </div>

  <div class="api-section mb-4">
    <div class="label-xs mb-2">Rate Limits</div>
    <div class="Box p-3">
      <table class="f6 width-full">
        <thead><tr class="bgColor-muted"><th class="py-2 px-3 text-left label-xs">Tier</th><th class="py-2 px-3 text-left label-xs">Reads</th><th class="py-2 px-3 text-left label-xs">Calculations</th><th class="py-2 px-3 text-left label-xs">Price</th></tr></thead>
        <tbody>
          <tr class="border-bottom"><td class="py-2 px-3 text-bold">Free</td><td class="py-2 px-3">100/day</td><td class="py-2 px-3 fgColor-muted">\u2014</td><td class="py-2 px-3">Free</td></tr>
          <tr class="border-bottom"><td class="py-2 px-3 text-bold">Pro</td><td class="py-2 px-3">Unlimited</td><td class="py-2 px-3">1,000/day</td><td class="py-2 px-3">Contact us</td></tr>
          <tr><td class="py-2 px-3 text-bold">Enterprise</td><td class="py-2 px-3">Unlimited</td><td class="py-2 px-3">Unlimited</td><td class="py-2 px-3">Contact us</td></tr>
        </tbody>
      </table>
    </div>
  </div>
  `;

  app.innerHTML = h;
}

const CAT_COLORS = {
  'transition-risk':'#cf222e','physical-risk':'#0969da','carbon-accounting':'#1a7f37',
  'energy-performance':'#bf8700','embodied-carbon':'#6e40c9','target-setting':'#d29922',
  'multi-criteria':'#0550ae','grid-optimization':'#1f883d','indoor-environment':'#9a6700'
};

let _scatterChart = null;
function renderScatterPlot(filteredModels) {
  const canvas = $('#scatterChart');
  if (!canvas) return;
  if (_scatterChart) _scatterChart.destroy();

  // Jitter overlapping dots
  const cellMap = {};
  filteredModels.forEach(m => {
    const key = (m.complexity||5) + ',' + (m.maturity||5);
    if (!cellMap[key]) cellMap[key] = [];
    cellMap[key].push(m);
  });
  const groups = {};
  Object.values(cellMap).forEach(ms => {
    const n = ms.length;
    ms.forEach((m, i) => {
      const cat = (m.categories||[])[0] || 'other';
      if (!groups[cat]) groups[cat] = [];
      const angle = (i / n) * Math.PI * 2;
      const dist = n > 1 ? 0.25 + (i * 0.08) : 0;
      groups[cat].push({
        x: (m.complexity||5) + Math.cos(angle) * dist,
        y: (m.maturity||5) + Math.sin(angle) * dist,
        r: Math.max(6, Math.min(14, (m.lifecycleStages||[]).length * 2.5 + 5)),
        model: m
      });
    });
  });

  const datasets = Object.entries(groups).map(([cat, pts]) => ({
    label: humanize(cat),
    data: pts,
    backgroundColor: (CAT_COLORS[cat] || '#8b949e') + '99',
    borderColor: CAT_COLORS[cat] || '#8b949e',
    borderWidth: 1.5,
    hoverBorderWidth: 3,
    hoverBackgroundColor: CAT_COLORS[cat] || '#8b949e',
  }));

  // Data midpoint for crosshair (5.5, 5.5)
  const MID = 5.5;

  const overlayPlugin = {
    id: 'scatterOverlay',
    afterDatasetsDraw(chart) {
      const ctx = chart.ctx;
      const { left, right, top, bottom } = chart.chartArea;
      const xScale = chart.scales.x, yScale = chart.scales.y;

      // Convert data midpoint to pixel coordinates
      const midPx = xScale.getPixelForValue(MID);
      const midPy = yScale.getPixelForValue(MID);

      ctx.save();

      // Crosshair at data midpoint (moves with zoom/pan)
      ctx.strokeStyle = 'rgba(0,0,0,0.2)';
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(midPx, top); ctx.lineTo(midPx, bottom); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(left, midPy); ctx.lineTo(right, midPy); ctx.stroke();

      // Quadrant labels (positioned relative to data midpoint)
      ctx.font = '10px sans-serif';
      ctx.fillStyle = 'rgba(128,128,128,0.3)';
      ctx.textAlign = 'center';
      if (midPx > left + 60 && midPy > top + 20) {
        ctx.fillText('Easy & Established', (left + midPx) / 2, top + 16);
      }
      if (midPx < right - 60 && midPy > top + 20) {
        ctx.fillText('Expert & Established', (midPx + right) / 2, top + 16);
      }
      if (midPx > left + 60 && midPy < bottom - 20) {
        ctx.fillText('Easy & Emerging', (left + midPx) / 2, bottom - 16);
      }
      if (midPx < right - 60 && midPy < bottom - 20) {
        ctx.fillText('Expert & Emerging', (midPx + right) / 2, bottom - 16);
      }

      // Collect bubble pixel positions
      const pts = [];
      chart.data.datasets.forEach((ds, di) => {
        const meta = chart.getDatasetMeta(di);
        if (meta.hidden) return;
        meta.data.forEach((el, pi) => {
          const raw = ds.data[pi];
          if (!raw || !raw.model) return;
          pts.push({ px: el.x, py: el.y, r: el.options.radius || 6, name: raw.model.name });
        });
      });

      // Place labels with collision avoidance
      ctx.font = '9px sans-serif';
      const placed = [];
      const pad = 3;
      const dirs = [[1,0],[1,-1],[0,-1],[-1,-1],[-1,0],[-1,1],[0,1],[1,1],[2,-1],[2,1],[-2,-1],[-2,1]];

      pts.forEach(p => {
        if (p.px < left || p.px > right || p.py < top || p.py > bottom) return;
        const tw = ctx.measureText(p.name).width;
        const th = 10, gap = p.r + 10;
        let lx, ly, rect, found = false;
        for (const [dx, dy] of dirs) {
          lx = p.px + dx * gap + (dx > 0 ? 2 : dx < 0 ? -tw - 2 : -tw/2);
          ly = p.py + dy * gap + (dy > 0 ? th : dy < 0 ? -2 : th/2);
          rect = { x: lx - pad, y: ly - th - pad, w: tw + pad*2, h: th + pad*2 };
          if (rect.x < left || rect.x + rect.w > right || rect.y < top || rect.y + rect.h > bottom) continue;
          if (placed.some(r => rect.x < r.x+r.w && rect.x+rect.w > r.x && rect.y < r.y+r.h && rect.y+rect.h > r.y)) continue;
          found = true; break;
        }
        if (found) {
          placed.push(rect);
          ctx.strokeStyle = 'rgba(100,100,100,0.4)';
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(p.px, p.py);
          ctx.lineTo(lx + (lx > p.px ? -1 : tw + 1), ly - 4);
          ctx.stroke();
          ctx.fillStyle = 'rgba(30,30,30,0.75)';
          ctx.textAlign = 'left';
          ctx.fillText(p.name, lx, ly);
        }
      });

      ctx.restore();
    }
  };

  _scatterChart = new Chart(canvas.getContext('2d'), {
    type: 'bubble',
    data: { datasets },
    plugins: [overlayPlugin],
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: { top: 8, right: 8 } },
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            usePointStyle: true, pointStyle: 'circle',
            font: { size: 10 }, padding: 8,
            boxWidth: 8, boxHeight: 8
          }
        },
        tooltip: {
          callbacks: {
            title: ctx => ctx[0].raw.model.name,
            label: ctx => {
              const m = ctx.raw.model;
              return [
                'Complexity: ' + m.complexity + '/10  |  Maturity: ' + m.maturity + '/10',
                'Approach: ' + (m.approach||''),
                'Lifecycle: ' + ((m.lifecycleStages||[]).join(', ') || 'N/A')
              ];
            }
          }
        },
        zoom: {
          limits: { x: { min: 0, max: 11 }, y: { min: 0, max: 11 } },
          pan: { enabled: true, mode: 'xy', modifierKey: 'shift' },
          zoom: {
            wheel: { enabled: true, speed: 0.1 },
            pinch: { enabled: true },
            drag: { enabled: true, modifierKey: 'ctrl', backgroundColor: 'rgba(9,105,218,0.1)', borderColor: 'rgba(9,105,218,0.3)', borderWidth: 1 },
            mode: 'xy'
          }
        }
      },
      scales: {
        x: {
          min: 0, max: 11,
          title: { display: true, text: 'Complexity \u2192', font: { size: 11, weight: 600 } },
          ticks: { stepSize: 1, font: { size: 10 }, callback: v => v === 0 || v === 11 ? '' : v },
          grid: { color: 'rgba(128,128,128,0.08)' }
        },
        y: {
          min: 0, max: 11,
          title: { display: true, text: 'Maturity \u2192', font: { size: 11, weight: 600 } },
          ticks: { stepSize: 1, font: { size: 10 }, callback: v => v === 0 || v === 11 ? '' : v },
          grid: { color: 'rgba(128,128,128,0.08)' }
        }
      },
      onClick: (e, elements) => {
        if (elements.length) {
          const m = elements[0].element.$context.raw.model;
          location.hash = '#/models/' + m.id;
        }
      }
    }
  });
}

// ============================================================
// MODEL PAGE
// ============================================================
let modelTab = 'about';

let _worldMapSvg = null;
async function loadWorldMap() {
  if (_worldMapSvg) return _worldMapSvg;
  const resp = await fetch('assets/world-map.svg');
  _worldMapSvg = await resp.text();
  return _worldMapSvg;
}

async function renderCoverageMap(el, codes, modelName) {
  if (!el || !codes || !codes.length) return;
  const svg = await injectWorldSvg(el, codes.length + ' covered jurisdictions');
  if (!svg) return;
  const details = {};
  if (modelName) codes.forEach(c => { details[c.toLowerCase()] = modelName; });
  highlightCountries(svg, codes, details);
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
          ${model.tags.map(t=>`<span class="IssueLabel tag-click tag-nav" data-g="tags" data-v="${t}">${humanize(t)}</span>`).join('')}
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
  // Sliders above the detail list
  const slider = (label, leftLab, rightLab, val, max, valueLab) => {
    const pct = ((val - 1) / (max - 1) * 100).toFixed(0);
    return `<div class="detail-slider">
      <div class="detail-slider-label">${label}</div>
      <div class="detail-slider-track-wrap">
        <span class="detail-slider-end">${leftLab}</span>
        <div class="detail-slider-track">
          <div class="detail-slider-fill" style="width:${pct}%"></div>
          <div class="detail-slider-mid"></div>
          <div class="detail-slider-dot" style="left:${pct}%"></div>
        </div>
        <span class="detail-slider-end">${rightLab}</span>
      </div>
      <div class="detail-slider-value fgColor-muted">${valueLab}</div>
    </div>`;
  };
  const approachMap = { qualitative: 0, mixed: 50, quantitative: 100 };
  let slidersHtml = '';
  if (model.maturity) slidersHtml += slider('Maturity', 'Low', 'High', model.maturity, 10, model.maturity + '/10');
  if (model.complexity) slidersHtml += slider('Complexity', 'Low', 'High', model.complexity, 10, model.complexity + '/10');
  if (model.approach) {
    const aPct = approachMap[model.approach] ?? 50;
    slidersHtml += `<div class="detail-slider">
      <div class="detail-slider-label">Approach</div>
      <div class="detail-slider-track-wrap">
        <span class="detail-slider-end">Qualitative</span>
        <div class="detail-slider-track">
          <div class="detail-slider-fill" style="width:${aPct}%"></div>
          <div class="detail-slider-mid"></div>
          <div class="detail-slider-dot" style="left:${aPct}%"></div>
        </div>
        <span class="detail-slider-end">Quantitative</span>
      </div>
      <div class="detail-slider-value fgColor-muted">${model.approach}</div>
    </div>`;
  }

  const detailRows = [];
  if (model.version) detailRows.push(['Version', model.version]);
  if (model.source && model.source.url) detailRows.push(['Project', `<a href="${model.source.url}" target="_blank" rel="noopener">${model.source.url.replace(/^https?:\/\/(www\.)?/,'')}</a>`]);
  if (model.source && model.source.methodology) detailRows.push(['Methodology', `<a href="${model.source.methodology}" target="_blank" rel="noopener">Documentation \u2197</a>`]);
  if (model.author) detailRows.push(['Author', model.author]);
  if (model.scenario) detailRows.push(['Scenario', model.scenario]);
  if (model.scope) detailRows.push(['Scope', model.scope]);
  const activePhases = model.lifecycleStages || [];
  detailRows.push(['Lifecycle', LIFECYCLE_PHASES.map(p => {
    const active = activePhases.includes(p);
    return `<span class="IssueLabel${active?' bgColor-accent-muted fgColor-accent':''} tag-click tag-nav" data-g="lifecycle" data-v="${p}">${p}</span>`;
  }).join(' ')]);
  if (model.lastUpdated) detailRows.push(['Last updated', model.lastUpdated]);
  if (model.license) detailRows.push(['License', model.license.url ? `<a href="${model.license.url}" target="_blank" rel="noopener">${model.license.name}</a>` : model.license.name]);
  if (model.adoptedBy && model.adoptedBy.length) detailRows.push(['Adopted by', model.adoptedBy.join(', ')]);
  if (model.citation) detailRows.push(['Citation', `<span class="text-mono f6">${model.citation}</span>`]);

  if (detailRows.length) {
    h += `<details class="schema-section" open>
      <summary class="schema-header"><span class="chev"></span>Details <span class="Counter ml-1">${detailRows.length}</span></summary>
      ${slidersHtml ? `<div class="detail-sliders mt-1 mb-3">${slidersHtml}</div>` : ''}
      <dl class="detail-list mb-3">
        ${detailRows.map(([k,v]) => `<div class="detail-row"><dt>${k}</dt><dd>${v}</dd></div>`).join('')}
      </dl>
    </details>`;
  }

  // Limitations
  if (model.limitations && model.limitations.length) {
    h += `<details class="schema-section">
      <summary class="schema-header"><span class="chev"></span>Limitations <span class="Counter ml-1">${model.limitations.length}</span></summary>
      <ul class="divider-list limitations mt-1 mb-3">
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
      <ul class="divider-list mt-1 mb-3">
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
      <div class="border rounded-2 mt-2 mb-4" class="overflow-x"><table class="f6" class="width-full" aria-label="Input fields">
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
      <div class="border rounded-2 mt-2" class="overflow-x"><table class="f6" class="width-full" aria-label="Output fields">
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

  // Tab switching (accessible, URL-synced)
  $$('.tab-btn').forEach(btn => btn.addEventListener('click', () => {
    modelTab = btn.dataset.tab;
    $$('.tab-btn').forEach(b => { b.classList.toggle('tab-active', b.dataset.tab===modelTab); b.setAttribute('aria-selected', b.dataset.tab===modelTab); });
    $$('.tab-pane').forEach(p => p.classList.toggle('tab-pane-active', p.dataset.pane===modelTab));
    history.replaceState(null, '', `#/models/${model.id}/${modelTab}`);
  }));

  $$('.tag-click').forEach(el => el.addEventListener('click', e => {
    e.stopPropagation();
    addFilter(el.dataset.g, el.dataset.v);
  }));

  if (cov.jurisdictionCodes) {
    renderCoverageMap($('#coverageMap'), cov.jurisdictionCodes, model.name);
  }

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
      <span><span class="legend-dot bgColor-danger-emphasis"></span>High</span>
      <span><span class="legend-dot bgColor-attention-emphasis"></span>Medium</span>
      <span><span class="legend-dot bgColor-success-emphasis"></span>Low / Aligned</span>
    </div>
  </div>

  <div class="Box mb-4">
    <div class="Box-header d-flex flex-justify-between flex-items-center">
      <strong>Portfolio</strong><span class="f6 fgColor-muted">Click row to drill down</span>
    </div>
    <div class="ptable-wrap"><table class="f6" class="width-full" aria-label="Portfolio assets">
      <thead><tr class="bgColor-muted">${th('name','Asset')}${th('strandingYear','Stranding')}${th('ci','CI')}${th('excess','Excess (t)')}${th('npv','NPV')}<th class="py-2 px-3 label-xs">Risk</th></tr></thead>
      <tbody>`;

  sorted.forEach(r => {
    h += `<tr class="border-bottom clickable-row" data-i="${R.indexOf(r)}" tabindex="0"><td class="py-2 px-3 text-bold">${r.name}<br><span class="f6 fgColor-muted text-normal">${r.country} \u00b7 ${r.propertyType}</span></td><td class="py-2 px-3">${strandTxt(r)}</td><td class="py-2 px-3 text-right text-mono">${r.baselineCarbonIntensity.toFixed(1)}</td><td class="py-2 px-3 text-right text-mono">${(r.cumulativeExcess/1000).toFixed(0)}</td><td class="py-2 px-3 text-right text-mono">${eur(r.npvExcessCosts)}</td><td class="py-2 px-3">${badge(riskTier(r))}</td></tr>`;
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

  h += `<details><summary class="f5 text-bold" style="cursor:pointer">Year-by-year data</summary><div class="mt-3 border rounded-2" style="max-height:360px;overflow-y:auto"><table class="f6" class="width-full" aria-label="Year-by-year projections"><thead><tr class="bgColor-muted"><th class="py-1 px-3 text-left label-xs" style="position:sticky;top:0;background:var(--bgColor-muted)">Year</th><th class="py-1 px-3 text-right label-xs" style="position:sticky;top:0;background:var(--bgColor-muted)">Asset CI</th><th class="py-1 px-3 text-right label-xs" style="position:sticky;top:0;background:var(--bgColor-muted)">Pathway</th><th class="py-1 px-3 text-right label-xs" style="position:sticky;top:0;background:var(--bgColor-muted)">Excess</th><th class="py-1 px-3 text-right label-xs" style="position:sticky;top:0;background:var(--bgColor-muted)">Cost</th></tr></thead><tbody>`;
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
