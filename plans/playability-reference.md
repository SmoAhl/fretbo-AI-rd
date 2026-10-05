# Establish a sourced Playability Reference


This plan follows [.agent/PLANS.md](../.agent/PLANS.md). It is a living document for the user-approved documentation effort, not a plan to implement a Playability Engine.

## Purpose / Big Picture


Add `docs/PLAYABILITY_REFERENCE.md` as the physical-execution companion to the Music Theory and Fretboard references. A reader must be able to distinguish musical validity, available instrument locations, feasibility under a stated model, configured ergonomic assessment, and preference. Explain simultaneous grips separately from melodic events through time. Support future domain implementation and test design without choosing APIs, algorithms, profiles, thresholds, or product capabilities.

The user authorized implementation of the reviewed plan on 2026-10-05. Changes are limited to this ExecPlan, the new reference, and integration in `AGENTS.md`, `docs/ARCHITECTURE.md`, `README.md`, and `docs/FRETBOARD_REFERENCE.md`. No code, dependencies, tests, or accepted project decisions are to change.

## Progress


- [x] 2026-10-05T08:28:49Z: Rechecked clean Git status, repository instructions, complete ExecPlan protocol, architecture, decisions, existing reference conventions, and bootstrap tests.
- [x] 2026-10-05T08:28:49Z: Recorded the authorized documentation effort and verification approach in this plan.
- [x] 2026-10-05T08:45:00Z: Completed source verification and the claim ledger below, including access limits, independent corroboration, and the six research questions.
- [x] 2026-10-05T08:45:00Z: Drafted all reference sections and example families; recomputed 63 pitch values across 14 checks and all four geometry rows successfully.
- [x] 2026-10-05T08:45:00Z: Integrated consultation instructions, ownership, navigation, and plan-directory status; retained open architecture questions.
- [x] 2026-10-05T08:47:04Z: Reviewed both new files and all tracked diffs; verified local links/anchors, citation labels, Markdown structure, whitespace, and the six-file documentation-only scope. Recorded final evidence below.

## Surprises & Discoveries


The checkout contains a minimal Next.js application and Node-only Vitest bootstrap tests, but no domain modules. No `plans/` directory existed before this effort. Architecture and README have now been updated to identify this documentation effort without suggesting domain implementation has begun.

The planning research found differing meanings of partial barre. Source review confirmed that Niedt distinguishes his specialized interior contact from the broader use of partial barre. A barre's extent and its responsibility for the sounding notes differ; the full-F example demonstrates this without importing an anatomical claim.

The Heijink publisher retrieval failed, but the university-hosted author copy made the methods and discussion available. The reference therefore records selected full-paper text review rather than the initial abstract-only status. No notation figures were used or claimed visually verified.

Two educational sources contain wording that should not become domain rules: Berklee's earlier numbered-finger paragraph labels them plucking fingers, and Yamaha's transposition discussion says the notes stay the same. Fender corroborates the fretting-finger convention; the derived pitch examples preserve the distinction between a movable shape and its pitches. Neither source's inconsistent wording is adopted.

The first arithmetic check accidentally parsed a trailing prose comma as another scale fret. Tightening the temporary parser to accept only comma-separated integers resolved that checker error; the reference's eight-note sequence needed no correction.

## Decision Log


2026-10-05, user-approved scope: use ordinary six-string, single-string-course, chromatically fretted examples; focus on fretting-hand realization with sounding, muting, release, and sustain obligations. This is an editorial model, not a supported-instrument decision.

2026-10-05, user-approved scope: preserve candidate-generation ownership, minimum guarantees, representations, technique support, and ergonomic calibration as open questions. Research findings do not become entries in `docs/DECISIONS.md`.

2026-10-05, Codex implementation choice: use a durable ExecPlan for the source ledger and staged research continuation, as authorized in the approved plan. Use original prose and derived tables, with no copied source illustrations.

2026-10-05, Codex editorial choice: state a deliberately limited single-contact/same-fret-barre model beside its contradictions. Treat reach, force, selective contacts, and substitutions as additional questions; no model failure is promoted to a universal anatomical conclusion. Record a sustained-note substitution's required contact transfer rather than assuming an available finger makes it work.

## Outcomes & Retrospective


