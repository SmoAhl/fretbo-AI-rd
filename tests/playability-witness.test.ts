import { describe, expect, test } from "vitest";
import { createFretboard, type Fretboard } from "../domain/fretboard/fretboard.js";
import { createChordShapeFormula, instantiateChordShape } from "../domain/playability/chord-shape-formula.js";
import { resolveChordShape, type ChordShapeInstance } from "../domain/playability/chord-shape.js";
import { validateFingeringWitness, type FingerContact, type FingeringWitness } from "../domain/playability/fingering-witness.js";
import { instantiateReferenceChordShape, referenceFingeringReviews, referenceFingeringWitnesses } from "../domain/playability/reference-grips.js";

const board = createFretboard([52, 47, 43, 38, 33, 28].map((openPitch, i) => ({ id: i + 1, position: i + 1, openPitch })), 13);
const contact = (finger: FingerContact["finger"], fret: number, fromPosition: number, toPosition = fromPosition): FingerContact =>
  ({ finger, fret, fromPosition, toPosition });
const witness = (instanceId: string, contacts: readonly FingerContact[], id = "test"): FingeringWitness => ({ id, instanceId, contacts });
function valid(board: Fretboard, instance: ChordShapeInstance, candidate: FingeringWitness) {
  const result = validateFingeringWitness(board, instance, candidate);
  expect(result.status).toBe("valid");
  if (result.status !== "valid") throw new Error(result.reasons.join(" "));
  return result;
}

// Independent source finger rows (6 -> 1), span, and explicit barre extents.
const fixtures = [
  ["open-c-major", ["x", 3, 2, 0, 1, 0], 2, []],
  ["open-a-major", ["x", 0, 1, 2, 3, 0], 0, []],
  ["open-g-major", [2, 1, 0, 0, 0, 4], 1, []],
  ["open-e-major", [0, 2, 3, 1, 0, 0], 1, []],
  ["open-d-major", ["x", "x", 0, 1, 3, 2], 1, []],
  ["c-major-a-shape", ["x", 1, 2, 3, 4, 1], 2, [[1, 3, 1, 5]]],
  ["c-major-g-shape", [3, 2, 1, 1, 1, 4], 3, [[1, 5, 2, 4]]],
  ["c-major-e-shape", [1, 3, 4, 2, 1, 1], 2, [[1, 8, 1, 6]]],
  ["c-major-d-shape", ["x", "x", 1, 2, 4, 3], 3, []],
  ["c-minor-a-shape", ["x", 1, 3, 4, 2, 1], 2, [[1, 3, 1, 5]]],
  ["c-minor-e-shape", [1, 3, 4, 1, 1, 1], 2, [[1, 8, 1, 6]]],
  ["c-minor-d-shape", ["x", "x", 1, 3, 4, 2], 3, []],
  ["f-major-full-barre", [1, 3, 4, 2, 1, 1], 2, [[1, 1, 1, 6]]],
] as const;

