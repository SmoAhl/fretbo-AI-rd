import type { FretboardString } from "../domain/fretboard/fretboard.js";
import type { NoteLabel } from "./note-label-data.js";

export type NoteLabelPosition = NoteLabel & { x: number; y: number };
export type FretboardCell = { left: number; right: number; top: number; bottom: number; x: number; y: number };

export function getStringRows(
  strings: readonly FretboardString[],
  firstRow: number,
  lastRow: number,
): Map<number, number> {
  const spacing = strings.length > 1 ? (lastRow - firstRow) / (strings.length - 1) : 0;
  return new Map(strings.map(({ id, position }) => [
    id,
    strings.length === 1 ? (firstRow + lastRow) / 2 : firstRow + (position - 1) * spacing,
  ]));
}

export function createCellGeometry(
  stringRows: ReadonlyMap<number, number>,
  fretBoundaries: readonly number[],
  openColumn: { left: number; right: number },
  boardEdges: { top: number; bottom: number },
): Map<number, FretboardCell[]> {
  const rows = [...stringRows.entries()].sort((a, b) => a[1] - b[1]);
  return new Map(rows.map(([id, y], index) => {
    const top = index === 0 ? boardEdges.top : (rows[index - 1]![1] + y) / 2;
    const bottom = index === rows.length - 1 ? boardEdges.bottom : (y + rows[index + 1]![1]) / 2;
    const cells = fretBoundaries.map((right, fret) => {
      const left = fret === 0 ? openColumn.left : fretBoundaries[fret - 1]!;
      const x = fret === 0 ? (openColumn.left + openColumn.right) / 2 : (left + right) / 2;
      return { left, right, top, bottom, x, y };
    });
    return [id, cells];
  }));
}

export function positionNoteLabels(
  locations: readonly NoteLabel[],
  cells: ReadonlyMap<number, readonly FretboardCell[]>,
): NoteLabelPosition[] {
  return locations.map(location => {
    const row = cells.get(location.stringId);
    if (row === undefined) throw new RangeError(`Unknown string ID ${location.stringId}.`);
    if (!Number.isInteger(location.fret) || location.fret < 0 || location.fret >= row.length) {
      throw new RangeError(`Fret must be in 0..${row.length - 1}.`);
    }
    const { x, y } = row[location.fret]!;
    return { ...location, x, y };
  });
}
