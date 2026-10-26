import { describe, expect, test } from "vitest";
import {
  type PitchClassChordDescription, type SpelledChordDescription,
  createPitchClassChordDescription, createSpelledChordDescription,
  chordDescriptionPitchClasses, chordDescriptionNoteSpellings,
} from "../domain/music-theory/chords-symbols-and-realization/chord-descriptions.js";
import {
  type ChordFormula, chordPitchClasses, chordNoteSpellings, validateChordFormula,
} from "../domain/music-theory/chords-symbols-and-realization/chord-formulas.js";
import {
  type TriadQuality, triadFormula, triadPitchClasses, triadNoteSpellings,
} from "../domain/music-theory/chords-symbols-and-realization/triads.js";
import {
  type SeventhChordQuality, seventhChordFormula, seventhChordPitchClasses, seventhChordNoteSpellings,
} from "../domain/music-theory/chords-symbols-and-realization/seventh-chords.js";
import {
  type AddedToneChordQuality, addedToneChordFormula, addedToneChordPitchClasses, addedToneChordNoteSpellings,
} from "../domain/music-theory/chords-symbols-and-realization/added-tone-chords.js";
import {
  type ExtendedChordQuality, extendedChordFormula, extendedChordPitchClasses, extendedChordNoteSpellings,
} from "../domain/music-theory/chords-symbols-and-realization/extended-chords.js";
import {
  type NoteSpelling, type Accidental, pitchClassFromSpelling,
} from "../domain/music-theory/pitch-pitch-classes-and-spelling/note-spelling.js";
import { type PitchClass } from "../domain/music-theory/pitch-pitch-classes-and-spelling/pitch-class.js";
import { parseNoteSpelling } from "../domain/music-theory/pitch-pitch-classes-and-spelling/note-text.js";

