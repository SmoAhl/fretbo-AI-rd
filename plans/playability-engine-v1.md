# Playability Engine v1 — Geometry, instances, and independent fingering evidence


This plan follows [.agent/PLANS.md](../.agent/PLANS.md). Keep progress, findings, decisions, and verification evidence current throughout the implementation effort.

## Purpose / Big Picture


Implement Playability v1 using four separate responsibilities:

1. ChordShapeFormula describes deterministic discrete string/fret geometry.
2. ChordShapeInstance places that geometry on an explicit fretboard.
3. FingeringWitness describes an independent complete execution of a concrete instance.
4. PlayabilityAssessment combines structural and musical validation with separately validated fingering evidence.

V1 includes all 13 unique documented reference grips from docs/PLAYABILITY_REFERENCE.md. Their geometry is represented by 12 formulas and 13 placements. Their complete finger assignments are represented separately by 13 initial reviewed witnesses.

A formula and placement can support multiple witnesses. Changing, rejecting, or adding a witness must not change or duplicate the formula or concrete geometry.

The observable completion criterion is that all 13 documented instances reproduce the source geometry and complete fingerings, pass generic validation, and receive recommendation eligibility for compatible musical requests.

The user authorized implementation, testing, and review of Milestone 1 on 2026-10-30. Milestones 2–4 remain outside the current implementation scope.

## Progress


- [x] 2026-10-30T08:27:08Z: Rechecked repository instructions, complete planning protocol, accepted decisions, source contracts, handoff documents, and the Playability Reference.
- [x] 2026-10-30T08:27:08Z: Confirmed clean working tree at 86fd8cc.
- [x] 2026-10-30T08:27:08Z: Recalculated formula identity using only string states and normalized fret geometry: 12 formulas, 13 placements.
- [x] 2026-10-30T08:27:08Z: Separated all documented finger assignments and barres into independent witness specifications.
- [x] 2026-10-30T08:42:07Z: Reconfirmed clean Git status, current instructions and reference scope, then persisted the complete latest geometry-first plan as plans/playability-engine-v1.md under the user's planning-only authorization.
- [x] 2026-10-30T08:45:16Z: Read the complete saved document and verified all 12 required sections, four milestones, 12 geometry-only formulas, 13 placements, 13 independent witnesses, 13 pitch fixtures, future integration requirements, heading spacing, local Markdown links, and new-file whitespace. All 13 geometries and finger rows match the reference; all complete contacts and pitch fixtures agree. No discrepancies found. Git status contains only this new plan; no production code or tests changed.
- [x] 2026-10-30T09:04:00Z: Milestone 1 complete: geometry-only formulas, concrete instantiation/resolution, 12 formulas and 13 placements, 114 new tests, updated architecture/handoff, and final review. All 446 focused tests and type checking passed; tracked and new-file whitespace checks passed. Milestones 2–4 remain unimplemented.
- [ ] Milestone 2: Independent fingering witnesses and generic contact validation.
- [ ] Milestone 3: Musical assessment and reviewed physical support.
- [ ] Milestone 4: Full verification, documentation, and completion review.
- [x] 2026-10-30T10:13:12Z: Documented the post-implementation review's reference-ID maintenance finding under the user's documentation-only authorization. No implementation or test changes made for this follow-up.
- [ ] Deferred maintenance: replace array-index-derived reference formula IDs with explicit stable IDs, preserving current ID-to-geometry mappings. Add checks for unique IDs and valid placement references. Implementation requires separate authorization; see Deferred maintenance below.

## Surprises & Discoveries


2026-10-30T09:00:39Z: The first focused run passed all 332 existing Fretboard tests, but both new suites failed during module loading with the previously documented sandbox temporary SSR-cache ENOENT. No new-suite assertion ran. Type checking passed. The identical focused command outside the sandbox passed all 446 tests. No tooling change was needed.

2026-10-30T09:04:00Z: Self-review found a test whose one-string board was itself invalid, allowing it to pass without exercising formula/board count mismatch. Corrected that fixture to a valid one-string board and reran the focused command successfully. No production defect or source-row discrepancy was found during review.

2026-10-30, post-implementation review: `referenceChordShapeFormulas()` in `domain/playability/reference-grips.ts` derives formula IDs from the `patterns` array index, while placement records reference fixed IDs. Reordering patterns or inserting a pattern between existing entries would change those IDs' geometry associations. Current source-row tests protect the documented placements, and no current incorrect placement was found. This is a deferred maintenance risk, not a Milestone 1 blocker.

