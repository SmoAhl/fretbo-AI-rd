import { describe, expect, test } from "vitest";
import { formatSpelledInterval, parseSpelledInterval } from "../domain/music-theory/interval-text.js";
import { formatRegisteredNote, parseRegisteredNote } from "../domain/music-theory/note-text.js";
import {
  type IntervalQuality,
  type SpelledInterval,
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

describe("formatSpelledInterval", () => {
  test.each([
    [1, "perfect", "P1", "perfect unison"],
    [2, "major", "M2", "major second"],
    [3, "minor", "m3", "minor third"],
    [4, "augmented", "A4", "augmented fourth"],
    [5, "diminished", "d5", "diminished fifth"],
    [6, "major", "M6", "major sixth"],
    [7, "minor", "m7", "minor seventh"],
    [8, "perfect", "P8", "perfect octave"],
    [9, "major", "M9", "major ninth"],
    [10, "minor", "m10", "minor tenth"],
    [11, "augmented", "A11", "augmented eleventh"],
    [12, "perfect", "P12", "perfect twelfth"],
    [13, "minor", "m13", "minor thirteenth"],
    [14, "major", "M14", "major fourteenth"],
    [15, "perfect", "P15", "perfect fifteenth"],
    [16, "major", "M16", "major 16"],
    [22, "diminished", "d22", "diminished 22"],
    [5254199565265579, "perfect", "P5254199565265579", "perfect 5254199565265579"],
  ] as const)("formats %i %s in both notations and directions", (number, quality, compact, full) => {
    for (const direction of ["up", "down"] as const) {
      const interval = Object.freeze({ number, quality, direction });
      expect(formatSpelledInterval(interval)).toBe(`${compact} ${direction}`);
      expect(formatSpelledInterval(interval, "compact")).toBe(`${compact} ${direction}`);
      expect(formatSpelledInterval(interval, "full")).toBe(`${full} ${direction}`);
      for (const notation of ["compact", "full"] as const) {
        expect(parseSpelledInterval(formatSpelledInterval(interval, notation))).toEqual(interval);
      }
      expect(interval).toEqual({ number, quality, direction });
    }
  });

  test("round-trips every supported quality family across simple and compound numbers", () => {
    for (let number = 1; number <= 22; number++) {
      const perfectFamily = [1, 4, 5].includes((number - 1) % 7 + 1);
      const qualities: readonly IntervalQuality[] = perfectFamily
        ? ["perfect", "augmented", ...(number === 1 ? [] : ["diminished"] as const)]
        : ["major", "minor", "augmented", "diminished"];
      for (const quality of qualities) {
        for (const direction of ["up", "down"] as const) {
          const interval = { number, quality, direction };
          for (const notation of ["compact", "full"] as const) {
            expect(parseSpelledInterval(formatSpelledInterval(interval, notation))).toEqual(interval);
          }
        }
      }
    }
  });

  test.each([
    { number: 1, quality: "diminished", direction: "up" },
    { number: 3, quality: "perfect", direction: "up" },
    { number: 5, quality: "major", direction: "down" },
    { number: 3, quality: "double-augmented", direction: "up" },
    { number: 3, quality: "minor", direction: "sideways" },
    ...[0, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1, Number.MAX_SAFE_INTEGER]
      .map((number) => ({ number, quality: "augmented", direction: "up" })),
    { number: 5254199565265579, quality: "augmented", direction: "down" },
  ])("rejects invalid interval %o in either notation", (interval) => {
    for (const notation of ["compact", "full"] as const) {
      expect(() => formatSpelledInterval(interval as SpelledInterval, notation)).toThrow(RangeError);
    }
  });

  test("rejects an unsupported notation", () => {
    // @ts-expect-error Only compact and full notation are supported.
    expect(() => formatSpelledInterval({ number: 3, quality: "minor", direction: "up" }, "named"))
      .toThrow(RangeError);
  });

  test("canonicalizes accepted noncanonical text", () => {
    const interval = parseSpelledInterval("  MiNoR\t003 DOWN ");
    expect(formatSpelledInterval(interval)).toBe("m3 down");
    expect(formatSpelledInterval(interval, "full")).toBe("minor third down");
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
  // @ts-expect-error Formatting requires a structured interval, not text.
  formatSpelledInterval("m3 up");
}
