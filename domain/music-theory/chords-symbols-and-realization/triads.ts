import {
  type DegreeFormula,
  noteSpellingFromDegreeFormula,
  pitchClassFromDegreeFormula,
} from "../degrees-keys-and-spelling/degrees.js";
import { type NoteSpelling } from "../pitch-pitch-classes-and-spelling/note-spelling.js";
import { type PitchClass } from "../pitch-pitch-classes-and-spelling/pitch-class.js";

export type TriadQuality = "major" | "minor" | "diminished" | "augmented";

const formulas: Readonly<Record<TriadQuality, readonly DegreeFormula[]>> = {
  major: [
    { number: 1, alteration: 0 },
    { number: 3, alteration: 0 },
    { number: 5, alteration: 0 },
  ],
  minor: [
    { number: 1, alteration: 0 },
    { number: 3, alteration: -1 },
    { number: 5, alteration: 0 },
  ],
  diminished: [
    { number: 1, alteration: 0 },
    { number: 3, alteration: -1 },
    { number: 5, alteration: -1 },
  ],
  augmented: [
    { number: 1, alteration: 0 },
    { number: 3, alteration: 0 },
    { number: 5, alteration: 1 },
  ],
};

function formulasFor(quality: TriadQuality): readonly DegreeFormula[] {
  if (!Object.hasOwn(formulas, quality)) {
    throw new RangeError("Unsupported triad quality.");
  }
  return formulas[quality];
}

/** Root-third-fifth role order, without register, bass, or inversion information. */
export function triadPitchClasses(root: PitchClass, quality: TriadQuality): readonly PitchClass[] {
  return formulasFor(quality).map((formula) => pitchClassFromDegreeFormula(root, formula));
}

/** Preserve each role's exact spelling; reject a required tone beyond triple accidentals. */
export function triadNoteSpellings(root: NoteSpelling, quality: TriadQuality): readonly NoteSpelling[] {
  return formulasFor(quality).map((formula) => noteSpellingFromDegreeFormula(root, formula));
}
