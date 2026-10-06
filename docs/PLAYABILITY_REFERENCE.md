# Playability Reference

## Purpose, assumptions, and boundaries

This is a sourced reference for physical realization, fingering feasibility, and ergonomic comparison on fretted guitar. It supports future deterministic Playability capabilities, coding-agent context, test design, and later AI grounding. **A map of matching notes is not automatically a playable grip. Reference coverage does not establish implemented or promised capabilities.**

The illustrative instrument follows the [Fretboard Reference](FRETBOARD_REFERENCE.md#purpose-assumptions-and-boundaries): six individual strings, one string per course, consecutive chromatic frets intended for 12-TET, and ordinary open or stopped fundamentals. Examples use standard tuning, sounding register, English note names, and middle C = C4. Refer to the **fretting hand** rather than assuming it is the left hand. These are document conventions, not product defaults or universal descriptions of guitars or players.

| Responsibility | What it determines |
| --- | --- |
| Music Theory | Musical identity, registered voicing content, doubling, and context-dependent required or optional tones. |
| Fretboard | Where pitches occur on the stated instrument and the instrument facts relevant to those locations. |
| Playability | Whether a proposed realization satisfies stated physical/contact obligations, and how its demands compare under explicit player, technique, and timing assumptions. |

[Architecture](ARCHITECTURE.md) owns these responsibilities and implementation status; [Decisions](DECISIONS.md) owns accepted project choices; [AGENTS.md](../AGENTS.md) owns working instructions. This document owns sourced explanations and qualified examples. It does not assign ownership of candidate generation, select a search procedure, or establish a minimum implementation guarantee. A candidate may be assessed without deciding which future engine enumerates it.

Keep the following questions separate:

**Musical validity → fretboard availability → contact-assignment validity → simultaneous anatomical/kinematic feasibility → ergonomic assessment → preference.**

This is a reasoning progression, not a required execution pipeline. Passing an incomplete model establishes only its checked conditions. A demonstrated contradiction, an unmodeled technique, and insufficient information are different conclusions; these are not proposed API result types. Failure of one assignment does not prove that every fingering of the voicing fails, nor does unsuccessful search prove human impossibility.

Labels distinguish **definitions**, **anatomical/physical facts**, **biomechanical evidence**, **empirical guitar findings**, **pedagogy**, **model assumptions**, **derived consequences**, **ergonomic judgments**, and **uncertainty/limitations**. Tables inherit nearby qualifications. The primary focus is fretting-hand execution, including sounding, muting, release, and sustain obligations. Detailed picking-hand mechanics, full-body simulation, medical advice, setup instructions, extended-technique models, scoring formulas, software representations, UI, and AI tools are outside scope.

### Contents

- [Terminology](#terminology)
- [Physical realization and contact](#physical-realization-and-contact)
- [Finger assignment](#finger-assignment)
- [Anatomy and coupled movement](#anatomy-and-coupled-movement)
- [Simultaneous chord and grip feasibility](#simultaneous-chord-and-grip-feasibility)
- [Barres and partial barres](#barres-and-partial-barres)
- [Reach, span, and instrument geometry](#reach-span-and-instrument-geometry)
- [Scale and melodic fingering](#scale-and-melodic-fingering)
- [Position shifts and transitions](#position-shifts-and-transitions)
- [Physical feasibility versus ergonomics](#physical-feasibility-versus-ergonomics)
- [Player variability and configurable assumptions](#player-variability-and-configurable-assumptions)
- [Model limitations](#model-limitations)
- [Derived examples and edge cases](#derived-examples-and-edge-cases)
- [Sources and verification](#sources-and-verification)

## Terminology

**Definitions.** The musical terms follow [identity, inversion, and voicing](MUSIC_THEORY_REFERENCE.md#identity-inversion-and-voicing); locations follow [the Fretboard Reference](FRETBOARD_REFERENCE.md#frets-locations-and-range). Execution terms below establish this document's vocabulary, informed by [Berklee's notation guide][berklee-notation] and the distinction between a note sequence and a finger-position sequence in [Heijink and Meulenbroek, pp. 339, 341][heijink]. They are not software types.

| Term | Meaning here |
| --- | --- |
| Chord | Abstract musical object whose identity does not specify one instrument realization. |
| Chord voicing | Concrete selection, register, ordering/distribution, and multiplicity of pitches. The name `ChordVoicing` does not itself assign strings or fingers. |
| Fretboard locations | Identified strings and stopping frets, or open-string locations. A collection may contain alternatives rather than concurrent requirements. |
| Fingering | Physical realization using selected locations, fingers, and relevant contact/movement technique. A melodic fingering unfolds over time. |
| Finger assignment | Which finger is responsible for a specified contact or event; one part of a complete fingering. |
| Grip | A fretting-hand configuration considered at a particular time, usually to support concurrent sounding requirements. |
| Barre / partial barre | One finger stopping multiple strings; a full barre spans all strings of the illustrative guitar, and a partial barre fewer. Specialized terminology is qualified below. |
| Hand position | General location of the hand along the neck; it is not the union of every note in a passage or a precisely measured joint posture. |
| Fret span | A declared measure of the spread of fretted contacts, distinct from distance in millimetres. This document uses the difference of extreme fret numbers. |
| Reach / stretch | Reach concerns attaining or maintaining contacts; stretch describes extending a finger configuration relative to a reference posture. Neither is determined by fret span alone. |
| Position shift | Movement from one hand position to another along the neck. A finger extension need not be a hand-position shift. |
| Physical feasibility | Satisfaction of physical obligations under named assumptions; a model conclusion has only the reach of its model. |
| Contact-assignment validity | Logical compatibility of the assigned stopping, supporting, clearing, and sounding duties within the declared contact model. |
| Anatomical/kinematic feasibility | Existence of one permitted shared hand configuration satisfying all concurrent contact and clearance duties. It does not establish sufficient force or successful movement into that configuration. |
| Ergonomic assessment | Evaluation of movement, posture, effort, or other declared demands relative to an instrument, player, and task. |
| Difficulty / preference | Difficulty concerns execution demands for a player and context; preference additionally reflects habits, expression, and priorities. Neither is a synonym for physical impossibility. |

**Notation convention.** Fretting fingers are 1 index, 2 middle, 3 ring, and 4 little finger; T can indicate thumb fretting. An open string does not require an imaginary finger numbered zero. Some chord diagrams use X for either muting or not playing, which does not specify how silence is achieved. [Fender chord-chart guide][fender-chart]. This reference uses words for those distinctions and does not define a tablature grammar.

## Physical realization and contact

**Physical facts under assumptions.** An ordinary stopped note uses the speaking segment between an effective fret contact and the saddle. A fingertip presses on the nutward side of the named fret; its exact contact position is not the fret crown coordinate. See [instrument endpoints](FRETBOARD_REFERENCE.md#instrument-structure-and-terminology) and [fretted locations](FRETBOARD_REFERENCE.md#frets-locations-and-range). The ideal string has one fundamental for its effective length and tension, together with harmonic modes; this does not make those modes separate independently stopped notes. [UNSW, “Harmonics and modes”][unsw-strings].

**Definitions and derived consequences under that ordinary-string model:**

| Obligation or contact | Consequence for assessment |
| --- | --- |
| Intended sounding note | Specify the registered pitch, location, and interval during which its sound must be maintained when duration matters. A pitch class alone is insufficient. |
| Effective stopping contact | Establishes the speaking segment's neck-side endpoint. Among firm fret stops, the bridgeward stop determines that segment, assuming it functions cleanly. |
| Nutward/supporting contact | May remain behind a higher effective stop or assist another contact; it need not contribute an additional sounding note. Two contacts on one string are not automatically a conflict. |
| Open string | Needs no finger stop, but must remain clear of contacts that would change or damp its intended sound. With a capo, distinguish the effective open endpoint. |
| Muted string | Its pitched ringing is intentionally suppressed; an X alone does not identify a muting technique or prove successful damping. |
| Intentionally unplayed string | It is omitted from the intended excitation. This does not by itself establish muting or the absence of residual/sympathetic ringing. |

The higher-stop consequence follows from the speaking segment, not a rule that every touching finger changes pitch. Ordinary barres with additional fingers at higher frets provide a practical cross-check. [Yamaha, section 6][yamaha-acoustic]. Muting and skipping are distinguished explicitly in [Fender's chart convention][fender-chart]. Light touch, harmonic production, and contacts on the vibrating segment require more information than a string/fret label.

Contact requirements and sound requirements must agree. A note marked open cannot simultaneously be realized by stopping that string at a different pitch. An intended sustained pitch cannot be assumed to continue unchanged after its only effective stop is removed. These are conditional physical consequences; electronic sustain, special techniques, and acoustic transients are not modeled here.

## Finger assignment

**Illustrative model assumption.** To explain logical conflicts, some examples restrict each available fretting finger at an instant to either one ordinary stopping contact or one same-fret barre across a specified contiguous string interval. Supporting contacts may lie behind effective stops. The examples do not model diagonal/hinged contacts, thumb fretting, or assistance from the other hand unless explicitly discussed. This simplified model is an explanatory choice, not a proposed FretboAIrd default or a complete account of anatomy.

**Derived consequences within that model.** Requiring the same finger to occupy two different fret regions concurrently contradicts its allowed contact modes. Assigning one finger to several strings at one fret can instead describe a barre and must not be rejected merely because the finger is repeated. Even then, examine the strings between the outer contacts: an assumed continuous stopping barre cannot leave an intervening required string open. A different, selectively contacting technique would require a different model, not an unexplained exception.

Distinct finger labels also do not prove that the hand can attain their positions. Conversely, assigning multiple supporting fingers behind an effective stop need not be invalid. The exact geometry, available fingers, contact modes, and sound obligations determine what is being claimed.

**Pedagogical convention.** Ordering fingers 1–4 along successive frets organizes positional playing, but the restriction does not follow from their names. Multiple fingers may occupy the same fret on different strings, and assignment order can depend on the grip and surrounding phrase. Position conventions and excursions are illustrated by [Yamaha, section 3][yamaha-acoustic]; alternative fingering choices are discussed by [Berklee][berklee-reading]. A finger-ordering filter must declare its limitations rather than label every exception anatomically impossible.

**Context-dependent practice.** Thumb fretting is recognized by T in some notation. [Fender][fender-chart]. The thumb may also support the neck or mute a string; these are distinct duties. [Fender's thumb-muting discussion][fender-thumb]. A teaching tradition that reserves it for support does not establish universal prohibition, and acknowledging thumb fretting does not establish that every player or instrument can use it. The worked ordinary-grip examples below assign only fingers 1–4.

## Anatomy and coupled movement

**Anatomical facts and modeling distinctions.** Fingers are articulated parts of one connected hand, not independently positioned probes. For fingers 1–4, the MCP (metacarpophalangeal) knuckle connects a metacarpal to the proximal phalanx; PIP and DIP joints connect the proximal, middle, and distal phalanges. Segment lengths and joint-center locations affect reach; thickness, pads, and web spaces affect contact and clearance. The thumb has a CMC (carpometacarpal) base joint, MCP joint, and one IP joint, with two phalanges. Its neck-support, muting, or fretting duties must coexist with those of the fingers. See [Park and Bae, section 2.1 and Figure 1][park-bae] and [Buchholz et al., abstract][buchholz-anthro]. These sources do not supply a selected guitar-hand representation.

Finger bases occupy related locations in the palm. Hand translation and rotation move them together; they cannot each choose a different palm pose. A rigid palm is also a simplification: fourth/fifth metacarpal motion can reshape the palmar arch. [Buffi et al.][buffi] demonstrated this in a model informed by CT measurements of **one subject**. It supports acknowledging palm mobility, not importing those measurements as universal values.

**Movement distinctions.** Flexion/extension bends and straightens a digit; abduction/adduction spreads and brings digits together. MCP motion includes both; PIP/DIP motion is commonly approximated mainly by flexion/extension. Within-finger coordination and restrictions differ from coupling between neighboring digits. A joint diagram's separate axes do not imply that all combinations are usable, or that lateral reach can be increased independently of bending. [Park and Bae, section 2.1][park-bae]; [Gracia-Ibáñez et al., abstract][gracia].

**Biomechanical evidence, bounded to the experiments.** Gracia-Ibáñez et al. found that maximum voluntary MCP flexion and extension depend on neighboring MCP posture. Independent per-joint extrema therefore do not establish a feasible combination. Their fitted regressions are not adopted here: using them quantitatively would require reviewing methods, measurement conditions, and applicability to the player and guitar task. [Gracia-Ibáñez et al.][gracia].

Lang and Schieber compared imposed passive motion with active individuated motion in ten healthy adults. Both mechanical coupling and active control mattered under their tested conditions. Soft-tissue and tendon connections differ from neural coordination demands; difficulty moving one digit without another moving is not by itself a proof that a static grip is impossible. [Abstract, Methods, and discussion of mechanical coupling][lang]. Anatomical dissection of 40 cadaver hands documents extensor tendon interconnections and variation, but does not test guitar chords. [von Schroeder et al., abstract][juncturae].

**Assessment implication.** Declare whether movement is active, passively positioned, loaded, or sustained, and which wrist/forearm postures are allowed. A passively attainable angle need not be actively attainable or maintainable against strings. Wrist posture affected muscle activity during unloaded finger movements in an eleven-participant study; that observation is not a guitar force limit or a separation of all mechanical and neural causes. [Beringer et al., Methods and Discussion][wrist-emg]. Loading, force capacity, and duration need additional evidence; a collection of geometry and unloaded ROM measurements does not supply them.

## Simultaneous chord and grip feasibility

**Conceptual model boundary.** Under a declared player, instrument, and technique model, anatomical/kinematic feasibility requires at least one shared hand configuration that satisfies every concurrent contact obligation, respects the model's coupled movement restrictions, avoids incompatible bodily or instrument penetration, and preserves required sounding-string clearance. This is a necessary condition for physical execution, not a guarantee of adequate force, endurance, transition speed, comfort, or safety.

**For every target, some pose reaches it** does not imply **one pose reaches every target together**. All finger configurations must use the same hand translation and orientation, wrist posture, and permitted arm/instrument relationship. Where a contact requires neck support, that support must also fit. This does not require a full-body simulation or select an implementation: it specifies what a simultaneous claim means. Articulated hand models incorporating segment and surface geometry have precedents, but cylinder-grasp validation is not guitar validation. [Buchholz and Armstrong, abstract][buchholz-model].

**Derived assessment questions.** Start with the actual voicing and concurrent sounding intervals. For a proposed assignment, identify the shared posture, digit configurations, contact surfaces, required clearances, and applicable restrictions that could satisfy them together. A positive claim needs a satisfying configuration or appropriately scoped performance evidence. A negative model claim needs a contradiction excluding its allowed configurations; missing measurements or an unsuccessful search instead leave the conclusion undetermined.

**Contact geometry.** A string/fret label specifies a stopping obligation, not the center of a fingertip. The finger presses within a fret space, nutward of the effective crown. Pad position, contact patch, approach orientation, tissue deformation, and the surface used for a barre affect which strings are stopped or damped. Multiple placements may realize the same location; choosing only one arbitrary point can reject another valid placement. Conversely, individually reachable points do not demonstrate compatible pad surfaces or clearance. The distinction between articulated links and their surrounding contact surfaces is illustrated by [Buchholz and Armstrong][buchholz-model]; ordinary stopping geometry follows the [Fretboard definitions](FRETBOARD_REFERENCE.md#instrument-geometry-for-contact-assessment).

**Three-dimensional exclusion.** Crossing projected lines in a diagram does not establish bodily collision: fingers may pass at different heights or touch without incompatible penetration. Nor does a clear two-dimensional drawing establish clearance of finite finger volumes. Assess the actual configuration, including web spaces, neighboring digits, neck/body surfaces, and required sounding segments. Finger-to-finger contact can be permitted if consistent with the declared technique; an unavoidable obstruction or unintended damping is different. Neither crossing nor lack of crossing is a universal feasibility test.

Duplicated chord tones are not redundant physical instructions. Two required C pitches on different strings may have different registers or require separate unison realizations. Preserving pitch-class membership while dropping one loses information. Whether an omission is musically permitted belongs to the musical request and Music Theory context, not to a Playability rule that silently repairs an awkward grip. See [voicing and omissions](MUSIC_THEORY_REFERENCE.md#identity-inversion-and-voicing) and [information loss](MUSIC_THEORY_REFERENCE.md#collections-and-information-loss).

A strum can stagger attacks while notes continue sounding together. A broken chord can also create overlapping obligations, or permit release before the next note. Therefore, “chord” and “arpeggio” labels alone do not specify which contacts must coexist. The analysis must follow the requested sounding intervals. The example of shortening lower-note durations to facilitate a subsequent note in [Trinity's guitar errata][trinity] illustrates why duration changes the physical task; it is not general permission to shorten notes.

## Barres and partial barres

**Definition and practice.** A barre distributes one finger across several strings. [Berklee][berklee-notation]; [Yamaha, section 6][yamaha-acoustic]. Its extent and its effective sounding responsibilities differ: in an F-major full barre at fret 1, other fingers stop some strings at frets 2 and 3. The lower barre does not create extra simultaneous pitches on those strings.

Here **partial barre** means a barre across fewer than all six strings, including two-string examples. **Terminology variation:** Niedt distinguishes a particular contact that clears a neighboring string on the treble side as an “interior barre,” while noting that his earlier material calls it a partial barre. His specialized usage must not redefine all partial barres as three-string contacts. [Niedt, opening terminology note][niedt].

**Derived assessment questions.** Identify the finger, fret, covered string interval, effective stops, higher-fret overrides, and strings that must remain clear. Same-fret targets alone do not prove a barre possible. Nor does a barre diagram establish uniform pressure, contact on every covered string, force requirements, or comfort. Selective contact, joint configuration, and adjacent-string clearance may need a richer model.

The barre surface must fit in the **same** hand configuration as the other stops and any support contact. Finger curvature, joint posture, pad shape, and the instrument's local surfaces determine actual contact; the line drawn across a chord box describes intended coverage only. If no allowed surface placement can provide the stops and preserve clearance, the barre fails that model. If geometry is compatible but pressure or endurance is unknown, those execution demands remain unresolved. A two-dimensional static guitar model studied C, E, G7, and Am using anthropometry, fingertip forces, and joint angles; its abstract does not establish three-dimensional clearance or validate a particular Am/C assignment. [Sung et al.][sung].

**Context-dependent practice and limitation.** A partial barre may trade fewer independent fingers for different pressure and clearance demands; a smaller covered interval is not automatically easier for every player. Niedt's examples demonstrate why neighboring-string clearance must be specified, but his anatomical and genetic assertions are not adopted as general limits. Thumb, hinge, diagonal, and other specialized realizations remain boundary cases rather than silently supported contact modes.

## Reach, span, and instrument geometry

**Document measurement convention.** Fretted-contact span is the highest minus the lowest fret number among the specified active finger stops. Frets 1 and 5 have span 4, although the inclusive range contains five numbered frets. Include declared supporting stops when measuring the whole grip; a span of only effective sounding stops measures something different. Exclude open, muted-only, and unplayed strings. One occupied fret gives span 0; an all-open realization has no fretted-contact span to measure. These statements do not choose software encodings for absence.

**Derived geometry.** Use [Fretboard's fret-position equation](FRETBOARD_REFERENCE.md#mathematical-and-physical-relationships), independently described by [Mottola][mottola]. For scale length L and frets a < b, crown separation along the ideal string is L × (2^(−a/12) − 2^(−b/12)). This is a difference of instrument coordinates, not fingertip separation or an anatomical reach test.

| Illustrative scale length | Fret pair | Fret-number span | Crown separation, rounded |
| --- | --- | --- | --- |
| 648 mm | 1–5 | 4 | 126.2 mm |
| 648 mm | 13–17 | 4 | 63.1 mm |
| 610 mm | 1–5 | 4 | 118.8 mm |
| 610 mm | 13–17 | 4 | 59.4 mm |

An octave-higher pair has half the separation in this ideal layout. Changing scale length scales these distances. Neither relationship establishes comfort. Cross-string displacement, fingertip placement within fret spaces, finger identities, posture, and access remain unmeasured by this table.

| Assessment claim | Instrument information it consumes |
| --- | --- |
| Longitudinal reach | Measured fret positions, or positions explicitly idealized from scale length; contact placement within each fret space. |
| Simultaneous spatial contacts | String positions and spacing at the relevant neck region; fingerboard/fret surface geometry and boundaries. |
| Clearance and support | String height and diameter where relevant; radius or equivalent measured surface geometry; neck thickness/profile and body/heel access where hand or thumb contact matters. |
| Force demands | Additional string, setup, contact, and loading information. Geometry alone is insufficient. |

Measurement definitions belong to [Fretboard's instrument geometry](FRETBOARD_REFERENCE.md#instrument-geometry-for-contact-assessment). Playability consumes those facts with player and technique assumptions; this is not an instrument schema or rendering geometry. Radius, width, and nominal scale length must not substitute for the more specific geometry on which a conclusion depends. Higher neck positions have smaller ideal fret gaps but may have different access restrictions. Tuning selects locations; it is not an effort metric. No setup prescription follows here.

## Scale and melodic fingering

**Definitions and pedagogical convention.** A melodic fingering attaches locations and execution choices to an ordered pitch sequence. A local-position fingering keeps the hand in one general region; a shifting fingering changes regions. One-finger-per-fret is a teaching organization, not a requirement to keep all four fingers down or to allocate each finger permanently to one fret. Extensions and retractions adjust a finger's placement; string crossings move execution between strings. [Yamaha, section 3][yamaha-acoustic]; [Berklee's positional and diagonal approaches][berklee-reading].

**Derived consequences.** Repeated use of one finger is allowed across different times when release, movement, and renewed contact satisfy the passage. The union of scale locations must not be assessed as one simultaneous grip. At each transition, consider contacts that remain necessary, including sustained accompaniment. A melody over a held bass combines sequential and simultaneous obligations.

Ascending and descending traversal changes preparation and release order, so one direction's fingering need not be preferred in the other. Several fingerings may realize the same registered note sequence. Preserve the note sequence while comparing execution; changes such as the classical ascending/descending melodic-minor convention belong to [Music Theory](MUSIC_THEORY_REFERENCE.md#scales-and-modes), not a Playability transformation.

## Position shifts and transitions

**Derived requirements.** Individually available endpoints do not establish a feasible transition. State what stops sounding, what continues sounding, which fingers become available, whether a supporting or substitute contact preserves a note, and when the next contact must be ready. Distinguish movement time from total note duration: an ongoing obligation can consume part of the interval before the next attack.

Even anatomically feasible configurations at every named instant do not establish a connecting movement. The permitted movement must preserve ongoing stops, clearance, articulation, and support throughout the available time. It may pass through intermediate postures that endpoint checks omit. Release may make two otherwise incompatible obligations sequentially possible; requiring their sustain to overlap restores the simultaneous problem.

Reusing a finger after release differs from demanding it in two places during a sustain overlap. Sliding contact differs from releasing and replacing it, and may change articulation. Open strings can leave the fretting hand available for movement but can also impose clearance and later damping obligations. Without timing and articulation information, a speed-dependent feasibility conclusion is unsupported. Pairwise endpoint checks also cannot certify a whole passage with continuing obligations or cumulative demands.

**Empirical finding, limited population.** Heijink and Meulenbroek studied six male professional classical guitarists performing prescribed single-note sequences at a fixed tempo on one guitar. Hand position, span, and repositioning affected aspects of performance and perceived complexity. This supports treating movement and timing as relevant dimensions, not importing a universal shift penalty or fret-span cutoff. Their movement analysis did not measure a complete force model. [Method, pp. 341–343; Discussion, pp. 348–350][heijink].

**Pedagogical perspective, restricted access.** Iznaola's article places coordinated arm–wrist–hand movement and shifting at the center of its account of extensions, contractions, and barres. This description is supported by the repository abstract; the full article was not accessible during verification. Its detailed procedures, physiological claims, and examples are therefore not adopted here. [Iznaola, abstract and publication notes][iznaola].

**Context-dependent practice.** A printed fingering is guidance for a musical task. Trinity explicitly describes fingerings as suggestions; Berklee discusses multiple locations and phrase-dependent choices. [Trinity][trinity]; [Berklee][berklee-reading]. Minimizing movement alone cannot determine every preferred fingering.

## Physical feasibility versus ergonomics

**Classification under the declared ordinary-contact model:**

| Question | Appropriate interpretation |
| --- | --- |
| Does a requested location exist? | Deterministic instrument validity, supplied by Fretboard; not an anatomical conclusion. |
| Are two independently required stopped fundamentals assigned to one ordinary speaking segment at once? | A structural contradiction under the ordinary-string assumptions. Harmonic modes do not solve the assignment. |
| Does a finger have incompatible concurrent contact obligations? | A contradiction only within the declared contact model; specialized excluded contacts are not disproved. |
| Is a required open/sustained sound defeated by the stated contact or release? | A conflict in the proposed realization unless a compatible alternative support or technique is specified. |
| Does the realization preserve the specified voicing and timing? | Compare with the musical obligations; do not silently discard tones, doublings, or durations. |
| Does a stretch exceed a configured bound? | Deterministic failure of that configuration, not proof of impossibility for all players. |
| Does one shared configuration satisfy declared geometry and coupled movement restrictions? | This establishes the modeled anatomical/kinematic conditions only. Independent finger or joint checks are insufficient. |
| Is penetration, obstruction, or unintended damping unavoidable in every allowed configuration? | A model contradiction, unlike a crossing in a diagram or one failed attempt. |
| Can an allowed barre surface provide all required stops and clearance together? | A geometric condition distinct from adequate pressure or sustained effort. |
| Does an assignment pass all modeled kinematic checks? | Force, endurance, timing, and other omitted execution demands may still be unresolved. |

**Ergonomic and preference assessment**, without selected values or formulas: proximity to movement extremes; longitudinal/transverse spread; coordination and finger independence; number and duration of active contacts; barre pressure and sustained effort; wrist deviation and tendon/force demand; preparation, shifts, and repeated-finger movements; clearance/damping demands; familiarity and expressive priorities. Reduced independence, crossing, or an awkward posture alone must not become binary impossibility. These factors do not constitute a calibrated universal ranking; lower counts do not automatically mean easier execution.

Distinguish a hard restriction within a configured task from a physical law. For example, “no shifts” can be a practice constraint even when a shifting solution is physically feasible. Likewise, a player may prefer a more demanding fingering for phrasing or familiarity. A result labeled feasible under assumptions does not establish comfort, safety, musical usefulness, or preference.

A force-capacity restriction can become a hard model constraint when explicitly supported and configured for the relevant posture, load, and duration. An uncalibrated effort score cannot supply that restriction. Similarly, a declared unavailable digit or prohibited technique can exclude an assignment without establishing a limit for other players or tasks.

## Player variability and configurable assumptions

**Empirical finding and limitation.** Portnoy et al. compared sitting and standing guitar playing in 25 experienced players, 22 of them men. They examined posture and reported symptoms, not universal fingering limits. The study's small, selected sample and laboratory setting limit generalization; it excluded players using reversed left-handed instruments. Its correlations do not supply causal injury predictions, comfortable-span thresholds, or a representative “average guitarist.” [Methods, sections 2.1–2.3; Discussion limitations][portnoy].

**Assessment context, not a profile schema.** Relevant questions include available fingers and hand size, finger lengths and usable movement, strength and endurance, coordination/independence, experience with the technique, playing posture, current fatigue, and injury/disability or adaptations. Do not infer one of these from another: a hand-size measurement does not establish technique, pain, or ability. Missing player information stays unspecified rather than becoming an invented population norm.

For a geometric claim, distinguish hand/base dimensions, individual segment lengths, digit thickness and pads, usable **combinations** of movement, and technique allowances or mobility restrictions. External hand length predicts some anatomical dimensions imperfectly; it is not a complete set of joint centers or segment measurements. [Buchholz et al.][buchholz-anthro]. A study measuring active ROM in 195 volunteers (390 hands) illustrates sample variability and measurement conventions. Its marginal joint measurements do not provide universal limits or a simultaneously attainable set of extremes. [Mohamed Ibrahim et al., Methods and Results][rom].

Any later configurable assumption needs a stated purpose, provenance, and applicability. A player's chosen restriction differs from a measured capability and from a pedagogical exercise. Injury/disability may change available techniques or resources; this reference neither diagnoses a condition nor predicts an individual's ability from a label. The four-finger examples describe an illustrative resource set, not a requirement every guitarist must satisfy.

## Model limitations

Location labels and finger numbers do not capture the shared anatomy described here. This reference explains requirements for an anatomical/kinematic claim but supplies no validated human-hand solver, player calibration, or force model. Its explicit geometric constructions establish only their stated idealizations. A contact-coherent grip is not a guarantee that every required note will ring cleanly; even kinematic feasibility leaves force distribution, string deflection, endurance, and both-hand coordination to further assessment. An all-open example avoids finger stopping but still requires excitation and sound control.

The core examples do not model bends, vibrato, natural/artificial harmonics, slide, tapping, diagonal/hinged barres, partial capos, multiscale layouts, paired courses, or assistance from the other hand. Mentioning these boundaries does not declare them invalid. Thumb fretting requires an explicitly expanded technique/resource assumption. The full-capo boundary uses the existing [Fretboard treatment](FRETBOARD_REFERENCE.md#capos) without generalizing to all capo mechanics.

Research cited here does not justify a universal maximum comfortable fret span, finger-independence matrix, force limit, shift speed, or difficulty formula. Missing evidence is not proof that a factor is irrelevant. Candidate-generation ownership, supported techniques/instruments, minimum guarantees, representations, and calibration remain [open architectural questions](ARCHITECTURE.md#open-architectural-questions).

## Derived examples and edge cases

**Example conventions.** All cases use standard E2–A2–D3–G3–B3–E4 tuning on strings 6→1, sufficient ordinary frets, and no capo unless stated. A string/fret pair such as (5,3) means string 5, fret 3; “open” means no finger stop. Chord rows list final sounding frets in string order 6→1; “omit” identifies an unplayed string, not a proven muting technique. Finger lists name effective stopping duties unless extra support is stated. These are original derivations using [Fretboard pitch mapping](FRETBOARD_REFERENCE.md#mathematical-and-physical-relationships), the [chord definitions](MUSIC_THEORY_REFERENCE.md#construction-and-spelling), and the contact model above, not a verified library of human-performance guarantees.

### Chords and assignments

Each row requires the listed pitches to sound concurrently while their effective stops are maintained. No attack speed, required holding duration, or force threshold is inferred.

Here “coherent” means **contact-assignment validity**, not demonstrated anatomical feasibility. Familiar chord names or diagrams do not add missing player measurements. The separately sourced comparison below provides pedagogical evidence, with its limits stated.

| Case | Locations, sounding pitches, and assignment | What follows |
| --- | --- | --- |
| Open-position C major | Frets: omit, 3, 2, open, 1, open. Pitches: C3–E3–G3–C4–E4. Fingers 3 at (5,3), 2 at (4,2), 1 at (2,1). | A coherent ordinary assignment if required strings remain clear. Repeated C/E pitch classes retain their registers; string 6 is not silently added. |
| Full-barre F major | Frets: 1, 3, 3, 2, 1, 1. Pitches: F2–C3–F3–A3–C4–F4. Finger 1 barres strings 6–1 at fret 1; fingers 3, 4, 2 stop (5,3), (4,3), (3,2). | Six notes use four fingers. Higher stops override the lower barre on strings 5, 4, 3. Barre effort remains unquantified. |
| Partial-barre F major | Frets: omit, omit, 3, 2, 1, 1. Pitches: F3–A3–C4–F4. Fingers 3 and 2 stop (4,3), (3,2); finger 1 barres strings 2–1 at fret 1. | A two-string barre realizes a different F-major voicing. It cannot replace the full voicing if the omitted F2 and C3 were required. |
| Contradictory assignment to valid C-major locations | Keep the open-C row's pitches, but assign finger 1 to both (5,3) and (2,1) concurrently, and finger 2 to (4,2). | Different simultaneous fret obligations contradict the declared single-contact/same-fret-barre model. The original assignment is an alternative: this rejection is not proof that the voicing is impossible. |
| Large span | Require F2 at (6,1) with finger 1 and A4 at (1,5) with finger 4 concurrently. | Span 4 crosses the full string set. The crown-distance table describes longitudinal geometry only; feasibility and comfort for an unspecified player remain undetermined. |
| Same E-major voicing, different assignments | Frets: open, 2, 2, 1, open, open. Pitches: E2–B2–E3–G♯3–B3–E4. For (5,2), (4,2), (3,1), compare fingers 2/3/1 with 3/4/2. | Both assignments preserve the locations and exact voicing under the contact model. The second leaves the index available; context and player determine whether that helps. |

The C-major contradiction covers both contradictory use of one finger and a musically valid voicing with an invalid proposed assignment. The F-major cases cross-check the distinction between contacts and actual sounding pitches. They do not supply numeric force or comfort evidence.

### Assignment comparison and the Am/C incident

**Sourced positive comparison, pedagogical evidence.** Jimmy Brown teaches two assignments for the same open-G locations: frets 3, 2, open, open, open, 3, producing G2–B2–D3–G3–B3–G4. For strings 6/5/1 he gives fingers **3/2/4** and **2/1/3**, and relates the choice to surrounding C or D chords. This is evidence of taught realizations, not a measured anatomy study or a universal ranking. Both retain the open middle strings and all six pitches. [Brown, Figure 1 discussion][brown-g].

**Derived comparison.** The assignments put different connected digits over the same targets and leave different fingers unused. Their shared postures, segment arrangements, pad placement, and open-string clearance must therefore be assessed separately. The teaching evidence supports the alternatives; it does not identify a unique wrist angle or prove either preferable for an unspecified player.

**Regression: small span and unique fingers.** The motivating Am/C uses frets **omit, 3, 2, 2, 1, open**, sounding **C3–E3–A3–C4–E4**. On strings 5/4/3/2, compare **3/2/4/1** with **4/2/3/1**. Both assign four distinct fingers to ordinary individual stops and have fretted span **2**. In the first, finger 3 serves the bass while finger 4 serves string 3; the second swaps those duties. That changes the connected segment arrangement, including clearance around the middle finger and the open first string. It is not a mere relabeling of interchangeable probes.

No shared anatomical configuration or matched performance evidence is established here for either Am/C assignment. Both remain **undetermined at that level**. Neither the pitch calculation, unique labels, small span, nor the second assignment's more conventional fret ordering proves a playable or superior grip. The comparison candidate is not an accepted correction; nor is the incident assignment declared universally impossible.

### Constructed shared-configuration regressions

**Explicit model assumptions, not measured human dimensions.** The following deliberately simplified two-digit geometry isolates the logical issue. It is not a guitar-hand calibration or an execution recommendation. Coordinates are millimetres: x is longitudinal, y transverse, z above a flat test contact surface at z = 0. The instrument is externally supported. There are no other digits, thumb-support duties, strings to keep sounding, or obstacles; contact is purely geometric and force is unspecified.

Digit 2 has base B2 = (h, 0, 31); digit 3 has base B3 = (h + 20, 10, 31). A rigid connecting palm segment fixes their relative placement. Only the shared longitudinal translation h may change; orientation and base height remain fixed. Each digit has three fixed-length articulated segments, moving in its own x–z plane (y = 0 or y = 10). In this artificial model all joint-angle combinations in those planes are allowed, subject to surface and body exclusion. It intentionally omits physiological coupling so that any negative result cannot be blamed on an invented human joint limit.

Each segment is surrounded by a radius-1 capsule, including rounded joints and the distal pad. Adjacent segments and their attachment to the palm join into one body; incompatible overlap elsewhere is prohibited. Contact occurs when a distal pad centered at z = 1 touches the test surface. Other segment surfaces must remain above it. The palm also has radius 1. These are mathematical surfaces, not measurements of fingers or frets.

Require digit 2's pad center at **T2 = (0, 0, 1)** and digit 3's at **T3 = (60, 10, 1)** concurrently. This is the fully specified test grip for both profiles below.

| Illustrative profile | Configuration or contradiction |
| --- | --- |
| P: each digit has segment lengths 10, 10, 10 | Each target is individually reachable: at h = 0 digit 2 extends vertically down; at h = 40 digit 3 does so. In each case the unconstrained digit can extend vertically upward, clear of the surface. But each base is 30 mm above its target, equal to its entire 30 mm segment chain. Any horizontal offset makes the straight-line distance exceed 30 mm. Thus the first target requires h = 0 and the second h = 40. No shared h satisfies both. |
| Q: each digit has segment lengths 20, 20, 10; all other assumptions unchanged | At h = 20, digit 2 follows (20,0,31) → (20,0,11) → (0,0,11) → (0,0,1). Digit 3 follows (40,10,31) → (40,10,11) → (60,10,11) → (60,10,1). Each successive length is 20, 20, 10; all segments stay above the surface except the intended distal tangencies. The planes are 10 mm apart, leaving at least 8 mm between the radius-1 digit volumes. Both contacts coexist in this model. |

**Derived conclusions.** P demonstrates individually reachable but jointly unavailable targets. Q supplies an actual satisfying configuration for the same grip, rather than inferring success from longer fingers alone. Its positive conclusion is confined to the declared geometry; real joint combinations, pads, strings, support, and force could invalidate the analogy. The negative P result likewise does not describe a population or a particular guitarist.

**Ordering exception proved in the constructed model.** Keep Q and h = 20, but require digit 2 at (60,0,1) and digit 3 at (0,10,1). A satisfying pair is:

- Digit 2: (20,0,31) → (36,0,19) → (52,0,7) → (60,0,1).
- Digit 3: (40,10,31) → (24,10,19) → (8,10,7) → (0,10,1).

The first two displacements have length √(16² + 12²) = 20 and the last √(8² + 6²) = 10. Their projected paths cross, but their planes remain 10 mm apart. All segment surfaces clear z = 0 until the distal tangencies. Digit 2 reaches the bridgeward target while digit 3 reaches the nutward target. A monotonic digit-number/longitudinal-order filter would reject this demonstrated model configuration. **This is a geometric counterexample, not evidence of a human performing a particular guitar fingering.**

**Empirical ordering candidate still unresolved.** Stylianides describes finger 2 at (6,10), finger 3 moving from (5,10) to (5,9), with finger 1 at (4,7). The prose asserts a concurrent crossing, but its A-major description does not match those locations under this reference's standard tuning: they yield D3–G3–A3, then D3–F♯3–A3. Inspection of the neighboring score pages did not securely reconcile the named bar, contacts, and durations. Do not silently repair the source or count it as a verified positive human example. [Thesis, printed pp. 210–212][stylianides]. The mathematical exception above stands independently; an evidenced simultaneous human ordering exception remains a research gap.

**Temporal companion.** P can place each digit at its own target at separate times if the earlier contact may release and sufficient translation time is allowed. Requiring both contacts to remain makes h = 0 and h = 40 concurrent obligations again, so the contradiction returns. No movement-speed guarantee follows from the two endpoint configurations.

### Melodic paths and transitions

For the first two examples, play notes successively, allow release before the next attack, and impose no sustain overlap or fixed tempo. This avoids a simultaneous-contact conflict; it does not prove execution at every speed.

| Case | Registered sequence and physical realization | What follows |
| --- | --- | --- |
| Position-based G-major octave | G3–A3–B3–C4–D4–E4–F♯4–G4 at (4,5), (3,2), (3,4), (3,5), (2,3), (2,5), (1,2), (1,3), using fingers 4,1,3,4,2,4,1,2. | A position organized around frets 2–5 permits reuse across strings and time. It does not require eight concurrent finger contacts. |
| C-major octave with shifts | C4–D4–E4–F4–G4–A4–B4–C5 on string 2 at frets 1,3,5,6,8,10,12,13, using fingers 1,3,1,2,1,3,1,2. | Index-based regions change from fret 1 to 5 to 8 to 12. The path's overall range is not a grip span. Transitions need release and movement; their tempo limits are unspecified. |
| Sustained note versus finger reuse | Finger 1 holds C4 at (2,1); before C4 may end, require A3 at (3,2) using that same finger, with no substitute contact. | Both locations exist, but the overlapping assignment conflicts with the model. Using another available finger or changing an authorized duration creates a different case; neither repair is silently assumed. |
| Equivalent pitch choices in context | E2 on open string 6 → A2 either on open string 5 or at (6,5) with finger 1 → B2 at (5,2) with finger 1. | Without overlap, the open A leaves the finger free to prepare B; the fretted A requires its relocation from fret 5 to 2 across strings. These are different demands, not a universal score. If E2 must continue through A2, stopping (6,5) defeats that sustain, whereas open string 5 does not. |

If substitution is proposed for the sustained C4, another finger must preserve the effective fret-1 stop as finger 1 leaves, without interrupting or changing the required sound. Merely naming an available substitute does not demonstrate that transfer.

Reversing either scale gives a descending sequence, but reverses preparation/release obligations too. The reversed assignment is an example to reassess, not a prescribed preferred descending fingering.

### Additional boundaries

| Case | Consequence |
| --- | --- |
| All six strings open | E2–A2–D3–G3–B3–E4 requires no finger stops. There is no fretted-contact span; this is not a claim about an intended chord or complete performance difficulty. |
| Barre extent versus an open string | A major at omit, open, 2, 2, 2, open requires A2–E3–A3–C♯4–E4. A partial barre stopping strings 4–2 at fret 2 must leave strings 5 and 1 clear. A firm stop on string 1 changes E4 to F♯4; a lighter unintended touch can damp it instead. Intended coverage of strings 4–2 does not establish that the actual pad/joint surface ends or lifts clear of string 1. The surface and other contacts must coexist in one posture; an allowed selective contact must be demonstrated, not inferred from the dots. |
| Two stops on one string | Contacts at (1,1) and (1,3) can coexist with the latter determining G4; they cannot make F4 and G4 independently sound together from that ordinary speaking segment. |
| Omitted versus muted | An omitted low string in open C must be skipped or controlled as required by the actual playing task. The location list does not certify a muting action. |
| Full capo at physical fret 2 | String 6 effective open is F♯2. A finger at physical fret 5 produces A2, three frets above the capo. The capo is not an extra hand finger; physical geometry still uses physical fret coordinates. See [Capos](FRETBOARD_REFERENCE.md#capos). |

## Sources and verification

Original sources checked on **2026-10-05**; extension evidence checked on **2026-10-05–06**. **Direct text** means the relevant prose/formulas were retrieved and read; it does not mean all illustrations, videos, linked pages, or claims were audited. **PDF text, selected sections** means the identified passages were read; visual score inspection is stated separately. **Indexed text** means search retrieval exposed the named passage, while direct full-text access was unavailable. **Abstract only** does not establish methods or detailed examples. No source illustrations are reproduced. Undated means no publication date is assigned here. The [extension claim ledger](../plans/playability-hand-feasibility.md#claim-ledger) records classifications, passages, assumptions, corroboration, and limits.

| Source | Material used and limitations |
| --- | --- |
| Jonathan Feist, Berklee Online, [*Guitar Notation Basics*][berklee-notation], 2009-04-22 | “Fretboard diagrams” and closing position/hand terminology. **Direct text.** The earlier paragraph calls numbered fingers “plucking fingers”; that wording is not adopted. Finger numbering is corroborated with Fender. |
| Mark White, Berklee, [*Reading Skills: The Guitarist's Nemesis?*][berklee-reading], Fall 2005 | Positional versus moving approaches, alternative locations, and phrase-dependent choices. **Direct text.** Teaching perspective, not physiological limits; score images were not used. |
| Mike Duffy, Fender, [*How to Read a Chord Chart*][fender-chart], undated | Fretting-finger numbers, T, and open/muted/unplayed notation. **Direct text.** Chart symbols do not establish execution mechanics. |
| Mike Duffy, Fender, [*Asked/Answered: Is It OK to Use My Thumb to Mute Low Strings?*][fender-thumb], undated | Thumb contact for low-string muting versus the taught back-of-neck placement. **Direct text.** Technique example, not a universal recommendation. |
| Mac Randall, Yamaha, [*Eight Great Tips for Learning Steel-String Acoustic Guitar*][yamaha-acoustic], 2021-11-15 | Sections 3, 5, 6: position organization, open strings, and barre plus higher stops. **Direct text.** Unqualified ease/strength advice and section 6's “same notes” transposition wording are not adopted. |
| Trinity College London, [*Music publications and syllabus errata*][trinity], undated page | Guitar Exam Pieces from 2020, Grade 4, “Gavotte”: suggested fingerings and duration adjustment. **Direct text.** A local teaching example, not general permission to alter music. |
| Douglas Niedt, [*Specialty Barres Part 3: Partial Barres*][niedt], undated | Opening terminology note and adjacent-string clearance discussion. **Direct text.** Specialist supplementary evidence only; anatomical/genetic generalizations and promotional claims excluded. |
| Hank Heijink and Ruud G. J. Meulenbroek, [*On the Complexity of Classical Guitar Playing: Functional Adaptations to Task Constraints*][heijink], *Journal of Motor Behavior* 34(4), 339–351, 2002; [DOI/abstract][heijink-abstract] | **PDF text, selected sections:** definitions p. 339; Method pp. 341–343; pre/posttest results and Discussion pp. 347–350. Six male professionals, one guitar, prescribed tempo; not a general population or force study. Publisher retrieval failed; the university-hosted author copy supplied the methods. |
| Sigal Portnoy et al., [*Correlations between body postures and musculoskeletal pain in guitar players*][portnoy], *PLOS ONE* 17(1), e0262207, 2022-01-04 | **Direct text:** Methods 2.1–2.3 and Discussion, especially limitations. Selected 25-player sample; observational correlations do not calibrate fingering feasibility or predict injury. |
| R. M. Mottola, [*Calculating Fret Positions*][mottola], updated 2026-06-21 | Modern twelfth-root formula. **Direct text.** Formula corroborates existing Fretboard geometry; ergonomic opinions excluded. |
| Joe Wolfe, UNSW Physics, [*Strings, standing waves and harmonics*][unsw-strings], undated | “Harmonics and modes,” length/tension relationships, and ideal-string qualifications. **Direct text.** No harmonic-playing, setup, or injury guidance is inferred. |
| Yeongyu Park and Joonbum Bae, [*A Three-dimensional Finger Motion Measurement System of a Thumb and an Index Finger Without a Calibration Process*][park-bae], *Sensors* 20(3), 756, 2020; [accessible PDF copy][park-bae-copy] | **PDF text, section 2.1, pp. 2–3:** finger/thumb joint anatomy and movement axes. Publisher access failed; the original paper's mirrored PDF supplied the passage. Its instrumentation, numerical ranges, and joint simplifications are not selected as a guitar model. |
| John H. Buffi, Joseph J. Crisco, and Wendy M. Murray, [*A Method for Defining Carpometacarpal Joint Kinematics from Three-Dimensional Rotations of the Metacarpal Bones Captured In Vivo Using Computed Tomography*][buffi], *Journal of Biomechanics* 46(12), 2104–2108, 2013 | **Indexed text, abstract/methods:** fourth/fifth metacarpal movement and palmar arch; one subject. Direct PMC retrieval was blocked. No population geometry or guitar validation inferred. |
| Verónica Gracia-Ibáñez, Margarita Vergara, and Joaquín L. Sancho-Bru, [*Interdependency of the maximum range of flexion–extension of hand metacarpophalangeal joints*][gracia], *Computer Methods in Biomechanics and Biomedical Engineering* 19(16), 1800–1807, 2016 | **Abstract only:** neighboring MCP posture changes maximum voluntary flexion/extension. Quantitative regressions not adopted; passive, loaded, wrist-dependent, and guitar-specific limits remain separate questions. |
| Catherine E. Lang and Marc H. Schieber, [*Human Finger Independence: Limitations due to Passive Mechanical Coupling Versus Active Neuromuscular Control*][lang], *Journal of Neurophysiology* 92, 2802–2810, 2004 | **Abstract and indexed selected Methods/Discussion:** ten healthy adults; matched passive and active individuated motion. Distinguishes mechanisms in that task, not a universal independence ranking or chord-impossibility test. |
| H. P. von Schroeder, M. J. Botte, and H. Gellman, [*Anatomy of the juncturae tendinum of the hand*][juncturae], *Journal of Hand Surgery* 15(4), 595–602, 1990 | **Abstract only:** extensor interconnections and variation in 40 cadaver hands. Anatomical corroboration for mechanical coupling, not evidence about successful guitar grips. |
| Carl R. Beringer III et al., [*The effect of wrist posture on extrinsic finger muscle activity during single joint movements*][wrist-emg], *Scientific Reports* 10, 8377, 2020 | **Indexed text, abstract/Methods/Discussion:** eleven participants, unloaded motion and differing wrist postures. Muscle activity does not by itself isolate each cause or set force/ROM limits for guitar playing. |
| Bryan Buchholz, Thomas J. Armstrong, and Steven A. Goldstein, [*Anthropometric data for describing the kinematics of the human hand*][buchholz-anthro], *Ergonomics* 35(3), 261–273, 1992 | **Abstract only:** segment and joint-center geometry; imperfect prediction from external measurements. No complete individual hand inferred from hand length. |
| Bryan Buchholz and Thomas J. Armstrong, [*A kinematic model of the human hand to evaluate its prehensile capabilities*][buchholz-model], *Journal of Biomechanics* 25(2), 149–162, 1992 | **Indexed abstract only:** articulated segments and surface contact, with cylindrical-grasp validation. Precedent for geometry, not a selected representation or guitar validation. |
| Kiseok Sung, Joonho Chang, Andris Freivalds, and Yong-Ku Kong, [*Development of the Two-Dimensional Biomechanical Hand Model for a Guitar Player*][sung], *HFES Annual Meeting Proceedings* 57(1), 1653–1657, 2013 | **Abstract only:** static two-dimensional force modeling for C, E, G7, Am using anthropometry, fingertip forces, and joint angles. Full text unavailable; neither three-dimensional collision reasoning nor this Am/C assignment validated. |
| B. K. Mohamed Ibrahim et al., [*The Normal Active Range of Motion of the Index, Middle, Ring, and Little Fingers in a Sample of Indian Population*][rom], *Indian Journal of Plastic Surgery* 57, 248–255, 2024 | **PDF text, Methods/Results:** active goniometric measurements in 195 volunteers, 390 hands. Sample/protocol variability illustrates why marginal measurements are not universal or jointly attainable extrema. |
| Ricardo Iznaola, [*Left-Hand Technique and the Limits of the Possible*][iznaola], *Guitar Forum* 1, 1–44, 2001; reprinted *Soundboard Scholar* 11, 2026 | **Repository abstract and bibliographic record only.** PDF returned 403. Established pedagogical treatment of coordinated movement; detailed procedures and physiological assertions need passage-level review. |
| Jimmy Brown, [*Two essential G chord shapes: when to use each finger position and why*][brown-g], *Guitar World*, 2026-07-19 | **Direct text, Figure 1 discussion:** two assignments of the open-G voicing and phrase-dependent choice. Pedagogical positive comparison; no player measurements or universal superiority claim. Images were not used as independent verification. |
| Timotheos Stylianides, [*The guitar performance practice in Spanish neoclassicism, focusing on El Grupo de los Ocho*][stylianides], University of Glasgow PhD thesis, 2025 | **PDF text and visual score inspection, printed pp. 210–212:** proposed crossing in bar 67. Prose locations, chord label, and notated timing were not securely reconciled. Candidate remains unverified and is excluded from positive human evidence. |

Foundational checks pair Berklee with Yamaha for barre/position usage and with Fender for finger notation; Trinity independently illustrates the conditional nature of fingering advice and duration. Physical contact consequences derive from the existing sourced Fretboard model and UNSW, with ordinary barre practice as a cross-check. Mottola corroborates fret spacing. Neither multiple pages from one organization nor an abstract and its full paper count as independent authorities. Niedt is used for a named terminology variation, not as a sole source of deterministic anatomical truth.

The anatomy sources address different parts of the explanation: joint structure and dimensions, palmar mobility, movement combinations, and mechanical versus active coupling. They corroborate the need to declare connected geometry and usable combinations; they do not jointly constitute a calibrated guitar model. Instrument-spacing, radius, profile, and action sources now accompany their definitions in the [Fretboard Reference](FRETBOARD_REFERENCE.md#sources-and-verification).

The pitch and distance examples are recomputed derivations. That checks arithmetic, not independent pedagogical corroboration, player testing, or implemented domain behavior. Research does not supply the absent universal thresholds; statements about their absence are limitations of this reference's evidence, not a claim to have surveyed every study. For corrections, inspect the relevant source context, corroborate foundational changes, preserve convention differences, and update access/verification notes honestly.

[berklee-notation]: https://online.berklee.edu/takenote/guitar-notation-basics/
[berklee-reading]: https://www.berklee.edu/berklee-today/fall-2005/reading-skills
[fender-chart]: https://www.fender.com/articles/chords/how-to-read-a-chord-chart
[fender-thumb]: https://www.fender.com/articles/techniques/asked-answered-is-it-ok-to-use-my-thumb-to-mute-low-strings
[yamaha-acoustic]: https://hub.yamaha.com/guitars/g-acoustic/eight-great-tips-for-learning-steel-string-acoustic-guitar/
[trinity]: https://trinitycollege.com/qualifications/music/grade-exams/syllabus-errata
[niedt]: https://douglasniedt.com/partialbar.html
[heijink]: https://www.socsci.ru.nl/meulenbroek/Publications/Heijink%20en%20Meulenbroek%202002.pdf
[heijink-abstract]: https://pubmed.ncbi.nlm.nih.gov/12446249/
[portnoy]: https://pmc.ncbi.nlm.nih.gov/articles/PMC8726467/
[mottola]: https://www.liutaiomottola.com/formulae/fret.htm
[unsw-strings]: https://newt.phys.unsw.edu.au/jw/strings.html
[park-bae]: https://doi.org/10.3390/s20030756
[park-bae-copy]: https://pdfs.semanticscholar.org/c4f8/f388f3516bc6762e70758147d4f36648fda1.pdf
[buffi]: https://pmc.ncbi.nlm.nih.gov/articles/PMC3788642/
[gracia]: https://pubmed.ncbi.nlm.nih.gov/27198763/
[lang]: https://pubmed.ncbi.nlm.nih.gov/15212429/
[juncturae]: https://pubmed.ncbi.nlm.nih.gov/2380523/
[wrist-emg]: https://pmc.ncbi.nlm.nih.gov/articles/PMC7239904/
[buchholz-anthro]: https://pubmed.ncbi.nlm.nih.gov/1572336/
[buchholz-model]: https://www.sciencedirect.com/science/article/pii/0021929092902723
[sung]: https://journals.sagepub.com/doi/10.1177/1541931213571367
[rom]: https://www.thieme-connect.com/products/ejournals/pdf/10.1055/s-0044-1788593.pdf
[iznaola]: https://digitalcommons.du.edu/sbs/vol11/iss1/1/
[brown-g]: https://www.guitarworld.com/lessons/chords/two-essential-g-chord-shapes
[stylianides]: https://theses.gla.ac.uk/85539/3/2025StylianidesPhD.pdf
