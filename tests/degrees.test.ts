import { describe, expect, test } from "vitest";
import {
  type DegreeCollection,
  type DegreeFormula,
  collectionDegreeOfPitchClass,
  degreeFormulaAtOrdinal,
  degreeFormulas,
  noteSpellingAtCollectionDegree,
  noteSpellingFromDegreeFormula,
  pitchClassAtCollectionDegree,
  pitchClassFromDegreeFormula,
} from "../domain/music-theory/degrees-keys-and-spelling/degrees.js";
import { type MinorModeParent, minorModeNoteSpellings } from "../domain/music-theory/scales-and-modes/minor-modes.js";
import { type Accidental, type NoteSpelling, pitchClassFromSpelling } from "../domain/music-theory/pitch-pitch-classes-and-spelling/note-spelling.js";
import { formatNoteSpelling, parseNoteSpelling } from "../domain/music-theory/pitch-pitch-classes-and-spelling/note-text.js";
import { type PitchClass } from "../domain/music-theory/pitch-pitch-classes-and-spelling/pitch-class.js";
import {
  type ScaleDegree, type ScaleType,
  pitchClassAtScaleDegree, scaleDegreeOfPitchClass, scaleNoteSpellings,
} from "../domain/music-theory/scales-and-modes/scales.js";

