# Exact identification against the supported chord catalog


This living ExecPlan follows [.agent/PLANS.md](../.agent/PLANS.md).

## Purpose / Big Picture


Implement approved Music Theory milestone 6: return every supported root/quality whose complete pitch-class set equals supplied notes. Accept numeric classes, note spellings and both registered voicing forms. Preserve alternatives rather than ranking or inferring spelling. Registered results retain observed lowest bass evidence separately from specified bass intent. Exclude approximate matches, inferred missing roots, omissions, custom-catalog identification, automatic spelling, inversion generation and instrument behavior.

## Progress


- [x] 2026-10-26T10:38:31Z: Rechecked clean Git status, complete ExecPlan protocol, relevant architecture/reference/decisions and existing catalog/description/voicing APIs. User explicitly authorized the approved plan.
- [x] 2026-10-26T10:44:48Z: Added numeric identification and three adapters with bass evidence, copied numeric descriptions and exhaustive catalog metadata.
- [x] 2026-10-26T10:44:48Z: Added 497 independent catalog/ambiguity/validation/ownership/integration tests. Focused regression passed 7,775 tests in eight suites; type checking passed; full regression passed 17,286 tests in 33 suites.
- [x] 2026-10-26T10:44:48Z: Updated README, Architecture and D053; directly reviewed source, tests, plan and tracked documentation diffs. Final whitespace/link/import/status checks are recorded in Artifacts and Notes.

## Surprises & Discoveries


The catalog contains six triad, ten seventh, seven added-tone and fourteen extended qualities. Symbol suffix tables are private notation adapters, not a shared catalog registry. Formula getters provide complete independent formulas. Existing registered factories validate nonempty arrays even when supplied records bypass factories. Safe registered endpoints need not have a safe span, so identification must avoid D052 spacing analysis. The initial sandbox test run failed before assertions on the known temporary SSR-cache ENOENT; the identical command passed outside the sandbox. Type checking caught two test-only fixture issues: exact optional properties require omitting bass instead of setting undefined, and discriminant narrowing assertions require normal control flow rather than a directly unreachable if(false) branch. Both were corrected without changing production contracts.

## Decision Log


2026-10-26, user-approved plan: accept all four representations, return numeric identities without choosing spelling, and attach only bass evidence for registered inputs. Match exact sets while ignoring occurrence order/register/duplicates. Keep all root/quality alternatives, including add2/add9 and symmetric roots. Order by root, then triad/seventh/added-tone/extended family, then alphabetic quality identifier. Return no specified bass or inversion status. D052 and the open naming conventions for extended inversions remain unchanged.

2026-10-26, implementation detail: private exhaustive identifier tables reference existing formula getters. Precompute the bounded catalog's 444 root/quality masks internally, then copy descriptions for every returned candidate. Twelve-bit masks are an internal equality representation, not a public musical type. All tables remain private; no reverse dependency, symbol refactor or new package is needed.

## Outcomes & Retrospective


Milestone 6 is implemented and verified. All four input forms return exact complete-set alternatives against all 37 qualities at twelve roots, preserving formula roles and root/quality identity. Registered results retain bass evidence even without a match, without selecting spelling, specified bass or inversion. Independent catalog fixtures verify full alternatives through every adapter, with explicit ambiguity, extremes, malformed inputs, ownership and composition coverage. Focused/full tests and type checks pass. README, Architecture and D053 describe delivered capabilities; D052 and extended-inversion naming remain unchanged. No prior production source, tests, dependency/configuration or domain reference definitions changed. Work is uncommitted.

## Context and Orientation


Portable Music Theory lives in domain/music-theory. Under chords-symbols-and-realization/, triads.ts, seventh-chords.ts, added-tone-chords.ts and extended-chords.ts own the 37 named qualities and formula getters (D043-D047). chord-descriptions.ts owns numeric root/formula/optional specified bass and numeric resolution (D049). registered-chords.ts supplies validating copied voicing records (D051). chord-voicing-analysis.ts analyzes known chords separately (D052). The Music Theory Reference explains that C-E-G-A can mean C6 or Am7, spelling/register do not select a unique identity, and musical content remains independent of fretboard/fingering. Existing APIs and inversion limitations stay intact.

## Plan of Work


First add chord-identification.ts in the existing chord folder. Enumerate exhaustive typed family identifiers and resolve existing formulas at roots 0..11 into twelve-bit masks. Validate supplied class arrays and return all equal-mask candidates in the agreed order. Demonstrate ambiguous and symmetric identities without collapsing them.

