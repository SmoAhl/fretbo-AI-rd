import { describe, expect, test } from "vitest";
import { type NoteLetter } from "../domain/music-theory/note-spelling.js";
import {
  type RegisteredNote,
  pitchClassFromRegisteredPitch,
  registeredPitchFromNote,
  transposeRegisteredPitch,
} from "../domain/music-theory/registered-pitch.js";

const invalidNumbers = [
  0.5, -0.5, NaN, Infinity, -Infinity,
  Number.MAX_SAFE_INTEGER + 1, Number.MIN_SAFE_INTEGER - 1,
];
// The largest octave whose C-based coordinate is safe; its base is 9007199254740984.
const largestSafeOctave = 750599937895082;

describe("registeredPitchFromNote", () => {
  test.each([
    [0, 0], [4, 48], [5, 60], [-1, -12],
  ])("uses C octave %i as coordinate %i", (octave, expected) => {
    expect(registeredPitchFromNote({ letter: "C", accidental: 0, octave })).toBe(expected);
  });

  // Explicit expected coordinates at octaves -1, 0, and 4.
  const naturalCases: readonly [NoteLetter, readonly [number, number, number]][] = [
    ["C", [-12, 0, 48]], ["D", [-10, 2, 50]], ["E", [-8, 4, 52]],
    ["F", [-7, 5, 53]], ["G", [-5, 7, 55]], ["A", [-3, 9, 57]],
    ["B", [-1, 11, 59]],
  ];
  for (const [letter, expectedCoordinates] of naturalCases) {
    ([-1, 0, 4] as const).forEach((octave, index) => {
      test(`maps natural ${letter} at octave ${octave}`, () => {
        expect(registeredPitchFromNote({ letter, accidental: 0, octave }))
          .toBe(expectedCoordinates[index]);
      });
    });
  }

  // Columns are double flat through double sharp at written octave 0.
  // Negative and above-octave coordinates must not be wrapped.
  const spellingCases: readonly [NoteLetter, readonly [number, number, number, number, number]][] = [
    ["C", [-2, -1, 0, 1, 2]], ["D", [0, 1, 2, 3, 4]],
    ["E", [2, 3, 4, 5, 6]], ["F", [3, 4, 5, 6, 7]],
    ["G", [5, 6, 7, 8, 9]], ["A", [7, 8, 9, 10, 11]],
    ["B", [9, 10, 11, 12, 13]],
  ];
  for (const [letter, expectedCoordinates] of spellingCases) {
    ([-2, -1, 0, 1, 2] as const).forEach((accidental, index) => {
      test(`maps ${letter} with accidental ${accidental} at octave 0`, () => {
        expect(registeredPitchFromNote({ letter, accidental, octave: 0 }))
          .toBe(expectedCoordinates[index]);
      });
    });
  }

  test.each([
    [{ letter: "B", accidental: 1, octave: 3 }, { letter: "C", accidental: 0, octave: 4 }, 48],
    [{ letter: "C", accidental: -1, octave: 4 }, { letter: "B", accidental: 0, octave: 3 }, 47],
    [{ letter: "B", accidental: 2, octave: 3 }, { letter: "C", accidental: 1, octave: 4 }, 49],
    [{ letter: "C", accidental: -2, octave: 4 }, { letter: "B", accidental: -1, octave: 3 }, 46],
  ] as const)("preserves cross-octave enharmonics between %o and %o", (first, second, expected) => {
    expect(registeredPitchFromNote(first)).toBe(expected);
    expect(registeredPitchFromNote(second)).toBe(expected);
  });

  test("preserves a frozen spelled note", () => {
    const note: RegisteredNote = Object.freeze({ letter: "B", accidental: 1, octave: 3 });
    expect(registeredPitchFromNote(note)).toBe(48);
    expect(note).toEqual({ letter: "B", accidental: 1, octave: 3 });
  });

  test.each(invalidNumbers)("rejects invalid octave %s", (octave) => {
    expect(() => registeredPitchFromNote({ letter: "C", accidental: 0, octave }))
      .toThrow(RangeError);
  });

  test("supports exact coordinates at the safe octave boundaries", () => {
    expect(registeredPitchFromNote({ letter: "C", accidental: 0, octave: largestSafeOctave }))
      .toBe(9007199254740984);
    expect(registeredPitchFromNote({ letter: "G", accidental: 0, octave: largestSafeOctave }))
      .toBe(Number.MAX_SAFE_INTEGER);
    // The unaltered A would overflow; grouping the double flat first stays exact.
    expect(registeredPitchFromNote({ letter: "A", accidental: -2, octave: largestSafeOctave }))
      .toBe(Number.MAX_SAFE_INTEGER);
    expect(registeredPitchFromNote({ letter: "C", accidental: -2, octave: -largestSafeOctave }))
      .toBe(-9007199254740986);
  });

  test("rejects unsafe final coordinates from a safe octave base", () => {
    expect(() => registeredPitchFromNote({ letter: "G", accidental: 1, octave: largestSafeOctave }))
      .toThrow(RangeError);
  });

  test.each([largestSafeOctave + 1, -largestSafeOctave - 1])(
    "rejects unsafe octave base for octave %i",
    (octave) => {
      // For the negative octave, B would bring the mathematical result back into
      // range, but the contract still requires a safe C-based octave coordinate.
      const note: RegisteredNote = octave > 0
        ? { letter: "C", accidental: -2, octave }
        : { letter: "B", accidental: 0, octave };
      expect(() => registeredPitchFromNote(note)).toThrow(RangeError);
    },
  );
});

