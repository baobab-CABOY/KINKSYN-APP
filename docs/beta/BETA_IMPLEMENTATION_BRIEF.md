# KINKSYN beta implementation brief

**Version:** 0.1.0  
**Status:** Beta handoff proposal — implementation may proceed behind a beta flag; not a validated instrument.  
**Audience:** Claude / app implementer  
**Source of truth:** the accompanying `BETA_QUESTIONNAIRES.json` and `NEURAL_NODE_MAP_SPEC.md`.

## Goal

Ship a useful first beta with two connected self-reflection paths and one living visual map:

1. **Snapshot** — a welcoming 4–6 minute first pass.
2. **Deep Map** — a longer, modular 15–25 minute exploration that extends Snapshot answers.
3. **Neural Node Map** — an interactive network visualization of concepts and the user's explicitly reported relationship to them.

Do not wait for psychometric validation to ship a clearly labelled private reflection beta. Do not describe it as scientifically validated, diagnostic, a compatibility test or a measure of how kinky someone is.

## Implementation priorities

### P0 — must work
- Adult-only entry confirmation (18+).
- Snapshot and Deep Map are separately accessible; Deep Map reuses Snapshot answers.
- Every question can be skipped unless explicitly marked essential for basic app operation.
- Answers can be changed later; users can pause/resume.
- Store multiple relationship states, not one overloaded score.
- Build the node map from taxonomy IDs plus explicit user answers.
- A node with no answer is visually neutral/unknown, never interpreted as a negative.
- Private-by-default answers; no partner/community sharing in this beta.
- Provide reset/delete and JSON export if feasible in current app architecture.
- Responsive layout and keyboard-accessible controls.

### P1 — desirable
- Progress indicator and estimated time.
- Filters on the map (domains, curiosity, fantasy, experience, exploration interest).
- Search concepts.
- Expand/collapse domain clusters.
- User-authored notes on a concept, optional.
- Save progress between sessions.

### P2 — later
- Account sync, sharing, partner matching, recommendations, AI interpretation, translations, analytics, validated subscales.

## Questionnaire UX

### Snapshot
A compact flow:
1. Welcome, age gate, privacy explanation.
2. Purpose (multi-select).
3. Familiarity.
4. Optional self-description.
5. Select domains to explore.
6. For selected domains, choose relationship states.
7. Optional direction/role orientation.
8. Optional meaning/experience themes.
9. What the user wants next.
10. Review and save.

Do not force users to answer every domain. Snapshot should produce a useful map even when only a few answers are provided.

### Deep Map
Use modules, not one endless form:
- Self-description and meaning
- Domain/activity inventory
- Fantasy, curiosity and desire
- Direction and roles
- Context and conditions
- Experience and learning
- Communication and care
- Optional private boundaries notebook
- Community and exploration

For beta, use the activity library supplied in the JSON. Show concepts grouped by domain; allow users to answer selected concepts and skip the rest. The boundary notebook should be hidden behind a clear optional privacy explanation and must not be shared.

## Shared response model

Each answer is a record keyed by `concept_id` and user/profile ID (or local profile key). Suggested shape:

```json
{
  "concept_id": "ACT_POWER_EXCHANGE",
  "relationship_states": ["curious", "fantasy_only"],
  "action_directions": ["receiving"],
  "time_context": "current_and_future",
  "experience": "not_answered",
  "enjoyment": null,
  "conditions": [],
  "note": null,
  "boundary": {
    "status": "not_disclosed",
    "details": null,
    "shareable": false
  },
  "updated_at": "ISO-8601",
  "item_version": "1.0"
}
```

Do not use a single 1–5 scale as the source of truth. Relationship states are multi-select and non-ordinal. Valid examples:
- curious + fantasy_only
- tried_before + not_interested_now
- experienced + enjoy_or_would_choose_again
- appealing + open_under_conditions

If contradictory states occur for the same concept (for example, `hard_limit` and `want_to_explore`), do not silently resolve them. Ask the user whether the answers refer to different contexts or whether one should be changed.

## Neural node map

Read `NEURAL_NODE_MAP_SPEC.md`. Render a force-directed graph or equivalent interactive network:
- Domain nodes = large cluster anchors.
- Activity/concept nodes = smaller nodes linked to their parent domains and any additional taxonomy facets.
- User answer states = visual styling on the concept node (color/shape/ring/halo); use a legend and accessible text labels.
- No answer = neutral node.
- Edges represent taxonomy relationships only, not psychological causation or strength of desire.
- Node size should not encode intensity or worth. If size indicates number of linked concepts, label that meaning.

Suggested interaction: click/tap a node to open a side panel with its definition, answer states, edit action and linked concepts. Never reveal private boundary notes on the map by default.

## Privacy and safety requirements

- Keep profile data private by default.
- Do not put answers, notes or boundaries in URLs, query strings, analytics events or logs.
- Do not collect identifiable intimate profiles in the research repository.
- Boundary details are highly sensitive and must be isolated from shareable interest data.
- Do not imply that a questionnaire answer is consent to an activity.
- Do not infer trauma, pathology, identity, competence, safety, compatibility or relationship suitability.
- Do not create a global score, percentile, archetype or leaderboard.
- Explain actual storage and deletion behavior accurately. Do not claim encryption unless the implementation has been verified.
- Do not implement partner sharing or matching in this beta.

## Acceptance checklist

- [ ] 18+ confirmation is required before entering the questionnaire.
- [ ] Snapshot can be completed in any partial form and produces a map.
- [ ] Deep Map extends existing answers rather than overwriting Snapshot.
- [ ] Answers can have multiple relationship states.
- [ ] "Not answered" is distinct from "not interested".
- [ ] User can edit and clear an answer.
- [ ] Graph contains taxonomy nodes even when unanswered, shown neutrally.
- [ ] Graph nodes open a concept detail panel.
- [ ] Filters do not mutate stored answers.
- [ ] Boundary data is private and not used in visual scores.
- [ ] No total kinkiness score or deterministic type is displayed.
- [ ] Mobile and desktop layouts are usable.
- [ ] Export/delete behavior is tested and described honestly.

## Suggested implementation sequence

1. Inspect current app and report its framework, routes, data storage, existing questionnaire and visualization components.
2. Preserve current working features; avoid a wholesale rewrite.
3. Import the JSON as versioned content/configuration, not hardcoded UI copy scattered through components.
4. Implement shared response storage and migration-safe IDs.
5. Implement Snapshot.
6. Implement Deep Map with progressive disclosure.
7. Implement graph from taxonomy + answers.
8. Add privacy controls, export/delete and accessibility.
9. Test with synthetic profiles only; do not use real intimate profile data in development fixtures.
10. Report changed files, tests, known gaps and any storage/privacy limitations.

## Explicitly out of scope for this beta

- Scientific validation claims
- Compatibility percentages
- Partner profile comparison
- Public profiles or community discovery
- AI diagnosis or psychological interpretation
- Automatic consent inference
- Recommendations for high-risk activities
- Automated sharing of boundaries
- Predicting a person's identity from answers

## Open decisions for later iteration

- Final taxonomy labels and translations.
- Exact activity coverage and definitions.
- Whether users need a distinct "appealing" versus "want to explore" distinction after beta interviews.
- Graph layout and visual encoding based on usability testing.
- Sync/authentication and security architecture.
- Community review and cognitive interviews.
