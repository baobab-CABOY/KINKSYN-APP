# KINKSYS — context map for Claude

Local-first, adult self-discovery web app ("KINKSYS // Desire & Polarity Engine").
A quiz maps answers onto an 18-node graph (1 core + 7 psychological drivers + 10 erotic pathways),
viewable through Receiving / Giving / Overlay lenses, with an encrypted local vault, journal,
PNG one-pager, and partner "Dyad Synthesis" via share links. No backend, no build step.

## Token rules (read this first)
- **Do not read whole files you don't need.** Use the map below, then `grep -n` for the method and
  `Read` with `offset`/`limit`. Most changes touch 1–2 files.
- `js/data/*` is pure content (long). Only open it to edit content; grep for an `id:` to jump.
- After a change: `python3 tests/smoke.py` (headless, ~10 s). Extend it when adding a flow.
- Log user-visible changes in `CHANGELOG.md`; move done items out of `docs/BACKLOG.md`.
- Deeper detail (profile shape, scoring maths, share format) is in `docs/ARCHITECTURE.md`. Read only when touching those.

## Stack & conventions
- Plain HTML + native ES modules + Tailwind via CDN (`index.html` head). Serve over HTTP
  (`python3 -m http.server`), modules don't load from `file://`.
- One global `app` object (`js/app.js`): state fields + method mixins merged with `Object.assign`.
  Every method uses `this` (=== `app`). Inline HTML handlers call `app.x()` (`window.app` set in `js/main.js`).
- Views return HTML strings rendered via `innerHTML`. **Always wrap user-typed text in `escapeHtml()`**
  (`js/core/utils.js`): journal notes, aliases, labels, partner names.
- Rendering is coarse: `app.render()` redraws the view, `app.renderInsightPanel()` the drawer,
  `app.updatePartnerModalUI()` the dyad modal. Graph canvas re-reads `app.profile` every frame.
- Any state mutation that should survive reload ends with `this.persistVault()`.
- No frameworks, no build, no npm deps for the app itself. Keep files < ~500 lines; split by feature if bigger.

