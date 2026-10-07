# Architecture

## Purpose and status

FretboAIrd is an interactive guitar fretboard and music-theory application with a deterministic domain foundation and later optional AI assistance. The same system supports general fretboard exploration and guitar-based composition and arrangement. The musician supplies creative direction; the system helps inspect, understand, transform, and realize musical ideas.

FretboAIrd models a discrete fretboard and produces chord fingerings that are musically correct, available on that fretboard, and practically sensible. It does not simulate a guitar or a human hand.

This document separates architectural boundaries, implementation facts, current direction, and open questions. Current instructions and accepted decisions govern where historical plans differ. Domain references contain the knowledge needed to derive answers, rather than every derivable answer or earlier investigation history.

## Current implementation

The repository contains the working documents plus a minimal Next.js App Router application. `app/layout.tsx` provides the root layout and metadata, `app/page.tsx` is a deliberately generic bootstrap page, and `app/globals.css` imports the configured Tailwind CSS and shadcn/ui styles. `next.config.ts`, `postcss.config.mjs`, `components.json`, and `lib/utils.ts` provide the framework and UI foundation; no shadcn components have been added yet.

`package.json` and `package-lock.json` define one private npm-managed package. `npm run typecheck` runs Next.js type generation and strict TypeScript checks for the application and NodeNext checks for the test configuration. `vitest.config.ts` configures a Node test environment, and `tests/bootstrap.test.ts` verifies that the test runtime works without a DOM. `npm run dev`, `npm run build`, and `npm run start` provide the Next.js lifecycle commands. `.nvmrc` and the package engine target Node.js 24 LTS.

`domain/music-theory/pitch-class.ts` provides the first minimal Music Theory capability: `PitchClass` represents numeric classes `0..11`, and `transposePitchClass` transposes a typed pitch class by a signed safe-integer semitone offset, wrapping into `0..11`. Unsupported offsets throw `RangeError`. Reducing the offset before addition preserves precision at the safe-integer limits. The module has no imports or framework, Node API, or UI dependencies. `tests/pitch-class.test.ts` covers all twelve classes, octave equivalence, positive and negative wrapping, large offsets, and invalid offsets. The project's named origin is now C = 0; a numeric class still carries no spelling or register.

