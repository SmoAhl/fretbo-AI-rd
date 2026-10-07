import { describe, expect, test } from "vitest";
import { pitchClassFromSpelling } from "../domain/music-theory/note-spelling.js";
import { formatRegisteredNote, parseNoteSpelling, parseRegisteredNote } from "../domain/music-theory/note-text.js";
import { transposePitchClass } from "../domain/music-theory/pitch-class.js";
import { registeredPitchFromNote } from "../domain/music-theory/registered-pitch.js";
import {
  type IntervalQuality, type SpelledInterval,
  transposeNoteSpelling, transposeRegisteredNote,
} from "../domain/music-theory/spelled-transposition.js";

// Expected C4 upward results and chromatic distances are explicit musical examples.
const intervals: readonly [number, IntervalQuality, number, string][] = [
  [1, "perfect", 0, "C4"], [1, "augmented", 1, "C#4"],
  [2, "diminished", 0, "Dbb4"], [2, "minor", 1, "Db4"],
  [2, "major", 2, "D4"], [2, "augmented", 3, "D#4"],
  [3, "diminished", 2, "Ebb4"], [3, "minor", 3, "Eb4"],
  [3, "major", 4, "E4"], [3, "augmented", 5, "E#4"],
  [4, "diminished", 4, "Fb4"], [4, "perfect", 5, "F4"], [4, "augmented", 6, "F#4"],
  [5, "diminished", 6, "Gb4"], [5, "perfect", 7, "G4"], [5, "augmented", 8, "G#4"],
  [6, "diminished", 7, "Abb4"], [6, "minor", 8, "Ab4"],
  [6, "major", 9, "A4"], [6, "augmented", 10, "A#4"],
  [7, "diminished", 9, "Bbb4"], [7, "minor", 10, "Bb4"],
  [7, "major", 11, "B4"], [7, "augmented", 12, "B#4"],
  [8, "diminished", 11, "Cb5"], [8, "perfect", 12, "C5"], [8, "augmented", 13, "C#5"],
  [9, "minor", 13, "Db5"], [9, "major", 14, "D5"],
  [10, "major", 16, "E5"], [11, "perfect", 17, "F5"],
  [12, "perfect", 19, "G5"], [13, "minor", 20, "Ab5"],
  [14, "major", 23, "B5"], [15, "perfect", 24, "C6"],
];

