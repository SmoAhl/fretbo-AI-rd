# Generate melodic-minor runs with explicit traversal conventions


This plan follows [.agent/PLANS.md](../.agent/PLANS.md). Keep its progress, decisions, and evidence current.

## Purpose / Big Picture


Callers can request one registered melodic-minor leg with an explicit fixed-collection or classical-exercise convention. Both ascend using melodic-minor-ascending; only classical-exercise descends using natural-minor. Numeric and spelled output reuse existing registered scale runs. Existing scale APIs and parsers stay unchanged. Combined legs, minor-derived modes, arbitrary pitch bounds, keys, UI, dependencies, commits, and publishing are excluded.

## Progress


- [x] 2026-10-09T09:07:30Z: Inspected clean Git status, AGENTS.md, complete planning protocol, relevant architecture/decisions/reference, existing scale/run/register code and tests, and the completed registered-run plan.
- [x] 2026-10-09T09:11:36Z: Implemented the separate convention-aware module and 92 focused tests. Both run suites passed 232 tests outside the sandbox; strict type checking passed inside the sandbox.
- [x] 2026-10-09T09:13:36Z: Full regression passed 1,561 tests in 17 files outside the sandbox. Final npm run typecheck passed inside the sandbox.
- [x] 2026-10-09T09:14:47Z: Updated README/architecture and recorded D034. Reviewed all new files and tracked diffs; whitespace/conflict and new documentation link-target checks passed. Final scope contains exactly six intended files.

## Surprises & Discoveries


Existing scale-run functions already own direction, extent, endpoint, output-cap, spelling, and safe-integer validation. The new capability only needs to select the collection and delegate. The existing environment can fail Vitest imports with temporary-cache ENOENT; use an authorized outside-sandbox rerun if encountered, without changing project configuration.

The focused sandbox run failed during temporary-cache imports before assertions. Outside the sandbox, 231/232 tests passed initially; one new fixture incorrectly expected F-sharp as the seventh of G-double-sharp natural minor. Its correct seventh is F-double-sharp (two semitones below the tonic). Corrected the test expectation without changing production code; the focused rerun passed 232/232.

## Decision Log


2026-10-09, user: authorize explicit fixed-collection and classical-exercise traversal for numeric and spelled registered runs, preserving all existing contracts and limits.

2026-10-09, implementation: add a separate melodic-minor-runs.ts module. MelodicMinorRunOptions extends readonly ScaleRunOptions with required convention, whose values are fixed-collection and classical-exercise. melodicMinorRegisteredPitches and melodicMinorRegisteredNotes accept a registered tonic and these options. Reject unsupported/missing convention with RangeError; delegate all other validation. No convention defaults or aliases are introduced. Select only the collection used for the requested leg: a valid classical descent need not be spellable as ascending melodic minor.

## Outcomes & Retrospective


Both requested outputs are implemented with explicit convention and existing run options, delegating collection construction and all run arithmetic to existing capabilities. All 92 new tests and 1,469 prior tests pass; strict type checking passes. Documentation records D034 and removes the resolved narrow traversal question while retaining future mode integration and combined-run policies. Existing source modules and tests are unchanged. No unresolved requirement remains within this scope; double-accidental and safe-octave-base limits remain deliberate restrictions. No dependency, commit, or publication changes were made.

## Context and Orientation


domain/music-theory/scale-runs.ts exports ScaleRunOptions with explicit direction, positive safe-integer octaves, and boolean includeEndpoint; scaleRegisteredPitches and scaleRegisteredNotes generate fixed-collection runs capped at MAX_SCALE_RUN_NOTES = 10,000. Starting/internal tonics remain; only the final tonic is optional. Only emitted coordinates need to fit. Spelled notes retain the -2..2 accidental and safe written-octave-base restrictions from D020/D021. D028 defines melodic-minor-ascending as a fixed collection, and D031 preserves it on descent. The reference distinguishes this collection from classical exercise traversal. This effort resolves that narrow traversal question without changing fixed APIs or interpreting prompt text.

## Plan of Work


First add the options type, convention validation/collection selection, and two delegating functions. Test independent C examples and multi-tonic/register sequences, both directions, multiple octaves, and endpoint policies. Verify that only classical descent changes collection.

Next test unsupported/missing options, output cap, numeric overflow, written-octave and accidental limits, input preservation, output isolation, and compile-time required/readonly contracts. Run the focused suite and strict checking, then the complete existing suite to verify unchanged behavior.

Finally update README and architecture to describe actual behavior, supersede the now-resolved narrow open question, and append D034 with rationale and limitations. Preserve combined-run and future-mode questions. The Music Theory Reference already supplies the relevant musical knowledge and needs no API details. Review all new files directly, tracked diffs, whitespace, local links, and Git status.

## Concrete Steps


Work from C:/Users/simoa/Documents/fretbo-AI-rd. After editing run npm test -- tests/melodic-minor-runs.test.ts tests/scale-runs.test.ts, npm run typecheck, and npm test. Expected results are passing tests and strict checks; record actual outcomes separately. Review git diff --check, git diff, git status --short, and directly inspect the new module, tests, and plan. No dependency setup is required.

## Validation and Acceptance


C4 ascending under both conventions yields C4,D4,E-flat4,F4,G4,A4,B4,C5. From C5, classical descent yields C5,B-flat4,A-flat4,G4,F4,E-flat4,D4,C4; fixed descent yields C5,B4,A4,G4,F4,E-flat4,D4,C4. Numeric and spelled outputs agree. Test independent expected offsets, negative register, B-sharp/C-flat written boundaries, double-accidental rejection, selected-leg spelling, safe coordinate extremes, excluded endpoint arithmetic, and seven-note cap boundaries. Existing fixed-run tests must continue to pass.

## Idempotence and Recovery


Domain calls and tests are repeatable. Preserve existing user work. Classify failures as assertions, type errors, or the known environment import issue, repair only the relevant cause, and rerun affected checks. No destructive operations or external publication are involved.

## Artifacts and Notes


New artifacts are domain/music-theory/melodic-minor-runs.ts, tests/melodic-minor-runs.test.ts, and this plan. Documentation changes are README.md, docs/ARCHITECTURE.md, and docs/DECISIONS.md. Focused tests passed 232/232 (92 new, 140 existing runs). Full npm test passed 1,561 tests in 17 files outside the sandbox; npm run typecheck passed inside it. Reviewed the tracked diff and all untracked files directly; git diff --check and new-file whitespace/conflict checks passed. New D034 and plan link targets exist. The Music Theory Reference already describes both musical conventions accurately and was left unchanged.

## Interfaces and Dependencies


MelodicMinorConvention = "fixed-collection" | "classical-exercise". MelodicMinorRunOptions = ScaleRunOptions & Readonly<{ convention: MelodicMinorConvention }>. melodicMinorRegisteredPitches(tonic: RegisteredPitch, options: MelodicMinorRunOptions): readonly RegisteredPitch[]. melodicMinorRegisteredNotes(tonic: RegisteredNote, options: MelodicMinorRunOptions): readonly RegisteredNote[]. Dependencies are portable sibling types and existing scale-run functions only; reuse the existing cap rather than adding another limit.

Revision note: 2026-10-09, initial plan records the authorized contract and inspection before implementation.

Revision note: 2026-10-09, completed implementation and verification; recorded the environment import failure, corrected fixture, and final review evidence.
