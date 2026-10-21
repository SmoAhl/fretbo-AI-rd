/** An octave-equivalent class in 12-TET, without note spelling or register. */
export type PitchClass = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

/** Transpose by a signed safe-integer number of semitones. */
export function transposePitchClass(
  pitchClass: PitchClass,
  semitones: number,
): PitchClass {
  if (!Number.isSafeInteger(semitones)) {
    throw new RangeError("Semitone offset must be a safe integer.");
  }

  // Reduce first to avoid losing precision when adding a large offset.
  const transposed = pitchClass + (semitones % 12);
  // JavaScript remainder can be negative; normalize into 0..11.
  return (((transposed % 12) + 12) % 12) as PitchClass;
}
