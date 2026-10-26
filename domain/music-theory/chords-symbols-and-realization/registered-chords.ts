import { type ScaleDegree } from "../scales-and-modes/scales.js";
import { pitchClassFromDegreeFormula } from "../degrees-keys-and-spelling/degrees.js";
import { type NoteSpelling, pitchClassFromSpelling } from "../pitch-pitch-classes-and-spelling/note-spelling.js";
import {
  type RegisteredPitch, type RegisteredNote,
  registeredPitchFromNote, pitchClassFromRegisteredPitch, transposeRegisteredPitch,
} from "../pitch-pitch-classes-and-spelling/registered-pitch.js";
import {
  type PitchClassChordDescription, type SpelledChordDescription, chordDescriptionNoteSpellings,
} from "./chord-descriptions.js";
import { type ChordFormula, validateChordFormula } from "./chord-formulas.js";

/** Explicit tones in supplied order; this record does not infer a chord identity. */
export type RegisteredPitchVoicing = Readonly<{ pitches: readonly RegisteredPitch[] }>;
export type RegisteredNoteVoicing = Readonly<{ notes: readonly RegisteredNote[] }>;

const letters = ["C", "D", "E", "F", "G", "A", "B"] as const;
const safeLimit = BigInt(Number.MAX_SAFE_INTEGER);

function safeNumber(value: bigint, subject: string): number {
  if (value < -safeLimit || value > safeLimit) {
    throw new RangeError(`${subject} must be a safe integer.`);
  }
  return Number(value);
}

function requireTones(tones: readonly unknown[]): void {
  if (!Array.isArray(tones) || tones.length === 0) {
    throw new RangeError("A voicing must be a nonempty array of registered tones.");
  }
}

/** Validate and copy supplied coordinates without sorting or removing repeated pitches. */
export function createRegisteredPitchVoicing(pitches: readonly RegisteredPitch[]): RegisteredPitchVoicing {
  requireTones(pitches);
  const result: RegisteredPitch[] = [];
  // Iteration visits sparse slots so validation rejects missing tones.
  for (const pitch of pitches) result.push(transposeRegisteredPitch(pitch, 0));
  return { pitches: result };
}

/** Copy every supplied note independently, preserving written register and repetition. */
export function createRegisteredNoteVoicing(notes: readonly RegisteredNote[]): RegisteredNoteVoicing {
  requireTones(notes);
  const result: RegisteredNote[] = [];
  for (const note of notes) {
    if (note === null || typeof note !== "object") {
      throw new RangeError("A spelled voicing requires registered note entries.");
    }
    registeredPitchFromNote(note);
    result.push({ letter: note.letter, accidental: note.accidental, octave: note.octave });
  }
  return { notes: result };
}

function rootPositionDistances(formula: ChordFormula): readonly number[] {
  validateChordFormula(formula);
  if (!formula.some((role) => role.number === 1 && role.alteration === 0)) {
    throw new RangeError("Root position requires an explicit unaltered role 1.");
  }
  return formula.map((role) => {
    const steps = BigInt(role.number) - 1n;
    const baseline = pitchClassFromDegreeFormula(0, {
      number: Number(steps % 7n + 1n) as ScaleDegree, alteration: 0,
    });
    const distance = 12n * (steps / 7n) + BigInt(baseline) + BigInt(role.alteration);
    if (distance < 0n) {
      throw new RangeError("Root-position formula tones must not sound below the root.");
    }
    return safeNumber(distance, "Chord semitone displacement");
  });
}

/** Full formula distances above an explicit root, preserving formula order and multiplicity. */
export function rootPositionChordRegisteredPitches(
  description: PitchClassChordDescription | SpelledChordDescription,
  root: RegisteredPitch,
): RegisteredPitchVoicing {
  const distances = rootPositionDistances(description.formula);
  const rootClass = typeof description.root === "number"
    ? description.root : pitchClassFromSpelling(description.root);
  if (pitchClassFromRegisteredPitch(root) !== rootClass) {
    throw new RangeError("Registered root must match the description's root pitch class.");
  }
  if (description.bass !== undefined) {
    const bassClass = typeof description.bass === "number"
      ? description.bass : pitchClassFromSpelling(description.bass);
    if (bassClass !== rootClass) {
      throw new RangeError("Root-position construction cannot realize a different specified bass.");
    }
  }
  return createRegisteredPitchVoicing(distances.map((distance) =>
    safeNumber(BigInt(root) + BigInt(distance), "Registered chord pitch")));
}

function sameSpelling(left: NoteSpelling, right: NoteSpelling): boolean {
  return left.letter === right.letter && left.accidental === right.accidental;
}

/** Exact role spellings with written octaves; this constructor does not select inversions. */
export function rootPositionChordRegisteredNotes(
  description: SpelledChordDescription,
  root: RegisteredNote,
): RegisteredNoteVoicing {
  if (!sameSpelling(description.root, root)) {
    throw new RangeError("Registered root must match the description's exact root spelling.");
  }
  if (description.bass !== undefined && !sameSpelling(description.bass, description.root)) {
    throw new RangeError("Spelled root position requires the specified bass to match the root spelling.");
  }
  const pitches = rootPositionChordRegisteredPitches(description, registeredPitchFromNote(root)).pitches;
  const spellings = chordDescriptionNoteSpellings(description);
  const rootLetter = BigInt(letters.indexOf(root.letter));
  const notes = spellings.map((spelling, index) => {
    const steps = BigInt(description.formula[index]!.number) - 1n;
    const octave = safeNumber(BigInt(root.octave) + (rootLetter + steps) / 7n, "Written chord octave");
    const note = { ...spelling, octave };
    if (registeredPitchFromNote(note) !== pitches[index]) {
      throw new RangeError("Registered chord spelling disagrees with its formula pitch.");
    }
    return note;
  });
  return createRegisteredNoteVoicing(notes);
}
