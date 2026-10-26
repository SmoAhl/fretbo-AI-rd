# Registered chord realization and supplied voicings


This living ExecPlan follows [.agent/PLANS.md](../.agent/PLANS.md).

## Purpose / Big Picture


Represent explicit numeric/spelled voicings and construct a narrow root-position realization at a required registered root. Preserve full formula roles: C4 plus 2 gives D4, while 9 gives D5. Preserve input/formula order and repetitions. Chord identity remains in existing descriptions. Exclude inversion generation/analysis, arbitrary voicing generation, omissions/coverage policies, identification, Fretboard, Playability, UI, audio, AI and dependencies.

## Progress


- [x] 2026-10-26T09:44:59Z: Rechecked clean Git status, complete ExecPlan protocol, current register/formula/description contracts and architecture/decision guidance. User authorized the approved plan.
- [x] 2026-10-26T09:48:51Z: Added copied, nonempty numeric/spelled supplied voicings and exact compound-role numeric/spelled realization.
- [x] 2026-10-26T09:48:51Z: Verified independent fixtures for all 37 qualities, twelve numeric roots and 49 spellings at three written octaves, plus ownership/root/bass/representation boundaries. Focused checks passed 9,627 tests in nine suites; npm run typecheck passed.
- [x] 2026-10-26T09:50:57Z: Updated README/Architecture and recorded D051, preserving open richer-voicing/fingering policies. Full regression passed 16,568 tests in 31 suites. Reviewed all six changed/new files, 121 local documentation link targets, the decision heading, 100 relative .js domain import targets, whitespace and final status.

## Surprises & Discoveries


RegisteredPitch is a safe-integer semitone coordinate with C0 = 0; RegisteredNote octave belongs to its written letter, so B-sharp3 sounds as C4. Existing registeredPitchFromNote also validates the written octave's twelve-semitone base. Formula alterations support +/-3 and cannot all be expressed through IntervalQuality. Degree baselines and exact arithmetic avoid interval-quality translation or wrapped distances. A huge role's unaltered baseline may exceed the safe range while its altered displacement fits; tests verify exact final-alteration compensation. Sandbox Vitest failed before assertions on its known temporary SSR cache; the identical focused command passed outside the sandbox without tooling changes.

## Decision Log


2026-10-26, user: Use explicit supplied tone lists and both numeric/spelled representations. Require nonempty voicings. Root-position construction rejects incompatible specified bass, formulas lacking unaltered role 1 and below-root tones. Spelled bass/root must match exactly; numeric construction compares pitch classes. Implement the approved plan.

2026-10-26, approved plan: Require an explicit registered root matching the description. Preserve full formula distances, order and duplicates without inserting notes or shifting tones by octaves. Bass remains separate and is not appended. Numeric realization accepts either description representation without derived spelling constraints. Spelled realization uses existing role spellings, derives written octaves and confirms agreement with numeric output. Use BigInt intermediate degree, displacement, octave and coordinate arithmetic, rejecting unsafe displacements/coordinates before Number conversion. Return unfrozen, readonly-by-type copied voicings. Root/bass spelling letters and accidentals retain typed boundaries.

## Outcomes & Retrospective


All four milestones are complete. Four public APIs preserve supplied tone lists and realize full compound roles at an explicit registered root, enforcing the approved root/bass restrictions without changing identity or inferring inversions. Independent catalog/register/spelling fixtures, exact boundary checks, focused/full regressions and type checking pass. Documentation records D051 and the construction convention while leaving richer voicing and instrument policies open. Existing production modules, reference definitions, catalog/symbol/harmonization APIs, historical plans and dependencies are unchanged. Work is uncommitted.

## Context and Orientation


domain/music-theory/chords-symbols-and-realization/chord-formulas.ts exports ChordFormula and validateChordFormula; arbitrary positive safe-integer role numbers and +/-3 alterations are supported. chord-descriptions.ts (D049) separates root/formula/optional specified bass and exposes chordDescriptionNoteSpellings. Degree conversion lives in degrees-keys-and-spelling/degrees.ts. RegisteredPitch, RegisteredNote and coordinate/octave validation live in pitch-pitch-classes-and-spelling/registered-pitch.ts. The 37 named qualities are defined in triads.ts, seventh-chords.ts, added-tone-chords.ts and extended-chords.ts; symbols are a separate adapter under D050.

Architecture and the Music Theory Reference distinguish musical identity, specified versus sounding bass, voicing and fingering. This increment belongs entirely to portable Music Theory; existing construction, symbols, harmonization and description APIs remain unchanged. Existing tests use independent role/spelling/coordinate fixtures and separate type checking.

## Plan of Work


Milestone 1 adds registered-chords.ts in the chord folder with RegisteredPitchVoicing/RegisteredNoteVoicing and their factories. Validate nonempty arrays, sparse/invalid entries and registered coordinates/octaves, then independently copy every note. Verify unsorted and repeated tones, negative registers, enharmonic notes and frozen inputs.

