import { describe, expect, test } from "vitest";
import {
  createFretboard,
  registeredPitchAtLocation,
  findRegisteredPitchLocations,
  findPitchClassLocations,
  MAX_FRETBOARD_SEARCH_RESULTS,
  type Fretboard,
  type FretboardLocation,
  type FretboardPitchLocation,
  type FretboardSearchRegion,
  type FretboardString,
} from "../domain/fretboard/fretboard.js";
import { pitchClassFromRegisteredPitch } from "../domain/music-theory/pitch-pitch-classes-and-spelling/registered-pitch.js";
import { type PitchClass } from "../domain/music-theory/pitch-pitch-classes-and-spelling/pitch-class.js";

const standard = [
  { id: 1, position: 1, openPitch: 52 }, { id: 2, position: 2, openPitch: 47 },
  { id: 3, position: 3, openPitch: 43 }, { id: 4, position: 4, openPitch: 38 },
  { id: 5, position: 5, openPitch: 33 }, { id: 6, position: 6, openPitch: 28 },
] as const;
const invalidNumbers = [0.5, NaN, Infinity, -Infinity,
  Number.MAX_SAFE_INTEGER + 1, Number.MIN_SAFE_INTEGER - 1];
const malformedStrings: unknown[] = [
  null, undefined, {}, "strings", [], new Array(1), [undefined], [null],
  [[]], [{}], [{ id: 1 }], [{ openPitch: 28 }],
  [{ id: 1, position: 1, openPitch: 28 }, { id: 1, position: 1, openPitch: 33 }],
];
const invalidBoards: unknown[] = [
  null, undefined, [], {}, { strings: standard },
  ...malformedStrings.map((strings) => ({ strings, fretCount: 12 })),
  { strings: standard, fretCount: -1 },
  { strings: [{ id: 1, position: 1, openPitch: Number.MAX_SAFE_INTEGER }], fretCount: 1 },
  { strings: [{ id: 0, position: 1, openPitch: 0 }], fretCount: 0 },
];
const invalidRegions: unknown[] = [
  null, [], 1, "region", { frets: null }, { frets: [] }, { frets: {} },
  { frets: { min: 0 } }, { frets: { max: 12 } },
  { frets: { min: 6, max: 5 } }, { frets: { min: 0, max: 13 } },
  { stringIds: null }, { stringIds: {} }, { stringIds: "1" },
  { stringIds: [1, 1] }, { stringIds: [7] }, { stringIds: new Array(1) },
  ...[...invalidNumbers, -1, null, "0", undefined].flatMap((value) => [
    { frets: { min: value, max: 12 } }, { frets: { min: 0, max: value } },
    { stringIds: [value] },
  ]),
  { stringIds: [0] },
];

