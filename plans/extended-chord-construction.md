# Construct complete ninth eleventh and thirteenth chords


This living ExecPlan follows [.agent/PLANS.md](../.agent/PLANS.md) and implements milestone 5 of the user-approved chord roadmap.

## Purpose / Big Picture


Support dominant, major and minor ninth, eleventh and thirteenth formulas as complete theoretical structures, with no omission or guitar-voicing rules.

## Progress


- [x] 2026-10-26T07:58:38Z: Added-tone milestone passed 2,749 focused and 5,616 full tests plus typecheck; prior three gates passed.
- [x] 2026-10-26T08:00:26Z: Implemented and reviewed nine complete extended constructions. Focused tests passed 3,328 cases in six suites; full regression passed 6,195 cases in 27 suites; typecheck passed. Documented D046 and current behavior.

## Surprises & Discoveries


No new findings yet. Complete eleventh/thirteenth formulas retain the third and natural eleventh even where practical voicings might omit them.

## Decision Log


2026-10-26, approved plan: dominant uses dominant-seventh, major uses major-seventh, minor uses minor-seventh. Append role 9 for ninths, 9/11 for elevenths, and 9/11/13 for thirteenths. Each family has exact identifiers dominant-ninth/eleventh/thirteenth, major-ninth/eleventh/thirteenth and minor-ninth/eleventh/thirteenth.

## Outcomes & Retrospective


All nine complete theoretical formulas pass independent role, numeric and spelling matrices. Thirds and intermediate extensions are preserved; no realization rules or public composition framework was introduced.

## Context and Orientation


Add domain/music-theory/chords-symbols-and-realization/extended-chords.ts and tests/extended-chords.test.ts. D042 supplies generic resolution, D044 supplies independent seventh formulas; D045 added-tone work already passes. Reuse tests/helpers/chord-catalog.ts with independently specified musical fixtures. Preserve folders, existing contracts and historical plans.

## Plan of Work


Compose seventhChordFormula with copied extension-role patterns for the nine named definitions. Export a quality union and consistent formula/numeric/spelled helpers. Verify every quality across all roots and spelling boundaries and preserve complete formula order. Then add D046 and update current documentation/reference before altered extensions begin.

## Concrete Steps


From C:/Users/simoa/Documents/fretbo-AI-rd run npm test -- tests/extended-chords.test.ts tests/added-tone-chords.test.ts tests/seventh-chords.test.ts tests/triads.test.ts tests/chord-formulas.test.ts tests/degrees.test.ts, npm run typecheck and npm test. Expect all to pass. Review source/new tests, git diff --check and status.

## Validation and Acceptance


Independent complete formulas, compound offsets and exact C spellings must match. Check all 12 numeric roots and 49 spelled roots per quality, selected-output errors, input/result/formula isolation, unsupported selectors, type restrictions and retention of the third/natural eleventh. Numeric construction remains independent of spelling representability.

## Idempotence and Recovery


Use existing tools and dependencies. Repeat checks safely, preserve work, and rerun identical tests outside the sandbox only when needed for its known temporary SSR-cache failure. No database, Git or external migration is needed.

## Artifacts and Notes


At this milestone, focused tests passed 3,328 cases; full regression passed 6,195 cases in 27 suites; npm run typecheck passed. Tests ran outside the sandbox to avoid the previously verified temporary SSR-cache ENOENT. Current documentation and the corresponding accepted decision record the demonstrated behavior. No dependencies or tooling were changed.

## Interfaces and Dependencies


Export ExtendedChordQuality, extendedChordFormula(quality): ChordFormula, extendedChordPitchClasses(root, quality): readonly PitchClass[] and extendedChordNoteSpellings(root, quality): readonly NoteSpelling[]. Compose only existing seventh formulas and shared resolution; no public alteration composition API.

Revision note: 2026-10-26, completed the authorized milestone, recorded actual focused/full/type verification, and updated its current documentation. Historical plans remain unchanged.
