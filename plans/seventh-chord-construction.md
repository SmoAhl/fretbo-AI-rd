# Construct eight seventh-chord qualities from an explicit root


This living ExecPlan follows [.agent/PLANS.md](../.agent/PLANS.md). The user selected eight qualities and approved implementation of this plan on 2026-10-21.

## Purpose / Big Picture


Extend portable Music Theory with seventhChordPitchClasses and seventhChordNoteSpellings. Each takes an explicit numeric or spelled root and exact SeventhChordQuality identifier, returning four tones in root-third-fifth-seventh role order. This order does not specify bass, register, inversion, or voicing. A major seventh is eleven semitones from the root, a minor seventh ten, and a diminished seventh nine; exact spelling retains the seventh's letter role.

Support major-seventh (1/3/5/7), dominant-seventh (1/3/5/flat-7), minor-seventh (1/flat-3/5/flat-7), half-diminished-seventh (1/flat-3/flat-5/flat-7), diminished-seventh (1/flat-3/flat-5/double-flat-7), minor-major-seventh (1/flat-3/5/7), augmented-major-seventh (1/3/sharp-5/7), and augmented-seventh (1/3/sharp-5/flat-7).

Symbol parsing, aliases, chord identification, harmonization, registered output, inversions, voicing, Fretboard, Playability, UI, AI, dependencies, commits, and publishing are outside this effort.

## Progress


- [x] 2026-10-21T09:43:34Z: Inspected clean Git status, instructions/protocol, architecture, accepted decisions through D040, Music Theory reference, triad/degree code, tests, scripts, and the completed basic-triad plan. Confirmed no existing seventh-chord implementation.
- [x] 2026-10-21T09:47:52Z: Implemented both constructors over one private triad/seventh definition table, reusing existing triad/degree conversion with no changes to existing domain modules.
- [x] 2026-10-21T09:47:52Z: Added 534 tests covering 96 numeric and 392 spelled combinations, exact examples, seventh-only/triad spelling failures, scale independence, isolation, invalid selectors, and compile-time contracts.
- [x] 2026-10-21T09:47:52Z: Focused tests passed 1,886 cases in three suites outside the sandbox; npm run typecheck passed; full npm test passed 4,753 tests in 24 suites outside the sandbox.
- [x] 2026-10-21T09:47:52Z: Updated README, Architecture, reference (only two added table rows), and D041. Reviewed source/tests/new plan and tracked diffs, sibling-only domain imports, whitespace/conflicts across seven files, documentation targets, required plan sections, and final status. Existing modules, completed plans, comments, dependencies, and configuration remain unchanged.

## Surprises & Discoveries


Existing triad constructors supply the first three tones, and degree conversion supplies exact seventh spelling without new interval qualities. Some roots have representable triads but unsupported sevenths: G-triple-sharp major seventh needs F-quadruple-sharp, and C-double-flat diminished seventh needs B-quadruple-flat. G-triple-sharp dominant seventh instead fits all four tones even though its major scale does not. Acceptance tests verify each boundary.

The initial focused run failed before assertions with ENOENT in the sandbox's temporary SSR cache. The identical command outside the sandbox passed all three suites. No domain assertion failed, and no project configuration change was needed.

## Decision Log


2026-10-21, user: Select all six seventh qualities already listed in the reference plus augmented-major and augmented seventh. Preserve the numeric/spelled output pattern and explicit root/quality contracts of the approved plan.

2026-10-21, approved plan: Compose existing triad construction and seventh DegreeFormula conversion through one private definition table. Preserve triad implementation/signatures and typed roots. Exact identifiers exclude symbols and aliases. Return independent readonly-by-type arrays and note objects without runtime freezing. Unknown quality and required accidental beyond +/-3 throw RangeError with no fallback or partial result. Numeric output does not inherit spelling limits.

## Outcomes & Retrospective


The approved eight-quality capability is implemented, verified, and reviewed. All numeric/spelled combinations, exact seventh letters, representation limits, unknown selectors, frozen-input preservation, output isolation, and compile-time restrictions pass. Focused tests passed 1,886 cases in three suites; typechecking passed both configurations; full regression passed 4,753 tests in 24 suites. Current documentation and D041 record the new capability and its remaining limits.

Composing existing triads and degree conversion avoided duplicated musical rules and any changes to existing production code. The two added reference rows preserve all previous definitions. Broader extensions, grammar, register, inversion, voicing, and application/instrument integration remain deferred as agreed. No unresolved implementation issue was found. The sandbox failure was environmental; work remains uncommitted.

## Context and Orientation


The single private TypeScript/Next.js package keeps deterministic rules in domain/music-theory and Node Vitest suites in tests/. D004 requires domain-first development; D036 supplies DegreeFormula and numeric/spelled conversion; D039 extends accidentals to -3..3; D040 supplies explicit major/minor/diminished/augmented triad construction. Root pitch classes and note objects retain existing typed-input boundaries, without general arbitrary-JavaScript validation.

domain/music-theory/triads.ts exports TriadQuality, triadPitchClasses, and triadNoteSpellings. domain/music-theory/degrees.ts exports DegreeFormula, pitchClassFromDegreeFormula, and noteSpellingFromDegreeFormula. Reuse these functions instead of duplicating triad definitions, writing a spelling algorithm, or constructing a scale. docs/MUSIC_THEORY_REFERENCE.md already defines six seventh qualities; append both augmented variants without rewriting those rows. docs/ARCHITECTURE.md describes current capabilities and deferred errors, docs/DECISIONS.md records accepted contracts, and README.md summarizes application status. The completed triad plan stays historical.

