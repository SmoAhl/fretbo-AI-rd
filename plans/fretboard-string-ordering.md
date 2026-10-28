# Explicit physical string order in the discrete fretboard


This plan follows [.agent/PLANS.md](../.agent/PLANS.md). It records the string-ordering extension requested after the completed Fretboard v1 effort.


## Purpose / Big Picture


Complete the instrument model by recording the physical order of its strings independently of their stable IDs, tuning, array order and screen orientation. Preserve existing pitch mapping, strict regions, search ordering and allocation limits. No chord assignments, fingerings, barre validation, Playability, UI, geometry, dependencies or Git mutations are included.


## Progress


- [x] 2026-10-28T08:44:15Z: Resumed from the existing seven uncommitted v1 files; inspected repository instructions, protocol, implementation, tests, reference and D054.
- [x] 2026-10-28T09:01:07Z: Recorded milestone 1 results from the pre-interruption run: required positions implemented, both fixture suites migrated, shared validation/copying reviewed. Focused verification passed 338 tests in two suites; npm run typecheck passed.
- [x] 2026-10-28T09:01:44Z: Updated reference, architecture and D055. Full regression passes 17,633 tests in 36 suites; final type checking passes. Reviewed source, changed fixtures, position tests, documentation and Git status; tracked and untracked file whitespace checks emit no diagnostics. No staging or commit performed.


## Surprises & Discoveries


The v1 changes remain uncommitted after a previous Git approval rejection. Preserve those changes and make this extension on top; do not retry staging or committing. Existing factory copies explicitly select fields, so position must be copied as well as validated. Queries accept structural board records and must enforce ordering without relying on factory use. No production consumer outside the Fretboard module was found; current callers are the two Fretboard test suites.

The focused sandbox run passed 332 unit tests but could not load the integration suite because of SSR-cache ENOENT. The full sandbox run similarly failed to load 35 suites (two bootstrap tests passed). Identical commands outside the sandbox passed without source/configuration changes. An approval-review usage limit interrupted the first documentation/final-check call before execution; after the user's continuation, saved state was checked and that work was completed.


## Decision Log


2026-10-28, implementation author under the user's request to implement the discussed ordering: choose one required readonly numeric `position` per string, rather than a second ordered list of IDs. Positions must be unique integers covering 1 through the number of strings. A set of N unique positions in that range proves completeness without building an additional range array. Keep arbitrary positive safe IDs and canonical ID sorting. Missing order is rejected rather than inferred from IDs or input array order.

Position 1 denotes the designated first-string edge of the instrument; increasing positions traverse adjacent strings toward the opposite edge. For conventional guitar numbering this starts at the standard high-E string edge, regardless of later tuning or left/right-handed display. Position is an ordinal, not a measured distance or a pitch rank. Retuning preserves supplied identity and position. No adjacency API is needed to represent this fact; consumers can compare positions or sort a copy.


## Outcomes & Retrospective


Both milestones are complete. Physical order survives all six permutations of a three-string fixture, retuning retains adjacency, and changed physical order preserves direct and search results. Missing/invalid positions are rejected by all four operations, including structural inputs and empty selections. Position copy isolation and required/readonly typing are verified. Twenty new test cases supplement the migrated v1 fixtures; the complete regression passes 17,633 tests in 36 suites. Final type checking and whitespace checks pass.

This is a deliberate required-field contract extension: existing callers must provide position explicitly. No automatic migration policy is introduced. The implementation selects per-string position from the previously discussed alternatives and records that choice in D055. Stable IDs, canonical ID sorting, Music Theory, numerical pitch mapping and all deferred boundaries remain unchanged. No contacts, fingerings, candidate generation, Playability or geometry were implemented. The only verification adjustment was the documented outside-sandbox test retry.


## Context and Orientation


`domain/fretboard/fretboard.ts` defines explicit string/open-pitch records, common frets 0 through fretCount, and four operations. D054 and `plans/fretboard-engine-v1.md` document the completed original boundary. Physical order was absent; ID sorting only made results deterministic. Music Theory remains unchanged and contributes checked numeric pitch arithmetic. The Fretboard Reference owns the physical adjacency fact; architecture and decisions own its software representation.


