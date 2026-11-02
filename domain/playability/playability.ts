import { type Fretboard } from "../fretboard/fretboard.js";
import {
  createPitchClassChordDescription, createSpelledChordDescription,
  type PitchClassChordDescription, type SpelledChordDescription,
} from "../music-theory/chords-symbols-and-realization/chord-descriptions.js";
import {
  analyzeRegisteredPitchVoicing, analyzeRegisteredNoteVoicing,
  type ChordVoicingAnalysis, type RegisteredPitchVoicingAnalysis,
} from "../music-theory/chords-symbols-and-realization/chord-voicing-analysis.js";
import {
  createRegisteredPitchVoicing, createRegisteredNoteVoicing,
  type RegisteredPitchVoicing, type RegisteredNoteVoicing,
} from "../music-theory/chords-symbols-and-realization/registered-chords.js";
import { registeredPitchFromNote } from "../music-theory/pitch-pitch-classes-and-spelling/registered-pitch.js";
import { resolveChordShape, type ChordShapeInstance, type ChordShapeResolution } from "./chord-shape.js";
import { validateFingeringWitness, type FingeringWitness, type FingeringWitnessValidation } from "./fingering-witness.js";
import { instantiateTemplateFingering, templateAnchorBounds } from "./fingering-template.js";
import { referenceChordShapeFormulas, referenceFingeringTemplates, referenceTemplateReviews } from "./reference-grips.js";

export type ChordShapeRequirements = Readonly<{
  description: PitchClassChordDescription | SpelledChordDescription;
  optionalFormulaIndices?: readonly number[];
  exactVoicing?: RegisteredPitchVoicing | RegisteredNoteVoicing;
}>;
export type MusicalFinding =
  | Readonly<{ status: "not-assessed" }>
  | Readonly<{
    status: "matched" | "mismatched";
    analysis: RegisteredPitchVoicingAnalysis | null;
    exactMatch: boolean | null;
    /** Request occurrence -> canonical physical-position sounding-location index. */
    occurrenceLocationIndices: readonly number[] | null;
  }>;
export type PlayabilityAssessment = Readonly<{
  requirements: ChordShapeRequirements;
  structural: ChordShapeResolution;
  musical: MusicalFinding;
  physicalSupport: Readonly<{ status: "supported" | "unverified" | "not-assessed"; templateIds: readonly string[] }>;
  witnessFindings: readonly Readonly<{ validation: FingeringWitnessValidation; supportingTemplateIds: readonly string[] }>[];
  recommendationEligible: boolean;
}>;

function musicMatches(a: ChordVoicingAnalysis): boolean {
  return a.missingRequiredFormulaIndices.length === 0 && a.unexpectedToneIndices.length === 0 && a.specifiedBass !== "mismatched";
}

/** Snapshot and validate even for an empty search. Preserve original spellings and occurrence order. */
export function copyChordShapeRequirements(request: ChordShapeRequirements): ChordShapeRequirements {
  if (typeof request !== "object" || request === null || typeof request.description !== "object" || request.description === null) {
    throw new RangeError("Chord requirements must contain a description.");
  }
  const d = request.description;
  const description = typeof d.root === "number"
    ? createPitchClassChordDescription(d.root, d.formula, d.bass as PitchClassChordDescription["bass"])
    : createSpelledChordDescription(d.root, d.formula, d.bass as SpelledChordDescription["bass"]);
  // Reuse the analyzer's omission-policy validation without imposing a voicing.
  analyzeRegisteredPitchVoicing(description, { pitches: [0] }, request);
  let exactVoicing: ChordShapeRequirements["exactVoicing"];
  if (request.exactVoicing !== undefined) {
    const exact = request.exactVoicing;
    if (typeof exact !== "object" || exact === null || ("notes" in exact) === ("pitches" in exact)) {
      throw new RangeError("Exact voicing must contain either notes or pitches.");
    }
    exactVoicing = "notes" in exact ? createRegisteredNoteVoicing(exact.notes) : createRegisteredPitchVoicing(exact.pitches);
    if ("notes" in exactVoicing && typeof description.root !== "number") {
      analyzeRegisteredNoteVoicing(description as SpelledChordDescription, exactVoicing, request);
    }
  }
  return { description,
    ...(request.optionalFormulaIndices === undefined ? {} : { optionalFormulaIndices: [...request.optionalFormulaIndices] }),
    ...(exactVoicing === undefined ? {} : { exactVoicing }),
  };
}

