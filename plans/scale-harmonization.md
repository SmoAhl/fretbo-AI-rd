# Scale harmonization for existing seven-note collections


This living plan follows [.agent/PLANS.md](../.agent/PLANS.md).

## Purpose / Big Picture


Derive triads and seventh chords on one degree or all seven degrees of existing seven-note collections. Return exact formulas, optional existing quality names, and numeric or spelled tones. This connects existing Music Theory capabilities without introducing symbols, register, inversions, custom collections, harmonic function, guitar rules, UI, AI, or dependencies.

## Progress


- [x] 2026-10-26T08:24:50Z: Rechecked clean Git status, instructions, complete plan protocol, architecture, accepted decisions, relevant reference sections, degree/chord APIs, and test conventions. User explicitly authorized the approved plan.
- [x] 2026-10-26T08:28:10Z: Derived and verified major/natural-minor formulas with independent musical fixtures.
- [x] 2026-10-26T08:28:10Z: Added numeric/spelled tone resolution and private exact catalog matching.
- [x] 2026-10-26T08:28:10Z: Verified all 25 selectors, both sizes, all degrees, twelve numeric and 49 spelled tonics, and boundary/type contracts. Focused checks passed 5,292 tests across four suites; npm run typecheck passed.
- [x] 2026-10-26T08:30:30Z: Updated README/Architecture and recorded D048. Full regression passed 9,655 tests in 28 suites. Reviewed all six changed/new files, checked documentation targets and whitespace, and confirmed final scope/status.

## Surprises & Discoveries


Existing degreeFormulas derives roles from supported collection spellings at C. This lets numeric harmonization remain independent of the requested tonic's spelling. Selected-degree spelling must not construct the entire requested spelled collection. The preceding planning baseline passed 2,152 tests in the degree/triad/seventh suites outside the sandbox after a temporary SSR-cache ENOENT; the same sandbox failure recurred during implementation and identical checks passed outside it. All currently supported harmonized formulas match named catalog qualities; the private undefined fallback remains available without a synthetic custom-collection API or public testing hook.

## Decision Log


2026-10-26, user: Support both individual degrees and full sequences, returning formulas and optional catalog qualities. Implement the approved seven-note scope.

2026-10-26, approved plan: Derive roles by alternate collection positions with octave continuation, using existing degree/formula resolvers and private exact catalog matching. A fixed minor-mode descriptor selects a collection at its own tonic; its rotation degree is distinct from the chord degree. Spelling validates only requested tones; a full-sequence failure returns no partial output. Keep required quality fields with undefined fallback, discriminated triad/seventh types, readonly-by-type fresh results, typed tonic boundaries, and existing RangeError conventions.

## Outcomes & Retrospective


All four milestones are complete. Six public queries and discriminated result contracts satisfy the independent acceptance matrices, focused/full regressions and type checks. Exact letter roles survive octave wraparound, and selected-degree construction remains available when unrelated collection spellings exceed the limit. Documentation records the delivered capability and D048; the musical reference needed no change. No preexisting production module, dependency, or historical plan was changed. Work is uncommitted.

## Context and Orientation


domain/music-theory/degrees-keys-and-spelling/degrees.ts exports DegreeCollection, degreeFormulas, pitchClassFromDegreeFormula, and numeric/spelled collection-degree queries. Named ScaleType includes two pentatonics to exclude; MinorMode carries harmonic-minor or melodic-minor-ascending parent and rotation degree. All supported seven-note collections use successive letter roles.

domain/music-theory/chords-symbols-and-realization/chord-formulas.ts resolves nonempty formulas while preserving order and exact letters. triads.ts and seventh-chords.ts expose formula retrieval and quality types. D036 and D042-D044 govern reuse. Architecture assigns musical identity to Music Theory, locations to Fretboard, and fingerings to Playability. The Music Theory Reference's construction section defines alternating-degree harmonization; no new musical convention is required.

## Plan of Work


