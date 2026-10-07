import { describe, expect, test } from "vitest";
import {
  type PitchClass,
  transposePitchClass,
} from "../domain/music-theory/pitch-class.js";

const pitchClasses: readonly PitchClass[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

describe("transposePitchClass", () => {
  test.each(pitchClasses)("preserves pitch class %i for whole octaves", (pitchClass) => {
    for (const semitones of [0, 12, -12, 24, -24]) {
      expect(transposePitchClass(pitchClass, semitones)).toBe(pitchClass);
    }
  });

  test("moves through all twelve classes in both directions and wraps", () => {
    const ascending: readonly PitchClass[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0];
    const descending: readonly PitchClass[] = [11, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    expect(pitchClasses.map((pitchClass) => transposePitchClass(pitchClass, 1))).toEqual(ascending);
    expect(pitchClasses.map((pitchClass) => transposePitchClass(pitchClass, -1))).toEqual(descending);
  });

  test.each([
    [10, 5, 3],
    [2, -5, 9],
    [11, 25, 0],
    [0, -25, 11],
    [11, Number.MAX_SAFE_INTEGER, 6],
    [0, Number.MIN_SAFE_INTEGER, 5],
  ] as const)("transposes %i by %i semitones to %i", (pitchClass, semitones, expected) => {
    expect(transposePitchClass(pitchClass, semitones)).toBe(expected);
  });

  test.each([
    0.5,
    -0.5,
    NaN,
    Infinity,
    -Infinity,
    Number.MAX_SAFE_INTEGER + 1,
    Number.MIN_SAFE_INTEGER - 1,
  ])("rejects unsupported semitone offset %s", (semitones) => {
    expect(() => transposePitchClass(0, semitones)).toThrow(RangeError);
  });
});
