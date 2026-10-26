import { type ChordDegreeFormula, type ChordFormula, chordNoteSpellings, chordPitchClasses } from "./chord-formulas.js";
import { type NoteSpelling } from "../pitch-pitch-classes-and-spelling/note-spelling.js";
import { type PitchClass } from "../pitch-pitch-classes-and-spelling/pitch-class.js";
import { type TriadQuality, triadFormula } from "./triads.js";

export type SeventhChordQuality =
  | "major-seventh"
  | "dominant-seventh"
  | "minor-seventh"
  | "half-diminished-seventh"
  | "diminished-seventh"
  | "minor-major-seventh"
  | "augmented-major-seventh"
  | "augmented-seventh"
  | "dominant-seventh-sus2"
  | "dominant-seventh-sus4";

type SeventhChordDefinition = Readonly<{ triad: TriadQuality; seventh: ChordDegreeFormula }>;

const definitions: Readonly<Record<SeventhChordQuality, SeventhChordDefinition>> = {
  "major-seventh": { triad: "major", seventh: { number: 7, alteration: 0 } },
  "dominant-seventh": { triad: "major", seventh: { number: 7, alteration: -1 } },
  "minor-seventh": { triad: "minor", seventh: { number: 7, alteration: -1 } },
  "half-diminished-seventh": { triad: "diminished", seventh: { number: 7, alteration: -1 } },
  "diminished-seventh": { triad: "diminished", seventh: { number: 7, alteration: -2 } },
  "minor-major-seventh": { triad: "minor", seventh: { number: 7, alteration: 0 } },
  "augmented-major-seventh": { triad: "augmented", seventh: { number: 7, alteration: 0 } },
  "augmented-seventh": { triad: "augmented", seventh: { number: 7, alteration: -1 } },
  "dominant-seventh-sus2": { triad: "sus2", seventh: { number: 7, alteration: -1 } },
  "dominant-seventh-sus4": { triad: "sus4", seventh: { number: 7, alteration: -1 } },
};

function definitionFor(quality: SeventhChordQuality): SeventhChordDefinition {
  if (!Object.hasOwn(definitions, quality)) {
    throw new RangeError("Unsupported seventh-chord quality.");
  }
  return definitions[quality];
}

/** Compose independent triad and seventh roles without exposing shared definitions. */
export function seventhChordFormula(quality: SeventhChordQuality): ChordFormula {
  const definition = definitionFor(quality);
  return [...triadFormula(definition.triad), { ...definition.seventh }];
}

/** Formula role order, including suspended replacements of the third; no bass, register or inversion. */
export function seventhChordPitchClasses(
  root: PitchClass,
  quality: SeventhChordQuality,
): readonly PitchClass[] {
  return chordPitchClasses(root, seventhChordFormula(quality));
}

/** Preserve each role's exact spelling; reject any required tone beyond triple accidentals. */
export function seventhChordNoteSpellings(
  root: NoteSpelling,
  quality: SeventhChordQuality,
): readonly NoteSpelling[] {
  return chordNoteSpellings(root, seventhChordFormula(quality));
}
