import { describe, expect, test } from "vitest";
import { parseChordSymbol, formatChordSymbol } from "../domain/music-theory/chords-symbols-and-realization/chord-symbols.js";
import {
  type SpelledChordDescription, createSpelledChordDescription, createPitchClassChordDescription,
  chordDescriptionNoteSpellings, chordDescriptionPitchClasses,
} from "../domain/music-theory/chords-symbols-and-realization/chord-descriptions.js";
import { type ChordFormula } from "../domain/music-theory/chords-symbols-and-realization/chord-formulas.js";
import { type Accidental } from "../domain/music-theory/pitch-pitch-classes-and-spelling/note-spelling.js";
import { type AccidentalNotation } from "../domain/music-theory/pitch-pitch-classes-and-spelling/note-text.js";

// Independent grammar and musical-role fixtures, not obtained from production suffix/catalog tables.
const fixtures = [
  ["", [[1, 0], [3, 0], [5, 0]]],
  ["m", [[1, 0], [3, -1], [5, 0]]],
  ["dim", [[1, 0], [3, -1], [5, -1]]],
  ["aug", [[1, 0], [3, 0], [5, 1]]],
  ["sus2", [[1, 0], [2, 0], [5, 0]]],
  ["sus4", [[1, 0], [4, 0], [5, 0]]],
  ["maj7", [[1, 0], [3, 0], [5, 0], [7, 0]]],
  ["7", [[1, 0], [3, 0], [5, 0], [7, -1]]],
  ["m7", [[1, 0], [3, -1], [5, 0], [7, -1]]],
  ["m7(b5)", [[1, 0], [3, -1], [5, -1], [7, -1]]],
  ["dim7", [[1, 0], [3, -1], [5, -1], [7, -2]]],
  ["m(maj7)", [[1, 0], [3, -1], [5, 0], [7, 0]]],
  ["aug(maj7)", [[1, 0], [3, 0], [5, 1], [7, 0]]],
  ["aug7", [[1, 0], [3, 0], [5, 1], [7, -1]]],
  ["7sus2", [[1, 0], [2, 0], [5, 0], [7, -1]]],
  ["7sus4", [[1, 0], [4, 0], [5, 0], [7, -1]]],
  ["add2", [[1, 0], [3, 0], [5, 0], [2, 0]]],
  ["add9", [[1, 0], [3, 0], [5, 0], [9, 0]]],
  ["madd9", [[1, 0], [3, -1], [5, 0], [9, 0]]],
  ["add11", [[1, 0], [3, 0], [5, 0], [11, 0]]],
  ["6", [[1, 0], [3, 0], [5, 0], [6, 0]]],
  ["m6", [[1, 0], [3, -1], [5, 0], [6, 0]]],
  ["6/9", [[1, 0], [3, 0], [5, 0], [6, 0], [9, 0]]],
  ["9", [[1, 0], [3, 0], [5, 0], [7, -1], [9, 0]]],
  ["maj9", [[1, 0], [3, 0], [5, 0], [7, 0], [9, 0]]],
  ["m9", [[1, 0], [3, -1], [5, 0], [7, -1], [9, 0]]],
  ["11", [[1, 0], [3, 0], [5, 0], [7, -1], [9, 0], [11, 0]]],
  ["maj11", [[1, 0], [3, 0], [5, 0], [7, 0], [9, 0], [11, 0]]],
  ["m11", [[1, 0], [3, -1], [5, 0], [7, -1], [9, 0], [11, 0]]],
  ["13", [[1, 0], [3, 0], [5, 0], [7, -1], [9, 0], [11, 0], [13, 0]]],
  ["maj13", [[1, 0], [3, 0], [5, 0], [7, 0], [9, 0], [11, 0], [13, 0]]],
  ["m13", [[1, 0], [3, -1], [5, 0], [7, -1], [9, 0], [11, 0], [13, 0]]],
  ["7(b9)", [[1, 0], [3, 0], [5, 0], [7, -1], [9, -1]]],
  ["7(#9)", [[1, 0], [3, 0], [5, 0], [7, -1], [9, 1]]],
  ["9(#11)", [[1, 0], [3, 0], [5, 0], [7, -1], [9, 0], [11, 1]]],
  ["13(b13)", [[1, 0], [3, 0], [5, 0], [7, -1], [9, 0], [11, 0], [13, -1]]],
  ["maj9(#11)", [[1, 0], [3, 0], [5, 0], [7, 0], [9, 0], [11, 1]]],
] as const satisfies readonly (readonly [string, readonly (readonly [number, Accidental])[]])[];

