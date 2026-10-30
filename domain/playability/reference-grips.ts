import { type Fretboard } from "../fretboard/fretboard.js";
import { createChordShapeFormula, instantiateChordShape, type ChordShapeFormula } from "./chord-shape-formula.js";
import { type ChordShapeInstance } from "./chord-shape.js";

export type ReferenceChordShapePlacement = Readonly<{ id: string; formulaId: string; anchor: number }>;

// Source order is conventional string 6 -> 1. Numbers are fretted offsets,
// including zero; "open" is a separate state. No execution or review data.
const patterns: readonly (readonly (number | "open" | "unplayed")[])[] = [
  ["unplayed", 3, 2, "open", 1, "open"],
  ["unplayed", "open", 2, 2, 2, "open"],
  [3, 2, "open", "open", "open", 3],
  ["open", 2, 2, 1, "open", "open"],
  ["unplayed", "unplayed", "open", 2, 3, 2],
  ["unplayed", 0, 2, 2, 2, 0],
  [3, 2, 0, 0, 0, 3],
  [0, 2, 2, 1, 0, 0],
  ["unplayed", "unplayed", 0, 2, 3, 2],
  ["unplayed", 0, 2, 2, 1, 0],
  [0, 2, 2, 0, 0, 0],
  ["unplayed", "unplayed", 0, 2, 3, 1],
];

const placements: readonly ReferenceChordShapePlacement[] = [
  { id: "open-c-major", formulaId: "shape-01", anchor: 0 },
  { id: "open-a-major", formulaId: "shape-02", anchor: 0 },
  { id: "open-g-major", formulaId: "shape-03", anchor: 0 },
  { id: "open-e-major", formulaId: "shape-04", anchor: 0 },
  { id: "open-d-major", formulaId: "shape-05", anchor: 0 },
  { id: "c-major-a-shape", formulaId: "shape-06", anchor: 3 },
  { id: "c-major-g-shape", formulaId: "shape-07", anchor: 5 },
  { id: "c-major-e-shape", formulaId: "shape-08", anchor: 8 },
  { id: "c-major-d-shape", formulaId: "shape-09", anchor: 10 },
  { id: "c-minor-a-shape", formulaId: "shape-10", anchor: 3 },
  { id: "c-minor-e-shape", formulaId: "shape-11", anchor: 8 },
  { id: "c-minor-d-shape", formulaId: "shape-12", anchor: 10 },
  { id: "f-major-full-barre", formulaId: "shape-08", anchor: 1 },
];

/** Fresh copies prevent callers from changing subsequent reference lookups. */
export function referenceChordShapeFormulas(): readonly ChordShapeFormula[] {
  return patterns.map((pattern, index) => createChordShapeFormula(`shape-${String(index + 1).padStart(2, "0")}`,
    pattern.map((state, i) => typeof state === "number"
      ? { position: pattern.length - i, state: "fretted", offset: state }
      : { position: pattern.length - i, state })));
}

export function referenceChordShapePlacements(): readonly ReferenceChordShapePlacement[] {
  return placements.map((placement) => ({ ...placement }));
}

/** Bounded reference path: resolve one documented placement on the supplied board. */
export function instantiateReferenceChordShape(board: Fretboard, instanceId: string): ChordShapeInstance {
  const placement = placements.find((p) => p.id === instanceId);
  if (placement === undefined) throw new RangeError("Unknown reference placement.");
  const formula = referenceChordShapeFormulas().find((f) => f.id === placement.formulaId)!;
  return instantiateChordShape(board, formula, placement.anchor, placement.id);
}
