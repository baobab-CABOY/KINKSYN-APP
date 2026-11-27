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
