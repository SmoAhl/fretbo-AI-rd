import { expect, test } from "vitest";
import {
  referenceChordShapeFormulas, referenceChordShapePlacements, referenceFingeringTemplates,
  referenceFingeringWitnesses, referenceFingeringReviews, referenceTemplateReviews,
  referenceClosedCagedVariants,
} from "../domain/playability/reference-grips.js";

test("stable formula IDs retain their geometry independently of collection order", () => {
  // Compatibility fixtures in conventional string 6 -> 1 order; zero is fretted.
  const expected = {
    "shape-01": ["unplayed", 3, 2, "open", 1, "open"],
    "shape-02": ["unplayed", "open", 2, 2, 2, "open"],
    "shape-03": [3, 2, "open", "open", "open", 3],
    "shape-04": ["open", 2, 2, 1, "open", "open"],
    "shape-05": ["unplayed", "unplayed", "open", 2, 3, 2],
    "shape-06": ["unplayed", 0, 2, 2, 2, 0],
    "shape-07": [3, 2, 0, 0, 0, 3],
    "shape-08": [0, 2, 2, 1, 0, 0],
    "shape-09": ["unplayed", "unplayed", 0, 2, 3, 2],
    "shape-10": ["unplayed", 0, 2, 2, 1, 0],
    "shape-11": [0, 2, 2, 0, 0, 0],
    "shape-12": ["unplayed", "unplayed", 0, 2, 3, 1],
    "shape-13": ["unplayed", 3, 2, 0, 1, 0],
  };
  const formulas = new Map(referenceChordShapeFormulas().map(f => [f.id, f]));
  for (const [id, strings] of Object.entries(expected)) {
    const formula = formulas.get(id);
    expect(formula, id).toBeDefined();
    expect([...formula!.strings].sort((a, b) => b.position - a.position)
      .map(s => s.state === "fretted" ? s.offset : s.state), id).toEqual(strings);
  }
});

test("reference collections have unique identities and resolve every association", () => {
  const formulas = referenceChordShapeFormulas();
  const placements = referenceChordShapePlacements();
  const templates = referenceFingeringTemplates();
  const witnesses = referenceFingeringWitnesses();
  const reviews = referenceFingeringReviews();
  const templateReviews = referenceTemplateReviews();
  const variants = referenceClosedCagedVariants();
  for (const ids of [formulas.map(f => f.id), placements.map(p => p.id), templates.map(t => t.id),
    witnesses.map(w => w.id), reviews.map(r => r.witnessId), templateReviews.map(r => r.templateId),
    variants.map(v => v.openTemplateId), variants.map(v => v.closedTemplateId)]) {
    expect(new Set(ids).size).toBe(ids.length);
  }
  for (const entry of [...placements, ...templates]) {
    expect(formulas.some(f => f.id === entry.formulaId), entry.id).toBe(true);
  }
  for (const placement of placements) {
    expect(templates.some(t => t.formulaId === placement.formulaId), placement.id).toBe(true);
  }
  for (const witness of witnesses) expect(placements.some(p => p.id === witness.instanceId)).toBe(true);
  for (const review of reviews) expect(witnesses.some(w => w.id === review.witnessId)).toBe(true);
  for (const review of templateReviews) expect(templates.some(t => t.id === review.templateId)).toBe(true);
  for (const variant of variants) {
    expect(templates.some(t => t.id === variant.openTemplateId)).toBe(true);
    expect(templates.some(t => t.id === variant.closedTemplateId)).toBe(true);
  }
});
