# Adapt triads to shared formulas and add suspensions


This living ExecPlan follows [.agent/PLANS.md](../.agent/PLANS.md) and implements milestone 2 of the user-approved chord roadmap.

## Purpose / Big Picture


Move the four existing triads onto the verified shared resolver and add suspended three-tone structures sus2 (1/2/5) and sus4 (1/4/5), without changing existing constructor signatures or behavior.

## Progress


- [x] 2026-10-26T07:52:44Z: Confirmed shared foundation passed 2,030 focused and 4,897 full tests plus typecheck. Adapted triad source and expanded independent fixtures.
- [x] 2026-10-26T07:54:36Z: Focused tests passed 2,161 cases in four suites; full regression passed 5,028 cases in 25 suites; typecheck passed. Reviewed source/tests and documented D043, README, Architecture and suspended reference rows.

## Surprises & Discoveries


Existing test letter steps assumed thirds; suspended fixtures must instead use second/fourth letter steps. The old sus4 rejection is deliberately replaced by an unsupported sus alias.

## Decision Log


2026-10-26, approved plan: triadFormula returns fresh ChordFormula role objects. Both constructors delegate to shared chord resolution. TriadQuality gains sus2/sus4 while preserving four tertian names and typed roots.

## Outcomes & Retrospective


Six triad qualities and independent formula retrieval are verified. All existing constructors retain their signatures and prior behavior. Suspended fixtures now use the correct letter roles.

## Context and Orientation


The current subject-based structure is preserved. domain/music-theory/chords-symbols-and-realization/triads.ts contains the private catalog; tests/triads.test.ts contains independent musical fixtures. D036/D039 preserve simple degree/spelling behavior; D042 supplies custom formulas. D040 is the historical four-triad contract. docs/ARCHITECTURE.md remains the implementation authority.

## Plan of Work


Extend formulas and export triadFormula with cloned roles. Route constructors through chordPitchClasses/chordNoteSpellings. Generalize test letter steps for suspended qualities, preserve prior assertions, add formula retrieval/isolation/type coverage, and verify all 12 numeric and 49 spelled roots per quality. After passing, record D043 replacing D040 while preserving its historical text and update current documentation/reference.

## Concrete Steps


From C:/Users/simoa/Documents/fretbo-AI-rd run npm test -- tests/triads.test.ts tests/seventh-chords.test.ts tests/chord-formulas.test.ts tests/degrees.test.ts, npm run typecheck and npm test. All must pass. Review new files, imports, git diff --check and Git status. Existing Node 24/npm/TypeScript/Vitest suffice.

## Validation and Acceptance


Six qualities have independent sounding and letter expectations. Existing four-quality behavior, spelling limits, enharmonic roots, scale independence and result isolation remain covered. Formula retrieval must expose neither shared arrays nor shared role objects; unsupported selectors throw RangeError.

## Idempotence and Recovery


Repeat checks safely; preserve existing work and historical plans. Rerun identical test commands outside the sandbox if its known temporary SSR cache prevents assertions. Do not reset or change tooling.

## Artifacts and Notes


At this milestone, focused tests passed 2,161 cases; full regression passed 5,028 cases in 25 suites; npm run typecheck passed. Tests ran outside the sandbox to avoid the previously verified temporary SSR-cache ENOENT. Current documentation and the corresponding accepted decision record the demonstrated behavior. No dependencies or tooling were changed.

## Interfaces and Dependencies


Keep triadPitchClasses(root, quality) and triadNoteSpellings(root, quality). Add triadFormula(quality): ChordFormula and extend TriadQuality. Use only existing portable domain imports with .js specifiers.

Revision note: 2026-10-26, completed the authorized milestone, recorded actual focused/full/type verification, and updated its current documentation. Historical plans remain unchanged.
