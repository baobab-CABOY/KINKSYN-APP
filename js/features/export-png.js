// One-pager PNG export (offscreen canvas).
import { DRIVERS, ACTIVITIES, ALL_NODES_MAP } from '../data/nodes.js';

export const exportPngMethods = {
  // =========================================================================
  // ONE-PAGER HIGH-RES PNG EXPORT ENGINE (3 MINI GRAPHS + RANKINGS + LIMITS)
  // =========================================================================
  openPngExportModal() {
    if (!this.profile) return;
    const modal = document.getElementById('pngModal');
    if (!modal) return;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    this.renderOnePagerCanvas();
  },

  renderOnePagerCanvas() {
    if (!this.profile) return;
    const nameInput = document.getElementById('posterNameInput');
    const customName = nameInput && nameInput.value.trim() ? nameInput.value.trim() : 'Personal Neural Blueprint';

    const W = 1200;
    const H = 1860;
    const offCanvas = document.createElement('canvas');
    offCanvas.width = W;
    offCanvas.height = H;
    const ctx = offCanvas.getContext('2d');

    ctx.fillStyle = '#08080c';
    ctx.fillRect(0, 0, W, H);

    const topGlow = ctx.createRadialGradient(W * 0.5, 180, 40, W * 0.5, 180, 680);
    topGlow.addColorStop(0, 'rgba(168, 85, 247, 0.16)');
    topGlow.addColorStop(0.5, 'rgba(99, 102, 241, 0.06)');
    topGlow.addColorStop(1, 'rgba(8, 8, 12, 0)');
    ctx.fillStyle = topGlow;
    ctx.fillRect(0, 0, W, 850);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
    ctx.lineWidth = 1;
    for (let gx = 0; gx < W; gx += 40) {
      ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke();
    }
    for (let gy = 0; gy < H; gy += 40) {
      ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke();
    }

    this.drawRoundRect(ctx, 28, 28, W - 56, H - 56, 28);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#c084fc';
    ctx.font = '600 16px "JetBrains Mono", monospace';
    ctx.fillText('KINKY SYNAPSES // DESIRE & POLARITY ENGINE', 68, 86);

    ctx.fillStyle = '#ffffff';
    ctx.font = '700 38px "Inter", sans-serif';
    ctx.fillText(customName, 68, 134);

    const archetype = this.getArchetypeTitle(this.profile);
    ctx.fillStyle = '#a5b4fc';
    ctx.font = '500 20px "Inter", sans-serif';
    ctx.fillText(archetype, 68, 168);

    const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    ctx.textAlign = 'right';
    ctx.fillStyle = '#71717a';
    ctx.font = '500 15px "JetBrains Mono", monospace';
    ctx.fillText(`MAPPED: ${dateStr.toUpperCase()}`, W - 68, 86);
    ctx.fillStyle = '#2dd4bf';
    ctx.fillText('ZERO-KNOWLEDGE · LOCAL VAULT', W - 68, 114);
    ctx.textAlign = 'left';

    const lenses = [
      { mode: 'overlay', title: '01 // OVERLAY LENS', subtitle: 'Integrated Dual Polarity', accent: '#e879f9' },
      { mode: 'receiving', title: '02 // RECEIVING LENS', subtitle: 'Sub / Bottom / Receptive', accent: '#818cf8' },
      { mode: 'giving', title: '03 // GIVING LENS', subtitle: 'Dom / Top / Guiding', accent: '#fb7185' }
    ];

    const boxW = 342;
    const boxH = 385;
    const startX = 68;
    const gapX = 19;
    const boxY = 205;

    lenses.forEach((lens, idx) => {
      const bx = startX + idx * (boxW + gapX);
      this.drawRoundRect(ctx, bx, boxY, boxW, boxH, 20);
      ctx.fillStyle = 'rgba(18, 18, 26, 0.92)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = lens.accent;
      ctx.font = '600 14px "JetBrains Mono", monospace';
      ctx.fillText(lens.title, bx + 20, boxY + 32);

      ctx.fillStyle = '#a1a1aa';
      ctx.font = '400 13px "Inter", sans-serif';
      ctx.fillText(lens.subtitle, bx + 20, boxY + 53);

      this.drawMiniNeuralGraph(ctx, bx + boxW / 2, boxY + 225, 0.44, lens.mode);
    });

    let curY = 635;
    ctx.fillStyle = '#c084fc';
    ctx.font = '600 16px "JetBrains Mono", monospace';
    ctx.fillText('04 // RANKED PSYCHOLOGICAL DRIVERS ("THE WHY")', 68, curY);
    curY += 20;

    const rankedDrivers = Object.keys(DRIVERS)
      .map(k => ({ meta: DRIVERS[k], stats: this.profile.nodes[k] }))
      .sort((a, b) => b.stats.score - a.stats.score)
      .slice(0, 5);

    rankedDrivers.forEach((item, idx) => {
      const rowH = 104;
      this.drawRoundRect(ctx, 68, curY, W - 136, rowH, 16);
      ctx.fillStyle = 'rgba(20, 20, 28, 0.9)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = item.meta.color;
      ctx.font = '700 18px "JetBrains Mono", monospace';
      ctx.fillText(`#0${idx + 1}`, 90, curY + 34);

      ctx.fillStyle = '#ffffff';
      ctx.font = '600 19px "Inter", sans-serif';
      ctx.fillText(item.meta.label, 146, curY + 34);

      ctx.textAlign = 'right';
      ctx.fillStyle = item.meta.color;
      ctx.font = '700 22px "JetBrains Mono", monospace';
      ctx.fillText(`${item.stats.score}%`, W - 92, curY + 34);

      ctx.fillStyle = '#a1a1aa';
      ctx.font = '500 13px "JetBrains Mono", monospace';
      ctx.fillText(`REC ${item.stats.receivingScore}% · GIVE ${item.stats.givingScore}% · ${item.stats.polarity}`, W - 92, curY + 56);
      ctx.textAlign = 'left';

      this.drawRoundRect(ctx, 146, curY + 46, 460, 7, 4);
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      ctx.fill();
      this.drawRoundRect(ctx, 146, curY + 46, Math.max(8, (460 * item.stats.score) / 100), 7, 4);
      ctx.fillStyle = item.meta.color;
      ctx.fill();

      ctx.fillStyle = '#d4d4d8';
      ctx.font = '400 13.5px "Inter", sans-serif';
      const shortDef = this.truncateText(ctx, item.meta.definition, W - 245);
      ctx.fillText(shortDef, 146, curY + 82);

      curY += rowH + 12;
    });

    curY += 16;
    const colW = (W - 156) / 2;
    const leftX = 68;
    const rightX = 68 + colW + 20;

    ctx.fillStyle = '#38bdf8';
    ctx.font = '600 15px "JetBrains Mono", monospace';
    ctx.fillText('05 // TOP EROTIC PATHWAYS', leftX, curY);

    const rankedActivities = ACTIVITIES
      .map(a => ({ meta: a, stats: this.profile.nodes[a.id] }))
      .sort((a, b) => b.stats.score - a.stats.score)
      .slice(0, 5);

    let actY = curY + 18;
    rankedActivities.forEach((item, idx) => {
      const cardH = 82;
      this.drawRoundRect(ctx, leftX, actY, colW, cardH, 14);
      ctx.fillStyle = 'rgba(20, 20, 28, 0.9)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = '600 16px "Inter", sans-serif';
      ctx.fillText(`${idx + 1}. ${item.meta.label}`, leftX + 18, actY + 29);

      ctx.textAlign = 'right';
      ctx.fillStyle = '#38bdf8';
      ctx.font = '700 17px "JetBrains Mono", monospace';
      ctx.fillText(`${item.stats.score}%`, leftX + colW - 18, actY + 29);
      ctx.textAlign = 'left';

      ctx.fillStyle = '#a1a1aa';
      ctx.font = '400 12.5px "Inter", sans-serif';
      const defLine = this.truncateText(ctx, item.meta.definition, colW - 36);
      ctx.fillText(defLine, leftX + 18, actY + 53);

      ctx.fillStyle = item.stats.isPrimarilyFantasy ? '#fbbf24' : '#c084fc';
      ctx.font = '500 11px "JetBrains Mono", monospace';
      ctx.fillText(`${item.stats.polarity} · ${item.stats.statusTag}`, leftX + 18, actY + 71);

      actY += cardH + 10;
    });

    ctx.fillStyle = '#2dd4bf';
    ctx.font = '600 15px "JetBrains Mono", monospace';
    ctx.fillText('06 // WHOLE-PERSON BASELINE & BOUNDARIES', rightX, curY);

    let rightY = curY + 18;

    this.drawRoundRect(ctx, rightX, rightY, colW, 195, 14);
    ctx.fillStyle = 'rgba(20, 24, 28, 0.92)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(45, 212, 191, 0.25)';
    ctx.stroke();

    ctx.fillStyle = '#2dd4bf';
    ctx.font = '600 14px "JetBrains Mono", monospace';
    ctx.fillText('NERVOUS SYSTEM & AFTERCARE PROFILE', rightX + 18, rightY + 30);

    const topD = rankedDrivers[0]?.meta || DRIVERS.surrender;
    const baseLines = [
      `• Cognitive Offloading: ${this.profile.baselineSummary?.cognitiveRest || 'Active'}`,
      `• Sensory Sensitivity: ${this.profile.baselineSummary?.sensoryFocus || 'Responsive'}`,
      `• Containment & Safety: ${this.profile.baselineSummary?.containmentNeed || 'Essential'}`,
      `• Core Aftercare Need:`
    ];
    ctx.fillStyle = '#e4e4e7';
    ctx.font = '400 13.5px "Inter", sans-serif';
    baseLines.forEach((line, i) => {
      ctx.fillText(line, rightX + 18, rightY + 60 + i * 26);
    });
    ctx.fillStyle = '#99f6e4';
    ctx.font = '400 12.5px "Inter", sans-serif';
    ctx.fillText(this.truncateText(ctx, topD.scenes.aftercare, colW - 36), rightX + 26, rightY + 164);

    rightY += 207;

    const fantasyItems = [...Object.values(DRIVERS), ...ACTIVITIES]
      .filter(m => this.profile.nodes[m.id]?.isPrimarilyFantasy)
      .map(m => m.shortLabel || m.label);

    this.drawRoundRect(ctx, rightX, rightY, colW, 112, 14);
    ctx.fillStyle = 'rgba(28, 22, 16, 0.9)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.28)';
    ctx.stroke();

    ctx.fillStyle = '#fbbf24';
    ctx.font = '600 13px "JetBrains Mono", monospace';
    ctx.fillText('FANTASY-ONLY LAYER (KEEP IN IMAGINATION)', rightX + 18, rightY + 28);
    ctx.fillStyle = '#fde68a';
    ctx.font = '400 13.5px "Inter", sans-serif';
    ctx.fillText(
      this.truncateText(ctx, fantasyItems.length ? fantasyItems.join('  ·  ') : 'None marked as fantasy-only', colW - 36),
      rightX + 18,
      rightY + 58
    );
    ctx.fillStyle = '#a1a1aa';
    ctx.font = '400 12px "Inter", sans-serif';
    ctx.fillText('Arousing in erotica/mind; no pressure to enact physically.', rightX + 18, rightY + 86);

    rightY += 124;

    const hardLimits = [...Object.values(DRIVERS), ...ACTIVITIES]
      .filter(m => this.profile.nodes[m.id]?.statusTag === 'Hard Limit')
      .map(m => m.shortLabel || m.label);

    this.drawRoundRect(ctx, rightX, rightY, colW, 112, 14);
    ctx.fillStyle = 'rgba(28, 16, 20, 0.9)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(244, 63, 94, 0.3)';
    ctx.stroke();

    ctx.fillStyle = '#fb7185';
    ctx.font = '600 13px "JetBrains Mono", monospace';
    ctx.fillText('HARD LIMITS // CLEAR BOUNDARIES', rightX + 18, rightY + 28);
    ctx.fillStyle = '#fecdd3';
    ctx.font = '400 13.5px "Inter", sans-serif';
    ctx.fillText(
      this.truncateText(ctx, hardLimits.length ? hardLimits.join('  ·  ') : 'None specified in current pass', colW - 36),
      rightX + 18,
      rightY + 58
    );
    ctx.fillStyle = '#a1a1aa';
    ctx.font = '400 12px "Inter", sans-serif';
    ctx.fillText('Respected automatically in Dyad Synthesis matching.', rightX + 18, rightY + 86);

    ctx.fillStyle = '#71717a';
    ctx.font = '500 13px "JetBrains Mono", monospace';
    ctx.fillText('KINKY SYNAPSES // DESIRE & POLARITY ENGINE — Enthusiastic Consent · Nervous-System Safety · Self-Knowledge', 68, H - 48);

    this.lastPosterDataUrl = offCanvas.toDataURL('image/png');
    const previewImg = document.getElementById('pngPreviewImg');
    if (previewImg) previewImg.src = this.lastPosterDataUrl;
  },

  drawMiniNeuralGraph(ctx, cx, cy, scale, mode) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);

    const positions = { core: { x: 0, y: 0 } };
    const driverKeys = Object.keys(DRIVERS);
    driverKeys.forEach((k, idx) => {
      const angle = (idx / driverKeys.length) * Math.PI * 2 - Math.PI / 2;
      positions[k] = { x: Math.cos(angle) * 145, y: Math.sin(angle) * 145 };
    });
    ACTIVITIES.forEach((act, idx) => {
      const angle = (idx / ACTIVITIES.length) * Math.PI * 2 - Math.PI / 2 + 0.18;
      const dist = 265 + (idx % 2 === 0 ? 15 : -15);
      positions[act.id] = { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist };
    });

    const getScore = (id) => {
      if (id === 'core') return 100;
      const st = this.profile.nodes[id];
      if (!st) return 0;
      if (mode === 'receiving') return st.receivingScore;
      if (mode === 'giving') return st.givingScore;
      return st.score;
    };

    const getColor = (id) => {
      if (id === 'core') return { hex: '#f3e8ff', rgb: '216, 180, 254' };
      const st = this.profile.nodes[id];
      if (mode === 'receiving') return { hex: '#818cf8', rgb: '129, 140, 248' };
      if (mode === 'giving') return { hex: '#fb7185', rgb: '251, 113, 133' };
      if (st && st.receivingScore >= 35 && st.givingScore >= 35) return { hex: '#e879f9', rgb: '232, 121, 249' };
      if (st && st.givingScore > st.receivingScore + 12) return { hex: '#fb7185', rgb: '251, 113, 133' };
      if (st && st.receivingScore > st.givingScore + 12) return { hex: '#818cf8', rgb: '129, 140, 248' };
      const meta = ALL_NODES_MAP[id] || DRIVERS.surrender;
      return { hex: meta.color || '#a855f7', rgb: meta.rgb || '168, 85, 247' };
    };

    driverKeys.forEach(k => {
      const sc = getScore(k) / 100;
      const col = getColor(k);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(positions[k].x, positions[k].y);
      ctx.strokeStyle = sc >= 0.25 ? `rgba(${col.rgb}, ${Math.max(0.25, sc * 0.9)})` : 'rgba(255,255,255,0.08)';
      ctx.lineWidth = sc >= 0.25 ? 1.5 + sc * 2.5 : 1;
      ctx.stroke();
    });

    ACTIVITIES.forEach(act => {
      const aSc = getScore(act.id) / 100;
      const col = getColor(act.id);
      act.drivers.forEach(dId => {
        const dSc = getScore(dId) / 100;
        const str = Math.min(aSc, dSc);
        ctx.beginPath();
        ctx.moveTo(positions[dId].x, positions[dId].y);
        ctx.lineTo(positions[act.id].x, positions[act.id].y);
        ctx.strokeStyle = str >= 0.22 ? `rgba(${col.rgb}, ${Math.max(0.2, str * 0.85)})` : 'rgba(255,255,255,0.06)';
        ctx.lineWidth = str >= 0.22 ? 1.2 + str * 2 : 0.9;
        ctx.stroke();
      });
    });

    Object.entries(positions).forEach(([id, pos]) => {
      const sc = getScore(id);
      const col = getColor(id);
      const isLit = id === 'core' || sc >= 25;
      const baseR = id === 'core' ? 16 : DRIVERS[id] ? 10 : 7;
      const r = baseR + (sc / 100) * (DRIVERS[id] ? 11 : 8);

      if (isLit) {
        const g = ctx.createRadialGradient(pos.x, pos.y, r * 0.2, pos.x, pos.y, r + 16);
        g.addColorStop(0, `rgba(${col.rgb}, 0.55)`);
        g.addColorStop(1, `rgba(${col.rgb}, 0)`);
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, r + 16, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2);
      ctx.fillStyle = isLit ? col.hex : '#1f1f29';
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = isLit ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.2)';
      ctx.stroke();

      if (id !== 'core') {
        const meta = ALL_NODES_MAP[id];
        const lbl = meta?.shortLabel || meta?.label || id;
        ctx.font = DRIVERS[id] ? '600 17px "Inter", sans-serif' : '500 15px "Inter", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = isLit ? '#f4f4f5' : 'rgba(161,161,170,0.55)';
        ctx.fillText(lbl, pos.x, pos.y + r + 19);
      }
    });

    ctx.restore();
  },

  drawRoundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  },

  truncateText(ctx, text, maxWidth) {
    if (ctx.measureText(text).width <= maxWidth) return text;
    let trimmed = text;
    while (trimmed.length > 0 && ctx.measureText(trimmed + '…').width > maxWidth) {
      trimmed = trimmed.slice(0, -1);
    }
    return trimmed + '…';
  },

  downloadOnePagerPng() {
    if (!this.lastPosterDataUrl) this.renderOnePagerCanvas();
    const link = document.createElement('a');
    link.download = `SYNAPSE-Desire-Blueprint-${Date.now()}.png`;
    link.href = this.lastPosterDataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.showToast('Saved One-Pager PNG to your device');
  },
};