describe("independent documented witnesses", () => {
  test.each(fixtures)("reproduces %s fingers, span and complete barre", (id, row, span, barres) => {
    const instance = instantiateReferenceChordShape(board, id);
    const candidate = referenceFingeringWitnesses().find((w) => w.instanceId === id)!;
    const result = valid(board, instance, candidate);
    expect([...instance.strings].reverse().map((s) => result.soundingFingers.find((f) => f.position === s.position)?.finger ?? "x")).toEqual(row);
    expect(result.contactSpan).toBe(span);
    expect(result.witness.contacts.filter((c) => c.fromPosition !== c.toPosition)
      .map((c) => [c.finger, c.fret, c.fromPosition, c.toPosition])).toEqual(barres);
    expect(result.soundingFingers.every((s) => instance.strings.some((i) => i.stringId === s.stringId && "fret" in i && i.fret === s.fret))).toBe(true);
    expect(result).not.toHaveProperty("recommendationEligible");
    expect(result.witness).not.toHaveProperty("review");
  });
  test("library coverage and separate review contexts are complete and independently copied", () => {
    const witnesses = referenceFingeringWitnesses();
    const reviews = referenceFingeringReviews();
    expect(witnesses).toHaveLength(13);
    expect(new Set(witnesses.map((w) => w.id)).size).toBe(13);
    expect(witnesses.map((w) => w.instanceId)).toEqual(fixtures.map(([id]) => id));
    expect(reviews.map((r) => r.witnessId)).toEqual(witnesses.map((w) => w.id));
    expect(witnesses.filter((w) => w.contacts.every((c) => c.fromPosition === c.toPosition))).toHaveLength(7);
    expect(witnesses.filter((w) => w.contacts.some((c) => c.toPosition - c.fromPosition === 5))).toHaveLength(3);
    expect(witnesses.filter((w) => w.contacts.some((c) => c.toPosition > c.fromPosition && c.toPosition - c.fromPosition < 5))).toHaveLength(3);
    for (const review of reviews) {
      expect(review.source).toBe("docs/PLAYABILITY_REFERENCE.md");
      expect(review.context).toEqual([52, 47, 43, 38, 33, 28].map((openPitch, i) => ({ position: i + 1, openPitch })));
    }
    (witnesses[0]!.contacts[0] as { fret: number }).fret = 99;
    (reviews[0]!.context[0] as { openPitch: number }).openPitch = 99;
    expect(referenceFingeringWitnesses()[0]!.contacts[0]!.fret).toBe(1);
    expect(referenceFingeringReviews()[0]!.context[0]!.openPitch).toBe(52);
    expect(reviews[1]!.context[0]!.openPitch).toBe(52);
  });
  test("noncontiguous IDs, reentrant tuning, permutations and frozen inputs preserve contact behavior", () => {
    const custom = Object.freeze(createFretboard(board.strings.map((s, i) => ({ ...s, id: [91, 2, 73, 4, 55, 6][i]!, openPitch: i % 2 ? 80 : 20 })).reverse(), 13));
    for (const candidate of referenceFingeringWitnesses()) {
      const instance = instantiateReferenceChordShape(custom, candidate.instanceId);
      const frozenShape = Object.freeze({ ...instance, strings: Object.freeze([...instance.strings].reverse().map((s) => Object.freeze(s))) });
      const frozenWitness = Object.freeze({ ...candidate, contacts: Object.freeze([...candidate.contacts].reverse().map((c) => Object.freeze(c))) });
      const result = valid(custom, frozenShape, frozenWitness);
      expect(result.witness).toEqual(candidate);
      expect(result.witness.contacts).not.toBe(frozenWitness.contacts);
      expect(result.witness.contacts[0]).not.toBe(frozenWitness.contacts.at(-1));
      expect(result.soundingFingers.map((s) => s.position)).toEqual([...result.soundingFingers.map((s) => s.position)].sort((a, b) => a - b));
      expect(result.soundingFingers.every((s) => custom.strings.some((b) => b.position === s.position && b.id === s.stringId))).toBe(true);
      expect(Object.isFrozen(result.witness)).toBe(false);
    }
  });
});

describe("geometry and execution separation", () => {
  const custom = createFretboard([{ id: 30, position: 1, openPitch: 40 }, { id: 10, position: 2, openPitch: 50 }], 12);
  const formula = createChordShapeFormula("synthetic", [{ position: 1, state: "fretted", offset: 0 }, { position: 2, state: "fretted", offset: 1 }]);
  const instance = instantiateChordShape(custom, formula, 5, "same-instance");
  test("hidden lower barre changes only witness span, not formula, anchor or sounding geometry", () => {
    const before = JSON.stringify({ formula, instance });
    const direct = witness(instance.id, [contact(2, 5, 1), contact(3, 6, 2)], "direct");
    const hidden = witness(instance.id, [contact(1, 2, 1, 2), ...direct.contacts], "hidden");
    const a = valid(custom, instance, direct);
    const b = valid(custom, instance, hidden);
    expect(a.contactSpan).toBe(1);
    expect(b.contactSpan).toBe(4);
    expect(a.soundingFingers).toEqual(b.soundingFingers);
    expect(b.witness.contacts[0]).toEqual(contact(1, 2, 1, 2));
    expect(instance.provenance?.anchor).toBe(5);
    expect(JSON.stringify({ formula, instance })).toBe(before);
    expect(a.witness.instanceId).toBe(b.witness.instanceId);
    expect(a.witness).not.toHaveProperty("strings");
  });
  test("invalid witness does not veto a valid alternative or invalidate geometry", () => {
    const results = [witness(instance.id, []), witness(instance.id, [contact(1, 5, 1), contact(4, 6, 2)])]
      .map((w) => validateFingeringWitness(custom, instance, w));
    expect(results.map((r) => r.status)).toEqual(["invalid", "valid"]);
    expect(resolveChordShape(custom, instance).status).toBe("valid");
  });
  test("no invented finger ordering, adjacent-gap or span limit", () => {
    const wide: ChordShapeInstance = { id: "wide", strings: [{ stringId: 30, position: 1, state: "fretted", fret: 1 }, { stringId: 10, position: 2, state: "fretted", fret: 12 }] };
    expect(valid(custom, wide, witness(wide.id, [contact(2, 1, 1), contact(1, 12, 2)])).contactSpan).toBe(11);
  });
  test("safe integer endpoint span uses contacts without iterating fret ranges", () => {
    const large = createFretboard(custom.strings.map((s) => ({ ...s, openPitch: 0 })), Number.MAX_SAFE_INTEGER);
    const far: ChordShapeInstance = { id: "far", strings: [{ stringId: 30, position: 1, state: "fretted", fret: Number.MAX_SAFE_INTEGER }, { stringId: 10, position: 2, state: "unplayed" }] };
    expect(valid(large, far, witness(far.id, [contact(1, 1, 1, 2), contact(2, Number.MAX_SAFE_INTEGER, 1)])).contactSpan).toBe(Number.MAX_SAFE_INTEGER - 1);
  });
});

