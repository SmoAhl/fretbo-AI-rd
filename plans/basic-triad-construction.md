# Construct basic triads from an explicit root and quality


This living ExecPlan follows [.agent/PLANS.md](../.agent/PLANS.md). The user approved this contract and requested implementation on 2026-10-21.

## Purpose / Big Picture


Music Theory will construct major, minor, diminished, and augmented triads as numeric pitch classes or exact note spellings. Callers supply both root and quality. Each result has three tones in root-third-fifth role order; this is not a bass, register, or inversion specification. A triad's third and fifth refer to written musical roles, not positions in a sorted numeric array.

Seventh chords, symbols/parsers, identification, harmonization, registered output, inversions, voicing, Fretboard, Playability, UI, AI, dependencies, commits, and publishing are outside this effort.

## Progress


- [x] 2026-10-21T09:20:22Z: Inspected Git status (clean), instructions/protocol, architecture, D036/D039, relevant Music Theory reference, degree helpers, tests, and the completed triple-accidental plan. Confirmed no existing triad implementation.
- [x] 2026-10-21T09:23:37Z: Implemented the shared formula table and both public constructors, reusing degree conversion and existing typed-root boundaries.
- [x] 2026-10-21T09:23:37Z: Added 279 triad tests covering all numeric/spelled combinations, spelling limits, scale independence, exact text examples, isolation, and invalid qualities, plus compile-time contracts. Focused triad/degree run passed 1,352 tests in two suites outside the sandbox.
- [x] 2026-10-21T09:24:35Z: Focused tests passed 1,352 tests in two suites; npm run typecheck passed both configurations; full npm test passed 4,219 tests in 23 suites outside the sandbox.
- [x] 2026-10-21T09:24:35Z: Updated README, architecture, and D040; reviewed all source/tests/new plan and tracked diffs, sibling-only domain imports, whitespace/conflicts across six files, documentation targets, and final Git status. Existing domain modules, historical plans, and comments are unchanged.

## Surprises & Discoveries


Existing degree conversion already preserves final letter roles and validates only the final accidental. Constructing a full scale would introduce unrelated spelling failures: G triple-sharp major's triad fits the supported range, but its scale's seventh needs a quadruple sharp. No new spelling algorithm or root validator is needed.

The initial focused run failed before assertions with ENOENT in the sandbox's temporary SSR cache. The identical command outside the sandbox passed both suites. No domain assertion failed and no configuration workaround was introduced.

## Decision Log


2026-10-21, user: Implement the approved plan with parallel numeric/spelled helpers and explicit root and quality. Preserve typed roots, existing error conventions, and exact spellings through triple accidentals.

2026-10-21, approved plan: Use one internal DegreeFormula table and existing conversion functions. Return fresh readonly-by-type arrays and spelling objects, without runtime freezing. Unsupported runtime quality and any unrepresentable required tone throw RangeError; no fallback or partial result is returned. Quality literals are major/minor/diminished/augmented; aliases and symbol parsing are excluded.

## Outcomes & Retrospective


The approved increment is complete. Both constructors preserve root-third-fifth order and exact spelled roles, with the full 48-case numeric and 196-case spelling matrices verified. Accidental boundaries, unsupported qualities, frozen input preservation, independent mutable-at-runtime outputs, and compile-time restrictions all pass. Focused tests passed 1,352 cases; typechecking passed; full regression passed 4,219 tests in 23 suites. README, architecture, and D040 reflect the new capability and remaining chord work.

Reusing formula conversion avoided another spelling algorithm and kept whole-scale constraints out of triad construction. No existing production module or historical plan needed changes. Seventh chords, text symbols, inference, register, voicing, and application integration remain deferred as agreed. The sandbox cache failure was environmental; no domain assertion failure or unresolved implementation issue was observed. Work remains uncommitted.

## Context and Orientation


The repository is one private TypeScript/Next.js package. Portable calculations live in domain/music-theory and Vitest tests in tests/. Application and AI consumers must reuse these rules rather than defining their own. docs/ARCHITECTURE.md describes implementation reality; docs/DECISIONS.md records accepted contracts. docs/MUSIC_THEORY_REFERENCE.md already defines the four triad formulas and distinguishes identity from voicing and fingering. It needs no expansion for this implementation.

domain/music-theory/degrees.ts exports DegreeFormula, pitchClassFromDegreeFormula(root, formula), and noteSpellingFromDegreeFormula(root, formula). Formulas use major/perfect reference numbers, independent of collection ordinals. D036 establishes these helpers; D039 extends note/formula alterations to -3..3. Root PitchClass and NoteSpelling retain their typed-input boundary, without validation of arbitrary JavaScript objects. Numeric output is independent of spelling representability. Existing modules use native ESM .js sibling imports, RangeError for unsupported semantics, independent readonly results, and no framework or Node APIs.

## Plan of Work


### 1. Implement the triad contract


