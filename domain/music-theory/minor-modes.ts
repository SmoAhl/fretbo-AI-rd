import { type NoteSpelling } from "./note-spelling.js";
import { type PitchClass, transposePitchClass } from "./pitch-class.js";
import { type RegisteredNote, type RegisteredPitch, registeredPitchFromNote } from "./registered-pitch.js";
import { registeredRunNotes, registeredRunPitches } from "./scale-run-internals.js";
import { type ScaleRunOptions } from "./scale-runs.js";
import { type ScaleDegree, scaleNoteSpellings, scalePitchClasses } from "./scales.js";
import {
  type SpelledInterval,
  identifySpelledInterval,
  semitonesFromInterval,
  transposeNoteSpelling,
} from "./spelled-transposition.js";

export type MinorModeParent = "harmonic-minor" | "melodic-minor-ascending";
export type MinorMode = Readonly<{ parent: MinorModeParent; degree: ScaleDegree }>;
export type RelativeMinorPitchClassMode = Readonly<{
  tonic: PitchClass;
  mode: MinorMode;
  pitchClasses: readonly PitchClass[];
}>;
export type RelativeMinorSpelledMode = Readonly<{
  tonic: NoteSpelling;
  mode: MinorMode;
  noteSpellings: readonly NoteSpelling[];
}>;

function validateMode(mode: MinorMode): void {
  if (mode.parent !== "harmonic-minor" && mode.parent !== "melodic-minor-ascending") {
    throw new RangeError("Minor-mode parent must be harmonic-minor or melodic-minor-ascending.");
  }
  if (!Number.isInteger(mode.degree) || mode.degree < 1 || mode.degree > 7) {
    throw new RangeError("Minor-mode rotation degree must be an integer in 1..7.");
  }
}

function intervalsFor(mode: MinorMode): readonly SpelledInterval[] {
  validateMode(mode);
  // A fixed C parent supplies interval roles without restricting the requested tonic's spelling.
  const parent = scaleNoteSpellings({ letter: "C", accidental: 0 }, mode.parent);
  const start = mode.degree - 1;
  const from: RegisteredNote = { ...parent[start]!, octave: 0 };
  return parent.map((_, index) => {
    const position = start + index;
    const to: RegisteredNote = { ...parent[position % 7]!, octave: Math.floor(position / 7) };
    return identifySpelledInterval(from, to);
  });
}

function rotate<T>(collection: readonly T[], degree: ScaleDegree): readonly T[] {
  const start = degree - 1;
  return [...collection.slice(start), ...collection.slice(0, start)];
}

/** Construct a fixed minor-derived mode at the explicitly supplied mode tonic. */
export function minorModePitchClasses(tonic: PitchClass, mode: MinorMode): readonly PitchClass[] {
  return intervalsFor(mode).map((interval) => transposePitchClass(tonic, semitonesFromInterval(interval)));
}

/** Preserve successive letter roles; validate only this mode's resulting spellings. */
export function minorModeNoteSpellings(tonic: NoteSpelling, mode: MinorMode): readonly NoteSpelling[] {
  return intervalsFor(mode).map((interval) => transposeNoteSpelling(tonic, interval));
}

/** Derive a relative mode by rotating the supplied parent's pitch-class collection. */
export function relativeMinorModePitchClasses(
  tonic: PitchClass,
  parent: MinorModeParent,
  degree: ScaleDegree,
): RelativeMinorPitchClassMode {
  const mode: MinorMode = { parent, degree };
  validateMode(mode);
  const pitchClasses = rotate(scalePitchClasses(tonic, parent), degree);
  return { tonic: pitchClasses[0]!, mode, pitchClasses };
}

/** Preserve the parent's exact spellings; the derived tonic is its first collection member. */
export function relativeMinorModeNoteSpellings(
  tonic: NoteSpelling,
  parent: MinorModeParent,
  degree: ScaleDegree,
): RelativeMinorSpelledMode {
  const mode: MinorMode = { parent, degree };
  validateMode(mode);
  const noteSpellings = rotate(scaleNoteSpellings(tonic, parent), degree);
  return { tonic: noteSpellings[0]!, mode, noteSpellings };
}

/** Traverse the selected fixed mode in either direction with existing scale-run options. */
export function minorModeRegisteredPitches(
  tonic: RegisteredPitch,
  mode: MinorMode,
  options: ScaleRunOptions,
): readonly RegisteredPitch[] {
  return registeredRunPitches(tonic, minorModePitchClasses(0, mode), options);
}

/** Preserve the fixed mode's spellings and written octaves, including on descent. */
export function minorModeRegisteredNotes(
  tonic: RegisteredNote,
  mode: MinorMode,
  options: ScaleRunOptions,
): readonly RegisteredNote[] {
  const pitches = minorModeRegisteredPitches(registeredPitchFromNote(tonic), mode, options);
  return registeredRunNotes(pitches, minorModeNoteSpellings(tonic, mode), options.direction);
}
