import { type Fretboard } from "../fretboard/fretboard.js";
import { createChordShapeFormula, instantiateChordShape, type ChordShapeFormula } from "./chord-shape-formula.js";
import { type ChordShapeInstance } from "./chord-shape.js";
import { type FingeringWitness } from "./fingering-witness.js";
import { type FingeringTemplate, type RelativeFingerContact } from "./fingering-template.js";

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
  ["unplayed", 3, 2, 0, 1, 0],
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

export type ReferenceFingeringReview = Readonly<{
  witnessId: string;
  source: string;
  context: readonly Readonly<{ position: number; openPitch: number }>[];
}>;

// Complete relative contacts include lower held barres hidden by sounding stops.
// Geometry, execution and support evidence remain separate collections.
const templates: readonly FingeringTemplate[] = [
  { id: "open-c-major", formulaId: "shape-01", contacts: [contact(1, 1, 2), contact(2, 2, 4), contact(3, 3, 5)] },
  { id: "open-a-major", formulaId: "shape-02", contacts: [contact(1, 2, 4), contact(2, 2, 3), contact(3, 2, 2)] },
  { id: "open-g-major", formulaId: "shape-03", contacts: [contact(1, 2, 5), contact(2, 3, 6), contact(4, 3, 1)] },
  { id: "open-e-major", formulaId: "shape-04", contacts: [contact(1, 1, 3), contact(2, 2, 5), contact(3, 2, 4)] },
  { id: "open-d-major", formulaId: "shape-05", contacts: [contact(1, 2, 3), contact(2, 2, 1), contact(3, 3, 2)] },
  { id: "closed-a-major", formulaId: "shape-06", contacts: [contact(1, 0, 1, 5), contact(2, 2, 4), contact(3, 2, 3), contact(4, 2, 2)] },
  { id: "closed-g-major", formulaId: "shape-07", contacts: [contact(1, 0, 2, 4), contact(2, 2, 5), contact(3, 3, 6), contact(4, 3, 1)] },
  { id: "closed-e-major", formulaId: "shape-08", contacts: [contact(1, 0, 1, 6), contact(2, 1, 3), contact(3, 2, 5), contact(4, 2, 4)] },
  { id: "closed-d-major", formulaId: "shape-09", contacts: [contact(1, 0, 4), contact(2, 2, 3), contact(3, 2, 1), contact(4, 3, 2)] },
  { id: "closed-a-minor", formulaId: "shape-10", contacts: [contact(1, 0, 1, 5), contact(2, 1, 2), contact(3, 2, 4), contact(4, 2, 3)] },
  { id: "closed-e-minor", formulaId: "shape-11", contacts: [contact(1, 0, 1, 6), contact(3, 2, 5), contact(4, 2, 4)] },
  { id: "closed-d-minor", formulaId: "shape-12", contacts: [contact(1, 0, 4), contact(2, 1, 1), contact(3, 2, 3), contact(4, 3, 2)] },
  { id: "closed-c-major", formulaId: "shape-13", contacts: [contact(1, 0, 1, 5), contact(2, 1, 2), contact(3, 2, 4), contact(4, 3, 5)] },
];

function contact(finger: RelativeFingerContact["finger"], offset: number, fromPosition: number, toPosition = fromPosition): RelativeFingerContact {
  return { finger, offset, fromPosition, toPosition };
}

/** One initial witness per placement; association permits additional witnesses. */
export function referenceFingeringWitnesses(): readonly FingeringWitness[] {
  return placements.map((p) => ({
    id: `${p.id}-reference`, instanceId: p.id,
    contacts: templates.find((t) => t.formulaId === p.formulaId)!.contacts.map((c) => ({
      finger: c.finger, fret: p.anchor + c.offset, fromPosition: c.fromPosition, toPosition: c.toPosition,
    })),
  }));
}

/** Source/context records are separate from contacts and generic validation.
 * Consumers must still match actual geometry/context and validate the witness.
 */
export function referenceFingeringReviews(): readonly ReferenceFingeringReview[] {
  return placements.map(({ id }) => ({
    witnessId: `${id}-reference`,
    source: "docs/PLAYABILITY_REFERENCE.md",
    context: [52, 47, 43, 38, 33, 28].map((openPitch, i) => ({ position: i + 1, openPitch })),
  }));
}

export function referenceFingeringTemplates(): readonly FingeringTemplate[] {
  return templates.map((t) => ({ ...t, contacts: t.contacts.map((c) => ({ ...c })) }));
}

export type TemplateReview = Readonly<{ templateId: string; source: string; stringCount: number; tuning: "any" }>;

// Deliberate review membership: adding execution data must not grant support.
const reviewedTemplateIds = [
  "open-c-major", "open-a-major", "open-g-major", "open-e-major", "open-d-major",
  "closed-a-major", "closed-g-major", "closed-e-major", "closed-d-major",
  "closed-a-minor", "closed-e-minor", "closed-d-minor", "closed-c-major",
] as const;

/** Reviewed patterns, not caller-supplied IDs, establish discrete-model support. */
export function referenceTemplateReviews(): readonly TemplateReview[] {
  return reviewedTemplateIds.map((templateId) => ({ templateId, stringCount: 6, tuning: "any",
    source: templateId === "closed-c-major" ? "docs/PLAYABILITY_V1.md#closed-c-variant" : "docs/PLAYABILITY_REFERENCE.md" }));
}

export function referenceClosedCagedVariants(): readonly Readonly<{ openTemplateId: string; closedTemplateId: string }>[] {
  return ["c", "a", "g", "e", "d"].map((shape) => ({
    openTemplateId: `open-${shape}-major`, closedTemplateId: `closed-${shape}-major`,
  }));
}

/** Explicit variant selection, never an inferred geometry or finger conversion. */
export function closedCagedFingeringTemplate(openTemplateId: string): FingeringTemplate {
  const variant = referenceClosedCagedVariants().find((v) => v.openTemplateId === openTemplateId);
  if (variant === undefined) throw new RangeError("No defined closed CAGED variant.");
  return referenceFingeringTemplates().find((t) => t.id === variant.closedTemplateId)!;
}
