# Architecture & data model

## Boot & views
`main.js` → `app.init()` (`ui/shell.js`):
1. `checkLocalVaultOnBoot()` reads `localStorage[VAULT_STORAGE_KEY]`:
   `{encrypted:false, data}` → hydrate + `unlocked`; `{encrypted:true, salt, iv, cipher}` → `locked`; none → `empty`.
2. If URL hash has `#synapse=…`: decoded map becomes `app.profile` if none exists, else `app.partnerProfile`.
3. `app.view` ∈ `landing | quiz | graph` → `app.render()` swaps `#appRoot` innerHTML and re-renders header.
   Graph view also calls `renderInsightPanel()` and creates a `NeuralGraphEngine` on the next frame.

## Profile shape (`app.profile`)
```js
{
  nodes: {                       // 18 keys: 'core' + DRIVERS ids + ACTIVITIES ids
    [id]: {
      id, score,                 // 0–100, overlay strength
      receivingScore, givingScore,
      fantasyRatio,              // % of earned points that came from "Fantasy Only"
      isPrimarilyFantasy,        // fantasyRatio >= 55 && score > 0
      polarity,                  // 'Receive (Sub / Bottom)' | 'Give (Dom / Top)' | 'Switch / Both'
      statusTag                  // 'Embodied Reality' | 'Fantasy-Leaning' | 'Hard Limit' | 'Neutral / No Charge' | 'Scoped / Hidden'
    }
  },
  baselineSummary: { cognitiveRest, sensoryFocus, containmentNeed, aftercareNeed },  // labels from q1,q2,q3,q24
  trackMode: 'quick'|'full', answeredCount, totalQuestions, timestamp
}
```
`app.answers = { q1: { resonance: 'core'|'curious'|'fantasy'|'neutral'|'limit', polarity: 0|1|2 } }`
(polarity 0 = receive, 1 = give, 2 = switch).

## Scoring (`computeProfile`)
For each answered question, for each `weights[nodeId] = factor`:
- `maxPossible += factor`; `earned = max(0, resonance.weight) * factor` (core 1.0, curious .65, fantasy .55, neutral 0, limit -0.8 → 0).
- Receiving/giving: polarity 0 → all to receiving, 1 → all to giving, 2 or no-polarity question → 0.9 to each.
- `score = round(total / maxPossible * 100)`; same for rec/give.
- Polarity label: receive if rec > give×1.3 and ≥ switch, etc.
- **Hard Limit**: a node answered `limit` on a question where its factor is 1.0 (its own question) is always
  Hard Limit with scores zeroed. Otherwise Hard Limit only if score is 0 and limit weight ≥ neutral weight.

Live edits (`updateLiveNodeState`) bypass the quiz: fixed scores core 92 / curious 65 / fantasy 58 / neutral 0 / limit 0,
and the off-polarity side = 22 % of score (switch = 92 % each).

## Share links (`encodeProfile` / `decodeProfile`)
`#synapse=` + base64(JSON) of `{ nodeId: [score, fantasyRatio, polCode, rec, give, isLimit] }`, core omitted.
Scope `vibe` keeps only top-3 drivers + Hard Limit nodes; missing nodes decode as `statusTag: 'Scoped / Hidden'`.
Not encrypted: anyone holding the link can read it (the fragment never reaches a server).

## Vault payload (`persistVault`)
`{ profile, snapshots[≤15], journalEntries[], savedPartners[≤8], updatedAt }`, stored plain or as
AES-GCM envelope (`PBKDF2-SHA256, 100k iterations, 16-byte salt, 12-byte IV`). Passphrase kept in memory only.
`computeProfile` and every edit autosave; with no passphrase that means **plaintext localStorage**.

## Dyad matching (`renderDyadSynthesisHTML`)
- Any node Hard Limit on either side is excluded.
- Shared drivers: both ≥ 40, ranked by average.
- Pathways: both ≥ 55 → "green"; both ≥ 30 → "curious". Fit label from rec/give ≥ 50 cross-check.
- Scenes = top pathway starter, second pathway deeper, top shared driver aftercare; 3 deduped resources; tools list.
- Graph "mutual gold": your effective score ≥ 45 and partner score ≥ 45.

## Graph engine
Rings: core at 0, drivers radius 132, activities radius ~242 ±15 (alternating). Node radius grows with effective
score for the active lens. Filter `active` = effective ≥ 25, `fantasy` = primarily fantasy. Lit threshold 25.
Overlay colour: both rec & give ≥ 35 → fuchsia "dual"; give-leaning → rose; receive-leaning → indigo.

## Beta model v1 — parallel profile schema

The beta questionnaire package lives in `js/data/questionnaire-beta-v1.json`. It defines:
- 11 broad taxonomy domains and 36 concept nodes (concepts can belong to multiple domains).
- Snapshot and modular Deep Map question content.
- Multi-select relationship states, direction preferences and optional context fields.
- An optional highly sensitive boundaries notebook, private by default.

