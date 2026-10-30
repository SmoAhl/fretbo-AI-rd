import {
  createFretboard,
  registeredPitchAtLocation,
  type Fretboard,
  type FretboardPitchLocation,
  type StringId,
} from "../fretboard/fretboard.js";

export type ChordShapeString = Readonly<{ stringId: StringId; position: number }> & (
  | Readonly<{ state: "open"; fret: 0 }>
  | Readonly<{ state: "fretted"; fret: number }>
  | Readonly<{ state: "muted" | "unplayed" }>
);

/** Concrete sounding geometry, independent of execution or review evidence. */
export type ChordShapeInstance = Readonly<{
  id: string;
  strings: readonly ChordShapeString[];
  provenance?: Readonly<{ formulaId: string; anchor: number }>;
}>;

export type ChordShapeResolution =
  | Readonly<{ status: "invalid"; reasons: readonly string[] }>
  | Readonly<{
    status: "valid";
    instance: ChordShapeInstance;
    soundingLocations: readonly FretboardPitchLocation[];
  }>;

/** Candidate contradictions are findings; invalid board contracts still throw.
 * Results use ascending physical position, including repeated sounding pitches.
 * Provenance is copied but never used to validate geometry or confer approval.
 */
export function resolveChordShape(board: Fretboard, instance: ChordShapeInstance): ChordShapeResolution {
  const validatedBoard = createFretboard(board?.strings, board?.fretCount);
  const invalid = (reason: string): ChordShapeResolution => ({ status: "invalid", reasons: [reason] });
  if (typeof instance !== "object" || instance === null || Array.isArray(instance)
    || typeof instance.id !== "string") return invalid("Instance must have a string ID.");
  if (!Array.isArray(instance.strings) || instance.strings.length !== validatedBoard.strings.length) {
    return invalid("Instance must explicitly describe every board string.");
  }
  const byPosition = new Map(validatedBoard.strings.map((s) => [s.position, s]));
  const positions = new Set<number>();
  const strings: ChordShapeString[] = [];
  for (let index = 0; index < instance.strings.length; index += 1) {
    if (!Object.hasOwn(instance.strings, index)) return invalid("String states must be dense.");
    const string = instance.strings[index];
    if (typeof string !== "object" || string === null || Array.isArray(string)) {
      return invalid("Each string state must be a record.");
    }
    const boardString = byPosition.get(string.position);
    if (boardString === undefined || boardString.id !== string.stringId || positions.has(string.position)) {
      return invalid("Positions must cover the board once with matching string IDs.");
    }
    positions.add(string.position);
    const identity = { stringId: string.stringId, position: string.position };
    switch (string.state) {
      case "open":
        if (string.fret !== 0) return invalid("Open strings must sound at fret zero.");
        strings.push({ ...identity, state: "open", fret: 0 });
        break;
      case "fretted":
        if (!Number.isSafeInteger(string.fret) || string.fret <= 0 || string.fret > validatedBoard.fretCount) {
          return invalid("Fretted stops must be positive safe integers within the board.");
        }
        strings.push({ ...identity, state: "fretted", fret: string.fret });
        break;
      case "muted":
      case "unplayed":
        if ("fret" in string) return invalid("Nonsounding strings cannot select a sounding fret.");
        strings.push({ ...identity, state: string.state });
        break;
      default: return invalid("Unknown string state.");
    }
  }
  const provenance = instance.provenance;
  if (provenance !== undefined && (typeof provenance !== "object" || provenance === null
    || Array.isArray(provenance) || typeof provenance.formulaId !== "string"
    || !Number.isSafeInteger(provenance.anchor) || provenance.anchor < 0)) {
    return invalid("Provenance must contain a formula ID and nonnegative safe anchor.");
  }
  strings.sort((a, b) => a.position - b.position);
  const soundingLocations = strings.flatMap((string) => {
    if (string.state !== "open" && string.state !== "fretted") return [];
    const location = { stringId: string.stringId, fret: string.fret };
    return [{ ...location, pitch: registeredPitchAtLocation(validatedBoard, location) }];
  });
  return {
    status: "valid",
    instance: {
      id: instance.id,
      strings,
      ...(provenance === undefined ? {} : { provenance: { formulaId: provenance.formulaId, anchor: provenance.anchor } }),
    },
    soundingLocations,
  };
}

/** Compare actual geometry on one explicit board, ignoring IDs and provenance. */
export function chordShapeInstancesEqual(board: Fretboard, left: ChordShapeInstance, right: ChordShapeInstance): boolean {
  const a = resolveChordShape(board, left);
  const b = resolveChordShape(board, right);
  if (a.status === "invalid" || b.status === "invalid") {
    throw new RangeError("Cannot compare structurally invalid chord shapes.");
  }
  return JSON.stringify(a.instance.strings) === JSON.stringify(b.instance.strings);
}
