// Central app object: state fields + feature method mixins.
// Every method uses `this` (=== app). Inline onclick="app.x()" handlers rely on window.app (set in main.js).
import { shellMethods } from './ui/shell.js';
import { defaultBeta, defaultBetaPrivate } from './beta/store.js';
import { betaFlowMethods } from './beta/flow.js';
import { betaActionMethods } from './beta/actions.js';
import { betaShellView } from './beta/views/shell-view.js';
import { betaQuestionView } from './beta/views/question-view.js';
import { betaConceptEditorView } from './beta/views/concept-editor.js';
import { betaMapView } from './beta/views/map-view.js';
import { quizMethods } from './features/quiz.js';
import { profileMethods } from './features/profile.js';
import { vaultMethods } from './features/vault.js';
import { journalMethods } from './features/journal.js';
import { exportPngMethods } from './features/export-png.js';
import { dyadMethods } from './features/dyad.js';
import { landingView } from './views/landing.js';
import { quizView } from './views/quiz-view.js';
import { graphView } from './views/graph-view.js';
import { insightPanelView } from './views/insight-panel.js';

export const app = {
  view: 'landing',
  currentQIndex: 0,
  answers: {},
  profile: null,
  partnerProfile: null,
  activePresetKey: null,
  savedPartners: [],
  snapshots: [],
  journalEntries: [],
  vaultPassphrase: null,
  vaultStatus: 'empty', // 'empty' | 'unlocked' | 'locked'
  quizMode: 'full', // 'quick' (10 questions) | 'full' (24 questions)
  shareScope: 'full', // 'full' | 'vibe'
  drawerTab: 'guide', // 'guide' | 'refine' | 'journal'
  filterMode: 'all',
  polarityView: 'overlay',
  selectedNodeId: 'surrender',
  graphEngine: null,
  lastPosterDataUrl: null,
  vaultExtras: {},
  pendingViewAfterUnlock: null,
  // Beta (separate model — never fed into legacy scoring, archetypes or Dyad)
  beta: defaultBeta(),
  betaPrivate: defaultBetaPrivate(), // boundaries: isolated from map, exports, share links, Dyad
  betaContent: null,
  betaRoute: 'home', // gate | home | snapshot | deep | map | data
  betaDeepModule: null,
  betaOpenConcept: null, // concept expanded in Deep Map B
  betaNotebookOpen: false, // session-only reveal of the private notebook
  betaMap: { selected: null, mode: 'graph', domains: null, states: null, showUnanswered: true, collapsed: [], search: '', editing: false, filtersOpen: false, view: null },
  betaConfirmDelete: false,
};

Object.assign(
  app,
  shellMethods,
  quizMethods,
  profileMethods,
  vaultMethods,
  journalMethods,
  exportPngMethods,
  dyadMethods,
  landingView,
  quizView,
  graphView,
  insightPanelView,
  betaFlowMethods,
  betaActionMethods,
  betaShellView,
  betaQuestionView,
  betaConceptEditorView,
  betaMapView
);
