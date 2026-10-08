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

// Expected offsets and closing steps are independent of the domain's interval definitions.
const referencePatterns = [
  ["major", [0, 2, 4, 5, 7, 9, 11], [2, 2, 1, 2, 2, 2, 1]],
  ["natural-minor", [0, 2, 3, 5, 7, 8, 10], [2, 1, 2, 2, 1, 2, 2]],
  ["harmonic-minor", [0, 2, 3, 5, 7, 8, 11], [2, 1, 2, 2, 1, 3, 1]],
  ["melodic-minor-ascending", [0, 2, 3, 5, 7, 9, 11], [2, 1, 2, 2, 2, 2, 1]],
  ["ionian", [0, 2, 4, 5, 7, 9, 11], [2, 2, 1, 2, 2, 2, 1]],
  ["dorian", [0, 2, 3, 5, 7, 9, 10], [2, 1, 2, 2, 2, 1, 2]],
  ["phrygian", [0, 1, 3, 5, 7, 8, 10], [1, 2, 2, 2, 1, 2, 2]],
  ["lydian", [0, 2, 4, 6, 7, 9, 11], [2, 2, 2, 1, 2, 2, 1]],
  ["mixolydian", [0, 2, 4, 5, 7, 9, 10], [2, 2, 1, 2, 2, 1, 2]],
  ["aeolian", [0, 2, 3, 5, 7, 8, 10], [2, 1, 2, 2, 1, 2, 2]],
  ["locrian", [0, 1, 3, 5, 6, 8, 10], [1, 2, 2, 1, 2, 2, 2]],
] as const satisfies readonly (readonly [ScaleType, readonly number[], readonly number[]])[];
const pitchClasses: readonly PitchClass[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

describe("scalePitchClasses", () => {
  for (const [type, offsets, steps] of referencePatterns) {
    test.each(pitchClasses)(`constructs ${type} at tonic %i`, (tonic) => {
      const result = scalePitchClasses(tonic, type);
      expect(result).toEqual(offsets.map((offset) => (tonic + offset) % 12));
      expect(result).toHaveLength(7);
      expect(result[0]).toBe(tonic);
      expect(new Set(result).size).toBe(7);
      expect(result.map((pitch, index) => {
        const next = result[(index + 1) % 7]!;
        return (next - pitch + 12) % 12;
      })).toEqual(steps);
    });
  }

  test("major modes match rotations of the major steps", () => {
    const majorSteps = [2, 2, 1, 2, 2, 2, 1];
    const modes = ["ionian", "dorian", "phrygian", "lydian", "mixolydian", "aeolian", "locrian"] as const;
    modes.forEach((mode, rotation) => {
      const rotated = [...majorSteps.slice(rotation), ...majorSteps.slice(0, rotation)];
      let offset = 0;
      const expected = rotated.map((step) => {
        const degree = offset;
        offset += step;
        return degree;
      });
      expect(offset).toBe(12);
      expect(scalePitchClasses(0, mode)).toEqual(expected);
    });
  });

  test.each(pitchClasses)("preserves equivalent named collections at tonic %i", (tonic) => {
    expect(scalePitchClasses(tonic, "major")).toEqual(scalePitchClasses(tonic, "ionian"));
    expect(scalePitchClasses(tonic, "natural-minor")).toEqual(scalePitchClasses(tonic, "aeolian"));
  });

  test("C major and D Dorian share membership with different degree ordering", () => {
    const major = scalePitchClasses(0, "major");
    const dorian = scalePitchClasses(2, "dorian");
    expect(dorian).toEqual([2, 4, 5, 7, 9, 11, 0]);
    expect(dorian).not.toEqual(major);
    expect(new Set(dorian)).toEqual(new Set(major));
  });

  test("returns independent arrays, including for shared patterns", () => {
    const first = scalePitchClasses(0, "major");
    const second = scalePitchClasses(0, "major");
    expect(first).not.toBe(second);
    (first as PitchClass[])[0] = 11;
    expect(second).toEqual([0, 2, 4, 5, 7, 9, 11]);
    expect(scalePitchClasses(0, "ionian")).toEqual(second);
  });

  test.each(["minor", "melodic-minor", "pentatonic", "MAJOR", "toString", "constructor", "__proto__"])(
    "rejects unsupported runtime scale type %s", (type) => {
      expect(() => scalePitchClasses(0, type as ScaleType)).toThrow(RangeError);
    },
  );
});

describe("scaleNoteSpellings", () => {
  test.each([
    ["C", "major", ["C", "D", "E", "F", "G", "A", "B"]],
    ["F#", "major", ["F#", "G#", "A#", "B", "C#", "D#", "E#"]],
    ["Cb", "major", ["Cb", "Db", "Eb", "Fb", "Gb", "Ab", "Bb"]],
    ["C#", "major", ["C#", "D#", "E#", "F#", "G#", "A#", "B#"]],
    ["C", "natural-minor", ["C", "D", "Eb", "F", "G", "Ab", "Bb"]],
    ["C", "harmonic-minor", ["C", "D", "Eb", "F", "G", "Ab", "B"]],
    ["C", "melodic-minor-ascending", ["C", "D", "Eb", "F", "G", "A", "B"]],
    ["D", "dorian", ["D", "E", "F", "G", "A", "B", "C"]],
    ["C", "lydian", ["C", "D", "E", "F#", "G", "A", "B"]],
    ["C", "locrian", ["C", "Db", "Eb", "F", "Gb", "Ab", "Bb"]],
    ["G#", "harmonic-minor", ["G#", "A#", "B", "C#", "D#", "E", "F##"]],
    ["Cbb", "major", ["Cbb", "Dbb", "Ebb", "Fbb", "Gbb", "Abb", "Bbb"]],
    ["C##", "major", ["C##", "D##", "E##", "F##", "G##", "A##", "B##"]],
    ["F##", "major", ["F##", "G##", "A##", "B#", "C##", "D##", "E##"]],
  ] as const)("parses, constructs, and formats %s %s", (text, type, expected) => {
    const tonic = parseNoteSpelling(text);
    const result = scaleNoteSpellings(tonic, type);
    expect(result.map((note) => formatNoteSpelling(note, "ascii"))).toEqual(expected);
    expect(result.map(pitchClassFromSpelling)).toEqual(scalePitchClasses(pitchClassFromSpelling(tonic), type));
  });

  for (const [type] of referencePatterns) {
    test.each(["C", "D", "E", "F", "G", "A", "B"] as const)(
      `spells ${type} from natural tonic %s with seven successive letters`, (letter) => {
        const tonic = { letter, accidental: 0 } as const;
        const result = scaleNoteSpellings(tonic, type);
        const letters = ["C", "D", "E", "F", "G", "A", "B"];
        const start = letters.indexOf(letter);
        expect(result.map((note) => note.letter)).toEqual(
          letters.map((_, index) => letters[(start + index) % 7]),
        );
        expect(result.map(pitchClassFromSpelling)).toEqual(scalePitchClasses(pitchClassFromSpelling(tonic), type));
      },
    );
  }

  for (const [type, offsets] of referencePatterns) {
    test(`checks all 35 tonic spellings against independent ${type} offsets`, () => {
      const naturals = [
        ["C", 0], ["D", 2], ["E", 4], ["F", 5], ["G", 7], ["A", 9], ["B", 11],
      ] as const;
      naturals.forEach(([letter, sourceNatural], sourceIndex) => {
        for (const accidental of [-2, -1, 0, 1, 2] as const) {
          const tonic = Object.freeze({ letter, accidental });
          const expected = offsets.map((offset, degreeIndex) => {
            const targetIndex = sourceIndex + degreeIndex;
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
            expect(result.map(pitchClassFromSpelling)).toEqual(scalePitchClasses(pitchClassFromSpelling(tonic), type));
          }
        }
      });
    });
  }

  test.each([
    ["C##", "lydian"],
    ["Cbb", "locrian"],
    ["G##", "major"],
    ["G##", "harmonic-minor"],
  ] as const)("rejects %s %s when a triple accidental is required", (text, type) => {
    const tonic = Object.freeze(parseNoteSpelling(text));
    expect(() => scaleNoteSpellings(tonic, type)).toThrow("Transposition requires an accidental outside -2..2.");
    expect(() => scaleNoteSpellings(tonic, type)).toThrow(RangeError);
    // Numeric construction remains available without a spelling limit.
    expect(scalePitchClasses(pitchClassFromSpelling(tonic), type)).toHaveLength(7);
    expect(formatNoteSpelling(tonic, "ascii")).toBe(text);
  });

  test("enharmonic tonics share classes while retaining different degree spellings", () => {
    const sharp = scaleNoteSpellings(parseNoteSpelling("C#"), "major");
    const flat = scaleNoteSpellings(parseNoteSpelling("Db"), "major");
    expect(sharp).not.toEqual(flat);
    expect(sharp.map(pitchClassFromSpelling)).toEqual(flat.map(pitchClassFromSpelling));
    expect(sharp[2]).toEqual({ letter: "E", accidental: 1 });
    expect(flat[2]).toEqual({ letter: "F", accidental: 0 });
  });

  test("preserves a frozen tonic and returns independent arrays and objects", () => {
    const tonic = Object.freeze({ letter: "C", accidental: 0 } as const);
    const first = scaleNoteSpellings(tonic, "major");
    const second = scaleNoteSpellings(tonic, "ionian");
    expect(first).toEqual(second);
    expect(first).not.toBe(second);
    first.forEach((note, index) => {
      expect(note).not.toBe(second[index]);
      expect(note).not.toBe(tonic);
    });
    (first[0] as { letter: string; accidental: number }).accidental = 1;
    expect(second[0]).toEqual(tonic);
    expect(tonic).toEqual({ letter: "C", accidental: 0 });
    expect(scaleNoteSpellings(tonic, "major")).toEqual(second);
  });

  test("formats Unicode through the existing note formatter", () => {
    expect(scaleNoteSpellings(parseNoteSpelling("F♯"), "major").map((note) => formatNoteSpelling(note)))
      .toEqual(["F♯", "G♯", "A♯", "B", "C♯", "D♯", "E♯"]);
  });

  test("rejects unknown types before transposition", () => {
    const tonic: NoteSpelling = Object.freeze({ letter: "C", accidental: 0 });
    expect(() => scaleNoteSpellings(tonic, "melodic-minor" as ScaleType)).toThrow(RangeError);
    expect(() => scaleNoteSpellings(tonic, "constructor" as ScaleType)).toThrow(RangeError);
  });
});

describe("scale degree queries", () => {
  for (const [type, offsets] of referencePatterns) {
    test.each(pitchClasses)(`retrieves degrees and checks all candidate classes for ${type} at %i`, (tonic) => {
      const expected = offsets.map((offset) => (tonic + offset) % 12);
      expected.forEach((pitch, index) => {
        const degree = (index + 1) as ScaleDegree;
        expect(pitchClassAtScaleDegree(tonic, type, degree)).toBe(pitch);
        expect(scaleDegreeOfPitchClass(tonic, type, pitch as PitchClass)).toBe(degree);
      });
      for (const candidate of pitchClasses) {
        const index = expected.indexOf(candidate);
        expect(scaleDegreeOfPitchClass(tonic, type, candidate)).toBe(index === -1 ? undefined : index + 1);
      }
    });
  }

  test("uses ordinal scale degrees rather than major-relative alterations", () => {
    expect(pitchClassAtScaleDegree(0, "natural-minor", 3)).toBe(3);
    expect(scaleDegreeOfPitchClass(0, "natural-minor", pitchClassFromSpelling(parseNoteSpelling("Eb")))).toBe(3);
    expect(scaleDegreeOfPitchClass(0, "major", 3)).toBeUndefined();
    expect(scaleDegreeOfPitchClass(0, "major", 0)).toBe(1);
    expect(scaleDegreeOfPitchClass(2, "dorian", 0)).toBe(7);
  });

  test.each([0, -1, 8, 1.5, NaN, Infinity, -Infinity, Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER])(
    "rejects invalid runtime ordinal %s", (degree) => {
      expect(() => pitchClassAtScaleDegree(0, "major", degree as ScaleDegree)).toThrow(RangeError);
    },
  );

  test.each(["minor", "melodic-minor", "pentatonic", "toString", "constructor", "__proto__"])(
    "both queries reject unsupported runtime type %s", (type) => {
      expect(() => pitchClassAtScaleDegree(0, type as ScaleType, 1)).toThrow(RangeError);
      expect(() => scaleDegreeOfPitchClass(0, type as ScaleType, 0)).toThrow(RangeError);
    },
  );
});

// Type checks complement behavior tests; unsupported inputs below are never executed.
if (false) {
  // @ts-expect-error A tonic and an explicit scale type are required.
  scalePitchClasses(0);
  // @ts-expect-error Numeric construction accepts a PitchClass, not note text.
  scalePitchClasses("C", "major");
  // @ts-expect-error Only the explicitly named melodic-minor collection is supported.
  scalePitchClasses(0, "melodic-minor");
  // @ts-expect-error Spelled construction requires an explicit NoteSpelling.
  scaleNoteSpellings(0, "major");
  // @ts-expect-error An accidental remains required, including for naturals.
  scaleNoteSpellings({ letter: "C" }, "major");
  // @ts-expect-error The repeated octave is not an ordinal degree of this collection.
  pitchClassAtScaleDegree(0, "major", 8);
  // @ts-expect-error Degrees do not wrap below the tonic.
  pitchClassAtScaleDegree(0, "major", 0);
  // @ts-expect-error Membership takes a pitch class, not a spelling object.
  scaleDegreeOfPitchClass(0, "major", { letter: "C", accidental: 0 });
  const classes = scalePitchClasses(0, "major");
  // @ts-expect-error Construction returns a readonly collection.
  classes.push(0);
  const notes = scaleNoteSpellings({ letter: "C", accidental: 0 }, "major");
  // @ts-expect-error Spelled construction returns a readonly collection.
  notes.push({ letter: "C", accidental: 0 });
  // @ts-expect-error Individual note spellings are readonly.
  notes[0]!.accidental = 1;
  // @ts-expect-error Non-membership must be handled by the caller.
  const definiteDegree: ScaleDegree = scaleDegreeOfPitchClass(0, "major", 1);
  void definiteDegree;
}
