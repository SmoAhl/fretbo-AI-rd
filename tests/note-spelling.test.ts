import { describe, expect, test } from "vitest";
import {
  type Accidental,
  type NoteLetter,
  type NoteSpelling,
  pitchClassFromSpelling,
} from "../domain/music-theory/note-spelling.js";
import { type PitchClass, transposePitchClass } from "../domain/music-theory/pitch-class.js";

// Columns are double flat, flat, natural, sharp, and double sharp.
// Expected classes are written independently of the domain lookup/arithmetic.
const spellingCases: readonly [NoteLetter, readonly [PitchClass, PitchClass, PitchClass, PitchClass, PitchClass]][] = [
  ["C", [10, 11, 0, 1, 2]],
  ["D", [0, 1, 2, 3, 4]],
  ["E", [2, 3, 4, 5, 6]],
  ["F", [3, 4, 5, 6, 7]],
  ["G", [5, 6, 7, 8, 9]],
  ["A", [7, 8, 9, 10, 11]],
  ["B", [9, 10, 11, 0, 1]],
];
const accidentals = [-2, -1, 0, 1, 2] as const satisfies readonly Accidental[];

describe("pitchClassFromSpelling", () => {
  for (const [letter, expectedClasses] of spellingCases) {
    accidentals.forEach((accidental, index) => {
      test(`maps ${letter} with accidental ${accidental} to ${expectedClasses[index]}`, () => {
        expect(pitchClassFromSpelling({ letter, accidental })).toBe(expectedClasses[index]);
      });
    });
  }

  test.each([
    [{ letter: "C", accidental: 1 }, { letter: "D", accidental: -1 }, 1],
    [{ letter: "E", accidental: 1 }, { letter: "F", accidental: 0 }, 5],
    [{ letter: "C", accidental: 2 }, { letter: "D", accidental: 0 }, 2],
  ] as const)("recognizes enharmonic equivalence between %o and %o", (first, second, expected) => {
    expect(first).not.toEqual(second);
    expect(pitchClassFromSpelling(first)).toBe(expected);
    expect(pitchClassFromSpelling(second)).toBe(expected);
  });

  test("converts a frozen input without changing its spelling", () => {
    const note: NoteSpelling = Object.freeze({ letter: "C", accidental: -1 });

    expect(pitchClassFromSpelling(note)).toBe(11);
    expect(note).toEqual({ letter: "C", accidental: -1 });
  });

  test.each([
    [{ letter: "B", accidental: 1 }, -1, 11],
    [{ letter: "C", accidental: -1 }, 2, 1],
  ] as const)("composes conversion of %o with transposition by %i", (note, semitones, expected) => {
    expect(transposePitchClass(pitchClassFromSpelling(note), semitones)).toBe(expected);
  });
});

// Checked by npm run typecheck, never executed as unsupported runtime inputs.
if (false) {
  // @ts-expect-error Only uppercase letters A through G are supported.
  pitchClassFromSpelling({ letter: "H", accidental: 0 });
  // @ts-expect-error Lowercase letters are not part of the structured contract.
  pitchClassFromSpelling({ letter: "c", accidental: 0 });
  // @ts-expect-error Triple flats are outside the supported range.
  pitchClassFromSpelling({ letter: "C", accidental: -3 });
  // @ts-expect-error Triple sharps are outside the supported range.
  pitchClassFromSpelling({ letter: "C", accidental: 3 });
  // @ts-expect-error Fractional alterations are not supported.
  pitchClassFromSpelling({ letter: "C", accidental: 0.5 });
  // @ts-expect-error An explicit accidental is required, including for naturals.
  pitchClassFromSpelling({ letter: "C" });
  // @ts-expect-error The letter is required.
  pitchClassFromSpelling({ accidental: 0 });
}
