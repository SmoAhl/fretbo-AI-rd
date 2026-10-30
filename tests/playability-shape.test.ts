import { describe, expect, test } from "vitest";
import { createFretboard, type Fretboard } from "../domain/fretboard/fretboard.js";
import { chordShapeInstancesEqual, resolveChordShape, type ChordShapeInstance } from "../domain/playability/chord-shape.js";
import { instantiateReferenceChordShape } from "../domain/playability/reference-grips.js";

const strings = [52, 47, 43, 38, 33, 28].map((openPitch, i) => ({ id: i + 1, position: i + 1, openPitch }));
const board = createFretboard(strings, 13);
// Independently transcribed source rows (6 -> 1) and C0-based sounding pitches.
const fixtures = [
  ["open-c-major", ["x", 3, 2, 0, 1, 0], [36, 40, 43, 48, 52]],
  ["open-a-major", ["x", 0, 2, 2, 2, 0], [33, 40, 45, 49, 52]],
  ["open-g-major", [3, 2, 0, 0, 0, 3], [31, 35, 38, 43, 47, 55]],
  ["open-e-major", [0, 2, 2, 1, 0, 0], [28, 35, 40, 44, 47, 52]],
  ["open-d-major", ["x", "x", 0, 2, 3, 2], [38, 45, 50, 54]],
  ["c-major-a-shape", ["x", 3, 5, 5, 5, 3], [36, 43, 48, 52, 55]],
  ["c-major-g-shape", [8, 7, 5, 5, 5, 8], [36, 40, 43, 48, 52, 60]],
  ["c-major-e-shape", [8, 10, 10, 9, 8, 8], [36, 43, 48, 52, 55, 60]],
  ["c-major-d-shape", ["x", "x", 10, 12, 13, 12], [48, 55, 60, 64]],
  ["c-minor-a-shape", ["x", 3, 5, 5, 4, 3], [36, 43, 48, 51, 55]],
  ["c-minor-e-shape", [8, 10, 10, 8, 8, 8], [36, 43, 48, 51, 55, 60]],
  ["c-minor-d-shape", ["x", "x", 10, 12, 13, 11], [48, 55, 60, 63]],
  ["f-major-full-barre", [1, 3, 3, 2, 1, 1], [29, 36, 41, 45, 48, 53]],
] as const;

