import { type NoteSpelling } from "./note-spelling.js";
import { type PitchClass, transposePitchClass } from "./pitch-class.js";
import {
  type IntervalQuality,
  type SpelledInterval,
  semitonesFromInterval,
  transposeNoteSpelling,
} from "./spelled-transposition.js";

export type ScaleType =
  | "major"
  | "major-pentatonic"
  | "minor-pentatonic"
  | "natural-minor"
  | "harmonic-minor"
  | "melodic-minor-ascending"
  | "ionian"
  | "dorian"
  | "phrygian"
  | "lydian"
  | "mixolydian"
  | "aeolian"
  | "locrian";

/** Ordinal position in the selected scale, rather than a major-relative alteration. */
export type ScaleDegree = 1 | 2 | 3 | 4 | 5 | 6 | 7;

function scalePattern(
  qualities: readonly [IntervalQuality, IntervalQuality, IntervalQuality, IntervalQuality,
    IntervalQuality, IntervalQuality, IntervalQuality],
): readonly SpelledInterval[] {
  return qualities.map((quality, index) => ({ number: index + 1, quality, direction: "up" }));
}

const majorPattern = scalePattern([
  "perfect", "major", "major", "perfect", "perfect", "major", "major",
]);
const naturalMinorPattern = scalePattern([
  "perfect", "major", "minor", "perfect", "perfect", "minor", "minor",
]);

// Each interval is measured upward from the tonic; the repeated octave is excluded.
const patterns: Readonly<Record<ScaleType, readonly SpelledInterval[]>> = {
  major: majorPattern,
  "major-pentatonic": [
    { number: 1, quality: "perfect", direction: "up" },
    { number: 2, quality: "major", direction: "up" },
    { number: 3, quality: "major", direction: "up" },
    { number: 5, quality: "perfect", direction: "up" },
    { number: 6, quality: "major", direction: "up" },
  ],
  "minor-pentatonic": [
    { number: 1, quality: "perfect", direction: "up" },
    { number: 3, quality: "minor", direction: "up" },
    { number: 4, quality: "perfect", direction: "up" },
    { number: 5, quality: "perfect", direction: "up" },
    { number: 7, quality: "minor", direction: "up" },
  ],
  "natural-minor": naturalMinorPattern,
  "harmonic-minor": scalePattern([
    "perfect", "major", "minor", "perfect", "perfect", "minor", "major",
  ]),
  "melodic-minor-ascending": scalePattern([
    "perfect", "major", "minor", "perfect", "perfect", "major", "major",
  ]),
  ionian: majorPattern,
  dorian: scalePattern([
    "perfect", "major", "minor", "perfect", "perfect", "major", "minor",
  ]),
  phrygian: scalePattern([
    "perfect", "minor", "minor", "perfect", "perfect", "minor", "minor",
  ]),
  lydian: scalePattern([
    "perfect", "major", "major", "augmented", "perfect", "major", "major",
  ]),
  mixolydian: scalePattern([
    "perfect", "major", "major", "perfect", "perfect", "major", "minor",
  ]),
  aeolian: naturalMinorPattern,
  locrian: scalePattern([
    "perfect", "minor", "minor", "perfect", "diminished", "minor", "minor",
  ]),
};

function patternFor(type: ScaleType): readonly SpelledInterval[] {
  if (!Object.hasOwn(patterns, type)) {
    throw new RangeError("Unsupported scale type.");
  }
  return patterns[type];
}

/** Pitch classes in tonic-relative degree order, with no octave repetition. */
export function scalePitchClasses(tonic: PitchClass, type: ScaleType): readonly PitchClass[] {
  return patternFor(type).map((interval) => transposePitchClass(tonic, semitonesFromInterval(interval)));
}

/** Spell each interval role from the supplied tonic; reject unsupported accidentals. */
export function scaleNoteSpellings(tonic: NoteSpelling, type: ScaleType): readonly NoteSpelling[] {
  return patternFor(type).map((interval) => transposeNoteSpelling(tonic, interval));
}

/** Retrieve an ordinal degree within the selected scale's five or seven notes. */
export function pitchClassAtScaleDegree(
  tonic: PitchClass,
  type: ScaleType,
  degree: ScaleDegree,
): PitchClass {
  const pattern = patternFor(type);
  if (!Number.isInteger(degree) || degree < 1 || degree > pattern.length) {
    throw new RangeError(`Scale degree must be an integer in 1..${pattern.length}.`);
  }
  return transposePitchClass(tonic, semitonesFromInterval(pattern[degree - 1]!));
}

/** Identify ordinal degree by pitch-class membership; non-members return undefined. */
export function scaleDegreeOfPitchClass(
  tonic: PitchClass,
  type: ScaleType,
  pitchClass: PitchClass,
): ScaleDegree | undefined {
  const index = scalePitchClasses(tonic, type).indexOf(pitchClass);
  return index === -1 ? undefined : (index + 1) as ScaleDegree;
}
