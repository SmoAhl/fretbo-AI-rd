# Implementation status, discrepancies and remaining work

[Onboarding index](README.md) · Previous: [Examples](end-to-end-examples.md)

This snapshot was established from source, tests and current accepted decisions on **2026-11-11**, with implementation baseline `1ad31b3` (`feat(playability): add movable fingering templates and validated chord search`). The working tree was clean before this documentation effort. “Implemented v1” means the bounded contract is complete, not that the whole intended product or every musical/instrument capability exists.

## Implemented capabilities

| Area | Confirmed implementation | Principal evidence |
| --- | --- | --- |
| Application/tooling bootstrap | One private ESM Next.js package, React layout/page, Tailwind/shadcn styling foundation, strict TypeScript, Node Vitest environment. | [package.json](../../package.json), [app/page.tsx](../../app/page.tsx), [bootstrap tests](../../tests/bootstrap.test.ts) |
| Pitch foundations | C-based classes; C0-based registered coordinates; explicit spelling through triple accidentals; parsing/formatting and explicit reverse policies. | [Pitch subject folder](../../domain/music-theory/pitch-pitch-classes-and-spelling/), [foundation chapter](music-theory-engine.md) |
| Intervals | Number/quality/direction validation, exact spelled transposition, registered distance/identification, supported simple inversion and text. | [Interval modules](../../domain/music-theory/intervals-and-transposition/), [measurement tests](../../tests/interval-measurement.test.ts) |
| Collections | Thirteen `ScaleType` identifiers, fixed harmonic/melodic-minor modes, relative derivation, bounded registered runs, explicit melodic-minor conventions and separate numeric chromatic helper. | [Scale modules](../../domain/music-theory/scales-and-modes/), [collection chapter](collections-and-keys.md) |
| Degrees and keys | Simple major-relative formulas, ordinal queries, 98 explicit major/minor key identities, 30 conventional signatures, relative/parallel relationships and narrow key-aware spelling. | [Degree/key modules](../../domain/music-theory/degrees-keys-and-spelling/), [key tests](../../tests/keys.test.ts) |
| Chord content | Custom formulas, 37 named qualities, numeric/spelled descriptions, seven-note collection harmonization and bounded symbols. | [Chord modules](../../domain/music-theory/chords-symbols-and-realization/), [chord chapter](chords-and-voicings.md) |
| Registered chords | Explicit supplied voicings; root-position realization; known-chord coverage, bass, inversion, doubling and spacing; exact catalog identification. | [Readiness tests](../../tests/music-theory-readiness.test.ts), [Music Theory v1](../MUSIC_THEORY_V1.md) |
| Fretboard | Explicit tuning/counts/positions, direct pitch lookup, exact-pitch and class searches, strict regions, safe arithmetic and complete bounded output. | [Implementation](../../domain/fretboard/fretboard.ts), [unit tests](../../tests/fretboard.test.ts), [integration tests](../../tests/fretboard-music-theory.test.ts) |
| Playability geometry and contacts | Complete relative/concrete geometry, structural resolution, independent witnesses, inclusive barres, highest-stop/open-string rules and contact span. | [Geometry](../../domain/playability/chord-shape-formula.ts), [resolver](../../domain/playability/chord-shape.ts), [witness validator](../../domain/playability/fingering-witness.ts) |
| Movable Playability v1 | Thirteen geometry/template pairs, five explicit closed CAGED variants, thirteen historical placements, bounded selected-template search, music/exact-occurrence assessment and independent reviewed-pattern support. | [Search](../../domain/playability/template-search.ts), [assessment](../../domain/playability/playability.ts), [integration tests](../../tests/playability.test.ts), [D056](../DECISIONS.md#d056-reusable-playability-templates-and-bounded-placement-search) |

There is no other implemented musical domain hidden behind the UI bootstrap. The remaining supporting abstraction, [lib/utils.ts](../../lib/utils.ts), is a presentation class utility. Test helpers and private interval/run/catalog helpers serve the capabilities described above; they are not additional product engines.

## Partial product areas and intentionally missing behavior

| Broader area | Existing boundary | Missing behavior |
| --- | --- | --- |
| Complete interactive workbench | Framework/page/style bootstrap and independently callable domain. | Product controls, interactive React/SVG fretboard, application operations/state, composition workflows and domain-to-UI wiring. |
| General music interpretation | Explicit inputs, exact formula/collection construction and exact catalog identification. | Key/context inference, harmonic function, Roman numerals, missing-root/approximate identification, preference-ranked names. |
| Full notation/spelling | Supported note/interval/degree/scale/chord grammar and explicit policies. | General alteration language, arbitrary custom chord symbols, key text, theoretical signatures, registered key-aware output, contextual spelling candidates/fallbacks and engraving. |
| General scale traversal | Fixed supported collections and explicit positive-octave directional runs. | Arbitrary pitch bounds, custom scales, chromatic spelling/degrees/runs, combined-leg API and global turning-note/output policy. |
| General chord realization | Full-role root-position constructor and supplied-voicing analysis. | Arbitrary voicing/inversion generation, automatic guitar omissions, voice leading and extended-chord inversion naming. |
| Instrument features | Discrete strings with common frets and explicit tuning. | Presets, capos/partial capos, per-string ranges, courses, harmonics, bends, microtonal mapping and measured geometry. |
| General practical fingering | Known-pattern enumeration, concrete contacts and reviewed-pattern eligibility. | Shape derivation from arbitrary tone/location lists, finger solving, generalized span/reach heuristic evaluation, ergonomic scores/ranking, active muting, thumb fretting, hand profiles and transitions. |
| Full-stack/AI/audio integration | Next.js chosen as application boundary. | Persistence, authentication, backend musical operations, AI tools/providers, audio/MIDI and deployment setup. Technology choices for these remain open. |

These limits come from the [architecture's current direction](../ARCHITECTURE.md#current-direction-and-later-capabilities), [open questions](../ARCHITECTURE.md#open-architectural-questions), v1 guides and accepted decisions. They are not a newly prioritized backlog. Some are explicit deferrals; others remain possibilities whose scope has not been selected.

## Integration boundaries that already work

Music Theory → Fretboard is exercised by tests that retain exact notes, roles and occurrences alongside alternatives. Fretboard → Playability is implemented by structural resolution and witness checks. Music Theory ↔ Playability composition is implemented in assessment: Playability supplies actual board pitches to the existing known-chord analyzer and separately enforces exact registered occurrences. Known-template candidate generation now explicitly belongs to Playability.

What remains open is **general** voicing/shape generation beyond templates, plus application execution placement and state coordination. “Candidate generation is undecided” without that qualifier is no longer a complete current description. No UI or AI integration should be inferred from passing domain integration tests.

## Documentation discrepancies discovered

The investigation found status drift and historical wording that can mislead a newcomer. These findings are recorded here; the task does not repair source behavior, tests or historical records. Existing documents receive navigation links only.

| Location | What a reader encounters | Current evidence and interpretation |
| --- | --- | --- |
| [Root README: Project status](../../README.md#project-status) | Playability is called unimplemented; representations/validation are described as future work. | Seven Playability modules, their five suites, [D056](../DECISIONS.md#d056-reusable-playability-templates-and-bounded-placement-search) and [Playability v1](../PLAYABILITY_V1.md) establish implemented templates, contacts, search and assessment. The README now points newcomers to this guide; its older detailed status text remains recorded as stale. |
| [Architecture: Fretboard implementation](../ARCHITECTURE.md#fretboard-v1-implementation) | The subsection ends by listing chord generation/fingerings among deferred capabilities. Later Playability sections implement a bounded subset. | Read that exclusion as the Fretboard module's boundary. Repo-wide, known-template search and witnesses exist; general shape/fingering generation and ranking remain absent. |
| [Music Theory v1: composition rules](../MUSIC_THEORY_V1.md#composition-rules-and-deliberate-information-loss) | A future realization consumer must check exact pitches/multiplicity. | Still true as a responsibility statement; [Playability assessment](../../domain/playability/playability.ts) is now that consumer for supplied shapes through `exactVoicing`. The guide's original readiness review predates it. |
| [Playability Reference: use in checks](../PLAYABILITY_REFERENCE.md#use-in-playability-checks) | “A future engine should accept” the documented reference assignments. | The current source/tests now accept those assignments after actual validation. Reference span/reach guidance still must not be mistaken for a general implemented heuristic evaluator. |
| [Architecture: accepted technology](../ARCHITECTURE.md#accepted-technology-foundation) and root technology table | React/SVG visualization appears among selected technologies. | It is an accepted choice under D017, not an existing renderer; [the page](../../app/page.tsx) remains generic. |

The reference mentions a D7(sharp-11) musical convention while the parser accepts the complete catalog form `D9(#11)`. This is a **documented scope difference**, not a discovered parser bug: [the reference](../MUSIC_THEORY_REFERENCE.md#purpose-and-scope) explicitly says its examples do not define grammar, and [D050](../DECISIONS.md#d050-bounded-chord-symbol-grammar-and-canonical-formatting) deliberately selects the explicit ninth form.

Likewise, no new code/test contradiction was established in the reviewed current contracts. That is the outcome of this documentation investigation, not a claim that every future integration or arbitrary untrusted input has been audited.

## Reading historical decisions and plans correctly

Earlier accepted records describe the limits at their increment. [D039](../DECISIONS.md#d039-triple-accidentals-and-degree-alterations) extends older ±2 accidental limits to ±3, increasing supported spellings and key identities. D043/D044 supersede the older four-triad/eight-seventh catalogs. Later realization, analysis and identification decisions add features that their predecessors explicitly excluded.

The [Playability plan](../../plans/playability-engine-v1.md) retains Milestone 1's 12 formulas, Milestone 2's absolute witnesses, and original fixed-placement restrictions as history. Its revised outcomes and current source contain 13 formulas/templates and completed Milestones 2b–4. Historical reference reviews retain standard-tuning context; D056's separate movable-template reviews apply across compatible six-string tunings. Neither the old count nor the old tuning-only restriction describes current support.

Some completed plans retain paths from before the [Music Theory folder reorganization](../../plans/music-theory-folder-organization.md). Follow this guide's source links for current locations. Historical test totals and environment retries are evidence for those runs, not current failures or current counts.

## Known maintenance and verification follow-ups

Two concrete maintenance concerns are already documented:

1. **Reference geometry IDs depend on array order.** [reference-grips.ts](../../domain/playability/reference-grips.ts) derives `shape-01` etc. from `patterns` indices while placements/templates refer to fixed IDs. Reordering or inserting entries can change associations. The [Playability plan](../../plans/playability-engine-v1.md#progress) explicitly defers storing stable IDs and adding uniqueness/reference checks. Current fixture tests protect existing mappings; no incorrect current placement was found.
2. **Errors do not distinguish all caller mistakes from representation limits.** `RangeError` covers both invalid requests and valid musical operations outside supported spelling/numerical bounds. The [architecture TODO](../ARCHITECTURE.md#deferred-music-theory-improvements) says to revisit classification before UI or AI tool exposure. There is no structured error-code system yet, and typed low-level inputs are not a universal external validation layer.

Separately, the [Fretboard readiness review](../../plans/fretboard-v1-readiness.md#surprises--discoveries) recommends an independent bounded exact-pitch search oracle, analogous to the existing pitch-class oracle. Exact search already has fixtures, permutation, region, overflow and cap tests. This is a coverage recommendation, not an observed defect; no tests were added here.

## Next steps according to existing plans

The bounded Music Theory readiness effort, Fretboard v1/readiness effort, and revised Playability v1 implementation are complete. There is no unfinished numbered Playability implementation milestone to resume. The explicit unchecked Playability item is the stable-reference-ID maintenance above, which remains separately scoped.

The accepted construction direction is now toward a useful **non-AI application interface** over supported deterministic contracts, followed later by AI orchestration. That follows [D004](../DECISIONS.md#d004-domain-first-construction), [D015](../DECISIONS.md#d015-nextjs-as-the-full-stack-application-boundary) and the [current direction](../ARCHITECTURE.md#current-direction-and-later-capabilities); it is not a newly approved UI plan. A concrete effort still needs decisions about application state, operation placement, rendering data/interaction and error presentation. Extended inversion naming, general generation ownership, hard grip limits and ranking criteria also remain open when relevant work is authorized.

A new developer can safely investigate these boundaries, propose a bounded change and its acceptance evidence, and use the [ExecPlan threshold](../../AGENTS.md#planning-and-execplans). A deferred item is not permission to implement it as an incidental cleanup.

## Verification of this guide

The documentation investigation inspected all 38 production domain modules, the app/tooling bootstrap, important unit/integration tests, all three references, architecture/decisions, v1 handoffs and relevant effort histories. Source and assertions establish behavior; accepted decisions establish intent. Seven standalone TypeScript walkthroughs were extracted from the Markdown, compiled with strict TypeScript/NodeNext options and executed with assertions against a temporary copy of the unchanged domain.

Fresh checks on this snapshot:

| Check | Result |
| --- | --- |
| `npm test` | 41 suites, 17,870 tests passed. |
| `npm run typecheck` | Next type generation and both TypeScript checks passed. |
| Seven documentation walkthroughs | Strict compilation and every runtime assertion passed. |
| Catalog and prose examples | All 37 formula/suffix rows, 13 scale identifiers, 98 key identities, 30 signatures, 92 relative-key successes and additional pitch/interval/voicing examples matched execution. |

Execution used installed Node **24.19.0** and npm **11.6.2**, within the Node `24.x` engine range but older than the `.nvmrc` 24.21.0 and manifest npm 11.19.0 pins. No environment/dependency upgrade was performed. `.npmrc` enables strict engine checks and exact dependency saving.

The [documentation ExecPlan](../../plans/developer-onboarding.md) records final link, reference, Markdown whitespace and scope-review results. No dedicated Markdown checker is configured. No production build or UI check was needed/run for this Markdown-only change, and no anatomical or ergonomic validation is claimed. Unsettled future policies are explicitly marked; no implemented domain area had to be omitted for lack of source evidence.
