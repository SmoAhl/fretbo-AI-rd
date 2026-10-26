# Add five selected altered extended chord formulas


This living ExecPlan follows [.agent/PLANS.md](../.agent/PLANS.md) and implements milestone 6 of the user-approved chord roadmap.

## Purpose / Big Picture


Extend the same named extended catalog with five explicitly selected altered structures, using private replacement of an existing extension role. Do not add a public alteration-composition API.

## Progress


- [x] 2026-10-26T08:00:26Z: Confirmed nine unaltered extensions passed 3,328 focused and 6,195 full tests plus typecheck.
- [x] 2026-10-26T08:02:39Z: Implemented five derived alterations and independent fixtures. Focused tests passed 3,648 cases in six suites; full regression passed 6,515 cases in 27 suites; typecheck passed. Updated D047, README, Architecture and reference.
- [x] 2026-10-26T08:04:05Z: Reviewed tracked diffs and all 13 new files directly; checked 132 local documentation links, five chord modules' portable imports, required ExecPlan sections and whitespace/conflict markers. git diff --check passed. Confirmed historical plans, non-chord source, configuration and dependencies unchanged; final status contains only this effort.

## Surprises & Discoveries


No new findings yet. Dominant-flat-thirteenth deliberately retains natural 11; replacing 13 does not omit other roles.

## Decision Log


2026-10-26, user-confirmed formulas: dominant-flat-ninth 1/3/5/flat-7/flat-9; dominant-sharp-ninth 1/3/5/flat-7/sharp-9; dominant-sharp-eleventh 1/3/5/flat-7/9/sharp-11; dominant-flat-thirteenth 1/3/5/flat-7/9/11/flat-13; major-sharp-eleventh 1/3/5/7/9/sharp-11. Replace the natural counterpart, preserving all other roles.

## Outcomes & Retrospective


All fourteen extended qualities are independently verified, including replacement of only the selected extension and retention of natural 11 in dominant-flat-thirteenth. Final whole-change review is complete. All six milestones passed in order. The result contains 37 named qualities plus custom formulas, with no unresolved implementation issue observed.

## Context and Orientation


D042 generic formulas and D046 complete extensions are already implemented and verified. Extend domain/music-theory/chords-symbols-and-realization/extended-chords.ts and tests/extended-chords.test.ts. Tests use independent role/offset/spelling fixtures through tests/helpers/chord-catalog.ts. Preserve all previous quality identifiers, constructors, folders and historical plans.

## Plan of Work


Extend ExtendedChordQuality and the private catalog with base quality plus replacement role definitions. Derive formulas from the complete unaltered formulas without retaining the replaced natural extension. Expand independent musical fixtures and verify all numeric/spelled matrices, alteration spelling and replacement behavior. Record D047, update README/Architecture/reference, and review all six efforts against the approved scope.

## Concrete Steps


From C:/Users/simoa/Documents/fretbo-AI-rd run npm test -- tests/extended-chords.test.ts tests/added-tone-chords.test.ts tests/seventh-chords.test.ts tests/triads.test.ts tests/chord-formulas.test.ts tests/degrees.test.ts, npm run typecheck and npm test. All must pass. Inspect tracked diffs and every new file, local documentation links, imports, whitespace/conflicts, git diff --check and final status.

## Validation and Acceptance


All fourteen extended qualities pass independent fixtures across 12 numeric and 49 spelled roots. Altered roles retain exact letters through triple accidentals; numeric output survives unspellable roots. Confirm one altered target role, no natural counterpart, preserved natural 11 in dominant-flat-thirteenth, and isolation between base and altered formula calls. Preserve every earlier regression.

## Idempotence and Recovery


Repeat checks using existing tools without changing dependencies. Preserve user changes and completed plans. Use identical outside-sandbox tests for the documented temporary SSR-cache failure. No commits, publishing, database migration or external mutation is required.

## Artifacts and Notes


Focused verification passed 3,648 tests in six suites; full regression passed 6,515 tests in 27 suites; npm run typecheck passed. All six milestones independently passed focused/full/type checks before the next began. Final review checked all 21 changed/new files, 132 local documentation links, portable .js imports, ExecPlan structure, whitespace/conflict markers and final Git status. Historical plans and all non-chord production modules remain unchanged. No new dependency, framework, UI, AI, instrument, symbol parser, register, voicing or omission API was introduced.

## Interfaces and Dependencies


Extend the existing ExtendedChordQuality union and reuse extendedChordFormula/extendedChordPitchClasses/extendedChordNoteSpellings. Use private base definitions and one replacement ChordDegreeFormula; actual construction remains D042. No new public helper or representation is required.

Revision note: 2026-10-26, completed all five selected alterations, recorded focused/full/type verification, updated D047 and current documentation, and finished whole-change review.
