# Music Theory Reference

## Purpose and scope

This is a sourced reference for Western pitch, interval, scale, key, and chord theory under **12-tone equal temperament (12-TET)**. It supplies theoretical context for deterministic Music Theory Engine work. **Reference coverage does not establish implemented or promised capabilities.** Supported inputs, representations, interfaces, spelling policies, and defaults require separate design and verification.

[Architecture](ARCHITECTURE.md) owns system responsibilities; [Decisions](DECISIONS.md) owns accepted project choices; [AGENTS.md](../AGENTS.md) owns working instructions. This document owns theoretical explanations and their sources. Domain implementation realizes selected capabilities, and tests verify that implementation. Neither source citations nor examples here replace those tests.

Labels distinguish **mathematical facts** under assumptions, **definitions**, **notation conventions**, **pedagogical conventions**, and **context-dependent practices**. Unlabelled construction tables use the definitions and notation stated around them. Musical symbols illustrate theory, not a software input grammar.

Examples use English letter names, Unicode accidentals, and middle C = C4 when register matters. These are document conventions, not product settings. Outside scope: other tuning systems and traditions beyond boundary notes; rhythm, meter, engraving, counterpoint, prescriptive voice leading, progression recommendation, automatic analysis, advanced post-tonal classification, instrument mapping, ergonomics, audio, MIDI, and software design. Blues-specific theory, symmetric scales, and modes of harmonic/melodic minor are deferred. These editorial limits do not make omitted concepts invalid.

### Contents