Removing fingering information does not reduce the current formula count further. Five geometries contain open strings; seven contain no sounding open strings. Only F major and E-shaped C major share the same normalized geometry.

Open and closed CAGED forms remain distinct because open and fretted-at-anchor states are geometrically different. Their separation no longer depends on finger assignments.

The previous anchor definition used the lowest held finger contact. That would make geometry depend on its witness. Replace it with a geometry-only definition: closed formulas normalize against the lowest selected sounding fretted location. Open formulas retain the nut as their origin.

A witness may include lower barre contacts hidden beneath higher sounding stops. Those contacts affect witness validation and contact span, but must not change the formula, instance anchor, or sounding geometry.

No contradiction was found in the 13 documented assignments under the discrete contact model. The C-major A, G, and D forms trigger wider finger-gap review heuristics, but the reference already supplies reviewed complete assignments. Do not convert those heuristics into new hard prohibitions.

## Decision Log


2026-10-30, user: ChordShapeFormula contains only explicit string states and relative fret geometry. Finger identities, contacts, barres, ergonomic heuristics, and review evidence are excluded.

2026-10-30, user: FingeringWitness is independent of geometry. A single formula and placement must support multiple alternative witnesses.

2026-10-30, plan author: Geometry identity is the ordered physical-position/state/relative-fret pattern. Ignore formula IDs, musical labels, tuning, witnesses, review metadata, and ergonomic measurements when comparing geometry.

2026-10-30, plan author: Retain 12 geometry formulas, 13 documented placements, and 13 initial reviewed witnesses. Deduplicate the repeated open-C example.

2026-10-30, plan author: Store concrete witness contacts at absolute frets. Do not introduce another relative fingering-template system in v1.

2026-10-30, plan author: Retain independent structural, musical, and physical-support findings. Formula validity, successful instantiation, and contact consistency do not independently establish practical approval.

These choices preserve D019, D054, and D055. This planning task changes no accepted decisions.

2026-10-30, implementation author: Geometry records explicitly cover every board string, with canonical ascending physical-position output. Formula validation rejects non-normalized offsets rather than silently shifting them. All-open and all-silent formulas are valid; without any sounding fretted stops, anchor zero is the canonical placement. This extends the same geometry-only rules without selecting fingering or recommendation policies.

2026-10-30, implementation author: Structural candidate contradictions return an invalid finding with a reason; malformed boards retain Fretboard RangeError behavior. Construction and comparisons reject invalid geometry with RangeError. Concrete provenance is optional, copied, and excluded from geometry comparison. Library getters return fresh copies; the bounded reference helper selects one documented placement at a time so short boards are checked per instance.

## Outcomes & Retrospective


The geometry-first planning audit is complete. No unresolved domain blocker was found.

The revised design preserves all documented coverage while removing fingering and approval from the geometry model. Future shape derivation can supply new geometry without requiring chord-specific validation code.

Milestone 1 now provides geometry representation and instantiation. Milestone 3 first provides the complete reviewed recommendation capability. V1 completion requires milestone 4.

The planning document was originally persisted under planning-only authorization. Milestone 1 is complete under the subsequent explicit user request. All 13 source geometries and pitch fixtures pass, using 12 distinct formulas; F major and E-shaped C share shape-08. Generic validation preserves separate open/fretted/muted/unplayed states, board identity and physical order, safe coordinates, and independent copies. No witness, musical-assessment, or practical-approval behavior is implemented. No remaining Milestone 1 blocker was found; practical usability remains deliberately unestablished until later witness and assessment milestones.

### Deferred maintenance


The reference-ID finding above remains open. Before expanding or reorganizing the reference library, the recommended follow-up is to store an explicit ID with each geometry definition in `domain/playability/reference-grips.ts`, rather than derive it from array position. Preserve all current `shape-01` through `shape-12` associations and the 13 placement records. Verify unique formula IDs, resolution of every placement's formula reference, and unchanged source geometries and pitches in the existing focused suites. Explicit IDs should remain attached to their geometry regardless of definition order.

The user has authorized documenting this finding only and explicitly deferred its implementation. No fix or additional tests have been implemented; this entry does not authorize them or change accepted project decisions.

## Context and Orientation


