# Music Theory Reference

## Purpose and scope

This reference provides the Western pitch, interval, scale, and chord knowledge needed for deterministic Music Theory Engine work under **12-tone equal temperament (12-TET)**. It describes musical objects; [Fretboard](FRETBOARD_REFERENCE.md) maps their pitches to locations, and [Playability](PLAYABILITY_REFERENCE.md) assesses chord fingerings.

Examples use English letter names, Unicode accidentals, sounding pitches, and middle C = C4. Symbols illustrate musical conventions rather than a parser grammar. Reference coverage does not imply implemented capabilities or select software representations; see [Architecture](ARCHITECTURE.md).

## Pitch, pitch classes, and spelling

A **registered pitch** identifies a pitch in a particular octave, such as C4. A **pitch class** groups octave-equivalent pitches: C4 and C5 are different pitches of the same pitch class. 12-TET has twelve pitch classes, with twelve semitone steps per octave. A whole tone is two semitones.

Natural letters cycle A–B–C–D–E–F–G. E–F and B–C are semitone steps; the other adjacent natural letters are whole steps. A sharp raises a natural letter by one semitone, a flat lowers it by one, double sharps/flats alter it by two, and triple sharps/flats alter it by three. A natural restores the unaltered letter. An explicit accidental specifies the alteration rather than adding to a key-signature alteration.

Enharmonic spellings can identify the same pitch while retaining different musical roles: C♯ and D♭ share a pitch class; E♯ sounds as F. Octave numbers change at the natural-letter B–C boundary, and accidentals retain the letter's octave number: B♯3 sounds as C4, and C♭4 as B3. Triple accidentals obey the same written-octave rule: B♯𝄪3 sounds as D4, and C♭𝄫4 as A3. A note name without register does not identify one registered pitch.

Keep pitch, pitch class, and spelling distinct. Converting to pitch class loses register; replacing a spelled note with a numeric pitch loses its spelling.

## Intervals and transposition

An interval relates two pitches. Chromatic distance counts semitones; a spelled interval also has a **number** and **quality**. Count letter positions inclusively: C–E is a third and C–F a fourth. Harmonic intervals sound together; melodic intervals occur successively. Registered intervals retain direction and octave distance.

| Number | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Reference quality | Perfect | Major | Major | Perfect | Perfect | Major | Major | Perfect |
| Semitones | 0 | 2 | 4 | 5 | 7 | 9 | 11 | 12 |

For a fixed number, minor is one semitone below major; augmented is one above perfect or major; diminished is one below perfect or minor. C–F♯ is an augmented fourth and C–G♭ a diminished fifth, although both span six semitones. Semitone distance alone cannot determine spelling or interval number.

Adding an octave adds seven to the interval number and twelve semitones: a major second becomes a major ninth. An octave is distinct from a unison despite sharing pitch-class displacement. Inverting a simple interval by octave displacement gives complementary numbers summing to nine: perfect pairs with perfect, major with minor, and augmented with diminished.

**Transposition** shifts pitches while preserving their relationships. C–E–G up a major second becomes D–F♯–A; both letters and semitone distances matter. A chromatic instruction such as “up one semitone” alone does not choose C♯ versus D♭.

For numeric semitone values, registered transposition adds the signed offset; pitch-class transposition wraps the result into twelve classes. With numeric classes 0 through 11, wrap negative results as well: 0 down one becomes 11. This arithmetic does not choose note spelling or an absolute register.

## Scales and modes

A scale has a tonic and ordered degrees. Degree formulas below compare intervals above the tonic with the parallel major scale: ♭3 means a minor third, not necessarily a flat letter name. H = one semitone, W = two, A2 = three; step patterns include the return to the tonic an octave higher.

| Scale | Ascending steps | Formula relative to major |
| --- | --- | --- |
| Major | W W H W W W H | 1 2 3 4 5 6 7 |
| Natural minor | W H W W H W W | 1 2 ♭3 4 5 ♭6 ♭7 |
| Harmonic minor | W H W W H A2 H | 1 2 ♭3 4 5 ♭6 7 |
| Melodic minor, ascending form | W H W W W W H | 1 2 ♭3 4 5 6 7 |

