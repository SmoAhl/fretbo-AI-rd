# Support triple accidentals in Music Theory


This living plan follows [.agent/PLANS.md](../.agent/PLANS.md). The user approved implementation on 2026-10-13.

## Purpose / Big Picture


Support explicit note accidentals and simple major-relative formula alterations from -3 through +3. Musical spelling must remain exact across conversions, transposition, collections, registered runs, key relationships, and key-aware selection. Results beyond this range must fail without respelling. This completes the deferred triple-accidental TODO; it does not introduce theoretical signatures, higher interval qualities, UI, AI, or dependencies.

## Progress


- [x] 2026-10-13T09:36:44Z: Reviewed instructions, architecture, accepted decisions, relevant Music Theory reference sections, completed key plans, and ExecPlan protocol. Clean initial Git status. Planning baseline passed 1,711 tests in six suites outside the sandbox after a temporary SSR-cache ENOENT failure inside it.
- [x] 2026-10-13T09:36:44Z: Extended Accidental, note/formula tokens and formatters, formula validation, and transposition result bounds.
- [x] 2026-10-13T09:44:28Z: Expanded independent matrices across 49 spellings/formulas and 98 key identities, including both melodic-minor conventions, relative-key triples, strict text grammar, numerical boundaries, and quadruple rejection. Focused verification passed 3,557 tests in 14 files.
- [x] 2026-10-13T09:44:28Z: npm run typecheck passed. Full npm test passed 3,940 tests in 22 files outside the sandbox. Updated two additional parser-integration fixtures found by full regression; no parser behavior beyond the approved grammar changed.
- [x] 2026-10-13T09:44:28Z: Updated README, architecture, reference, and D039; removed the completed triple TODO and preserved deferred errors/historical plans. Reviewed implementation/test diffs and new ExecPlan; whitespace and local-link checks passed. Work remains uncommitted.

## Surprises & Discoveries


DegreeFormula.alteration shares Accidental, so the approved expansion includes triple formula inputs and text. Conventional signatures have their own -1/1 entry type and are independent of this expansion. Derived spelling limits are enforced in spelled-transposition.ts and degrees.ts; existing consumers reuse them. Some tests deliberately assert former triple failures and need new quadruple fixtures rather than merely larger matrices. Registered arithmetic already groups letter and accidental before adding the safe octave base. The first affected test run passed 3,530 cases and failed four stale boundary fixtures; full regression later identified two more in interval/scale parsing integration. Those fixtures were corrected to preserve their original independence guarantees at the new quadruple boundary. No production correction beyond the five planned domain files was needed.

## Decision Log


2026-10-13, user: Include triple degree formulas. Accept note triples as ###/bbb or single Unicode sign followed by double sign (♯𝄪/♭𝄫), rejecting repeated Unicode triples and reverse order. Degree text accepts these composites plus repeated signs and retains canonical repeated Unicode output. Preserve typed note inputs, numerical safety, conventional signatures, and existing error classes.

## Outcomes & Retrospective


The approved capability is implemented and verified. Note and degree text round-trip all supported values; derived operations preserve triples and reject unsupported final accidentals without respelling. Both requested relative-key examples and G-double-sharp major's F-triple-sharp are covered. All 98 identities are accepted; the independent key matrix confirms 92 representable relative results and the unchanged 30 conventional signatures. Typecheck and all 3,940 tests pass. No dependencies, UI, general runtime note validation, theoretical signatures, new interval qualities, commits, or external actions were introduced. The deferred error-classification improvement remains open.

## Context and Orientation


Music Theory owns deterministic musical rules independently of frameworks. note-spelling.ts defines the shared Accidental union, note-text.ts handles strict note grammar, spelled-transposition.ts preserves interval letters, and degrees.ts resolves major-relative formulas and validates only the final note accidental. degree-text.ts supplies formula grammar. Scale/mode/run/key modules consume these capabilities. D020, D022, D023, D036, D037, and D038 establish existing contracts; this effort adds a new decision rather than rewriting historical approvals. The old key plans are completed historical records.

