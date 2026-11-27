// Quiz question screen HTML.
import { CHAPTERS, RESONANCE_OPTIONS } from '../data/questions.js';

export const quizView = {
  renderQuizView() {
    const activeQs = this.getActiveQuestions();
    if (!activeQs.length) {
      this.goHome();
      return '';
    }
    if (this.currentQIndex >= activeQs.length) {
      this.currentQIndex = 0;
    }
    const q = activeQs[this.currentQIndex];
    const currentChap = CHAPTERS[q.chapter] || CHAPTERS[0];
    const currentAns = this.answers[q.id];
    const answeredCount = activeQs.filter(item => Boolean(this.answers[item.id])).length;
    const progressPct = Math.round(((this.currentQIndex + 1) / activeQs.length) * 100);
    const showPolarity = q.hasPolarity && currentAns && currentAns.resonance !== 'neutral' && currentAns.resonance !== 'limit';
    const availableChapters = this.quizMode === 'quick'
      ? CHAPTERS.filter(ch => activeQs.some(item => item.chapter === ch.id))
      : CHAPTERS;

    return `
      <div class="flex-1 bg-grid-pattern flex flex-col justify-between px-3.5 sm:px-6 py-4 sm:py-7">
        <div class="max-w-2xl w-full mx-auto space-y-4 animate-enter">
          <div class="flex flex-wrap items-center justify-between gap-2 px-1">
            <span class="font-mono text-[10px] uppercase tracking-widest text-teal-300">
              Track: ${this.quizMode === 'quick' ? 'Quick Pulse (10 Questions)' : 'Full Deep Dive (24 Questions · 4 Chapters)'}
            </span>
            <div class="flex items-center gap-1.5 font-mono text-[10px]">
              <button type="button" onclick="app.startQuiz('quick')" class="px-2 py-0.5 rounded border transition ${
                this.quizMode === 'quick' ? 'border-teal-400/60 bg-teal-500/20 text-teal-200' : 'border-white/10 text-zinc-400 hover:text-zinc-200'
              }">Switch to Quick (10)</button>
              <button type="button" onclick="app.startQuiz('full')" class="px-2 py-0.5 rounded border transition ${
                this.quizMode === 'full' ? 'border-purple-400/60 bg-purple-500/20 text-purple-200' : 'border-white/10 text-zinc-400 hover:text-zinc-200'
              }">Switch to Full (24)</button>
            </div>
          </div>

          <div class="grid grid-cols-2 ${availableChapters.length >= 4 ? 'sm:grid-cols-4' : 'sm:grid-cols-3'} gap-1.5">
            ${availableChapters.map(ch => {
              const isActive = ch.id === q.chapter;
              return `
                <button type="button" onclick="app.jumpToChapter(${ch.id})" class="px-2.5 py-2 rounded-xl text-left border transition ${
                  isActive
                    ? 'bg-purple-500/20 border-purple-400/60 text-purple-100'
                    : 'bg-black/40 border-white/[0.07] text-zinc-400 hover:text-zinc-200'
                }">
                  <div class="font-mono text-[10px] truncate">${ch.short}</div>
                </button>
              `;
            }).join('')}
          </div>

          <div class="space-y-1.5">
            <div class="flex flex-wrap items-center justify-between gap-2 font-mono text-[11px] text-zinc-400">
              <span class="text-purple-300">${currentChap.title}</span>
              <span>Q${this.currentQIndex + 1}/${activeQs.length} · ${progressPct}%</span>
            </div>
            <div class="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
              <div class="h-full bg-gradient-to-r from-teal-400 via-purple-500 to-rose-500 transition-all duration-300" style="width: ${progressPct}%"></div>
            </div>
          </div>

          <div class="glass-panel rounded-2xl p-4 sm:p-6 border border-white/10 space-y-4 shadow-2xl">
            <div class="space-y-2">
              <span class="inline-block font-mono text-[10px] uppercase tracking-widest px-2.5 py-0.5 rounded bg-purple-500/15 border border-purple-500/30 text-purple-300">
                ${q.tag}
              </span>
              <p class="text-base sm:text-lg text-zinc-100 leading-relaxed font-normal">
                “${q.scenario}”
              </p>
              <p class="text-xs font-mono text-zinc-400 pt-1">
                ${q.prompt}
              </p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              ${RESONANCE_OPTIONS.map((opt, idx) => {
                const isSelected = currentAns && currentAns.resonance === opt.id;
                const spanFull = idx === RESONANCE_OPTIONS.length - 1 ? 'sm:col-span-2' : '';
                return `
                  <button type="button" onclick="app.selectAnswer('${opt.id}')" class="${spanFull} p-3 rounded-xl border text-left transition flex items-start gap-3 ${
                    isSelected
                      ? `${opt.badgeClass} shadow-lg`
                      : 'border-white/[0.08] bg-black/45 hover:bg-white/[0.04] text-zinc-300'
                  }">
                    <span class="w-3 h-3 rounded-full mt-1 shrink-0" style="background-color: ${opt.dotColor}; box-shadow: ${isSelected ? `0 0 10px ${opt.dotColor}` : 'none'}"></span>
                    <div class="min-w-0">
                      <div class="text-sm font-medium leading-snug">${opt.label}</div>
                      <div class="text-[11px] opacity-80 mt-0.5 leading-snug">${opt.sublabel}</div>
                    </div>
                  </button>
                `;
              }).join('')}
            </div>

            ${showPolarity ? `
              <div class="pt-3.5 border-t border-white/[0.08] animate-enter">
                <div class="text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-2">Directional Polarity (Receive vs. Give)</div>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  ${q.polarityLabels.map((lbl, idx) => {
                    const activePol = (currentAns.polarity ?? 0) === idx;
                    return `
                      <button type="button" onclick="app.selectPolarity(${idx})" class="px-3 py-2.5 rounded-xl text-xs font-medium border text-center transition ${
                        activePol
                          ? 'border-indigo-400/70 bg-indigo-500/20 text-indigo-100 shadow-[0_0_15px_rgba(129,140,248,0.2)]'
                          : 'border-white/[0.07] bg-black/35 text-zinc-400 hover:text-zinc-200'
                      }">
                        ${lbl}
                      </button>
                    `;
                  }).join('')}
                </div>
              </div>
            ` : ''}
          </div>
        </div>

        <div class="max-w-2xl w-full mx-auto pt-4 flex items-center justify-between gap-2">
          <button type="button" onclick="app.prevQuestion()" class="px-4 py-2.5 rounded-xl glass-panel hover:bg-white/5 text-xs font-mono text-zinc-400 hover:text-white transition">
            ← Back
          </button>

          ${answeredCount >= 3 && this.currentQIndex < activeQs.length - 1 ? `
            <button type="button" onclick="app.finishEarlyAndViewMap()" class="hidden sm:inline-flex px-3.5 py-2.5 rounded-xl border border-teal-500/30 bg-teal-500/10 hover:bg-teal-500/20 text-xs font-mono text-teal-200 transition">
              Generate Map Early (${answeredCount}/${activeQs.length})
            </button>
          ` : ''}

          <button type="button" onclick="app.nextQuestion()" class="px-5 sm:px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs sm:text-sm font-medium transition shadow-[0_0_24px_rgba(168,85,247,0.35)] flex items-center gap-2">
            <span>${this.currentQIndex === activeQs.length - 1 ? 'Illuminate 18-Node Graph' : 'Next Scenario'}</span>
            <span>→</span>
          </button>
        </div>
      </div>
    `;
  },
};
