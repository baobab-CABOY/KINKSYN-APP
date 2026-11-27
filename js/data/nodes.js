// Graph node content: Desire Core, 7 drivers, 10 activities (pathways). Pure data.
import { app } from '../app.js';

export const CORE_NODE = {
  id: 'core',
  label: 'Desire Core',
  shortLabel: 'Desire Core',
  type: 'core',
  color: '#f3e8ff',
  rgb: '216, 180, 254',
  definition: 'Your Desire Core integrates nervous-system safety, attachment needs, stress recovery, and erotic curiosity into a unified somatic compass.',
  possibleDrivers: [
    'Nervous System Regulation: Balancing sympathetic excitement (dopamine/adrenaline) with parasympathetic safety (oxytocin/endorphins).',
    'Dual-Control Erotic Balance: Amplifying accelerators while softening everyday stress brakes.',
    'Whole-Person Integration: Treating kink and intimacy as collaborative play rather than performance.'
  ],
  scenes: {
    starter: '2/10 Starter: Spend 10 minutes sharing your top 2 lit drivers and your post-intimacy aftercare needs—with zero obligation to act tonight.',
    deeper: 'Deeper Exploration: Co-design a 45-minute "Three-Act Scene" pairing your top psychological driver with a sensory pathway and a 15-minute grounding ritual.',
    aftercare: 'Tend to physical grounding (water, warmth, light snack) and relational reassurance (quiet holding or verbal warmth).'
  },
  resources: [
    { title: 'The Erotic Mind: Unlocking the Inner Sources of Passion', author: 'Jack Morin, PhD (Book)', note: 'Foundational research on Core Erotic Themes and relational intimacy.' },
    { title: 'Come As You Are: The Surprising New Science of Sexual Wellbeing', author: 'Emily Nagoski, PhD (Book)', note: 'Essential guide to Dual Control Model accelerators, brakes, and stress completion.' },
    { title: 'SM 101: A Realistic Introduction', author: 'Jay Wiseman (Book)', note: 'Classic manual on risk-aware negotiation, communication, and somatic safety.' }
  ]
};

