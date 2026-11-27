// Graph page layout HTML (canvas + drawer shell).

export const graphView = {
  renderGraphView() {
    return `
      <div class="flex-1 flex flex-col lg:flex-row relative overflow-hidden" style="min-height: calc(100vh - 3.5rem);">
        <div class="flex-1 flex flex-col bg-[#08080c] relative min-w-0">
          <div id="canvasWrapper" class="relative w-full flex-1 min-h-[340px] sm:min-h-[430px]">
            <canvas id="neuralCanvas"></canvas>

            <div class="absolute top-3 left-3 right-3 sm:right-auto flex flex-wrap items-center gap-1.5 z-10 pointer-events-auto">
              <div class="glass-panel rounded-xl p-1 flex items-center gap-1">
                <button type="button" data-filter-btn="all" onclick="app.setFilterMode('all')" class="px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-mono font-medium bg-purple-500/25 text-purple-200 border border-purple-500/40 transition">
                  All (18)
                </button>
                <button type="button" data-filter-btn="active" onclick="app.setFilterMode('active')" class="px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-mono text-zinc-400 hover:text-zinc-200 hover:bg-white/5 border border-transparent transition">
                  Lit Only
                </button>
                <button type="button" data-filter-btn="fantasy" onclick="app.setFilterMode('fantasy')" class="px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-mono text-zinc-400 hover:text-zinc-200 hover:bg-white/5 border border-transparent transition">
                  Fantasy
                </button>
              </div>
            </div>

            <div class="hidden sm:flex absolute top-3 right-3 glass-panel rounded-xl px-3 py-2 text-[11px] font-mono text-zinc-400 items-center gap-3 pointer-events-none z-10">
              <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_8px_#818cf8]"></span> Receiving</span>
              <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-rose-400 shadow-[0_0_8px_#fb7185]"></span> Giving</span>
              <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-fuchsia-400 shadow-[0_0_10px_#e879f9]"></span> Both / Overlay</span>
              ${this.partnerProfile ? `<span class="flex items-center gap-1.5 text-amber-300"><span class="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_10px_#fbbf24]"></span> Mutual Gold</span>` : ''}
            </div>
          </div>

          <div class="w-full border-t border-white/[0.08] bg-[#0b0b11]/95 backdrop-blur-md px-3 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-2 z-20">
            <div class="hidden md:flex items-center gap-2 text-[11px] font-mono text-zinc-500">
              <span>POLARITY LENS</span>
              <span class="text-zinc-700">•</span>
              <span>Tap any node to inspect, refine live, or log journal notes</span>
            </div>

            <div class="glass-panel rounded-2xl p-1 flex items-center justify-center gap-1 border border-white/10 shadow-lg w-full sm:w-auto" role="group" aria-label="Polarity Lens">
              <button type="button" data-polarity-btn="receiving" onclick="app.setPolarityView('receiving')" class="flex-1 sm:flex-initial justify-center px-3.5 sm:px-5 py-2 rounded-xl text-xs font-mono text-zinc-400 hover:text-zinc-200 transition flex items-center gap-1.5 sm:gap-2 border border-transparent">
                <span class="w-2 h-2 rounded-full bg-indigo-400"></span>
                <span>Receiving</span>
              </button>
              <button type="button" data-polarity-btn="giving" onclick="app.setPolarityView('giving')" class="flex-1 sm:flex-initial justify-center px-3.5 sm:px-5 py-2 rounded-xl text-xs font-mono text-zinc-400 hover:text-zinc-200 transition flex items-center gap-1.5 sm:gap-2 border border-transparent">
                <span class="w-2 h-2 rounded-full bg-rose-400"></span>
                <span>Giving</span>
              </button>
              <button type="button" data-polarity-btn="overlay" onclick="app.setPolarityView('overlay')" class="flex-1 sm:flex-initial justify-center px-3.5 sm:px-5 py-2 rounded-xl text-xs font-mono font-semibold bg-gradient-to-r from-indigo-500/25 via-fuchsia-500/25 to-rose-500/25 text-white border border-fuchsia-400/60 shadow-[0_0_20px_rgba(232,121,249,0.3)] transition flex items-center gap-1.5 sm:gap-2">
                <span class="w-2 h-2 rounded-full bg-fuchsia-300 shadow-[0_0_8px_#e879f9]"></span>
                <span>Overlay</span>
              </button>
            </div>

            <div class="flex sm:hidden items-center justify-center gap-3 text-[10px] font-mono text-zinc-400">
              <span class="flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>Receiving</span>
              <span class="flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-rose-400"></span>Giving</span>
              <span class="flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-fuchsia-400"></span>Both</span>
            </div>
          </div>
        </div>

        <aside id="insightDrawer" class="w-full lg:w-[445px] xl:w-[480px] border-t lg:border-t-0 lg:border-l border-white/[0.08] bg-[#0e0e14]/95 backdrop-blur-xl flex flex-col justify-between overflow-y-auto lg:max-h-[calc(100vh-3.5rem)] z-20">
        </aside>
      </div>
    `;
  },
};