describe("createFretboard", () => {
  test("copies and canonicalizes explicit strings independently of input order", () => {
    const input: { id: number; position: number; openPitch: number }[] = standard.map((string) => ({ ...string })).reverse();
    const original = structuredClone(input);
    const board = createFretboard(input, 22);
    expect(board).toEqual({ strings: standard, fretCount: 22 });
    expect(input).toEqual(original);
    expect(board.strings).not.toBe(input);
    for (const string of board.strings) {
      expect(string).not.toBe(input.find(({ id }) => id === string.id));
      expect(Object.isFrozen(string)).toBe(false);
    }
    expect(Object.isFrozen(board)).toBe(false);
    expect(Object.isFrozen(board.strings)).toBe(false);
    input[0]!.openPitch = 0;
    expect(board.strings[5]!.openPitch).toBe(28);
    (board.strings[0] as { openPitch: number }).openPitch = 0;
    expect(input[5]!.openPitch).toBe(52);
    expect(createFretboard(standard, 22).strings).toEqual(standard);
  });

  test("retunes without changing identities and accepts seven strings", () => {
    const dropD = standard.map((s) => ({ ...s, openPitch: s.id === 6 ? 26 : s.openPitch }));
    expect(createFretboard(dropD, 22).strings).toEqual([
      ...standard.slice(0, 5), { id: 6, position: 6, openPitch: 26 },
    ]);
    expect(createFretboard([...standard, { id: 7, position: 7, openPitch: 23 }], 24).strings)
      .toHaveLength(7);
  });

  test("accepts frozen, reentrant, repeated, negative and noncontiguous tuning", () => {
    const strings = Object.freeze([
      Object.freeze({ id: 9, position: 1, openPitch: -12 }),
      Object.freeze({ id: 2, position: 2, openPitch: -24 }),
      Object.freeze({ id: 7, position: 3, openPitch: -12 }),
    ]);
    expect(createFretboard(strings, 0)).toEqual({
      strings: [{ id: 2, position: 2, openPitch: -24 }, { id: 7, position: 3, openPitch: -12 },
        { id: 9, position: 1, openPitch: -12 }], fretCount: 0,
    });
  });

  test("accepts exact safe endpoints and huge valid boards", () => {
    for (const pitch of [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER]) {
      expect(createFretboard([{ id: Number.MAX_SAFE_INTEGER, position: 1, openPitch: pitch }], 0)
        .strings[0]!.openPitch).toBe(pitch);
    }
    expect(createFretboard([{ id: 1, position: 1, openPitch: Number.MIN_SAFE_INTEGER }],
      Number.MAX_SAFE_INTEGER).fretCount).toBe(Number.MAX_SAFE_INTEGER);
    expect(() => createFretboard([{ id: 1, position: 1, openPitch: Number.MAX_SAFE_INTEGER }], 1))
      .toThrow(RangeError);
  });

  test.each(malformedStrings.map((value) => [value]))("rejects malformed strings %s", (strings) => {
    expect(() => createFretboard(strings as readonly FretboardString[], 12)).toThrow(RangeError);
  });
  test.each([...invalidNumbers, -1, null, undefined, "12"])("rejects fret count %s", (value) => {
    expect(() => createFretboard(standard, value as number)).toThrow(RangeError);
  });
  test.each([...invalidNumbers, -1, 0, null, undefined, "1"])("rejects string ID %s", (id) => {
    expect(() => createFretboard([{ id: id as number, position: 1, openPitch: 0 }], 0)).toThrow(RangeError);
  });
  test.each([...invalidNumbers, null, undefined, "28"])("rejects open pitch %s", (pitch) => {
    expect(() => createFretboard([{ id: 1, position: 1, openPitch: pitch as number }], 0)).toThrow(RangeError);
  });

  test("exposes readonly contracts", () => {
    const board: Fretboard = createFretboard(standard, 12);
    if (false) {
      // @ts-expect-error Board properties are readonly.
      board.fretCount = 24;
      // @ts-expect-error String array is readonly.
      board.strings.push({ id: 7, position: 7, openPitch: 23 });
      // @ts-expect-error String records are readonly.
      board.strings[0]!.openPitch = 0;
      // @ts-expect-error String identity is readonly.
      board.strings[0]!.id = 2;
      // @ts-expect-error Board string collection is readonly.
      board.strings = [];
    }
    expect(board.fretCount).toBe(12);
  });
});

