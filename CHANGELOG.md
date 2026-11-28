# Changelog

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