export const DRIVERS = {
  surrender: {
    id: 'surrender',
    label: 'Surrender & Offloading',
    shortLabel: 'Surrender',
    type: 'driver',
    color: '#a855f7',
    rgb: '168, 85, 247',
    definition: 'The psychological relief and erotic charge of releasing executive control and decision fatigue into trusted hands—or holding steady, protective containment.',
    possibleDrivers: [
      'Executive Fatigue Relief (Receiving): High-responsibility adults often crave a sanctuary where they do not have to plan or manage.',
      'Steady Containment (Giving): Finding grounded calm and focus in pacing, structuring, and holding space for a partner.',
      'Transient Hypofrontality: Quieting the inner critic so bodily presence and trust can surface.'
    ],
    scenes: {
      starter: '2/10 Starter: A 15-minute "No Decisions" agreement where the Giving partner chooses music, lighting, and touch while the Receiver focuses on breathing.',
      deeper: 'Deeper Exploration: Blindfolded wrist-restraint paired with unhurried pacing where the Receiver asks permission before shifting posture.',
      aftercare: 'Quiet physical grounding, warm tea or water, and zero immediate logistical questions.'
    },
    resources: [
      { title: 'The New Bottoming Book', author: 'Dossie Easton & Janet W. Hardy (Book)', note: 'Classic exploration of active surrender, subspace, and intentional vulnerability.' },
      { title: 'The New Topping Book', author: 'Dossie Easton & Janet W. Hardy (Book)', note: 'Deep dive into holding space, pacing, and ethical leadership.' },
      { title: 'Loving BDSM — Understanding Subspace & Drop', author: 'Kayla Lords & John Brownstone (Guide)', note: 'Practical breakdown of the neurochemistry behind surrender and post-scene care.' }
    ]
  },
  somatic: {
    id: 'somatic',
    label: 'Somatic Intensity',
    shortLabel: 'Somatic',
    type: 'driver',
    color: '#f43f5e',
    rgb: '244, 63, 94',
    definition: 'Using focused physical sensation—thud, sting, pressure, heat, or cold—to anchor awareness sharply in the body and release endorphins.',
    possibleDrivers: [
      'Somatic Anchoring: Strong sensation interrupts mental rumination and anchors present-moment embodiment.',
      'Endorphin & Oxytocin Flow: Gradual intensity transforms sharp physical edge into deep warmth and calm.',
      'Attuned Calibration (Giving): Reading micro-cues in breath and skin to surf a partner’s exact threshold.'
    ],
    scenes: {
      starter: '2/10 Starter: Contrast temperature play using an ice cube followed immediately by warm breath and firm palm pressure.',
      deeper: 'Deeper Exploration: A 20-minute rhythmic percussion session building from open-hand warm-up to a soft suede flogger with 1–10 check-ins.',
      aftercare: 'Skin-to-skin warmth, hydration, a light snack, and calm stillness as endorphins settle.'
    },
    resources: [
      { title: 'SM 101: Warm-Up, Percussion & Safety', author: 'Jay Wiseman (Book)', note: 'Anatomy-informed classic covering safe target zones and warm-up curves.' },
      { title: 'Playing Well With Others', author: 'Lee Harrington & Mollena Williams (Book)', note: 'Modern guide to sensation play, scene pacing, and community wisdom.' },
      { title: 'Evie Lupine — Sensation & Impact Play 101', author: 'Evie Lupine (Video Series)', note: 'Consent-focused breakdowns of thud vs. sting and progressive warm-ups.' }
    ]
  },
  devotion: {
    id: 'devotion',
    label: 'Devotion & Ritual',
    shortLabel: 'Devotion',
    type: 'driver',
    color: '#38bdf8',
    rgb: '56, 189, 248',
    definition: 'Channeling erotic energy through intentional structure, acts of service, reverence, and clear rituals that elevate intimacy above daily routine.',
    possibleDrivers: [
      'Predictable Emotional Safety: Clear rituals and agreements remove ambiguity about relational roles.',
      'Purposeful Service: Expressing love through attentive tasks, body worship, and reliability.',
      'Structured Reverence: Experiencing honorifics or posture rituals that affirm mutual devotion.'
    ],
    scenes: {
      starter: '2/10 Starter: A 3-step arrival ritual—removing watches/phones, sharing 60 seconds of eye contact, and stating one intention.',
      deeper: 'Deeper Exploration: A 30-minute uninterrupted body worship and oil massage governed by 3 agreed protocol rules.',
      aftercare: 'Explicit verbal appreciation, gratitude for the devotion shared, and unhurried closeness.'
    },
    resources: [
      { title: 'Power Circuits: Blueprints for Power Exchange', author: 'Raven Kaldera (Book)', note: 'In-depth look at how ritual, protocol, and service sustain D/s dynamics.' },
      { title: 'The Heart of Dominance', author: 'Anton Fulmen (Book)', note: 'Exploration of benevolent authority, devotion, and intentional leadership.' },
      { title: 'Kinkly — Service Submission & Protocol Guide', author: 'Kinkly Editorial (Guide)', note: 'Accessible overview of domestic/erotic service and healthy boundary setting.' }
    ]
  },
  transgression: {
    id: 'transgression',
    label: 'Transgression & Taboo',
    shortLabel: 'Taboo',
    type: 'driver',
    color: '#f59e0b',
    rgb: '245, 158, 11',
    definition: 'The potent erotic charge of stepping outside polite social norms, exploring consensual rule-breaking, or ego-shedding play within a safe container.',
    possibleDrivers: [
      'Shadow Integration: Giving voice to parts of yourself that must stay polite and respectable in daily life.',
      'Dopamine & Adrenaline Contrast: Combining "forbidden" themes with deep mutual trust sharpens arousal.',
      'Fantasy-Safe Catharsis: Exploring taboo themes in imagination or roleplay without real-world harm.'
    ],
    scenes: {
      starter: '2/10 Starter: Share one unedited fantasy in the dark with an explicit "no-judgment, no-obligation-to-enact" agreement.',
      deeper: 'Deeper Exploration: Negotiated dirty talk or consensual rule-breaking paired with an agreed praise reset phrase.',
      aftercare: 'Clear verbal reassurance separating scene play from real-world respect so zero shame lingers.'
    },
    resources: [
      { title: 'Perv: The Sexual Deviant in All of Us', author: 'Jesse Bering, PhD (Book)', note: 'Compassionate, science-backed look at why unconventional desires arise.' },
      { title: 'Tell Me What You Want', author: 'Justin J. Lehmiller, PhD (Book)', note: 'Landmark survey data on taboo fantasies and the gap between fantasy and reality.' },
      { title: 'Scarleteen — Fantasy vs. Reality & Consensual Taboo Play', author: 'Heather Corinna (Guide)', note: 'Clear framework for understanding taboo arousal without shame.' }
    ]
  },
  primal: {
    id: 'primal',
    label: 'Primal & Visceral',
    shortLabel: 'Primal',
    type: 'driver',
    color: '#10b981',
    rgb: '16, 185, 129',
    definition: 'Shedding civilized verbal scripts to engage raw, instinctive bodily momentum—wrestling, chase, biting, gripping, and unfiltered physical hunger.',
    possibleDrivers: [
      'De-Scripting Intimacy: Escaping performance anxiety and over-thinking through full-body physicality.',
      'Sympathetic Discharge: Consensual grappling and resistance release pent-up nervous-system tension.',
      'Non-Verbal Presence: Communicating via breath, grip strength, and body weight rather than words.'
    ],
    scenes: {
      starter: '2/10 Starter: A 5-minute bed grapple where the only goal is pinning each other’s wrists—no talking, just leverage.',
      deeper: 'Deeper Exploration: A negotiated "Hunt & Capture" scene with a tap-out signal, consensual biting, and breath-synchronized pinning.',
      aftercare: 'Chest-to-chest breathing to settle heart rates, water, and checking any tender spots.'
    },
    resources: [
      { title: 'Urban Tantra: Sacred Sex for the Twenty-First Century', author: 'Barbara Carrellas (Book)', note: 'Explores breath, primal sound, and full-body somatic energy.' },
      { title: 'Evie Lupine — What Is Primal Play?', author: 'Evie Lupine (Educational Video)', note: 'Detailed breakdown of primal dynamics, wrestling safety, and non-verbal cues.' },
      { title: 'Loving BDSM — Primal Kink & Negotiating Intensity', author: 'Kayla Lords (Guide)', note: 'Practical tips on tap-outs and boundary setting for high-energy physical play.' }
    ]
  },
  theater: {
    id: 'theater',
    label: 'Theater & The Gaze',
    shortLabel: 'Theater',
    type: 'driver',
    color: '#e879f9',
    rgb: '232, 121, 249',
    definition: 'Using archetypes, role contrast, aesthetics, and the erotic tension of watching or being watched to amplify sexual polarity and storytelling.',
    possibleDrivers: [
      'Erotic Polarity: Heightening tension between complementary personas (strict vs. defiant, composed vs. undone).',
      'Exhibitionist & Voyeuristic Charge: Being seen—or watching a partner lose composure—magnifies arousal.',
      'Identity Play: Stepping into a persona unlocks confidence and creative disinhibition.'
    ],
    scenes: {
      starter: '2/10 Starter: Place a mirror beside the bed and narrate what you see as you touch each other slowly.',
      deeper: 'Deeper Exploration: A 20-minute persona scene anchored by a clear opening cue and an explicit closing "Cut / De-role" signal.',
      aftercare: 'Explicitly "de-roling" (removing props, using real names) to transition smoothly back to everyday warmth.'
    },
    resources: [
      { title: 'Mating in Captivity: Unlocking Erotic Intelligence', author: 'Esther Perel (Book)', note: 'Classic exploration of eroticism, mystery, playfulness, and polarity.' },
      { title: 'Playing on the Edge: Sadomasochism, Risk, and Intimacy', author: 'Staci Newmahr (Book)', note: 'Examination of edgework, framing, and collaborative erotic theater.' },
      { title: 'OMGYes — Psychological Framing & Visual Attention', author: 'OMGYes Research Team (Platform)', note: 'Research-backed insights into mental framing and visual focus.' }
    ]
  },
  nurturance: {
    id: 'nurturance',
    label: 'Nurturance & Care',
    shortLabel: 'Nurturance',
    type: 'driver',
    color: '#2dd4bf',
    rgb: '45, 212, 191',
    definition: 'Finding deep emotional regulation, tenderness, or eroticized attachment in protective caretaking, playful regression ("little" or "pet" space), and soothing guidance.',
    possibleDrivers: [
      'Attachment Safety & Co-Regulation: Experiencing unconditional warmth, soothing touch, and protective containment.',
      'Caregiver Fulfillment (Giving): Deriving deep satisfaction from tending, praising, brushing hair, or guiding rest.',
      'Softening Adult Armor: Letting go of hyper-independence to access playfulness, wonder, and simple praise.'
    ],
    scenes: {
      starter: '2/10 Starter: A 15-minute hair-brushing, warm-towel wash, or cozy blanket wrap with soft, affirming praise.',
      deeper: 'Deeper Exploration: A negotiated Caregiver/Little or Handler/Pet evening with comfort items and clear erotic vs. non-erotic boundaries.',
      aftercare: 'Soft, unhurried transition back to everyday adult conversation with warm drinks and closeness.'
    },
    resources: [
      { title: 'Polysecure: Attachment, Trauma and Consensual Nonmonogamy', author: 'Jessica Fern (Book)', note: 'Essential framework on attachment styles, emotional safety, and co-regulation.' },
      { title: 'Kinkly — Caregiver/Little (CGL) & Pet Play Explained', author: 'Kinkly Editorial (Guide)', note: 'Clear breakdown of regression headspace, boundaries, and caregiver roles.' },
      { title: 'Loving BDSM — Understanding Little Space & Caregiver Dynamics', author: 'Kayla Lords (Podcast/Article)', note: 'Nuanced look at emotional safety, consent, and protective care dynamics.' }
    ]
  }
};

