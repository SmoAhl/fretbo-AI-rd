import { describe, expect, test } from "vitest";
import {
  type MelodicMinorConvention,
  type MelodicMinorRunOptions,
  melodicMinorRegisteredNotes,
  melodicMinorRegisteredPitches,
} from "../domain/music-theory/melodic-minor-runs.js";
import { formatRegisteredNote, parseRegisteredNote } from "../domain/music-theory/note-text.js";
import { type RegisteredNote, registeredPitchFromNote } from "../domain/music-theory/registered-pitch.js";
import { MAX_SCALE_RUN_NOTES, scaleRegisteredNotes } from "../domain/music-theory/scale-runs.js";

const conventions = ["fixed-collection", "classical-exercise"] as const;
const up: MelodicMinorRunOptions = {
  convention: "fixed-collection", direction: "up", octaves: 1, includeEndpoint: true,
};
const format = (notes: readonly RegisteredNote[]) => notes.map((note) => formatRegisteredNote(note, "ascii"));

describe("melodic-minor traversal", () => {
  test.each(conventions)("ascends C4 under %s", (convention) => {
    const options = { ...up, convention };
    expect(melodicMinorRegisteredPitches(48, options)).toEqual([48, 50, 51, 53, 55, 57, 59, 60]);
    expect(format(melodicMinorRegisteredNotes(parseRegisteredNote("C4"), options)))
      .toEqual(["C4", "D4", "Eb4", "F4", "G4", "A4", "B4", "C5"]);
  });

  test.each([
    ["fixed-collection", [60, 59, 57, 55, 53, 51, 50, 48], ["C5", "B4", "A4", "G4", "F4", "Eb4", "D4", "C4"]],
    ["classical-exercise", [60, 58, 56, 55, 53, 51, 50, 48], ["C5", "Bb4", "Ab4", "G4", "F4", "Eb4", "D4", "C4"]],
  ] as const)("descends C5 under %s", (convention, pitches, notes) => {
    const options = { ...up, convention, direction: "down" } as const;
    expect(melodicMinorRegisteredPitches(60, options)).toEqual(pitches);
    expect(format(melodicMinorRegisteredNotes(parseRegisteredNote("C5"), options))).toEqual(notes);
  });

  for (const convention of conventions) {
    for (const direction of ["up", "down"] as const) {
      test.each(Array.from({ length: 12 }, (_, index) => index))(
        `${convention} ${direction} preserves independent patterns from tonic %i`, (tonicClass) => {
          // Independent reference offsets exclude the repeated tonic; append it only when requested.
          const offsets = direction === "up" ? [0, 2, 3, 5, 7, 9, 11]
            : convention === "classical-exercise" ? [0, -2, -4, -5, -7, -9, -10]
              : [0, -1, -3, -5, -7, -9, -10];
          for (const register of [-24, 48]) {
            const tonic = register + tonicClass;
            for (const octaves of [1, 2, 3]) {
              const sign = direction === "up" ? 1 : -1;
              const expected = Array.from({ length: octaves }, (_, cycle) =>
                offsets.map((offset) => tonic + sign * 12 * cycle + offset)).flat();
              for (const includeEndpoint of [false, true]) {
                const options = { convention, direction, octaves, includeEndpoint };
                const result = melodicMinorRegisteredPitches(tonic, options);
                expect(result).toEqual(includeEndpoint ? [...expected, tonic + sign * 12 * octaves] : expected);
                expect(result).toHaveLength(7 * octaves + Number(includeEndpoint));
                expect(result.filter((pitch) => (pitch - tonic) % 12 === 0)).toHaveLength(octaves + Number(includeEndpoint));
              }
            }
          }
        },
      );
    }
  }

  test.each([
    ["F#4", "fixed-collection", "up", ["F#4", "G#4", "A4", "B4", "C#5", "D#5", "E#5", "F#5"]],
    ["F#5", "classical-exercise", "down", ["F#5", "E5", "D5", "C#5", "B4", "A4", "G#4", "F#4"]],
    ["B#3", "fixed-collection", "up", ["B#3", "C##4", "D#4", "E#4", "F##4", "G##4", "A##4", "B#4"]],
    ["Cb0", "fixed-collection", "up", ["Cb0", "Db0", "Ebb0", "Fb0", "Gb0", "Ab0", "Bb0", "Cb1"]],
    ["Cb0", "classical-exercise", "down", ["Cb0", "Bbb-1", "Abb-1", "Gb-1", "Fb-1", "Ebb-1", "Db-1", "Cb-1"]],
  ] as const)("preserves spelling and register for %s %s %s", (text, convention, direction, expected) => {
    const tonic = parseRegisteredNote(text);
    const options = { ...up, convention, direction };
    const notes = melodicMinorRegisteredNotes(tonic, options);
    expect(format(notes)).toEqual(expected);
    expect(notes.map(registeredPitchFromNote)).toEqual(melodicMinorRegisteredPitches(registeredPitchFromNote(tonic), options));
  });

  test.each(conventions)("numeric and spelled multi-octave output agree under %s", (convention) => {
    for (const text of ["C-1", "D4", "Eb3", "F#4", "B#3", "Cb0"]) {
      const tonic = parseRegisteredNote(text);
      for (const direction of ["up", "down"] as const) {
        const options = { ...up, convention, direction, octaves: 2 };
        const notes = melodicMinorRegisteredNotes(tonic, options);
        expect(notes.map(registeredPitchFromNote)).toEqual(melodicMinorRegisteredPitches(registeredPitchFromNote(tonic), options));
        expect(melodicMinorRegisteredNotes(tonic, { ...options, includeEndpoint: false })).toEqual(notes.slice(0, -1));
      }
    }
  });

  test("validates only the selected leg's spelling", () => {
    const tonic = parseRegisteredNote("G##4");
    const options = { ...up, convention: "classical-exercise", direction: "down" } as const;
    expect(format(melodicMinorRegisteredNotes(tonic, options)))
      .toEqual(["G##4", "F##4", "E#4", "D##4", "C##4", "B#3", "A##3", "G##3"]);
    expect(() => melodicMinorRegisteredNotes(tonic, { ...options, direction: "up" })).toThrow(RangeError);
    expect(() => melodicMinorRegisteredNotes(tonic, { ...options, convention: "fixed-collection" })).toThrow(RangeError);
    expect(melodicMinorRegisteredPitches(registeredPitchFromNote(tonic), up)).toHaveLength(8);
  });

  test("preserves frozen inputs and isolates returned arrays and notes", () => {
    const tonic = Object.freeze(parseRegisteredNote("C4"));
    const options = Object.freeze({ ...up, convention: "classical-exercise", direction: "down", octaves: 2 } as const);
    const first = melodicMinorRegisteredNotes(tonic, options);
    const second = melodicMinorRegisteredNotes(tonic, options);
    expect(first).not.toBe(second);
    first.forEach((note, index) => {
      expect(note).not.toBe(tonic);
      expect(note).not.toBe(second[index]);
    });
    (first[0] as { accidental: number }).accidental = 1;
    expect(second[0]).toEqual(tonic);
    expect(first[7]).toEqual(parseRegisteredNote("C3"));
    const pitches = melodicMinorRegisteredPitches(48, options);
    (pitches as number[])[0] = 0;
    expect(melodicMinorRegisteredPitches(48, options)[0]).toBe(48);
    expect(tonic).toEqual(parseRegisteredNote("C4"));
    expect(options).toEqual({ convention: "classical-exercise", direction: "down", octaves: 2, includeEndpoint: true });
  });

  test("existing fixed-run API still retains raised sixth and seventh on descent", () => {
    const tonic = parseRegisteredNote("C5");
    const options = { direction: "down", octaves: 1, includeEndpoint: true } as const;
    expect(format(scaleRegisteredNotes(tonic, "melodic-minor-ascending", options)))
      .toEqual(["C5", "B4", "A4", "G4", "F4", "Eb4", "D4", "C4"]);
  });
});

