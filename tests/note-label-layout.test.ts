import { describe, expect, test } from "vitest";
import { denseNoteLabels, noteLabelAtLocation } from "../app/note-label-data.js";
import { createCellGeometry, getStringRows, positionNoteLabels } from "../app/note-label-layout.js";
import { createFretboard } from "../domain/fretboard/fretboard.js";

describe("positionNoteLabels", () => {
  const boundaries = [52, 120, 186, 250, 312, 372, 430, 486, 540, 592, 642, 690, 736, 780, 822, 862, 900, 936];

  test("centers open strings and fretted locations using the addressed string row", () => {
    const positions = positionNoteLabels([
      { stringId: 1, fret: 0, text: "E4" },
      { stringId: 6, fret: 17, text: "A3" },
    ], createCellGeometry(new Map([[1, 40], [6, 200]]), boundaries, { left: -24, right: 20 }, { top: 20, bottom: 220 }));

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
    const rows = getStringRows(board.strings, 40, 104);
    const cells = createCellGeometry(rows, boundaries, { left: -24, right: 20 }, { top: 20, bottom: 124 });
    const dense = positionNoteLabels(denseNoteLabels(board), cells);
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
    expect(cells.get(40)![0]).toEqual({ left: -24, right: 52, top: 20, bottom: 56, x: -2, y: 40 });
    expect(cells.get(40)![0]!.right).toBe(cells.get(40)![1]!.left);
    for (const x of [20, 36, 51.99]) {
      const open = cells.get(40)![0]!;
      expect(x).toBeGreaterThanOrEqual(open.left);
      expect(x).toBeLessThan(open.right);
    }
    expect(cells.get(25)![17]).toEqual({ left: 900, right: 936, top: 88, bottom: 124, x: 918, y: 104 });
    expect(cells.get(40)![1]!.bottom).toBe(cells.get(7)![1]!.top);
    expect(cells.get(7)![1]!.bottom).toBe(cells.get(25)![1]!.top);
    expect(cells.get(7)![1]!.right).toBe(cells.get(7)![2]!.left);
  });

  test("scales cell rows and fret counts from the supplied board and dimensions", () => {
    const strings = [
      { id: 70, position: 1, openPitch: 52 },
      { id: 3, position: 2, openPitch: 47 },
      { id: 41, position: 3, openPitch: 43 },
      { id: 12, position: 4, openPitch: 38 },
      { id: 9, position: 5, openPitch: 33 },
      { id: 65, position: 6, openPitch: 28 },
      { id: 2, position: 7, openPitch: 23 },
    ];
    const board = createFretboard(strings, 2);
    const rows = getStringRows(board.strings, 50, 290);
    const cells = createCellGeometry(rows, [80, 150, 210], { left: 0, right: 40 }, { top: 30, bottom: 310 });
    expect(rows.get(70)).toBe(50);
    expect(rows.get(2)).toBe(290);
    expect(cells.size).toBe(7);
    expect(cells.get(3)).toHaveLength(3);
    expect(cells.get(70)![0]).toEqual({ left: 0, right: 80, top: 30, bottom: 70, x: 20, y: 50 });
    expect(cells.get(2)![2]).toEqual({ left: 150, right: 210, top: 270, bottom: 310, x: 180, y: 290 });

    const single = createFretboard([{ id: 42, position: 1, openPitch: 40 }], 0);
    const singleRows = getStringRows(single.strings, 50, 290);
    const singleCells = createCellGeometry(singleRows, [80], { left: 0, right: 40 }, { top: 30, bottom: 310 });
    expect(singleCells.get(42)).toEqual([{ left: 0, right: 80, top: 30, bottom: 310, x: 20, y: 170 }]);
  });
});
