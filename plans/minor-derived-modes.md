# Construct and derive fixed modes of harmonic and melodic minor


This plan follows [.agent/PLANS.md](../.agent/PLANS.md). Maintain its evidence and progress throughout the effort.

## Purpose / Big Picture


Domain callers can construct any of seven rotations of harmonic-minor or melodic-minor-ascending at an explicit tonic, derive relative modes from a parent tonic, and generate registered runs of each fixed collection. Identify a mode by its parent collection and rotation degree, preserving written interval roles and exact relative parent spellings. No alternative mode names, grammar expansion, classical downward substitution, custom patterns, keys, harmonization, UI, dependencies, commits, or publishing are authorized.

## Progress


- [x] 2026-10-09T10:17:29Z: Inspected clean Git status, AGENTS.md, complete planning protocol, relevant architecture/decisions/reference, existing scales/relative modes/registered runs and tests, and the completed traversal plan. Baseline passed 373 tests in three mode/run suites outside the sandbox.
- [x] 2026-10-09T10:23:37Z: Implemented direct/relative construction and independent fixtures for fourteen rotations, all numeric tonics and all 35 spelling inputs.
- [x] 2026-10-09T10:23:37Z: Extracted shared run internals and added fixed mode runs. Focused suites passed 661 tests (288 new, 373 existing); npm run typecheck passed.
- [x] 2026-10-09T10:26:03Z: Full npm test passed 1,849 tests in 18 files outside the sandbox; strict type checking already passed with the final production/test code. Updated reference/README/architecture and recorded D035.
- [x] 2026-10-09T10:27:27Z: Reviewed all new files and tracked diffs, existing-comment preservation, domain imports, whitespace/conflicts, and final scope. Checked 71 local documentation links/anchors. Only nine intended files are changed/new.

## Surprises & Discoveries


Existing ScaleType and canonical major-mode results deliberately exclude minor-derived modes; new structured descriptors preserve those contracts. Existing spelled interval identification derives all required tonic-relative roles from a registered C parent without a second catalog of musical formulas. Direct construction validates the requested collection's spellings. At inspection, registered-run arithmetic was embedded in scale-runs.ts; it is now extracted into sibling internals so both capabilities retain one implementation of allocation limits and exact octave recovery.

All fourteen rotations fit the existing single augmented/diminished interval qualities, including the harmonic parent's augmented-second spacing and rotation 7's diminished seventh. Independent fixture tests verified these roles rather than expanding interval vocabulary. Existing run helpers' comments and arithmetic were preserved in the extracted internal module. Tests were run outside the sandbox using the session's established temporary-cache workaround; no tooling/configuration changes were made.

## Decision Log


2026-10-09, user: support both minor parents and rotations 1..7 with direct/relative numeric and spelled construction and fixed registered runs, preserving existing major contracts and excluding aliases and classical substitution.

2026-10-09, implementation: MinorModeParent is harmonic-minor or melodic-minor-ascending; MinorMode is readonly { parent, degree }. Direct functions take tonic and MinorMode; relative functions take parent tonic, parent, degree and return { tonic, mode, pitchClasses/noteSpellings }. Runs take registered tonic, MinorMode, and existing ScaleRunOptions. Validate parent/degree with RangeError. Use a fixed registered C parent to identify each rotated upward interval, then transpose from the requested tonic; no hidden parent spelling restriction or formula duplication. Relative derivation rotates fresh existing parent collections. Its mode descriptor and results are independent readonly values; spelled tonic is its first collection object, consistent with D030.

2026-10-09, implementation: extract the existing cap, options, signed-index positioning, pitch sequencing, and exact written-octave recovery into scale-run-internals.ts. Re-export existing options/cap from scale-runs.ts, preserving all existing public signatures and comments. Internal functions consume trusted domain-generated offsets/spellings; this does not expose a supported custom-scale API.

## Outcomes & Retrospective


All six requested direct/relative/registered functions are implemented. Fourteen independent offset/closing-step fixtures, all twelve numeric tonics, all 35 direct/relative tonic spellings, registered spelling/register boundaries, both directions, endpoints, numerical/allocation limits, and type/input-isolation contracts pass. The full suite passes all 288 new and 1,561 existing tests; strict checking passes. Shared registered-run internals preserve existing public signatures and behavior with unchanged old tests. Reference/README/architecture and D035 describe the achieved capability, and only implemented deferred/open items were removed. No unresolved requirement remains within scope. Alternate names, arbitrary bounds, custom families, keys, and harmonization remain deferred. No dependencies, commits, or publishing were introduced.

## Context and Orientation


