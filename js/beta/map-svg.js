// SVG rendering of the Neural Node Map. Pure string builders (no DOM).
// Encoding (spec §3): each relationship state adds its own cue; cues stack. Size is fixed by node type.
import { esc } from './views/ui-kit.js';

export const NODE_R = { domain: 24, concept: 11 };
const NEUTRAL_FILL = '#26262f';
const NEUTRAL_STROKE = '#5b5b66';

const short = (s, n = 24) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

// Decorations for a set of states around a node of radius r. Returns SVG markup (centered at 0,0).
export function stateDecorations(states, r, color) {
  const has = s => states.includes(s);
  const out = [];
  if (has('fantasy_only')) out.push(`<circle r="${r + 11}" fill="url(#betaHalo)"/>`);
  if (has('unsure')) out.push(`<circle r="${r + 13}" fill="none" stroke="#a1a1aa" stroke-width="1.2" stroke-dasharray="3 3"/>`);
  if (has('open_under_conditions')) out.push(`<circle r="${r + 9.5}" fill="none" stroke="#e4e4e7" stroke-width="2" stroke-dasharray="7 4"/>`);
  if (has('curious')) out.push(`<circle r="${r + 6}" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-dasharray="0.1 4.2"/>`);
  if (has('currently_practice')) out.push(`<circle r="${r + 3}" fill="none" stroke="#ffffff" stroke-width="1.2"/>`);
  return out.join('');
}

export function stateMarkers(states, r) {
  const has = s => states.includes(s);
  const out = [];
  if (has('tried_before')) out.push(`<rect x="${-r - 4}" y="${-r - 4}" width="6" height="6" fill="#fde68a" stroke="#0b0b10" stroke-width="1"/>`);
  if (has('enjoy_or_would_choose_again')) out.push(`<circle cx="${r + 1}" cy="${r + 1}" r="3.2" fill="#34d399" stroke="#0b0b10" stroke-width="1"/>`);
  if (has('prefer_not_to_answer')) out.push(`<path d="M ${r + 1} ${-r - 6} l 4 4 l -4 4 l -4 -4 z" fill="none" stroke="#d4d4d8" stroke-width="1.2"/>`);
  const glyph = (has('unfamiliar') ? '?' : '') + (has('not_interested') ? '−' : '');
  if (glyph) out.push(`<text y="4" text-anchor="middle" font-size="${r > 15 ? 15 : 11}" font-weight="700" fill="#f4f4f5" font-family="Inter, sans-serif" pointer-events="none">${glyph}</text>`);
  return out.join('');
}

export function baseCircle(states, answered, r, color) {
  const has = s => states.includes(s);
  const fill = !answered ? NEUTRAL_FILL : has('appealing') ? color : '#14141c';
  let stroke = answered ? color : NEUTRAL_STROKE;
  let width = answered ? 1.6 : 1;
  if (has('not_interested')) { stroke = '#71717a'; width = 1.4; }
  if (has('want_to_explore')) { stroke = '#ffffff'; width = 3; }
  return `<circle r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${width}"/>`;
}

export function nodeAriaLabel(n, stateById) {
  const kind = n.type === 'domain' ? 'Area' : 'Concept';
  const st = n.relationship_states.length ? n.relationship_states.map(s => stateById[s]?.label || s).join(', ') : 'not answered';
  return `${kind}: ${n.label}. ${st}.`;
}

export function renderNodeSvg(n, p, { selected, dimmed, collapsed, stateById }) {
  const r = NODE_R[n.type];
  const answered = n.answer_status === 'answered';
  const states = n.relationship_states;
  const color = answered ? n.color : NEUTRAL_STROKE;
  return `<g class="beta-node" data-id="${n.id}" data-status="${n.answer_status}" data-states="${states.join(' ')}"
      transform="translate(${p.x.toFixed(1)},${p.y.toFixed(1)})" opacity="${dimmed ? 0.22 : 1}"
      tabindex="0" role="button" aria-label="${esc(nodeAriaLabel(n, stateById))}"
      onclick="app.betaSelectNode('${n.id}')"
      onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();app.betaSelectNode('${n.id}')}">
    <title>${esc(n.label)}</title>
    ${selected ? `<circle r="${r + 18}" fill="none" stroke="#ffffff" stroke-opacity="0.75" stroke-width="1.5"/>` : ''}
    <circle r="${r + 16}" fill="transparent"/>
    <circle class="beta-focus" r="${r + 21}" fill="none" stroke="#c4b5fd" stroke-width="2.5" stroke-dasharray="5 3"/>
    ${stateDecorations(states, r, color)}
    ${baseCircle(states, answered, r, n.color)}
    ${n.type === 'domain' && !answered ? `<circle r="${r - 7}" fill="none" stroke="${n.color}" stroke-opacity="0.55" stroke-width="2"/>` : ''}
    ${stateMarkers(states, r)}
    ${collapsed ? `<text y="5" text-anchor="middle" font-size="15" fill="#fff" pointer-events="none">+</text>` : ''}
    <text class="${n.type === 'concept' && !answered && !selected ? 'beta-lbl-minor' : ''}" y="${r + 15 + (states.length ? 6 : 0)}" text-anchor="middle" font-family="Inter, sans-serif"
      style="font-size:calc(${n.type === 'domain' ? 12.5 : 10.5}px * var(--ls, 1))" font-weight="${n.type === 'domain' ? 600 : 400}"
      fill="${answered ? '#f4f4f5' : '#a1a1aa'}" pointer-events="none">${esc(short(n.label, n.type === 'domain' ? 30 : 24))}</text>
  </g>`;
}

export function renderEdgesSvg(model, pos, visible, selectedId) {
  return model.edges.filter(e => visible.has(e.source) && visible.has(e.target)).map(e => {
    const a = pos[e.source], b = pos[e.target];
    const hi = selectedId && (e.source === selectedId || e.target === selectedId);
    // Uniform thickness: edges mean taxonomy membership only, never strength.
    return `<line x1="${a.x.toFixed(1)}" y1="${a.y.toFixed(1)}" x2="${b.x.toFixed(1)}" y2="${b.y.toFixed(1)}"
      stroke="${hi ? '#e9d5ff' : '#ffffff'}" stroke-opacity="${hi ? 0.7 : 0.12}" stroke-width="1.2"
      ${e.type === 'related_to' ? 'stroke-dasharray="4 4"' : ''}/>`;
  }).join('');
}

export const SVG_DEFS = `<defs><radialGradient id="betaHalo"><stop offset="40%" stop-color="#a78bfa" stop-opacity="0.55"/><stop offset="100%" stop-color="#a78bfa" stop-opacity="0"/></radialGradient></defs>`;

// Small legend icon for one state (or 'unanswered').
export function legendIcon(stateId) {
  const r = 7;
  const states = stateId === 'unanswered' ? [] : [stateId];
  return `<svg width="40" height="40" viewBox="-20 -20 40 40" aria-hidden="true">${SVG_DEFS}
    ${stateDecorations(states, r, '#c084fc')}${baseCircle(states, stateId !== 'unanswered', r, '#c084fc')}${stateMarkers(states, r)}</svg>`;
}
