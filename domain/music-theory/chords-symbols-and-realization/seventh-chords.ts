import {
  type DegreeFormula,
  noteSpellingFromDegreeFormula,
  pitchClassFromDegreeFormula,
} from "../degrees-keys-and-spelling/degrees.js";
import { type NoteSpelling } from "../pitch-pitch-classes-and-spelling/note-spelling.js";
import { type PitchClass } from "../pitch-pitch-classes-and-spelling/pitch-class.js";
import { type TriadQuality, triadNoteSpellings, triadPitchClasses } from "./triads.js";

export type SeventhChordQuality =
  | "major-seventh"
  | "dominant-seventh"
  | "minor-seventh"
  | "half-diminished-seventh"
  | "diminished-seventh"
  | "minor-major-seventh"
  | "augmented-major-seventh"
  | "augmented-seventh";

type SeventhChordDefinition = Readonly<{ triad: TriadQuality; seventh: DegreeFormula }>;

const definitions: Readonly<Record<SeventhChordQuality, SeventhChordDefinition>> = {
  "major-seventh": { triad: "major", seventh: { number: 7, alteration: 0 } },
  "dominant-seventh": { triad: "major", seventh: { number: 7, alteration: -1 } },
  "minor-seventh": { triad: "minor", seventh: { number: 7, alteration: -1 } },
  "half-diminished-seventh": { triad: "diminished", seventh: { number: 7, alteration: -1 } },
  "diminished-seventh": { triad: "diminished", seventh: { number: 7, alteration: -2 } },
  "minor-major-seventh": { triad: "minor", seventh: { number: 7, alteration: 0 } },
  "augmented-major-seventh": { triad: "augmented", seventh: { number: 7, alteration: 0 } },
  "augmented-seventh": { triad: "augmented", seventh: { number: 7, alteration: -1 } },
};

function definitionFor(quality: SeventhChordQuality): SeventhChordDefinition {
  if (!Object.hasOwn(definitions, quality)) {
    throw new RangeError("Unsupported seventh-chord quality.");
  }
  return definitions[quality];
}

/** Root-third-fifth-seventh role order, without register, bass, or inversion information. */
export function seventhChordPitchClasses(
  root: PitchClass,
  quality: SeventhChordQuality,
): readonly PitchClass[] {
  const definition = definitionFor(quality);
  return [
    ...triadPitchClasses(root, definition.triad),
    pitchClassFromDegreeFormula(root, definition.seventh),
  ];
}

/** Preserve each role's exact spelling; reject any required tone beyond triple accidentals. */
export function seventhChordNoteSpellings(
  root: NoteSpelling,
  quality: SeventhChordQuality,
): readonly NoteSpelling[] {
  const definition = definitionFor(quality);
  return [
    ...triadNoteSpellings(root, definition.triad),
    noteSpellingFromDegreeFormula(root, definition.seventh),
  ];
}
