import { describe, expect, test } from "vitest";
import { type DegreeFormula } from "../domain/music-theory/degrees.js";
import { spellingFromPitchClassInKey } from "../domain/music-theory/key-aware-spelling.js";
import { type Key, type KeyMode, keySignature } from "../domain/music-theory/keys.js";
import { type Accidental, type NoteSpelling, pitchClassFromSpelling } from "../domain/music-theory/note-spelling.js";
import { formatNoteSpelling, parseNoteSpelling } from "../domain/music-theory/note-text.js";
import { type PitchClass } from "../domain/music-theory/pitch-class.js";
import { type ScaleDegree, scaleNoteSpellings } from "../domain/music-theory/scales.js";
import { spellingFromPitchClass } from "../domain/music-theory/spelling-selection.js";

const naturals = [["C", 0], ["D", 2], ["E", 4], ["F", 5], ["G", 7], ["A", 9], ["B", 11]] as const;
const accidentals = [-2, -1, 0, 1, 2] as const;
const modes = ["major", "minor"] as const;
const classes: readonly PitchClass[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
// Independent numeric patterns/letter coordinates are the oracle, not domain construction calls.
const baselineOffsets: Readonly<Record<KeyMode, readonly number[]>> = {
  major: [0, 2, 4, 5, 7, 9, 11], minor: [0, 2, 3, 5, 7, 8, 10],
};
const keys = naturals.flatMap(([letter], sourceIndex) => accidentals.flatMap((accidental) => modes.map((mode) => ({
  sourceIndex, key: Object.freeze({ tonic: Object.freeze({ letter, accidental }), mode }),
}))));

function wrap(value: number): PitchClass {
  return ((value % 12 + 12) % 12) as PitchClass;
}

function expectedSpelling(sourceIndex: number, accidental: number, number: number, displacement: number) {
  const targetIndex = sourceIndex + number - 1;
  const [letter, natural] = naturals[targetIndex % 7]!;
  const target = naturals[sourceIndex]![1] + accidental + displacement;
  return { letter, accidental: target - natural - 12 * Math.floor(targetIndex / 7) };
}

describe("key-only signature-baseline selection", () => {
  for (const { sourceIndex, key } of keys) {
    test(`all twelve classes in ${formatNoteSpelling(key.tonic, "ascii")} ${key.mode}`, () => {
      const original = { tonic: { ...key.tonic }, mode: key.mode };
      const offsets = baselineOffsets[key.mode];
      const expectedPitches = offsets.map((offset) => wrap(naturals[sourceIndex]![1] + key.tonic.accidental + offset));
      expect(new Set(expectedPitches).size).toBe(7);
      let unresolved = 0;
      for (const pitchClass of classes) {
        const index = expectedPitches.indexOf(pitchClass);
        if (index === -1) {
          expect(spellingFromPitchClassInKey(pitchClass, key)).toBeUndefined();
          expect(spellingFromPitchClassInKey(pitchClass, key, undefined)).toBeUndefined();
          unresolved++;
        } else {
          const expected = expectedSpelling(sourceIndex, key.tonic.accidental, index + 1, offsets[index]!);
          if (Math.abs(expected.accidental) > 2) {
            expect(() => spellingFromPitchClassInKey(pitchClass, key)).toThrow(RangeError);
            expect(() => spellingFromPitchClassInKey(pitchClass, key, undefined)).toThrow(RangeError);
          } else {
            const result = spellingFromPitchClassInKey(pitchClass, key);
            expect(result).toEqual(expected);
            expect(spellingFromPitchClassInKey(pitchClass, key, undefined)).toEqual(expected);
            expect(pitchClassFromSpelling(result!)).toBe(pitchClass);
          }
        }
      }
      expect(unresolved).toBe(5);
      expect(key).toEqual(original);
    });
  }

  test.each([
    ["F#", "major", 5, "E#"], ["Gb", "major", 11, "Cb"], ["B", "minor", 9, "A"],
    ["Cb", "minor", 11, "Cb"], ["B##", "major", 1, "B##"],
  ] as const)("%s %s class %i resolves to %s", (tonic, mode, pitchClass, text) => {
    const result = spellingFromPitchClassInKey(pitchClass, { tonic: parseNoteSpelling(tonic), mode });
    expect(formatNoteSpelling(result!, "ascii")).toBe(text);
  });

  test.each([["B", "minor", 10], ["C", "major", 1]] as const)(
    "%s %s class %i remains unresolved", (tonic, mode, pitchClass) => {
      expect(spellingFromPitchClassInKey(pitchClass, { tonic: parseNoteSpelling(tonic), mode })).toBeUndefined();
    });

  test("does not require signature support or spelling of unrelated collection members", () => {
    const minor: Key = { tonic: parseNoteSpelling("Cb"), mode: "minor" };
    expect(() => keySignature(minor)).toThrow(RangeError);
    expect(spellingFromPitchClassInKey(2, minor)).toEqual(parseNoteSpelling("Ebb"));
    const major: Key = { tonic: parseNoteSpelling("B##"), mode: "major" };
    expect(() => scaleNoteSpellings(major.tonic, "major")).toThrow(RangeError);
    expect(spellingFromPitchClassInKey(1, major)).toEqual(parseNoteSpelling("B##"));
    expect(() => spellingFromPitchClassInKey(5, major)).toThrow(RangeError);
    expect(spellingFromPitchClassInKey(2, major)).toBeUndefined();
  });

  test("preserves the generic sharps/flats selection contract", () => {
    const key: Key = { tonic: parseNoteSpelling("F#"), mode: "major" };
    expect(spellingFromPitchClass(5, "sharps")).toEqual(parseNoteSpelling("F"));
    expect(spellingFromPitchClass(5, "flats")).toEqual(parseNoteSpelling("F"));
    expect(spellingFromPitchClassInKey(5, key)).toEqual(parseNoteSpelling("E#"));
  });

  test("returns fresh readonly-by-type results without runtime freezing or input mutation", () => {
    const key = Object.freeze({ tonic: Object.freeze(parseNoteSpelling("C")), mode: "major" } as const);
    const first = spellingFromPitchClassInKey(0, key)!;
    const second = spellingFromPitchClassInKey(0, key)!;
    expect(first).not.toBe(second);
    expect(first).not.toBe(key.tonic);
    expect(Object.isFrozen(first)).toBe(false);
    (first as { accidental: Accidental }).accidental = 1;
    expect(second).toEqual({ letter: "C", accidental: 0 });
    expect(key).toEqual({ tonic: { letter: "C", accidental: 0 }, mode: "major" });
  });

  test.each([-1, 12, 1.5, NaN, Infinity, -Infinity, Number.MAX_SAFE_INTEGER, undefined])(
    "rejects invalid pitch class %s", (pitchClass) => {
      expect(() => spellingFromPitchClassInKey(pitchClass as PitchClass, { tonic: parseNoteSpelling("C"), mode: "major" }))
        .toThrow(RangeError);
    });

  test.each(["natural-minor", "harmonic-minor", "dorian", "Major", "", undefined, null])(
    "rejects invalid key mode %s before returning an unresolved result", (mode) => {
      expect(() => spellingFromPitchClassInKey(1, { tonic: parseNoteSpelling("C"), mode: mode as KeyMode }))
        .toThrow(RangeError);
    });
});

const roles: readonly DegreeFormula[] = ([1, 2, 3, 4, 5, 6, 7] as const).flatMap((number) =>
  accidentals.map((alteration) => Object.freeze({ number, alteration })));

describe("explicit major-relative role selection", () => {
  for (const { sourceIndex, key } of keys) {
    test(`all 35 roles and contradictions in ${formatNoteSpelling(key.tonic, "ascii")} ${key.mode}`, () => {
      const original = { tonic: { ...key.tonic }, mode: key.mode };
      expect(roles).toHaveLength(35);
      for (const role of roles) {
        const originalRole = { ...role };
        const displacement = naturals[role.number - 1]![1] + role.alteration;
        const pitchClass = wrap(naturals[sourceIndex]![1] + key.tonic.accidental + displacement);
        const expected = expectedSpelling(sourceIndex, key.tonic.accidental, role.number, displacement);
        if (Math.abs(expected.accidental) > 2) {
          expect(() => spellingFromPitchClassInKey(pitchClass, key, role)).toThrow(RangeError);
        } else {
          const result = spellingFromPitchClassInKey(pitchClass, key, role);
          expect(result).toEqual(expected);
          expect(pitchClassFromSpelling(result!)).toBe(pitchClass);
        }
        // A contradictory role must never silently fall back to a baseline spelling.
        expect(() => spellingFromPitchClassInKey(wrap(pitchClass + 1), key, role)).toThrow(RangeError);
        expect(role).toEqual(originalRole);
      }
      expect(key).toEqual(original);
    });
  }

  test.each([
    ["B", "minor", 10, { number: 7, alteration: 0 }, "A#"],
    ["B", "minor", 8, { number: 6, alteration: 0 }, "G#"],
    ["C", "major", 1, { number: 1, alteration: 1 }, "C#"],
    ["C", "major", 1, { number: 2, alteration: -1 }, "Db"],
    ["C", "major", 0, { number: 7, alteration: 1 }, "B#"],
    ["C", "major", 6, { number: 4, alteration: 1 }, "F#"],
    ["C", "major", 6, { number: 5, alteration: -1 }, "Gb"],
    ["B##", "major", 4, { number: 3, alteration: -1 }, "D##"],
    ["B", "minor", 9, { number: 6, alteration: 1 }, "G##"],
    ["C", "major", 11, { number: 1, alteration: -1 }, "Cb"],
  ] as const)("%s %s class %i role %o selects %s", (tonic, mode, pitchClass, role, text) => {
    const key = Object.freeze({ tonic: Object.freeze(parseNoteSpelling(tonic)), mode });
    const result = spellingFromPitchClassInKey(pitchClass, key, Object.freeze(role));
    expect(formatNoteSpelling(result!, "ascii")).toBe(text);
  });

  test("an explicit role overrides available baseline spelling", () => {
    const key: Key = { tonic: parseNoteSpelling("C"), mode: "major" };
    expect(spellingFromPitchClassInKey(0, key)).toEqual(parseNoteSpelling("C"));
    expect(spellingFromPitchClassInKey(0, key, { number: 7, alteration: 1 })).toEqual(parseNoteSpelling("B#"));
  });

  test("major-relative role meaning is unchanged in minor keys", () => {
    const key: Key = { tonic: parseNoteSpelling("B"), mode: "minor" };
    expect(spellingFromPitchClassInKey(7, key)).toEqual(parseNoteSpelling("G"));
    expect(spellingFromPitchClassInKey(7, key, { number: 6, alteration: -1 })).toEqual(parseNoteSpelling("G"));
    expect(spellingFromPitchClassInKey(8, key)).toBeUndefined();
    expect(spellingFromPitchClassInKey(8, key, { number: 6, alteration: 0 })).toEqual(parseNoteSpelling("G#"));
    expect(spellingFromPitchClassInKey(9, key, { number: 6, alteration: 1 })).toEqual(parseNoteSpelling("G##"));
  });

  test("mismatch is rejected even when the requested pitch has a baseline spelling", () => {
    const key: Key = { tonic: parseNoteSpelling("C"), mode: "major" };
    expect(() => spellingFromPitchClassInKey(0, key, { number: 3, alteration: 0 })).toThrow(RangeError);
    expect(() => spellingFromPitchClassInKey(1, key, { number: 3, alteration: 0 })).toThrow(RangeError);
  });

  test("an unrepresentable explicit role cannot fall back to an available baseline spelling", () => {
    const key: Key = { tonic: parseNoteSpelling("F##"), mode: "major" };
    expect(spellingFromPitchClassInKey(0, key)).toEqual(parseNoteSpelling("B#"));
    expect(() => spellingFromPitchClassInKey(0, key, { number: 3, alteration: 1 })).toThrow(RangeError);
    const other: Key = { tonic: parseNoteSpelling("B##"), mode: "major" };
    expect(() => spellingFromPitchClassInKey(5, other, { number: 3, alteration: 0 })).toThrow(RangeError);
  });

  test("matches numerically before checking the role's selected spelling", () => {
    const key: Key = { tonic: parseNoteSpelling("B##"), mode: "major" };
    expect(() => spellingFromPitchClassInKey(1, key, { number: 3, alteration: 0 }))
      .toThrow("does not match the requested pitch class");
  });

  test("returns independent explicit-role spellings with preserved frozen context", () => {
    const key = Object.freeze({ tonic: Object.freeze(parseNoteSpelling("C")), mode: "major" } as const);
    const role = Object.freeze({ number: 2, alteration: -1 } as const);
    const first = spellingFromPitchClassInKey(1, key, role)!;
    const second = spellingFromPitchClassInKey(1, key, role)!;
    expect(first).not.toBe(second);
    expect(Object.isFrozen(first)).toBe(false);
    (first as { accidental: Accidental }).accidental = 1;
    expect(second).toEqual(parseNoteSpelling("Db"));
    expect(key).toEqual({ tonic: { letter: "C", accidental: 0 }, mode: "major" });
    expect(role).toEqual({ number: 2, alteration: -1 });
  });

  test.each([
    { number: 0, alteration: 0 }, { number: 8, alteration: 0 }, { number: 1.5, alteration: 0 },
    { number: NaN, alteration: 0 }, { number: Infinity, alteration: 0 },
    { number: 1, alteration: -3 }, { number: 1, alteration: 3 }, { number: 1, alteration: 0.5 },
    { number: 1, alteration: NaN }, { number: 1, alteration: Infinity }, { number: 1 }, { alteration: 0 },
  ])("invalid role %o is rejected instead of falling back", (role) => {
    const key: Key = { tonic: parseNoteSpelling("C"), mode: "major" };
    expect(() => spellingFromPitchClassInKey(0, key, role as DegreeFormula)).toThrow(RangeError);
    expect(() => spellingFromPitchClassInKey(1, key, role as DegreeFormula)).toThrow(RangeError);
  });

  test.each(["harmonic-minor", "natural-minor", "dorian", undefined, null])(
    "explicit roles still validate key mode %s", (mode) => {
      const key = { tonic: parseNoteSpelling("C"), mode: mode as KeyMode };
      expect(() => spellingFromPitchClassInKey(0, key, { number: 1, alteration: 0 })).toThrow(RangeError);
    });

  test.each([-1, 12, 0.5, NaN, Infinity, undefined])("explicit roles still validate pitch class %s", (value) => {
    const key: Key = { tonic: parseNoteSpelling("C"), mode: "major" };
    expect(() => spellingFromPitchClassInKey(value as PitchClass, key, { number: 1, alteration: 0 })).toThrow(RangeError);
  });
});

if (false) {
  // @ts-expect-error Key context is required.
  spellingFromPitchClassInKey(0);
  // @ts-expect-error The requested pitch class cannot be note text.
  spellingFromPitchClassInKey("C", { tonic: { letter: "C", accidental: 0 }, mode: "major" });
  // @ts-expect-error Key names are not structured key identities.
  spellingFromPitchClassInKey(0, "C major");
  // @ts-expect-error A role is a DegreeFormula, not an ordinal number.
  spellingFromPitchClassInKey(0, { tonic: { letter: "C", accidental: 0 }, mode: "major" }, 1);
  // @ts-expect-error An explicit formula alteration is required.
  spellingFromPitchClassInKey(0, { tonic: { letter: "C", accidental: 0 }, mode: "major" }, { number: 1 });
  // @ts-expect-error Compound roles remain deferred.
  spellingFromPitchClassInKey(0, { tonic: { letter: "C", accidental: 0 }, mode: "major" }, { number: 9, alteration: 0 });
  // @ts-expect-error Mode is required, including for explicit-role requests.
  spellingFromPitchClassInKey(0, { tonic: { letter: "C", accidental: 0 } }, { number: 1, alteration: 0 });
  // @ts-expect-error A collection selection is not an accepted role form.
  spellingFromPitchClassInKey(0, { tonic: { letter: "C", accidental: 0 }, mode: "major" }, { collection: "major", ordinal: 1 });
  const validRole: DegreeFormula = { number: 1 as ScaleDegree, alteration: 0 };
  spellingFromPitchClassInKey(0, { tonic: { letter: "C", accidental: 0 }, mode: "major" }, validRole);
  const result: NoteSpelling | undefined = spellingFromPitchClassInKey(0, { tonic: { letter: "C", accidental: 0 }, mode: "major" });
  if (result) {
    // @ts-expect-error Selected spelling is readonly.
    result.accidental = 1;
  }
}
