import { type NoteSpelling, pitchClassFromSpelling } from "./note-spelling.js";
import { type PitchClass, transposePitchClass } from "./pitch-class.js";

/** Safe-integer semitone coordinate with C0 = 0; validated by these functions. */
export type RegisteredPitch = number;

/** The octave belongs to the written letter, including across accidental boundaries. */
export type RegisteredNote = NoteSpelling & Readonly<{
  octave: number;
}>;

/** Convert a typed spelled note to a sounding pitch, losing spelling information. */
export function registeredPitchFromNote(note: RegisteredNote): RegisteredPitch {
  if (!Number.isSafeInteger(note.octave)) {
    throw new RangeError("Octave must be a safe integer.");
  }

  const octaveBase = 12 * note.octave;
  if (!Number.isSafeInteger(octaveBase)) {
    throw new RangeError("Octave base must be a safe integer.");
  }

  const naturalClass = pitchClassFromSpelling({ letter: note.letter, accidental: 0 });
  // Apply the accidental before any wrapping, and group it with the natural class
  // to avoid an unsafe intermediate sum at the safe-integer boundary.
  const pitch = octaveBase + (naturalClass + note.accidental);
  if (!Number.isSafeInteger(pitch)) {
    throw new RangeError("Registered pitch must be a safe integer.");
  }

  return pitch;
}

/** Add a signed safe-integer semitone offset without octave wrapping. */
export function transposeRegisteredPitch(
  pitch: RegisteredPitch,
  semitones: number,
): RegisteredPitch {
  if (!Number.isSafeInteger(pitch)) {
    throw new RangeError("Registered pitch must be a safe integer.");
  }
  if (!Number.isSafeInteger(semitones)) {
    throw new RangeError("Semitone offset must be a safe integer.");
  }

  const transposed = pitch + semitones;
  if (!Number.isSafeInteger(transposed)) {
    throw new RangeError("Transposed pitch must be a safe integer.");
  }

  return transposed;
}

/** Signed semitone distance (to minus from), retaining register and returning +0 for equality. */
export function semitoneDistance(from: RegisteredPitch, to: RegisteredPitch): number {
  if (!Number.isSafeInteger(from)) {
    throw new RangeError("Registered pitch must be a safe integer.");
  }
  const distance = transposeRegisteredPitch(to, -from);
  return distance === 0 ? 0 : distance;
}

/** Discard register and normalize the coordinate to a pitch class in 0..11. */
export function pitchClassFromRegisteredPitch(pitch: RegisteredPitch): PitchClass {
  if (!Number.isSafeInteger(pitch)) {
    throw new RangeError("Registered pitch must be a safe integer.");
  }

  return transposePitchClass(0, pitch);
}
