# Fretboard Engine

[Onboarding index](README.md) · Previous: [Chords and voicings](chords-and-voicings.md) · Next: [Playability](playability-engine.md)

The Fretboard Engine answers location questions on an explicit discrete instrument. It has no built-in guitar preset and makes no chord or fingering judgment. Its entire implementation is [domain/fretboard/fretboard.ts](../../domain/fretboard/fretboard.ts), importing only Music Theory pitch types, checked registered transposition and class extraction.

The underlying rule is simple: each fret raises the open-string pitch by one semitone. Most of the engineering work makes that rule reliable for arbitrary valid configurations, strict regions, safe numerical boundaries and complete deterministic results. [D054](../DECISIONS.md#d054-explicit-fretboard-and-bounded-pitch-location-searches) and [D055](../DECISIONS.md#d055-explicit-physical-string-positions) own the contracts.

## Instrument data is explicit

`createFretboard(strings, fretCount): Fretboard` takes a nonempty dense array of `FretboardString` records:

```ts
{ id: StringId; position: number; openPitch: RegisteredPitch }
```

`StringId` is a number alias validated as a unique positive safe integer. `position` is a physical ordinal; the complete board must cover 1 through its string count exactly once. `openPitch` is a registered coordinate, not a pitch class. `fretCount` is a nonnegative safe integer shared by all strings. Available frets are **0 through fretCount inclusive**, with zero denoting open. A zero-fret board is valid.

For the conventional six-string fixture, IDs happen to equal physical positions:

| Physical position / conventional string | 1 | 2 | 3 | 4 | 5 | 6 |
| --- | --- | --- | --- | --- | --- | --- |
| Open sounding note | E4 | B3 | G3 | D3 | A2 | E2 |
| C0-based coordinate | 52 | 47 | 43 | 38 | 33 | 28 |

The [executable examples](end-to-end-examples.md#5-pitches-and-chord-tones-become-location-alternatives) construct this fixture explicitly. The engine never assumes it. Retuning means constructing a board with the same IDs/positions and different pitches. Repeated open pitches, reentrant tuning (physical order not monotonic in pitch), negative registered pitches, noncontiguous IDs and different string counts are supported.

Each string's open pitch and highest pitch `openPitch + fretCount` must be safe integers. Since the discrete mapping increases monotonically by one, safe endpoints ensure every intermediate pitch is safe. This is numerical representability, not a restriction to common guitar registers.

## Three orders must not be conflated

1. **Stable ID** identifies a string across operations and retuning.
2. **Physical position** determines adjacency across the neck.
3. **Pitch order** follows the actual tuning and frets.

Position 1 begins at the designated first-string edge, conventionally the standard high-E edge. Increasing positions move toward the opposite edge. Those edge names describe the conventional reference, not a requirement about the current pitches. Handedness and screen mirroring do not reverse this instrument-relative convention.

For strings `(id, position) = (90,1), (4,2), (20,3)`, factory storage is IDs `[4,20,90]`, while physical traversal is `[90,4,20]`. `createFretboard` copies and sorts by **ID**. Searches also sort by ID then fret. A renderer or barre checker must recover each location's physical position from the board; adjacent result entries do not necessarily represent adjacent strings.

This separation permits retuning without changing identity, and permits presentation changes without changing musical coordinates. It also supplies Playability the previously missing fact of which strings lie between barre endpoints. Positions are ordinals, not measured millimetres.

## Direct lookup

`FretboardLocation` is `{ stringId, fret }`; `FretboardPitchLocation` adds `pitch`.

```ts
registeredPitchAtLocation(board: Fretboard, location: FretboardLocation): RegisteredPitch
```

The operation validates the whole board, validates the location, finds its string by ID, and delegates `openPitch + fret` to checked Music Theory transposition. On the standard fixture, string 6 fret 5 and string 5 fret 0 both sound A2 = 33. They remain different physical locations.

The engine does not attach note names. String 6 fret 2 sounds 30, which a caller may label F-sharp2 or G-flat2 according to retained musical intent. Fret 0 says only “open location”; it does not mean muted, unplayed or finger zero in a chord assignment.

## Exact-pitch and pitch-class searches

Both search functions return `readonly FretboardPitchLocation[]`:

```ts
findRegisteredPitchLocations(board, pitch, region?)
findPitchClassLocations(board, pitchClass, region?)
```

Exact-pitch search retains register. On the standard fixture with frets 0..12, D3 = 38 occurs at `(4,0)`, `(5,5)` and `(6,10)`. No D4 is an acceptable substitute.

Pitch-class D = 2 includes all available registers:

| String ID | Fret | Coordinate | Sounding note |
| --- | --- | --- | --- |
| 1 | 10 | 62 | D5 |
| 2 | 3 | 50 | D4 |
| 3 | 7 | 50 | D4 |
| 4 | 0 | 38 | D3 |
| 4 | 12 | 50 | D4 |
| 5 | 5 | 38 | D3 |
| 6 | 10 | 38 | D3 |

The repeated pitches are intentional alternatives. Every result retains its exact coordinate even in a class search. An unavailable valid target yields `[]`; it is not an error or a request to change octaves.

### Exact search algorithm

For each selected string, calculate `targetPitch - openPitch` using BigInt. If that fret lies within the inclusive search range, there is exactly one match on that string. Count matches before constructing results, then emit in ascending ID order. No fret scan is needed.

BigInt matters because two safe coordinates can have an unsafe Number difference. A huge negative or positive difference can be rejected as out of range exactly, without first rounding it or treating it as a valid fret. Conversion to Number occurs only for an available matching fret.

### Pitch-class search algorithm

For each string:

1. Calculate the class sounding at the region's minimum fret.
2. Compute `(targetClass - lowerClass + 12) % 12` to find the distance to the first match.
3. Set `first = minFret + distance`.
4. If `first <= maxFret`, count `floor((maxFret - first) / 12) + 1` matches.
5. After total-count validation, emit at `first, first+12, first+24, ...`.

Counting and stepping use BigInt, including the first step beyond the maximum safe fret. Thus an extreme upper bound cannot cause a rounded nonterminating loop. The algorithm enumerates matching frets, not every fret on the board. Validation/sorting still involves the supplied strings; output caps do not bound every possible cost of a huge input board.

## Search regions are strict

`FretboardSearchRegion` has two independent optional fields:

```ts
{ stringIds?: readonly StringId[] | undefined; frets?: FretRange | undefined }
// FretRange: { min: number; max: number }
```

Missing or explicitly undefined fields are unrestricted. `stringIds: []` validly selects no strings. A supplied list must be dense, unique and refer only to strings on the board. A supplied range must satisfy `0 <= min <= max <= fretCount`; both endpoints are included. A single-fret range is valid. Bounds are never clipped or repaired.

For D3 on the standard 12-fret fixture, `{ stringIds: [6,5], frets: { min: 5, max: 10 } }` yields `(5,5)` then `(6,10)`, regardless of selection-array order. A maximum fret of 13 throws. An invalid range still throws when the string selection is empty; empty results do not bypass request validation.

All four public operations validate structural board records, including records not built by the factory and unselected strings. Missing/duplicate positions, zero IDs, fractional/unsafe frets, null regions, sparse arrays, invalid targets and unsafe endpoint pitches are rejected with `RangeError`. Extra record fields are not a schema error, but the factory and location results do not retain them. These functions do not parse strings into numeric coordinates.

## Completeness, copying and bounds

`MAX_FRETBOARD_SEARCH_RESULTS` is 10,000 per call. Exactly 10,000 matches succeed; more throw before result allocation. No truncated prefix is returned. This cap is independent of valid board size, so a large board may support a narrow/direct query even when an unrestricted class search exceeds the budget.

Factory and search outputs are fresh, readonly by type and unfrozen. Inputs are preserved; sorting operates on copies. Stable ID/fret ordering supplies determinism and no preference score. A caller should not interpret the first result as easiest, lowest sounding, nearest to the hand or physically first.

## Locations are not a simultaneous grip

On a one-string board tuned to D3 with two frets, both D3 at fret 0 and E3 at fret 2 are available. They cannot sound simultaneously on that one string in the ordinary model. Likewise, two requested C4 occurrences cannot be fulfilled by assigning the same location twice.

Fretboard returns alternatives for **one target at a time**. It does not combine location lists, choose a chord voicing, validate coverage, assign fingers, infer barres, select omissions or rank candidates. Playability represents simultaneous string states and owns the implemented known-template search. General shape generation remains unimplemented.

When mapping a chord or registered run, retain the original description, optional formula positions, spellings, registered notes and source occurrence indices alongside locations. Class conversion loses register; set conversion loses repetition. The current engine offers no generic musical-request wrapper. The integration suite shows a test-local consumer retaining this information; Playability has its own concrete `ChordShapeRequirements` contract.

## Evidence and unsupported instrument features

[fretboard.test.ts](../../tests/fretboard.test.ts) covers all four operations, structural validation, independent ID/position order, reentrant tuning, negative pitches, copy isolation, safe endpoints and the exact cap. Its pitch-class oracle exhaustively scans bounded boards across tunings, fret counts and regions to check the optimized search independently. Exact-pitch search has explicit fixtures and boundary tests; the [readiness review](../../plans/fretboard-v1-readiness.md) recommends an analogous independent oracle as a nonblocking coverage improvement, not a confirmed defect.

[fretboard-music-theory.test.ts](../../tests/fretboard-music-theory.test.ts) verifies D natural-minor metadata alongside 47 locations, a registered D3 run, enharmonic sources, unavailable/repeated occurrences and the same-string counterexample. [Fretboard v1](../FRETBOARD_V1.md) is the concise consumer/handoff guide, and the [Fretboard Reference](../FRETBOARD_REFERENCE.md) explains the physical conventions.

Capos/partial capos, per-string fret limits, courses, harmonics, bends, microtonal frets, tuning presets and measured geometry are not implemented. Alternate explicit tunings and string counts already work; do not confuse those with the missing preset or specialized-instrument features.
