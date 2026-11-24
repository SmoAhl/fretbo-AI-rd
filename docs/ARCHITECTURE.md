# Architecture

[Documentation index](README.md) | [Current status](STATUS.md)

## Purpose and status

FretboAIrd supports fretboard exploration and guitar-based composition or arrangement. The musician supplies creative direction; deterministic domain functions help inspect, transform and realize musical ideas. It models a discrete fretboard, not a simulated guitar or human hand.

This document owns system boundaries, data flow and open architectural questions. [Status](STATUS.md) owns the capability overview. The [Music Theory](MUSIC_THEORY_V1.md), [Fretboard](FRETBOARD_V1.md) and [Playability](PLAYABILITY_V1.md) guides own detailed supported contracts. Domain references supply knowledge; [decisions](DECISIONS.md#topic-index) explain accepted choices.

## Components and boundaries

| Component | Responsibility and current boundary |
| --- | --- |
| Music Theory | Musical identity, pitch/register/spelling, intervals, collections, formulas, descriptions, supplied voicings and analysis. No instrument or finger assignments. |
| Fretboard | Explicit string IDs, physical positions, registered tuning, available frets and pitch-location mapping. Location alternatives do not establish a simultaneous chord. |
| Playability | Reusable geometry and finger contacts, concrete validation, bounded template search, musical matching and reviewed-pattern support. General solving and ergonomic ranking are not implemented. |
| Application (Next.js) | Coordinates operations and state, with server functionality when needed. Currently a page/layout/style bootstrap; execution placement and state ownership remain open. |
| UI and renderer (React) | Present results and capture interaction. Custom SVG fretboard rendering is an accepted direction, not an implemented renderer. |
| Later AI integration | Interprets intent and orchestrates the same capabilities as direct application interaction. It does not own musical rules. |
| Later audio and evaluation | Make results audible and assess complete outcomes without replacing domain validation. |

These are logical responsibilities inside one private application package, not separate services or engine classes. Music Theory has five subject folders matching its reference; parsers and private helpers stay with their subject. Modules use direct relative imports with `.js` specifiers, without a public barrel or separate domain package.

## Dependency direction and domain rules

Application, UI-facing, and agent-facing integrations consume the deterministic domain capabilities. Domain calculations and validations must remain usable and testable independently of React, Next.js, UI component libraries, CSS, routing, Server Components, Route Handlers, server actions, AI providers, renderers, and deployment infrastructure. Framework and presentation details belong at their integration boundaries rather than defining musical semantics.

Node-specific APIs should remain outside portable domain calculations unless a concrete domain requirement justifies them. Running domain tests under Node does not justify coupling the domain to filesystem, process, or network APIs. The domain remains independently testable both before and after connection to the Next.js application.

Music Theory determines what the musical object is; Fretboard determines where its pitches can occur on the discrete fretboard; Playability checks whether a proposed chord fingering is logically usable and owns future ranking of valid fingerings for practical suitability. This describes responsibility and data flow, not a requirement that every engine call the next engine internally. The engine guides own the detailed interfaces; Playability assessment and bounded template search are implemented, while application execution placement remains undecided.

Keep a chord's musical identity distinct from its voicing and from a fingering used to realize that voicing. Similarly, all matching note locations across the fretboard are not one simultaneous grip. A display-mode change does not redefine the underlying scale or chord.

Distinguish musical correctness, fretboard availability, chord fingering validity, and ergonomic ranking. A valid fingering must satisfy contact rules and one shared grip's constraints; assigning fingers independently or checking fret span alone is insufficient. Hard constraints reject invalid candidates; ranking compares valid candidates.

Fretboard supplies string identities, physical string positions, registered tuning, available frets, and pitch mappings. Playability uses these discrete facts without requiring instrument measurements or hand simulation. Scales and melodies currently use fretboard note locations only.

## Data crossing boundaries

Preserve original musical intent alongside derived data:

- A chord description retains root, ordered formula roles and optional specified bass. Unspecified bass does not mean root position.
- Class conversion loses register; numeric conversion loses spelling. Roles such as 2/9 remain distinct even when their pitch classes match.
- Exact voicings retain every registered occurrence and its index. Class coverage alone does not prove register or multiplicity.
- Optional formula positions remain explicit caller policy; unavailable locations do not authorize dropping required tones.
- Fretboard results identify alternatives by string ID and fret. Keep the board to recover physical position and tuning; ID order, physical order and pitch order are independent.
- Playability keeps geometry, relative execution templates, absolute witnesses and review evidence separate. IDs or provenance do not establish support.

[Music Theory handoff](MUSIC_THEORY_V1.md#information-to-retain-at-the-fretboard-boundary) and [Fretboard handoff](FRETBOARD_V1.md#information-playability-must-retain) specify consumer obligations. No universal musical-request schema is introduced.

## Runtime paths

The intended direct path is:

```text
User -> application controls -> domain operations -> presentation
```

Later AI orchestration uses the same domain operations:

```text
User -> AI interpretation -> application/domain operations -> presentation
```

These describe logical interactions, not deployment or completed UI integration. A scale display needs note locations; a chord fingering requires additional simultaneous-contact and musical checks. Not every request runs every engine.

For example, root and scale controls can request Music Theory content, map it through Fretboard, and render the results. SVG geometry and pointer handling belong to presentation; screen coordinates do not independently define musical pitch. [Worked examples](onboarding/end-to-end-examples.md) demonstrate the implemented domain paths.

## Accepted technology foundation

Next.js provides the application boundary; React provides UI, with custom SVG selected for fretboard visualization. shadcn/ui and Base UI provide generic controls as needed, and Tailwind CSS provides styling. Generic components and the custom musical visualization consume domain results. Add shared visual abstractions only when concrete repetition justifies them.

TypeScript uses strict checking, including `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes`. The package uses native ESM, bundler resolution for the application and NodeNext for Node tooling. Node.js 24 LTS and npm are the development baseline. Vitest runs behavior tests in Node separately from type checking; Vite serves test tooling, not the application framework.

[package.json](../package.json), [package-lock.json](../package-lock.json) and [.nvmrc](../.nvmrc) own exact versions and commands. [D009-D018](DECISIONS.md#d009-typescript-and-strict-contract-checking) record rationale. Selecting a framework or UI stack does not imply implemented components, a separate backend, or a hosting choice.

## Contracts and validation

Supported capabilities should expose clear, verified contracts that the next layer can depend on. These contracts may evolve deliberately as capabilities grow. They do not need to be permanently or comprehensively finalized before UI development begins.

TypeScript makes contracts explicit and reviewable; its types do not replace deterministic musical tests or required runtime validation. Structural validation of an input or tool request does not establish musical correctness. Domain rules perform the relevant musical calculations, fretboard mapping, and chord fingering checks. Presentation converts valid results for display without becoming an alternative source of those rules.

TypeScript checking and Vitest behavioral testing use separate configured commands. Determinism comes from explicit inputs, controlled state, domain rules, and meaningful assertions, not from the runner itself.

Playwright Test exercises the application through a browser. Keep repeatable UI acceptance checks in `e2e/` and deterministic domain and geometry checks in Vitest. A browser assertion should cover a user-observable result, such as selection state after keyboard input or the full focused cell scrolling into view. The implementation agent and reviewer can inspect a failure trace to see which step failed. Visual readability and interaction feel remain part of the developer's UI review. See [D058](DECISIONS.md#d058-playwright-for-browser-verification) and the [setup commands](../README.md#getting-started).

Verify early deterministic capabilities through ordinary tests and, when useful, a small debug or CLI harness. Later agent and product evaluation can measure interpretation and complete outcomes. It does not replace deterministic tests. Visual and human assessment may reveal practical limitations that automated checks do not yet capture.

## Current direction and later capabilities

The accepted strategy is domain-first, followed by a useful non-AI application interface and later AI orchestration ([D004](DECISIONS.md#d004-domain-first-construction)). The bounded domain foundation is implemented; specific product controls and composition workflows still need scoped requirements.

A first interface may execute domain operations on the client. Introduce server functionality when needed. One agent and structured JSON communication are the initial AI direction, not permanent commitments. Audio, voice leading and idea development remain possible later capabilities. RAG, web search, visual agent feedback, multiple agents, MIDI and tablature are possibilities, not prerequisites or an approved backlog.

[Status](STATUS.md#partial-product-areas-and-intentionally-missing-behavior) records missing capability areas; its [follow-ups](STATUS.md#known-maintenance-and-verification-follow-ups) include error classification before UI/tool exposure. Resolve scope and policy when relevant work is authorized.

## Deferred technology choices

The following remain undecided until concrete requirements justify a choice:

- Database, ORM, persistence model, and authentication solution.
- Hosting/deployment provider and analytics/observability platform.
- AI model/provider, AI SDK or agent framework, evaluation platform, and RAG/vector database.
- State-management library and audio implementation.

Selecting Next.js does not implicitly select any of these. Custom React + SVG is the accepted fretboard visualization direction; no dedicated fretboard library is selected. A specialized visualization library may be evaluated later for a concrete difficult problem if it preserves domain ownership.

## Open architectural questions

- Whether and how to name inversions of extended tertian chords such as C9, C11 and C13. Triad/seventh inversion numbering does not automatically extend to ninth, eleventh or thirteenth chords; a future convention requires an explicit decision.
- For future combined up/down operations, should the turning tonic be repeated or included once, and what total-output budget should apply? Existing single-leg calls can be composed with the turning tonic once by dropping the second leg's starting note; no combined-operation policy or helper has been accepted.
- Richer voicing representations beyond the implemented explicit registered tone lists, fingering representations beyond the implemented independent contact witnesses, and future musical-identity needs beyond root/formula/optional specified-bass descriptions; broader spelling-context inference and future extensions of note spelling, register, notation or intervals.
- Ownership of general voicing/shape generation beyond Playability's bounded known-template search, initial realization selection, and stronger human playability guarantees.
- Concrete hard chord grip limits, additional supported contact rules, and ergonomic ranking criteria. The Playability Reference supplies conservative recommendation heuristics and initial CAGED reference fingerings; further supported shapes and exceptions remain to be established.
- Application-state ownership, coordination between interaction paths, and placement of domain execution.
- Concrete interfaces, the deferred technology choices above, and the timing and scope of later capabilities.
- React component hierarchy, SVG rendering data structures and algorithms, fretboard geometry, and state-management architecture.

These questions are not accepted designs. Resolve them explicitly when relevant to an authorized effort, and record persistent decisions with their reasons in [DECISIONS.md](DECISIONS.md).

## Maintenance

Maintain boundaries here, supported APIs in the engine guides, and capability/follow-up status in [STATUS.md](STATUS.md). [AGENTS.md](../AGENTS.md) governs work; [DECISIONS.md](DECISIONS.md) records accepted rationale. Dated run evidence and historical findings belong in individual [plans](../plans/README.md). See the [ownership map](README.md#documentation-ownership).
