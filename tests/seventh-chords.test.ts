import { describe, expect, test } from "vitest";
import { type Accidental, type NoteSpelling, pitchClassFromSpelling } from "../domain/music-theory/note-spelling.js";
import { formatNoteSpelling, parseNoteSpelling } from "../domain/music-theory/note-text.js";
import { type PitchClass } from "../domain/music-theory/pitch-class.js";
import { scaleNoteSpellings } from "../domain/music-theory/scales.js";
import {
  type SeventhChordQuality,
  seventhChordNoteSpellings,
  seventhChordPitchClasses,
} from "../domain/music-theory/seventh-chords.js";
import { triadNoteSpellings, triadPitchClasses } from "../domain/music-theory/triads.js";

// Independent sounding offsets and natural-letter coordinates supply the expected results.
const fixtures = [
  ["major-seventh", [0, 4, 7, 11]],
  ["dominant-seventh", [0, 4, 7, 10]],
  ["minor-seventh", [0, 3, 7, 10]],
  ["half-diminished-seventh", [0, 3, 6, 10]],
  ["diminished-seventh", [0, 3, 6, 9]],
  ["minor-major-seventh", [0, 3, 7, 11]],
  ["augmented-major-seventh", [0, 4, 8, 11]],
  ["augmented-seventh", [0, 4, 8, 10]],
] as const satisfies readonly (readonly [SeventhChordQuality, readonly number[]])[];
const pitchClasses: readonly PitchClass[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const naturals = [["C", 0], ["D", 2], ["E", 4], ["F", 5], ["G", 7], ["A", 9], ["B", 11]] as const;
const accidentals = [-3, -2, -1, 0, 1, 2, 3] as const;
const spelledRoots = naturals.flatMap(([letter], index) =>
  accidentals.map((accidental) => ({ root: { letter, accidental }, index })));

function wrap(pitch: number): PitchClass {
  return ((pitch % 12 + 12) % 12) as PitchClass;
}

function expectedSpellings(rootIndex: number, accidental: number, offsets: readonly number[]) {
  const letterSteps = [0, 2, 4, 6];
  return offsets.map((offset, position) => {
    const targetIndex = rootIndex + letterSteps[position]!;
    const [letter, natural] = naturals[targetIndex % 7]!;
    const soundingPitch = naturals[rootIndex]![1] + accidental + offset;
    return { letter, accidental: soundingPitch - natural - 12 * Math.floor(targetIndex / 7) };
  });
}

describe("seventhChordPitchClasses", () => {
  for (const [quality, offsets] of fixtures) {
    test.each(pitchClasses)(`${quality} at root %i`, (root) => {
      const result = seventhChordPitchClasses(root, quality);
      expect(result).toEqual(offsets.map((offset) => wrap(root + offset)));
      expect(result).toHaveLength(4);
      expect(result[0]).toBe(root);
      expect(new Set(result).size).toBe(4);
    });
  }

  test("preserves role order across pitch-class wrapping without sorting", () => {
    expect(seventhChordPitchClasses(11, "major-seventh")).toEqual([11, 3, 6, 10]);
  });

  test("diminished symmetry does not replace the explicitly supplied root", () => {
    expect(seventhChordPitchClasses(0, "diminished-seventh")).toEqual([0, 3, 6, 9]);
    expect(seventhChordPitchClasses(3, "diminished-seventh")).toEqual([3, 6, 9, 0]);
  });

  test("returns fresh arrays without changing other calls or existing triads", () => {
    const triad = triadPitchClasses(0, "major");
    const first = seventhChordPitchClasses(0, "major-seventh");
    const second = seventhChordPitchClasses(0, "major-seventh");
    expect(first).not.toBe(second);
    expect(Object.isFrozen(first)).toBe(false);
    (first as PitchClass[])[1] = 1;
    (first as PitchClass[])[3] = 0;
    expect(second).toEqual([0, 4, 7, 11]);
    expect(seventhChordPitchClasses(0, "major-seventh")).toEqual([0, 4, 7, 11]);
    expect(seventhChordPitchClasses(0, "dominant-seventh")).toEqual([0, 4, 7, 10]);
    expect(triad).toEqual([0, 4, 7]);
    expect(triadPitchClasses(0, "major")).toEqual([0, 4, 7]);
  });
});

describe("seventhChordNoteSpellings", () => {
  for (const [quality, offsets] of fixtures) {
    test.each(spelledRoots)(`${quality} at $root.letter ($root.accidental)`, (fixture) => {
      const root = Object.freeze({ ...fixture.root });
      const expected = expectedSpellings(fixture.index, root.accidental, offsets);
      const rootClass = wrap(naturals[fixture.index]![1] + root.accidental);
      const numeric = offsets.map((offset) => wrap(rootClass + offset));
      // Numeric output remains available even when the required exact spelling exceeds the limit.
      expect(seventhChordPitchClasses(rootClass, quality)).toEqual(numeric);
      if (expected.some((note) => Math.abs(note.accidental) > 3)) {
        expect(() => seventhChordNoteSpellings(root, quality)).toThrow(RangeError);
      } else {
        const result = seventhChordNoteSpellings(root, quality);
        expect(result).toEqual(expected);
        expect(result).toHaveLength(4);
        expect(new Set(result.map((note) => note.letter)).size).toBe(4);
        expect(result.map(pitchClassFromSpelling)).toEqual(numeric);
        expect(result[0]).toEqual(root);
        expect(result[0]).not.toBe(root);
      }
      expect(root).toEqual(fixture.root);
    });
  }

  test.each([
    ["C", "major-seventh", ["C", "E", "G", "B"]],
    ["C", "dominant-seventh", ["C", "E", "G", "Bb"]],
    ["C", "minor-seventh", ["C", "Eb", "G", "Bb"]],
    ["C", "half-diminished-seventh", ["C", "Eb", "Gb", "Bb"]],
    ["C", "diminished-seventh", ["C", "Eb", "Gb", "Bbb"]],
    ["C", "minor-major-seventh", ["C", "Eb", "G", "B"]],
    ["C", "augmented-major-seventh", ["C", "E", "G#", "B"]],
    ["C", "augmented-seventh", ["C", "E", "G#", "Bb"]],
    ["B", "major-seventh", ["B", "D#", "F#", "A#"]],
    ["Cb", "diminished-seventh", ["Cb", "Ebb", "Gbb", "Bbbb"]],
    ["F#", "major-seventh", ["F#", "A#", "C#", "E#"]],
    ["G##", "augmented-major-seventh", ["G##", "B##", "D###", "F###"]],
    ["F###", "minor-major-seventh", ["F###", "A##", "C###", "E###"]],
  ] as const)("%s %s preserves %o through parse/construct/format", (text, quality, expected) => {
    const result = seventhChordNoteSpellings(parseNoteSpelling(text), quality);
    expect(result.map((note) => formatNoteSpelling(note, "ascii"))).toEqual(expected);
  });

  test("spells the diminished seventh as B-double-flat rather than A", () => {
    const result = seventhChordNoteSpellings(parseNoteSpelling("C"), "diminished-seventh");
    expect(result.map((note) => formatNoteSpelling(note))).toEqual(["C", "E♭", "G♭", "B𝄫"]);
    expect(pitchClassFromSpelling(result[3]!)).toBe(9);
  });

  test("preserves enharmonic root identities and each written seventh", () => {
    const sharp = seventhChordNoteSpellings(parseNoteSpelling("C#"), "major-seventh");
    const flat = seventhChordNoteSpellings(parseNoteSpelling("Db"), "major-seventh");
    expect(sharp.map((note) => formatNoteSpelling(note, "ascii"))).toEqual(["C#", "E#", "G#", "B#"]);
    expect(flat.map((note) => formatNoteSpelling(note, "ascii"))).toEqual(["Db", "F", "Ab", "C"]);
    expect(sharp.map(pitchClassFromSpelling)).toEqual(flat.map(pitchClassFromSpelling));
  });

  test("constructs a supported dominant seventh without requiring a whole major scale", () => {
    const root = Object.freeze(parseNoteSpelling("G###"));
    expect(() => scaleNoteSpellings(root, "major")).toThrow(RangeError);
    expect(seventhChordNoteSpellings(root, "dominant-seventh")
      .map((note) => formatNoteSpelling(note, "ascii")))
      .toEqual(["G###", "B###", "D###", "F###"]);
  });

  test.each([
    ["G###", "major-seventh", "major", ["G###", "B###", "D###"]],
    ["Cbb", "diminished-seventh", "diminished", ["Cbb", "Ebbb", "Gbbb"]],
  ] as const)("rejects only the unrepresentable seventh of %s %s", (text, quality, triadQuality, triad) => {
    const root = Object.freeze(parseNoteSpelling(text));
    expect(triadNoteSpellings(root, triadQuality).map((note) => formatNoteSpelling(note, "ascii")))
      .toEqual(triad);
    expect(() => seventhChordNoteSpellings(root, quality)).toThrow(RangeError);
    expect(root).toEqual(parseNoteSpelling(text));
    expect(triadNoteSpellings(root, triadQuality).map((note) => formatNoteSpelling(note, "ascii")))
      .toEqual(triad);
  });

  test.each([
    ["Cbbb", "minor-seventh"],
    ["G###", "augmented-seventh"],
  ] as const)("also rejects unrepresentable triad tones in %s %s", (text, quality) => {
    const root = Object.freeze(parseNoteSpelling(text));
    expect(() => seventhChordNoteSpellings(root, quality)).toThrow(RangeError);
    expect(root).toEqual(parseNoteSpelling(text));
  });

  test("returns independent notes and arrays without changing frozen roots or triad results", () => {
    const root = Object.freeze(parseNoteSpelling("F#"));
    const triad = triadNoteSpellings(root, "major");
    const first = seventhChordNoteSpellings(root, "major-seventh");
    const second = seventhChordNoteSpellings(root, "major-seventh");
    expect(first).not.toBe(second);
    expect(Object.isFrozen(first)).toBe(false);
    first.forEach((note, index) => {
      expect(note).not.toBe(root);
      expect(note).not.toBe(second[index]);
      expect(note).not.toBe(triad[index]);
      expect(Object.isFrozen(note)).toBe(false);
      (note as { accidental: Accidental }).accidental = -3;
    });
    (first as NoteSpelling[])[1] = { letter: "C", accidental: 0 };
    const expected = ["F#", "A#", "C#", "E#"].map(parseNoteSpelling);
    expect(second).toEqual(expected);
    expect(seventhChordNoteSpellings(root, "major-seventh")).toEqual(expected);
    expect(seventhChordNoteSpellings(root, "dominant-seventh"))
      .toEqual(["F#", "A#", "C#", "E"].map(parseNoteSpelling));
    expect(triad).toEqual(["F#", "A#", "C#"].map(parseNoteSpelling));
    expect(triadNoteSpellings(root, "major")).toEqual(triad);
    expect(root).toEqual({ letter: "F", accidental: 1 });
  });
});

test.each([
  "", "major", "minor", "diminished", "augmented", "maj7", "m7", "7", "dim7", "aug7",
  "Cmaj7", "Major-seventh", "MAJOR-SEVENTH", "half diminished seventh", "major-ninth",
  "toString", "constructor", "__proto__", "hasOwnProperty", undefined, null, 0,
])("rejects unsupported runtime seventh-chord quality %s in both constructors", (quality) => {
  expect(() => seventhChordPitchClasses(0, quality as SeventhChordQuality)).toThrow(RangeError);
  expect(() => seventhChordNoteSpellings({ letter: "C", accidental: 0 }, quality as SeventhChordQuality))
    .toThrow(RangeError);
});

if (false) {
  // @ts-expect-error Numeric construction requires an explicit quality.
  seventhChordPitchClasses(0);
  // @ts-expect-error Spelled construction requires an explicit quality.
  seventhChordNoteSpellings({ letter: "C", accidental: 0 });
  // @ts-expect-error A triad quality is not a seventh-chord quality.
  seventhChordPitchClasses(0, "major");
  // @ts-expect-error Quality aliases are not supported.
  seventhChordPitchClasses(0, "maj7");
  // @ts-expect-error Other chord extensions are outside this contract.
  seventhChordNoteSpellings({ letter: "C", accidental: 0 }, "major-ninth");
  // @ts-expect-error Numeric construction requires a pitch class, not a spelling.
  seventhChordPitchClasses({ letter: "C", accidental: 0 }, "major-seventh");
  // @ts-expect-error A pitch class must be in 0..11.
  seventhChordPitchClasses(12, "major-seventh");
  // @ts-expect-error Spelled construction requires a spelling, not a pitch class.
  seventhChordNoteSpellings(0, "major-seventh");
  // @ts-expect-error Note text must be parsed before construction.
  seventhChordNoteSpellings("C", "major-seventh");
  // @ts-expect-error Root spelling requires an explicit accidental.
  seventhChordNoteSpellings({ letter: "C" }, "major-seventh");
  // @ts-expect-error Root accidentals are limited to -3..3.
  seventhChordNoteSpellings({ letter: "C", accidental: 4 }, "major-seventh");
  const pitches = seventhChordPitchClasses(0, "major-seventh");
  // @ts-expect-error Numeric results are readonly.
  pitches[0] = 1;
  const notes = seventhChordNoteSpellings({ letter: "C", accidental: 0 }, "major-seventh");
  // @ts-expect-error Spelled result arrays are readonly.
  notes.push({ letter: "B", accidental: 0 });
  // @ts-expect-error Output spelling objects are readonly.
  notes[0]!.accidental = 1;
}
