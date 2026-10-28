# Fretboard Engine v1: deterministic pitch-location mapping


This ExecPlan follows [.agent/PLANS.md](../.agent/PLANS.md). Its progress, discoveries, decisions, and outcomes must remain current.

The current task authorizes implementing milestones 1–5 sequentially, with milestone verification and final regression, type checking, and diff review. Do not stage or commit changes. The earlier documentation-only authorization is retained below as historical evidence.


## Purpose / Big Picture


Provide the smallest framework-independent Fretboard Engine that maps musical pitches onto explicitly configured strings and frets. A caller can calculate the registered pitch at a location, find every location for an exact registered pitch, or find locations for a pitch class across registers, optionally restricted to selected strings and an inclusive fret region.

Success is observable through deterministic tests, initially using standard tuning and D natural minor. Alternative tuning, reordered string records, negative registered coordinates, and numerical boundaries must follow the same contracts.

Music Theory determines musical content. Fretboard determines available locations. Playability will validate and rank proposed fingerings. Matching locations are alternatives, not a simultaneous chord grip.

This effort excludes fingering algorithms, chord-voicing candidate generation, ergonomic scoring, UI, AI, audio, instrument geometry, dependencies, and unrelated refactoring.


## Progress


- [x] 2026-10-27T09:12:37Z: Inspected Git status, AGENTS.md, the complete ExecPlan protocol, architecture, accepted decisions, domain references, Music Theory contracts and tests, readiness evidence, and relevant completed plans.
- [x] 2026-10-27T09:12:37Z: Recorded user choices for numeric string identities, strict region bounds, and a 10,000-result search limit.
- [x] 2026-10-27T09:12:37Z: Verified 148 existing tests across the readiness and registered-pitch suites. The identical command passed outside the sandbox after a sandbox cache failure.
- [x] 2026-10-27T09:12:37Z: Checked reference calculations, existing document paths, milestone dependencies, acceptance criteria, and deferred scope. Git status remained clean; git diff --check passed. The draft was not saved because Plan mode prohibited writes.
- [x] 2026-10-27T12:36:58Z: Reconfirmed clean Git status at the same HEAD, absence of the target plan, current repository instructions, and the complete ExecPlan protocol before persistence.
- [x] 2026-10-27T12:40:17Z: Saved and read the complete ExecPlan; verified required sections, milestone acceptance and ordering, deferred scope, heading spacing, references, and whitespace. Git status contains only this new plan. Stopped after documentation review.
- [x] 2026-10-28T07:35:57Z: Milestone 1 — Explicit board contracts implemented and reviewed. 48 focused tests pass; npm run typecheck passes.
- [x] 2026-10-28T07:36:46Z: Milestone 2 — Location mapping implemented and reviewed. All 114 focused tests and npm run typecheck pass.
- [x] 2026-10-28T07:38:54Z: Milestone 3 — Exact-pitch searches implemented and reviewed. All 201 focused tests and npm run typecheck pass.
- [x] 2026-10-28T07:42:02Z: Milestone 4 — Pitch-class searches implemented and reviewed. All 312 focused tests and npm run typecheck pass.
- [x] 2026-10-28T07:51:32Z: Milestone 5 — Integration and documentation complete; 327 focused tests across three suites pass. Final regression passes 17,613 tests in 36 suites; TypeScript checking and Git diff checks pass. Reviewed all new files, documentation, domain imports and deferred scope. No changes staged or committed.


## Surprises & Discoveries


Implementation findings: Initial milestone 1 type checking caught an unknown record property and an overly narrow mutable test fixture. Explicit numeric narrowing and a mutable numeric fixture resolved both; the same focused tests and type checking then passed. No scope change was needed. Milestone 3 initially exposed generic Object.freeze callback inference in a test; an explicit callback restored the intended structural type and both checks then passed.

The working tree was clean at both planning and persistence inspection. HEAD was ee65ca5, the Music Theory readiness and Fretboard handoff commit. No Fretboard implementation or existing target plan was found.

The completed readiness plan records 17,295 passing tests in 34 suites and passing type checking on 2026-10-26. Those are historical results, not checks rerun in this planning session.

