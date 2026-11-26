export const FINAL_FRET_WIDTH_RATIO = 0.84;

export function calculateFretWireBoundaries(
  start: number,
  firstSpaceWidth: number,
  fretCount: number,
  finalWidthRatio = FINAL_FRET_WIDTH_RATIO,
): number[] {
  const lastSpaceWidth = firstSpaceWidth * finalWidthRatio;
  const widthStep = fretCount > 1 ? (lastSpaceWidth - firstSpaceWidth) / (fretCount - 1) : 0;
  const boundaries = [start];
  let position = start;

  for (let fret = 0; fret < fretCount; fret += 1) {
    position += firstSpaceWidth + widthStep * fret;
    boundaries.push(position);
  }

  return boundaries;
}