const majorFormula: ChordFormula = Object.freeze([
  Object.freeze({ number: 1, alteration: 0 }),
  Object.freeze({ number: 3, alteration: 0 }),
  Object.freeze({ number: 5, alteration: 0 }),
]);
const c = Object.freeze(parseNoteSpelling("C"));
const majorNotes = ["C", "E", "G"].map(parseNoteSpelling);
const pitches: readonly PitchClass[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

test("missing or undefined bass means unspecified, not root position", () => {
  for (const description of [
    createPitchClassChordDescription(0, majorFormula),
    createPitchClassChordDescription(0, majorFormula, undefined),
    createSpelledChordDescription(c, majorFormula),
    createSpelledChordDescription(c, majorFormula, undefined),
  ]) {
    expect(Object.hasOwn(description, "bass")).toBe(false);
    expect(Object.keys(description).sort()).toEqual(["formula", "root"]);
    expect(description.formula).toEqual(majorFormula);
    expect(chordDescriptionPitchClasses(description)).toEqual([0, 4, 7]);
  }
});

test.each(pitches)("specified numeric bass %i never changes formula tones", (bass) => {
  const description = createPitchClassChordDescription(0, majorFormula, bass);
  expect(Object.hasOwn(description, "bass")).toBe(true);
  expect(description.bass).toBe(bass);
  expect(description.root).toBe(0);
  expect(description.formula).toEqual(majorFormula);
  expect(chordDescriptionPitchClasses(description)).toEqual([0, 4, 7]);
  expect(description.bass).toBe(bass);
});

test.each(["C", "E", "G", "F#", "Gb", "E#", "F", "Bbbb", "G###"])(
  "specified spelled bass %s remains separate, exactly spelled and unchanged", (text) => {
    const bass = Object.freeze(parseNoteSpelling(text));
    const description = createSpelledChordDescription(c, majorFormula, bass);
    const snapshot = structuredClone(description);
    expect(description.bass).toEqual(bass);
    expect(description.bass).not.toBe(bass);
    expect(chordDescriptionNoteSpellings(description)).toEqual(majorNotes);
    expect(chordDescriptionPitchClasses(description)).toEqual([0, 4, 7]);
    expect(description).toEqual(snapshot);
  });

test("compound, duplicate and enharmonic roles survive without root or third requirements", () => {
  const formula: ChordFormula = [
    { number: 9, alteration: 0 }, { number: 2, alteration: 0 },
    { number: 4, alteration: 1 }, { number: 5, alteration: -1 }, { number: 9, alteration: 0 },
  ];
  const description = createSpelledChordDescription(c, formula, parseNoteSpelling("A"));
  expect(description.formula).toEqual(formula);
  expect(chordDescriptionPitchClasses(description)).toEqual([2, 2, 6, 6, 2]);
  expect(chordDescriptionNoteSpellings(description)).toEqual(["D", "D", "F#", "Gb", "D"].map(parseNoteSpelling));
  expect(description.root).toEqual(c);
  const large: ChordFormula = [{ number: Number.MAX_SAFE_INTEGER, alteration: 3 }];
  expect(validateChordFormula(large)).toBeUndefined();
  expect(createPitchClassChordDescription(0, large).formula).toEqual(large);
  expect(createSpelledChordDescription(c, large).formula).toEqual(large);
});

test("creation preserves valid intent; only derived spelled tones impose representability limits", () => {
  const root = Object.freeze(parseNoteSpelling("G###"));
  const description = createSpelledChordDescription(root, seventhChordFormula("major-seventh"), c);
  expect(description.root).toEqual(root);
  expect(description.bass).toEqual(c);
  expect(chordDescriptionPitchClasses(description)).toEqual([10, 2, 5, 9]);
  expect(() => chordDescriptionNoteSpellings(description)).toThrow(RangeError);
  expect(description.formula).toEqual(seventhChordFormula("major-seventh"));
  // A nearby formula fits and is not rejected for an unrelated unavailable major seventh.
  expect(chordDescriptionNoteSpellings(createSpelledChordDescription(root, majorFormula)))
    .toEqual(["G###", "B###", "D###"].map(parseNoteSpelling));
});

test("factories copy mutable inputs and keep shared root/bass references independent", () => {
  const root = { letter: "C", accidental: 0 } as NoteSpelling;
  const formula = [{ number: 1, alteration: 0 }, { number: 3, alteration: 0 }] as ChordFormula;
  const first = createSpelledChordDescription(root, formula, root);
  const second = createSpelledChordDescription(root, formula, root);
  const numeric = createPitchClassChordDescription(0, formula, 0);
  (root as { accidental: number }).accidental = 1;
  (formula[0] as { number: number }).number = 9;
  expect(first.root).toEqual(c);
  expect(first.bass).toEqual(c);
  expect(first.formula).toEqual([{ number: 1, alteration: 0 }, { number: 3, alteration: 0 }]);
  expect(numeric.formula).toEqual(first.formula);
  expect(first.root).not.toBe(first.bass);
  expect(first.root).not.toBe(second.root);
  expect(first.bass).not.toBe(second.bass);
  expect(first.formula).not.toBe(second.formula);
  first.formula.forEach((role, index) => expect(role).not.toBe(second.formula[index]));
  (first.root as { accidental: number }).accidental = 2;
  (first.bass as { accidental: number }).accidental = -1;
  (first.formula[0] as { alteration: number }).alteration = 3;
  expect(second.root).toEqual(c);
  expect(second.bass).toEqual(c);
  expect(second.formula[0]).toEqual({ number: 1, alteration: 0 });
  expect(numeric.formula[0]).toEqual({ number: 1, alteration: 0 });
});

test("frozen inputs work, outputs remain unfrozen and each resolution returns fresh tones", () => {
  const description = Object.freeze(createSpelledChordDescription(c, majorFormula, c));
  Object.freeze(description.root);
  Object.freeze(description.bass);
  Object.freeze(description.formula);
  description.formula.forEach(Object.freeze);
  const snapshot = structuredClone(description);
  const notes = chordDescriptionNoteSpellings(description);
  const other = chordDescriptionNoteSpellings(description);
  const numeric = chordDescriptionPitchClasses(description);
  const numericDescription = createPitchClassChordDescription(0, majorFormula, 0);
  for (const object of [
    createSpelledChordDescription(c, majorFormula), numericDescription, numericDescription.formula,
    numericDescription.formula[0], notes, notes[0], numeric,
  ]) expect(Object.isFrozen(object)).toBe(false);
  expect(notes).not.toBe(other);
  notes.forEach((note, index) => {
    expect(note).not.toBe(other[index]);
    expect(note).not.toBe(description.root);
    expect(note).not.toBe(description.bass);
    (note as { accidental: number }).accidental = 3;
  });
  (notes as NoteSpelling[]).push(c);
  (numeric as PitchClass[])[0] = 11;
  expect(other).toEqual(majorNotes);
  expect(chordDescriptionPitchClasses(description)).toEqual([0, 4, 7]);
  expect(chordDescriptionNoteSpellings(description)).toEqual(majorNotes);
  expect(description).toEqual(snapshot);
});

const malformed: readonly unknown[] = [
  [], null, undefined, {}, "1 3 5", 1, new Array(1), [undefined], [null], [1], ["3"], [[]],
  [{}], [{ number: 3 }], [{ alteration: 0 }],
  ...[0, -1, 1.5, NaN, Infinity, -Infinity, Number.MAX_SAFE_INTEGER + 1, "9", null]
    .map((number) => [{ number, alteration: 0 }]),
  ...[-4, 4, 0.5, NaN, Infinity, undefined, "0", null].map((alteration) => [{ number: 9, alteration }]),
  [{ number: 1, alteration: 0 }, null],
];
test.each(malformed.map((formula) => [formula]))("rejects malformed formula %o throughout the shared path", (input) => {
  const formula = input as ChordFormula;
  for (const operation of [
    () => validateChordFormula(formula),
    () => createPitchClassChordDescription(0, formula),
    () => createSpelledChordDescription(c, formula),
    () => chordPitchClasses(0, formula),
    () => chordNoteSpellings(c, formula),
    () => chordDescriptionPitchClasses({ root: 0, formula }),
    () => chordDescriptionPitchClasses({ root: c, formula }),
    () => chordDescriptionNoteSpellings({ root: c, formula }),
  ]) expect(operation).toThrow(RangeError);
});

// These tests establish adapter equivalence; existing catalog suites retain independent musical oracles.
const naturals = ["C", "D", "E", "F", "G", "A", "B"] as const;
const alterations: readonly Accidental[] = [-3, -2, -1, 0, 1, 2, 3];
const roots = naturals.flatMap((letter) => alterations.map((accidental) => ({ letter, accidental })));
function verifyFamily<Q extends string>(
  label: string, qualities: readonly Q[], formulaFor: (quality: Q) => ChordFormula,
  numericFor: (root: PitchClass, quality: Q) => readonly PitchClass[],
  spelledFor: (root: NoteSpelling, quality: Q) => readonly NoteSpelling[],
): void {
  describe(label, () => {
    for (const quality of qualities) {
      test.each(pitches)(`${quality}: numeric root %i`, (root) => {
        const formula = formulaFor(quality);
        const description = createPitchClassChordDescription(root, formula, 6);
        const expected = chordPitchClasses(root, formula);
        expect(chordDescriptionPitchClasses(description)).toEqual(expected);
        expect(numericFor(root, quality)).toEqual(expected);
      });
      test.each(roots)(`${quality}: spelled root $letter ($accidental)`, (input) => {
        const root = Object.freeze({ ...input });
        const formula = formulaFor(quality);
        const description = createSpelledChordDescription(root, formula, c);
        const numeric = chordPitchClasses(pitchClassFromSpelling(root), formula);
        expect(chordDescriptionPitchClasses(description)).toEqual(numeric);
        let expected: readonly NoteSpelling[];
        try {
          expected = chordNoteSpellings(root, formula);
        } catch (error) {
          expect(error).toBeInstanceOf(RangeError);
          expect(() => chordDescriptionNoteSpellings(description)).toThrow(RangeError);
          expect(() => spelledFor(root, quality)).toThrow(RangeError);
          return;
        }
        expect(chordDescriptionNoteSpellings(description)).toEqual(expected);
        expect(spelledFor(root, quality)).toEqual(expected);
        expect(description.root).toEqual(input);
      });
    }
  });
}
const triadQualities: readonly TriadQuality[] = ["major", "minor", "diminished", "augmented", "sus2", "sus4"];
const seventhQualities: readonly SeventhChordQuality[] = [
  "major-seventh", "dominant-seventh", "minor-seventh", "half-diminished-seventh", "diminished-seventh",
  "minor-major-seventh", "augmented-major-seventh", "augmented-seventh", "dominant-seventh-sus2", "dominant-seventh-sus4",
];
const addedQualities: readonly AddedToneChordQuality[] = [
  "major-add2", "major-add9", "minor-add9", "major-add11", "major-sixth", "minor-sixth", "major-sixth-ninth",
];
const extendedQualities: readonly ExtendedChordQuality[] = [
  "dominant-ninth", "major-ninth", "minor-ninth", "dominant-eleventh", "major-eleventh", "minor-eleventh",
  "dominant-thirteenth", "major-thirteenth", "minor-thirteenth", "dominant-flat-ninth", "dominant-sharp-ninth",
  "dominant-sharp-eleventh", "dominant-flat-thirteenth", "major-sharp-eleventh",
];
verifyFamily("triads", triadQualities, triadFormula, triadPitchClasses, triadNoteSpellings);
verifyFamily("sevenths", seventhQualities, seventhChordFormula, seventhChordPitchClasses, seventhChordNoteSpellings);
verifyFamily("added tones", addedQualities, addedToneChordFormula, addedToneChordPitchClasses, addedToneChordNoteSpellings);
verifyFamily("extensions", extendedQualities, extendedChordFormula, extendedChordPitchClasses, extendedChordNoteSpellings);

if (false) {
  // @ts-expect-error Root is required.
  const missingRoot: PitchClassChordDescription = { formula: majorFormula };
  // @ts-expect-error Formula is required.
  const missingFormula: SpelledChordDescription = { root: c };
  // @ts-expect-error Numeric root must be a pitch class.
  createPitchClassChordDescription(12, majorFormula);
  // @ts-expect-error Numeric bass must be a pitch class.
  createPitchClassChordDescription(0, majorFormula, 12);
  // @ts-expect-error Numeric descriptions do not accept spelled basses.
  createPitchClassChordDescription(0, majorFormula, c);
  // @ts-expect-error Spelled bass must be a note spelling.
  createSpelledChordDescription(c, majorFormula, 4);
  // @ts-expect-error Spelled root must be parsed before construction.
  createSpelledChordDescription("C", majorFormula);
  // @ts-expect-error Numeric-only descriptions cannot request note spellings.
  chordDescriptionNoteSpellings(createPitchClassChordDescription(0, majorFormula));
  const spelled = createSpelledChordDescription(c, majorFormula, c);
  // @ts-expect-error Root property is readonly.
  spelled.root = c;
  // @ts-expect-error Root spelling is readonly.
  spelled.root.accidental = 1;
  // @ts-expect-error Bass property is readonly.
  spelled.bass = c;
  // @ts-expect-error Bass spelling is readonly.
  spelled.bass!.accidental = 1;
  // @ts-expect-error Formula roles are readonly.
  spelled.formula[0]!.number = 9;
  // @ts-expect-error Formula array is readonly.
  spelled.formula.push({ number: 9, alteration: 0 });
  // @ts-expect-error Result arrays are readonly.
  chordDescriptionPitchClasses(spelled).push(1);
  // @ts-expect-error Output spelling objects are readonly.
  chordDescriptionNoteSpellings(spelled)[0]!.accidental = 1;
}
