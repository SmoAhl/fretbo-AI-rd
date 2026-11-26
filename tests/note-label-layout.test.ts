import { describe, expect, test } from "vitest";
import { denseNoteLabels, noteLabelAtLocation } from "../app/note-label-data.js";
import { getStringRows, positionNoteLabels } from "../app/note-label-layout.js";
import { createFretboard } from "../domain/fretboard/fretboard.js";

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

  test("uses board addresses for pitches and physical positions for rows", () => {
    const board = createFretboard([
      { id: 40, position: 1, openPitch: 52 },
      { id: 7, position: 2, openPitch: 47 },
      { id: 25, position: 3, openPitch: 38 },
    ], 5);
    const rows = getStringRows(board.strings);
    const dense = positionNoteLabels(denseNoteLabels(board), rows, boundaries, -2);
    expect(dense.map(({ stringId, fret }) => [stringId, fret])).toEqual(
      [7, 25, 40].flatMap(id => [0, 1, 2, 3, 4, 5].map(fret => [id, fret])),
    );

    expect(dense).toEqual(expect.arrayContaining([
      { stringId: 40, fret: 0, text: "E4", x: -2, y: 40 },
      { stringId: 7, fret: 4, text: "D♯4", x: 281, y: 72 },
      { stringId: 7, fret: 5, text: "E4", x: 342, y: 72 },
      { stringId: 25, fret: 0, text: "D3", x: -2, y: 104 },
    ]));
    expect(noteLabelAtLocation(board, { stringId: 40, fret: 0 })).toEqual({ stringId: 40, fret: 0, text: "E4" });
    expect(noteLabelAtLocation(board, { stringId: 7, fret: 4, spelling: "flats" })).toEqual({ stringId: 7, fret: 4, text: "E♭4" });
  });
});
