// Beta flow: entry (locked-vault + 18+ gate), routing, Snapshot + Deep Map answer handlers.
// Answers never touch legacy app.profile / computeProfile / Dyad.
import { loadBetaContent, questionOptions, deepQuestionById } from './content.js';
import { toggleDomainState } from './store.js';

const PRIVATE_MODULES = new Set(['DEEP_H']); // also flagged in JSON via private_by_default

export const betaFlowMethods = {
  async openBeta(route = 'home') {
    if (this.vaultStatus === 'locked') {
      // Saving now would overwrite the encrypted vault; unlock first.
      this.pendingViewAfterUnlock = 'beta';
      this.openVaultModal();
      this.showToast('Unlock your vault first so beta answers are saved with it');
      return;
    }
    try {
      this.betaContent = await loadBetaContent();
    } catch (err) {
      console.error(err);
      this.showToast('Could not load beta content');
      return;
    }
    this.beta.content_version = this.betaContent.schema_version;
    this.destroyGraph();
    this.view = 'beta';
    this.betaRoute = this.beta.ageConfirmedAt ? route : 'gate';
    this.betaPendingRoute = route;
    this.render();
  },

  betaConfirmAge() {
    const box = document.getElementById('betaAgeCheck');
    if (!box || !box.checked) {
      this.showToast('Please confirm you are 18 or older');
      return;
    }
    this.beta.ageConfirmedAt = new Date().toISOString();
    this.betaSave();
    this.betaGo(this.betaPendingRoute && this.betaPendingRoute !== 'gate' ? this.betaPendingRoute : 'home');
  },

  betaGo(route, moduleId = null) {
    if (!this.beta.ageConfirmedAt) route = 'gate';
    this.betaRoute = route;
    if (route === 'deep') {
      this.betaDeepModule = moduleId;
      if (moduleId) this.beta.deep.lastModule = moduleId;
      if (moduleId !== 'DEEP_H') this.betaNotebookOpen = false;
    }
    this.betaConfirmDelete = false;
    this.render();
    window.scrollTo(0, 0);
  },

  // Re-render the beta view without losing scroll position (answers re-render on every tap).
  renderBeta() {
    if (this.view !== 'beta') return;
    const y = window.scrollY;
    const root = document.getElementById('appRoot');
    if (root) root.innerHTML = this.renderBetaView();
    this.afterBetaRender();
    window.scrollTo(0, y);
  },

  betaSave() {
    this.beta.updatedAt = new Date().toISOString();
    this.persistVault();
  },

  // ---- Snapshot -----------------------------------------------------------
  betaSnapGo(step) {
    const n = this.betaContent.questionnaires.snapshot.questions.length;
    this.beta.snapshot.step = Math.max(0, Math.min(n - 1, step));
    this.betaSave();
    this.renderBeta();
    window.scrollTo(0, 0);
  },

  betaSnapFinish() {
    this.beta.snapshot.completedAt = new Date().toISOString();
    this.betaSave();
    this.showToast('Snapshot saved — here is your map');
    this.betaGo('map');
  },

  // ---- Generic answers (Snapshot + Deep Map) ------------------------------
  betaQuestion(qid) {
    return this.betaContent.snapshotQuestionById[qid] || deepQuestionById(this.betaContent)[qid];
  },

  betaAnswerStore(qid) {
    const q = this.betaQuestion(qid);
    if (q.module_id && PRIVATE_MODULES.has(q.module_id)) {
      this.betaPrivate.updatedAt = new Date().toISOString();
      return this.betaPrivate.notebook;
    }
    return qid.startsWith('SNAP_') ? this.beta.snapshot.answers : this.beta.deep.answers;
  },

  betaToggleOption(qid, idx) {
    const q = this.betaQuestion(qid);
    const opt = questionOptions(this.betaContent, q)[idx];
    if (!opt) return;
    const store = this.betaAnswerStore(qid);
    const vals = new Set(store[qid]?.values || []);
    vals.has(opt.value) ? vals.delete(opt.value) : vals.add(opt.value);
    if (vals.size) store[qid] = { values: [...vals], item_version: '1.0' };
    else delete store[qid];
    this.betaSave();
    this.renderBeta();
  },

  betaPickOption(qid, idx) {
    const q = this.betaQuestion(qid);
    const opt = questionOptions(this.betaContent, q)[idx];
    if (!opt) return;
    const store = this.betaAnswerStore(qid);
    const cur = store[qid] || {};
    if (cur.value === opt.value) {
      // tap again = unselect (skipping is always allowed)
      const rest = { ...cur };
      delete rest.value;
      if (rest.text) store[qid] = rest; else delete store[qid];
    } else {
      store[qid] = { ...cur, value: opt.value, item_version: '1.0' };
    }
    this.betaSave();
    this.renderBeta();
  },

  betaSetText(qid, el) {
    const store = this.betaAnswerStore(qid);
    const text = el && el.value.trim() ? el.value : '';
    const cur = { ...(store[qid] || {}) };
    if (text) cur.text = text; else delete cur.text;
    if (Object.keys(cur).filter(k => k !== 'item_version').length) store[qid] = { ...cur, item_version: '1.0' };
    else delete store[qid];
    this.betaSave();
  },

  betaClearAnswer(qid) {
    const store = this.betaAnswerStore(qid);
    delete store[qid];
    this.betaSave();
    this.renderBeta();
  },

  betaToggleDomainState(domainId, stateId) {
    toggleDomainState(this.beta, domainId, stateId);
    this.betaSave();
    this.renderBeta();
  },

  betaOpenNotebook() {
    this.betaNotebookOpen = true;
    this.renderBeta();
  }
};