const letters = ["C", "D", "E", "F", "G", "A", "B"] as const;
const asciiAccidentals = ["bbb", "bb", "b", "", "#", "##", "###"] as const;
const unicodeAccidentals = ["♭𝄫", "𝄫", "♭", "", "♯", "𝄪", "♯𝄪"] as const;
const spellings = letters.flatMap((letter) => asciiAccidentals.map((token, index) => ({
  note: { letter, accidental: (index - 3) as Accidental },
  ascii: letter + token, unicode: letter + unicodeAccidentals[index],
})));
const notations = ["ascii", "unicode"] as const;
const formulaFrom = (roles: readonly (readonly [number, Accidental])[]): ChordFormula =>
  roles.map(([number, alteration]) => ({ number, alteration }));
const unicodeSuffix = (suffix: string) => suffix.replaceAll("b", "♭").replaceAll("#", "♯");

for (const [suffix, roles] of fixtures) {
  describe(`canonical suffix ${suffix || "(major)"}`, () => {
    test.each(spellings)("root $ascii in both notations, with absent or explicit root bass", (spelling) => {
      const formula = formulaFrom(roles);
      for (const notation of notations) {
        const symbol = spelling[notation] + (notation === "ascii" ? suffix : unicodeSuffix(suffix));
        const description = parseChordSymbol(symbol);
        expect(description).toEqual({ root: spelling.note, formula });
        expect(Object.hasOwn(description, "bass")).toBe(false);
        expect(formatChordSymbol(description, notation)).toBe(symbol);
        expect(formatChordSymbol(description)).toBe(spelling.unicode + unicodeSuffix(suffix));
        expect(parseChordSymbol(formatChordSymbol(description, notation))).toEqual(description);
        const withBass = createSpelledChordDescription(spelling.note, formula, spelling.note);
        expect(formatChordSymbol(withBass, notation)).toBe(symbol + "/" + spelling[notation]);
        expect(parseChordSymbol(formatChordSymbol(withBass, notation))).toEqual(withBass);
      }
    });
  });
}

const aliases = [
  ["sus", "sus4"], ["7sus", "7sus4"], ["°", "dim"], ["°7", "dim7"],
  ["ø7", "m7(b5)"], ["7(#5)", "aug7"],
] as const;
for (const [alias, canonical] of aliases) {
  test.each(spellings)(`${alias} normalizes to ${canonical} at $ascii`, (spelling) => {
    const roles = fixtures.find(([suffix]) => suffix === canonical)![1];
    for (const notation of notations) {
      const symbol = spelling[notation] + (notation === "ascii" ? alias : unicodeSuffix(alias)) + "/" + spelling[notation];
      const result = parseChordSymbol(symbol);
      expect(result).toEqual({ root: spelling.note, formula: formulaFrom(roles), bass: spelling.note });
      expect(formatChordSymbol(result, notation)).toBe(spelling[notation]
        + (notation === "ascii" ? canonical : unicodeSuffix(canonical)) + "/" + spelling[notation]);
    }
  });
}

test.each(spellings)("bass $ascii with representative roots/suffixes in both notations", (bass) => {
  const roots = [
    { ascii: "C", unicode: "C", note: { letter: "C", accidental: 0 } },
    { ascii: "Bb", unicode: "B♭", note: { letter: "B", accidental: -1 } },
    { ascii: "F##", unicode: "F𝄪", note: { letter: "F", accidental: 2 } },
  ] as const;
  for (const root of roots) {
    for (const suffix of ["", "6/9", "7(b9)", "aug(maj7)"]) {
      const roles = fixtures.find(([candidate]) => candidate === suffix)![1];
      for (const notation of notations) {
        const symbol = root[notation] + (notation === "ascii" ? suffix : unicodeSuffix(suffix)) + "/" + bass[notation];
        const description = parseChordSymbol(symbol);
        expect(description).toEqual({ root: root.note, formula: formulaFrom(roles), bass: bass.note });
        expect(formatChordSymbol(description, notation)).toBe(symbol);
        expect(parseChordSymbol(formatChordSymbol(description, notation))).toEqual(description);
      }
    }
  }
});

