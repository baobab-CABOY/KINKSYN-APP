// Beta presentation config + PROVISIONAL option lists for concept fields that the content JSON names but does not define.
// Owner review needed: these lists are placeholders for the beta (see docs/BACKLOG.md).
// Content (domains, concepts, states, questions) lives in js/data/questionnaire-beta-v1.json — not here.

export const TIME_CONTEXT_OPTIONS = [
  { id: 'unspecified', label: 'Not specified' },
  { id: 'past', label: 'Mostly in the past' },
  { id: 'current', label: 'Right now' },
  { id: 'future', label: 'Maybe in the future' },
  { id: 'current_and_future', label: 'Now and going forward' }
];

export const EXPERIENCE_OPTIONS = [
  { id: 'not_answered', label: 'Not answered' },
  { id: 'none', label: 'No experience' },
  { id: 'a_little', label: 'A little' },
  { id: 'some', label: 'Some' },
  { id: 'a_lot', label: 'A lot' },
  { id: 'prefer_not_to_say', label: 'Prefer not to say' }
];

// null = not answered. Only meaningful when there is some experience.
export const ENJOYMENT_OPTIONS = [
  { id: 'enjoyed', label: 'Enjoyed it' },
  { id: 'mixed', label: 'Mixed' },
  { id: 'did_not_enjoy', label: "Didn't enjoy it" },
  { id: 'depends', label: 'Depends' },
  { id: 'prefer_not_to_say', label: 'Prefer not to say' }
];

export const CONDITION_OPTIONS = [
  { id: 'trusted_person', label: 'With someone I trust' },
  { id: 'talk_first', label: 'After talking it through' },
  { id: 'start_gently', label: 'Starting gently' },
  { id: 'more_knowledge', label: 'After learning more' },
  { id: 'private_setting', label: 'In a private setting' },
  { id: 'right_mood', label: 'In the right mood or context' },
  { id: 'other', label: 'Other' }
];

// Private boundary status for a concept. Stored ONLY in betaPrivate; never in graph data.
export const BOUNDARY_STATUS_OPTIONS = [
  { id: 'not_disclosed', label: 'No private note' },
  { id: 'hard_limit', label: 'Hard limit' },
  { id: 'conditional_limit', label: 'Conditional / context-dependent limit' },
  { id: 'discuss_first', label: 'Need to discuss first' },
  { id: 'unsure', label: "Unsure — I'm still thinking" }
];

// One colour per domain (presentation only; carries no meaning about the answers).
export const DOMAIN_COLORS = {
  DOM_POWER_EXCHANGE: '#a855f7',
  DOM_SENSATION_IMPACT: '#f43f5e',
  DOM_BONDAGE_RESTRAINT: '#8b5cf6',
  DOM_ROLEPLAY_PERSONA: '#e879f9',
  DOM_FETISH_SENSORY: '#f59e0b',
  DOM_OBSERVATION_PERFORMANCE: '#fb923c',
  DOM_PSYCHOLOGICAL_EMOTIONAL: '#38bdf8',
  DOM_EROTIC_INTIMACY: '#f472b6',
  DOM_LIFESTYLE_RELATIONSHIPS: '#34d399',
  DOM_COMMUNITY_SOCIAL: '#a3e635',
  DOM_COMMUNICATION_CARE: '#2dd4bf'
};

// Visual cue per relationship state (spec §3). Never a gradient; every cue also has a text description.
export const STATE_CUES = {
  curious: 'dotted outer ring',
  fantasy_only: 'soft violet halo',
  appealing: 'filled with the domain colour',
  want_to_explore: 'bright white outline',
  open_under_conditions: 'segmented ring',
  tried_before: 'small square marker',
  currently_practice: 'double outline',
  enjoy_or_would_choose_again: 'small dot marker',
  not_interested: 'muted outline with − sign',
  unfamiliar: '? sign',
  unsure: 'dashed ring',
  prefer_not_to_answer: 'small hollow diamond'
};

// Combinations to clarify with the user — never auto-resolved (brief: "Contradictory combinations").
export const STATE_CONFLICTS = [
  { a: 'not_interested', b: ['curious', 'appealing', 'want_to_explore', 'currently_practice', 'enjoy_or_would_choose_again'] },
  { a: 'unfamiliar', b: ['tried_before', 'currently_practice'] },
  { a: 'prefer_not_to_answer', b: ['*'] }
];

// Private boundary statuses that may conflict with eager states (checked only inside the private editor).
export const BOUNDARY_CONFLICTS = {
  hard_limit: ['want_to_explore', 'appealing', 'curious', 'currently_practice']
};
