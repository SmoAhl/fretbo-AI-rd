import {
  type DegreeFormula,
  noteSpellingFromDegreeFormula,
  pitchClassFromDegreeFormula,
} from "../degrees-keys-and-spelling/degrees.js";
import { type Accidental, type NoteSpelling } from "../pitch-pitch-classes-and-spelling/note-spelling.js";
import { type PitchClass } from "../pitch-pitch-classes-and-spelling/pitch-class.js";

/** A major/perfect-relative role; compound numbers carry no register requirement. */
export type ChordDegreeFormula = Readonly<{ number: number; alteration: Accidental }>;
export type ChordFormula = readonly ChordDegreeFormula[];

function simpleFormulas(formula: ChordFormula): readonly DegreeFormula[] {
  if (!Array.isArray(formula) || formula.length === 0) {
    throw new RangeError("Chord formula must be a nonempty array of degree roles.");
  }
  // Iteration includes sparse entries, which must reject rather than silently omit tones.
  const result: DegreeFormula[] = [];
  for (const role of formula) {
    if (role === null || typeof role !== "object"
      || !Number.isSafeInteger(role.number) || role.number < 1
      || !Number.isInteger(role.alteration) || role.alteration < -3 || role.alteration > 3) {
      throw new RangeError("Chord degree roles require a positive safe-integer number and alteration in -3..3.");
    }
    result.push({
      number: ((role.number - 1) % 7 + 1) as DegreeFormula["number"],
      alteration: role.alteration,
    });
  }
  return result;
}

/** Preserve formula order and multiplicity, discarding spelling and register. */
export function chordPitchClasses(root: PitchClass, formula: ChordFormula): readonly PitchClass[] {
  return simpleFormulas(formula).map((role) => pitchClassFromDegreeFormula(root, role));
}

/** Preserve exact role letters; reject required spellings beyond triple accidentals. */
export function chordNoteSpellings(root: NoteSpelling, formula: ChordFormula): readonly NoteSpelling[] {
  return simpleFormulas(formula).map((role) => noteSpellingFromDegreeFormula(root, role));
}