test.each([
  ["C6/9", "6/9", undefined], ["C6/9/E", "6/9", "E"],
  ["C6/E", "6", "E"], ["C/E", "", "E"], ["C/C", "", "C"],
] as const)("distinguishes sixth-ninth suffix and slash bass: %s", (symbol, suffix, bassLetter) => {
  const description = parseChordSymbol(symbol);
  expect(description.formula).toEqual(formulaFrom(fixtures.find(([candidate]) => candidate === suffix)![1]));
  expect(description.bass).toEqual(bassLetter === undefined ? undefined : { letter: bassLetter, accidental: 0 });
  expect(formatChordSymbol(description, "ascii")).toBe(symbol);
});

test.each([
  [" \tC♮maj7/E♮\n", "Cmaj7/E"], ["C#7(♭9)/Gb", "C♯7(♭9)/G♭"],
  ["C♭9", "C♭9"], ["Cbb9", "C𝄫9"], ["C#9", "C♯9"],
  ["D7(♯5)/F#", "Daug7/F♯"], ["Cø7/Gb", "Cm7(♭5)/G♭"],
])("normalizes tokens without losing spelling: %s", (input, expected) => {
  expect(formatChordSymbol(parseChordSymbol(input))).toBe(expected);
});

test("added second and ninth stay distinct despite sounding equivalence", () => {
  const second = parseChordSymbol("Cadd2");
  const ninth = parseChordSymbol("Cadd9");
  expect(chordDescriptionPitchClasses(second)).toEqual(chordDescriptionPitchClasses(ninth));
  expect(second.formula).not.toEqual(ninth.formula);
  expect(formatChordSymbol(second)).toBe("Cadd2");
  expect(formatChordSymbol(ninth)).toBe("Cadd9");
});

test("unrepresentable derived spellings do not block parsing or formatting", () => {
  const description = parseChordSymbol("G###maj7/F#");
  expect(formatChordSymbol(description)).toBe("G♯𝄪maj7/F♯");
  expect(formatChordSymbol(description, "ascii")).toBe("G###maj7/F#");
  expect(chordDescriptionPitchClasses(description)).toEqual([10, 2, 5, 9]);
  expect(() => chordDescriptionNoteSpellings(description)).toThrow(RangeError);
  expect(description.bass).toEqual({ letter: "F", accidental: 1 });
});

test("parsed descriptions are independent, unfrozen and contain only musical fields", () => {
  const first = parseChordSymbol("C/C");
  const second = parseChordSymbol("C/C");
  expect(Object.keys(first).sort()).toEqual(["bass", "formula", "root"]);
  for (const object of [first, first.root, first.bass, first.formula, ...first.formula]) {
    expect(Object.isFrozen(object)).toBe(false);
  }
  expect(first.root).not.toBe(first.bass);
  expect(first.root).not.toBe(second.root);
  expect(first.bass).not.toBe(second.bass);
  first.formula.forEach((role, index) => expect(role).not.toBe(second.formula[index]));
  (first.root as { accidental: number }).accidental = 1;
  (first.bass as { accidental: number }).accidental = -1;
  (first.formula[0] as { number: number }).number = 9;
  expect(formatChordSymbol(second)).toBe("C/C");
  expect(parseChordSymbol("C/C")).toEqual(second);
});

test("formatting preserves frozen inputs and exact specified bass", () => {
  const description = parseChordSymbol("F#9(#11)/Gb");
  const snapshot = structuredClone(description);
  Object.freeze(description);
  Object.freeze(description.root);
  Object.freeze(description.bass);
  Object.freeze(description.formula);
  description.formula.forEach(Object.freeze);
  expect(formatChordSymbol(description)).toBe("F♯9(♯11)/G♭");
  expect(formatChordSymbol(description, "ascii")).toBe("F#9(#11)/Gb");
  expect(description).toEqual(snapshot);
});

