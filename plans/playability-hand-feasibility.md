# Explain simultaneous anatomical and kinematic hand feasibility


This ExecPlan follows [.agent/PLANS.md](../.agent/PLANS.md). It records the user-approved extension of the Playability Reference, not implementation of a Playability Engine. Preserve the completed original plan, `plans/playability-reference.md`.

## Purpose / Big Picture


Explain why logically compatible finger assignments and a small fret span do not establish a simultaneous human grip. Readers should distinguish musical validity, instrument availability, contact validity, shared anatomical/kinematic feasibility, ergonomic assessment, and preference. Establish the need for one permitted whole-hand configuration satisfying all concurrent obligations, with explicit evidence and model limits.

The user approved this implementation on 2026-10-05. Authorized changes are this plan, `docs/PLAYABILITY_REFERENCE.md`, `docs/FRETBOARD_REFERENCE.md`, `docs/ARCHITECTURE.md`, and `AGENTS.md`. No runtime implementation, API, schema, optimizer, dependency, UI, AI tool, or accepted architectural decision is introduced. `docs/DECISIONS.md` and the completed original plan remain unchanged.

## Progress


- [x] 2026-10-05T14:17:29Z: Rechecked clean Git status, repository instructions, ExecPlan protocol, architecture, decisions, original plan, and the current reference.
- [x] 2026-10-05T14:17:29Z: Recorded the approved scope and evidence/acceptance requirements in this dedicated plan.
- [x] 2026-10-06T05:13:46Z: Reviewed the anatomical source set with access limits recorded; verified Brown's positive assignment comparison.
- [x] 2026-10-06T05:13:46Z: Extended anatomy, shared posture, contact surfaces, geometry, player profiles, ergonomics, and temporal reasoning; integrated Fretboard, Architecture, and AGENTS.
- [ ] Verify an evidenced simultaneous human fingering that reverses finger-number/fret order. Stylianides remains unresolved; the constructed example proves only its artificial geometry.
- [x] 2026-10-06T05:22:06Z: Recomputed examples, audited claims and links, inspected rendered readability, and reviewed the complete changes. The separate human ordering evidence requirement remains open.

## Surprises & Discoveries


The current reference already states that distinct finger labels do not prove reachability. The gap is its undeveloped account of shared hand geometry, not a demonstrated engine bug. The checkout has a minimal Next.js application and bootstrap tests but no domain modules.

Gracia-Ibáñez et al. (2016) directly supports posture-dependent MCP movement limits, but its abstract does not justify adopting regression equations. Park and Bae (2020), Buffi et al. (2013), and Beringer et al. (2020) supplement the approved source set for joint anatomy, palm mobility, and wrist-dependent muscle activity.

The public Stylianides PDF was retrieved and printed pp. 210–212 visually inspected. The p. 212 prose names bar 67, a suspended A-major chord, and contacts (6,10), (5,10) moving to (5,9), and (4,7). Under standard tuning these produce D3–G3–A3 and D3–F♯3–A3. The score excerpts and durations did not securely reconcile that discrepancy. Treat it as an unresolved candidate, not a corrected score or evidence of impossibility. Am/C assignments 3/2/4/1 and 4/2/3/1 likewise remain anatomically undetermined.

Searching ordinary chord lessons surfaced many finger-number/string-order reversals that do not reverse fret order. Frank Koonce's author-hosted [*Left-Hand Movement: A Bag of Tricks*](https://www.frankkoonce.com/articles/A%20Bag%20of%20Tricks.pdf), Examples 2b and 9c (PDF pp. 3 and 6), was read and visually checked. Its illustrated inversions involve same-fret arrangements; they were not promoted to the required nonmonotonic-fret example. Sequential finger crossing is also insufficient unless the required concurrent contacts are established.

## Decision Log


2026-10-05, user-approved scope: preserve the Music Theory / Fretboard / Playability boundaries. Fretboard owns instrument facts; Playability consumes them for human realization. Existing decisions D001, D005, and D007 suffice; do not create a new persistent decision.

