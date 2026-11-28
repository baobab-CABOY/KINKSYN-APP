# Changelog

## 0.3.0-beta — 2026-11-27 (implementation)
Beta is reachable from the landing page ("New · Beta"). The classic quiz, 18-node graph, journal, PNG, share links
and Dyad are unchanged.

### Added
- **18+ gate**, privacy and storage explanation before any beta question.
- **Snapshot** (9 steps, every question skippable, resume where you left off, review with per-answer edit).
- **Deep Map** in 9 modules, any order; module B is a concept inventory with a full concept editor
  (multi-select relationship states, directions, time context, experience, enjoyment, conditions, note);
  Snapshot answers are reused as context, never overwritten.
- **Private boundaries notebook** (module H) behind a privacy explanation, plus optional private boundary per concept.
- **Neural Node Map**: 11 areas + 36 concepts as an accessible SVG graph — one visual cue per answer state, neutral
  grey for unanswered, fixed node sizes, legend, search, area/state filters, hide unanswered, collapse areas,
  pan/zoom/pinch, keyboard navigation, detail panel with edit/clear, and a list view with the same information.
- **Your data** page: exact storage/encryption status, JSON export (private data only if ticked), delete beta answers.
- Tests: `tests/beta.test.mjs` (11 unit tests) and `tests/beta_smoke.py` (45 browser checks); CI runs both.

### Changed / fixed
- Vault payload is now `schemaVersion: 2` with `beta` + `betaPrivate`; older vaults (plain or encrypted) load with
  empty beta data and unknown fields are preserved.
- Saving is refused while an encrypted vault is locked (previously a quiz result could overwrite the encrypted vault).
- Vault writes are serialised so fast edits with encryption can't save an older state last.
- "Wipe Local Data" also clears in-memory data and returns to the landing page.
- Unlocking the vault no longer jumps to an empty graph when there is no classic profile.

## 0.2.1 — 2026-11-27
- Renamed to **KINKSYS** (display name only; `#synapse=` links and saved vaults still work).
- Questionnaires exported as Markdown in `docs/questionnaires/` (generated from the app data).
- New logo on the landing page and header, plus favicon (`assets/`).

## 0.2.0 — 2026-11-27
Restructured from the single-file prototype (`kinksyn_v0.1`, kept in `archive/`).

### Structure
- Split into native ES modules: `js/data`, `js/core`, `js/features`, `js/views`, `js/ui`, `js/graph`; CSS in `css/`.
- Added `CLAUDE.md` (context map), `docs/ARCHITECTURE.md`, `docs/BACKLOG.md`, headless smoke test, CI.

### Fixes
- Modal close buttons did nothing: `app.closeModal` was called everywhere but never defined.
- Answering **Hard Limit** on a node's own question is now always respected (scores zeroed). Before, points from
  other questions could override it, so the limit didn't show on the one-pager or in Dyad filtering.
- "Load Demo" after a Quick Pulse only scored 10 of the 24 demo answers; it now always uses the full track.
- User-typed text (journal notes, aliases, snapshot labels, partner names) is HTML-escaped.
- Copy-link uses the Clipboard API with a fallback.
- Charter header button used a non-existent `xs:` breakpoint and never showed.
- Tailwind config no longer throws if the CDN fails to load.

## 0.1.0
- Single-file prototype.

## 0.3.0-beta — 2026-11-27
- Added a separate beta questionnaire content package: KINKSYN Snapshot and modular Deep Map.
- Added an 11-domain, 36-concept faceted taxonomy and a multi-state response schema.
- Added Neural Node Map specification and implementation handoff for Claude.
- The beta model is explicitly separate from legacy 18-node scores and Dyad matching; no validated assessment or compatibility claims.
- No application behavior changed in this commit; this is content, documentation and implementation instruction only.
