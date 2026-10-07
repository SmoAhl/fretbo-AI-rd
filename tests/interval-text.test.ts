import { describe, expect, test } from "vitest";
import { parseSpelledInterval } from "../domain/music-theory/interval-text.js";
import { formatRegisteredNote, parseRegisteredNote } from "../domain/music-theory/note-text.js";
import {
  type IntervalQuality,
  transposeRegisteredNote,
  validateSpelledInterval,
} from "../domain/music-theory/spelled-transposition.js";

describe("parseSpelledInterval", () => {
  test.each([
    ["P5 up", 5, "perfect", "up"], ["M3 down", 3, "major", "down"],
    ["m3 up", 3, "minor", "up"], ["A4 down", 4, "augmented", "down"],
    ["d5 up", 5, "diminished", "up"], ["P8 down", 8, "perfect", "down"],
    ["M9 up", 9, "major", "up"], ["m13 down", 13, "minor", "down"],
    ["major 16 up", 16, "major", "up"], ["perfect 22 down", 22, "perfect", "down"],
    ["augmented 15 up", 15, "augmented", "up"], ["diminished 8 down", 8, "diminished", "down"],
    ["  MiNoR\tTHIRD \n DOWN  ", 3, "minor", "down"],
    ["M3 UP", 3, "major", "up"], ["M003 up", 3, "major", "up"],
  ] as const)("parses %s", (text, number, quality, direction) => {
    expect(parseSpelledInterval(text)).toEqual({ number, quality, direction });
  });

  test.each([
    ["unison", 1, "perfect"], ["second", 2, "major"], ["third", 3, "minor"],
    ["fourth", 4, "perfect"], ["fifth", 5, "diminished"], ["sixth", 6, "major"],
    ["seventh", 7, "minor"], ["octave", 8, "perfect"], ["ninth", 9, "major"],
    ["tenth", 10, "minor"], ["eleventh", 11, "augmented"], ["twelfth", 12, "perfect"],
    ["thirteenth", 13, "minor"], ["fourteenth", 14, "major"], ["fifteenth", 15, "perfect"],
  ] as const)("accepts named %s", (name, number, quality) => {
    for (const direction of ["up", "down"] as const) {
      expect(parseSpelledInterval(`${quality} ${name} ${direction}`)).toEqual({ number, quality, direction });
    }
  });

  test("keeps major and minor compact symbols distinct", () => {
    expect(parseSpelledInterval("M3 up").quality).toBe("major");
    expect(parseSpelledInterval("m3 up").quality).toBe("minor");
  });

  test.each([
    "", " ", "m3", "minor third", "minor third sideways", "up m3", "3 up",
    "p5 up", "a4 up", "D5 up", "MM3 up", "M 3 up", "m3up",
    "m-3 down", "M+3 up", "M3.5 up", "M3e2 up", "minor -3 down", "minor 3rd up",
    "double-augmented fourth up", "doubly diminished fifth down", "major sixteenth up",
    "major constructor up", "major __proto__ up", "minor third up extra", "M3 up\0",
    "minor ٣ up", "major 3.0 up",
  ])("rejects malformed or unsupported syntax %s", (text) => {
    expect(() => parseSpelledInterval(text)).toThrow(SyntaxError);
  });

  test.each([
    "P0 up", "major 0 down", "P3 up", "M5 down", "minor unison up",
    "perfect ninth up", "major octave down", "d1 up", "diminished unison down",
    "M9007199254740992 up", "augmented 9007199254740991 down",
    `M${"9".repeat(400)} up`,
  ])("rejects syntactically valid but unsupported interval %s", (text) => {
    expect(() => parseSpelledInterval(text)).toThrow(RangeError);
  });

  test("validates intervals independently of a source note's available accidental range", () => {
    const interval = parseSpelledInterval("A1 up");
    expect(interval).toEqual({ number: 1, quality: "augmented", direction: "up" });
    expect(() => transposeRegisteredNote(parseRegisteredNote("C##4"), interval)).toThrow(RangeError);
  });

  test("supports exact large compound intervals without using a dummy source note", () => {
    expect(parseSpelledInterval("P5254199565265579 up"))
      .toEqual({ number: 5254199565265579, quality: "perfect", direction: "up" });
    // This interval is valid, but transposing C0 would require an unsafe target octave base.
    const interval = parseSpelledInterval("M5254199565265577 down");
    const source = parseRegisteredNote("C4");
    expect(() => transposeRegisteredNote(source, interval)).not.toThrow();
  });

  test.each([
    ["C4", "A1 up", "C♯4"], ["C4", "minor second up", "D♭4"],
    ["C#4", "m3 up", "E4"], ["C4", "major ninth down", "B♭2"],
    ["B3", "minor second up", "C4"], ["C0", "M2 down", "B♭-1"],
  ])("integrates note %s and interval %s into %s", (noteText, intervalText, expected) => {
    expect(formatRegisteredNote(transposeRegisteredNote(parseRegisteredNote(noteText), parseSpelledInterval(intervalText))))
      .toBe(expected);
  });
});

test("shared interval validation preserves frozen input and checks all quality families", () => {
  const interval = Object.freeze({ number: 9, quality: "major", direction: "down" } as const);
  expect(validateSpelledInterval(interval)).toBeUndefined();
  expect(interval).toEqual({ number: 9, quality: "major", direction: "down" });
  for (const quality of ["perfect", "major", "minor", "augmented", "diminished"] as const satisfies readonly IntervalQuality[]) {
    const number = quality === "perfect" ? 5 : 3;
    expect(() => validateSpelledInterval({ number, quality, direction: "up" })).not.toThrow();
  }
});

if (false) {
  // @ts-expect-error The text boundary requires a string.
  parseSpelledInterval({ number: 3, quality: "minor", direction: "up" });
}
