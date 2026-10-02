# Architecture

## Purpose and status

FretboAIrd is an interactive guitar and music-theory application with a deterministic domain foundation and later optional AI assistance. The same system supports general fretboard exploration and guitar-based composition and arrangement. The musician supplies creative direction; the system helps inspect, understand, transform, and realize musical ideas.

This document separates accepted architectural boundaries, implementation facts, current direction, and open questions. The accepted shared understanding and subsequent explicit user decisions govern where earlier planning material differs. Necessary architectural context is recorded here; access to the original planning PDFs or chat history is not required.

## Current implementation

The repository contains the working documents plus a minimal Next.js App Router application. `app/layout.tsx` provides the root layout and metadata, `app/page.tsx` is a deliberately generic bootstrap page, and `app/globals.css` imports the configured Tailwind CSS and shadcn/ui styles. `next.config.ts`, `postcss.config.mjs`, `components.json`, and `lib/utils.ts` provide the framework and UI foundation; no shadcn components have been added yet.

`package.json` and `package-lock.json` define one private npm-managed package. `npm run typecheck` runs Next.js type generation and strict TypeScript checks for the application and NodeNext checks for the test configuration. `vitest.config.ts` configures a Node test environment, and `tests/bootstrap.test.ts` verifies that the test runtime works without a DOM. `npm run dev`, `npm run build`, and `npm run start` provide the Next.js lifecycle commands. `.nvmrc` and the package engine target Node.js 24 LTS.

No domain modules, React product controls, SVG fretboard visualization, server APIs, persistence, audio, or AI integration exist yet. There is no actual ExecPlan and no `plans/` directory. The components below continue to describe accepted responsibilities that later implementation must preserve.

## Accepted technology foundation

Next.js is the selected full-stack application framework, React is the UI library, and TypeScript 7.x is the implementation language. The intended generic UI stack is shadcn/ui with Base UI primitives where applicable and Tailwind CSS for styling. The custom fretboard visualization uses React and SVG. These choices support the existing domain-first architecture; they do not change its construction order.

The development, tooling, and test baseline is Node.js 24 LTS with native ESM conventions and NodeNext semantics. TypeScript checking is strict, including `strict`, `noUncheckedIndexedAccess`, and `exactOptionalPropertyTypes`. npm manages dependencies. Vitest 5.x runs behavioral tests in a Node environment, separately from TypeScript checking. Any Vite dependency required by Vitest serves test tooling; Next.js owns the application-framework role. No particular Vite version is an architectural decision.

The initial organization is one repository and one private Next.js application package containing framework-independent domain modules. No monorepo, separate backend service, or placeholder package boundaries are needed. Exact configuration, source layout, and compatible dependency releases will be verified during authorized setup. Choosing this stack does not select a hosting environment or require server capabilities before they are needed.

