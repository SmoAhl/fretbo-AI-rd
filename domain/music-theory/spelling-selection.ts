import { type NoteSpelling, pitchClassFromSpelling } from "./note-spelling.js";
import { type PitchClass } from "./pitch-class.js";
import {
  type RegisteredNote,
  type RegisteredPitch,
  pitchClassFromRegisteredPitch,
  registeredPitchFromNote,
} from "./registered-pitch.js";

export type SpellingPolicy = "sharps" | "flats";

// Policy tables prefer naturals and use only single accidentals for other classes.
const sharpSpellings: readonly NoteSpelling[] = [
  { letter: "C", accidental: 0 }, { letter: "C", accidental: 1 },
  { letter: "D", accidental: 0 }, { letter: "D", accidental: 1 },
  { letter: "E", accidental: 0 }, { letter: "F", accidental: 0 },
  { letter: "F", accidental: 1 }, { letter: "G", accidental: 0 },
  { letter: "G", accidental: 1 }, { letter: "A", accidental: 0 },
  { letter: "A", accidental: 1 }, { letter: "B", accidental: 0 },
];
const flatSpellings: readonly NoteSpelling[] = [
  { letter: "C", accidental: 0 }, { letter: "D", accidental: -1 },
  { letter: "D", accidental: 0 }, { letter: "E", accidental: -1 },
  { letter: "E", accidental: 0 }, { letter: "F", accidental: 0 },
  { letter: "G", accidental: -1 }, { letter: "G", accidental: 0 },
  { letter: "A", accidental: -1 }, { letter: "A", accidental: 0 },
  { letter: "B", accidental: -1 }, { letter: "B", accidental: 0 },
];

/** Select a spelling using an explicit policy, without inferring key context. */
export function spellingFromPitchClass(
  pitchClass: PitchClass,
  policy: SpellingPolicy,
): NoteSpelling {
  if (!Number.isInteger(pitchClass) || pitchClass < 0 || pitchClass > 11) {
    throw new RangeError("Pitch class must be an integer in 0..11.");
  }
  if (policy !== "sharps" && policy !== "flats") {
    throw new RangeError("Spelling policy must be sharps or flats.");
  }
  const table = policy === "sharps" ? sharpSpellings : flatSpellings;
  return { ...table[pitchClass]! };
}

/** Select a registered spelling that converts back to the same sounding pitch. */
export function noteFromRegisteredPitch(
  pitch: RegisteredPitch,
  policy: SpellingPolicy,
): RegisteredNote {
  const spelling = spellingFromPitchClass(pitchClassFromRegisteredPitch(pitch), policy);
  const displacement = pitchClassFromSpelling({ letter: spelling.letter, accidental: 0 })
    + spelling.accidental;
  // Use exact intermediates at both safe-integer boundaries.
  const octave = Number((BigInt(pitch) - BigInt(displacement)) / 12n);
  const note: RegisteredNote = { ...spelling, octave };
  // Retain the existing safe-octave-base contract, including near the lower limit.
  registeredPitchFromNote(note);
  return note;
}
