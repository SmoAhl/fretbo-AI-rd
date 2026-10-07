# Add registered pitches to Music Theory


This ExecPlan follows [.agent/PLANS.md](../.agent/PLANS.md) and implements the user-approved registered-pitch contract.

## Purpose / Big Picture


Distinguish octave-specific sounding pitches such as E2 and E4, convert structured spelled notes to numeric pitches, transpose without octave wrapping, and extract pitch classes. Use integer semitone coordinates with C0 = 0. Tests demonstrate this domain foundation without UI or AI. Parsing, formatting, reverse spelling selection, spelled transposition, scales, chords, and fretboard implementation remain outside scope.

## Progress


- [x] 2026-10-07T07:57:24Z: Inspected clean Git status, instructions, planning protocol, architecture, decisions, relevant Music Theory Reference sections, existing domain modules, and NodeNext test checking.
- [x] 2026-10-07T08:00:39Z: Implemented the three registered-pitch functions using only sibling domain capabilities.
- [x] 2026-10-07T08:00:39Z: Added explicit register/spelling tables, enharmonic and transposition cases, safe-integer boundary coverage, frozen-input checks, and negative type assertions.
- [x] 2026-10-07T08:00:39Z: Recorded D021 and updated architecture and README status. Passed strict type checking and all 189 tests outside the sandbox.
- [x] 2026-10-07T08:01:19Z: Reviewed tracked diffs and all three new files, passed whitespace/conflict checks, confirmed domain-only imports, and verified existing APIs/tests and dependencies have no diff.

## Surprises & Discoveries


The existing spelling conversion supplies the natural letter's class when passed accidental 0; existing transposition normalizes a registered coordinate to a pitch class. The largest safe C-based octave is 750599937895082, whose base is 9007199254740984. At that octave, A-double-flat yields MAX_SAFE_INTEGER when the letter displacement and accidental are grouped first. At the next negative octave, a B natural would mathematically yield a safe final value, but the approved contract rejects its unsafe C-based octave base.

The sandbox-specific Vitest temporary-cache failure recorded in the prior spelling plan recurred: the spelling and register suites could not load the shared pitch-class module due to ENOENT. The same npm test command outside the sandbox passed all 189 tests without source or configuration changes. Type checking passed inside the sandbox.

## Decision Log


2026-10-07, user: approve numeric RegisteredPitch coordinates with C0 = 0 and negative pitches/octaves, plus readonly RegisteredNote extending existing NoteSpelling with required octave. Do not introduce branding, constructors, or new dependencies.

2026-10-07, user: validate numeric inputs and results as safe integers. For note conversion, require the octave's C-based twelve-semitone coordinate to be safe even when an accidental could bring the final mathematical value into range. Group naturalClass + accidental before adding the octave base to avoid invalid intermediate rounding. Invalid numeric values or overflow throw RangeError. Letter/accidental validity retains the existing typed-input contract.

## Outcomes & Retrospective


The registered-pitch capability is implemented. All behavior and type-contract checks pass, with full-suite execution outside the sandbox required because of the recurring temporary-cache limitation. Conversion preserves written octave semantics before returning a sounding number; registered transposition retains octave distance, and class extraction discards it deliberately. Final file review passed. No deferred capabilities or new dependencies were added.

## Context and Orientation


One private Next.js/TypeScript package contains portable domain modules independent of React, Next.js, Node APIs, UI, and AI. `domain/music-theory/pitch-class.ts` exports PitchClass (numeric 0..11) and signed safe-integer transposePitchClass. `domain/music-theory/note-spelling.ts` exports uppercase NoteLetter A through G, Accidental -2|-1|0|1|2, readonly NoteSpelling with required letter/accidental, and pitchClassFromSpelling. D020 in `docs/DECISIONS.md` establishes C = 0 and one-way explicit spelling conversion.

The Pitch, pitch classes, and spelling and Intervals and transposition sections of `docs/MUSIC_THEORY_REFERENCE.md` distinguish pitch class from register: octave numbers change at the natural B-C boundary, and accidentals retain the written letter's octave. Thus B-sharp3 sounds as C4. A wrapped spelling class cannot be used directly as a registered displacement. `docs/ARCHITECTURE.md` owns implementation status, `docs/DECISIONS.md` owns accepted persistent conventions, and README summarizes capabilities. Historical plans do not authorize more scope.

## Plan of Work