describe("physical string positions", () => {
  const strings = [
    { id: 20, position: 3, openPitch: 38 },
    { id: 90, position: 1, openPitch: 43 },
    { id: 4, position: 2, openPitch: 38 },
  ] as const;

  test("keeps physical order separate from input order, ID order and tuning", () => {
    const permutations = [
      [strings[0], strings[1], strings[2]], [strings[0], strings[2], strings[1]],
      [strings[1], strings[0], strings[2]], [strings[1], strings[2], strings[0]],
      [strings[2], strings[0], strings[1]], [strings[2], strings[1], strings[0]],
    ];
    for (const permutation of permutations) {
      const input = Object.freeze(permutation.map((s) => Object.freeze({ ...s })));
      const board = createFretboard(input, 12);
      expect(board.strings).toEqual([
        { id: 4, position: 2, openPitch: 38 },
        { id: 20, position: 3, openPitch: 38 },
        { id: 90, position: 1, openPitch: 43 },
      ]);
      expect([...board.strings].sort((a, b) => a.position - b.position).map(({ id }) => id))
        .toEqual([90, 4, 20]);
      expect(findRegisteredPitchLocations(board, 38)).toEqual([
        { stringId: 4, fret: 0, pitch: 38 }, { stringId: 20, fret: 0, pitch: 38 },
      ]);
      expect(input).toEqual(permutation);
    }
  });

  test("retuning changes pitch while retaining identity, position and adjacency", () => {
    const original = createFretboard(strings, 12);
    const retuned = createFretboard(strings.map((s) => ({
      ...s, openPitch: s.id === 4 ? 60 : s.openPitch,
    })), 12);
    expect(retuned.strings.map(({ id, position }) => ({ id, position })))
      .toEqual(original.strings.map(({ id, position }) => ({ id, position })));
    expect(retuned.strings.find(({ id }) => id === 4)!.openPitch).toBe(60);
    expect(original.strings.find(({ id }) => id === 4)!.openPitch).toBe(38);
    expect(retuned.strings.find(({ id }) => id === 4)!.position
      - retuned.strings.find(({ id }) => id === 90)!.position).toBe(1);
  });

  test("changing physical order alone preserves all direct and search results", () => {
    const original = createFretboard(strings, 12);
    const reordered = createFretboard(strings.map((s) => ({ ...s, position: 4 - s.position })), 12);
    expect(reordered.strings).not.toEqual(original.strings);
    for (const { id } of strings) {
      for (let fret = 0; fret <= 12; fret += 1) {
        expect(registeredPitchAtLocation(reordered, { stringId: id, fret }))
          .toBe(registeredPitchAtLocation(original, { stringId: id, fret }));
      }
    }
    for (let pitch = 37; pitch <= 56; pitch += 1) {
      expect(findRegisteredPitchLocations(reordered, pitch))
        .toEqual(findRegisteredPitchLocations(original, pitch));
    }
    for (let pitchClass = 0; pitchClass < 12; pitchClass += 1) {
      const region = { stringIds: [90, 4], frets: { min: 2, max: 10 } };
      expect(findPitchClassLocations(reordered, pitchClass as PitchClass, region))
        .toEqual(findPitchClassLocations(original, pitchClass as PitchClass, region));
    }
  });

  const invalidStringCollections: unknown[] = [
    [{ id: 4, openPitch: 38 }],
    ...[undefined, null, "1", true, -1, 0, 2, ...invalidNumbers].map((position) => [
      { id: 4, position, openPitch: 38 },
    ]),
    [{ id: 4, position: 1, openPitch: 38 }, { id: 90, position: 1, openPitch: 43 }],
    [{ id: 4, position: 1, openPitch: 38 }, { id: 90, position: 3, openPitch: 43 }],
  ];
  test.each(invalidStringCollections.map((value) => [value]))(
    "rejects invalid positions throughout factory and structural query inputs: %s", (input) => {
      const supplied = input as readonly FretboardString[];
      const board = { strings: supplied, fretCount: 12 };
      expect(() => createFretboard(supplied, 12)).toThrow(RangeError);
      expect(() => registeredPitchAtLocation(board, { stringId: 4, fret: 0 })).toThrow(RangeError);
      for (const region of [undefined, { stringIds: [] }, { stringIds: [4] }]) {
        expect(() => findRegisteredPitchLocations(board, 38, region)).toThrow(RangeError);
        expect(() => findPitchClassLocations(board, 2, region)).toThrow(RangeError);
      }
    },
  );

  test("copies position independently and exposes it as required and readonly", () => {
    const input = strings.map((s) => ({ id: s.id, position: Number(s.position), openPitch: s.openPitch }));
    const board = createFretboard(input, 12);
    input[0]!.position = 1;
    expect(board.strings.find(({ id }) => id === 20)!.position).toBe(3);
    (board.strings[0] as { position: number }).position = 3;
    expect(input.find(({ id }) => id === 4)!.position).toBe(2);
    if (false) {
      // @ts-expect-error Position is readonly, like identity and tuning.
      board.strings[0]!.position = 1;
      // @ts-expect-error Physical order must be explicit; no ID-based default.
      createFretboard([{ id: 1, openPitch: 52 }], 12);
    }
    const singleton = createFretboard([{ id: 90, position: 1, openPitch: 43 }], 0);
    expect(singleton.strings).toEqual([{ id: 90, position: 1, openPitch: 43 }]);
  });
});