The reviewed repository was clean at 86fd8cc before this plan was created. The implementation continuation also began with a clean working tree. Playability's geometry foundation is now implemented; witnesses and assessment remain unimplemented.

Existing authoritative boundaries:

- domain/fretboard/fretboard.ts owns explicit strings, physical positions, registered tuning, available frets, and deterministic pitch-location mapping.
- domain/music-theory/chords-symbols-and-realization/chord-formulas.ts owns musical degree formulas and chord-tone construction.
- domain/music-theory/chords-symbols-and-realization/registered-chords.ts preserves explicit registered voicings, order, spellings, and repeated occurrences.
- domain/music-theory/chords-symbols-and-realization/chord-voicing-analysis.ts owns known-chord coverage, omission policy, and bass analysis.
- docs/FRETBOARD_V1.md and docs/MUSIC_THEORY_V1.md describe information consumers must preserve.
- docs/PLAYABILITY_REFERENCE.md owns the reference geometry, complete fingerings, barre behavior, and practical-support conventions.

A musical ChordFormula is not a physical ChordShapeFormula. Musical formulas specify harmonic requirements; they do not select strings, frets, registers, doublings, or a unique usable grip.

### ChordShapeFormula


The formula contains only:

- An opaque identifier.
- Explicit states for physical string positions.
- Relative fret offsets for fretted sounding positions.

States distinguish open, fretted, muted, and unplayed. Muted declares an intended nonsounding state; it contains no muting technique or contact.

The formula contains no finger numbers, contacts, barres, witnesses, tuning, chord identity, pitches, ergonomic limits, or review fields. It does not point to witness records.

A formula's identity excludes its identifier. Canonical comparison orders states by physical position and compares state plus relative fret offset.

Open/closed classification is derivable from the states; it need not be stored as another source of truth.

For the built-in open formulas, the coordinate origin is the nut and the anchor is 0. Open states always remain actual fret 0.

Closed formulas have no sounding open states. Their lowest selected sounding fretted position has offset 0, and placement uses a positive anchor. This anchor is not necessarily a chord-root fret.

No finger-contact information participates in normalization.

### ChordShapeInstance


An instance is concrete geometry on the supplied board: explicit string states, stable string IDs, and absolute sounding frets.

Placement records retain formula ID and anchor as construction provenance. This provenance is not review evidence or a prerequisite for validating arbitrary supplied geometry.

Instantiation maps physical positions to board IDs and performs checked fret-coordinate addition. It obtains sounding pitches through registeredPitchAtLocation rather than calculating pitches itself.

Instance identity and comparison depend on actual geometry in the board context, not on a caller's claimed reference ID.

The instance contains no embedded fingering, preferred witness, or approval flag.

### FingeringWitness


A witness is associated with one concrete instance and contains complete absolute finger contacts.

Each used finger has one contact at one positive fret over an inclusive physical-position interval. A one-position interval is an individual stop; a longer interval is a continuous barre.

Witnesses reference their associated instance rather than copying its geometry. More than one witness may reference the same instance.

Trusted reference records separately associate witnesses with their source and reviewed support context. Review is specific to the witness and context; it is not inherited by other fingerings of the same instance.

The initial library has one documented witness per instance. The implementation must nevertheless support one-to-many associations.

### Geometry inventory


Notation runs from conventional string 6 to string 1:

- o: explicitly open.
- x: explicitly unplayed.
- fN: fretted sounding position at relative offset N.
- f0 is a fretted state at the anchor, not an open string.

Formula IDs are opaque geometry identifiers. The table contains no execution information.

| Formula ID | Relative string geometry |
| --- | --- |
| shape-01 | x f3 f2 o f1 o |
| shape-02 | x o f2 f2 f2 o |
| shape-03 | f3 f2 o o o f3 |
| shape-04 | o f2 f2 f1 o o |
| shape-05 | x x o f2 f3 f2 |
| shape-06 | x f0 f2 f2 f2 f0 |
| shape-07 | f3 f2 f0 f0 f0 f3 |
| shape-08 | f0 f2 f2 f1 f0 f0 |
| shape-09 | x x f0 f2 f3 f2 |
| shape-10 | x f0 f2 f2 f1 f0 |
| shape-11 | f0 f2 f2 f0 f0 f0 |
| shape-12 | x x f0 f2 f3 f1 |

All built-in formulas describe six positions, but generic validators must not hardcode six strings or named chord qualities.

