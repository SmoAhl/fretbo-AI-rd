export type NoteLabelLocation = {
  stringId: number;
  fret: number;
  text: string;
};

export type NoteLabelPosition = NoteLabelLocation & { x: number; y: number };

export function positionNoteLabels(
  locations: readonly NoteLabelLocation[],
  stringRows: ReadonlyMap<number, number>,
  fretBoundaries: readonly number[],
  openStringCenter: number,
): NoteLabelPosition[] {
  return locations.map(location => {
    const y = stringRows.get(location.stringId);
    if (y === undefined) throw new RangeError(`Unknown string ID ${location.stringId}.`);
    if (!Number.isInteger(location.fret) || location.fret < 0 || location.fret >= fretBoundaries.length) {
      throw new RangeError(`Fret must be in 0..${fretBoundaries.length - 1}.`);
    }

    const x = location.fret === 0
      ? openStringCenter
      : (fretBoundaries[location.fret - 1]! + fretBoundaries[location.fret]!) / 2;

    return { ...location, x, y };
  });
}
