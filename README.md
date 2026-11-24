# FretboAIrd

A guitar and music-theory workbench for exploring the fretboard and developing musical ideas.

FretboAIrd connects notes, intervals, scales and chords with their locations on a discrete fretboard. Its intended interface helps musicians explore tunings, understand harmony, and compare ways of realizing an idea during composition or arrangement.

The application is designed to be useful without AI. Later, optional AI assistance will interpret intent and call the same deterministic capabilities used by ordinary application controls. Musical rules remain in independently testable domain code.

## Project status

**Music Theory v1, Fretboard v1 and bounded Playability v1 are implemented.** They provide musical construction and analysis, discrete pitch-location mapping, and chord fingering search and assessment using selected known templates. General fingering solving and ergonomic ranking are not implemented.

The Next.js application currently displays a bootstrap page. Product controls, an interactive fretboard, composition workflows, persistence, audio and AI integration are future work. See [current capabilities and limitations](docs/STATUS.md) before assuming a feature is available.

## Getting started

Use the Node.js version in [.nvmrc](.nvmrc) and npm metadata in [package.json](package.json). npm is the configured package manager; the lockfile records the dependency tree. From the repository root:

```sh
npm ci
npm test
npm run typecheck
npm run dev
```

A fresh installation requires access to the dependency registry. The development page reports that application features are coming later; this is expected. Domain behavior is exercised through tests and the [worked examples](docs/onboarding/end-to-end-examples.md).

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server. |
| `npm test` | Run domain and bootstrap tests once. |
| `npm run test:watch` | Run tests in watch mode. |
| `npm run test:e2e` | Build the app, serve it on loopback port 3100, and run the Chromium browser tests. |
| `npm run typecheck` | Generate Next.js types and run the configured TypeScript checks. |
| `npm run build` | Create a production build. |
| `npm run start` | Serve a production build. |

Runtime tests and type checking are separate checks. Exact dependency versions and tool settings belong in configuration; [development details](docs/onboarding/architecture-and-data-flow.md#development-and-verification) explain the setup.

Before the first browser run, or after updating Playwright, install its matching browser with `npx playwright install chromium`. Run one spec with `npm run test:e2e -- e2e/home.spec.ts`. On failure, open the trace with `npx playwright show-trace <path-to-trace.zip>` using the path printed by the runner.

## Repository map

| Location | Responsibility |
| --- | --- |
| `domain/music-theory/` | Musical content, spelling, construction and analysis. |
| `domain/fretboard/` | Explicit instruments and discrete pitch locations. |
| `domain/playability/` | Chord geometry, finger contacts, template search and assessment. |
| `app/` | Next.js application and presentation bootstrap. |
| `tests/` | Deterministic unit and integration evidence. |
| `e2e/` | Playwright checks against the running Next.js application. |
| [docs/](docs/README.md) | Current guidance, contracts, domain knowledge and rationale. |
| [plans/](plans/README.md) | Active efforts and clearly labeled historical records. |

## Finding your way

Start with the [documentation index](docs/README.md) to choose a reading path.

- **Learn the system:** [developer onboarding](docs/onboarding/README.md) explains the algorithms through source links and examples.
- **Understand boundaries:** [architecture](docs/ARCHITECTURE.md) describes ownership, dependencies and data flow.
- **Use the engines:** read the [Music Theory](docs/MUSIC_THEORY_V1.md), [Fretboard](docs/FRETBOARD_V1.md) or [Playability](docs/PLAYABILITY_V1.md) contracts.
- **Understand the reasoning:** use the [decision index](docs/DECISIONS.md#topic-index).
- **Make a change:** follow [AGENTS.md](AGENTS.md), inspect the relevant source and tests, and read the owning contract and reference sections.

Documentation records supported contracts and accepted intent; source and tests establish actual behavior. Investigate discrepancies and update the owning document when behavior changes.