### Documented placements


These records select geometry and placement only. Review evidence belongs to the associated witnesses.

The absolute rows are independent acceptance fixtures, not duplicated production geometry.

| Instance ID | Formula | Anchor | Expected absolute frets 6 → 1 |
| --- | --- | --- | --- |
| open-c-major | shape-01 | 0 | x 3 2 0 1 0 |
| open-a-major | shape-02 | 0 | x 0 2 2 2 0 |
| open-g-major | shape-03 | 0 | 3 2 0 0 0 3 |
| open-e-major | shape-04 | 0 | 0 2 2 1 0 0 |
| open-d-major | shape-05 | 0 | x x 0 2 3 2 |
| c-major-a-shape | shape-06 | 3 | x 3 5 5 5 3 |
| c-major-g-shape | shape-07 | 5 | 8 7 5 5 5 8 |
| c-major-e-shape | shape-08 | 8 | 8 10 10 9 8 8 |
| c-major-d-shape | shape-09 | 10 | x x 10 12 13 12 |
| c-minor-a-shape | shape-10 | 3 | x 3 5 5 4 3 |
| c-minor-e-shape | shape-11 | 8 | 8 10 10 8 8 8 |
| c-minor-d-shape | shape-12 | 10 | x x 10 12 13 11 |
| f-major-full-barre | shape-08 | 1 | 1 3 3 2 1 1 |

A board with fretCount 13 can contain the complete set. Do not impose that count globally: each instance needs only its own selected locations.

### Independent reviewed fingering inventory


Each row describes a separate witness associated with the named instance.

Contact notation finger@fret:[positions] uses absolute frets and inclusive physical positions. These contacts must not appear in ChordShapeFormula records.

| Instance | Expected sounding fingers 6 → 1 | Complete absolute contacts |
| --- | --- | --- |
| open-c-major | x 3 2 0 1 0 | 1@1:[2]; 2@2:[4]; 3@3:[5] |
| open-a-major | x 0 1 2 3 0 | 1@2:[4]; 2@2:[3]; 3@2:[2] |
| open-g-major | 2 1 0 0 0 4 | 1@2:[5]; 2@3:[6]; 4@3:[1] |
| open-e-major | 0 2 3 1 0 0 | 1@1:[3]; 2@2:[5]; 3@2:[4] |
| open-d-major | x x 0 1 3 2 | 1@2:[3]; 2@2:[1]; 3@3:[2] |
| c-major-a-shape | x 1 2 3 4 1 | 1@3:[1–5]; 2@5:[4]; 3@5:[3]; 4@5:[2] |
| c-major-g-shape | 3 2 1 1 1 4 | 1@5:[2–4]; 2@7:[5]; 3@8:[6]; 4@8:[1] |
| c-major-e-shape | 1 3 4 2 1 1 | 1@8:[1–6]; 2@9:[3]; 3@10:[5]; 4@10:[4] |
| c-major-d-shape | x x 1 2 4 3 | 1@10:[4]; 2@12:[3]; 3@12:[1]; 4@13:[2] |
| c-minor-a-shape | x 1 3 4 2 1 | 1@3:[1–5]; 2@4:[2]; 3@5:[4]; 4@5:[3] |
| c-minor-e-shape | 1 3 4 1 1 1 | 1@8:[1–6]; 3@10:[5]; 4@10:[4] |
| c-minor-d-shape | x x 1 3 4 2 | 1@10:[4]; 2@11:[1]; 3@12:[3]; 4@13:[2] |
| f-major-full-barre | 1 3 4 2 1 1 | 1@1:[1–6]; 2@2:[3]; 3@3:[5]; 4@3:[4] |

The trusted review context is standard six-string guitar tuning. Registered open pitches by positions 1 through 6 are [52,47,43,38,33,28], using C0 = 0.

That context belongs to evidence records, not formulas.

### Implementation organization


Use a small domain/playability folder:

- chord-shape-formula.ts: geometry-only formula types and instantiation.
- chord-shape.ts: concrete instance types and structural resolution.
- fingering-witness.ts: independent witness types and generic contact validation.
- reference-grips.ts: separate formula, placement, and reviewed-witness collections.
- playability.ts: musical and evidence assessment composition.

The formula module must not depend on witness types, contact validation, or review data. Use existing direct relative .js imports and no new dependencies.

## Plan of Work


### Milestone 1 — Geometry-only formulas and instances


