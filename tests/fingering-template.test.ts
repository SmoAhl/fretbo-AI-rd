import { describe, expect, test } from "vitest";
import { createFretboard } from "../domain/fretboard/fretboard.js";
import { createChordShapeFormula } from "../domain/playability/chord-shape-formula.js";
import { resolveChordShape } from "../domain/playability/chord-shape.js";
import { createFingeringTemplate, instantiateTemplateFingering, templateAnchorBounds, type FingeringTemplate } from "../domain/playability/fingering-template.js";
import { closedCagedFingeringTemplate, referenceClosedCagedVariants, referenceChordShapeFormulas, referenceFingeringTemplates, referenceTemplateReviews } from "../domain/playability/reference-grips.js";

const board = createFretboard([52, 47, 43, 38, 33, 28].map((openPitch, i) => ({ id: 10 + i, position: i + 1, openPitch })), 15);
const formulas = referenceChordShapeFormulas();
const templates = referenceFingeringTemplates();
// Independent source geometry and sounding-finger rows, conventional 6 -> 1 order.
const closedRows = [
  ["closed-a-major", ["x", 0, 2, 2, 2, 0], ["x", 1, 2, 3, 4, 1]],
  ["closed-g-major", [3, 2, 0, 0, 0, 3], [3, 2, 1, 1, 1, 4]],
  ["closed-e-major", [0, 2, 2, 1, 0, 0], [1, 3, 4, 2, 1, 1]],
  ["closed-d-major", ["x", "x", 0, 2, 3, 2], ["x", "x", 1, 2, 4, 3]],
  ["closed-a-minor", ["x", 0, 2, 2, 1, 0], ["x", 1, 3, 4, 2, 1]],
  ["closed-e-minor", [0, 2, 2, 0, 0, 0], [1, 3, 4, 1, 1, 1]],
  ["closed-d-minor", ["x", "x", 0, 2, 3, 1], ["x", "x", 1, 3, 4, 2]],
  ["closed-c-major", ["x", 3, 2, 0, 1, 0], ["x", 4, 3, 1, 2, 1]],
] as const;

describe("relative reference templates", () => {
  test.each(closedRows)("moves %s to every available anchor without changing fingers", (id, offsets, fingers) => {
    const template = templates.find((t) => t.id === id)!;
    const formula = formulas.find((f) => f.id === template.formulaId)!;
    const highest = Math.max(...offsets.map((f) => f === "x" ? 0 : f));
    expect(templateAnchorBounds(board, formula, template)).toEqual({ min: 1, max: 15 - highest });
    for (let anchor = 1; anchor <= 15 - highest; anchor++) {
      const result = instantiateTemplateFingering(board, formula, template, anchor, "placed");
      expect([...result.instance.strings].reverse().map((s) => "fret" in s ? s.fret : "x"))
        .toEqual(offsets.map((f) => f === "x" ? f : anchor + f));
      expect(result.validation.status).toBe("valid");
      if (result.validation.status !== "valid") throw Error("Invalid fixture");
      const stops = result.validation.soundingFingers;
      expect([...result.instance.strings].reverse().map((s) => stops.find((f) => f.position === s.position)?.finger ?? "x")).toEqual(fingers);
      expect(result.instance.provenance?.anchor).toBe(anchor);
      const resolved = resolveChordShape(board, result.instance);
      if (resolved.status !== "valid") throw Error("Expected valid geometry");
      expect([...resolved.soundingLocations].reverse().map((l) => l.pitch)).toEqual(
        offsets.flatMap((offset, i) => offset === "x" ? [] : [[28, 33, 38, 43, 47, 52][i]! + anchor + offset]),
      );
    }
    expect(() => instantiateTemplateFingering(board, formula, template, 16 - highest, "outside")).toThrow(RangeError);
  });
  test("explicit variants preserve open forms and select independently defined closed geometry", () => {
    expect(templates).toHaveLength(13);
    expect(referenceTemplateReviews()).toHaveLength(13);
    expect(referenceClosedCagedVariants()).toHaveLength(5);
    for (const variant of referenceClosedCagedVariants()) {
      const open = templates.find((t) => t.id === variant.openTemplateId)!;
      const formula = formulas.find((f) => f.id === open.formulaId)!;
      expect(() => instantiateTemplateFingering(board, formula, open, 1, "bad")).toThrow(RangeError);
      expect(templateAnchorBounds(board, formula, open)).toEqual({ min: 0, max: 0 });
      expect(instantiateTemplateFingering(board, formula, open, 0, "open").validation.status).toBe("valid");
      expect(closedCagedFingeringTemplate(open.id).id).toBe(variant.closedTemplateId);
    }
    expect(() => closedCagedFingeringTemplate("invented")).toThrow(RangeError);
  });
  test("copy isolation, readonly inputs and no embedded execution in formulas", () => {
    const original = templates[7]!;
    const formula = formulas[7]!;
    const frozen = Object.freeze({ ...original, contacts: Object.freeze(original.contacts.map((c) => Object.freeze({ ...c }))) });
    const copy = createFingeringTemplate(formula, frozen);
    expect(copy).toEqual(frozen);
    expect(copy.contacts[0]).not.toBe(frozen.contacts[0]);
    (copy.contacts[0] as { offset: number }).offset = 99;
    expect(referenceFingeringTemplates()[7]).toEqual(original);
    expect(formula).not.toHaveProperty("contacts");
    const reviews = referenceTemplateReviews();
    (reviews[0] as { stringCount: number }).stringCount = 9;
    expect(referenceTemplateReviews()[0]!.stringCount).toBe(6);
  });
});

