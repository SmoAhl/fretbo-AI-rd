# Music Theory v1 readiness and Fretboard handoff review


This living ExecPlan follows [.agent/PLANS.md](../.agent/PLANS.md).

## Purpose / Big Picture


Complete milestone 7 by reviewing the bounded Music Theory engine, verifying representative cross-module paths, and documenting supported contracts, limitations and information preserved for future Fretboard consumption. Fix concrete integration discrepancies only; do not add musical capabilities, Fretboard implementation, a new universal model, or an error-system redesign. Readiness means the existing musical outputs are usable by a future consumer, not that fretboard mapping or fingering is implemented.

## Progress


- [x] 2026-10-26T10:55:58Z: Confirmed clean Git status, read full ExecPlan protocol, current exports/configuration, relevant architecture/accepted contracts and Music Theory/Fretboard/Playability references. Inspected existing integration coverage and representative source paths.
- [x] 2026-10-26T11:01:20Z: Added nine cross-module readiness tests with independent expected notes, coordinates and statuses, retaining existing unit/catalog matrices.
- [x] 2026-10-26T11:01:20Z: Added the bounded v1/handoff guide and README/Architecture entry links. Clarified deferred key-aware spelling enumeration versus implemented chord identification. No production discrepancy or API change was needed.
- [x] 2026-10-26T11:01:20Z: Focused regression passed 3,867 tests in four suites; final type checking passed; full regression passed 17,295 tests in 34 suites. Audited 30 domain modules/116 relative imports with existing targets and no cycles. Direct file/diff review complete; final link/whitespace/status checks recorded below.

## Surprises & Discoveries


Individual modules already have broad deterministic tests. Milestones 5/6 also test local composition. The missing review artifact was a concise consumer-oriented account of which original data must accompany lossy numeric/analysis projections. D052 coverage does not enforce a particular register or occurrence multiplicity, even though explicit voicings preserve both. D053 identification discards spelling, register and multiplicity for matching; original data remains necessary for a realization request. Initial type checking caught the intentional ScaleType versus HarmonizableCollection boundary in the integration fixture: parsed values can include pentatonics and must be narrowed before harmonization. The test now performs that caller-side narrowing and the guide explains it; no production contract was widened. No blocking implementation discrepancy was found in the reviewed paths.

## Decision Log


2026-10-26, scope derived from the user's milestone 7 request: verify representative engine paths, document current contracts and limitations, and fix concrete integration gaps without expanding musical scope. Use existing exports directly and keep Music Theory independent of Fretboard, Playability, UI and AI.

2026-10-26, implementation approach: retain existing unit/catalog coverage and add only cross-module acceptance paths. Document the consumer boundary in docs/MUSIC_THEORY_V1.md, linked from Architecture and README. No new public API, handoff schema or persistent musical convention is proposed; no new accepted-decision entry is needed for verification alone. Keep extended inversion naming, candidate generation ownership and error classification open.

## Outcomes & Retrospective


Milestone 7 is complete for the bounded v1 scope. Nine cross-module acceptance paths and all existing regression/type checks pass. The guide records supported capabilities, limitations and preserved Fretboard input information without introducing a universal request schema. Review found no blocking production integration gap; only documentation ambiguities and a caller-side type-narrowing requirement needed clarification. Existing domain source, accepted musical decisions and dependencies are unchanged. Future Fretboard mapping and Playability are unimplemented and unverified; exact requested register/multiplicity still must be checked by their future consumer rather than inferred from coverage/identification. Extended inversion naming, candidate-generation ownership and error classification remain open. Changes are uncommitted.

## Context and Orientation


Music Theory lives in domain/music-theory/ under five reference-derived subject folders. Current accepted contracts cover classes (C=0), safe registered coordinates (C0=0), exact spellings through +/-3, intervals, collections and registered runs, degree/key spelling, formulas and catalog construction, seven-note harmonization, descriptions (D049), bounded symbols (D050), supplied/root-position realization (D051), known-chord voicing analysis (D052) and exact catalog identification (D053). Existing arrays are readonly by type and generally independent/unfrozen; typed root/spelling boundaries are not universal untrusted-input validation. Construction and analysis do not select strings/frets/fingers. Fretboard Reference requires registered tuning and distinct class versus registered-pitch matching, retaining location alternatives; scales and melodies require locations only. Playability must preserve required pitches, register, doubling and bass rather than simplify content.

## Plan of Work


