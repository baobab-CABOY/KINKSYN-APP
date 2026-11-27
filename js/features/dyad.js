// Scoped share links, partner linking/roster, Dyad Synthesis report.
import { DRIVERS, ACTIVITIES } from '../data/nodes.js';
import { PARTNER_PRESETS } from '../data/presets.js';
import { escapeHtml } from '../core/utils.js';

export const dyadMethods = {
  // =========================================================================
  // DYAD SYNTHESIS STUDIO & SCOPED SHARING
  // =========================================================================
  setShareScope(scope) {
    this.shareScope = scope;
    const input = document.getElementById('shareCodeInput');
    if (input && this.profile) {
      const code = this.encodeProfile(this.profile, scope);
      const baseUrl = window.location.href.split('#')[0];
      input.value = `${baseUrl}#synapse=${code}`;
    }

    ['full', 'vibe'].forEach(sc => {
      const btn = document.getElementById(`scopeBtn-${sc}`);
      if (!btn) return;
      btn.className = sc === scope
        ? 'px-2.5 py-1.5 rounded-lg border border-purple-500/60 bg-purple-500/20 text-[11px] font-mono text-purple-100 text-left transition'
        : 'px-2.5 py-1.5 rounded-lg border border-white/10 bg-white/[0.03] text-[11px] font-mono text-zinc-400 text-left transition';
    });
  },

  openShareModal() {
    const modal = document.getElementById('shareModal');
    if (!modal || !this.profile) return;
    this.setShareScope(this.shareScope || 'full');
    this.updatePartnerModalUI();
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  },

  closeShareModal() {
    this.closeModal('shareModal');
  },

  copyShareLink() {
    const input = document.getElementById('shareCodeInput');
    if (!input) return;
    const okMsg = this.shareScope === 'vibe' ? 'Copied First-Date Vibe Card link' : 'Copied Full 18-Node link';
    const fallback = () => {
      input.select();
      input.setSelectionRange(0, 99999);
      try {
        document.execCommand('copy');
        this.showToast(okMsg);
      } catch (e) {
        this.showToast('Select and copy the link above');
      }
    };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(input.value).then(() => this.showToast(okMsg), fallback);
    } else {
      fallback();
    }
  },

  applyPartnerCode() {
    const input = document.getElementById('partnerCodeInput');
    const aliasInput = document.getElementById('partnerNameCustomInput');
    if (!input || !input.value.trim()) {
      this.showToast('Paste a partner KINKSYS link or code first');
      return;
    }
    const decoded = this.decodeProfile(input.value);
    if (!decoded) {
      this.showToast('Invalid KINKSYS signature format');
      return;
    }
    const customAlias = aliasInput && aliasInput.value.trim() ? aliasInput.value.trim() : `Partner #${this.savedPartners.length + 1}`;
    decoded.name = customAlias;
    decoded.id = `partner_${Date.now()}`;

    this.savedPartners.unshift(decoded);
    if (this.savedPartners.length > 8) this.savedPartners.pop();
    this.persistVault();

    this.activePresetKey = decoded.id;
    this.partnerProfile = decoded;
    if (this.graphEngine) this.graphEngine.setPartnerProfile(this.partnerProfile);
    this.updatePartnerModalUI();
    this.renderInsightPanel();
    this.showToast(`Linked & saved ${customAlias} to roster`);
  },

  loadSavedPartner(partnerId) {
    const found = this.savedPartners.find(p => p.id === partnerId);
    if (!found) return;
    this.activePresetKey = partnerId;
    this.partnerProfile = JSON.parse(JSON.stringify(found));
    if (this.graphEngine) this.graphEngine.setPartnerProfile(this.partnerProfile);
    this.updatePartnerModalUI();
    this.renderInsightPanel();
    this.showToast(`Loaded ${found.name} from roster`);
  },

  loadPartnerPreset(presetKey) {
    const preset = PARTNER_PRESETS[presetKey];
    if (!preset) return;
    this.activePresetKey = presetKey;
    this.partnerProfile = JSON.parse(JSON.stringify(preset));
    if (this.graphEngine) this.graphEngine.setPartnerProfile(this.partnerProfile);
    this.updatePartnerModalUI();
    this.renderInsightPanel();
    this.showToast(`Linked with ${preset.name}`);
  },

  clearPartnerProfile() {
    this.activePresetKey = null;
    this.partnerProfile = null;
    if (this.graphEngine) this.graphEngine.setPartnerProfile(null);
    this.updatePartnerModalUI();
    this.renderInsightPanel();
    this.showToast('Partner link cleared');
  },

  updatePartnerModalUI() {
    const badge = document.getElementById('partnerStatusBadge');
    const clearBtn = document.getElementById('clearPartnerBtn');
    const container = document.getElementById('dyadSynthesisContainer');
    const rosterGrid = document.getElementById('partnerRosterGrid');
    if (!badge || !container || !this.profile) return;

    if (rosterGrid) {
      const savedHtml = this.savedPartners.map(sp => {
        const active = this.activePresetKey === sp.id;
        return `
          <button type="button" onclick="app.loadSavedPartner('${sp.id}')" class="${active ? 'px-2.5 py-2 rounded-lg border border-amber-400/70 bg-amber-500/20 text-left transition' : 'px-2.5 py-2 rounded-lg border border-teal-500/30 bg-teal-500/10 hover:bg-teal-500/20 text-left transition'}">
            <div class="text-[11px] font-semibold text-teal-100 truncate">${escapeHtml(sp.name)}</div>
            <div class="text-[10px] text-teal-300/80 truncate">Saved in Vault</div>
          </button>
        `;
      }).join('');

      const presetsHtml = [
        { key: 'alex', title: 'Alex (Sample)', sub: 'Grounded Caregiver/Top' },
        { key: 'sam', title: 'Sam (Sample)', sub: 'Curious Switch & Somatic' },
        { key: 'river', title: 'River (Sample)', sub: 'Devotional Sub & Rope' }
      ].map(pr => {
        const active = this.activePresetKey === pr.key;
        return `
          <button type="button" onclick="app.loadPartnerPreset('${pr.key}')" class="${active ? 'px-2.5 py-2 rounded-lg border border-amber-400/70 bg-amber-500/20 text-left transition' : 'px-2.5 py-2 rounded-lg border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] text-left transition'}">
            <div class="text-[11px] font-semibold text-zinc-100 truncate">${pr.title}</div>
            <div class="text-[10px] text-zinc-400 truncate">${pr.sub}</div>
          </button>
        `;
      }).join('');

      rosterGrid.innerHTML = savedHtml + presetsHtml;
    }

    if (this.partnerProfile) {
      badge.textContent = `Linked: ${this.partnerProfile.name || 'Partner'}`;
      badge.className = 'font-mono text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40';
      if (clearBtn) clearBtn.classList.remove('hidden');
    } else {
      badge.textContent = 'Not Linked';
      badge.className = 'font-mono text-[10px] px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-400';
      if (clearBtn) clearBtn.classList.add('hidden');
    }

    container.innerHTML = this.renderDyadSynthesisHTML();
  },

  renderDyadSynthesisHTML() {
    if (!this.partnerProfile) {
      return `
        <div class="p-6 rounded-2xl bg-white/[0.02] border border-dashed border-white/15 text-center space-y-2.5">
          <div class="font-mono text-xs text-amber-400 uppercase tracking-wider">Awaiting Partner Signature</div>
          <p class="text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto leading-relaxed">
            Paste a partner's KINKSYS link above—or select <strong class="text-zinc-200">Alex</strong>, <strong class="text-zinc-200">Sam</strong>, or <strong class="text-zinc-200">River</strong>—to automatically extract common traits, filter out hard limits, and generate tailored scenes, readings, and starter tools together.
          </p>
        </div>
      `;
    }

    const sharedDrivers = Object.keys(DRIVERS)
      .map(k => {
        const u = this.profile.nodes[k];
        const p = this.partnerProfile.nodes[k];
        const blocked = u.statusTag === 'Hard Limit' || p.statusTag === 'Hard Limit';
        const synergy = blocked ? 0 : Math.round((u.score + p.score) / 2);
        return { meta: DRIVERS[k], u, p, synergy, blocked };
      })
      .filter(x => !x.blocked && x.u.score >= 40 && x.p.score >= 40)
      .sort((a, b) => b.synergy - a.synergy);

    const greenPathways = [];
    const curiousPathways = [];
    const respectedLimits = [];

    ACTIVITIES.forEach(act => {
      const u = this.profile.nodes[act.id];
      const p = this.partnerProfile.nodes[act.id];
      if (u.statusTag === 'Hard Limit' || p.statusTag === 'Hard Limit') {
        respectedLimits.push(act.label);
        return;
      }
      const avg = Math.round((u.score + p.score) / 2);
      const recGiveFit =
        u.receivingScore >= 50 && p.givingScore >= 50
          ? 'You Receive ↔ Partner Gives'
          : u.givingScore >= 50 && p.receivingScore >= 50
          ? 'You Give ↔ Partner Receives'
          : 'Mutual Switch / Shared Flow';

      if (u.score >= 55 && p.score >= 55) {
        greenPathways.push({ meta: act, u, p, avg, recGiveFit });
      } else if (u.score >= 30 && p.score >= 30) {
        curiousPathways.push({ meta: act, u, p, avg, recGiveFit });
      }
    });

    greenPathways.sort((a, b) => b.avg - a.avg);
    curiousPathways.sort((a, b) => b.avg - a.avg);

    const primaryDriver = sharedDrivers[0]?.meta || DRIVERS.surrender;
    const topAct1 = greenPathways[0]?.meta || curiousPathways[0]?.meta || ACTIVITIES[2];
    const topAct2 = greenPathways[1]?.meta || curiousPathways[1]?.meta || ACTIVITIES[4];

    const readingPool = [
      ...primaryDriver.resources,
      ...topAct1.resources,
      ...topAct2.resources
    ];
    const uniqueReadings = [];
    const seenTitles = new Set();
    readingPool.forEach(r => {
      if (!seenTitles.has(r.title) && uniqueReadings.length < 3) {
        seenTitles.add(r.title);
        uniqueReadings.push(r);
      }
    });

    const toolsList = [
      topAct1.toolCategory,
      topAct2.toolCategory,
      'Water, electrolytes, warm throw blanket & non-verbal color check-in cards (Green / Yellow / Red)'
    ];

    return `
      <div class="space-y-4 animate-enter">
        <div class="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/15 via-purple-500/15 to-cyan-500/15 border border-amber-400/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div class="font-mono text-[10px] uppercase tracking-widest text-amber-300">Dyad Synthesis Report</div>
            <div class="text-sm sm:text-base font-semibold text-white">You × ${escapeHtml(this.partnerProfile.name || 'Linked Partner')}</div>
          </div>
          <div class="font-mono text-[11px] text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 rounded-lg self-start sm:self-auto">
            ${greenPathways.length} High-Synergy Matches · ${respectedLimits.length} Hard Limits Filtered
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <div class="p-3.5 rounded-xl bg-black/50 border border-white/[0.08] space-y-2.5">
            <div class="font-mono text-[11px] uppercase tracking-wider text-purple-300">A // Common Psychological Drivers</div>
            ${sharedDrivers.length ? sharedDrivers.slice(0, 4).map(d => `
              <div class="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] space-y-1">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-semibold text-white">${d.meta.label}</span>
                  <span class="font-mono text-xs text-amber-300">${d.synergy}% Match</span>
                </div>
                <div class="text-[11px] text-zinc-400">
                  You: ${d.u.score}% (${d.u.polarity.split(' ')[0]}) · Partner: ${d.p.score}% (${d.p.polarity.split(' ')[0]})
                </div>
              </div>
            `).join('') : '<div class="text-xs text-zinc-400">Complementary contrast—explore low-stakes curiosity scenes below.</div>'}
          </div>

          <div class="p-3.5 rounded-xl bg-black/50 border border-white/[0.08] space-y-2.5">
            <div class="font-mono text-[11px] uppercase tracking-wider text-emerald-300">B // Mutual Explorations & Guardrails</div>
            ${greenPathways.slice(0, 3).map(g => `
              <div class="p-2.5 rounded-lg bg-emerald-500/[0.07] border border-emerald-500/25">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-semibold text-emerald-100">${g.meta.label}</span>
                  <span class="font-mono text-[10px] text-emerald-300">${g.recGiveFit}</span>
                </div>
              </div>
            `).join('')}
            ${curiousPathways.slice(0, 2).map(c => `
              <div class="p-2 rounded-lg bg-cyan-500/[0.06] border border-cyan-500/20 flex items-center justify-between">
                <span class="text-xs text-cyan-100">Curious Together: ${c.meta.label}</span>
                <span class="font-mono text-[10px] text-cyan-300">${c.avg}%</span>
              </div>
            `).join('')}
            <div class="pt-1 text-[11px] text-rose-300/90 font-mono">
              Respected Hard Limits (Auto-Excluded): ${respectedLimits.length ? respectedLimits.join(', ') : 'None'}
            </div>
          </div>
        </div>

        <div class="p-3.5 rounded-xl bg-black/50 border border-white/[0.08] space-y-2.5">
          <div class="font-mono text-[11px] uppercase tracking-wider text-amber-300">C // 3 Co-Created Scene Blueprints to Try Together</div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
            <div class="p-3 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/20 space-y-1">
              <div class="font-mono text-[10px] text-emerald-300 uppercase">Step 1 · Low-Stakes (2/10)</div>
              <p class="text-zinc-200 leading-relaxed">${topAct1.scenes.starter}</p>
            </div>
            <div class="p-3 rounded-xl bg-purple-500/[0.06] border border-purple-500/20 space-y-1">
              <div class="font-mono text-[10px] text-purple-300 uppercase">Step 2 · Deeper Immersion</div>
              <p class="text-zinc-200 leading-relaxed">${topAct2.scenes.deeper}</p>
            </div>
            <div class="p-3 rounded-xl bg-teal-500/[0.06] border border-teal-500/20 space-y-1">
              <div class="font-mono text-[10px] text-teal-300 uppercase">Step 3 · Shared Aftercare</div>
              <p class="text-zinc-200 leading-relaxed">${primaryDriver.scenes.aftercare}</p>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <div class="p-3.5 rounded-xl bg-black/50 border border-white/[0.08] space-y-2">
            <div class="font-mono text-[11px] uppercase tracking-wider text-indigo-300">D // 3 Shared Readings & Guides</div>
            ${uniqueReadings.map((r, i) => `
              <div class="text-xs p-2 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                <div class="font-medium text-zinc-100">0${i + 1}. ${r.title}</div>
                <div class="font-mono text-[10px] text-indigo-300">${r.author}</div>
              </div>
            `).join('')}
          </div>

          <div class="p-3.5 rounded-xl bg-black/50 border border-white/[0.08] space-y-2">
            <div class="font-mono text-[11px] uppercase tracking-wider text-rose-300">E // Body-Safe Tools & Starter Kit</div>
            <ul class="space-y-2 text-xs text-zinc-300">
              ${toolsList.map(tool => `
                <li class="flex items-start gap-2 p-2 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                  <span class="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0"></span>
                  <span>${tool}</span>
                </li>
              `).join('')}
            </ul>
          </div>
        </div>
      </div>
    `;
  },
};
