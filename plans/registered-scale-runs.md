# Produce registered scale runs with explicit extent and endpoints


This plan follows [.agent/PLANS.md](../.agent/PLANS.md). Maintain its evidence and progress throughout the effort.

## Purpose / Big Picture


Domain callers can request numeric or spelled scale sequences from a registered tonic, ascending or descending for a positive whole number of octaves. Include the starting tonic and require explicit final-tonic inclusion. Use every existing ScaleType and preserve its fixed collection in either direction. The user approved this contract and a 10,000-note output cap. Explicit arbitrary pitch bounds, zero-octave runs, custom patterns, new scales, classical/jazz melodic-minor traversal, UI, Fretboard, AI, commits, and publishing are outside scope.

## Progress


- [x] 2026-10-09T07:33:15Z: Inspected clean Git status, AGENTS.md, complete plan protocol, relevant architecture/decisions/reference, scale and registered transposition modules and tests. User selected the recommended extent, endpoint, output, and budget contract.
- [x] 2026-10-09T07:33:15Z: Baseline passed 714 tests in four relevant suites outside the sandbox after sandbox cache loading failed before assertions.
- [x] 2026-10-09T07:38:25Z: Implemented numeric/spelled functions with existing scale builders/transposition, exact written-octave recovery, and 140 focused tests.
- [x] 2026-10-09T07:38:25Z: Type checking passed. Initial focused run passed 139/140 tests and exposed an incorrect boundary-test expectation; corrected it. Full regression outside the sandbox passed 14 suites and 1,378 tests, including all 140 new tests.
- [x] 2026-10-09T07:40:08Z: Reviewed production/test/plan files directly and all tracked diffs. Tracked diff whitespace and new-file whitespace/conflict checks passed; new architecture links resolve to the plan and D031 heading. Final status contains only the intended six files. Final type check exited 0.
- [x] 2026-10-09T07:40:08Z: Updated README, architecture, and D031; retained the melodic-minor question and documented arbitrary pitch bounds as deferred. Recorded final evidence and limitations.

## Surprises & Discoveries


Existing scale definitions are internal but their numeric builder at tonic 0 already returns ordered semitone offsets 0..11, so no public custom-pattern API or duplicated pattern tables are needed. Spelled construction returns exact scale spellings independently of register. Deriving each written octave from its numeric pitch and preserved natural-letter/accidental offset with BigInt avoids unsafe intermediate subtraction at coordinate limits. Existing registered-note validation retains the safe-octave-base restriction, which is stricter than numeric coordinate validity. Sandbox baseline tests reproduced temporary-cache ENOENT during imports; outside-sandbox baseline passed.

The first focused run caught a test expectation error: C-double-flat at the largest safe written octave plus one octave exceeds MAX_SAFE_INTEGER, so even its numeric run must reject. Corrected that expectation and used F at the lowest safe written octave descending without its endpoint to demonstrate the distinct case where numeric coordinates fit but an emitted spelled octave base is unsafe. No production repair was required.

## Decision Log


2026-10-09, user: approve registered tonic plus explicit up/down direction and positive whole-number octave count; include the starting tonic; require explicit includeEndpoint for the final tonic; support numeric and spelled output with a 10,000-note cap checked before output allocation.

2026-10-09, implementation approach: add domain/music-theory/scale-runs.ts with scaleRegisteredPitches and scaleRegisteredNotes, taking tonic, ScaleType, and readonly ScaleRunOptions containing direction, octaves, and includeEndpoint. Return independent readonly arrays and note objects. Use existing scale builders and transposeRegisteredPitch. Only emitted coordinates/notes must fit existing safe arithmetic limits; an omitted final tonic is not transposed or validated. Oversized requests fail without truncation. The note cap is a software resource limit, not a musical limit. No run options have defaults.

The broader classical/jazz melodic-minor convention remains an open question. A descending run of melodic-minor-ascending traverses that same fixed collection downward and does not substitute natural minor.

## Outcomes & Retrospective


Implemented the approved sequence contract without changing existing scale or transposition interfaces. All 140 new tests and 1,238 prior tests pass; final strict type checking passed. Documentation records the capability and D031; direct new-file review, tracked diff review, new link checks, whitespace/conflict checks, and final status review passed. The existing double-accidental and safe-octave-base restrictions remain explicit; the classical/jazz melodic-minor convention remains open. No new unresolved implementation requirement was found. Implementation completed with six intended changed/new files; the subsequent authorized documentation clarification adds MUSIC_THEORY_REFERENCE.md as a seventh file. No dependency, commit, or publication changes were made.

## Context and Orientation


domain/music-theory/scales.ts provides thirteen ScaleType identifiers, including five-note major/minor pentatonic and seven-note scales/modes. scalePitchClasses and scaleNoteSpellings share interval definitions; no repeated octave tonic is returned. domain/music-theory/registered-pitch.ts provides RegisteredPitch safe-integer coordinates with C0=0, RegisteredNote explicit spelling plus written octave, registeredPitchFromNote, and transposeRegisteredPitch. D021 requires safe octave bases for spelled notes, while numeric coordinates have no spelling restriction. D028/D029 define scale spelling and fixed melodic-minor-ascending; D030 adds relative major-mode relationships without runs. Existing tests cover these contracts. The working tree was clean before this effort. Music Theory owns the sequence; no framework or instrument dependency belongs in this module.