All three milestones are complete. The reference covers all eleven requested example families, combining the contradictory assignment and valid-voicing/invalid-fingering requirements in one C-major case. Source verification, calculations, local navigation, Markdown structure, and the six-file documentation-only scope passed the checks recorded below. The two new files and four tracked integration diffs were inspected directly.

The evidence supports qualitative distinctions and conditional model reasoning. It does not calibrate a universal comfortable span, force demand, shift speed, or player profile. No API, scoring method, technique-support promise, or candidate-generation owner was selected. The main lesson is to distinguish source terminology, model assumptions, and measured study results explicitly instead of making any one of them a general physical law.

## Context and Orientation


`AGENTS.md` owns working instructions and the ExecPlan threshold. `docs/ARCHITECTURE.md` owns boundaries and implementation facts; `docs/DECISIONS.md` records persistent accepted choices. The two existing references own sourced music theory and physical instrument mapping. They use adjacent citations, explicit assumptions, classified statements, derived examples, and source-verification notes.

Music Theory determines musical content, including registered voicing content and contextual omissions. Fretboard maps that content to available string/fret locations and supplies instrument facts. Playability assesses a proposed realization under stated contact, player, technique, and timing assumptions. `Chord`, `ChordVoicing`, and `Fingering` are conceptual distinctions here, not chosen TypeScript types. A chord grip normally has concurrent obligations; a scale fingering follows events and transitions through time. Neither a note map nor failure of one assignment proves a general playability conclusion.

The new reference covers terminology, contact semantics, finger assignments, simultaneous grips, barres, reach/geometry, melodic fingering, shifts, feasibility versus ergonomics, player variability, limitations, worked examples, and sources. Geometry equations remain owned by the Fretboard Reference. Detailed picking-hand mechanics, medical guidance, extended-technique models, software design, and optimization are outside scope.

## Plan of Work


Milestone 1 establishes the evidence. Revisit the planned educational, research, and instrument sources, read the exact supporting passages, and populate the ledger below. Seek independent corroboration or a transparent derivation for foundational claims. A source that cannot be inspected must retain its access limitation; do not invent missing evidence. Completion means each of the six research questions has a sourced treatment or an explicit limitation.

Milestone 2 produces the reference. Write the approved sections with definitions and assumptions beside the claims they qualify. Include all eleven requested example families and additional open/muted/capo/supporting-contact boundaries. Recompute registered pitches and geometry, and explain why a simplified model cannot establish universal human feasibility. Completion means the examples can be reasoned through using the document without an unstated default or software design.

Milestone 3 integrates and verifies the documentation. Add the parallel consultation and ownership entries to `AGENTS.md`, a reference link and assessment clarification in architecture, navigation in README, and a physical-execution cross-link in the Fretboard Reference. Update the now-stale absence-of-plans statements. Inspect the full new files, tracked diffs, local links/anchors, reference labels, Markdown tables, and whitespace. Completion requires only the six authorized Markdown files to differ, with actual validation recorded.

## Concrete Steps


Work from `C:\Users\simoa\Documents\fretbo-AI-rd` in PowerShell. Use the existing read tools and web retrieval for source research; no installation is needed. Git requires a per-command ownership exception in this sandbox:

    git -c safe.directory=C:/Users/simoa/Documents/fretbo-AI-rd status --short
    git -c safe.directory=C:/Users/simoa/Documents/fretbo-AI-rd diff --check
    git -c safe.directory=C:/Users/simoa/Documents/fretbo-AI-rd diff -- AGENTS.md README.md docs/ARCHITECTURE.md docs/FRETBOARD_REFERENCE.md
    Get-Content -LiteralPath docs/PLAYABILITY_REFERENCE.md
    Get-Content -LiteralPath plans/playability-reference.md

At completion, expect four modified tracked Markdown files and the new reference and plan. Use an ephemeral PowerShell or existing Node command to resolve local Markdown targets/heading anchors and to recompute example values; do not add test infrastructure. Review source passages and model qualifications manually because link success and arithmetic do not prove physical correctness. Application tests/builds are not relevant to these documentation-only edits and will not be reported as run.

## Validation and Acceptance


