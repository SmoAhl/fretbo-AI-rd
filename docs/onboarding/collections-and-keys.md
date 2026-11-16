# Collections, degrees and keys

[Onboarding index](README.md) · Previous: [Pitches and intervals](music-theory-engine.md) · Next: [Chords and voicings](chords-and-voicings.md)

A **tonic** is the reference note of a scale or key. A **collection** is the selected ordered set of notes. A **mode** uses a particular tonic-relative pattern, often related to a rotation of another collection. A **key** is a tonal identity, not a promise that only one fixed collection can occur in the music.

These distinctions prevent two common mistakes: treating “minor” as one unambiguous scale, and treating a scale's array index as its major-relative interval role.

## Fixed scales share interval definitions

[scales.ts](../../domain/music-theory/scales-and-modes/scales.ts) stores private upward `SpelledInterval` patterns measured from the tonic. Both `scalePitchClasses(tonic, type)` and `scaleNoteSpellings(tonic, type)` consume those patterns. Numeric construction converts intervals to semitone offsets; spelled construction uses exact interval transposition.

The implemented `ScaleType` catalog is:

| Identifiers | Formula relative to major | Semitone offsets |
| --- | --- | --- |
| `major`, `ionian` | 1 2 3 4 5 6 7 | 0 2 4 5 7 9 11 |
| `natural-minor`, `aeolian` | 1 2 b3 4 5 b6 b7 | 0 2 3 5 7 8 10 |
| `harmonic-minor` | 1 2 b3 4 5 b6 7 | 0 2 3 5 7 8 11 |
| `melodic-minor-ascending` | 1 2 b3 4 5 6 7 | 0 2 3 5 7 9 11 |
| `dorian` | 1 2 b3 4 5 6 b7 | 0 2 3 5 7 9 10 |
| `phrygian` | 1 b2 b3 4 5 b6 b7 | 0 1 3 5 7 8 10 |
| `lydian` | 1 2 3 #4 5 6 7 | 0 2 4 6 7 9 11 |
| `mixolydian` | 1 2 3 4 5 6 b7 | 0 2 4 5 7 9 10 |
| `locrian` | 1 b2 b3 4 b5 b6 b7 | 0 1 3 5 6 8 10 |
| `major-pentatonic` | 1 2 3 5 6 | 0 2 4 7 9 |
| `minor-pentatonic` | 1 b3 4 5 b7 | 0 3 5 7 10 |

Here `b3` means one semitone below the major third from the tonic, not necessarily an E-flat or a note with a flat sign. F-sharp major must contain E-sharp as its seventh. A generic pitch-class-to-name policy might choose F instead, losing that role. Interval patterns avoid this loss and permit pentatonic patterns to skip letters deliberately.

