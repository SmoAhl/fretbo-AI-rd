# Fretboard Reference

## Purpose and scope

FretboAIrd models a discrete fretboard: identified strings, registered open-string tuning, and a bounded range of numbered frets. This reference provides the knowledge needed to map pitches to locations. Instrument construction and physical geometry are outside this model.

[Music Theory](MUSIC_THEORY_REFERENCE.md) determines musical content; Fretboard determines where its pitches can occur; [Playability](PLAYABILITY_REFERENCE.md) evaluates proposed chord fingerings. A collection of matching locations may contain alternatives and is not itself a chord grip. Reference coverage does not imply implemented capabilities; see [Architecture](ARCHITECTURE.md).

## String identity and count

Each string has a stable identity. String count determines which strings exist; retuning changes pitches without changing string identities.

On a conventionally numbered six-string guitar, string 1 is the high E string and string 6 is the low E string in standard tuning. String numbers are distinct from array indices and screen positions. Alternative tunings need not preserve ascending pitch order across strings, so pitch order must not determine string identity.

## Tuning and register

Tuning assigns a registered open pitch to each string. Pitch class alone is insufficient: E2 and E4 share a pitch class but are different pitches.

Examples use sounding pitches, English note names, and middle C = C4. Standard six-string tuning is:

| String number | 6 | 5 | 4 | 3 | 2 | 1 |
| --- | --- | --- | --- | --- | --- | --- |
| Open pitch | E2 | A2 | D3 | G3 | B3 | E4 |

Alternative tuning means assigning different registered open pitches to the same strings. Mapping must use the stated tuning rather than assume standard tuning. These examples do not establish product presets or instrument defaults.

## Frets, locations, and range

A location identifies one string and one fret. Fret 0 denotes the open string; fretted locations use consecutive integer fret numbers starting at 1. The fret count bounds the available fretted locations. A fretboard with 22 frets has locations at frets 0 through 22; fret 24 is unavailable.

Each consecutive fret raises the pitch by one semitone under **12-tone equal temperament (12-TET)**. Given an open pitch expressed as a registered semitone value and an available fret n:

**pitch at (string, n) = open pitch of that string + n semitones**

Twelve frets higher gives the same pitch class one octave higher, if that location exists. The mapping needs string identity, registered tuning, and fret range; it does not need instrument measurements or rendering coordinates.

| Location in standard tuning | Registered pitch |
| --- | --- |
| String 6, fret 0 | E2 |
| String 6, fret 1 | F2 |
| String 6, fret 12 | E3 |
| String 6, fret 5 or string 5, fret 0 | A2 |

## Matching pitches to locations

One registered pitch may occur at several string/fret locations. Matching a pitch class includes further locations in other octaves. Keep these two questions distinct and retain location identities even when pitches match.

Enharmonic spelling does not change a location's pitch under 12-TET. String 6, fret 2 can sound F♯2 or G♭2; musical context determines the spelling, as explained in [pitch, pitch classes, and spelling](MUSIC_THEORY_REFERENCE.md#pitch-pitch-classes-and-spelling).

A region restricts the search to a specified portion of the available strings and frets. Scales and melodies currently require note locations only. Choosing simultaneous chord locations and assigning fingers requires additional chord and playability rules.
