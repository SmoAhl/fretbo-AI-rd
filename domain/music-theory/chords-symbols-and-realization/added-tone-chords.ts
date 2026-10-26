import { type NoteSpelling } from "../pitch-pitch-classes-and-spelling/note-spelling.js";
import { type PitchClass } from "../pitch-pitch-classes-and-spelling/pitch-class.js";
import { type ChordFormula, chordNoteSpellings, chordPitchClasses } from "./chord-formulas.js";
import { type TriadQuality, triadFormula } from "./triads.js";

export type AddedToneChordQuality =
  | "major-add2"
  | "major-add9"
  | "minor-add9"
  | "major-add11"
  | "major-sixth"
  | "minor-sixth"
  | "major-sixth-ninth";

type AddedToneDefinition = Readonly<{ triad: TriadQuality; additions: ChordFormula }>;

const definitions: Readonly<Record<AddedToneChordQuality, AddedToneDefinition>> = {
  "major-add2": { triad: "major", additions: [{ number: 2, alteration: 0 }] },
  "major-add9": { triad: "major", additions: [{ number: 9, alteration: 0 }] },
  "minor-add9": { triad: "minor", additions: [{ number: 9, alteration: 0 }] },
  "major-add11": { triad: "major", additions: [{ number: 11, alteration: 0 }] },
  "major-sixth": { triad: "major", additions: [{ number: 6, alteration: 0 }] },
  "minor-sixth": { triad: "minor", additions: [{ number: 6, alteration: 0 }] },
  "major-sixth-ninth": { triad: "major", additions: [{ number: 6, alteration: 0 }, { number: 9, alteration: 0 }] },
};

/** Retain the triad and added roles, without implying a seventh or octave placement. */
export function addedToneChordFormula(quality: AddedToneChordQuality): ChordFormula {
  if (!Object.hasOwn(definitions, quality)) {
    throw new RangeError("Unsupported added-tone chord quality.");
  }
  const definition = definitions[quality];
  return [...triadFormula(definition.triad), ...definition.additions.map((role) => ({ ...role }))];
}

/** Formula-defined role order, without bass, register or inversion information. */
export function addedToneChordPitchClasses(root: PitchClass, quality: AddedToneChordQuality): readonly PitchClass[] {
  return chordPitchClasses(root, addedToneChordFormula(quality));
}

/** Preserve exact role spelling; reject required tones beyond triple accidentals. */
export function addedToneChordNoteSpellings(root: NoteSpelling, quality: AddedToneChordQuality): readonly NoteSpelling[] {
  return chordNoteSpellings(root, addedToneChordFormula(quality));
}
