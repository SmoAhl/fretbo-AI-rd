# Playability Engine v1 — Reusable movable geometry and fingering templates


This living plan follows [.agent/PLANS.md](../.agent/PLANS.md). The 2026-10-30 movable-template revision supersedes the original fixed-placement restrictions. Historical evidence below is retained explicitly as history.

## Purpose / Big Picture


Deliver a deterministic path from chord requirements through selected reusable templates to concrete, contact-valid, musically matched fingerings. Music Theory owns harmonic requirements, Fretboard supplies actual pitches, and Playability instantiates and assesses execution. Geometry, execution and review evidence remain separate.

The user explicitly authorized implementation of Milestones 2b, 3 and 4. Preserve the completed Milestone 1 geometry and Milestone 2 absolute witness validators. Support bounded search over known templates and template-pattern review across compatible six-string tunings. Do not implement a general fingering solver, ranking, anatomy, muting techniques, UI or AI. Do not stage or commit. The pre-existing staged Milestone 2 snapshot must remain intact.

The original 13 placements are compatibility fixtures, not the complete supported position set. V1 contains 13 distinct geometry formulas and 13 execution templates (five open, eight closed), plus the original 13 placements. The three new acceptance positions must emerge through relative construction and search, never new absolute placement records.

## Progress


- [x] 2026-10-30T08:27:08Z: Rechecked repository instructions, complete planning protocol, accepted decisions, source contracts, handoff documents, and the Playability Reference.
- [x] 2026-10-30T08:27:08Z: Confirmed clean working tree at 86fd8cc.
- [x] 2026-10-30T08:27:08Z: Recalculated formula identity using only string states and normalized fret geometry: 12 formulas, 13 placements.
- [x] 2026-10-30T08:27:08Z: Separated all documented finger assignments and barres into independent witness specifications.
- [x] 2026-10-30T08:42:07Z: Reconfirmed clean Git status, current instructions and reference scope, then persisted the complete latest geometry-first plan as plans/playability-engine-v1.md under the user's planning-only authorization.
- [x] 2026-10-30T08:45:16Z: Read the complete saved document and verified all 12 required sections, four milestones, 12 geometry-only formulas, 13 placements, 13 independent witnesses, 13 pitch fixtures, future integration requirements, heading spacing, local Markdown links, and new-file whitespace. All 13 geometries and finger rows match the reference; all complete contacts and pitch fixtures agree. No discrepancies found. Git status contains only this new plan; no production code or tests changed.
- [x] 2026-10-30T09:04:00Z: Milestone 1 complete: geometry-only formulas, concrete instantiation/resolution, 12 formulas and 13 placements, 114 new tests, updated architecture/handoff, and final review. All 446 focused tests and type checking passed; tracked and new-file whitespace checks passed. Milestones 2–4 remain unimplemented.
- [x] 2026-10-30T10:23:26Z: Inspected clean Git state at 300600f, repository instructions, complete plan/protocol, relevant references and accepted decisions, geometry APIs and tests. Began the authorized Milestone 2 continuation using Node v24.19.0 and npm 11.6.2.
- [x] 2026-10-30T12:49:00Z: Milestone 2 complete: independent witnesses, generic contact validation, all 13 source assignments with separate review contexts, 74 new tests, architecture/handoff updates, and diff/new-file review. Final focused run passed 188 tests across three suites; type checking and tracked/new-file whitespace checks passed. Milestones 3–4 remain unimplemented.
- [x] 2026-10-30T16:46:30Z: Revised Milestone 3 complete: bounded known-template search, musical assessment, exact occurrence/spelling preservation and tuning-independent reviewed-pattern support. All three requested acceptance positions pass through search.
- [x] 2026-10-30T16:32:19Z: Rechecked staged Milestone 2 work, instructions, current APIs, references and accepted contracts. No incompatibility requires changing the geometry or absolute-contact validators. Approved additions: 13 geometry/template pairs, five explicit open-to-closed associations, signed relative contacts, a 10,000-placement bounded search, and tuning-independent reviewed pattern support on compatible six-string boards.
- [x] 2026-10-30T16:46:30Z: Milestone 2b complete: signed relative contacts, checked construction, 13 canonical templates, explicit CAGED variants and compatible historical reference outputs.
- [x] 2026-10-30T16:46:30Z: Milestone 4 complete: 17,870 tests across 41 suites passed on the final full regression; type checking passed. Reviewed new/tracked files and source compatibility, updated architecture, D056 and consumer guide. No staging or commits.
- [x] 2026-10-30T10:13:12Z: Documented the post-implementation review's reference-ID maintenance finding under the user's documentation-only authorization. No implementation or test changes made for this follow-up.
- [ ] Deferred maintenance: replace array-index-derived reference formula IDs with explicit stable IDs, preserving current ID-to-geometry mappings. Add checks for unique IDs and valid placement references. Implementation requires separate authorization; see Deferred maintenance below.

