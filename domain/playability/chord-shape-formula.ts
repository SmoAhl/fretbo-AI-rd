import { createFretboard, type Fretboard } from "../fretboard/fretboard.js";
import { resolveChordShape, type ChordShapeInstance, type ChordShapeString } from "./chord-shape.js";

export type ChordShapeFormulaString = Readonly<{ position: number }> & (
  | Readonly<{ state: "fretted"; offset: number }>
  | Readonly<{ state: "open" | "muted" | "unplayed" }>
);

/** Relative sounding geometry only. IDs are opaque labels, not geometry identity. */
export type ChordShapeFormula = Readonly<{
  id: string;
  strings: readonly ChordShapeFormulaString[];
}>;

/** Validate and copy into ascending physical-position order. No inferred states. */
export function createChordShapeFormula(id: string, strings: readonly ChordShapeFormulaString[]): ChordShapeFormula {
  if (typeof id !== "string" || !Array.isArray(strings) || strings.length === 0) {
    throw new RangeError("Formula requires a string ID and nonempty dense string states.");
  }
  const positions = new Set<number>();
  const result: ChordShapeFormulaString[] = [];
  let hasOpen = false;
  let minimumOffset = Infinity;
  for (let index = 0; index < strings.length; index += 1) {
    if (!Object.hasOwn(strings, index)) throw new RangeError("Formula string states must be dense.");
    const string = strings[index];
    if (typeof string !== "object" || string === null || Array.isArray(string)
      || !Number.isSafeInteger(string.position) || string.position < 1
      || string.position > strings.length || positions.has(string.position)) {
      throw new RangeError("Formula positions must cover 1 through string count exactly once.");
    }
    positions.add(string.position);
    switch (string.state) {
      case "fretted":
        if (!Number.isSafeInteger(string.offset) || string.offset < 0) {
          throw new RangeError("Fret offsets must be nonnegative safe integers.");
        }
        minimumOffset = Math.min(minimumOffset, string.offset);
        result.push({ position: string.position, state: "fretted", offset: string.offset === 0 ? 0 : string.offset });
        break;
      case "open":
      case "muted":
      case "unplayed":
        if ("offset" in string) throw new RangeError("Only fretted states have offsets.");
        hasOpen ||= string.state === "open";
        result.push({ position: string.position, state: string.state });
        break;
      default: throw new RangeError("Unknown formula string state.");
    }
  }
  if (hasOpen ? minimumOffset === 0 : minimumOffset !== Infinity && minimumOffset !== 0) {
    throw new RangeError("Open formulas use positive nut-relative stops; closed formulas normalize their lowest stop to zero.");
  }
  return { id, strings: result.sort((a, b) => a.position - b.position) };
}

export function validateChordShapeFormula(formula: ChordShapeFormula): void {
  createChordShapeFormula(formula?.id, formula?.strings);
}

/** Geometry comparison ignores labels, array order and any unrelated metadata. */
export function chordShapeFormulasEqual(left: ChordShapeFormula, right: ChordShapeFormula): boolean {
  const a = createChordShapeFormula(left?.id, left?.strings);
  const b = createChordShapeFormula(right?.id, right?.strings);
  return JSON.stringify(a.strings) === JSON.stringify(b.strings);
}

/** Place supplied geometry; does not enumerate anchors or infer fingerings.
 * Open formulas and formulas without sounding stops use anchor zero.
 * Closed fretted formulas require a positive anchor.
 */
export function instantiateChordShape(
  board: Fretboard,
  formula: ChordShapeFormula,
  anchor: number,
  instanceId: string,
): ChordShapeInstance {
  const canonical = createChordShapeFormula(formula?.id, formula?.strings);
  const validatedBoard = createFretboard(board?.strings, board?.fretCount);
  const nutOrigin = canonical.strings.some((s) => s.state === "open")
    || !canonical.strings.some((s) => s.state === "fretted");
  if (!Number.isSafeInteger(anchor) || (nutOrigin ? anchor !== 0 : anchor <= 0)) {
    throw new RangeError("Anchor must be zero for nut-origin geometry or a positive safe integer for closed stops.");
  }
  if (canonical.strings.length !== validatedBoard.strings.length) {
    throw new RangeError("Formula must explicitly describe every board string.");
  }
  const byPosition = new Map(validatedBoard.strings.map((s) => [s.position, s.id]));
  const strings = canonical.strings.map((string): ChordShapeString => {
    const identity = { stringId: byPosition.get(string.position)!, position: string.position };
    if (string.state === "fretted") {
      const fret = BigInt(anchor) + BigInt(string.offset);
      if (fret > BigInt(Number.MAX_SAFE_INTEGER) || fret > BigInt(validatedBoard.fretCount)) {
        throw new RangeError("Placed fret is unsafe or outside the board.");
      }
      return { ...identity, state: "fretted", fret: Number(fret) };
    }
    if (string.state === "open") return { ...identity, state: "open", fret: 0 };
    return { ...identity, state: string.state };
  });
  const resolution = resolveChordShape(validatedBoard, {
    id: instanceId, strings, provenance: { formulaId: canonical.id, anchor: anchor === 0 ? 0 : anchor },
  });
  if (resolution.status === "invalid") throw new RangeError(resolution.reasons.join(" "));
  return resolution.instance;
}
