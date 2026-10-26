# Bass, inversion, and voicing analysis against a known chord


This living ExecPlan follows [.agent/PLANS.md](../.agent/PLANS.md).

## Purpose / Big Picture


Implement approved Music Theory milestone 5: inspect supplied registered voicings against existing chord descriptions. Report bass, conventional tertian inversion, coverage, doubling, omissions, specified-bass agreement and spacing without identifying harmony, generating voicings or applying instrument policies. Demonstrate behavior through deterministic tests; no UI is required.

## Progress


- [x] 2026-10-26T10:06:00Z: Rechecked clean Git status and read the complete ExecPlan protocol, current descriptions/realization/register APIs, relevant architecture, D049-D051 and reference definitions. User explicitly authorized implementation of the approved plan.
- [x] 2026-10-26T10:10:44Z: Implemented numeric and spelled analysis with explicit omission policy and evidence-preserving outputs.
- [x] 2026-10-26T10:10:44Z: Verified 221 new tests, focused regression (5,130 tests in five suites), type checks and full regression (16,789 tests in 32 suites).
- [x] 2026-10-26T10:10:44Z: Updated README, Architecture and accepted D052; directly reviewed new source, tests and plan, plus tracked documentation diffs. Final whitespace/link/status checks recorded below.

## Surprises & Discoveries


Existing voicing factories validate/copy nonempty supplied arrays without sorting. Registered coordinates and distances are safe integers; safe endpoints do not guarantee a representable span. Description tone resolvers preserve formula order and compound roles. Numeric resolution of spelled descriptions does not require representable derived spellings. The first sandbox test run failed before analysis assertions on the known temporary SSR cache ENOENT; the identical command passed outside the sandbox. Initial type checking exposed lost type inference from passing Object.freeze directly to map in a test fixture; explicit callbacks fixed it without changing production behavior.

## Decision Log


2026-10-26, user-approved plan: default every formula position to required; optionalFormulaIndices explicitly permits omissions without changing identity. Numeric analysis matches pitch classes; spelled analysis matches exact letter/accidental independently of octave. Report measurements rather than close/open labels. Conventional inversions cover exactly 1/3/5 or 1/3/5/7 structures with unaltered role 1, regardless of catalog membership or formula order; coverage is independent of inversion.

2026-10-26, implementation detail: results distinguish all unmatched tones from unexpected tones. Only lowest unmatched occurrences matching the specified bass are allowed specified-bass occurrences; upper non-chord repetitions remain unexpected. Matching evidence is many-to-many and does not allocate occurrences between equivalent roles. Inversion status precedence is unsupported structure, no matching bass role (non-chord bass), multiple roles or partly unmatched tied bass (ambiguous), then classified. Doubling includes every repeated supplied identity, even non-chord tones, and retains source indices.

## Outcomes & Retrospective


Milestone 5 is implemented and acceptance passes. Two public analysis functions compose existing identity and registered-voicing records without changing prior APIs or dependencies. Results preserve ambiguity and source indices rather than invent role assignments, enharmonic spellings or instrument-dependent omission policies. The focused suite, full regression and type checks pass. Documentation records D052. No identification, generation, close/open labels, Fretboard or Playability behavior was introduced. Changes remain uncommitted.

## Context and Orientation


The portable engine lives in domain/music-theory. In chords-symbols-and-realization/, chord-descriptions.ts owns numeric/spelled root, formula and optional unregistered specified bass (D049); registered-chords.ts owns explicit RegisteredPitchVoicing/RegisteredNoteVoicing records and their validating factories (D051). chord-formulas.ts validates nonempty roles with positive safe-integer numbers and alterations in -3..3. pitch-pitch-classes-and-spelling/registered-pitch.ts owns C0=0 coordinates, registered-note conversion and safe semitoneDistance. The reference distinguishes actual lowest sounding bass from specified bass, identity from voicing, and music from fingering. Existing APIs remain unchanged.

## Plan of Work


First add chord-voicing-analysis.ts in the existing chord folder. Implement numeric analysis through description tone resolution, copied validated voicings, optional-index validation, stable sounding order and shared evidence aggregation. Verify an unsorted C-major inversion, omissions and spacing.