The accepted decisions and rationale are recorded in [DECISIONS.md](DECISIONS.md#d009-typescript-and-strict-contract-checking). The implementation status above remains authoritative for what actually exists.

## Components and boundaries

| Responsibility | Owns | Does not own |
| --- | --- | --- |
| Domain concepts | Shared musical and instrument concepts needed by supported capabilities. | A speculative type system for all future features. Exact representations remain open. |
| Music Theory Engine | Deterministic note, interval, scale, degree, and chord calculations; theoretical context is in the [Music Theory Reference](MUSIC_THEORY_REFERENCE.md), whose coverage does not establish supported capabilities. | Natural-language interpretation, fretboard rendering, or hand ergonomics. |
| Fretboard Engine | Mapping between tuning, strings, frets, pitches, and available locations or regions. | Redefining music theory or treating a location map as proof of a playable fingering. |
| Playability capabilities | Physical constraint checks and fingering feasibility; later, comparison of fingerings and configurable ergonomic assessments. | Musical taste, universal claims about every player's anatomy, or silently replacing the requested musical object. |
| Application boundary (Next.js) | Full-stack application capabilities and connecting application operations to the deterministic domain; trusted server-side execution when later integrations need it. | Musical or physical truth. Routes, Server Components, Route Handlers, and server actions must not become prerequisites for domain use or testing. |
| UI and interaction (React) | Guitar controls, selection and display interaction, composition-workbench interaction, and later AI-assisted interaction over shared application/domain operations. | A second implementation of music-theory, fretboard, or playability rules. State ownership and coordination structure remain open. |
| Generic controls and styling (shadcn/ui, Base UI, Tailwind CSS) | Reusable application controls, accessible generic interaction primitives, and presentation. | Musical semantics, domain calculations, or ownership of the custom fretboard visualization. |
| Custom fretboard visualization (React + SVG) | Rendering domain results as strings, frets, markers, labels, highlights, and regions; capturing interaction for application operations. | Defining musical truth, independently calculating note locations, or establishing playability. Component hierarchy, rendering data, algorithms, and geometry remain undecided. |
| Later agent and tool integration | Interpreting intent, supplying relevant context, invoking the same domain capabilities, and explaining grounded results. | Serving as the authoritative calculator of notes, fret positions, or physical feasibility. |
| Later audio and evaluation | Making results audible; measuring behavior and supporting human review respectively. | Replacing domain validation or treating an evaluation score as proof of musical usefulness. |

These are logical responsibilities within the initial single application package. They do not mandate separate services, packages, or classes. In particular, the exact division of voicing candidate generation between Fretboard and Playability has not been decided.

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

## Dependency direction and domain truth

Application, UI-facing, and agent-facing integrations consume the deterministic domain capabilities. Domain calculations and validations must remain usable and testable independently of React, Next.js, UI component libraries, CSS, routing, Server Components, Route Handlers, server actions, AI providers, renderers, and deployment infrastructure. Framework and presentation details belong at their integration boundaries rather than defining musical semantics.

Node-specific APIs should remain outside portable domain calculations unless a concrete domain requirement justifies them. Running domain tests under Node does not justify coupling the domain to filesystem, process, or network APIs. The domain remains independently testable both before and after connection to the Next.js application.

Music Theory determines musical content; Fretboard relates that content to the instrument; Playability assesses applicable physical realizations. This describes responsibility and data flow, not a requirement that every engine call the next engine internally. Their exact callable interfaces and execution placement remain undecided.

Keep a chord's musical identity distinct from its guitar voicing and from a fingering used to realize that voicing. Similarly, all matching note locations across the fretboard are not one simultaneous grip. A display-mode change does not redefine the underlying scale or chord.

Distinguish musical validity, physical feasibility, ergonomics, and subjective usefulness. Deterministic evaluation of a configured constraint does not make that constraint a universal human limit. Failure to find a playable result under given constraints is a meaningful result; it must not be concealed by inventing one or overstating what the search proves.

## Contracts and validation

Supported capabilities should expose clear, verified contracts that the next layer can depend on. These contracts may evolve deliberately as capabilities grow. They do not need to be permanently or comprehensively finalized before UI development begins.

TypeScript makes contracts explicit and reviewable; its types do not replace deterministic musical tests or required runtime validation. Structural validation of an input or tool request does not establish musical correctness. Domain rules perform the relevant musical and physical calculations and checks. Presentation converts valid results for display without becoming an alternative source of those rules.

TypeScript checking and Vitest behavioral testing use separate commands once configured. Determinism comes from explicit inputs, controlled state, domain rules, and meaningful assertions, not from the runner itself.

Verify early deterministic capabilities through ordinary tests and, when useful, a small debug or CLI harness. Later agent and product evaluation can measure interpretation and complete outcomes. It does not replace deterministic tests. Visual and human assessment may reveal practical limitations that automated checks do not yet capture.

## Current direction and later capabilities

The accepted construction strategy is domain-first: establish minimal domain concepts, Music Theory and tests, Fretboard and tests, and limited Playability when required. Clear contracts support a basic non-AI UI before agent/tool integration and AI orchestration. See the [construction decision](DECISIONS.md#d004-domain-first-construction).

Root, scale, and chord controls and direct fretboard interaction illustrate the intended conventional experience; exact controls and initial supported musical scope are not fixed. The application should eventually support both exploration and continued development of the user's musical ideas.

Selecting React, Next.js, and the presentation stack does not start UI or server implementation. The first non-AI interface may primarily use client-side interaction over the deterministic domain. Introduce server functionality only when its capabilities are needed.

One agent and structured JSON communication are the current initial AI direction, not permanent architectural commitments. AI providers, agent tooling, and evaluation platforms remain undecided.

Audio, broader evaluation, richer fingering and ergonomics, patterns, harmonization, voice leading, and idea development remain later capabilities as justified. RAG, web search, visual agent feedback, multiple agents, MIDI, and tablature are future possibilities, not implementation prerequisites or a committed backlog.

## Deferred technology choices

The following remain undecided until concrete requirements justify a choice:

- Database, ORM, persistence model, and authentication solution.
- Hosting/deployment provider and analytics/observability platform.
- AI model/provider, AI SDK or agent framework, evaluation platform, and RAG/vector database.
- State-management library and audio implementation.

Selecting Next.js does not implicitly select any of these. Custom React + SVG is the accepted fretboard visualization direction; no dedicated fretboard library is selected. A specialized visualization library may be evaluated later for a concrete difficult problem if it preserves domain ownership.

## Open architectural questions

- Initial musical scope and instrument support, including tuning and range.
- Representations for pitch class, register, note spelling, musical identity, voicing, and fingering.
- Ownership of voicing candidate generation, initial realization selection, and the minimum playability guarantee.
- Application-state ownership, coordination between interaction paths, and placement of domain execution.
- Concrete interfaces, the deferred technology choices above, and the timing and scope of later capabilities.
- React component hierarchy, SVG rendering data structures and algorithms, fretboard geometry, and state-management architecture.

These questions are not accepted designs. Resolve them explicitly when relevant to an authorized effort, and record persistent decisions with their reasons in [DECISIONS.md](DECISIONS.md).

## Maintenance

This file describes architectural responsibilities and implementation reality. [DECISIONS.md](DECISIONS.md) records why persistent choices are in force; [AGENTS.md](../AGENTS.md) defines agent working rules. A task's ExecPlan carries its execution history under [.agent/PLANS.md](../.agent/PLANS.md), rather than turning this document into a progress log.