describe("generic relative construction", () => {
  const custom = createFretboard([{ id: 90, position: 1, openPitch: 0 }, { id: 4, position: 2, openPitch: 0 }], 12);
  const formula = createChordShapeFormula("custom", [{ position: 1, state: "fretted", offset: 0 }, { position: 2, state: "fretted", offset: 1 }]);
  const template: FingeringTemplate = { id: "custom", formulaId: "custom", contacts: [
    { finger: 1, offset: -3, fromPosition: 1, toPosition: 2 },
    { finger: 2, offset: 0, fromPosition: 1, toPosition: 1 },
    { finger: 3, offset: 1, fromPosition: 2, toPosition: 2 },
  ] };
  test("negative hidden contacts constrain placement bounds but never redefine the anchor", () => {
    expect(templateAnchorBounds(custom, formula, template)).toEqual({ min: 4, max: 11 });
    const result = instantiateTemplateFingering(custom, formula, template, 5, "custom");
    expect(result.instance.provenance?.anchor).toBe(5);
    expect(result.validation.status).toBe("valid");
    if (result.validation.status !== "valid") throw Error("Expected valid");
    expect(result.validation.contactSpan).toBe(4);
    expect(result.validation.witness.contacts.map((c) => c.fret)).toEqual([2, 5, 6]);
    expect(() => instantiateTemplateFingering(custom, formula, template, 3, "invalid")).toThrow(RangeError);
  });
  test("one finger with conflicting duties is a validator finding", () => {
    const result = instantiateTemplateFingering(custom, formula, { ...template, contacts: template.contacts.map((c) => ({ ...c, finger: 1 })) }, 5, "invalid");
    expect(result.validation.status).toBe("invalid");
  });
  test("checked addition cannot overflow at safe-integer limits", () => {
    const huge = createFretboard([{ id: 1, position: 1, openPitch: 0 }], Number.MAX_SAFE_INTEGER);
    const one = createChordShapeFormula("one", [{ position: 1, state: "fretted", offset: 0 }]);
    const execution: FingeringTemplate = { id: "one", formulaId: "one", contacts: [{ finger: 1, offset: 1, fromPosition: 1, toPosition: 1 }] };
    expect(templateAnchorBounds(huge, one, execution)?.max).toBe(Number.MAX_SAFE_INTEGER - 1);
    expect(() => instantiateTemplateFingering(huge, one, execution, Number.MAX_SAFE_INTEGER, "bad")).toThrow(RangeError);
  });
  test.each([NaN, Infinity, 0.5, Number.MAX_SAFE_INTEGER + 1])("rejects invalid offset %s before addition", (offset) => {
    expect(() => createFingeringTemplate(formula, { ...template, contacts: [{ ...template.contacts[0]!, offset }] })).toThrow(RangeError);
  });
  test.each([null, {}, [], { id: "x", formulaId: "other", contacts: [] }, { id: "x", formulaId: "custom", contacts: new Array(1) }])("rejects malformed templates %j", (value) => {
    expect(() => createFingeringTemplate(formula, value as FingeringTemplate)).toThrow(RangeError);
  });
});
