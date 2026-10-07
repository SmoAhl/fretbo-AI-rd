import { describe, expect, test } from "vitest";
import { parseSpelledInterval } from "../domain/music-theory/interval-text.js";
import {
  type IntervalQuality,
  type SpelledInterval,
  invertSimpleInterval,
  transposeRegisteredNote,
} from "../domain/music-theory/spelled-transposition.js";

// Explicit complementary pairs cover all 26 invertible quality/number combinations.
const pairs: readonly [number, IntervalQuality, number, IntervalQuality][] = [
  [1, "perfect", 8, "perfect"], [1, "augmented", 8, "diminished"],
  [2, "diminished", 7, "augmented"], [2, "minor", 7, "major"],
  [2, "major", 7, "minor"], [2, "augmented", 7, "diminished"],
  [3, "diminished", 6, "augmented"], [3, "minor", 6, "major"],
  [3, "major", 6, "minor"], [3, "augmented", 6, "diminished"],
  [4, "diminished", 5, "augmented"], [4, "perfect", 5, "perfect"],
  [4, "augmented", 5, "diminished"],
];

describe("invertSimpleInterval", () => {
  test.each(pairs)("inverts %i %s and %i %s in both directions", (number, quality, otherNumber, otherQuality) => {
    for (const direction of ["up", "down"] as const) {
      const interval = { number, quality, direction };
      const expected: SpelledInterval = { number: otherNumber, quality: otherQuality,
        direction: direction === "up" ? "down" : "up" };
      expect(invertSimpleInterval(interval)).toEqual(expected);
      expect(invertSimpleInterval(expected)).toEqual(interval);
    }
  });

  test.each(pairs)("preserves sounding pitch and spelling under octave displacement for %i %s / %i %s",
    (number, quality, otherNumber, otherQuality) => {
      for (const letter of ["C", "D", "E", "F", "G", "A", "B"] as const) {
        const source = { letter, accidental: 0, octave: 4 } as const;
        for (const direction of ["up", "down"] as const) {
          for (const [intervalNumber, intervalQuality] of [[number, quality], [otherNumber, otherQuality]] as const) {
            const interval = { number: intervalNumber, quality: intervalQuality, direction };
            const target = transposeRegisteredNote(source, interval);
            const displacedSource = transposeRegisteredNote(source, { number: 8, quality: "perfect", direction });
            expect(transposeRegisteredNote(displacedSource, invertSimpleInterval(interval))).toEqual(target);
          }
        }
      }
    },
  );

  test("integrates parsing with inversion without changing the source interval", () => {
    const source = Object.freeze(parseSpelledInterval("major third up"));
    const result = invertSimpleInterval(source);
    expect(result).toEqual(parseSpelledInterval("minor sixth down"));
    expect(source).toEqual({ number: 3, quality: "major", direction: "up" });
    expect(result).not.toBe(source);
  });

  test.each([0, -1, 1.5, 9, 15, NaN, Infinity, -Infinity,
    Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER + 1])(
    "rejects invalid or non-simple interval number %s", (number) => {
      for (const direction of ["up", "down"] as const) {
        expect(() => invertSimpleInterval({ number, quality: "augmented", direction })).toThrow(RangeError);
      }
    },
  );

  test.each([
    [1, "major"], [1, "minor"], [1, "diminished"], [2, "perfect"],
    [3, "perfect"], [4, "major"], [5, "minor"], [8, "major"], [8, "minor"],
  ] as const)("rejects unsupported input %i %s", (number, quality) => {
    for (const direction of ["up", "down"] as const) {
      expect(() => invertSimpleInterval({ number, quality, direction })).toThrow(RangeError);
    }
  });

  test("rejects augmented octaves whose inverses require diminished unisons", () => {
    for (const direction of ["up", "down"] as const) {
      const interval = Object.freeze({ number: 8, quality: "augmented", direction } as const);
      expect(() => invertSimpleInterval(interval)).toThrow("Diminished unisons are unsupported.");
      expect(interval).toEqual({ number: 8, quality: "augmented", direction });
    }
  });

  test("reuses shared validation for unsupported runtime quality and direction", () => {
    const invalidQuality = { number: 3, quality: "double-augmented", direction: "up" } as unknown as SpelledInterval;
    const invalidDirection = { number: 3, quality: "major", direction: "sideways" } as unknown as SpelledInterval;
    expect(() => invertSimpleInterval(invalidQuality)).toThrow(RangeError);
    expect(() => invertSimpleInterval(invalidDirection)).toThrow(RangeError);
  });
});

if (false) {
  // @ts-expect-error Inversion requires a structured interval with explicit direction.
  invertSimpleInterval({ number: 3, quality: "major" });
  // @ts-expect-error Interval text must be parsed before inversion.
  invertSimpleInterval("M3 up");
}
