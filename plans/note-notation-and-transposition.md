# Establish note text, reverse spelling, and spelled transposition


This living ExecPlan follows [.agent/PLANS.md](../.agent/PLANS.md). It carries the full user-requested effort; the pending policy choices below do not reduce its scope.

## Purpose / Big Picture


Make all four requested domain capabilities usable and deterministic: parse note text into explicit spelling/register, format a supplied spelling, select spelling from numeric pitches under an explicit policy, and transpose by a musical interval while deriving the correct letter/accidental. Preserve the existing numeric pitch and register capabilities. Scales, chords, fretboard mapping, UI, AI, and abstractions for hypothetical features are excluded. Success requires direct demonstrations of each capability plus passing npm test and npm run typecheck.

## Progress


- [x] 2026-10-07T08:22:21Z: Inspected clean working tree, instructions, complete planning protocol, existing domain modules, current references/decisions, and test configuration.
- [x] 2026-10-07T08:22:21Z: Baseline npm test passed 189 tests in four files; npm run typecheck exited 0. No sandbox cache failure occurred in this baseline.
- [x] 2026-10-07T08:28:06Z: User approved the proposed strict grammar, Unicode default/ASCII option, explicit sharp/flat policy, qualified/numbered intervals, and rejection of diminished unisons and results beyond double accidentals.
- [x] 2026-10-07T08:28:06Z: Implemented parsing and formatting with behavior/type coverage.
- [x] 2026-10-07T08:28:06Z: Implemented reverse selection for pitch classes and registered pitches with round-trip coverage.
- [x] 2026-10-07T08:28:06Z: Implemented spelled transposition for spellings and registered notes with interval and boundary coverage. First full outside-sandbox run exposed a signed-zero expectation in a test; corrected the assertion, with reverification pending.
- [x] 2026-10-07T08:31:45Z: Recorded D022/D023, updated architecture and README, passed 319 tests in seven files and strict type checking, reviewed every new source/test file and tracked documentation diff, and passed whitespace/conflict checks. Completion audit below proves all requested capabilities and acceptance requirements.

## Surprises & Discoveries


The first effort's acceptance examples focus on numeric wrapping, but the objective explicitly requires all four additional capabilities. Existing green numeric tests alone cannot prove completion. The reference distinguishes spelling from sounding pitch, defines letter-based octave boundaries, and intentionally does not select a parser grammar or canonical naming policy. Those software choices need explicit resolution.

The existing registered-note conversion requires a safe C-based octave coordinate as well as a safe final coordinate. Reverse conversion must respect this restriction rather than returning an object rejected by registeredPitchFromNote. Formatting must preserve the supplied spelling; reverse selection is a separate operation.

The recurring sandbox temporary-cache ENOENT prevented several suites from loading. Outside-sandbox execution reached the assertions and exposed a test-only +0/-0 mismatch for zero displacement, which was corrected. Final outside-sandbox runs passed, including an added exact large compound interval at MAX_SAFE_INTEGER. No tooling configuration or domain behavior was changed to work around the sandbox.

## Decision Log


2026-10-07, user: establish parsing, formatting, reverse spelling selection, and spelled transposition without scales, chords, fretboard, UI, AI, or speculative abstractions. Surface unresolved architectural choices before dependent implementation.

2026-10-07, user: approve uppercase A-G, single ASCII/Unicode sharps/flats, ASCII doubles ##/bb and Unicode doubles 𝄪/𝄫, explicit natural ♮, outer-whitespace trimming, internal-space rejection, and signed decimal octaves in registered parsing. Formatting supports ascii/unicode, defaults to Unicode, omits a natural sign, and includes octave only in registered formatting. Lowercase, x, mixed/repeated accidentals outside the agreed tokens, and unrelated notation are unsupported.

2026-10-07, user: require an explicit sharps/flats reverse policy. Prefer natural notes and single accidentals for other classes; no key-aware inference.

2026-10-07, user: approve positive numbered intervals including compound intervals, perfect/major/minor/augmented/diminished quality, and explicit up/down direction. Reject diminished unisons and results outside -2..2 with RangeError. Other quality/number compatibility follows the reference's perfect and major families.

2026-10-07, implementation: malformed text raises SyntaxError; unsupported numeric ranges and interval/selection policy values raise RangeError. A registered reverse spelling must satisfy the existing safe-octave-base contract. Use portable BigInt intermediates in reverse selection and diatonic/interval arithmetic to retain exactness at numerical boundaries, with no dependency or existing API changes.

## Outcomes & Retrospective


