# Construct seven added-tone chord qualities


This living ExecPlan follows [.agent/PLANS.md](../.agent/PLANS.md) and implements milestone 4 of the user-approved chord roadmap.

## Purpose / Big Picture


Provide major-add2, major-add9, minor-add9, major-add11, major-sixth, minor-sixth and major-sixth-ninth, composing triad formulas without implying a seventh or octave placement.

## Progress


- [x] 2026-10-26T07:56:52Z: Confirmed seventh milestone passed 2,296 focused and 5,163 full tests plus typecheck.
- [x] 2026-10-26T07:58:38Z: Implemented and reviewed all seven qualities and independent fixture helper. Focused tests passed 2,749 cases in five suites; typecheck passed; full regression passed 5,616 cases in 26 suites. Documented D045 and current capabilities.

## Surprises & Discoveries


No findings yet. Add2 and add9 share sounding and spelled results while retaining distinct degree numbers.

## Decision Log


2026-10-26, approved plan: Seven exact quality names map to triad formulas plus added roles: major-add2 1/3/5/2; major-add9 1/3/5/9; minor-add9 1/flat-3/5/9; major-add11 1/3/5/11; major-sixth 1/3/5/6; minor-sixth 1/flat-3/5/6; major-sixth-ninth 1/3/5/6/9. Added tones retain the third and imply no seventh.

## Outcomes & Retrospective


All seven formulas, all 12 numeric roots and all 49 spelled roots per quality pass, along with exact examples, invalid selectors, result isolation and static contracts. Add2/add9 preserve distinct roles with equal unregistered output.

## Context and Orientation


D042 supplies validated custom formula resolution, D043 supplies six independent triad formulas and D044 supplies ten seventh qualities. Add domain/music-theory/chords-symbols-and-realization/added-tone-chords.ts and tests/added-tone-chords.test.ts using existing folders and tests/helpers/chord-catalog.ts for independent catalog assertions. docs/ARCHITECTURE.md describes only demonstrated behavior.

## Plan of Work


Implement a private triad-plus-roles table, cloned formula retrieval and two shared-resolver wrappers. Add independent expected roles, semitone offsets and C spellings for all seven qualities; check 12 numeric roots and 49 spelled roots, failures, invalid selectors, isolation and type contracts. After passing, record D045 and current documentation.

## Concrete Steps


From C:/Users/simoa/Documents/fretbo-AI-rd run npm test -- tests/added-tone-chords.test.ts tests/triads.test.ts tests/seventh-chords.test.ts tests/chord-formulas.test.ts tests/degrees.test.ts, npm run typecheck and npm test. Expect all checks to pass. Inspect new files, diffs, git diff --check and status.

## Validation and Acceptance


All seven independently specified formulas, numeric offsets and exact letters must match. Formula objects, numeric arrays and note objects are fresh and readonly by type without freezing. Frozen roots remain unchanged. Reject unknown names with RangeError; preserve exact accidental limits and numeric independence. Add2/add9 must retain distinct formula numbers.

## Idempotence and Recovery


Existing Node 24/npm/TypeScript/Vitest suffice. Repeat checks safely and preserve historical work. Use the identical test command outside the sandbox when its temporary SSR-cache failure prevents assertions; never change tooling to hide failures.

## Artifacts and Notes


At this milestone, focused tests passed 2,749 cases; full regression passed 5,616 cases in 26 suites; npm run typecheck passed. Tests ran outside the sandbox to avoid the previously verified temporary SSR-cache ENOENT. Current documentation and the corresponding accepted decision record the demonstrated behavior. No dependencies or tooling were changed.

## Interfaces and Dependencies


Export AddedToneChordQuality, addedToneChordFormula(quality): ChordFormula, addedToneChordPitchClasses(root, quality): readonly PitchClass[] and addedToneChordNoteSpellings(root, quality): readonly NoteSpelling[]. Use triadFormula and D042 resolvers only for composition and construction.

Revision note: 2026-10-26, completed the authorized milestone, recorded actual focused/full/type verification, and updated its current documentation. Historical plans remain unchanged.