## Surprises & Discoveries


Historical Milestone 1–2 observations (counts describe those snapshots):

2026-10-30T09:00:39Z: The first focused run passed all 332 existing Fretboard tests, but both new suites failed during module loading with the previously documented sandbox temporary SSR-cache ENOENT. No new-suite assertion ran. Type checking passed. The identical focused command outside the sandbox passed all 446 tests. No tooling change was needed.

2026-10-30T09:04:00Z: Self-review found a test whose one-string board was itself invalid, allowing it to pass without exercising formula/board count mismatch. Corrected that fixture to a valid one-string board and reran the focused command successfully. No production defect or source-row discrepancy was found during review.

2026-10-30, post-implementation review: `referenceChordShapeFormulas()` in `domain/playability/reference-grips.ts` derives formula IDs from the `patterns` array index, while placement records reference fixed IDs. Reordering patterns or inserting a pattern between existing entries would change those IDs' geometry associations. Current source-row tests protect the documented placements, and no current incorrect placement was found. This is a deferred maintenance risk, not a Milestone 1 blocker.

2026-10-30T12:46:53Z: Milestone 2's first focused run hit the same sandbox SSR-cache ENOENT in all three suites before assertions. The identical outside-sandbox retry passed 186 tests; type checking passed. Review then strengthened invalid-field tests so a missing required stop could not mask the intended rejection, and added seven-string barre/silent-state and familiar-ID regressions. The final run passed 188 tests. No production defect or source discrepancy was found.

Removing fingering information does not reduce the current formula count further. Five geometries contain open strings; seven contain no sounding open strings. Only F major and E-shaped C major share the same normalized geometry.

Open and closed CAGED forms remain distinct because open and fretted-at-anchor states are geometrically different. Their separation no longer depends on finger assignments.

The previous anchor definition used the lowest held finger contact. That would make geometry depend on its witness. Replace it with a geometry-only definition: closed formulas normalize against the lowest selected sounding fretted location. Open formulas retain the nut as their origin.

A witness may include lower barre contacts hidden beneath higher sounding stops. Those contacts affect witness validation and contact span, but must not change the formula, instance anchor, or sounding geometry.

No contradiction was found in the 13 documented assignments under the discrete contact model. The C-major A, G, and D forms trigger wider finger-gap review heuristics, but the reference already supplies reviewed complete assignments. Do not convert those heuristics into new hard prohibitions.

2026-10-30, movable-template continuation: the initial five-suite test run again failed before assertions with sandbox SSR-cache ENOENT. The identical outside-sandbox retry passed 233 tests. Initial type checking found a test-only union-narrowing issue; the fixture was corrected. Production modules typechecked before tests were introduced. Additional review-driven acceptance tests were completed before full regression. Review also replaced automatically generated template-review membership with an explicit reviewed-ID list so future execution data cannot silently acquire approval.

## Decision Log


Current authorized decisions, 2026-10-30, user:

- Reusable movable patterns are core v1. Add bounded template search, not arbitrary shape/finger solving.
- Reviewed complete patterns apply to compatible six-string boards regardless of tuning. Musical results always use the actual tuning.
- Preserve geometry and concrete-contact models. Add signed relative contacts, checked instantiation and an explicit closed C-major variant.
- Retain historical getters and placements. Keep existing shape IDs and append shape-13; the separately deferred array-index ID-storage cleanup is not authorized.

Implementation decisions, 2026-10-30, implementation author:

- Fingering templates associate to formula IDs; IDs never confer support. Actual normalized geometry and canonical complete contacts determine support against private reference snapshots.
- Optional custom search catalogs permit future shapes and alternative fingerings without editing algorithms. Custom data cannot add trusted review evidence.
- Search returns contact-valid, musically matched candidates with their support findings; an unreviewed custom pattern remains visible but recommendation-ineligible. Results sort by anchor, formula ID, template ID.
- Require explicit selected template IDs and an inclusive anchor range. Validate all inputs even for an empty selection. Count available template/anchor pairs before enumeration, with a separate 10,000-placement cap and BigInt arithmetic; never truncate.
- Assess supplied witnesses independently. Omitted witnesses instantiate matching reviewed patterns; an explicit empty list means no witnesses. One invalid witness cannot veto a valid supported alternative.
- Template review membership is an explicit list independent of execution-data membership; adding a library pattern does not automatically approve it.
- Exact matching preserves a copied request and maps each original occurrence to a distinct physical-position-ordered sounding-location index. Spelled exact requests also retain written membership semantics.