All four requested capabilities are implemented and verified against the complete objective. Text operations preserve explicit spelling, reverse selection requires the agreed policy, and interval transposition keeps letter and chromatic displacement separate. Every prior test passes. Existing domain APIs and dependencies are unchanged. Final source, documentation, and whitespace review passed. Known limits are the explicitly agreed grammar/interval/accidental policies and existing safe-octave-base arithmetic restriction; the test runner required outside-sandbox execution because of its recurring temporary-cache failure. No out-of-scope capability was introduced.

## Context and Orientation


The repository is one private Next.js/TypeScript package, with native ESM domain modules using .js import specifiers and NodeNext test checking. `domain/music-theory/pitch-class.ts` exports PitchClass 0..11 and signed safe-integer transposition. `domain/music-theory/note-spelling.ts` exports uppercase NoteLetter A through G, Accidental -2|-1|0|1|2, readonly required letter/accidental, and one-way conversion. `domain/music-theory/registered-pitch.ts` adds RegisteredPitch (number), RegisteredNote (NoteSpelling plus required octave), conversion with C0 = 0, registered semitone transposition, and pitch-class extraction. D020 and D021 record these accepted conventions. Preserve those contracts unless a specifically agreed change is necessary.

`docs/MUSIC_THEORY_REFERENCE.md` sections Pitch, pitch classes, and spelling and Intervals and transposition supply the relevant domain knowledge. B-sharp3 and C4 identify the same sounding pitch but have different spellings. Interval number determines letter displacement; quality determines chromatic displacement. Thus C up an augmented unison becomes C-sharp while C up a minor second becomes D-flat. A semitone count alone cannot choose spelling. Domain modules must remain independent of React, Next.js, Node APIs, UI, and AI. Existing TypeScript target ES2022 supports portable JavaScript arithmetic if exact integer intermediates are needed.

## Plan of Work


Milestone 1 settled the consequential contracts through explicit user answers recorded above, including the diminished-unison edge case. The effort is implementation-ready. Record new discovered consequences without silently introducing alternate naming or syntax policies.

Milestone 2 establishes text parsing and formatting. Parse separate spelling and registered-note forms into the existing structured types, with errors for malformed syntax and unsupported numerical values. Format supplied spellings without respelling, and support an agreed ASCII/Unicode policy. Verify representative accepted and rejected syntax and round trips for every supported accidental and letter.

Milestone 3 establishes reverse spelling selection for all 12 pitch classes and registered pitches using the agreed policy. Verify complete expected tables and conversion back to the source class/coordinate, including negative octaves and arithmetic boundaries. Do not infer key context or canonical musical roles.

Milestone 4 establishes spelled transposition using the agreed interval interface and the existing accidental range. Verify source/result letter relationship, exact semitone relationship, direction, octave boundaries, compound intervals where agreed, and explicit rejection of unsupported results. Both unregistered spelling and registered-note use cases are required. Existing numeric wrapping and register APIs remain available.

Milestone 5 updates architecture, README, and persistent accepted decisions. Audit the objective requirement by requirement against source and tests, execute the complete test and typecheck commands, inspect all changed/new files, and record actual results here. No partial milestone establishes overall completion.

## Concrete Steps


Working directory: `C:\Users\simoa\Documents\fretbo-AI-rd`. Existing Node.js 24.x and installed npm dependencies are prerequisites; no new dependencies or installation are planned. Before edits, inspect `git -c safe.directory=C:/Users/simoa/Documents/fretbo-AI-rd status --short`. Update this plan when policy answers arrive, then implement and verify each capability. Run `npm test` and `npm run typecheck` separately; expect the complete suite and strict checking to pass. Use outside-sandbox test execution if the previously recorded temporary-cache ENOENT recurs. Run `git -c safe.directory=C:/Users/simoa/Documents/fretbo-AI-rd diff --check`, review tracked diffs and newly created files directly, and inspect final status. Predictions are separate from actual results in Artifacts and Notes.

## Validation and Acceptance


Demonstrate C#4 parsing to a C-sharp structured registered note and formatting D-flat4 without changing its spelling. Verify every accidental supported by the agreed grammar and formatting modes, malformed input behavior, and numeric octave limits. Reverse selection must cover all 12 classes under every supported policy and preserve source pitches through conversion. Spelled transposition must distinguish augmented unison from minor second and support up/down cases, enharmonic spellings, register crossings, and intentional failures for unsupported intervals or accidentals. Test an end-to-end parse/transpose/format path. All prior numeric/transposition tests must keep passing. Inspect imports to prove no React, Next.js, Node API, or UI dependencies entered the domain. npm test and npm run typecheck must pass, along with final whitespace/conflict and file review.

## Idempotence and Recovery


Tests and checks are safely repeatable. No migrations, external writes, commits, or publishing are required. Preserve user edits and repair failures with focused changes rather than resetting the repository. Keep pending decisions distinguishable from implemented behavior. If execution stops, record partial progress and evidence here without claiming the full objective is complete.

## Artifacts and Notes