const naturals = [["C", 0], ["D", 2], ["E", 4], ["F", 5], ["G", 7], ["A", 9], ["B", 11]] as const;
const alterations = [-3, -2, -1, 0, 1, 2, 3] as const;
const tonics: readonly PitchClass[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const formulas: readonly DegreeFormula[] = [1, 2, 3, 4, 5, 6, 7].flatMap((number) =>
  alterations.map((alteration) => ({ number: number as ScaleDegree, alteration })));

// Independent natural coordinates specify expected letters and sounding displacements.
function expectedSpelling(sourceIndex: number, sourceAccidental: number, formula: DegreeFormula) {
  const targetIndex = sourceIndex + formula.number - 1;
  const [letter, natural] = naturals[targetIndex % 7]!;
  const target = naturals[sourceIndex]![1] + sourceAccidental + naturals[formula.number - 1]![1] + formula.alteration;
  return { letter, accidental: target - natural - 12 * Math.floor(targetIndex / 7) };
}

describe("degree formula conversion", () => {
  for (const formula of formulas) {
    test.each(tonics)(`number ${formula.number}, alteration ${formula.alteration}, tonic %i`, (tonic) => {
      const displacement = naturals[formula.number - 1]![1] + formula.alteration;
      expect(pitchClassFromDegreeFormula(tonic, Object.freeze(formula))).toBe(((tonic + displacement) % 12 + 12) % 12);
    });

    test(`all 49 tonic spellings for number ${formula.number}, alteration ${formula.alteration}`, () => {
      for (const [index, [letter]] of naturals.entries()) {
        for (const accidental of alterations) {
          const tonic = Object.freeze({ letter, accidental });
          const expected = expectedSpelling(index, accidental, formula);
          const numeric = pitchClassFromDegreeFormula(pitchClassFromSpelling(tonic), formula);
          if (Math.abs(expected.accidental) > 3) {
            expect(() => noteSpellingFromDegreeFormula(tonic, formula)).toThrow(RangeError);
          } else {
            const result = noteSpellingFromDegreeFormula(tonic, formula);
            expect(result).toEqual(expected);
            expect(pitchClassFromSpelling(result)).toBe(numeric);
          }
          expect(tonic).toEqual({ letter, accidental });
        }
      }
    });
  }

  test.each([
    ["C", { number: 3, alteration: -1 }, "Eb", 3],
    ["C", { number: 4, alteration: 1 }, "F#", 6],
    ["C", { number: 5, alteration: -1 }, "Gb", 6],
    ["F#", { number: 7, alteration: 0 }, "E#", 5],
    ["B##", { number: 3, alteration: -1 }, "D##", 4],
    ["C", { number: 1, alteration: -2 }, "Cbb", 10],
    ["C", { number: 4, alteration: 2 }, "F##", 7],
  ] as const)("%s plus %o preserves %s", (text, formula, spelling, pitch) => {
    const tonic = parseNoteSpelling(text);
    expect(formatNoteSpelling(noteSpellingFromDegreeFormula(tonic, formula), "ascii")).toBe(spelling);
    expect(pitchClassFromDegreeFormula(pitchClassFromSpelling(tonic), formula)).toBe(pitch);
  });

  test("returns independent note objects and preserves frozen formula inputs", () => {
    const tonic = Object.freeze(parseNoteSpelling("F#"));
    const formula = Object.freeze({ number: 7, alteration: 0 } as const);
    const first = noteSpellingFromDegreeFormula(tonic, formula);
    const second = noteSpellingFromDegreeFormula(tonic, formula);
    expect(first).not.toBe(second);
    expect(Object.isFrozen(first)).toBe(false);
    (first as { accidental: Accidental }).accidental = -2;
    expect(second).toEqual({ letter: "E", accidental: 1 });
    expect(tonic).toEqual({ letter: "F", accidental: 1 });
    expect(formula).toEqual({ number: 7, alteration: 0 });
  });

  test.each([0, -1, 8, 1.5, NaN, Infinity, -Infinity, Number.MAX_SAFE_INTEGER, undefined])(
    "rejects invalid formula number %s", (number) => {
      const formula = { number, alteration: 0 } as DegreeFormula;
      expect(() => pitchClassFromDegreeFormula(0, formula)).toThrow(RangeError);
      expect(() => noteSpellingFromDegreeFormula({ letter: "C", accidental: 0 }, formula)).toThrow(RangeError);
    });

  test.each([-4, 4, 0.5, NaN, Infinity, -Infinity, Number.MAX_SAFE_INTEGER, undefined])(
    "rejects invalid formula alteration %s", (alteration) => {
      const formula = { number: 3, alteration } as DegreeFormula;
      expect(() => pitchClassFromDegreeFormula(0, formula)).toThrow(RangeError);
      expect(() => noteSpellingFromDegreeFormula({ letter: "C", accidental: 0 }, formula)).toThrow(RangeError);
    });
});

const sevenRoles = [1, 2, 3, 4, 5, 6, 7] as const;
const namedFixtures = {
  major: { offsets: [0, 2, 4, 5, 7, 9, 11], roles: sevenRoles },
  "major-pentatonic": { offsets: [0, 2, 4, 7, 9], roles: [1, 2, 3, 5, 6] },
  "minor-pentatonic": { offsets: [0, 3, 5, 7, 10], roles: [1, 3, 4, 5, 7] },
  "natural-minor": { offsets: [0, 2, 3, 5, 7, 8, 10], roles: sevenRoles },
  "harmonic-minor": { offsets: [0, 2, 3, 5, 7, 8, 11], roles: sevenRoles },
  "melodic-minor-ascending": { offsets: [0, 2, 3, 5, 7, 9, 11], roles: sevenRoles },
  ionian: { offsets: [0, 2, 4, 5, 7, 9, 11], roles: sevenRoles },
  dorian: { offsets: [0, 2, 3, 5, 7, 9, 10], roles: sevenRoles },
  phrygian: { offsets: [0, 1, 3, 5, 7, 8, 10], roles: sevenRoles },
  lydian: { offsets: [0, 2, 4, 6, 7, 9, 11], roles: sevenRoles },
  mixolydian: { offsets: [0, 2, 4, 5, 7, 9, 10], roles: sevenRoles },
  aeolian: { offsets: [0, 2, 3, 5, 7, 8, 10], roles: sevenRoles },
  locrian: { offsets: [0, 1, 3, 5, 6, 8, 10], roles: sevenRoles },
} as const satisfies Readonly<Record<ScaleType, { offsets: readonly number[]; roles: readonly ScaleDegree[] }>>;
// Independent mode offsets retain a diminished seventh as role 7, rather than respelling it as 6.
const minorFixtures = [
  ["harmonic-minor", 1, [0, 2, 3, 5, 7, 8, 11]],
  ["harmonic-minor", 2, [0, 1, 3, 5, 6, 9, 10]],
  ["harmonic-minor", 3, [0, 2, 4, 5, 8, 9, 11]],
  ["harmonic-minor", 4, [0, 2, 3, 6, 7, 9, 10]],
  ["harmonic-minor", 5, [0, 1, 4, 5, 7, 8, 10]],
  ["harmonic-minor", 6, [0, 3, 4, 6, 7, 9, 11]],
  ["harmonic-minor", 7, [0, 1, 3, 4, 6, 8, 9]],
  ["melodic-minor-ascending", 1, [0, 2, 3, 5, 7, 9, 11]],
  ["melodic-minor-ascending", 2, [0, 1, 3, 5, 7, 9, 10]],
  ["melodic-minor-ascending", 3, [0, 2, 4, 6, 8, 9, 11]],
  ["melodic-minor-ascending", 4, [0, 2, 4, 6, 7, 9, 10]],
  ["melodic-minor-ascending", 5, [0, 2, 4, 5, 7, 8, 10]],
  ["melodic-minor-ascending", 6, [0, 2, 3, 5, 6, 8, 10]],
  ["melodic-minor-ascending", 7, [0, 1, 3, 4, 6, 8, 10]],
] as const satisfies readonly (readonly [MinorModeParent, ScaleDegree, readonly number[]])[];
type CollectionFixture = Readonly<{
  name: string;
  collection: DegreeCollection;
  offsets: readonly number[];
  roles: readonly ScaleDegree[];
}>;
const collections: readonly CollectionFixture[] = [
  ...Object.entries(namedFixtures).map(([name, fixture]) => ({ name, collection: name as ScaleType, ...fixture })),
  ...minorFixtures.map(([parent, degree, offsets]) => ({
    name: `${parent} rotation ${degree}`, collection: Object.freeze({ parent, degree }), offsets, roles: sevenRoles,
  })),
];

describe("shared collection degree queries", () => {
  for (const { name, collection, offsets, roles } of collections) {
    const expectedFormulas: readonly DegreeFormula[] = roles.map((number, index) => ({
      number, alteration: (offsets[index]! - naturals[number - 1]![1]) as Accidental,
    }));

    test(`${name} formulas preserve ordered roles`, () => {
      expect(degreeFormulas(collection)).toEqual(expectedFormulas);
      for (const [index, formula] of expectedFormulas.entries()) {
        expect(degreeFormulaAtOrdinal(collection, (index + 1) as ScaleDegree)).toEqual(formula);
      }
    });

    test.each(tonics)(`${name} numeric queries at tonic %i`, (tonic) => {
      const expectedPitches = offsets.map((offset) => (tonic + offset) % 12);
      for (const [index, pitch] of expectedPitches.entries()) {
        const ordinal = (index + 1) as ScaleDegree;
        expect(pitchClassAtCollectionDegree(tonic, collection, ordinal)).toBe(pitch);
        if (typeof collection === "string") {
          expect(pitchClassAtScaleDegree(tonic, collection, ordinal)).toBe(pitch);
        }
      }
      for (const candidate of tonics) {
        const index = expectedPitches.indexOf(candidate);
        const result = collectionDegreeOfPitchClass(tonic, collection, candidate);
        expect(result).toEqual(index === -1 ? undefined : { ordinal: index + 1, formula: expectedFormulas[index] });
        if (typeof collection === "string") {
          expect(scaleDegreeOfPitchClass(tonic, collection, candidate)).toBe(result?.ordinal);
        }
      }
    });

    test(`${name} queries at all 49 tonic spellings`, () => {
      for (const [sourceIndex, [letter]] of naturals.entries()) {
        for (const accidental of alterations) {
          const tonic = Object.freeze({ letter, accidental });
          const expected = expectedFormulas.map((formula) => expectedSpelling(sourceIndex, accidental, formula));
          for (const [index, note] of expected.entries()) {
            const ordinal = (index + 1) as ScaleDegree;
            if (Math.abs(note.accidental) > 3) {
              expect(() => noteSpellingAtCollectionDegree(tonic, collection, ordinal)).toThrow(RangeError);
            } else {
              const result = noteSpellingAtCollectionDegree(tonic, collection, ordinal);
              expect(result).toEqual(note);
              expect(pitchClassFromSpelling(result)).toBe((pitchClassFromSpelling(tonic) + offsets[index]!) % 12);
            }
          }
          if (expected.every((note) => Math.abs(note.accidental) <= 3)) {
            const constructed = typeof collection === "string"
              ? scaleNoteSpellings(tonic, collection) : minorModeNoteSpellings(tonic, collection);
            expect(constructed).toEqual(expected);
          }
          expect(tonic).toEqual({ letter, accidental });
        }
      }
    });
  }

  test.each([
    ["minor-pentatonic", 2, { number: 3, alteration: -1 }, "Eb"],
    ["major-pentatonic", 4, { number: 5, alteration: 0 }, "G"],
    [{ parent: "harmonic-minor", degree: 7 }, 7, { number: 7, alteration: -2 }, "Bbb"],
  ] as const)("C %o ordinal %i has formula %o and spelling %s", (collection, ordinal, formula, text) => {
    expect(degreeFormulaAtOrdinal(collection, ordinal)).toEqual(formula);
    expect(formatNoteSpelling(noteSpellingAtCollectionDegree(parseNoteSpelling("C"), collection, ordinal), "ascii")).toBe(text);
  });

  test("mode rotation and queried ordinal are separate; the tonic is the mode tonic", () => {
    const harmonic = Object.freeze({ parent: "harmonic-minor", degree: 2 } as const);
    const melodic = Object.freeze({ parent: "melodic-minor-ascending", degree: 2 } as const);
    const tonic = Object.freeze(parseNoteSpelling("D"));
    expect(degreeFormulaAtOrdinal(harmonic, 5)).toEqual({ number: 5, alteration: -1 });
    expect(degreeFormulaAtOrdinal(melodic, 5)).toEqual({ number: 5, alteration: 0 });
    expect(formatNoteSpelling(noteSpellingAtCollectionDegree(tonic, harmonic, 5), "ascii")).toBe("Ab");
    expect(formatNoteSpelling(noteSpellingAtCollectionDegree(tonic, melodic, 5), "ascii")).toBe("A");
    expect(harmonic).toEqual({ parent: "harmonic-minor", degree: 2 });
    expect(melodic).toEqual({ parent: "melodic-minor-ascending", degree: 2 });
  });

  test("membership reports the collection role even for an enharmonic pitch match", () => {
    const mode = { parent: "harmonic-minor", degree: 7 } as const;
    expect(collectionDegreeOfPitchClass(0, mode, pitchClassFromSpelling(parseNoteSpelling("A"))))
      .toEqual({ ordinal: 7, formula: { number: 7, alteration: -2 } });
    expect(collectionDegreeOfPitchClass(0, "major", 3)).toBeUndefined();
  });

  test("spells the selected member even when unrelated collection members need quadruple accidentals", () => {
    const tonic = Object.freeze(parseNoteSpelling("B###"));
    expect(() => scaleNoteSpellings(tonic, "major")).toThrow(RangeError);
    expect(noteSpellingAtCollectionDegree(tonic, "major", 1)).toEqual(tonic);
    expect(formatNoteSpelling(noteSpellingAtCollectionDegree(tonic, "major", 4), "ascii")).toBe("E###");
    expect(() => noteSpellingAtCollectionDegree(tonic, "major", 3)).toThrow(RangeError);
    expect(pitchClassAtCollectionDegree(2, "major", 3)).toBe(6);
  });

  test("arrays, formulas, membership results, and spellings are independent between calls", () => {
    const first = degreeFormulas("minor-pentatonic");
    const second = degreeFormulas("minor-pentatonic");
    expect(first).not.toBe(second);
    expect(first[1]).not.toBe(second[1]);
    expect(Object.isFrozen(first)).toBe(false);
    (first[1] as { alteration: Accidental }).alteration = 1;
    expect(second[1]).toEqual({ number: 3, alteration: -1 });
    const atOrdinal = degreeFormulaAtOrdinal("minor-pentatonic", 2);
    (atOrdinal as { alteration: Accidental }).alteration = 1;
    expect(degreeFormulaAtOrdinal("minor-pentatonic", 2)).toEqual({ number: 3, alteration: -1 });
    const match = collectionDegreeOfPitchClass(0, "minor-pentatonic", 3)!;
    const otherMatch = collectionDegreeOfPitchClass(0, "minor-pentatonic", 3)!;
    expect(match).not.toBe(otherMatch);
    expect(match.formula).not.toBe(otherMatch.formula);
    (match.formula as { alteration: Accidental }).alteration = 1;
    expect(otherMatch).toEqual({ ordinal: 2, formula: { number: 3, alteration: -1 } });
    const tonic = Object.freeze(parseNoteSpelling("C"));
    const note = noteSpellingAtCollectionDegree(tonic, "major", 1);
    expect(note).not.toBe(tonic);
    expect(note).not.toBe(noteSpellingAtCollectionDegree(tonic, "major", 1));
  });

  test.each([0, -1, 8, 1.5, NaN, Infinity, -Infinity, Number.MAX_SAFE_INTEGER, undefined])(
    "rejects invalid ordinal %s", (value) => {
      for (const collection of ["major", "minor-pentatonic", { parent: "harmonic-minor", degree: 2 }] as const) {
        const ordinal = value as ScaleDegree;
        expect(() => degreeFormulaAtOrdinal(collection, ordinal)).toThrow(RangeError);
        expect(() => pitchClassAtCollectionDegree(0, collection, ordinal)).toThrow(RangeError);
        expect(() => noteSpellingAtCollectionDegree(parseNoteSpelling("C"), collection, ordinal)).toThrow(RangeError);
      }
    });

  test.each(["major-pentatonic", "minor-pentatonic"] as const)("%s ordinals 6/7 remain invalid", (collection) => {
    for (const ordinal of [6, 7] as const) {
      expect(() => degreeFormulaAtOrdinal(collection, ordinal)).toThrow(RangeError);
      expect(() => pitchClassAtCollectionDegree(0, collection, ordinal)).toThrow(RangeError);
      expect(() => noteSpellingAtCollectionDegree(parseNoteSpelling("C"), collection, ordinal)).toThrow(RangeError);
      expect(() => pitchClassAtScaleDegree(0, collection, ordinal)).toThrow(RangeError);
    }
  });

  test.each([
    "minor", "melodic-minor", "chromatic", "toString", "constructor", "__proto__",
    { parent: "major", degree: 1 }, { parent: "harmonic-minor", degree: 0 },
    { parent: "harmonic-minor", degree: 8 }, { parent: "melodic-minor-ascending", degree: 1.5 },
    { parent: "harmonic-minor", degree: NaN }, { parent: "harmonic-minor", degree: Infinity },
    { parent: "harmonic-minor" }, { degree: 1 }, {},
  ])("rejects unsupported collection %o consistently", (value) => {
    const collection = value as DegreeCollection;
    expect(() => degreeFormulas(collection)).toThrow(RangeError);
    expect(() => degreeFormulaAtOrdinal(collection, 1)).toThrow(RangeError);
    expect(() => pitchClassAtCollectionDegree(0, collection, 1)).toThrow(RangeError);
    expect(() => noteSpellingAtCollectionDegree(parseNoteSpelling("C"), collection, 1)).toThrow(RangeError);
    expect(() => collectionDegreeOfPitchClass(0, collection, 0)).toThrow(RangeError);
  });
});

if (false) {
  // @ts-expect-error A formula alteration is required even for an unaltered role.
  pitchClassFromDegreeFormula(0, { number: 3 });
  // @ts-expect-error A formula number is required.
  pitchClassFromDegreeFormula(0, { alteration: 0 });
  // @ts-expect-error Compound formulas are deferred.
  pitchClassFromDegreeFormula(0, { number: 9, alteration: -1 });
  // @ts-expect-error Alterations are limited to -3..3.
  pitchClassFromDegreeFormula(0, { number: 3, alteration: 4 });
  // @ts-expect-error Numeric conversion takes a pitch class, not a spelling.
  pitchClassFromDegreeFormula({ letter: "C", accidental: 0 }, { number: 3, alteration: 0 });
  // @ts-expect-error Spelled conversion requires a spelling, not text.
  noteSpellingFromDegreeFormula("C", { number: 3, alteration: 0 });
  const formula: DegreeFormula = { number: 3, alteration: 0 };
  // @ts-expect-error Formulas are readonly.
  formula.number = 4;
  const spelling: NoteSpelling = noteSpellingFromDegreeFormula({ letter: "C", accidental: 0 }, formula);
  // @ts-expect-error Output spellings are readonly.
  spelling.accidental = 1;
  // @ts-expect-error Text aliases do not identify a structured minor-derived mode.
  degreeFormulas("harmonic minor mode 2");
  // @ts-expect-error The minor-derived mode rotation is required.
  degreeFormulas({ parent: "harmonic-minor" });
  // @ts-expect-error Ordinal position remains a number rather than a formula.
  pitchClassAtCollectionDegree(0, "major", { number: 3, alteration: -1 });
  // @ts-expect-error Degree arrays are readonly.
  degreeFormulas("major").push({ number: 1, alteration: 0 });
  // @ts-expect-error Queried formulas are readonly.
  degreeFormulaAtOrdinal("major", 1).alteration = 1;
  const result = collectionDegreeOfPitchClass(0, "major", 0);
  if (result) {
    // @ts-expect-error Membership results are readonly.
    result.ordinal = 2;
    // @ts-expect-error Membership formula roles are readonly.
    result.formula.number = 2;
  }
  // @ts-expect-error Membership accepts numeric pitch classes, not spelling objects.
  collectionDegreeOfPitchClass(0, "major", { letter: "C", accidental: 0 });
}