describe("documented placements", () => {
  test.each(fixtures)("reproduces %s geometry and registered pitches", (id, frets, pitches) => {
    const instance = instantiateReferenceChordShape(board, id);
    expect([...instance.strings].reverse().map((s) => "fret" in s ? s.fret : "x")).toEqual(frets);
    const result = resolveChordShape(board, instance);
    expect(result.status).toBe("valid");
    if (result.status !== "valid") throw new Error("Expected valid fixture");
    expect([...result.soundingLocations].reverse().map((s) => s.pitch)).toEqual(pitches);
    expect(result.instance.strings.map((s) => s.position)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(result.instance.strings.every((s) => s.state !== "muted")).toBe(true);
  });
  test.each(fixtures)("evaluates availability per instance: %s", (id, frets) => {
    const required = Math.max(...frets.filter((f): f is Exclude<typeof f, "x"> => f !== "x"));
    expect(() => instantiateReferenceChordShape(createFretboard(strings, required), id)).not.toThrow();
    expect(() => instantiateReferenceChordShape(createFretboard(strings, required - 1), id)).toThrow(RangeError);
  });
  test("noncontiguous IDs, reversed arrays and retuning preserve physical geometry", () => {
    const ids = [90, 4, 71, 8, 51, 3];
    const retuned = createFretboard(strings.map((s, i) => ({ ...s, id: ids[i]!, openPitch: 60 })).reverse(), 13);
    for (const [id, frets] of fixtures) {
      const instance = instantiateReferenceChordShape(retuned, id);
      expect(instance.strings.map((s) => s.stringId)).toEqual(ids);
      expect([...instance.strings].reverse().map((s) => "fret" in s ? s.fret : "x")).toEqual(frets);
      const result = resolveChordShape(retuned, instance);
      if (result.status !== "valid") throw new Error("Expected valid retuning");
      expect([...result.soundingLocations].reverse().map((s) => s.pitch))
        .toEqual(frets.filter((f) => f !== "x").map((f) => 60 + Number(f)));
    }
  });
  test("unknown IDs cannot select a reference", () => {
    expect(() => instantiateReferenceChordShape(board, "invented")).toThrow(RangeError);
  });
});

describe("supplied structural geometry", () => {
  const instance = instantiateReferenceChordShape(board, "open-c-major");
  test("accepts frozen geometry without provenance and copies every output", () => {
    const frozenBoard = Object.freeze({ fretCount: 13, strings: Object.freeze(strings.map((s) => Object.freeze({ ...s }))) });
    const supplied = Object.freeze({ id: "arbitrary", strings: Object.freeze([...instance.strings].reverse().map((s) => Object.freeze({ ...s }))) });
    const result = resolveChordShape(frozenBoard, supplied);
    if (result.status !== "valid") throw new Error("Expected valid frozen geometry");
    expect(result.instance).toEqual({ id: "arbitrary", strings: instance.strings });
    expect(result.instance.strings).not.toBe(supplied.strings);
    expect(result.instance.strings[0]).not.toBe(supplied.strings[5]);
    expect(Object.isFrozen(result.instance)).toBe(false);
    expect(chordShapeInstancesEqual(board, supplied, instance)).toBe(true);
    const unrelatedProvenance = { ...supplied, provenance: { formulaId: "unrelated", anchor: 999 } };
    expect(chordShapeInstancesEqual(board, unrelatedProvenance, instance)).toBe(true);
    const copied = resolveChordShape(board, instance);
    if (copied.status !== "valid") throw new Error("Expected valid geometry");
    expect(copied.instance.provenance).not.toBe(instance.provenance);
  });
  test("muted and unplayed remain distinct and neither sounds", () => {
    const muted = { ...instance, strings: instance.strings.map((s) => s.state === "unplayed" ? { ...s, state: "muted" as const } : s) };
    expect(chordShapeInstancesEqual(board, muted, instance)).toBe(false);
    const a = resolveChordShape(board, muted);
    const b = resolveChordShape(board, instance);
    if (a.status !== "valid" || b.status !== "valid") throw new Error("Expected valid geometry");
    expect(a.soundingLocations).toEqual(b.soundingLocations);
  });
  test("all-open and all-silent candidates work on arbitrary string counts", () => {
    for (const count of [1, 7]) {
      const custom = createFretboard(Array.from({ length: count }, (_, i) => ({ id: i + 1, position: i + 1, openPitch: 42 })), 0);
      for (const state of ["open", "muted", "unplayed"] as const) {
        const candidate: ChordShapeInstance = { id: "no-contact", strings: custom.strings.map((s) => state === "open"
          ? { stringId: s.id, position: s.position, state, fret: 0 }
          : { stringId: s.id, position: s.position, state }) };
        const result = resolveChordShape(custom, candidate);
        if (result.status !== "valid") throw new Error("Expected valid no-contact geometry");
        expect(result.soundingLocations).toHaveLength(state === "open" ? count : 0);
        expect(result.soundingLocations.map((s) => s.pitch)).toEqual(state === "open" ? Array(count).fill(42) : []);
      }
    }
  });
  const badStrings: unknown[] = [null, {}, [], new Array(6), [...instance.strings.slice(1)],
    ...[null, {}, { ...instance.strings[0], state: "other" },
      { ...instance.strings[0], position: 7 }, { ...instance.strings[0], stringId: 99 },
      { ...instance.strings[0], state: "open", fret: 1 },
      { ...instance.strings[0], state: "muted", fret: 0 },
      { ...instance.strings[0], state: "unplayed", fret: 1 },
      ...[-1, 0, 14, 0.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1, "1", null].map((fret) => ({ ...instance.strings[0], state: "fretted", fret })),
    ].map((first) => [first, ...instance.strings.slice(1)]),
    [instance.strings[1], ...instance.strings.slice(1)],
  ];
  test.each(badStrings.map((value, i) => ({ value, i })))("reports invalid string geometry $i", ({ value }) => {
    const candidate = { ...instance, strings: value } as ChordShapeInstance;
    expect(resolveChordShape(board, candidate)).toMatchObject({ status: "invalid", reasons: [expect.any(String)] });
    expect(() => chordShapeInstancesEqual(board, candidate, instance)).toThrow(RangeError);
  });
  test.each([null, undefined, {}, [], { ...instance, id: 4 }, { ...instance, provenance: null },
    { ...instance, provenance: { formulaId: "x", anchor: -1 } }])("reports malformed instance %j", (value) => {
    expect(resolveChordShape(board, value as ChordShapeInstance).status).toBe("invalid");
  });
  test("invalid boards still throw, including silent candidates", () => {
    const silent = { id: "silent", strings: strings.map((s) => ({ stringId: s.id, position: s.position, state: "unplayed" as const })) };
    for (const value of [null, {}, { strings, fretCount: -1 }, { strings: strings.map((s) => ({ ...s, position: 1 })), fretCount: 13 }]) {
      expect(() => resolveChordShape(value as Fretboard, silent)).toThrow(RangeError);
    }
  });
});
