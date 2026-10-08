import { type Accidental, type NoteSpelling, pitchClassFromSpelling } from "./note-spelling.js";
import {
  type RegisteredNote,
  registeredPitchFromNote,
  semitoneDistance,
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

/** Validate interval semantics independently of any source note or resulting spelling. */
export function validateSpelledInterval(interval: SpelledInterval): void {
  intervalDisplacement(interval);
}

/** Return signed semitone displacement without requiring a source note. Zero is positive. */
export function semitonesFromInterval(interval: SpelledInterval): number {
  return intervalDisplacement(interval).semitones;
}

/**
 * Invert a simple interval (numbers 1..8) by octave displacement, flipping direction.
 * Reject augmented octaves because their inverse is an unsupported diminished unison.
 */
export function invertSimpleInterval(interval: SpelledInterval): SpelledInterval {
  validateSpelledInterval(interval);
  if (interval.number > 8) {
    throw new RangeError("Simple interval inversion requires an interval number in 1..8.");
  }

  const complementaryQualities: Readonly<Record<IntervalQuality, IntervalQuality>> = {
    perfect: "perfect", major: "minor", minor: "major",
    augmented: "diminished", diminished: "augmented",
  };
  const result: SpelledInterval = {
    number: 9 - interval.number,
    quality: complementaryQualities[interval.quality],
    direction: interval.direction === "up" ? "down" : "up",
  };
  validateSpelledInterval(result);
  return result;
}

/**
 * Identify an interval from written letter positions and sounding displacement.
 * Identical notes use perfect unison/up; altered unisons use sounding direction.
 * Reject pairs that cannot be expressed by the existing interval contract.
 */
export function identifySpelledInterval(from: RegisteredNote, to: RegisteredNote): SpelledInterval {
  const semitones = semitoneDistance(registeredPitchFromNote(from), registeredPitchFromNote(to));
  const fromPosition = BigInt(from.octave) * 7n + BigInt(letters.indexOf(from.letter));
  const toPosition = BigInt(to.octave) * 7n + BigInt(letters.indexOf(to.letter));
  const letterSteps = toPosition - fromPosition;
  const direction: IntervalDirection = letterSteps < 0n || (letterSteps === 0n && semitones < 0)
    ? "down" : "up";
  const magnitude = letterSteps < 0n ? -letterSteps : letterSteps;
  const number = Number(magnitude + 1n);
  if (!Number.isSafeInteger(number)) {
    throw new RangeError("Interval number must be a positive safe integer.");
  }

  // Different written positions set direction, even when their pitches are equal.
  const directedSemitones = BigInt(semitones) * (direction === "up" ? 1n : -1n);
  if (directedSemitones < 0n) {
    throw new RangeError("Written and sounding motion cannot oppose each other in this interval contract.");
  }
  const simpleIndex = Number(magnitude % 7n);
  const perfectFamily = simpleIndex === 0 || simpleIndex === 3 || simpleIndex === 4;
  const baseline = (magnitude / 7n) * 12n + baselineSemitones[simpleIndex]!;
  const adjustment = directedSemitones - baseline;
  let quality: IntervalQuality;
  if (adjustment === 0n) {
    quality = perfectFamily ? "perfect" : "major";
  } else if (adjustment === 1n) {
    quality = "augmented";
  } else if (adjustment === -1n) {
    quality = perfectFamily ? "diminished" : "minor";
  } else if (!perfectFamily && adjustment === -2n) {
    quality = "diminished";
  } else {
    throw new RangeError("The note pair requires an unsupported interval quality.");
  }

  const interval: SpelledInterval = { number, quality, direction };
  validateSpelledInterval(interval);
  return interval;
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