Classical melodic-minor exercises commonly use the ascending form upward and natural minor downward. Jazz melodic minor commonly uses the ascending collection in both directions. State which convention is intended; neither dictates every melody in minor.

For C minor, the classical exercise convention gives C–D–E♭–F–G–A–B–C upward and C–B♭–A♭–G–F–E♭–D–C downward. Reversing the fixed ascending collection instead gives C–B–A–G–F–E♭–D–C downward. These are different requested behaviors. Direction alone orders a specified collection; a convention-dependent traversal also specifies which collection applies in each direction. Likewise, a mode derived specifically from the fixed ascending melodic-minor collection does not acquire a different descending collection merely because its parent name mentions melodic minor.

The seven diatonic modes derive from rotations of the major pattern, each with its own tonic:

| Mode | Formula |
| --- | --- |
| Ionian | 1 2 3 4 5 6 7 |
| Dorian | 1 2 ♭3 4 5 6 ♭7 |
| Phrygian | 1 ♭2 ♭3 4 5 ♭6 ♭7 |
| Lydian | 1 2 3 ♯4 5 6 7 |
| Mixolydian | 1 2 3 4 5 6 ♭7 |
| Aeolian | 1 2 ♭3 4 5 ♭6 ♭7 |
| Locrian | 1 ♭2 ♭3 4 ♭5 ♭6 ♭7 |

C major and D Dorian share pitch classes but have different tonics and degree roles. Starting a melody on D alone does not establish D Dorian.

Harmonic minor and the fixed ascending melodic-minor collection each also yield seven modes by rotating their cyclic step patterns. Choose a parent collection and starting degree; that degree becomes the new tonic. To express the rotated collection as tonic-relative semitone offsets, subtract the selected degree's offset from each parent member and wrap into one octave. The new tonic is offset zero, and the closing steps still sum to twelve semitones. Preserve seven successive letter roles when spelling these modes.

For example, rotating C harmonic minor from degree 2 gives D–E♭–F–G–A♭–B–C; rotating the fixed ascending C melodic-minor collection from degree 2 gives D–E♭–F–G–A–B–C. These have different fifth degrees above D. Each derived mode is a fixed collection in both directions: the latter descends D–C–B–A–G–F–E♭–D. Classical melodic-minor exercise substitution does not automatically apply to a mode of the fixed ascending parent. A parent collection and rotation degree identify the intended mode without requiring an alternative naming convention.

Major pentatonic uses 1–2–3–5–6 (semitone offsets 0, 2, 4, 7, 9); minor pentatonic uses 1–♭3–4–5–♭7 (0, 3, 5, 7, 10). The chromatic collection contains all twelve pitch classes.

## Degrees, keys, and spelling

Ordinal degrees refer to positions in the selected collection. E♭ is ordinal 3 of C natural minor and ordinal 2 of C minor pentatonic, but formula ♭3 in both. G is ordinal 4 of C major pentatonic but formula 5.

Simple major-relative formulas use reference numbers 1–7 with offsets 0, 2, 4, 5, 7, 9, 11 semitones above the tonic. An alteration adds or subtracts semitones while retaining that reference letter role: C + ♯4 is F♯, whereas C + ♭5 is G♭. Formula alterations are not necessarily the accidental written on the resulting note: F♯ + 7 is E♯, and B𝄪 + ♭3 is D𝄪. Triple formula alterations retain the reference letter while shifting it by three semitones: C + ♯♯♯4 yields F♯𝄪. Double alterations express roles such as ♭♭7, the diminished seventh; harmonic minor's seventh rotation at C uses C–D♭–E♭–F♭–G♭–A♭–B𝄫. Selecting a parent rotation and querying a position within its resulting mode are distinct operations. Pitch-class membership identifies that collection's role, not a unique spelling or role outside it.

A key establishes a tonic and tonal relationships; it is not limited to one fixed scale collection. Minor-key music can use variable sixth and seventh degrees.

