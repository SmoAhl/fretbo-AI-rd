# Keys and key signatures: explicit identity and relationships


This plan follows [.agent/PLANS.md](../.agent/PLANS.md). Maintain progress, findings, decisions, and outcomes during implementation. The user accepted and authorized this effort on 2026-10-12.

## Purpose / Big Picture


Domain callers can create an explicitly spelled major/minor key, construct its conventional signature, and find its relative and parallel key. Keep key identity, key signature, and scale collection separate: B minor retains its identity/signature when a caller separately selects natural, harmonic, or melodic-minor material.

Use structured inputs and existing tonic spellings through double accidentals. Signatures support zero to seven sharps or flats. Identity and relationships remain independent of signature availability. Key text, theoretical signatures, key-aware spelling, signature-to-key inference, harmonization, UI, AI, and dependencies are deferred. Triple-accidental support and improved error classification are documentation-only TODOs in this increment.

## Progress


- [x] 2026-10-12T09:57:19Z: Inspected instructions, complete planning protocol, architecture, relevant decisions/reference sections, implementation, and completed Degrees plan. User selected separate identity/signature boundaries and structured-only input.
- [x] 2026-10-12T09:57:19Z: Verified 30 conventional signatures and six relative-key spelling-limit cases. Focused baseline passed 1,344 tests outside the sandbox; working tree and whitespace checks were clean.
- [x] 2026-10-12T10:19:15Z: Rechecked clean status, instructions, dependencies, affected code/reference, and documentation locations; saved the accepted plan for implementation.
- [x] 2026-10-12T10:21:48Z: 1. Established key identity/types and independent conventional fixtures; all 83 identity tests passed outside the sandbox.
- [x] 2026-10-12T10:23:23Z: 2. Implemented conventional signature construction; 169 identity/signature tests passed, covering 30 supported and 40 rejected signatures.
- [x] 2026-10-12T10:26:24Z: 3. Implemented relative/parallel relationships using existing spelling capabilities; all 341 key tests passed, covering all identities and relationship limits.
- [x] 2026-10-12T10:27:35Z: 4. Focused regression passed 1,685 tests in four suites; npm run typecheck passed; full npm test passed 3,265 tests in 21 files.
- [x] 2026-10-12T10:31:00Z: 5. Updated architecture, README, Music Theory reference, and D037; recorded both TODOs and capability triggers. Reviewed all new files and tracked diffs, sibling-only imports, whitespace/conflicts, and final status. Existing production modules/comments remain unchanged.

## Surprises & Discoveries


Existing spelling supports 35 tonics, permitting 70 major/minor identities. Only 30 have conventional signatures within this increment's limits. Six identities need a triple accidental for their relative tonic; existing formula conversion rejects these results with RangeError.

The planning baseline encountered a Vitest temporary-file ENOENT failure in the sandbox. The identical command outside the sandbox passed. This is an environment failure rather than an assertion failure.

## Decision Log


2026-10-12, user: Accept separate identity/signature boundaries and structured-only input. Require explicit spelling and major/minor identity; preserve enharmonic distinctions without silent respelling. Return signatures as ordered readonly arrays of altered letters.

2026-10-12, accepted plan: Use natural minor as the conventional minor-signature baseline internally, without selecting a collection for subsequent operations. Keep the typed tonic boundary and existing -2..2 spelling/RangeError contracts.

2026-10-12, user: Record future triple-accidental support and improved error handling with capability-driven triggers. They do not change this implementation's scope, limits, or errors.

## Outcomes & Retrospective


All five numbered tasks are complete. Four public functions and readonly types are implemented and reviewed. Tests cover all 70 identities/parallel relationships, 30 conventional signatures, 40 signature rejections, 64 representable relative relationships, and six relative spelling-limit failures. Focused tests, type checking, and full regression pass. Documentation records D037 and both deferred TODOs with their capability triggers. Tracked/new-file whitespace and conflict checks passed; final status contains only this effort's three new files and four documentation changes.

Separating identity from signature validation supports C-flat minor and theoretical relative/parallel relationships without pretending their conventional signatures are available. Reusing scale spelling and formula conversion preserved one implementation of musical construction rules. No dependencies, product layers, triple accidentals, error infrastructure, commits, or publishing were introduced. Existing spelling and RangeError contracts remain unchanged.

## Context and Orientation


Existing Music Theory separates explicit spelling from pitch class. D020 establishes letters/accidentals; D023 preserves interval roles; D028 provides spelled collections; D036 provides formula conversion. Reuse NoteSpelling, scaleNoteSpellings, and noteSpellingFromDegreeFormula. Preserve portable domain boundaries, existing scale/parser/degree-query/spelling-selection contracts, and DegreeCollection.

The new capability belongs in domain/music-theory/keys.ts with independent tests in tests/keys.test.ts. docs/ARCHITECTURE.md owns implementation status and future capability TODOs; docs/DECISIONS.md owns the accepted key contract; docs/MUSIC_THEORY_REFERENCE.md remains musical knowledge rather than a backlog. README.md describes capabilities. No new runner or dependency is required.

## Plan of Work


### 1. Establish key identity and fixtures


Add types and createKey. Require tonic/mode and accept all existing typed tonic spellings without checking signatures or constructing a scale. Unsupported runtime modes throw RangeError. Return a fresh key with copied tonic. Start independent conventional signature and relative-pair fixtures; verify all 70 identities, required fields, frozen inputs, preserved spelling, and output independence.

### 2. Implement conventional signatures


Use existing spelled major/natural-minor construction. Accept empty signatures or uniform single accidentals whose letters form the conventional prefix. Sharps accumulate F-C-G-D-A-E-B; flats B-E-A-D-G-C-F. Emit altered letters only in that order as fresh entries. Unsupported signatures and spelling-limit failures throw RangeError. Preserve supplied spelling, including distinct F-sharp/G-flat signatures. Verify 30 supported and 40 rejected cases independently.

