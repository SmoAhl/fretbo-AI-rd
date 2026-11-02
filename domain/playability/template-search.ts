import { createFretboard, type Fretboard } from "../fretboard/fretboard.js";
import { type ChordShapeInstance } from "./chord-shape.js";
import { createChordShapeFormula, type ChordShapeFormula } from "./chord-shape-formula.js";
import { createFingeringTemplate, instantiateTemplateFingering, templateAnchorBounds, type FingeringTemplate } from "./fingering-template.js";
import { type FingeringWitness } from "./fingering-witness.js";
import { assessChordShape, copyChordShapeRequirements, type ChordShapeRequirements, type PlayabilityAssessment } from "./playability.js";
import { referenceChordShapeFormulas, referenceFingeringTemplates } from "./reference-grips.js";

export const MAX_TEMPLATE_SEARCH_PLACEMENTS = 10_000;
export type TemplateCatalog = Readonly<{ formulas: readonly ChordShapeFormula[]; templates: readonly FingeringTemplate[] }>;
export type TemplateSearchOptions = Readonly<{ templateIds: readonly string[]; anchorRange: Readonly<{ min: number; max: number }> }>;
export type TemplateSearchResult = Readonly<{
  anchor: number; formulaId: string; templateId: string;
  instance: ChordShapeInstance; witness: FingeringWitness; assessment: PlayabilityAssessment;
}>;

/** Enumerate only declared patterns. A custom catalog supplies data, never trust.
 * Budget counts available template/anchor pairs before musical filtering.
 */
export function findChordTemplateFingerings(
  board: Fretboard, request: ChordShapeRequirements, options: TemplateSearchOptions,
  catalog: TemplateCatalog = { formulas: referenceChordShapeFormulas(), templates: referenceFingeringTemplates() },
): readonly TemplateSearchResult[] {
  const instrument = createFretboard(board?.strings, board?.fretCount);
  const requirements = copyChordShapeRequirements(request);
  if (typeof options !== "object" || options === null || !Array.isArray(options.templateIds)
    || typeof options.anchorRange !== "object" || options.anchorRange === null) throw new RangeError("Search requires template IDs and an anchor range.");
  const { min, max } = options.anchorRange;
  if (!Number.isSafeInteger(min) || !Number.isSafeInteger(max) || min < 0 || max < min || max > instrument.fretCount) {
    throw new RangeError("Anchor range must be ordered safe integers within the board.");
  }
  if (typeof catalog !== "object" || catalog === null || !Array.isArray(catalog.formulas) || !Array.isArray(catalog.templates)) {
    throw new RangeError("Invalid template catalog.");
  }
  const formulas = new Map<string, ChordShapeFormula>();
  for (const f of catalog.formulas) {
    const formula = createChordShapeFormula(f?.id, f?.strings);
    if (formulas.has(formula.id)) throw new RangeError("Duplicate formula ID.");
    formulas.set(formula.id, formula);
  }
  const templates = new Map<string, FingeringTemplate>();
  for (const t of catalog.templates) {
    const formula = formulas.get(t?.formulaId);
    if (formula === undefined) throw new RangeError("Template references an unknown formula.");
    const template = createFingeringTemplate(formula, t);
    if (templates.has(template.id)) throw new RangeError("Duplicate template ID.");
    templates.set(template.id, template);
  }
  const selected = new Set<string>();
  let count = 0n;
  const ranges = [];
  for (const id of options.templateIds) {
    const template = templates.get(id);
    if (template === undefined || selected.has(id)) throw new RangeError("Selected template IDs must be known and unique.");
    selected.add(id);
    const formula = formulas.get(template.formulaId)!;
    const bounds = templateAnchorBounds(instrument, formula, template);
    if (bounds === null) continue;
    const lo = Math.max(min, bounds.min), hi = Math.min(max, bounds.max);
    if (lo > hi) continue;
    count += BigInt(hi) - BigInt(lo) + 1n;
    ranges.push({ formula, template, lo, hi });
  }
  if (count > BigInt(MAX_TEMPLATE_SEARCH_PLACEMENTS)) throw new RangeError("Template search exceeds the 10,000 candidate-placement budget.");
  const results: TemplateSearchResult[] = [];
  for (const { formula, template, lo, hi } of ranges) {
    // BigInt iteration also terminates safely when hi is MAX_SAFE_INTEGER.
    for (let coordinate = BigInt(lo); coordinate <= BigInt(hi); coordinate += 1n) {
      const anchor = Number(coordinate);
      const placed = instantiateTemplateFingering(instrument, formula, template, anchor, JSON.stringify([formula.id, anchor]));
      if (placed.validation.status !== "valid") continue;
      const witness = placed.validation.witness;
      const assessment = assessChordShape(instrument, placed.instance, requirements, [witness]);
      if (assessment.musical.status === "matched") results.push({ anchor, formulaId: formula.id, templateId: template.id, instance: placed.instance, witness, assessment });
    }
  }
  const compare = (a: string, b: string) => a < b ? -1 : a > b ? 1 : 0;
  return results.sort((a, b) => a.anchor - b.anchor || compare(a.formulaId, b.formulaId) || compare(a.templateId, b.templateId));
}