Music Theory already supplies registered coordinates, explicit spellings, collection roles, registered voicings, and omission-analysis inputs. No shared musical-request schema is needed for v1 mapping. Coverage analysis and exact-set identification are deliberately lossy views: neither proves preservation of a requested registered voicing and its repeated occurrences.

Safe coordinate endpoints do not imply that their difference is a safe Number. Searches must handle distant valid targets without rounded arithmetic or unnecessary errors. Pitch-class searches must calculate match counts before enumeration, rather than walk every fret of a potentially enormous valid board.

Milestone 5 reproduced the sandbox SSR-cache ENOENT while importing the new integration suite: 321 tests in the other two suites passed. The identical three-suite command outside the sandbox passed all 327 tests. The final full suite similarly failed to load 35 suites in the sandbox (only two bootstrap tests ran); the identical npm test outside the sandbox passed all 36 suites and 17,613 tests. No source, dependency or runner changes were made to address either environment failure.

The existing test runner reproduced the documented sandbox SSR-cache ENOENT during planning. The registered-pitch suite passed there, but readiness failed during module loading. The identical command outside the sandbox passed both suites without source or configuration changes.


## Decision Log


2026-10-27, user: use explicit positive integer string IDs. Conventional six-string fixtures use IDs 1 through 6. Identity must not derive from array position, visual order, or tuning.

2026-10-27, user: reject search regions extending beyond the configured fretboard. Do not silently clip requested bounds.

2026-10-27, user: return complete search arrays with at most 10,000 results. Reject larger results before allocating the output; do not truncate. This is a software allocation limit, not a musical or physical instrument limit.

2026-10-27, plan author: represent each board with explicit string/open-pitch records and a nonnegative fretCount. Available frets are 0 through fretCount, inclusive. Derive string count from the records; do not maintain a redundant count. Standard tuning and 22 frets are test fixtures, not defaults.

2026-10-27, plan author: permit unique, noncontiguous positive safe-integer IDs and any nonempty supplied string collection. Sort copied board records and search results by ascending string ID; within a string, sort by ascending fret. This provides deterministic ordering without assigning pitch or presentation meaning to order.

2026-10-27, plan author: keep the production interface numeric and narrow. Callers retain original musical objects and associate locations with their source positions. Do not introduce a generic metadata envelope, chord adapter, batch-mapping API, or spelling policy.

2026-10-27, plan author: use RangeError for invalid new domain inputs, unavailable direct locations, unsafe coordinates, and oversized search results. Valid searches with no matches return an empty array. Structured error classification remains deferred.

2026-10-27, user, persistence clarification: "Save and review the ExecPlan only." The request to persist the plan does not authorize any of its five implementation milestones.

2026-10-28, implementation author: optional region fields explicitly include undefined in their TypeScript types to honor the approved omitted-value semantics under exactOptionalPropertyTypes. Shared validation rejects null, sparse arrays and invalid requests before empty results; all production dependencies remain one-way to Music Theory.

2026-10-28, implementation author under the user-approved plan: recorded the now-implemented persistent mapping contract as D054 and updated Architecture and the Music Theory handoff guide. No deferred decision was resolved.

The earlier planning choices were not automatically persistent decisions; the authorized implementation now establishes D054. No unresolved product or architectural decision blocks the five milestones under these contracts. Deferred questions below must remain unresolved until their capabilities are authorized.


## Outcomes & Retrospective


Milestone 1 review: explicit tuning, canonical independent copies, stable identities, zero frets, alternative string counts, runtime shape validation, safe endpoints and overflow rejection are covered by 48 passing tests. Readonly assertions pass type checking. No defaults or mutable retuning API were added.

Milestone 2 review: standard tuning, Drop D, fret 22 versus unavailable fret 24, octave equivalence, negative/safe endpoint coordinates, frozen reordered structural records, whole-board validation and readonly location contracts pass. Direct mapping reuses checked Music Theory transposition.

