import { describe, expect, expectTypeOf, test } from "vitest";
import { createFretboard } from "../domain/fretboard/fretboard.js";
import {
  createChordShapeFormula, validateChordShapeFormula, chordShapeFormulasEqual, instantiateChordShape,
  type ChordShapeFormula, type ChordShapeFormulaString,
} from "../domain/playability/chord-shape-formula.js";
import { referenceChordShapeFormulas, referenceChordShapePlacements } from "../domain/playability/reference-grips.js";
import { type ChordShapeInstance, type ChordShapeString } from "../domain/playability/chord-shape.js";

const closed = createChordShapeFormula("closed", [
  { position: 1, state: "fretted", offset: 0 }, { position: 2, state: "fretted", offset: 2 },
]);
const board = createFretboard([{ id: 90, position: 1, openPitch: 0 }, { id: 4, position: 2, openPitch: 0 }], 12);

describe("geometry-only formulas", () => {
  test("has exactly twelve distinct formulas, thirteen placements and one open C", () => {
    const formulas = referenceChordShapeFormulas();
    const placements = referenceChordShapePlacements();
    expect(formulas).toHaveLength(12);
    expect(placements).toHaveLength(13);
    expect(placements.filter((p) => p.id === "open-c-major")).toHaveLength(1);
    expect(placements.filter((p) => p.formulaId === "shape-08").map((p) => p.id))
      .toEqual(["c-major-e-shape", "f-major-full-barre"]);
    for (let i = 0; i < formulas.length; i++) {
      validateChordShapeFormula(formulas[i]!);
      for (let j = i + 1; j < formulas.length; j++) {
        expect(chordShapeFormulasEqual(formulas[i]!, formulas[j]!)).toBe(false);
      }
    }
  });

  test("identity ignores labels, ordering, tuning, witness and review metadata", () => {
    const decorated = { id: "different", strings: [...closed.strings].reverse(), tuning: [5, 3],
      witnesses: [{ contacts: [1, 2, 3] }], approved: true };
    expect(chordShapeFormulasEqual(closed, decorated)).toBe(true);
    expect(createChordShapeFormula(decorated.id, decorated.strings)).toEqual({ id: "different", strings: closed.strings });
    expect(chordShapeFormulasEqual(closed, createChordShapeFormula("closed", [
      { position: 1, state: "fretted", offset: 0 }, { position: 2, state: "fretted", offset: 3 },
    ]))).toBe(false);
    expect(chordShapeFormulasEqual(createChordShapeFormula("a", [{ position: 1, state: "muted" }]),
      createChordShapeFormula("a", [{ position: 1, state: "unplayed" }]))).toBe(false);
  });

  test("copies frozen inputs and isolates returned library records", () => {
    const input = Object.freeze(closed.strings.map((s) => Object.freeze({ ...s })));
    const copy = createChordShapeFormula("copy", input);
    expect(copy.strings).toEqual(input);
    expect(copy.strings).not.toBe(input);
    expect(copy.strings[0]).not.toBe(input[0]);
    expect(Object.isFrozen(copy.strings)).toBe(false);
    const formulas = referenceChordShapeFormulas();
    (formulas[0]!.strings[0] as { state: string }).state = "muted";
    (referenceChordShapePlacements()[0] as { anchor: number }).anchor = 99;
    expect(referenceChordShapeFormulas()[0]!.strings[0]!.state).toBe("open");
    expect(referenceChordShapePlacements()[0]!.anchor).toBe(0);
  });

  const badStates: unknown[] = [null, undefined, {}, [], new Array(1), [null], [undefined], [[]], [{}],
    [{ position: 0, state: "open" }], [{ position: 2, state: "open" }],
    [{ position: 1, state: "open" }, { position: 1, state: "open" }],
    [{ position: 1, state: "unknown" }], [{ position: 1, state: "open", offset: 0 }],
    [{ position: 1, state: "muted", offset: 1 }], [{ position: 1, state: "fretted" }],
    [{ position: 1, state: "fretted", offset: 1 }],
    [{ position: 1, state: "open" }, { position: 2, state: "fretted", offset: 0 }],
    ...[-1, 0.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1, "0", null].flatMap((value) => [
      [{ position: value, state: "open" }], [{ position: 1, state: "fretted", offset: value }],
    ]),
  ];
  test.each(badStates.map((states, i) => ({ states, i })))("rejects malformed/non-normalized states $i", ({ states }) => {
    expect(() => createChordShapeFormula("bad", states as readonly ChordShapeFormulaString[])).toThrow(RangeError);
  });
  test.each([null, undefined, {}, [], { id: "x" }, { strings: closed.strings }, { id: 3, strings: closed.strings }])(
    "rejects malformed formula %j", (value) => {
      expect(() => validateChordShapeFormula(value as ChordShapeFormula)).toThrow(RangeError);
      expect(() => chordShapeFormulasEqual(closed, value as ChordShapeFormula)).toThrow(RangeError);
    });

  test("closed zero offsets stay fretted at the positive anchor", () => {
    expect(instantiateChordShape(board, closed, 3, "placed")).toEqual({ id: "placed",
      provenance: { formulaId: "closed", anchor: 3 }, strings: [
        { position: 1, stringId: 90, state: "fretted", fret: 3 },
        { position: 2, stringId: 4, state: "fretted", fret: 5 },
      ] });
  });
  test.each([0, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1])("rejects closed anchor %s", (anchor) => {
    expect(() => instantiateChordShape(board, closed, anchor, "bad")).toThrow(RangeError);
  });
  test("open and no-stop geometry use only anchor zero", () => {
    for (const state of ["open", "muted", "unplayed"] as const) {
      const formula = createChordShapeFormula("no-stops", [{ position: 1, state }]);
      const zeroBoard = createFretboard([{ id: 7, position: 1, openPitch: 40 }], 0);
      expect(instantiateChordShape(zeroBoard, formula, 0, "ok").strings[0]!.state).toBe(state);
      expect(() => instantiateChordShape(zeroBoard, formula, 1, "bad")).toThrow(RangeError);
    }
    const mixed = createChordShapeFormula("mixed", [
      { position: 1, state: "open" }, { position: 2, state: "fretted", offset: 2 },
    ]);
    expect(instantiateChordShape(board, mixed, 0, "ok").strings[0]).toMatchObject({ state: "open", fret: 0 });
    expect(() => instantiateChordShape(board, mixed, 2, "bad")).toThrow(RangeError);
  });
  test("checks board size, bounds and exact addition at safe integer limits", () => {
    const max = Number.MAX_SAFE_INTEGER;
    const huge = createFretboard(board.strings, max);
    expect(instantiateChordShape(huge, closed, max - 2, "edge").strings[1]).toMatchObject({ fret: max });
    expect(() => instantiateChordShape(huge, closed, max - 1, "overflow")).toThrow(RangeError);
    expect(() => instantiateChordShape(board, closed, 11, "outside")).toThrow(RangeError);
    const oneString = createFretboard([{ id: 90, position: 1, openPitch: 0 }], 12);
    expect(() => instantiateChordShape(oneString, closed, 1, "size")).toThrow(RangeError);
    const offsetLimit = createChordShapeFormula("large-offset", [
      { position: 1, state: "fretted", offset: 0 }, { position: 2, state: "fretted", offset: max },
    ]);
    expect(() => instantiateChordShape(huge, offsetLimit, 1, "overflow")).toThrow(RangeError);
  });
});

test("readonly types exclude execution, review and pitch fields", () => {
  expectTypeOf<keyof ChordShapeFormula>().toEqualTypeOf<"id" | "strings">();
  expectTypeOf<keyof ChordShapeInstance>().toEqualTypeOf<"id" | "strings" | "provenance">();
  expectTypeOf<Extract<ChordShapeFormulaString, { state: "fretted" }>>()
    .toEqualTypeOf<Readonly<{ position: number }> & Readonly<{ state: "fretted"; offset: number }>>();
  if (false) {
    // @ts-expect-error Formula arrays are readonly.
    closed.strings.push({ position: 3, state: "open" });
    // @ts-expect-error Formula IDs are readonly.
    closed.id = "changed";
    // @ts-expect-error No fingering fields on geometry.
    const formula: ChordShapeFormula = { id: "bad", strings: [], fingers: [] };
    // @ts-expect-error No approval on an instance.
    const instance: ChordShapeInstance = { id: "bad", strings: [], approved: true };
    // @ts-expect-error No finger assignment on a concrete string.
    const string: ChordShapeString = { stringId: 1, position: 1, state: "fretted", fret: 1, finger: 1 };
    void formula; void instance; void string;
  }
});
