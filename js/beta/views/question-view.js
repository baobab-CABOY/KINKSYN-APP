// Snapshot steps, Deep Map hub/modules, generic question renderer, private notebook gate.
import { esc, chip, card, button, sectionTitle } from './ui-kit.js';
import { questionOptions } from '../content.js';

const PRIVATE_MODULES = new Set(['DEEP_H']);

export const betaQuestionView = {
  // Read-only lookup (no side effects).
  betaGetAnswer(qid) {
    if (qid.startsWith('SNAP_')) return this.beta.snapshot.answers[qid];
    if (qid.startsWith('DEEP_H')) return this.betaPrivate.notebook[qid];
    return this.beta.deep.answers[qid];
  },

  betaAnswerSummary(q) {
    const c = this.betaContent;
    if (q.type === 'per_selected_domain_states') {
      const rows = Object.entries(this.beta.domainResponses)
        .map(([d, r]) => `${c.domainById[d]?.label || d}: ${r.relationship_states.map(s => c.stateById[s]?.label || s).join(', ')}`);
      return rows.length ? rows : null;
    }
    const a = this.betaGetAnswer(q.id);
    if (!a) return null;
    const labelOf = v => questionOptions(c, q).find(o => o.value === v)?.label || v;
    const parts = [];
    if (a.values) parts.push(a.values.map(labelOf).join(', '));
    if (a.value) parts.push(labelOf(a.value));
    if (a.text) parts.push(`“${a.text}”`);
    return parts.length ? parts : null;
  },

  renderBetaQuestion(q) {
    const c = this.betaContent;
    const a = this.betaGetAnswer(q.id) || {};
    const opts = questionOptions(c, q);
    let body = '';
    if (q.type === 'multi_select') {
      body = `<div class="flex flex-wrap gap-2">${opts.map((o, i) => chip(o.label, (a.values || []).includes(o.value), `app.betaToggleOption('${q.id}', ${i})`)).join('')}</div>
        <p class="text-[11px] text-zinc-500">Choose any that fit, or none.</p>`;
    } else if (q.type === 'single_select') {
      body = `<div class="flex flex-wrap gap-2" role="radiogroup">${opts.map((o, i) => chip(o.label, a.value === o.value, `app.betaPickOption('${q.id}', ${i})`, { tone: 'teal' })).join('')}</div>
        <p class="text-[11px] text-zinc-500">Tap again to unselect.</p>`;
    } else if (q.type === 'optional_text') {
      const writeOwn = opts.find(o => /own/i.test(o.label));
      const showText = !opts.length || a.text || (writeOwn && a.value === writeOwn.value);
      body = `${opts.length ? `<div class="flex flex-wrap gap-2">${opts.map((o, i) => chip(o.label, a.value === o.value, `app.betaPickOption('${q.id}', ${i})`, { tone: 'teal' })).join('')}</div>` : ''}
        ${showText ? `<label class="block space-y-1"><span class="text-[11px] text-zinc-400">In your own words (optional, saved when you leave the box)</span>
          <textarea rows="3" maxlength="600" onchange="app.betaSetText('${q.id}', this)" class="w-full bg-black/60 border border-white/10 rounded-xl p-3 text-sm text-zinc-100 focus:outline-none focus:border-purple-400">${esc(a.text || '')}</textarea></label>` : ''}`;
    } else if (q.type === 'per_selected_domain_states') {
      const picked = this.beta.snapshot.answers.SNAP_04?.values || [];
      body = picked.length ? picked.map(dId => {
        const d = c.domainById[dId];
        const cur = this.beta.domainResponses[dId]?.relationship_states || [];
        return `<div class="p-3 rounded-xl bg-black/40 border border-white/[0.08] space-y-2">
          <div class="text-sm font-medium text-white">${esc(d?.label || dId)}</div>
          <div class="text-[11px] text-zinc-500">${esc(d?.description || '')}</div>
          <div class="flex flex-wrap gap-1.5">${c.relationship_state_options.map(s => chip(s.label, cur.includes(s.id), `app.betaToggleDomainState('${dId}', '${s.id}')`)).join('')}</div>
        </div>`;
      }).join('') + '<p class="text-[11px] text-zinc-500">Several can be true at once (for example “Curious” and “Fantasy / imagination”). None of these is better or worse.</p>'
        : `<p class="text-sm text-zinc-400">No areas picked in the previous step. Go back to pick some, or skip.</p>`;
    } else if (q.type === 'review') {
      body = this.renderBetaReview();
    }
    const answered = q.type !== 'review' && this.betaAnswerSummary(q);
    return `<section aria-labelledby="q-${q.id}" class="space-y-3">
      <h3 id="q-${q.id}" class="text-base sm:text-lg font-medium text-white leading-snug">${esc(q.prompt)}</h3>
      ${body}
      ${answered && q.type !== 'per_selected_domain_states' ? `<button type="button" onclick="app.betaClearAnswer('${q.id}')" class="text-[11px] font-mono text-zinc-500 hover:text-rose-300 underline">Clear this answer</button>` : ''}
    </section>`;
  },

  renderBetaReview() {
    const qs = this.betaContent.questionnaires.snapshot.questions.filter(q => q.type !== 'review');
    return `<div class="space-y-2">${qs.map((q, i) => {
      const s = this.betaAnswerSummary(q);
      return `<div class="p-3 rounded-xl bg-black/40 border border-white/[0.08] flex items-start justify-between gap-3">
        <div class="min-w-0"><div class="text-xs text-zinc-400">${esc(q.prompt)}</div>
          <div class="text-sm ${s ? 'text-zinc-100' : 'text-zinc-600 italic'} mt-0.5">${s ? s.map(esc).join('<br>') : 'Skipped'}</div></div>
        <button type="button" onclick="app.betaSnapGo(${i})" class="shrink-0 text-xs font-mono text-purple-300 underline">Edit</button>
      </div>`;
    }).join('')}</div>`;
  },

  renderBetaSnapshot() {
    const snap = this.betaContent.questionnaires.snapshot;
    const qs = snap.questions;
    const step = Math.min(this.beta.snapshot.step || 0, qs.length - 1);
    const q = qs[step];
    const last = step === qs.length - 1;
    const pct = Math.round(((step + 1) / qs.length) * 100);
    return `
      ${sectionTitle(`${snap.title} · ~${snap.estimated_minutes} min`, `Step ${step + 1} of ${qs.length}`, '')}
      <div class="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden" role="progressbar" aria-valuemin="1" aria-valuemax="${qs.length}" aria-valuenow="${step + 1}">
        <div class="h-full bg-gradient-to-r from-teal-400 to-purple-500" style="width:${pct}%"></div></div>
      <div class="flex flex-wrap gap-1">${qs.map((x, i) => `<button type="button" onclick="app.betaSnapGo(${i})" aria-label="Go to step ${i + 1}"
        class="w-7 h-7 rounded-lg text-[10px] font-mono border ${i === step ? 'border-purple-400 bg-purple-500/30 text-white' : this.betaAnswerSummary(x) ? 'border-teal-500/40 bg-teal-500/10 text-teal-200' : 'border-white/10 text-zinc-500'}">${i + 1}</button>`).join('')}</div>
      ${card(this.renderBetaQuestion(q))}
      <div class="flex items-center justify-between gap-2">
        ${button('← Back', step ? `app.betaSnapGo(${step - 1})` : "app.betaGo('home')")}
        <div class="flex gap-2">
          ${last ? button('Save & see my map', 'app.betaSnapFinish()', 'primary')
            : `${this.betaAnswerSummary(q) ? '' : button('Skip', `app.betaSnapGo(${step + 1})`)}${button('Next →', `app.betaSnapGo(${step + 1})`, 'primary')}`}
        </div>
      </div>`;
  },

  betaModuleProgress(m) {
    if (m.id === 'DEEP_B') return `${Object.keys(this.beta.responses).length}/36 concepts`;
    const qs = m.questions || [];
    return `${qs.filter(q => this.betaGetAnswer(q.id)).length}/${qs.length} answered`;
  },

  renderBetaDeep() {
    const deep = this.betaContent.questionnaires.deep_map;
    const mods = deep.modules;
    const m = mods.find(x => x.id === this.betaDeepModule);
    if (!m) {
      const snapDomains = (this.beta.snapshot.answers.SNAP_04?.values || []).map(id => this.betaContent.domainById[id]?.label).filter(Boolean);
      return `
        ${sectionTitle(`${deep.title} · ~${deep.estimated_minutes} min`, 'Pick any module, in any order', 'Your Snapshot answers stay as they are; the Deep Map adds detail on top.')}
        ${snapDomains.length ? card(`<div class="text-xs text-zinc-400">From your Snapshot — areas on your map: <span class="text-zinc-200">${snapDomains.map(esc).join(' · ')}</span></div>`) : ''}
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">${mods.map((x, i) => `
          <button type="button" onclick="app.betaGo('deep', '${x.id}')" class="text-left glass-panel rounded-2xl border ${PRIVATE_MODULES.has(x.id) ? 'border-rose-500/30' : 'border-white/10'} p-4 hover:bg-white/[0.04] transition min-h-[72px]">
            <div class="flex items-start justify-between gap-2">
              <span class="text-sm font-medium text-white">${String.fromCharCode(65 + i)}. ${esc(x.title)}</span>
              ${PRIVATE_MODULES.has(x.id) ? '<span class="font-mono text-[10px] text-rose-300 shrink-0">private</span>' : ''}
            </div>
            <div class="font-mono text-[11px] text-zinc-500 mt-1">${PRIVATE_MODULES.has(x.id) ? 'Only visible here · never on the map' : this.betaModuleProgress(x)}</div>
          </button>`).join('')}</div>`;
    }
    const idx = mods.indexOf(m);
    let inner;
    if (m.id === 'DEEP_B') inner = this.renderBetaConceptInventory(m);
    else if (PRIVATE_MODULES.has(m.id) && !this.betaNotebookOpen) inner = this.renderBetaNotebookGate(m);
    else inner = `${m.id === 'DEEP_D' ? this.renderBetaSnapContext('SNAP_06', 'From your Snapshot — ways of participating') : ''}
      ${m.id === 'DEEP_E' ? this.renderBetaSnapContext('SNAP_07', 'From your Snapshot — what makes it meaningful') : ''}
      ${(m.questions || []).map(q => card(this.renderBetaQuestion(q))).join('')}
      ${PRIVATE_MODULES.has(m.id) ? '<p class="text-[11px] text-rose-300/80">Stored separately from your other answers. Never shown on the map, in share links, Dyad or the PNG, and left out of exports unless you choose to include it.</p>' : ''}`;
    return `
      ${sectionTitle(`Deep Map · module ${String.fromCharCode(65 + idx)} of ${mods.length}`, m.title, m.description || '')}
      ${inner}
      <div class="flex flex-wrap items-center justify-between gap-2 pt-1">
        ${button('← All modules', "app.betaGo('deep')")}
        <div class="flex gap-2">
          ${idx > 0 ? button('Previous', `app.betaGo('deep', '${mods[idx - 1].id}')`) : ''}
          ${idx < mods.length - 1 ? button('Next module →', `app.betaGo('deep', '${mods[idx + 1].id}')`, 'primary') : button('See my map', "app.betaGo('map')", 'primary')}
        </div>
      </div>`;
  },

  renderBetaSnapContext(qid, label) {
    const q = this.betaContent.snapshotQuestionById[qid];
    const s = q && this.betaAnswerSummary(q);
    return s ? card(`<div class="text-xs text-zinc-400">${esc(label)}: <span class="text-zinc-200">${s.map(esc).join(' · ')}</span>
      <button type="button" onclick="app.betaGo('snapshot'); app.betaSnapGo(${this.betaContent.questionnaires.snapshot.questions.indexOf(q)})" class="ml-1 underline text-purple-300">edit</button></div>`) : '';
  },

  renderBetaNotebookGate(m) {
    return card(`<div class="space-y-3">
      <div class="font-mono text-[11px] uppercase tracking-wider text-rose-300">Highly sensitive · private by default</div>
      <p class="text-sm text-zinc-300 leading-relaxed">This optional notebook is for noting boundaries for your own reference. It is:</p>
      <ul class="text-xs sm:text-sm text-zinc-400 list-disc pl-5 space-y-1">
        <li>stored apart from your other answers and never shown on the node map or list;</li>
        <li>never put in share links, Dyad, the PNG one-pager or URLs;</li>
        <li>left out of the JSON export unless you tick “include” there;</li>
        <li>not a statement of consent or of anyone else's limits.</li>
      </ul>
      <p class="text-xs text-zinc-400">${this.betaStorageText()}</p>
      ${button('Open my private notebook', 'app.betaOpenNotebook()', 'ghost')}
    </div>`, 'border-rose-500/30');
  },

  renderBetaConceptInventory() {
    const c = this.betaContent;
    const picked = this.beta.snapshot.answers.SNAP_04?.values || [];
    const domains = [...c.domains].sort((a, b) => (picked.includes(b.id) ? 1 : 0) - (picked.includes(a.id) ? 1 : 0));
    return domains.map(d => {
      const concepts = c.conceptsByPrimaryDomain[d.id] || [];
      const dStates = this.beta.domainResponses[d.id]?.relationship_states || [];
      const answered = concepts.filter(k => this.beta.responses[k.id]).length;
      return `<details class="glass-panel rounded-2xl border border-white/10 group" ${picked.includes(d.id) || concepts.some(k => k.id === this.betaOpenConcept) ? 'open' : ''}>
        <summary class="cursor-pointer list-none p-4 flex items-center justify-between gap-3 min-h-[56px]">
          <span class="text-sm font-medium text-white">${esc(d.label)} ${picked.includes(d.id) ? '<span class="ml-1 font-mono text-[10px] text-teal-300">on your map</span>' : ''}</span>
          <span class="font-mono text-[11px] text-zinc-500 shrink-0">${answered}/${concepts.length} ▾</span>
        </summary>
        <div class="px-4 pb-4 space-y-2">
          <div class="text-[11px] text-zinc-500">${esc(d.description)}</div>
          <div class="p-2.5 rounded-xl bg-black/30 border border-white/[0.06] space-y-1.5">
            <div class="text-[11px] text-zinc-400">This area overall${dStates.length ? ' (from your Snapshot — you can add to it)' : ''}:</div>
            <div class="flex flex-wrap gap-1.5">${c.relationship_state_options.map(s => chip(s.label, dStates.includes(s.id), `app.betaToggleDomainState('${d.id}', '${s.id}')`)).join('')}</div>
          </div>
          ${concepts.map(k => this.renderBetaConceptRow(k)).join('')}
        </div>
      </details>`;
    }).join('') + '<p class="text-[11px] text-zinc-500">Concepts that belong to several areas are listed once, under their first area; the map shows all their links.</p>';
  },

  renderBetaConceptRow(k) {
    const c = this.betaContent;
    const r = this.beta.responses[k.id];
    const open = this.betaOpenConcept === k.id;
    const others = k.domain_ids.slice(1).map(id => c.domainById[id]?.label).filter(Boolean);
    return `<div class="rounded-xl border ${open ? 'border-purple-400/50 bg-purple-500/[0.06]' : 'border-white/[0.08] bg-black/40'}">
      <button type="button" onclick="app.betaExpandConcept('${k.id}')" aria-expanded="${open}" class="w-full text-left p-3 flex items-start justify-between gap-3 min-h-[52px]">
        <span class="min-w-0"><span class="block text-sm text-zinc-100">${esc(k.label)}</span>
          ${others.length ? `<span class="block text-[10px] text-zinc-500">also: ${others.map(esc).join(', ')}</span>` : ''}
          <span class="block text-[11px] mt-0.5 ${r ? 'text-purple-200' : 'text-zinc-600'}">${r ? r.relationship_states.map(s => esc(c.stateById[s]?.label || s)).join(' · ') || 'details only' : 'Not answered'}</span></span>
        <span class="font-mono text-[11px] text-zinc-400 shrink-0">${open ? 'Close' : r ? 'Edit' : 'Answer'}</span>
      </button>
      ${open ? `<div class="px-3 pb-3">${this.renderBetaConceptEditor(k.id)}</div>` : ''}
    </div>`;
  }
};