## File map (lines ≈)
| File | What lives there |
|---|---|
| `index.html` (264) | Head, Tailwind config, header shell, 4 static modals (vault, ethics/charter, PNG, share/dyad) |
| `assets/` | `logo.png` (512px, transparent, light lavender for dark UI), `favicon.png` |
| `css/styles.css` (70) | Scrollbars, glass panel, grid bg, animations, canvas cursor |
| `js/main.js` (23) | Sets `window.app`, boots `app.init()` |
| `js/app.js` (50) | **State fields** + mixin assembly. Add new state/mixins here |
| `js/config.js` | `VAULT_STORAGE_KEY`, `APP_VERSION` |
| `js/core/crypto.js` (57) | `vaultCrypto`: PBKDF2 (100k) → AES-256-GCM encrypt/decrypt |
| `js/core/utils.js` | `escapeHtml` |
| `js/data/nodes.js` (437) | `CORE_NODE`, `DRIVERS` (7), `ACTIVITIES` (10, each lists `drivers`), `ALL_NODES_MAP`. Each node: label, color, definition, possibleDrivers, scenes{starter,deeper,aftercare}, resources[3] |
| `js/data/questions.js` (308) | `CHAPTERS` (4), `QUICK_PULSE_IDS` (10), `QUESTIONS` (24: chapter, scenario, prompt, hasPolarity, polarityLabels, `weights{nodeId:factor}`), `RESONANCE_OPTIONS` (core/curious/fantasy/neutral/limit) |
| `js/data/presets.js` (72) | `PARTNER_PRESETS` alex / sam / river (full node maps) |
| `js/ui/shell.js` (204) | `init` (vault boot + `#synapse=` hash), `goHome`, `closeModal`, `openEthicsModal`, `setDrawerTab`, `setFilterMode`, `setPolarityView`, `selectGraphNode`, `showToast`, `destroyGraph`, `renderHeader`, `render`, `initGraphCanvas` |
| `js/features/quiz.js` (140) | `getActiveQuestions`, `startQuiz`, `jumpToChapter`, `finishEarlyAndViewMap`, `loadDemoProfile` (demo answers inline), `selectAnswer`, `selectPolarity`, `prevQuestion`, `nextQuestion` |
| `js/features/profile.js` (319) | `computeProfile` (answers → `app.profile`), `updateLiveNodeState` (Refine Live tab), `getArchetypeTitle`, `encodeProfile`/`decodeProfile` (share links) |
| `js/features/vault.js` (228) | `checkLocalVaultOnBoot`, `hydrateVaultData`, `persistVault`, `unlockVaultWithPassphrase`, `wipeLocalVault`, `captureSnapshot`, `restoreSnapshot`, `openVaultModal`, `renderVaultModal` |
| `js/features/journal.js` (36) | `addJournalEntry`, `deleteJournalEntry` |
| `js/features/export-png.js` (433) | `openPngExportModal`, `renderOnePagerCanvas` (1200×1860 poster), `drawMiniNeuralGraph`, `drawRoundRect`, `truncateText`, `downloadOnePagerPng` |
| `js/features/dyad.js` (339) | `setShareScope`, `openShareModal`, `copyShareLink`, `applyPartnerCode`, `loadSavedPartner`, `loadPartnerPreset`, `clearPartnerProfile`, `updatePartnerModalUI`, `renderDyadSynthesisHTML` (matching rules) |
| `js/views/landing.js` (95) | `renderLandingView` |
| `js/views/quiz-view.js` (140) | `renderQuizView` |
| `js/views/graph-view.js` (68) | `renderGraphView` (canvas wrapper, filter pills, lens switcher, empty drawer) |
| `js/views/insight-panel.js` (365) | `renderInsightPanel`: Guide & Scenes / Refine Live / Journal tabs |
| `js/graph/engine.js` (527) | `class NeuralGraphEngine`: layout, physics float, pan/zoom/drag, hitTest, draw (edges, pulses, glows, partner rings, "mutual gold") |
| `tests/smoke.py` | Playwright smoke test of every main flow |
| `tools/gen-questionnaires.mjs` | Writes `docs/questionnaires/quick-pulse.md` + `full-deep-dive.md` from the data (generated, don't hand-edit) |

## Recipes
- **Add/edit a question** → `js/data/questions.js` (`weights` keys must be node ids). Quick track? add id to `QUICK_PULSE_IDS`. Update demo answers in `quiz.js` if needed. Then `node tools/gen-questionnaires.mjs` (CI fails if `docs/questionnaires/` is stale).
- **Add a node** → `js/data/nodes.js` (driver in `DRIVERS` or activity in `ACTIVITIES` with `drivers`), give it weight in ≥1 question, add it to each preset in `presets.js`. Graph layout is automatic (rings); check `engine.js buildGraphData` + `export-png.js drawMiniNeuralGraph` spacing.
- **Change scoring** → `profile.js computeProfile` (+ `updateLiveNodeState` mapping). Hard Limit rules there.
- **Change matching** → `dyad.js renderDyadSynthesisHTML` and the mutual-gold thresholds in `engine.js draw`.
- **New persisted field** → add to `app.js` state, `vault.js persistVault` payload + `hydrateVaultData`.
- **New modal** → static markup in `index.html`, open/close via `classList` hidden/flex, close with `app.closeModal(id)`.
- **New feature module** → `js/features/x.js` exporting `xMethods = {…}`, import + add to `Object.assign` in `app.js`, add a row above.

## Repo
GitHub `baobab-CABOY/KINKSYN-APP` (public), branch `main`. **Live: https://baobab-caboy.github.io/KINKSYN-APP/** (GitHub Pages from `main` root, auto-deploys on push). CI: `.github/workflows/ci.yml` (syntax check + smoke test).
Also hosted (private) as a claude.ai artifact: https://claude.ai/artifact/XviqpoQ5B2m27467vGqSe5
(slug `fa725d93-869f-400d-8ef1-6ba9de43c37a`). Republish with `publish_files` (slug + base_version) after changes.
Artifact sandbox limits: PNG download is blocked and `#synapse=` URL links don't pass through; pasting a link into Dyad works.

## Beta questionnaire + expanded node-map handoff (2026-11-27)

**Owner's request:** implement the first beta from the versioned product package in this repo. The beta package is the implementation source of truth for new questionnaire content and its new faceted map model.

Read before coding:
- `docs/beta/BETA_IMPLEMENTATION_BRIEF.md`
- `docs/beta/NEURAL_NODE_MAP_SPEC.md`
- `js/data/questionnaire-beta-v1.json`
- `docs/questionnaires/beta-v1.md`
- `docs/ARCHITECTURE.md`

### Critical integration guidance
- The existing app is a functioning local-first product with an 18-node scored graph, quiz, encrypted vault, journal, PNG export and Dyad sharing. **Do not replace it wholesale or break existing saved vaults/share links.**
- The new beta model has 11 domains and 36 concept nodes, with independent, multi-select relationship states. It is intentionally not a score or personality test.
- Keep the legacy questionnaire/profile/graph working during beta integration. Prefer a separate beta entry point / profile namespace and a new graph mode, then consider migration only after explicit testing.
- Do not feed new beta answers into the legacy `computeProfile()`, old 0–100 scores, archetype generation or Dyad matching. They are different data models.
- Preserve stable IDs in the JSON. Treat it as data/configuration, not UI markup.
- Add beta response records to the existing vault payload only through a versioned, backwards-compatible migration. Verify both encrypted and unencrypted vault hydration. Never silently discard old data.
- New response states are multi-select and non-ordinal. "Unanswered" must remain distinct from "not interested". Contradictory combinations should be clarified, not auto-resolved.
- The optional boundaries notebook is highly sensitive: private by default, excluded from graph node view models, partner sharing, share links, analytics, URLs and PNG exports unless the user explicitly chooses an appropriate export. Do not add boundary data to existing Dyad.
- No global score, percentile, diagnosis, archetype, inferred consent or compatibility percentage for the beta model.
- The neural map is a curated taxonomy graph, not a biological neural model. Edges mean taxonomy relationships only. Unanswered nodes are neutral. Node size does not encode desire intensity.
- Use `escapeHtml()` for user-authored labels and notes. Keep keyboard and screen-reader list alternatives for the graph.
- The app currently autosaves plaintext when no vault passphrase is configured and its share links are base64-readable. Be accurate about these limitations; do not promise encryption unless actually enabled and tested.

### Required implementation workflow
1. Inspect the current relevant modules and tests before edits.
2. Implement an incremental beta path; preserve current landing/quiz/profile/Dyad behavior.
3. Add tests for beta content integrity, multi-state response storage, unanswered-vs-not-interested, graph rendering, boundary isolation and vault migration.
4. Run `python3 tests/smoke.py` and CI-equivalent checks.
5. Update `CHANGELOG.md`, `docs/ARCHITECTURE.md`, `docs/BACKLOG.md`, generated questionnaire docs and this context map as the implementation evolves.
6. Report changed files, tested flows, known gaps and the precise storage/privacy behavior.

The beta package is a provisional product draft, not a psychometrically validated assessment. Build for learning and user feedback, not premature scoring or matching.
