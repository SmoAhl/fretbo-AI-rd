import {
  type RegisteredNote,
  type RegisteredPitch,
  registeredPitchFromNote,
  transposeRegisteredPitch,
} from "./registered-pitch.js";
import { type ScaleType, scaleNoteSpellings, scalePitchClasses } from "./scales.js";
import { type ScaleRunOptions, registeredRunNotes, registeredRunPitches } from "./scale-run-internals.js";

export { MAX_SCALE_RUN_NOTES } from "./scale-run-internals.js";
export type { ScaleRunOptions } from "./scale-run-internals.js";

/** Start at the supplied tonic; traverse a fixed collection for the requested octaves. */
export function scaleRegisteredPitches(
  tonic: RegisteredPitch,
  type: ScaleType,
  options: ScaleRunOptions,
): readonly RegisteredPitch[] {
  transposeRegisteredPitch(tonic, 0);
  // At numeric tonic 0, ordered classes are already tonic-relative offsets 0..11.
  const offsets = scalePitchClasses(0, type);
  return registeredRunPitches(tonic, offsets, options);
}

/** Preserve each scale degree's spelling and its written octave, including accidental boundaries. */
export function scaleRegisteredNotes(
  tonic: RegisteredNote,
  type: ScaleType,
  options: ScaleRunOptions,
): readonly RegisteredNote[] {
  const pitches = scaleRegisteredPitches(registeredPitchFromNote(tonic), type, options);
  const spellings = scaleNoteSpellings(tonic, type);
  return registeredRunNotes(pitches, spellings, options.direction);
}
