# Key-aware spelling from an explicit key and degree role


This plan follows [.agent/PLANS.md](../.agent/PLANS.md). Maintain progress, evidence, decisions, and outcomes during implementation. The user approved and authorized implementation on 2026-10-12.

## Purpose / Big Picture


Select a NoteSpelling for a numeric pitch class using an explicit key and, when needed, a musical role. Without a role, use the signature baseline: major for major keys, natural minor for minor keys. This spelling-selection convention does not select a collection for subsequent musical operations.

Outside the baseline return undefined unless a DegreeFormula is supplied. An explicit role must match the requested pitch class and takes precedence over baseline selection. Support all existing key identities while validating only the selected spelling against +/-2. Registered output, candidate enumeration, fallback policies, ordinal roles, inferred musical context, UI, and AI remain deferred.

## Progress


- [x] 2026-10-12T14:03:42Z: Read instructions, protocol, relevant architecture/decisions/reference, existing spelling/key/degree logic/tests, and completed plans. User selected pitch-class output, DegreeFormula roles, unresolved results without sufficient context, and selected-result validation across all identities.
- [x] 2026-10-12T14:03:42Z: Planning baseline passed 1,247 tests in three suites outside the sandbox; status and whitespace were clean.
- [x] 2026-10-12T14:54:47Z: Rechecked clean status, instructions/protocol, relevant implementation and documentation before saving the approved plan.
- [x] 2026-10-12T14:58:58Z: 1. Established the interface, required-input/readonly checks, and independent baseline fixtures for all key identities.
- [x] 2026-10-12T14:58:58Z: 2. Implemented key-only selection; 95 tests passed across all 70 keys/twelve classes, selected-result limits, and generic policy compatibility.
- [x] 2026-10-12T15:01:25Z: 3. Implemented explicit-role selection and numeric agreement checks; all 204 new tests passed, covering baseline/role precedence and all formulas across keys.
- [x] 2026-10-12T15:02:27Z: 4. Focused regression passed 1,451 tests in four files; typecheck passed inside the sandbox; full npm test passed 3,469 tests in 22 files outside the sandbox.
- [x] 2026-10-12T15:05:47Z: 5. Updated README, architecture, Music Theory reference, and D038; preserved both deferred TODO triggers. Reviewed new files and tracked diffs, sibling-only imports, whitespace/conflicts, and final status. Existing domain code/comments are unchanged.

## Surprises & Discoveries


Existing degree queries identify baseline membership numerically and spell individual roles. They support selected notes even when constructing the entire spelled collection fails: B-double-sharp major's tonic is representable while some other members require triples. C-flat minor can supply spellings despite its unsupported conventional signature. Generic selection prefers naturals (class 5 becomes F); key-aware F-sharp major must return E-sharp.

The initial independent matrix passed, but a hand-written fixture incorrectly treated class 0 as outside B-double-sharp major's baseline. It is the seventh, requiring A triple sharp; RangeError was correct. Corrected the unresolved example to class 2 without changing production logic.

## Decision Log


2026-10-12, user: Pitch classes first; reuse major-relative DegreeFormula; return unresolved outside baseline without a role; accept all key identities with selected-result validation.

2026-10-12, approved plan: Add a separate function/module and preserve generic sharps/flats APIs. Validate pitch classes and key mode before selection. Check explicit formula/pitch agreement before spelling. Existing +/-2 limits and RangeError contracts remain unchanged; deferred triple-accidental/structured-error TODOs retain their capability-driven triggers.

## Outcomes & Retrospective


All five numbered tasks are complete. The public function is implemented, verified, and reviewed. All 70 key/twelve-class baseline combinations and all 35 formulas across key identities are covered, including unresolved cases, representation limits, role mismatch/precedence, readonly types, and input isolation. Focused tests, typecheck, and full regression pass. Documentation records D038 and preserves deferred TODOs/triggers. Tracked/new-file whitespace and conflict checks passed; final status contains only this effort's three new files and four documentation changes.

Numeric membership plus selected formula spelling preserved support for theoretical key identities without requiring signatures or whole-collection spelling. Explicit role precedence separates musical intent from pitch identity, and unresolved results do not label a pitch musically invalid. Reusing existing capabilities avoided new musical tables, spelling algorithms, or changes to generic selection. Work remains uncommitted; broader spelling/context and error/representation improvements remain deferred.

## Context and Orientation


domain/music-theory/spelling-selection.ts uses explicit sharps/flats policy. keys.ts preserves tonic spelling and major/minor identity separately from signatures. degrees.ts supplies major-relative formulas, numeric membership, and spelling conversion. D020/D022/D036/D037 preserve these distinctions. Reuse createKey, pitchClassFromSpelling, collectionDegreeOfPitchClass, pitchClassFromDegreeFormula, and noteSpellingFromDegreeFormula without new scale tables or spelling algorithms.

Explicit roles are major/perfect-relative from the key tonic even in minor keys. B minor formula 6 identifies G-sharp; its natural-minor baseline sixth has formula flat 6 and identifies G. New code/tests belong in domain/music-theory/key-aware-spelling.ts and tests/key-aware-spelling.test.ts. Documentation owners are architecture, accepted decisions, the musical reference, and README; no new tooling is needed.

## Plan of Work


### 1. Establish the interface and fixtures


Add the public function and independent baseline/spelling/role fixtures using existing types. Runtime pitch classes must be integers in 0..11; reuse key construction for mode validation while retaining the typed tonic boundary. Verify required arguments and readonly output through type checks. The final interface includes the optional role added in milestone 3.