Historical decisions below explain Milestones 1–2. Their fixed-placement-only, no-relative-template and standard-tuning-only review restrictions are superseded by the current decisions above:

2026-10-30, user: ChordShapeFormula contains only explicit string states and relative fret geometry. Finger identities, contacts, barres, ergonomic heuristics, and review evidence are excluded.

2026-10-30, user: FingeringWitness is independent of geometry. A single formula and placement must support multiple alternative witnesses.

2026-10-30, plan author: Geometry identity is the ordered physical-position/state/relative-fret pattern. Ignore formula IDs, musical labels, tuning, witnesses, review metadata, and ergonomic measurements when comparing geometry.

2026-10-30, plan author: Retain 12 geometry formulas, 13 documented placements, and 13 initial reviewed witnesses. Deduplicate the repeated open-C example.

2026-10-30, plan author: Store concrete witness contacts at absolute frets. Do not introduce another relative fingering-template system in v1.

2026-10-30, plan author: Retain independent structural, musical, and physical-support findings. Formula validity, successful instantiation, and contact consistency do not independently establish practical approval.

These choices preserve D019, D054, and D055. This planning task changes no accepted decisions.

2026-10-30, implementation author: Geometry records explicitly cover every board string, with canonical ascending physical-position output. Formula validation rejects non-normalized offsets rather than silently shifting them. All-open and all-silent formulas are valid; without any sounding fretted stops, anchor zero is the canonical placement. This extends the same geometry-only rules without selecting fingering or recommendation policies.

2026-10-30, implementation author: Structural candidate contradictions return an invalid finding with a reason; malformed boards retain Fretboard RangeError behavior. Construction and comparisons reject invalid geometry with RangeError. Concrete provenance is optional, copied, and excluded from geometry comparison. Library getters return fresh copies; the bounded reference helper selects one documented placement at a time so short boards are checked per instance.

2026-10-30, Milestone 2 implementation author: Use an explicit `instanceId` on each independent witness; validate each supplied witness separately against actual instance geometry. No collection-wide veto or geometry copy is needed for one-to-many associations. Return copied contacts in finger order, sounding fingers in physical-position order (0 denotes open), and a nullable contact span. Malformed boards throw; candidate contradictions return invalid findings.

2026-10-30, Milestone 2 implementation author: Interpret a contact as exclusive ownership of a discrete string/fret stop: different fingers may share a fret on different strings, or overlap a string at different frets, but cannot occupy the same string/fret contact. This also rejects overlaps hidden beneath a higher stop or on silent strings. The rule is a discrete-model consistency constraint, not an anatomical claim. Count every held fretting contact in span; silent-state declarations contribute no additional contacts or sounding notes. Muting technique, reach and practical recommendation are not established by this checker.

2026-10-30, Milestone 2 implementation author: Keep review source and standard-tuning context in separate `ReferenceFingeringReview` records keyed to witness IDs. Library getters return fresh nested copies. The generic checker never reads review records; matching review context and actual geometry belongs to Milestone 3. Do not implement the separately deferred formula-ID maintenance.

## Outcomes & Retrospective


Milestones 1 and 2 established the reusable geometry and concrete-contact foundation. Inspection and read-only feasibility runs proved the requested A-flat major/minor E shapes and D-major C shape need no changes to those validators. The revised v1 is complete: 13 reusable geometries and execution templates, bounded placement search, independent assessment, and all three acceptance cases passing. The original 13 reference fixtures remain unchanged. All eight closed patterns were exercised over available positions with independent pitch/finger expectations and musical transposition checks. Forty-nine new tests supplement the preserved suites. The final full regression passed 17,870 tests in 41 suites; type checking passed. No implementation blocker remains.

The existing reference formula IDs still derive from array position. Keep all existing associations unchanged and append the new geometry. Explicit ID storage remains a documented deferred maintenance task, not part of this implementation.

## Context and Orientation


The continuation started with staged Milestone 2 changes in architecture, handoff, reference data, absolute witness validation/tests and this plan. No unrelated edits were found. Leave the index unchanged.

