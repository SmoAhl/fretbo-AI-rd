import { describe, expect, test } from "vitest";
import { type NoteSpelling, pitchClassFromSpelling } from "../domain/music-theory/note-spelling.js";
import { formatNoteSpelling, parseNoteSpelling } from "../domain/music-theory/note-text.js";
import { type PitchClass } from "../domain/music-theory/pitch-class.js";
import {
  type ScaleDegree,
  type ScaleType,
  pitchClassAtScaleDegree,
  scaleDegreeOfPitchClass,
  scaleNoteSpellings,
  scalePitchClasses,
} from "../domain/music-theory/scales.js";

// Expected chromatic offsets and letter steps are independent of production interval patterns.
const collections = [
  ["major-pentatonic", [0, 2, 4, 7, 9], [0, 1, 2, 4, 5], [2, 2, 3, 2, 3]],
  ["minor-pentatonic", [0, 3, 5, 7, 10], [0, 2, 3, 4, 6], [3, 2, 2, 3, 2]],
] as const;
const pitchClasses: readonly PitchClass[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

describe("pentatonic construction and membership", () => {
  for (const [type, offsets, , closingSteps] of collections) {
    test.each(pitchClasses)(`constructs and queries ${type} at tonic %i`, (tonic) => {
      const result = scalePitchClasses(tonic, type);
      const expected = offsets.map((offset) => (tonic + offset) % 12);
      expect(result).toEqual(expected);
      expect(result).toHaveLength(5);
      expect(result[0]).toBe(tonic);
      expect(new Set(result).size).toBe(5);
      expect(result.map((pitch, index) => (result[(index + 1) % 5]! - pitch + 12) % 12))
        .toEqual(closingSteps);
      expected.forEach((pitch, index) => {
        const degree = (index + 1) as ScaleDegree;
        expect(pitchClassAtScaleDegree(tonic, type, degree)).toBe(pitch);
        expect(scaleDegreeOfPitchClass(tonic, type, pitch as PitchClass)).toBe(degree);
      });
      for (const candidate of pitchClasses) {
        const index = expected.indexOf(candidate);
        expect(scaleDegreeOfPitchClass(tonic, type, candidate)).toBe(index === -1 ? undefined : index + 1);
      }
      for (const degree of [6, 7] as const) {
        expect(() => pitchClassAtScaleDegree(tonic, type, degree)).toThrow(RangeError);
      }
    });
  }

  test("ordinal positions differ from tonic-relative interval numbers", () => {
    expect(pitchClassAtScaleDegree(0, "major-pentatonic", 4)).toBe(7);
    expect(scaleDegreeOfPitchClass(0, "major-pentatonic", 7)).toBe(4);
    expect(pitchClassAtScaleDegree(0, "minor-pentatonic", 2)).toBe(3);
    expect(scaleDegreeOfPitchClass(0, "minor-pentatonic", 3)).toBe(2);
  });

  test.each([0, -1, 1.5, 8, NaN, Infinity, -Infinity, Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER])(
    "rejects invalid pentatonic ordinal %s", (degree) => {
      for (const [type] of collections) {
        expect(() => pitchClassAtScaleDegree(0, type, degree as ScaleDegree)).toThrow(RangeError);
      }
    },
  );

  test.each([
    ["major", 9, 11], ["natural-minor", 8, 10], ["harmonic-minor", 8, 11],
    ["melodic-minor-ascending", 9, 11], ["ionian", 9, 11], ["dorian", 9, 10],
    ["phrygian", 8, 10], ["lydian", 9, 11], ["mixolydian", 9, 10],
    ["aeolian", 8, 10], ["locrian", 8, 10],
  ] as const)("keeps degrees 6 and 7 available for %s", (type, sixth, seventh) => {
    expect(pitchClassAtScaleDegree(0, type, 6)).toBe(sixth);
    expect(pitchClassAtScaleDegree(0, type, 7)).toBe(seventh);
  });

  test.each(["pentatonic", "major pentatonic", "minor", "toString", "constructor", "__proto__"])(
    "all APIs reject unknown type %s", (type) => {
      const unsupported = type as ScaleType;
      const tonic = { letter: "C", accidental: 0 } as const;
      expect(() => scalePitchClasses(0, unsupported)).toThrow(RangeError);
      expect(() => scaleNoteSpellings(tonic, unsupported)).toThrow(RangeError);
      expect(() => pitchClassAtScaleDegree(0, unsupported, 1)).toThrow(RangeError);
      expect(() => scaleDegreeOfPitchClass(0, unsupported, 0)).toThrow(RangeError);
    },
  );
});

describe("pentatonic spelling", () => {
  test.each([
    ["C", "major-pentatonic", ["C", "D", "E", "G", "A"]],
    ["C", "minor-pentatonic", ["C", "Eb", "F", "G", "Bb"]],
    ["F#", "major-pentatonic", ["F#", "G#", "A#", "C#", "D#"]],
    ["C#", "minor-pentatonic", ["C#", "E", "F#", "G#", "B"]],
    ["Db", "major-pentatonic", ["Db", "Eb", "F", "Ab", "Bb"]],
    ["C##", "major-pentatonic", ["C##", "D##", "E##", "G##", "A##"]],
    ["Cbb", "major-pentatonic", ["Cbb", "Dbb", "Ebb", "Gbb", "Abb"]],
    ["A##", "minor-pentatonic", ["A##", "C##", "D##", "E##", "G##"]],
    ["Abb", "minor-pentatonic", ["Abb", "Cbb", "Dbb", "Ebb", "Gbb"]],
  ] as const)("parses, constructs, and formats %s %s", (text, type, expected) => {
    const tonic = Object.freeze(parseNoteSpelling(text));
    const result = scaleNoteSpellings(tonic, type);
    expect(result.map((note) => formatNoteSpelling(note, "ascii"))).toEqual(expected);
    expect(result.map(pitchClassFromSpelling)).toEqual(scalePitchClasses(pitchClassFromSpelling(tonic), type));
    expect(formatNoteSpelling(tonic, "ascii")).toBe(text);
  });

  for (const [type, offsets, letterSteps] of collections) {
    test(`checks every supported tonic spelling and accidental boundary for ${type}`, () => {
      const naturals = [
        ["C", 0], ["D", 2], ["E", 4], ["F", 5], ["G", 7], ["A", 9], ["B", 11],
      ] as const;
      naturals.forEach(([letter, sourceNatural], sourceIndex) => {
        for (const accidental of [-2, -1, 0, 1, 2] as const) {
          const tonic = Object.freeze({ letter, accidental });
          const expected = offsets.map((offset, ordinalIndex) => {
            const targetIndex = sourceIndex + letterSteps[ordinalIndex]!;
            const [targetLetter, targetNatural] = naturals[targetIndex % 7]!;
            return {
              letter: targetLetter,
              accidental: sourceNatural + accidental + offset - targetNatural - (targetIndex >= 7 ? 12 : 0),
            };
          });
          if (expected.some((note) => note.accidental < -2 || note.accidental > 2)) {
            expect(() => scaleNoteSpellings(tonic, type)).toThrow(RangeError);
          } else {
            const result = scaleNoteSpellings(tonic, type);
            expect(result).toEqual(expected);
            expect(result).toHaveLength(5);
            expect(result.map(pitchClassFromSpelling)).toEqual(scalePitchClasses(pitchClassFromSpelling(tonic), type));
          }
          expect(tonic).toEqual({ letter, accidental });
        }
      });
    });
  }

  test.each([
    ["E##", "major-pentatonic"], ["Cbb", "minor-pentatonic"],
  ] as const)("rejects triple accidental requirements for %s %s", (text, type) => {
    const tonic = parseNoteSpelling(text);
    expect(() => scaleNoteSpellings(tonic, type)).toThrow("Transposition requires an accidental outside -2..2.");
    expect(() => scaleNoteSpellings(tonic, type)).toThrow(RangeError);
    expect(scalePitchClasses(pitchClassFromSpelling(tonic), type)).toHaveLength(5);
  });

  test.each(collections)("preserves input and isolates results for %s", (type) => {
    const tonic: NoteSpelling = Object.freeze({ letter: "C", accidental: 0 });
    const first = scaleNoteSpellings(tonic, type);
    const second = scaleNoteSpellings(tonic, type);
    expect(first).toEqual(second);
    expect(first).not.toBe(second);
    first.forEach((note, index) => {
      expect(note).not.toBe(tonic);
      expect(note).not.toBe(second[index]);
    });
    (first[0] as { accidental: number }).accidental = 1;
    expect(second[0]).toEqual(tonic);
    expect(scaleNoteSpellings(tonic, type)).toEqual(second);
    const firstClasses = scalePitchClasses(0, type);
    const secondClasses = scalePitchClasses(0, type);
    expect(firstClasses).not.toBe(secondClasses);
    (firstClasses as PitchClass[])[0] = 11;
    expect(secondClasses[0]).toBe(0);
    expect(scalePitchClasses(0, type)).toEqual(secondClasses);
    expect(tonic).toEqual({ letter: "C", accidental: 0 });
  });

  test("enharmonic tonics share classes while preserving distinct spellings", () => {
    for (const [type] of collections) {
      const sharp = scaleNoteSpellings(parseNoteSpelling("C#"), type);
      const flat = scaleNoteSpellings(parseNoteSpelling("Db"), type);
      expect(sharp).not.toEqual(flat);
      expect(sharp.map(pitchClassFromSpelling)).toEqual(flat.map(pitchClassFromSpelling));
    }
  });

  test("formats pentatonic accidentals through the existing Unicode formatter", () => {
    expect(scaleNoteSpellings(parseNoteSpelling("C"), "minor-pentatonic").map((note) => formatNoteSpelling(note)))
      .toEqual(["C", "E♭", "F", "G", "B♭"]);
  });
});

// Compile-time contracts stay unchanged; runtime checks enforce cardinality.
if (false) {
  const type: ScaleType = "major-pentatonic";
  const degree: ScaleDegree = 6;
  pitchClassAtScaleDegree(0, type, degree);
  scalePitchClasses(0, "minor-pentatonic");
  // @ts-expect-error A spelled tonic still requires explicit accidental information.
  scaleNoteSpellings({ letter: "C" }, type);
  // @ts-expect-error Degree 8 remains outside the common degree contract.
  pitchClassAtScaleDegree(0, type, 8);
  const notes = scaleNoteSpellings({ letter: "C", accidental: 0 }, type);
  // @ts-expect-error The result collection remains readonly.
  notes.push({ letter: "D", accidental: 0 });
  // @ts-expect-error Individual spellings remain readonly.
  notes[0]!.accidental = 1;
  const classes = scalePitchClasses(0, type);
  // @ts-expect-error Numeric results remain readonly.
  classes.push(0);
  // @ts-expect-error Callers still need to handle non-membership.
  const definiteDegree: ScaleDegree = scaleDegreeOfPitchClass(0, type, 1);
  void definiteDegree;
}