### 2. Implement key-only selection


For omitted/undefined role, choose major or natural-minor baseline by key mode. Use numeric membership to retrieve its formula; return undefined for non-members and spell the matching formula from the supplied tonic. Never construct the entire spelled collection or require keySignature. Verify baseline behavior, representation limits, and theoretical-key examples independently.

### 3. Implement explicit-role selection


Validate a supplied role through numeric formula conversion, compare its pitch class to the request, and throw RangeError on mismatch. For matches, return the role's exact spelling regardless of baseline membership. Propagate final accidental-limit RangeError without respelling or fallback. Verify enharmonic alternatives and role precedence.

### 4. Complete verification


Test all 70 keys against all twelve classes without roles: seven baseline members/five unresolved classes per identity, with failures where selected spellings exceed +/-2. Exercise all 35 formulas across tonic spellings and both modes using independent expected letters/displacements. Check invalid inputs, mismatches, frozen inputs, fresh outputs, and generic-selection regressions. Run focused tests, strict type checks, then one full suite.

### 5. Document and review


Update architecture, README, relevant Music Theory reference, and an additive accepted decision. Explain baseline as a convention rather than all pitches usable in a key; undefined means this policy did not choose spelling, not musical invalidity. Preserve deferred TODOs/triggers, and defer register, context inference, candidates, and fallback policies. Review new files directly, tracked diffs, imports, whitespace, and final status. Teach baseline versus explicit-role selection with a concrete example in the implementation report.

## Concrete Steps


Run from C:\Users\simoa\Documents\fretbo-AI-rd:

1. Inspect git -c safe.directory=C:/Users/simoa/Documents/fretbo-AI-rd status --short, applicable instructions, and current state; save this plan.
2. Perform tasks 1–3 in order, extending/running npm test -- tests/key-aware-spelling.test.ts as behavior becomes available.
3. Run npm test -- tests/key-aware-spelling.test.ts tests/spelling-selection.test.ts tests/degrees.test.ts tests/keys.test.ts.
4. Run npm run typecheck.
5. Run npm test.
6. Update docs; review tracked diffs, new files directly, git diff --check, and final status with the repository-local override.

Expect passing assertions, no type errors, and clean whitespace. Record actual results separately.

## Validation and Acceptance


| Key | Class | Explicit role | Expected |
|---|---:|---|---|
| F-sharp major | 5 | Omitted | E-sharp |
| G-flat major | 11 | Omitted | C-flat |
| B minor | 9 | Omitted | A |
| B minor | 10 | Omitted | undefined |
| B minor | 10 | 7 | A-sharp |
| B minor | 8 | 6 | G-sharp |
| C major | 1 | Omitted | undefined |
| C major | 1 | Sharp 1 / flat 2 | C-sharp / D-flat |
| C major | 0 | Sharp 7 | B-sharp overriding baseline C |
| C major | 1 | 3 | RangeError: role/pitch mismatch |
| C-flat minor | 11 | Omitted | C-flat despite unsupported signature |
| B-double-sharp major | 1 | Omitted | B-double-sharp despite other unrepresentable members |
| B-double-sharp major | 5 | Omitted or 3 | RangeError: D triple sharp required |

Check invalid pitch classes/modes/formula fields, accidental limits, omitted/explicit undefined role, fresh readonly outputs, input preservation, and compile-time rejection of text keys, ordinal roles, or missing key. Generic spellingFromPitchClass(5, "sharps") remains F. No existing public contract changes.

## Idempotence and Recovery


Pure operations/checks repeat safely. Inspect state on continuation and preserve user work. Repair focused failures and rerun affected checks. Separate environment failures from assertions; do not change repository config solely to bypass sandbox issues.

## Artifacts and Notes


Planning command npm test -- tests/spelling-selection.test.ts tests/degrees.test.ts tests/keys.test.ts passed 3 suites / 1,247 tests outside the sandbox. Read-only checks confirmed E-sharp in F-sharp major, selected theoretical-key spellings, and +/-2 limits.

Implementation: initial baseline run passed 94/95 tests with one incorrect hand-written expectation; after correcting it, baseline passed 95/95. Final new suite passed 204 tests. Focused regression passed 1,451 tests in four files; npm run typecheck passed. Full npm test passed 3,469 tests in 22 files, including 204 new tests. Test runs used the established outside-sandbox workaround; typecheck ran inside the sandbox. Production/test code was unchanged between focused and full verification.

## Interfaces and Dependencies


    spellingFromPitchClassInKey(
      pitchClass: PitchClass,
      key: Key,
      role?: DegreeFormula,
    ): NoteSpelling | undefined

Pitch/key are required; optional role is always major-relative. Return fresh readonly spellings without runtime freezing. Depend only on sibling Music Theory modules, preserving existing keys, degrees, parser, signatures, and generic spelling APIs. No dependencies, migrations, registered output, error infrastructure, commits, or publishing are included.

Revision note: 2026-10-12 — Saved the approved plan for implementation, retaining agreed baseline, role, unresolved-result, output, and key-support boundaries.

Revision note: 2026-10-12 — Recorded milestone verification, the corrected fixture, D038, and current implementation status; broader spelling and error/representation changes remain deferred.

Revision note: 2026-10-12 — Completed documentation and final review; all five tasks are verified with preserved existing code boundaries and deferred TODO triggers.