Next add spelling and registered adapters. Spelling only converts supplied notes to pitch classes. Registered adapters validate through existing factories, compute minimum coordinates and tied original indices, and attach matching formula positions per candidate without assigning specified bass or calculating spacing. Verify all representations agree even with duplicates and enharmonic bass ties.

Then add tests/chord-identification.test.ts with independent offsets and formula-role fixtures for every catalog member at twelve roots, explicit ambiguous/symmetric expectations, negative and extreme register cases, malformed arrays/voicings, readonly types and copied output tests. Compose identification with parsing, realization and numeric known-chord analysis. Update README.md, docs/ARCHITECTURE.md and docs/DECISIONS.md to describe actual behavior and deferred features. Keep reference definitions and prior decisions unchanged except current implementation status documentation.

## Concrete Steps


From C:/Users/simoa/Documents/fretbo-AI-rd after adding source/tests, run existing commands:

    npm test -- tests/chord-identification.test.ts tests/triads.test.ts tests/seventh-chords.test.ts tests/added-tone-chords.test.ts tests/extended-chords.test.ts tests/chord-descriptions.test.ts tests/registered-chords.test.ts tests/chord-voicing-analysis.test.ts
    npm run typecheck
    npm test
    git diff --check
    git status --short

Node 24.x/npm are configured. Expect passing assertions/type checks and no whitespace diagnostics. Record actual results separately. If sandbox Vitest fails before assertions with temporary SSR-cache ENOENT, repeat the identical command outside the sandbox when permitted without tooling changes.

## Validation and Acceptance


Verify every family/quality/root and exact returned roles using independent fixture offsets. C-E-G-A retains C6/Am7, C-D-E-G retains add2/add9, and symmetric augmented/diminished-seventh sets retain all roots. All inputs ignore duplicate occurrences, order and enharmonic spelling for matching. Missing or extra classes exclude affected identities; no absent root, optional omission or non-chord slash bass is inferred. E3-C4-G4-C5 reports E3 and C-major bass formula position 1. Registered no-match inputs retain bass evidence. Tied enharmonics, negative registers and safe-coordinate extremes work without spacing arithmetic. Invalid nonempty-array contracts, sparse/missing entries, numeric classes outside 0..11 and existing register/octave errors throw RangeError; well-formed no matches return empty arrays. Frozen input, fresh nested descriptions, readonly types, deterministic order and all integration paths receive coverage.

## Idempotence and Recovery


Checks are repeatable. Preserve user work and inspect status on continuation. Repair only this effort after failures; do not reset historical files. No migrations, dependencies, commits, publishing or external state changes are required.

## Artifacts and Notes


Clean starting status confirmed. Sandbox focused tests failed before assertions with temporary SSR-cache ENOENT. The identical command passed outside the sandbox; final focused regression passed 7,775 tests in eight suites. npm run typecheck passed after correcting test fixtures. Full npm test passed 17,286 tests in 33 suites, including 497 new identification tests. Reviewed new source/tests/plan directly and all tracked documentation diffs. Final checks confirmed clean whitespace across all six files, 132 existing local documentation targets and 23 existing relative import targets. Git diff --check passed; status contains only the three intended documentation edits and three new files. Dependency review confirms no reverse imports or new dependencies; D052 and the open extended-inversion naming decision are unchanged. No commits or staging were performed.

## Interfaces and Dependencies


Export identifyChordsFromPitchClasses(readonly PitchClass[]) and identifyChordsFromNoteSpellings(readonly NoteSpelling[]) returning readonly ChordIdentificationCandidate[]. Candidate is a discriminated family/quality union intersected with readonly { description: PitchClassChordDescription }. Families are triad, seventh, added-tone and extended, each narrowing quality to the existing type. RegisteredChordIdentificationCandidate adds readonly bassFormulaIndices. identifyChordsFromRegisteredPitches(RegisteredPitchVoicing) and identifyChordsFromRegisteredNotes(RegisteredNoteVoicing) return RegisteredChordIdentification with bass { pitch, pitchClass, toneIndices } and readonly registered candidates. Results are independently copied, readonly by type and unfrozen; descriptions have no specified bass. Existing typed letter/accidental contracts remain. Use direct relative .js imports from existing portable domain modules; identification imports construction and realization validation, never the reverse.

Revision note: 2026-10-26, created before implementation from the approved plan; updated after acceptance with actual verification results and outcomes.