- [Pitch, pitch classes, and spelling](#pitch-pitch-classes-and-spelling)
- [Intervals and transposition](#intervals-and-transposition)
- [Scales and modes](#scales-and-modes)
- [Degrees, keys, and signatures](#degrees-keys-and-signatures)
- [Chords, symbols, and realization](#chords-symbols-and-realization)
- [Scale harmonization](#scale-harmonization)
- [Mathematical relationships](#mathematical-relationships)
- [Sources and verification](#sources-and-verification)

## Pitch, pitch classes, and spelling

**Definitions.** Pitch concerns perceived highness or lowness; for the ideal pitched tones considered here, frequency provides its physical coordinate. A particular registered pitch differs from a pitch class: C4 and C5 are distinct pitches but octave-equivalent. Within the assumed 12-TET system, octave equivalence groups pitches into twelve pitch classes. Enharmonic spellings can name the same pitch class without becoming the same notation. [Pitch notation][omt-pitch]; [frequency relationships][unsw].

A semitone (half step) is one 12-TET step; a whole tone (whole step) is two. Equal steps mean equal frequency **ratios**, not equal differences in hertz. The mathematical relationship appears [below](#mathematical-relationships). These equivalences are scoped to this tuning system, not every performance or tuning tradition. [UNSW][unsw].

**Notation convention.** Letter names cycle A–B–C–D–E–F–G. Natural E–F and B–C are semitone steps; the other adjacent natural letters are whole steps. A sharp raises a natural letter by one semitone, a flat lowers it by one, and double sharps/flats alter it by two. A natural restores the unaltered letter. An explicit accidental specifies the letter's alteration; it is not added cumulatively to a key-signature alteration. [Accidentals][omt-accidentals].

Thus C♯ and D♭ share a pitch class but retain distinct letters and possible musical roles. E♯ is a valid spelling, enharmonic with F. In the octave notation used here, the number changes at the natural-letter boundary B–C; accidentals retain the letter's octave number. Consequently B♯3 sounds as C4, while C♭4 sounds as B3. A letter with an accidental but no register does not specify one sounding pitch. [Pitch notation][omt-pitch]; [accidentals][omt-accidentals].

## Intervals and transposition

**Definition.** An interval relates two pitches. A chromatic distance counts semitones; a spelled interval also has a diatonic **number** and **quality**. Count letter positions inclusively: C–E is a third, C–F a fourth, regardless of accidentals. Harmonic intervals sound together; melodic intervals occur successively. Direction and register matter when the actual pitches are specified. [Interval foundations][h-intervals].

For ascending reference intervals, these are the perfect/major sizes:

| Number | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Reference quality | P | M | M | P | P | M | M | P |
| Semitones | 0 | 2 | 4 | 5 | 7 | 9 | 11 | 12 |

P = perfect; M = major. For a fixed number, minor (m) is one semitone below major. Augmented (A) is one above perfect or major; diminished (d) is one below perfect or minor. Thus d5 is 6 semitones, whereas d3 is 2. Further enlargement or contraction produces doubly augmented/diminished qualities and beyond. [Intervals and quality][omt-intervals]; [interval foundations][h-intervals].

C4–F♯4 is A4, and C4–G♭4 is d5: both span six semitones, but the letters determine different numbers. A semitone count alone cannot select the correct name. Naming a descending interval likewise requires its direction and letters: C4 down to A3 is a descending m3, not an ascending M6 merely because the pitch-class displacement can wrap around. [Enharmonic intervals][omt-intervals].

Simple interval numbers run from unison through octave; compound numbers extend beyond the octave. Adding an octave adds seven to the number and twelve semitones to the span, preserving quality: M2 becomes M9, m3 becomes m10. An octave remains distinct from a unison even though both reduce to zero pitch-class displacement. [Compound intervals][omt-intervals].

**Interval inversion** exchanges lower and upper positions by octave displacement. For ordinary simple complementary intervals, their numbers sum to nine; P pairs with P, M with m, and A with d. Reduce compound intervals first when seeking their simple complements. This operation differs from changing a chord's bass or reflecting a pitch-class set. [Interval inversion][h-inversion].

**Transposition** preserves an interval relationship while shifting pitches. Transposing C–E–G up M2 gives D–F♯–A: both letter displacement and semitone displacement are preserved. Specifying only “up one semitone” does not settle whether C becomes C♯ (A1) or D♭ (m2). Chromatic transposition of pitch classes and transposition by a named interval answer different questions. [Interval foundations][h-intervals]; [transposition][omt-sets].

## Scales and modes

The scales below order degrees relative to a tonic. A pitch-class collection alone does not supply that ordering or tonal center. The following ascending patterns include the final step back to the tonic an octave higher. H = one semitone, W = two, A2 = three with augmented-second spelling. Formula numbers compare intervals above the tonic with the **parallel major scale**; ♭3 means a minor third, not necessarily a flat letter name. [Major scales][omt-major]; [scale templates, p. 1][napier]; [scale formulas][h-scales].

| Scale | Ascending step pattern | Formula relative to major |
| --- | --- | --- |
| Major | W W H W W W H | 1 2 3 4 5 6 7 |
| Natural minor | W H W W H W W | 1 2 ♭3 4 5 ♭6 ♭7 |
| Harmonic minor | W H W W H A2 H | 1 2 ♭3 4 5 ♭6 7 |
| Melodic minor, ascending form | W H W W W W H | 1 2 ♭3 4 5 6 7 |

[Minor-scale definitions][omt-minor]; independently cross-checked with [Napier, p. 1][napier] and [Hutchinson's scale formulas][h-scales].

**Pedagogical convention.** Classical melodic-minor exercises commonly raise degrees 6 and 7 ascending and use natural minor descending. A-minor examples are A–B–C–D–E–F♯–G♯–A upward and A–G–F–E–D–C–B–A downward. **Context-dependent practice.** Jazz melodic minor commonly retains the ascending-form collection in both directions. Neither convention dictates every melody in minor; actual usage depends on context. [Minor scales][omt-minor]; [Napier, p. 2][napier].

The seven diatonic modes have these tonic-relative formulas:

| Mode | Formula |
| --- | --- |
| Ionian | 1 2 3 4 5 6 7 |
| Dorian | 1 2 ♭3 4 5 6 ♭7 |
| Phrygian | 1 ♭2 ♭3 4 5 ♭6 ♭7 |
| Lydian | 1 2 3 ♯4 5 6 7 |
| Mixolydian | 1 2 3 4 5 6 ♭7 |
| Aeolian | 1 2 ♭3 4 5 ♭6 ♭7 |
| Locrian | 1 ♭2 ♭3 4 ♭5 ♭6 ♭7 |

[Diatonic modes][omt-modes]; [independent scale formulas][h-scales].

Rotating the major pattern derives these collections, but mode involves a tonal center: C major and D Dorian share pitch classes while organizing degrees around different tonics. Starting a melody on D alone does not establish D Dorian. “Mode” here concerns modern diatonic usage, not a complete account of historical modal systems. [Diatonic modes][omt-modes].

Major pentatonic uses 1–2–3–5–6 (semitone offsets 0, 2, 4, 7, 9); minor pentatonic uses 1–♭3–4–5–♭7 (0, 3, 5, 7, 10). The chromatic collection contains all twelve pitch classes; an ascending octave traversal comprises twelve semitone steps. Ascending-sharp/descending-flat spelling is a teaching convenience, not a universal chromatic-spelling rule. [Napier, p. 2][napier]; [chromatic collection][omt-modes].

## Degrees, keys, and signatures

Ordinal scale degrees identify positions within the named scale. In C minor, E♭ is **degree 3**; in a major-relative formula it is **♭3**. These descriptions use different reference points. Ordinary degree names are 1 tonic, 2 supertonic, 3 mediant, 4 subdominant, 5 dominant, 6 submediant; degree 7 is a leading tone when a semitone below the tonic, or a subtonic when a whole tone below. [Degrees in major][omt-major]; [degrees in minor][omt-minor].

**Definition and context.** A key establishes a tonic and tonal relationships across music. A scale lists ordered pitches; it does not exhaust the notes permissible in a key. Minor-key harmony commonly uses variable sixth and seventh degrees. “Diatonic” can mean membership of the major collection or its modes, while tonal-harmony teaching also uses it more broadly for minor-key materials. Name the particular collection when membership must be exact. [Minor-key harmony][h-minor-chords].

**Notation convention.** Standard key signatures give default letter alterations. Sharps accumulate F–C–G–D–A–E–B; flats B–E–A–D–G–C–F. From C major, successive ascending fifths lead through G, D, A, E, B, F♯, C♯; descending fifths lead through F, B♭, E♭, A♭, D♭, G♭, C♭. Common signatures use up to seven single sharps or flats; this is not a limit on theoretically spellable scales. Enharmonic respelling closes the pitch-class circle, not an identity of written keys. [Key signatures and fifths][omt-major].

Relative major/minor keys share a signature: C major/A minor, or E♭ major/C minor. The relative-minor tonic is a spelled minor third below the major tonic. Parallel keys share a tonic, such as C major/C minor. A signature alone cannot distinguish relative keys or establish modal context. Harmonic/melodic-minor alterations do not create separate conventional minor key signatures. [Relative and parallel relationships][omt-minor].

For major, the named minor scales, and diatonic modes, spell the seven degrees with seven successive letters before repeating the tonic. F♯ major is F♯–G♯–A♯–B–C♯–D♯–E♯: substituting F for E♯ obscures degree 7. This spelling principle does not require every scale to contain seven notes. [Scale spelling][omt-major]; [accidentals][omt-accidentals].

## Chords, symbols, and realization

### Construction and spelling

A chord is a musical grouping of tones; the tertian chords below are defined through stacked thirds. Their **root** anchors the construction, regardless of the lowest sounding note. Triads have root, third, and fifth; seventh chords add a seventh above the root. Formula accidentals alter major/perfect reference intervals. [Triads][h-triads]; [seventh chords][h-sevenths].

| Quality | Root-relative formula | Semitone offsets | Example |
| --- | --- | --- | --- |
| Major triad | 1 3 5 | 0, 4, 7 | C–E–G |
| Minor triad | 1 ♭3 5 | 0, 3, 7 | C–E♭–G |
| Diminished triad | 1 ♭3 ♭5 | 0, 3, 6 | C–E♭–G♭ |
| Augmented triad | 1 3 ♯5 | 0, 4, 8 | C–E–G♯ |
| Major seventh | 1 3 5 7 | 0, 4, 7, 11 | Cmaj7 |
| Dominant seventh | 1 3 5 ♭7 | 0, 4, 7, 10 | C7 |
| Minor seventh | 1 ♭3 5 ♭7 | 0, 3, 7, 10 | Cm7 |
| Half-diminished seventh | 1 ♭3 ♭5 ♭7 | 0, 3, 6, 10 | Cm7(♭5), Cø7 |
| Diminished seventh | 1 ♭3 ♭5 ♭♭7 | 0, 3, 6, 9 | Cdim7, C°7 |
| Minor-major seventh | 1 ♭3 5 7 | 0, 3, 7, 11 | Cm(maj7) |

Construction: [triads][h-triads], [sevenths][h-sevenths], [jazz chord basics][h-jazz]; independently cross-checked with [OMT triad qualities][omt-triads] and [OMT seventh qualities][omt-sevenths]. Interval sizes: [intervals][omt-intervals].

The diminished seventh on C is C–E♭–G♭–B𝄫, not C–E♭–G♭–A: B supplies the required seventh letter. Other combinations follow the same construction: an augmented triad plus a major seventh gives 1–3–♯5–7 (0, 4, 8, 11), often written Cmaj7(♯5); with a minor seventh it gives 1–3–♯5–♭7, often C7(♯5). Naming the triad and seventh separately avoids treating one familiar list as exhaustive. [Seventh construction][h-sevenths]; [chord alterations][h-jazz].

### Chord-symbol conventions

**Notation convention.** In common jazz/pop lead sheets, a bare root such as C denotes major; m denotes a minor triad, and an unqualified 7 adds a minor seventh. “Dominant seventh” can describe chord quality without asserting dominant function in a particular key. Chord-symbol systems have variants; a symbol is not a fully specified performance. [Chord symbols][omt-symbols]; [jazz basics][h-jazz].

| Symbol | Basic construction in this convention |
| --- | --- |
| C9 | C–E–G–B♭–D; includes a seventh |
| Cadd9 | C–E–G–D; no seventh implied |
| Csus2 | C–D–G; second replaces third |
| Csus4 / Csus | C–F–G; fourth replaces third |
| C6 / Cm6 | C–E–G–A / C–E♭–G–A; major sixth added |
| C6/9 | C–E–G–A–D; sixth and ninth, no seventh implied |

[Added/suspended tones][omt-symbols]; [sus chords][h-sus]; [sixth and ninth conventions][h-jazz].

Extensions 9, 11, and 13 correspond to compound 2, 4, and 6. Common unaltered extensions are major ninth, perfect eleventh, and major thirteenth. Alterations such as ♭9 or ♯11 change those intervals; they do not necessarily produce flat/sharp letter names. For example, D7(♯11) adds G♯. A sus symbol describes a sonority and need not imply a prepared, resolving contrapuntal suspension. [Chord symbols][omt-symbols]; [sus chords][h-sus].

**Convention differences.** OMT distinguishes add2/add9 by placement, whereas Hutchinson reports interchangeable popular usage. Do not infer mandatory register from either label universally. Extended-chord teaching may display every stacked third through 13; actual voicings often omit intermediate members. Hutchinson explicitly separates his classroom C13 notation from real-world practice. [OMT chord symbols][omt-symbols]; [Hutchinson's conventions][h-jazz].

### Identity, inversion, and voicing

The bass is the lowest sounding pitch. For a triad, root/third/fifth in the bass means root position/first inversion/second inversion. A seventh chord also permits third inversion, with its seventh in the bass. Upper-note ordering does not determine inversion. Slash notation specifies chord/bass: C/E is first-inversion C major; C/F♯ specifies a non-chord bass and is not a C-triad inversion. [Inversions and slash notation][h-inverted].

Voicing concerns register, spacing, distribution, doubling, and the realized selection of tones. Fingering concerns physical execution and is outside this reference. Omissions may preserve an understood harmony in context, but there is no universal permission to delete arbitrary tones. Rootless ensemble voicings, for example, depend on context. [Voicing guidelines][omt-voicings].

Pitch-class membership alone cannot uniquely determine chord identity: C–E–G–A can support C6 or Am7 interpretations. Nor can a pitch-class set reveal bass, inversion, or register. Conversely, different arrangements and doublings can realize the same named harmony. Preserve the distinction between describing a known chord and inferring one from sounding notes. [Inversions][h-inverted]; [voicing context][omt-voicings].

## Scale harmonization

To derive tertian chords from a specified seven-degree collection, take alternate degrees: 1–3–5, then 2–4–6, and so on, continuing into the next octave; add the next alternate degree for sevenths. Classify the resulting root-relative intervals. The following tables are **derived from the scale and chord formulas above**, not a claim that every listed chord is equally typical in music. [Major-key triads][h-major-chords]; [minor-key triads][h-minor-chords]; [seventh construction][h-sevenths].

| Fixed collection | Triad qualities on degrees 1 → 7 |
| --- | --- |
| Major | major, minor, minor, major, major, minor, diminished |
| Natural minor | minor, diminished, major, minor, minor, major, major |
| Harmonic minor | minor, diminished, augmented, minor, major, major, diminished |
| Melodic minor ascending / jazz minor | minor, minor, augmented, major, major, diminished, diminished |

| Fixed collection | Seventh qualities on degrees 1 → 7 |
| --- | --- |
| Major | maj7, m7, m7, maj7, 7, m7, ø7 |
| Natural minor | m7, ø7, maj7, m7, m7, maj7, 7 |
| Harmonic minor | m(maj7), ø7, maj7(♯5), m7, 7, maj7, °7 |
| Melodic minor ascending / jazz minor | m(maj7), m7, maj7(♯5), 7, 7, ø7, ø7 |

Both tables use the [scale definitions][h-scales] and [chord constructions][h-sevenths], with additional seventh qualities explained in [jazz basics][h-jazz]. In classical descending melodic-minor exercises, the natural-minor row applies to that collection.

**Notation convention.** Case-sensitive Roman numerals identify root degree and quality: in major, I–ii–iii–IV–V–vi–vii° describes the triads above. In minor, scale-relative III/VI/VII and major-relative ♭III/♭VI/♭VII coexist; state the reference convention. Do not confuse either system with key-independent chord symbols. [Roman-numeral conventions][h-roman]; [minor-key usage][h-minor-chords]; [major-relative modal notation][omt-modal].

For A minor, E–G–B follows natural minor, while E–G♯–B follows the raised leading tone. Both can occur in minor-key music. A fixed harmonization table describes collection membership, not a universal progression rule or an exhaustive account of key membership. [Minor harmony][h-minor-chords].

## Mathematical relationships

These are mathematical descriptions, not storage formats or algorithms prescribed for FretboAIrd. Define the musical question before discarding information.

### Frequency and octave equivalence

For ideal 12-TET pitches separated by signed semitone distance n, let f₁ and f₂ be their frequencies in hertz. Their ratio is **f₂/f₁ = 2^(n/12)**. Twelve steps double frequency. The reference frequency is independent: A4 = 440 Hz is common convention, not a consequence of equal temperament. [UNSW][unsw].

Let p and q be integer semitone coordinates on one such pitch lattice, with an arbitrary origin. They are octave-equivalent exactly when **p − q = 12k** for an integer k. The twelve residue classes form pitch-class space. Choosing C as pitch-class label 0 is a convenient example convention; it does not select an absolute register, frequency, or software representation. [Pitch-class mathematics][h-set-theory]; [pitch notation][omt-pitch].

### Distances and transposition

| Question | Mathematical relationship |
| --- | --- |
| Directed distance between registered pitches | q − p semitones |
| Distance ignoring direction but retaining register | abs(q − p) semitones |
| Ordered pitch-class displacement | (q − p) mod 12 |
| Transpose a registered pitch by n semitones | p + n |
| Transpose a pitch-class label x by n semitones | Tₙ(x) = (x + n) mod 12 |

[Integer interval concepts][h-set-theory]; [modulo transposition][omt-sets].

Here a mod 12 is the unique r with a = 12k + r and 0 ≤ r < 12. Thus −1 mod 12 = 11. It is mathematical modulo, not an assumption about a programming language's remainder operator. With C = 0 and B = 11, B up one semitone wraps to C. Pitch-class displacement 0 cannot distinguish unison, octave, or multiple octaves. This is a derivation from the equivalence relation, not an additional musical convention.

### Spelled interval arithmetic

Count diatonic **steps** exclusively: a third traverses two letter steps. Successive ascending interval numbers n₁ and n₂ therefore compose to **n₁ + n₂ − 1**, while their semitone distances add. C4–E4–G4 gives 3 + 3 − 1 = 5 and 4 + 3 = 7: a perfect fifth. Adding an octave contributes seven letter steps and twelve semitones. For mixed directions use signed steps/distances; do not apply the ascending formula blindly. These relationships follow from inclusive numbering and semitone measurement. [Interval numbering][h-intervals]; [compound intervals][omt-intervals].

For simple interval inversion, let n be the interval number and s its semitone span. With 1 ≤ n ≤ 8 and 0 ≤ s ≤ 12, the inverted number is 9 − n and the complementary span is 12 − s semitones. Retain the spelling and quality relationship described [earlier](#intervals-and-transposition); this is not merely reduction modulo 12. Unusual spellings can make letter direction and sounding direction disagree, so unsigned distance alone is insufficient. [Inversion][h-inversion]; [interval spelling][omt-intervals].

### Collections and information loss

An ordered sequence preserves progression through degrees or pitches; a set preserves membership, and a multiset additionally preserves repeated membership. Reducing pitches modulo 12 loses register; discarding duplicates loses multiplicity; sorting loses original sequence. Replacing spelled notes with pitch classes also loses spelling. A bare collection does not establish tonic, root, or bass. [Pitch-class sets][h-set-theory]; [collection transformations][omt-sets].

Normalize only for a question that permits these losses, such as comparing pitch-class membership. Do not use one normalized set as a complete description of a scale, chord, or voicing. Set-theoretic inversion is a reflection of pitch classes; it is distinct from interval inversion and chord inversion. Consonance, preferred voicings, and stylistic usefulness also cannot be reduced to universal validity claims. [Set transformations][omt-sets]; [voicing guidelines][omt-voicings].

## Sources and verification

All entries were checked on **2026-10-02**. **Direct text** means the cited chapter sections were retrieved and read, not that every exercise, image, audio example, or linked resource was audited. **Indexed text** means substantive indexed chapter excerpts were checked; direct retrieval was unavailable. None of the sources below is supported solely by a contents listing. **Full PDF text** means both pages' extracted prose were read; notation images were not used as evidence.

OMT = *Open Music Theory*, online Version 2; current-book copyright 2023, with later updates. Hutchinson = Robert Hutchinson, *Music Theory for the 21st-Century Classroom*, University of Puget Sound, online edition; individual chapter dates are not supplied. These are two independent textbooks; OMT copies/adaptations do not provide independent corroboration. The Napier handout is supplementary because it lacks an individual author/date. Original explanations and derived tables here summarize theory; no textbook illustrations are reproduced.

For future corrections, prefer authored academic or established educational sources, check the relevant context, and corroborate important rules independently. Keep citations next to their claims, record changed verification dates, and describe genuine convention differences rather than declaring one universal rule. Mathematical recomputation checks table consistency but is not an independent historical or pedagogical source.

### UNSW

Joe Wolfe, UNSW Physics, [*Note names, MIDI numbers and frequencies*][unsw], undated; frequency ratios, equal temperament, reference-pitch and naming conventions. **Direct text.** Only pitch relationships are used here, not MIDI representations.

### OMT-Pitch

Chelsey Hamm and Bryn Hughes, [*American Standard Pitch Notation (ASPN)*][omt-pitch], especially pitch versus pitch class and octave designations. **Indexed text.**

### OMT-Accidentals

Chelsey Hamm, [*Half Steps, Whole Steps, and Accidentals*][omt-accidentals], accidentals and enharmonic equivalence. **Indexed text.**

### OMT-Intervals

Chelsey Hamm and Bryn Hughes, [*Intervals*][omt-intervals], number/quality, compound intervals, inversion, and enharmonic equivalence. **Indexed text**, cross-checked with Hutchinson's interval chapters.

### H-Intervals

Hutchinson, [§5.1, *Introduction to Intervals*][h-intervals], numeric size and quality families. **Direct text.**

### H-Inversion

Hutchinson, [§5.4, *Inversion of Intervals Explained*][h-inversion]. **Direct text.**

### OMT-Major

Chelsey Hamm and Bryn Hughes, [*Major Scales, Scale Degrees, and Key Signatures*][omt-major], scale construction, degree names, signatures, and fifths. **Direct text.**

### OMT-Minor

Chelsey Hamm and Bryn Hughes, [*Minor Scales, Scale Degrees, and Key Signatures*][omt-minor], minor forms and relative/parallel relationships. **Direct text.**

### Napier

Edinburgh Napier University-hosted [*Scale Templates*][napier], author and date unstated, **pp. 1–2**. Page 1: major/minor steps; page 2: classical/jazz melodic minor and pentatonic collections. **Full PDF text.**

### OMT-Modes

Chelsey Hamm, [*Introduction to Diatonic Modes and the Chromatic Scale*][omt-modes], modes, pentatonic and chromatic collections. **Indexed text**, cross-checked with Hutchinson and Napier.

### H-Scales

Hutchinson, [§31.9, *Scales*][h-scales], especially table 31.9.4. **Direct text.** Only the explicitly covered collections are summarized here.

### H-Triads

Hutchinson, [§6.1, *Introduction to Triads*][h-triads], root/third/fifth construction and four qualities. **Direct text.**

### H-Sevenths

Hutchinson, [§8.1, *Introduction to Seventh Chords*][h-sevenths], seventh construction and common qualities. **Direct text.**

### OMT-Triads

Chelsey Hamm, [*Triads*][omt-triads], *OPEN MUSIC THEORY* copy, copyright 2021; root-relative qualities and chord spelling. **Indexed text of the older copy**, used to cross-check Hutchinson.

### OMT-Sevenths

Chelsey Hamm, [*Seventh Chords*][omt-sevenths], triad-plus-seventh definitions and nomenclature. **Indexed text**, used to cross-check Hutchinson.

### H-Jazz

Hutchinson, [§31.1, *Jazz Chord Basics*][h-jazz], extensions, alterations, minor-major sevenths, sixth chords, and classroom/performance differences. **Direct text.**

### OMT-Symbols

Megan Lavengood, [*Chord Symbols*][omt-symbols], *OPEN MUSIC THEORY* copy, copyright 2021; additions, suspensions, symbols and voicing implications. **Indexed text of the older copy**, cross-checked with Hutchinson; not counted as a separate source from OMT.

### H-Sus

Hutchinson, [§6.5, *Simple “Sus” Chords*][h-sus]. **Direct text.**

### H-Inverted

Hutchinson, [§6.3, *Inverted Triads*][h-inverted], including §6.3.1 slash chords. **Direct text.** Seventh-inversion reasoning also follows the root/third/fifth/seventh construction.

### OMT-Voicings

Megan Lavengood, [*Jazz Voicings*][omt-voicings], omissions and the distinction between guidelines and rules. **Indexed text.**

### H-Major-Chords

Hutchinson, [§7.2, *Diatonic Chords in Major*][h-major-chords]. **Direct text.**

### H-Minor-Chords

Hutchinson, [§7.3, *Diatonic Chords in Minor*][h-minor-chords], collection-derived possibilities versus common usage. **Direct text.**

### H-Roman

Hutchinson, [§7.1, *Roman Numeral Chord Symbols*][h-roman]. **Direct text.**

### H-Set-Theory

Hutchinson, [§33.1, *Set Theory*][h-set-theory], integer notation for pitches/intervals and pitch-class sets. **Direct text.**

### OMT-Modal

Megan Lavengood, [*Modal Schemas*][omt-modal], Aeolian and Mixolydian Roman-numeral notation. **Indexed text.** Only the notation comparison is used; progression recommendations remain outside scope.

### OMT-Sets

Megan Lavengood and Brian Moseley, [*Pitch-Class Sets, Normal Order, and Transformations*][omt-sets], collection reduction, modulo transposition and set inversion. **Indexed text.** Normal/prime-form procedures are outside this reference.

[unsw]: https://phys.unsw.edu.au/jw/notes.html
[omt-pitch]: https://viva.pressbooks.pub/openmusictheory/chapter/aspn/
[omt-accidentals]: https://viva.pressbooks.pub/openmusictheory/chapter/half-and-whole-steps/
[omt-intervals]: https://viva.pressbooks.pub/openmusictheory/chapter/intervals/
[h-intervals]: https://musictheory.pugetsound.edu/mt21c/IntervalsIntroduction.html
[h-inversion]: https://musictheory.pugetsound.edu/mt21c/InversionOfIntervals.html
[omt-major]: https://viva.pressbooks.pub/openmusictheory/chapter/major-scales/
[omt-minor]: https://viva.pressbooks.pub/openmusictheory/chapter/minor-scales/
[napier]: https://onlinevideo.napier.ac.uk/assoc_files/61877386.pdf
[omt-modes]: https://viva.pressbooks.pub/openmusictheory/chapter/intro-to-diatonic-modes-and-the-chromatic-scale/
[h-scales]: https://musictheory.pugetsound.edu/mt21c/JazzScales.html
[h-triads]: https://musictheory.pugetsound.edu/mt21c/TriadsIntroduction.html
[h-sevenths]: https://musictheory.pugetsound.edu/mt21c/SeventhChordsIntroduction.html
[omt-triads]: https://viva.pressbooks.pub/openmusictheorycopy/chapter/triads/
[omt-sevenths]: https://viva.pressbooks.pub/openmusictheory/chapter/seventh-chords/
[h-jazz]: https://musictheory.pugetsound.edu/mt21c/JazzChordBasics.html
[omt-symbols]: https://viva.pressbooks.pub/openmusictheorycopy/chapter/chord-symbols/
[h-sus]: https://musictheory.pugetsound.edu/mt21c/SimpleSusChords.html
[h-inverted]: https://musictheory.pugetsound.edu/mt21c/InvertedTriads.html
[omt-voicings]: https://viva.pressbooks.pub/openmusictheory/chapter/jazz-voicings/
[h-major-chords]: https://musictheory.pugetsound.edu/mt21c/DiatonicChordsInMajor.html
[h-minor-chords]: https://musictheory.pugetsound.edu/mt21c/DiatonicChordsInMinor.html
[h-roman]: https://musictheory.pugetsound.edu/mt21c/RomanNumeralChordSymbols.html
[omt-modal]: https://viva.pressbooks.pub/openmusictheory/chapter/modal-schemas/
[h-set-theory]: https://musictheory.pugetsound.edu/mt21c/SetTheorySection.html
[omt-sets]: https://viva.pressbooks.pub/openmusictheory/chapter/pc-sets-normal-order-and-transformations/
