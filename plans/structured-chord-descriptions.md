# Structured chord descriptions with optional specified bass


This living ExecPlan follows [.agent/PLANS.md](../.agent/PLANS.md).

## Purpose / Big Picture


Introduce numeric and spelled descriptions containing explicit root, formula roles and optional unregistered specified bass. Connect named chord constructors and harmonization through these descriptions without changing existing signatures, tone arrays, spelling behavior or errors. Descriptions preserve musical intent; they do not determine a voicing or playable realization. Symbols, inversion analysis, bass-membership queries, register, omissions, identification, Fretboard, Playability, UI, AI and dependencies are excluded.

## Progress


- [x] 2026-10-26T08:47:48Z: Rechecked clean Git status, complete ExecPlan protocol, current chord/harmonization contracts, architecture, accepted decisions and relevant reference guidance. User authorized this implementation.
- [x] 2026-10-26T08:50:52Z: Extracted shared formula validation and added copied numeric/spelled descriptions.
- [x] 2026-10-26T08:50:52Z: Added resolution and routed all named constructors and harmonization tone paths through descriptions, preserving metadata and public APIs.
- [x] 2026-10-26T08:50:52Z: Focused checks passed 8,031 tests in seven suites, including all named-quality/root equivalence and existing independent harmonization matrices. npm run typecheck passed.
- [x] 2026-10-26T08:53:12Z: Updated README/Architecture/reference and recorded D049. Full regression passed 11,971 tests in 29 suites. Reviewed all 13 changed/new files, 112 local documentation link targets, 86 relative .js domain import targets, whitespace and final Git status.

## Surprises & Discoveries


The formula module already validates nonempty arrays, positive safe-integer numbers and +/-3 alterations, including sparse entries. Extracting that validation avoids introducing another formula policy. The domain's root/bass values remain typed inputs; factory creation need not resolve derived spellings. Actual bass means lowest registered pitch, whereas the new optional bass is an unregistered constraint for a later realization. Sandbox Vitest failed before assertions with the known temporary SSR-cache ENOENT; the identical focused command passed outside the sandbox without tooling changes.

## Decision Log


2026-10-26, user: Provide both numeric and spelled descriptions, use a shared construction path for existing constructors, and defer derived-tone spelling limits until resolution. Implement the approved plan.

2026-10-26, approved plan: Description fields are root, formula, optional bass, without quality/family metadata. Missing bass means unspecified; explicit root bass and non-chord bass remain explicit. Tone resolution uses formula tones only, without appending/reordering by bass. Preserve formula order, compound numbers, duplicates and enharmonic roles. Factories copy nested data, omit bass for undefined arguments, and return unfrozen readonly-by-type objects. Numeric resolution accepts both representations; spelled resolution requires a spelled description. Keep low-level root/formula resolvers public and unchanged in behavior.

## Outcomes & Retrospective


All four milestones are complete. Numeric and spelled descriptions copy musical intent and carry optional bass independently of formula tones. Named constructors and harmonization share this path with unchanged public signatures, catalog definitions and musical behavior. Independent preexisting catalog/harmonization suites and the new description tests pass, including deferred spelling and ownership contracts. Documentation records D049 and clarifies specified versus sounding bass while leaving voicing/fingering representations open. No dependencies or unrelated capabilities were added. Work is uncommitted.

## Context and Orientation


domain/music-theory/chords-symbols-and-realization/chord-formulas.ts contains ChordFormula and the low-level chordPitchClasses/chordNoteSpellings resolvers, governed by D042. triads.ts, seventh-chords.ts, added-tone-chords.ts and extended-chords.ts provide 37 named qualities, formula getters and numeric/spelled constructors under D043-D047. scale-harmonization.ts (D048) derives formulas and resolves selected/full collection outputs while preserving metadata and selected-result spelling limits.

docs/ARCHITECTURE.md separates musical identity, voicing and fingering. docs/MUSIC_THEORY_REFERENCE.md distinguishes a chord root from the lowest registered pitch and permits non-chord slash basses. Reuse these facts; do not select future voicing or fingering representations. Existing tests use independent numerical/spelled fixtures and separate TypeScript checking.

## Plan of Work


Milestone 1 extracts exported validateChordFormula(formula): void in the low-level formula module and creates chord-descriptions.ts in the same folder. Add readonly PitchClassChordDescription and SpelledChordDescription, copying root/formula/bass through factories. Verify malformed formulas reject without requiring tone spelling, and mutation of inputs/results cannot affect other descriptions.