All eleven example families must have explicit tuning/string/register/contact assumptions and relevant timing: open C, full-barre F, partial-barre F, contradictory assignment, valid voicing with invalid assignment, large span, alternate E-major assignments, positional scale, shifted scale, sustained-note/finger-reuse conflict, and equivalent pitch locations in a passage. Also address all-open cases, support contacts, muted versus unplayed strings, capo coordinates, and excluded techniques.

Each substantive statement needs a source, a declared definition/convention, or a derivation from supported assumptions. Separate source observations from pedagogical recommendations and from this document's illustrative model. No universal comfortable span, average-player profile, score weights, implicit tone deletion, implementation guarantee, or generation-owner decision is acceptable. Maintain the existing chord/voicing/fingering distinctions and documentation ownership. Check all new relative links, anchors, reference labels, table column counts, conflict markers, and trailing whitespace, including untracked files that ordinary `git diff` omits.

## Idempotence and Recovery


Source reads and validation commands are repeatable. Recheck Git status before resuming and preserve any concurrent user changes. Amend only task-owned passages; no reset, clean, commit, or publishing action is authorized. If a source is inaccessible, use independently corroborated accessible material, limit the claim to the evidence retrieved, or state the gap. No research-access failure authorizes fabricated thresholds or an expansion of the task.

## Artifacts and Notes