Milestone 3 review: D3/A2 reference alternatives, strict independent regions, reordered/frozen inputs, fresh results, distant safe targets, validation even for empty selections, and the exact 10,000/10,001 match boundary pass. Searches count before output allocation and never scan frets.

Milestone 4 review: all twelve classes match an independent bounded exhaustive oracle over five tunings, five board bounds and five regions, including reversed input permutations. D-class fixtures, strict validation, copy isolation, exact allocation boundaries across strings, huge boards with narrow regions and both safe endpoints pass. Arithmetic counts precede result allocation and enumeration advances by twelve frets.

Milestone 5 review: D natural-minor metadata and all 47 reference locations, the eight-note registered run, enharmonic spelling retention, repeated and unavailable occurrences, the one-string simultaneous-realization counterexample and the test-local chord consumer all pass. Music Theory production modules and existing tests remain unchanged.

Implementation resumed on 2026-10-28 from a clean working tree. All five milestones are now complete. Final regression passes 17,613 tests in 36 suites (318 new Fretboard tests), focused integration passes 327 tests in three suites, and final npm run typecheck passes. The approved contract and deferred scope remain unchanged. The only execution adjustment was the documented outside-sandbox retry after SSR-cache failures; no dependency or runner configuration changed. Explicit undefined unions in optional region fields align the public TypeScript contract with the approved runtime behavior. No scope deviations or unresolved implementation defects were found.

Remaining limitations are deliberate: searches expose location alternatives only, with a 10,000-result allocation cap and safe-integer coordinates. They do not assign simultaneous chord locations, validate fingerings, rank grips, infer metadata or implement later instrument/UI/AI/audio features. Independent fixtures and an exhaustive bounded oracle complement boundary tests; useful numeric domains can exceed the allocation budget without invalidating their direct or narrow queries.


## Context and Orientation


The repository is one private TypeScript application package. Domain modules remain portable and independent of React, Next.js, Node-specific APIs, rendering, and network services. Imports use direct relative .js specifiers. Existing npm scripts provide Vitest and strict TypeScript checking.

Relevant accepted decisions include D001–D005 for deterministic ownership and construction order, D009–D013 for tooling, D018–D019 for package/domain boundaries, D020–D021 for numeric pitch conventions, D031 for bounded registered runs, D039 for spelling limits, and D049–D053 for current chord contracts.

Existing dependencies:

- domain/music-theory/pitch-pitch-classes-and-spelling/pitch-class.ts exports PitchClass, the literal integers 0 through 11 with C = 0.
- domain/music-theory/pitch-pitch-classes-and-spelling/registered-pitch.ts exports RegisteredPitch, RegisteredNote, registeredPitchFromNote, transposeRegisteredPitch, and pitchClassFromRegisteredPitch. RegisteredPitch is a safe-integer number with C0 = 0; negative coordinates are supported.
- domain/music-theory/scales-and-modes/scales.ts supplies ordered scale classes and spellings. scale-runs.ts supplies registered runs with explicit direction, octave extent, and endpoint inclusion.
- domain/music-theory/degrees-keys-and-spelling/degrees.ts supplies ordinal and formula-role metadata.
- Existing chord descriptions and registered voicings preserve musical identity, specified bass, tone order, register, and repeated occurrences. Fretboard must not replace those objects with pitch-class sets.

docs/MUSIC_THEORY_V1.md explains the existing handoff. docs/FRETBOARD_REFERENCE.md supplies the discrete mapping rules. Relevant Music Theory reference sections distinguish register, spelling, scale roles, and voicing; the Playability reference distinguishes location alternatives from simultaneous contacts and finger assignments.

The completed plans/music-theory-v1-readiness.md, plans/registered-pitch.md, and plans/registered-scale-runs.md establish useful verification and living-document patterns. Older plans contain historical source paths and spelling limits; current source and accepted decisions take precedence.

Implemented files are:

- domain/fretboard/fretboard.ts — the minimal public contracts, validation, and mapping functions.
- tests/fretboard.test.ts — deterministic board, mapping, search, boundary, and type-contract tests.
- tests/fretboard-music-theory.test.ts — consumer composition using existing musical outputs.

