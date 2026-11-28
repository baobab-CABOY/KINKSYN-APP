// Pan / zoom / pinch for the beta SVG map. View state lives in app.betaMap.view so re-renders keep it.
// Listeners are attached to the (re-created) <svg> element only — nothing leaks onto window.

const MIN_K = 0.25;
const MAX_K = 3;

// Fit the whole layout (plus label room) into the visible SVG.
export function fitView(svg, layout = null) {
  const w = svg.clientWidth || 360;
  const h = svg.clientHeight || 360;
  let minX = -560, maxX = 560, minY = -540, maxY = 540;
  const pts = layout ? Object.values(layout).filter(Boolean) : [];
  if (pts.length) {
    minX = Math.min(...pts.map(p => p.x)) - 150; maxX = Math.max(...pts.map(p => p.x)) + 150;
    minY = Math.min(...pts.map(p => p.y)) - 45; maxY = Math.max(...pts.map(p => p.y)) + 60;
  }
  const k = Math.max(MIN_K, Math.min(1.4, Math.min(w / (maxX - minX), h / (maxY - minY))));
  return { k, x: w / 2 - ((minX + maxX) / 2) * k, y: h / 2 - ((minY + maxY) / 2) * k };
}

function apply(app) {
  const vp = document.getElementById('betaViewport');
  const v = app.betaMap.view;
  if (vp && v) vp.setAttribute('transform', `translate(${v.x.toFixed(1)},${v.y.toFixed(1)}) scale(${v.k.toFixed(3)})`);
  const svg = document.getElementById('betaSvg');
  if (svg && v) {
    // Keep labels readable when zoomed out; hide minor labels when far out (tap still opens details).
    svg.style.setProperty('--ls', Math.min(1.9, Math.max(1, 0.8 / v.k)).toFixed(2));
    svg.classList.toggle('beta-far', v.k < 0.6);
  }
}

export { apply as applyView };

export function zoomAt(app, factor, cx, cy) {
  const v = app.betaMap.view;
  const k = Math.max(MIN_K, Math.min(MAX_K, v.k * factor));
  const f = k / v.k;
  app.betaMap.view = { k, x: cx - (cx - v.x) * f, y: cy - (cy - v.y) * f };
  apply(app);
}

export function attachMapController(app) {
  const svg = document.getElementById('betaSvg');
  if (!svg) return;
  if (!app.betaMap.view) app.betaMap.view = fitView(svg, app.betaVisiblePos || app.betaLayout);
  apply(app);

  const pointers = new Map();
  let start = null;
  let pinch = null;

  svg.addEventListener('pointerdown', e => {
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 1) {
      start = { x: e.clientX, y: e.clientY, vx: app.betaMap.view.x, vy: app.betaMap.view.y, moved: false };
    } else if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      pinch = { d: Math.hypot(a.x - b.x, a.y - b.y) };
    }
  });

  svg.addEventListener('pointermove', e => {
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const rect = svg.getBoundingClientRect();
    if (pointers.size === 2 && pinch) {
      const [a, b] = [...pointers.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (pinch.d > 0) zoomAt(app, d / pinch.d, (a.x + b.x) / 2 - rect.left, (a.y + b.y) / 2 - rect.top);
      pinch.d = d;
      if (start) start.moved = true;
      return;
    }
    if (!start) return;
    const dx = e.clientX - start.x, dy = e.clientY - start.y;
    if (!start.moved && Math.hypot(dx, dy) > 6) {
      start.moved = true;
      try { svg.setPointerCapture(e.pointerId); } catch (_) { /* ignore */ }
    }
    if (start.moved) {
      app.betaMap.view = { ...app.betaMap.view, x: start.vx + dx, y: start.vy + dy };
      apply(app);
    }
  });

  const end = e => {
    pointers.delete(e.pointerId);
    if (pointers.size < 2) pinch = null;
    if (pointers.size === 0 && start) {
      // Suppress the click that follows a drag so panning never opens a node.
      app.betaMapDragged = start.moved;
      setTimeout(() => { app.betaMapDragged = false; }, 0);
      start = null;
    }
  };
  svg.addEventListener('pointerup', end);
  svg.addEventListener('pointercancel', end);

  svg.addEventListener('wheel', e => {
    e.preventDefault();
    const rect = svg.getBoundingClientRect();
    zoomAt(app, e.deltaY < 0 ? 1.12 : 0.89, e.clientX - rect.left, e.clientY - rect.top);
  }, { passive: false });
}