Milestone 1 adds scale-harmonization.ts in the chord folder and tests/scale-harmonization.test.ts. Derive offsets from existing degree formulas and compare octave-continued third/fifth/seventh distances with 4/7/11. Verify all major and natural-minor degrees against independent fixtures.

Milestone 2 resolves selected roots through collection-degree helpers and tones through shared chord resolvers. Match exact formulas privately against existing catalogs. Verify wraparound, quality labels, extreme spellings, independent results, and full-sequence equivalence.

Milestone 3 covers eleven named seven-note selectors and fourteen minor-mode descriptors using the same algorithm. Verify all degrees, both sizes, twelve numeric tonics, and 49 spelled tonics with an independent letter-coordinate oracle. Reject pentatonics and invalid runtime selectors/degrees/kinds/descriptors with RangeError. Verify compile-time contracts.

Milestone 4 updates README.md, docs/ARCHITECTURE.md and docs/DECISIONS.md, retaining existing musical reference content unless a clarification is necessary. Run focused tests, type checking, full regressions and review. Record actual evidence below.

## Concrete Steps


From C:/Users/simoa/Documents/fretbo-AI-rd, after creating implementation and tests, run:

    npm test -- tests/scale-harmonization.test.ts tests/degrees.test.ts tests/triads.test.ts tests/seventh-chords.test.ts
    npm run typecheck
    npm test
    git diff --check
    git status --short

Expected observations are passing assertions, successful type checks, and no whitespace errors. Tests and type checking are existing package scripts on Node 24.x; no installation or new tooling is needed. If Vitest fails before assertions with the known temporary SSR-cache issue, repeat the identical read-only command outside the sandbox when permitted.

## Validation and Acceptance


Observe C-major degree VII seventh B-D-F-A, natural-minor differences, harmonic-minor augmented III and diminished-seventh VII, and melodic-minor minor-major tonic seventh. All selector/degree/size/tonic matrices must preserve source membership, letter roles and formula order. Required accidentals beyond +/-3 reject without respelling; unrelated unavailable spellings do not reject a selected chord. Full sequences equal seven individual queries. Inputs remain untouched, results are unfrozen and independent, and kind narrows the quality type. No new public matcher or custom collection is introduced merely to test the undefined-quality fallback.

## Idempotence and Recovery


Checks are repeatable. Preserve preexisting user edits, inspect changes before recovery, and fix only this effort's files. No migration, commit, publishing, or external mutation is needed. Maintain this plan after partial completion; do not claim success until acceptance passes.

## Artifacts and Notes


Focused command passed 5,292 tests in four suites, including 3,140 new harmonization tests. npm run typecheck passed. Full npm test passed 9,655 tests in 28 suites. The sandbox initially failed before assertions with temporary SSR-cache ENOENT; tests passed outside the sandbox without changing tooling. Reviewed new source, tests and plan directly, reviewed tracked documentation diffs, verified 104 local documentation link targets, and checked whitespace for tracked and new files. git diff --no-index reports exit 1 for a new-file difference even when --check emits no whitespace diagnostics; that is not an assertion failure.

## Interfaces and Dependencies


Export HarmonizableCollection (ScaleType excluding major/minor pentatonic, or MinorMode), HarmonizationKind (triad/seventh), and discriminated readonly HarmonizedChordFormula, HarmonizedPitchClassChord and HarmonizedSpelledChord results. Formula metadata contains degree, kind, formula and required possibly-undefined quality. Numeric/spelled variants add root and pitchClasses/noteSpellings respectively.

Export harmonizedChordFormulaAtDegree(collection, degree, kind), harmonizedChordPitchClassesAtDegree(tonic, collection, degree, kind), harmonizedChordNoteSpellingsAtDegree(tonic, collection, degree, kind), and full-sequence counterparts harmonizeCollectionFormulas, harmonizeCollectionPitchClasses and harmonizeCollectionNoteSpellings without degree arguments. All arguments are required. Only portable Music Theory imports with direct .js specifiers are permitted; existing interfaces remain unchanged.

Revision note: 2026-10-26, created before implementation from the user-approved plan; updated after acceptance and final review to record completed milestones and evidence.
