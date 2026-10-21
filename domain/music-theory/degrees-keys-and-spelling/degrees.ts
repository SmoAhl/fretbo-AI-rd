import { type MinorMode, minorModeNoteSpellings } from "../scales-and-modes/minor-modes.js";
import { type Accidental, type NoteSpelling } from "../pitch-pitch-classes-and-spelling/note-spelling.js";
import { type PitchClass, transposePitchClass } from "../pitch-pitch-classes-and-spelling/pitch-class.js";
import { type ScaleDegree, type ScaleType, scaleNoteSpellings } from "../scales-and-modes/scales.js";
import { transposeNoteSpelling } from "../intervals-and-transposition/spelled-transposition.js";

/** Major/perfect reference role and semitone alteration, rather than ordinal position. */
export type DegreeFormula = Readonly<{ number: ScaleDegree; alteration: Accidental }>;
export type DegreeCollection = ScaleType | MinorMode;
export type CollectionDegree = Readonly<{ ordinal: ScaleDegree; formula: DegreeFormula }>;

const referenceOffsets = [0, 2, 4, 5, 7, 9, 11] as const;
const referenceNumbers = { C: 1, D: 2, E: 3, F: 4, G: 5, A: 6, B: 7 } as const;

function validateFormula(formula: DegreeFormula): void {
  if (!Number.isInteger(formula.number) || formula.number < 1 || formula.number > 7) {
    throw new RangeError("Degree formula number must be an integer in 1..7.");
  }
  if (!Number.isInteger(formula.alteration) || formula.alteration < -3 || formula.alteration > 3) {
    throw new RangeError("Degree formula alteration must be an integer in -3..3.");
  }
}

/** Resolve a formula from an explicit tonic, discarding spelling and register. */
export function pitchClassFromDegreeFormula(tonic: PitchClass, formula: DegreeFormula): PitchClass {
  validateFormula(formula);
  return transposePitchClass(tonic, referenceOffsets[formula.number - 1]! + formula.alteration);
}

/** Preserve the reference letter role; validate only the final accidental. */
export function noteSpellingFromDegreeFormula(tonic: NoteSpelling, formula: DegreeFormula): NoteSpelling {
  validateFormula(formula);
  const perfect = formula.number === 1 || formula.number === 4 || formula.number === 5;
  const reference = transposeNoteSpelling({ letter: tonic.letter, accidental: 0 }, {
    number: formula.number,
    quality: perfect ? "perfect" : "major",
    direction: "up",
  });
  const accidental = reference.accidental + tonic.accidental + formula.alteration;
  if (accidental < -3 || accidental > 3) {
    throw new RangeError("Degree formula requires an accidental outside -3..3.");
  }
  return { letter: reference.letter, accidental: accidental as Accidental };
}

/** Derive existing collection roles at C, where note accidentals equal formula alterations. */
export function degreeFormulas(collection: DegreeCollection): readonly DegreeFormula[] {
  const tonic: NoteSpelling = { letter: "C", accidental: 0 };
  const spellings = typeof collection === "string"
    ? scaleNoteSpellings(tonic, collection)
    : minorModeNoteSpellings(tonic, collection);
  return spellings.map((note) => ({ number: referenceNumbers[note.letter], alteration: note.accidental }));
}

/** Ordinal position is bounded by the collection's cardinality, not by formula number. */
export function degreeFormulaAtOrdinal(collection: DegreeCollection, ordinal: ScaleDegree): DegreeFormula {
  const formulas = degreeFormulas(collection);
  if (!Number.isInteger(ordinal) || ordinal < 1 || ordinal > formulas.length) {
    throw new RangeError(`Collection ordinal must be an integer in 1..${formulas.length}.`);
  }
  return formulas[ordinal - 1]!;
}

/** Resolve an ordinal at the supplied collection tonic, including a minor mode's own tonic. */
export function pitchClassAtCollectionDegree(
  tonic: PitchClass,
  collection: DegreeCollection,
  ordinal: ScaleDegree,
): PitchClass {
  return pitchClassFromDegreeFormula(tonic, degreeFormulaAtOrdinal(collection, ordinal));
}

/** Spell only the requested ordinal; unrelated unrepresentable members do not reject it. */
export function noteSpellingAtCollectionDegree(
  tonic: NoteSpelling,
  collection: DegreeCollection,
  ordinal: ScaleDegree,
): NoteSpelling {
  return noteSpellingFromDegreeFormula(tonic, degreeFormulaAtOrdinal(collection, ordinal));
}

/** Identify the selected collection's role by pitch class; non-members return undefined. */
export function collectionDegreeOfPitchClass(
  tonic: PitchClass,
  collection: DegreeCollection,
  pitch: PitchClass,
): CollectionDegree | undefined {
  const formulas = degreeFormulas(collection);
  const index = formulas.findIndex((formula) => pitchClassFromDegreeFormula(tonic, formula) === pitch);
  return index === -1 ? undefined : { ordinal: (index + 1) as ScaleDegree, formula: formulas[index]! };
}
