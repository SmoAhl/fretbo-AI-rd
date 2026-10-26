import { describe, expect, test } from "vitest";
import { type ChordDegreeFormula, type ChordFormula, chordNoteSpellings, chordPitchClasses } from "../domain/music-theory/chords-symbols-and-realization/chord-formulas.js";
import { type Accidental, type NoteSpelling, pitchClassFromSpelling } from "../domain/music-theory/pitch-pitch-classes-and-spelling/note-spelling.js";
import { parseNoteSpelling, formatNoteSpelling } from "../domain/music-theory/pitch-pitch-classes-and-spelling/note-text.js";
import { type PitchClass } from "../domain/music-theory/pitch-pitch-classes-and-spelling/pitch-class.js";

// Independent reference offsets and letters, not production normalization or degree conversion.
const roles = [
  [1, 0, "C"], [2, 2, "D"], [3, 4, "E"], [4, 5, "F"],
  [5, 7, "G"], [6, 9, "A"], [7, 11, "B"], [8, 0, "C"],
  [9, 2, "D"], [10, 4, "E"], [11, 5, "F"], [12, 7, "G"],
  [13, 9, "A"], [15, 0, "C"], [Number.MAX_SAFE_INTEGER, 4, "E"],
] as const;
const alterations = [-3, -2, -1, 0, 1, 2, 3] as const;
const naturals = [["C", 0], ["D", 2], ["E", 4], ["F", 5], ["G", 7], ["A", 9], ["B", 11]] as const;
const wrap = (pitch: number) => ((pitch % 12 + 12) % 12) as PitchClass;

describe("chord formula resolution", () => {
  for (const [number, offset, letter] of roles) {
    test.each(alterations)(`role ${number} alteration %i`, (alteration) => {
      const formula = Object.freeze([Object.freeze({ number, alteration })]);
      for (let root = 0; root < 12; root++) {
        expect(chordPitchClasses(root as PitchClass, formula)).toEqual([wrap(root + offset + alteration)]);
      }
      expect(chordNoteSpellings({ letter: "C", accidental: 0 }, formula)).toEqual([{ letter, accidental: alteration }]);
      expect(formula).toEqual([{ number, alteration }]);
    });
  }

  test("all simple roles and alterations preserve exact spelling across all 49 roots", () => {
    const offsets = [0, 2, 4, 5, 7, 9, 11];
    for (const [rootIndex, [letter, natural]] of naturals.entries()) {
      for (const accidental of alterations) {
        const root = Object.freeze({ letter, accidental });
        for (let step = 0; step < 7; step++) {
          for (const alteration of alterations) {
            const formula = [{ number: step + 1, alteration }];
            const index = rootIndex + step;
            const [targetLetter, targetNatural] = naturals[index % 7]!;
            const targetAccidental = natural + accidental + offsets[step]! + alteration
              - targetNatural - 12 * Math.floor(index / 7);
            expect(chordPitchClasses(wrap(natural + accidental), formula))
              .toEqual([wrap(natural + accidental + offsets[step]! + alteration)]);
            if (Math.abs(targetAccidental) > 3) {
              expect(() => chordNoteSpellings(root, formula)).toThrow(RangeError);
            } else {
              expect(chordNoteSpellings(root, formula)).toEqual([{ letter: targetLetter, accidental: targetAccidental }]);
            }
          }
        }
      }
    }
  });

  test("simple and compound roles remain distinct without imposing octave placement", () => {
    const formula = [2, 9, 4, 11, 6, 13].map((number) => Object.freeze({ number, alteration: 0 as const }));
    Object.freeze(formula);
    expect(chordPitchClasses(0, formula)).toEqual([2, 2, 5, 5, 9, 9]);
    expect(chordNoteSpellings(parseNoteSpelling("C"), formula).map((note) => formatNoteSpelling(note)))
      .toEqual(["D", "D", "F", "F", "A", "A"]);
    expect(formula.map((role) => role.number)).toEqual([2, 9, 4, 11, 6, 13]);
  });

  test("altered extensions retain exact letters", () => {
    const formula: ChordFormula = [
      { number: 9, alteration: -1 }, { number: 9, alteration: 1 },
      { number: 11, alteration: 1 }, { number: 13, alteration: -1 },
    ];
    expect(chordPitchClasses(0, formula)).toEqual([1, 3, 6, 8]);
    expect(chordNoteSpellings(parseNoteSpelling("C"), formula).map((note) => formatNoteSpelling(note)))
      .toEqual(["D♭", "D♯", "F♯", "A♭"]);
  });

  test("preserves rootless, thirdless, reordered and duplicate roles and enharmonic collisions", () => {
    const formula: ChordFormula = [
      { number: 5, alteration: 0 }, { number: 4, alteration: 1 },
      { number: 5, alteration: -1 }, { number: 5, alteration: 0 },
    ];
    expect(chordPitchClasses(11, formula)).toEqual([6, 5, 5, 6]);
    const notes = chordNoteSpellings(parseNoteSpelling("C"), formula);
    expect(notes.map((note) => formatNoteSpelling(note))).toEqual(["G", "F♯", "G♭", "G"]);
    expect(notes[0]).not.toBe(notes[3]);
    expect(chordPitchClasses(0, [{ number: 4, alteration: 0 }])).toEqual([5]);
  });

  test("only final accidentals constrain spelling and never constrain numeric construction", () => {
    expect(chordNoteSpellings(parseNoteSpelling("B##"), [{ number: 10, alteration: -1 }]))
      .toEqual([parseNoteSpelling("D##")]);
    expect(chordNoteSpellings(parseNoteSpelling("G##"), [{ number: 12, alteration: 1 }]))
      .toEqual([parseNoteSpelling("D###")]);
    for (const [rootText, number, alteration] of [["G###", 12, 1], ["Cbbb", 9, -1]] as const) {
      const root = Object.freeze(parseNoteSpelling(rootText));
      const formula = [{ number, alteration }];
      expect(chordPitchClasses(pitchClassFromSpelling(root), formula)).toHaveLength(1);
      expect(() => chordNoteSpellings(root, formula)).toThrow(RangeError);
      expect(root).toEqual(parseNoteSpelling(rootText));
    }
  });

  test("returns independent arrays and spellings without freezing outputs", () => {
    const root = Object.freeze(parseNoteSpelling("F#"));
    const formula = Object.freeze([Object.freeze({ number: 1, alteration: 0 as const }), Object.freeze({ number: 9, alteration: 0 as const })]);
    const pitches = chordPitchClasses(6, formula);
    const notes = chordNoteSpellings(root, formula);
    const other = chordNoteSpellings(root, formula);
    expect(notes).not.toBe(other);
    expect(Object.isFrozen(notes)).toBe(false);
    notes.forEach((note, index) => {
      expect(note).not.toBe(root);
      expect(note).not.toBe(other[index]);
      expect(Object.isFrozen(note)).toBe(false);
      (note as { accidental: Accidental }).accidental = -3;
    });
    (notes as NoteSpelling[]).push(parseNoteSpelling("C"));
    (pitches as PitchClass[])[0] = 0;
    expect(chordPitchClasses(6, formula)).toEqual([6, 8]);
    expect(other).toEqual([parseNoteSpelling("F#"), parseNoteSpelling("G#")]);
    expect(chordNoteSpellings(root, formula)).toEqual(other);
    expect(formula).toEqual([{ number: 1, alteration: 0 }, { number: 9, alteration: 0 }]);
  });
});

