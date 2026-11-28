# Backlog

Known issues and ideas. Tag: **[bug]**, **[privacy]**, **[content]**, **[ux]**, **[tech]**. Remove when done (log in CHANGELOG).

## Privacy & safety (do first)
- **[privacy]** Autosave writes the profile + journal to localStorage **unencrypted** whenever no passphrase is set
  (after every quiz/edit). Options: no autosave until the user opts in, or prompt for a passphrase on first save.
- **[privacy]** Share links are plain base64; the charter says "zero-knowledge". Consider an optional link passphrase
  or wording that makes clear the link itself is readable.
- **[content]** Resource lists (books, guides, videos) need fact-checking before release. Several titles/authors look
  invented or misattributed (e.g. some "Loving BDSM", "OMGYes", "Evie Lupine" items, "The Heart of Dominance").

## Bugs
- **[bug]** Opening a shared `#synapse=` link with no saved profile loads the *partner's* map as your own profile.
- **[bug]** `loadSavedPartner` / presets don't persist which partner is active across reloads.
- **[bug]** Hash stays in the URL after loading; re-renders/reloads re-import it.
- **[bug]** One-pager PNG footer line may overflow 1200 px width (unverified visually).

## UX
- **[ux]** Modals: close on Escape and backdrop click; focus trap.
- **[ux]** Quiz "Back" on Q1 exits to landing without confirmation; answers are lost.
- **[ux]** Naming is mixed: KINKSYN / KINKY SYNAPSES / SYNAPSE. Pick one (storage key `synapse_v4_vault` must stay or be migrated).
- **[ux]** Charter button hidden on mobile header (only reachable from landing link).

## Tech
- **[tech]** Tailwind Play CDN is not meant for production (runtime JIT, flash of unstyled content, needs network).
  Move to a prebuilt CSS file when the design settles.
- **[tech]** Demo answers live in `quiz.js`; could move to `js/data/presets.js`.
- **[tech]** Inline `onclick="app.…"` handlers; fine for now, consider event delegation if views grow.

## Ideas (from charter / roadmap)
- Polycule maps (3+ profiles), E2EE negotiation rooms, printable protocol decks (Sanctuary Pass).
- Snapshot diff view ("time-lapse" comparison) — snapshots are stored but not compared yet.
- Export/import vault as a file (backup between devices).

## Beta questionnaire + map (0.3.0-beta implemented)
Done: Snapshot, modular Deep Map (skip/resume/edit, reuses Snapshot), versioned storage + migration (plain and
encrypted), 11-domain / 36-concept SVG map with multi-state cues, list alternative, search, filters, collapse,
private notebook isolation, export/delete, beta tests (unit + browser).

Still open:
- [ ] [content] **Provisional field options** in `js/beta/field-options.js` (time context, experience, enjoyment,
  conditions, boundary statuses) were not defined in the content JSON — owner review needed; consider moving into the JSON.
- [ ] [content] All 36 concept descriptions are "Neutral beta label. Expand with reviewed definition before production."
- [ ] [content] Naming: beta content says "KINKSYN Snapshot / Deep Map", app is branded KINKSYS. Pick one.
- [ ] [content] No curated `related_to` edges in the JSON yet (renderer supports `related_ids`).
- [ ] [privacy] Consider requiring or strongly prompting a passphrase before writing the private notebook (today it
  follows the vault setting and is plaintext without one; the UI says so).
- [ ] [privacy] Map screenshots/exports: no beta map image export exists; if added, warn about sensitive content (spec §8).
- [ ] [ux] Usability-test question wording, the multi-state legend, graph comprehension and phone interaction.
- [ ] [ux] Snapshot SNAP_08 ("what next") is stored but doesn't route anywhere yet.
- [ ] [ux] JSON import (restore an export) is not implemented.
- [ ] [ux] Map: refit on window resize; labels at far zoom are hidden for unanswered concepts only.
- [ ] [tech] Classic quiz while the vault is locked now shows "unlock to save" instead of overwriting the vault — the
  result isn't saved until unlocked; consider prompting unlock before starting the classic quiz too.
- [ ] [content] Review beta taxonomy and prompts with community members before production claims.
