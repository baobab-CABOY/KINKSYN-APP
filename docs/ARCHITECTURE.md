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