This model is intentionally separate from the legacy `app.profile.nodes[*].score` model. Do not convert beta answers into the legacy 0–100 score or pass them into legacy archetypes/Dyad matching. Use a separate versioned beta response collection (e.g. `betaProfiles`) and add it to the vault with backwards-compatible defaults. Existing vaults and `#synapse=` share links must continue to work.

Suggested concept response record:
```json
{
  "concept_id": "ACT_POWER_EXCHANGE",
  "relationship_states": ["curious", "fantasy_only"],
  "action_directions": ["receiving"],
  "time_context": "unspecified",
  "experience": "not_answered",
  "enjoyment": null,
  "conditions": [],
  "note": null,
  "boundary": {
    "status": "not_disclosed",
    "details": null,
    "shareable": false
  },
  "item_version": "1.0",
  "updated_at": null
}
```

Important: unanswered is not the same as `not_interested`; relationship states are not an ordinal scale. Boundary details must be isolated from graph nodes, exports and Dyad/share data. See `docs/beta/NEURAL_NODE_MAP_SPEC.md` for graph semantics and `docs/beta/BETA_IMPLEMENTATION_BRIEF.md` for acceptance criteria.

## Beta implementation (0.3.0-beta)

### Entry and routing
Landing "Beta" card → `app.openBeta(route)`. If the vault is **locked** it opens the unlock modal instead (and
`pendingViewAfterUnlock = 'beta'`), because saving would otherwise overwrite the encrypted vault. Content is fetched once
(`loadBetaContent`, validated + indexed). `app.view = 'beta'`, sub-route `app.betaRoute` ∈
`gate | home | snapshot | deep | map | data`. The 18+ gate (`beta.ageConfirmedAt`) is required before any route.
`renderBeta()` re-renders the view on every answer, keeping scroll and map pan/zoom; the enter animation only plays
when the screen changes.

### Stored data (vault payload `schemaVersion: 2`)
```js
{
  schemaVersion: 2,
  profile, snapshots, journalEntries, savedPartners,   // legacy, unchanged
  ...unknownFields,                                     // kept verbatim (vaultExtras) on every re-save
  beta: {
    schema_version: 1, content_version: '1.0.0', ageConfirmedAt,
    snapshot: { answers: { SNAP_01: { values: [...] }, SNAP_02: { value }, SNAP_03: { value, text } }, step, completedAt },
    domainResponses: { DOM_X: { relationship_states: [...], updated_at } },   // from SNAP_05 / Deep Map B
    deep: { answers: { DEEP_A1: { values }, ... }, lastModule },
    responses: { ACT_X: <concept record, see above> },                           // only non-empty records
    updatedAt
  },
  betaPrivate: {                                        // HIGHLY SENSITIVE — isolated
    notebook: { DEEP_H1: { values }, DEEP_H2: { text } },
    conceptBoundaries: { ACT_X: { status, details, shareable: false, updated_at } }
  }
}
```
- Inline-option answers store the option **text** (stable per content version); `source` questions store ids.
- A concept record with nothing left in it is deleted → the node is "unanswered" again. `not_interested` is a state.
- `record.boundary` is always the non-disclosing stub; real boundary data is only in `betaPrivate.conceptBoundaries`.
- Migration: `hydrateVaultData` runs `normalizeBeta/normalizeBetaPrivate` (defaults for pre-beta vaults, unknown
  fields kept). Tested for unencrypted and encrypted legacy vaults.
- `persistVault` now: refuses while locked; saves when there is a legacy profile **or** beta data; serialises and
  coalesces writes (async encryption could otherwise land out of order).
- Without a passphrase everything (legacy and beta, including the private notebook) is plaintext in localStorage. The
  UI says so on the gate, the notebook gate and the "Your data" page.

### Privacy isolation (enforced by structure + tests)
- `buildBetaGraphModel(content, beta)` has no private argument; node view models exclude notes and boundaries.
- The map-context editor renders no boundary controls; conflict hints involving boundaries only show in Deep Map B.
- Beta data is not read by `encodeProfile`, Dyad, PNG export or `computeProfile`.
- Export (`buildBetaExport`) leaves `betaPrivate` out unless the user ticks "include".
- `betaDeleteAll` clears beta + betaPrivate; keeps legacy data (or removes the key if nothing legacy remains).
- `wipeLocalVault` now also clears in-memory profile/beta so nothing is re-saved after a wipe.

### Map rendering
SVG (not canvas) so nodes are focusable (`tabindex`, `role=button`, `aria-label` with states) and testable.
Domains: fixed ring (R=420). Concepts: deterministic force pass (springs to their domains, pairwise repulsion).
Node radius is fixed by type (domain 24 / concept 11). Each state adds its own cue (see `STATE_CUES`), so several
states combine and no state relies on colour alone. Edges are uniform (`belongs_to`; `related_to` would render dashed
if the content ever adds `related_ids`). Filters (areas, states, unanswered, collapse, search) only change what is
drawn. The map starts filtered to the areas picked in Snapshot SNAP_04 ("Show all areas" resets). A list view
carries the same information grouped by area.
