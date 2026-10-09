# Construct and inspect major and minor pentatonic collections


This living ExecPlan follows [.agent/PLANS.md](../.agent/PLANS.md). Maintain its progress, findings, decisions, and outcomes throughout implementation.

## Purpose / Big Picture


Extend the four existing Music Theory scale functions with major-pentatonic and minor-pentatonic. Callers obtain five ordered pitch classes or correctly spelled notes, retrieve ordinal degrees 1..5, and identify membership. Keep seven-note behavior and public function signatures intact. Explicit interval numbers distinguish a note's musical role from its ordinal position. No new dependencies, public functions, UI, Fretboard, Playability, AI, registered runs, other collections, parsing, keys, harmonization, commits, or publishing are authorized by this effort.

## Progress


- [x] 2026-10-09T06:55:23Z: Rechecked clean Git status, AGENTS.md, full ExecPlan protocol, relevant architecture/decisions/reference, existing scale implementation and tests, and completed seven-note plan. Created this plan before implementation.
- [x] 2026-10-09T06:58:43Z: Added both explicit patterns and scale-specific ordinal validation without changing public signatures.
- [x] 2026-10-09T06:58:43Z: Focused tests passed 480 cases in two files: 68 new pentatonic cases and all 412 existing scale cases.
- [x] 2026-10-09T06:59:24Z: Full suite passed 1,097 tests in twelve files outside the sandbox; strict checking exited 0 inside the sandbox. Reviewed production diff and new tests; old tests remain unchanged.
- [x] 2026-10-09T07:01:16Z: Updated architecture/README and additive D029 after verification, removed pentatonic from deferred capabilities, retained all existing open questions, and recorded final outcomes. Reviewed all six changed/new files; whitespace/conflict checks and 52 local links/anchors passed.

## Surprises & Discoveries


The existing seven-note helper assigns interval numbers from array position. It remains correct for its existing patterns, but cannot describe pentatonic skipped letter roles. Explicit pentatonic SpelledInterval arrays avoid changing that helper or exposing custom-pattern infrastructure. Previous full-suite verification encountered a sandbox temporary-cache ENOENT and passed outside the sandbox; that is historical evidence, not a current test result.

The focused current run passed inside the sandbox. Full npm test reproduced ENOENT while loading temporary cache files: eleven suites failed before assertions, and only the two bootstrap tests ran. The same command outside the sandbox passed all 1,097 tests. No configuration workaround was introduced. No new unresolved architectural question was discovered; existing open questions remain deferred.

## Decision Log


2026-10-09, user: approve major/minor pentatonic with the minimum contract changes, existing four signatures, and runtime degree limits. Keep ScaleDegree 1..7; pentatonic ordinal degrees 6/7 throw RangeError. Update documentary notes about remaining deferred capabilities and open architecture questions after implementation.

2026-10-09, implementation: retain the existing seven-note helper and alias patterns. Add explicit upward root-relative intervals P1/M2/M3/P5/M6 and P1/m3/P4/P5/m7. Numeric and spelled construction reuse the existing shared consumers. Validate degree against the selected pattern length before indexing; no degree wrapping or octave repetition. Keep the typed pitch/spelling boundary, double-accidental limit, input preservation, and fresh readonly outputs. No compile-time cardinality overloads or new exports are needed.

Open questions remain deferred: future classical/jazz melodic-minor traversal and the architecture's other unrelated questions. No unanswered requirement blocks this increment. Record newly discovered consequential questions rather than accepting them implicitly.

## Outcomes & Retrospective


All approved pentatonic behavior is implemented and verified. Five-note patterns flow through the existing numeric/spelled consumers; explicit interval roles preserve skipped letters without changing seven-note definitions or adding a generic pattern interface. Ordinal lookup now checks selected cardinality and only transposes the requested interval. Runtime rejection of pentatonic 6/7 coexists with unchanged ScaleDegree and public signatures. All 1,029 prior tests and 68 new tests pass; strict checking passes. Architecture and README describe current behavior, D029 records the additive contract, and the deferred list no longer includes implemented pentatonic. Existing melodic-minor and other architecture questions remain open; no new unresolved question was discovered. The known sandbox cache-loading limitation required an outside-sandbox full-suite rerun. Scope is complete; existing double-accidental limits and other deferred capabilities remain intentional limits. No dependencies, commits, or publications were introduced.

## Context and Orientation


domain/music-theory/scales.ts initially exported eleven ScaleType names; this completed increment adds two pentatonic names for thirteen total. ScaleDegree 1..7 and the four functions scalePitchClasses, scaleNoteSpellings, pitchClassAtScaleDegree, and scaleDegreeOfPitchClass retain their signatures. Internal patterns contain SpelledInterval values. semitonesFromInterval and transposePitchClass produce numeric classes; transposeNoteSpelling produces interval-role spelling and rejects required accidentals outside -2..2. PitchClass inputs are typed values 0..11 and NoteSpelling carries uppercase letter and explicit accidental. Readonly results are independent per call, not shared or promised runtime-frozen.

docs/MUSIC_THEORY_REFERENCE.md defines major pentatonic as 1/2/3/5/6 (offsets 0/2/4/7/9) and minor pentatonic as 1/flat3/4/5/flat7 (0/3/5/7/10). Ordinal positions are 1..5: C major pentatonic's fourth is G (a fifth above C), and C minor pentatonic's second is E-flat (a minor third above C). Seven-letter succession does not apply to these five-note collections. D028 and plans/scales-and-modes.md record the completed seven-note increment; preserve their historical context. Architecture remains the owner of current implementation and open questions, decisions owns accepted contracts, and this plan owns execution history.

## Plan of Work