## Plan of Work


### Milestone 1 — Required physical positions


Add readonly position to FretboardString, validate it in validateBoard for every operation, and copy it in createFretboard. Migrate both existing Fretboard suites explicitly, retaining their reference results. Add tests with noncontiguous IDs and position order different from both input order and pitch order. Verify retuning, singleton boards, copy isolation, readonly types and changed order without changed sounding locations. Reject missing, null, fractional, unsafe, duplicate and out-of-range positions, including direct structural inputs and empty selections. Acceptance requires focused tests and type checking to pass.


### Milestone 2 — Documentation and regression


Explain the physical-order convention in docs/FRETBOARD_REFERENCE.md, update the implementation account in docs/ARCHITECTURE.md, and record D055 as an extension of D054. Keep the completed v1 plan historical. Run full regression and type checking, inspect all changed/new files and check whitespace. Acceptance requires no changed Music Theory behavior, pitch-search fixtures or result ordering, and no deferred capabilities.


## Concrete Steps


Run from C:/Users/simoa/Documents/fretbo-AI-rd with existing Node 24.x and installed dependencies:

    npm test -- tests/fretboard.test.ts tests/fretboard-music-theory.test.ts
    npm run typecheck
    npm test
    git diff --check
    git status --short

Check untracked source/test/plan files directly and with git diff --no-index --check against /dev/null. Commands should exit zero when successful; record actual evidence below. If the known sandbox SSR-cache ENOENT recurs, repeat the identical test command outside the sandbox when permitted rather than changing test configuration.


## Validation and Acceptance


Every valid board has one and only one string at each position 1..N. Position and ID are independent; neither tuning nor array permutations change position. The same ID/open-pitch/fret combinations retain identical direct and search results even when physical positions differ. Every public operation validates the entire board, including when a search selects no strings. Factory output copies position without freezing or mutating inputs. Existing numerical bounds and 10,000-result tests remain applicable.


## Idempotence and Recovery


Inspect status before resuming; preserve the uncommitted v1 work and all unrelated changes. No migration, external state or Git operation is required. Do not restore old fixtures to conceal the required-field change. Repeat focused checks after repairs and update actual findings.


## Artifacts and Notes


Focused command: npm test -- tests/fretboard.test.ts tests/fretboard-music-theory.test.ts passed 338 tests in two suites outside the sandbox. The first sandbox invocation passed all 332 Fretboard unit tests but failed to load the integration suite with the documented SSR-cache ENOENT. The identical command passed outside the sandbox without tooling changes. npm run typecheck passed. Earlier v1 verification remains historical evidence, not validation of this extension.

Final verification after resuming: npm test passed 17,633 tests in 36 suites outside the sandbox; npm run typecheck exited 0; git diff --check emitted no diagnostics. Separate git diff --no-index --check comparisons against /dev/null for the untracked production module, both test files and this plan also emitted no whitespace diagnostics (no-index can report exit 1 for differing content). Read the new source and test sections directly. Current changes attributable to this extension are the Fretboard module, both Fretboard test files, docs/FRETBOARD_REFERENCE.md, docs/ARCHITECTURE.md, docs/DECISIONS.md and this plan; the other v1 working-tree changes were preserved. The completed v1 plan remains historical. Git index is empty.


## Interfaces and Dependencies


FretboardString becomes Readonly<{ id: StringId; position: number; openPitch: RegisteredPitch }>. Existing function signatures, board fields, location records and search results stay unchanged. A missing position is a TypeScript error and a runtime RangeError. No new production exports or dependencies are needed.

Revision note: 2026-10-28, created for the user-authorized physical string-order extension; the completed v1 plan is preserved.

Revision note: 2026-10-28T09:01:44Z, completed implementation, fixture migration, D055 and documentation, regression and final review; recorded the interruption and sandbox retry evidence.