Purpose: establish a reusable physical representation without fingering assumptions.

Dependencies: existing Fretboard contracts.

Implement formula and instance types, geometry validation, checked instantiation, structural resolution, and the 12 geometry definitions with 13 placement records.

Formula validation checks explicit positions and states, valid offsets, and geometry-only normalization. It does not check finger count, barres, reach, or practical playability.

Instantiation maps positions to stable board IDs and resolves pitches through Fretboard. Keep the initial supported application path limited to documented placements; do not enumerate arbitrary anchors.

Reference coverage: all 13 absolute geometry rows must be reproduced.

Acceptance:

- Geometry-only identity yields exactly 12 built-in formulas.
- F and E-shaped C share shape-08.
- Open C appears once.
- Open strings remain actual fret 0.
- Built-in open formulas use anchor 0; nonzero open-form placement is not silently treated as transposition.
- Closed offset 0 produces a fretted stop at a positive anchor.
- Anchors depend on sounding geometry, never contacts.
- All formula and instance types exclude fingering and approval fields.
- IDs, array order, tuning, and witnesses do not affect formula identity.
- Invalid bounds and unsafe addition fail explicitly.
- Short-board availability is evaluated per instance.
- Outputs preserve existing readonly/copy conventions.

Focused suites: tests/chord-shape-formula.test.ts and tests/playability-shape.test.ts.

Include independent source rows, retuning with unchanged geometry, noncontiguous IDs, record permutations, frozen inputs, numeric boundaries, and all-open/no-contact geometry where applicable.

Verify:

    npm test -- tests/chord-shape-formula.test.ts tests/playability-shape.test.ts tests/fretboard.test.ts
    npm run typecheck

These Playability suites now exist as part of Milestone 1.

### Milestone 2 — Independent witnesses and generic contact validation


Purpose: validate execution separately from geometry.

Dependencies: milestone 1.

Implement FingeringWitness, explicit instance association, one-to-many witness handling, generic contact validation, and all 13 documented witness records.

Review source/context remains separate from the generic consistency checker.

Validate fingers 1–4, one simultaneous contact per used finger, positive absolute frets, physical intervals, complete barre coverage, highest-stop behavior, required fretted stops, and open-string clearance.

Calculate contact span from the witness, including hidden lower barres. No contacts means span null. Do not write that span back into the formula or use it to redefine the instance anchor.

Reference coverage: every documented witness must pass and reproduce its exact sounding-finger row.

Acceptance:

- Seven no-barre, three partial-barre, and three full-barre witnesses pass.
- Lower contacts survive higher stops.
- Contact under an unplayed string does not make it sound.
- Missing stops, incompatible duties, and open-string conflicts reject the witness.
- A failed witness leaves geometry validity unchanged.
- Two witnesses can target one instance without copying or changing geometry.
- Wider-gap review triggers and same-fret ordering do not become invented universal prohibitions.
- Mechanical consistency grants no practical approval.

Mandatory separation regression: use one synthetic concrete geometry with two mechanically consistent witnesses, one containing a lower hidden barre. Its formula, anchor, and sounding geometry must remain identical while witness contact span differs. This fixture is not added to the reviewed library.

Also test one invalid and one valid witness associated with the same instance. The invalid witness must not veto the valid one.

Verify:

    npm test -- tests/playability-witness.test.ts tests/chord-shape-formula.test.ts tests/playability-shape.test.ts
    npm run typecheck

### Milestone 3 — Musical assessment and reviewed physical support


Purpose: compose independent findings using existing domain capabilities.

Dependencies: milestones 1 and 2.

Implement assessChordShape over supplied concrete geometry, musical requirements, and the trusted reviewed-witness library.

Structural checking uses actual instance geometry. Musical checking uses Fretboard-derived pitches and existing Music Theory analysis. Physical support requires at least one applicable reviewed witness that passes generic validation.

Reference lookup must compare actual geometry and board context. Caller-provided IDs are not approval certificates.

Reference coverage: all 13 instances receive matching musical findings, supported physical findings, and recommendation eligibility for compatible requests.

Acceptance:

