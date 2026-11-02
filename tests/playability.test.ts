import { describe, expect, test } from "vitest";
import { createFretboard } from "../domain/fretboard/fretboard.js";
import { triadFormula } from "../domain/music-theory/chords-symbols-and-realization/triads.js";
import { createPitchClassChordDescription, createSpelledChordDescription } from "../domain/music-theory/chords-symbols-and-realization/chord-descriptions.js";
import { type PitchClass } from "../domain/music-theory/pitch-pitch-classes-and-spelling/pitch-class.js";
import { createChordShapeFormula } from "../domain/playability/chord-shape-formula.js";
import { type FingeringTemplate, instantiateTemplateFingering } from "../domain/playability/fingering-template.js";
import { assessChordShape, type ChordShapeRequirements } from "../domain/playability/playability.js";
import { findChordTemplateFingerings, type TemplateSearchOptions } from "../domain/playability/template-search.js";
import { referenceChordShapeFormulas, referenceFingeringTemplates, referenceChordShapePlacements, instantiateReferenceChordShape } from "../domain/playability/reference-grips.js";

const board = createFretboard([52, 47, 43, 38, 33, 28].map((openPitch, i) => ({ id: i + 1, position: i + 1, openPitch })), 24);
const request = (root: PitchClass, quality: "major" | "minor" = "major"): ChordShapeRequirements => ({ description: createPitchClassChordDescription(root, triadFormula(quality)) });
const options = (templateIds: string[], min = 0, max = 24): TemplateSearchOptions => ({ templateIds, anchorRange: { min, max } });
const cases = [
  ["closed-e-major", 8, "major", 4, [4, 6, 6, 5, 4, 4], [1, 3, 4, 2, 1, 1]],
  ["closed-e-minor", 8, "minor", 4, [4, 6, 6, 4, 4, 4], [1, 3, 4, 1, 1, 1]],
  ["closed-c-major", 2, "major", 2, ["x", 5, 4, 2, 3, 2], ["x", 4, 3, 1, 2, 1]],
] as const;

