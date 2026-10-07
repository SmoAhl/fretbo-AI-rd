# Measure registered pitch distances and identify spelled intervals


This living ExecPlan follows [.agent/PLANS.md](../.agent/PLANS.md).

## Purpose / Big Picture


Implement the user-requested signed semitone distance between registered pitches and interval identification between registered spelled notes. A caller can distinguish an augmented fourth from a diminished fifth and recover an interval that transposes the source to the target. Preserve existing transposition contracts. Pitch-class distance, interval inversion/formatting, new qualities, unregistered interval identification, scales, chords, UI, and AI are outside this effort.

## Progress


- [x] 2026-10-07T10:17:23Z: Inspected clean Git status, AGENTS.md, the complete planning protocol, architecture, D020–D024, relevant Music Theory Reference sections, existing modules, tests, and configuration.
- [x] 2026-10-07T10:20:18Z: Implemented signed registered-pitch distance and identification; focused Vitest run passed 87 tests and strict type checking passed.
- [x] 2026-10-07T10:20:18Z: User approved keeping SpelledInterval and the proposed identical-note, enharmonic, altered-unison, and rejection conventions; implemented those rules with explicit examples and reverse transposition checks.
- [x] 2026-10-07T10:22:14Z: Updated README, architecture, and D025; final npm test outside the sandbox passed 486 tests in nine files, npm run typecheck passed, and tracked diff plus both new files were reviewed with clean whitespace/conflict checks.

## Surprises & Discoveries


SpelledInterval has only up/down and five qualities. It cannot represent all pairs of otherwise supported notes. An enharmonic diminished second has zero sounding displacement but nonzero letter displacement; altered same-letter unisons have zero letter displacement but nonzero sounding displacement. The existing validator and portable BigInt displacement arithmetic are suitable extension points. The focused sandbox suite passed, but the full sandbox suite encountered the previously recorded Vitest temporary-cache ENOENT during module loading. The same full command outside the sandbox passed all tests without changing code or tooling configuration.

## Decision Log


2026-10-07, user: implement signed distance between registered pitches and derive interval number, quality, and direction between registered spelled notes, with focused tests.

2026-10-07, agent: place semitoneDistance(from, to) in registered-pitch.ts and reuse checked transposition to compute target minus source. Normalize zero to +0. Numeric inputs and results retain the existing safe-integer contract and RangeError behavior.

2026-10-07, user: reuse SpelledInterval with identical notes represented as perfect unison/up, written-letter direction for different-position notes (including enharmonic equality), sounding direction for same-position altered unisons, and RangeError for qualities or motion outside the existing model. No model expansion is authorized. D025 records these persistent conventions.

## Outcomes & Retrospective


Both requested capabilities are implemented and verified. Focused tests prove signed registered distance, explicit simple/compound interval identities, both-direction exact spelling/register round trips, user-approved edge conventions, invalid inputs, safe arithmetic limits, and preserved frozen inputs. All existing tests and strict type checking pass. Documentation reflects the implemented contracts and deliberate limitations. Spelling and sounding displacement remain separate; no interval model expansion, new dependency, or unrelated capability was added. The full suite required outside-sandbox execution because of a test-cache loading limitation.

## Context and Orientation


One private npm package contains portable TypeScript domain modules. domain/music-theory/registered-pitch.ts represents sounding pitches as safe-integer semitone coordinates, C0 = 0. RegisteredNote carries letter, accidental -2..2, and written octave; conversion checks both octave base and sounding result. domain/music-theory/spelled-transposition.ts owns SpelledInterval and transposition based on independent letter/semitone displacement. Its private intervalDisplacement and validator enforce quality compatibility, compound intervals, and safe displacements. Existing tests use Vitest and compile-time assertions checked separately by npm run typecheck. No framework or Node API belongs in the domain.

## Plan of Work


Milestone 1 adds checked semitoneDistance in the registered-pitch module and focused tests in tests/interval-measurement.test.ts. Verify signed, zero, negative-coordinate, octave, safe-limit, and invalid-input behavior independently.

Milestone 2 follows the user-approved edge conventions and adds identifySpelledInterval in the spelled-transposition module. Derive inclusive number from written letter/octave positions and quality from the directed chromatic displacement relative to the major/perfect baseline. Use exact BigInt intermediates and existing validation. Verify explicit musical examples, compound/downward intervals, enharmonic boundaries, unsupported pairs, input preservation, numerical limits, and source-to-target transposition round trips.

Milestone 3 updates architecture and README implementation status and records user-approved persistent identification conventions in DECISIONS.md. Review tracked diffs and new files directly, and complete this plan with actual evidence.

## Concrete Steps


Run from C:\Users\simoa\Documents\fretbo-AI-rd using the installed Node 24.x/npm dependencies. Run npm test -- tests/interval-measurement.test.ts for focused checks, npm test for compatibility, npm run typecheck for strict checking, and git -c safe.directory=C:/Users/simoa/Documents/fretbo-AI-rd diff --check for whitespace. Expected outcomes are passing tests/checks and only intended changes in git status --short. Inspect untracked files separately. No installations, commits, or publication are needed.

## Validation and Acceptance


Distance returns target minus source, including 48→60 = 12, 60→48 = -12, and identical coordinates = +0. Reject invalid safe-integer inputs or unsafe differences in either direction. Identification must distinguish C4→F-sharp4 (augmented fourth) and C4→G-flat4 (diminished fifth), preserve compound interval number and direction, and produce supported intervals that transpose the source exactly to the target. Verify identical perfect unison/up, diminished seconds in written direction for enharmonic equality, augmented unisons in sounding direction, and explicit unsupported-pair errors. All existing tests and type checks must continue passing. Domain imports remain confined to sibling modules.

## Idempotence and Recovery


Checks are repeatable; no migration or external state is involved. Preserve user edits and use focused corrections rather than resets. If execution stops, record achieved milestones and any pending decision. Test-cache failures may require execution outside the sandbox; preserve their diagnostic evidence.

## Artifacts and Notes


Initial Git status was clean. At 2026-10-07T10:20:18Z, npm test -- tests/interval-measurement.test.ts passed all 87 tests and npm run typecheck exited 0. The focused suite ran successfully inside the sandbox. Final code review added an explicit source-coordinate check before negation, preserving strict numeric validation before arithmetic coercion. After that change, npm run typecheck again exited 0. Full sandbox npm test failed to load six suites due to temporary-cache ENOENT; this was not an assertion failure. At 2026-10-07T10:22:14Z, npm test outside the sandbox passed nine files / 486 tests (399 existing plus 87 new). Tracked diff --check and direct new-file whitespace/conflict checks passed. Domain additions use only existing sibling imports and portable arithmetic. Final status contains the intended five modified files plus this plan and the new test file; no user changes, packages, existing tests, commits, or external systems were altered.

## Interfaces and Dependencies


Add semitoneDistance(from: RegisteredPitch, to: RegisteredPitch): number and identifySpelledInterval(from: RegisteredNote, to: RegisteredNote): SpelledInterval. Existing APIs and dependencies stay intact. No public interval-displacement API is needed for these callers.

Revision note: 2026-10-07, created after repository inspection while awaiting the consequential identification convention decision.

Revision note: 2026-10-07, recorded the user-approved conventions, implemented interfaces, focused verification, and documentation updates.

Revision note: 2026-10-07, recorded complete verification and review, including the sandbox loading failure and successful outside-sandbox test run.
