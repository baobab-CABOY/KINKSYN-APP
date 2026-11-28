// Beta actions: concept records, private boundaries, map interactions, export + delete.
import { VAULT_STORAGE_KEY } from '../config.js';
import {
  toggleListValue, setRecordField, clearRecord, defaultBeta, defaultBetaPrivate, buildBetaExport, hasBetaData
} from './store.js';
import { BOUNDARY_STATUS_OPTIONS } from './field-options.js';

const SCALAR_FIELDS = new Set(['time_context', 'experience', 'enjoyment', 'note']);

export const betaActionMethods = {
  // ---- Concept records ----------------------------------------------------
  betaConceptToggle(conceptId, field, value) {
    if (!this.betaContent.conceptById[conceptId]) return;
    toggleListValue(this.beta, conceptId, field, value);
    this.betaSave();
    this.renderBeta();
  },

  betaConceptSet(conceptId, field, elOrValue) {
    if (!this.betaContent.conceptById[conceptId] || !SCALAR_FIELDS.has(field)) return;
    let v = elOrValue && typeof elOrValue === 'object' ? elOrValue.value : elOrValue;
    if (field === 'enjoyment' && (v === '' || v === 'null')) v = null;
    setRecordField(this.beta, conceptId, field, v);
    this.betaSave();
    if (field !== 'note') this.renderBeta(); // notes save on change without stealing focus
  },

  betaConceptClear(conceptId) {
    clearRecord(this.beta, conceptId);
    this.betaSave();
    this.showToast('Answer cleared — this concept is unanswered again');
    this.renderBeta();
  },

  betaExpandConcept(conceptId) {
    this.betaOpenConcept = this.betaOpenConcept === conceptId ? null : conceptId;
    this.renderBeta();
  },

  // ---- Private per-concept boundaries (betaPrivate only) -------------------
  betaBoundarySet(conceptId, el) {
    const status = el.value;
    if (!BOUNDARY_STATUS_OPTIONS.some(o => o.id === status)) return;
    const cur = this.betaPrivate.conceptBoundaries[conceptId] || {};
    if (status === 'not_disclosed' && !cur.details) delete this.betaPrivate.conceptBoundaries[conceptId];
    else this.betaPrivate.conceptBoundaries[conceptId] = { ...cur, status, shareable: false, updated_at: new Date().toISOString() };
    this.betaPrivate.updatedAt = new Date().toISOString();
    this.betaSave();
    this.renderBeta();
  },

  betaBoundaryDetails(conceptId, el) {
    const details = el.value.trim() ? el.value : null;
    const cur = this.betaPrivate.conceptBoundaries[conceptId] || { status: 'not_disclosed' };
    if (!details && cur.status === 'not_disclosed') delete this.betaPrivate.conceptBoundaries[conceptId];
    else this.betaPrivate.conceptBoundaries[conceptId] = { ...cur, details, shareable: false, updated_at: new Date().toISOString() };
    this.betaPrivate.updatedAt = new Date().toISOString();
    this.betaSave();
  },

  // ---- Map interactions (view-only state; never touch answers) -------------
  betaSelectNode(id) {
    if (this.betaMapDragged) return; // a drag, not a tap
    this.betaMap.selected = id;
    this.betaMap.editing = false;
    this.renderBeta();
    document.getElementById('betaMapDetail')?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  },

  betaMapEdit(on) {
    this.betaMap.editing = Boolean(on);
    this.renderBeta();
  },

  betaMapSetMode(mode) {
    this.betaMap.mode = mode === 'list' ? 'list' : 'graph';
    this.renderBeta();
  },

  betaMapToggleFilter(kind, id) {
    const key = kind === 'domain' ? 'domains' : 'states';
    if (id === '__all') this.betaMap[key] = null;
    else {
      const set = new Set(this.betaMap[key] || []);
      set.has(id) ? set.delete(id) : set.add(id);
      this.betaMap[key] = set.size ? [...set] : null;
    }
    if (kind === 'domain') this.betaMap.view = null; // refit to the new set of areas
    this.renderBeta();
  },

  betaMapToggleUnanswered() {
    this.betaMap.showUnanswered = !this.betaMap.showUnanswered;
    this.renderBeta();
  },

  betaMapToggleCollapse(domainId) {
    const set = new Set(this.betaMap.collapsed);
    if (domainId === '__all') this.betaMap.collapsed = set.size ? [] : this.betaContent.domains.map(d => d.id);
    else {
      set.has(domainId) ? set.delete(domainId) : set.add(domainId);
      this.betaMap.collapsed = [...set];
    }
    this.betaMap.view = null;
    this.renderBeta();
  },

  betaMapToggleFilters() {
    this.betaMap.filtersOpen = !this.betaMap.filtersOpen;
    this.renderBeta();
  },

  betaMapSearch(el) {
    this.betaMap.search = el.value;
    this.betaRefreshMapParts(); // keep focus in the search box
  },

  // ---- Export + delete ----------------------------------------------------
  betaBuildExportText() {
    const include = Boolean(document.getElementById('betaExportPrivate')?.checked);
    return JSON.stringify(buildBetaExport(this.beta, this.betaPrivate, {
      includePrivate: include,
      contentVersion: this.betaContent?.schema_version
    }), null, 2);
  },

  betaShowExport() {
    const out = document.getElementById('betaExportText');
    if (out) {
      out.value = this.betaBuildExportText();
      out.classList.remove('hidden');
    }
  },

  betaDownloadExport() {
    const text = this.betaBuildExportText();
    try {
      const blob = new Blob([text], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `kinksyn-beta-export-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
      this.showToast('Export downloaded — it is not encrypted');
    } catch (e) {
      this.betaShowExport();
    }
    this.betaShowExport(); // also show it, for browsers/frames that block downloads
  },

  betaDeleteAll() {
    if (!this.betaConfirmDelete) {
      this.betaConfirmDelete = true;
      this.renderBeta();
      return;
    }
    this.beta = defaultBeta();
    this.betaPrivate = defaultBetaPrivate();
    this.betaMap = { ...this.betaMap, selected: null, editing: false };
    this.betaOpenConcept = null;
    this.betaNotebookOpen = false;
    this.betaConfirmDelete = false;
    const legacyLeft = this.profile || this.journalEntries.length || this.snapshots.length || this.savedPartners.length;
    if (legacyLeft) {
      this.persistVault(); // rewrites the vault with empty beta data, legacy data kept
    } else if (this.vaultStatus !== 'locked') {
      localStorage.removeItem(VAULT_STORAGE_KEY);
      this.vaultPassphrase = null;
      this.vaultStatus = 'empty';
    }
    this.showToast('Beta answers and private notes deleted from this device');
    this.betaGo('gate');
  },

  betaHasData() {
    return hasBetaData(this.beta, this.betaPrivate);
  }
};