scales.ts owns thirteen named five/seven-note ScaleTypes, upward SpelledInterval patterns, pitch/spelled construction, and ordinal queries. relative-modes.ts owns canonical major-mode names and accepts only major-scale modes and major/natural-minor aliases (D030). scale-runs.ts owns fixed directional runs with positive safe-integer octaves, explicit endpoint, starting/internal tonics, and MAX_SCALE_RUN_NOTES = 10,000 (D031). melodic-minor-runs.ts adds explicit classical exercise traversal (D034), which must not affect these fixed derived modes. D020/D021 retain accidentals -2..2, written octave boundaries, safe coordinates and octave bases. New modes belong in a separate minor-modes.ts module; ScaleType and parsers remain unchanged.

## Plan of Work


First implement the two-parent descriptor, runtime validation, direct construction using existing interval identification/transposition, and relative derivation through parent rotation. Independently specify fourteen offset and closing-step fixtures. Verify all numeric tonics, all 35 direct and relative tonic spellings, unsupported accidentals, exact direct/relative agreement, input preservation, and result isolation.

Next move run arithmetic without changing its musical behavior, and make existing named runs delegate to those internals. New mode runs use mode offsets and spellings with the same options and cap. Independently verify both directions, multiple octaves, endpoint inclusion, negative registers, B-sharp/C-flat boundaries, safe coordinate limits, excluded endpoint arithmetic, spelling limits, and allocation limits. Run existing run and traversal tests to check the extraction.

Finally run npm run typecheck and npm test, inspect every new file and tracked diff, and check whitespace/conflicts and documentation links. Add concise mathematical rotation knowledge to the Music Theory Reference, describe actual APIs in README/architecture, append D035, and remove the now-supported minor-mode capability from the deferred list without changing other future scope.

## Concrete Steps


Work from C:/Users/simoa/Documents/fretbo-AI-rd. Baseline npm test -- tests/scale-runs.test.ts tests/relative-modes.test.ts tests/melodic-minor-runs.test.ts passed 373 tests outside the sandbox. After edits run npm test -- tests/minor-modes.test.ts tests/scale-runs.test.ts tests/relative-modes.test.ts tests/melodic-minor-runs.test.ts, npm run typecheck, and npm test. Historical temporary-cache ENOENT can require an authorized outside-sandbox run; do not alter configuration to mask it. Review git diff --check, git diff, git status --short, and directly inspect untracked files. No dependency setup is needed.

## Validation and Acceptance


For harmonic minor the first/second rotation offsets are 0,2,3,5,7,8,11 and 0,1,3,5,6,9,10. For melodic minor ascending they are 0,2,3,5,7,9,11 and 0,1,3,5,7,9,10. Independent fixtures cover every other rotation and its closing steps. C harmonic minor degree 2 derives D,E-flat,F,G,A-flat,B,C; C ascending melodic minor degree 2 derives D,E-flat,F,G,A,B,C. Direct construction at D must agree exactly. All rotations retain parent membership and seven ordered degrees. Spelled construction validates actual output accidentals; numeric construction remains available when spelling exceeds limits. Runs preserve the fixed collection even downward, count 7*octaves plus optional endpoint, reject excessive output without truncation, and validate only emitted coordinates. Existing canonical major modes, named scales, degree queries, parsers, and traversal behavior must pass unchanged tests.

## Idempotence and Recovery


Domain calls/tests are repeatable. Preserve user changes. If extraction breaks existing behavior, fix the shared implementation and rerun the affected regression. Distinguish assertion/type failures from environment import errors. No destructive operations, commits, or publication are involved.

## Artifacts and Notes


Baseline: three suites, 373 tests passed. Focused verification: four suites, 661 tests passed (288 new and 373 existing). Full npm test: 18 suites, 1,849 tests passed outside the sandbox. npm run typecheck passed inside the sandbox. New artifacts are minor-modes.ts, scale-run-internals.ts, tests/minor-modes.test.ts, and this plan. Existing scale-runs.ts is the only changed production file. Documentation changes are README, architecture, decisions, and the Music Theory Reference. Direct new-file review, tracked diff review, git diff --check, new-file whitespace/conflict checks, and 71 local link/anchor checks passed. Final Git status contains exactly these nine intended files.

## Interfaces and Dependencies


MinorModeParent = "harmonic-minor" | "melodic-minor-ascending"; MinorMode = Readonly<{ parent: MinorModeParent; degree: ScaleDegree }>. minorModePitchClasses(tonic, mode) and minorModeNoteSpellings(tonic, mode) return readonly collections. relativeMinorModePitchClasses(tonic, parent, degree) and relativeMinorModeNoteSpellings(tonic, parent, degree) return readonly structured results. minorModeRegisteredPitches(tonic, mode, options) and minorModeRegisteredNotes(tonic, mode, options) return registered arrays using ScaleRunOptions. Portable sibling domain dependencies only. The shared run internals are implementation helpers, not a supported external-data or custom-pattern boundary.

Revision note: 2026-10-09, initial plan records the inspected baseline and authorized design before implementation.

Revision note: 2026-10-09, implementation and review completed; recorded actual focused/full/type verification and remaining exclusions.