`domain/playability/chord-shape-formula.ts` already places closed normalized geometry at positive anchors and open/nut-origin geometry at zero. `chord-shape.ts` resolves concrete strings through Fretboard. `fingering-witness.ts` validates absolute contacts without requiring catalog membership. These modules remain unchanged.

`reference-grips.ts` holds geometry, historical placements and independent execution data. Extend it with relative templates and separate template reviews. F and E-shaped C share geometry and execution. Historical absolute getters remain compatible, deriving contacts from placement anchors.

D019 preserves domain separation; D052 supplies coverage, specified-bass and voicing analysis; D054/D055 supply explicit IDs, physical adjacency and checked pitch mapping. Consult the relevant Music Theory, Fretboard and Playability references. Pattern support describes the declared discrete model, not universal anatomical feasibility or comfort.

## Plan of Work


### Milestones 1 and 2 — Retain completed foundations


Preserve the existing geometry constructors, comparison, structural resolution, absolute witness representation and contact checker, together with all historical source-row tests. Update only the formula-library count assertion from 12 to 13 when adding closed C.

### Milestone 2b — Relative execution and explicit variants


Add `fingering-template.ts` with relative contacts (finger, signed safe offset, inclusive physical-position interval), formula association, defensive copying, available-anchor bounds and concrete instantiation through the existing validators. Include hidden negative-offset contacts in availability and span without changing the geometry origin.

Canonical relative patterns replace private absolute witness storage; derive all 13 historical witnesses from placements. Five open forms remain anchor-zero templates. Closed variants select independent known data: C -> shape-13, A -> shape-06, G -> shape-07, E -> shape-08, D -> shape-09. Unsupported conversions throw rather than infer.

Closed C geometry is `x f3 f2 f0 f1 f0` (6 -> 1). Contacts are finger 1 at offset 0 across positions 1–5, finger 2 at offset 1 on position 2, finger 3 at offset 2 on position 4, and finger 4 at offset 3 on position 5. The user-approved addition is documented separately from historical reference examples.

Acceptance: all old outputs unchanged, explicit variants, every closed template at every valid anchor, signed hidden offsets, malformed contacts, numeric boundaries, copy isolation and no new dependency from geometry to execution.

### Milestone 3 — Bounded search and independent assessment


`playability.ts` composes structural resolution, musical analysis and support matching. Copy original requirements, preserve exact register/doublings and optional-role policies, and distinguish structural invalidity, musical mismatch and unverified support. Structural failure makes dependent findings not-assessed. Musical mismatch must not erase pattern support. Empty sounding geometry is musically mismatched.

Use the existing registered-pitch analyzer for coverage and bass. Exact voicings additionally require full multiset equality. For spelled descriptions with spelled exact voicings, apply the existing spelled analyzer to the original notes. Never respell board coordinates or infer root-position bass.

Template support requires actual normalized geometry, complete relative finger contacts and six-string compatibility. Validate each concrete witness. IDs, provenance and user-provided catalog entries cannot grant approval. Review covers unchanged patterns across available closed placements and any compatible tuning; no new anatomical guarantee is implied.

`template-search.ts` validates the board, requirements, catalog, selected IDs and range; intersects anchor bounds from geometry and contacts; checks the 10,000-pair budget; then instantiates, validates and assesses each candidate. Open forms contribute only anchor zero. Keep distinct witnesses and sort deterministically. Empty/no-match searches return []; invalid or oversized requests throw RangeError. General solver/search ownership beyond this known-pattern enumeration remains undecided.

### Milestone 4 — Acceptance, regression and documentation


Require the three acceptance searches below to return supported, contact-valid, musically matched results. Preserve all 13 historical placements; test every closed pattern across available anchors, retuning/reentrant bass, exact occurrences and spelling, malformed catalogs, forged IDs, independent witnesses, custom formulas and boundary budgets.

Run focused suites, then full `npm test`, `npm run typecheck`, and whitespace/diff review including untracked files. Update architecture, the Fretboard handoff and a Playability consumer guide. Record accepted movable-pattern contracts and distinguish historical reference context from tuning-independent template support.

## Concrete Steps


Run from the repository root using installed Node 24.x and npm. No dependency changes are needed.

    npm test -- tests/fingering-template.test.ts tests/playability.test.ts tests/playability-witness.test.ts tests/chord-shape-formula.test.ts tests/playability-shape.test.ts
    npm run typecheck
    npm test
    git diff --check
    git status --short

