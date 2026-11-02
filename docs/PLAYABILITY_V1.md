# Playability v1: movable templates and assessment

Playability combines reusable geometry, independent execution patterns, actual fretboard pitches and musical requirements. It searches placements of selected known templates, not arbitrary new shapes or finger assignments. [D056](DECISIONS.md#d056-reusable-playability-templates-and-bounded-placement-search) records the accepted boundary; the [ExecPlan](../plans/playability-engine-v1.md) records verification.

## Deterministic path

1. Music Theory supplies a numeric or spelled chord description and optional bass/omission/exact-voicing requirements.
2. Playability places selected geometry and relative finger contacts within the requested anchor range.
3. Fretboard resolves each sounding location using the explicit board tuning.
4. The existing witness validator checks concrete contacts, every barre string, required stops and open-string clearance.
5. Assessment checks musical content and independent reviewed-pattern support.

No UI, AI, network or Node APIs participate in this path. Both direct application interaction and later AI orchestration can call the same functions.

## Finding A-flat and D-major examples

Use direct relative `.js` imports in TypeScript, as elsewhere in the repository. For a caller at the repository root:

```ts
import { createFretboard } from "./domain/fretboard/fretboard.js";
import { createSpelledChordDescription } from "./domain/music-theory/chords-symbols-and-realization/chord-descriptions.js";
import { triadFormula } from "./domain/music-theory/chords-symbols-and-realization/triads.js";
import { findChordTemplateFingerings } from "./domain/playability/template-search.js";

const board = createFretboard(
  [52, 47, 43, 38, 33, 28].map((openPitch, i) => ({ id: i + 1, position: i + 1, openPitch })),
  24,
);
const results = findChordTemplateFingerings(board, {
  description: createSpelledChordDescription({ letter: "A", accidental: -1 }, triadFormula("major")),
}, {
  templateIds: ["closed-e-major"],
  anchorRange: { min: 1, max: 12 },
});
// One result at anchor 4, with recommendationEligible true on its assessment.
```

The board is explicit, not an engine default. Relative shape names describe patterns, not a permanently assigned chord identity.

| Request | Template | Anchor | Frets 6 → 1 | Fingers 6 → 1 |
| --- | --- | --- | --- | --- |
| A♭ major | closed-e-major | 4 | 4 6 6 5 4 4 | 1 3 4 2 1 1 |
| A♭ minor | closed-e-minor | 4 | 4 6 6 4 4 4 | 1 3 4 1 1 1 |
| D major | closed-c-major | 2 | x 5 4 2 3 2 | x 4 3 1 2 1 |

These positions are computed from templates. They are not stored as new absolute reference placements. Wider ranges may include further octave-displaced placements.

## Geometry and execution contracts

`ChordShapeFormula` contains only states and relative sounding offsets. Closed formulas normalize their lowest selected sounding fret to offset zero and require a positive anchor. Open forms retain actual open strings and anchor zero.

`FingeringTemplate` contains an ID, formula association and complete relative contacts: finger 1–4, signed safe-integer offset, and inclusive physical-position interval. A negative contact offset is allowed for a hidden barre beneath the geometry anchor. `createFingeringTemplate` validates representation and association; duplicate finger duties and other simultaneous contradictions are findings from concrete witness validation.

`instantiateTemplateFingering(board, formula, template, anchor, instanceId, witnessId?)` returns an instance and a witness-validation finding. It uses checked addition and existing geometry/contact validators. Malformed representations, mismatched formula association, unsafe coordinates and unavailable placements throw `RangeError`; contact contradictions return an invalid validation finding. `templateAnchorBounds` returns the inclusive available anchors or null, accounting for all contacts as well as geometry.

Multiple templates can use the same geometry. Neither contacts nor review evidence enter geometry identity. Returned objects are copied and readonly by type, not frozen.

## Explicit CAGED variants

`referenceClosedCagedVariants()` lists the five explicit major-form associations. `closedCagedFingeringTemplate(openTemplateId)` returns the closed template or throws when no variant is defined. It does not convert supplied geometry or guess new fingers.

| Open template | Closed template | Closed formula |
| --- | --- | --- |
| open-c-major | closed-c-major | shape-13 |
| open-a-major | closed-a-major | shape-06 |
| open-g-major | closed-g-major | shape-07 |
| open-e-major | closed-e-major | shape-08 |
| open-d-major | closed-d-major | shape-09 |

The catalog also contains closed-a-minor, closed-e-minor and closed-d-minor. There are 13 geometry formulas and 13 fingering templates. The original 13 documented placements and absolute witness getters remain compatible; absolute witnesses are derived from template offsets. F major and E-shaped C share one relative geometry/execution pattern.

### Closed C variant

The user-approved movable-template revision adds this pattern separately from the historical Playability Reference rows. Geometry in string 6 → 1 order is `x f3 f2 f0 f1 f0`. Finger 1 holds offset 0 over positions 1–5; fingers 2, 3 and 4 hold offsets 1, 2 and 3 at positions 2, 4 and 5 respectively. At anchor 2 this produces the documented acceptance result D major. No absolute D-major placement is needed.

## Assessment and support

`assessChordShape(board, instance, requirements, witnesses?)` returns separate structural, musical and physical-support findings, individual witness findings, copied requirements and `recommendationEligible`.

- Invalid structure makes musical and physical findings not-assessed.
- Music matches when required roles are covered, no unexpected tones occur, and specified bass agrees. An unspecified bass does not require root position. Empty sounding geometry is mismatched.
- `exactVoicing` accepts either existing registered pitches or registered notes. It requires full register/multiplicity equality and reports original occurrence-to-sounding-location indices, in request order. Optional formula roles do not relax an exact request. Original spellings are preserved; spelled descriptions with spelled exact voicings additionally use exact written membership analysis.
- Omitted witnesses instantiate only matching reviewed patterns. An explicit empty list supplies no witnesses. Each explicit witness is validated independently; one invalid witness does not veto another valid one.
- Physical support requires actual normalized geometry and all finger identities/offsets/barre extents to match a reviewed pattern. IDs, provenance and caller claims do not confer approval. Musical mismatch does not erase physical support.

`referenceTemplateReviews()` governs movable-pattern support across compatible six-string boards regardless of tuning, with concrete availability/contact validation at every placement. Historical `referenceFingeringReviews()` retains its original standard-tuning source context for compatibility; it is not the new movable-support policy.

Support means support within the declared discrete pattern model, not proof of individual reach, comfort or universal human feasibility. Unknown patterns remain unverified. Recommendation eligibility requires valid geometry, matching music and at least one supported valid execution.

## Search bounds and extension

Search requires unique known template IDs and an ordered inclusive anchor range within the board. It validates inputs even for an empty selection. Availability is intersected with both geometry and contact bounds; open templates are considered only at zero. The range describes anchors, not a clipping region for all sounding frets.

`MAX_TEMPLATE_SEARCH_PLACEMENTS` is 10,000. The budget counts available template/anchor pairs before musical filtering, using BigInt arithmetic. Oversized searches throw before enumeration; no partial/truncated result is returned. Results sort by anchor, formula ID and template ID and preserve alternative witnesses. No match returns an empty array.

An optional `TemplateCatalog` supplies copied, validated formulas and execution templates for custom/future shapes. It cannot grant trusted support. Search returns contact-valid musical matches, including unreviewed candidates with recommendation eligibility false. Consumers that require only recommendations must filter on that field.

Extended, altered and custom musical formulas use the same existing Music Theory analysis. New geometry and execution patterns can be added as data; v1 does not derive missing patterns, solve arbitrary fingerings, rank ergonomics, establish muting techniques, or model transitions, thumb fretting or individual hands.
