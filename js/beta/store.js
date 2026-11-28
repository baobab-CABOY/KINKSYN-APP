// Beta response store: defaults, vault migration (normalize), record mutations, conflicts, export.
// PURE functions only (no DOM, no app) so they can be unit-tested in Node.
//
// Two separate collections:
//   beta        — shareable-in-principle self-reflection answers (still private; no sharing in beta)
//   betaPrivate — boundaries notebook + per-concept private boundaries. NEVER passed to the graph model,
//                 share links, PNG export or Dyad. Only the private editor and an explicit export read it.

import { STATE_CONFLICTS, BOUNDARY_CONFLICTS } from './field-options.js';

export const BETA_SCHEMA_VERSION = 1;
export const BETA_ITEM_VERSION = '1.0';
const LIST_FIELDS = ['relationship_states', 'action_directions', 'conditions'];
const isObj = v => v && typeof v === 'object' && !Array.isArray(v);
const now = () => new Date().toISOString();

export function defaultBeta() {
  return {
    schema_version: BETA_SCHEMA_VERSION,
    content_version: null,
    ageConfirmedAt: null,
    snapshot: { answers: {}, step: 0, completedAt: null },
    domainResponses: {},
    deep: { answers: {}, lastModule: null },
    responses: {},
    updatedAt: null
  };
}

export function defaultBetaPrivate() {
  return { schema_version: BETA_SCHEMA_VERSION, notebook: {}, conceptBoundaries: {}, updatedAt: null };
}

// Vault migration: accepts anything (undefined for pre-beta vaults). Keeps unknown fields; never discards data.
export function normalizeBeta(raw) {
  const base = defaultBeta();
  if (!isObj(raw)) return base;
  const out = { ...base, ...raw };
  out.snapshot = { ...base.snapshot, ...(isObj(raw.snapshot) ? raw.snapshot : {}) };
  if (!isObj(out.snapshot.answers)) out.snapshot.answers = {};
  out.deep = { ...base.deep, ...(isObj(raw.deep) ? raw.deep : {}) };
  if (!isObj(out.deep.answers)) out.deep.answers = {};
  out.domainResponses = isObj(raw.domainResponses) ? raw.domainResponses : {};
  out.responses = {};
  if (isObj(raw.responses)) {
    for (const [id, rec] of Object.entries(raw.responses)) {
      if (isObj(rec)) out.responses[id] = { ...emptyRecord(id), ...rec, concept_id: id };
    }
  }
  return out;
}

export function normalizeBetaPrivate(raw) {
  const base = defaultBetaPrivate();
  if (!isObj(raw)) return base;
  return {
    ...base,
    ...raw,
    notebook: isObj(raw.notebook) ? raw.notebook : {},
    conceptBoundaries: isObj(raw.conceptBoundaries) ? raw.conceptBoundaries : {}
  };
}

// Schema record (docs/ARCHITECTURE.md). `boundary` is always the non-disclosing stub here:
// real boundary data lives in betaPrivate.conceptBoundaries.
export function emptyRecord(conceptId) {
  return {
    concept_id: conceptId,
    relationship_states: [],
    action_directions: [],
    time_context: 'unspecified',
    experience: 'not_answered',
    enjoyment: null,
    conditions: [],
    note: null,
    boundary: { status: 'not_disclosed', details: null, shareable: false },
    item_version: BETA_ITEM_VERSION,
    updated_at: null
  };
}

// A record with nothing in it is the same as "unanswered" and is removed.
export function isRecordEmpty(r) {
  if (!r) return true;
  return LIST_FIELDS.every(f => !(r[f] || []).length)
    && (r.time_context || 'unspecified') === 'unspecified'
    && (r.experience || 'not_answered') === 'not_answered'
    && r.enjoyment == null
    && !(r.note && String(r.note).trim());
}

function commit(beta, conceptId, rec) {
  rec.updated_at = now();
  if (isRecordEmpty(rec)) delete beta.responses[conceptId];
  else beta.responses[conceptId] = rec;
  beta.updatedAt = now();
  return beta.responses[conceptId] || null;
}

export function toggleListValue(beta, conceptId, field, value) {
  if (!LIST_FIELDS.includes(field)) throw new Error(`not a list field: ${field}`);
  const rec = { ...emptyRecord(conceptId), ...(beta.responses[conceptId] || {}) };
  const list = new Set(rec[field] || []);
  list.has(value) ? list.delete(value) : list.add(value);
  rec[field] = [...list];
  return commit(beta, conceptId, rec);
}

export function setRecordField(beta, conceptId, field, value) {
  if (!['time_context', 'experience', 'enjoyment', 'note'].includes(field)) throw new Error(`not a scalar field: ${field}`);
  const rec = { ...emptyRecord(conceptId), ...(beta.responses[conceptId] || {}) };
  rec[field] = field === 'note' ? (value && String(value).trim() ? String(value) : null) : value;
  return commit(beta, conceptId, rec);
}

export function clearRecord(beta, conceptId) {
  delete beta.responses[conceptId];
  beta.updatedAt = now();
}

export function toggleDomainState(beta, domainId, stateId) {
  const cur = new Set(beta.domainResponses[domainId]?.relationship_states || []);
  cur.has(stateId) ? cur.delete(stateId) : cur.add(stateId);
  if (cur.size) beta.domainResponses[domainId] = { relationship_states: [...cur], updated_at: now() };
  else delete beta.domainResponses[domainId];
  beta.updatedAt = now();
}

// Returns human-checkable pairs that need clarification. Never changes data.
export function findStateConflicts(states = [], boundaryStatus = null) {
  const set = new Set(states);
  const out = [];
  for (const rule of STATE_CONFLICTS) {
    if (!set.has(rule.a)) continue;
    const others = rule.b.includes('*') ? [...set].filter(s => s !== rule.a) : rule.b.filter(s => set.has(s));
    others.forEach(o => out.push([rule.a, o]));
  }
  const bc = boundaryStatus && BOUNDARY_CONFLICTS[boundaryStatus];
  if (bc) bc.filter(s => set.has(s)).forEach(s => out.push([`boundary:${boundaryStatus}`, s]));
  return out;
}

export function hasBetaData(beta, priv) {
  if (!beta) return false;
  return Boolean(beta.ageConfirmedAt)
    || Object.keys(beta.responses || {}).length > 0
    || Object.keys(beta.domainResponses || {}).length > 0
    || Object.keys(beta.snapshot?.answers || {}).length > 0
    || Object.keys(beta.deep?.answers || {}).length > 0
    || Object.keys(priv?.notebook || {}).length > 0
    || Object.keys(priv?.conceptBoundaries || {}).length > 0;
}

// JSON export. Boundaries are excluded unless the user explicitly opts in.
export function buildBetaExport(beta, priv, { includePrivate = false, contentVersion = null } = {}) {
  const out = {
    export_type: 'kinksyn_beta_self_reflection',
    exported_at: now(),
    content_version: contentVersion,
    disclaimer: 'Private self-reflection. Not validated, not diagnostic, not a consent signal, not a compatibility score.',
    snapshot: beta.snapshot,
    domain_responses: beta.domainResponses,
    deep_map: beta.deep,
    responses: Object.values(beta.responses)
  };
  if (includePrivate) out.private_boundaries = priv;
  return out;
}
