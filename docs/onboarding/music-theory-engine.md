# Music Theory: pitches, spelling and intervals

[Onboarding index](README.md) · Previous: [Architecture](architecture-and-data-flow.md) · Next: [Collections and keys](collections-and-keys.md)

Music Theory describes musical objects independently of an instrument. Its foundations distinguish three questions: which octave-equivalent sound, which exact registered sound, and which written musical role? Confusing those questions causes errors that propagate into chord construction and fretboard realization.

The engine uses **12-tone equal temperament (12-TET)**: twelve semitone steps form an octave. A semitone is the smallest step represented here; a whole tone is two semitones. It computes discrete coordinates, not frequencies, waveforms or tuning deviations. The [Music Theory Reference](../MUSIC_THEORY_REFERENCE.md#pitch-pitch-classes-and-spelling) supplies the underlying musical conventions.

## Four representations of a note

| Type | Example | Meaning |
| --- | --- | --- |
| `PitchClass` | `0` | C-equivalent sound in any octave. A union of integers 0 through 11. |
| `NoteSpelling` | `{ letter: "B", accidental: 1 }` | B-sharp, retaining its written letter but no octave. |
| `RegisteredPitch` | `48` | A specific sounding coordinate with C0 = 0. A number alias, validated by registered operations. |
| `RegisteredNote` | `{ letter: "B", accidental: 1, octave: 3 }` | B-sharp3, retaining both written spelling and octave. |

`NoteLetter` is uppercase A through G; `Accidental` is the integer union -3 through 3. The accidental is an explicit displacement from the natural letter, not an increment to an implicit key signature. Thus `{ letter: "F", accidental: 0 }` is F-natural even in F-sharp major.

Two spellings are **enharmonic** when they sound alike in this system. B-sharp3 and C4 both produce coordinate 48, but they are not the same written note. C4 and C5 share class 0 but have different registered coordinates, 48 and 60. These differences remain deliberate under [D020](../DECISIONS.md#d020-c-based-pitch-classes-and-explicit-note-spelling), [D021](../DECISIONS.md#d021-registered-pitch-coordinates-with-c0-as-origin) and the expanded accidental contract in [D039](../DECISIONS.md#d039-triple-accidentals-and-degree-alterations).

## Numeric pitch-class arithmetic

[pitch-class.ts](../../domain/music-theory/pitch-pitch-classes-and-spelling/pitch-class.ts) exports:

```ts
transposePitchClass(pitchClass: PitchClass, semitones: number): PitchClass
```

Natural classes are C=0, D=2, E=4, F=5, G=7, A=9 and B=11. Numeric classes do not encode sharp/flat preferences. Transposition wraps into 0..11, so C down one semitone is class 11 and class 11 up two is class 1.

The algorithm first reduces the offset modulo twelve, then adds it to the class, then normalizes JavaScript's possibly negative remainder. Reducing before adding avoids losing precision when a small class is added to a very large safe offset. Fractional, infinite, NaN and unsafe offsets throw `RangeError`. The `PitchClass` argument itself is a typed-input boundary in this primitive; it is not an arbitrary JSON validator.

[note-spelling.ts](../../domain/music-theory/pitch-pitch-classes-and-spelling/note-spelling.ts) implements `pitchClassFromSpelling(note)` by looking up the natural class and transposing by the accidental. C-sharp and D-flat both become 1. That conversion intentionally loses their different letters.

## Registered pitch arithmetic and written octaves

[registered-pitch.ts](../../domain/music-theory/pitch-pitch-classes-and-spelling/registered-pitch.ts) uses:

```text
registered pitch = 12 × written octave + natural-letter class + accidental
```

| Written note | Calculation | Coordinate |
| --- | --- | --- |
| E2 | 24 + 4 | 28 |
| B3 | 36 + 11 | 47 |
| B-sharp3 | 36 + 11 + 1 | 48 |
| C4 | 48 + 0 | 48 |
| C-flat4 | 48 + 0 - 1 | 47 |
| C-1 | -12 + 0 | -12 |

Octave numbers belong to **written letters**, changing at the natural B-to-C boundary. Accidentals do not rewrite that octave. Applying modulo twelve before adding register would incorrectly turn B-sharp3 into C3. `registeredPitchFromNote` therefore applies the accidental without wrapping.

The public operations are `registeredPitchFromNote(note)`, `transposeRegisteredPitch(pitch, semitones)`, `pitchClassFromRegisteredPitch(pitch)` and `semitoneDistance(from, to)`. Transposition adds without wrapping; distance is signed `to - from`, with positive zero for equality. Class extraction discards register using normalized modulo twelve.

These coordinates are **not MIDI note numbers**. C4 is 48 here. There is no MIDI conversion API or 0..127 range restriction. Negative registers are supported.

Numbers must remain JavaScript safe integers, including displacements and results. Note conversion also requires `12 * octave` to be safe, even if a later accidental could mathematically return an unsafe base to the valid range. It groups natural-letter displacement with the accidental before adding the base, allowing representable boundary results without an unnecessary overflowing intermediate. A pair of individually valid endpoints can still have a distance too large for `semitoneDistance`.

These are representational limits, not limits on human hearing or guitar size. BigInt is used in operations needing exact intermediate differences; public results remain numbers.

## Parsing, formatting and selecting spelling are different operations

[note-text.ts](../../domain/music-theory/pitch-pitch-classes-and-spelling/note-text.ts) provides:

| Operation | Contract |
| --- | --- |
| `parseNoteSpelling(text)` | Uppercase letter plus optional accidental; an octave is rejected. |
| `parseRegisteredNote(text)` | Same spelling plus a required signed decimal integer octave. |
| `formatNoteSpelling(note, notation?)` | Preserve the supplied letter/accidental; omit natural signs. |
| `formatRegisteredNote(note, notation?)` | Preserve spelling and written octave after numeric validation. |

`AccidentalNotation` is `"unicode"` or `"ascii"`, with Unicode the default. The note grammar is intentionally strict:

| Alteration | Accepted note tokens | Canonical Unicode |
| --- | --- | --- |
| Natural | No token or `♮` | No token |
| ±1 | `#`, `♯`; `b`, `♭` | `♯`, `♭` |
| ±2 | `##`, `𝄪`; `bb`, `𝄫` | `𝄪`, `𝄫` |
| ±3 | `###`, `♯𝄪`; `bbb`, `♭𝄫` | `♯𝄪`, `♭𝄫` |

Outer whitespace is ignored; internal spaces, lowercase letters, `x`, mixed accidental tokens, reversed Unicode composites, repeated Unicode sharp/flat tokens and quadruples are rejected. Registered octave text permits ASCII signs and leading zeroes: `C+04` formats as `C4`. Missing/extra register and malformed tokens throw `SyntaxError`; an unsafe parsed octave throws `RangeError`.

Formatting does not select a new enharmonic spelling. Selection is handled by [spelling-selection.ts](../../domain/music-theory/pitch-pitch-classes-and-spelling/spelling-selection.ts):

```ts
spellingFromPitchClass(pitchClass: PitchClass, policy: SpellingPolicy): NoteSpelling
noteFromRegisteredPitch(pitch: RegisteredPitch, policy: SpellingPolicy): RegisteredNote
```

`SpellingPolicy` must be `"sharps"` or `"flats"`. Both prefer naturals and use single accidentals for the remaining classes. Class 1 therefore selects C-sharp or D-flat. This policy cannot recover an original B-sharp spelling from class 0. Registered selection computes the written octave with exact BigInt subtraction, then validates the selected note; an extreme numeric pitch can be valid while its selected written octave base is unsupported.

[D022](../DECISIONS.md#d022-note-text-and-explicit-reverse-spelling-policy) separates selection from formatting so that presentation does not silently change musical identity. [Key-aware selection](collections-and-keys.md#key-aware-spelling) is another explicit policy, not a change to these generic functions.

## Intervals: letter distance and sound distance

An **interval number** counts letters inclusively. C to E is a third; C to F is a fourth. Its **quality** determines the chromatic displacement within that number. C to F-sharp is an augmented fourth, whereas C to G-flat is a diminished fifth. Both span six semitones.

[spelled-transposition.ts](../../domain/music-theory/intervals-and-transposition/spelled-transposition.ts) defines readonly `SpelledInterval` with required `number`, `quality` and `direction`. Number is a positive safe integer; quality is `perfect`, `major`, `minor`, `augmented` or `diminished`; direction is `up` or `down`.

For number `n`, the internal algorithm computes:

1. Letter steps `n - 1`.
2. Simple index `(n - 1) mod 7`, plus complete groups of seven letters.
3. A reference semitone distance from `[0, 2, 4, 5, 7, 9, 11]`, plus twelve per complete group.
4. A quality adjustment, then the direction sign.

Simple roles 1, 4 and 5 belong to the perfect family; 2, 3, 6 and 7 belong to the major/minor family. Perfect/major leave the reference distance unchanged. Minor subtracts one; augmented adds one; diminished subtracts one from the perfect family or two from the major family. A major ninth therefore has eight letter steps and fourteen semitones. The same family rules apply to compound intervals.

`validateSpelledInterval` and `semitonesFromInterval` share that computation. `P3` and `M5` are invalid quality/number combinations. Diminished unison is excluded; multiply augmented/diminished qualities are not modeled. Unsafe distances throw before transposition.

### Transposition step by step

`transposeRegisteredNote(note, interval)` keeps two coordinates:

- A chromatic coordinate, calculated by registered pitch arithmetic.
- A written position `7 * octave + letterIndex`, with letters ordered C,D,E,F,G,A,B.

For **B-sharp3 up a major second**:

1. B-sharp3 sounds at 48.
2. Major second adds two semitones, targeting 50.
3. One written letter step moves B3 to C4.
4. Natural C4 sounds at 48, so the required accidental is +2.
5. The exact result is C-double-sharp4, not D4.

The algorithm computes the new letter/octave with BigInt, corrects quotient/remainder behavior for negative written positions, and derives the accidental as target sound minus that natural letter's coordinate. It rejects results outside -3..3 rather than choosing another letter. `transposeNoteSpelling` performs registered transposition from written octave zero and then removes register; it still validates the interval's full displacement.

This separation is the reason scale construction can preserve degree letters instead of asking a generic sharp/flat formatter to guess them. See [D023](../DECISIONS.md#d023-spelled-transposition-by-qualified-intervals).

### Measurement and identification

`identifySpelledInterval(from, to)` derives the number from absolute written letter/octave distance and the quality from sounding distance. If written positions differ, they determine direction, even when sounds are equal: C-sharp4 to D-flat4 is diminished second/up. At the same written position, sound determines direction; C4 to C-flat4 is augmented unison/down. Identical notes produce perfect unison/up by explicit project convention.

Pairs requiring unsupported qualities or opposing written/sounding motion reject instead of being respelled. For example, C-double-sharp4 to D-flat4 moves upward in letters but downward in sound. Exact intermediate arithmetic also prevents large coordinates from rounding away small letter differences. [D025](../DECISIONS.md#d025-registered-interval-measurement-and-identification) explains the convention and round-trip intent.

### Inversion and text

`invertSimpleInterval(interval)` supports numbers 1..8. It replaces number with `9 - number`, complements quality (perfect/perfect, major/minor, augmented/diminished) and reverses direction. Major third/up becomes minor sixth/down. This models moving the source by one octave while keeping the target fixed. Compound intervals and augmented octaves reject; the latter would require the unsupported diminished unison. This is interval inversion, separate from chord-bass inversion analysis.

[interval-text.ts](../../domain/music-theory/intervals-and-transposition/interval-text.ts) parses compact `m3 up`, full `minor third down`, or numeric full `major 16 up`. Direction is mandatory. Compact `M` versus `m` is case-sensitive; full words and direction are case-insensitive. Names cover unison through fifteenth, with `octave` for 8. Decimal numbers may have leading zeroes, but not signs or ordinal suffixes. `formatSpelledInterval(interval, notation?)` defaults to `"compact"`; `"full"` uses names through 15 and decimal numbers afterward. Both round-trip through the parser.

Malformed syntax throws `SyntaxError`; a syntactically recognized but unsupported interval throws `RangeError`. [D024](../DECISIONS.md#d024-interval-text-syntax-with-required-direction), [D026](../DECISIONS.md#d026-simple-interval-inversion-by-octave-displacement) and [D027](../DECISIONS.md#d027-interval-formatting-and-public-semitone-displacement) record these choices.

## Evidence and reading map

| Area | Tests worth reading |
| --- | --- |
| Modulo arithmetic and typed spelling | [pitch-class](../../tests/pitch-class.test.ts), [note-spelling](../../tests/note-spelling.test.ts) |
| Written octaves and safe bounds | [registered-pitch](../../tests/registered-pitch.test.ts) |
| Grammar, canonicalization and reverse policies | [note-text](../../tests/note-text.test.ts), [spelling-selection](../../tests/spelling-selection.test.ts) |
| Two-coordinate transposition | [spelled-transposition](../../tests/spelled-transposition.test.ts) |
| Equal sounds, compound distances, opposing motion | [interval-measurement](../../tests/interval-measurement.test.ts) |
| Inversion and parser/formatter contracts | [interval-inversion](../../tests/interval-inversion.test.ts), [interval-text](../../tests/interval-text.test.ts) |

The [first executable walkthrough](end-to-end-examples.md#1-spelled-transposition-across-an-octave-boundary) demonstrates the B-sharp example and important rejections. Continue with collections to see these primitives become musical structures.