One cohesive module is sufficient for this scope. Do not create barrel exports, packages, services, caching infrastructure, or future-engine placeholders.


## Plan of Work


### Milestone 1 — Explicit board identity, tuning, and bounds


Objective: establish a validated board independently of any search or musical collection.

Add the board types and createFretboard to domain/fretboard/fretboard.ts, with focused coverage in tests/fretboard.test.ts. Reuse RegisteredPitch and existing checked registered transposition. No earlier Fretboard milestone is required.

Require a nonempty, dense array of string records, unique positive safe-integer IDs, safe registered open pitches, and a nonnegative safe-integer fretCount. Reject malformed records, duplicate IDs, missing entries, fractions, NaN, infinities, and unsafe numbers. Validate that each string's highest available pitch, openPitch + fretCount, remains representable. Monotonic semitone mapping then makes all intermediate locations representable.

Return a new board, new array, and copied string records, ordered by ID. Results are readonly by type and unfrozen, following existing domain conventions. Do not mutate or sort caller-owned arrays. Share private validation with later queries so structurally supplied boards cannot bypass validation.

Fixtures must include standard tuning, Drop D, repeated open pitches, tuning that is not ordered by pitch, reordered records, noncontiguous IDs, a seven-string board, and a zero-fret board containing only open locations. Retuning is represented by constructing another board with the same IDs and changed explicit pitches; no mutable retuning API is required.

Acceptance: equivalent input permutations produce the same canonical board; retuning preserves IDs; valid alternative counts and negative coordinates are accepted; malformed and overflowing configurations throw RangeError; copy isolation and readonly type assertions pass.

Verification: npm test -- tests/fretboard.test.ts and npm run typecheck.


### Milestone 2 — Registered pitch at an identified location


Objective: calculate one available location's sounding pitch.

After milestone 1, add registeredPitchAtLocation in the same module and extend its focused suite. Validate the board and location, resolve the supplied string ID, and reuse transposeRegisteredPitch(openPitch, fret).

A location requires an existing string ID and an integer fret within 0..fretCount, inclusive. Unknown strings and unavailable frets throw RangeError. Fret 0 means the open string; it is not a muted or unplayed state.

Independent standard-tuning fixtures must establish:

- String 6: fret 0 = E2 = 28; fret 1 = F2 = 29; fret 12 = E3 = 40.
- String 6 fret 5 and string 5 fret 0 both produce A2 = 33 while retaining distinct location identities.
- On a 22-fret board, fret 22 exists and fret 24 is rejected.
- Twelve available frets of displacement add twelve registered semitones and preserve pitch class.
- Drop D changes string 6 fret 0 to D2 = 26 without changing other strings.

Include negative coordinates, exact safe endpoints, invalid direct board records, and frozen inputs.

Acceptance: every tested location obeys explicit tuning plus fret, both range endpoints work, identity is independent of record order, and invalid inputs fail without mutation or pitch-class wrapping.

Verification: npm test -- tests/fretboard.test.ts and npm run typecheck.


### Milestone 3 — Restricted exact registered-pitch searches


Objective: return every available location of one exact registered target.

After milestones 1–2, add findRegisteredPitchLocations, region contracts, shared region validation, and MAX_FRETBOARD_SEARCH_RESULTS = 10_000.

An omitted region means all strings and frets. An omitted region field leaves that dimension unrestricted. A supplied fret interval requires both inclusive endpoints within the board. A supplied string list may be empty, yielding no matches, but otherwise must contain distinct existing IDs. Reject duplicates, unknown IDs, sparse lists, malformed regions, reversed intervals, and out-of-board bounds. Treat an optional value of undefined as omitted; reject null.

Validate the complete board and request before returning results, including an empty selection. Valid targets outside the board's sounding range return an empty array.

Compute target minus open pitch with exact BigInt intermediate arithmetic, compare it with the selected fret bounds, and convert only an accepted fret to Number. Do not scan frets or call a distance operation that rejects an irrelevant, overly large difference. There is at most one exact match per selected string. Count matches before allocating the returned array and apply the shared result cap.