describe("generic contact contradictions", () => {
  const instance = instantiateReferenceChordShape(board, "open-c-major");
  const candidate = referenceFingeringWitnesses()[0]!;
  const malformed: unknown[] = [null, [], {}, { ...candidate, id: 1 }, { ...candidate, instanceId: "other" },
    ...[null, {}, new Array(1), [null], [[]], [{}], Array(5).fill(contact(1, 1, 1)),
      [contact(1, 1, 3, 2)],
    ].map((contacts) => ({ ...candidate, contacts }))];
  test.each(malformed.map((value, i) => [i, value] as const))("rejects malformed witness %s", (_, value) => {
    expect(validateFingeringWitness(board, instance, value as FingeringWitness).status).toBe("invalid");
  });
  const invalidFields = [
    ...[0, 5, 1.5, NaN, "1"].map((value) => ["finger", value, "Fingers 1 through 4"] as const),
    ...[0, -1, 1.5, NaN, Infinity, 14, Number.MAX_SAFE_INTEGER + 1, "1"].map((value) => ["fret", value, "Contact frets"] as const),
    ...[0, -1, 1.5, NaN, Infinity, 7, "1"].flatMap((value) => [
      ["fromPosition", value, "Contact intervals"] as const, ["toPosition", value, "Contact intervals"] as const,
    ]),
  ];
  test.each(invalidFields)("rejects invalid %s = %s at the contact boundary", (field, value, reason) => {
    // Keep the other required stops present so missing-stop validation cannot mask a bug.
    const contacts = [{ ...candidate.contacts[0]!, [field]: value }, ...candidate.contacts.slice(1)];
    const result = validateFingeringWitness(board, instance, { ...candidate, contacts } as FingeringWitness);
    expect(result.status).toBe("invalid");
    if (result.status !== "invalid") throw new Error("Expected invalid contact");
    expect(result.reasons[0]).toContain(reason);
  });
  test.each([
    ["missing stop", candidate.contacts.slice(1)],
    ["stop below selected fret", [contact(1, 1, 2), contact(2, 1, 4), contact(3, 3, 5)]],
    ["stop above selected fret", [...candidate.contacts, contact(4, 4, 5)]],
    ["same finger on separate frets", [...candidate.contacts, contact(1, 3, 6)]],
    ["same finger on disjoint strings at same fret", [...candidate.contacts, contact(1, 1, 6)]],
    ["different fingers on identical stop", [...candidate.contacts, contact(4, 1, 2)]],
    ["intervening open string under barre", [contact(1, 1, 2, 4), contact(2, 2, 4), contact(3, 3, 5)]],
  ] as const)("rejects %s", (_, contacts) => {
    expect(validateFingeringWitness(board, instance, witness(instance.id, contacts)).status).toBe("invalid");
  });
  test("overlapping same-fret duties are rejected even when hidden or nonsounding", () => {
    const silent: ChordShapeInstance = { id: "silent", strings: instance.strings.map((s) => ({ stringId: s.stringId, position: s.position, state: "unplayed" })) };
    expect(validateFingeringWitness(board, silent, witness(silent.id, [contact(1, 1, 1, 4), contact(2, 1, 3, 6)])).status).toBe("invalid");
    const full = instantiateReferenceChordShape(board, "f-major-full-barre");
    expect(validateFingeringWitness(board, full, witness(full.id, [contact(1, 1, 1, 6), contact(2, 1, 4), contact(3, 3, 4, 5), contact(4, 2, 3)])).status).toBe("invalid");
  });
  test("barre checks every covered stop and permits lower hidden contacts", () => {
    const full = instantiateReferenceChordShape(board, "f-major-full-barre");
    const contacts = referenceFingeringWitnesses().find((w) => w.instanceId === full.id)!.contacts;
    valid(board, full, witness(full.id, contacts));
    expect(validateFingeringWitness(board, full, witness(full.id, contacts.filter((c) => c.finger !== 4))).status).toBe("invalid");
  });
  test("contacts under unplayed strings do not add sounding notes", () => {
    const result = valid(board, instance, witness(instance.id, [...candidate.contacts, contact(4, 4, 6)]));
    expect(result.soundingFingers).toHaveLength(5);
    expect(result.soundingFingers.some((s) => s.position === 6)).toBe(false);
    expect(result.contactSpan).toBe(3);
  });
  test("invalid geometry is a finding, invalid board remains an error", () => {
    expect(validateFingeringWitness(board, { ...instance, strings: [] }, candidate).status).toBe("invalid");
    expect(() => validateFingeringWitness({ ...board, fretCount: -1 }, instance, candidate)).toThrow(RangeError);
  });
  test("familiar instance and witness IDs do not bypass actual stop validation", () => {
    const changed: ChordShapeInstance = { ...instance, strings: instance.strings.map((s) => s.state === "fretted" ? { ...s, fret: s.fret + 1 } : s) };
    expect(resolveChordShape(board, changed).status).toBe("valid");
    expect(validateFingeringWitness(board, changed, candidate).status).toBe("invalid");
  });
  test("a barre on seven strings may cross an unplayed or muted position without adding a tone", () => {
    const custom = createFretboard(Array.from({ length: 7 }, (_, i) => ({ id: 20 + i, position: i + 1, openPitch: 40 })), 3);
    for (const state of ["unplayed", "muted"] as const) {
      const shape: ChordShapeInstance = { id: state, strings: custom.strings.map((s) => s.position === 4
        ? { stringId: s.id, position: s.position, state }
        : { stringId: s.id, position: s.position, state: "fretted", fret: 3 }) };
      const result = valid(custom, shape, witness(shape.id, [contact(1, 3, 1, 7)]));
      expect(result.soundingFingers.map((s) => s.position)).toEqual([1, 2, 3, 5, 6, 7]);
      expect(result.contactSpan).toBe(0);
      expect(result).not.toHaveProperty("physicalSupport");
    }
  });
  test.each([1, 7])("no-contact geometry supports %s strings and distinct silent states", (count) => {
    const custom = createFretboard(Array.from({ length: count }, (_, i) => ({ id: 10 + i, position: i + 1, openPitch: 40 })), 0);
    for (const state of ["open", "unplayed", "muted"] as const) {
      const shape: ChordShapeInstance = { id: state, strings: custom.strings.map((s) => state === "open"
        ? { stringId: s.id, position: s.position, state, fret: 0 }
        : { stringId: s.id, position: s.position, state }) };
      const result = valid(custom, shape, witness(shape.id, []));
      expect(result.contactSpan).toBeNull();
      expect(result.soundingFingers).toHaveLength(state === "open" ? count : 0);
    }
  });
});

function typeContracts(w: FingeringWitness, c: FingerContact) {
  // @ts-expect-error Witness contacts are readonly.
  w.contacts.push(c);
  // @ts-expect-error A witness references geometry rather than embedding it.
  w.strings;
  // @ts-expect-error Contact records are readonly.
  c.fret = 2;
  // @ts-expect-error Thumb is not a supported fretting finger.
  const thumb: FingerContact = { finger: 0, fret: 1, fromPosition: 1, toPosition: 1 };
  void thumb;
}
void typeContracts;
