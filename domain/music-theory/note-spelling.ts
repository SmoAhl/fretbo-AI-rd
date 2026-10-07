import { type PitchClass, transposePitchClass } from "./pitch-class.js";

export type NoteLetter = "A" | "B" | "C" | "D" | "E" | "F" | "G";

/** Semitone alteration: double flat, flat, natural, sharp, or double sharp. */
export type Accidental = -2 | -1 | 0 | 1 | 2;

/** Explicit spelling without register; both fields are required. */
export type NoteSpelling = Readonly<{
  letter: NoteLetter;
  accidental: Accidental;
}>;

const naturalPitchClasses: Readonly<Record<NoteLetter, PitchClass>> = {
  C: 0,
  D: 2,
  E: 4,
  F: 5,
  G: 7,
  A: 9,
  B: 11,
};

/** Convert a typed spelling to a C-based pitch class, losing spelling information. */
export function pitchClassFromSpelling(note: NoteSpelling): PitchClass {
  return transposePitchClass(naturalPitchClasses[note.letter], note.accidental);
}