describe("registeredPitchAtLocation", () => {
  const board = createFretboard(standard, 22);
  test.each([
    [6, 0, 28], [6, 1, 29], [6, 12, 40], [6, 5, 33], [5, 0, 33], [1, 22, 74],
  ])("maps string %i fret %i to %i", (stringId, fret, pitch) => {
    expect(registeredPitchAtLocation(board, { stringId, fret })).toBe(pitch);
  });

  test("adds twelve semitones without changing pitch class wherever available", () => {
    for (const { id, openPitch } of standard) {
      for (let fret = 0; fret <= 10; fret += 1) {
        const lower = registeredPitchAtLocation(board, { stringId: id, fret });
        const upper = registeredPitchAtLocation(board, { stringId: id, fret: fret + 12 });
        expect(lower).toBe(openPitch + fret);
        expect(upper - lower).toBe(12);
        expect(pitchClassFromRegisteredPitch(upper)).toBe(pitchClassFromRegisteredPitch(lower));
      }
    }
  });

  test("uses IDs on a frozen structural board in arbitrary order and explicit tuning", () => {
    const strings = Object.freeze([...standard].reverse().map((s) => Object.freeze({
      ...s, openPitch: s.id === 6 ? 26 : s.openPitch,
    })));
    const structural = Object.freeze({ strings, fretCount: 12 });
    for (const { id, openPitch } of standard) {
      expect(registeredPitchAtLocation(structural, Object.freeze({ stringId: id, fret: 0 })))
        .toBe(id === 6 ? 26 : openPitch);
    }
  });

  test.each([
    [Number.MIN_SAFE_INTEGER, 0, Number.MIN_SAFE_INTEGER],
    [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, 0],
    [Number.MAX_SAFE_INTEGER - 12, 12, Number.MAX_SAFE_INTEGER],
    [-12, 1, -11], [-12, 12, 0],
  ])("preserves registered endpoints from %s plus %s", (openPitch, fret, pitch) => {
    const boundary = createFretboard([{ id: 7, position: 1, openPitch }], fret);
    expect(registeredPitchAtLocation(boundary, { stringId: 7, fret })).toBe(pitch);
  });

  test.each([
    null, undefined, [], {}, { stringId: 1 }, { fret: 0 },
    ...[...invalidNumbers, -1, 23, 24, null, undefined, "0"].map((fret) => ({ stringId: 1, fret })),
    ...[...invalidNumbers, -1, 0, 7, null, undefined, "1"].map((stringId) => ({ stringId, fret: 0 })),
  ].map((value) => [value]))("rejects invalid location %s", (location) => {
    expect(() => registeredPitchAtLocation(board, location as FretboardLocation)).toThrow(RangeError);
  });

  test.each(invalidBoards.map((value) => [value]))("validates structural board %s", (invalid) => {
    expect(() => registeredPitchAtLocation(invalid as Fretboard, { stringId: 1, fret: 0 }))
      .toThrow(RangeError);
  });

  test("validates the entire board, including strings other than the selected one", () => {
    const invalid = { strings: [...standard, { id: 7, position: 7, openPitch: NaN }], fretCount: 12 };
    expect(() => registeredPitchAtLocation(invalid, { stringId: 1, fret: 0 })).toThrow(RangeError);
  });

  test("exposes readonly locations", () => {
    const location: FretboardLocation = { stringId: 6, fret: 0 };
    if (false) {
      // @ts-expect-error Location identity is readonly.
      location.stringId = 1;
      // @ts-expect-error Location fret is readonly.
      location.fret = 1;
    }
    expect(registeredPitchAtLocation(board, location)).toBe(28);
  });
});

