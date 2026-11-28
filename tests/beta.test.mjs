// Node unit tests for the beta core (no browser). Run: node --test tests/
// Synthetic data only — never real profiles.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validateBetaContent, indexBetaContent } from '../js/beta/content.js';
import {
  defaultBeta, defaultBetaPrivate, normalizeBeta, normalizeBetaPrivate, toggleListValue, setRecordField,
  clearRecord, toggleDomainState, findStateConflicts, hasBetaData, buildBetaExport, isRecordEmpty
} from '../js/beta/store.js';
import { buildBetaGraphModel, visibleNodeIds, searchMatches, computeLayout } from '../js/beta/model.js';
import { STATE_CUES } from '../js/beta/field-options.js';

const raw = JSON.parse(readFileSync(new URL('../js/data/questionnaire-beta-v1.json', import.meta.url)));
const content = indexBetaContent(raw);

test('content: integrity and expected sizes', () => {
  assert.equal(validateBetaContent(raw), true);
  assert.equal(raw.domains.length, 11);
  assert.equal(raw.concepts.length, 36);
  assert.equal(raw.relationship_state_options.length, 12);
  assert.equal(raw.graph.global_score, false);
  assert.equal(raw.graph.boundary_data_in_graph, false);
  raw.relationship_state_options.forEach(s => assert.ok(STATE_CUES[s.id], `visual cue for ${s.id}`));
});

test('content: validation catches broken references', () => {
  const bad = structuredClone(raw);
  bad.concepts[0].domain_ids = ['DOM_DOES_NOT_EXIST'];
  assert.throws(() => validateBetaContent(bad), /unknown domain/);
  const dup = structuredClone(raw);
  dup.concepts[1].id = dup.concepts[0].id;
  assert.throws(() => validateBetaContent(dup), /duplicate/);
});

test('store: multi-select, non-ordinal states on one record', () => {
  const b = defaultBeta();
  toggleListValue(b, 'ACT_POWER_EXCHANGE', 'relationship_states', 'curious');
  toggleListValue(b, 'ACT_POWER_EXCHANGE', 'relationship_states', 'fantasy_only');
  toggleListValue(b, 'ACT_POWER_EXCHANGE', 'action_directions', 'receiving');
  const r = b.responses.ACT_POWER_EXCHANGE;
  assert.deepEqual(r.relationship_states.sort(), ['curious', 'fantasy_only']);
  assert.deepEqual(r.action_directions, ['receiving']);
  assert.equal(r.boundary.status, 'not_disclosed');
  assert.equal(r.boundary.shareable, false);
});

test('store: unanswered is distinct from not_interested; clearing returns to unanswered', () => {
  const b = defaultBeta();
  toggleListValue(b, 'ACT_IMPACT_PLAY', 'relationship_states', 'not_interested');
  let m = buildBetaGraphModel(content, b);
  const impact = m.nodes.find(n => n.id === 'ACT_IMPACT_PLAY');
  const tickle = m.nodes.find(n => n.id === 'ACT_TICKLING');
  assert.equal(impact.answer_status, 'answered');
  assert.deepEqual(impact.relationship_states, ['not_interested']);
  assert.equal(tickle.answer_status, 'unanswered');
  assert.deepEqual(tickle.relationship_states, []);
  // toggling the only state off removes the record entirely
  toggleListValue(b, 'ACT_IMPACT_PLAY', 'relationship_states', 'not_interested');
  assert.equal(b.responses.ACT_IMPACT_PLAY, undefined);
  setRecordField(b, 'ACT_ROLEPLAY', 'note', 'synthetic note');
  clearRecord(b, 'ACT_ROLEPLAY');
  m = buildBetaGraphModel(content, b);
  assert.equal(m.nodes.find(n => n.id === 'ACT_ROLEPLAY').answer_status, 'unanswered');
  assert.equal(isRecordEmpty(undefined), true);
});

test('store: conflicts are reported, never auto-resolved', () => {
  const b = defaultBeta();
  ['not_interested', 'want_to_explore'].forEach(s => toggleListValue(b, 'ACT_DOMINANCE', 'relationship_states', s));
  const c = findStateConflicts(b.responses.ACT_DOMINANCE.relationship_states);
  assert.deepEqual(c, [['not_interested', 'want_to_explore']]);
  assert.equal(b.responses.ACT_DOMINANCE.relationship_states.length, 2, 'both states kept');
  assert.deepEqual(findStateConflicts(['curious'], 'hard_limit'), [['boundary:hard_limit', 'curious']]);
  assert.deepEqual(findStateConflicts(['tried_before', 'not_interested']), [], 'valid example from brief');
});

