# KINKSYN Neural Node Map — beta specification

**Version:** 0.1.0  
**Status:** proposed implementation spec  
**Meaning:** "Neural" is a visual metaphor for a connected map of interests. It is not a brain model, neural measurement, psychological diagnosis or causal graph.

## 1. What the map represents

A navigable network with three layers:

1. **Domain nodes** — broad areas of the taxonomy.
2. **Concept nodes** — specific activities, dynamics or experiences.
3. **Relationship edges** — taxonomy membership and explicit conceptual relationships.

The user's answers decorate concept nodes. They do not create new facts or inferred edges.

## 2. Node types

| Type | Purpose | Visual treatment |
|---|---|---|
| domain | Broad cluster anchor | Larger labeled node |
| concept | Individual activity/concept | Smaller node |
| facet | Optional cross-cutting tag (e.g. sensory, role-based) | Small secondary tag or edge |
| user-note | User-authored note | Never rendered as a public node in beta |

## 3. Answer states and visual encoding

Use a persistent legend and never rely on color alone. Suggested encoding:

| State | Suggested visual cue |
|---|---|
| curious | dotted outer ring |
| fantasy_only | soft violet halo |
| appealing | filled accent / medium opacity |
| want_to_explore | bright outline |
| open_under_conditions | segmented ring |
| tried_before | small experience marker |
| currently_practice | double outline |
| enjoy_or_would_choose_again | small positive dot / secondary ring |
| not_interested | muted outline with minus glyph |
| unfamiliar | question-mark glyph |
| unsure | dashed outline |
| no answer | neutral grey node |

Multiple states can coexist. Combine cues where practical; when space is tight, show a compact multi-state indicator and expose all states in the detail panel. Do not map states onto a single gradient from negative to positive.

Boundary states are not shown as public map colors. A hard limit must never be visually framed as a weakness or low compatibility.

## 4. Edges

Allowed beta edge types:
- `belongs_to`: concept → domain
- `related_to`: concept ↔ concept (only when curated in taxonomy data)
- `tagged_with`: concept → facet

Edge thickness should be uniform in beta. It must not imply intensity, frequency, importance or psychological connection. Do not draw a link merely because two answers share a state.

## 5. Interactions

- Zoom and pan.
- Tap/click node to open detail panel.
- Search by concept name.
- Filter by domain and answer state.
- Toggle unanswered concepts.
- Expand/collapse domain clusters.
- Detail panel: definition, domain, answer states, directions, experience (if supplied), conditions (if supplied), edit answer.
- Provide a list/table alternative for accessibility and users who dislike graph navigation.
- On mobile, use tap-to-open details and avoid hover-only behavior.

## 6. Graph construction

Input:
- taxonomy `domains[]`, `concepts[]`, `edges[]`
- profile `responses[]`

Algorithm:
1. Create all domain and concept nodes from taxonomy.
2. Add taxonomy edges.
3. Index responses by `concept_id`.
4. Decorate each concept node with its exact stored relationship states.
5. If no response exists, set `answer_status = "unanswered"`.
6. Apply filters to the rendered view only; never delete or mutate answer records.
7. Recompute on answer edits.

Do not use a force-layout algorithm's final position as a semantic claim. Layout is a navigation aid.

## 7. Example node view model

```json
{
  "id": "ACT_BONDAGE_RESTRAINT",
  "type": "concept",
  "label": "Bondage and restraint",
  "domain_ids": ["DOM_BONDAGE_RESTRAINT"],
  "answer_status": "answered",
  "relationship_states": ["curious", "want_to_explore"],
  "action_directions": ["receiving", "co_creating"],
  "is_private": true
}
```

## 8. Privacy

- The graph is private by default.
- Never expose private boundary status or notes in graph tooltips, public exports or sharing previews.
- Never put profile answers into URL state.
- No external graph analytics or third-party telemetry containing node/answer IDs unless explicitly reviewed.
- A screenshot/export should warn the user if it includes sensitive answers.
- For beta, no share button is required.

## 9. Acceptance tests

- Unanswered concept renders neutral.
- Multiple states render simultaneously.
- Editing a response updates node styling without changing taxonomy.
- Removing a response returns node to neutral.
- Filtering never changes stored data.
- A concept linked to multiple domains appears once with multiple domain links.
- Boundary notes are not present in graph node data.
- All graph information is available in an accessible list alternative.
- No graph metric is labelled as desire intensity, kinkiness, compatibility or psychological trait.

## 10. Later research

Test whether users understand the map as a self-authored exploration aid. Conduct usability interviews before adding inferred connections, recommendation algorithms, partner overlays or any form of scoring.
