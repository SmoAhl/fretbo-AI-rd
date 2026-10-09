# FretboAIrd

A guitar and music-theory workbench for exploring the fretboard and developing musical ideas.

FretboAIrd is intended to connect notes, intervals, scales, and chords with their locations on a discrete fretboard and produce practically sensible chord fingerings. An interactive fretboard and ordinary application controls will support both musical exploration and composition or arrangement, with the musician providing creative direction.

The application is designed to be useful without AI. Later, optional AI assistance will interpret intent and orchestrate the same deterministic capabilities used by direct interaction. Musical calculations, fretboard mapping, and chord fingering rules remain the responsibility of the domain code.

## Project status

**Technical bootstrap and deterministic pitch, spelling, notation, transposition, scale, and mode capabilities are implemented.** The independent Music Theory domain supports numeric pitch classes with C = 0, registered semitone coordinates with C0 = 0, explicit spellings through double accidentals, and conversions among these representations. It parses note and interval text, formats supplied note spelling in Unicode or ASCII, selects reverse spellings with an explicit sharps/flats policy, and transposes spellings or registered notes by numbered, qualified intervals in either direction. Interval text supports compact and full forms with required direction, such as `m3 up`, `minor third down`, and `major 16 up`. Focused tests verify behavior and numerical boundaries. The application retains its minimal Next.js/TypeScript/Vitest and presentation-tooling bootstrap. General key-aware spelling selection, chords, Fretboard, Playability, AI, and product UI remain unimplemented.

The domain also measures signed semitone distance between registered pitches and identifies numbered, qualified intervals between registered spelled notes. Identification preserves compound distance and distinguishes enharmonic interval spellings, such as augmented fourth versus diminished fifth. It retains the existing interval model and rejects unsupported pairs rather than respelling them.

Simple-interval inversion complements number and quality and flips direction through octave displacement, including unison/octave endpoints. It rejects compound intervals and augmented octaves whose inverses require unsupported diminished unisons.

`formatSpelledInterval` produces compact interval text by default (`m3 up`) or full English text (`minor third up`), always including direction. Full notation names numbers 1–15 and uses decimal numbers beyond them (`major 16 up`); both forms round-trip through the parser. `semitonesFromInterval` exposes the existing validated signed displacement without requiring a source note, preserving compound octave distance and returning positive zero for zero displacement.

`scalePitchClasses` and `scaleNoteSpellings` construct seven ordered degrees for major, natural minor, harmonic minor, melodic minor ascending, and the seven major-scale modes, or five degrees for major/minor pentatonic. Construction excludes the repeated octave tonic; spelling preserves each interval role, including E-sharp in F-sharp major and C–E-flat–F–G–B-flat in C minor pentatonic, and rejects results beyond double accidentals. `pitchClassAtScaleDegree` and `scaleDegreeOfPitchClass` provide ordinal degree lookup and membership. Pentatonic degrees 6/7 throw `RangeError`; seven-note scales retain them. Broader melodic-minor conventions remain an [open question](docs/ARCHITECTURE.md#open-architectural-questions); [deferred scale/mode capabilities](docs/ARCHITECTURE.md#scales-and-modes-deferred-capabilities) are recorded separately.

`relativeModePitchClasses` and `relativeModeNoteSpellings` derive a relative mode from a parent tonic, an existing major-scale mode (or major/natural-minor alias), and ordinal degree 1..7. Results contain the derived tonic, canonical mode name, and reordered parent collection: C major degree 2 gives D Dorian; D Dorian degree 6 gives B Locrian. Exact parent spellings are retained. Unsupported parents/degrees and unrepresentable parent spellings throw `RangeError`. This capability adds no registered runs or melodic-minor traversal convention.

The descriptions below explain the intended application. See [current implementation status](docs/ARCHITECTURE.md#current-implementation) for the authoritative account of what exists.

## Core architecture

Three domain responsibilities underpin the application:

- **Music Theory:** determine what the musical object is.
- **Fretboard:** determine where its pitches can occur on the discrete fretboard.
- **Playability:** determine whether a proposed chord fingering is logically usable and rank valid fingerings for practical suitability.

Scales and melodies currently require note locations only. FretboAIrd does not simulate a guitar or a human hand.

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

The initial organization is one repository and one private Next.js application package; future domain modules will remain framework-independent within that package. Database, authentication, hosting, AI provider, and other [deferred technology choices](docs/ARCHITECTURE.md#deferred-technology-choices) remain open. The [decision log](docs/DECISIONS.md) records the rationale and constraints behind accepted choices.

## Repository guide

| Document | Purpose |
| --- | --- |
| [Architecture](docs/ARCHITECTURE.md) | System responsibilities, domain boundaries, implementation status, and open questions. |
| [Decisions](docs/DECISIONS.md) | Accepted project decisions and their rationale. |
| [Music Theory Reference](docs/MUSIC_THEORY_REFERENCE.md) | Pitch, spelling, intervals, scales, modes, and chord construction under 12-TET. |
| [Fretboard Reference](docs/FRETBOARD_REFERENCE.md) | Discrete strings, registered tuning, frets, and pitch-location mapping. |
| [Playability Reference](docs/PLAYABILITY_REFERENCE.md) | Chord contact and barre rules, fret-span/reach and finger-placement heuristics, CAGED reference fingerings, and ergonomic ranking. |
| [Agent instructions](AGENTS.md) | Repository working practices, verification expectations, and the threshold for an ExecPlan. |
| [ExecPlan protocol](.agent/PLANS.md) | How significant efforts are planned and continued across sessions. |

The references provide domain knowledge and examples, not implemented capabilities or fixed engine interfaces. Consult the relevant sections when building each engine.

Actual ExecPlans live in repository-level `plans/`. The [original Playability Reference effort](plans/playability-reference.md) is historical; the [domain-reference simplification](plans/domain-reference-simplification.md) records the completed documentation refactoring. `.agent/PLANS.md` defines the protocol rather than an implementation task.

## Development and getting started

Build the domain engines in order: **Music Theory → Fretboard → Playability**, introducing the minimal shared concepts needed and deterministic tests at each stage. Clear supported contracts then enable a useful non-AI interface before AI integration. This is the construction strategy, not a list of completed features.

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
