# Project status

[Documentation index](README.md)

This is the maintained project capability overview. Reviewed against source and repository history on **2026-11-17**, baseline `09b627c`, including the explicit reference-ID fix in `0f5a256`. Bounded v1 completion does not imply a finished application or support for every musical or instrument capability. Detailed contracts belong in the engine guides; dated test runs belong in [effort histories](../plans/README.md).

## Implemented capabilities

| Area | Confirmed implementation | Principal evidence |
| --- | --- | --- |
| Application/tooling bootstrap | One private ESM Next.js package, React layout/page, Tailwind/shadcn styling foundation, strict TypeScript, Node Vitest environment. | [package.json](../package.json), [app/page.tsx](../app/page.tsx), [bootstrap tests](../tests/bootstrap.test.ts) |
| Pitch foundations | C-based classes; C0-based registered coordinates; explicit spelling through triple accidentals; parsing/formatting and explicit reverse policies. | [Pitch subject folder](../domain/music-theory/pitch-pitch-classes-and-spelling), [foundation chapter](onboarding/music-theory-engine.md) |
| Intervals | Number/quality/direction validation, exact spelled transposition, registered distance/identification, supported simple inversion and text. | [Interval modules](../domain/music-theory/intervals-and-transposition), [measurement tests](../tests/interval-measurement.test.ts) |
| Collections | Thirteen `ScaleType` identifiers, fixed harmonic/melodic-minor modes, relative derivation, bounded registered runs, explicit melodic-minor conventions and separate numeric chromatic helper. | [Scale modules](../domain/music-theory/scales-and-modes), [collection chapter](onboarding/collections-and-keys.md) |
| Degrees and keys | Simple major-relative formulas, ordinal queries, 98 explicit major/minor key identities, 30 conventional signatures, relative/parallel relationships and narrow key-aware spelling. | [Degree/key modules](../domain/music-theory/degrees-keys-and-spelling), [key tests](../tests/keys.test.ts) |
| Chord content | Custom formulas, 37 named qualities, numeric/spelled descriptions, seven-note collection harmonization and bounded symbols. | [Chord modules](../domain/music-theory/chords-symbols-and-realization), [chord chapter](onboarding/chords-and-voicings.md) |
| Registered chords | Explicit supplied voicings; root-position realization; known-chord coverage, bass, inversion, doubling and spacing; exact catalog identification. | [Readiness tests](../tests/music-theory-readiness.test.ts), [Music Theory v1](MUSIC_THEORY_V1.md) |
| Fretboard | Explicit tuning/counts/positions, direct pitch lookup, exact-pitch and class searches, strict regions, safe arithmetic and complete bounded output. | [Implementation](../domain/fretboard/fretboard.ts), [unit tests](../tests/fretboard.test.ts), [integration tests](../tests/fretboard-music-theory.test.ts) |
| Playability geometry and contacts | Complete relative/concrete geometry, structural resolution, independent witnesses, inclusive barres, highest-stop/open-string rules and contact span. | [Geometry](../domain/playability/chord-shape-formula.ts), [resolver](../domain/playability/chord-shape.ts), [witness validator](../domain/playability/fingering-witness.ts) |
| Movable Playability v1 | Thirteen geometry/template pairs, five explicit closed CAGED variants, thirteen historical placements, bounded selected-template search, music/exact-occurrence assessment and independent reviewed-pattern support. | [Search](../domain/playability/template-search.ts), [assessment](../domain/playability/playability.ts), [integration tests](../tests/playability.test.ts), [D056](DECISIONS.md#d056-reusable-playability-templates-and-bounded-placement-search) |

There is no other implemented musical domain hidden behind the UI bootstrap. The remaining supporting abstraction, [lib/utils.ts](../lib/utils.ts), is a presentation class utility. Test helpers and private interval/run/catalog helpers serve the capabilities described above; they are not additional product engines.

## Partial product areas and intentionally missing behavior

| Broader area | Existing boundary | Missing behavior |
| --- | --- | --- |
| Complete interactive workbench | Static SVG fretboard with domain-derived tuning and opt-in note-label fixtures. See the [UI roadmap](ui/README.md). | Product controls, interactive selections and inspection, application state and composition workflows. |
| General music interpretation | Explicit inputs, exact formula/collection construction and exact catalog identification. | Key/context inference, harmonic function, Roman numerals, missing-root/approximate identification, preference-ranked names. |
| Full notation/spelling | Supported note/interval/degree/scale/chord grammar and explicit policies. | General alteration language, arbitrary custom chord symbols, key text, theoretical signatures, registered key-aware output, contextual spelling candidates/fallbacks and engraving. |
| General scale traversal | Fixed supported collections and explicit positive-octave directional runs. | Arbitrary pitch bounds, custom scales, chromatic spelling/degrees/runs, combined-leg API and global turning-note/output policy. |
| General chord realization | Full-role root-position constructor and supplied-voicing analysis. | Arbitrary voicing/inversion generation, automatic guitar omissions, voice leading and extended-chord inversion naming. |
| Instrument features | Discrete strings with common frets and explicit tuning. | Presets, capos/partial capos, per-string ranges, courses, harmonics, bends, microtonal mapping and measured geometry. |
| General practical fingering | Known-pattern enumeration, concrete contacts and reviewed-pattern eligibility. | Shape derivation from arbitrary tone/location lists, finger solving, generalized span/reach heuristic evaluation, ergonomic scores/ranking, active muting, thumb fretting, hand profiles and transitions. |
| Full-stack/AI/audio integration | Next.js chosen as application boundary. | Persistence, authentication, backend musical operations, AI tools/providers, audio/MIDI and deployment setup. Technology choices for these remain open. |

These limits come from the [architecture's current direction](ARCHITECTURE.md#current-direction-and-later-capabilities), [open questions](ARCHITECTURE.md#open-architectural-questions), v1 guides and accepted decisions. They are not a newly prioritized backlog. Some are explicit deferrals; others remain possibilities whose scope has not been selected.

## Integration boundaries that already work

Music Theory → Fretboard is exercised by tests that retain exact notes, roles and occurrences alongside alternatives. Fretboard → Playability is implemented by structural resolution and witness checks. Music Theory ↔ Playability composition is implemented in assessment: Playability supplies actual board pitches to the existing known-chord analyzer and separately enforces exact registered occurrences. Known-template candidate generation now explicitly belongs to Playability.

General voicing/shape generation beyond templates, application execution placement and state coordination remain open. No UI or AI integration should be inferred from passing domain integration tests.

## Known maintenance and verification follow-ups

- **Error classification before UI/tool exposure:** existing `RangeError` contracts cover both invalid requests and valid musical operations beyond representation limits. Revisit their presentation and classification before exposing operations to external callers. No structured error-code system or universal external-data validator exists.
- **Exact-pitch search oracle:** the [Fretboard readiness review](../plans/fretboard-v1-readiness.md#surprises--discoveries) recommends an independent bounded exhaustive oracle alongside the existing fixtures, permutation, region, overflow and cap tests. This is a nonblocking coverage recommendation, not an observed defect.

Reference geometry IDs are explicit and stable; their former array-order risk was fixed in `0f5a256`. [Catalog regression tests](../tests/playability-reference.test.ts) protect mappings, uniqueness and associations. It is not outstanding work.

## Next direction

The bounded Music Theory, Fretboard and Playability v1 efforts are complete. The accepted direction is a useful non-AI application interface over those contracts, followed later by AI orchestration. No concrete UI implementation plan is approved by this documentation cleanup. Application execution placement, state, rendering and error presentation need decisions within that effort; see [open architectural questions](ARCHITECTURE.md#open-architectural-questions).

Use the [plan index](../plans/README.md) to distinguish active efforts from completed records. Historical test counts, old source paths, and a plan's original exclusions are evidence about that increment, not current capability limits. The [onboarding investigation](../plans/developer-onboarding.md#archived-documentation-investigation) retains its dated discrepancy findings and verification results.