describe("findRegisteredPitchLocations", () => {
  const board = createFretboard(standard, 12);
  test("finds every D3 and A2 alternative in canonical order", () => {
    expect(findRegisteredPitchLocations(board, 38)).toEqual([
      { stringId: 4, fret: 0, pitch: 38 },
      { stringId: 5, fret: 5, pitch: 38 },
      { stringId: 6, fret: 10, pitch: 38 },
    ]);
    expect(findRegisteredPitchLocations(board, 33)).toEqual([
      { stringId: 5, fret: 0, pitch: 33 }, { stringId: 6, fret: 5, pitch: 33 },
    ]);
  });

  test("applies independent inclusive dimensions with canonical selected-string order", () => {
    expect(findRegisteredPitchLocations(board, 38, { stringIds: [6, 4], frets: { min: 5, max: 10 } }))
      .toEqual([{ stringId: 6, fret: 10, pitch: 38 }]);
    expect(findRegisteredPitchLocations(board, 38, { stringIds: [6, 4] }))
      .toEqual([{ stringId: 4, fret: 0, pitch: 38 }, { stringId: 6, fret: 10, pitch: 38 }]);
    expect(findRegisteredPitchLocations(board, 38, { frets: { min: 5, max: 5 } }))
      .toEqual([{ stringId: 5, fret: 5, pitch: 38 }]);
    expect(findRegisteredPitchLocations(board, 40, { stringIds: [6], frets: { min: 12, max: 12 } }))
      .toEqual([{ stringId: 6, fret: 12, pitch: 40 }]);
    for (const region of [undefined, {}, { stringIds: undefined, frets: undefined }]) {
      expect(findRegisteredPitchLocations(board, 38, region)).toEqual(findRegisteredPitchLocations(board, 38));
    }
  });

  test("returns empty results for valid absent targets and empty selections", () => {
    for (const pitch of [-1, 27, 65, Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER]) {
      expect(findRegisteredPitchLocations(board, pitch)).toEqual([]);
    }
    expect(findRegisteredPitchLocations(board, 38, { stringIds: [] })).toEqual([]);
    expect(findRegisteredPitchLocations(board, 38, { stringIds: [1] })).toEqual([]);
  });

  test("handles huge exact differences and negative coordinates without fret scans", () => {
    const huge = createFretboard([{ id: 9, position: 1, openPitch: Number.MIN_SAFE_INTEGER }], Number.MAX_SAFE_INTEGER);
    expect(findRegisteredPitchLocations(huge, 0)).toEqual([
      { stringId: 9, fret: Number.MAX_SAFE_INTEGER, pitch: 0 },
    ]);
    expect(findRegisteredPitchLocations(huge, Number.MAX_SAFE_INTEGER)).toEqual([]);
    expect(findRegisteredPitchLocations(huge, Number.MIN_SAFE_INTEGER)).toEqual([
      { stringId: 9, fret: 0, pitch: Number.MIN_SAFE_INTEGER },
    ]);
    expect(findRegisteredPitchLocations(createFretboard([{ id: 1, position: 1, openPitch: Number.MAX_SAFE_INTEGER }], 0),
      Number.MIN_SAFE_INTEGER)).toEqual([]);
  });

  test("preserves duplicate pitches on reentrant strings and uses alternate tuning", () => {
    const alternative = { strings: [{ id: 8, position: 1, openPitch: -12 }, { id: 2, position: 2, openPitch: 0 },
      { id: 5, position: 3, openPitch: -12 }], fretCount: 12 };
    expect(findRegisteredPitchLocations(alternative, 0)).toEqual([
      { stringId: 2, fret: 0, pitch: 0 }, { stringId: 5, fret: 12, pitch: 0 },
      { stringId: 8, fret: 12, pitch: 0 },
    ]);
    const dropD = createFretboard(standard.map((s) => ({ ...s, openPitch: s.id === 6 ? 26 : s.openPitch })), 12);
    expect(findRegisteredPitchLocations(dropD, 38)).toEqual([
      { stringId: 4, fret: 0, pitch: 38 }, { stringId: 5, fret: 5, pitch: 38 },
      { stringId: 6, fret: 12, pitch: 38 },
    ]);
  });

  test("does not mutate frozen inputs and returns independent unfrozen arrays and records", () => {
    const input = Object.freeze({
      strings: Object.freeze([...standard].reverse().map((string) => Object.freeze({ ...string }))),
      fretCount: 12,
    });
    const region = Object.freeze({ stringIds: Object.freeze([6, 4]), frets: Object.freeze({ min: 0, max: 12 }) });
    const first = findRegisteredPitchLocations(input, 38, region);
    const second = findRegisteredPitchLocations(input, 38, region);
    expect(first).toEqual(second);
    expect(first).not.toBe(second);
    expect(first[0]).not.toBe(second[0]);
    expect(first[0]).not.toBe(first[1]);
    expect(Object.isFrozen(first)).toBe(false);
    expect(Object.isFrozen(first[0])).toBe(false);
    (first[0] as { fret: number }).fret = 99;
    expect(second[0]!.fret).toBe(0);
    expect(input.strings.map(({ id }) => id)).toEqual([6, 5, 4, 3, 2, 1]);
    expect(region.stringIds).toEqual([6, 4]);
  });

  test.each(invalidRegions.map((value) => [value]))("rejects invalid region %s", (region) => {
    expect(() => findRegisteredPitchLocations(board, 38, region as FretboardSearchRegion)).toThrow(RangeError);
  });
  test.each(invalidBoards.map((value) => [value]))("validates board even for empty selection %s", (invalid) => {
    expect(() => findRegisteredPitchLocations(invalid as Fretboard, 38, { stringIds: [] })).toThrow(RangeError);
  });
  test.each([...invalidNumbers, null, undefined, "38"])("validates target even for empty selection %s", (pitch) => {
    expect(() => findRegisteredPitchLocations(board, pitch as number, { stringIds: [] })).toThrow(RangeError);
  });
  test("validates fret bounds even for an empty selection", () => {
    expect(() => findRegisteredPitchLocations(board, 38, { stringIds: [], frets: { min: 0, max: 13 } }))
      .toThrow(RangeError);
  });

  test("allows 10,000 matches and rejects 10,001 without truncation", () => {
    expect(MAX_FRETBOARD_SEARCH_RESULTS).toBe(10_000);
    const strings = Array.from({ length: 10_000 }, (_, i) => ({ id: i + 1, position: i + 1, openPitch: 38 }));
    const matches = findRegisteredPitchLocations(createFretboard(strings, 0), 38);
    expect(matches).toHaveLength(10_000);
    expect(matches[0]).toEqual({ stringId: 1, fret: 0, pitch: 38 });
    expect(matches[9999]).toEqual({ stringId: 10_000, fret: 0, pitch: 38 });
    const larger = createFretboard([...strings, { id: 10_001, position: 10_001, openPitch: 38 }], 0);
    expect(() => findRegisteredPitchLocations(larger, 38)).toThrow(RangeError);
    expect(findRegisteredPitchLocations(larger, 39)).toEqual([]);
    expect(findRegisteredPitchLocations(larger, 38, { stringIds: [10_001] })).toHaveLength(1);
  });

  test("exposes readonly regions and results", () => {
    const region: FretboardSearchRegion = { stringIds: [4], frets: { min: 0, max: 12 } };
    const result = findRegisteredPitchLocations(board, 38, region);
    if (false) {
      // @ts-expect-error Region selection is readonly.
      region.stringIds = [];
      // @ts-expect-error Selected IDs are readonly.
      region.stringIds!.push(6);
      // @ts-expect-error Region range is readonly.
      region.frets = { min: 0, max: 1 };
      // @ts-expect-error Range endpoints are readonly.
      region.frets!.min = 1;
      // @ts-expect-error Range endpoints are readonly.
      region.frets!.max = 1;
      // @ts-expect-error Results array is readonly.
      result.push({ stringId: 1, fret: 0, pitch: 52 });
      // @ts-expect-error Result coordinates are readonly.
      result[0]!.pitch = 0;
      // @ts-expect-error Result locations are readonly.
      result[0]!.fret = 0;
      // @ts-expect-error Result identities are readonly.
      result[0]!.stringId = 1;
    }
    expect(result).toHaveLength(1);
  });
});