2026-10-05, user-approved evidence policy: distinguish anatomical fact, biomechanical evidence, guitar observation, pedagogy, model assumption, derivation, ergonomic judgment, and limitation. Use population data only with its measurement conditions and sample limits. Keep missing player information unspecified.

2026-10-05, user-approved acceptance: include at least one evidenced positive assignment comparison and one evidenced ordering exception. Unverified candidates cannot satisfy those requirements. A conditional constructed model may demonstrate geometric principles but must not masquerade as a measured human grip.

2026-10-06, Codex: use Brown's taught open-G assignments for the evidenced positive comparison, preserving all six pitches. Keep Am/C as a diagnostic regression with no preferred correction. Use a fully declared two-digit construction to demonstrate joint unavailability and contrasting profiles; do not count it as human ordering evidence. The pending human example remains an acceptance gap rather than a silently weakened requirement.

2026-10-06, Codex: consolidate spacing, radius, width, action, and neck-profile definitions and their sources in Fretboard. Retain a claim-dependent input table in Playability. Treat Iznaola and Sung as abstract-supported perspectives where full text is unavailable; no detailed claims or numerical constraints are imported.

## Outcomes & Retrospective


The substantive extension and four-document integration are written and checked. The reference now distinguishes logical contact validity from the existence of one shared pose and from force, endurance, timing, and preference. The positive assignment comparison is sourced; the constructed positive and negative configurations state all their idealizations. Arithmetic, documentation structure, rendered readability, and diff review passed. Full acceptance remains pending the evidenced human ordering exception; the unresolved thesis passage cannot satisfy it. No Playability Engine or new accepted project decision has been introduced.

## Context and Orientation


`AGENTS.md` owns working instructions, `.agent/PLANS.md` the ExecPlan protocol, `docs/ARCHITECTURE.md` domain ownership and implementation status, and `docs/DECISIONS.md` accepted decisions. The Music Theory Reference owns theory, the Fretboard Reference instrument facts, and the Playability Reference physical execution under named assumptions.

The current reference's one-contact-or-same-fret-barre examples establish logical contradictions, not complete anatomy. Finger bases belong to one connected hand; metacarpophalangeal (MCP), proximal interphalangeal (PIP), and distal interphalangeal (DIP) configurations, tissue geometry, contact surfaces, coupled limits, and sounding-string clearance must coexist. A configuration at one instant differs from a transition satisfying timing and sustained contacts. Neither kinematic validity nor a failed search establishes all of human playability.

## Plan of Work


Milestone 1 verifies evidence. Inspect relevant passages of the approved source set, retrieve accessible originals where possible, and record source, passage, classification, assumptions, corroboration, access, and limits in the ledger below. Verify the positive assignment comparison and human ordering exception using actual score/contact/timing evidence. Conditional geometric derivations explain the logic but do not replace that human evidence. Completion requires a defensible positive example in both categories, with any separate unresolved Am/C claim clearly bounded.

Milestone 2 extends the reference. Add anatomy/coupled-motion and shared-pose reasoning; revise contact, barre, geometry, temporal, ergonomic, player, limitation, and example sections consistently. Include six regression families plus a temporal companion. Consolidate instrument measurement definitions in Fretboard and link the assessment back to them. Clarify architecture and AGENTS guidance without changing implementation status or selecting future guarantees. Completion means each claim is sourced or explicitly derived/assumed and no existing example accidentally asserts full anatomical validation.

Milestone 3 verifies and reviews. Recompute pitches and all geometric demonstrations. Audit assumptions, simultaneous durations, strings that must ring, and distinctions between contradiction, model exclusion, and insufficient information. Check local links/anchors, citation labels, tables, whitespace, rendered readability, and the full five-file diff/status. Application tests/builds do not validate this documentation-only change and are not required. Record actual results and remaining limitations separately.