- Musical mismatch does not erase physical support.
- An unreviewed placement of a known formula remains unverified.
- Another fingering of a supported instance does not inherit witness approval.
- Multiple applicable reviewed witnesses can be reported independently.
- Invalid or unsupported witnesses cannot confer approval.
- Exact registered matching preserves every occurrence, register, and doubling.
- Explicit bass and optional-role policies retain existing semantics.
- Unknown shapes and witnesses are not called physically impossible.
- Muted versus unplayed remains distinct; unsupported muting stays unverified.
- Matching and validation contain no branches keyed to named chord qualities.

Include a custom musical ChordFormula using existing APIs to verify that musical assessment does not depend on a catalog quality name. Do not add a new production shape family.

Verify:

    npm test -- tests/playability.test.ts tests/playability-references.test.ts tests/playability-witness.test.ts tests/chord-shape-formula.test.ts tests/fretboard-music-theory.test.ts tests/chord-voicing-analysis.test.ts tests/registered-chords.test.ts
    npm run typecheck

This milestone first provides complete reviewed recommendation capability.

### Milestone 4 — Regression, documentation, and completion review


Purpose: verify the geometry-first boundary and all documented coverage.

Dependencies: milestone 3.

Audit formulas, placements, and witnesses separately against docs/PLAYABILITY_REFERENCE.md. Confirm that no finger/contact/review information has migrated into geometry records and no geometry is duplicated merely to represent an alternative witness.

Run full regression and type checking after focused verification passes.

Update docs/ARCHITECTURE.md, the relevant Fretboard handoff, and docs/PLAYABILITY_V1.md. Document the four responsibilities, one-to-many witness relationship, exact matching guarantees, reference coverage, and future integration boundary.

Preserve the Playability Reference and accepted decisions. Record persistent implementation contracts only within the later implementation task's authority.

Completion requires:

- 12 distinct geometry formulas and 13 documented placements.
- All 13 documented complete fingerings represented as independent reviewed witnesses.
- Exact source geometry, finger rows, barres, and pitch fixtures passing.
- One-to-many witness and hidden-contact independence regressions passing.
- Full tests, type checking, documentation review, and Git review complete.
- No automatic generation, new chord families, or unrelated refactoring.

A source discrepancy must be reported and resolved explicitly, never silently corrected by substituting another fingering.

## Concrete Steps


Run from C:\Users\simoa\Documents\fretbo-AI-rd.

Before implementation, reread current instructions, this plan, and the authoritative reference. Inspect Git status and preserve any new user work.

    git -c safe.directory=C:/Users/simoa/Documents/fretbo-AI-rd status --short
    node --version
    npm --version

Use the existing Node 24.x baseline and installed tooling. No dependency changes are required.

Implement milestones in order. Run each listed focused command and npm run typecheck; review changes and record actual UTC results before marking a milestone complete.

At the final boundary run:

    npm test
    npm run typecheck
    git -c safe.directory=C:/Users/simoa/Documents/fretbo-AI-rd diff --check
    git -c safe.directory=C:/Users/simoa/Documents/fretbo-AI-rd status --short

Read new files directly and check their whitespace separately because ordinary unstaged diffs omit untracked files.

If the previously documented sandbox SSR-cache ENOENT recurs during module loading, distinguish it from assertion failures and repeat the identical command outside the sandbox when permitted. Record both outcomes without changing tooling to hide the environmental failure.

Milestone 1 execution on 2026-10-30 uses Node v24.19.0 and npm 11.6.2. The first focused test run encountered the sandbox module-cache failure recorded above. The identical outside-sandbox retry passed 446 tests across three suites; after correcting a review finding in a test fixture, the final repeat at 09:03:56Z also passed all 446 tests (114 new Playability tests plus 332 existing Fretboard tests). npm run typecheck passed initially and after the final test edit. git diff --check and git diff --no-index --check against /dev/null for every new file passed. Read all new source/test files and reviewed tracked documentation diffs, dependency direction, source rows, and Git status. No unrelated changes, staging, or commits. Full regression remains a Milestone 4 check and was not run for this additive geometry milestone.

## Validation and Acceptance


Mandatory cross-boundary regressions:

