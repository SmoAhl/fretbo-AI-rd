import {
  type DegreeFormula,
  collectionDegreeOfPitchClass,
  noteSpellingFromDegreeFormula,
  pitchClassFromDegreeFormula,
} from "./degrees.js";
import { type Key, createKey } from "./keys.js";
import { type NoteSpelling, pitchClassFromSpelling } from "../pitch-pitch-classes-and-spelling/note-spelling.js";
import { type PitchClass } from "../pitch-pitch-classes-and-spelling/pitch-class.js";

/** An explicit role determines spelling; otherwise select the baseline or leave the pitch unresolved. */
export function spellingFromPitchClassInKey(
  pitchClass: PitchClass,
  key: Key,
  role?: DegreeFormula,
): NoteSpelling | undefined {
  if (!Number.isInteger(pitchClass) || pitchClass < 0 || pitchClass > 11) {
    throw new RangeError("Pitch class must be an integer in 0..11.");
  }
  const context = createKey(key.tonic, key.mode);
  const tonic = pitchClassFromSpelling(context.tonic);
  if (role !== undefined) {
    if (pitchClassFromDegreeFormula(tonic, role) !== pitchClass) {
      throw new RangeError("Degree role does not match the requested pitch class.");
    }
    return noteSpellingFromDegreeFormula(context.tonic, role);
  }
  const baseline = context.mode === "major" ? "major" : "natural-minor";
  const degree = collectionDegreeOfPitchClass(tonic, baseline, pitchClass);
  return degree === undefined ? undefined : noteSpellingFromDegreeFormula(context.tonic, degree.formula);
}