describe("melodic-minor run validation", () => {
  const invalidOptions = [
    ...[undefined, null, "", "jazz", "classical", "FIXED-COLLECTION", "toString"].map((convention) => ({ ...up, convention })),
    ...[undefined, "sideways", "UP"].map((direction) => ({ ...up, direction })),
    ...[undefined, 0, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1].map((octaves) => ({ ...up, octaves })),
    ...[undefined, null, 0, "true"].map((includeEndpoint) => ({ ...up, includeEndpoint })),
  ];
  test.each(invalidOptions)("rejects invalid or missing explicit option %o", (input) => {
    const options = input as unknown as MelodicMinorRunOptions;
    expect(() => melodicMinorRegisteredPitches(48, options)).toThrow(RangeError);
    expect(() => melodicMinorRegisteredNotes(parseRegisteredNote("C4"), options)).toThrow(RangeError);
  });

  test.each([NaN, Infinity, -Infinity, 0.5, Number.MAX_SAFE_INTEGER + 1])("rejects invalid pitch or octave %s", (value) => {
    expect(() => melodicMinorRegisteredPitches(value, up)).toThrow(RangeError);
    expect(() => melodicMinorRegisteredNotes({ letter: "C", accidental: 0, octave: value }, up)).toThrow(RangeError);
  });

  test.each(conventions)("retains the output cap and safe arithmetic under %s", (convention) => {
    for (const direction of ["up", "down"] as const) {
      for (const includeEndpoint of [false, true]) {
        const options = { convention, direction, includeEndpoint, octaves: 1428 };
        const expectedLength = 9996 + Number(includeEndpoint);
        expect(expectedLength).toBeLessThanOrEqual(MAX_SCALE_RUN_NOTES);
        expect(melodicMinorRegisteredPitches(0, options)).toHaveLength(expectedLength);
        expect(melodicMinorRegisteredNotes(parseRegisteredNote("C0"), options)).toHaveLength(expectedLength);
        for (const octaves of [1429, Number.MAX_SAFE_INTEGER]) {
          expect(() => melodicMinorRegisteredPitches(0, { ...options, octaves })).toThrow(RangeError);
          expect(() => melodicMinorRegisteredNotes(parseRegisteredNote("C0"), { ...options, octaves })).toThrow(RangeError);
        }
      }
    }
    const high = Number.MAX_SAFE_INTEGER;
    const low = Number.MIN_SAFE_INTEGER;
    expect(melodicMinorRegisteredPitches(high, { ...up, convention, direction: "down" })).toHaveLength(8);
    expect(melodicMinorRegisteredPitches(low, { ...up, convention })).toHaveLength(8);
    expect(() => melodicMinorRegisteredPitches(high, { ...up, convention })).toThrow(RangeError);
    expect(() => melodicMinorRegisteredPitches(low, { ...up, convention, direction: "down" })).toThrow(RangeError);
    expect(melodicMinorRegisteredPitches(high - 11, { ...up, convention, includeEndpoint: false })).toHaveLength(7);
    expect(() => melodicMinorRegisteredPitches(high - 11, { ...up, convention })).toThrow(RangeError);
    const down = { ...up, convention, direction: "down" } as const;
    expect(melodicMinorRegisteredPitches(low + 10, { ...down, includeEndpoint: false })).toHaveLength(7);
    expect(() => melodicMinorRegisteredPitches(low + 10, down)).toThrow(RangeError);
  });

  test.each(conventions)("retains safe written-octave-base restrictions under %s", (convention) => {
    const tonic = { letter: "F", accidental: 0, octave: -750599937895082 } as const;
    const options = { ...up, convention, direction: "down" } as const;
    expect(melodicMinorRegisteredPitches(registeredPitchFromNote(tonic), options)).toHaveLength(8);
    expect(() => melodicMinorRegisteredNotes(tonic, options)).toThrow(RangeError);
    expect(() => melodicMinorRegisteredNotes({ ...tonic, octave: tonic.octave - 1 }, up)).toThrow(RangeError);
  });
});

