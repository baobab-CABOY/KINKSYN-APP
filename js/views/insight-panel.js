// Right-hand drawer: Guide / Refine Live / Journal tabs.
import { DRIVERS, ALL_NODES_MAP } from '../data/nodes.js';
import { RESONANCE_OPTIONS } from '../data/questions.js';
import { escapeHtml } from '../core/utils.js';

export const insightPanelView = {
  renderInsightPanel() {
    const drawer = document.getElementById('insightDrawer');
    if (!drawer || !this.profile) return;

    const id = this.selectedNodeId || 'surrender';
    const meta = ALL_NODES_MAP[id] || DRIVERS.surrender;
    const isCore = id === 'core';
    const isDriver = meta.type === 'driver';
    const stats = this.profile.nodes[id] || {
      score: 0,
      receivingScore: 0,
      givingScore: 0,
      fantasyRatio: 0,
      isPrimarilyFantasy: false,
      polarity: 'Switch / Both',
      statusTag: 'Neutral / No Charge'
    };
    const partnerStats = this.partnerProfile && !isCore ? this.partnerProfile.nodes[id] : null;

    const activeScore = isCore
      ? 100
      : this.polarityView === 'receiving'
      ? stats.receivingScore
      : this.polarityView === 'giving'
      ? stats.givingScore
      : stats.score;

    const modeLabel = isCore
      ? 'BLUEPRINT'
      : this.polarityView === 'receiving'
      ? 'RECEIVING'
      : this.polarityView === 'giving'
      ? 'GIVING'
      : 'OVERLAY';

    const accentColor = isCore
      ? '#d8b4fe'
      : this.polarityView === 'receiving'
      ? '#818cf8'
      : this.polarityView === 'giving'
      ? '#fb7185'
      : (meta.color || '#e879f9');

    const topDrivers = Object.keys(DRIVERS)
      .sort((a, b) => {
        const sa = this.polarityView === 'receiving' ? this.profile.nodes[a].receivingScore : this.polarityView === 'giving' ? this.profile.nodes[a].givingScore : this.profile.nodes[a].score;
        const sb = this.polarityView === 'receiving' ? this.profile.nodes[b].receivingScore : this.polarityView === 'giving' ? this.profile.nodes[b].givingScore : this.profile.nodes[b].score;
        return sb - sa;
      })
      .slice(0, 4);

    const connectedDriverPills = !isCore && !isDriver && meta.drivers
      ? meta.drivers.map(dId => {
          const d = DRIVERS[dId];
          return d ? `<button type="button" onclick="app.selectGraphNode('${dId}'); app.graphEngine?.focusNode('${dId}')" class="px-2 py-0.5 rounded bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 font-mono text-[10px] text-zinc-200 transition flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full" style="background:${d.color}"></span>${d.shortLabel}</button>` : '';
        }).join('')
      : '';

    const nodeJournal = this.journalEntries.filter(e => e.nodeId === id);

    drawer.innerHTML = `
      <div class="p-4 sm:p-5 space-y-4">
        <!-- Top Driver Quick Jump -->
        <div>
          <div class="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-2">
            <span>Top Lit Drivers (${this.polarityView.toUpperCase()})</span>
            <button type="button" onclick="app.selectGraphNode('core')" class="text-purple-400 hover:underline">Desire Core</button>
          </div>
          <div class="flex flex-wrap gap-1.5">
            ${topDrivers.map(dId => {
              const d = DRIVERS[dId];
              const dStats = this.profile.nodes[dId];
              const sc = this.polarityView === 'receiving' ? dStats.receivingScore : this.polarityView === 'giving' ? dStats.givingScore : dStats.score;
              const active = dId === id;
              return `
                <button type="button" onclick="app.selectGraphNode('${dId}'); app.graphEngine?.focusNode('${dId}')" class="px-2.5 py-1.5 rounded-lg text-[11px] font-mono transition flex items-center gap-1.5 border ${
                  active
                    ? 'bg-white/12 border-white/30 text-white'
                    : 'bg-black/45 border-white/[0.06] text-zinc-400 hover:text-zinc-200'
                }">
                  <span class="w-2 h-2 rounded-full" style="background:${d.color}"></span>
                  <span>${d.shortLabel}</span>
                  <span class="text-zinc-500">${sc}%</span>
                </button>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Node Header & Drawer Sub-Navigation Tabs -->
        <div class="glass-panel rounded-2xl p-4 sm:p-5 border border-white/10 space-y-4 animate-enter">
          <div class="flex items-start justify-between gap-3">
            <div>
              <span class="font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 rounded bg-white/5 text-zinc-400">
                ${isCore ? 'Whole-Person Neural Hub' : isDriver ? 'Core Psychological Driver (1 of 7)' : 'Erotic Pathway (1 of 10)'}
              </span>
              <h2 class="text-base sm:text-lg font-semibold text-white mt-1.5">${meta.label}</h2>
            </div>
            <div class="text-right shrink-0">
              <div class="text-2xl font-mono font-bold" style="color: ${accentColor}">${activeScore}%</div>
              <div class="text-[10px] font-mono text-zinc-500">${modeLabel}</div>
            </div>
          </div>

          <!-- 3 Drawer Tabs: Guide & Resources | Refine Live | Experience Journal -->
          <div class="grid grid-cols-3 gap-1 p-1 rounded-xl bg-black/55 border border-white/[0.07]">
            <button type="button" onclick="app.setDrawerTab('guide')" class="py-1.5 px-2 rounded-lg font-mono text-[11px] transition ${
              this.drawerTab === 'guide' ? 'bg-purple-500/25 text-purple-100 border border-purple-500/40 font-semibold' : 'text-zinc-400 hover:text-zinc-200'
            }">
              Guide & Scenes
            </button>
            <button type="button" onclick="app.setDrawerTab('refine')" class="py-1.5 px-2 rounded-lg font-mono text-[11px] transition ${
              this.drawerTab === 'refine' ? 'bg-teal-500/25 text-teal-100 border border-teal-500/40 font-semibold' : 'text-zinc-400 hover:text-zinc-200'
            }">
              Refine Live
            </button>
            <button type="button" onclick="app.setDrawerTab('journal')" class="py-1.5 px-2 rounded-lg font-mono text-[11px] transition flex items-center justify-center gap-1 ${
              this.drawerTab === 'journal' ? 'bg-amber-500/25 text-amber-100 border border-amber-500/40 font-semibold' : 'text-zinc-400 hover:text-zinc-200'
            }">
              <span>Journal</span>
              ${nodeJournal.length ? `<span class="px-1.5 rounded-full bg-amber-400/20 text-amber-300 text-[9px]">${nodeJournal.length}</span>` : ''}
            </button>
          </div>

          ${this.drawerTab === 'guide' ? `
            ${!isCore ? `
              <div class="space-y-2 bg-black/45 p-3 rounded-xl border border-white/[0.06]">
                <div>
                  <div class="flex justify-between text-[11px] font-mono mb-1">
                    <span class="text-indigo-300 flex items-center gap-1.5"><span class="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>Receiving</span>
                    <span class="text-indigo-200">${stats.receivingScore}%</span>
                  </div>
                  <div class="w-full h-1.5 bg-black/80 rounded-full overflow-hidden">
                    <div class="h-full bg-indigo-400 transition-all duration-300" style="width: ${stats.receivingScore}%"></div>
                  </div>
                </div>
                <div>
                  <div class="flex justify-between text-[11px] font-mono mb-1">
                    <span class="text-rose-300 flex items-center gap-1.5"><span class="w-1.5 h-1.5 rounded-full bg-rose-400"></span>Giving</span>
                    <span class="text-rose-200">${stats.givingScore}%</span>
                  </div>
                  <div class="w-full h-1.5 bg-black/80 rounded-full overflow-hidden">
                    <div class="h-full bg-rose-400 transition-all duration-300" style="width: ${stats.givingScore}%"></div>
                  </div>
                </div>
              </div>

              <div class="flex flex-wrap gap-1.5">
                <span class="px-2.5 py-1 rounded-md bg-cyan-500/10 border border-cyan-500/25 font-mono text-[10px] text-cyan-300">
                  ${stats.polarity}
                </span>
                <span class="px-2.5 py-1 rounded-md ${
                  stats.statusTag === 'Hard Limit'
                    ? 'bg-rose-950/60 border-rose-800/60 text-rose-300'
                    : stats.statusTag === 'Neutral / No Charge'
                    ? 'bg-slate-800/70 border-slate-700 text-slate-300'
                    : stats.isPrimarilyFantasy
                    ? 'bg-amber-500/15 border-amber-500/35 text-amber-300'
                    : 'bg-purple-500/15 border-purple-500/35 text-purple-200'
                } border font-mono text-[10px]">
                  ${stats.score === 0 ? stats.statusTag : stats.isPrimarilyFantasy ? `Fantasy Layer (${stats.fantasyRatio}%)` : `Embodied Reality (${100 - stats.fantasyRatio}%)`}
                </span>
              </div>
            ` : ''}

            ${partnerStats ? `
              <div class="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs space-y-1">
                <div class="flex items-center justify-between">
                  <span class="font-mono text-[10px] uppercase tracking-wider text-amber-400">${escapeHtml(this.partnerProfile.name || 'Partner')}</span>
                  <button type="button" onclick="app.openShareModal()" class="font-mono text-[10px] text-amber-300 underline">Full Dyad Report</button>
                </div>
                <div class="text-zinc-200 flex items-center justify-between">
                  <span>Resonance: <strong>${partnerStats.score}%</strong></span>
                  <span class="font-mono text-[11px] text-amber-300">${partnerStats.polarity}</span>
                </div>
              </div>
            ` : ''}

            <div class="pt-3 border-t border-white/[0.08] space-y-1.5">
              <span class="block font-mono text-[11px] uppercase tracking-wider text-purple-300">01 // Definition</span>
              <p class="text-xs sm:text-sm text-zinc-200 leading-relaxed">${meta.definition}</p>
            </div>

            <div class="pt-3 border-t border-white/[0.08] space-y-2">
              <div class="flex flex-wrap items-center justify-between gap-1.5">
                <span class="font-mono text-[11px] uppercase tracking-wider text-indigo-300">02 // Possible Drivers ("The Why")</span>
                ${connectedDriverPills ? `<div class="flex items-center gap-1">${connectedDriverPills}</div>` : ''}
              </div>
              <ul class="space-y-1.5 text-xs text-zinc-300 leading-relaxed">
                ${meta.possibleDrivers.map(item => `
                  <li class="flex items-start gap-2">
                    <span class="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0"></span>
                    <span>${item}</span>
                  </li>
                `).join('')}
              </ul>
            </div>

            <div class="pt-3 border-t border-white/[0.08] space-y-2.5">
              <span class="block font-mono text-[11px] uppercase tracking-wider text-emerald-400">03 // Examples of Scenes</span>
              <div class="space-y-2">
                <div class="p-3 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/20 text-xs text-zinc-200 leading-relaxed">
                  ${meta.scenes.starter}
                </div>
                <div class="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-zinc-300 leading-relaxed">
                  ${meta.scenes.deeper}
                </div>
                <div class="text-[11px] text-cyan-300/90 leading-relaxed pl-1">
                  <span class="font-mono uppercase text-[10px] text-cyan-400">Aftercare:</span> ${meta.scenes.aftercare}
                </div>
              </div>
            </div>

            <div class="pt-3 border-t border-white/[0.08] space-y-2">
              <span class="block font-mono text-[11px] uppercase tracking-wider text-amber-400">04 // 3 Resources to Learn More</span>
              <div class="space-y-2">
                ${meta.resources.map((res, idx) => `
                  <div class="p-2.5 rounded-xl bg-black/50 border border-white/[0.07] hover:border-amber-500/35 transition">
                    <div class="text-xs font-medium text-zinc-100 leading-snug">
                      <span class="font-mono text-amber-400 mr-1">0${idx + 1}.</span>${res.title}
                    </div>
                    <div class="font-mono text-[10px] text-amber-300/80 mt-0.5">${res.author}</div>
                    <div class="text-[11px] text-zinc-400 mt-1 leading-snug">${res.note}</div>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : this.drawerTab === 'refine' ? `
            <!-- TAB 2: LIVING DESIRE MAP EDITOR -->
            <div class="space-y-3.5 animate-enter">
              ${isCore ? `
                <div class="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/25 text-xs text-zinc-300 leading-relaxed">
                  Select any of the <strong class="text-white">7 Psychological Drivers</strong> or <strong class="text-white">10 Erotic Pathways</strong> on the neural graph to adjust its resonance or directional polarity as your curiosity evolves.
                </div>
              ` : `
                <div class="p-3 rounded-xl bg-teal-500/[0.07] border border-teal-500/25 text-xs text-zinc-300 leading-relaxed">
                  Desire is living and contextual. Update how <strong class="text-white">${meta.label}</strong> feels for you today—your brain graph and local vault will update immediately.
                </div>

                <div class="space-y-2">
                  <label class="block font-mono text-[11px] uppercase tracking-wider text-zinc-400">1. Update Resonance State</label>
                  <div class="space-y-1.5">
                    ${RESONANCE_OPTIONS.map(opt => {
                      const isCurrent =
                        (opt.id === 'core' && stats.score >= 80 && !stats.isPrimarilyFantasy) ||
                        (opt.id === 'curious' && stats.score > 0 && stats.score < 80 && !stats.isPrimarilyFantasy) ||
                        (opt.id === 'fantasy' && stats.isPrimarilyFantasy) ||
                        (opt.id === 'neutral' && stats.score === 0 && stats.statusTag !== 'Hard Limit') ||
                        (opt.id === 'limit' && stats.statusTag === 'Hard Limit');

                      return `
                        <button type="button" onclick="app.updateLiveNodeState('${id}', '${opt.id}', undefined)" class="w-full p-2.5 rounded-xl border text-left transition flex items-center justify-between gap-2 ${
                          isCurrent ? opt.badgeClass : 'border-white/[0.08] bg-black/45 hover:bg-white/[0.05] text-zinc-300'
                        }">
                          <div class="flex items-center gap-2.5">
                            <span class="w-2.5 h-2.5 rounded-full shrink-0" style="background:${opt.dotColor}"></span>
                            <div>
                              <div class="text-xs font-medium">${opt.label}</div>
                              <div class="text-[10px] opacity-75">${opt.sublabel}</div>
                            </div>
                          </div>
                          ${isCurrent ? '<span class="font-mono text-[10px] uppercase">Active</span>' : ''}
                        </button>
                      `;
                    }).join('')}
                  </div>
                </div>

                ${stats.score > 0 ? `
                  <div class="space-y-2 pt-2 border-t border-white/[0.08]">
                    <label class="block font-mono text-[11px] uppercase tracking-wider text-zinc-400">2. Update Directional Polarity</label>
                    <div class="grid grid-cols-3 gap-1.5">
                      ${[
                        { idx: 0, label: 'Receiving' },
                        { idx: 1, label: 'Giving' },
                        { idx: 2, label: 'Switch / Both' }
                      ].map(p => {
                        const active =
                          (p.idx === 0 && stats.polarity.startsWith('Receive')) ||
                          (p.idx === 1 && stats.polarity.startsWith('Give')) ||
                          (p.idx === 2 && stats.polarity.startsWith('Switch'));
                        return `
                          <button type="button" onclick="app.updateLiveNodeState('${id}', undefined, ${p.idx})" class="py-2 px-2 rounded-xl border text-xs font-mono transition ${
                            active
                              ? 'border-indigo-400/70 bg-indigo-500/20 text-indigo-100 font-semibold'
                              : 'border-white/[0.08] bg-black/40 text-zinc-400 hover:text-zinc-200'
                          }">
                            ${p.label}
                          </button>
                        `;
                      }).join('')}
                    </div>
                  </div>
                ` : ''}
              `}
            </div>
          ` : `
            <!-- TAB 3: NODE- & PARTNER-TAGGED SOMATIC EXPERIENCE JOURNAL -->
            <div class="space-y-3.5 animate-enter">
              <div class="p-3 rounded-xl bg-amber-500/[0.07] border border-amber-500/25 space-y-2.5">
                <div class="font-mono text-[11px] uppercase tracking-wider text-amber-300">Log Reflection for ${meta.shortLabel || meta.label}</div>
                <textarea id="journalNoteInput" rows="3" placeholder="What worked well? What did your nervous system need during or after?" class="w-full bg-black/65 border border-white/10 rounded-xl p-2.5 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-amber-400"></textarea>
                <div class="grid grid-cols-2 gap-2">
                  <select id="journalStateSelect" class="bg-black/65 border border-white/10 rounded-xl px-2.5 py-2 font-mono text-[11px] text-zinc-200 focus:outline-none">
                    <option value="Grounded & Connected">Grounded & Connected</option>
                    <option value="Deep Subspace / Floaty">Deep Subspace / Floaty</option>
                    <option value="Energized & Playful">Energized & Playful</option>
                    <option value="Needed Extra Aftercare">Needed Extra Aftercare</option>
                    <option value="Too Intense / Adjust">Too Intense / Adjust</option>
                  </select>
                  <select id="journalPartnerSelect" class="bg-black/65 border border-white/10 rounded-xl px-2.5 py-2 font-mono text-[11px] text-zinc-200 focus:outline-none">
                    <option value="Solo Reflection">Solo Reflection</option>
                    ${this.partnerProfile ? `<option value="${escapeHtml(this.partnerProfile.name)}">${escapeHtml(this.partnerProfile.name)}</option>` : ''}
                    ${this.savedPartners.map(sp => `<option value="${escapeHtml(sp.name)}">${escapeHtml(sp.name)}</option>`).join('')}
                  </select>
                </div>
                <button type="button" onclick="app.addJournalEntry('${id}')" class="w-full py-2 rounded-xl bg-amber-500/25 hover:bg-amber-500/35 border border-amber-400/50 text-amber-100 font-mono text-xs font-semibold transition">
                  + Save Tagged Reflection
                </button>
              </div>

              <div class="space-y-2">
                <div class="font-mono text-[10px] uppercase tracking-wider text-zinc-500">Node Journal History (${nodeJournal.length})</div>
                ${nodeJournal.length === 0 ? `
                  <div class="p-4 rounded-xl bg-black/40 border border-dashed border-white/10 text-center text-xs text-zinc-500">
                    No reflections logged for ${meta.shortLabel || meta.label} yet.
                  </div>
                ` : nodeJournal.map(entry => {
                  const dateStr = new Date(entry.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  return `
                    <div class="p-3 rounded-xl bg-black/50 border border-white/[0.08] space-y-1.5">
                      <div class="flex items-center justify-between gap-2">
                        <span class="font-mono text-[10px] text-amber-300">${dateStr} · ${escapeHtml(entry.partnerTag)}</span>
                        <button type="button" onclick="app.deleteJournalEntry('${entry.id}')" class="text-[10px] font-mono text-zinc-500 hover:text-rose-400">Delete</button>
                      </div>
                      <div class="inline-block px-2 py-0.5 rounded bg-teal-500/15 border border-teal-500/25 font-mono text-[10px] text-teal-200">
                        ${escapeHtml(entry.somaticState)}
                      </div>
                      <p class="text-xs text-zinc-200 leading-relaxed">${escapeHtml(entry.note)}</p>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          `}
        </div>
      </div>

      <div class="p-3.5 border-t border-white/[0.08] bg-black/50 grid grid-cols-2 gap-2">
        <button type="button" onclick="app.openPngExportModal()" class="py-2.5 px-3 rounded-xl bg-white/[0.07] hover:bg-white/[0.12] border border-white/15 text-xs font-mono text-zinc-100 transition flex items-center justify-center gap-1.5">
          <span>Save 1-Pager PNG</span>
        </button>
        <button type="button" onclick="app.openShareModal()" class="py-2.5 px-3 rounded-xl bg-purple-600/85 hover:bg-purple-500 text-xs font-mono text-white transition flex items-center justify-center gap-1.5">
          <span>Dyad Synthesis →</span>
        </button>
      </div>
    `;
  },
};
