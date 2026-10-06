# Playability Reference

## Purpose and scope

Playability determines whether a proposed chord fingering is logically usable and compares valid fingerings for practical suitability. FretboAIrd models discrete chord grips, without simulating a guitar or a human hand.

[Music Theory](MUSIC_THEORY_REFERENCE.md) determines the chord and its voicing requirements; [Fretboard](FRETBOARD_REFERENCE.md) supplies available string/fret locations and their registered pitches. Playability evaluates the assigned fingers, contacts, and shared grip constraints. It must preserve required pitches, registers, doublings, and bass notes rather than silently simplify an awkward chord.

Scales and melodies currently need fretboard note locations only, without fingering generation. This reference does not select APIs, candidate-generation ownership, search algorithms, or scoring weights. Reference coverage does not imply implemented capabilities; see [Architecture](ARCHITECTURE.md).

## Chord fingering and grip

A **voicing** specifies the selection, register, and doubling of chord tones. A **fingering** realizes that voicing using particular strings, frets, and fingers. A **grip** is the complete combination of contacts held together. The same voicing may have several fingerings; rejecting one assignment does not reject every realization of that voicing.

Fretting fingers are conventionally numbered 1 index, 2 middle, 3 ring, and 4 little finger. Open strings require no fretting finger. Thumb fretting must be explicitly supported before counting the thumb as another available finger.

## String states and contact rules

| String state         | Rule for a chord fingering                                                                        |
| -------------------- | ------------------------------------------------------------------------------------------------- |
| Fretted and sounding | The assigned stop must produce the required registered pitch.                                     |
| Open and sounding    | No fretting finger is needed; other contacts must leave its intended sound unchanged.             |
| Muted                | The string's pitched sound is intentionally suppressed; muting and fretting are different duties. |
| Unplayed             | The string is omitted from the chord's played strings; this alone does not specify muting.        |

A diagram's X may mean muted or unplayed, so the intended state must be clear. Neither state supplies a sounding chord tone.

In the ordinary fretting model, one string supplies at most one sounding registered pitch at a time. If it has stops at different frets, the highest stop determines the pitch. A lower stop may remain as part of a barre without adding another note. An intended open string cannot also have a fretting stop or muting contact.

## Finger assignment and barres

Each available finger may hold one individual stop or a barre across a contiguous group of strings at one fret. The same finger cannot hold separate frets simultaneously under this model. Several fingers may occupy the same fret on different strings; finger numbering does not impose a universal fret-order rule.

A **barre** uses one finger across several strings at the same fret. A full barre spans all strings; a partial barre spans fewer. Repeated finger labels can therefore be valid and do not imply separate fingers.

Check every string covered by the barre, including strings between its outermost required stops. A continuous stopping barre cannot leave an intervening string open. Other fingers may stop covered strings at higher frets; those higher stops determine their sounding pitches. Barre coverage and the pitches it ultimately supplies are different things.

For example, standard-tuning F major at frets **1, 3, 3, 2, 1, 1** on strings 6 through 1 can use finger 1 for a full barre at fret 1, with fingers 3, 4, and 2 at (5,3), (4,3), and (3,2). Six sounding strings use four fingers. The higher stops replace the barre's pitch on those strings.

## One shared grip and fret span

All concurrent stops and barres must belong to one usable grip. Checking each finger independently, or merely assigning distinct finger labels, is insufficient. Consider the full combination: occupied frets, string distribution, finger assignments, barre coverage, and required open or silent strings.

**Fret span = highest occupied fret − lowest occupied fret** among the grip's fretting stops, including lower barre stops. Exclude open, muted-only, and unplayed strings. Frets 1 and 5 give span 4; one occupied fret gives span 0; an all-open grip has no fretted span.

Use the following conservative project heuristics for recommended chord fingerings. They describe supported recommendations, not universal limits of human reach:

- Prefer compact grips. The ordinary recommendation range covers at most **five consecutive fret positions**, meaning **span ≤ 4**: frets 1 through 5, for example. Count the range, not just the number of distinct frets occupied.
- A **six-position range (span 5)** is an exceptional stretch. Recommend it only as an explicitly reviewed complete fingering, not merely because its pitches and finger count pass. Wider grips are outside these recommendation heuristics.
- Overall span is only an outer limit. A span-4 grip can still demand an unsuitable reach from two neighboring fingers. Prefer small fret gaps between fingers 1–2, 2–3, and 3–4; a gap greater than one fret between these fingers needs review of the complete assignment. This is a review trigger, not proof of impossibility.
- Include all held fretting contacts, including lower barre stops, when checking reach. Do not count an open string as a stop at fret 0 or let a higher sounding stop hide the lower barre contact.

Passing the range check does not establish usability. Combine it with the finger-placement heuristics below and the contact rules above. An all-open grip needs no fretting reach check.

## Finger placement in chord shapes

Finger assignments must describe a usable complete shape, not just attach four different labels to four notes. Use these conservative recommendation heuristics:

- **Across different frets, prefer increasing finger numbers toward higher frets:** index before middle, middle before ring, ring before pinky. Skipping a finger is allowed; assigning every finger is unnecessary. For example, fingers 1, 2, and 4 at frets 1, 2, and 3 follow this ordering. Finger 4 at fret 1 with finger 1 at fret 3 reverses it and requires a reviewed exception.
- **At the same fret, string placement matters.** There is no universal ascending or descending finger-number order across strings. Use a reviewed assignment for that complete chord shape rather than sort fingers by string number. Swapping the ring and pinky in a known shape must not automatically retain its recommendation status.
- **Treat a barre as one finger's complete contact.** Its fret must agree with that finger's other duties, and its coverage must preserve the intended string states. In the F-major example above, index at fret 1, middle at fret 2, and ring/pinky at fret 3 follow the preferred fret ordering; the ring and pinky string assignments remain part of the reviewed shape.
- **Check the combination of fret gaps and string placement.** Correct fret ordering does not establish that fingers can reach their assigned strings together. Unreviewed combinations, unusually stretched neighboring fingers, and reversed fret ordering need a reviewed complete fingering before recommendation.

