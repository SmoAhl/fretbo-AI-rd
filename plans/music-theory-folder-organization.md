# Organize Music Theory by reference sections


This plan follows [.agent/PLANS.md](../.agent/PLANS.md). It is a living record of this refactor.

## Purpose / Big Picture


Make the Music Theory engine easier to navigate by grouping its existing modules under the five subject headings in docs/MUSIC_THEORY_REFERENCE.md. The user authorized moving files and updating their consumers. Preserve all musical behavior, exported names, signatures, comments, and tests; module import paths deliberately change.

## Progress


- [x] 2026-10-21T10:41:53Z: Inspected clean Git status, repository instructions, architecture, accepted decisions, reference headings, source modules, consumers, and verification configuration.
- [x] 2026-10-21T10:42:42Z: Moved all 21 modules and updated test imports and Architecture paths/organization. README contains no affected module paths.
- [x] 2026-10-21T10:43:37Z: Verified all 4,753 tests in 24 suites, type checking, exact import-only relocation, current consumers, and final diff/status.

## Surprises & Discoveries


There are 21 source modules and 24 existing test suites. Tests live in a separate flat tests/ directory and import individual modules using relative .js specifiers. There is no existing barrel API to preserve. Completed plans record historical source locations; retain them as historical evidence.

## Decision Log


2026-10-21, agent: Use full kebab-case reference heading names: pitch-pitch-classes-and-spelling; intervals-and-transposition; scales-and-modes; degrees-keys-and-spelling; chords-symbols-and-realization. This directly implements the requested naming without introducing extra categories. Keep generic spelling-selection with pitch fundamentals, key-aware-spelling with keys, and chromatic with scale collections. Move whole files without splitting existing responsibilities. Keep tests at their current locations and update imports; their organization was not requested. Do not add forwarding modules or barrel exports, which would retain clutter or introduce another API.

## Outcomes & Retrospective


Completed all 21 module moves into five reference-derived folders. All musical implementation, comments, exported symbols, signatures, and test assertions are preserved. Current imports and Architecture now describe the new locations. No pending implementation or verification remains. Direct module consumers must use the new paths.

## Context and Orientation


At the start, domain/music-theory contained 21 flat TypeScript modules; these now live in the five subject directories. docs/ARCHITECTURE.md describes these paths and README.md contains usage documentation. Decisions D020-D041 govern the existing musical contracts, including explicit interval direction, degree roles, key context, and triple accidentals. Folder organization changes none of these. Domain modules remain portable and independent of React, Next.js, Node APIs, AI, Fretboard, and Playability.

## Plan of Work


First move pitch-class, note-spelling, registered-pitch, note-text, and spelling-selection into pitch-pitch-classes-and-spelling. Move spelled-transposition and interval-text into intervals-and-transposition. Move scales, relative-modes, minor-modes, scale-runs, scale-run-internals, melodic-minor-runs, scale-text, and chromatic into scales-and-modes. Move degrees, degree-text, keys, and key-aware-spelling into degrees-keys-and-spelling. Move triads and seventh-chords into chords-symbols-and-realization. Rewrite relative imports mechanically from each module's new location. Verify each file differs only in import specifiers.

Then update all test consumers and current documentation paths, documenting the reference-to-folder mapping in Architecture. Keep accepted decisions and completed plans as historical records. Verify no current consumers reference obsolete flat paths.

Finally run the full existing behavioral suite and type checking, then inspect Git diffs and all new paths directly. Record actual outcomes here.

## Concrete Steps


Work from C:/Users/simoa/Documents/fretbo-AI-rd with existing Node.js 24.x/npm. Move the files using an explicit complete mapping and update relative imports with .js extensions. Update docs/ARCHITECTURE.md and any affected README.md paths. Run npm test and npm run typecheck. Run git diff --check and compare relocated contents against HEAD after normalizing import specifiers. Inspect git status --short and count 21 relocated modules across five directories.

## Validation and Acceptance


All existing tests must pass at their new import paths, and strict application/NodeNext type checks must pass. Verify all 21 source modules exist exactly once, no source modules remain at the old flat locations, all local imports resolve, and musical implementation and test assertions are unchanged. No dependency, application, framework, or public symbol changes are required. A production build adds little evidence to this source-only move; full tests and type checks cover the affected graph.

## Idempotence and Recovery


The mapping is a one-time move: check source/destination existence before repeating it. Preserve user changes and avoid resetting the working tree. If interrupted, inspect current paths and complete only missing moves/import rewrites. Tests and type checking can safely be repeated; they may write ignored caches. If temporary Vitest SSR-cache ENOENT prevents assertions, rerun the identical command outside the sandbox when permitted, without changing project tooling.

## Artifacts and Notes


Initial Git status was clean. npm test initially failed before domain assertions with sandbox temporary SSR-cache ENOENT; the identical command outside the sandbox passed 4,753 tests in 24 suites. npm run typecheck passed Next.js type generation and both TypeScript checks. An exact comparison against HEAD verified all 21 relocated modules differ only by the expected 59 import specifiers and all 24 test files differ only by mapped module paths. Directory counts are pitch 5, intervals 2, scales 8, degrees/keys 4, and chords 2. No flat modules or current obsolete path references remain. git diff --check passed; new source files were directly checked for whitespace/conflict markers and exact content preservation. Final changes consist of the 21 source moves, imports in 23 test files, Architecture, and this plan. README, accepted decisions, and historical plans are unchanged.

## Interfaces and Dependencies


Existing exported types/functions and .js ESM import style remain unchanged. Imports within a subject stay relative to that directory; cross-subject imports use ../<subject>/<module>.js. No forwarding modules, package aliases, dependencies, or new engine boundaries are introduced. These folders organize one Music Theory engine; they are not independent packages or a newly imposed dependency hierarchy.

Revision note: 2026-10-21, created before the authorized refactor and updated with completed moves, documentation, full validation, sandbox runner evidence, and final review.