const invalidFormulas: readonly unknown[] = [
  [], null, undefined, {}, "1 3 5", 1, new Array(1), [undefined], [null], [1], ["3"], [[]],
  [{}], [{ number: 3 }], [{ alteration: 0 }],
  ...[0, -1, 1.5, NaN, Infinity, -Infinity, Number.MAX_SAFE_INTEGER + 1, "9", null].map((number) => [{ number, alteration: 0 }]),
  ...[-4, 4, 0.5, NaN, Infinity, undefined, "0", null].map((alteration) => [{ number: 9, alteration }]),
  [{ number: 1, alteration: 0 }, null],
];
test.each(invalidFormulas.map((formula) => [formula]))("rejects malformed formula %o in both resolvers", (formula) => {
  expect(() => chordPitchClasses(0, formula as ChordFormula)).toThrow(RangeError);
  expect(() => chordNoteSpellings(parseNoteSpelling("C"), formula as ChordFormula)).toThrow(RangeError);
});

if (false) {
  const formula: ChordFormula = [{ number: 9, alteration: 0 }];
  // @ts-expect-error Formula roles are readonly.
  formula[0]!.number = 2;
  // @ts-expect-error Formula arrays are readonly.
  formula.push({ number: 1, alteration: 0 });
  // @ts-expect-error Alterations retain the existing limit.
  const bad: ChordDegreeFormula = { number: 9, alteration: 4 };
  // @ts-expect-error Formula number is required.
  const missing: ChordDegreeFormula = { alteration: 0 };
  // @ts-expect-error Numeric roots are pitch classes.
  chordPitchClasses(12, formula);
  // @ts-expect-error Note text must be parsed.
  chordNoteSpellings("C", formula);
  // @ts-expect-error A formula is required.
  chordPitchClasses(0);
  // @ts-expect-error Pitch arrays are readonly.
  chordPitchClasses(0, formula)[0] = 1;
  // @ts-expect-error Output spelling objects are readonly.
  chordNoteSpellings({ letter: "C", accidental: 0 }, formula)[0]!.accidental = 1;
}