test.each([
  "", " ", "H", "c", "c7", "CmIN", "Cmin", "C-", "C+", "CM7", "CΔ7", "Cmaj", "CMAJ7", "CSus4", "CØ7",
  "C5", "C4", "C0", "C-1", "C+4", "C07", "C7.0", "C7b9", "C7#9", "C7(#11)", "Cmaj7(#11)",
  "C11(#11)", "Cmaj11(#11)", "C7(b9,#9)", "C7(b9)(#9)", "Cm7b5", "C7(bb9)", "C7(𝄫9)",
  "C7(b♭9)", "C7(#♯9)", "C7(♮9)", "C7(♭#9)", "C7((b9))", "C7(b9", "C7b9)", "C7()", "C7(b09)",
  "C####", "Cbbbb", "C#b7", "C♯♯7", "C♭♭7", "C♯♯♯7", "C𝄪♯7", "C𝄫♭7", "C#𝄪7", "Cx7", "C♮#7",
  "C/", "C6/", "C6/9/", "C6//9", "C/E/G", "C//E", "C6/9/E/G", "C6/9/9", "C/9", "/C",
  "C/E4", "C/c", "C/H", "C/E#b", "C/E####", "C/♮E", "C7/E♯♯", "C/B𝄫♭",
  "C m7", "Cm 7", "C7( b9)", "C7(b9 )", "C /E", "C/ E", "C6/ 9", "C\t7", "C\nE", "C\u00a07",
  "C7 trailing", "C7x", "C7\0", "C|G", "I", "V7", "C(no3)", "Calt", "C69",
])("rejects unsupported or malformed symbol %j", (symbol) => {
  expect(() => parseChordSymbol(symbol)).toThrow(SyntaxError);
});

test.each([
  [[5, 0], [3, 0], [1, 0]], // Same tones, reordered.
  [[1, 0], [3, 0], [5, 0], [1, 0]], // Duplicate role.
  [[1, 0], [10, 0], [5, 0]], // Compound third is not catalog role 3.
  [[1, 0], [4, -1], [5, 0]], // Enharmonic replacement of E with F-flat.
  [[1, 0], [5, 0]], // Unsupported power-chord formula.
  [[1, 0], [3, 0], [5, 0], [7, -1], [11, 1]], // Sharp eleventh without catalog ninth.
] as const)("rejects valid unmatched custom formula %j", (...roles) => {
  const formula = formulaFrom(roles);
  const description = createSpelledChordDescription({ letter: "C", accidental: 0 }, formula);
  expect(() => formatChordSymbol(description)).toThrow(RangeError);
});

const malformed: readonly unknown[] = [
  [], null, undefined, {}, new Array(1), [undefined], [null], [{}],
  [{ number: 0, alteration: 0 }], [{ number: Infinity, alteration: 0 }],
  [{ number: Number.MAX_SAFE_INTEGER + 1, alteration: 0 }], [{ number: 1, alteration: 4 }],
  [{ number: 1, alteration: NaN }], [{ number: 1, alteration: 0 }, null],
];
test.each(malformed.map((formula) => [formula]))("rejects malformed formatting formula %o", (formula) => {
  expect(() => formatChordSymbol({ root: { letter: "C", accidental: 0 }, formula: formula as ChordFormula }))
    .toThrow(RangeError);
});
test.each(["ASCII", "flat", "", null, 1])("rejects invalid output notation %j", (notation) => {
  expect(() => formatChordSymbol(parseChordSymbol("C"), notation as AccidentalNotation)).toThrow(RangeError);
});

if (false) {
  // @ts-expect-error Text is required.
  parseChordSymbol();
  // @ts-expect-error Numeric descriptions require a separate explicit spelling choice.
  formatChordSymbol(createPitchClassChordDescription(0, [{ number: 1, alteration: 0 }]));
  // @ts-expect-error No spelling policy or accidental notation is inferred from arbitrary text.
  formatChordSymbol(parseChordSymbol("C"), "sharps");
  const result: SpelledChordDescription = parseChordSymbol("C/E");
  // @ts-expect-error Parsed spellings are readonly.
  result.root.accidental = 1;
  // @ts-expect-error Parsed formula roles are readonly.
  result.formula[0]!.number = 9;
  // @ts-expect-error Parsed bass spellings are readonly.
  result.bass!.accidental = -1;
}
