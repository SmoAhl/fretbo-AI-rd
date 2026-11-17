# Developer onboarding: FretboAIrd

FretboAIrd is a guitar and music-theory workbench for exploring an instrument and developing musical ideas. Its intended product connects notes, intervals, scales and chords to a discrete fretboard, then helps find sensible chord fingerings. A musician could inspect a scale on an alternate tuning, understand a chord's construction, or compare ways of realizing an idea during composition or arrangement.

**The working foundation is the deterministic domain and its tests.** Music Theory v1, Fretboard v1 and bounded Playability v1 are implemented; the application remains a bootstrap. [Current status](../STATUS.md) owns the capability overview and known follow-ups. This maintained guide teaches the implementation; its [original investigation](../../plans/developer-onboarding.md) preserves dated verification evidence.

The central mental model is:

> Music Theory determines what the music means. Fretboard determines where pitches exist. Playability combines explicit geometry and finger contacts with musical requirements, and recognizes reviewed patterns. Application code will choose operations and present their results.

These are collections of TypeScript functions and records inside one package, not three services or engine classes. No LLM, browser or framework is needed to execute them.

## Recommended reading order

| Order | Chapter | What you should understand afterward |
| --- | --- | --- |
| 1 | [Architecture, development and data flow](architecture-and-data-flow.md) | Repository layout, dependency direction, development commands, ownership and information preservation. |
| 2 | [Music Theory: pitches, spelling and intervals](music-theory-engine.md) | C-based coordinates, written versus sounding notes, parsing, safe arithmetic and transposition. |
| 3 | [Collections, degrees and keys](collections-and-keys.md) | Scale/mode construction, registered runs, ordinal versus musical role, key signatures and spelling policy. |
| 4 | [Chords, symbols and voicings](chords-and-voicings.md) | Shared formulas, the named catalog, harmonization, symbols, realization, coverage, inversion and identification. |
| 5 | [Fretboard Engine](fretboard-engine.md) | Explicit instruments, ID versus physical position, pitch lookup and bounded location searches. |
| 6 | [Playability Engine](playability-engine.md) | Geometry, witnesses, barres, relative templates, exact musical matching, pattern support and search. |
| 7 | [End-to-end examples](end-to-end-examples.md) | Concrete calls and intermediate results, including a complete supported chord-to-fingering path. |

For a quick first pass, read [current status](../STATUS.md) and chapters 1 and 7, then follow a domain chapter when an unfamiliar concept appears. The Music Theory chapters introduce terminology before using it; no advanced musical background is assumed.

## First local session

Use the Node version in [.nvmrc](../../.nvmrc) and the npm metadata in [package.json](../../package.json). From the repository root:

```sh
npm ci
npm test
npm run typecheck
npm run dev
```

`npm ci` installs the locked dependency tree; it requires dependency-registry access on a fresh checkout. `npm test` runs Vitest once. Type checking is separate. The development page says that application features are coming later: that is expected, not a failed domain integration. See [development details](architecture-and-data-flow.md#development-and-verification) before interpreting test results or choosing a change location.

## Where to start in the source

Read a small complete vertical path before browsing every helper:

1. [Pitch conversion](../../domain/music-theory/pitch-pitch-classes-and-spelling/registered-pitch.ts) establishes the numeric convention.
2. [Chord symbols](../../domain/music-theory/chords-symbols-and-realization/chord-symbols.ts) produce [descriptions](../../domain/music-theory/chords-symbols-and-realization/chord-descriptions.ts) backed by [formulas](../../domain/music-theory/chords-symbols-and-realization/chord-formulas.ts).
3. [Fretboard mapping](../../domain/fretboard/fretboard.ts) gives physical locations their actual pitches.
4. [Template search](../../domain/playability/template-search.ts) places known shapes and calls [assessment](../../domain/playability/playability.ts).
5. [Playability integration tests](../../tests/playability.test.ts) show the resulting A-flat major/minor and D-major fingerings, exact-voicing checks and independent support findings.

For musical composition across the five Music Theory subject folders, start with [music-theory-readiness.test.ts](../../tests/music-theory-readiness.test.ts). For preserving notes and roles alongside location alternatives, read [fretboard-music-theory.test.ts](../../tests/fretboard-music-theory.test.ts). Every detailed chapter links its focused source and tests.

## How this guide relates to existing documents

This guide explains algorithms and examples. Use the [documentation ownership map](../README.md#documentation-ownership) to distinguish contracts, current status and historical evidence.

| Document | Authority and use |
| --- | --- |
| [AGENTS.md](../../AGENTS.md) | Working instructions, change scope, verification and ExecPlan threshold. |
| [Status](../STATUS.md) | Current capability overview, missing areas and known follow-ups. |
| [Architecture](../ARCHITECTURE.md) | Architectural boundaries, cross-layer data and open questions. |
| [Decisions](../DECISIONS.md) | Accepted choices and their rationale; later entries may extend earlier increments. |
| [Music Theory Reference](../MUSIC_THEORY_REFERENCE.md), [Fretboard Reference](../FRETBOARD_REFERENCE.md), [Playability Reference](../PLAYABILITY_REFERENCE.md) | Domain knowledge and convention distinctions; reference coverage does not imply executable support. |
| [Music Theory v1](../MUSIC_THEORY_V1.md), [Fretboard v1](../FRETBOARD_V1.md), [Playability v1](../PLAYABILITY_V1.md) | Current supported contracts, limits and handoff guidance. |
| [Plans](../../plans/README.md) and [plan protocol](../../.agent/PLANS.md) | Per-effort context, historical progress, verification and explicit deferred work. |
| [Original onboarding investigation](../../plans/developer-onboarding.md) | Documentation scope, findings and checks performed for this guide. |

When changing behavior, read the relevant implementation and tests, the owning reference section, and its accepted decision. An old plan's statement that a feature is deferred describes that plan's increment; it is not evidence that later source lacks the feature.
