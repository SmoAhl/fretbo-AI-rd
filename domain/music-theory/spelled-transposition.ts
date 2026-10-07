import { type Accidental, type NoteSpelling, pitchClassFromSpelling } from "./note-spelling.js";
import {
  type RegisteredNote,
  registeredPitchFromNote,
  transposeRegisteredPitch,
} from "./registered-pitch.js";

export type IntervalQuality = "perfect" | "major" | "minor" | "augmented" | "diminished";
export type IntervalDirection = "up" | "down";
export type SpelledInterval = Readonly<{
  number: number;
  quality: IntervalQuality;
  direction: IntervalDirection;
}>;

const letters = ["C", "D", "E", "F", "G", "A", "B"] as const;
const baselineSemitones = [0n, 2n, 4n, 5n, 7n, 9n, 11n] as const;

function intervalDisplacement(interval: SpelledInterval): { letters: bigint; semitones: number } {
  if (!Number.isSafeInteger(interval.number) || interval.number < 1) {
    throw new RangeError("Interval number must be a positive safe integer.");
  }
  if (interval.direction !== "up" && interval.direction !== "down") {
    throw new RangeError("Interval direction must be up or down.");
  }

  const letterSteps = BigInt(interval.number) - 1n;
  const simpleIndex = Number(letterSteps % 7n);
  const perfectFamily = simpleIndex === 0 || simpleIndex === 3 || simpleIndex === 4;
  let adjustment: bigint;
  switch (interval.quality) {
    case "perfect":
      if (!perfectFamily) throw new RangeError("This interval number cannot have perfect quality.");
      adjustment = 0n;
      break;
    case "major":
    case "minor":
      if (perfectFamily) throw new RangeError("This interval number cannot have major or minor quality.");
      adjustment = interval.quality === "minor" ? -1n : 0n;
      break;
    case "augmented":
      adjustment = 1n;
      break;
    case "diminished":
      if (interval.number === 1) throw new RangeError("Diminished unisons are unsupported.");
      adjustment = perfectFamily ? -1n : -2n;
      break;
    default:
      throw new RangeError("Unsupported interval quality.");
  }

  const semitones = (letterSteps / 7n) * 12n + baselineSemitones[simpleIndex]! + adjustment;
  if (semitones > BigInt(Number.MAX_SAFE_INTEGER)) {
    throw new RangeError("Interval semitone displacement must be a safe integer.");
  }
  const sign = interval.direction === "up" ? 1n : -1n;
  return { letters: sign * letterSteps, semitones: Number(sign * semitones) };
}

/** Transpose by interval number, quality, and direction, retaining written register. */
export function transposeRegisteredNote(
  note: RegisteredNote,
  interval: SpelledInterval,
): RegisteredNote {
  const sourcePitch = registeredPitchFromNote(note);
  const displacement = intervalDisplacement(interval);
  const targetPitch = transposeRegisteredPitch(sourcePitch, displacement.semitones);
  const sourcePosition = BigInt(note.octave) * 7n + BigInt(letters.indexOf(note.letter));
  const targetPosition = sourcePosition + displacement.letters;
  let targetOctave = targetPosition / 7n;
  let targetLetterIndex = targetPosition % 7n;
  if (targetLetterIndex < 0n) {
    targetLetterIndex += 7n;
    targetOctave -= 1n;
  }
  const letter = letters[Number(targetLetterIndex)]!;
  const naturalClass = pitchClassFromSpelling({ letter, accidental: 0 });
  const naturalPitch = targetOctave * 12n + BigInt(naturalClass);
  const accidental = BigInt(targetPitch) - naturalPitch;
  if (accidental < -2n || accidental > 2n) {
    throw new RangeError("Transposition requires an accidental outside -2..2.");
  }

  const result: RegisteredNote = {
    letter,
    accidental: Number(accidental) as Accidental,
    octave: Number(targetOctave),
  };
  registeredPitchFromNote(result);
  return result;
}

/** Transpose a spelling without register; compound octave distance is discarded. */
export function transposeNoteSpelling(
  note: NoteSpelling,
  interval: SpelledInterval,
): NoteSpelling {
  const result = transposeRegisteredNote({ ...note, octave: 0 }, interval);
  return { letter: result.letter, accidental: result.accidental };
}
