# Chords, symbols and voicings

[Onboarding index](README.md) · Previous: [Collections and keys](collections-and-keys.md) · Next: [Fretboard](fretboard-engine.md)

A chord's **root** anchors its construction. Its **bass** is the lowest sounding pitch of a particular realization; root and bass need not agree. A **voicing** chooses actual notes, registers, spacing and repetitions. A **fingering** places that voicing on strings and assigns finger contacts. This chapter concerns musical construction and supplied voicings, before instrument realization.

Four different operations coexist:

| Question | Capability |
| --- | --- |
| “What tones belong to this explicitly described chord?” | Formula/description resolution. |
| “Place its complete roles above this registered root.” | Narrow root-position construction. |
| “How does this supplied voicing realize a known chord?” | Coverage, bass, inversion, doubling and spacing analysis. |
| “Which named catalog chords have exactly these classes?” | Exact identification, retaining every matching interpretation. |

None substitutes for the others. In particular, identification is not used to validate every known-chord voicing: explicitly allowed omissions would violate its complete-set requirement.

## Shared formulas preserve musical roles

[chord-formulas.ts](../../domain/music-theory/chords-symbols-and-realization/chord-formulas.ts) defines `ChordDegreeFormula` with a positive safe-integer `number` and `alteration: Accidental`, and `ChordFormula` as a readonly array of those roles. Unlike the simple `DegreeFormula`, chord numbers may exceed seven.

For example, C dominant ninth has this ordered formula:

```ts
[
  { number: 1, alteration: 0 },
  { number: 3, alteration: 0 },
  { number: 5, alteration: 0 },
  { number: 7, alteration: -1 },
  { number: 9, alteration: 0 },
]
```

`validateChordFormula` requires a nonempty, nonsparse array of valid role records. It does **not** require a root role, third, unique number, sorted order or recognized quality. Rootless, reordered, duplicated and enharmonically colliding formulas are valid data.

`chordPitchClasses(root, formula)` and `chordNoteSpellings(root, formula)` reduce each role to `((number - 1) % 7) + 1` solely for resolution through the existing simple-degree helpers. They preserve order and multiplicity. Role 2 and role 9 both resolve to D from C, but their original formula numbers remain different. No octave is assigned here.