For standard tuning, frets 0..12, D3 = 38 must return exactly (4,0), (5,5), and (6,10), each carrying pitch 38. Restricting to strings 4 and 6 and frets 5..10 returns only (6,10). A2 must preserve both (5,0) and (6,5).

Acceptance: results are complete, unique by string/fret, ordered by ID then fret, independently allocated, and correct for empty, restricted, alternate-tuning, and no-match queries. A distant safe target returns no match without arithmetic failure. Exactly 10,000 matches succeed; 10,001 reject without partial output.

Verification: npm test -- tests/fretboard.test.ts and npm run typecheck.


### Milestone 4 — Pitch-class searches across registers


Objective: find every location of a target class while preserving each location's registered pitch.

After milestone 3, add findPitchClassLocations using the same region validation, ordering, result shape, and allocation limit. Runtime-check that the target is an integer in 0..11.

For each selected string, obtain the pitch class at the lower fret bound through existing Music Theory conversion. Calculate the first matching fret and subsequent twelve-fret steps. Use exact intermediate arithmetic for first-match bounds and counts, including values near MAX_SAFE_INTEGER. Sum counts before output allocation; never enumerate the entire board or silently truncate.

For standard tuning, frets 0..12, D must return:

    (1,10,62), (2,3,50), (3,7,50), (4,0,38),
    (4,12,50), (5,5,38), (6,10,38)

Each tuple is string ID, fret, registered pitch. This is distinct from the three-location D3 result.

Verify all twelve target classes against an independent bounded exhaustive oracle over representative tunings and ranges. Cover open and final frets, equal open pitches on different strings, reentrant tuning, negative coordinates, valid zero-match regions, and permutation invariance.

For a one-string board with open pitch 0, class C over frets 0..119988 has exactly 10,000 results. Extending to fret 120000 gives 10,001 and must reject. Restricting that larger board to frets 12..120000 succeeds with 10,000. Also exercise a huge valid board with a narrow region and safe-integer endpoints.

Acceptance: matching is complete across registers, agrees with the independent oracle, preserves distinct locations, and respects strict regions and the result cap without a fret-by-fret scan.

Verification: npm test -- tests/fretboard.test.ts and npm run typecheck.


### Milestone 5 — Music Theory integration and readiness


Objective: demonstrate useful composition without changing Music Theory or adding a richer request model.

After milestones 1–4, add tests/fretboard-music-theory.test.ts. Use existing scale, degree, note-conversion, and supplied-voicing functions. Construct musical targets through those functions and compare results with independently written fixtures.

For D natural minor, retain tonic D, the explicit natural-minor collection, ordinal positions, formulas 1/2/b3/4/5/b6/b7, and spellings D/E/F/G/A/Bb/C. Numeric classes must be 2/4/5/7/9/10/0. Associate each source entry with its locations; do not replace the musical source with an unlabelled union.

On standard tuning, frets 0..12, the union of D natural-minor locations must have these frets:

| String ID | Matching frets |
| --- | --- |
| 1 | 0, 1, 3, 5, 6, 8, 10, 12 |
| 2 | 1, 3, 5, 6, 8, 10, 11 |
| 3 | 0, 2, 3, 5, 7, 9, 10, 12 |
| 4 | 0, 2, 3, 5, 7, 8, 10, 12 |
| 5 | 0, 1, 3, 5, 7, 8, 10, 12 |
| 6 | 0, 1, 3, 5, 6, 8, 10, 12 |

This gives 47 distinct locations. Bb must remain Bb in the retained scale metadata.

Generate a one-octave ascending D3 natural-minor run with its endpoint. Its pitches must be 38,40,41,43,45,46,48,50. Map each occurrence with the exact-pitch search while retaining the original registered note and source index.

Additional integration cases must show that B#3 and C4 find equal sounding locations while their original spellings remain distinct; repeated targets such as D3,D3,D4 retain three source entries; and an unavailable target retains its source entry with an empty location list. A one-string example with different target frets must explicitly demonstrate that separate availability does not establish simultaneous realization.

