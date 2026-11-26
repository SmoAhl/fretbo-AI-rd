import type { NoteLabelRequest } from "./note-label-data.js";

export const sparseNoteFixture: readonly NoteLabelRequest[] = [
  { stringId: 1, fret: 0 },
  { stringId: 6, fret: 0 },
  { stringId: 1, fret: 1 },
  { stringId: 6, fret: 1 },
  { stringId: 1, fret: 3 },
  { stringId: 6, fret: 3 },
  { stringId: 1, fret: 12 },
  { stringId: 6, fret: 12 },
  { stringId: 1, fret: 17 },
  { stringId: 6, fret: 17 },
  { stringId: 2, fret: 4, spelling: "flats" },
];