export const ACTIVITIES = [
  {
    id: 'restraint',
    label: 'Bondage & Restraint',
    shortLabel: 'Bondage',
    drivers: ['surrender', 'somatic'],
    toolCategory: 'Soft silk ties, padded Velcro cuffs, or beginner cotton rope + safety shears',
    definition: 'Consensually restricting movement with silk scarves, padded cuffs, rope, or physical pinning to cultivate stillness and heightened sensation.',
    possibleDrivers: [
      'Cognitive Relief: Being unable to adjust removes the urge to "manage" the encounter.',
      'Proprioceptive Pressure: Firm cuff or rope tension calms an anxious nervous system.',
      'Intentional Craft (Giving): Designing secure, comfortable ties requires patience and anatomy awareness.'
    ],
    scenes: {
      starter: '2/10 Starter: Loosely loop a soft silk scarf around wrists overhead for 5 minutes while your partner teases slowly.',
      deeper: 'Deeper Exploration: A 25-minute chest harness or wrist-to-thigh tie paired with blindfolded touch and safety shears nearby.',
      aftercare: 'Check finger/toe circulation, massage wrists and shoulders, and wrap in a warm blanket.'
    },
    resources: [
      { title: 'The Seductive Art of Japanese Bondage', author: 'Midori (Book)', note: 'Gold-standard guide to rope aesthetics, nerve safety, and emotional connection.' },
      { title: 'Two Knotty Boys Showing You the Ropes', author: 'Dan & Lee (Book)', note: 'Step-by-step illustrated manual emphasizing safety and beginner ties.' },
      { title: 'The Duchy — Shibari & Rope Safety Tutorials', author: 'The Duchy (Video Library)', note: 'Renowned instructional resource covering nerve pathways and safe releases.' }
    ]
  },
  {
    id: 'impact',
    label: 'Impact & Percussion',
    shortLabel: 'Impact',
    drivers: ['somatic', 'primal'],
    toolCategory: 'Soft suede flogger, leather paddle, or warm open hands',
    definition: 'Rhythmic striking using hands, paddles, floggers, or crops to generate waves of thuddy warmth or sharp sting.',
    possibleDrivers: [
      'Endorphin Wave: Rhythmic percussion shifts the brain from analytical thinking into a meditative flow state.',
      'Emotional Catharsis: Consensual intensity offers a structured release for stored bodily stress.',
      'Rhythmic Attunement (Giving): Building a steady cadence and reading breathing cues.'
    ],
    scenes: {
      starter: '2/10 Starter: Warm up the glutes and upper thighs with broad, open-hand strokes, pausing every minute for a 1–10 check-in.',
      deeper: 'Deeper Exploration: A 20-minute escalating percussion session alternating heavy flogger thuds with light fingertip tracing.',
      aftercare: 'Apply cool hands or soothing lotion to warm skin, hydrate, and hold close.'
    },
    resources: [
      { title: 'SM 101: Impact & Percussion Anatomy', author: 'Jay Wiseman (Book)', note: 'Safety reference on safe target zones (glutes, upper back) vs. vulnerable areas.' },
      { title: 'Flogging: A Practical Guide', author: 'Joseph W. Bean (Book)', note: 'Manual on stance, wrist mechanics, rhythm, and reading somatic cues.' },
      { title: 'Evie Lupine — Thud vs. Sting & Impact Warm-Ups', author: 'Evie Lupine (Video)', note: 'Practical guide to choosing instruments and pacing intensity safely.' }
    ]
  },
  {
    id: 'sensory',
    label: 'Sensory & Temperature',
    shortLabel: 'Sensory',
    drivers: ['surrender', 'somatic', 'theater'],
    toolCategory: 'Blackout silk blindfold, low-temp soy massage candles, Wartenberg pinwheel & ostrich feather',
    definition: 'Depriving or amplifying specific senses—blindfolds, earplugs, ice, warm wax, feathers, or pinwheels—to magnify micro-sensations.',
    possibleDrivers: [
      'Quieting Visual Self-Consciousness: Removing sight eliminates worry about appearance and deepens bodily focus.',
      'Neural Contrast: Alternating cold, heat, tickle, and firm pressure keeps the nervous system alert.',
      'Curated Surprise (Giving): Orchestrating unpredictable sensory journeys for a blindfolded partner.'
    ],
    scenes: {
      starter: '2/10 Starter: Wear a comfortable blindfold and headphones with ambient music while your partner alternates ice cubes, warm breath, and fingertips.',
      deeper: 'Deeper Exploration: Full sensory deprivation (blindfold + ear protection) paired with low-temp soy candle wax drizzle and feather contrast.',
      aftercare: 'Remove blindfold in dim, warm lighting and offer steady eye contact and grounding touch.'
    },
    resources: [
      { title: 'Sensory Play & Deprivation Guide', author: 'Kinkly Editorial (Guide)', note: 'Covers safe wax temperatures, blindfold pacing, and non-verbal check-ins.' },
      { title: 'The New Bottoming Book — Headspace & Sensory Focus', author: 'Dossie Easton & Janet W. Hardy (Book)', note: 'Explores how sensory restriction facilitates deep meditative headspace.' },
      { title: 'Scarleteen — Yes, No, Maybe & Sensory Exploration', author: 'Scarleteen Educators (Guide)', note: 'Beginner-friendly roadmap for low-risk, high-reward sensory experiments.' }
    ]
  },
  {
    id: 'protocol',
    label: 'Power Exchange & Protocol',
    shortLabel: 'Protocol',
    drivers: ['devotion', 'surrender', 'theater'],
    toolCategory: 'Symbolic day-collar or wristband, scene negotiation timer & consent check-in cards',
    definition: 'Consensual authority dynamics (D/s, Top/bottom) structured through agreed rules, honorifics, posture, or decision delegation.',
    possibleDrivers: [
      'Clarity & Containment: Explicit rules replace unspoken social guesswork with clear roles.',
      'Deep Trust & Accountability: Honoring negotiated boundaries builds profound mutual reliability.',
      'Erotic Polarity: The contrast between decisive command and willing compliance amplifies tension.'
    ],
    scenes: {
      starter: '2/10 Starter: Choose 2 simple "Scene Rules" for 30 minutes (e.g., using an honorific and asking permission before touching).',
      deeper: 'Deeper Exploration: An evening of structured protocol with an opening collar cue, posture expectations, and a closing debrief.',
      aftercare: 'Drop titles/protocols at the end of the scene and reconnect as equal partners.'
    },
    resources: [
      { title: 'Power Circuits: Blueprints for Power Exchange', author: 'Raven Kaldera (Book)', note: 'Taxonomy of D/s structures, protocols, and negotiation tools.' },
      { title: 'The Loving Dominant', author: 'John Warren (Book)', note: 'Classic guide emphasizing empathy, ethical leadership, and clear communication.' },
      { title: 'Loving BDSM — Beginner BDSM Protocols', author: 'Kayla Lords & John Brownstone (Guide)', note: 'Actionable examples of simple, sustainable bedroom protocols.' }
    ]
  },
  {
    id: 'service',
    label: 'Service & Worship',
    shortLabel: 'Worship',
    drivers: ['devotion', 'nurturance'],
    toolCategory: 'Warm botanical massage oil, soft kneeling cushion & warm towels',
    definition: 'Expressing erotic devotion through attentive acts of care, body worship, massage, or task fulfillment centered on a partner’s pleasure.',
    possibleDrivers: [
      'Tangible Care: Turning affection into concrete, focused actions that delight a partner.',
      'Performance Pressure Relief: Focusing entirely on worshipping a partner frees you from self-consciousness.',
      'Receiving Unapologetic Attention: Allowing yourself to be tended and admired without rushing to reciprocate.'
    ],
    scenes: {
      starter: '2/10 Starter: A 15-minute slow foot, hand, or back worship session with undivided attention and zero expectation of immediate reciprocation.',
      deeper: 'Deeper Exploration: A ritualized preparation scene—undressing, bathing, oiling, and worshipping your partner’s body.',
      aftercare: 'Shared warmth, mutual appreciation, and verbal acknowledgment of the care shared.'
    },
    resources: [
      { title: 'Service Submission & Body Worship', author: 'Kinkly Editorial (Guide)', note: 'Explores erotic service, domestic service, and healthy boundary setting.' },
      { title: 'Urban Tantra — Reverent Touch & Worship Rituals', author: 'Barbara Carrellas (Book)', note: 'Practical exercises for slow, intentional full-body adoration.' },
      { title: 'The New Topping Book — Receiving Service Gracefully', author: 'Dossie Easton & Janet W. Hardy (Book)', note: 'Advice on how Tops/Dominants hold space for a service-oriented partner.' }
    ]
  },
  {
    id: 'verbal',
    label: 'Verbal Edge & Praise',
    shortLabel: 'Verbal Edge',
    drivers: ['transgression', 'devotion', 'surrender'],
    toolCategory: 'Green/Yellow/Red word-list cards & agreed reset phrase',
    definition: 'Using charged language—ranging from intense praise and commanding dirty talk to consensual degradation—to heighten emotional and erotic arousal.',
    possibleDrivers: [
      'Ego Dissolution: Consensual degradation temporarily strips away perfectionism and social status.',
      'Deep Validation (Praise): Targeted praise melts insecurity and reinforces emotional safety.',
      'Linguistic Transgression: Saying or hearing "forbidden" words triggers a sharp dopaminergic rush.'
    ],
    scenes: {
      starter: '2/10 Starter: Write down 3 "Green Light" phrases you crave hearing and 2 "Red Light" words that are strictly off-limits.',
      deeper: 'Deeper Exploration: High-contrast verbal play alternating commanding dirty talk with grounding praise and a clear verbal safe-word.',
      aftercare: 'Essential verbal reassurance ("You are incredible," "I adore you") after intense verbal edge.'
    },
    resources: [
      { title: 'Tell Me What You Want — The Psychology of Dirty Talk', author: 'Justin J. Lehmiller, PhD (Book)', note: 'Research-backed breakdown of why dirty talk, praise, and humiliation appeal.' },
      { title: 'Kinkly — Consensual Degradation & Verbal Safety', author: 'Kinkly Editorial (Guide)', note: 'Advice on negotiating word lists, avoiding real insecurities, and verbal aftercare.' },
      { title: 'OMGYes — Verbal Communication & Erotic Framing', author: 'OMGYes Research Team (Platform)', note: 'Examples and research on how tone and dirty talk amplify arousal.' }
    ]
  },
  {
    id: 'chase',
    label: 'Primal Hunt & Wrestling',
    shortLabel: 'Primal Play',
    drivers: ['primal', 'somatic'],
    toolCategory: 'Padded mattress space, athletic grip socks & non-verbal tap-out protocol',
    definition: 'Consensual physical struggle, chasing, pinning, biting, and grappling where resistance and conquest fuel raw somatic arousal.',
    possibleDrivers: [
      'Kinesthetic Engagement: Full-body muscular effort releases tension and grounds awareness in physical strength.',
      'Playful Resistance ("Bratting" vs. Taming): Provoking a firm, decisive response creates electric dynamic tension.',
      'Non-Verbal Flow: Replacing polite choreography with instinctual movement.'
    ],
    scenes: {
      starter: '2/10 Starter: Agree on a tap-out signal, then wrestle on the bed to see who can pin the other’s wrists for 10 seconds.',
      deeper: 'Deeper Exploration: A negotiated "Prey & Predator" chase culminating in pinning, consensual biting/gripping, and breathless closeness.',
      aftercare: 'Water, slow chest-to-chest breathing, and checking for any scrapes or bruises.'
    },
    resources: [
      { title: 'Evie Lupine — Primal Play, Wrestling & Safety Signals', author: 'Evie Lupine (Video)', note: 'How to negotiate physical force, tap-outs, and bruising boundaries.' },
      { title: 'Playing Well With Others — High-Energy & Primal Scenes', author: 'Lee Harrington & Mollena Williams (Book)', note: 'Covers somatic intensity, consent cues, and post-adrenaline recovery.' },
      { title: 'Loving BDSM — Bratting, Taming & Primal Dynamics', author: 'Kayla Lords (Guide)', note: 'Explores the interplay between playful defiance and primal pinning.' }
    ]
  },
  {
    id: 'roleplay',
    label: 'Roleplay & Persona',
    shortLabel: 'Roleplay',
    drivers: ['theater', 'transgression'],
    toolCategory: 'Dressing-up attire/props, ambient lighting & explicit "Cut / De-Role" cue',
    definition: 'Stepping into negotiated characters, archetypes, or power contrasts (e.g., Strict Mentor, Strangers at a Bar) to explore facets of identity.',
    possibleDrivers: [
      'Creative Disinhibition: A persona acts as a mask that frees you to express desires your everyday self feels shy about.',
      'Novelty & Polarity: Re-introducing unfamiliarity reignites erotic curiosity in long-term dynamics.',
      'Safe Sandbox: Exploring dramatic scenarios within clear theatrical boundaries.'
    ],
    scenes: {
      starter: '2/10 Starter: Meet in another room pretending to be strangers, using altered names and a 15-minute character prompt.',
      deeper: 'Deeper Exploration: A scripted archetype scene with distinct outfits, lighting cues, and an agreed "Cut / De-role" signal.',
      aftercare: 'Explicit de-roling ritual (removing props, hugging as yourselves) to separate character from real life.'
    },
    resources: [
      { title: 'Mating in Captivity — Erotic Play & Novelty', author: 'Esther Perel (Book)', note: 'Why imagination, role contrast, and novelty sustain desire.' },
      { title: 'Come As You Are — Context & Erotic Framing', author: 'Emily Nagoski, PhD (Book)', note: 'How changing context and mental framing shifts sexual brakes and accelerators.' },
      { title: 'Kinkly — Beginner’s Guide to Erotic Roleplay & De-Roling', author: 'Kinkly Editorial (Guide)', note: 'Frameworks for pitching scenarios without awkwardness and de-roling afterward.' }
    ]
  },
  {
    id: 'voyeur',
    label: 'Exhibitionism & Gaze',
    shortLabel: 'The Gaze',
    drivers: ['theater', 'transgression'],
    toolCategory: 'Full-length bedside mirror, app-controlled discreet vibrator & warm spotlighting',
    definition: 'The erotic charge of being watched, watching a partner, mirror play, or navigating negotiated semi-private secrecy.',
    possibleDrivers: [
      'Heightened Self-Awareness: Knowing you are the object of focused erotic attention magnifies bodily sensation.',
      'Controlled Risk: Discreet public intimacy (e.g., hidden remote toy) sharpens presence.',
      'Visual Appreciation (Voyeurism): Watching a partner surrender to pleasure without needing to intervene immediately.'
    ],
    scenes: {
      starter: '2/10 Starter: Place a mirror beside the bed or sit across the room watching your partner touch themselves under your verbal guidance.',
      deeper: 'Deeper Exploration: Discreet remote-controlled toy play during a quiet dinner date, or consensual photos deleted together afterward.',
      aftercare: 'Return to complete privacy, confirm digital privacy boundaries, and decompress calmly.'
    },
    resources: [
      { title: 'Tell Me What You Want — Voyeurism & Exhibitionism Data', author: 'Justin J. Lehmiller, PhD (Book)', note: 'Insights into why watching and being watched rank among top human fantasies.' },
      { title: 'Scarleteen — Consent, Privacy & Public Boundaries', author: 'Scarleteen Educators (Guide)', note: 'Reminder on keeping all exhibitionist play strictly consensual for bystanders.' },
      { title: 'OMGYes — Visual Focus & Being Watched', author: 'OMGYes Research Team (Platform)', note: 'Research on how visual attention and anticipation heighten arousal.' }
    ]
  },
  {
    id: 'caretaking',
    label: 'Caretaking & Regression',
    shortLabel: 'Caretaking',
    drivers: ['nurturance', 'devotion', 'surrender'],
    toolCategory: 'Weighted fleece blanket, soft collar/ears, herbal tea kit & hairbrush',
    definition: 'Consensual nurturing dynamics—such as Caregiver/Little (CGL) or Handler/Pet play—centered on soothing protection, playful regression, and comfort.',
    possibleDrivers: [
      'Nervous System Co-Regulation: Gentle guidance, praise, and physical care rapidly down-regulate chronic stress.',
      'Freedom from Adult Armor: Stepping into playful "pet" or "little" headspace bypasses adult performance pressure.',
      'Protective Devotion (Giving): Experiencing deep tenderness and purpose while tending to a partner’s comfort.'
    ],
    scenes: {
      starter: '2/10 Starter: A 20-minute cozy wind-down where one partner acts as gentle Caregiver—brushing hair, offering a warm drink, and offering soft praise.',
      deeper: 'Deeper Exploration: A negotiated Pet Play or Caregiver/Little evening with comfort props, non-verbal signals, and clear erotic vs. non-erotic boundaries.',
      aftercare: 'Gradual, unhurried return to everyday adult mode with warm reassurance.'
    },
    resources: [
      { title: 'Polysecure — Co-Regulation & Attachment Safety', author: 'Jessica Fern (Book)', note: 'How secure attachment behaviors soothe the nervous system during vulnerable play.' },
      { title: 'Kinkly — Pet Play & Headspace Guide', author: 'Kinkly Editorial (Guide)', note: 'Explanation of puppy/kitten headspace, collars, and non-verbal communication.' },
      { title: 'Loving BDSM — Caregiver/Little Dynamics & Consent', author: 'Kayla Lords (Guide)', note: 'Discussion on boundaries, emotional safety, and avoiding shame in regression play.' }
    ]
  }
];

export const ALL_NODES_MAP = {
  core: CORE_NODE,
  ...DRIVERS,
  ...Object.fromEntries(ACTIVITIES.map(a => [a.id, a]))
};
