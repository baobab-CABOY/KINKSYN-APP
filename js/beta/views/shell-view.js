// Beta shell: route dispatcher, sub-nav, 18+ gate, home, "Your data" page.
import { esc, card, button, sectionTitle } from './ui-kit.js';
import { attachMapController } from '../map-controller.js';

export const betaShellView = {
  renderBetaView() {
    if (!this.betaContent) return '<div class="p-6 text-center font-mono text-xs text-zinc-500">Loading beta…</div>';
    const r = this.betaRoute;
    const body = r === 'gate' ? this.renderBetaGate()
      : r === 'snapshot' ? this.renderBetaSnapshot()
      : r === 'deep' ? this.renderBetaDeep()
      : r === 'map' ? this.renderBetaMap()
      : r === 'data' ? this.renderBetaData()
      : this.renderBetaHome();
    const wide = r === 'map';
    // Animate only when the screen changes, not on every answer tap (avoids flicker).
    const key = `${r}|${this.betaDeepModule}|${this.beta.snapshot.step}`;
    const animate = this.betaAnimKey !== key;
    this.betaAnimKey = key;
    return `
      <div class="flex-1 bg-grid-pattern px-3 sm:px-6 py-4 sm:py-6">
        <div class="${wide ? 'max-w-7xl' : 'max-w-3xl'} mx-auto space-y-4 ${animate ? 'animate-enter' : ''}">
          ${r === 'gate' ? '' : this.renderBetaNav()}
          ${body}
        </div>
      </div>`;
  },

  afterBetaRender() {
    if (this.view === 'beta' && this.betaRoute === 'map' && this.betaMap.mode === 'graph') attachMapController(this);
  },

  renderBetaNav() {
    const items = [['home', 'Beta home'], ['snapshot', 'Snapshot'], ['deep', 'Deep Map'], ['map', 'Node map'], ['data', 'Your data']];
    return `<nav aria-label="Beta sections" class="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
      ${items.map(([id, label]) => `<button type="button" onclick="app.betaGo('${id}')" aria-current="${this.betaRoute === id ? 'page' : 'false'}"
        class="shrink-0 min-h-[38px] px-3 py-1.5 rounded-xl border text-xs font-mono transition ${
          this.betaRoute === id ? 'border-teal-400/70 bg-teal-500/20 text-teal-100' : 'border-white/10 bg-black/40 text-zinc-400 hover:text-zinc-100'
        }">${label}</button>`).join('')}
    </nav>`;
  },

  betaStorageText() {
    if (this.vaultPassphrase) {
      return 'Saved only in this browser on this device, encrypted with your vault passphrase (AES-256-GCM). The passphrase stays in memory while this tab is open and cannot be recovered if lost.';
    }
    return 'Saved only in this browser on this device, <strong class="text-amber-200">without encryption</strong>. Anyone with access to this browser profile could read it. Set a vault passphrase to encrypt it.';
  },

  renderBetaGate() {
    const c = this.betaContent;
    return card(`
      <div class="space-y-4">
        <img src="assets/logo.png" alt="" class="w-16 h-16 mx-auto" />
        ${sectionTitle('Beta · self-reflection', 'Before you start', '')}
        <p class="text-sm text-zinc-300 leading-relaxed">${esc(c.disclaimer)}</p>
        <ul class="text-xs sm:text-sm text-zinc-400 space-y-1.5 list-disc pl-5">
          <li>Every question is optional. Skip anything, change answers later, stop any time.</li>
          <li>Answers describe interest or curiosity only — they are never consent to anything.</li>
          <li>There is no score, type, diagnosis or compatibility rating in this beta.</li>
          <li>No sharing in this beta: answers are not added to share links, Dyad or the PNG one-pager.</li>
          <li>${this.betaStorageText()}</li>
        </ul>
        <label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-white/10 cursor-pointer">
          <input id="betaAgeCheck" type="checkbox" class="mt-0.5 w-5 h-5 accent-purple-500" />
          <span class="text-sm text-zinc-200">I confirm I am 18 or older.</span>
        </label>
        <div class="flex flex-wrap gap-2">
          ${button('Enter the beta', 'app.betaConfirmAge()', 'primary')}
          ${button('Back to classic', 'app.goHome()')}
        </div>
      </div>`);
  },

  renderBetaHome() {
    const c = this.betaContent;
    const snap = c.questionnaires.snapshot;
    const deep = c.questionnaires.deep_map;
    const snapAnswered = Object.keys(this.beta.snapshot.answers).length + (Object.keys(this.beta.domainResponses).length ? 1 : 0);
    const conceptCount = Object.keys(this.beta.responses).length;
    const deepAnswered = Object.keys(this.beta.deep.answers).length;
    const tile = (title, sub, meta, onclick, cta, tone) => `
      <div class="glass-panel rounded-2xl border ${tone} p-4 sm:p-5 flex flex-col gap-3">
        <div class="flex items-start justify-between gap-2">
          <h3 class="text-base font-semibold text-white">${esc(title)}</h3>
          <span class="font-mono text-[11px] text-zinc-400 shrink-0">${esc(meta)}</span>
        </div>
        <p class="text-xs sm:text-sm text-zinc-400 leading-relaxed flex-1">${esc(sub)}</p>
        <div>${button(cta, onclick, 'ghost')}</div>
      </div>`;
    return `
      ${sectionTitle('KINKSYN beta', 'Map your interests in your own words', c.disclaimer)}
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        ${tile(snap.title, 'A short first pass: what brings you here, which areas you want on your map, and how you relate to them.',
          `~${snap.estimated_minutes} min · ${snapAnswered}/${snap.questions.length - 1} answered`,
          "app.betaGo('snapshot')", this.beta.snapshot.completedAt ? 'Review Snapshot' : 'Start Snapshot', 'border-teal-500/30')}
        ${tile(deep.title, 'Optional modules you can do in any order. Extends your Snapshot answers concept by concept.',
          `~${deep.estimated_minutes} min · ${conceptCount}/36 concepts`,
          "app.betaGo('deep')", deepAnswered || conceptCount ? 'Continue Deep Map' : 'Open Deep Map', 'border-purple-500/30')}
        ${tile('Neural Node Map', '11 areas and 36 concepts. Your answers decorate the nodes; unanswered nodes stay neutral grey.',
          `${conceptCount} answered`, "app.betaGo('map')", 'Open map', 'border-indigo-500/30')}
        ${tile('Your data', 'Where answers are stored, encryption, JSON export and delete.',
          this.vaultPassphrase ? 'encrypted' : 'not encrypted', "app.betaGo('data')", 'Manage data', 'border-white/10')}
      </div>
      <p class="text-[11px] text-zinc-500 font-mono">Content v${esc(c.schema_version)} · ${esc(c.release_status)} · the classic quiz and graph are unchanged (KINKSYS logo → home).</p>`;
  },

  renderBetaData() {
    const answered = Object.keys(this.beta.responses).length;
    const privateCount = Object.keys(this.betaPrivate.notebook).length + Object.keys(this.betaPrivate.conceptBoundaries).length;
    return `
      ${sectionTitle('Your data', 'Storage, export and delete', 'Plain description of what this beta actually does with your answers.')}
      ${card(`<div class="space-y-2 text-sm text-zinc-300 leading-relaxed">
        <p>${this.betaStorageText()}</p>
        <p>Nothing is sent to a server: there is no account, sync or analytics. The page itself loads styling and fonts from public CDNs; those requests do not contain your answers.</p>
        <p>The beta is not included in classic share links, Dyad, or the PNG one-pager. It is stored in the same local vault as the classic profile, journal and snapshots.</p>
        <p class="text-xs text-zinc-500">Stored now: ${answered} concept answers · ${Object.keys(this.beta.domainResponses).length} area answers · ${privateCount} private boundary entries.</p>
        <div class="pt-1">${button(this.vaultPassphrase ? 'Change vault passphrase' : 'Encrypt with a passphrase', 'app.openVaultModal()', 'teal')}</div>
      </div>`)}
      ${card(`<div class="space-y-3">
        <h3 class="text-sm font-semibold text-white">Export (JSON)</h3>
        <p class="text-xs text-zinc-400">The export file is <strong class="text-zinc-200">not encrypted</strong>. Private boundaries are left out unless you tick the box.</p>
        <label class="flex items-start gap-2 text-xs text-zinc-300"><input id="betaExportPrivate" type="checkbox" class="mt-0.5 w-4 h-4 accent-rose-500" />
          Include my private boundaries notebook and boundary notes (highly sensitive)</label>
        <div class="flex flex-wrap gap-2">${button('Download JSON', 'app.betaDownloadExport()', 'ghost')}${button('Show JSON to copy', 'app.betaShowExport()', 'ghost')}</div>
        <textarea id="betaExportText" readonly rows="8" class="hidden w-full bg-black/60 border border-white/10 rounded-xl p-2 font-mono text-[11px] text-zinc-300"></textarea>
      </div>`)}
      ${card(`<div class="space-y-3">
        <h3 class="text-sm font-semibold text-white">Delete beta answers</h3>
        <p class="text-xs text-zinc-400">Removes all beta answers and private boundary notes from this device. The classic profile, journal and snapshots are kept. To delete everything, use “Wipe Local Data” in the Vault.</p>
        ${this.betaConfirmDelete
          ? `<div class="flex flex-wrap items-center gap-2"><span class="text-xs text-rose-300">This cannot be undone.</span>${button('Yes, delete beta answers', 'app.betaDeleteAll()', 'danger')}${button('Cancel', "app.betaConfirmDelete=false; app.renderBeta()")}</div>`
          : button('Delete beta answers…', 'app.betaDeleteAll()', 'ghost')}
      </div>`)}`;
  }
};
