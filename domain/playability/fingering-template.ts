import { createFretboard, type Fretboard } from "../fretboard/fretboard.js";
import { createChordShapeFormula, instantiateChordShape, type ChordShapeFormula } from "./chord-shape-formula.js";
import { type ChordShapeInstance } from "./chord-shape.js";
import { validateFingeringWitness, type FrettingFinger, type FingeringWitnessValidation } from "./fingering-witness.js";

export type RelativeFingerContact = Readonly<{
  finger: FrettingFinger;
  offset: number;
  fromPosition: number;
  toPosition: number;
}>;
export type FingeringTemplate = Readonly<{
  id: string;
  formulaId: string;
  contacts: readonly RelativeFingerContact[];
}>;
export type TemplateFingering = Readonly<{
  instance: ChordShapeInstance;
  validation: FingeringWitnessValidation;
}>;

/** Validate representation and association, not simultaneous contact consistency. */
export function createFingeringTemplate(formula: ChordShapeFormula, template: FingeringTemplate): FingeringTemplate {
  const geometry = createChordShapeFormula(formula?.id, formula?.strings);
  if (typeof template !== "object" || template === null || Array.isArray(template)
    || typeof template.id !== "string" || template.formulaId !== geometry.id
    || !Array.isArray(template.contacts) || template.contacts.length > 4) {
    throw new RangeError("Template requires IDs, a matching formula and at most four contacts.");
  }
  const contacts: RelativeFingerContact[] = [];
  for (const c of template.contacts) {
    if (typeof c !== "object" || c === null || Array.isArray(c)
      || !Number.isInteger(c.finger) || c.finger < 1 || c.finger > 4
      || !Number.isSafeInteger(c.offset)
      || !Number.isSafeInteger(c.fromPosition) || !Number.isSafeInteger(c.toPosition)
      || c.fromPosition < 1 || c.toPosition < c.fromPosition || c.toPosition > geometry.strings.length) {
      throw new RangeError("Invalid relative finger contact.");
    }
    contacts.push({ finger: c.finger, offset: c.offset, fromPosition: c.fromPosition, toPosition: c.toPosition });
  }
  return { id: template.id, formulaId: template.formulaId, contacts: contacts.sort((a, b) => a.finger - b.finger) };
}

/** Inclusive available anchors. Hidden contacts constrain bounds, never the anchor origin. */
export function templateAnchorBounds(board: Fretboard, formula: ChordShapeFormula, template: FingeringTemplate): Readonly<{ min: number; max: number }> | null {
  const instrument = createFretboard(board?.strings, board?.fretCount);
  const geometry = createChordShapeFormula(formula?.id, formula?.strings);
  const execution = createFingeringTemplate(geometry, template);
  if (geometry.strings.length !== instrument.strings.length) return null;
  const stops = geometry.strings.flatMap((s) => s.state === "fretted" ? [s.offset] : []);
  const nutOrigin = geometry.strings.some((s) => s.state === "open") || stops.length === 0;
  let min = nutOrigin ? 0n : 1n;
  let max = nutOrigin ? 0n : BigInt(instrument.fretCount);
  for (const offset of [...stops, ...execution.contacts.map((c) => c.offset)]) {
    const lower = 1n - BigInt(offset);
    const upper = BigInt(instrument.fretCount) - BigInt(offset);
    if (lower > min) min = lower;
    if (upper < max) max = upper;
  }
  return min > max ? null : { min: Number(min), max: Number(max) };
}

export function instantiateTemplateFingering(
  board: Fretboard, formula: ChordShapeFormula, template: FingeringTemplate,
  anchor: number, instanceId: string, witnessId?: string,
): TemplateFingering {
  const execution = createFingeringTemplate(formula, template);
  const executionId = witnessId === undefined ? execution.id : witnessId;
  if (typeof executionId !== "string") throw new RangeError("Witness ID must be a string.");
  const instance = instantiateChordShape(board, formula, anchor, instanceId);
  const contacts = execution.contacts.map((c) => {
    const fret = BigInt(anchor) + BigInt(c.offset);
    if (fret < 1n || fret > BigInt(board.fretCount) || fret > BigInt(Number.MAX_SAFE_INTEGER)) {
      throw new RangeError("Placed contact is unavailable or unsafe.");
    }
    return { finger: c.finger, fret: Number(fret), fromPosition: c.fromPosition, toPosition: c.toPosition };
  });
  return { instance, validation: validateFingeringWitness(board, instance, { id: executionId, instanceId, contacts }) };
}