1. Formula equality ignores all fingering, source, review, and musical metadata.
2. Altering witness contacts cannot alter formula identity or instance placement.
3. One instance supports multiple witnesses without geometry duplication.
4. A hidden lower barre affects witness span but not the geometry anchor.
5. F major and E-shaped C share geometry while retaining separate concrete placements and witnesses.
6. Open strings remain at fret 0 and never become implicit fretted contacts.
7. A known formula at an unreviewed placement receives no inherited practical approval.
8. Open C requested as D major remains physically supported but musically mismatched and ineligible.
9. Exact matching rejects octave substitutions and missing or extra repeated tones despite unchanged pitch-class coverage.
10. Two requested occurrences cannot reuse one sounding string.
11. Bass is the minimum sounding coordinate, including on reentrant tuning.
12. Optional formula positions do not authorize deleting explicit registered occurrences.
13. Every intermediate barre string and every intended open string is checked.
14. Noncontiguous IDs, array permutations, and frozen inputs preserve behavior.
15. Existing generic musical descriptions work without chord-specific validation changes.

Expected source rows and pitches must be independently transcribed. Do not derive expected answers through production formulas, instantiation, or witness validation.

Type checking must confirm the readonly geometry contracts and the exclusion of finger/contact/review fields from ChordShapeFormula. Review dependency direction directly; introduce no new lint framework.

## Idempotence and Recovery


Instantiation, witness checking, and assessment are deterministic and side-effect free.

Follow existing readonly-by-type and independent-copy conventions. Do not expose mutable aliases to the trusted library or cache practical approval by board object identity.

There are no migrations, external services, or generated runtime artifacts. On continuation, inspect Git status and recorded progress before resuming. Preserve partial and unrelated work.

A witness failure must never trigger geometry rewriting or silent musical simplification.

## Artifacts and Notes


Saved path: plans/playability-engine-v1.md. The file contains the geometry-first plan as standalone Markdown, without the conversation's enclosing code fence or memory citations. The original persistence task changed only progress/evidence text; the subsequent Milestone 1 implementation updates current scope, decisions, status, and verification evidence without expanding to later milestones.

The geometry-only audit counted 13 unique absolute rows and 12 normalized geometries without using finger data. All five open geometries and seven closed geometries are distinct under explicit state semantics.

Independent C0-based pitch fixtures, in source string 6 → 1 order with unplayed strings omitted:

| Instance | Expected registered pitches |
| --- | --- |
| open-c-major | 36, 40, 43, 48, 52 |
| open-a-major | 33, 40, 45, 49, 52 |
| open-g-major | 31, 35, 38, 43, 47, 55 |
| open-e-major | 28, 35, 40, 44, 47, 52 |
| open-d-major | 38, 45, 50, 54 |
| c-major-a-shape | 36, 43, 48, 52, 55 |
| c-major-g-shape | 36, 40, 43, 48, 52, 60 |
| c-major-e-shape | 36, 43, 48, 52, 55, 60 |
| c-major-d-shape | 48, 55, 60, 64 |
| c-minor-a-shape | 36, 43, 48, 51, 55 |
| c-minor-e-shape | 36, 43, 48, 51, 55, 60 |
| c-minor-d-shape | 48, 55, 60, 63 |
| f-major-full-barre | 29, 36, 41, 45, 48, 53 |

Saved-document verification on 2026-10-30: all 12 protocol sections and four milestone headings are present; all 12 geometry patterns are distinct using geometry alone; all 13 placements reproduce the reference fret rows; all 13 independent witnesses reproduce the reference finger rows and effective stops; all 13 pitch fixtures agree with the explicit standard tuning. Witness coverage is seven without barres, three with partial barres, and three with full barres. Geometry/fingering separation, one-to-many witnesses, future Music Theory/Fretboard integration, two-blank-line heading spacing, checkbox placement, the local Markdown link, and new-file whitespace checks passed. No discrepancies were found. These were document-consistency checks, not execution of a Playability implementation.

The earlier planning audits were read-only. The later Milestone 1 implementation adds domain/playability/chord-shape-formula.ts, chord-shape.ts, reference-grips.ts and the two focused suites. Current execution evidence belongs to Concrete Steps and Progress, separate from those historical document checks.

No unresolved domain blocker remains. The main risks are reintroducing fingering into formula identity, binding anchors to hidden contacts, approving witnesses through geometry membership, and losing exact registered occurrences during musical checking.

## Interfaces and Dependencies


### Geometry and witness operations


The geometry instantiator accepts a formula, placement anchor, and explicit board and produces ChordShapeInstance geometry. It does not require a known chord quality or a reviewed formula ID.

The initial application path uses the 13 documented placements. The generic helper performs no anchor enumeration or automatic chord-shape generation.

The witness validator accepts a board, concrete instance, and associated FingeringWitness. It returns contact-consistency findings and witness measurements. It does not rewrite the instance or grant practical approval.

