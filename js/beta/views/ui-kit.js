// Small HTML helpers shared by beta views. All text passes through escapeHtml.
import { escapeHtml } from '../../core/utils.js';

export const esc = escapeHtml;

// Toggle chip. `onclick` must be a trusted JS string (ids/indices only, never user text).
export function chip(label, selected, onclick, { title = '', tone = 'purple' } = {}) {
  const on = {
    purple: 'border-purple-400/80 bg-purple-500/25 text-white',
    teal: 'border-teal-400/80 bg-teal-500/20 text-white',
    rose: 'border-rose-400/70 bg-rose-500/20 text-white'
  }[tone];
  return `<button type="button" onclick="${onclick}" aria-pressed="${selected ? 'true' : 'false'}" ${title ? `title="${esc(title)}"` : ''}
    class="min-h-[40px] px-3 py-2 rounded-xl border text-xs sm:text-[13px] text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-300 ${
      selected ? on : 'border-white/10 bg-black/40 text-zinc-300 hover:bg-white/[0.06]'
    }">${selected ? '<span aria-hidden="true">✓ </span>' : ''}${esc(label)}</button>`;
}

export function sectionTitle(eyebrow, title, sub = '') {
  return `<div class="space-y-1">
    ${eyebrow ? `<div class="font-mono text-[10px] uppercase tracking-widest text-teal-300">${esc(eyebrow)}</div>` : ''}
    <h2 class="text-lg sm:text-xl font-semibold text-white leading-snug">${esc(title)}</h2>
    ${sub ? `<p class="text-xs sm:text-sm text-zinc-400 leading-relaxed">${esc(sub)}</p>` : ''}
  </div>`;
}

export function button(label, onclick, variant = 'ghost', extra = '') {
  const cls = {
    primary: 'bg-purple-600 hover:bg-purple-500 text-white border-purple-500',
    teal: 'bg-teal-600 hover:bg-teal-500 text-white border-teal-500',
    ghost: 'bg-white/[0.04] hover:bg-white/[0.09] text-zinc-200 border-white/10',
    danger: 'bg-rose-600/80 hover:bg-rose-600 text-white border-rose-500'
  }[variant];
  return `<button type="button" onclick="${onclick}" ${extra} class="min-h-[42px] px-4 py-2 rounded-xl border text-xs sm:text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-300 ${cls}">${esc(label)}</button>`;
}

export const card = (inner, extra = '') => `<div class="glass-panel rounded-2xl border border-white/10 p-4 sm:p-5 ${extra}">${inner}</div>`;