### 3. Implement relationships


relativeKey changes mode and derives the tonic with existing formulas: major to minor uses 6, minor to major uses flat 3. parallelKey preserves tonic spelling and changes mode. Neither checks signature availability. Relative output beyond -2..2 throws RangeError; parallel relationships support all 70 identities. Verify conventional pairs, round trips, representable theoretical relatives, and spelling-limit failures.

### 4. Complete verification


Run focused tests, strict type checking, then one full regression suite. Verify that collection identifiers such as harmonic-minor cannot be key modes and that scale parsing still rejects bare minor. Check readonly contracts and independent runtime outputs. Do not widen Accidental, add structured error codes, or introduce error infrastructure in this increment.

### 5. Document deferred improvements and review


Update architecture, README, relevant Music Theory reference, and an additive accepted key decision. Add Deferred Music Theory improvements to docs/ARCHITECTURE.md alongside future capabilities:

1. Triple sharps and flats: Extend Music Theory to accidentals +/-3, including spelling, validation, and affected operations. Revisit when a future Music Theory feature requires accidentals beyond +/-2, particularly theoretical signatures, advanced spelling, or relative-key operations that currently exceed the supported range.
2. Error handling: Distinguish invalid inputs from valid musical operations exceeding supported representation limits. Provide clearer, more specific errors and structured codes where appropriate. Revisit before exposing Music Theory through UI or AI agent tools.

These are capability-driven triggers, not scheduled milestones. Their future design/implementation adds no infrastructure now. Keep this plan consistent with persistent documentation. Review new files directly, tracked diffs, imports, whitespace, and final status. Explain identity/signature separation through a concrete example in the implementation report.

## Concrete Steps


Run from C:\Users\simoa\Documents\fretbo-AI-rd:

1. Inspect git -c safe.directory=C:/Users/simoa/Documents/fretbo-AI-rd status --short, instructions, and current state; save this plan.
2. Perform tasks 1–3 in order, extending/running npm test -- tests/keys.test.ts after each milestone.
3. Run npm test -- tests/keys.test.ts tests/degrees.test.ts tests/scales.test.ts tests/note-spelling.test.ts.
4. Run npm run typecheck.
5. Run npm test.
6. Complete docs; inspect git diff, git diff --check, new files directly, and final status with the local safe.directory override.

The new tests become available during implementation. Expect passing assertions, no type errors, and clean whitespace. Record actual results separately.

## Validation and Acceptance


| Request | Expected result |
|---|---|
| Create B minor | Explicit B/minor identity; no collection field |
| C major / A minor signature | Empty array |
| D major / B minor signature | F-sharp, C-sharp |
| D minor signature | B-flat |
| Relative D major / B minor | B minor / D major |
| Parallel D major | D minor |
| F-sharp / G-flat major | Distinct identities; six sharps / six flats |
| C-sharp / C-flat major | Seven sharps / seven flats |
| Parallel C-flat major | C-flat minor identity succeeds |
| C-flat minor signature | RangeError; no respelling |
| Relative B-sharp major | G-double-sharp minor succeeds; signatures unsupported |
| Relative B-double-sharp major | RangeError: relative tonic needs triple sharp |
| Runtime mode harmonic-minor | RangeError |

Test all 70 identities/parallel round trips, 30 signatures, 64 representable relative relationships/round trips, and six failures: C/F/G double-flat minor and E/A/B double-sharp major. Check conventional relatives share signatures, order/limits, nested copying, frozen inputs, required fields, readonly outputs, and unsupported modes. Documentation acceptance requires both TODOs, exact capability triggers, and separation from implemented behavior. Existing +/-2 and RangeError contracts remain unchanged.

## Idempotence and Recovery


Pure operations and checks are repeatable. Inspect status on continuation and preserve user work. Repair focused failures and rerun affected checks. Record environment failures separately and avoid repository configuration changes solely to bypass sandbox issues.

## Artifacts and Notes


Planning baseline: npm test -- tests/degrees.test.ts tests/scales.test.ts tests/note-spelling.test.ts passed 3 suites / 1,344 tests outside the sandbox. The read-only feasibility check used existing constructors/formula conversion, not key APIs.

Implementation evidence: identity milestone passed 83 tests; signature milestone passed 169; relationship milestone passed 341. Final focused command passed 1,685 tests in four files. npm run typecheck passed inside the sandbox. npm test passed 3,265 tests in 21 files outside the sandbox, including 341 new key tests. Production/test code was unchanged between focused and full verification.

## Interfaces and Dependencies


    type KeyMode = "major" | "minor";
    type Key = Readonly<{ tonic: NoteSpelling; mode: KeyMode }>;
    type KeySignatureAccidental = Readonly<{ letter: NoteLetter; accidental: -1 | 1 }>;
    type KeySignature = readonly KeySignatureAccidental[];

    createKey(tonic: NoteSpelling, mode: KeyMode): Key
    keySignature(key: Key): KeySignature
    relativeKey(key: Key): Key
    parallelKey(key: Key): Key

All fields/arguments are required. Count is array length; zero alterations are omitted. Results are fresh and readonly by type, not runtime-frozen. Use sibling domain modules only. No dependencies, migrations, commits, or publishing are authorized.

Revision note: 2026-10-12 — Saved the accepted implementation plan and documentation-only TODO triggers; implementation scope is unchanged.

Revision note: 2026-10-12 — Recorded completed implementation/verification milestones; updated documentation with D037 and deferred improvements while retaining current spelling/error limits.

Revision note: 2026-10-12 — Completed documentation and final review; all five tasks are verified, with future TODO triggers recorded separately from current capabilities.
