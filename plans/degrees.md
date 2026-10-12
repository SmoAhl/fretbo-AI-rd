# Degrees: explicit formulas and collection queries


This plan follows [.agent/PLANS.md](../.agent/PLANS.md). Maintain its progress, evidence, decisions, and outcomes during implementation.

## Purpose / Big Picture


Extend Music Theory so callers can distinguish an ordinal position from a major-relative degree formula, resolve formulas to pitches and spellings, and query existing scales and minor-derived modes. E-flat is ordinal position 2 in C minor pentatonic but formula flat 3. A formula alteration measures against the parallel major scale, rather than naming the resulting note's accidental.

The authorized increment supports simple formula numbers 1–7, alterations -2..2, pitch-class and spelling output, strict text parsing/formatting, and collection membership queries. Compound degrees, registered output, arbitrary note-to-formula identification, keys, signatures, key-aware spelling, new collections, dependencies, UI, commits, and publishing remain outside this effort. No additional scale/mode implementation is required.

## Progress


- [x] 2026-10-09T11:05:26Z: Inspected instructions, protocol, architecture, decisions, relevant reference sections, implementation, and tests. Working tree was clean; baseline passed 768 tests across three relevant suites outside the sandbox.
- [x] 2026-10-09T11:05:26Z: User selected simple degrees, text support, collection-only reverse queries, and a shared new query API. User subsequently authorized implementation of this plan.
- [x] 2026-10-09T11:29:34Z: 1. Established structured types and independent numeric/spelling fixtures.
- [x] 2026-10-09T11:29:34Z: 2. Implemented conversion; all 480 conversion tests passed, including final-accidental recovery and unchanged inputs.
- [x] 2026-10-09T11:33:20Z: 3. Implemented strict parsing/formatting; conversion and text suites passed 664 tests.
- [x] 2026-10-09T11:34:10Z: 4. Implemented shared formulas/queries; focused suites passed 1,843 tests, including all collections and selected-member spelling.
- [x] 2026-10-09T11:36:44Z: 5. Completed full verification, documentation/D036, direct review of all new files, sibling-only domain imports, conflict/whitespace checks, and final Git status. Existing production modules and comments are unchanged.

## Surprises & Discoveries


Existing ScaleDegree means ordinal position, including positions 1–5 for pentatonic collections. MinorMode.degree selects a parent rotation; a query's ordinal is separate. Harmonic minor rotation 7 contains double-flat 7, requiring double alterations. Existing constructors at C supply formula roles without duplicating scale/mode definitions.

The planning baseline failed before executing tests inside the sandbox because Vitest workers could not access temporary files. The same command outside the sandbox passed. Treat this environment failure separately from assertion failures.

## Decision Log


2026-10-09, user: Support simple formulas, text parsing/formatting, collection membership, and a shared API accepting ScaleType or MinorMode.

2026-10-09, approved plan: Keep existing query signatures unchanged. Require formula number and alteration; retain double-accidental output limits without silent respelling. Derive collection formulas from existing constructors at C. Spelled ordinal retrieval validates only the requested result.

## Outcomes & Retrospective


All nine public functions and structured contracts are implemented and reviewed. Acceptance matrices pass for all formulas, tonics, and existing collections. Full regression testing passed 2,924 tests in 20 files; type checking passed. Documentation is updated with D036; tracked and new-file whitespace checks passed with no conflict markers. All five numbered tasks are complete. Compound/registered formulas and key-related capabilities remain deferred as planned.

Deriving roles from existing constructors avoided changes to scale/mode definitions. Validating only the final accidental and requested member proved necessary for supporting valid isolated queries from unusually spelled tonics. Existing domain modules and their comments were preserved. Work is uncommitted; no dependencies or product layers were added.

## Context and Orientation


domain/music-theory/scales.ts constructs named collections and provides numeric ordinal queries. domain/music-theory/minor-modes.ts constructs fourteen fixed modes with parent/rotation descriptors, including registered runs, but provides no degree queries. Existing note spelling separates letters and accidentals; numeric pitch classes discard that information.

Architecture and accepted decisions D020/D023/D028/D029/D035 require preserving letter roles, explicit input boundaries, ordinal semantics, and fixed collections. D036 records the additive Degrees contract. Domain modules stay portable and independent of frameworks, UI, AI, Fretboard, and Playability. tests/degrees.test.ts and tests/degree-text.test.ts provide independent fixtures; no new runner was required.

## Plan of Work


### 1. Establish the contract and acceptance fixtures


Add DegreeFormula, DegreeCollection, and CollectionDegree to domain/music-theory/degrees.ts. DegreeFormula has readonly number: ScaleDegree and alteration: Accidental. DegreeCollection is ScaleType | MinorMode. CollectionDegree has readonly ordinal: ScaleDegree and formula: DegreeFormula. Number denotes the major/perfect role, distinct from ordinal position and the resulting note's accidental. Prepare independent acceptance fixtures and compile-time checks for required fields and readonly results.

### 2. Implement formula conversion


Add numeric and spelled formula conversion using reference offsets 0/2/4/5/7/9/11 plus alteration. Reuse pitch transposition. For spelling, obtain the major/perfect reference role from the tonic's natural letter using existing transposition; combine its accidental with tonic accidental and alteration, validating only the final -2..2 result. This supports B-double-sharp plus flat 3 producing D-double-sharp without rejecting a temporary triple-sharp spelling. Invalid formula fields throw RangeError. Verify the conversion matrix before adding collection queries.

### 3. Implement formula text