Milestone 2 adds chordDescriptionPitchClasses for either representation and chordDescriptionNoteSpellings for spelled descriptions, delegating all tone calculation to existing resolvers. Route the eight named numeric/spelled constructors and two harmonization selected-degree tone paths through description creation/resolution. Preserve signatures, catalogs, metadata, result shapes and errors. Verify explicit bass never changes tone arrays and dependencies remain acyclic.

Milestone 3 adds tests/chord-descriptions.test.ts for bass/spelling/formula/ownership/type contracts and integration equivalence across all 37 qualities, twelve numeric roots and 49 spellings. Existing independent catalog and harmonization suites supply unchanged musical regression oracles. Verify numeric output survives unrepresentable spelled tones and no-root/no-third formulas remain valid.

Milestone 4 updates README.md, docs/ARCHITECTURE.md and docs/DECISIONS.md, records the next accepted decision, narrows the identity representation open question, and clarifies specified versus actual bass in docs/MUSIC_THEORY_REFERENCE.md. Complete tests, type checking, link/whitespace/dependency review and final Git status.

## Concrete Steps


From C:/Users/simoa/Documents/fretbo-AI-rd, after adding the new test file, run:

    npm test -- tests/chord-descriptions.test.ts tests/chord-formulas.test.ts tests/triads.test.ts tests/seventh-chords.test.ts tests/added-tone-chords.test.ts tests/extended-chords.test.ts tests/scale-harmonization.test.ts
    npm run typecheck
    npm test
    git diff --check
    git status --short

Use existing Node 24.x and package scripts; no setup/dependency changes are needed. Expected results are passing assertions/type checks and no whitespace diagnostics. Record actual results separately. If sandbox Vitest fails before assertions on its known temporary SSR cache, repeat the identical read-only command outside the sandbox when permitted.

## Validation and Acceptance


C major with E or F-sharp specified bass still resolves C-E-G, retaining the separately specified bass. An explicit root bass remains present; omitted/undefined bass produces no property. Enharmonic bass spellings remain distinct. Duplicate/compound/enharmonic roles retain exact order and numeric/spelled conversion. Creation of a valid but unspellable description succeeds; only spelled tone resolution throws RangeError. Numeric resolution still succeeds. Frozen shared root/bass inputs and every formula role are copied independently. Invalid formulas, including sparse and empty arrays, reject in factories and resolvers. Compile-time tests enforce required root/formula, readonly properties, numeric/spelled bass representation and spelled-only resolution. Existing named construction and harmonization behavior remains unchanged.

## Idempotence and Recovery


Checks are safe to repeat. Inspect current status before resuming and preserve unrelated/user-owned changes. Recover by correcting only this effort's files, without resetting historical plans or user work. No migrations, commits, publishing or external mutations are required. Do not mark completion until acceptance results are verified.

## Artifacts and Notes


Focused tests passed 8,031 tests across seven suites. npm run typecheck passed. Full npm test passed 11,971 tests in 29 suites, including 2,316 new description tests. The sandbox SSR-cache failure occurred before assertions; an identical outside-sandbox focused command passed, and the full suite also ran outside the sandbox. Reviewed new source/tests/plan directly and all tracked diffs, checked 112 local documentation link targets and 86 portable relative .js domain import targets, and verified tracked/new-file whitespace and final status. Dependency review confirms descriptions import low-level formulas and named construction imports descriptions; no reverse formula dependency or cycle was introduced. Existing comments and historical plans were preserved.

## Interfaces and Dependencies


Export PitchClassChordDescription = Readonly<{ root: PitchClass; formula: ChordFormula; bass?: PitchClass }> and SpelledChordDescription with NoteSpelling root/bass. Factories createPitchClassChordDescription(root, formula, bass?) and createSpelledChordDescription(root, formula, bass?) require root/formula and copy their inputs. chordDescriptionPitchClasses accepts either description and returns readonly PitchClass[]. chordDescriptionNoteSpellings accepts only SpelledChordDescription and returns readonly NoteSpelling[]. Bass is not part of either returned tone array.

Descriptions import validateChordFormula and low-level tone resolvers plus existing spelling conversion. Named constructors and harmonization import descriptions. The formula module must not import descriptions, named catalogs or harmonization. Retain portable domain-only imports with relative .js specifiers and all existing public signatures. Expose no new family-specific adapters, generic quality schema, or unrelated representation.

Revision note: 2026-10-26, created before implementation from the user-approved plan; updated after completion to record acceptance evidence and final review.