Milestone 1 extends ScaleType and adds two explicit five-interval patterns in domain/music-theory/scales.ts. Keep all existing definitions and consumers. Update pitchClassAtScaleDegree to reject ordinals outside the selected pattern's length and adjust comments that incorrectly promise seven notes for every type. Outcome: all four functions support pentatonic without altering their signatures.

Milestone 2 adds tests/pentatonic-scales.test.ts with independent offsets, interval letter steps, and examples. Check all twelve numeric tonics, all 35 spellings across both types, degree/member round trips, unknown types, invalid ordinals, double/triple accidental boundaries, fresh output objects, frozen inputs, and parse/construct/format paths. Run focused tests together with unchanged tests/scales.test.ts, then the full suite and strict checking. Outcome: verified five-note behavior and unchanged seven-note behavior.

Milestone 3 updates docs/ARCHITECTURE.md and README.md after behavior passes. Record D029 as an additive extension of D028. Remove pentatonic from the deferred list but retain chromatic, minor-scale modes, registered runs, custom patterns/relative modes, and parsing/keys/harmonization. Preserve the melodic-minor question and other open questions. Any newly discovered unresolved questions belong in architecture notes; do not invent new questions merely to fill that section. Review tracked diffs and both new files, resolve local links, and update final evidence here.

## Concrete Steps


All commands run from C:/Users/simoa/Documents/fretbo-AI-rd. Existing Node 24.x and installed npm dependencies are prerequisites; no installation is planned. Inspect git status --short, implement milestone 1 and the focused tests, then run npm test -- tests/pentatonic-scales.test.ts tests/scales.test.ts. Expect both files to pass, including degrees 6/7 rejected only for pentatonic. Run npm test and npm run typecheck; expect all old/new tests and both strict TypeScript configurations to pass. If sandbox temporary-cache loading fails, rerun tests outside the sandbox without modifying tooling. After verified implementation, update documentation and run git diff --check, git diff, and git status --short. Read new source/test/plan content directly because an ordinary diff omits untracked files. Record actual results separately from expectations.

## Validation and Acceptance


Both types produce five distinct ordered classes at all twelve tonics and exclude octave repetition. C major pentatonic spells C/D/E/G/A, and C minor pentatonic spells C/E-flat/F/G/B-flat. Major ordinal 4 is the fifth above the tonic; minor ordinal 2 is its minor third. Every member returns its ordinal degree; each non-member returns undefined. Both pentatonic types reject 6/7 while all eleven seven-note types retain 6/7. Independent natural-letter coordinates, expected offsets, and skipped letter positions verify all 35 tonic spellings without importing production patterns. Unsupported triple accidentals raise RangeError, while representable doubles remain supported. Frozen inputs and independent output arrays/objects are checked. Existing compile-time contracts and old regression tests remain intact; new compile-time checks confirm the identifiers and unchanged signatures. Full npm test, npm run typecheck, and git diff --check pass. Documentary notes describe implemented pentatonic, remaining deferred work, and retained open questions.

## Idempotence and Recovery


Tests, checking, and reviews are repeatable. There are no migrations or external mutations. Preserve user work, fix failures locally, and do not reset the tree. If interrupted, record partial progress and verify the working tree before resuming. The temporary-cache workaround concerns execution permissions only; do not introduce configuration changes to hide it.

## Artifacts and Notes


Initial Git status was clean. The earlier seven-note plan records 1,029 passing tests and strict checking on 2026-10-08. No prototype or UI harness is required.

At 2026-10-09T06:58:43Z, npm test -- tests/pentatonic-scales.test.ts tests/scales.test.ts passed 480 tests in two files inside the sandbox. Initial source diff and git diff --check passed. The new tests independently cover every numeric tonic and all 35 spelling inputs for each pentatonic type. Existing tests/scales.test.ts is unchanged.

At 2026-10-09T06:59:23Z, npm test outside the sandbox passed twelve files / 1,097 tests (all 1,029 existing tests plus 68 new tests). npm run typecheck exited 0 after Next.js type generation and strict application/NodeNext checks. Source and test content were reviewed directly before documentation edits.

At 2026-10-09T07:01:16Z, tracked diffs and both new files were reviewed, git diff --check passed, all six changed/new files passed whitespace/conflict checks, and 52 local Markdown links/anchors resolved. A direct documentary audit confirmed chromatic remains deferred, pentatonic no longer appears in that list, and the classical/jazz melodic-minor question remains. Final intended status is four tracked edits (scales.ts, architecture, decisions, README) and two new files (this plan and the pentatonic tests); existing seven-note tests, references, prior plans, and dependency manifests are unchanged.

## Interfaces and Dependencies


Add only major-pentatonic/minor-pentatonic to ScaleType. Keep ScaleDegree = 1|2|3|4|5|6|7 and scalePitchClasses(tonic: PitchClass, type: ScaleType): readonly PitchClass[], scaleNoteSpellings(tonic: NoteSpelling, type: ScaleType): readonly NoteSpelling[], pitchClassAtScaleDegree(tonic: PitchClass, type: ScaleType, degree: ScaleDegree): PitchClass, and scaleDegreeOfPitchClass(tonic: PitchClass, type: ScaleType, pitchClass: PitchClass): ScaleDegree | undefined. Selected pattern cardinality controls valid ordinal bounds. Existing portable sibling-domain dependencies remain unchanged.

Revision note: 2026-10-09, initial plan records the approved pentatonic scope, runtime cardinality decision, ordered milestones, and documentation-after-verification requirement.

Revision note: 2026-10-09, completed the ordered milestones, recorded focused/full/type verification and the sandbox cache limitation, and closed documentary notes with existing open questions preserved.