Milestone 1 adds `domain/music-theory/registered-pitch.ts` with the exact approved types and three functions. Convert using 12 * octave plus the natural letter class and signed accidental without wrapping. Validate octave, octave base, and final coordinate; transpose by ordinary checked addition; extract class through transposePitchClass(0, pitch). Inspect imports and types to verify portability and compatibility.

Milestone 2 adds `tests/registered-pitch.test.ts` with explicit expected values for all 35 spellings at octave 0, natural letters at negative/zero/positive octaves, cross-octave enharmonics, transposition, extraction, frozen-input preservation, negative type assertions, invalid numeric inputs, and safe-integer boundaries. Verify behavior with npm test and the type contract with npm run typecheck.

Milestone 3 records a persistent C0-based register decision and updates architecture and README without implying deferred features exist. Review tracked diffs and new files, whitespace, conflicts, dependencies, and Git status. Complete this plan with actual evidence and remaining limitations.

## Concrete Steps


Run all commands from `C:\Users\simoa\Documents\fretbo-AI-rd`. Existing Node.js 24.x and installed npm dependencies are prerequisites; no installation is planned. Inspect status with `git -c safe.directory=C:/Users/simoa/Documents/fretbo-AI-rd status --short`. Add the module and tests, update documentation, then run `npm test` and `npm run typecheck`; expect exit 0 with all prior and new tests passing. If a sandbox cache failure recurs, verify npm test outside the sandbox and preserve the diagnostic evidence. Run `git -c safe.directory=C:/Users/simoa/Documents/fretbo-AI-rd diff --check`; expect no whitespace diagnostics. Inspect tracked diffs and all new files directly because unstaged diff excludes untracked files. Record actual outcomes separately below.

## Validation and Acceptance


C0=0, C4=48, C5=60, C-1=-12. All natural letters must retain octave distance, and all 35 letter/accidental combinations at octave 0 must match explicit coordinates including C-flat=-1 and B-sharp=12. Check B-sharp3=C4, C-flat4=B3, B-double-sharp3=C-sharp4, and C-double-flat4=B-flat3. Transposition supports zero, positive/negative offsets, octave crossings, and safe-integer limits without wrapping. Extraction returns normalized 0..11 even for negative coordinates and E2/E4 both produce class 4. Frozen inputs remain unchanged. Compile-time checks reject missing octave. Fractions, NaN, infinities, unsafe integers, unsafe octave bases, and unsafe results throw RangeError. The complete suite, strict TypeScript checks, and diff review must pass; existing APIs/tests and dependencies remain unchanged.

## Idempotence and Recovery


Tests and checks can be repeated safely. There are no migrations or external state changes. On failure, inspect evidence and apply a focused repair, preserving user changes and avoiding Git reset or cleanup. Resume from verified file state and update this plan. Sandbox cache recovery changes execution context rather than musical behavior.

## Artifacts and Notes


Initial working tree was clean. `npm run typecheck` exited 0 on 2026-10-07, including negative type assertions. At 2026-10-07T08:00:39Z, `npm test` outside the sandbox passed 4 files and 189 tests (120 new register tests plus 69 existing tests). The initial sandboxed suite failed at shared module loading with an ENOENT temporary-cache error; it did not report a domain assertion failure. Tracked diff whitespace checks and direct new-file whitespace/conflict checks passed. Final review confirmed only the intended six files changed or added: README, architecture, decisions, registered-pitch module, registered-pitch tests, and this plan. Existing pitch-class/spelling modules, their tests, and package manifests have no diff. Imports remain confined to sibling domain modules.

## Interfaces and Dependencies


RegisteredPitch is a number alias meaning a safe-integer coordinate validated by each function. RegisteredNote is NoteSpelling & Readonly<{ octave: number }>. registeredPitchFromNote(note): RegisteredPitch accepts structured spelling plus octave. transposeRegisteredPitch(pitch, semitones): RegisteredPitch adds a signed offset. pitchClassFromRegisteredPitch(pitch): PitchClass discards register. All invalid numeric inputs/arithmetic throw RangeError; structural external-data validation is not added. The new module imports only sibling domain functions/types with .js ESM specifiers. No new tooling or runtime-specific dependencies are needed.

Revision note: 2026-10-07, created from the approved plan before implementation.

Revision note: 2026-10-07, recorded implemented milestones, actual test/typecheck results, and the recurring sandbox execution limitation.

Revision note: 2026-10-07, completed file review and recorded final acceptance evidence.
