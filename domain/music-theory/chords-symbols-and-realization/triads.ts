import { type ChordFormula } from "./chord-formulas.js";
import {
  createPitchClassChordDescription, createSpelledChordDescription,
  chordDescriptionPitchClasses, chordDescriptionNoteSpellings,
} from "./chord-descriptions.js";
import { type NoteSpelling } from "../pitch-pitch-classes-and-spelling/note-spelling.js";
import { type PitchClass } from "../pitch-pitch-classes-and-spelling/pitch-class.js";

/** Includes suspended three-tone structures as well as tertian triads. */
export type TriadQuality = "major" | "minor" | "diminished" | "augmented" | "sus2" | "sus4";

const formulas: Readonly<Record<TriadQuality, ChordFormula>> = {
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
  sus2: [
    { number: 1, alteration: 0 },
    { number: 2, alteration: 0 },
    { number: 5, alteration: 0 },
  ],
  sus4: [
    { number: 1, alteration: 0 },
    { number: 4, alteration: 0 },
    { number: 5, alteration: 0 },
  ],
};

/** Return independent role objects without exposing the catalog's definitions. */
export function triadFormula(quality: TriadQuality): ChordFormula {
  if (!Object.hasOwn(formulas, quality)) {
    throw new RangeError("Unsupported triad quality.");
  }
  return formulas[quality].map((role) => ({ ...role }));
}

/** Root-third-fifth for tertian qualities; suspended roles replace the third. No register, bass or inversion. */
export function triadPitchClasses(root: PitchClass, quality: TriadQuality): readonly PitchClass[] {
  return chordDescriptionPitchClasses(createPitchClassChordDescription(root, triadFormula(quality)));
}

/** Preserve each role's exact spelling; reject a required tone beyond triple accidentals. */
export function triadNoteSpellings(root: NoteSpelling, quality: TriadQuality): readonly NoteSpelling[] {
  return chordDescriptionNoteSpellings(createSpelledChordDescription(root, triadFormula(quality)));
}
