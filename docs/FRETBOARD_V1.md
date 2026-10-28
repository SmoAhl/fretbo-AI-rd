# Fretboard Engine v1: supported contracts and Playability handoff

Fretboard v1 provides deterministic pitch-location mapping for an explicitly configured discrete fretboard. This guide covers the implementation at `e8f988b`, including required physical string positions. [D054](DECISIONS.md#d054-explicit-fretboard-and-bounded-pitch-location-searches) and [D055](DECISIONS.md#d055-explicit-physical-string-positions) own the accepted contracts; [Architecture](ARCHITECTURE.md#fretboard-v1-implementation) describes their implementation and boundaries. The [Fretboard Reference](FRETBOARD_REFERENCE.md) supplies instrument knowledge. This guide defines no new API or Playability policy. Review findings and fresh verification are recorded in the [readiness review](../plans/fretboard-v1-readiness.md).

## Public types and input requirements

Import directly from [domain/fretboard/fretboard.ts](../domain/fretboard/fretboard.ts), using a relative `.js` specifier in TypeScript as elsewhere in the domain. The module has no UI, AI, framework or Playability dependency; it reuses Music Theory's pitch types and checked arithmetic.

| Export | Contract |
| --- | --- |
| `StringId` | A `number` alias, validated as a positive safe integer. IDs are unique within a board; they need not be contiguous or describe physical order. |
| `FretboardString` | Readonly `{ id, position, openPitch }`. `position` is an integer ordinal; all strings together must cover `1..strings.length` exactly once. `openPitch` is a registered sounding coordinate. |
| `Fretboard` | Readonly `{ strings, fretCount }`, with a nonempty dense readonly string array and a common nonnegative safe-integer fret count. Frets `0..fretCount` are available, inclusive. Zero frets is valid. |
| `FretboardLocation` | Readonly `{ stringId, fret }`. The ID must exist on the supplied board and the fret must be an available nonnegative integer. Fret 0 means open, not muted or unplayed. |
| `FretboardPitchLocation` | A location plus readonly `pitch: RegisteredPitch`; each result identifies a location and its sounding coordinate. |
| `FretRange` | Readonly `{ min, max }`, both nonnegative safe integers, with `min <= max <= fretCount`. A single-fret range is valid. |
| `FretboardSearchRegion` | Readonly optional `stringIds` and `frets`. Each omitted or explicitly `undefined` field is unrestricted. A supplied ID array must be dense, distinct and contain only existing IDs; `[]` selects no strings. A supplied fret range includes both endpoints. |
| `MAX_FRETBOARD_SEARCH_RESULTS` | `10_000`, a per-call search output limit, independent of instrument size. |

`RegisteredPitch` is Music Theory's safe-integer semitone coordinate with **C0 = 0**, so C4 = 48 and D3 = 38; it is not a MIDI note number. Negative coordinates are valid. `PitchClass` is an integer in `0..11`, with C = 0, discarding register. Each board's open pitches and highest pitches (`openPitch + fretCount`) must be safe integers. This ensures all intermediate locations are representable. Neither tuning, string count, positions nor fret count has a default.

## Operations and output guarantees

| Operation | Result |
| --- | --- |
| `createFretboard(strings, fretCount): Fretboard` | Validates and independently copies the array and each string record, sorted by ascending ID. Retuning is represented by constructing another board with the same IDs and positions and changed open pitches. |
| `registeredPitchAtLocation(board, location): RegisteredPitch` | Validates the whole board and selected location, then returns the identified string's open pitch plus fret. |
| `findRegisteredPitchLocations(board, pitch, region?): readonly FretboardPitchLocation[]` | Every matching location for one exact registered coordinate, at most one per string. No octave substitution. |
| `findPitchClassLocations(board, pitchClass, region?): readonly FretboardPitchLocation[]` | Every matching location across available registers, retaining each location's exact sounding pitch. |

Search results are complete within the requested region, ordered by ascending string ID and then fret. This is deterministic ordering, not physical order or preference ranking. Valid absent targets and empty selections return `[]`. Different strings sounding the same pitch remain distinct alternatives. Search results do not select one location, combine multiple queries, or assign a simultaneous chord.

Every operation accepts valid structural board records as well as factory outputs and validates the entire board, including unselected strings. All input arrays/records are preserved. Factory outputs and search arrays/records are fresh, independent and readonly **by TypeScript type**, without runtime freezing. Consumers must respect that contract; a deliberate mutation through JavaScript or a cast is possible and a later query revalidates the board.

Invalid boards, locations, targets and regions throw `RangeError`, including missing/duplicate positions, sparse arrays, unknown/duplicate selected IDs, null regions, reversed ranges and out-of-board bounds. Regions are never clipped. Board, target and region validation still applies to an empty selection. Numeric string IDs, frets and pitches are not parsed from text or coerced. Unknown extra record fields are not an error and are not preserved by the factory or searches; these operations are not an external-data schema validator.

All numeric coordinates obey JavaScript's safe-integer bounds (`-9,007,199,254,740,991..9,007,199,254,740,991`); IDs are positive and frets/counts are nonnegative. Exact internal `BigInt` differences and counting avoid rounding when valid endpoints have a difference outside that range. Searches count matches before allocating result records: exactly 10,000 succeeds, more throws `RangeError` with no partial results. This cap does not prohibit larger valid boards or their direct/narrow queries. Exact search computes differences per string; class search steps by twelve frets between matches. The cap bounds returned locations, not the number of strings validated, total work across calls, or future combinations of chord alternatives.

## Identity, physical order and sounding location

A string's stable ID answers **which string**; `position` answers **where it lies across the neck**. Position 1 starts at the designated first-string edge, conventionally the standard high-E edge of a guitar. Increasing positions move toward the opposite edge; consecutive positions are adjacent. Retuning, reentrant tuning, handedness and display mirroring do not redefine this convention. Position is an ordinal, not a measured distance.

For example, strings with `(id, position)` pairs `(90, 1)`, `(4, 2)`, `(20, 3)` are stored in ID order `4, 20, 90`; physical order is `90, 4, 20`. Resolve a result's `stringId` against its board to recover position and tuning. To traverse physically, sort a copy of the board's strings by position. Never treat numeric ID differences or result-array adjacency as physical string adjacency. The board supplies all strings between barre endpoints, including those not present in a search's results.

Standard tuning on frets 0..12 illustrates the register distinction: D3 (38) occurs at `(4,0)`, `(5,5)` and `(6,10)` when IDs follow conventional string numbering. Searching pitch class D (2) also includes D4 and D5, yielding seven locations in total. Enharmonic B-sharp3 and C4 share sounding coordinate 48 and therefore locations, while their original spellings remain different. These are fixtures, not built-in presets.

Alternative registered tunings, repeated open pitches, non-monotonic pitch order, noncontiguous IDs, one or seven strings, and zero-fret boards fit the same contract. There is no six-string restriction or inferred pitch ordering.

## Information Playability must retain

Fretboard searches return only `{ stringId, fret, pitch }` records. These do not carry the original musical object, formula positions, tone occurrence indices, physical positions, tuning, selected contacts or a playability verdict. Keep the board and original [Music Theory objects](MUSIC_THEORY_V1.md#information-to-retain-at-the-fretboard-boundary) available alongside mapping results.

| Information | Why the consumer needs it |
| --- | --- |
| Board, stable IDs and physical positions | Resolve tuning and available bounds; determine adjacency and all intervening strings for contact/barre checks. Use the same configuration for mapping and validation. |
| Exact pitches and selected locations | Verify each proposed sounding location with `registeredPitchAtLocation`; keep the chosen assignment separate from all alternatives. Class membership cannot establish a requested register. |
| Original description and ordered formula | Preserve root, compound roles and per-position requirements. Roles 2/9 can map to the same class without becoming the same musical role. |
| Required bass and register | Preserve any specified unregistered bass and any exact registered-bass/voicing requirement. Actual bass is the lowest sounding coordinate, not the first result or lowest string ID. Unspecified bass does not mean root position. |
| Every original tone occurrence | Retain source indices, repeated tones and voicing multiplicity. Two requested C4 occurrences cannot be satisfied by reusing one sounding string/location twice. Keep unavailable occurrences visible with empty alternatives. |
| Explicit optional formula positions | Preserve the caller's `optionalFormulaIndices` with the unchanged formula. All unlisted positions remain required; awkward locations do not authorize omissions. Formula optionality alone does not authorize deleting an occurrence from an explicitly requested registered voicing. |
| Original spelling and musical metadata | Numeric pitches cannot reconstruct spelling, tonic, collection, degree roles or interpretation intent. Retain supplied notes and metadata, including enharmonic distinctions when exact-spelled analysis is required. |

The existing integration suite demonstrates this composition locally: map each source occurrence separately and keep its index and original note alongside alternatives. It retains chord description, specified bass and explicit optional positions without introducing a production request wrapper. D052 chord coverage and D053 identification remain useful musical views, but neither proves that the original registered voicing and multiplicity survive a selected assignment.

## Responsibility boundaries and simultaneous realization

| Domain | Responsibility |
| --- | --- |
| Music Theory | Musical identity, pitch/register/spelling, formulas, descriptions, supplied voicings and existing coverage/bass analysis. |
| Fretboard | Explicit strings, physical order, registered tuning, available frets and sounding pitch-location alternatives. |
| Future Playability | Validate proposed simultaneous realizations and their string states, finger contacts, barres and shared grip; compare supported valid fingerings for practical recommendations. |

Individual availability is insufficient. On one string tuned to D3 with two frets, both D3 at fret 0 and E3 at fret 2 exist, but they cannot sound simultaneously on that string under the ordinary model. Likewise, two distinct requirements must not silently share one sounding occurrence. A selected location assignment still lacks finger/contact evidence; it is not automatically a playable grip.

The [Playability Reference](PLAYABILITY_REFERENCE.md) distinguishes open/fretted sounding, muted and unplayed states, higher stops overriding lower barre stops, and one finger's compatible duties within a complete grip. Fretboard's `fret: 0` represents only an open location and encodes none of these simultaneous contact semantics. Reference heuristics and CAGED examples are not implemented validators or ranking weights. Scales and melodies currently require note locations only.

## Limitations and next implementation prerequisites

No chord-location assignment, fingering representation, candidate generator, contact/barre validator, shared-grip validator or ergonomic ranker exists. Ownership of automatic candidate generation, initial selection and the playability guarantee remains an [open architectural question](ARCHITECTURE.md#open-architectural-questions). This guide does not assign enumeration to either engine or invent a search/voicing architecture.

Capos and partial capos, per-string fret ranges, courses, harmonics, bends, microtonal mapping, tuning presets and physical geometry remain unimplemented. Arbitrary voicing generation, automatic guitar-specific omissions, melodic fingering/transitions, UI, AI and audio are also outside this boundary. Alternative tunings and explicit string counts are already supported and should not be confused with those deferred features.

**Readiness assessment:** no blocking Fretboard contract defect was found. A separately authorized Playability effort can use these instrument facts to validate explicitly supplied candidates. Its first implementation must define the candidate/contact and string-state representation, how source occurrences and exact musical requirements are preserved, and the supported hard grip rules and recommendation criteria. Those are unresolved Playability design prerequisites, not missing pitch-mapping operations. Candidate-generation ownership must be resolved before implementing a generator; it need not be resolved merely to validate supplied candidates.

## Readiness evidence

- [Fretboard unit tests](../tests/fretboard.test.ts) cover explicit/alternative boards, ID versus physical order, all four operations, strict malformed-input rejection, safe endpoints and overflow, 10,000/10,001 boundaries, copy isolation and readonly types. Pitch-class search is compared with an independent exhaustive oracle across five tunings, five board bounds, five regions and all twelve classes.
- [Fretboard/Music Theory integration tests](../tests/fretboard-music-theory.test.ts) cover D natural-minor metadata and 47 locations, an exact registered run, enharmonic sources, repeated/unavailable occurrences, a same-string simultaneous-realization counterexample, and retained chord/bass/omission inputs.
- [Music Theory readiness tests](../tests/music-theory-readiness.test.ts) cover the existing musical producer paths. Type checking verifies the readonly and required-field assertions that runtime tests alone cannot establish.

Historical implementation results belong to the [original v1 plan](../plans/fretboard-engine-v1.md) and [D055 string-ordering plan](../plans/fretboard-string-ordering.md). The [2026-10-28 readiness review](../plans/fretboard-v1-readiness.md#artifacts-and-notes) separately records fresh focused tests, full regression, type checking, environmental retries and documentation checks at the reviewed HEAD. No production or test files were changed. The nonblocking coverage recommendation is an independent bounded exact-pitch search oracle to complement its existing explicit fixtures; it is not a discovered behavior defect or an added test in this review.