## Plan of Work


### 1. Compose seventh chords from existing rules


Add domain/music-theory/seventh-chords.ts with the exact eight-value quality union and two constructors. One private table maps quality to TriadQuality and seventh DegreeFormula (number 7 with alteration 0, -1, or -2). An own-property guard rejects unknown selectors and inherited-property names. Build four-tone arrays by combining a fresh existing triad result and a seventh resolved from the same root. Verify all eight C-root examples and wrapping independently.

### 2. Establish complete acceptance coverage


Add tests/seventh-chords.test.ts with independent expected semitone offsets and natural-letter coordinates. Test all 12 numeric roots times eight qualities and all 49 spelled roots times eight qualities, accepting exact spelling or the expected accidental-limit error. Test required seventh-only failures, triad failures, scale independence, enharmonic roots, diminished-seventh letter spelling, both augmented variants, explicit-root retention for symmetric diminished sevenths, frozen inputs, result isolation across calls and existing triads, invalid qualities, and compile-time restrictions. These tests establish observable behavior without an application UI.

### 3. Verify, document, and review


Run focused tests, both existing typecheck configurations, and full regression. Update README and Architecture to describe supported seventh chords and remaining capabilities; clarify that the earlier triad exclusions describe their original increment. Append D041 with contract/rationale and extend the reference table with augmented-major seventh and augmented seventh. Preserve deferred error-classification triggers. Inspect all new files directly, tracked diffs, imports, whitespace/conflicts, documentation targets, and final status. Record actual verification in this plan.

## Concrete Steps


Work from C:/Users/simoa/Documents/fretbo-AI-rd using existing Node.js 24.x/npm scripts:

1. Add the source and acceptance tests described above.
2. Run `npm test -- tests/seventh-chords.test.ts tests/triads.test.ts tests/degrees.test.ts`. Expected: all focused behavioral assertions pass.
3. Run `npm run typecheck`. Expected: application and NodeNext checks pass, including deliberate @ts-expect-error cases.
4. Run `npm test`. Expected: all current and new suites pass.
5. Update documentation and evidence, review `git -c safe.directory=C:/Users/simoa/Documents/fretbo-AI-rd diff`, `git -c safe.directory=C:/Users/simoa/Documents/fretbo-AI-rd diff --check`, new files, and `git -c safe.directory=C:/Users/simoa/Documents/fretbo-AI-rd status --short`.

If the known sandbox temporary SSR-cache ENOENT prevents imports, rerun the identical test command outside the sandbox when permitted. Do not change project configuration or call a pre-assertion runner failure a domain failure.

## Validation and Acceptance


Verify 96 numeric combinations and 392 spelled combinations with independent expectations. Numeric offsets follow the approved catalog, wrap modulo twelve without sorting, and contain four distinct classes; B major seventh is [11,3,6,10]. C diminished seventh must be C/E-flat/G-flat/B-double-flat, not A as its final spelling. C augmented-major seventh has B, while C augmented seventh has B-flat. G-triple-sharp dominant seventh fits despite its unsupported full major scale. G-triple-sharp major seventh and C-double-flat diminished seventh reject only when their required seventh exceeds the representation limit; their existing triads still succeed. Unknown selectors, including aliases, inherited names, and omitted runtime quality, throw RangeError. Frozen inputs remain unchanged and output mutation through test-only casts cannot affect another call or existing triads. TypeScript rejects omitted/unsupported qualities, wrong root types, and readonly mutation.

## Idempotence and Recovery


Tests and checks can be repeated, writing only ignored caches/build artifacts. No migration or external action is required. Preserve user work and inspect Git state before any reversal. Keep incomplete milestones marked incomplete and distinguish failing assertions from environment issues. Do not widen spelling limits or change supported qualities to evade a test failure.

## Artifacts and Notes


Initial Git status was clean. `npm test -- tests/seventh-chords.test.ts tests/triads.test.ts tests/degrees.test.ts` passed 1,886 tests in three suites outside the sandbox after the pre-assertion temporary SSR-cache ENOENT inside it. The new suite contributes 534 tests. `npm run typecheck` passed the application and NodeNext configurations, including deliberate type errors. `npm test` passed 4,753 tests in 24 suites outside the sandbox. `git diff --check` and direct whitespace/conflict checks across all seven changed/new files passed. New local documentation targets, the D041 heading, and all required ExecPlan sections were verified. Source and test review confirmed sibling-only domain imports, shared composition, and independent test expectations. Final status contains four documentation changes and three new files: domain/music-theory/seventh-chords.ts, tests/seventh-chords.test.ts, and this plan. No application build was needed for this portable domain-only addition.

## Interfaces and Dependencies


Export SeventhChordQuality as major-seventh | dominant-seventh | minor-seventh | half-diminished-seventh | diminished-seventh | minor-major-seventh | augmented-major-seventh | augmented-seventh. Export seventhChordPitchClasses(root: PitchClass, quality: SeventhChordQuality): readonly PitchClass[] and seventhChordNoteSpellings(root: NoteSpelling, quality: SeventhChordQuality): readonly NoteSpelling[]. Both require root and quality and return exactly four tones. Only sibling portable domain dependencies are allowed. Do not change existing public contracts or expose a general chord/voicing model, internal definitions, parser, framework, or Node API.

Revision note: 2026-10-21, created for the approved eight-quality seventh-chord implementation and updated with completed source/tests, focused/full verification, the sandbox runner finding, documentation/D041, and final review.