describe("integrated movable template path", () => {
  test.each(cases)("finds %s with music and template support", (id, root, quality, anchor, frets, fingers) => {
    const results = findChordTemplateFingerings(board, request(root, quality), options([id]));
    expect(results.map((r) => r.anchor)).toEqual([anchor, anchor + 12]);
    const result = results[0]!;
    expect([...result.instance.strings].reverse().map((s) => "fret" in s ? s.fret : "x")).toEqual(frets);
    const validation = result.assessment.witnessFindings[0]!.validation;
    if (validation.status !== "valid") throw Error("Expected valid witness");
    expect([...result.instance.strings].reverse().map((s) => validation.soundingFingers.find((f) => f.position === s.position)?.finger ?? "x")).toEqual(fingers);
    expect(result.assessment.musical.status).toBe("matched");
    expect(result.assessment.physicalSupport).toEqual({ status: "supported", templateIds: [id] });
    expect(result.assessment.recommendationEligible).toBe(true);
    expect(referenceChordShapePlacements().some((p) => p.anchor === anchor && p.formulaId === result.formulaId)).toBe(false);
  });
  test("all thirteen historical placements retain support and independently specified music", () => {
    const roots = [0, 9, 7, 4, 2, 0, 0, 0, 0, 0, 0, 0, 5] as const;
    referenceChordShapePlacements().forEach((p, i) => {
      const result = assessChordShape(board, instantiateReferenceChordShape(board, p.id), request(roots[i]!, i >= 9 && i <= 11 ? "minor" : "major"));
      expect(result.recommendationEligible).toBe(true);
    });
  });
  test("every closed pattern realizes transposed music at every available anchor", () => {
    const bases = [["closed-a-major", 9, "major"], ["closed-g-major", 7, "major"], ["closed-e-major", 4, "major"],
      ["closed-d-major", 2, "major"], ["closed-c-major", 0, "major"], ["closed-a-minor", 9, "minor"],
      ["closed-e-minor", 4, "minor"], ["closed-d-minor", 2, "minor"]] as const;
    for (const [id, base, quality] of bases) {
      const template = referenceFingeringTemplates().find((t) => t.id === id)!;
      const formula = referenceChordShapeFormulas().find((f) => f.id === template.formulaId)!;
      const highest = Math.max(...formula.strings.map((s) => s.state === "fretted" ? s.offset : 0));
      for (let anchor = 1; anchor <= 24 - highest; anchor++) {
        const result = findChordTemplateFingerings(board, request(((base + anchor) % 12) as PitchClass, quality), options([id], anchor, anchor));
        expect(result).toHaveLength(1);
        expect(result[0]!.assessment.recommendationEligible).toBe(true);
      }
    }
  });
  test("mismatch does not erase pattern support; unspecified bass does not demand root position", () => {
    const instance = instantiateReferenceChordShape(board, "open-c-major");
    expect(assessChordShape(board, instance, request(2)).musical.status).toBe("mismatched");
    expect(assessChordShape(board, instance, request(2)).physicalSupport.status).toBe("supported");
    const changed = createFretboard(board.strings.map((s) => ({ ...s, openPitch: s.position === 1 ? 4 : s.openPitch })), 24);
    const a = assessChordShape(changed, instance, request(0));
    expect(a.recommendationEligible).toBe(true);
    const b = assessChordShape(changed, instance, { description: createPitchClassChordDescription(0, triadFormula("major"), 0) });
    expect(b.musical.status).toBe("mismatched");
    expect(b.physicalSupport.status).toBe("supported");
  });
  test("uniform retuning changes chord identity without losing pattern support", () => {
    const shifted = createFretboard(board.strings.map((s) => ({ ...s, id: s.id * 17, openPitch: s.openPitch + 1 })).reverse(), 24);
    expect(findChordTemplateFingerings(shifted, request(9), options(["closed-e-major"], 4, 4))[0]!.assessment.recommendationEligible).toBe(true);
    expect(findChordTemplateFingerings(shifted, request(8), options(["closed-e-major"], 4, 4))).toEqual([]);
  });
  test("invalid witnesses do not veto valid ones; swapped fingers do not inherit support", () => {
    const found = findChordTemplateFingerings(board, request(8), options(["closed-e-major"], 4, 4))[0]!;
    const invalid = { ...found.witness, contacts: [] };
    const swapped = { ...found.witness, contacts: found.witness.contacts.map((c) => ({ ...c, finger: c.finger === 3 ? 4 as const : c.finger === 4 ? 3 as const : c.finger })) };
    const unsupported = assessChordShape(board, found.instance, request(8), [swapped]);
    expect(unsupported.witnessFindings[0]!.validation.status).toBe("valid");
    expect(unsupported.physicalSupport.status).toBe("unverified");
    const result = assessChordShape(board, found.instance, request(8), [invalid, found.witness]);
    expect(result.witnessFindings.map((f) => f.validation.status)).toEqual(["invalid", "valid"]);
    expect(result.recommendationEligible).toBe(true);
    expect(assessChordShape(board, found.instance, request(8), []).physicalSupport.status).toBe("unverified");
  });
  test("actual geometry and contacts establish support regardless of IDs or provenance", () => {
    const found = findChordTemplateFingerings(board, request(8), options(["closed-e-major"], 4, 4))[0]!;
    const renamed = { ...found.instance, id: "renamed", provenance: { formulaId: "forged", anchor: 99 } };
    expect(assessChordShape(board, renamed, request(8)).recommendationEligible).toBe(true);
    const altered = { ...found.instance, strings: found.instance.strings.map((s) => s.position === 1 ? { stringId: s.stringId, position: s.position, state: "unplayed" as const } : s) };
    expect(assessChordShape(board, altered, request(8)).physicalSupport.status).toBe("unverified");
    const malformed = assessChordShape(board, { ...found.instance, strings: [] }, request(8));
    expect(malformed.musical.status).toBe("not-assessed");
    expect(malformed.physicalSupport.status).toBe("not-assessed");
  });
});

