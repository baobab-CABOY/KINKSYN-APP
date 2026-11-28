// Concept response editor — used in Deep Map module B and the map detail panel.
// Multi-select, non-ordinal states. Private boundary lives in a separate collapsed section backed by betaPrivate.
import { esc, chip } from './ui-kit.js';
import { findStateConflicts } from '../store.js';
import {
  TIME_CONTEXT_OPTIONS, EXPERIENCE_OPTIONS, ENJOYMENT_OPTIONS, CONDITION_OPTIONS, BOUNDARY_STATUS_OPTIONS
} from '../field-options.js';

const select = (id, label, options, value, onchange) => `
  <label class="block space-y-1">
    <span class="text-[11px] text-zinc-400">${esc(label)}</span>
    <select id="${id}" onchange="${onchange}" class="w-full min-h-[42px] bg-black/60 border border-white/10 rounded-xl px-3 text-sm text-zinc-100 focus:outline-none focus:border-purple-400">
      ${options.map(o => `<option value="${esc(o.id)}" ${o.id === value ? 'selected' : ''}>${esc(o.label)}</option>`).join('')}
    </select>
  </label>`;

export const betaConceptEditorView = {
  // context 'map': private section starts collapsed and boundary conflicts are not surfaced (map is never a boundary view).
  renderBetaConceptEditor(cid, { context = 'deep' } = {}) {
    const c = this.betaContent;
    const r = this.beta.responses[cid] || {};
    const states = r.relationship_states || [];
    const boundary = this.betaPrivate.conceptBoundaries[cid];
    const conflicts = findStateConflicts(states, context === 'map' ? null : boundary?.status);
    const label = id => id.startsWith('boundary:')
      ? `your private note “${BOUNDARY_STATUS_OPTIONS.find(o => o.id === id.slice(9))?.label}”`
      : `“${c.stateById[id]?.label || id}”`;
    const showEnjoy = ['tried_before', 'currently_practice', 'enjoy_or_would_choose_again'].some(s => states.includes(s))
      || !['not_answered', 'none', undefined].includes(r.experience) || r.enjoyment;
    return `<div class="space-y-3" data-concept-editor="${cid}">
      <fieldset class="space-y-1.5">
        <legend class="text-[11px] text-zinc-400 mb-1">How do you relate to it? Pick all that apply — none is better or worse.</legend>
        <div class="flex flex-wrap gap-1.5">${c.relationship_state_options.map(s => chip(s.label, states.includes(s.id), `app.betaConceptToggle('${cid}', 'relationship_states', '${s.id}')`)).join('')}</div>
      </fieldset>
      ${conflicts.length ? `<div role="status" class="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-100">
        ${conflicts.map(([a, b]) => `${label(a)} and ${label(b)}`).map(esc).join('; ')} — do these refer to different situations? You can keep both
        (a note helps), or change one. Nothing is changed automatically.</div>` : ''}
      <fieldset class="space-y-1.5">
        <legend class="text-[11px] text-zinc-400 mb-1">Ways of participating (optional)</legend>
        <div class="flex flex-wrap gap-1.5">${c.direction_options.map(s => chip(s.label, (r.action_directions || []).includes(s.id), `app.betaConceptToggle('${cid}', 'action_directions', '${s.id}')`, { tone: 'teal' })).join('')}</div>
      </fieldset>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
        ${select(`bt-${cid}`, 'When does this apply?', TIME_CONTEXT_OPTIONS, r.time_context || 'unspecified', `app.betaConceptSet('${cid}', 'time_context', this)`)}
        ${select(`bx-${cid}`, 'Experience', EXPERIENCE_OPTIONS, r.experience || 'not_answered', `app.betaConceptSet('${cid}', 'experience', this)`)}
        ${showEnjoy ? select(`bj-${cid}`, 'How was it?', [{ id: '', label: 'Not answered' }, ...ENJOYMENT_OPTIONS], r.enjoyment || '', `app.betaConceptSet('${cid}', 'enjoyment', this)`) : ''}
      </div>
      <fieldset class="space-y-1.5">
        <legend class="text-[11px] text-zinc-400 mb-1">Conditions that would matter (optional)</legend>
        <div class="flex flex-wrap gap-1.5">${CONDITION_OPTIONS.map(o => chip(o.label, (r.conditions || []).includes(o.id), `app.betaConceptToggle('${cid}', 'conditions', '${o.id}')`, { tone: 'teal' })).join('')}</div>
      </fieldset>
      <label class="block space-y-1">
        <span class="text-[11px] text-zinc-400">Note to self (optional · shown only in this panel, never on the map)</span>
        <textarea rows="2" maxlength="600" onchange="app.betaConceptSet('${cid}', 'note', this)" class="w-full bg-black/60 border border-white/10 rounded-xl p-2.5 text-sm text-zinc-100 focus:outline-none focus:border-purple-400">${esc(r.note || '')}</textarea>
      </label>
      ${context === 'map' ? `<p class="text-[11px] text-zinc-500">Private boundary notes are kept off the map. Add or edit them in Deep Map → Activity and concept map.</p>` : `
      <details class="rounded-xl border border-rose-500/25 bg-rose-950/10" ${boundary ? 'open' : ''}>
        <summary class="cursor-pointer p-2.5 text-xs text-rose-200 min-h-[40px] flex items-center">Private boundary note (optional · highly sensitive)</summary>
        <div class="p-2.5 pt-0 space-y-2">
          <p class="text-[11px] text-zinc-400">Kept separately. Never on the map or list, never shared, excluded from exports unless you choose. Not consent and not a judgement.</p>
          ${select(`bb-${cid}`, 'Boundary', BOUNDARY_STATUS_OPTIONS, boundary?.status || 'not_disclosed', `app.betaBoundarySet('${cid}', this)`)}
          <textarea rows="2" maxlength="600" onchange="app.betaBoundaryDetails('${cid}', this)" placeholder="Details for yourself (optional)" class="w-full bg-black/60 border border-white/10 rounded-xl p-2.5 text-sm text-zinc-100 focus:outline-none focus:border-rose-400">${esc(boundary?.details || '')}</textarea>
        </div>
      </details>`}
      ${this.beta.responses[cid] ? `<button type="button" onclick="app.betaConceptClear('${cid}')" class="text-[11px] font-mono text-zinc-500 hover:text-rose-300 underline">Clear my answer (back to unanswered)</button>` : ''}
    </div>`;
  }
};