## Plan of Work


### 1. Extend spelling contracts and notation


Widen the shared union and existing formula/transposition guards. Extend token tables and longest-first regex alternatives for the exact approved syntax. Add no general object validator, public helper, or new interval quality. Verify all 49 spellings and formulas, syntax boundaries, safe registered coordinates, and type contracts.

### 2. Verify all existing consumers


Expand independent natural-letter/semitone oracles across 49 tonics, all supported scale/mode collections, runs, and 98 key identities. Convert old triple-rejection examples to successes and add quadruple failures. Demonstrate G-double-sharp major's F-triple-sharp, relative B-double-sharp major/G-triple-sharp minor, and relative C-double-flat minor/E-triple-flat major. Preserve selected-result validation and the 30 conventional signatures. Verify focused suites and then all tests/typechecking.

### 3. Document and review the completed capability


Update README, architecture, relevant reference definitions, and additive accepted decision. Remove the completed triple TODO while preserving the deferred error TODO and historical plans. Review tracked diffs and new files, run whitespace checks, and record final evidence and status.

## Concrete Steps


Work from C:/Users/simoa/Documents/fretbo-AI-rd. Run focused npm test with note, degree, transposition, scale/mode/run, key and key-aware suites. Run npm run typecheck and npm test. Expect all suites and both TypeScript configurations to pass. If Vitest fails before import with sandbox SSR-cache ENOENT, rerun the same command outside the sandbox when permitted; do not change configuration. Run git diff --check and git status --short, and inspect new plan/source artifacts directly. Actual execution results are recorded in Progress and Outcomes. Focused verification used npm test -- tests/note-spelling.test.ts tests/registered-pitch.test.ts tests/note-text.test.ts tests/spelled-transposition.test.ts tests/degrees.test.ts tests/degree-text.test.ts tests/scales.test.ts tests/pentatonic-scales.test.ts tests/relative-modes.test.ts tests/minor-modes.test.ts tests/scale-runs.test.ts tests/melodic-minor-runs.test.ts tests/keys.test.ts tests/key-aware-spelling.test.ts; all 14 suites passed.

## Validation and Acceptance


Cover all 49 note spellings and formulas, ASCII/Unicode round trips, composites versus rejected forms, written octave and negative-register boundaries, safe-integer overflow, input isolation, readonly contracts, triple success and quadruple failure. Independently validate collection and key-aware matrices, relative round trips where results are representable, and unchanged conventional signature support (30 out of 98 identities). Generic sharp/flat selection, interval-quality rules, run budgets, and traversal conventions must remain unchanged.

## Idempotence and Recovery


Tests and checks can be repeated without tracked-state mutation. Edits are limited to this coherent increment; inspect status/diffs before reverting any changes and preserve user work. No migration, external action, commit, or publishing is required.

## Artifacts and Notes


Baseline: 1,711 tests passed in six files. Sandbox failure was ENOENT in temporary SSR transform cache before five suites loaded; identical outside-sandbox execution passed. No baseline domain failure was observed. Final verification: npm run typecheck passed; npm test passed 3,940 tests across 22 files. git diff --check and checks for conflict markers, local links, required ExecPlan sections, and sibling-only domain imports passed. Final changes comprise five domain modules, sixteen test files, four current documentation files, and this new plan.

## Interfaces and Dependencies


Accidental becomes -3 | -2 | -1 | 0 | 1 | 2 | 3; NoteSpelling, RegisteredNote, and DegreeFormula inherit it. Public function signatures remain unchanged. Runtime formula input and derived note output guards use -3..3. Unsupported text uses SyntaxError; semantic/numerical limits use RangeError. KeySignatureAccidental remains -1 | 1. Only sibling portable domain dependencies are used.

Revision note: 2026-10-13, created for the approved triple-accidental effort and updated with implementation, regression findings, verification, and completed outcomes.