describe("musical requirements", () => {
  const instance = instantiateReferenceChordShape(board, "open-c-major");
  const pitches = [36, 40, 43, 48, 52];
  test("exact register and every repeated occurrence are preserved", () => {
    const exact = { ...request(0), exactVoicing: { pitches } };
    const result = assessChordShape(board, instance, exact);
    expect(result.musical.status).toBe("matched");
    if (result.musical.status === "not-assessed") throw Error("Expected music");
    expect(result.musical.occurrenceLocationIndices).toEqual([4, 3, 2, 1, 0]);
    for (const changed of [[48, 40, 43, 48, 52], pitches.slice(1), [...pitches, 36], [36, 36, 43, 48, 52]]) {
      expect(assessChordShape(board, instance, { ...exact, exactVoicing: { pitches: changed } }).musical.status).toBe("mismatched");
    }
    expect(result.requirements.exactVoicing).not.toBe(exact.exactVoicing);
  });
  test("optional roles do not relax exact voicings; missing required and unexpected tones fail", () => {
    const major7 = { description: createPitchClassChordDescription(0, [...triadFormula("major"), { number: 7, alteration: 0 }]) };
    expect(assessChordShape(board, instance, major7).musical.status).toBe("mismatched");
    expect(assessChordShape(board, instance, { ...major7, optionalFormulaIndices: [3] }).musical.status).toBe("matched");
    expect(assessChordShape(board, instance, { ...major7, optionalFormulaIndices: [3], exactVoicing: { pitches: [...pitches, 47] } }).musical.status).toBe("mismatched");
    expect(assessChordShape(board, instance, request(0, "minor")).musical.status).toBe("mismatched");
  });
  test("spelled exact matching preserves written identities instead of respelling board pitches", () => {
    const description = createSpelledChordDescription({ letter: "C", accidental: 0 }, triadFormula("major"));
    const notes = [{ letter: "C", accidental: 0, octave: 3 }, { letter: "E", accidental: 0, octave: 3 }, { letter: "G", accidental: 0, octave: 3 }, { letter: "C", accidental: 0, octave: 4 }, { letter: "E", accidental: 0, octave: 4 }] as const;
    expect(assessChordShape(board, instance, { description, exactVoicing: { notes } }).musical.status).toBe("matched");
    const enharmonic = [{ letter: "B" as const, accidental: 1 as const, octave: 2 }, ...notes.slice(1)];
    expect(assessChordShape(board, instance, { description, exactVoicing: { notes: enharmonic } }).musical.status).toBe("mismatched");
  });
  test("custom seventh formulas use generic search without new production shapes", () => {
    const customBoard = createFretboard([59, 63, 66, 69].map((openPitch, i) => ({ id: i + 1, position: i + 1, openPitch })), 2);
    const formula = createChordShapeFormula("custom-seventh", customBoard.strings.map((s) => ({ position: s.position, state: "fretted", offset: 0 })));
    const template: FingeringTemplate = { id: "custom-seventh", formulaId: formula.id, contacts: [{ finger: 1, offset: 0, fromPosition: 1, toPosition: 4 }] };
    const requirements = { description: createPitchClassChordDescription(0, [...triadFormula("major"), { number: 7, alteration: -1 }]) };
    const result = findChordTemplateFingerings(customBoard, requirements, options([template.id], 1, 2), { formulas: [formula], templates: [template] });
    expect(result).toHaveLength(1);
    expect(result[0]!.anchor).toBe(1);
    expect(result[0]!.assessment.musical.status).toBe("matched");
    expect(result[0]!.assessment.physicalSupport.status).toBe("unverified");
  });
  test("only lowest specified non-chord bass occurrences are permitted", () => {
    const customBoard = createFretboard([5, 11, 15, 18, 23].map((openPitch, i) => ({ id: i + 1, position: i + 1, openPitch })), 2);
    const formula = createChordShapeFormula("bass", customBoard.strings.map((s) => ({ position: s.position, state: "fretted", offset: 0 })));
    const template: FingeringTemplate = { id: "bass", formulaId: formula.id, contacts: [{ finger: 1, offset: 0, fromPosition: 1, toPosition: 5 }] };
    const requirements = { description: createPitchClassChordDescription(0, triadFormula("major"), 6) };
    const { instance } = instantiateTemplateFingering(customBoard, formula, template, 1, "bass");
    expect(assessChordShape(customBoard, instance, requirements).musical.status).toBe("matched");
    const extra = createFretboard(customBoard.strings.map((s) => s.position === 5 ? { ...s, openPitch: 29 } : s), 2);
    expect(assessChordShape(extra, instance, requirements).musical.status).toBe("mismatched");
  });
});