The [reference source register](../docs/PLAYABILITY_REFERENCE.md#sources-and-verification) contains the full titles, authors, URLs, and verification date. All entries below were reviewed on 2026-10-05. “Text” means relevant prose or formulas were accessible and read; it excludes visual verification of figures and a claim to have audited the entire site. The two Berklee pages are one institutional perspective, as are the Fender pages; the abstract and full paper are one study.

| Claim and classification | Assumptions | Exact supporting section/page | Corroboration or derivation | Access and limits |
| --- | --- | --- | --- | --- |
| Chord, voicing, location, and fingering differ: definitions | Existing project domain boundaries | Music Theory Reference, “Identity, inversion, and voicing”; Fretboard Reference, “Frets, locations, and range”; Heijink p. 339 | Separates musical content from instrument placement and finger-position sequence | Local text and paper text; conceptual terms, no new types |
| Finger notation and diagram silence: convention | Ordinary fretting notation | Fender, “How to Read a Chord Chart,” numbered fingers and X/O paragraphs | Berklee “Fretboard diagrams”; contradictory earlier wording excluded | Text; X can mean muted or unplayed, not a proven technique |
| Effective stop versus support: physical fact/derivation | Ordinary speaking segment, clean firm fret stops | Fretboard “Instrument structure and terminology”; UNSW “Harmonics and modes”; Yamaha section 6 | Bridgeward endpoint determines the ordinary speaking length; full-F construction cross-checks lower-barre support | Text; harmonics, damping, force, and transients require more information |
| Barre extent and partial-barre terms: definition/practice | Same-fret ordinary contact; named specialist usage kept separate | Berklee “Fretboard diagrams”; Yamaha section 6; Niedt opening terminology note and adjacent-string clearance prose | Independent teaching sources corroborate shared contact; Niedt supplies a terminology counterexample only | Text; no inherited anatomical/genetic limits or copied diagrams |
| Concurrent assignment contradiction: model consequence | One ordinary contact or contiguous same-fret barre per finger at a time | Reference “Finger assignment” and C-major counterexample | Different fret duties contradict the declared allowed modes; the alternate C assignment preserves the voicing | Original logical derivation, not an empirical impossibility claim |
| Position and alternate paths: convention/practice | Ordered events; fingers need not all remain down | Yamaha section 3; White “Reading Skills,” positional versus diagonal discussion and closing paragraphs | Independent institutional corroboration; both derived scales preserve registered pitches | Text; one-finger-per-fret is organizational, not anatomy |
| Thumb duties vary: practice | Explicitly distinct stopping, support, and damping duties | Fender chart's T notation; Fender thumb-muting article, opening explanation and back-of-neck discussion | Ordinary contact semantics distinguish the duties | Text; descriptive technique, not a fifth resource in the examples |
| Duration/release changes the task: practice/derivation | Requested sounding intervals govern concurrent contacts | Trinity guitar errata, Guitar Exam Pieces from 2020, Grade 4 “Gavotte”; Heijink Method pp. 341–343 and Discussion pp. 348–350 | Sustained C4/reused finger counterexample derives from continued effective-stop requirement | Text and selected PDF text; repertoire correction is not permission to shorten arbitrary notes |
| Movement and timing matter: empirical finding | Six male professionals; prescribed single-note sequences, fixed tempo, one guitar | Heijink Method pp. 341–343; pre/posttest and Discussion pp. 347–350 | Study informs relevant questions, not calibrated limits; endpoint/transition distinction also follows from time-dependent obligations | Publisher failed; author university PDF accessible; forces and population-wide thresholds not established |
| Posture/player context varies: empirical finding/limitation | Selected experienced players, short laboratory performances | Portnoy Methods 2.1–2.3 and Discussion limitations | Identifies the study's observational and sampling boundaries | Text; 25 participants, 22 men; no causal injury prediction or universal reach profile |
| Fret span differs from longitudinal distance: definition/derivation | Ideal equal-tempered fret layout and specified scale length | Fretboard “Mathematical and physical relationships”; Mottola “Modern Method” twelfth-root formula | Subtract fret coordinates; recompute four distance rows and octave scaling | Text/formulas; crown separation does not measure fingertip reach |
| Width, spacing, radius, and back profile differ: instrument facts | Measurement location and spacing convention must be specified | StewMac I-0673 outer-string placement/spacing instructions; Fender radius definition and compound-radius discussion; Fender American Elite C-to-D profile description | Outer-string margins prevent substituting nut width for spacing; curvature and back contour describe different surfaces | Text; product comfort/prevalence claims excluded |
| Geometry alone does not establish effort: model limitation | Action, strings, contact, posture, access, and player unspecified | UNSW length/tension discussion; existing ideal Fretboard assumptions; limits of cited movement studies | These omitted variables are questions for a richer assessment, not selected coefficients | No force measurements or medical assessment conducted; unsupported thresholds remain absent |

Research-question resolution: effective speaking endpoints distinguish stopping from support; barre terminology is explicitly contextualized; only declared contact-model contradictions are asserted; transitions require release, preparation, articulation, sustain, and time; the selected studies do not establish transferable player thresholds; and fret-number span, millimetre separation, anatomical reach, and neck access remain distinct. Richer techniques and individual comfort are documented limitations, not unresolved placeholders for invented defaults.

Calculation evidence: a temporary Node command used standard-tuning semitone values and derived pitch names to compare 63 values across four chord rows, two scale rows, boundary cases, and effective full-barre stops. All matched. It recomputed each distance as L × (2^(−a/12) − 2^(−b/12)); rounded results were 126.2, 63.1, 118.8, and 59.4 mm. The checks verify arithmetic and described contact consequences, not human performance. No scripts or fixtures were added to the repository.

Final documentation validation on 2026-10-05: the temporary Node audit checked all six changed files as strict UTF-8, resolved 85 local link/anchor occurrences and 90 reference-label uses, and checked column consistency in 21 Markdown tables, conflict markers, trailing whitespace, and this plan's heading spacing. It reported no issues. These totals include unchanged content in the four integration files. The new reference contains 15 external source URLs; the relevant source passages were read as recorded above. Markdown syntax was checked, but no browser rendering or source-figure inspection is claimed.

`git diff --check` passed with no output. `git status --short --untracked-files=all` showed exactly four modified Markdown files (`AGENTS.md`, `README.md`, `docs/ARCHITECTURE.md`, `docs/FRETBOARD_REFERENCE.md`) and the two new Markdown files (`docs/PLAYABILITY_REFERENCE.md`, this plan). The Music Theory Reference, accepted decisions, ExecPlan protocol, application, dependencies, and tests are unchanged. Application tests and builds were intentionally not run for this documentation-only scope. No commit or external publication was made.

## Interfaces and Dependencies


Only Markdown navigation and consultation instructions change. Existing domain responsibilities remain authoritative. No public API, data schema, implementation, runtime dependency, test fixture, UI, AI tool, or ergonomic scoring system is introduced. Browsing supplies evidence for documentation, not a runtime dependency.

Revision note: 2026-10-05, Codex: initialized the authorized effort after a fresh preflight, then recorded verified source contexts, access limitations, research resolutions, calculations, integration, and final documentation acceptance. All milestones are complete; empirical and model limitations remain explicit in the reference.
