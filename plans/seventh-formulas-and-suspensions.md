# Compose seventh formulas and add suspended sevenths


This living ExecPlan follows [.agent/PLANS.md](../.agent/PLANS.md) and implements milestone 3 of the user-approved chord roadmap.

## Purpose / Big Picture


Preserve eight existing seventh qualities while composing formulas rather than constructed triad tones. Add dominant-seventh-sus2 (1/2/5/flat-7) and dominant-seventh-sus4 (1/4/5/flat-7).

## Progress


- [x] 2026-10-26T07:54:36Z: Confirmed foundation and triad gates passed, with 5,028 full tests and typecheck.
- [x] 2026-10-26T07:56:52Z: Implemented and reviewed composition and suspended qualities. Focused tests passed 2,296 cases; full regression passed 5,163 cases in 25 suites; typecheck passed. Updated D044, current documentation and reference.

## Surprises & Discoveries


No new findings yet. Suspended test letter steps must differ from tertian steps; keep existing eight-quality regression assertions.

## Decision Log


2026-10-26, approved plan: add seventhChordFormula returning cloned roles from triadFormula plus a seventh role. Constructors delegate to the shared formula resolver. Preserve all previous signatures and exact-spelling behavior.

## Outcomes & Retrospective


Ten qualities now compose independent formulas and resolve through the shared foundation. Existing eight-quality signatures and behavior remain covered; suspended seventh roles and formula isolation pass.

## Context and Orientation


Use domain/music-theory/chords-symbols-and-realization/seventh-chords.ts and tests/seventh-chords.test.ts. D042 supplies formula resolution; D043 supplies six triad formulas. D041 is the historical eight-quality contract. Preserve current folders, existing source comments unless factually wrong, and completed plans. docs/ARCHITECTURE.md describes implementation reality.

## Plan of Work


Replace calls to triad tone constructors with triadFormula composition. Add two suspended definitions, formula retrieval, independent role fixtures and suspended letter expectations. Verify this increment before added-tone work. Mark D041 superseded by D044 without rewriting its historical text, and update README, Architecture and relevant reference rows.

## Concrete Steps


From C:/Users/simoa/Documents/fretbo-AI-rd run npm test -- tests/seventh-chords.test.ts tests/triads.test.ts tests/chord-formulas.test.ts tests/degrees.test.ts, npm run typecheck and npm test. Expect every check to pass. Inspect source/test changes, git diff --check and Git status.

## Validation and Acceptance


Cover ten qualities across all 12 numeric roots and 49 spellings, independent formula expectations, correct suspended letters, existing seventh-only spelling-limit failures, exact diminished sevenths, both augmented variants, output isolation and compile-time restrictions. No public shared objects may escape formula retrieval.

## Idempotence and Recovery


Checks may repeat using existing Node 24/npm/TypeScript/Vitest. Preserve user changes. If sandbox SSR-cache ENOENT occurs, rerun the identical command outside it when permitted without tooling changes.

## Artifacts and Notes


At this milestone, focused tests passed 2,296 cases; full regression passed 5,163 cases in 25 suites; npm run typecheck passed. Tests ran outside the sandbox to avoid the previously verified temporary SSR-cache ENOENT. Current documentation and the corresponding accepted decision record the demonstrated behavior. No dependencies or tooling were changed.

## Interfaces and Dependencies


Keep SeventhChordQuality and the existing root/quality constructors; extend the quality union with the two exact suspended names. Export seventhChordFormula(quality): ChordFormula. Depend only on triad formula retrieval, shared chord resolvers and existing pitch/spelling types.

Revision note: 2026-10-26, completed the authorized milestone, recorded actual focused/full/type verification, and updated its current documentation. Historical plans remain unchanged.
