import { describe, expect, test } from "vitest";
import { positionNoteLabels } from "../app/note-label-layout.js";

describe("positionNoteLabels", () => {
  const boundaries = [52, 120, 186, 250, 312, 372, 430, 486, 540, 592, 642, 690, 736, 780, 822, 862, 900, 936];

  test("centers open strings and fretted locations using the addressed string row", () => {
    const positions = positionNoteLabels([
      { stringId: 1, fret: 0, text: "E4" },
      { stringId: 6, fret: 17, text: "A3" },
    ], new Map([[1, 40], [6, 200]]), boundaries, -2);

    expect(positions).toEqual([
      { stringId: 1, fret: 0, text: "E4", x: -2, y: 40 },
      { stringId: 6, fret: 17, text: "A3", x: 918, y: 200 },
    ]);
  });
});