Instance/witness identifiers are association keys, not certificates. Validate actual geometry and board context even when identifiers appear familiar.

### Assessment contract


assessChordShape accepts concrete geometry and musical requirements. Formula provenance is not a prerequisite for validating supplied geometry.

Requirements retain an existing numeric or spelled description, optionalFormulaIndices when supplied, and an optional numeric or spelled registered voicing.

Return:

- Structural: valid or invalid, with reasons.
- Musical: matched, mismatched, or not-assessed.
- Physical support: supported, unverified, or not-assessed, with supporting witness identifiers and evidence reasons.
- Recommendation eligibility: true only when structure is valid, music matches, and physical support is supported.

Structurally invalid geometry has dependent findings not assessed. A musical mismatch must still receive independent physical assessment.

The operation assesses existence of a supported reviewed execution. It does not claim to validate arbitrary finger assignments supplied separately by a caller.

Candidate structural contradictions produce findings. Existing board and musical representation errors retain their error behavior; do not translate arbitrary exceptions into unverified support.

### Musical guarantees


Obtain all sounding coordinates through registeredPitchAtLocation. Reuse existing coverage and bass analysis.

Missing required roles, unexpected tones, or specified-bass mismatch prevent a musical match. Unspecified bass does not imply root position.

For exact registered requests, require multiset equality, including every duplicate and excluding extra sounding tones. Preserve original order and occurrence indices; deterministic associations use distinct sounding locations.

Retain original spelling. When both description and registered voicing are spelled, also use existing exact-spelled analysis on those original notes. Do not reconstruct spellings from board pitches.

Equivalent formula roles may share coverage evidence under D052. Only explicit occurrence requirements require separate physical occurrences.

### Practical-support guarantees


Trusted review evidence is attached to a complete witness and support context. It is absent from formulas and instances.

A witness must match its concrete instance, pass generic contact validation, and have applicable review evidence before it can establish support.

New witnesses do not inherit approval from another witness, their instance, or their formula. Mechanically consistent unreviewed witnesses remain unestablished for practical recommendation.

The initial support context is the documented standard six-string tuning. Other valid boards retain structural and musical assessment without inheriting that evidence.

### Future domain integration


Preserve the following development path without implementing it in v1:

1. Music Theory resolves musical ChordFormula requirements into chord tones, harmonic roles, and any explicit bass/register/omission requirements.
2. Fretboard supplies deterministic pitch-location alternatives.
3. Future candidate construction selects simultaneous string/fret geometry and derives or defines ChordShapeFormula records.
4. Existing structural and musical validation evaluates concrete instances.
5. Independent witness construction, feasibility checks, and practical review establish execution evidence.

A musical formula can have many physical realizations or none under a particular board and request. Individual available locations do not establish simultaneous realization or a usable fingering.

Minor, seventh, suspended, added-tone, extended, and custom musical structures must use the same generic validation path. Future additions should normally introduce geometry and witness data, not chord-quality branches in validators.

Do not finalize general candidate-generation ownership, search algorithms, or a generator interface in this effort.

### Deferred functionality


Defer automatic chord-shape derivation, arbitrary transposition, anchor enumeration, movable-family generation, new production chord families, general fingering solving, active muting techniques, thumb fretting, ergonomic ranking, player profiles, transitions, biomechanics, UI, audio, and AI.

Do not add formula inheritance, open-to-closed conversion, finger-remapping parameters, reusable fingering-template hierarchies, or solver frameworks.

Revision note: 2026-10-30. Finalized geometry-only ChordShapeFormula identity; retained 12 formulas and 13 placements after recalculation; moved all complete execution data into independent FingeringWitness records; preserved one-to-many witnesses, four milestones, and the future Music Theory/Fretboard integration boundary. Persisted the complete plan under planning-only authorization and updated its persistence status without changing the finalized architecture.

Revision note: 2026-10-30. Completed the explicitly authorized Milestone 1 implementation. Updated scope and implementation status, recorded geometry API details, focused verification and self-review, and preserved later milestones as unfinished. Architecture and Fretboard handoff now distinguish implemented geometry from future fingering and assessment.

Revision note: 2026-10-30. Recorded the post-implementation review's array-index-derived reference-ID risk as deferred maintenance, with the recommended remedy and verification criteria. Documentation only; implementation remains explicitly deferred pending separate authorization.
