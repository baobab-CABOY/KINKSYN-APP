// Neural Node Map page: toolbar, filters, SVG graph or accessible list, detail panel, legend.
// Reads ONLY `this.beta` (via buildBetaGraphModel) — never betaPrivate.
import { esc, chip, button } from './ui-kit.js';
import { buildBetaGraphModel, visibleNodeIds, searchMatches, computeLayout } from '../model.js';
import { renderNodeSvg, renderEdgesSvg, SVG_DEFS, legendIcon } from '../map-svg.js';
import { STATE_CUES, TIME_CONTEXT_OPTIONS, EXPERIENCE_OPTIONS, ENJOYMENT_OPTIONS, CONDITION_OPTIONS } from '../field-options.js';
import { fitView, zoomAt, applyView } from '../map-controller.js';

const labelFrom = (list, id) => list.find(o => o.id === id)?.label || id;

export const betaMapView = {
  betaMapModel() {
    this.betaLayout = this.betaLayout || computeLayout(this.betaContent);
    const model = buildBetaGraphModel(this.betaContent, this.beta);
    const m = this.betaMap;
    const visible = visibleNodeIds(model, {
      domains: m.domains ? new Set(m.domains) : null,
      states: m.states ? new Set(m.states) : null,
      showUnanswered: m.showUnanswered,
      collapsed: new Set(m.collapsed)
    });
    return { model, visible, matches: searchMatches(model, m.search) };
  },

  renderBetaMap() {
    const m = this.betaMap;
    if (!m.initialized) {
      // Start with the areas picked in Snapshot SNAP_04 (view-only filter; "All areas" resets it).
      const picked = this.beta.snapshot.answers.SNAP_04?.values || [];
      if (picked.length && !m.domains) m.domains = [...picked];
      m.initialized = true;
    }
    const answered = Object.keys(this.beta.responses).length + Object.keys(this.beta.domainResponses).length;
    return `
      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <div class="font-mono text-[10px] uppercase tracking-widest text-teal-300">Neural Node Map · beta</div>
          <h2 class="text-lg sm:text-xl font-semibold text-white">Your interests, in your own answers</h2>
          <p class="text-[11px] sm:text-xs text-zinc-400 max-w-2xl">A curated map of 11 areas and 36 concepts — a visual metaphor, not a brain model or a score. Lines only show which area a concept belongs to. Grey = not answered.</p>
        </div>
        ${!answered ? `<div class="text-xs text-amber-200/90">Nothing answered yet — ${`<button type="button" class="underline" onclick="app.betaGo('snapshot')">start the Snapshot</button>`}</div>` : ''}
      </div>
      ${this.renderBetaMapToolbar()}
      ${m.filtersOpen ? this.renderBetaMapFilters() : ''}
      ${m.domains ? `<div class="text-[11px] text-teal-200/90">Showing ${m.domains.length} selected area${m.domains.length > 1 ? 's' : ''}. <button type="button" class="underline" onclick="app.betaMapToggleFilter('domain','__all')">Show all areas</button></div>` : ''}
      <div class="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-3 items-start">
        <div class="glass-panel rounded-2xl border border-white/10 overflow-hidden min-w-0">
          ${m.mode === 'list'
            ? `<div id="betaMapList" class="p-3 sm:p-4 max-h-[70vh] overflow-y-auto">${this.renderBetaMapList()}</div>`
            : `<div class="relative"><svg id="betaSvg" role="group" aria-label="Neural node map. Use Tab to move between nodes and Enter to open one, or switch to List view."
                 class="block w-full h-[min(60vh,115vw)] min-h-[320px] lg:h-[70vh] touch-none select-none bg-[#09090e]">${SVG_DEFS}<g id="betaViewport">${this.renderBetaMapSvg()}</g></svg>
               <div class="absolute bottom-2 right-2 flex gap-1">
                 ${['+', '−', 'Fit'].map((t, i) => `<button type="button" aria-label="${['Zoom in', 'Zoom out', 'Fit map'][i]}" onclick="app.betaZoom(${['1.25', '0.8', '0'][i]})"
                   class="min-w-[40px] min-h-[40px] px-2 rounded-xl glass-panel border border-white/15 text-sm text-zinc-100">${t}</button>`).join('')}
               </div></div>`}
        </div>
        <aside id="betaMapDetail" class="space-y-3 min-w-0">
          ${this.renderBetaMapDetail()}
          <details class="glass-panel rounded-2xl border border-white/10" ${window.innerWidth >= 1024 ? 'open' : ''}>
            <summary class="cursor-pointer p-3 text-xs font-mono text-zinc-300 min-h-[44px] flex items-center">Legend — what the marks mean</summary>
            <div class="px-3 pb-3">${this.renderBetaLegend()}</div>
          </details>
        </aside>
      </div>`;
  },

  renderBetaMapToolbar() {
    const m = this.betaMap;
    const activeFilters = (m.states ? m.states.length : 0) + (m.showUnanswered ? 0 : 1) + m.collapsed.length;
    return `<div class="flex flex-wrap items-center gap-2">
      <div class="flex rounded-xl border border-white/10 overflow-hidden" role="group" aria-label="View">
        ${['graph', 'list'].map(v => `<button type="button" onclick="app.betaMapSetMode('${v}')" aria-pressed="${m.mode === v}"
          class="min-h-[40px] px-3 text-xs font-mono ${m.mode === v ? 'bg-purple-500/25 text-white' : 'bg-black/40 text-zinc-400'}">${v === 'graph' ? 'Graph' : 'List'}</button>`).join('')}
      </div>
      <label class="flex-1 min-w-[160px]"><span class="sr-only">Search concepts</span>
        <input id="betaMapSearch" type="search" value="${esc(m.search)}" oninput="app.betaMapSearch(this)" placeholder="Search concepts…"
          class="w-full min-h-[40px] bg-black/60 border border-white/10 rounded-xl px-3 text-sm text-zinc-100 focus:outline-none focus:border-purple-400" /></label>
      <span id="betaMatchCount" class="text-[11px] font-mono text-zinc-500" aria-live="polite"></span>
      <button type="button" onclick="app.betaMapToggleFilters()" aria-expanded="${m.filtersOpen}" class="min-h-[40px] px-3 rounded-xl border border-white/10 bg-black/40 text-xs font-mono text-zinc-200">
        Filters${activeFilters ? ` (${activeFilters})` : ''}</button>
    </div>`;
  },

  renderBetaMapFilters() {
    const c = this.betaContent;
    const m = this.betaMap;
    return `<div class="glass-panel rounded-2xl border border-white/10 p-3 space-y-3">
      <div class="space-y-1.5"><div class="text-[11px] text-zinc-400">Areas</div>
        <div class="flex flex-wrap gap-1.5">${chip('All areas', !m.domains, "app.betaMapToggleFilter('domain','__all')", { tone: 'teal' })}
          ${c.domains.map(d => chip(d.label, (m.domains || []).includes(d.id), `app.betaMapToggleFilter('domain','${d.id}')`, { tone: 'teal' })).join('')}</div></div>
      <div class="space-y-1.5"><div class="text-[11px] text-zinc-400">Answers (show concepts with any of these)</div>
        <div class="flex flex-wrap gap-1.5">${chip('Any answer', !m.states, "app.betaMapToggleFilter('state','__all')")}
          ${c.relationship_state_options.map(s => chip(s.label, (m.states || []).includes(s.id), `app.betaMapToggleFilter('state','${s.id}')`)).join('')}
          ${chip('Not answered', (m.states || []).includes('unanswered'), "app.betaMapToggleFilter('state','unanswered')")}</div></div>
      <div class="flex flex-wrap gap-2">
        ${chip(m.showUnanswered ? 'Showing unanswered concepts' : 'Hiding unanswered concepts', m.showUnanswered, 'app.betaMapToggleUnanswered()', { tone: 'teal' })}
        ${chip(m.collapsed.length ? 'Expand all areas' : 'Collapse all areas', m.collapsed.length > 0, "app.betaMapToggleCollapse('__all')", { tone: 'teal' })}
      </div>
      <p class="text-[11px] text-zinc-500">Filters only change what you see. They never change your answers.</p>
    </div>`;
  },

  renderBetaMapSvg() {
    const { model, visible, matches } = this.betaMapModel();
    const pos = this.betaLayout;
    this.betaVisiblePos = Object.fromEntries([...visible].map(id => [id, pos[id]])); // used by "Fit"
    const sel = this.betaMap.selected;
    const collapsed = new Set(this.betaMap.collapsed);
    const stateById = this.betaContent.stateById;
    return `<g>${renderEdgesSvg(model, pos, visible, sel)}</g><g>${model.nodes.filter(n => visible.has(n.id)).map(n =>
      renderNodeSvg(n, pos[n.id], { selected: sel === n.id, dimmed: matches && !matches.has(n.id), collapsed: collapsed.has(n.id), stateById })).join('')}</g>`;
  },

  renderBetaMapList() {
    const c = this.betaContent;
    const { model, visible, matches } = this.betaMapModel();
    const byId = Object.fromEntries(model.nodes.map(n => [n.id, n]));
    const describe = n => n.answer_status === 'answered'
      ? n.relationship_states.map(s => c.stateById[s]?.label || s).join(', ') || 'details only'
      : 'Not answered';
    return `<p class="text-[11px] text-zinc-500 mb-2">Same information as the graph. Concepts in several areas appear under each.</p>
      <ul class="space-y-3">${c.domains.filter(d => visible.has(d.id)).map(d => {
        const dn = byId[d.id];
        const items = model.nodes.filter(n => n.type === 'concept' && n.domain_ids.includes(d.id) && visible.has(n.id) && (!matches || matches.has(n.id)));
        return `<li><button type="button" onclick="app.betaSelectNode('${d.id}')" class="text-left text-sm font-semibold text-white hover:underline">${esc(d.label)}</button>
          <span class="text-[11px] text-zinc-400"> — ${esc(describe(dn))}</span>
          <ul class="mt-1.5 grid grid-cols-1 sm:grid-cols-2 gap-1.5">${items.map(n => `<li>
            <button type="button" onclick="app.betaSelectNode('${n.id}')" data-list-id="${n.id}" data-status="${n.answer_status}"
              class="w-full text-left p-2 rounded-xl border ${this.betaMap.selected === n.id ? 'border-purple-400/70 bg-purple-500/10' : 'border-white/[0.08] bg-black/40'} min-h-[44px]">
              <span class="block text-xs text-zinc-100">${esc(n.label)}</span>
              <span class="block text-[11px] ${n.answer_status === 'answered' ? 'text-purple-200' : 'text-zinc-600'}">${esc(describe(n))}</span>
            </button></li>`).join('') || '<li class="text-[11px] text-zinc-600">No concepts match the current filters.</li>'}</ul></li>`;
      }).join('')}</ul>`;
  },

  renderBetaMapDetail() {
    const c = this.betaContent;
    const id = this.betaMap.selected;
    if (!id) {
      return `<div class="glass-panel rounded-2xl border border-white/10 p-4 text-xs text-zinc-400 leading-relaxed">
        Tap or click any node (or use Tab + Enter) to see what it means and how you answered. You can edit answers from there.</div>`;
    }
    const { model } = this.betaMapModel();
    const n = model.nodes.find(x => x.id === id);
    if (!n) return '';
    const stateList = n.relationship_states.length
      ? `<ul class="space-y-1">${n.relationship_states.map(s => `<li class="flex items-center gap-2 text-xs text-zinc-200">${legendIcon(s)}<span>${esc(c.stateById[s]?.label || s)}</span></li>`).join('')}</ul>`
      : '<p class="text-xs text-zinc-500">Not answered. (This is different from “Not interested”.)</p>';
    if (n.type === 'domain') {
      const concepts = c.concepts.filter(k => k.domain_ids.includes(id));
      const isCollapsed = this.betaMap.collapsed.includes(id);
      const dStates = this.beta.domainResponses[id]?.relationship_states || [];
      return `<div class="glass-panel rounded-2xl border border-white/10 p-4 space-y-3">
        <div><div class="font-mono text-[10px] uppercase tracking-wider text-zinc-500">Area · ${n.concept_count} linked concepts (node size is fixed)</div>
          <h3 class="text-base font-semibold text-white">${esc(n.label)}</h3>
          <p class="text-xs text-zinc-400 mt-1">${esc(n.description)}</p></div>
        <div><div class="text-[11px] text-zinc-400 mb-1">Your answer for this area</div>${stateList}</div>
        ${this.betaMap.editing ? `<div class="flex flex-wrap gap-1.5">${c.relationship_state_options.map(s => chip(s.label, dStates.includes(s.id), `app.betaToggleDomainState('${id}', '${s.id}')`)).join('')}</div>` : ''}
        <div class="flex flex-wrap gap-2">${button(this.betaMap.editing ? 'Done' : 'Edit answer', `app.betaMapEdit(${!this.betaMap.editing})`, 'ghost')}
          ${button(isCollapsed ? 'Expand area' : 'Collapse area', `app.betaMapToggleCollapse('${id}')`, 'ghost')}</div>
        <div><div class="text-[11px] text-zinc-400 mb-1">Concepts in this area</div>
          <div class="flex flex-wrap gap-1.5">${concepts.map(k => `<button type="button" onclick="app.betaSelectNode('${k.id}')" class="px-2 py-1.5 rounded-lg border border-white/10 bg-black/40 text-[11px] text-zinc-200 min-h-[36px]">${esc(k.label)}</button>`).join('')}</div></div>
      </div>`;
    }
    const k = c.conceptById[id];
    const row = (label, value) => value ? `<div><div class="text-[11px] text-zinc-500">${esc(label)}</div><div class="text-xs text-zinc-200">${esc(value)}</div></div>` : '';
    const note = this.beta.responses[id]?.note; // user's own note: shown only here, never on nodes
    return `<div class="glass-panel rounded-2xl border border-white/10 p-4 space-y-3">
      <div><div class="font-mono text-[10px] uppercase tracking-wider text-zinc-500">Concept${k.status === 'beta_draft' ? ' · draft definition' : ''}</div>
        <h3 class="text-base font-semibold text-white">${esc(n.label)}</h3>
        <p class="text-xs text-zinc-400 mt-1">${esc(n.description)}</p></div>
      <div class="flex flex-wrap gap-1.5">${n.domain_ids.map(d => `<button type="button" onclick="app.betaSelectNode('${d}')" class="px-2 py-1 rounded-lg border border-white/10 bg-black/40 text-[11px] text-teal-200 min-h-[32px]">${esc(c.domainById[d].label)}</button>`).join('')}</div>
      ${this.betaMap.editing ? this.renderBetaConceptEditor(id, { context: 'map' }) : `
        <div><div class="text-[11px] text-zinc-400 mb-1">Your answer</div>${stateList}</div>
        ${row('Ways of participating', n.action_directions.map(d => c.directionById[d]?.label || d).join(', '))}
        ${row('When', n.time_context !== 'unspecified' ? labelFrom(TIME_CONTEXT_OPTIONS, n.time_context) : '')}
        ${row('Experience', n.experience !== 'not_answered' ? labelFrom(EXPERIENCE_OPTIONS, n.experience) : '')}
        ${row('How it was', n.enjoyment ? labelFrom(ENJOYMENT_OPTIONS, n.enjoyment) : '')}
        ${row('Conditions', n.conditions.map(x => labelFrom(CONDITION_OPTIONS, x)).join(', '))}
        ${row('Your note', note || '')}`}
      <div class="flex flex-wrap gap-2">${button(this.betaMap.editing ? 'Done' : n.answer_status === 'answered' ? 'Edit answer' : 'Answer this', `app.betaMapEdit(${!this.betaMap.editing})`, this.betaMap.editing ? 'primary' : 'ghost')}</div>
    </div>`;
  },

  renderBetaLegend() {
    const c = this.betaContent;
    return `<ul class="space-y-1">
      <li class="flex items-center gap-2 text-[11px] text-zinc-300">${legendIcon('unanswered')}<span><strong class="text-zinc-100">Not answered</strong> — neutral grey (not the same as “Not interested”)</span></li>
      ${c.relationship_state_options.map(s => `<li class="flex items-center gap-2 text-[11px] text-zinc-300">${legendIcon(s.id)}<span><strong class="text-zinc-100">${esc(s.label)}</strong> — ${esc(STATE_CUES[s.id] || '')}</span></li>`).join('')}
    </ul>
    <p class="text-[11px] text-zinc-500 mt-2">Several marks can appear on one node. Larger nodes are areas, smaller are concepts — size never means intensity. Lines show taxonomy membership only. Private boundaries never appear here.</p>`;
  },

  // Partial refresh used while typing in search (keeps input focus).
  betaRefreshMapParts() {
    const vp = document.getElementById('betaViewport');
    if (vp) vp.innerHTML = this.renderBetaMapSvg();
    const list = document.getElementById('betaMapList');
    if (list) list.innerHTML = this.renderBetaMapList();
    const count = document.getElementById('betaMatchCount');
    const { matches } = this.betaMapModel();
    if (count) count.textContent = matches ? `${[...matches].length} match${matches.size === 1 ? '' : 'es'}` : '';
  },

  betaZoom(f) {
    const svg = document.getElementById('betaSvg');
    if (!svg) return;
    if (!f) this.betaMap.view = fitView(svg, this.betaVisiblePos || this.betaLayout);
    else zoomAt(this, f, svg.clientWidth / 2, svg.clientHeight / 2);
    applyView(this);
  }
};
