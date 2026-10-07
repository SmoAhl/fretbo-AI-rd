# Add explicit note spelling to Music Theory


This plan follows [.agent/PLANS.md](../.agent/PLANS.md). It is a living document for the user-approved spelling increment.

## Purpose / Big Picture


Callers can express distinct note spellings, such as C-sharp and D-flat, and deterministically obtain their shared numeric pitch class. Establish C = 0 as the project's named origin. Support structured letters and accidentals through doubles. Register, reverse spelling selection, text parsing, scales, chords, UI, AI, and new dependencies are excluded. Observe success through domain tests and strict type checking.

## Progress


- [x] 2026-10-07T07:29:10Z: Inspected the clean working tree, instructions, protocol, architecture, decisions, relevant theory reference, existing domain code, and test configuration.
- [x] 2026-10-07T07:31:18Z: Implemented the typed spelling contract and conversion using existing transposition.
- [x] 2026-10-07T07:31:18Z: Added 35 explicit spelling cases, enharmonic/frozen-input/composition tests, and negative compile-time assertions.
- [x] 2026-10-07T07:31:18Z: Recorded D020 and updated architecture and README implementation status.
- [x] 2026-10-07T07:32:25Z: Passed 69 tests outside the sandbox and strict type checking inside it; reviewed tracked diffs and all three new files, checked whitespace/conflict markers, and confirmed existing pitch-class code and dependencies are unchanged.

## Surprises & Discoveries


The existing transposition function already normalizes signed offsets into 0..11. Tests imported through .js specifiers receive NodeNext checking as well as application TypeScript checking. Historical documentation plans are completed context, not instructions to expand this effort.

Two sandboxed full-suite attempts failed before the new tests loaded with ENOENT for a shared module in Vitest's sandbox temporary cache; the existing 28 tests passed. Running the same npm test command outside the sandbox passed all 69 tests. This establishes a sandbox-specific runner limitation without changing source or tooling configuration. Type checking passed inside the sandbox.

## Decision Log


2026-10-07, user: approve C = 0, structured note spellings, accidentals -2 through 2, and one-way conversion to pitch class. The named origin is a project convention; the representation preserves spelling until explicitly converted. Register and reverse naming remain open.

2026-10-07, user-approved plan: accept typed structured inputs, with external-data validation deferred to a future boundary. Keep numeric transposition unchanged and reuse it for accidental displacement. This avoids duplicating normalization rules or selecting names from semitone distance alone.

## Outcomes & Retrospective


The agreed domain capability is implemented and its behavior and type contract pass verification. Explicit spelling survives in the input object while the numeric result deliberately loses it. No register, reverse naming, parser, or framework dependency was added. Final file and whitespace review passed. The remaining limitation is the sandbox-specific Vitest cache failure; full-suite execution outside the sandbox succeeded without tooling changes.

## Context and Orientation


The repository is one private Next.js/TypeScript package with independently testable domain modules. Domain code must remain free of React, Next.js, Node APIs, UI, and AI dependencies. `domain/music-theory/pitch-class.ts` exports numeric `PitchClass` (0..11) and `transposePitchClass(pitchClass, semitones)`, accepting signed safe-integer offsets and throwing RangeError for unsupported offsets. Existing tests cover wrapping and precision boundaries.

`docs/MUSIC_THEORY_REFERENCE.md`, sections Pitch, pitch classes, and spelling and Intervals and transposition, defines natural-letter spacing, accidentals, enharmonic equivalence, and octave wrapping. It supplies domain knowledge rather than selecting a software representation. `docs/ARCHITECTURE.md` owns implementation status; `docs/DECISIONS.md` owns persistent accepted conventions; `README.md` summarizes status.

## Plan of Work


Milestone 1 establishes the contract in `domain/music-theory/note-spelling.ts`: export NoteLetter A through G, Accidental -2|-1|0|1|2, readonly NoteSpelling with required letter and accidental fields, and pitchClassFromSpelling(note): PitchClass. Use a private total natural-letter mapping C=0, D=2, E=4, F=5, G=7, A=9, B=11 and call existing transposition with the accidental. Inspect imports and compile-time usage to verify portability and additive compatibility.

