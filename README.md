# FretboAIrd

A guitar and music-theory workbench for exploring the fretboard and developing musical ideas.

FretboAIrd is intended to connect notes, intervals, scales, and chords with their locations on a discrete fretboard and produce practically sensible chord fingerings. An interactive fretboard and ordinary application controls will support both musical exploration and composition or arrangement, with the musician providing creative direction.

The application is designed to be useful without AI. Later, optional AI assistance will interpret intent and orchestrate the same deterministic capabilities used by direct interaction. Musical calculations, fretboard mapping, and chord fingering rules remain the responsibility of the domain code.

## Project status

**Technical bootstrap and deterministic pitch, spelling, notation, transposition, scale, mode, supported chord construction, harmonization, symbols, registered realization, and known-chord voicing analysis are implemented.** The independent Music Theory domain supports numeric pitch classes with C = 0, registered semitone coordinates with C0 = 0, explicit spellings through triple accidentals, and conversions among these representations. It parses note and interval text, formats supplied note spelling in Unicode or ASCII, selects reverse spellings with an explicit sharps/flats policy, and transposes spellings or registered notes by numbered, qualified intervals in either direction. Interval text supports compact and full forms with required direction, such as `m3 up`, `minor third down`, and `major 16 up`. Focused tests verify behavior and numerical boundaries. The application retains its minimal Next.js/TypeScript/Vitest and presentation-tooling bootstrap. Broader spelling-context inference, chord identification, arbitrary voicing generation, Fretboard, Playability, AI, and product UI remain unimplemented.

