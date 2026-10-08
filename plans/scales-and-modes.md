# Construct and inspect seven-note scales and modes


This living ExecPlan follows [.agent/PLANS.md](../.agent/PLANS.md). Keep its progress, findings, decisions, and outcomes current throughout the effort.

## Purpose / Big Picture


Callers can construct ordered pitch classes and correctly spelled notes for major, natural minor, harmonic minor, melodic minor ascending, and the seven major-scale modes. They can retrieve a pitch class by ordinal degree and identify membership through degree lookup. Demonstrate the capability with deterministic tests, including parse-tonic / construct / format examples. Implement only the approved Music Theory increment: no registered runs, other collections, custom patterns, key signatures, harmonization, Fretboard, Playability, UI, AI, dependencies, commits, or publishing.

## Progress


- [x] 2026-10-08T09:15:31Z: Rechecked clean Git status, instructions, full ExecPlan protocol, relevant architecture, decisions, reference sections, existing code, tests, and configuration. Created this plan before implementation.
- [x] 2026-10-08T09:17:47Z: Defined shared upward interval patterns and verified reference formulas and major-mode rotations.
- [x] 2026-10-08T09:17:47Z: Implemented numeric construction; focused tests passed 154 cases, including all eleven types at all twelve tonics.
- [x] 2026-10-08T09:19:22Z: Implemented spelling; focused suite passed 264 tests, including independent checks of all 35 tonic spellings across all eleven types.
- [x] 2026-10-08T09:20:19Z: Implemented both ordinal queries; 412 focused tests and strict type checking passed.
- [x] 2026-10-08T09:21:54Z: Completed integration and regression review: 1,029 tests in eleven files passed; strict type checking passed. Reviewed all new files, tracked diffs, domain imports, whitespace, conflict markers, and 49 local links/anchors.
- [x] 2026-10-08T09:21:54Z: Updated architecture and README, recorded D028, added the five deferred-capability bullets and open melodic-minor question, and recorded final outcomes.

## Surprises & Discoveries


The planning baseline passed 617 tests in ten files and strict type checking. Its sandboxed test run failed while loading temporary cache files; rerunning outside the sandbox passed. These results precede implementation and do not prove the new behavior. The first focused implementation run passed inside the sandbox; no workaround was needed.

The first spelling run passed 251 of 252 tests. One negative test incorrectly expected F-double-sharp major to require a triple accidental; its fourth is B-sharp and the scale is representable. Corrected that test to G-double-sharp major (whose seventh requires F-triple-sharp), added F-double-sharp major as a positive example, and expanded independent all-spelling coverage. No domain fix was needed; the follow-up run passed 264 tests.

The final full-suite sandbox run reproduced temporary-cache ENOENT at import time: ten suites could not load and only the two bootstrap tests ran. The outside-sandbox rerun passed all 1,029 tests. Focused scale tests and strict checking passed inside the sandbox. This is an execution-environment limitation; no project configuration workaround was introduced.

## Decision Log


2026-10-08, user: approve the seven-note core and both numeric and spelled construction, with degree queries, rather than the entire reference catalog or registered runs. Use the explicit melodic-minor ascending collection; preserve the broader classical/jazz convention as an open question. Add a small architecture list of omitted scale/mode capabilities.

2026-10-08, implementation: use one portable module, domain/music-theory/scales.ts. Internal definitions use seven upward tonic-relative SpelledInterval values, including perfect unison. Major/Ionian and natural minor/Aeolian reuse their definitions. All public functions require tonic and type; construction excludes the repeated octave tonic. Ordinal degrees are 1..7, not major-relative alterations. Unsupported types/degrees and unsupported derived accidentals raise RangeError. PitchClass and NoteSpelling inputs retain the existing typed-input boundary; this does not introduce arbitrary external-data validation. Fresh arrays and spelling objects prevent callers from altering shared definitions or another call's result.

Open question, explicitly deferred: should future melodic-minor behavior expose classical and jazz variants, including direction-dependent classical traversal? The fixed melodic-minor-ascending collection does not answer it.

## Outcomes & Retrospective


All four approved functions are implemented and demonstrated through 412 new tests, including exhaustive numeric tonic/type coverage and independent checks across all 35 tonic spellings for each type. All 617 prior tests also pass, and strict checking verifies the new public contracts. Shared intervals supply both pitch distance and degree spelling without changing existing pitch/interval modules or dependencies. Architecture and README describe the actual behavior; D028 records the accepted contract. The requested five-item deferred list and classical/jazz melodic-minor question are retained in architecture. The only domain limits are the explicitly approved catalog, octave-free collections, and existing double-accidental spelling boundary. Full regression required outside-sandbox execution because of the temporary-cache issue. No work within the approved scope remains; no commit or publication was performed.

## Context and Orientation


The repository is one private Next.js/TypeScript package with independent domain modules. Tests run under Vitest in Node; strict checking also covers NodeNext imports using .js specifiers. Existing domain/music-theory/pitch-class.ts exports PitchClass 0..11 and transposePitchClass. Existing note-spelling.ts exports readonly NoteSpelling with A-G letters, Accidental -2..2, and pitchClassFromSpelling. Existing spelled-transposition.ts exports SpelledInterval, semitonesFromInterval, and transposeNoteSpelling, which already determine letters and accidental limits. Existing note-text.ts parses and formats supplied spellings.

docs/MUSIC_THEORY_REFERENCE.md sections Scales and modes and Degrees, keys, and spelling provide the construction formulas and seven successive letters. F-sharp major includes E-sharp; C major and D Dorian share membership but differ in tonic and degree ordering. A scale degree's ordinal position differs from its major-relative formula: E-flat is degree 3 of C natural minor, whose formula uses flat 3. D020-D023 and D027 retain pitch, spelling, and interval contracts. Domain modules import only sibling domain capabilities and do not depend on React, Next.js, Node APIs, or AI.

