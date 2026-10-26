import {
  type NoteSpelling,
  pitchClassFromSpelling,
} from "../pitch-pitch-classes-and-spelling/note-spelling.js";
import { type PitchClass } from "../pitch-pitch-classes-and-spelling/pitch-class.js";
import {
  type ChordFormula,
  chordNoteSpellings,
  chordPitchClasses,
  validateChordFormula,
} from "./chord-formulas.js";

/** An unregistered identity; optional bass specifies intent without selecting a voicing. */
export type PitchClassChordDescription = Readonly<{
  root: PitchClass;
  formula: ChordFormula;
  bass?: PitchClass;
}>;

/** Preserve exact root and specified-bass spellings independently of derived-tone limits. */
export type SpelledChordDescription = Readonly<{
  root: NoteSpelling;
  formula: ChordFormula;
  bass?: NoteSpelling;
}>;

/** Copy the formula without inferring a bass, quality, tone selection or register. */
export function createPitchClassChordDescription(
  root: PitchClass,
  formula: ChordFormula,
  bass?: PitchClass,
): PitchClassChordDescription {
  validateChordFormula(formula);
  return {
    root,
    formula: formula.map((role) => ({ number: role.number, alteration: role.alteration })),
    ...(bass === undefined ? {} : { bass }),
  };
}

/** Copy supplied intent; derived-tone spelling is checked only when tones are requested. */
export function createSpelledChordDescription(
  root: NoteSpelling,
  formula: ChordFormula,
  bass?: NoteSpelling,
): SpelledChordDescription {
  validateChordFormula(formula);
  return {
    root: { letter: root.letter, accidental: root.accidental },
    formula: formula.map((role) => ({ number: role.number, alteration: role.alteration })),
    ...(bass === undefined ? {} : { bass: { letter: bass.letter, accidental: bass.accidental } }),
  };
}

/** Formula tones only: discard spelling and leave specified bass separate and unchanged. */
export function chordDescriptionPitchClasses(
  description: PitchClassChordDescription | SpelledChordDescription,
): readonly PitchClass[] {
  const root = typeof description.root === "number"
    ? description.root : pitchClassFromSpelling(description.root);
  return chordPitchClasses(root, description.formula);
}

/** Formula tones in exact role order; do not append or reorder around specified bass. */
export function chordDescriptionNoteSpellings(description: SpelledChordDescription): readonly NoteSpelling[] {
  return chordNoteSpellings(description.root, description.formula);
}
