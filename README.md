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