## Plan of Work


Milestone 1 defines ScaleType identifiers for major, natural-minor, harmonic-minor, melodic-minor-ascending, ionian, dorian, phrygian, lydian, mixolydian, aeolian, and locrian, plus ScaleDegree 1..7. Store root-relative interval patterns once and implement scalePitchClasses using semitonesFromInterval and transposePitchClass. Verify independent expected offsets, closing steps, major-mode rotations, seven unique members, tonic order, and aliases at every numeric tonic. Definitions remain internal rather than adding a public pattern interface.

Milestone 2 implements scaleNoteSpellings by transposing the supplied tonic by each interval. Verify conventional and enharmonic examples, all natural tonics across all types, supported double accidentals, numeric agreement, independent output objects, frozen input preservation, and explicit rejection when a triple accidental would be required. Use existing parsing and formatting for demonstrations; introduce no scale parser or spelling preference.

Milestone 3 implements pitchClassAtScaleDegree and scaleDegreeOfPitchClass from the same numeric construction. Validate ordinal inputs and return undefined for non-members. Verify every degree and all twelve candidate classes for every type and tonic. Test unknown runtime types, including inherited object property names, and invalid ordinal numbers without broadening the typed pitch input boundary.

Milestone 4 runs full regression and strict checking and reviews all new files and tracked changes. Update docs/ARCHITECTURE.md and README.md to describe actual implementation, add accepted D028 in docs/DECISIONS.md, and preserve existing reference content. Add a compact deferred scale/mode list under Current direction and later capabilities and the melodic-minor question under Open architectural questions. Verify those text changes and their local links. Record actual checks and limitations here.

## Concrete Steps


Working directory for every command is C:/Users/simoa/Documents/fretbo-AI-rd. Node 24.x and installed npm dependencies already exist; no installation is needed. Inspect git status --short before edits. Implement milestones in the order above and update Progress with UTC timestamps. Run npm test -- tests/scales.test.ts after each implemented capability; expect the new assertions to pass. If the known sandbox temporary-cache loading failure recurs, rerun the same check outside the sandbox without changing domain or tooling behavior. At completion run npm test, npm run typecheck, git diff --check, git diff, and git status --short. Inspect domain/music-theory/scales.ts, tests/scales.test.ts, and this plan directly because untracked files do not appear in an ordinary diff. Expected outcomes are predictions until recorded below.

## Validation and Acceptance


All eleven identifiers construct seven ordered, distinct pitch classes for all twelve tonics. Mode offsets agree with rotations of the independently stated major steps. Major/Ionian and natural-minor/Aeolian agree while names remain distinct inputs. D Dorian reorders C major's classes around D. Spelled output preserves seven successive letters and converts to the numeric result. Explicit examples include F-sharp major's E-sharp, C harmonic minor's A-flat/B, and C melodic-minor-ascending's A/B. Both positive and negative double accidentals are supported when representable; triple-accidental results raise RangeError instead of respelling. Degree queries round-trip across all types/tonics and distinguish non-members. Frozen inputs, independent outputs, and compile-time contracts are checked. All prior tests and strict checks pass; documentation records the deferred list and open question. The full effort is incomplete until these observations are verified.

## Idempotence and Recovery


Tests, type checking, and reviews are repeatable. There are no migrations or external mutations. Preserve user work and repair failures with focused edits rather than resetting the tree. On interruption, record partial completion and evidence; continuation must check current status and these recorded facts. The sandbox cache workaround changes execution permissions only and does not warrant project configuration changes.

## Artifacts and Notes


Initial working tree was clean. Previous planning verification passed 617 tests and strict checking. At 2026-10-08T09:17:47Z, npm test -- tests/scales.test.ts passed 154 tests in one file inside the sandbox. No exploratory prototype or UI harness is required.

At 2026-10-08T09:19:22Z, the same focused command passed 264 tests after the corrected spelling boundary case and exhaustive spelling checks.

At 2026-10-08T09:20:19Z, the focused command passed 412 tests and npm run typecheck exited 0. After documentation edits, final npm test outside the sandbox passed eleven files / 1,029 tests at 2026-10-08T09:21:53Z. git diff --check passed, all six changed/new files passed whitespace/conflict checks, and 49 local Markdown links and anchors resolved. Direct source review confirmed only three sibling-domain imports and no changes to existing modules or dependency manifests. Final status contains exactly the three intended tracked documentation edits and three new source/test/plan files.

## Interfaces and Dependencies


New exports are ScaleType, ScaleDegree, scalePitchClasses(tonic: PitchClass, type: ScaleType): readonly PitchClass[], scaleNoteSpellings(tonic: NoteSpelling, type: ScaleType): readonly NoteSpelling[], pitchClassAtScaleDegree(tonic: PitchClass, type: ScaleType, degree: ScaleDegree): PitchClass, and scaleDegreeOfPitchClass(tonic: PitchClass, type: ScaleType, pitchClass: PitchClass): ScaleDegree | undefined. Numeric construction and spelling share internal SpelledInterval patterns. New code imports only existing sibling pitch-class, note-spelling, and spelled-transposition modules. No existing export or dependency changes.

Revision note: 2026-10-08, initial implementation plan records the user-approved order and deferred architecture additions. Plan Mode has ended; the implementation is authorized.

Revision note: 2026-10-08, completed the ordered milestones, corrected the test-only F-double-sharp assumption, and recorded verification plus the preserved open melodic-minor question.