Add domain/music-theory/degree-text.ts. Accept an optional accidental prefix followed by unsigned decimal digits, trim outer whitespace, and accept leading zeroes. Prefixes are b/#, bb/##, flat/sharp Unicode signs including repeated double signs, musical double-flat/double-sharp glyphs, and natural. Reject internal spaces, mixed signs, suffix signs, words, signed numbers, and lists. Malformed syntax throws SyntaxError; numeric values outside 1–7 throw RangeError. Reuse AccidentalNotation; default Unicode output uses repeated signs for doubles, ASCII uses bb/##, and zero alteration omits the prefix. Verify all 35 round trips independently.

### 4. Implement shared collection queries


Use existing constructors at fixed C to derive formulas: note letters identify reference numbers and their accidentals identify alterations. Preserve order and skipped pentatonic roles. Add formula arrays/retrieval, numeric/spelled ordinal retrieval, and pitch-class membership returning ordinal/formula or undefined. Validate ordinal against collection cardinality. Preserve existing query contracts; use the supplied mode tonic for MinorMode selectors. Query spelling validates only its requested output. Verify every named collection and all fourteen modes, including non-members and invalid selectors.

### 5. Verify, document, and review


Run focused tests, type checking, then the full suite because queries span all existing collections. Update docs/ARCHITECTURE.md, docs/MUSIC_THEORY_REFERENCE.md, README.md, and an additive accepted decision in docs/DECISIONS.md. Update this plan with evidence. Review tracked diffs, new files directly, whitespace, and final status.

## Concrete Steps


Run from C:\Users\simoa\Documents\fretbo-AI-rd in order:

1. Inspect git -c safe.directory=C:/Users/simoa/Documents/fretbo-AI-rd status --short.
2. Save this plan and perform implementation tasks 1–4 in order, checking each milestone.
3. Run npm test -- tests/degrees.test.ts tests/degree-text.test.ts tests/scales.test.ts tests/pentatonic-scales.test.ts tests/minor-modes.test.ts.
4. Run npm run typecheck.
5. Run npm test.
6. Review git diff, git diff --check, new files, and final status using the repository-local safe.directory override.

The new tests become available during implementation. Expected results: passing assertions, no type errors, and clean whitespace. Record actual results in Artifacts and Notes.

## Validation and Acceptance


| Request | Expected result |
|---|---|
| C + flat 3 | Pitch class 3; E-flat |
| C + sharp 4 / flat 5 | Pitch class 6; F-sharp / G-flat respectively |
| F-sharp + 7 | E-sharp |
| B-double-sharp + flat 3 | D-double-sharp |
| C minor pentatonic ordinal 2 | Formula flat 3; E-flat |
| C major pentatonic ordinal 4 | Formula 5; G |
| D, harmonic-minor rotation 2, ordinal 5 | Formula flat 5; A-flat |
| D, melodic-minor-ascending rotation 2, ordinal 5 | Formula 5; A |
| C, harmonic-minor rotation 7, ordinal 7 | Formula double-flat 7; B-double-flat |
| Pitch class 9 in that last collection | Ordinal 7 and formula double-flat 7 |
| E-flat pitch class in C major | undefined |
| Pentatonic ordinal 6 | RangeError |
| Parse b03 / Unicode flat 3 | number 3, alteration -1 |
| Parse 8 / b9 | RangeError |
| Parse 3b / b 3 / b#3 | SyntaxError |

Verify all twelve numeric tonics, 35 formulas, 35 supported tonic spellings, all named collections and fourteen mode descriptors. Include accidental-limit failures, invalid formula fields/selectors, frozen inputs, independent outputs, existing ordinal regressions, and selected-note spelling when unrelated members cannot be spelled.

## Idempotence and Recovery


Tests and checks are repeatable. Inspect current status on continuation and preserve user work. Repair focused failures and rerun affected checks before broadening. Record environment failures separately; never discard user work to restore a baseline.

## Artifacts and Notes


Planning baseline: npm test -- tests/scales.test.ts tests/pentatonic-scales.test.ts tests/minor-modes.test.ts passed 3 files / 768 tests outside the sandbox. Git status and whitespace checks were clean. Conversion milestone: npm test -- tests/degrees.test.ts passed 480 tests outside the sandbox. Conversion plus text passed 664 tests in two files. Focused final verification passed 1,843 tests in five files. npm test passed 2,924 tests in 20 files (1,075 new); npm run typecheck passed with final production/test code. Test runs used the established outside-sandbox workaround; type checking ran inside the sandbox.

## Interfaces and Dependencies


Public interfaces:

    pitchClassFromDegreeFormula(tonic, formula): PitchClass
    noteSpellingFromDegreeFormula(tonic, formula): NoteSpelling
    degreeFormulas(collection): readonly DegreeFormula[]
    degreeFormulaAtOrdinal(collection, ordinal): DegreeFormula
    pitchClassAtCollectionDegree(tonic, collection, ordinal): PitchClass
    noteSpellingAtCollectionDegree(tonic, collection, ordinal): NoteSpelling
    collectionDegreeOfPitchClass(tonic, collection, pitch): CollectionDegree | undefined
    parseDegreeFormula(text: string): DegreeFormula
    formatDegreeFormula(formula, notation = "unicode"): string

Numeric functions accept PitchClass; spelled functions accept NoteSpelling; ordinals use ScaleDegree and selectors use DegreeCollection. Depend only on sibling Music Theory modules. Return fresh readonly arrays/objects without runtime freezing. Do not widen SpelledInterval or infer key/spelling preferences.

Revision note: 2026-10-09 — Saved the approved plan for implementation, retaining numbered task order and updating draft status.

Revision note: 2026-10-09 — Recorded conversion, text, shared-query, full-suite, and type-check results; updated implemented status and documentation references.

Revision note: 2026-10-09 — Completed final review and all five numbered tasks, recording preserved code boundaries and remaining deferred capabilities.