Keep chord description/formula, specified bass, and explicit optionalFormulaIndices alongside supplied voicing occurrences in a test-local consumer example. Assert that mapping changes none of them and does not deduplicate repeated tones, omit unavailable requirements, infer bass, or claim playability. Do not export that example as a new production schema.

After behavior passes, update the relevant implementation account in docs/ARCHITECTURE.md and the now-stale future-consumer statements in docs/MUSIC_THEORY_V1.md. Record an accepted persistent boundary in docs/DECISIONS.md only as part of subsequently authorized implementation; do not resolve deferred questions or rewrite completed plans.

Acceptance: all reference fixtures, metadata-retention cases, focused tests, type checking, and the existing regression suite pass. Production imports remain portable and one-way from Fretboard to existing Music Theory primitives. Review confirms no deferred capability entered v1.

Verification:

    npm test -- tests/fretboard.test.ts tests/fretboard-music-theory.test.ts tests/music-theory-readiness.test.ts
    npm run typecheck
    npm test

Record actual results and final file review in the living sections.


## Concrete Steps


Run commands from C:/Users/simoa/Documents/fretbo-AI-rd.

The earlier planning task ended after saving and reviewing this document. The current authorized implementation begins by inspecting instructions and status:

    git -c safe.directory=C:/Users/simoa/Documents/fretbo-AI-rd status --short
    node --version
    npm --version

Node 24.x and existing installed dependencies are prerequisites. The inspected runtime during planning was Node v24.19.0 with npm 11.6.2. No tooling change or installation is proposed.

Implement milestones in order. At each milestone, run its focused commands, review changes, and update Progress, discoveries, decisions, and outcomes with actual UTC timestamps. The proposed Fretboard test paths become runnable only after their tests have been added.

Finish authorized implementation with the milestone 5 commands and:

    git -c safe.directory=C:/Users/simoa/Documents/fretbo-AI-rd diff --check
    git -c safe.directory=C:/Users/simoa/Documents/fretbo-AI-rd diff --stat
    git -c safe.directory=C:/Users/simoa/Documents/fretbo-AI-rd diff
    git -c safe.directory=C:/Users/simoa/Documents/fretbo-AI-rd status --short

Passing tests and type checking should exit 0; whitespace checking should emit no diagnostics. Inspect untracked files directly because ordinary git diff omits them.

No application build, UI test, dependency change, staging, commit, or publication is required for this domain effort.


## Validation and Acceptance


Every milestone must establish its stated behavior before being checked complete.

Across the engine, verify runtime validation even for objects bypassing createFretboard; explicit tuning and inclusive bounds; stable string identities; deterministic ordering; correct exact-versus-class matching; no duplicate location records; no input mutation or shared mutable result objects; and compile-time readonly contracts.

Use hand-written reference cases as well as bounded exhaustive comparisons. Do not derive all expected outputs with the implementation under test. Include invalid structural inputs and numerical limits, not only ordinary six-string examples.

Validate safe coordinates independently from allocation limits. Large valid boards may support direct and narrow searches even when an unrestricted class search exceeds the result cap. No query may return a truncated success.

Integration must preserve source spelling, role, register, order, and occurrence identity where supplied. Location availability must never be presented as chord coverage, simultaneous assignment, fingering validity, or ergonomic suitability.

The existing Music Theory regression suite must remain unchanged unless a separately authorized requirement identifies a genuine contract defect. No such defect was found during planning.


## Idempotence and Recovery


Inspection and verification commands can be repeated. Recheck current Git status on continuation and preserve all unrelated work. Do not reset the repository or restore historical deleted scope.

After partial implementation, inspect actual files and test results before resuming the earliest incomplete milestone. Update stale plan facts instead of treating recorded progress as proof.

If the documented sandbox SSR-cache ENOENT recurs before assertions, retain its evidence and repeat the identical command outside the sandbox when permitted. Do not change domain behavior or test configuration to mask an environment failure.

There are no migrations or external state changes. Repair only files belonging to the authorized effort. Do not stage, commit, or publish.


## Artifacts and Notes


Implementation verification on 2026-10-28, from the repository root:

