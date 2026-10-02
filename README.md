# FretboAIrd

A guitar and music-theory workbench for exploring the fretboard and developing musical ideas.

FretboAIrd is intended to connect notes, intervals, scales, and chords with their positions and possible realizations on the guitar. An interactive fretboard and ordinary application controls will support both musical exploration and composition or arrangement, with the musician providing creative direction.

The application is designed to be useful without AI. Later, optional AI assistance will interpret intent and orchestrate the same deterministic capabilities used by direct interaction. Musical calculations and physical constraints remain the responsibility of the domain code.

## Project status

**Technical bootstrap complete; domain implementation has not started.** The repository now contains a minimal Next.js application, strict TypeScript checking, a Node-only Vitest setup, Tailwind CSS, and shadcn/ui configuration with Base UI primitives. No Music Theory, Fretboard, Playability, AI, or product feature implementation has been added.

The descriptions below explain the intended application. See [current implementation status](docs/ARCHITECTURE.md#current-implementation) for the authoritative account of what exists.

## Core architecture

Three domain responsibilities underpin the application:

- **Music Theory:** determine notes, intervals, scales, degrees, and chords.
- **Fretboard:** map musical content to strings, frets, tunings, and available locations.
- **Playability:** assess applicable physical constraints and fingering feasibility. A map of matching notes is not automatically a playable grip.

Application controls, the custom fretboard, and later AI integration consume these shared capabilities. The deterministic domain stays usable and testable independently of React, Next.js, presentation libraries, AI providers, and deployment infrastructure.

Generic controls and the fretboard have distinct roles: shadcn/ui and Base UI provide reusable interaction components; React and SVG provide the custom musical visualization. Both consume domain results rather than define musical rules.

## Selected technology

These are the selected project technologies. The exact installed versions are pinned in `package.json` and `package-lock.json`.

| Area | Choice |
| --- | --- |
| Application | Next.js 16.3.8 and React 19.3.0 |
| Language | TypeScript 7.0.2 with `strict`, `noUncheckedIndexedAccess`, and `exactOptionalPropertyTypes` |
| Modules | Native ESM; the Next.js app uses bundler resolution, and Node tooling uses NodeNext |
| Development and test runtime | Node.js 24.21.0 LTS |
| Dependency management | npm 11.19.0 with exact dependency versions and `package-lock.json` |
| Behavioral testing | Vitest 5.0.3 in a Node environment, separate from TypeScript checking |
| Generic UI controls | shadcn/ui 4.21.0 with Base UI (`@base-ui/react` 1.8.0) |
| Styling | Tailwind CSS 4.3.3 |
| Fretboard visualization | Custom React + SVG |

The initial organization is one repository and one private Next.js application package with framework-independent domain modules. Database, authentication, hosting, AI provider, and other [deferred technology choices](docs/ARCHITECTURE.md#deferred-technology-choices) remain open. The [decision log](docs/DECISIONS.md) records the rationale and constraints behind accepted choices.

## Repository guide

| Document | Purpose |
| --- | --- |
| [Architecture](docs/ARCHITECTURE.md) | System responsibilities, domain boundaries, implementation status, and open questions. |
| [Decisions](docs/DECISIONS.md) | Accepted project decisions and their rationale. |
| [Music Theory Reference](docs/MUSIC_THEORY_REFERENCE.md) | Sourced Western music-theory context under 12-TET; coverage does not imply implemented capabilities. |
| [Fretboard Reference](docs/FRETBOARD_REFERENCE.md) | Sourced physical guitar and fretboard context for mapping pitches to locations; coverage does not imply implemented capabilities. |
| [Agent instructions](AGENTS.md) | Repository working practices, verification expectations, and the threshold for an ExecPlan. |
| [ExecPlan protocol](.agent/PLANS.md) | How significant efforts are planned and continued across sessions. |

Actual ExecPlans will live in repository-level `plans/` when needed. That directory does not exist yet; `.agent/PLANS.md` defines the protocol rather than an implementation task.

## Development and getting started

Development follows the accepted domain-first order: minimal domain concepts, Music Theory with deterministic tests, Fretboard with deterministic tests, and minimal Playability when required. Clear supported contracts then enable a useful non-AI interface before AI integration. This is the construction strategy, not a list of completed features.

Use Node.js 24.21.0, as recorded in `.nvmrc`, with its bundled npm version. Then install dependencies:

```bash
npm install
```

Available commands:

```bash
npm run dev       # start the Next.js development server
npm run build     # create the production build
npm run start     # serve the production build
npm run typecheck # run Next.js type generation and strict TypeScript checks
npm test          # run Vitest once in the Node environment
```

The project targets Node.js 24 LTS and records the expected version in `.nvmrc` and `package.json`. `npm` is the only configured package manager.

For now, start with the architecture and decision log above. Before making changes, read [AGENTS.md](AGENTS.md), inspect the current repository state, and keep work within the requested scope. Use the linked ExecPlan protocol when the repository's threshold applies.