## Concrete Steps


Work in PowerShell from `C:\Users\simoa\Documents\fretbo-AI-rd`. Read sources with web retrieval and the bundled PDF tools; use temporary files outside the checkout for source PDFs and render checks. No tooling installation is planned.

    git -c safe.directory=C:/Users/simoa/Documents/fretbo-AI-rd status --short --untracked-files=all
    git -c safe.directory=C:/Users/simoa/Documents/fretbo-AI-rd diff --check
    git -c safe.directory=C:/Users/simoa/Documents/fretbo-AI-rd diff -- AGENTS.md docs/ARCHITECTURE.md docs/FRETBOARD_REFERENCE.md docs/PLAYABILITY_REFERENCE.md
    Get-Content -LiteralPath plans/playability-hand-feasibility.md

Use ephemeral Node/Python checks for arithmetic, local links/anchors, reference labels, and table structure. Render Markdown with a temporary preview and inspect it through the available browser. Expected final Git scope is four modified Markdown files and this new plan. Inspect this new file directly because unstaged diff omits it.

## Validation and Acceptance


The six regression families are: the same targets with different assignments; the Am/C candidate passing unique-finger/span checks without anatomical proof; a positively supported nonmonotonic ordering example; individual reach without simultaneous reach; barre contact geometry with open-string clearance; and two declared profiles giving different model outcomes. Add a release/sustain/timing companion. Every positive model outcome needs a satisfying configuration, not merely absence of a detected contradiction. Every negative outcome must state the model and reasoning that excludes its permitted configurations.

Keep all required pitches, doublings, strings, and durations intact. Do not turn low independence, unfamiliarity, extreme posture, population averages, diagram crossing, or unsuccessful search into universal impossibility. Preserve force/endurance/transition limitations and open architecture questions. Verify the source passages, arithmetic, Markdown navigation, rendered tables, and clean diff whitespace; record any remaining uncertainty honestly.

## Idempotence and Recovery


Recheck status before resuming and preserve concurrent user work. Source reads and validation are repeatable. If a source cannot be accessed, use its verified abstract only for claims it supports, seek an authorized accessible original, or explicitly record the limitation. Do not fabricate thresholds or bypass access controls. No reset, clean, commit, or publication is authorized. Temporary checks must not introduce repository dependencies or test infrastructure.

## Artifacts and Notes


The reference's [source table](../docs/PLAYABILITY_REFERENCE.md#sources-and-verification) supplies full titles and URLs. Temporary source PDFs and render/check artifacts are outside the checkout at `C:\Users\simoa\AppData\Local\Temp\fretbo-hand-feasibility-20261005`; they are not required repository dependencies or permanent evidence storage.

### Claim ledger


All extension passages were reviewed on 2026-10-05–06. “Corroboration” identifies independent, relevant support, not an assertion that different experiments validated the same guitar configuration. Abstract-only entries support only their stated qualitative claims.