// Private snapshots cannot be replaced or mutated through public library getters.
const reviewedPairs = referenceTemplateReviews().map((review) => {
  const template = referenceFingeringTemplates().find((t) => t.id === review.templateId)!;
  return { review, template, formula: referenceChordShapeFormulas().find((f) => f.id === template.formulaId)! };
});

/** Assess supplied geometry and optional explicit witnesses. Omitted witnesses are
 * instantiated only from matching reviewed patterns; [] deliberately supplies none.
 * Review support concerns the discrete pattern, not anatomy or personal comfort.
 */
export function assessChordShape(
  board: Fretboard, instance: ChordShapeInstance, request: ChordShapeRequirements,
  witnesses?: readonly FingeringWitness[],
): PlayabilityAssessment {
  const requirements = copyChordShapeRequirements(request);
  const structural = resolveChordShape(board, instance);
  if (witnesses !== undefined && !Array.isArray(witnesses)) throw new RangeError("Witnesses must be an array.");
  if (structural.status === "invalid") return { requirements, structural, musical: { status: "not-assessed" },
    physicalSupport: { status: "not-assessed", templateIds: [] }, witnessFindings: [], recommendationEligible: false };

  const strings = structural.instance.strings;
  const stops = strings.flatMap((s) => s.state === "fretted" ? [s.fret] : []);
  const anchor = strings.some((s) => s.state === "open") || stops.length === 0 ? 0 : stops.reduce((a, b) => Math.min(a, b));
  const normalized = strings.map((s) => s.state === "fretted"
    ? { position: s.position, state: s.state, offset: s.fret - anchor }
    : { position: s.position, state: s.state });
  const applicable = reviewedPairs.flatMap(({ review, formula, template }) => {
    if (strings.length !== review.stringCount || JSON.stringify(normalized) !== JSON.stringify(formula.strings)) return [];
    const bounds = templateAnchorBounds(board, formula, template);
    if (bounds === null || anchor < bounds.min || anchor > bounds.max) return [];
    const placed = instantiateTemplateFingering(board, formula, template, anchor, instance.id);
    return placed.validation.status === "valid" ? [{ templateId: template.id, witness: placed.validation.witness }] : [];
  });
  const witnessFindings = Array.from(witnesses ?? applicable.map((a) => a.witness), (w) => {
    const validation = validateFingeringWitness(board, instance, w);
    const supportingTemplateIds = validation.status === "invalid" ? [] : applicable.filter((a) =>
      JSON.stringify(a.witness.contacts) === JSON.stringify(validation.witness.contacts)).map((a) => a.templateId);
    return { validation, supportingTemplateIds };
  });
  const templateIds = [...new Set(witnessFindings.flatMap((f) => f.supportingTemplateIds))].sort();
  const pitches = structural.soundingLocations.map((l) => l.pitch);
  const analysis = pitches.length === 0 ? null : analyzeRegisteredPitchVoicing(requirements.description, { pitches }, requirements);
  let matched = analysis !== null && musicMatches(analysis);
  let exactMatch: boolean | null = null;
  let occurrenceLocationIndices: number[] | null = null;
  const exact = requirements.exactVoicing;
  if (exact !== undefined) {
    const expected = "pitches" in exact ? exact.pitches : exact.notes.map(registeredPitchFromNote);
    const available = new Map<number, number[]>();
    pitches.forEach((pitch, index) => available.set(pitch, [...(available.get(pitch) ?? []), index]));
    const indices = expected.map((pitch) => available.get(pitch)?.shift());
    exactMatch = pitches.length === expected.length && indices.every((i) => i !== undefined);
    occurrenceLocationIndices = exactMatch ? indices as number[] : null;
    matched &&= exactMatch;
    if ("notes" in exact && typeof requirements.description.root !== "number") {
      matched &&= musicMatches(analyzeRegisteredNoteVoicing(requirements.description as SpelledChordDescription, exact, requirements));
    }
  }
  return { requirements, structural,
    musical: { status: matched ? "matched" : "mismatched", analysis, exactMatch, occurrenceLocationIndices },
    physicalSupport: { status: templateIds.length > 0 ? "supported" : "unverified", templateIds },
    witnessFindings, recommendationEligible: matched && templateIds.length > 0,
  };
}
