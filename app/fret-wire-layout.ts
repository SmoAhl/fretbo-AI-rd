export const FRET_COUNT = 17;
export const FINAL_FRET_WIDTH_RATIO = 0.84;

export function calculateFretWireBoundaries(
  start: number,
  firstSpaceWidth: number,
  fretCount = FRET_COUNT,
  finalWidthRatio = FINAL_FRET_WIDTH_RATIO,
): number[] {
  const lastSpaceWidth = firstSpaceWidth * finalWidthRatio;
  const widthStep = (lastSpaceWidth - firstSpaceWidth) / (fretCount - 1);
  const boundaries = [start];
  let position = start;

  for (let fret = 0; fret < fretCount; fret += 1) {
    position += firstSpaceWidth + widthStep * fret;
    boundaries.push(position);
  }

  return boundaries;
}