Milestone 2 demonstrates behavior in `tests/note-spelling.test.ts`. Use explicit expected values for all 35 letter/accidental combinations, check enharmonic pairs and wrapping, a frozen input, and positive/negative numeric transposition after conversion. Compile-time assertions must reject unsupported letters, out-of-range accidentals, and either missing field without invoking invalid inputs at runtime. Run npm test and npm run typecheck independently.

Milestone 3 aligns documentation: record the accepted persistent C-origin and explicit-spelling convention in the decision log; describe implemented behavior and limits in architecture and README. Leave register and reverse spelling open. Review tracked diffs, newly created files, and final Git status, then record actual verification evidence here.

## Concrete Steps


Working directory for all commands: `C:\Users\simoa\Documents\fretbo-AI-rd`. Existing dependencies and Node.js 24.x are prerequisites; no tooling installation is planned. Inspect Git with `git -c safe.directory=C:/Users/simoa/Documents/fretbo-AI-rd status --short` before edits. Create the module and tests, then run `npm test` (expect all existing and new tests to pass) and `npm run typecheck` (expect exit 0, including negative type assertions). Update documentation and this plan. Run `git -c safe.directory=C:/Users/simoa/Documents/fretbo-AI-rd diff --check`, inspect the diff and new files directly, and inspect status again. Expected results are not actual execution results; record actual results in Artifacts and Notes.

## Validation and Acceptance


All seven natural classes and all 35 supported spellings must match independently written expected values. C-sharp/D-flat both map to 1; E-sharp/F to 5; C-double-sharp/D to 2. Boundary examples: C-flat=11, B-sharp=0, C-double-flat=10, B-double-sharp=1. Conversion must not mutate a frozen input. Numeric transposition after conversion must wrap correctly for positive and negative offsets. TypeScript must reject invalid letters, accidentals, and missing fields. All prior pitch-class tests, npm test, npm run typecheck, and diff whitespace checks must pass. Check domain imports directly; no product UI or build check is required for this isolated domain addition.

## Idempotence and Recovery


Tests and type checks may be rerun safely. Changes are additive and require no migrations or external actions. On partial failure, inspect the failing output and current work before applying a focused repair. Preserve unrelated user changes; do not reset the working tree. Resume from the recorded progress and verified files.

## Artifacts and Notes


Initial status was clean. `npm run typecheck` exited 0, including the negative type assertions, on 2026-10-07. On 2026-10-07T07:31:49Z, `npm test` outside the sandbox passed 3 test files and 69 tests. Two earlier sandboxed runs failed at module loading with ENOENT in the temporary cache, not a domain assertion failure. Tracked diff whitespace checks and direct new-file whitespace/conflict checks passed. Final review found only the intended six files changed or added: README, architecture, decisions, spelling module, spelling tests, and this plan. Existing pitch-class code/tests and package manifests have no diff.

## Interfaces and Dependencies


NoteLetter is the union of uppercase letters A through G. Accidental is the union -2|-1|0|1|2, meaning double flat, flat, natural, sharp, and double sharp. NoteSpelling is Readonly<{ letter: NoteLetter; accidental: Accidental }>. pitchClassFromSpelling accepts NoteSpelling and returns existing PitchClass; it loses spelling information in the returned number and does not mutate the input. Its only runtime dependency is transposePitchClass from the sibling domain module using an ESM .js import. These types describe supported typed inputs, not validation of arbitrary JavaScript values. No constructor, parser, formatter, reverse conversion, or barrel module is needed.

Revision note: 2026-10-07, created from the user's approved implementation plan before source edits.

Revision note: 2026-10-07, recorded implementation milestones and actual test/typecheck results, including the sandbox cache limitation.

Revision note: 2026-10-07, completed final review and recorded acceptance evidence and remaining environment limitation.