test('migration: pre-beta vault payload gets defaults; unknown fields kept', () => {
  assert.deepEqual(normalizeBeta(undefined), defaultBeta());
  assert.deepEqual(normalizeBetaPrivate(null), defaultBetaPrivate());
  const future = normalizeBeta({ futureField: 42, responses: { ACT_SERVICE: { relationship_states: ['curious'], extra: 'x' } } });
  assert.equal(future.futureField, 42);
  assert.equal(future.responses.ACT_SERVICE.extra, 'x');
  assert.equal(future.responses.ACT_SERVICE.concept_id, 'ACT_SERVICE');
  assert.equal(future.responses.ACT_SERVICE.experience, 'not_answered');
  assert.equal(hasBetaData(defaultBeta(), defaultBetaPrivate()), false);
});

test('graph: all taxonomy nodes present, multi-domain concept appears once', () => {
  const m = buildBetaGraphModel(content, defaultBeta());
  assert.equal(m.nodes.filter(n => n.type === 'domain').length, 11);
  assert.equal(m.nodes.filter(n => n.type === 'concept').length, 36);
  assert.ok(m.nodes.every(n => n.type === 'domain' || n.answer_status === 'unanswered'));
  assert.equal(m.nodes.filter(n => n.id === 'ACT_POWER_EXCHANGE').length, 1);
  const edges = m.edges.filter(e => e.source === 'ACT_POWER_EXCHANGE');
  assert.deepEqual(edges.map(e => e.target).sort(), ['DOM_POWER_EXCHANGE', 'DOM_PSYCHOLOGICAL_EMOTIONAL']);
  assert.ok(m.edges.every(e => ['belongs_to', 'related_to'].includes(e.type)));
  assert.ok(!m.nodes.some(n => 'score' in n || 'intensity' in n || 'size' in n), 'no score-like fields');
});

test('graph: boundary and note data never reach the model', () => {
  const b = defaultBeta();
  const priv = defaultBetaPrivate();
  toggleListValue(b, 'ACT_BONDAGE_RESTRAINT', 'relationship_states', 'curious');
  setRecordField(b, 'ACT_BONDAGE_RESTRAINT', 'note', 'SYNTHETIC_NOTE_MARKER');
  priv.conceptBoundaries.ACT_BONDAGE_RESTRAINT = { status: 'hard_limit', details: 'SYNTHETIC_BOUNDARY_MARKER' };
  priv.notebook.DEEP_H2 = { text: 'SYNTHETIC_NOTEBOOK_MARKER' };
  const json = JSON.stringify(buildBetaGraphModel(content, b));
  for (const marker of ['SYNTHETIC_NOTE_MARKER', 'SYNTHETIC_BOUNDARY_MARKER', 'SYNTHETIC_NOTEBOOK_MARKER', 'hard_limit']) {
    assert.ok(!json.includes(marker), `${marker} leaked into graph model`);
  }
  assert.equal(buildBetaGraphModel.length, 2, 'model builder takes no private argument');
});

test('graph: filters and search never mutate answers', () => {
  const b = defaultBeta();
  toggleListValue(b, 'ACT_ROLEPLAY', 'relationship_states', 'curious');
  toggleDomainState(b, 'DOM_ROLEPLAY_PERSONA', 'appealing');
  const before = JSON.stringify(b);
  const m = buildBetaGraphModel(content, b);
  const v1 = visibleNodeIds(m, { states: new Set(['curious']) });
  assert.ok(v1.has('ACT_ROLEPLAY') && !v1.has('ACT_TICKLING'));
  const v2 = visibleNodeIds(m, { showUnanswered: false });
  assert.equal([...v2].filter(id => id.startsWith('ACT_')).length, 1);
  const v3 = visibleNodeIds(m, { collapsed: new Set(['DOM_ROLEPLAY_PERSONA']) });
  assert.ok(!v3.has('ACT_CHARACTER_PERSONA'), 'single-domain concept hidden when its domain collapses');
  assert.ok(v3.has('ACT_ROLEPLAY'), 'multi-domain concept stays while another domain is open');
  assert.ok(searchMatches(m, 'bondage').has('ACT_BONDAGE_RESTRAINT'));
  assert.equal(JSON.stringify(b), before);
  assert.equal(m.nodes.find(n => n.id === 'DOM_ROLEPLAY_PERSONA').relationship_states[0], 'appealing');
});

test('layout: deterministic, every node placed', () => {
  const a = computeLayout(content), b = computeLayout(content);
  assert.deepEqual(a, b);
  assert.equal(Object.keys(a).length, 47);
  assert.ok(Object.values(a).every(p => Number.isFinite(p.x) && Number.isFinite(p.y)));
});

test('export: boundaries excluded unless explicitly included', () => {
  const b = defaultBeta(), priv = defaultBetaPrivate();
  toggleListValue(b, 'ACT_SERVICE', 'relationship_states', 'appealing');
  priv.notebook.DEEP_H2 = { text: 'SYNTHETIC_PRIVATE' };
  assert.ok(!JSON.stringify(buildBetaExport(b, priv)).includes('SYNTHETIC_PRIVATE'));
  assert.ok(JSON.stringify(buildBetaExport(b, priv, { includePrivate: true })).includes('SYNTHETIC_PRIVATE'));
  assert.equal(buildBetaExport(b, priv).responses.length, 1);
});
