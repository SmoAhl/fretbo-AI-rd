import {
  degreeFormulas,
  noteSpellingAtCollectionDegree,
  pitchClassAtCollectionDegree,
  pitchClassFromDegreeFormula,
} from "../degrees-keys-and-spelling/degrees.js";
import { type Accidental, type NoteSpelling } from "../pitch-pitch-classes-and-spelling/note-spelling.js";
import { type PitchClass } from "../pitch-pitch-classes-and-spelling/pitch-class.js";
import { type MinorMode } from "../scales-and-modes/minor-modes.js";
import { type ScaleDegree, type ScaleType } from "../scales-and-modes/scales.js";
import { type ChordFormula } from "./chord-formulas.js";
import {
  createPitchClassChordDescription, createSpelledChordDescription,
  chordDescriptionPitchClasses, chordDescriptionNoteSpellings,
} from "./chord-descriptions.js";
import { type SeventhChordQuality, seventhChordFormula } from "./seventh-chords.js";
import { type TriadQuality, triadFormula } from "./triads.js";

export type HarmonizableCollection = Exclude<ScaleType, "major-pentatonic" | "minor-pentatonic"> | MinorMode;
export type HarmonizationKind = "triad" | "seventh";

/** Quality is a catalog label, not a prerequisite for retaining the derived formula. */
export type HarmonizedChordFormula = Readonly<{ degree: ScaleDegree; formula: ChordFormula }> & (
  | Readonly<{ kind: "triad"; quality: TriadQuality | undefined }>
  | Readonly<{ kind: "seventh"; quality: SeventhChordQuality | undefined }>
);
export type HarmonizedPitchClassChord = HarmonizedChordFormula & Readonly<{
  root: PitchClass;
  pitchClasses: readonly PitchClass[];
}>;
export type HarmonizedSpelledChord = HarmonizedChordFormula & Readonly<{
  root: NoteSpelling;
  noteSpellings: readonly NoteSpelling[];
}>;

const degrees = [1, 2, 3, 4, 5, 6, 7] as const;
// Exhaustive identifier lists; musical definitions remain in the existing catalogs.
const triadQualities: Readonly<Record<TriadQuality, true>> = {
  major: true, minor: true, diminished: true, augmented: true, sus2: true, sus4: true,
};
const seventhQualities: Readonly<Record<SeventhChordQuality, true>> = {
  "major-seventh": true, "dominant-seventh": true, "minor-seventh": true,
  "half-diminished-seventh": true, "diminished-seventh": true, "minor-major-seventh": true,
  "augmented-major-seventh": true, "augmented-seventh": true,
  "dominant-seventh-sus2": true, "dominant-seventh-sus4": true,
};

function sameFormula(left: ChordFormula, right: ChordFormula): boolean {
  return left.length === right.length && left.every((role, index) =>
    role.number === right[index]!.number && role.alteration === right[index]!.alteration);
}

/** Derive a root-relative tertian formula without spelling the requested tonic. */
export function harmonizedChordFormulaAtDegree(
  collection: HarmonizableCollection,
  degree: ScaleDegree,
  kind: HarmonizationKind,
): HarmonizedChordFormula {
  if (kind !== "triad" && kind !== "seventh") {
    throw new RangeError("Harmonization kind must be triad or seventh.");
  }
  if (!Number.isInteger(degree) || degree < 1 || degree > 7) {
    throw new RangeError("Harmonization degree must be an integer in 1..7.");
  }
  if (typeof collection !== "string" && (collection === null || typeof collection !== "object")) {
    throw new RangeError("Harmonization requires a supported seven-note collection.");
  }
  const roles = degreeFormulas(collection);
  if (roles.length !== 7) {
    throw new RangeError("Harmonization requires a seven-note collection.");
  }
  const offsets = roles.map((role) => pitchClassFromDegreeFormula(0, role));
  const start = degree - 1;
  const baselines = kind === "triad" ? [0, 4, 7] : [0, 4, 7, 11];
  const formula: ChordFormula = baselines.map((baseline, index) => {
    const position = start + 2 * index;
    // Continue across the octave before subtracting the root, retaining tertian roles.
    const distance = offsets[position % 7]! + 12 * Math.floor(position / 7) - offsets[start]!;
    const alteration = distance - baseline;
    if (alteration < -3 || alteration > 3) {
      throw new RangeError("Harmonized chord requires an alteration outside -3..3.");
    }
    return { number: 1 + 2 * index, alteration: alteration as Accidental };
  });
  if (kind === "triad") {
    const quality = (Object.keys(triadQualities) as TriadQuality[])
      .find((candidate) => sameFormula(formula, triadFormula(candidate)));
    return { degree, kind, formula, quality };
  }
  const quality = (Object.keys(seventhQualities) as SeventhChordQuality[])
    .find((candidate) => sameFormula(formula, seventhChordFormula(candidate)));
  return { degree, kind, formula, quality };
}

/** Construct one degree's tones in formula order, without bass or register semantics. */
export function harmonizedChordPitchClassesAtDegree(
  tonic: PitchClass,
  collection: HarmonizableCollection,
  degree: ScaleDegree,
  kind: HarmonizationKind,
): HarmonizedPitchClassChord {
  const result = harmonizedChordFormulaAtDegree(collection, degree, kind);
  const root = pitchClassAtCollectionDegree(tonic, collection, degree);
  const description = createPitchClassChordDescription(root, result.formula);
  return { ...result, root, pitchClasses: chordDescriptionPitchClasses(description) };
}

/** Spell only the selected chord's tones; unrelated collection spellings impose no limit. */
export function harmonizedChordNoteSpellingsAtDegree(
  tonic: NoteSpelling,
  collection: HarmonizableCollection,
  degree: ScaleDegree,
  kind: HarmonizationKind,
): HarmonizedSpelledChord {
  const result = harmonizedChordFormulaAtDegree(collection, degree, kind);
  const root = noteSpellingAtCollectionDegree(tonic, collection, degree);
  const description = createSpelledChordDescription(root, result.formula);
  return { ...result, root, noteSpellings: chordDescriptionNoteSpellings(description) };
}

/** Return seven independent formulas in collection-degree order. */
export function harmonizeCollectionFormulas(
  collection: HarmonizableCollection,
  kind: HarmonizationKind,
): readonly HarmonizedChordFormula[] {
  return degrees.map((degree) => harmonizedChordFormulaAtDegree(collection, degree, kind));
}

/** Return all seven numeric chords; each root is relative to the supplied collection tonic. */
export function harmonizeCollectionPitchClasses(
  tonic: PitchClass,
  collection: HarmonizableCollection,
  kind: HarmonizationKind,
): readonly HarmonizedPitchClassChord[] {
  return degrees.map((degree) => harmonizedChordPitchClassesAtDegree(tonic, collection, degree, kind));
}

/** Return all seven spelled chords, or throw if any required spelling is unavailable. */
export function harmonizeCollectionNoteSpellings(
  tonic: NoteSpelling,
  collection: HarmonizableCollection,
  kind: HarmonizationKind,
): readonly HarmonizedSpelledChord[] {
  return degrees.map((degree) => harmonizedChordNoteSpellingsAtDegree(tonic, collection, degree, kind));
}