if (false) {
  const tonic = { letter: "C", accidental: 0, octave: 4 } as const;
  // @ts-expect-error Convention is required.
  melodicMinorRegisteredPitches(48, { direction: "up", octaves: 1, includeEndpoint: true });
  // @ts-expect-error Direction is required.
  melodicMinorRegisteredNotes(tonic, { convention: "fixed-collection", octaves: 1, includeEndpoint: true });
  // @ts-expect-error Octave extent is required.
  melodicMinorRegisteredPitches(48, { convention: "fixed-collection", direction: "up", includeEndpoint: true });
  // @ts-expect-error Endpoint policy is required.
  melodicMinorRegisteredNotes(tonic, { convention: "fixed-collection", direction: "up", octaves: 1 });
  // @ts-expect-error No inferred jazz alias.
  const convention: MelodicMinorConvention = "jazz";
  void convention;
  // @ts-expect-error A spelled tonic requires written register.
  melodicMinorRegisteredNotes({ letter: "C", accidental: 0 }, up);
  // @ts-expect-error Numeric output requires a numeric tonic.
  melodicMinorRegisteredPitches(tonic, up);
  // @ts-expect-error Options are readonly.
  up.convention = "classical-exercise";
  const notes = melodicMinorRegisteredNotes(tonic, up);
  // @ts-expect-error Notes are readonly.
  notes[0]!.octave = 5;
  // @ts-expect-error Arrays are readonly.
  notes.push(tonic);
  // @ts-expect-error Numeric arrays are readonly.
  melodicMinorRegisteredPitches(48, up).push(60);
}
