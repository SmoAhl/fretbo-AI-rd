# Playability Reference

## Purpose and scope

Playability determines whether a proposed chord fingering is logically usable and compares valid fingerings for practical suitability. FretboAIrd models discrete chord grips, without simulating a guitar or a human hand.

[Music Theory](MUSIC_THEORY_REFERENCE.md) determines the chord and its voicing requirements; [Fretboard](FRETBOARD_REFERENCE.md) supplies available string/fret locations and their registered pitches. Playability evaluates the assigned fingers, contacts, and shared grip constraints. It must preserve required pitches, registers, doublings, and bass notes rather than silently simplify an awkward chord.

Scales and melodies currently need fretboard note locations only, without fingering generation. This reference does not select APIs, candidate-generation ownership, search algorithms, or scoring weights. Reference coverage does not imply implemented capabilities; see [Architecture](ARCHITECTURE.md).

## Chord fingering and grip

A **voicing** specifies the selection, register, and doubling of chord tones. A **fingering** realizes that voicing using particular strings, frets, and fingers. A **grip** is the complete combination of contacts held together. The same voicing may have several fingerings; rejecting one assignment does not reject every realization of that voicing.

Fretting fingers are conventionally numbered 1 index, 2 middle, 3 ring, and 4 little finger. Open strings require no fretting finger. Thumb fretting must be explicitly supported before counting the thumb as another available finger.

## String states and contact rules

| String state | Rule for a chord fingering |
| --- | --- |
| Fretted and sounding | The assigned stop must produce the required registered pitch. |
| Open and sounding | No fretting finger is needed; other contacts must leave its intended sound unchanged. |
| Muted | The string's pitched sound is intentionally suppressed; muting and fretting are different duties. |
| Unplayed | The string is omitted from the chord's played strings; this alone does not specify muting. |

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

Fret span is a useful constraint and ranking factor, but does not establish usability by itself. A compact assignment can still have conflicting finger duties or an unsuitable overall arrangement. Grip limits must be explicit; this reference does not choose a maximum span or claim a universal comfortable range.

## Simultaneous and sequential execution

A chord grip requires its contacts to coexist, even if its strings are strummed one after another. A finger maintaining one required note cannot be reassigned to a different fret while that note still needs its stop.

Separate notes played after earlier contacts are released may reuse fingers. Their overall fret range is not a simultaneous grip span. This distinction prevents treating every scale or melody location as one chord; it does not introduce melodic fingering or transition modeling into the current application.

## Hard constraints and ergonomic ranking

Hard constraints decide whether a candidate is valid under the stated chord and grip rules:

- Its locations exist and produce the requested musical content and bass.
- Every required fretted note has an available finger or valid barre.
- Concurrent finger duties, barre coverage, and string states agree.
- The whole assignment satisfies the declared shared-grip limits, including any hard fret-span limit.

Ergonomic ranking compares candidates that pass those checks. Useful factors include fret span, awkward finger arrangements, barre extent, and the number of fingers needed. A smaller span or fewer fingers need not outweigh every other factor; weights and tie-breaking require deliberate implementation choices. Practical preference may vary between players.

An invalid fingering must not win through a favorable score. Passing the rules establishes usability within the declared model; ranking expresses practical preference rather than a guarantee of comfort for every player.