## Plan of Work


Milestone 1 implements the run options and numeric sequencing in a separate sibling domain module. Reuse scalePitchClasses(0, type) for offsets. Validate options and requested note count before allocation. Map a signed ordinal index into its scale member and octave shift, then transpose the registered tonic by that offset. Verify independent expected sequences for all types, both directions, one/multiple octaves, endpoint inclusion, negative coordinates, overflow, and cap boundaries.

Milestone 2 implements spelled output using the same numeric sequence and scaleNoteSpellings. Preserve each degree's letter/accidental and calculate its written octave using exact arithmetic, then validate the resulting RegisteredNote. Verify C-boundary spellings including B-sharp/C-flat, pentatonic skipped letters, all 35 tonic spellings, extreme arithmetic, input isolation, and numeric/spelled agreement. Type checks prove required options and readonly outputs.

Milestone 3 runs relevant tests, type checking, and full regression, reviews new files directly plus tracked diffs, and updates README, docs/ARCHITECTURE.md, and docs/DECISIONS.md with actual implementation facts and the accepted contract. Remove the implemented run scope from deferred capabilities while retaining arbitrary bounds and melodic-minor traversal as deferred/open. Record actual outcomes here.

## Concrete Steps


Run commands from C:/Users/simoa/Documents/fretbo-AI-rd. Baseline command npm test -- tests/registered-pitch.test.ts tests/scales.test.ts tests/pentatonic-scales.test.ts tests/spelled-transposition.test.ts passed 714 tests outside the sandbox. After editing, run npm test -- tests/scale-runs.test.ts, then npm run typecheck and npm test as relevant regression validation. A temporary-cache ENOENT before assertions may require the same test command outside the sandbox; do not alter project configuration to mask this environment issue. Review git diff --check, git diff, git status --short, and directly inspect all untracked files. Expected observations are passing sequence/boundary assertions and strict checks; these are not claimed as achieved until recorded in Progress.

## Validation and Acceptance


C4 major/up/one octave with endpoint yields coordinates 48,50,52,53,55,57,59,60 and spellings C4,D4,E4,F4,G4,A4,B4,C5. Down yields C4,B3,A3,G3,F3,E3,D3,C3. Without endpoint, omit only the final tonic; internal octave tonics remain. Major/minor pentatonic use five members per octave. Every existing scale type remains a fixed collection in either direction, including melodic-minor-ascending. Results are strictly ordered and distinct, count is cardinality * octaves + (includeEndpoint ? 1 : 0), and spelling conversion agrees with numeric output. Validate positive safe-integer octaves, up/down, boolean endpoint inclusion, supported type, safe emitted coordinates, representable spellings, and the 10,000-note cap. Reject without truncating or mutating supplied inputs. Include negative registers, extreme valid coordinates, unsafe octave-base spelling cases, and required/readonly type assertions.

## Idempotence and Recovery


Domain calls and tests may be repeated safely. Edits affect only this capability and its documentation; preserve unrelated user work. If a check fails, inspect whether it is a domain assertion, compile error, or the known environment import failure. Fix the relevant cause and rerun affected checks. No dependency installation, destructive operation, commit, or publishing is part of this effort.

## Artifacts and Notes


Relevant baseline evidence: four suites and 714 tests passed outside the sandbox. Full verification passed 14 suites and 1,378 tests outside the sandbox; npm run typecheck exited 0 inside the sandbox. New artifacts are the run module, focused tests, and this plan. README, architecture, and D031 describe the verified behavior.

## Interfaces and Dependencies


ScaleRunOptions is Readonly<{ direction: IntervalDirection; octaves: number; includeEndpoint: boolean }>, reusing existing up/down vocabulary. scaleRegisteredPitches(tonic: RegisteredPitch, type: ScaleType, options: ScaleRunOptions): readonly RegisteredPitch[]. scaleRegisteredNotes(tonic: RegisteredNote, type: ScaleType, options: ScaleRunOptions): readonly RegisteredNote[]. Export MAX_SCALE_RUN_NOTES = 10_000 so callers can inspect the limit. Dependency imports are portable sibling domain modules only. Existing scale functions, pattern visibility, type signatures, and transposition behavior remain unchanged.

Revision note: 2026-10-09, initial plan records the user-approved contract and inspection evidence before implementation.

Revision note: 2026-10-09, user requested precise reminders about combined up/down prompts and convention-sensitive traversal before including the documentation in the same commit. README, architecture, D031, and the Music Theory Reference now distinguish caller composition of single legs from changing collections by convention, document turning-note/cap considerations, and retain the classical/jazz question explicitly. This follow-up changes documentation only; prior code/test evidence is historical verification of unchanged implementation.
