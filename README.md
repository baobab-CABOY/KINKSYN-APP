# KINKSYS (formerly KINKSYN) // Desire & Polarity Engine

Local-first web app for adults to map *why* they desire what they desire: a 10- or 24-scenario quiz becomes an
interactive 18-node neural graph (7 psychological drivers, 10 erotic pathways) with Receiving / Giving / Overlay
lenses, a local vault (optional AES-256 passphrase), snapshots, a reflection journal, a PNG one-pager and
partner "Dyad Synthesis" through share links. No server, no accounts, no build step.

## Run locally
```bash
python3 -m http.server 8000   # then open http://localhost:8000
```
(ES modules don't load from `file://`.)

## Test
```bash
pip install playwright && playwright install chromium   # once
python3 tests/smoke.py
```

## Layout
See [`CLAUDE.md`](CLAUDE.md) for the file map, [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for data model and
scoring, [`docs/BACKLOG.md`](docs/BACKLOG.md) for known issues, [`CHANGELOG.md`](CHANGELOG.md) for history.
The original single-file prototype is in `archive/` for reference only (not loaded).

## Beta: Snapshot, Deep Map & Neural Node Map (0.3.0-beta)

Open the app and choose **New · Beta** on the landing page (18+ confirmation required).
- **Snapshot** — about 5 minutes, every question optional; produces a map even from a few answers.
- **Deep Map** — 9 optional modules in any order; answer only the concepts you want, with several states at once.
- **Neural Node Map** — 11 areas and 36 concepts. Your own answers decorate the nodes; unanswered stays neutral grey.
  Graph or list view, search, filters, keyboard and touch support.
- **Your data** — where it is stored, encryption status, JSON export and delete.

What it is not: no score, type, diagnosis, compatibility rating, sharing or matching. Answers are not consent.
Storage: local to the browser; encrypted only if you set a vault passphrase (otherwise plaintext localStorage).
The optional private boundaries notebook is kept separate and never appears on the map, in share links, Dyad or the PNG.

Content lives in [`js/data/questionnaire-beta-v1.json`](js/data/questionnaire-beta-v1.json) (readable copy:
[`docs/questionnaires/beta-v1.md`](docs/questionnaires/beta-v1.md)); specs in [`docs/beta/`](docs/beta/).
This is a provisional self-reflection beta, not a validated test.

Tests: `node --test tests/*.test.mjs`, `python3 tests/smoke.py`, `python3 tests/beta_smoke.py`.