Relative major/minor keys share a key signature, such as C major/A minor. Parallel keys share a tonic, such as C major/C minor. A key signature alone does not identify which relative key or mode is intended. In conventional signatures, sharps accumulate F–C–G–D–A–E–B and flats B–E–A–D–G–C–F.

The relative minor tonic is a major sixth above the major tonic; the relative major tonic is a minor third above the minor tonic, retaining letter spelling and discarding octave for key identity. These relationships can require triple spellings: B𝄪 major has relative G♯𝄪 minor, and C𝄫 minor has relative E♭𝄫 major. D major therefore has relative B minor and parallel D minor. D major/B minor use F♯ and C♯; D minor uses B♭. Enharmonic key tonics retain distinct signatures: F♯ major has six sharps, while G♭ major has six flats.

The conventional minor signature corresponds to its natural-minor collection. Raised sixth or seventh degrees in harmonic/melodic-minor material do not redefine the key signature: B minor retains F♯/C♯ when harmonic minor uses A♯. A theoretical key identity or relative/parallel relationship can be meaningful even when its written signature needs accidentals beyond a system's supported limits.

Key context guides spelling but does not uniquely determine every chromatic pitch's role. In C major, C♯ can express ♯1 and D♭ can express ♭2 at the same sounding class; explicit role determines the letter. A signature-baseline spelling is one convention for requests without a role, not a claim that other pitches cannot occur in the key. In F♯ major the baseline seventh is E♯; in B minor the baseline seventh is A, while explicit major-relative formula 7 identifies A♯. Formula 6 in B minor identifies G♯ and ♭6 identifies G. These roles preserve the same major/perfect reference regardless of key mode.

For the seven-degree scales and modes above, use seven successive letters before repeating the tonic. F♯ major therefore includes E♯ as degree 7; replacing it with F hides that degree relationship. Scales with fewer or more notes do not inherit a seven-letter requirement.

## Chords, symbols, and realization

### Construction and spelling

A chord's **root** anchors its construction and need not be the lowest sounding pitch. Tertian triads stack a root, third, and fifth; seventh chords add a seventh. Root-relative formulas use major/perfect reference intervals.

| Quality | Formula | Semitone offsets | Example symbol |
| --- | --- | --- | --- |
| Major triad | 1 3 5 | 0, 4, 7 | C |
| Minor triad | 1 ♭3 5 | 0, 3, 7 | Cm |
| Diminished triad | 1 ♭3 ♭5 | 0, 3, 6 | Cdim |
| Suspended second | 1 2 5 | 0, 2, 7 | Csus2 |
| Suspended fourth | 1 4 5 | 0, 5, 7 | Csus4 |
| Augmented triad | 1 3 ♯5 | 0, 4, 8 | Caug |
| Major seventh | 1 3 5 7 | 0, 4, 7, 11 | Cmaj7 |
| Dominant seventh | 1 3 5 ♭7 | 0, 4, 7, 10 | C7 |
| Minor seventh | 1 ♭3 5 ♭7 | 0, 3, 7, 10 | Cm7 |
| Half-diminished seventh | 1 ♭3 ♭5 ♭7 | 0, 3, 6, 10 | Cm7(♭5), Cø7 |
| Diminished seventh | 1 ♭3 ♭5 ♭♭7 | 0, 3, 6, 9 | Cdim7, C°7 |
| Minor-major seventh | 1 ♭3 5 7 | 0, 3, 7, 11 | Cm(maj7) |
| Augmented-major seventh | 1 3 ♯5 7 | 0, 4, 8, 11 | Caug(maj7) |
| Suspended second dominant seventh | 1 2 5 ♭7 | 0, 2, 7, 10 | C7sus2 |
| Suspended fourth dominant seventh | 1 4 5 ♭7 | 0, 5, 7, 10 | C7sus4 |
| Augmented seventh | 1 3 ♯5 ♭7 | 0, 4, 8, 10 | Caug7, C7(♯5) |

