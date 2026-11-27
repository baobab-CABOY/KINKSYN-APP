// Quiz content: chapters, quick-pulse subset, 24 questions, resonance options. Pure data.
export const CHAPTERS = [
  { id: 0, short: 'I. Nervous System', title: 'Chapter I: Nervous System & Intimacy Baseline', subtitle: 'How stress, sensory sensitivity, attachment, and pacing shape your readiness for intimacy.' },
  { id: 1, short: 'II. Core Drivers', title: 'Chapter II: Core Psychological Drivers ("The Why")', subtitle: 'Uncovering the emotional and neurochemical needs beneath erotic attraction.' },
  { id: 2, short: 'III. Somatic & Power', title: 'Chapter III: Somatic, Sensory & Power Pathways', subtitle: 'Exploring physical sensation, restraint, ritual, and consensual authority.' },
  { id: 3, short: 'IV. Theater & Care', title: 'Chapter IV: Relational Theater, Gaze & Nurturance', subtitle: 'Exploring persona, being seen, playful defiance, and protective aftercare.' }
];

export const QUICK_PULSE_IDS = [
  'q1',  // Surrender & cognitive offloading baseline
  'q5',  // Surrender & restraint polarity
  'q6',  // Somatic intensity & impact
  'q7',  // Devotion, ritual & worship
  'q12', // Bondage & stillness pathway
  'q14', // Sensory & temperature pathway
  'q15', // Power exchange & protocol pathway
  'q19', // Primal hunt, wrestling & pinning
  'q21', // Exhibitionism, gaze & taboo
  'q23'  // Caretaking, regression & aftercare
];