describe("findPitchClassLocations", () => {
  const board = createFretboard(standard, 12);
  test("finds D across registers while retaining each sounding coordinate", () => {
    expect(findPitchClassLocations(board, 2)).toEqual([
      { stringId: 1, fret: 10, pitch: 62 }, { stringId: 2, fret: 3, pitch: 50 },
      { stringId: 3, fret: 7, pitch: 50 }, { stringId: 4, fret: 0, pitch: 38 },
      { stringId: 4, fret: 12, pitch: 50 }, { stringId: 5, fret: 5, pitch: 38 },
      { stringId: 6, fret: 10, pitch: 38 },
    ]);
    expect(findPitchClassLocations(board, 2)).toHaveLength(7);
    expect(findRegisteredPitchLocations(board, 38)).toHaveLength(3);
  });

  // The bounded oracle enumerates every location with ordinary arithmetic. It
  // shares neither production search stepping nor Music Theory conversion.
  const tunings = [standard,
    standard.map((s) => ({ ...s, openPitch: s.id === 6 ? 26 : s.openPitch })),
    [{ id: 9, position: 1, openPitch: -13 }, { id: 2, position: 2, openPitch: 1 }, { id: 7, position: 3, openPitch: -13 }],
    [{ id: 20, position: 1, openPitch: -25 }],
    [...standard, { id: 7, position: 7, openPitch: 23 }],
  ];
  for (const [tuningIndex, tuning] of tunings.entries()) {
    for (const fretCount of [0, 1, 12, 22, 25]) {
      test(`agrees with exhaustive oracle for tuning ${tuningIndex}, frets 0..${fretCount}`, () => {
        const input = { strings: tuning, fretCount };
        const regions: FretboardSearchRegion[] = [
          {}, { stringIds: [] }, { stringIds: [tuning[0]!.id] },
          { frets: { min: Math.min(3, fretCount), max: fretCount } },
          { stringIds: tuning.map(({ id }) => id).reverse(), frets: { min: fretCount, max: fretCount } },
        ];
        for (let target = 0; target < 12; target += 1) {
          for (const region of regions) {
            const expected: FretboardPitchLocation[] = [];
            for (const { id, openPitch } of tuning) {
              if (region.stringIds !== undefined && !region.stringIds.includes(id)) continue;
              for (let fret = region.frets?.min ?? 0; fret <= (region.frets?.max ?? fretCount); fret += 1) {
                const pitch = openPitch + fret;
                if (((pitch % 12) + 12) % 12 === target) expected.push({ stringId: id, fret, pitch });
              }
            }
            expected.sort((a, b) => a.stringId - b.stringId || a.fret - b.fret);
            const actual = findPitchClassLocations(input, target as PitchClass, region);
            expect(actual).toEqual(expected);
            expect(new Set(actual.map(({ stringId, fret }) => `${stringId}:${fret}`)).size).toBe(actual.length);
            expect(findPitchClassLocations({ ...input, strings: [...tuning].reverse() }, target as PitchClass, region))
              .toEqual(expected);
          }
        }
      });
    }
  }

  test("accepts omitted dimensions and preserves frozen inputs and independent results", () => {
    const input = Object.freeze({ strings: Object.freeze(standard.map((s) => Object.freeze({ ...s })).reverse()), fretCount: 12 });
    const region = Object.freeze({ stringIds: Object.freeze([6, 4]), frets: Object.freeze({ min: 0, max: 12 }) });
    const first = findPitchClassLocations(input, 2, region);
    const second = findPitchClassLocations(input, 2, region);
    expect(first).toEqual([
      { stringId: 4, fret: 0, pitch: 38 }, { stringId: 4, fret: 12, pitch: 50 },
      { stringId: 6, fret: 10, pitch: 38 },
    ]);
    expect(first).not.toBe(second);
    expect(first[0]).not.toBe(second[0]);
    expect(first[0]).not.toBe(first[1]);
    expect(Object.isFrozen(first)).toBe(false);
    expect(Object.isFrozen(first[0])).toBe(false);
    (first[0] as { pitch: number }).pitch = 0;
    expect(second[0]!.pitch).toBe(38);
    expect(input.strings.map(({ id }) => id)).toEqual([6, 5, 4, 3, 2, 1]);
    expect(region.stringIds).toEqual([6, 4]);
    expect(findPitchClassLocations(board, 2, { stringIds: undefined, frets: undefined }))
      .toEqual(findPitchClassLocations(board, 2));
    expect(findPitchClassLocations(board, 2, { stringIds: [] })).toEqual([]);
    expect(findPitchClassLocations(board, 2, { stringIds: [1], frets: { min: 0, max: 0 } })).toEqual([]);
  });

  test.each(invalidRegions.map((value) => [value]))("rejects invalid region %s", (region) => {
    expect(() => findPitchClassLocations(board, 2, region as FretboardSearchRegion)).toThrow(RangeError);
  });
  test.each(invalidBoards.map((value) => [value]))("validates board even for empty selection %s", (invalid) => {
    expect(() => findPitchClassLocations(invalid as Fretboard, 2, { stringIds: [] })).toThrow(RangeError);
  });
  test.each([...invalidNumbers, -1, 12, null, undefined, "2"])("validates class even for empty selection %s", (pitch) => {
    expect(() => findPitchClassLocations(board, pitch as PitchClass, { stringIds: [] })).toThrow(RangeError);
  });
  test("validates bounds even for an empty selection", () => {
    expect(() => findPitchClassLocations(board, 2, { stringIds: [], frets: { min: 0, max: 13 } })).toThrow(RangeError);
  });

  test("counts before enumeration, including totals across strings", () => {
    const exact = findPitchClassLocations(createFretboard([{ id: 1, position: 1, openPitch: 0 }], 119988), 0);
    expect(exact).toHaveLength(10_000);
    expect(exact[0]).toEqual({ stringId: 1, fret: 0, pitch: 0 });
    expect(exact[9999]).toEqual({ stringId: 1, fret: 119988, pitch: 119988 });
    const larger = createFretboard([{ id: 1, position: 1, openPitch: 0 }], 120000);
    expect(() => findPitchClassLocations(larger, 0)).toThrow(RangeError);
    const restricted = findPitchClassLocations(larger, 0, { frets: { min: 12, max: 120000 } });
    expect(restricted).toHaveLength(10_000);
    expect(restricted[9999]).toEqual({ stringId: 1, fret: 120000, pitch: 120000 });
    const multi = createFretboard([{ id: 1, position: 1, openPitch: 0 }, { id: 2, position: 2, openPitch: 0 }], 59988);
    expect(findPitchClassLocations(multi, 0)).toHaveLength(10_000);
    expect(() => findPitchClassLocations({ ...multi, fretCount: 60000 }, 0)).toThrow(RangeError);
  });

  test("queries a huge board narrowly and rejects enormous unrestricted output immediately", () => {
    const max = Number.MAX_SAFE_INTEGER;
    const huge = createFretboard([{ id: 3, position: 1, openPitch: -max }], max);
    expect(findPitchClassLocations(huge, 0, { frets: { min: max - 12, max } })).toEqual([
      { stringId: 3, fret: max - 12, pitch: -12 }, { stringId: 3, fret: max, pitch: 0 },
    ]);
    expect(findPitchClassLocations(huge, 1, { frets: { min: max, max } })).toEqual([]);
    expect(findPitchClassLocations(huge, 0, { stringIds: [] })).toEqual([]);
    expect(() => findPitchClassLocations(huge, 0)).toThrow(RangeError);
    // MAX_SAFE_INTEGER has class 7; its negative has class 5.
    for (const [openPitch, pitchClass] of [[max, 7], [-max, 5]] as const) {
      const endpoint = createFretboard([{ id: 1, position: 1, openPitch }], 0);
      expect(findPitchClassLocations(endpoint, pitchClass)).toEqual([
        { stringId: 1, fret: 0, pitch: openPitch },
      ]);
    }
    const positive = createFretboard([{ id: 1, position: 1, openPitch: 0 }], max);
    expect(findPitchClassLocations(positive, 7, { frets: { min: max, max } })).toEqual([
      { stringId: 1, fret: max, pitch: max },
    ]);
    expect(findPitchClassLocations(positive, 8, { frets: { min: max, max } })).toEqual([]);
  });

  test("retains the same readonly result contract and bounded class type", () => {
    const result = findPitchClassLocations(board, 2);
    if (false) {
      // @ts-expect-error Only literal pitch classes 0..11 are supported.
      findPitchClassLocations(board, 12);
      // @ts-expect-error Result arrays are readonly.
      result.pop();
      // @ts-expect-error Result pitch is readonly.
      result[0]!.pitch = 0;
    }
    expect(result).toHaveLength(7);
  });
});