Suspended three-tone structures replace the third with a second or fourth; they need not be described as tertian triads.

Spell tones by their interval roles. C diminished seventh is C–E♭–G♭–B𝄫; A sounds the same as B𝄫 but does not spell the seventh. Additional qualities can be derived by combining the required triad and seventh rather than treating this table as exhaustive.

To harmonize a seven-degree scale in thirds, take alternate degrees with octave continuation: 1–3–5, then 2–4–6, and so on; add the next alternate degree for sevenths. Determine quality from the resulting root-relative intervals. This derives chords from the stated collection without prescribing a progression.

### Chord-symbol conventions

In common jazz/pop symbols, a bare root denotes major, m denotes minor, and an unqualified 7 adds a minor seventh. Dominant seventh describes a quality without necessarily asserting a dominant function. Symbol conventions vary and do not fully specify a voicing.

| Symbol | Construction in this convention |
| --- | --- |
| C9 | C–E–G–B♭–D; includes a seventh |
| Cadd2 | C–E–G–D; retains role 2 without prescribing register |
| Cmadd9 | C–E♭–G–D; no seventh implied |
| Cadd11 | C–E–G–F; retains the third and adds role 11 |
| Cadd9 | C–E–G–D; no seventh implied |
| Csus2 | C–D–G; second replaces third |
| Csus4 / Csus | C–F–G; fourth replaces third |
| C6 / Cm6 | C–E–G–A / C–E♭–G–A; major sixth added |
| C6/9 | C–E–G–A–D; no seventh implied |

Extensions 9, 11, and 13 correspond to compound 2, 4, and 6. Their common unaltered forms are major ninth, perfect eleventh, and major thirteenth; ♭ or ♯ alters the interval. D7(♯11), for example, adds G♯. Actual extended-chord voicings may omit intermediate tones; required and optional tones depend on the musical context. Add2/add9 usage does not universally fix register.

Complete theoretical extension formulas retain the third and all intermediate extensions. For these constructions, major extensions use a major seventh; minor and dominant extensions use a minor seventh. These formulas do not require every tone in every practical voicing.

| Quality family | Ninth | Eleventh | Thirteenth |
| --- | --- | --- | --- |
| Dominant | 1 3 5 ♭7 9 | 1 3 5 ♭7 9 11 | 1 3 5 ♭7 9 11 13 |
| Major | 1 3 5 7 9 | 1 3 5 7 9 11 | 1 3 5 7 9 11 13 |
| Minor | 1 ♭3 5 ♭7 9 | 1 ♭3 5 ♭7 9 11 | 1 ♭3 5 ♭7 9 11 13 |

An altered extension retains its written degree role. The following complete constructions replace the corresponding natural extension; they do not require its natural counterpart as an additional tone.

| Construction | Complete formula |
| --- | --- |
| Dominant flat ninth | 1 3 5 ♭7 ♭9 |
| Dominant sharp ninth | 1 3 5 ♭7 ♯9 |
| Dominant sharp eleventh | 1 3 5 ♭7 9 ♯11 |
| Dominant flat thirteenth | 1 3 5 ♭7 9 11 ♭13 |
| Major sharp eleventh | 1 3 5 7 9 ♯11 |

### Identity, inversion, and voicing

The **bass** is the lowest sounding registered pitch. A triad is in root position, first inversion, or second inversion when its root, third, or fifth is in the bass. A seventh chord adds third inversion with its seventh in the bass. Upper-note order does not determine inversion.

Slash notation specifies chord/bass: C/E is first-inversion C major; C/F♯ specifies a non-chord bass and is not a C-triad inversion.

A **voicing** specifies tone selection, register, spacing, distribution, and doubling. Preserve required bass, register, and repeated tones when realizing it. Context may permit omissions, but practical fingering difficulty does not authorize deleting required notes.

Pitch-class membership alone does not determine bass, inversion, register, doubling, or a unique chord name: C–E–G–A can be interpreted as C6 or Am7. Describing a known chord and inferring harmony from notes are different questions. Choosing strings and fingers belongs to Fretboard and Playability.