describe("transposeRegisteredPitch", () => {
  test.each([
    [48, 0, 48], [47, 1, 48], [48, -1, 47], [48, 12, 60],
    [48, -24, 24], [0, -1, -1], [-1, 1, 0], [-12, -13, -25],
    [Number.MAX_SAFE_INTEGER, 0, Number.MAX_SAFE_INTEGER],
    [Number.MIN_SAFE_INTEGER, 0, Number.MIN_SAFE_INTEGER],
    [Number.MAX_SAFE_INTEGER - 1, 1, Number.MAX_SAFE_INTEGER],
    [Number.MIN_SAFE_INTEGER + 1, -1, Number.MIN_SAFE_INTEGER],
    [Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER, 0],
  ])("transposes coordinate %i by %i to %i", (pitch, semitones, expected) => {
    expect(transposeRegisteredPitch(pitch, semitones)).toBe(expected);
  });

  test.each([-25, 0, 25])("preserves octave distance after offset %i", (semitones) => {
    expect(transposeRegisteredPitch(60, semitones) - transposeRegisteredPitch(48, semitones))
      .toBe(12);
  });

  test.each(invalidNumbers)("rejects invalid pitch or offset %s", (value) => {
    expect(() => transposeRegisteredPitch(value, 0)).toThrow(RangeError);
    expect(() => transposeRegisteredPitch(0, value)).toThrow(RangeError);
  });

  test.each([
    [Number.MAX_SAFE_INTEGER, 1], [Number.MIN_SAFE_INTEGER, -1],
  ])("rejects overflow from pitch %i and offset %i", (pitch, semitones) => {
    expect(() => transposeRegisteredPitch(pitch, semitones)).toThrow(RangeError);
  });
});

describe("pitchClassFromRegisteredPitch", () => {
  test.each([
    [0, 0], [48, 0], [60, 0], [28, 4], [52, 4],
    [-1, 11], [-12, 0], [-13, 11], [-25, 11],
    [Number.MAX_SAFE_INTEGER, 7], [Number.MIN_SAFE_INTEGER, 5],
  ])("extracts pitch class from coordinate %i as %i", (pitch, expected) => {
    expect(pitchClassFromRegisteredPitch(pitch)).toBe(expected);
  });

  test("distinguishes E2 and E4 while preserving their shared pitch class", () => {
    const low = registeredPitchFromNote({ letter: "E", accidental: 0, octave: 2 });
    const high = registeredPitchFromNote({ letter: "E", accidental: 0, octave: 4 });
    expect(low).toBe(28);
    expect(high).toBe(52);
    expect(pitchClassFromRegisteredPitch(low)).toBe(4);
    expect(pitchClassFromRegisteredPitch(high)).toBe(4);
  });

  test.each(invalidNumbers)("rejects invalid coordinate %s", (pitch) => {
    expect(() => pitchClassFromRegisteredPitch(pitch)).toThrow(RangeError);
  });
});

// Compile-time contract assertions; unsupported inputs are never executed.
if (false) {
  // @ts-expect-error A spelled pitch needs an explicit written octave.
  registeredPitchFromNote({ letter: "C", accidental: 0 });
  // @ts-expect-error Octaves must be numeric.
  registeredPitchFromNote({ letter: "C", accidental: 0, octave: "4" });
  // @ts-expect-error RegisteredNote retains the supported letter contract.
  registeredPitchFromNote({ letter: "H", accidental: 0, octave: 4 });
  // @ts-expect-error RegisteredNote retains the supported accidental contract.
  registeredPitchFromNote({ letter: "C", accidental: 3, octave: 4 });
}
