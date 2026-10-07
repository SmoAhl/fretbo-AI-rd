import { describe, expect, test } from "vitest";
import { semitoneDistance } from "../domain/music-theory/registered-pitch.js";
import { parseRegisteredNote } from "../domain/music-theory/note-text.js";
import {
  type IntervalQuality,
  identifySpelledInterval,
  transposeRegisteredNote,
} from "../domain/music-theory/spelled-transposition.js";

describe("semitoneDistance", () => {
  test.each([
    [48, 60, 12], [60, 48, -12], [48, 48, 0],
    [48, 54, 6], [54, 48, -6], [-12, -1, 11], [-1, -12, -11],
    [-12, 12, 24], [12, -12, -24],
    [0, Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
    [Number.MAX_SAFE_INTEGER, 0, Number.MIN_SAFE_INTEGER],
    [0, Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER],
    [Number.MIN_SAFE_INTEGER, 0, Number.MAX_SAFE_INTEGER],
    [Number.MAX_SAFE_INTEGER - 1, Number.MAX_SAFE_INTEGER, 1],
    [Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER + 1, 1],
  ])("measures %i to %i as %i semitones", (from, to, expected) => {
    expect(semitoneDistance(from, to)).toBe(expected);
  });

  test("returns positive zero for identical coordinates including signed zero and limits", () => {
    for (const pitch of [0, -0, 48, Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER]) {
      expect(semitoneDistance(pitch, pitch)).toBe(0);
    }
    expect(semitoneDistance(0, -0)).toBe(0);
    expect(semitoneDistance(-0, 0)).toBe(0);
  });

  test.each([0.5, -0.5, NaN, Infinity, -Infinity,
    Number.MAX_SAFE_INTEGER + 1, Number.MIN_SAFE_INTEGER - 1])(
    "rejects invalid coordinate %s in either argument", (value) => {
      expect(() => semitoneDistance(value, 0)).toThrow(RangeError);
      expect(() => semitoneDistance(0, value)).toThrow(RangeError);
    },
  );

  test.each([
    [-1, Number.MAX_SAFE_INTEGER], [1, Number.MIN_SAFE_INTEGER],
    [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
  ])("rejects unsafe distance between valid coordinates %i and %i", (from, to) => {
    expect(() => semitoneDistance(from, to)).toThrow(RangeError);
    expect(() => semitoneDistance(to, from)).toThrow(RangeError);
  });
});

describe("identifySpelledInterval", () => {
  // Explicit expected intervals cover every simple supported quality/number combination.
  const cases: readonly [string, string, number, IntervalQuality][] = [
    ["C4", "C4", 1, "perfect"], ["C4", "C#4", 1, "augmented"],
    ["C4", "Dbb4", 2, "diminished"], ["C4", "Db4", 2, "minor"],
    ["C4", "D4", 2, "major"], ["C4", "D#4", 2, "augmented"],
    ["C4", "Ebb4", 3, "diminished"], ["C4", "Eb4", 3, "minor"],
    ["C4", "E4", 3, "major"], ["C4", "E#4", 3, "augmented"],
    ["C4", "Fb4", 4, "diminished"], ["C4", "F4", 4, "perfect"],
    ["C4", "F#4", 4, "augmented"], ["C4", "Gb4", 5, "diminished"],
    ["C4", "G4", 5, "perfect"], ["C4", "G#4", 5, "augmented"],
    ["C4", "Abb4", 6, "diminished"], ["C4", "Ab4", 6, "minor"],
    ["C4", "A4", 6, "major"], ["C4", "A#4", 6, "augmented"],
    ["C4", "Bbb4", 7, "diminished"], ["C4", "Bb4", 7, "minor"],
    ["C4", "B4", 7, "major"], ["C4", "B#4", 7, "augmented"],
    ["C4", "Cb5", 8, "diminished"], ["C4", "C5", 8, "perfect"],
    ["C4", "C#5", 8, "augmented"], ["C4", "Db5", 9, "minor"],
    ["C4", "D5", 9, "major"], ["C4", "E5", 10, "major"],
    ["C4", "F#5", 11, "augmented"], ["C4", "Gb5", 12, "diminished"],
    ["C4", "Ab5", 13, "minor"], ["C4", "B5", 14, "major"],
    ["C4", "C6", 15, "perfect"], ["C4", "D6", 16, "major"],
    ["C#4", "E4", 3, "minor"], ["Dbb4", "Fbb4", 3, "minor"],
    ["B#3", "C##4", 2, "major"], ["B3", "C4", 2, "minor"],
    ["B-1", "C0", 2, "minor"], ["Cb-1", "Cb0", 8, "perfect"],
    ["C#4", "Db4", 2, "diminished"], ["B#3", "C4", 2, "diminished"],
    ["Cb4", "B3", 2, "diminished"], ["C4", "Cb4", 1, "augmented"],
  ];

  test.each(cases)("identifies %s to %s as %i %s and preserves both endpoints", (fromText, toText, number, quality) => {
    const from = parseRegisteredNote(fromText);
    const to = parseRegisteredNote(toText);
    // These two examples descend in writing/sound; all other explicit examples ascend.
    const direction = (fromText === "Cb4" && toText === "B3")
      || (fromText === "C4" && toText === "Cb4") ? "down" : "up";
    const interval = identifySpelledInterval(from, to);
    expect(interval).toEqual({ number, quality, direction });
    expect(transposeRegisteredNote(from, interval)).toEqual(to);

    const reverse = identifySpelledInterval(to, from);
    expect(reverse).toEqual({ number, quality,
      direction: fromText === toText ? "up" : direction === "up" ? "down" : "up" });
    expect(transposeRegisteredNote(to, reverse)).toEqual(from);
  });

  test.each([
    ["C4", "C##4"], // Doubly augmented unison.
    ["Cb4", "D#4"], // Doubly augmented second.
    ["C#4", "Ebb4"], // Doubly diminished third.
    ["C4", "Gbb4"], // Doubly diminished fifth.
    ["C##4", "Db4"], // Written motion up, sounding motion down.
    ["B##3", "Cb4"], // Contradiction at the written octave boundary.
  ])("rejects unsupported pairs %s and %s without respelling", (fromText, toText) => {
    const from = parseRegisteredNote(fromText);
    const to = parseRegisteredNote(toText);
    expect(() => identifySpelledInterval(from, to)).toThrow(RangeError);
    expect(() => identifySpelledInterval(to, from)).toThrow(RangeError);
  });

  test("preserves frozen note inputs", () => {
    const from = Object.freeze(parseRegisteredNote("C4"));
    const to = Object.freeze(parseRegisteredNote("F#4"));
    expect(identifySpelledInterval(from, to)).toEqual({ number: 4, quality: "augmented", direction: "up" });
    expect(from).toEqual({ letter: "C", accidental: 0, octave: 4 });
    expect(to).toEqual({ letter: "F", accidental: 1, octave: 4 });
  });

  test.each([0.5, NaN, Infinity, Number.MAX_SAFE_INTEGER, 750599937895083])(
    "rejects invalid or unsafe octave %s in either note", (octave) => {
      const invalid = { letter: "C", accidental: 0, octave } as const;
      const valid = parseRegisteredNote("C4");
      expect(() => identifySpelledInterval(invalid, valid)).toThrow(RangeError);
      expect(() => identifySpelledInterval(valid, invalid)).toThrow(RangeError);
    },
  );

  test("preserves exact compound number at the safe displacement limit in both directions", () => {
    const from = parseRegisteredNote("C0");
    const to = parseRegisteredNote("G750599937895082");
    const interval = identifySpelledInterval(from, to);
    expect(interval).toEqual({ number: 5254199565265579, quality: "perfect", direction: "up" });
    expect(transposeRegisteredNote(from, interval)).toEqual(to);
    const reverse = identifySpelledInterval(to, from);
    expect(reverse).toEqual({ ...interval, direction: "down" });
    expect(transposeRegisteredNote(to, reverse)).toEqual(from);
  });

  test("measures adjacent spellings at extreme positive and negative octaves exactly", () => {
    for (const octave of [-750599937895082, 750599937895082]) {
      const from = { letter: "C", accidental: 0, octave } as const;
      const to = { letter: "D", accidental: 0, octave } as const;
      expect(identifySpelledInterval(from, to)).toEqual({ number: 2, quality: "major", direction: "up" });
      expect(identifySpelledInterval(to, from)).toEqual({ number: 2, quality: "major", direction: "down" });
    }
  });

  test("rejects unsafe displacement even when both registered notes are individually valid", () => {
    const from = parseRegisteredNote("C-750599937895082");
    const to = parseRegisteredNote("G750599937895082");
    expect(() => identifySpelledInterval(from, to)).toThrow(RangeError);
    expect(() => identifySpelledInterval(to, from)).toThrow(RangeError);
  });
});

if (false) {
  // @ts-expect-error Distances require numeric registered coordinates.
  semitoneDistance("C4", 60);
  // @ts-expect-error Identification requires written register on both notes.
  identifySpelledInterval({ letter: "C", accidental: 0 }, parseRegisteredNote("E4"));
  // @ts-expect-error Sounding coordinates alone cannot determine a spelled interval.
  identifySpelledInterval(48, 54);
}