Numeric construction can succeed when exact spelled output exceeds ±3 accidentals. A failed spelling request does not authorize dropping the role or substituting another letter. [D042](../DECISIONS.md#d042-shared-chord-formulas-with-unregistered-compound-roles) keeps role identity separate from both sounding equivalence and register.

## Descriptions carry identity and bass intent

[chord-descriptions.ts](../../domain/music-theory/chords-symbols-and-realization/chord-descriptions.ts) defines two parallel readonly structures:

```ts
// PitchClassChordDescription
{ root: PitchClass; formula: ChordFormula; bass?: PitchClass }
// SpelledChordDescription
{ root: NoteSpelling; formula: ChordFormula; bass?: NoteSpelling }
```

`createPitchClassChordDescription(root, formula, bass?)` and `createSpelledChordDescription(root, formula, bass?)` validate/copy formulas and copy supplied spellings. They preserve intent without deriving every tone immediately. Roots and supplied spelling fields retain the engine's typed-input boundaries.

`chordDescriptionPitchClasses(description)` accepts either representation. `chordDescriptionNoteSpellings(description)` requires the spelled one. Both return **only formula tones**. C/F-sharp still resolves to C,E,G; the separately stored F-sharp is a requested bass, not an added formula role. No bass means unspecified, not root position. An explicit root bass is retained as an explicit constraint.

This small shared contract lets named construction, notation and later realization cooperate without making a quality name mandatory. The named constructors call description factories/resolvers, which call the shared formula logic; descriptions do not depend back on the catalogs. See [D049](../DECISIONS.md#d049-structured-chord-descriptions-with-specified-bass).

## Named construction: one formula path, 37 qualities

Each family exposes a formula getter and numeric/spelled constructors:

| Module | Exports |
| --- | --- |
| [triads.ts](../../domain/music-theory/chords-symbols-and-realization/triads.ts) | `TriadQuality`, `triadFormula`, `triadPitchClasses`, `triadNoteSpellings` |
| [seventh-chords.ts](../../domain/music-theory/chords-symbols-and-realization/seventh-chords.ts) | `SeventhChordQuality`, `seventhChordFormula`, `seventhChordPitchClasses`, `seventhChordNoteSpellings` |
| [added-tone-chords.ts](../../domain/music-theory/chords-symbols-and-realization/added-tone-chords.ts) | `AddedToneChordQuality`, `addedToneChordFormula`, `addedToneChordPitchClasses`, `addedToneChordNoteSpellings` |
| [extended-chords.ts](../../domain/music-theory/chords-symbols-and-realization/extended-chords.ts) | `ExtendedChordQuality`, `extendedChordFormula`, `extendedChordPitchClasses`, `extendedChordNoteSpellings` |

Formula getters take a quality; tone constructors take root and quality. Getters return independent role arrays/objects. Unknown quality identifiers throw `RangeError`.

A **tertian** chord stacks thirds: roles 1,3,5, optionally 7. Suspended structures replace the third with 2 or 4. Added-tone chords retain the third without implying a seventh. Extended ninth/eleventh/thirteenth chords build on a seventh and include intermediate extensions. The following table connects identifiers, roles and canonical ASCII suffixes; prefix a spelled root to obtain a symbol.

| Family / quality | Formula | Suffix |
| --- | --- | --- |
| Triad: `major` | 1 3 5 | empty |
| `minor` | 1 b3 5 | `m` |
| `diminished` | 1 b3 b5 | `dim` |
| `augmented` | 1 3 #5 | `aug` |
| `sus2` | 1 2 5 | `sus2` |
| `sus4` | 1 4 5 | `sus4` |
| Seventh: `major-seventh` | 1 3 5 7 | `maj7` |
| `dominant-seventh` | 1 3 5 b7 | `7` |
| `minor-seventh` | 1 b3 5 b7 | `m7` |
| `half-diminished-seventh` | 1 b3 b5 b7 | `m7(b5)` |
| `diminished-seventh` | 1 b3 b5 bb7 | `dim7` |
| `minor-major-seventh` | 1 b3 5 7 | `m(maj7)` |
| `augmented-major-seventh` | 1 3 #5 7 | `aug(maj7)` |
| `augmented-seventh` | 1 3 #5 b7 | `aug7` |
| `dominant-seventh-sus2` | 1 2 5 b7 | `7sus2` |
| `dominant-seventh-sus4` | 1 4 5 b7 | `7sus4` |
| Added: `major-add2` | 1 3 5 2 | `add2` |
| `major-add9` | 1 3 5 9 | `add9` |
| `minor-add9` | 1 b3 5 9 | `madd9` |
| `major-add11` | 1 3 5 11 | `add11` |
| `major-sixth` | 1 3 5 6 | `6` |
| `minor-sixth` | 1 b3 5 6 | `m6` |
| `major-sixth-ninth` | 1 3 5 6 9 | `6/9` |
| Extended: `dominant-ninth` | 1 3 5 b7 9 | `9` |
| `major-ninth` | 1 3 5 7 9 | `maj9` |
| `minor-ninth` | 1 b3 5 b7 9 | `m9` |
| `dominant-eleventh` | 1 3 5 b7 9 11 | `11` |
| `major-eleventh` | 1 3 5 7 9 11 | `maj11` |
| `minor-eleventh` | 1 b3 5 b7 9 11 | `m11` |
| `dominant-thirteenth` | 1 3 5 b7 9 11 13 | `13` |
| `major-thirteenth` | 1 3 5 7 9 11 13 | `maj13` |
| `minor-thirteenth` | 1 b3 5 b7 9 11 13 | `m13` |
| `dominant-flat-ninth` | 1 3 5 b7 b9 | `7(b9)` |
| `dominant-sharp-ninth` | 1 3 5 b7 #9 | `7(#9)` |
| `dominant-sharp-eleventh` | 1 3 5 b7 9 #11 | `9(#11)` |
| `dominant-flat-thirteenth` | 1 3 5 b7 9 11 b13 | `13(b13)` |
| `major-sharp-eleventh` | 1 3 5 7 9 #11 | `maj9(#11)` |

Sevenths compose a triad formula plus a seventh role. Added-tone chords compose a triad plus additions. Extensions compose a seventh plus 9, 9/11 or 9/11/13. The five altered entries replace one role in a complete base formula. They do not append both natural and altered forms. The dominant flat-thirteenth formula deliberately retains natural 11.

These are complete theoretical constructions. A guitarist might omit tones in practice, but construction does not silently remove an eleventh, third or fifth to improve a grip. Optionality belongs to an explicit later requirement. A six-string template cannot realize seven distinct required classes merely because all are chord tones.

Rationale is recorded in [D043](../DECISIONS.md#d043-triad-formulas-and-suspended-structures), [D044](../DECISIONS.md#d044-seventh-formulas-and-suspended-structures), [D045](../DECISIONS.md#d045-added-tone-and-sixth-chord-formulas), [D046](../DECISIONS.md#d046-complete-named-extended-chord-formulas) and [D047](../DECISIONS.md#d047-five-selected-altered-extended-constructions). There is no public named alteration-composition API; custom formulas already represent other valid roles without promising a named symbol.

## Harmonization derives formulas from a collection

**Harmonizing** a seven-note collection in thirds means selecting alternate degrees from each starting degree. [scale-harmonization.ts](../../domain/music-theory/chords-symbols-and-realization/scale-harmonization.ts) derives rather than hardcodes the answer.

For a selected degree, it obtains the collection's offsets from shared degree functions. Starting at index `start`, it visits `start + 2*i`, carrying wrapped indices into the next octave. Subtract the starting offset to obtain root-relative distances, then compare with `[0,4,7]` or `[0,4,7,11]`. Those differences are the alterations of roles 1,3,5,(7).

For degree 7 of C harmonic minor:

| Selected member | C-relative continued coordinate | Distance from B | Derived role |
| --- | --- | --- | --- |
| B | 11 | 0 | 1 |
| D | 14 | 3 | b3 |
| F | 17 | 6 | b5 |
| A-flat | 20 | 9 | bb7 |

The result is B,D,F,A-flat with diminished-seventh formula. The root-relative `bb7` role here spells A-flat because the root is B; alteration is not the literal accidental of the result.

Selected-degree APIs are `harmonizedChordFormulaAtDegree(collection, degree, kind)`, `harmonizedChordPitchClassesAtDegree(tonic, collection, degree, kind)` and `harmonizedChordNoteSpellingsAtDegree(...)`. Their all-degree counterparts are `harmonizeCollectionFormulas`, `harmonizeCollectionPitchClasses` and `harmonizeCollectionNoteSpellings`. `kind` is `"triad"` or `"seventh"`.

Results retain degree, discriminated kind, formula, and a required `quality` field whose value can be `undefined` when no exact catalog formula matches. Numeric/spelled results add root and tones. The algorithm preserves a derived formula independently of a name; it does not invoke general chord identification. Selected spelling checks only that chord's members, whereas a complete seven-chord request must spell all requested output.

`HarmonizableCollection` excludes pentatonics and includes `MinorMode` descriptors. A parsed `ScaleType` must be narrowed before passing it here. No custom collection harmonization, Roman numerals, progression selection or harmonic-function inference exists. [D048](../DECISIONS.md#d048-seven-note-collection-harmonization) explains these boundaries.

## Symbols are a bounded notation adapter

[chord-symbols.ts](../../domain/music-theory/chords-symbols-and-realization/chord-symbols.ts) exports `parseChordSymbol(text): SpelledChordDescription` and `formatChordSymbol(description, notation = "unicode"): string`. Private suffix tables refer to existing formula getters; notation does not define a second musical catalog.

Parsing proceeds in stages:

1. Trim outer whitespace and reject internal whitespace.
2. Try interpreting the text after the final slash as a complete note spelling. This permits `C6/9/E` while retaining `6/9` as a suffix when the tail is just `9`.
3. Capture and validate the uppercase root plus accidental token using the shared note parser.
4. Normalize Unicode single flats/sharps in the suffix to ASCII and match a supported suffix/alias.
5. Create a copied spelled description, leaving optional bass separate.

Suffixes are case-sensitive. Besides the canonical table, the six aliases are `sus` → `sus4`, `7sus` → `7sus4`, `°` → `dim`, `°7` → `dim7`, `ø7` → `m7(b5)` and `7(#5)` → `aug7`. Root/bass use the stricter note accidental grammar.

Formatting matches the **exact ordered formula**, including duplicate and compound roles, against canonical definitions. Equal pitch-class sets are insufficient. Cadd2 does not become Cadd9; a reordered major formula need not have a supported symbol. Supplied root/bass spellings are retained, natural signs disappear, and aliases normalize. Unsupported formulas throw `RangeError`; unsupported text throws `SyntaxError`.

`C7(#11)` is rejected. The implemented complete sharp-eleventh construction includes a ninth and uses `C9(#11)`. Also, `C#9` means a C-sharp-root dominant ninth; `C7(#9)` means a C-root chord with an altered ninth. Parentheses and exact suffix grammar matter.

Parsing/formatting do not construct derived spellings. `G###maj7` can parse and format while its exact spelled major-seventh tones exceed the accidental range; numeric tones still exist. See [D050](../DECISIONS.md#d050-bounded-chord-symbol-grammar-and-canonical-formatting) and the [canonical grammar](../ARCHITECTURE.md#chord-symbol-grammar).

## Registered voicings and narrow root-position construction

[registered-chords.ts](../../domain/music-theory/chords-symbols-and-realization/registered-chords.ts) defines `RegisteredPitchVoicing = { pitches: readonly RegisteredPitch[] }` and `RegisteredNoteVoicing = { notes: readonly RegisteredNote[] }`, both readonly records. Their `createRegisteredPitchVoicing` and `createRegisteredNoteVoicing` factories require nonempty dense tone lists, validate numerical representations and copy every occurrence. They preserve supplied order and duplicates. Creating a voicing does not validate its chord membership.

`rootPositionChordRegisteredPitches(description, root)` requires an explicit matching registered root. `rootPositionChordRegisteredNotes(description, root)` additionally requires its exact root spelling. Both require at least one unaltered role 1 and reject formula distances below the anchor. They preserve full role distances, order and duplicates without inserting a root or sorting output.

For each role, the constructor computes complete octave groups from `(number - 1) / 7`, adds the simple major/perfect offset and alteration, then adds the registered root using checked BigInt intermediates. Spelled output derives written octave from root-letter position plus full role steps and verifies that each spelled coordinate equals its numeric counterpart.

At C4, Cadd2 yields `[48,52,55,50]` (C4,E4,G4,D4); Cadd9 yields `[48,52,55,62]` (C4,E4,G4,D5). The first array is deliberately unsorted. This constructor's placement convention does not imply that every supplied add9 voicing must put D an octave above the root.

Incompatible specified bass rejects: C/E cannot be realized by this root-position-only operation. C/B-sharp can succeed numerically because the bass class equals the root, but rejects in spelled construction because B-sharp is not the exact C spelling. To analyze an inversion or non-chord slash bass, supply its actual voicing instead. No arbitrary voicing or inversion generator exists. [D051](../DECISIONS.md#d051-explicit-registered-voicings-and-root-position-realization) records the limited construction policy.

## Analyzing a known chord

[chord-voicing-analysis.ts](../../domain/music-theory/chords-symbols-and-realization/chord-voicing-analysis.ts) exports:

```ts
analyzeRegisteredPitchVoicing(description, voicing, options?)
analyzeRegisteredNoteVoicing(description, voicing, options?)
```

The numeric function accepts either description representation and compares pitch classes. The spelled function requires a spelled description and compares exact letter/accidental, independently of octave. Both use sounding coordinates for bass and spacing. `ChordVoicingAnalysisOptions.optionalFormulaIndices` is a list of distinct zero-based formula positions; every unlisted position is required.

### How evidence is built

1. Resolve formula identities and validate/copy the supplied voicing.
2. Retain original tone indices, stably sorting a separate index list by sounding pitch.
3. Find the minimum coordinate and **all tied lowest indices**.
4. For each formula position, collect every matching tone index and its required/optional status.
5. Classify missing roles, unmatched tones and permitted specified-bass occurrences.
6. Group repeated identities for doublings, classify supported inversions, and measure sorted span/adjacent gaps.

Coverage is many-to-many evidence, not an assignment. Equivalent formula positions such as 2 and 9 can share a single D occurrence. Coverage does not enforce a compound role's constructor octave or the multiplicity of an exact requested voicing. That stronger constraint belongs to Playability's explicit exact-voicing comparison.

For C major with `[E3,C4,G4,C5]`, numeric coordinates are `[40,48,55,60]`. Formula coverage is root → indices `[1,3]`, third → `[0]`, fifth → `[2]`. Bass is E3; C is doubled; span is 20 semitones and adjacent gaps are `[8,7,5]`. `specifiedBass` is `"unspecified"`, while inversion can still be classified as first inversion. Spacing measures are not close/open voicing labels or ergonomic judgments.

### Bass constraints and unexpected tones

`unmatchedToneIndices` includes every tone outside formula membership. `unexpectedToneIndices` removes only unmatched **lowest** occurrences that match an explicitly specified bass. For C/F-sharp, F-sharp2 beneath C/E/G is allowed; an additional F-sharp5 remains unexpected. The non-chord bass does not satisfy a missing C role.

Specified-bass agreement requires every tied lowest occurrence to match under the selected identity policy. With exact spelling, tied C4 and B-sharp3 do not both satisfy a specified B-sharp bass. Numeric analysis treats them as the same class. Doubling groups also follow the selected identity policy and include repeated non-chord tones.

### Inversion is structural and deliberately bounded

Conventional classification requires exactly one unaltered role 1 and exactly roles 3/5, optionally 7; formula order does not matter, and alterations of 3/5/7 are permitted. Root/third/fifth/seventh bass yields root/first/second/third position. The number of sounding occurrences does not change that rule: doubled triads remain triads.

Other structures, including suspensions, added tones and extensions, return `unsupported-structure`. A supported structure with no matching bass role returns `non-chord-bass`; colliding roles or incompatible tied spellings can yield `ambiguous`. Missing upper roles or unexpected upper tones do not erase a uniquely identified bass inversion, so a classified inversion alone is not a musical-match verdict.

The analyzer returns independent findings rather than one `valid` boolean. Unsafe spacing differences, invalid optional indices and invalid input representations throw `RangeError`. No automatic omission policy, harmonic inference or fingering opinion is included. [D052](../DECISIONS.md#d052-known-chord-bass-inversion-and-voicing-analysis) is the owning decision.

## Exact catalog identification

[chord-identification.ts](../../domain/music-theory/chords-symbols-and-realization/chord-identification.ts) exports `identifyChordsFromPitchClasses`, `identifyChordsFromNoteSpellings`, `identifyChordsFromRegisteredPitches` and `identifyChordsFromRegisteredNotes`. The first two accept arrays; registered functions accept their corresponding voicing records.

The algorithm validates a nonempty collection and encodes its pitch-class set in a twelve-bit integer: OR `1 << pitchClass` for each tone. It precomputes the same mask for all 37 named formulas at twelve numeric roots, then returns every exact mask match. Order, register, spelling and repeated occurrences deliberately do not affect identity matching.

C,E,G,A returns C major-sixth and A minor-seventh. C,E,G,D returns both major-add2 and major-add9. Symmetric diminished-seventh sets retain four root interpretations. Results are ordered by numeric root, family (triad, seventh, added-tone, extended), then alphabetic quality identifier. This is reproducible enumeration, not confidence ranking.

Each candidate contains numeric root/formula description and discriminated family/quality metadata, without specified bass or selected root spelling. Registered adapters separately return the observed lowest coordinate/class and tied source indices; candidates add `bassFormulaIndices`. They compare coordinates without measuring span, so identification may succeed where full spacing analysis would overflow.

Empty, sparse or invalid collections throw `RangeError`; valid unmatched sets return no candidates. Missing-root inference, optional omissions, approximate/custom-catalog matching, slash-bass inference and context ranking are absent. A known C/F-sharp voicing can pass supplied-chord analysis yet yield no exact catalog identity. [D053](../DECISIONS.md#d053-exact-catalog-chord-identification) intentionally preserves ambiguity.

## Tests and continuation

| Area | Evidence |
| --- | --- |
| Custom role semantics and descriptions | [chord-formulas](../../tests/chord-formulas.test.ts), [chord-descriptions](../../tests/chord-descriptions.test.ts) |
| Named catalogs and independent expected tones | [triads](../../tests/triads.test.ts), [seventh-chords](../../tests/seventh-chords.test.ts), [added-tone-chords](../../tests/added-tone-chords.test.ts), [extended-chords](../../tests/extended-chords.test.ts), [catalog helper](../../tests/helpers/chord-catalog.ts) |
| Collection-derived formulas and all tonic spellings | [scale-harmonization](../../tests/scale-harmonization.test.ts) |
| Exact grammar, aliases and formula matching | [chord-symbols](../../tests/chord-symbols.test.ts) |
| Full compound distance and root/bass limits | [registered-chords](../../tests/registered-chords.test.ts) |
| Coverage, bass, inversions, omissions and spacing | [chord-voicing-analysis](../../tests/chord-voicing-analysis.test.ts) |
| Exact equality and retained alternatives | [chord-identification](../../tests/chord-identification.test.ts) |
| Composition across subject folders | [music-theory-readiness](../../tests/music-theory-readiness.test.ts) |

[Walkthroughs 3 and 4](end-to-end-examples.md#3-harmonization-symbols-realization-and-identification) demonstrate the construction and analysis paths. Preserve their descriptions and original occurrences when moving into Fretboard or Playability; numeric class sets alone cannot carry the whole request.
