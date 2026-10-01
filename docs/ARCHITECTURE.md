# Architecture

## Purpose and status

FretboAIrd is an interactive guitar and music-theory application with a deterministic domain foundation and later optional AI assistance. The same system supports general fretboard exploration and guitar-based composition and arrangement. The musician supplies creative direction; the system helps inspect, understand, transform, and realize musical ideas.

This document separates accepted architectural boundaries, implementation facts, current direction, and open questions. The accepted shared understanding and subsequent explicit user decisions govern where earlier planning material differs. Necessary architectural context is recorded here; access to the original planning PDFs or chat history is not required.

## Current implementation

At the documentation bootstrap, the repository contains a minimal README and the four working documents: `AGENTS.md`, `.agent/PLANS.md`, `docs/ARCHITECTURE.md`, and `docs/DECISIONS.md`.

There is no application implementation, selected application stack, dependency manifest, test runner, configured build or lint command, executable domain interface, UI, or AI integration. There is no actual ExecPlan and no `plans/` directory. The components below describe accepted responsibilities, not existing modules or a selected directory structure.

Update this section against the repository as implementation is introduced. Describe actual entry points, modules, interfaces, tests, and integrations only after they exist; distinguish them from remaining intended capabilities.

## Components and boundaries

| Responsibility | Owns | Does not own |
| --- | --- | --- |
| Domain concepts | Shared musical and instrument concepts needed by supported capabilities. | A speculative type system for all future features. Exact representations remain open. |
| Music Theory Engine | Deterministic note, interval, scale, degree, and chord calculations. | Natural-language interpretation, fretboard rendering, or hand ergonomics. |
| Fretboard Engine | Mapping between tuning, strings, frets, pitches, and available locations or regions. | Redefining music theory or treating a location map as proof of a playable fingering. |
| Playability capabilities | Physical constraint checks and fingering feasibility; later, comparison of fingerings and configurable ergonomic assessments. | Musical taste, universal claims about every player's anatomy, or silently replacing the requested musical object. |
| Application interaction | Connecting ordinary controls and direct fretboard interaction to supported domain operations and their results. | A second implementation of musical calculations. State ownership and coordination structure remain open. |
| UI and renderer boundary | Displaying results, capturing interaction, and translating data to a renderer's representation when an adapter is needed. | Defining domain truth or silently repairing musical results. No renderer is selected. |
| Later agent and tool integration | Interpreting intent, supplying relevant context, invoking the same domain capabilities, and explaining grounded results. | Serving as the authoritative calculator of notes, fret positions, or physical feasibility. |
| Later audio and evaluation | Making results audible; measuring behavior and supporting human review respectively. | Replacing domain validation or treating an evaluation score as proof of musical usefulness. |

These are logical responsibilities. They do not mandate separate services, packages, or classes. In particular, the exact division of voicing candidate generation between Fretboard and Playability has not been decided.

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

UI-facing and agent-facing integrations consume the deterministic domain capabilities. Domain calculations and validations must remain usable without an LLM or a renderer. Renderer and provider details belong at their integration boundaries rather than defining musical semantics.

Music Theory determines musical content; Fretboard relates that content to the instrument; Playability assesses applicable physical realizations. This describes responsibility and data flow, not a requirement that every engine call the next engine internally. Their exact callable interfaces and execution placement remain undecided.

Keep a chord's musical identity distinct from its guitar voicing and from a fingering used to realize that voicing. Similarly, all matching note locations across the fretboard are not one simultaneous grip. A display-mode change does not redefine the underlying scale or chord.

Distinguish musical validity, physical feasibility, ergonomics, and subjective usefulness. Deterministic evaluation of a configured constraint does not make that constraint a universal human limit. Failure to find a playable result under given constraints is a meaningful result; it must not be concealed by inventing one or overstating what the search proves.

## Contracts and validation

Supported capabilities should expose clear, verified contracts that the next layer can depend on. These contracts may evolve deliberately as capabilities grow. They do not need to be permanently or comprehensively finalized before UI development begins.

Structural validation of an input or tool request does not establish musical correctness. Domain rules perform the relevant musical and physical calculations and checks. Presentation converts valid results for display without becoming an alternative source of those rules.

Verify early deterministic capabilities through ordinary tests and, when useful, a small debug or CLI harness. Later agent and product evaluation can measure interpretation and complete outcomes. It does not replace deterministic tests. Visual and human assessment may reveal practical limitations that automated checks do not yet capture.

## Current direction and later capabilities

The accepted construction strategy is domain-first: establish minimal domain concepts, Music Theory and tests, Fretboard and tests, and limited Playability when required. Clear contracts support a basic non-AI UI before agent/tool integration and AI orchestration. See the [construction decision](DECISIONS.md#d004-domain-first-construction).

Root, scale, and chord controls and direct fretboard interaction illustrate the intended conventional experience; exact controls and initial supported musical scope are not fixed. The application should eventually support both exploration and continued development of the user's musical ideas.

One agent and structured JSON communication are the current initial AI direction, not permanent architectural commitments. A reusable fretboard renderer or evaluation service may be considered, but no framework, library, renderer, or vendor is selected by this document.

Audio, broader evaluation, richer fingering and ergonomics, patterns, harmonization, voice leading, and idea development remain later capabilities as justified. RAG, web search, visual agent feedback, multiple agents, MIDI, and tablature are future possibilities, not implementation prerequisites or a committed backlog.

## Open architectural questions

- Initial musical scope and instrument support, including tuning and range.
- Representations for pitch class, register, note spelling, musical identity, voicing, and fingering.
- Ownership of voicing candidate generation, initial realization selection, and the minimum playability guarantee.
- Application-state ownership, coordination between interaction paths, and placement of domain execution.
- Concrete interfaces, technology choices, and the timing and scope of later capabilities.

These questions are not accepted designs. Resolve them explicitly when relevant to an authorized effort, and record persistent decisions with their reasons in [DECISIONS.md](DECISIONS.md).

## Maintenance

This file describes architectural responsibilities and implementation reality. [DECISIONS.md](DECISIONS.md) records why persistent choices are in force; [AGENTS.md](../AGENTS.md) defines agent working rules. A task's ExecPlan carries its execution history under [.agent/PLANS.md](../.agent/PLANS.md), rather than turning this document into a progress log.