| Milestone | Actual verification and result |
| --- | --- |
| 1 | npm test -- tests/fretboard.test.ts: 48 passed; npm run typecheck passed after fixing two type-narrowing issues. |
| 2 | Same focused command: 114 passed; npm run typecheck passed. |
| 3 | Same focused command: 201 passed; npm run typecheck passed after fixing a test callback's generic inference. |
| 4 | Same focused command: 312 passed; npm run typecheck passed. |
| 5 | npm test -- tests/fretboard.test.ts tests/fretboard-music-theory.test.ts tests/music-theory-readiness.test.ts: 327 passed in three suites outside the sandbox after the documented cache-loading failure. |
| Final regression | npm test: 17,613 passed in 36 suites outside the sandbox after the same cache-loading failure; no assertion failures. |
| Final static checks | npm run typecheck passed; git diff --check passed. New files were inspected directly and checked separately because they are untracked. |

Final review covers the production module, both new test files, architecture, D054, the handoff guide and this plan. Git status contains only those seven intended files; package/dependency configuration, Music Theory implementation and existing tests are unchanged. No staging, commit, build or publication was performed. Production import review confirms only existing Music Theory pitch primitives, with no reverse Music Theory dependency on Fretboard and no Playability implementation.

Planning evidence on 2026-10-27:

- Git status was clean before and after the initial planning inspection, and again before persistence.
- The requested plan file did not exist before persistence.
- Seventeen existing reference paths were checked during planning.
- Standard-tuning, D3, D-class, and D natural-minor location fixtures were independently recomputed.
- npm test -- tests/music-theory-readiness.test.ts tests/registered-pitch.test.ts passed 148 tests in two suites outside the sandbox during planning.
- The initial sandbox invocation passed 139 registered-pitch tests but failed readiness loading with SSR-cache ENOENT.
- git diff --check passed during planning.
- No full regression, type check, application build, or Fretboard test was run during planning.

Historical readiness evidence is in plans/music-theory-v1-readiness.md. Current inspection confirms its consumer guidance; its full-suite counts are not presented as newly executed results.

Saved-document verification on 2026-10-27T12:40:17Z passed: all twelve required sections occur once; five milestones each contain an objective, acceptance criteria, and verification commands; all five implementation progress entries remain unchecked. Heading spacing, trailing whitespace, conflict markers, checkbox placement, seventeen repository path references (including three explicitly planned implementation files), and the protocol Markdown link were checked. The entire new file was read directly, and milestone ordering, dependencies, numeric fixtures, and deferred scope were reviewed. git diff --check passed, and git status --short lists only the untracked plans/fretboard-engine-v1.md. No code, tests, dependencies, or other documentation changed. Tests were not rerun for document persistence; the 148-test result above belongs to the earlier planning inspection.


## Interfaces and Dependencies


Add the following public surface to domain/fretboard/fretboard.ts. All object properties and arrays are readonly by type.

    type StringId = number;

    type FretboardString = Readonly<{
      id: StringId;
      openPitch: RegisteredPitch;
    }>;

    type Fretboard = Readonly<{
      strings: readonly FretboardString[];
      fretCount: number;
    }>;

    type FretboardLocation = Readonly<{
      stringId: StringId;
      fret: number;
    }>;

    type FretboardPitchLocation = FretboardLocation & Readonly<{
      pitch: RegisteredPitch;
    }>;

    type FretRange = Readonly<{
      min: number;
      max: number;
    }>;

    type FretboardSearchRegion = Readonly<{
      stringIds?: readonly StringId[] | undefined;
      frets?: FretRange | undefined;
    }>;

    const MAX_FRETBOARD_SEARCH_RESULTS = 10_000;

    createFretboard(
      strings: readonly FretboardString[],
      fretCount: number
    ): Fretboard;

    registeredPitchAtLocation(
      board: Fretboard,
      location: FretboardLocation
    ): RegisteredPitch;

    findRegisteredPitchLocations(
      board: Fretboard,
      pitch: RegisteredPitch,
      region?: FretboardSearchRegion
    ): readonly FretboardPitchLocation[];

    findPitchClassLocations(
      board: Fretboard,
      pitchClass: PitchClass,
      region?: FretboardSearchRegion
    ): readonly FretboardPitchLocation[];