Next add exact spelled analysis using existing spelled-tone resolution and coordinate conversion, sharing aggregation through private identity keys rather than a general matching framework. Preserve enharmonic mismatches, tied bass evidence and ambiguous roles. Verify numerical/spelled divergence and compound/duplicate role coverage.

Then add tests/chord-voicing-analysis.test.ts with independent expected results for catalog inversions, custom formulas, malformed inputs, arithmetic boundaries, ownership, compile-time contracts and integration from symbols, harmonization and realization. Update README.md, docs/ARCHITECTURE.md and docs/DECISIONS.md to record the delivered contract, not instrument or future identification policies. Run focused tests, type checks and full regression; review all new files and diffs.

## Concrete Steps


From C:/Users/simoa/Documents/fretbo-AI-rd after implementation, run existing commands:

    npm test -- tests/chord-voicing-analysis.test.ts tests/registered-chords.test.ts tests/chord-descriptions.test.ts tests/chord-formulas.test.ts tests/registered-pitch.test.ts
    npm run typecheck
    npm test
    git diff --check
    git status --short

Use Node 24.x/npm as configured. Expect passing assertions and type checks, and no whitespace diagnostics. Record actual observations separately. If sandbox Vitest fails before assertions on its known SSR cache ENOENT, rerun the identical command outside the sandbox when permitted without changing tooling.

## Validation and Acceptance


E3-C4-G4-C5 against C major is first inversion, complete and root-doubled. Incomplete C7 retains bass-derived inversion and reports required versus optional omissions. C/F-sharp allows the specified non-chord lowest occurrence without adding it to formula coverage; an upper F-sharp stays unexpected. Exact spelled matching distinguishes B-sharp/C and B-double-flat/A while numeric matching accepts enharmonics. Every named tertian quality and bass role, reordered formulas/upper notes, unnamed structural formulas, suspended/extended exclusions, collisions, repeated/compound roles, tied bass, exact unisons, negative coordinates, singleton spacing and unsafe spans receive tests. Invalid formulas/options/indices/voicings throw RangeError; well-formed musical mismatches return evidence. Frozen inputs and readonly copied outputs are checked. Symbols, harmonization and root-position realization compose into analysis.

## Idempotence and Recovery


Checks can be repeated. Preserve unrelated user changes; never reset historical work. After failures, correct only this effort and record partial progress. No dependencies, migration, commit, publishing or external mutation are needed.

## Artifacts and Notes


Initial sandbox focused tests failed on temporary SSR-cache ENOENT before analysis assertions. The identical command passed outside the sandbox. After completing extra exact-spelling coverage and fixing test-only type inference, final focused regression passed 5,130 tests in five suites; npm run typecheck passed; full npm test passed 16,789 tests in 32 suites (221 new tests). Git diff --check passed. New source, tests and plan were read directly; tracked documentation diffs were reviewed. No existing production source or test files changed. Final review confirmed whitespace clean across all six changed/new files, all 126 local documentation targets and new relative import targets exist, and Git status contains only the intended three documentation edits and three new files. No new reverse domain imports or dependencies were introduced.

## Interfaces and Dependencies


Export analyzeRegisteredPitchVoicing(description: PitchClassChordDescription | SpelledChordDescription, voicing: RegisteredPitchVoicing, options?: ChordVoicingAnalysisOptions) and analyzeRegisteredNoteVoicing(description: SpelledChordDescription, voicing: RegisteredNoteVoicing, options?: ChordVoicingAnalysisOptions). Options expose readonly optionalFormulaIndices. Public readonly result types expose bass coordinate/class/tied indices/matching roles/unmatched bass indices, specified-bass status, per-position coverage, required/optional omissions, unmatched/unexpected/allowed-bass indices, identity doubling, inversion status and stable spacing measurements. Numeric doubling exposes pitchClass; spelled doubling additionally exposes exact spelling. All outputs are independent and unfrozen. Import existing portable domain modules directly with .js specifiers, without reverse dependencies or new packages.

Revision note: 2026-10-26, created before implementation from the approved plan; updated after acceptance to record actual results and completed work.