Initial Git status was clean. Baseline npm test passed 4 files / 189 tests; npm run typecheck exited 0 on 2026-10-07. A sandboxed test run failed at module loading with the recurring temporary-cache ENOENT. The first outside-sandbox run executed 318 tests, of which 317 passed; the sole failure expected -0 for a zero semitone displacement while the correct numeric result was +0. After correcting that assertion, all 318 passed. After adding the exact large-compound-interval regression, final npm test outside the sandbox passed 7 files / 319 tests at 2026-10-07T08:30:50Z, and final npm run typecheck exited 0. This adds 130 named tests to the baseline, with further exhaustive round-trip/displacement assertions within individual tests.

Completion audit at 2026-10-07T08:31:45Z:

| Requirement | Authoritative evidence |
| --- | --- |
| Text parsing and malformed-input errors | note-text.ts parsers; note-text.test.ts accepted tokens, C#4 structured result, invalid syntax and numeric range cases |
| Formatting preserves spelling | note-text.ts formatters; D-flat4/B-sharp3 examples, all 35 spellings round-tripped in both notations and three octaves, frozen-input checks |
| Reverse spelling from class and register | spelling-selection.ts required policy; spelling-selection.test.ts explicit tables for all twelve classes under both policies, registered round trips for -25..59, numerical-boundary and policy type checks |
| Interval-derived spelled transposition | spelled-transposition.ts number/quality/direction algorithm; spelled-transposition.test.ts augmented-unison/minor-second distinction, 35 explicit interval examples, down cases, all-natural-letter displacement/reversibility, compound and numerical limits, triple-accidental and diminished-unison failures |
| All twelve classes, octave wrapping, positive/negative transposition | Existing pitch-class.test.ts and registered-pitch.test.ts remain unchanged and pass; spelled transposition tests additionally compare both-direction class displacement |
| Portable domain and scope boundaries | Direct review of all domain import statements found only sibling domain modules; no React, Next.js, Node API, UI, AI, scales, chords, fretboard, new dependency, or generic future-feature infrastructure was added |
| npm test and npm run typecheck | Final 319-test result and typecheck exit 0 above, including negative compile-time contract assertions |
| Documentation and file review | D022/D023 record explicitly accepted policies; architecture/README describe verified behavior. Tracked diff --check and all seven new-file whitespace/conflict checks passed. Existing three domain modules/tests and package manifests have no diff |

Final status contains only intended README, architecture, and decision modifications, three new domain modules, three new test files, and this ExecPlan. No commits or external publications were performed.

## Interfaces and Dependencies


Existing PitchClass, NoteLetter, Accidental, NoteSpelling, RegisteredPitch, and RegisteredNote remain unchanged. `domain/music-theory/note-text.ts` exports parseNoteSpelling(text: string): NoteSpelling, parseRegisteredNote(text: string): RegisteredNote, formatNoteSpelling(note, notation = "unicode"): string, and formatRegisteredNote(note, notation = "unicode"): string; AccidentalNotation is "ascii"|"unicode". Registered parsing/formatting validates through existing conversion. Accepted octave text uses optional ASCII +/- followed by decimal digits; leading zeroes are accepted and formatting normalizes the numeric representation. Naturals format without an accidental token.

`domain/music-theory/spelling-selection.ts` exports SpellingPolicy = "sharps"|"flats", spellingFromPitchClass(pitchClass: PitchClass, policy): NoteSpelling, and noteFromRegisteredPitch(pitch: RegisteredPitch, policy): RegisteredNote. Policies have no default. Each call returns an independent structured object; registered output must convert back to the source coordinate or throw for an unsupported octave base.

`domain/music-theory/spelled-transposition.ts` exports IntervalQuality = "perfect"|"major"|"minor"|"augmented"|"diminished", IntervalDirection = "up"|"down", readonly SpelledInterval with required number/quality/direction, transposeNoteSpelling(note, interval): NoteSpelling, and transposeRegisteredNote(note, interval): RegisteredNote. Interval number is a positive safe integer and the derived semitone magnitude must be safe; perfect quality applies to simple 1/4/5 families, major/minor to 2/3/6/7 families, and augmented/diminished to either except diminished unison. Registered output preserves written register, unregistered output discards octave distance, both preserve the input and reject unsupported derived accidentals rather than respelling. Use only sibling domain modules and portable JavaScript. No parser for interval text, new dependencies, framework imports, services, or future-feature infrastructure is introduced.

Revision note: 2026-10-07, created after baseline inspection and verification while awaiting consequential policy answers.

Revision note: 2026-10-07, recorded accepted policies, exact interfaces, implementation milestones, and initial verification evidence.

Revision note: 2026-10-07, completed documentation, final verification and requirement-by-requirement audit, retaining the sandbox limitation and agreed contract boundaries.