`domain/music-theory/note-spelling.ts` exports `NoteLetter` (uppercase A through G), `Accidental` (-2 through 2 for double flat through double sharp), and readonly `NoteSpelling` with required `letter` and `accidental` fields. `pitchClassFromSpelling` maps natural letters to C=0, D=2, E=4, F=5, G=7, A=9, B=11 and reuses numeric transposition for the accidental. Conversion loses spelling information in its numeric result and does not mutate the input. The only dependency is the sibling pitch-class module. This is a typed-input contract, not validation of arbitrary JavaScript or external data. `tests/note-spelling.test.ts` checks all 35 supported spellings, enharmonic equivalence, wrapping, frozen inputs, composition with numeric transposition, and compile-time rejection of unsupported inputs. See [D020](DECISIONS.md#d020-c-based-pitch-classes-and-explicit-note-spelling).

`domain/music-theory/registered-pitch.ts` exports numeric `RegisteredPitch` semitone coordinates with C0 = 0 and readonly `RegisteredNote` spellings with a required written `octave`. `registeredPitchFromNote` adds the signed accidental to the natural letter's registered coordinate without wrapping; B-sharp3 and C4 both produce 48. Conversion preserves the input but loses spelling in the result. `transposeRegisteredPitch` adds signed semitones without discarding octave distance. `pitchClassFromRegisteredPitch` discards register using existing pitch-class transposition. Each function validates its numeric inputs and results as safe integers and throws `RangeError` for invalid values or overflow. Note conversion also requires a safe twelve-semitone octave base; letter and accidental validity retains the typed-input contract. Negative coordinates and octaves are supported. The module depends only on sibling domain capabilities. `tests/registered-pitch.test.ts` covers note/register conversion, octave boundaries, enharmonics, transposition, extraction, frozen inputs, type contracts, and numeric limits. See [D021](DECISIONS.md#d021-registered-pitch-coordinates-with-c0-as-origin).

`domain/music-theory/note-text.ts` provides `parseNoteSpelling`, `parseRegisteredNote`, `formatNoteSpelling`, and `formatRegisteredNote`. Parsing accepts uppercase A-G with an optional accidental token: #/♯, b/♭, ##/𝄪, bb/𝄫, or ♮. It trims outer whitespace and rejects internal spaces, lowercase letters, x, mixed accidentals, and repeated Unicode accidentals. Spelling parsing rejects octaves; registered parsing requires a signed decimal integer octave (ASCII +/- optional, leading zeroes accepted). Malformed syntax throws `SyntaxError`; numerical limits use existing registered-note validation and throw `RangeError`. Formatting preserves the supplied spelling and written octave, supports `AccidentalNotation` ascii/unicode with Unicode default, omits a natural token, and normalizes numeric octave text. Only registered formatting includes an octave.

`domain/music-theory/spelling-selection.ts` provides `spellingFromPitchClass` and `noteFromRegisteredPitch` with a required `SpellingPolicy` sharps/flats. Both prefer natural spellings and single accidentals for other classes; they do not infer key context. Selection returns independent objects that convert back to the source numeric value. Registered selection uses exact portable BigInt intermediates and rejects coordinates whose selected spelling would violate the existing safe-octave-base contract, including the extreme lower registered-coordinate limit.

`domain/music-theory/spelled-transposition.ts` provides `transposeNoteSpelling` and `transposeRegisteredNote` using readonly `SpelledInterval` with required positive safe-integer `number`, `quality` (perfect/major/minor/augmented/diminished), and `direction` (up/down). Simple 1/4/5 families accept perfect quality; 2/3/6/7 accept major/minor; augmented/diminished apply to either family except diminished unison, which is rejected. Compound intervals retain their octave displacement for registered notes. Letter displacement and semitone displacement determine the result separately, distinguishing C up an augmented unison (C-sharp) from a minor second (D-flat). Exact BigInt intermediates preserve numerical boundaries; semitone displacements and resulting registered coordinates must remain safe. Incompatible interval qualities, diminished unisons, numerical overflow, unsafe octave bases, and results requiring accidentals outside -2..2 throw `RangeError` rather than silently respelling. Input objects are preserved. Unregistered output discards register. No interval text parser is implemented.

`tests/note-text.test.ts`, `tests/spelling-selection.test.ts`, and `tests/spelled-transposition.test.ts` verify text grammar/errors, ASCII/Unicode round trips, all twelve classes under both selection policies, negative register, qualified intervals in both directions, compound intervals, numerical boundaries, type contracts, and a parse-transpose-format path. These modules import only sibling domain capabilities. See [D022](DECISIONS.md#d022-note-text-and-explicit-reverse-spelling-policy) and [D023](DECISIONS.md#d023-spelled-transposition-by-qualified-intervals).

No other domain capabilities, React product controls, SVG fretboard visualization, server APIs, persistence, audio, or AI integration exist yet. The [original Playability Reference plan](../plans/playability-reference.md) is historical documentation context. The [current reference refactoring](../plans/domain-reference-simplification.md) changes guidance, not engine behavior. The components below describe responsibilities that later implementation must preserve.

## Accepted technology foundation

Next.js is the selected full-stack application framework, React is the UI library, and TypeScript 7.x is the implementation language. The intended generic UI stack is shadcn/ui with Base UI primitives where applicable and Tailwind CSS for styling. The custom fretboard visualization uses React and SVG. These choices support the existing domain-first architecture; they do not change its construction order.

The development, tooling, and test baseline is Node.js 24 LTS with native ESM conventions and NodeNext semantics. TypeScript checking is strict, including `strict`, `noUncheckedIndexedAccess`, and `exactOptionalPropertyTypes`. npm manages dependencies. Vitest 5.x runs behavioral tests in a Node environment, separately from TypeScript checking. Any Vite dependency required by Vitest serves test tooling; Next.js owns the application-framework role. No particular Vite version is an architectural decision.

The initial organization is one repository and one private Next.js application package containing framework-independent domain modules. No monorepo, separate backend service, or placeholder package boundaries are needed. Exact configuration, source layout, and compatible dependency releases will be verified during authorized setup. Choosing this stack does not select a hosting environment or require server capabilities before they are needed.

The accepted decisions and rationale are recorded in [DECISIONS.md](DECISIONS.md#d009-typescript-and-strict-contract-checking). The implementation status above remains authoritative for what actually exists.

## Components and boundaries

| Responsibility | Owns | Does not own |
| --- | --- | --- |
| Domain concepts | Shared musical and fretboard concepts needed by supported capabilities. | A speculative type system for future features. |
| Music Theory Engine | Musical identity and deterministic pitch, interval, scale, degree, and chord calculations; see [Music Theory Reference](MUSIC_THEORY_REFERENCE.md). | Fretboard locations or finger assignments. |
| Fretboard Engine | Discrete strings, registered tuning, frets, and pitch-location mapping; see [Fretboard Reference](FRETBOARD_REFERENCE.md). | Chord fingering validation or instrument geometry. |
| Playability capabilities | Chord contact and finger-assignment checks, shared grip constraints, and practical ranking of valid fingerings; see [Playability Reference](PLAYABILITY_REFERENCE.md). | Musical identity or silently changing a requested voicing. |
| Application boundary (Next.js) | Application operations and connections to the domain; server execution when needed. | Domain rules or making framework features prerequisites for domain testing. |
| UI and interaction (React) | Fretboard controls, selection, display, composition interaction, and later AI interaction. | Duplicating domain calculations; state ownership remains open. |
| Generic controls and styling (shadcn/ui, Base UI, Tailwind CSS) | Reusable accessible controls and presentation. | Musical semantics or the custom fretboard's domain rules. |
| Custom fretboard visualization (React + SVG) | Rendering strings, frets, markers, labels, and regions; capturing interaction. | Calculating musical content, note locations, or chord usability. |
| Later agent and tool integration | Interpreting intent and invoking the same domain capabilities. | Replacing deterministic calculations or fingering checks. |
| Later audio and evaluation | Making results audible and measuring behavior for review. | Replacing domain validation. |

References provide domain knowledge, not a list of implemented capabilities. These are logical responsibilities within the initial single application package. They do not mandate separate services, packages, or classes. In particular, the exact division of voicing candidate generation between Fretboard and Playability has not been decided. Describing how to assess a proposed realization in the Playability Reference does not assign ownership of enumerating or selecting candidates.

shadcn/ui supplies customizable generic controls, using Base UI for accessible interaction behavior where applicable. Tailwind CSS styles the application. These technologies support the product's own visual identity without defining its musical concepts. Add reusable visual tokens or further design-system abstractions only when concrete repetition justifies them.

The fretboard is a custom product interaction, not a generic shadcn/ui or Base UI control. Its presentation flow is:

```text
Deterministic domain
-> application state / operations
-> React fretboard visualization
-> SVG strings, frets, and note markers
```

For example, selecting D and minor initiates an application/domain operation: Music Theory determines the musical content, Fretboard determines its locations, and React + SVG renders those results. Clicking an SVG marker can initiate another application operation; the SVG element does not decide the note's musical meaning. Responsive geometry and pointer handling belong to presentation, while musical mapping remains in the domain.

## Runtime paths

The standalone application must support the direct path without AI:

```text
User
-> application controls / clickable fretboard
-> deterministic engines
-> UI / feedback
```

The later AI-assisted path uses those same underlying capabilities:

```text
User
-> AI agent
-> deterministic engines
-> UI / feedback
```

These diagrams show logical runtime interactions, not implementation order or deployment boundaries. They do not require every request to run every engine. A request to display note locations and a request for a playable chord realization need different checks. Feedback in the first application does not imply that audio is already implemented.

## Dependency direction and domain rules

Application, UI-facing, and agent-facing integrations consume the deterministic domain capabilities. Domain calculations and validations must remain usable and testable independently of React, Next.js, UI component libraries, CSS, routing, Server Components, Route Handlers, server actions, AI providers, renderers, and deployment infrastructure. Framework and presentation details belong at their integration boundaries rather than defining musical semantics.

Node-specific APIs should remain outside portable domain calculations unless a concrete domain requirement justifies them. Running domain tests under Node does not justify coupling the domain to filesystem, process, or network APIs. The domain remains independently testable both before and after connection to the Next.js application.

Music Theory determines what the musical object is; Fretboard determines where its pitches can occur on the discrete fretboard; Playability checks whether a proposed chord fingering is logically usable and ranks valid fingerings for practical suitability. This describes responsibility and data flow, not a requirement that every engine call the next engine internally. Their exact callable interfaces and execution placement remain undecided.

Keep a chord's musical identity distinct from its voicing and from a fingering used to realize that voicing. Similarly, all matching note locations across the fretboard are not one simultaneous grip. A display-mode change does not redefine the underlying scale or chord.

Distinguish musical correctness, fretboard availability, chord fingering validity, and ergonomic ranking. A valid fingering must satisfy contact rules and one shared grip's constraints; assigning fingers independently or checking fret span alone is insufficient. Hard constraints reject invalid candidates; ranking compares valid candidates.

Fretboard supplies string identities, registered tuning, available frets, and pitch mappings. Playability uses these discrete facts without requiring instrument measurements or hand simulation. Scales and melodies currently use fretboard note locations only.

## Contracts and validation

Supported capabilities should expose clear, verified contracts that the next layer can depend on. These contracts may evolve deliberately as capabilities grow. They do not need to be permanently or comprehensively finalized before UI development begins.

TypeScript makes contracts explicit and reviewable; its types do not replace deterministic musical tests or required runtime validation. Structural validation of an input or tool request does not establish musical correctness. Domain rules perform the relevant musical calculations, fretboard mapping, and chord fingering checks. Presentation converts valid results for display without becoming an alternative source of those rules.

TypeScript checking and Vitest behavioral testing use separate commands once configured. Determinism comes from explicit inputs, controlled state, domain rules, and meaningful assertions, not from the runner itself.

Verify early deterministic capabilities through ordinary tests and, when useful, a small debug or CLI harness. Later agent and product evaluation can measure interpretation and complete outcomes. It does not replace deterministic tests. Visual and human assessment may reveal practical limitations that automated checks do not yet capture.

## Current direction and later capabilities

The accepted construction strategy is domain-first: establish domain concepts, Music Theory and tests, Fretboard and tests, and Playability. Clear contracts support a basic non-AI UI before agent/tool integration and AI orchestration. See the [construction decision](DECISIONS.md#d004-domain-first-construction).

Root, scale, and chord controls and direct fretboard interaction illustrate the intended conventional experience; exact controls and initial supported musical scope are not fixed. The application should eventually support both exploration and continued development of the user's musical ideas.

Selecting React, Next.js, and the presentation stack does not start UI or server implementation. The first non-AI interface may primarily use client-side interaction over the deterministic domain. Introduce server functionality only when its capabilities are needed.

One agent and structured JSON communication are the current initial AI direction, not permanent architectural commitments. AI providers, agent tooling, and evaluation platforms remain undecided.

Audio, broader evaluation, patterns, voice leading, and idea development remain later capabilities as justified. RAG, web search, visual agent feedback, multiple agents, MIDI, and tablature are future possibilities, not implementation prerequisites or a committed backlog.

## Deferred technology choices

The following remain undecided until concrete requirements justify a choice:

- Database, ORM, persistence model, and authentication solution.
- Hosting/deployment provider and analytics/observability platform.
- AI model/provider, AI SDK or agent framework, evaluation platform, and RAG/vector database.
- State-management library and audio implementation.

Selecting Next.js does not implicitly select any of these. Custom React + SVG is the accepted fretboard visualization direction; no dedicated fretboard library is selected. A specialized visualization library may be evaluated later for a concrete difficult problem if it preserves domain ownership.

## Open architectural questions

- Representations for musical identity, voicing, and fingering; context-aware spelling selection and any future extension of explicit note spelling, register, notation, or intervals.
- Ownership of voicing candidate generation, initial realization selection, and the playability guarantee.
- Concrete hard chord grip limits, additional supported contact rules, and ergonomic ranking criteria. The Playability Reference supplies conservative recommendation heuristics and initial CAGED reference fingerings; further supported shapes and exceptions remain to be established.
- Application-state ownership, coordination between interaction paths, and placement of domain execution.
- Concrete interfaces, the deferred technology choices above, and the timing and scope of later capabilities.
- React component hierarchy, SVG rendering data structures and algorithms, fretboard geometry, and state-management architecture.

These questions are not accepted designs. Resolve them explicitly when relevant to an authorized effort, and record persistent decisions with their reasons in [DECISIONS.md](DECISIONS.md).

## Maintenance

This file describes architectural responsibilities and implementation reality. [DECISIONS.md](DECISIONS.md) records why persistent choices are in force; [AGENTS.md](../AGENTS.md) defines agent working rules. A task's ExecPlan carries its execution history under [.agent/PLANS.md](../.agent/PLANS.md), rather than turning this document into a progress log.
