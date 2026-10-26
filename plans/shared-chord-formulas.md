# Resolve custom chord formulas without register


This living ExecPlan follows [.agent/PLANS.md](../.agent/PLANS.md). The user authorized the six-stage chord roadmap on 2026-10-26; this plan owns only its shared foundation.

## Purpose / Big Picture


Construct ordered pitch classes and exact note spellings from custom root-relative chord formulas. Preserve compound role identity without assigning octaves. Named chord categories remain unchanged until this foundation passes independently.

## Progress


- [x] 2026-10-26T07:52:00Z: Implemented and reviewed source/tests. Focused verification passed 2,030 tests in four suites; typecheck passed; full regression passed 4,897 tests in 25 suites. Documented the verified contract in D042, Architecture and README.

## Surprises & Discoveries


Existing simple-degree conversion already preserves final accidentals and exact letters. Reduce positive safe-integer numbers to simple roles only for resolution; no large interval arithmetic is necessary. Sparse arrays require iteration that visits missing entries.

## Decision Log


2026-10-26, user-approved plan: ChordDegreeFormula uses number: number and alteration: Accidental. Validate positive safe integers and alterations -3..3. Nonempty custom formulas need no root, third, cardinality or uniqueness rule. Keep DegreeFormula and its parser unchanged. Return independent readonly-by-type outputs without freezing.

## Outcomes & Retrospective


The shared foundation is independently verified. Named constructors remained unchanged through its acceptance gate. No new dependencies or changes to simple degrees were needed.

## Context and Orientation


The starting commit is 3a5b178 with four triads, eight sevenths, and subject-based folders. docs/ARCHITECTURE.md and D036/D039 establish simple degree construction and triple accidentals; D040/D041 establish the existing named contracts. Add domain/music-theory/chords-symbols-and-realization/chord-formulas.ts and tests/chord-formulas.test.ts. Existing degree converters live in domain/music-theory/degrees-keys-and-spelling/degrees.ts. All calculations stay portable Music Theory code, independent of UI, AI, Fretboard and Playability.

## Plan of Work


Implement the two resolvers over one private validating reduction helper. Preserve supplied role order, duplicates and exact spellings. Verify malformed inputs, safe-number boundaries, all simple roles and alterations across 49 root spellings, custom and compound examples, and independent outputs. Then record the verified foundation in README, Architecture and a new decision without changing named chord behavior.

## Concrete Steps


From C:/Users/simoa/Documents/fretbo-AI-rd, run npm test -- tests/chord-formulas.test.ts tests/degrees.test.ts tests/triads.test.ts tests/seventh-chords.test.ts, npm run typecheck, and npm test. Expect all assertions and type checks to pass. Inspect new files directly, git diff --check and git status --short. Existing Node 24, npm, TypeScript and Vitest suffice; introduce no dependencies.

## Validation and Acceptance


Verify independent numeric and letter expectations, 2/9 equivalence without input normalization, altered 9/11/13 roles, largest safe degree, duplicate and rootless formulas, triple versus quadruple boundaries, numeric independence, malformed and sparse inputs, frozen inputs, result isolation and compile-time readonly contracts. Preserve existing chord and non-chord behavior.

## Idempotence and Recovery


Checks may repeat and write ignored caches. If sandbox SSR-cache ENOENT prevents assertions, rerun the identical test command outside it when permitted; do not change project tooling. Preserve existing work and never reset the repository. Record partial progress honestly.

## Artifacts and Notes


At this milestone, focused tests passed 2,030 cases; full regression passed 4,897 cases in 25 suites; npm run typecheck passed. Tests ran outside the sandbox to avoid the previously verified temporary SSR-cache ENOENT. Current documentation and the corresponding accepted decision record the demonstrated behavior. No dependencies or tooling were changed. The initial largest-safe-degree fixture was corrected after an independent BigInt calculation established simple role 3; production reduction was correct.

## Interfaces and Dependencies


Export ChordDegreeFormula, ChordFormula, chordPitchClasses(root, formula) and chordNoteSpellings(root, formula). Import only existing degree converters and pitch/spelling types through relative .js imports. Reject malformed formulas and unsupported exact spellings with RangeError; roots retain their existing typed boundary.

Revision note: 2026-10-26, completed the authorized milestone, recorded actual focused/full/type verification, and updated its current documentation. Historical plans remain unchanged.