export const QUESTIONS = [
  {
    id: 'q1',
    chapter: 0,
    tag: 'BASELINE // COGNITIVE LOAD',
    scenario: 'When your daily life is heavy with leadership, caretaking, or constant problem-solving, stepping into an erotic space where you can turn off executive decision-making feels deeply restorative.',
    prompt: 'How strongly does intimacy serve as cognitive rest for you?',
    hasPolarity: true,
    polarityLabels: ['Receive (Rest & Let Go)', 'Give (Hold & Guide)', 'Switch / Both'],
    weights: { surrender: 0.9, nurturance: 0.35, restraint: 0.3 }
  },
  {
    id: 'q2',
    chapter: 0,
    tag: 'BASELINE // SENSORY THRESHOLD',
    scenario: 'Lowering visual clutter or focusing on a single calibrated sensation helps quiet background noise so your nervous system can settle into present-moment bodily awareness.',
    prompt: 'How responsive is your nervous system to curated sensory focus?',
    hasPolarity: true,
    polarityLabels: ['Receive Sensation', 'Curate Sensation', 'Switch / Both'],
    weights: { sensory: 0.85, somatic: 0.45, surrender: 0.35 }
  },
  {
    id: 'q3',
    chapter: 0,
    tag: 'BASELINE // ATTACHMENT & CONTAINMENT',
    scenario: 'Knowing there is an explicit, judgment-free container—clear boundaries, a safeword, and unhurried reconnection afterward—makes you far more willing to be open and bold.',
    prompt: 'How central are clear structure and emotional containment to your readiness?',
    hasPolarity: false,
    weights: { devotion: 0.65, nurturance: 0.65, protocol: 0.45 }
  },
  {
    id: 'q4',
    chapter: 0,
    tag: 'BASELINE // SOMATIC DISCHARGE',
    scenario: 'When words feel limiting, moving your body with physical momentum—gripping, pushing, breathing hard, or feeling firm resistance—releases tension cleanly.',
    prompt: 'How strongly do you connect with non-verbal physical discharge?',
    hasPolarity: false,
    weights: { primal: 0.85, somatic: 0.65, chase: 0.45 }
  },
  {
    id: 'q5',
    chapter: 1,
    tag: 'DRIVER // SURRENDER & OFFLOADING',
    scenario: 'Your wrists are gently secured above your head while a trusted partner says, "You don’t have to steer anything tonight—just breathe and let me guide the pace."',
    prompt: 'How strongly does this surrender dynamic resonate with you?',
    hasPolarity: true,
    polarityLabels: ['Receive (Sub / Bottom)', 'Give (Dom / Top)', 'Switch / Both'],
    weights: { surrender: 1.0, restraint: 0.75, somatic: 0.2 }
  },
  {
    id: 'q6',
    chapter: 1,
    tag: 'DRIVER // SOMATIC INTENSITY',
    scenario: 'Firm, rhythmic physical sensation—a deliberate palm strike on the thigh, fingernail trace, or firm grip—locks your attention sharply into your body.',
    prompt: 'How do you relate to intense physical sensation?',
    hasPolarity: true,
    polarityLabels: ['Receive (Sub / Bottom)', 'Give (Dom / Top)', 'Switch / Both'],
    weights: { somatic: 1.0, impact: 0.85, primal: 0.3 }
  },
  {
    id: 'q7',
    chapter: 1,
    tag: 'DRIVER // DEVOTION & RITUAL',
    scenario: 'A deliberate arrival ritual—putting phones away, sharing slow eye contact, or offering unhurried body worship—turns an ordinary night into something sacred.',
    prompt: 'How appealing is structured devotion and ritual?',
    hasPolarity: true,
    polarityLabels: ['Receive (Be Worshipped)', 'Give (Serve / Worship)', 'Switch / Both'],
    weights: { devotion: 1.0, service: 0.85, protocol: 0.5 }
  },
  {
    id: 'q8',
    chapter: 1,
    tag: 'DRIVER // TRANSGRESSION & TABOO',
    scenario: 'Exploring ideas that sit outside polite everyday norms—whispering forbidden themes or testing consensual rule-breaking—triggers an unmistakable charge.',
    prompt: 'How strongly does consensual transgression charge you?',
    hasPolarity: true,
    polarityLabels: ['Receive (Sub / Bottom)', 'Give (Dom / Top)', 'Switch / Both'],
    weights: { transgression: 1.0, verbal: 0.55, roleplay: 0.4 }
  },
  {
    id: 'q9',
    chapter: 1,
    tag: 'DRIVER // PRIMAL INSTINCT',
    scenario: 'Dropping polished choreography in favor of raw, physical struggle—grappling for leverage, pinning, and responding to instinctual body cues.',
    prompt: 'How much do you crave unfiltered primal physicality?',
    hasPolarity: false,
    weights: { primal: 1.0, chase: 0.85, somatic: 0.35 }
  },
  {
    id: 'q10',
    chapter: 1,
    tag: 'DRIVER // THEATER & POLARITY',
    scenario: 'Stepping into an intentional role contrast—such as composed authority vs. playful defiance—heightens dramatic tension and erotic curiosity.',
    prompt: 'How much does erotic theater and role polarity excite you?',
    hasPolarity: true,
    polarityLabels: ['Receive / Yielding Role', 'Give / Leading Role', 'Switch / Both'],
    weights: { theater: 1.0, roleplay: 0.85, protocol: 0.3 }
  },
  {
    id: 'q11',
    chapter: 1,
    tag: 'DRIVER // NURTURANCE & CARE',
    scenario: 'Softening adult guardrails completely—being wrapped in a warm blanket, having your hair brushed, or tenderly caring for someone in a gentle, protective headspace.',
    prompt: 'How appealing is nurturing caretaking or soft regression?',
    hasPolarity: true,
    polarityLabels: ['Receive (Soft / Little / Pet)', 'Give (Caregiver / Handler)', 'Switch / Both'],
    weights: { nurturance: 1.0, caretaking: 0.85, devotion: 0.4 }
  },
  {
    id: 'q12',
    chapter: 2,
    tag: 'PATHWAY // BONDAGE & STILLNESS',
    scenario: 'Having wrists or ankles bound with soft rope, silk ties, or padded cuffs so movement is paused—inviting stillness and heightened attention to touch.',
    prompt: 'What is your reaction to physical restraint?',
    hasPolarity: true,
    polarityLabels: ['Receive (Sub / Bottom)', 'Give (Dom / Top)', 'Switch / Both'],
    weights: { restraint: 1.0, surrender: 0.8, somatic: 0.25 }
  },
  {
    id: 'q13',
    chapter: 2,
    tag: 'PATHWAY // IMPACT & THUD',
    scenario: 'Rhythmic impact from hands, a paddle, or a soft suede flogger—building from a warm-up into a steady, grounding endorphin wave.',
    prompt: 'How do you feel about rhythmic impact and percussion?',
    hasPolarity: true,
    polarityLabels: ['Receive (Sub / Bottom)', 'Give (Dom / Top)', 'Switch / Both'],
    weights: { impact: 1.0, somatic: 0.9, primal: 0.25 }
  },
  {
    id: 'q14',
    chapter: 2,
    tag: 'PATHWAY // TEMPERATURE & TEXTURE',
    scenario: 'Warm low-temp candle wax, cool ice cubes, soft feathers, or a light pinwheel contrasting across skin to sharpen sensory awareness.',
    prompt: 'How strongly do temperature and texture contrasts turn you on?',
    hasPolarity: true,
    polarityLabels: ['Receive (Sub / Bottom)', 'Give (Dom / Top)', 'Switch / Both'],
    weights: { sensory: 1.0, somatic: 0.65, surrender: 0.25 }
  },
  {
    id: 'q15',
    chapter: 2,
    tag: 'PATHWAY // POWER EXCHANGE & PROTOCOL',
    scenario: 'Agreed bedroom protocols—asking before touching, using an honorific, or wearing a symbolic collar—that define clear authority and consent.',
    prompt: 'How does structured protocol and power exchange resonate with you?',
    hasPolarity: true,
    polarityLabels: ['Receive (Sub / Bottom)', 'Give (Dom / Top)', 'Switch / Both'],
    weights: { protocol: 1.0, devotion: 0.8, surrender: 0.5 }
  },
  {
    id: 'q16',
    chapter: 2,
    tag: 'PATHWAY // SERVICE & BODY WORSHIP',
    scenario: 'An unhurried session focused on worshipping a partner’s body—or being worshipped yourself—with warm oil and zero rush toward climax.',
    prompt: 'How meaningful is slow, ritualized service and body worship?',
    hasPolarity: true,
    polarityLabels: ['Be Worshipped', 'Worship Partner', 'Switch / Both'],
    weights: { service: 1.0, devotion: 0.85, nurturance: 0.4 }
  },
  {
    id: 'q17',
    chapter: 2,
    tag: 'PATHWAY // VERBAL EDGE (DEGRADATION)',
    scenario: 'Consensual ego-shedding or sharp dirty talk ("Look how completely that got your attention") grounded in explicit trust and mutual respect.',
    prompt: 'Where does consensual verbal edge or degradation sit for you?',
    hasPolarity: true,
    polarityLabels: ['Receive (Sub / Bottom)', 'Give (Dom / Top)', 'Switch / Both'],
    weights: { verbal: 1.0, transgression: 0.9, surrender: 0.3 }
  },
  {
    id: 'q18',
    chapter: 2,
    tag: 'PATHWAY // VERBAL EDGE (PRAISE)',
    scenario: 'Low, intentional praise naming how well you hold your breath, stay open, or guide the moment—melting self-consciousness into warmth.',
    prompt: 'How strongly does targeted verbal praise fuel your arousal?',
    hasPolarity: true,
    polarityLabels: ['Receive Praise', 'Give Praise', 'Switch / Both'],
    weights: { verbal: 0.8, devotion: 0.85, nurturance: 0.6 }
  },
  {
    id: 'q19',
    chapter: 2,
    tag: 'PATHWAY // PRIMAL HUNT & PINNING',
    scenario: 'Playful resistance and physical struggle—chasing, wrestling for leverage, gripping wrists, and pinning with an agreed tap-out signal.',
    prompt: 'How much does consensual wrestling and pinning appeal to you?',
    hasPolarity: true,
    polarityLabels: ['Receive (Prey / Pinned)', 'Give (Predator / Pin)', 'Switch / Both'],
    weights: { chase: 1.0, primal: 0.9, somatic: 0.35 }
  },
  {
    id: 'q20',
    chapter: 3,
    tag: 'THEATER // ARCHETYPE & PERSONA',
    scenario: 'Stepping into negotiated personas—such as meeting as strangers or playing contrasting roles—with a clear opening cue and closing de-role.',
    prompt: 'How much does character roleplay excite you?',
    hasPolarity: true,
    polarityLabels: ['Receive / Yielding Role', 'Give / Leading Role', 'Switch / Both'],
    weights: { roleplay: 1.0, theater: 0.9, transgression: 0.3 }
  },
  {
    id: 'q21',
    chapter: 3,
    tag: 'THEATER // EXHIBITIONISM & THE GAZE',
    scenario: 'Being seen or watching intently—using a bedside mirror, dim window light, or a discreet remote-controlled toy during a private date.',
    prompt: 'How strongly does being watched or discreet risk charge you?',
    hasPolarity: true,
    polarityLabels: ['Be Watched (Exhibition)', 'Watch (Voyeur)', 'Both / Switch'],
    weights: { voyeur: 1.0, theater: 0.85, transgression: 0.75 }
  },
  {
    id: 'q22',
    chapter: 3,
    tag: 'THEATER // PLAYFUL DEFIANCE',
    scenario: 'Teasing or playfully pushing back against a rule with a grin just to invite a firm, grounded response from a trusted partner.',
    prompt: 'How much does playful defiance ("bratting" vs. taming) appeal to you?',
    hasPolarity: true,
    polarityLabels: ['Receive (Brat / Sub)', 'Give (Tamer / Dom)', 'Switch / Both'],
    weights: { primal: 0.65, theater: 0.7, chase: 0.65, protocol: 0.35 }
  },
  {
    id: 'q23',
    chapter: 3,
    tag: 'NURTURANCE // REGRESSION & PET SPACE',
    scenario: 'Curling up in a soft blanket, wearing a gentle collar or pet ears, or entering a quiet, playful "little" or "pet" headspace free of adult pressure.',
    prompt: 'How appealing is playful pet or regression headspace?',
    hasPolarity: true,
    polarityLabels: ['Receive (Little / Pet)', 'Give (Caregiver / Handler)', 'Switch / Both'],
    weights: { caretaking: 1.0, nurturance: 0.9, surrender: 0.4 }
  },
  {
    id: 'q24',
    chapter: 3,
    tag: 'INTEGRATION // RITUAL AFTERCARE',
    scenario: 'Being held quietly after an intense scene while your partner offers water, checks in on your body, and helps your nervous system land softly.',
    prompt: 'How vital is tender, structured aftercare and co-regulation?',
    hasPolarity: true,
    polarityLabels: ['Receive Care', 'Give Care', 'Switch / Both'],
    weights: { nurturance: 0.9, caretaking: 0.65, devotion: 0.55 }
  }
];