For new files also run `git diff --no-index --check -- /dev/null <path>` and read them directly. Exit 1 without diagnostics denotes the new-file difference. If sandbox SSR-cache ENOENT prevents assertions, retry the identical command outside the sandbox when permitted and record both outcomes.

Final movable-template execution: the initial sandbox focused run loaded no tests due to SSR-cache ENOENT; its identical outside-sandbox retry passed 233 tests. After expanded tests and explicit review membership, final `npm test` at 2026-10-30T16:45:45Z passed 17,870 tests across 41 suites. `npm run typecheck` passed. Tracked and new-file whitespace checks, dependency-direction inspection and final diff/new-file review passed. The three protected low-level Playability modules and all Music Theory/Fretboard source files have no changes relative to the pre-existing index. No dependencies, staging, commits or unrelated changes were introduced.

Historical Milestone 1 final checks: 446 focused tests passed, including 114 new geometry tests and 332 Fretboard tests; type checking and whitespace checks passed. Historical Milestone 2 final checks: 188 focused tests passed, including 74 witness tests; type checking and whitespace checks passed. Full regression had not been run at those additive boundaries.

## Validation and Acceptance


| Request | Template / anchor | Frets 6 -> 1 | Fingers 6 -> 1 |
| --- | --- | --- | --- |
| A-flat major | closed-e-major / 4 | 4 6 6 5 4 4 | 1 3 4 2 1 1 |
| A-flat minor | closed-e-minor / 4 | 4 6 6 4 4 4 | 1 3 4 1 1 1 |
| D major | closed-c-major / 2 | x 5 4 2 3 2 | x 4 3 1 2 1 |

All three must emerge from bounded search, including octave-displaced placements when available. No dedicated acceptance placement records are allowed. Test expected pitches/finger rows independently of production templates.

Preserve exact repeated occurrences through distinct location associations; optional formula indices never authorize dropping exact requested notes. Actual lowest registered pitch determines bass even under reentrant tuning. Only lowest specified non-chord bass occurrences are allowed. Unknown execution patterns remain unverified rather than impossible.

Check original reference outputs, every template's bounds, noncontiguous IDs, array permutations, frozen inputs, result isolation, negative hidden-contact offsets, unsafe coordinate addition, cap equality/excess, input validation on empty queries and deterministic alternative-witness ordering.

## Idempotence and Recovery


All domain operations remain pure, deterministic and independently copied. No filesystem, network, migration or framework dependency enters domain code. Preserve staged work and leave the index unchanged. Resume from Git status and recorded test evidence; no staging or commits are authorized.

## Artifacts and Notes


The historical 13 placements and independently transcribed geometry/pitch/finger fixtures remain in their existing tests. New closed C has no absolute production placement. Review sources for original patterns remain the Playability Reference; the new closed C addition points to the consumer guide and this approved revision.

The reference-ID maintenance risk remains open: future reordering must not alter shape-01 through shape-13 associations. This revision appends without performing the deferred storage refactor.

## Interfaces and Dependencies


Geometry and witness operations retain their existing APIs. New relative construction exports `RelativeFingerContact`, `FingeringTemplate`, `TemplateFingering`, `createFingeringTemplate`, `templateAnchorBounds`, and `instantiateTemplateFingering`.

Reference additions expose copied templates, template reviews, explicit CAGED variant associations and variant selection. Historical formula, placement, witness and review getters retain their original outputs except the intentional thirteenth geometry. Historical standard-tuning review records are preserved as source context; new template reviews govern movable support independently of tuning.

Assessment accepts board, concrete instance, `ChordShapeRequirements` and optional explicit witnesses. Requirements retain description, optionalFormulaIndices and optional exact numeric/spelled voicing. Return copied requirements, structural/musical/physical findings, independent witness findings and recommendation eligibility.

Search accepts board, requirements, selected IDs and inclusive anchor range, with an optional explicit `TemplateCatalog` for future/custom data. It returns concrete instances, witnesses and assessments ordered by anchor/formula/template. Custom catalog data adds no trusted evidence. The cap counts available template-anchor pairs before filtering.

No general-purpose solver, automatic open-to-closed conversion, finger remapping, arbitrary new shape derivation, muting techniques, thumb fretting, ergonomic ranking, player profiles, transitions, biomechanics, UI, audio or AI is introduced.

Revision note: 2026-10-30. User-approved movable-template revision supersedes fixed-placement-only support and deferral of relative templates/transposition/bounded anchor enumeration. Historical milestones and findings are retained; implementation of 2b–4 is authorized without changes to the completed low-level validators or the Git index.
