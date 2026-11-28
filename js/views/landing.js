// Landing page HTML.

export const landingView = {
  renderLandingView() {
    const hasVault = this.vaultStatus === 'locked' || (this.vaultStatus === 'unlocked' && this.profile);
    return `
      <div class="flex-1 bg-grid-pattern flex flex-col items-center justify-center px-4 py-8 sm:py-12">
        <div class="max-w-3xl w-full text-center space-y-6 animate-enter">
          <img src="assets/logo.png" alt="KINKSYS logo" class="mx-auto w-36 h-36 sm:w-44 sm:h-44 animate-pulse-glow drop-shadow-[0_0_28px_rgba(168,85,247,0.45)]" />

          <div class="space-y-3">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-panel border border-teal-500/30 font-mono text-[10px] sm:text-[11px] uppercase tracking-widest text-teal-300">
              <span>KINKSYS // DESIRE & POLARITY ENGINE</span>
            </div>
            <h1 class="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
              Understand <span class="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-purple-400 to-rose-400">Why</span> You Desire,<br class="hidden sm:inline" /> And Map How You Connect.
            </h1>
            <p class="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              Explore <span class="text-zinc-200 font-medium">7 Core Psychological Drivers</span> and <span class="text-zinc-200 font-medium">10 Erotic Pathways</span> across Receiving, Giving, and Overlay lenses. Choose a fast check-in or full 4-chapter exploration, refine your living map over time, log somatic reflections, and align with partners.
            </p>
          </div>

          <!-- Beta entry (separate model: no scores, no matching) -->
          <button type="button" onclick="app.openBeta('home')" class="w-full text-left glass-panel rounded-2xl p-4 sm:p-5 border border-indigo-400/40 hover:border-indigo-300/80 bg-indigo-500/[0.06] hover:bg-indigo-500/[0.12] transition space-y-1.5 shadow-lg">
            <div class="flex items-center justify-between gap-2">
              <span class="font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 rounded bg-indigo-500/20 border border-indigo-400/40 text-indigo-200">New · Beta</span>
              <span class="font-mono text-[11px] text-zinc-400">18+ · private · no scores</span>
            </div>
            <div class="text-base sm:text-lg font-semibold text-white flex items-center justify-between"><span>KINKSYN beta — Snapshot, Deep Map &amp; Neural Node Map</span><span class="text-indigo-300">→</span></div>
            <p class="text-xs text-zinc-400 leading-relaxed">Describe how you relate to 11 areas and 36 concepts in your own terms — several answers at once, skip anything. Your map shows only what you said.</p>
          </button>

          <!-- Two Questionnaire Choices Side-by-Side -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-left pt-1">
            <button type="button" onclick="app.startQuiz('quick')" class="group glass-panel rounded-2xl p-4 sm:p-5 border border-teal-500/30 hover:border-teal-400/70 bg-teal-500/[0.04] hover:bg-teal-500/[0.09] transition text-left space-y-2 shadow-lg">
              <div class="flex items-center justify-between gap-2">
                <span class="font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 rounded bg-teal-500/15 border border-teal-500/30 text-teal-300">Option A · Shorter</span>
                <span class="font-mono text-[11px] text-zinc-400">10 Scenarios · ~2 min</span>
              </div>
              <div class="text-base sm:text-lg font-semibold text-white group-hover:text-teal-200 transition flex items-center justify-between">
                <span>Quick Pulse</span>
                <span class="text-teal-400">→</span>
              </div>
              <p class="text-xs text-zinc-400 leading-relaxed">
                High-signal snapshot covering core drivers, key somatic/power/sensory pathways, gaze &amp; caretaking, and nervous-system grounding.
              </p>
            </button>

            <button type="button" onclick="app.startQuiz('full')" class="group glass-panel rounded-2xl p-4 sm:p-5 border border-purple-500/35 hover:border-purple-400/75 bg-purple-500/[0.05] hover:bg-purple-500/[0.11] transition text-left space-y-2 shadow-[0_0_28px_rgba(168,85,247,0.16)]">
              <div class="flex items-center justify-between gap-2">
                <span class="font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 rounded bg-purple-500/20 border border-purple-500/35 text-purple-200">Option B · Longer</span>
                <span class="font-mono text-[11px] text-zinc-400">24 Scenarios · 4 Chapters</span>
              </div>
              <div class="text-base sm:text-lg font-semibold text-white group-hover:text-purple-200 transition flex items-center justify-between">
                <span>Full Deep Dive</span>
                <span class="text-purple-400">→</span>
              </div>
              <p class="text-xs text-zinc-400 leading-relaxed">
                Comprehensive exploration across Nervous System Baseline, Core Drivers, Somatic/Power Pathways, and Theater/Gaze/Nurturance.
              </p>
            </button>
          </div>

          <div class="flex flex-wrap items-center justify-center gap-2.5 pt-1">
            ${hasVault ? `
              <button type="button" onclick="${this.vaultStatus === 'locked' ? 'app.openVaultModal()' : 'app.view = \'graph\'; app.render()'}" class="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-mono text-xs font-medium shadow-[0_0_24px_rgba(45,212,191,0.3)] transition">
                ${this.vaultStatus === 'locked' ? 'Unlock Saved Vault' : 'Open Saved Living Map'}
              </button>
            ` : ''}
            <button type="button" onclick="app.loadDemoProfile()" class="px-5 py-2.5 rounded-xl glass-panel hover:bg-white/[0.06] border border-white/10 text-zinc-200 font-mono text-xs transition">
              Load Demo Profile
            </button>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 text-left">
            <div class="glass-panel rounded-xl p-4 border border-white/[0.07]">
              <div class="font-mono text-[10px] uppercase tracking-wider text-teal-400 mb-1">01 // AES-256 Local Vault</div>
              <div class="text-xs text-zinc-300 leading-relaxed">Zero-knowledge browser storage with optional passphrase encryption and time-lapse snapshots.</div>
            </div>
            <div class="glass-panel rounded-xl p-4 border border-white/[0.07]">
              <div class="font-mono text-[10px] uppercase tracking-wider text-purple-400 mb-1">02 // Living 18-Node Map</div>
              <div class="text-xs text-zinc-300 leading-relaxed">Adjust any node's resonance or polarity live as your curiosity and boundaries evolve.</div>
            </div>
            <div class="glass-panel rounded-xl p-4 border border-white/[0.07]">
              <div class="font-mono text-[10px] uppercase tracking-wider text-indigo-400 mb-1">03 // Somatic Journal</div>
              <div class="text-xs text-zinc-300 leading-relaxed">Record post-scene reflections and aftercare insights tagged directly to nodes and partners.</div>
            </div>
            <div class="glass-panel rounded-xl p-4 border border-white/[0.07]">
              <div class="font-mono text-[10px] uppercase tracking-wider text-amber-400 mb-1">04 // Scoped Dyad Links</div>
              <div class="text-xs text-zinc-300 leading-relaxed">Share a First-Date Vibe Card or Full 18-Node Map to co-design scenes, readings &amp; tools.</div>
            </div>
          </div>

          <div class="pt-1">
            <button type="button" onclick="app.openEthicsModal()" class="text-xs font-mono text-zinc-500 hover:text-teal-300 transition underline underline-offset-4">
              Read our Whole-Person Charter, SSC/RACK/PRICK Principles &amp; Ethical Sustainability Model →
            </button>
          </div>
        </div>
      </div>
    `;
  },
};
