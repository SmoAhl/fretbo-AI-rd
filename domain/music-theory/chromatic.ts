import { type PitchClass, transposePitchClass } from "./pitch-class.js";

/** Twelve classes in ascending semitone order from the tonic, without octave repetition. */
export function chromaticPitchClasses(tonic: PitchClass): readonly PitchClass[] {
  return Array.from({ length: 12 }, (_, offset) => transposePitchClass(tonic, offset));
}