| Claim / classification | Supporting passage and access | Assumptions / corroboration / limitation |
| --- | --- | --- |
| Finger/thumb joints, segment dimensions, and surface geometry matter — anatomical fact and model distinction | Park and Bae (2020), §2.1, pp. 2–3, original PDF via Semantic Scholar mirror; Buchholz et al. (1992), anthropometry abstract. | Named joints and axes describe anatomy; independent anthropometry supports individualized dimensions. No instrumentation, DOF count, or numerical ROM model selected. |
| A rigid palm omits arch mobility — biomechanical evidence | Buffi et al. (2013), indexed abstract/methods, fourth/fifth CMC rotations; direct PMC blocked. | One-subject CT model. Supports declaring the simplification; neither a universal palm shape nor a guitar calibration. |
| Joint extrema depend on neighboring posture — biomechanical evidence | Gracia-Ibáñez et al. (2016), abstract reporting voluntary MCP interdependence. | Lang/Schieber independently supports coupling, using a different task. No regression equations, passive limits, or loaded limits imported. |
| Mechanical and active coordination constraints differ — biomechanical evidence | Lang and Schieber (2004), abstract and indexed selected Methods/Discussion; passive/active matched motions in ten adults. | von Schroeder et al. independently documents anatomical connections. Reduced active independence alone does not exclude a maintained static grip; no universal digit ranking. |
| Extensor interconnections vary — anatomical fact | von Schroeder et al. (1990), abstract, 40 cadaver hands. | Corroborates possible mechanical coupling. Cadaver morphology does not measure guitar performance or dynamic neural control. |
| Wrist posture changes muscle activity — biomechanical evidence | Beringer et al. (2020), indexed abstract/Methods/Discussion, eleven participants and unloaded single-joint movements. | Active/task-dependent; not a direct guitar force threshold, wrist-dependent ROM table, or complete separation of causal mechanisms. |
| Individual geometry is not recoverable from hand length alone — biomechanical evidence and uncertainty | Buchholz et al. (1992), anthropometry abstract on joint centers, segment dimensions, and prediction. | Park/Bae corroborates the articulated geometry distinction. Missing individual measurements remain unknown; population predictions do not silently fill them. |
| Surface models are precedented, not selected — model precedent | Buchholz and Armstrong (1992), indexed abstract on articulated segments/surface contact and cylindrical grasps. | Cylinder-grasp validation is not guitar validation. The reference does not select its surface primitives, solver, or accuracy. |
| ROM depends on measurement population/protocol — biomechanical evidence and limitation | Mohamed Ibrahim et al. (2024), PDF Methods/Results, 195 volunteers / 390 hands, active goniometry. | Marginal distributions are not simultaneous extremes. Gracia-Ibáñez independently supports combination dependence; no population limit becomes a player restriction. |
| Guitar motion and timing adaptation matter — empirical guitar finding | Heijink/Meulenbroek (2002), university PDF Method pp. 341–343 and Discussion pp. 347–350. | Six male professionals, prescribed sequences/tempo, one guitar; not general grip bounds or a complete force model. |
| Coordinated arm–wrist–hand movement informs technique — pedagogy | Iznaola, repository abstract and publication notes; original 2001 article, 2026 reprint; full PDF returned 403. | Limited conceptual inclusion. Detailed procedures, injury/physiology assertions, and exceptional passages are unverified; no attempt to bypass access. |
| Guitar force claims need more than geometry — force-model precedent and limitation | Sung et al. (2013), publisher abstract: anthropometry, fingertip pressures, joint angles, four chords, static 2D model. | No full-text methods review. Does not validate three-dimensional clearance, the Am/C incident, or general internal-force rankings. |
| Same open-G voicing has two taught assignments — pedagogy and derived pitch check | Brown (2026), direct Figure 1 discussion: fingers 3/2/4 versus 2/1/3 on strings 6/5/1. | Frets 3/2/open/open/open/3, all six strings sounding. Voicing independently recomputed; pedagogy supports alternatives but not measured anatomy or universal preference. |
| Am/C unique digits and span 2 do not establish anatomy — derivation and uncertainty | Original calculation under standard tuning: omit/3/2/2/1/open; C3–E3–A3–C4–E4. | Both assignments preserve contacts. No witnessed or calibrated shared configuration; comparison is not an accepted correction or universal rejection. |
| Individual reach does not imply a shared pose — model assumption and geometric derivation | Reference's P/Q construction, fixed bases, three links per digit, specified surfaces and permitted translation. | P requires incompatible h = 0 and h = 40. Q supplies coordinates at h = 20. No physiological or guitar calibration; greater length alone is not the proof. |
| Projected crossing need not collide — geometric derivation | Q's crossing chains have lengths 20/20/10, lie in planes 10 mm apart, and have capsule radii 1 mm. | Positive only in this artificial model. It is not the required evidenced human ordering exception; actual volumes and allowed posture still matter. |
| Stylianides crossing candidate — uncertainty | Public thesis PDF, printed pp. 210–212 visually checked; p. 212 prose. | Stated positions yield D3–G3–A3 → D3–F♯3–A3 in standard tuning, unlike its named A-major suspension. Bar/contact/duration reconciliation unresolved; excluded as positive evidence. |
| A-major barre needs open-string clearance — contact derivation | Ordinary-string endpoint model, plus Niedt's adjacent-string discussion. Frets omit/open/2/2/2/open. | A2–E3–A3–C♯4–E4; stopping string 1 at 2 gives F♯4, touching can damp it. Intended coverage does not establish an actual compatible surface or adequate force. |
| Feasible endpoints need a permitted connecting movement — model implication and guitar evidence | Contact/sustain definitions; P's release-versus-overlap demonstration; Heijink/Meulenbroek's timing context. | No transition speed or trajectory certified. Release authorization changes obligations; sustain cannot be silently discarded. |
| Geometry ownership follows the claim — definitions and domain boundary | Fretboard measurement table: StewMac spacing, Fender radius/profile/action, Taylor access, UNSW string physics. Fender “Action” read directly 2026-10-06. | Instrument facts belong to Fretboard; human conclusions to Playability. Source setup prescriptions and comfort rankings excluded. |
| Awkwardness, coordination demand, and preference are not binary impossibility — ergonomic judgment / model boundary | Distinction derived from configured constraints and the limited research/pedagogy above. | Explicitly supported capability/force/task restrictions may be hard within a model; no universal score or injury claim supplied. |

