// Loads + validates + indexes the beta content package (js/data/questionnaire-beta-v1.json).
// The JSON is the source of truth; this module never edits it.

export const BETA_CONTENT_URL = 'js/data/questionnaire-beta-v1.json';

let cache = null;

// Throws a descriptive Error if the content is malformed. Pure (usable from Node tests).
export function validateBetaContent(c) {
  const errors = [];
  const ids = new Set();
  const uniq = (id, where) => {
    if (!id || typeof id !== 'string') errors.push(`missing id in ${where}`);
    else if (ids.has(id)) errors.push(`duplicate id ${id}`);
    else ids.add(id);
  };
  for (const key of ['relationship_state_options', 'direction_options', 'domains', 'concepts', 'questionnaires']) {
    if (!c || !c[key]) errors.push(`missing ${key}`);
  }
  if (errors.length) throw new Error(errors.join('; '));
  c.relationship_state_options.forEach(o => uniq(o.id, 'relationship_state_options'));
  c.direction_options.forEach(o => uniq(o.id, 'direction_options'));
  c.domains.forEach(d => uniq(d.id, 'domains'));
  const domainIds = new Set(c.domains.map(d => d.id));
  c.concepts.forEach(k => {
    uniq(k.id, 'concepts');
    if (!Array.isArray(k.domain_ids) || !k.domain_ids.length) errors.push(`${k.id} has no domain_ids`);
    (k.domain_ids || []).forEach(d => { if (!domainIds.has(d)) errors.push(`${k.id} references unknown domain ${d}`); });
  });
  const snap = c.questionnaires.snapshot;
  const deep = c.questionnaires.deep_map;
  if (!snap?.questions?.length) errors.push('snapshot has no questions');
  if (!deep?.modules?.length) errors.push('deep_map has no modules');
  (snap?.questions || []).forEach(q => uniq(q.id, 'snapshot'));
  (deep?.modules || []).forEach(m => {
    uniq(m.id, 'deep_map modules');
    (m.questions || []).forEach(q => uniq(q.id, `deep_map ${m.id}`));
  });
  if (errors.length) throw new Error(`Beta content invalid: ${errors.join('; ')}`);
  return true;
}

// Adds lookup maps. Returns a new object; the original stays untouched.
export function indexBetaContent(c) {
  return {
    ...c,
    domainById: Object.fromEntries(c.domains.map(d => [d.id, d])),
    conceptById: Object.fromEntries(c.concepts.map(k => [k.id, k])),
    stateById: Object.fromEntries(c.relationship_state_options.map(s => [s.id, s])),
    directionById: Object.fromEntries(c.direction_options.map(s => [s.id, s])),
    snapshotQuestionById: Object.fromEntries(c.questionnaires.snapshot.questions.map(q => [q.id, q])),
    conceptsByPrimaryDomain: c.domains.reduce((acc, d) => {
      acc[d.id] = c.concepts.filter(k => k.domain_ids[0] === d.id);
      return acc;
    }, {})
  };
}

export async function loadBetaContent() {
  if (cache) return cache;
  const res = await fetch(BETA_CONTENT_URL, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`Could not load beta content (${res.status})`);
  const raw = await res.json();
  validateBetaContent(raw);
  cache = indexBetaContent(raw);
  return cache;
}

// Options for a question as [{ value, label }]. `source` questions use stable ids; inline options use their text.
export function questionOptions(content, q) {
  if (q.source === 'domains') return content.domains.map(d => ({ value: d.id, label: d.label }));
  if (q.source === 'direction_options') return content.direction_options.map(o => ({ value: o.id, label: o.label }));
  if (q.source === 'relationship_state_options') return content.relationship_state_options.map(o => ({ value: o.id, label: o.label }));
  return (q.options || []).map(o => ({ value: o, label: o }));
}

// All Deep Map questions (excluding the DEEP_B concept template), keyed by id.
export function deepQuestionById(content) {
  const out = {};
  content.questionnaires.deep_map.modules.forEach(m => (m.questions || []).forEach(q => { out[q.id] = { ...q, module_id: m.id }; }));
  return out;
}
