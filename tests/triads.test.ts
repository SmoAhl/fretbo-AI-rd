import { describe, expect, test } from "vitest";
import { type Accidental, type NoteSpelling, pitchClassFromSpelling } from "../domain/music-theory/pitch-pitch-classes-and-spelling/note-spelling.js";
import { formatNoteSpelling, parseNoteSpelling } from "../domain/music-theory/pitch-pitch-classes-and-spelling/note-text.js";
import { type PitchClass } from "../domain/music-theory/pitch-pitch-classes-and-spelling/pitch-class.js";
import { scaleNoteSpellings } from "../domain/music-theory/scales-and-modes/scales.js";
import { type TriadQuality, triadFormula, triadNoteSpellings, triadPitchClasses } from "../domain/music-theory/chords-symbols-and-realization/triads.js";

// Independent musical fixtures, rather than the production formula table or degree converters.
const fixtures = [
  ["major", [0, 4, 7]],
  ["minor", [0, 3, 7]],
  ["diminished", [0, 3, 6]],
  ["augmented", [0, 4, 8]],
  ["sus2", [0, 2, 7]],
  ["sus4", [0, 5, 7]],
] as const satisfies readonly (readonly [TriadQuality, readonly number[]])[];
const pitchClasses: readonly PitchClass[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const naturals = [["C", 0], ["D", 2], ["E", 4], ["F", 5], ["G", 7], ["A", 9], ["B", 11]] as const;
const accidentals = [-3, -2, -1, 0, 1, 2, 3] as const;
const spelledRoots = naturals.flatMap(([letter], index) =>
  accidentals.map((accidental) => ({ root: { letter, accidental }, index })));

function wrap(pitch: number): PitchClass {
  return ((pitch % 12 + 12) % 12) as PitchClass;
}

function expectedSpellings(rootIndex: number, accidental: number, offsets: readonly number[], quality: TriadQuality) {
  const letterSteps = quality === "sus2" ? [0, 1, 4] : quality === "sus4" ? [0, 3, 4] : [0, 2, 4];
  return offsets.map((offset, position) => {
    const targetIndex = rootIndex + letterSteps[position]!;
    const [letter, natural] = naturals[targetIndex % 7]!;
    const soundingPitch = naturals[rootIndex]![1] + accidental + offset;
    return { letter, accidental: soundingPitch - natural - 12 * Math.floor(targetIndex / 7) };
  });
}

describe("triadPitchClasses", () => {
  for (const [quality, offsets] of fixtures) {
    test.each(pitchClasses)(`${quality} at root %i`, (root) => {
      const result = triadPitchClasses(root, quality);
      expect(result).toEqual(offsets.map((offset) => wrap(root + offset)));
      expect(result).toHaveLength(3);
      expect(result[0]).toBe(root);
      expect(new Set(result).size).toBe(3);
    });
  }

  test("preserves role order across pitch-class wrapping rather than sorting", () => {
    expect(triadPitchClasses(11, "major")).toEqual([11, 3, 6]);
  });

  test("augmented symmetry does not replace the explicitly supplied root", () => {
    expect(triadPitchClasses(0, "augmented")).toEqual([0, 4, 8]);
    expect(triadPitchClasses(4, "augmented")).toEqual([4, 8, 0]);
  });

  test("returns fresh arrays without exposing shared definitions", () => {
    const first = triadPitchClasses(0, "major");
    const second = triadPitchClasses(0, "major");
    expect(first).not.toBe(second);
    expect(Object.isFrozen(first)).toBe(false);
    (first as PitchClass[])[1] = 1;
    expect(second).toEqual([0, 4, 7]);
    expect(triadPitchClasses(0, "major")).toEqual([0, 4, 7]);
    expect(triadPitchClasses(0, "minor")).toEqual([0, 3, 7]);
  });
});

describe("triadNoteSpellings", () => {
  for (const [quality, offsets] of fixtures) {
    test.each(spelledRoots)(`${quality} at $root.letter ($root.accidental)`, (fixture) => {
      const root = Object.freeze({ ...fixture.root });
      const expected = expectedSpellings(fixture.index, root.accidental, offsets, quality);
      const rootClass = wrap(naturals[fixture.index]![1] + root.accidental);
      const numeric = offsets.map((offset) => wrap(rootClass + offset));
      // Numeric construction remains usable even if the exact spelling cannot be represented.
      expect(triadPitchClasses(rootClass, quality)).toEqual(numeric);
      if (expected.some((note) => Math.abs(note.accidental) > 3)) {
        expect(() => triadNoteSpellings(root, quality)).toThrow(RangeError);
      } else {
        const result = triadNoteSpellings(root, quality);
        expect(result).toEqual(expected);
        expect(result).toHaveLength(3);
        expect(new Set(result.map((note) => note.letter)).size).toBe(3);
        expect(result.map(pitchClassFromSpelling)).toEqual(numeric);
        expect(result[0]).toEqual(root);
        expect(result[0]).not.toBe(root);
      }
      expect(root).toEqual(fixture.root);
    });
  }

  test.each([
    ["C", "major", ["C", "E", "G"]],
    ["C", "minor", ["C", "Eb", "G"]],
    ["C", "diminished", ["C", "Eb", "Gb"]],
    ["C", "augmented", ["C", "E", "G#"]],
    ["F#", "major", ["F#", "A#", "C#"]],
    ["Cb", "diminished", ["Cb", "Ebb", "Gbb"]],
    ["B", "augmented", ["B", "D#", "F##"]],
    ["G##", "augmented", ["G##", "B##", "D###"]],
    ["F###", "diminished", ["F###", "A##", "C##"]],
    ["C", "sus2", ["C", "D", "G"]],
    ["C", "sus4", ["C", "F", "G"]],
    ["F#", "sus4", ["F#", "B", "C#"]],
  ] as const)("%s %s preserves %o through parse/construct/format", (text, quality, expected) => {
    const result = triadNoteSpellings(parseNoteSpelling(text), quality);
    expect(result.map((note) => formatNoteSpelling(note, "ascii"))).toEqual(expected);
  });

  test("preserves different spellings of enharmonic roots", () => {
    const sharp = triadNoteSpellings(parseNoteSpelling("C#"), "major");
    const flat = triadNoteSpellings(parseNoteSpelling("Db"), "major");
    expect(sharp.map((note) => formatNoteSpelling(note, "ascii"))).toEqual(["C#", "E#", "G#"]);
    expect(flat.map((note) => formatNoteSpelling(note, "ascii"))).toEqual(["Db", "F", "Ab"]);
    expect(sharp.map(pitchClassFromSpelling)).toEqual(flat.map(pitchClassFromSpelling));
  });

  test("constructs a representable triad without requiring a representable whole scale", () => {
    const root = Object.freeze(parseNoteSpelling("G###"));
    expect(() => scaleNoteSpellings(root, "major")).toThrow(RangeError);
    expect(triadNoteSpellings(root, "major").map((note) => formatNoteSpelling(note, "ascii")))
      .toEqual(["G###", "B###", "D###"]);
  });

  test.each([
    ["G###", "augmented"],
    ["Cbbb", "minor"],
    ["Cbbb", "diminished"],
  ] as const)("rejects an unrepresentable tone in %s %s without respelling", (text, quality) => {
    const root = Object.freeze(parseNoteSpelling(text));
    expect(() => triadNoteSpellings(root, quality)).toThrow(RangeError);
    expect(root).toEqual(parseNoteSpelling(text));
  });

  test("returns fresh arrays and notes, preserving frozen inputs and future results", () => {
    const root = Object.freeze(parseNoteSpelling("F#"));
    const first = triadNoteSpellings(root, "major");
    const second = triadNoteSpellings(root, "major");
    expect(first).not.toBe(second);
    expect(Object.isFrozen(first)).toBe(false);
    first.forEach((note, index) => {
      expect(note).not.toBe(root);
      expect(note).not.toBe(second[index]);
      expect(Object.isFrozen(note)).toBe(false);
      (note as { accidental: Accidental }).accidental = -3;
    });
    (first as NoteSpelling[])[1] = { letter: "C", accidental: 0 };
    const expected = ["F#", "A#", "C#"].map(parseNoteSpelling);
    expect(second).toEqual(expected);
    expect(triadNoteSpellings(root, "major")).toEqual(expected);
    expect(triadNoteSpellings(root, "minor")).toEqual(["F#", "A", "C#"].map(parseNoteSpelling));
    expect(root).toEqual({ letter: "F", accidental: 1 });
  });
});

test.each([
  "", "maj", "min", "dim", "aug", "MAJOR", "Major", "major-seventh", "sus",
  "major-pentatonic", "toString", "constructor", "__proto__", "hasOwnProperty",
  undefined, null, 0,
])("rejects unsupported runtime triad quality %s in both constructors", (quality) => {
  expect(() => triadPitchClasses(0, quality as TriadQuality)).toThrow(RangeError);
  expect(() => triadNoteSpellings({ letter: "C", accidental: 0 }, quality as TriadQuality)).toThrow(RangeError);
  expect(() => triadFormula(quality as TriadQuality)).toThrow(RangeError);
});

test.each([
  ["major", [[1, 0], [3, 0], [5, 0]]],
  ["minor", [[1, 0], [3, -1], [5, 0]]],
  ["diminished", [[1, 0], [3, -1], [5, -1]]],
  ["augmented", [[1, 0], [3, 0], [5, 1]]],
  ["sus2", [[1, 0], [2, 0], [5, 0]]],
  ["sus4", [[1, 0], [4, 0], [5, 0]]],
] as const)("%s returns an independent formula", (quality, roles) => {
  const expected = roles.map(([number, alteration]) => ({ number, alteration }));
  const first = triadFormula(quality);
  const second = triadFormula(quality);
  expect(first).toEqual(expected);
  expect(first).not.toBe(second);
  expect(Object.isFrozen(first)).toBe(false);
  first.forEach((role, index) => {
    expect(role).not.toBe(second[index]);
    expect(Object.isFrozen(role)).toBe(false);
    (role as { number: number }).number = 99;
  });
  expect(second).toEqual(expected);
  expect(triadFormula(quality)).toEqual(expected);
});

if (false) {
  // @ts-expect-error Formula quality is required.
  triadFormula();
  // @ts-expect-error Formula roles are readonly.
  triadFormula("sus2")[1]!.number = 9;
  // @ts-expect-error Numeric construction requires an explicit quality.
  triadPitchClasses(0);
  // @ts-expect-error Spelled construction requires an explicit quality.
  triadNoteSpellings({ letter: "C", accidental: 0 });
  // @ts-expect-error Quality aliases are not supported.
  triadPitchClasses(0, "maj");
  // @ts-expect-error Other chord families are outside the triad contract.
  triadNoteSpellings({ letter: "C", accidental: 0 }, "major-seventh");
  // @ts-expect-error Numeric construction requires a pitch class, not a spelling.
  triadPitchClasses({ letter: "C", accidental: 0 }, "major");
  // @ts-expect-error A pitch class must be in 0..11.
  triadPitchClasses(12, "major");
  // @ts-expect-error Spelled construction requires a spelling, not a pitch class.
  triadNoteSpellings(0, "major");
  // @ts-expect-error Note text must be parsed before construction.
  triadNoteSpellings("C", "major");
  // @ts-expect-error Root spelling requires an explicit accidental.
  triadNoteSpellings({ letter: "C" }, "major");
  // @ts-expect-error Root accidentals are limited to -3..3.
  triadNoteSpellings({ letter: "C", accidental: 4 }, "major");
  const pitches = triadPitchClasses(0, "major");
  // @ts-expect-error Numeric results are readonly.
  pitches[0] = 1;
  const notes = triadNoteSpellings({ letter: "C", accidental: 0 }, "major");
  // @ts-expect-error Spelled result arrays are readonly.
  notes.push({ letter: "B", accidental: 0 });
  // @ts-expect-error Output spelling objects are readonly.
  notes[0]!.accidental = 1;
}