export const RESONANCE_OPTIONS = [
  {
    id: 'core',
    label: 'Core Desire / Hell Yes',
    sublabel: 'Primary turn-on · High erotic charge',
    weight: 1.0,
    isFantasy: false,
    badgeClass: 'border-purple-500/70 bg-purple-500/15 text-purple-100',
    dotColor: '#a855f7'
  },
  {
    id: 'curious',
    label: 'Curious / Soft Yes',
    sublabel: 'Open to exploring slowly with trust',
    weight: 0.65,
    isFantasy: false,
    badgeClass: 'border-cyan-500/60 bg-cyan-500/12 text-cyan-100',
    dotColor: '#22d3ee'
  },
  {
    id: 'fantasy',
    label: 'Fantasy Only',
    sublabel: 'Hot in imagination · Keep off the bed',
    weight: 0.55,
    isFantasy: true,
    badgeClass: 'border-amber-500/60 bg-amber-500/12 text-amber-100',
    dotColor: '#f59e0b'
  },
  {
    id: 'neutral',
    label: 'Neutral / No Charge',
    sublabel: 'Indifferent · Neither turned on nor repelled',
    weight: 0.0,
    isFantasy: false,
    badgeClass: 'border-slate-500/60 bg-slate-500/15 text-slate-200',
    dotColor: '#94a3b8'
  },
  {
    id: 'limit',
    label: 'Hard Limit / Off the Table',
    sublabel: 'Not interested in exploring right now — a clear boundary for me',
    weight: -0.8,
    isFantasy: false,
    badgeClass: 'border-rose-800/70 bg-rose-950/35 text-rose-200',
    dotColor: '#f43f5e'
  }
];