Use existing Music Theory types and checked pitch arithmetic. BigInt is an internal exact-arithmetic tool, never part of these public records. Validate shapes and numerical invariants in shared private helpers; no validation framework is required.

Queries accept valid structural board records as well as factory outputs. They cannot assume callers used the factory or preserved its ordering. Results carry registered pitch but do not synthesize spelling, degree, chord identity, bass intent, or finger information.

No default tuning, fret count, preferred position, preferred string, result ranking, or automatic spelling is introduced. Explicit selected-string order does not alter the canonical result order.


## Deferred Capabilities and Reconsideration Triggers


| Capability | Existing foundation and unresolved dependency | Trigger for reconsideration |
| --- | --- | --- |
| Chord-voicing location assignments and richer representations | Explicit registered voicings already exist. Assigning occurrences simultaneously requires string exclusivity, multiplicity, register and bass preservation, and a representation separating alternatives from assignments. | A request to realize a supplied chord voicing on the instrument. |
| Ownership of candidate generation | Fretboard supplies locations; Playability evaluates proposed fingerings. Ownership of enumeration, pruning, selection, and guarantees remains open. | Before implementing any automatic voicing or fingering candidate generator. |
| String states, finger assignments, and barre contacts | The Playability Reference distinguishes fretted/open sounding, muted, and unplayed strings; it also defines contact and barre rules. No software representation is selected here. | First authorized Playability implementation. |
| Playability validation and ergonomic ranking | Requires explicit proposed contacts, supported grip rules, hard limits, and separately chosen ranking criteria. Reference heuristics are not an implemented validator. | Requests for playable or recommended fingerings. |
| Explicit omissions and extended-chord realization | D052 already analyzes caller-specified optional formula positions; D051 already provides narrow complete root-position realization. Automatic omissions, guitar-specific tone selection, and broader realization remain deferred. | A realization request that cannot preserve all requested tones or explicitly authorizes a tone-selection policy. |
| Extended-chord inversion naming | C9, C11, and C13 retain bass/membership analysis without conventional inversion numbering under D052. Naming requires an explicit Music Theory convention. | A requirement to name those inversions; not ordinary location mapping. |
| Structured error classification | Existing RangeError/SyntaxError contracts distinguish some failures but lack structured input-versus-representation/resource categories. | Before exposing domain operations through UI or AI tools. |
| Context-dependent note spelling | Existing explicit spellings, collection roles, and narrow key-aware APIs remain usable. Fretboard cannot infer a preferred spelling from a sounding coordinate. | A requirement to label locations lacking supplied musical spelling/context. |
| Later instrument features | Capos, partial capos, per-string fret ranges, courses, harmonics, bends, microtonal mapping, presets, and physical geometry need separate semantics. Ordinary alternative tunings and explicit string counts are already within this v1 plan. | A concrete instrument capability that cannot be represented by explicit open pitches and common integer frets. |
| UI, AI, audio, and melodic fingering | Require their own integration and product decisions. Scale and melody location mapping does not require them. | Separate authorized feature work. |

None of these deferred decisions blocks v1 pitch-location mapping. If a future request makes one necessary, define a separate coherent effort rather than silently expanding these milestones.

Revision note: 2026-10-27, prepared from verified repository state and the user's three contract choices. All implementation milestones remain not started.

Revision note: 2026-10-27, persisted and reviewed after the user explicitly confirmed documentation-only scope. Removed obsolete Plan-mode persistence instructions, recorded successful saved-file checks, and retained the implementation contracts and deferred boundaries unchanged. All implementation milestones remain not started.

Revision note: 2026-10-28T07:35:57Z, user explicitly authorized implementation of milestones 1–5. Updated obsolete current-task restrictions; milestone 1 is verified. No staging or commit is authorized.

Revision note: 2026-10-28T07:51:32Z, completed sequential implementation and verification of all five milestones. Recorded regression and sandbox-retry evidence, D054 and documentation updates, unchanged deferred scope, and final review. Normalized UTC timestamp separators to ISO format.
