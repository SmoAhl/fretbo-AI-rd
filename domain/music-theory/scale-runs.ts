import { pitchClassFromSpelling } from "./note-spelling.js";
import {
  type RegisteredNote,
  type RegisteredPitch,
  registeredPitchFromNote,
  transposeRegisteredPitch,
} from "./registered-pitch.js";
import { type ScaleType, scaleNoteSpellings, scalePitchClasses } from "./scales.js";
import { type IntervalDirection } from "./spelled-transposition.js";

export type ScaleRunOptions = Readonly<{
  direction: IntervalDirection;
  octaves: number;
  includeEndpoint: boolean;
}>;

/** Software allocation limit, not a musical or instrument bound. */
export const MAX_SCALE_RUN_NOTES = 10_000;

function runLength(cardinality: number, options: ScaleRunOptions): number {
  if (options.direction !== "up" && options.direction !== "down") {
    throw new RangeError("Scale run direction must be up or down.");
  }
  if (!Number.isSafeInteger(options.octaves) || options.octaves < 1) {
    throw new RangeError("Scale run octaves must be a positive safe integer.");
  }
  if (typeof options.includeEndpoint !== "boolean") {
    throw new RangeError("Scale run endpoint inclusion must be an explicit boolean.");
  }
  const endpointCount = options.includeEndpoint ? 1 : 0;
  // Bound multiplication before computing or allocating the requested length.
  if (options.octaves > Math.floor((MAX_SCALE_RUN_NOTES - endpointCount) / cardinality)) {
    throw new RangeError(`Scale run must contain at most ${MAX_SCALE_RUN_NOTES} notes.`);
  }
  return cardinality * options.octaves + endpointCount;
}

function scalePosition(index: number, cardinality: number, direction: IntervalDirection) {
  const signedIndex = direction === "up" ? index : -index;
  return {
    degree: ((signedIndex % cardinality) + cardinality) % cardinality,
    octave: Math.floor(signedIndex / cardinality),
  };
}

/** Start at the supplied tonic; traverse a fixed collection for the requested octaves. */
export function scaleRegisteredPitches(
  tonic: RegisteredPitch,
  type: ScaleType,
  options: ScaleRunOptions,
): readonly RegisteredPitch[] {
  transposeRegisteredPitch(tonic, 0);
  // At numeric tonic 0, ordered classes are already tonic-relative offsets 0..11.
  const offsets = scalePitchClasses(0, type);
  const length = runLength(offsets.length, options);
  return Array.from({ length }, (_, index) => {
    const position = scalePosition(index, offsets.length, options.direction);
    return transposeRegisteredPitch(tonic, position.octave * 12 + offsets[position.degree]!);
  });
}

/** Preserve each scale degree's spelling and its written octave, including accidental boundaries. */
export function scaleRegisteredNotes(
  tonic: RegisteredNote,
  type: ScaleType,
  options: ScaleRunOptions,
): readonly RegisteredNote[] {
  const pitches = scaleRegisteredPitches(registeredPitchFromNote(tonic), type, options);
  const spellings = scaleNoteSpellings(tonic, type);
  return pitches.map((pitch, index) => {
    const position = scalePosition(index, spellings.length, options.direction);
    const spelling = spellings[position.degree]!;
    const naturalClass = pitchClassFromSpelling({ letter: spelling.letter, accidental: 0 });
    // Subtraction may exceed safe Number arithmetic even when pitch itself is safe.
    const octave = Number((BigInt(pitch) - BigInt(naturalClass + spelling.accidental)) / 12n);
    const note: RegisteredNote = { ...spelling, octave };
    registeredPitchFromNote(note);
    return note;
  });
}