describe("spelled transposition", () => {
  test.each(intervals)("transposes C4 up %i %s by %i semitones to %s", (number, quality, semitones, text) => {
    const interval: SpelledInterval = { number, quality, direction: "up" };
    const result = transposeRegisteredNote(parseRegisteredNote("C4"), interval);
    expect(result).toEqual(parseRegisteredNote(text));
    expect(registeredPitchFromNote(result)).toBe(48 + semitones);
  });

  test.each([
    [1, "augmented", "Cb4"], [2, "minor", "B3"], [2, "major", "Bb3"],
    [2, "diminished", "B#3"], [3, "minor", "A3"], [4, "augmented", "Gb3"],
    [8, "perfect", "C3"], [9, "major", "Bb2"],
  ] as const)("transposes C4 down %i %s to %s", (number, quality, text) => {
    expect(transposeRegisteredNote(parseRegisteredNote("C4"), { number, quality, direction: "down" }))
      .toEqual(parseRegisteredNote(text));
  });

  test("distinguishes an augmented unison from a minor second", () => {
    const source = parseNoteSpelling("C");
    const unison = transposeNoteSpelling(source, { number: 1, quality: "augmented", direction: "up" });
    const second = transposeNoteSpelling(source, { number: 2, quality: "minor", direction: "up" });
    expect(unison).toEqual(parseNoteSpelling("C#"));
    expect(second).toEqual(parseNoteSpelling("Db"));
    expect(pitchClassFromSpelling(unison)).toBe(1);
    expect(pitchClassFromSpelling(second)).toBe(1);
  });

  test("preserves semitone displacement and reversibility for all natural letters and intervals", () => {
    for (const letter of ["C", "D", "E", "F", "G", "A", "B"] as const) {
      const source = { letter, accidental: 0, octave: 4 } as const;
      for (const [number, quality, semitones] of intervals) {
        for (const direction of ["up", "down"] as const) {
          const interval = { number, quality, direction };
          const result = transposeRegisteredNote(source, interval);
          const sign = direction === "up" ? 1 : -1;
          expect(registeredPitchFromNote(result) - registeredPitchFromNote(source))
            .toBe(semitones === 0 ? 0 : sign * semitones);
          expect(transposeRegisteredNote(result, { ...interval, direction: direction === "up" ? "down" : "up" }))
            .toEqual(source);
          const spelling = transposeNoteSpelling(source, interval);
          expect(pitchClassFromSpelling(spelling))
            .toBe(transposePitchClass(pitchClassFromSpelling(source), sign * semitones));
        }
      }
    }
  });

  test("retains written register through enharmonic and negative-octave boundaries", () => {
    expect(transposeRegisteredNote(parseRegisteredNote("B#3"), { number: 2, quality: "major", direction: "up" }))
      .toEqual(parseRegisteredNote("C##4"));
    expect(transposeRegisteredNote(parseRegisteredNote("C0"), { number: 2, quality: "major", direction: "down" }))
      .toEqual(parseRegisteredNote("Bb-1"));
    expect(transposeRegisteredNote(parseRegisteredNote("Cb0"), { number: 8, quality: "perfect", direction: "down" }))
      .toEqual(parseRegisteredNote("Cb-1"));
  });

  test("supports double-accidental results and rejects triples without respelling", () => {
    expect(transposeNoteSpelling(parseNoteSpelling("C#"), { number: 1, quality: "augmented", direction: "up" }))
      .toEqual(parseNoteSpelling("C##"));
    expect(() => transposeNoteSpelling(parseNoteSpelling("C##"), { number: 1, quality: "augmented", direction: "up" }))
      .toThrow(RangeError);
    expect(() => transposeNoteSpelling(parseNoteSpelling("Dbb"), { number: 1, quality: "augmented", direction: "down" }))
      .toThrow(RangeError);
  });

  test.each([
    [1, "major"], [1, "minor"], [1, "diminished"], [4, "minor"],
    [5, "major"], [2, "perfect"], [9, "perfect"], [11, "major"],
  ] as const)("rejects incompatible or unsupported interval %i %s", (number, quality) => {
    for (const direction of ["up", "down"] as const) {
      expect(() => transposeNoteSpelling(parseNoteSpelling("C"), { number, quality, direction })).toThrow(RangeError);
    }
  });

  test.each([0, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1, Number.MAX_SAFE_INTEGER])(
    "rejects invalid or numerically unsupported interval number %s", (number) => {
      expect(() => transposeNoteSpelling(parseNoteSpelling("C"), { number, quality: "augmented", direction: "up" }))
        .toThrow(RangeError);
    },
  );

  test("rejects overflow and unsafe target octave bases", () => {
    const high = parseRegisteredNote("G750599937895082");
    expect(() => transposeRegisteredNote(high, { number: 1, quality: "augmented", direction: "up" }))
      .toThrow(RangeError);
    const low = parseRegisteredNote("C-750599937895082");
    expect(() => transposeRegisteredNote(low, { number: 2, quality: "minor", direction: "down" }))
      .toThrow(RangeError);
  });

  test("supports exact large compound intervals at the safe coordinate boundary", () => {
    const source = parseRegisteredNote("C0");
    // A perfect fifth plus 750599937895082 octaves lands exactly on MAX_SAFE_INTEGER.
    const interval: SpelledInterval = { number: 5254199565265579, quality: "perfect", direction: "up" };
    const result = transposeRegisteredNote(source, interval);
    expect(result).toEqual({ letter: "G", accidental: 0, octave: 750599937895082 });
    expect(registeredPitchFromNote(result)).toBe(Number.MAX_SAFE_INTEGER);
    expect(transposeRegisteredNote(result, { ...interval, direction: "down" })).toEqual(source);
  });

  test("preserves frozen inputs and runs parse-transpose-format end to end", () => {
    const source = Object.freeze(parseRegisteredNote("C#4"));
    const interval = Object.freeze({ number: 3, quality: "minor", direction: "up" } as const);
    expect(formatRegisteredNote(transposeRegisteredNote(source, interval))).toBe("E4");
    expect(source).toEqual({ letter: "C", accidental: 1, octave: 4 });
    expect(interval).toEqual({ number: 3, quality: "minor", direction: "up" });
  });
});

if (false) {
  // @ts-expect-error A semitone count alone cannot determine spelled transposition.
  transposeNoteSpelling({ letter: "C", accidental: 0 }, 1);
  // @ts-expect-error Interval direction is required.
  transposeNoteSpelling({ letter: "C", accidental: 0 }, { number: 2, quality: "minor" });
  // @ts-expect-error Multiply augmented qualities are not supported.
  transposeNoteSpelling({ letter: "C", accidental: 0 }, { number: 2, quality: "double-augmented", direction: "up" });
}
