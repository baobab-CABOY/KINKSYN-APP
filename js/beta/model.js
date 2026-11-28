// Neural Node Map view model (spec docs/beta/NEURAL_NODE_MAP_SPEC.md §6). PURE (Node-testable).
// Input: indexed content + `beta` answers ONLY. betaPrivate is never an argument, so boundary data
// cannot reach node data, tooltips or the list view. Notes are also excluded (spec: user-note never a node).

import { DOMAIN_COLORS } from './field-options.js';

export function buildBetaGraphModel(content, beta) {
  const responses = beta?.responses || {};
  const domainResponses = beta?.domainResponses || {};
  const nodes = [];
  const edges = [];

  content.domains.forEach(d => {
    const states = domainResponses[d.id]?.relationship_states || [];
    nodes.push({
      id: d.id,
      type: 'domain',
      label: d.label,
      description: d.description || '',
      color: DOMAIN_COLORS[d.id] || '#a1a1aa',
      concept_count: content.concepts.filter(k => k.domain_ids.includes(d.id)).length,
      answer_status: states.length ? 'answered' : 'unanswered',
      relationship_states: [...states],
      is_private: true
    });
  });

  content.concepts.forEach(k => {
    const r = responses[k.id];
    const node = {
      id: k.id,
      type: 'concept',
      label: k.label,
      description: k.description || '',
      domain_ids: [...k.domain_ids],
      color: DOMAIN_COLORS[k.domain_ids[0]] || '#a1a1aa',
      answer_status: r ? 'answered' : 'unanswered',
      is_private: true
    };
    node.relationship_states = r ? [...(r.relationship_states || [])] : [];
    node.action_directions = r ? [...(r.action_directions || [])] : [];
    node.conditions = r ? [...(r.conditions || [])] : [];
    node.time_context = r?.time_context ?? 'unspecified';
    node.experience = r?.experience ?? 'not_answered';
    node.enjoyment = r?.enjoyment ?? null;
    nodes.push(node);
    k.domain_ids.forEach(dId => edges.push({ type: 'belongs_to', source: k.id, target: dId }));
    (k.related_ids || []).forEach(rId => {
      if (k.id < rId) edges.push({ type: 'related_to', source: k.id, target: rId });
    });
  });

  return { nodes, edges };
}

// Which nodes to show. Never mutates the model or the answers.
// filters: { domains:Set|null, states:Set|null (may include 'unanswered'), showUnanswered:bool, collapsed:Set, search:string }
export function visibleNodeIds(model, filters = {}) {
  const { domains = null, states = null, showUnanswered = true, collapsed = new Set() } = filters;
  const ids = new Set();
  model.nodes.forEach(n => {
    if (n.type === 'domain') {
      if (!domains || domains.has(n.id)) ids.add(n.id);
      return;
    }
    if (domains && !n.domain_ids.some(d => domains.has(d))) return;
    if (n.domain_ids.every(d => collapsed.has(d))) return;
    if (n.answer_status === 'unanswered') {
      if (!showUnanswered) return;
      if (states && !states.has('unanswered')) return;
    } else if (states && !n.relationship_states.some(s => states.has(s))) return;
    ids.add(n.id);
  });
  return ids;
}

export function searchMatches(model, query) {
  const q = (query || '').trim().toLowerCase();
  if (!q) return null;
  return new Set(model.nodes.filter(n => n.label.toLowerCase().includes(q) || n.description.toLowerCase().includes(q)).map(n => n.id));
}

// Deterministic layout (a navigation aid, not a semantic claim — spec §6).
// Domains are fixed on a ring. Concepts start near their domain(s) and a fixed-iteration force pass
// pulls them toward their domains and pushes all nodes apart. Same input → same positions.
export function computeLayout(content) {
  const pos = {};
  const R = 420;
  const n = content.domains.length;
  content.domains.forEach((d, i) => {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    pos[d.id] = { x: Math.cos(a) * R, y: Math.sin(a) * R, fixed: true };
  });
  content.concepts.forEach((k, i) => {
    const pts = k.domain_ids.map(id => pos[id]);
    const cx = pts.reduce((s, p) => s + p.x, 0) / pts.length;
    const cy = pts.reduce((s, p) => s + p.y, 0) / pts.length;
    const a = i * 2.399963; // golden-angle jitter, deterministic
    pos[k.id] = { x: cx * 0.8 + Math.cos(a) * 40, y: cy * 0.8 + Math.sin(a) * 40 };
  });
  const concepts = content.concepts;
  const all = [...content.domains.map(d => d.id), ...concepts.map(k => k.id)];
  const REST = 135;
  for (let it = 0; it < 400; it++) {
    const cool = 1 - it / 400;
    // springs to own domains
    concepts.forEach(k => {
      const p = pos[k.id];
      k.domain_ids.forEach(dId => {
        const d = pos[dId];
        const dx = d.x - p.x, dy = d.y - p.y, dist = Math.hypot(dx, dy) || 1;
        const f = ((dist - REST) / dist) * 0.06;
        p.x += dx * f; p.y += dy * f;
      });
    });
    // repulsion
    for (let i = 0; i < all.length; i++) {
      for (let j = i + 1; j < all.length; j++) {
        const p = pos[all[i]], q = pos[all[j]];
        if (p.fixed && q.fixed) continue;
        let dx = q.x - p.x, dy = q.y - p.y;
        let dist = Math.hypot(dx, dy);
        if (dist < 0.01) { dx = 0.5; dy = 0.3; dist = 0.58; }
        const min = p.fixed || q.fixed ? 105 : 92;
        if (dist < min * 1.6) {
          const push = (Math.min(min * 1.6 - dist, 60) / dist) * 0.9 * (0.35 + cool);
          if (!p.fixed) { p.x -= dx * push * (q.fixed ? 1 : 0.5); p.y -= dy * push * (q.fixed ? 1 : 0.5); }
          if (!q.fixed) { q.x += dx * push * (p.fixed ? 1 : 0.5); q.y += dy * push * (p.fixed ? 1 : 0.5); }
        }
      }
    }
  }
  const out = {};
  all.forEach(id => { out[id] = { x: Math.round(pos[id].x * 10) / 10, y: Math.round(pos[id].y * 10) / 10 }; });
  return out;
}