Add domain/music-theory/triads.ts with TriadQuality and two public constructors. One private table contains formulas 1/3/5, 1/flat-3/5, 1/flat-3/flat-5, and 1/3/sharp-5. Guard table access with an own-property check so inherited object properties cannot act as qualities. Map this table through existing degree converters. Verify each quality's numeric and spelled examples independently before broad regression.

### 2. Establish acceptance coverage


Add tests/triads.test.ts with independent semitone offsets and natural-letter coordinates, not production tables or degree conversion as expected-value oracles. Cover all 12 numeric roots for each quality and all 49 supported spellings for each quality, with success or spelling-limit rejection. Include explicit enharmonic/double/triple examples, G triple-sharp major's unrelated-scale regression, failure at both accidental limits, invalid qualities, frozen inputs, independent outputs, and compile-time errors for unsupported/omitted inputs and readonly mutation. Demonstrate parse-construct-format composition through the existing text helpers without adding grammar.

### 3. Verify, document, and review


Run focused triad/degree tests, both existing typecheck configurations, and full regression. Update README and docs/ARCHITECTURE.md to replace the broad unimplemented-chords claim with the supported triads and specific remaining capabilities. Add D040 with contract, rationale, limits, and scope. Preserve completed historical plans and the deferred error-classification trigger. Inspect all new files directly, tracked diffs, whitespace, imports, and final status, and update this plan's evidence and outcomes.

## Concrete Steps


Run from C:/Users/simoa/Documents/fretbo-AI-rd using the existing Node.js 24.x/npm environment:

1. Implement the new source and tests described above.
2. Run `npm test -- tests/triads.test.ts tests/degrees.test.ts`. Expected: passing musical assertions and representation-limit cases.
3. Run `npm run typecheck`. Expected: application and NodeNext configurations pass, including deliberate @ts-expect-error cases.
4. Run `npm test`. Expected: all existing and new suites pass.
5. Update documentation and this plan with actual evidence, then review `git -c safe.directory=C:/Users/simoa/Documents/fretbo-AI-rd diff`, `git -c safe.directory=C:/Users/simoa/Documents/fretbo-AI-rd diff --check`, new files, and `git -c safe.directory=C:/Users/simoa/Documents/fretbo-AI-rd status --short`.

If Vitest fails before assertions with the known sandbox temporary SSR-cache ENOENT issue, rerun the identical test command outside the sandbox when permitted rather than changing configuration. A runner failure is not a domain assertion failure.

## Validation and Acceptance


Numeric offsets are major [0,4,7], minor [0,3,7], diminished [0,3,6], and augmented [0,4,8], wrapped into 0..11 in role order. B major yields [11,3,6]. Every result has three distinct tones and no repeated octave root. Spellings retain root letters and third/fifth roles, including C diminished C/E-flat/G-flat and B augmented B/D-sharp/F-double-sharp. G-double-sharp augmented uses D-triple-sharp; G-triple-sharp augmented rejects its quadruple-sharp fifth. G-triple-sharp major succeeds without a full scale. Both helpers reject unknown qualities, including aliases and inherited-property names. All 49 spelled roots are checked for all four qualities. Frozen roots are preserved, results share no mutable objects across calls or with inputs, and readonly contracts are checked by TypeScript.

## Idempotence and Recovery


Tests and checks can be repeated; they may write ignored caches but do not require tracked output changes. There is no migration or external action. Review status before reverting any edits and preserve user changes. Keep a failed or partial milestone marked incomplete and record the actual failure rather than changing correct musical fixtures to match code.

## Artifacts and Notes


Initial Git status was clean. `npm test -- tests/triads.test.ts tests/degrees.test.ts` passed 1,352 tests in two suites outside the sandbox after a pre-assertion temporary SSR-cache ENOENT inside it. This includes the new 279-case triad suite. `npm run typecheck` passed application/NodeNext checks, including the deliberate type errors. `npm test` passed 4,219 tests in 23 suites outside the sandbox. `git diff --check` passed; direct whitespace/conflict checks covered all three new and three modified files. New documentation targets and D040 heading were verified. Final status contains only README.md, docs/ARCHITECTURE.md, docs/DECISIONS.md, domain/music-theory/triads.ts, tests/triads.test.ts, and this plan. No build was required for this portable domain-only addition.

## Interfaces and Dependencies


Export TriadQuality = "major" | "minor" | "diminished" | "augmented", triadPitchClasses(root: PitchClass, quality: TriadQuality): readonly PitchClass[], and triadNoteSpellings(root: NoteSpelling, quality: TriadQuality): readonly NoteSpelling[]. Both return exactly three tones. Use existing DegreeFormula conversion and PitchClass/NoteSpelling types through sibling imports. No public formula table, new general chord identity/voicing representation, parser, dependency, or change to existing signatures is needed.

Revision note: 2026-10-21, created for the user's approved basic-triad implementation and updated with completed implementation, focused/full verification, the sandbox runner finding, documentation, and final review.
