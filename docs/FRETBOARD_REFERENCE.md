# Fretboard Reference

## Purpose, assumptions, and boundaries

This is a sourced reference for the physical instrument facts and conventions needed to map pitches to fretted-guitar locations. It supports deterministic Fretboard Engine work, coding-agent context, later AI grounding, and test design. **Reference coverage does not establish implemented or promised capabilities.**

The primary example is an ordinary six-string guitar with one string per course and consecutive chromatic frets intended for **12-tone equal temperament (12-TET)**. Calculations describe ideal open or normally stopped string fundamentals. English letter names, Unicode accidentals, **sounding pitches**, and middle C = C4 follow the [Music Theory Reference](MUSIC_THEORY_REFERENCE.md#pitch-pitch-classes-and-spelling). These are document assumptions and notation conventions, not application defaults.

[Architecture](ARCHITECTURE.md) owns responsibilities; [Decisions](DECISIONS.md) owns accepted project choices; [AGENTS.md](../AGENTS.md) owns working instructions. Music Theory explains musical relationships; this reference explains instrument mapping. Software design selects representations and supported capabilities, domain code implements them, and tests verify them. SVG/UI presents results; Playability assesses physical execution, with sourced context in the [Playability Reference](PLAYABILITY_REFERENCE.md). A location map is not a fingering or proof of a playable grip.

Labels distinguish **physical facts**, **mathematical facts under assumptions**, **definitions**, **instrument conventions**, **notation conventions**, **manufacturer/common-practice conventions**, and **context-dependent practices**. Tables inherit their surrounding qualifications.

Outside scope: fingering generation, finger assignment, barre feasibility, anatomy, maximum stretches, ergonomic scoring, preferred fingerings, picking/muting techniques, bends, vibrato, slide and harmonic-playing techniques, detailed construction, intonation setup, tonewoods, electronics, amplification, audio DSP, MIDI, tablature syntax, APIs/types, application state, AI tools, and rendering geometry. Brief boundary notes do not extend the model to these topics.

### Contents

- [Instrument structure and terminology](#instrument-structure-and-terminology)
- [String identity, numbering, and orientation](#string-identity-numbering-and-orientation)
- [Tuning and register](#tuning-and-register)
- [Frets, locations, and range](#frets-locations-and-range)
- [Mathematical and physical relationships](#mathematical-and-physical-relationships)
- [Capos](#capos)
- [Instrument variation and model limits](#instrument-variation-and-model-limits)
- [Sources and verification](#sources-and-verification)

## Instrument structure and terminology

**Definitions.** These terms distinguish the instrument from its diagram. [Fretting terminology][yamaha-strings]; [string endpoints][fender-capo]; [scale measurement][fender-scale].

| Term | Meaning relevant to mapping |
| --- | --- |
| String | A tensioned vibrating element extending along the neck; its identity persists when retuned. |
| Open string | A string sounding without a finger stopping it at a fret. Unqualified examples here mean without a capo; effective open strings under a capo are distinguished below. |
| Nut | The neck/headstock-end guide that normally establishes the open string's speaking-length endpoint. A physical zero fret can supply that contact instead. |
| Fret | A raised contact across the fingerboard against which a string is stopped; the contact sets the neck-side end of its sounding segment. |
| Fretboard / fingerboard | The neck surface beneath the strings that carries the frets in the assumed instrument. |
| Bridge and saddle | The bridge assembly supports the strings at the body end; a saddle or individual saddles provide the speaking-length contact. The bridge assembly and contact point are not interchangeable measurements. |
| Vibrating / speaking length | The sounding segment between its effective endpoints: normally nut-to-saddle when open, fret-to-saddle when stopped. It is not the string's entire installed length. |
| Scale length | The nominal design length used for fret placement; in the ideal uncompensated model, the open speaking length. |
| Fret count | The number of ordinary numbered frets present, excluding the conceptual open-string case; it bounds available fretted locations. |

**Physical fact and measurement convention.** Real saddles may be displaced for compensation. Fender determines nominal scale length by doubling the nut-to-twelfth-fret distance, then adjusts saddle positions. Thus nominal scale and each actual nut-to-saddle distance need not coincide. This convention is scoped to the ordinary layout, not every unusual instrument. [Fender][fender-scale]; [UNSW][unsw-strings].

For ideal note mapping, the essential facts are identified strings, registered open tuning, available frets, and the fret system. Scale length adds physical distances. Gauge, action (string height), fingerboard radius, materials, and construction affect physical behavior, sound, or ergonomics; they are not extra inputs to the ideal semitone mapping established [below](#mathematical-and-physical-relationships).

## String identity, numbering, and orientation

**Instrument convention.** On a conventionally strung six-string guitar, string 1 is the high E string, usually thinnest, and string 6 the low E string, usually thickest. In standard tuning, pitch rises when traversing strings 6 toward 1. Numbering is corroborated by [Yamaha][yamaha-strings] and [HyperPhysics][hyperphysics].

**Context-dependent language.** “High/low” can describe pitch, whereas “top/bottom” depends on viewpoint. In an ordinary upright playing orientation, the low E is physically above the high E; that does not prescribe a diagram. Prefer “toward the bridge/higher fret numbers” to an unexplained “up the neck.” Handedness, holding orientation, and viewing direction must be specified when they matter.

Retuning does not renumber a string. Nashville tuning below breaks ascending pitch order; thickness is likewise not a definition of pitch. A conventional string number identifies an instrument position, not an array index, sorted-pitch rank, or screen coordinate. Those representations remain separate choices.

## Tuning and register

**Definition.** Tuning assigns a registered open pitch to each identified string. A list of pitch classes alone is insufficient: E2 and E4 are distinct pitches even though both belong to E. The octave numbers here name sounding register, not a staff-notation position.

**Instrument convention.** Ordinary six-string classical, steel-string acoustic, and electric guitars commonly use the following standard tuning. It is not a universal tuning for everything called a guitar. [HyperPhysics][hyperphysics]; [D'Addario's acoustic chart][daddario-standard]; [Strandberg's electric specifications][strandberg-strings].

| String number | 6 | 5 | 4 | 3 | 2 | 1 |
| --- | --- | --- | --- | --- | --- | --- |
| Registered open pitch | E2 | A2 | D3 | G3 | B3 | E4 |

The repeated E pitch class does not identify one string or register. **Derived** adjacent ascending semitone distances are 5, 5, 5, 4, 5; the G3–B3 pair differs from the other adjacent pairs.

**Context-dependent practice.** Drop D lowers only string 6 from E2 to D2: D2–A2–D3–G3–B3–E4. [Fender][fender-drop-d]. Nashville/high-strung tuning instead uses E3–A3–D4–G4–B3–E4 on strings 6 through 1. String 3 then sounds higher than string 2, despite retaining its identity. [D'Addario's registered chart][daddario-nashville]. These examples describe tuning relationships, not instructions for restringing or product presets.

## Frets, locations, and range

**Instrument convention.** Ordinary frets are numbered from 1 near the nut, increasing toward the body. To sound fret n, a finger presses on its nutward side so that the string contacts that fret's crown. The named fret is the stopping contact, not the fingertip's exact position within the space. [Yamaha][yamaha-strings]; [HyperPhysics][hyperphysics].

**Definition.** A fretted location identifies a particular string and stopping fret. In the ideal model it determines one registered pitch once tuning is known. An open-string location identifies a string without such finger stopping. Calling this “fret 0” in mathematics or a diagram does not prescribe software encoding or assert the presence of metal fretwire. An actual **zero fret** can terminate the open string while a nut guides it laterally. [Strandberg][strandberg-zero].

**Derived examples**, using standard tuning and the semitone relationship below:

| Location | Sounding pitch | Distinction illustrated |
| --- | --- | --- |
| String 6, open | E2 | Registered starting pitch |
| String 6, fret 1 | F2 | One semitone higher |
| String 6, fret 12 | E3 | Same pitch class, one octave higher |
| String 6, fret 5; string 5, open | A2 at either location | One registered pitch, different locations |
| String 1, open | E4 | Another E register on another string |

A registered pitch can occur at multiple locations; a pitch class can match still more. String 6/fret 2 can be named F♯2 or G♭2 under 12-TET; its physical location alone cannot select the spelling appropriate to a musical context. See [pitch identity and spelling](MUSIC_THEORY_REFERENCE.md#pitch-pitch-classes-and-spelling).

A region here means a specified portion of the available locations, not a hand position or fingering pattern. On an illustrative instrument with 22 frets, fret 24 is unavailable even though the equations define its theoretical pitch. Location existence does not establish comfortable access, finger assignment, or simultaneous execution of a collection.

## Mathematical and physical relationships

These are mathematical descriptions, not prescribed algorithms, storage formats, or SVG coordinates. Let n be an ordinary physical fret number; n = 0 denotes the mathematical open case. Let p₀ be the open pitch's integer semitone coordinate on an arbitrary-origin 12-TET lattice, f₀ its fundamental frequency, and L its ideal uncompensated scale length. Distances are measured along the string from its open neck-side endpoint.

**Mathematical facts under assumptions.** Equal temperament supplies the frequency ratio. For an ideal flexible string with unchanged tension and linear density, fundamental frequency is inversely proportional to vibrating length. These assumptions connect musical steps to physical distances. [UNSW pitch relationships][unsw-notes]; [UNSW string physics][unsw-strings].

| Quantity | Relationship |
| --- | --- |
| Registered pitch at fret n | pₙ = p₀ + n |
| Frequency relative to open | fₙ / f₀ = 2^(n/12) |
| Remaining vibrating length | ℓₙ = L × 2^(−n/12) |
| Distance from open endpoint to fret n | xₙ = L × (1 − 2^(−n/12)) |
| Twelve frets higher, if present | pₙ₊₁₂ = pₙ + 12; fₙ₊₁₂ = 2fₙ |

The length expressions follow from the inverse relationship and agree with [Mottola's modern fret formula][mottola]. [StewMac][stewmac] independently describes equivalent successive spacing using the rounded divisor 17.817154. The historical divisor 18 is an approximation, not the exact 12-TET relationship.

**Derived checkpoints** for an illustrative L = 648 mm:

| n | Frequency / open frequency | Remaining length | Distance from open endpoint |
| --- | --- | --- | --- |
| 0 | 1 | 648 mm | 0 mm |
| 12 | 2 | 324 mm | 324 mm |
| 24, if present | 4 | 162 mm | 486 mm |

Equal semitone steps have equal frequency ratios, not equal hertz differences or equal millimetre spacing. Each next fret gap is smaller by a factor 2^(−1/12). Changing L scales distances without changing p₀ + n when tuning and fret system remain fixed. This is a consequence of the equations, not a claim that scale length has no other physical effects.

Two semitone coordinates share a pitch class exactly when their difference is 12k for an integer k. Reduction modulo 12 loses register. A pitch-class-only description also cannot recover spelling or which string/fret produced the pitch; those were never specified by the coordinate alone. See [octave equivalence](MUSIC_THEORY_REFERENCE.md#frequency-and-octave-equivalence) and [information loss](MUSIC_THEORY_REFERENCE.md#collections-and-information-loss).

**Physical limitations.** Real fretting stretches a string and changes tension; stiffness also departs from the ideal model. Compensation changes effective contact distances to improve intonation. Therefore, exact ideal equations do not guarantee exact measured frequencies, and the twelfth fret need not bisect a real compensated speaking length. [UNSW][unsw-strings]; [Mottola][mottola]. No setup procedure or tolerance policy follows from this caveat.

## Capos

**Physical fact.** A full capo holds all strings against a fret, moving their effective neck-side endpoints toward the bridge. This shortens their sounding lengths and raises their effective open pitches without retuning at the tuning machines. Partial capos stop only selected strings and are outside the full-capo example. [Fender][fender-capo].

**Derived under the ideal model**, with no retuning: a full capo at physical fret c gives each string the effective open coordinate p₀ + c. A subsequently stopped note at physical fret n greater than c still has p₀ + n. The capo does not add c again to that physical fret's pitch. Physical fret numbers remain fixed; a capo-relative reference counts from the capo.

For standard string 6 with capo 2, the effective open pitch is F♯2. Physical fret 5 still produces A2; it is three frets above the capo. On a string ending at fret N, ordinary available positions run from the capo contact through N, leaving N − c further semitone steps. The lower endpoint rises; the highest existing fret and its ideal pitch do not. This concerns ordinary stopped notes, not playing behind the capo or harmonics.

A capo does not change nominal fret layout or add frets. Real pressure can sharpen strings; placement and pressure affect tuning accuracy. These deviations qualify the ideal calculation without defining capo mechanics or ergonomics. [G7th][g7th].

## Instrument variation and model limits

**Manufacturer/common-practice conventions.** Examples establish variability, not exhaustive categories or FretboAIrd support.

| Variation | Reference consequence |
| --- | --- |
| String count and extended range | Seven/eight-string guitars may add lower strings. Strandberg documents low B and F♯ configurations and alternate lower tunings; string count alone does not determine tuning. [Specifications][strandberg-strings]. |
| Baritone | Longer scales and lower tunings are common; Taylor's B-to-B tuning is a fourth below ordinary guitar tuning, yielding B1–E2–A2–D3–F♯3–B3 in this document's register notation. This is an example, not a universal baritone standard. [Taylor][taylor-baritone]. |
| Bass | The common four-string bass tuning is E1–A1–D2–G2, an octave below the corresponding four guitar strings. Its “standard” differs from six-string guitar; bass coverage stops at this boundary. [D'Addario][daddario-bass]. |
| Fret count | Instruments need not have the same upper range. A “12-fret” guitar can name the neck/body joint rather than total fret count. [Taylor][taylor-12]. |
| Scale length and multiscale | Scales vary between instruments and, on multiscale instruments, between strings. Fanned layout accommodates those lengths; it does not itself change the assumed semitone system. [Strandberg][strandberg-multiscale]; [Mottola][mottola]. |
| Twelve-string courses | A course is one or more strings treated as a playing unit. Common twelve-string guitars pair strings in six courses, with octave or unison partners; six courses are not six individual strings. [D'Addario's paired-pitch chart][daddario-12]. |
| Exceptional layouts | Partial frets require identifying which strings have which contacts; fretless instruments lack discrete stopping frets. Non-12-TET layouts invalidate “one fret = one semitone.” These mark exclusions, not generalized mapping rules. [Microtonal boundary][mottola]. |

Initial supported instruments, tunings, ranges, capo behavior, representations, voicing-generation ownership, playability guarantees, and presentation orientation remain [open project questions](ARCHITECTURE.md#open-architectural-questions). The reference neither resolves them nor turns its examples into defaults.

## Sources and verification

Entries were checked on **2026-10-02** during research and drafting. **Direct text** means the relevant page prose, formulas, or text tables were retrieved and read; it does not mean every image, video, product claim, or linked page was audited. All entries below use direct text. Undated means no publication date is assigned here. No source illustrations are reproduced.

Foundational cross-checks: HyperPhysics and D'Addario for registered standard tuning; Yamaha and HyperPhysics for numbering and semitone fretting; UNSW and Mottola for frequency/length and octave relationships; Mottola and StewMac for fret placement; Fender and UNSW for nominal versus compensated length; Fender and G7th for capo behavior. Pages from the same organization are not independent authorities. Derived examples were recomputed; arithmetic checks establish consistency, not independent source corroboration or implemented behavior.

| Source | Relevant material and limits |
| --- | --- |
| R. Nave, Georgia State University HyperPhysics, [*Acoustic Guitar*][hyperphysics], undated | “Tuning the 6-String Guitar” and fretting terminology. Its historical rule-of-18 discussion and limited fret-count examples are not adopted as exact modern rules. |
| Yamaha Corporation, [*Six strings, each with a higher pitch*][yamaha-strings], undated | Numbering, ordinary orientation, fret contacts, semitone steps. Winding and twenty-fret statements describe its example, not all guitars. |
| D'Addario, [*EJ16 Phosphor Bronze*][daddario-standard], undated | String Tension Chart's six registered pitches only; gauge/tension recommendations are outside scope. |
| Joe Wolfe, UNSW Physics, [*Note names, MIDI numbers and frequencies*][unsw-notes], undated | Equal-tempered ratios and reference-frequency convention; MIDI representations are not used. |
| Joe Wolfe, UNSW Physics, [*Strings, standing waves and harmonics*][unsw-strings], undated | Ideal-string frequency/length relationship, stiffness, fretting-induced stretch, and compensation. Harmonic-playing instructions are not used. |
| R. M. Mottola, [*Calculating Fret Positions*][mottola], updated 2026-06-21 | Modern twelfth-root formula, historical divisor distinction, multiscale and microtonal boundaries. Construction instructions and ergonomic opinions are not adopted. |
| StewMac, [*Fret Scale Ruler Instructions*][stewmac], I-0800, undated | Independent equal-tempered spacing description and rounded divisor. No machining accuracy policy is adopted. |
| Fender, [*How do I set up my Stratocaster guitar properly?*][fender-scale], undated | “Intonation (Roughing It Out)” and “Intonation (Fine Tuning)”: scale measurement and saddle displacement, not setup procedures. |
| Fender, [*Tune Like a Rock Star*][fender-drop-d], undated | Drop D changes only the low E string; style recommendations are not used. |
| D'Addario, [*EJ38H High Strung/Nashville Tuning*][daddario-nashville], undated | Registered string-pitch chart supporting the nonmonotonic ordering example. |
| Jeff Owens, Fender, [*What Is a Capo?*][fender-capo], undated | Endpoints, effective open strings, unchanged fretted pitches, and partial capo distinction; no universal placement limit is inferred. |
| G7th, [*Capo Guide For Beginners*][g7th], 2017-11-28 | Physical application and pressure-related tuning changes, independently corroborating the capo discussion; promotional claims excluded. |
| Strandberg, [*Why do you use zero-frets?*][strandberg-zero], updated 2026-01-12 | Physical zero-fret contact and separate string guidance; claimed tonal advantages are not used. |
| Strandberg, [*Which strings will my guitar come with?*][strandberg-strings], updated 2026-01-12 | Six/seven/eight-string factory examples. Factory specifications are not universal tuning standards. |
| Strandberg, [*Multi-Scale Guitars*][strandberg-multiscale], undated | Different string scale lengths and fanned layout only; ergonomic and tonal claims are outside scope. |
| Taylor Guitars, [*Discover the Deep, Detuned Sound of a Taylor Baritone*][taylor-baritone], undated here | B-to-B tuning a fourth below ordinary tuning and longer-scale context; model-specific values are not defaults. |
| Taylor Guitars, [*12-Fret*][taylor-12], undated | “12-Fret Basics”: neck/body-joint nomenclature versus total frets. |
| Sanjay Ghataode, D'Addario, [*How Many Strings Does a Bass Guitar Have?*][daddario-bass], 2026-01-14 | Four-string tuning/register and instrument-specific configurations; historical narrative is not used. |
| D'Addario, [*EJ39 Phosphor Bronze 12-String*][daddario-12], undated | Text pitch table confirms octave/unison pairing in this conventional set. |

For corrections, retrieve the relevant source context, independently corroborate foundational changes, and update verification dates honestly. Qualify convention differences rather than treating one manufacturer or teaching example as universal. Keep sources beside claims and refer musical definitions back to the Music Theory Reference.

[hyperphysics]: https://hyperphysics.gsu.edu/hbase/Music/guita.html
[yamaha-strings]: https://europe.yamaha.com/en/musical-instruments/guitars-basses-amps/explore/musical-instrument-guide/acoustic-guitar/structure002.html
[daddario-standard]: https://www.daddario.com/en-gb/products/ej16-phosphor-bronze-acoustic-guitar-strings-light-12-53
[unsw-notes]: https://phys.unsw.edu.au/jw/notes.html
[unsw-strings]: https://newt.phys.unsw.edu.au/jw/strings.html
[mottola]: https://www.liutaiomottola.com/formulae/fret.htm
[stewmac]: https://www.stewmac.com/video-and-ideas/online-resources/learn-about-guitar-and-instrument-fretting-and-fretwork/fret-scale-rule-instructions/
[fender-scale]: https://support.fender.com/hc/en-gb/articles/42584764005019-How-do-I-set-up-my-Stratocaster-guitar-properly
[fender-drop-d]: https://www.fender.com/articles/setup/tune-like-a-rock-star
[daddario-nashville]: https://www.daddario.com/en-gb/products/ej38h-phosphor-bronze-acoustic-guitar-strings-high-strung-nashville-tuning-10-27
[fender-capo]: https://www.fender.com/articles/parts-and-accessories/what-is-a-capo
[g7th]: https://www.g7th.com/capo-guide-for-beginners
[strandberg-zero]: https://support.strandbergguitars.com/article/14-zero-frets
[strandberg-strings]: https://support.strandbergguitars.com/article/40-guitar-strings
[strandberg-multiscale]: https://strandbergguitars.com/en-WW/magazine/multi-scale-guitars
[taylor-baritone]: https://blog.taylorguitars.com/discover-the-deep-detuned-sound-of-a-taylor-baritone
[taylor-12]: https://www.taylorguitars.com/guitars/acoustic/features/specialty/12-fret
[daddario-bass]: https://www.daddario.com/en-gb/blogs/guitar/how-many-strings-does-a-bass-guitar-have
[daddario-12]: https://www.daddario.com/en-gb/products/ej39-phosphor-bronze-12-string-acoustic-guitar-strings-medium-12-52