Milestone 2 adds the numeric constructor: validate formula/root/bass constraints, split n-1 into seven-degree cycles and a simple reference role, reuse unaltered degree conversion and add alteration plus twelve semitones per cycle. Exact arithmetic preserves large degrees and register boundaries; reject unsafe displacements/results and below-root tones. The spelled constructor checks exact root/bass spelling, uses existing role spelling, derives written octaves by letter continuation and verifies registered coordinates against numeric output. Return through the factories and preserve formula order.

Milestone 3 adds tests/registered-chords.test.ts with independent fixtures for all named qualities at twelve numeric roots and all 49 spellings at representative negative/zero/positive octaves. Cover compounds, repeated roles/tones, enharmonic boundaries, custom formulas, incompatible root/bass, deferred spelling independence, huge degrees, safe boundaries/overflow, mutable/frozen isolation and compile-time readonly/representation constraints.

Milestone 4 updates README.md, docs/ARCHITECTURE.md and docs/DECISIONS.md with the delivered capabilities and next accepted decision. Narrow open voicing representation questions without selecting richer voicing/guitar policies. Keep root-position convention separate from general musical definitions. Complete focused/full/type checks and direct review of all new files, tracked diffs, documentation targets, dependency direction, whitespace and final status.

## Concrete Steps


From C:/Users/simoa/Documents/fretbo-AI-rd after adding the implementation/test files, run:

    npm test -- tests/registered-chords.test.ts tests/registered-pitch.test.ts tests/chord-formulas.test.ts tests/chord-descriptions.test.ts tests/triads.test.ts tests/seventh-chords.test.ts tests/added-tone-chords.test.ts tests/extended-chords.test.ts tests/chord-symbols.test.ts
    npm run typecheck
    npm test
    git diff --check
    git status --short

These are existing Node 24.x/npm commands. Expected observations are passing assertions/type checks and no whitespace diagnostics. Record actual outcomes below. If sandbox Vitest fails before assertions with known temporary SSR-cache ENOENT, repeat the identical read-only command outside the sandbox when permitted without changing tooling.

## Validation and Acceptance


C4 major yields C4-E4-G4; add2 ends D4 and add9 ends D5; sixth-ninth includes A4/D5. B-sharp/C-flat crossings retain written octaves and diminished sevenths retain role spelling. Numeric and spelled outputs agree when spellings fit, with numeric success independent of +/-3 derived spelling limits. Supplied E3-C4-G4-C5 stays unchanged and repeated references become independent note objects. Root position requires an actual unaltered role 1 and no lower tones, but need not put root first in output. Root/bass mismatches and rootless/below-root formulas reject rather than adjust. C/B-sharp is accepted numerically and rejected in spelled construction. Invalid/missing/sparse entries, unsafe octaves/displacements/coordinates and malformed formulas throw RangeError. No partial output or inferred voicing/chord analysis is introduced.

## Idempotence and Recovery


Checks are repeatable. Preserve user-owned/unrelated changes and inspect status before resuming. Correct only this effort's files after partial failure; do not reset historical work. No migration, commit, publishing or external mutation is needed. Record partial progress and do not mark complete before acceptance passes.

## Artifacts and Notes


Focused tests passed 9,627 tests in nine suites and npm run typecheck passed. Full npm test passed 16,568 tests across 31 suites, including 2,310 new registered-chord tests. The initial sandbox run failed before assertions with temporary SSR-cache ENOENT; the identical focused command and full regression passed outside the sandbox without tooling changes. Reviewed new source/tests/plan directly and all tracked documentation diffs. Verified 121 local documentation link targets, the D051 heading anchor, 100 portable relative .js domain import targets, tracked/new-file whitespace and final Git status. Dependency review confirms realization imports existing capabilities without reverse dependencies or new cycles.

## Interfaces and Dependencies


Export RegisteredPitchVoicing = Readonly<{ pitches: readonly RegisteredPitch[] }> and RegisteredNoteVoicing = Readonly<{ notes: readonly RegisteredNote[] }>. Factories createRegisteredPitchVoicing(pitches) and createRegisteredNoteVoicing(notes) return these records. rootPositionChordRegisteredPitches(description: PitchClassChordDescription | SpelledChordDescription, root: RegisteredPitch) returns RegisteredPitchVoicing. rootPositionChordRegisteredNotes(description: SpelledChordDescription, root: RegisteredNote) returns RegisteredNoteVoicing. All arguments are required, and spelling-only output cannot be requested from a numeric-only description.

The new module imports only existing portable domain capabilities using relative .js specifiers. Existing lower-level modules and catalog definitions do not import the new realization layer. Voicings do not carry inferred identity, analysis, strings or finger assignments.

Revision note: 2026-10-26, created before implementation from the user-approved plan; updated after acceptance and final review to record completion and evidence.
