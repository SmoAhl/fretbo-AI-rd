import type { NoteLabelLocation } from "./note-label-layout.js";

export const sparseNoteFixture: readonly NoteLabelLocation[] = [
  { stringId: 1, fret: 0, text: "E4" },
  { stringId: 6, fret: 0, text: "E2" },
  { stringId: 1, fret: 1, text: "F4" },
  { stringId: 6, fret: 1, text: "F2" },
  { stringId: 1, fret: 3, text: "G4" },
  { stringId: 6, fret: 3, text: "G2" },
  { stringId: 1, fret: 12, text: "E5" },
  { stringId: 6, fret: 12, text: "E3" },
  { stringId: 1, fret: 17, text: "A5" },
  { stringId: 6, fret: 17, text: "A3" },
  { stringId: 2, fret: 5, text: "E♭4" },
];
