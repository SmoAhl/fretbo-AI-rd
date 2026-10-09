import { type NoteSpelling } from "./note-spelling.js";
import { type PitchClass } from "./pitch-class.js";
import { type ScaleDegree, scaleNoteSpellings, scalePitchClasses } from "./scales.js";

const modes = ["ionian", "dorian", "phrygian", "lydian", "mixolydian", "aeolian", "locrian"] as const;

export type MajorScaleMode = (typeof modes)[number];
export type RelativeModeParent = MajorScaleMode | "major" | "natural-minor";

export type RelativePitchClassMode = Readonly<{
  tonic: PitchClass;
  mode: MajorScaleMode;
  pitchClasses: readonly PitchClass[];
}>;

export type RelativeSpelledMode = Readonly<{
  tonic: NoteSpelling;
  mode: MajorScaleMode;
  noteSpellings: readonly NoteSpelling[];
}>;

function modeAtDegree(parent: RelativeModeParent, degree: ScaleDegree): MajorScaleMode {
  const canonical = parent === "major" ? "ionian" : parent === "natural-minor" ? "aeolian" : parent;
  const parentIndex = modes.indexOf(canonical);
  if (parentIndex === -1) {
    throw new RangeError("Relative-mode parent must be a major-scale mode, major, or natural-minor.");
  }
  if (!Number.isInteger(degree) || degree < 1 || degree > 7) {
    throw new RangeError("Scale degree must be an integer in 1..7.");
  }
  return modes[(parentIndex + degree - 1) % 7]!;
}

function rotate<T>(collection: readonly T[], degree: ScaleDegree): readonly T[] {
  const start = degree - 1;
  return [...collection.slice(start), ...collection.slice(0, start)];
}

/** Derive a relative tonic and canonical mode by reordering the parent's pitch classes. */
export function relativeModePitchClasses(
  tonic: PitchClass,
  parent: RelativeModeParent,
  degree: ScaleDegree,
): RelativePitchClassMode {
  const mode = modeAtDegree(parent, degree);
  const pitchClasses = rotate(scalePitchClasses(tonic, parent), degree);
  return { tonic: pitchClasses[0]!, mode, pitchClasses };
}

/** Preserve the parent's exact spellings; the returned tonic is its collection's first note. */
export function relativeModeNoteSpellings(
  tonic: NoteSpelling,
  parent: RelativeModeParent,
  degree: ScaleDegree,
): RelativeSpelledMode {
  const mode = modeAtDegree(parent, degree);
  const noteSpellings = rotate(scaleNoteSpellings(tonic, parent), degree);
  return { tonic: noteSpellings[0]!, mode, noteSpellings };
}
