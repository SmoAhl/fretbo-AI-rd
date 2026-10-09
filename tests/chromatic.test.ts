import { describe, expect, test } from "vitest";
import { chromaticPitchClasses } from "../domain/music-theory/chromatic.js";
import { type PitchClass } from "../domain/music-theory/pitch-class.js";

const tonics: readonly PitchClass[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

describe("chromaticPitchClasses", () => {
  test.each(tonics)("constructs all twelve classes in tonic-relative order from %i", (tonic) => {
    const result = chromaticPitchClasses(tonic);
    expect(result).toEqual(tonics.map((_, offset) => (tonic + offset) % 12));
    expect(result).toHaveLength(12);
    expect(result[0]).toBe(tonic);
    expect(new Set(result)).toEqual(new Set(tonics));
    expect(result.filter((pitch) => pitch === tonic)).toHaveLength(1);
    for (let index = 1; index < result.length; index++) {
      expect((result[index]! - result[index - 1]! + 12) % 12).toBe(1);
    }
  });

  test.each([
    [0, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]],
    [10, [10, 11, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9]],
    [11, [11, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]],
  ] as const)("preserves explicit wrapping expectations for tonic %i", (tonic, expected) => {
    expect(chromaticPitchClasses(tonic)).toEqual(expected);
  });

  test("returns independent arrays without runtime freezing", () => {
    const first = chromaticPitchClasses(10);
    const second = chromaticPitchClasses(10);
    expect(first).not.toBe(second);
    (first as PitchClass[])[0] = 0;
    expect(second[0]).toBe(10);
    expect(chromaticPitchClasses(10)).toEqual(second);
  });
});

if (false) {
  const result: readonly PitchClass[] = chromaticPitchClasses(0);
  // @ts-expect-error Unsupported pitch classes are outside the typed input contract.
  chromaticPitchClasses(12);
  // @ts-expect-error Negative numbers are not pitch classes.
  chromaticPitchClasses(-1);
  // @ts-expect-error Fractional numbers are not pitch classes.
  chromaticPitchClasses(0.5);
  // @ts-expect-error Text is outside the numeric contract.
  chromaticPitchClasses("C");
  // @ts-expect-error Output elements are readonly.
  result[0] = 1;
  // @ts-expect-error Output collections are readonly.
  result.push(0);
}
