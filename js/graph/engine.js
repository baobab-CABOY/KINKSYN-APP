// Interactive canvas neural graph (render loop, pan/zoom/drag, hit-testing).
import { app } from '../app.js';
import { DRIVERS, ACTIVITIES } from '../data/nodes.js';

export class NeuralGraphEngine {
  constructor(canvas, profile, partnerProfile, onSelectNode) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.profile = profile;
    this.partnerProfile = partnerProfile;
    this.onSelectNode = onSelectNode;

    this.filterMode = 'all';
    this.polarityView = 'overlay';
    this.selectedId = app.selectedNodeId || 'surrender';
    this.hoveredId = null;

    this.nodes = [];
    this.edges = [];
    this.pulses = [];
    this.dust = [];

    this.width = 360;
    this.height = 380;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.pan = { x: 0, y: 0 };
    this.scale = 1;
    this.time = 0;

    this.draggedNode = null;
    this.isPanning = false;
    this.pointerStart = { x: 0, y: 0 };
    this.panStart = { x: 0, y: 0 };
    this.hasMoved = false;
    this.rafId = null;

    this.buildGraphData();
    this.resize();
    this.bindEvents();
    this.startLoop();
  }

  buildGraphData() {
    this.nodes.push({
      id: 'core',
      label: 'DESIRE CORE',
      type: 'core',
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
      baseRadius: 15,
      radius: 15
    });

    const driverKeys = Object.keys(DRIVERS);
    driverKeys.forEach((key, idx) => {
      const d = DRIVERS[key];
      const pData = this.profile.nodes[key] || { score: 0 };
      const angle = (idx / driverKeys.length) * Math.PI * 2 - Math.PI / 2;
      const dist = 132;
      const x = Math.cos(angle) * dist;
      const y = Math.sin(angle) * dist;

      this.nodes.push({
        id: key,
        label: d.shortLabel,
        type: 'driver',
        color: d.color,
        rgb: d.rgb,
        x,
        y,
        targetX: x,
        targetY: y,
        baseRadius: 9,
        radius: 9 + (pData.score / 100) * 11
      });

      this.edges.push({ source: 'core', target: key });
    });

    ACTIVITIES.forEach((act, idx) => {
      const pData = this.profile.nodes[act.id] || { score: 0 };
      const angle = (idx / ACTIVITIES.length) * Math.PI * 2 - Math.PI / 2 + 0.18;
      const dist = 242 + (idx % 2 === 0 ? 16 : -14);
      const x = Math.cos(angle) * dist;
      const y = Math.sin(angle) * dist;
      const primaryDriver = DRIVERS[act.drivers[0]] || DRIVERS.surrender;

      this.nodes.push({
        id: act.id,
        label: act.label,
        type: 'activity',
        color: primaryDriver.color,
        rgb: primaryDriver.rgb,
        x,
        y,
        targetX: x,
        targetY: y,
        baseRadius: 6,
        radius: 6 + (pData.score / 100) * 8.5
      });

      act.drivers.forEach(dId => {
        this.edges.push({ source: dId, target: act.id });
      });
    });

    for (let i = 0; i < 65; i++) {
      this.dust.push({
        x: (Math.random() - 0.5) * 1000,
        y: (Math.random() - 0.5) * 850,
        r: Math.random() * 1.3 + 0.3,
        alpha: Math.random() * 0.25 + 0.05
      });
    }

    this.pulses = this.edges.map(edge => ({
      edge,
      progress: Math.random(),
      speed: 0.004 + Math.random() * 0.005
    }));
  }

  resize() {
    if (!this.canvas) return;
    const parent = this.canvas.parentElement;
    const rect = parent ? parent.getBoundingClientRect() : this.canvas.getBoundingClientRect();
    this.width = Math.max(rect.width || window.innerWidth || 360, 280);
    this.height = Math.max(rect.height || 360, 320);

    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.floor(this.width * this.dpr);
    this.canvas.height = Math.floor(this.height * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    const minDim = Math.min(this.width, this.height);
    this.scale = minDim < 420 ? 0.58 : minDim < 580 ? 0.72 : 0.9;
  }

  bindEvents() {
    this._onResize = () => this.resize();
    window.addEventListener('resize', this._onResize);

    if (typeof ResizeObserver !== 'undefined' && this.canvas.parentElement) {
      this._resizeObserver = new ResizeObserver(() => this.resize());
      this._resizeObserver.observe(this.canvas.parentElement);
    }

    const getPos = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return { x: clientX - rect.left, y: clientY - rect.top };
    };

    const onDown = (e) => {
      const pos = getPos(e);
      this.pointerStart = pos;
      this.panStart = { ...this.pan };
      this.hasMoved = false;

      const hit = this.hitTest(pos.x, pos.y);
      if (hit) {
        this.draggedNode = hit;
      } else {
        this.isPanning = true;
      }
    };

    const onMove = (e) => {
      const pos = getPos(e);
      if (this.draggedNode) {
        const dx = pos.x - this.pointerStart.x;
        const dy = pos.y - this.pointerStart.y;
        if (Math.hypot(dx, dy) > 4) this.hasMoved = true;

        const worldX = (pos.x - this.width / 2 - this.pan.x) / this.scale;
        const worldY = (pos.y - this.height / 2 - this.pan.y) / this.scale;
        this.draggedNode.x = worldX;
        this.draggedNode.y = worldY;
        this.draggedNode.targetX = worldX;
        this.draggedNode.targetY = worldY;
      } else if (this.isPanning) {
        const dx = pos.x - this.pointerStart.x;
        const dy = pos.y - this.pointerStart.y;
        if (Math.hypot(dx, dy) > 4) this.hasMoved = true;
        this.pan.x = this.panStart.x + dx;
        this.pan.y = this.panStart.y + dy;
      } else if (!e.touches) {
        const hit = this.hitTest(pos.x, pos.y);
        this.hoveredId = hit ? hit.id : null;
        this.canvas.style.cursor = hit ? 'pointer' : 'grab';
      }
    };

    const onUp = () => {
      if (this.draggedNode && !this.hasMoved) {
        this.selectedId = this.draggedNode.id;
        if (this.onSelectNode) this.onSelectNode(this.draggedNode.id);
      }
      this.draggedNode = null;
      this.isPanning = false;
    };

    this._onWheel = (e) => {
      e.preventDefault();
      const factor = e.deltaY < 0 ? 1.08 : 0.92;
      this.scale = Math.max(0.42, Math.min(1.8, this.scale * factor));
    };

    this.canvas.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    this.canvas.addEventListener('touchstart', onDown, { passive: true });
    this.canvas.addEventListener('touchmove', onMove, { passive: true });
    this.canvas.addEventListener('touchend', onUp);
    this.canvas.addEventListener('wheel', this._onWheel, { passive: false });

    this._cleanupListeners = () => {
      window.removeEventListener('resize', this._onResize);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      if (this._resizeObserver) this._resizeObserver.disconnect();
    };
  }

  hitTest(screenX, screenY) {
    const wx = (screenX - this.width / 2 - this.pan.x) / this.scale;
    const wy = (screenY - this.height / 2 - this.pan.y) / this.scale;
    for (let i = this.nodes.length - 1; i >= 0; i--) {
      const n = this.nodes[i];
      if (!this.isNodeVisible(n)) continue;
      const dist = Math.hypot(wx - n.x, wy - n.y);
      if (dist <= n.radius + 14) return n;
    }
    return null;
  }

  focusNode(nodeId) {
    this.selectedId = nodeId;
  }

  setPartnerProfile(pProf) {
    this.partnerProfile = pProf;
  }

  setFilterMode(mode) {
    this.filterMode = mode;
  }

  setPolarityView(mode) {
    this.polarityView = mode;
  }

  getNodeStats(n) {
    return this.profile.nodes[n.id] || { score: 0, receivingScore: 0, givingScore: 0, isPrimarilyFantasy: false };
  }

  getNodeEffectiveScore(n) {
    if (n.id === 'core') return 100;
    const st = this.getNodeStats(n);
    if (this.polarityView === 'receiving') return st.receivingScore ?? st.score;
    if (this.polarityView === 'giving') return st.givingScore ?? st.score;
    return st.score;
  }

  getNodeVisualStyle(n) {
    if (n.id === 'core') {
      return { color: '#f3e8ff', rgb: '216, 180, 254', isDual: false };
    }
    const st = this.getNodeStats(n);
    const rec = st.receivingScore ?? 0;
    const give = st.givingScore ?? 0;

    if (this.polarityView === 'receiving') {
      return { color: '#818cf8', rgb: '129, 140, 248', isDual: false };
    }
    if (this.polarityView === 'giving') {
      return { color: '#fb7185', rgb: '251, 113, 133', isDual: false };
    }
    if (rec >= 35 && give >= 35) {
      return { color: '#e879f9', rgb: '232, 121, 249', isDual: true };
    }
    if (give > rec + 12) {
      return { color: '#fb7185', rgb: '251, 113, 133', isDual: false };
    }
    if (rec > give + 12) {
      return { color: '#818cf8', rgb: '129, 140, 248', isDual: false };
    }
    return { color: n.color, rgb: n.rgb, isDual: false };
  }

  getEdgeEffectiveStrength(s, t) {
    const sScore = this.getNodeEffectiveScore(s) / 100;
    const tScore = this.getNodeEffectiveScore(t) / 100;
    if (s.id === 'core') return tScore;
    return Math.min(sScore, tScore) * 0.85 + tScore * 0.15;
  }

  isNodeVisible(n) {
    if (n.id === 'core') return true;
    const st = this.getNodeStats(n);
    const effScore = this.getNodeEffectiveScore(n);
    if (this.filterMode === 'active') return effScore >= 25;
    if (this.filterMode === 'fantasy') return st.isPrimarilyFantasy && effScore > 0;
    return true;
  }

  updatePhysics() {
    this.time += 0.016;
    this.nodes.forEach((n, idx) => {
      if (n.id === 'core') return;
      const effScore = this.getNodeEffectiveScore(n);
      const scaleFactor = n.type === 'driver' ? 11 : 8.5;
      const targetR = n.baseRadius + (effScore / 100) * scaleFactor;
      n.radius += (targetR - n.radius) * 0.15;

      if (n === this.draggedNode) return;
      const floatX = Math.cos(this.time * 0.8 + idx * 1.3) * 2.8;
      const floatY = Math.sin(this.time * 0.72 + idx * 1.7) * 2.8;
      n.x += (n.targetX + floatX - n.x) * 0.06;
      n.y += (n.targetY + floatY - n.y) * 0.06;
    });

    this.pulses.forEach(p => {
      p.progress += p.speed;
      if (p.progress > 1) p.progress = 0;
    });
  }

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    ctx.save();
    ctx.translate(this.width / 2 + this.pan.x, this.height / 2 + this.pan.y);
    ctx.scale(this.scale, this.scale);

    this.dust.forEach(d => {
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${d.alpha})`;
      ctx.fill();
    });

    const nodeMap = {};
    this.nodes.forEach(n => (nodeMap[n.id] = n));

    this.edges.forEach(edge => {
      const s = nodeMap[edge.source];
      const t = nodeMap[edge.target];
      if (!s || !t) return;

      const effStrength = this.getEdgeEffectiveStrength(s, t);
      const style = this.getNodeVisualStyle(t);
      const visible = this.isNodeVisible(s) && this.isNodeVisible(t);
      const isHighlighted =
        this.selectedId === s.id ||
        this.selectedId === t.id ||
        this.hoveredId === s.id ||
        this.hoveredId === t.id;

      const tEff = this.getNodeEffectiveScore(t);
      const partnerScore = this.partnerProfile?.nodes[t.id]?.score || 0;
      const isMutualGold = this.partnerProfile && tEff >= 45 && partnerScore >= 45;

      const baseAlpha = !visible ? 0.03 : isMutualGold ? 0.78 : Math.max(0.08, effStrength * 0.85);

      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(t.x, t.y);

      if (isMutualGold && visible) {
        ctx.strokeStyle = `rgba(251, 191, 36, ${isHighlighted ? 0.95 : baseAlpha})`;
        ctx.lineWidth = isHighlighted ? 3 : 2.1;
      } else if (effStrength >= 0.25 && visible) {
        ctx.strokeStyle = `rgba(${style.rgb}, ${isHighlighted ? 0.92 : baseAlpha})`;
        ctx.lineWidth = isHighlighted ? 2.8 : (style.isDual ? 1.6 : 1) + effStrength * 1.7;
      } else {
        ctx.strokeStyle = `rgba(255, 255, 255, ${visible ? 0.07 : 0.02})`;
        ctx.lineWidth = 1;
      }
      ctx.stroke();
    });

    this.pulses.forEach(p => {
      const s = nodeMap[p.edge.source];
      const t = nodeMap[p.edge.target];
      if (!s || !t || !this.isNodeVisible(s) || !this.isNodeVisible(t)) return;

      const effStrength = this.getEdgeEffectiveStrength(s, t);
      if (effStrength < 0.25) return;

      const style = this.getNodeVisualStyle(t);
      const px = s.x + (t.x - s.x) * p.progress;
      const py = s.y + (t.y - s.y) * p.progress;

      const tEff = this.getNodeEffectiveScore(t);
      const partnerScore = this.partnerProfile?.nodes[t.id]?.score || 0;
      const isMutualGold = this.partnerProfile && tEff >= 45 && partnerScore >= 45;

      ctx.beginPath();
      ctx.arc(px, py, isMutualGold ? 3.2 : style.isDual ? 2.9 : 2.2, 0, Math.PI * 2);
      ctx.fillStyle = isMutualGold ? '#fde68a' : '#ffffff';
      ctx.shadowBlur = style.isDual ? 14 : 10;
      ctx.shadowColor = isMutualGold ? '#f59e0b' : style.color;
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    this.nodes.forEach(n => {
      const visible = this.isNodeVisible(n);
      const isSelected = this.selectedId === n.id;
      const isHovered = this.hoveredId === n.id;
      const st = this.getNodeStats(n);
      const effScore = this.getNodeEffectiveScore(n);
      const isLit = n.id === 'core' || effScore >= 25;
      const style = this.getNodeVisualStyle(n);

      const partnerScore = this.partnerProfile?.nodes[n.id]?.score || 0;
      const isMutualGold = n.id !== 'core' && this.partnerProfile && effScore >= 45 && partnerScore >= 45;

      ctx.save();
      if (!visible) ctx.globalAlpha = 0.14;

      if (isLit) {
        const extraHalo = style.isDual ? 6 : 0;
        const pulseR = n.radius + extraHalo + (isSelected ? 14 : 9) + Math.sin(this.time * 3) * 2;
        const grad = ctx.createRadialGradient(n.x, n.y, n.radius * 0.25, n.x, n.y, pulseR);
        const glowRgb = isMutualGold ? '245, 158, 11' : style.rgb;
        grad.addColorStop(0, `rgba(${glowRgb}, ${style.isDual ? 0.65 : isSelected ? 0.55 : 0.38})`);
        grad.addColorStop(1, `rgba(${glowRgb}, 0)`);
        ctx.beginPath();
        ctx.arc(n.x, n.y, pulseR, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }

      if (style.isDual && isLit && n.id !== 'core') {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius + 4, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(245, 208, 254, 0.8)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      if (this.partnerProfile && n.id !== 'core' && partnerScore >= 40) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius + 6.5, 0, Math.PI * 2);
        ctx.strokeStyle = isMutualGold ? 'rgba(251, 191, 36, 0.9)' : 'rgba(34, 211, 238, 0.55)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 3]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      ctx.beginPath();
      ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
      if (n.id === 'core') {
        ctx.fillStyle = '#f3e8ff';
      } else if (isLit) {
        ctx.fillStyle = isMutualGold ? '#fbbf24' : style.color;
      } else {
        ctx.fillStyle = '#1e1e26';
      }
      ctx.fill();

      ctx.lineWidth = isSelected || isHovered ? 2.5 : 1.2;
      ctx.strokeStyle = isSelected ? '#ffffff' : isLit ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.16)';
      ctx.stroke();

      if (st.isPrimarilyFantasy && effScore > 0 && n.id !== 'core') {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius + 3, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.88)';
        ctx.lineWidth = 1.4;
        ctx.stroke();
      }

      ctx.font = n.type === 'driver'
        ? '600 12px "Inter", sans-serif'
        : n.type === 'core'
        ? '600 10px "JetBrains Mono", monospace'
        : '500 11px "Inter", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = isSelected
        ? '#ffffff'
        : isLit
        ? 'rgba(244, 244, 245, 0.95)'
        : 'rgba(161, 161, 170, 0.45)';

      const labelY = n.y + n.radius + 14;
      ctx.fillText(n.label, n.x, labelY);

      if (n.id !== 'core' && isLit) {
        ctx.font = '500 10px "JetBrains Mono", monospace';
        ctx.fillStyle = isMutualGold
          ? '#fcd34d'
          : this.polarityView === 'receiving'
          ? '#a5b4fc'
          : this.polarityView === 'giving'
          ? '#fda4af'
          : 'rgba(232, 121, 249, 0.95)';
        ctx.fillText(`${effScore}%`, n.x, labelY + 12);
      }

      ctx.restore();
    });

    ctx.restore();
  }

  startLoop() {
    const tick = () => {
      this.updatePhysics();
      this.draw();
      this.rafId = requestAnimationFrame(tick);
    };
    this.rafId = requestAnimationFrame(tick);
  }

  destroy() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    if (this._cleanupListeners) this._cleanupListeners();
  }
}