First add tests/music-theory-readiness.test.ts. Trace parsing, interval transposition, key-aware spelling, scales/modes/degrees, harmonization, descriptions/symbols, realization, analysis and identification through independent hand-written examples. Verify enharmonic octave crossings, explicit traversal conventions, slash bass, optional omissions, compound role distances and intentionally unsupported spelling/notation. Do not reimplement catalog matrices or build a pretend Fretboard engine.

Next write docs/MUSIC_THEORY_V1.md as a concise supported-contract and handoff guide. Describe class versus registered targets, retained spelling/role/tonic metadata, explicit bass and required/optional policy, source indices and repeated tones. Explain which projections lose information and why D052 coverage or D053 identification is not an exact registered-voicing validator. Link existing grammar/implementation details rather than duplicating them. Add entry links and a bounded readiness summary to Architecture and README, correcting discovered wording ambiguities only.

Finally run the focused readiness suite with chord integration suites, npm run typecheck and full npm test. Inspect imports for framework/environment dependencies and missing targets. Verify documentation targets, whitespace and Git status, and record actual results. If tests expose a true cross-module discrepancy, repair it within the accepted contracts with regression coverage; otherwise leave production code unchanged.

## Concrete Steps


From C:/Users/simoa/Documents/fretbo-AI-rd after adding the acceptance suite:

    npm test -- tests/music-theory-readiness.test.ts tests/chord-identification.test.ts tests/chord-voicing-analysis.test.ts tests/scale-harmonization.test.ts
    npm run typecheck
    npm test
    git diff --check
    git status --short

Commands already exist under Node 24.x/npm. Expect all checks to pass and no whitespace errors; record actual results separately. The known managed-sandbox SSR-cache ENOENT may occur before assertions; if it does, repeat the identical test command outside the sandbox when permitted without changing tooling. No application build/UI check is required for domain-only tests and documentation.

## Validation and Acceptance


F-sharp major through key spelling, harmonized C-sharp seventh, symbol, registered realization, analysis and identification must retain E-sharp and exact coordinates. C harmonic-minor degree-seven diminished seventh retains A-flat as a seventh role and all numeric identity alternatives. B-sharp register crossings preserve written octaves. Relative modes and classical/fixed melodic-minor descent retain explicit tonic/collection semantics. Slash non-chord bass stays separate from formula tones and analysis remains distinct from exact-set identification. Optional omission policy affects known-chord coverage without changing the complete construction/identification contract. Add2/add9 share class content while retaining distinct registered constructions. Numeric success with unrepresentable derived spelling, malformed symbol rejection and unsupported inversion structures remain explicit limitations. Verify original descriptions, options and registered voicings keep every datum a future Fretboard consumer needs. Full existing regression/type checks establish no detected change in prior behavior.

## Idempotence and Recovery


Checks can be repeated. Preserve user work and review status before edits/continuation. Repair only this effort after partial failures; do not reset prior work. No dependencies, migrations, commits, staging or publishing are required. Keep unresolved product/architecture choices open.

## Artifacts and Notes


Starting Git status was clean. Focused readiness/chord integration regression passed 3,867 tests in four suites. After correcting test-only parsed-collection narrowing, npm run typecheck passed. Full npm test passed 17,295 tests in 34 suites, including nine new readiness tests. Tests ran outside the sandbox using approval because this chat had already reproduced the known SSR-cache ENOENT; no tooling changed. Import audit covered all 30 domain modules and 116 imports, confirming existing relative .js targets, no non-relative dependencies and no cycles. A source scan found no framework/browser, network, random/time or process dependencies. New tests/guide/plan were read directly, and tracked README/Architecture diffs reviewed. Git diff --check passed. Final checks found clean whitespace across the five changed/new files, 124 valid local link targets, 64 valid heading anchors and resolved readiness-test imports. Status contains only two intended documentation edits and the new guide, plan and test suite. No staging or commits occurred. No application build/UI test was run because production/application code did not change; no Fretboard behavior is claimed.

## Interfaces and Dependencies


No public API or type addition is planned. Tests import existing portable modules directly with relative .js specifiers. The guide describes consuming current description/formula/spelling/run/voicing/analysis data together; it does not define a Fretboard request schema, validation policy for a future external boundary, or location/grip generation ownership. Accepted decisions remain authoritative; review evidence belongs here rather than as a new musical decision.

Revision note: 2026-10-26, created before changes for the authorized readiness review; updated after passing checks with completed outcomes and actual review evidence.
