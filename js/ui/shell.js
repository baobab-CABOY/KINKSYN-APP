// Boot, routing/render, header, modals, toasts, graph lens/filter controls.
import { DRIVERS } from '../data/nodes.js';
import { NeuralGraphEngine } from '../graph/engine.js';

export const shellMethods = {
  init() {
    this.checkLocalVaultOnBoot();
    try {
      if (window.location.hash && window.location.hash.includes('synapse=')) {
        const decoded = this.decodeProfile(window.location.hash);
        if (decoded) {
          if (!this.profile) {
            this.profile = decoded;
            const sortedDrivers = Object.keys(DRIVERS).sort((a, b) => (decoded.nodes[b]?.score || 0) - (decoded.nodes[a]?.score || 0));
            this.selectedNodeId = sortedDrivers[0] || 'surrender';
            this.view = 'graph';
            this.render();
            this.showToast('Loaded shared KINKSYS neural map');
            return;
          } else {
            this.partnerProfile = decoded;
            this.view = 'graph';
            this.render();
            this.showToast('Loaded shared partner map into active overlay');
            return;
          }
        }
      }
    } catch (err) {
      console.warn('Hash parse skipped:', err);
    }

    if (this.vaultStatus === 'unlocked' && this.profile) {
      this.view = 'graph';
    } else {
      this.view = 'landing';
    }
    this.render();
  },

  goHome() {
    this.destroyGraph();
    this.view = 'landing';
    this.render();
  },

  closeModal(modalId) {
    const m = document.getElementById(modalId);
    if (m) {
      m.classList.add('hidden');
      m.classList.remove('flex');
    }
  },

  openEthicsModal() {
    const m = document.getElementById('ethicsModal');
    if (m) {
      m.classList.remove('hidden');
      m.classList.add('flex');
    }
  },

  setDrawerTab(tab) {
    this.drawerTab = tab;
    this.renderInsightPanel();
  },

  setFilterMode(mode) {
    this.filterMode = mode;
    if (this.graphEngine) {
      this.graphEngine.setFilterMode(mode);
    }
    document.querySelectorAll('[data-filter-btn]').forEach(btn => {
      const isMatch = btn.getAttribute('data-filter-btn') === mode;
      btn.className = isMatch
        ? 'px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-mono font-medium bg-purple-500/25 text-purple-200 border border-purple-500/40 transition'
        : 'px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-mono text-zinc-400 hover:text-zinc-200 hover:bg-white/5 border border-transparent transition';
    });
  },

  setPolarityView(mode) {
    this.polarityView = mode;
    if (this.graphEngine) {
      this.graphEngine.setPolarityView(mode);
    }
    document.querySelectorAll('[data-polarity-btn]').forEach(btn => {
      const btnMode = btn.getAttribute('data-polarity-btn');
      const isActive = btnMode === mode;
      if (!isActive) {
        btn.className = 'flex-1 sm:flex-initial justify-center px-3.5 sm:px-5 py-2 rounded-xl text-xs font-mono text-zinc-400 hover:text-zinc-200 transition flex items-center gap-1.5 sm:gap-2 border border-transparent';
      } else if (mode === 'receiving') {
        btn.className = 'flex-1 sm:flex-initial justify-center px-3.5 sm:px-5 py-2 rounded-xl text-xs font-mono font-semibold bg-indigo-500/25 text-indigo-200 border border-indigo-400/60 shadow-[0_0_18px_rgba(129,140,248,0.32)] transition flex items-center gap-1.5 sm:gap-2';
      } else if (mode === 'giving') {
        btn.className = 'flex-1 sm:flex-initial justify-center px-3.5 sm:px-5 py-2 rounded-xl text-xs font-mono font-semibold bg-rose-500/25 text-rose-200 border border-rose-400/60 shadow-[0_0_18px_rgba(244,63,94,0.32)] transition flex items-center gap-1.5 sm:gap-2';
      } else {
        btn.className = 'flex-1 sm:flex-initial justify-center px-3.5 sm:px-5 py-2 rounded-xl text-xs font-mono font-semibold bg-gradient-to-r from-indigo-500/25 via-fuchsia-500/25 to-rose-500/25 text-white border border-fuchsia-400/60 shadow-[0_0_20px_rgba(232,121,249,0.3)] transition flex items-center gap-1.5 sm:gap-2';
      }
    });
    this.renderInsightPanel();
  },

  selectGraphNode(nodeId) {
    this.selectedNodeId = nodeId;
    this.renderInsightPanel();
  },

  showToast(msg) {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const el = document.createElement('div');
    el.className = 'glass-panel border border-purple-500/35 text-zinc-100 text-xs font-mono px-3.5 py-2.5 rounded-xl shadow-xl animate-enter';
    el.textContent = msg;
    container.appendChild(el);
    setTimeout(() => {
      el.style.opacity = '0';
      el.style.transition = 'opacity 0.25s ease';
      setTimeout(() => el.remove(), 260);
    }, 2400);
  },

  destroyGraph() {
    if (this.graphEngine) {
      this.graphEngine.destroy();
      this.graphEngine = null;
    }
  },

  renderHeader() {
    const header = document.getElementById('headerControls');
    if (!header) return;

    const vaultBadgeText = this.vaultStatus === 'locked'
      ? 'Unlock Vault'
      : this.vaultStatus === 'unlocked'
      ? 'Vault ●'
      : 'Vault';

    const vaultBtnClass = this.vaultStatus === 'locked'
      ? 'px-2.5 py-1.5 rounded-lg border border-amber-500/50 bg-amber-500/15 hover:bg-amber-500/25 text-[11px] font-mono text-amber-200 transition'
      : 'px-2.5 py-1.5 rounded-lg border border-teal-500/35 bg-teal-500/10 hover:bg-teal-500/20 text-[11px] font-mono text-teal-200 transition';

    if (this.view === 'landing') {
      header.innerHTML = `
        <button type="button" onclick="app.openVaultModal()" class="${vaultBtnClass}">
          ${vaultBadgeText}
        </button>
        <button type="button" onclick="app.openEthicsModal()" class="hidden sm:inline-block px-2.5 py-1.5 rounded-lg border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] text-[11px] font-mono text-zinc-300 transition">
          Charter
        </button>
        <button type="button" onclick="app.loadDemoProfile()" class="px-2.5 py-1.5 rounded-lg border border-white/10 hover:border-purple-400/40 bg-white/[0.03] text-[11px] font-mono text-zinc-300 hover:text-white transition">
          Demo
        </button>
      `;
    } else if (this.view === 'quiz') {
      header.innerHTML = `
        <button type="button" onclick="app.finishEarlyAndViewMap()" class="px-2.5 py-1.5 rounded-lg border border-purple-500/35 bg-purple-500/15 hover:bg-purple-500/25 text-[11px] font-mono text-purple-200 transition">
          View Map Now
        </button>
        <button type="button" onclick="app.goHome()" class="px-2 py-1.5 rounded-lg text-xs font-mono text-zinc-400 hover:text-white transition">
          Exit
        </button>
      `;
    } else if (this.view === 'graph') {
      header.innerHTML = `
        <button type="button" onclick="app.openVaultModal()" class="${vaultBtnClass}">
          ${vaultBadgeText}
        </button>
        <button type="button" onclick="app.openPngExportModal()" class="px-2.5 py-1.5 rounded-lg border border-white/15 bg-white/[0.05] hover:bg-white/[0.1] text-[11px] font-mono text-zinc-100 transition">
          1-Pager
        </button>
        <button type="button" onclick="app.openShareModal()" class="px-2.5 sm:px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-mono font-medium shadow-[0_0_16px_rgba(168,85,247,0.35)] transition">
          Dyad
        </button>
      `;
    }
  },

  render() {
    const root = document.getElementById('appRoot');
    if (!root) return;
    this.renderHeader();

    if (this.view === 'landing') {
      root.innerHTML = this.renderLandingView();
    } else if (this.view === 'quiz') {
      root.innerHTML = this.renderQuizView();
    } else if (this.view === 'graph') {
      root.innerHTML = this.renderGraphView();
      this.renderInsightPanel();
      requestAnimationFrame(() => this.initGraphCanvas());
    }
  },

  initGraphCanvas() {
    this.destroyGraph();
    const canvas = document.getElementById('neuralCanvas');
    if (!canvas || !this.profile) return;
    this.graphEngine = new NeuralGraphEngine(canvas, this.profile, this.partnerProfile, (nodeId) => {
      this.selectGraphNode(nodeId);
    });
    this.graphEngine.setPolarityView(this.polarityView);
    this.graphEngine.setFilterMode(this.filterMode);
  },
};