describe("bounded generic template search", () => {
  const formula = createChordShapeFormula("custom", [{ position: 1, state: "fretted", offset: 0 }]);
  const template: FingeringTemplate = { id: "a", formulaId: "custom", contacts: [{ finger: 1, offset: 0, fromPosition: 1, toPosition: 1 }] };
  const custom = createFretboard([{ id: 71, position: 1, openPitch: 0 }], 10001);
  const single: ChordShapeRequirements = { description: createPitchClassChordDescription(0, [{ number: 1, alteration: 0 }]) };
  const catalog = { formulas: [formula], templates: [template] };
  test("budget counts candidates before musical filtering and accepts the exact cap", () => {
    expect(() => findChordTemplateFingerings(custom, single, options(["a"], 1, 10001), catalog)).toThrow(/10,000/);
    const results = findChordTemplateFingerings(custom, single, options(["a"], 1, 10000), catalog);
    expect(results).toHaveLength(833);
    expect(results[0]!.anchor).toBe(12);
    expect(results.at(-1)!.anchor).toBe(9996);
    expect(results.every((r) => !r.assessment.recommendationEligible)).toBe(true);
  });
  test("multiple executions remain separate, sorted independently of catalog and selection order", () => {
    const alternate = { ...template, id: "b", contacts: [{ ...template.contacts[0]!, finger: 2 as const }] };
    const broken = { ...template, id: "broken", contacts: [] };
    const results = findChordTemplateFingerings(custom, single, options(["b", "broken", "a"], 12, 24), { formulas: [formula], templates: [alternate, broken, template] });
    expect(results.map((r) => [r.anchor, r.templateId])).toEqual([[12, "a"], [12, "b"], [24, "a"], [24, "b"]]);
  });
  test("range ending at MAX_SAFE_INTEGER terminates and hidden contacts restrict availability", () => {
    const huge = createFretboard([{ id: 71, position: 1, openPitch: 0 }], Number.MAX_SAFE_INTEGER);
    const result = findChordTemplateFingerings(huge, { description: createPitchClassChordDescription(7, [{ number: 1, alteration: 0 }]) }, options(["a"], Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER), catalog);
    expect(result).toHaveLength(1);
    const hidden = { ...template, contacts: [{ finger: 2 as const, offset: 0, fromPosition: 1, toPosition: 1 }, { finger: 1 as const, offset: -12, fromPosition: 1, toPosition: 1 }] };
    expect(findChordTemplateFingerings(custom, single, options(["a"], 1, 24), { ...catalog, templates: [hidden] }).map((r) => r.anchor)).toEqual([24]);
  });
  test("custom catalog cannot grant support using familiar IDs", () => {
    const f = { ...formula, id: "shape-08" };
    const t = { ...template, id: "closed-e-major", formulaId: f.id };
    expect(findChordTemplateFingerings(custom, single, options([t.id], 12, 12), { formulas: [f], templates: [t] })[0]!.assessment.physicalSupport.status).toBe("unverified");
  });
  test("empty and unavailable searches validate requests and return no candidates", () => {
    expect(findChordTemplateFingerings(board, request(0), options([]))).toEqual([]);
    expect(findChordTemplateFingerings(board, request(0), options(["open-c-major"], 1, 24))).toEqual([]);
    expect(findChordTemplateFingerings(board, request(0), options(["closed-c-major"], 23, 24))).toEqual([]);
    expect(() => findChordTemplateFingerings(board, { ...request(0), optionalFormulaIndices: [99] }, options([]))).toThrow(RangeError);
  });
  test.each([options(["unknown"]), options(["closed-e-major", "closed-e-major"]), options([], -1, 2), options([], 2, 1), options([], 0, 25), options([], 0, Infinity)])("rejects invalid search options %j", (o) => {
    expect(() => findChordTemplateFingerings(board, request(0), o)).toThrow(RangeError);
  });
  test("inputs can be frozen and results are independent", () => {
    const frozen = Object.freeze({ description: Object.freeze({ root: 0 as const, formula: Object.freeze([{ number: 1, alteration: 0 } as const]) }) });
    const results = findChordTemplateFingerings(custom, frozen, Object.freeze(options(["a"], 12, 24)), catalog);
    (results[0]!.witness.contacts[0] as { fret: number }).fret = 99;
    expect(results[1]!.witness.contacts[0]!.fret).toBe(24);
    expect(template.contacts[0]!.offset).toBe(0);
  });
  test("malformed catalogs and sparse selections fail even without results", () => {
    for (const bad of [
      { ...catalog, formulas: [formula, formula] }, { ...catalog, templates: [template, template] },
      { ...catalog, templates: [{ ...template, formulaId: "missing" }] },
      { ...catalog, templates: new Array(1) }, { ...catalog, formulas: new Array(1) },
    ]) expect(() => findChordTemplateFingerings(custom, single, options([], 0, 1), bad)).toThrow(RangeError);
    expect(() => findChordTemplateFingerings(custom, single, options(new Array(1), 0, 1), catalog)).toThrow(RangeError);
  });
});
