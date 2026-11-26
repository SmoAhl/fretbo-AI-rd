import { describe, expect, test } from "vitest";
import { calculateFretWireBoundaries, FINAL_FRET_WIDTH_RATIO } from "../app/fret-wire-layout.js";

describe("calculateFretWireBoundaries", () => {
  test("spaces narrow evenly to the configured final ratio", () => {
    const boundaries = calculateFretWireBoundaries(52, 68.5, 17, FINAL_FRET_WIDTH_RATIO);
    const widths = boundaries.slice(1).map((boundary, index) => boundary - boundaries[index]!);

    expect(widths).toHaveLength(17);
    expect(widths.every((width, index) => index === 0 || width < widths[index - 1]!)).toBe(true);
    expect(boundaries[0]).toBe(52);
    for (let index = 2; index < widths.length; index += 1) {
      expect(widths[index - 1]! - widths[index]!).toBeCloseTo(widths[0]! - widths[1]!);
    }
    expect(boundaries.at(-1)! - 52).toBeCloseTo(17 * 68.5 * (1 + 0.84) / 2);
    expect(widths.at(-1)! / widths[0]!).toBeCloseTo(FINAL_FRET_WIDTH_RATIO);
  });
});