Results are ordered from the tonic by collection degree, with no repeated octave tonic. Numeric classes may wrap: D natural minor is `[2, 4, 5, 7, 9, 10, 0]`, not a sorted set. Spelling can fail beyond the ±3 accidental limit while the numeric collection remains available. [D028](../DECISIONS.md#d028-seven-note-scales-modes-and-ordinal-degrees) and [D029](../DECISIONS.md#d029-pentatonic-collections-and-scale-specific-ordinal-limits) explain the shared-pattern design.

`pitchClassAtScaleDegree(tonic, type, degree)` retrieves an **ordinal**, meaning array position starting at one. `scaleDegreeOfPitchClass(tonic, type, pitchClass)` returns that ordinal or `undefined`. `ScaleDegree` remains the union 1..7, but pentatonic calls reject 6/7 at runtime because those collections contain only five members.

### Text and the chromatic exception

[scale-text.ts](../../domain/music-theory/scales-and-modes/scale-text.ts) implements `parseScaleType(text)`. It accepts exact identifiers or their space-separated names, ignoring case and repeated whitespace. `" Major   Pentatonic "` becomes `"major-pentatonic"`; `"major- pentatonic"`, `"C major"`, `"minor"`, `"melodic minor"` and `"chromatic"` throw `SyntaxError`. It chooses neither tonic nor traversal convention.

[chromatic.ts](../../domain/music-theory/scales-and-modes/chromatic.ts) independently exports `chromaticPitchClasses(tonic)`, returning twelve ascending semitone classes with no repeated tonic. For tonic 10 the result is `[10,11,0,1,2,3,4,5,6,7,8,9]`. Chromatic is not a `ScaleType`: it has no shared spelling, ordinal or registered-run API. [D032](../DECISIONS.md#d032-strict-scale-name-parsing) and [D033](../DECISIONS.md#d033-standalone-numeric-chromatic-collection) deliberately avoid silently enlarging those contracts.

## Direct modes versus relative modes

Constructing D Dorian directly means supplying tonic D and type `"dorian"`. Deriving D Dorian **relative to C major** means retaining C major's notes but rotating their order and changing the tonic.

[relative-modes.ts](../../domain/music-theory/scales-and-modes/relative-modes.ts) exports `relativeModePitchClasses(tonic, parent, degree)` and `relativeModeNoteSpellings(tonic, parent, degree)`. The parent accepts the seven major modes plus `major` and `natural-minor` aliases. The algorithm constructs the parent, rotates its seven members at `degree - 1`, and advances through the canonical mode sequence Ionian, Dorian, Phrygian, Lydian, Mixolydian, Aeolian, Locrian.

C major degree 2 yields tonic D, mode `dorian`, notes D–E–F–G–A–B–C. D Dorian degree 6 yields B Locrian. Results carry `{ tonic, mode, pitchClasses }` or `{ tonic, mode, noteSpellings }`. Use the **returned tonic** in later calls. Spelled rotation preserves exact parent spellings and shares its first output note with the result's tonic. No context-based mode detection is performed. See [D030](../DECISIONS.md#d030-relative-relationships-between-major-scale-modes).

### Harmonic-minor and melodic-minor modes

[minor-modes.ts](../../domain/music-theory/scales-and-modes/minor-modes.ts) uses a `MinorMode` descriptor `{ parent, degree }`, with parent `"harmonic-minor"` or `"melodic-minor-ascending"` and rotation degree 1..7. It does not assign alternative mode names or parse their aliases.

The direct functions `minorModePitchClasses` and `minorModeNoteSpellings` take the **mode's own tonic**. Internally they construct a fixed C parent, measure the rotated members' upward intervals with written octave continuation, and transpose those interval roles from the requested tonic. This avoids hardcoding fourteen separate pattern tables and avoids imposing an unrelated parent-tonic spelling limit.

The relative functions `relativeMinorModePitchClasses` and `relativeMinorModeNoteSpellings` instead accept a parent tonic and rotate its actual collection. Relative degree 2 of C harmonic minor is D–E-flat–F–G–A-flat–B–C; the same rotation of ascending C melodic minor is D–E-flat–F–G–A–B–C. Both retain fixed collections on descent. The descriptor's rotation degree is distinct from an ordinal queried inside the resulting mode. [D035](../DECISIONS.md#d035-fixed-modes-of-harmonic-and-ascending-melodic-minor) records this distinction.

## Registered scale runs

[scale-runs.ts](../../domain/music-theory/scales-and-modes/scale-runs.ts) adds register through `scaleRegisteredPitches(tonic, type, options)` and `scaleRegisteredNotes(tonic, type, options)`. Required `ScaleRunOptions` are:

```ts
{ direction: "up" | "down"; octaves: number; includeEndpoint: boolean }
```

`octaves` must be a positive safe integer. The starting tonic is always present; internal octave tonics remain; `includeEndpoint` controls only the final tonic. A seven-note, two-octave run with endpoint contains 15 notes. A one-octave pentatonic run without endpoint contains five.

[scale-run-internals.ts](../../domain/music-theory/scales-and-modes/scale-run-internals.ts) owns the shared sequencing. For output index `i`, use `i` ascending or `-i` descending. Normalized modulo cardinality selects the degree; floor division selects octave displacement. From C4 descending major, index 1 becomes degree index 6 and octave -1, giving B3 rather than B4. Add the selected tonic-relative offset and twelve times the octave displacement to the registered tonic.

Spelled output selects the same collection member and solves for its written octave from the numeric pitch and natural-letter/accidental displacement. BigInt subtraction avoids unsafe intermediates. It preserves spellings such as B-sharp across written boundaries instead of renaming each emitted pitch.

The helpers are exported for sibling reuse, but their offsets/spellings are trusted domain-generated data, not a public custom-scale validation contract. Minor-mode runs use `minorModeRegisteredPitches` and `minorModeRegisteredNotes` with the same options and internals.

`MAX_SCALE_RUN_NOTES` is 10,000. The engine bounds `cardinality * octaves + endpointCount` before allocation, then validates every emitted pitch. It does not truncate or validate an excluded endpoint. This distinction allows a run ending at the numerical limit when the next, omitted tonic would overflow. Invalid options, unsafe results and unsupported spellings throw `RangeError`. [D031](../DECISIONS.md#d031-registered-scale-runs-with-explicit-octave-extent) explains the bounded tonic-to-tonic scope; arbitrary start/end pitch bounds are absent.

### Direction does not select a melodic-minor convention

Reversing `melodic-minor-ascending` retains its raised sixth/seventh. From C5 it produces C5–B4–A4–G4–F4–E-flat4–D4–C4. A classical exercise often descends using natural minor instead: C5–B-flat4–A-flat4–G4–F4–E-flat4–D4–C4.

[melodic-minor-runs.ts](../../domain/music-theory/scales-and-modes/melodic-minor-runs.ts) makes that choice explicit. `melodicMinorRegisteredPitches` and `melodicMinorRegisteredNotes` accept ordinary run options plus `convention: "fixed-collection" | "classical-exercise"`. A small dispatcher chooses the collection and delegates to existing run functions; it validates only the selected leg's collection. The conventions agree ascending and differ descending. [D034](../DECISIONS.md#d034-explicit-melodic-minor-traversal-conventions) preserves this separate policy.

Every run call describes one direction. A caller can compose ascent and descent, skipping the second leg's initial tonic if it should sound once. There is no combined-run helper, combined budget or accepted universal turning-note policy.

## Degrees: ordinals and formulas

[degrees.ts](../../domain/music-theory/degrees-keys-and-spelling/degrees.ts) defines `DegreeFormula = Readonly<{ number: ScaleDegree; alteration: Accidental }>` and `DegreeCollection = ScaleType | MinorMode`.

| In C minor pentatonic | Ordinal | Formula | Semitones from C |
| --- | --- | --- | --- |
| C | 1 | 1 | 0 |
| E-flat | 2 | b3 | 3 |
| F | 3 | 4 | 5 |
| G | 4 | 5 | 7 |
| B-flat | 5 | b7 | 10 |

`pitchClassFromDegreeFormula(tonic, formula)` adds the alteration to the major/perfect reference offset. `noteSpellingFromDegreeFormula` preserves the role's letter: it finds the reference interval from the tonic's natural letter, then combines reference accidental, tonic accidental and formula alteration. **Only the final accidental** must fit -3..3. B-double-sharp plus b3 therefore gives D-double-sharp; a flat formula does not require a flat output note.

`degreeFormulas(collection)` constructs the collection at C, where each note's letter and accidental directly encode its major-relative role. This reuses musical definitions rather than maintaining another formula catalog. `degreeFormulaAtOrdinal`, `pitchClassAtCollectionDegree` and `noteSpellingAtCollectionDegree` then retrieve one member. Spelled single-member retrieval validates only that result; unrelated unspellable notes do not block it. `collectionDegreeOfPitchClass` returns `{ ordinal, formula }` or `undefined`.

[degree-text.ts](../../domain/music-theory/degrees-keys-and-spelling/degree-text.ts) parses one accidental-prefixed simple number, such as `b03`, `♭3` or `𝄫7`, and formats with `formatDegreeFormula`. Unlike note text, degree text also accepts repeated Unicode signs and canonically formats doubles/triples that way: `♭♭7`, `♯♯♯4`. Number 9 is rejected here; compound chord roles have a separate type. Malformed text is `SyntaxError`; recognized out-of-range numbers/alterations are `RangeError`. See [D036](../DECISIONS.md#d036-simple-degree-formulas-and-shared-collection-queries) and [D039](../DECISIONS.md#d039-triple-accidentals-and-degree-alterations).

## Keys and conventional signatures

[keys.ts](../../domain/music-theory/degrees-keys-and-spelling/keys.ts) represents a `Key` as `{ tonic: NoteSpelling, mode: "major" | "minor" }`. `createKey` copies that identity without constructing a scale or requiring a supported signature. With 49 spellings and two modes, 98 identities are representable.

`keySignature(key)` uses major or natural-minor spellings as its baseline. It removes natural notes, requires all remaining accidentals to be uniform single sharps or flats, and verifies they form a prefix of conventional order: F,C,G,D,A,E,B for sharps, B,E,A,D,G,C,F for flats. It returns ordered `{ letter, accidental }` entries, with `[]` for no alterations. Exactly 30 identities have supported conventional signatures. Theoretical signatures outside this policy throw without respelling the tonic.

`relativeKey(key)` changes major to minor using formula 6, or minor to major using b3. `parallelKey(key)` keeps tonic spelling and switches mode. D major has relative B minor and parallel D minor. The former pair shares F-sharp/C-sharp signatures; D minor has B-flat. Relationship functions do not require signature support. C-flat minor is a valid parallel identity of C-flat major even though its signature is unsupported. Six relative results among the 98 identities need quadruple accidentals and reject.

Selecting harmonic/melodic minor elsewhere does not change a minor key's signature. A key is not a `DegreeCollection`; callers choose a collection explicitly. [D037](../DECISIONS.md#d037-explicit-majorminor-keys-and-conventional-signatures) and D039 explain this independence.

## Key-aware spelling

[key-aware-spelling.ts](../../domain/music-theory/degrees-keys-and-spelling/key-aware-spelling.ts) exports `spellingFromPitchClassInKey(pitchClass, key, role?)`.

Without a role, it finds the class in the major/natural-minor baseline and spells that degree. Class 5 in F-sharp major becomes E-sharp. Class 10 in B minor returns `undefined`: that baseline does not select a spelling for it, not that the pitch is forbidden in B-minor music.

With a role, it first verifies numerical class agreement, then spells the supplied role. B-minor formula 7 chooses A-sharp for class 10. In C major, class 1 with #1 becomes C-sharp and with b2 becomes D-flat. An explicit role can override a baseline member as well. A mismatch or unrepresentable final spelling throws; there is no fallback.

This requires neither a conventional signature nor successful spelling of every collection member. It selects one result under explicit policy. Registered key-aware output, candidates, contextual inference and fallback selection remain absent. See [D038](../DECISIONS.md#d038-key-aware-pitch-class-spelling-with-explicit-degree-roles).

## Source and test map

| Behavior | Focused evidence |
| --- | --- |
| Fixed scales and five-note cardinality | [scales](../../tests/scales.test.ts), [pentatonic-scales](../../tests/pentatonic-scales.test.ts) |
| Name grammar and separate chromatic collection | [scale-text](../../tests/scale-text.test.ts), [chromatic](../../tests/chromatic.test.ts) |
| Relative major modes and minor-derived families | [relative-modes](../../tests/relative-modes.test.ts), [minor-modes](../../tests/minor-modes.test.ts) |
| Runs, caps, written octaves and convention selection | [scale-runs](../../tests/scale-runs.test.ts), [melodic-minor-runs](../../tests/melodic-minor-runs.test.ts) |
| Major-relative roles and selected-result spelling | [degrees](../../tests/degrees.test.ts), [degree-text](../../tests/degree-text.test.ts) |
| Signature limits, relationships and spelling policy | [keys](../../tests/keys.test.ts), [key-aware-spelling](../../tests/key-aware-spelling.test.ts) |

[Walkthrough 2](end-to-end-examples.md#2-relative-mode-degree-role-and-registered-run) connects relative mode derivation, degree lookup, runs and key-aware spelling. Chord harmonization builds on these collection roles in the next chapter.