### Verification record


On 2026-10-06, an ephemeral Node check recomputed every chord/scale pitch example, the Am/C span, capo and stopping consequences, the Stylianides candidate pitches, and all four crown separations. For scale lengths 648/610 mm, frets 1–5 span 126.179/118.780 mm and frets 13–17 span 63.090/59.390 mm, matching the displayed rounding. P's incompatible translations and Q's segment lengths, transverse clearance, and surface tangencies were checked. Manual geometric review also confirmed clearance of nonadjacent segments and the palm in both Q configurations; P's unconstrained digit can point upward during each individual reach.

Across the five changed/new documents, the check resolved 81 local paths/anchors and 126 citation-reference uses, checked 21 tables for column consistency, and found no conflict markers. All five documents parsed with the existing bundled Markdown renderer. Browser inspection covered the Playability regression table, Fretboard geometry table, and claim ledger at desktop width, plus a constrained 390 px preview; wider tables have horizontal scrolling in that temporary preview. This verifies the checked rendering, not every Markdown host's styling. Source access failures and abstract-only limits remain recorded in the source table and claim ledger; no claim is made that every remote PDF is retrievable.

Reviewed the full tracked diff and the new plan directly. `git diff --check` passed. Git scope is four modified Markdown documents plus this new plan; `docs/DECISIONS.md` and the completed original plan are unchanged. No application tests/builds were run for this documentation-only extension. The remaining acceptance gap is evidence for a concurrent human fingering that reverses finger-number/fret order, not a failed arithmetic or document check.

## Interfaces and Dependencies


Only documentation content, navigation, and consultation instructions change. No public interface, software type, profile schema, optimization algorithm, force solver, calibration procedure, or runtime dependency is selected. Geometric fidelity, supported techniques/instruments, candidate-generation ownership, and minimum guarantees remain open for later authorized work.

Revision note: 2026-10-05, Codex: initialized the user-approved extension after a clean preflight, preserving the completed original reference effort.

Revision note: 2026-10-06, Codex: recorded the substantive edits, source access and claim ledger; corrected author attributions during bibliography review and separated the remaining human ordering acceptance gap from the proved illustrative construction.

Revision note: 2026-10-06, Codex: completed arithmetic, navigation, table, render, and diff verification; retained the unmet human ordering evidence requirement explicitly for continuation.