A reviewed fingering records the strings, frets, finger assignments, and barres together. Movable shapes may retain those relationships when shifted, provided every location remains available and the reach is suitable at the destination. Open-string shapes cannot simply be shifted with their open strings unchanged. These heuristics do not require an exhaustive chord dictionary or select candidate-generation ownership.

If an assignment passes the mechanical checks but lacks support from these heuristics and a reviewed shape, report it as **not established as a recommended fingering**. Do not claim it is physically impossible or silently substitute a different voicing. These rules filter recommendations; they do not prove every passing assignment comfortable for every player.

## CAGED reference fingerings

Open C, A, G, E, and D shapes provide concrete examples for the playability heuristics, especially same-fret placements. The movable adaptations below also illustrate explicit barre duties. All examples use standard six-string tuning, **E2–A2–D3–G3–B3–E4**, listed from **string 6 → string 1**.

In the finger rows, **1 = index, 2 = middle, 3 = ring, 4 = pinky**. In both fret and finger rows, **0 = open string** and **x = unplayed string**, not an instruction to mute. Repeated finger numbers represent the barres specified below. Finger rows show which finger supplies the sounding stop; lower barre contacts remain held even where another finger supplies a higher stop.

These are supported **reference fingerings**, not the only valid assignments or a promise of equal comfort for every player. Alternatives may be supported when the complete assignment is sensible and preserves the required musical content.

### C major through the CAGED shapes

These five voicings all realize C major, with different registers and doublings:

| Shape   | Frets 6 → 1       | Fingers 6 → 1 | Type                       |
| ------- | ----------------- | ------------- | -------------------------- |
| C shape | `x 3 2 0 1 0`     | `x 3 2 0 1 0` | Open                       |
| A shape | `x 3 5 5 5 3`     | `x 1 2 3 4 1` | Movable barre              |
| G shape | `8 7 5 5 5 8`     | `3 2 1 1 1 4` | Movable with partial barre |
| E shape | `8 10 10 9 8 8`   | `1 3 4 2 1 1` | Movable barre              |
| D shape | `x x 10 12 13 12` | `x x 1 2 4 3` | Movable                    |

### Open CAGED chord shapes

These are the basic open major chords from which CAGED gets its name. Unlike the preceding table, each row has its own chord root.

| Chord / shape | Frets 6 → 1   | Fingers 6 → 1 |
| ------------- | ------------- | ------------- |
| C major       | `x 3 2 0 1 0` | `x 3 2 0 1 0` |
| A major       | `x 0 2 2 2 0` | `x 0 1 2 3 0` |
| G major       | `3 2 0 0 0 3` | `2 1 0 0 0 4` |
| E major       | `0 2 2 1 0 0` | `0 2 3 1 0 0` |
| D major       | `x x 0 2 3 2` | `x x 0 1 3 2` |

### Movable minor reference fingerings

These three movable adaptations realize C minor:

| Shape           | Frets 6 → 1       | Fingers 6 → 1 | Type          |
| --------------- | ----------------- | ------------- | ------------- |
| A-shape C minor | `x 3 5 5 4 3`     | `x 1 3 4 2 1` | Movable barre |
| E-shape C minor | `8 10 10 8 8 8`   | `1 3 4 1 1 1` | Movable barre |
| D-shape C minor | `x x 10 12 13 11` | `x x 1 3 4 2` | Movable       |

### Use in playability checks

A future engine should accept these documented assignments within the supported reference model, preserve their required locations and musical content, and recognize each specified barre as one finger's compatible contact. It should reject incompatible simultaneous finger duties and open-string conflicts, while allowing supported alternatives. Acceptance of a reference example must not bypass those checks or turn its finger assignment into an exclusive solution.

## Simultaneous and sequential execution

A chord grip requires its contacts to coexist, even if its strings are strummed one after another. A finger maintaining one required note cannot be reassigned to a different fret while that note still needs its stop.

Separate notes played after earlier contacts are released may reuse fingers. Their overall fret range is not a simultaneous grip span. This distinction prevents treating every scale or melody location as one chord; it does not introduce melodic fingering or transition modeling into the current application.

## Hard constraints and ergonomic ranking

Hard constraints decide whether a candidate is valid under the stated chord and grip rules:

- Its locations exist and produce the requested musical content and bass.
- Every required fretted note has an available finger or valid barre.
- Concurrent finger duties, barre coverage, and string states agree.
- The whole assignment satisfies the declared shared-grip limits, including any hard fret-span limit.

Recommendation additionally requires the fret-range, reach, and finger-placement checks above. A mechanically valid assignment may remain unsupported for recommendation; a reviewed exception cannot override pitch, finger-duty, or barre conflicts.

Ergonomic ranking compares candidates that pass those checks. Useful factors include fret span, awkward finger arrangements, barre extent, and the number of fingers needed. A smaller span or fewer fingers need not outweigh every other factor; weights and tie-breaking require deliberate implementation choices. Practical preference may vary between players.

An invalid fingering must not win through a favorable score. Passing the rules establishes usability within the declared model; ranking expresses practical preference rather than a guarantee of comfort for every player.
