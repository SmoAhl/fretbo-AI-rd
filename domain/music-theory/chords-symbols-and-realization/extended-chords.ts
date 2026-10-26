import { type NoteSpelling } from "../pitch-pitch-classes-and-spelling/note-spelling.js";
import { type PitchClass } from "../pitch-pitch-classes-and-spelling/pitch-class.js";
import { type ChordDegreeFormula, type ChordFormula, chordNoteSpellings, chordPitchClasses } from "./chord-formulas.js";
import { type SeventhChordQuality, seventhChordFormula } from "./seventh-chords.js";

type UnalteredExtendedChordQuality =
  | "dominant-ninth"
  | "major-ninth"
  | "minor-ninth"
  | "dominant-eleventh"
  | "major-eleventh"
  | "minor-eleventh"
  | "dominant-thirteenth"
  | "major-thirteenth"
  | "minor-thirteenth";

export type ExtendedChordQuality = UnalteredExtendedChordQuality
  | "dominant-flat-ninth"
  | "dominant-sharp-ninth"
  | "dominant-sharp-eleventh"
  | "dominant-flat-thirteenth"
  | "major-sharp-eleventh";

const extensions = {
  ninth: [{ number: 9, alteration: 0 }],
  eleventh: [{ number: 9, alteration: 0 }, { number: 11, alteration: 0 }],
  thirteenth: [{ number: 9, alteration: 0 }, { number: 11, alteration: 0 }, { number: 13, alteration: 0 }],
} as const satisfies Readonly<Record<string, ChordFormula>>;

type ExtendedDefinition =
  | Readonly<{ seventh: SeventhChordQuality; extensions: ChordFormula }>
  | Readonly<{ base: UnalteredExtendedChordQuality; replacement: ChordDegreeFormula }>;

const definitions: Readonly<Record<ExtendedChordQuality, ExtendedDefinition>> = {
  "dominant-ninth": { seventh: "dominant-seventh", extensions: extensions.ninth },
  "major-ninth": { seventh: "major-seventh", extensions: extensions.ninth },
  "minor-ninth": { seventh: "minor-seventh", extensions: extensions.ninth },
  "dominant-eleventh": { seventh: "dominant-seventh", extensions: extensions.eleventh },
  "major-eleventh": { seventh: "major-seventh", extensions: extensions.eleventh },
  "minor-eleventh": { seventh: "minor-seventh", extensions: extensions.eleventh },
  "dominant-thirteenth": { seventh: "dominant-seventh", extensions: extensions.thirteenth },
  "major-thirteenth": { seventh: "major-seventh", extensions: extensions.thirteenth },
  "minor-thirteenth": { seventh: "minor-seventh", extensions: extensions.thirteenth },
  "dominant-flat-ninth": { base: "dominant-ninth", replacement: { number: 9, alteration: -1 } },
  "dominant-sharp-ninth": { base: "dominant-ninth", replacement: { number: 9, alteration: 1 } },
  "dominant-sharp-eleventh": { base: "dominant-eleventh", replacement: { number: 11, alteration: 1 } },
  "dominant-flat-thirteenth": { base: "dominant-thirteenth", replacement: { number: 13, alteration: -1 } },
  "major-sharp-eleventh": { base: "major-eleventh", replacement: { number: 11, alteration: 1 } },
};

/** Complete theoretical formula: retain the third and all intermediate extensions. */
export function extendedChordFormula(quality: ExtendedChordQuality): ChordFormula {
  if (!Object.hasOwn(definitions, quality)) {
    throw new RangeError("Unsupported extended-chord quality.");
  }
  const definition = definitions[quality];
  if ("base" in definition) {
    return extendedChordFormula(definition.base).map((role) => role.number === definition.replacement.number
      ? { ...definition.replacement } : role);
  }
  return [...seventhChordFormula(definition.seventh), ...definition.extensions.map((role) => ({ ...role }))];
}

/** Formula role order, without prescribing octave placement, bass or voicing. */
export function extendedChordPitchClasses(root: PitchClass, quality: ExtendedChordQuality): readonly PitchClass[] {
  return chordPitchClasses(root, extendedChordFormula(quality));
}

/** Preserve every required role's exact spelling within the triple-accidental limit. */
export function extendedChordNoteSpellings(root: NoteSpelling, quality: ExtendedChordQuality): readonly NoteSpelling[] {
  return chordNoteSpellings(root, extendedChordFormula(quality));
}
