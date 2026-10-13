import { describe, expect, test } from "vitest";
import { formatDegreeFormula, parseDegreeFormula } from "../domain/music-theory/degree-text.js";
import { type DegreeFormula, noteSpellingFromDegreeFormula, pitchClassFromDegreeFormula } from "../domain/music-theory/degrees.js";
import { type Accidental } from "../domain/music-theory/note-spelling.js";
import { formatNoteSpelling, parseNoteSpelling, type AccidentalNotation } from "../domain/music-theory/note-text.js";
import { type ScaleDegree } from "../domain/music-theory/scales.js";

const prefixes = [
  ["", 0], ["♮", 0], ["b", -1], ["♭", -1], ["bb", -2], ["♭♭", -2], ["𝄫", -2],
  ["bbb", -3], ["♭♭♭", -3], ["♭𝄫", -3], ["###", 3], ["♯♯♯", 3], ["♯𝄪", 3],
  ["#", 1], ["♯", 1], ["##", 2], ["♯♯", 2], ["𝄪", 2],
] as const;
const numbers: readonly ScaleDegree[] = [1, 2, 3, 4, 5, 6, 7];
const canonical = [[-3, "bbb", "♭♭♭"], [3, "###", "♯♯♯"], [-2, "bb", "♭♭"], [-1, "b", "♭"], [0, "", ""], [1, "#", "♯"], [2, "##", "♯♯"]] as const;

describe("degree formula text", () => {
  for (const [prefix, alteration] of prefixes) {
    test.each(numbers)(`parses ${prefix} with degree %i`, (number) => {
      const formula = { number, alteration };
      expect(parseDegreeFormula(`${prefix}${number}`)).toEqual(formula);
      expect(parseDegreeFormula(` \t${prefix}00${number}\r\n `)).toEqual(formula);
    });
  }

  for (const [alteration, ascii, unicode] of canonical) {
    test.each(numbers)(`formats and round-trips alteration ${alteration}, degree %i`, (number) => {
      const formula = Object.freeze({ number, alteration });
      expect(formatDegreeFormula(formula, "ascii")).toBe(`${ascii}${number}`);
      expect(formatDegreeFormula(formula, "unicode")).toBe(`${unicode}${number}`);
      expect(formatDegreeFormula(formula)).toBe(`${unicode}${number}`);
      for (const notation of ["ascii", "unicode"] as const) {
        expect(parseDegreeFormula(formatDegreeFormula(formula, notation))).toEqual(formula);
      }
      expect(formula).toEqual({ number, alteration });
    });
  }

  test.each([
    "", " ", "3b", "b 3", "b#3", "#b3", "bbbb3", "####3", "𝄪♯3", "𝄫♭3", "#𝄪3", "b𝄫3", "♭♯3", "♭b3", "#♯3",
    "♭♭♭♭3", "♯♯♯♯3", "𝄫𝄫3", "♮♭3", "x4", "B3", "flat 3", "third", "3rd", "C b3",
    "-1", "+3", "3.0", "1e0", "0x3", "٣", "３", "3 4", "1,b3,5", "b3 up", "b\n3", "♮ 3",
  ])("rejects malformed text %j with SyntaxError", (text) => {
    expect(() => parseDegreeFormula(text)).toThrow(SyntaxError);
  });

  test.each(["0", "00", "8", "b9", "#13", "𝄫0008", "9999999999999999999999999999999999", "9".repeat(400)])(
    "rejects unsupported numeric degree %s with RangeError", (text) => {
      expect(() => parseDegreeFormula(text)).toThrow(RangeError);
    });

  test.each([
    { number: 0, alteration: 0 }, { number: 8, alteration: 0 }, { number: 1.5, alteration: 0 },
    { number: NaN, alteration: 0 }, { number: Infinity, alteration: 0 },
    { number: 3, alteration: -4 }, { number: 3, alteration: 4 }, { number: 3, alteration: 0.5 },
    { number: 3, alteration: NaN }, { number: 3, alteration: Infinity },
    { alteration: 0 }, { number: 3 },
  ])("formatting validates formula %o", (formula) => {
    expect(() => formatDegreeFormula(formula as DegreeFormula)).toThrow(RangeError);
  });

  test.each(["other", "ASCII", "Unicode", "", null])("rejects unsupported notation %s", (notation) => {
    expect(() => formatDegreeFormula({ number: 3, alteration: 0 }, notation as AccidentalNotation)).toThrow(RangeError);
  });

  test("parsed formulas produce independent objects", () => {
    const first = parseDegreeFormula("b3");
    const second = parseDegreeFormula("b3");
    expect(first).not.toBe(second);
    expect(Object.isFrozen(first)).toBe(false);
    (first as { alteration: Accidental }).alteration = 1;
    expect(second).toEqual({ number: 3, alteration: -1 });
  });

  test.each([
    ["C", "♭3", "Eb", 3], ["C", "#4", "F#", 6], ["C", "b5", "Gb", 6],
    ["F#", "7", "E#", 5], ["B##", "b03", "D##", 4], ["C", "𝄫7", "Bbb", 9],
  ] as const)("parse/resolve/format %s plus %s", (tonic, text, expected, pitch) => {
    const formula = parseDegreeFormula(text);
    expect(formatNoteSpelling(noteSpellingFromDegreeFormula(parseNoteSpelling(tonic), formula), "ascii")).toBe(expected);
    const numericTonics = { C: 0, "F#": 6, "B##": 1 } as const;
    expect(pitchClassFromDegreeFormula(numericTonics[tonic], formula)).toBe(pitch);
  });
});

if (false) {
  // @ts-expect-error Parsing requires text.
  parseDegreeFormula(3);
  // @ts-expect-error Only the existing accidental notations are supported.
  formatDegreeFormula({ number: 3, alteration: 0 }, "compact");
  // @ts-expect-error Parsed formulas are readonly.
  parseDegreeFormula("b3").alteration = 0;
}