Note text accepts triple sharps/flats as `###`/`bbb` or `♯𝄪`/`♭𝄫`; Unicode formatting uses the latter composites. Reversed composites, repeated Unicode triples, mixed tokens, and quadruples are rejected. Derived operations preserve exact spelling through ±3, including F♯𝄪 in G𝄪 major. See [D039](docs/DECISIONS.md#d039-triple-accidentals-and-degree-alterations) and the [triple-accidental effort](plans/triple-accidentals.md).

The domain also measures signed semitone distance between registered pitches and identifies numbered, qualified intervals between registered spelled notes. Identification preserves compound distance and distinguishes enharmonic interval spellings, such as augmented fourth versus diminished fifth. It retains the existing interval model and rejects unsupported pairs rather than respelling them.

Simple-interval inversion complements number and quality and flips direction through octave displacement, including unison/octave endpoints. It rejects compound intervals and augmented octaves whose inverses require unsupported diminished unisons.

`formatSpelledInterval` produces compact interval text by default (`m3 up`) or full English text (`minor third up`), always including direction. Full notation names numbers 1–15 and uses decimal numbers beyond them (`major 16 up`); both forms round-trip through the parser. `semitonesFromInterval` exposes the existing validated signed displacement without requiring a source note, preserving compound octave distance and returning positive zero for zero displacement.

`scalePitchClasses` and `scaleNoteSpellings` construct seven ordered degrees for major, natural minor, harmonic minor, melodic minor ascending, and the seven major-scale modes, or five degrees for major/minor pentatonic. Construction excludes the repeated octave tonic; spelling preserves each interval role, including E-sharp in F-sharp major and C–E-flat–F–G–B-flat in C minor pentatonic, and rejects results beyond triple accidentals. `pitchClassAtScaleDegree` and `scaleDegreeOfPitchClass` provide ordinal degree lookup and membership. Pentatonic degrees 6/7 throw `RangeError`; seven-note scales retain them. Explicit melodic-minor traversal is supported separately as described below; [deferred scale/mode capabilities](docs/ARCHITECTURE.md#scales-and-modes-deferred-capabilities) are recorded separately.

`relativeModePitchClasses` and `relativeModeNoteSpellings` derive a relative mode from a parent tonic, an existing major-scale mode (or major/natural-minor alias), and ordinal degree 1..7. Results contain the derived tonic, canonical mode name, and reordered parent collection: C major degree 2 gives D Dorian; D Dorian degree 6 gives B Locrian. Exact parent spellings are retained. Unsupported parents/degrees and unrepresentable parent spellings throw `RangeError`. This capability adds no registered runs or melodic-minor traversal convention.

`minorModePitchClasses` and `minorModeNoteSpellings` construct a mode at an explicit tonic using `{ parent, degree }`, where parent is `"harmonic-minor"` or `"melodic-minor-ascending"` and degree is its rotation 1..7. `relativeMinorModePitchClasses` and `relativeMinorModeNoteSpellings` instead derive the tonic and mode from a parent tonic, preserving its exact collection and spellings. C harmonic minor degree 2 yields D–E-flat–F–G–A-flat–B–C; C ascending melodic minor degree 2 yields D–E-flat–F–G–A–B–C. `minorModeRegisteredPitches` and `minorModeRegisteredNotes` generate fixed runs with existing `ScaleRunOptions` and the same 10,000-note cap, spelling, and register limits. Both directions retain the selected collection; no classical downward substitution, naming aliases, or parser changes are introduced. Existing canonical major-mode APIs remain separate. See [D035](docs/DECISIONS.md#d035-fixed-modes-of-harmonic-and-ascending-melodic-minor).

`scaleRegisteredPitches` and `scaleRegisteredNotes` produce ordered scale runs from a registered tonic, scale type, and explicit `{ direction, octaves, includeEndpoint }` options. Positive whole-number octave extent includes the starting tonic and optionally the final tonic; internal octave tonics remain. C4 major upward for one octave with the endpoint gives C4–D4–E4–F4–G4–A4–B4–C5; downward gives C4–B3–A3–G3–F3–E3–D3–C3. Every existing collection, including pentatonic and fixed melodic-minor-ascending, supports both directions. Spelled output preserves exact spellings and written octave boundaries. Invalid options, runs above `MAX_SCALE_RUN_NOTES` (10,000), unsafe emitted pitches, and unrepresentable spellings throw `RangeError` without truncation. Arbitrary pitch bounds remain deferred; explicit melodic-minor conventions use the separate helpers below.

`melodicMinorRegisteredPitches` and `melodicMinorRegisteredNotes` accept a registered tonic and required `{ convention, direction, octaves, includeEndpoint }` options. `"fixed-collection"` uses melodic-minor-ascending in either direction; `"classical-exercise"` uses it upward and natural minor downward. From C5, fixed descent gives C5–B4–A4–G4–F4–E♭4–D4–C4, while classical descent gives C5–B♭4–A♭4–G4–F4–E♭4–D4–C4. Both ascend C4–D4–E♭4–F4–G4–A4–B4–C5. These helpers reuse the existing run validation, spelling rules, and 10,000-note cap, checking only the selected leg's collection. Unsupported or missing convention throws `RangeError`; no convention is inferred. See [D034](docs/DECISIONS.md#d034-explicit-melodic-minor-traversal-conventions).

Each registered-run call handles one direction. A caller can compose an up-and-down request by generating the ascending leg, starting the descending leg at the upper tonic, and joining them. To show the turning tonic once, retain the ascending endpoint and skip the descending leg's first note: C4–D4–E4–F4–G4–A4–B4–C5–B4–A4–G4–F4–E4–D4–C4. This composition is available to a future application or AI orchestrator; no combined-run helper or prompt handling is implemented. Each leg has its own output cap.

Direction changes the ordering of the selected fixed collection; it does not choose a different collection automatically. In particular, descending `melodic-minor-ascending` keeps its raised sixth and seventh. Classical melodic-minor exercises commonly use natural minor downward; jazz melodic minor commonly keeps the ascending collection in both directions. An unqualified request for "melodic minor up and down" therefore needs an explicit convention. The separate convention-aware helpers above support this explicit choice. Modes derived from the fixed ascending collection remain fixed in both directions and do not inherit classical downward substitution.

`parseScaleType` translates an existing scale identifier or its space-separated name into `ScaleType`: `"  Major   Pentatonic "` becomes `"major-pentatonic"`. It ignores capitalization, trims outer whitespace, and accepts repeated whitespace between words. Hyphenated identifiers require exact separators; mixed spaces/hyphens are rejected. Major/Ionian and natural-minor/Aeolian identifiers remain distinct. Unsupported names, abbreviations, bare minor/melodic minor, tonic-prefixed text, and extra words throw `SyntaxError`. The parser supplies existing construction functions with an identifier; it infers no tonic, key, or melodic-minor convention. Later construction can independently throw `RangeError` for an unsupported spelling or numeric result.

`chromaticPitchClasses(tonic)` returns all twelve numeric pitch classes in ascending semitone order from the tonic, wrapping modulo 12 without repeating the tonic. For tonic 10, the result is 10,11,0,1,2,3,4,5,6,7,8,9. This standalone helper provides no spelling, register, or degree queries; chromatic is not a `ScaleType`, and the scale-name parser continues to reject it. Chromatic spelling, degree access, and scale-catalog integration remain deferred.

`DegreeFormula` separates a major-relative role (`{ number: 3, alteration: -1 }` for ♭3) from ordinal position. `pitchClassFromDegreeFormula` and `noteSpellingFromDegreeFormula` resolve simple roles 1–7 with alterations -3..3 from an explicit tonic, preserving letter roles and rejecting final spellings beyond triple accidentals. C + ♯4 yields F♯; C + ♭5 yields G♭ at the same pitch class. B𝄪 + ♭3 yields D𝄪. `parseDegreeFormula` accepts single formulas such as `b03`, `♭3`, or `𝄫7`; `formatDegreeFormula` produces ASCII or Unicode, defaulting to repeated Unicode signs for doubles/triples (`♭♭7`, `♯♯♯4`). Triple formulas accept `###4`, `♯♯♯4`, and `♯𝄪4` (and flat equivalents). Malformed text throws `SyntaxError`; unsupported numbers and structured formulas throw `RangeError`.

`degreeFormulas` and `degreeFormulaAtOrdinal` expose collection roles; `pitchClassAtCollectionDegree`, `noteSpellingAtCollectionDegree`, and `collectionDegreeOfPitchClass` accept either an existing `ScaleType` or a `MinorMode` descriptor. Membership returns `{ ordinal, formula }` or `undefined`. C minor pentatonic ordinal 2 has formula ♭3; C major pentatonic ordinal 4 has formula 5. Harmonic-minor rotation 7 at C has ordinal 7/formula ♭♭7, spelled B𝄫. Minor-mode queries use the mode's own tonic; its rotation degree and queried ordinal remain separate. Spelled retrieval validates only the requested member. Existing scale queries are unchanged. Compound/registered formulas and arbitrary note-to-formula identification remain deferred; explicit keys/signatures and key-aware selection are supported separately below. See [D036](docs/DECISIONS.md#d036-simple-degree-formulas-and-shared-collection-queries) and the [Degrees ExecPlan](plans/degrees.md).

`createKey(tonic, mode)` represents an explicitly spelled `"major"` or `"minor"` identity, separately from signature support and scale selection. `keySignature(key)` returns altered letters in conventional signature order, supporting zero through seven single sharps or flats. D major and B minor both return F♯/C♯; D minor returns B♭. F♯ major retains six sharps and G♭ major six flats. All 98 tonic/mode identities are representable, while only 30 have supported conventional signatures; unsupported signatures throw `RangeError` without respelling. Selecting harmonic or melodic-minor material does not change a minor key's identity/signature.

`relativeKey` changes tonic and major/minor mode, using formula 6 from major or ♭3 from minor; `parallelKey` changes mode while preserving tonic spelling. D major's relative key is B minor and its parallel key is D minor. Relationships do not require a supported signature: C♭ major's parallel C♭ minor identity succeeds, while its signature request throws `RangeError`. All previous double-accidental identities now have representable relatives, including B𝄪 major/G♯𝄪 minor and C𝄫 minor/E♭𝄫 major. Six of the 98 relative results require quadruple accidentals and are rejected. Results are independent readonly objects/arrays. Key text, theoretical signatures, and signature-to-key inference remain deferred; narrow key-aware selection is described below. See [D037](docs/DECISIONS.md#d037-explicit-majorminor-keys-and-conventional-signatures), the [key effort](plans/keys-and-key-signatures.md), and [deferred Music Theory improvements](docs/ARCHITECTURE.md#deferred-music-theory-improvements).

`spellingFromPitchClassInKey(pitchClass, key, role?)` selects one spelling using an explicit key and optional major-relative `DegreeFormula`. Without a role, it uses the major/natural-minor signature baseline: class 5 in F♯ major gives E♯, while class 10 in B minor remains `undefined`. An explicit role must match the requested pitch and takes precedence: role 7 spells that B-minor pitch as A♯, while ♯1/♭2 spell class 1 in C major as C♯/D♭. Even a baseline member can have an explicit alternative: C-major class 0 with ♯7 becomes B♯. Baseline selection is a spelling convention, not the set of every pitch usable in a key; `undefined` means this policy did not choose a spelling.

All existing key identities are accepted, without requiring a supported signature or spelling unrelated members. Only the selected output must fit the ±3 accidental limit. Invalid pitch classes/modes/roles, role/pitch mismatches, and unsupported final spellings throw `RangeError` without fallback. Results are fresh readonly spellings; generic sharps/flats and registered selection remain unchanged. Key-aware registered output, context inference, candidates, and fallback policies are deferred. See [D038](docs/DECISIONS.md#d038-key-aware-pitch-class-spelling-with-explicit-degree-roles) and the [key-aware spelling effort](plans/key-aware-spelling.md).

`chordPitchClasses(root, formula)` and `chordNoteSpellings(root, formula)` resolve nonempty custom `ChordFormula` arrays. Each readonly role has a positive safe-integer `number` and an `Accidental` alteration (-3..3). Compound numbers remain distinct in formulas but reduce to simple roles only for resolution through existing degree converters; 2 and 9 therefore share pitch class and spelling without specifying octaves. Preserve order, duplicate roles and enharmonic collisions, with no root or third requirement. Malformed formulas and unrepresentable required spellings throw `RangeError`. Numeric construction remains independent of spelling limits; inputs are preserved and outputs are independent and readonly by type, without runtime freezing. See [D042](docs/DECISIONS.md#d042-shared-chord-formulas-with-unregistered-compound-roles).

`triadFormula(quality)`, `triadPitchClasses(root, quality)` and `triadNoteSpellings(root, quality)` support major, minor, diminished, augmented, sus2 and sus4. Tertian formulas use root/third/fifth; suspended formulas use 1/2/5 or 1/4/5 and contain no third. Each formula call returns independent role objects. Constructors use the shared formula resolver, preserving exact spelling, triple-accidental limits, typed roots and independent readonly results. No bass, register or inversion is assigned. See [D043](docs/DECISIONS.md#d043-triad-formulas-and-suspended-structures).

`seventhChordFormula(quality)`, `seventhChordPitchClasses(root, quality)` and `seventhChordNoteSpellings(root, quality)` support the eight original seventh qualities plus `dominant-seventh-sus2` and `dominant-seventh-sus4`. Formula retrieval composes cloned triad roles and a seventh; constructors use the shared resolver. C diminished seventh retains C–E♭–G♭–B𝄫; suspended sevenths replace the third with second/fourth. Existing limits, independent readonly results and typed roots are preserved. See [D044](docs/DECISIONS.md#d044-seventh-formulas-and-suspended-structures).

`added-tone-chords.ts` exports `AddedToneChordQuality`, `addedToneChordFormula`, `addedToneChordPitchClasses` and `addedToneChordNoteSpellings`. Seven qualities are major-add2 (1/3/5/2), major-add9 (1/3/5/9), minor-add9 (1/flat-3/5/9), major-add11 (1/3/5/11), major-sixth (1/3/5/6), minor-sixth (1/flat-3/5/6) and major-sixth-ninth (1/3/5/6/9). Compose independent triad formulas with copied added roles; all actual pitch/spelling construction uses D042. No seventh is implied, and add2/add9 retain distinct role numbers without implying register. See [D045](docs/DECISIONS.md#d045-added-tone-and-sixth-chord-formulas).

`extended-chords.ts` exports `ExtendedChordQuality`, `extendedChordFormula`, `extendedChordPitchClasses` and `extendedChordNoteSpellings`. Dominant, major and minor ninth/eleventh/thirteenth qualities compose their corresponding seventh formulas with roles 9, 9/11, or 9/11/13. These are complete theoretical constructions, retaining the third and natural eleventh rather than applying voicing omissions. Formula roles do not specify register; formula retrieval and constructed outputs remain independent and readonly by type. See [D046](docs/DECISIONS.md#d046-complete-named-extended-chord-formulas).

The extended catalog also includes `dominant-flat-ninth`, `dominant-sharp-ninth`, `dominant-sharp-eleventh`, `dominant-flat-thirteenth` and `major-sharp-eleventh`. Each replaces one extension of a complete base formula; dominant-flat-thirteenth retains natural 11. See [D047](docs/DECISIONS.md#d047-five-selected-altered-extended-constructions).

`scale-harmonization.ts` derives triads and seventh chords from all existing seven-note scales and modes. `harmonizedChordFormulaAtDegree(collection, degree, kind)` returns the selected degree, explicit `"triad"`/`"seventh"` kind, root-relative formula and a required `quality` field containing an existing catalog identifier or `undefined`. `harmonizedChordPitchClassesAtDegree` and `harmonizedChordNoteSpellingsAtDegree` additionally take the collection tonic first and return the chord root and tones. Their full-sequence counterparts, `harmonizeCollectionFormulas`, `harmonizeCollectionPitchClasses` and `harmonizeCollectionNoteSpellings`, omit the degree argument and return seven results in degree order. C-major degree VII seventh yields B–D–F–A; C harmonic minor's degree VII yields B–D–F–A♭. Minor-mode descriptors use the supplied mode tonic, with rotation degree separate from chord degree; ascending melodic minor remains a fixed collection. Pentatonics are excluded. Selected spelling validates only the requested chord; full spelling throws if any required tone exceeds ±3. Results are independent and readonly by type, without register, bass or inversion semantics. See [D048](docs/DECISIONS.md#d048-seven-note-collection-harmonization) and the [harmonization effort](plans/scale-harmonization.md).

`chord-descriptions.ts` provides `PitchClassChordDescription` and `SpelledChordDescription`, each containing an explicit root, formula and optional specified bass without register. `createPitchClassChordDescription(root, formula, bass?)` and `createSpelledChordDescription(root, formula, bass?)` validate formulas and copy all supplied musical fields. Missing bass means unspecified; explicit root bass and non-chord bass are retained. Creating a spelled description does not require its derived tones to be spellable. `chordDescriptionPitchClasses(description)` resolves either representation numerically; `chordDescriptionNoteSpellings(description)` resolves spelled descriptions with the existing ±3 accidental limit. Both return formula tones only, without adding or reordering around the bass. Named chord constructors and harmonization use this shared path while keeping their APIs and outputs. A C-major description with E bass retains that bass separately while resolving C–E–G. These descriptions express musical intent; actual sounding bass and voicing require registered pitches. See [D049](docs/DECISIONS.md#d049-structured-chord-descriptions-with-specified-bass) and the [description effort](plans/structured-chord-descriptions.md).

`parseChordSymbol(text)` reads the [bounded chord-symbol grammar](docs/ARCHITECTURE.md#chord-symbol-grammar) into a `SpelledChordDescription`, covering all 37 named qualities, six aliases and optional slash basses. `formatChordSymbol(description, notation?)` matches exact ordered catalog roles and emits canonical Unicode by default or explicit ASCII. `C6/9` has no specified bass; `C6/9/E` specifies E. Aliases normalize (`Cø7` → `Cm7(♭5)`); root/bass spelling and explicit root bass are retained. Parsing and formatting do not resolve derived tones, and unmatched custom formulas have no supported symbol. Unsupported syntax throws `SyntaxError`; malformed/unmatched formatting formulas or invalid notation throw `RangeError`. See [D050](docs/DECISIONS.md#d050-bounded-chord-symbol-grammar-and-canonical-formatting) and the [symbol effort](plans/chord-symbols.md).

`registered-chords.ts` represents supplied numeric/spelled voicings as `RegisteredPitchVoicing` (`pitches`) or `RegisteredNoteVoicing` (`notes`). `createRegisteredPitchVoicing` and `createRegisteredNoteVoicing` require nonempty lists and preserve order, repetitions, negative register and exact note spelling with independent readonly-by-type copies. `rootPositionChordRegisteredPitches(description, root)` and `rootPositionChordRegisteredNotes(description, root)` require an explicit registered root and preserve full formula distances: from C4, major-add2 yields C4–E4–G4–D4, while major-add9 ends D5. Root position requires an unaltered role 1 and no tone below the root, but does not sort the output. An incompatible root or specified bass throws `RangeError`; spelled construction requires exact root/bass spelling, whereas numeric construction compares pitch classes and remains independent of derived spelling limits. These supplied voicings do not infer identity or validate chord coverage/playability. See [D051](docs/DECISIONS.md#d051-explicit-registered-voicings-and-root-position-realization) and the [realization effort](plans/registered-chord-realization.md).

For example, use the current direct module imports:

```ts
import { chordPitchClasses } from "./domain/music-theory/chords-symbols-and-realization/chord-formulas.js";
import { extendedChordFormula } from "./domain/music-theory/chords-symbols-and-realization/extended-chords.js";

chordPitchClasses(0, extendedChordFormula("dominant-sharp-eleventh"));
// [0, 4, 7, 10, 2, 6] in formula role order, without register.
```

The descriptions below explain the intended application. See [current implementation status](docs/ARCHITECTURE.md#current-implementation) for the authoritative account of what exists.

`analyzeRegisteredPitchVoicing(description, voicing, options?)` and `analyzeRegisteredNoteVoicing(description, voicing, options?)` analyze explicit registered tones against a known chord. Numeric analysis compares pitch classes; spelled analysis requires exact letter/accidental while ignoring octave for coverage. Results retain bass ties, specified-bass agreement, per-role coverage, doubling, omissions, unexpected tones, and stable semitone spacing. All roles are required unless their zero-based positions appear in `optionalFormulaIndices`. Tertian 1/3/5 and 1/3/5/7 structures receive bass-derived inversion labels independently of omissions; unsupported structures and ambiguous bass roles remain explicit. A requested non-chord lowest bass is allowed separately from formula coverage. These operations neither identify harmony nor generate voicings or judge fingering. See [D052](docs/DECISIONS.md#d052-known-chord-bass-inversion-and-voicing-analysis) and the [analysis effort](plans/chord-voicing-analysis.md).

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
