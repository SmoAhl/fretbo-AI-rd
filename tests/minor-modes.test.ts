import { describe, expect, test } from "vitest";
import {
  type MinorMode,
  type MinorModeParent,
  minorModeNoteSpellings,
  minorModePitchClasses,
  minorModeRegisteredNotes,
  minorModeRegisteredPitches,
  relativeMinorModeNoteSpellings,
  relativeMinorModePitchClasses,
} from "../domain/music-theory/minor-modes.js";
import { type Accidental, type NoteSpelling, pitchClassFromSpelling } from "../domain/music-theory/note-spelling.js";
import { formatNoteSpelling, formatRegisteredNote, parseNoteSpelling, parseRegisteredNote } from "../domain/music-theory/note-text.js";
import { type PitchClass } from "../domain/music-theory/pitch-class.js";
import { registeredPitchFromNote } from "../domain/music-theory/registered-pitch.js";
import { type ScaleRunOptions, MAX_SCALE_RUN_NOTES } from "../domain/music-theory/scale-runs.js";
import { type ScaleDegree } from "../domain/music-theory/scales.js";

// Independent fixtures specify every tonic-relative collection and its closing steps.
const modes = [
  ["harmonic-minor", 1, [0, 2, 3, 5, 7, 8, 11], [2, 1, 2, 2, 1, 3, 1]],
  ["harmonic-minor", 2, [0, 1, 3, 5, 6, 9, 10], [1, 2, 2, 1, 3, 1, 2]],
  ["harmonic-minor", 3, [0, 2, 4, 5, 8, 9, 11], [2, 2, 1, 3, 1, 2, 1]],
  ["harmonic-minor", 4, [0, 2, 3, 6, 7, 9, 10], [2, 1, 3, 1, 2, 1, 2]],
  ["harmonic-minor", 5, [0, 1, 4, 5, 7, 8, 10], [1, 3, 1, 2, 1, 2, 2]],
  ["harmonic-minor", 6, [0, 3, 4, 6, 7, 9, 11], [3, 1, 2, 1, 2, 2, 1]],
  ["harmonic-minor", 7, [0, 1, 3, 4, 6, 8, 9], [1, 2, 1, 2, 2, 1, 3]],
  ["melodic-minor-ascending", 1, [0, 2, 3, 5, 7, 9, 11], [2, 1, 2, 2, 2, 2, 1]],
  ["melodic-minor-ascending", 2, [0, 1, 3, 5, 7, 9, 10], [1, 2, 2, 2, 2, 1, 2]],
  ["melodic-minor-ascending", 3, [0, 2, 4, 6, 8, 9, 11], [2, 2, 2, 2, 1, 2, 1]],
  ["melodic-minor-ascending", 4, [0, 2, 4, 6, 7, 9, 10], [2, 2, 2, 1, 2, 1, 2]],
  ["melodic-minor-ascending", 5, [0, 2, 4, 5, 7, 8, 10], [2, 2, 1, 2, 1, 2, 2]],
  ["melodic-minor-ascending", 6, [0, 2, 3, 5, 6, 8, 10], [2, 1, 2, 1, 2, 2, 2]],
  ["melodic-minor-ascending", 7, [0, 1, 3, 4, 6, 8, 10], [1, 2, 1, 2, 2, 2, 2]],
] as const satisfies readonly (readonly [MinorModeParent, ScaleDegree, readonly number[], readonly number[]])[];
const parents = [
  ["harmonic-minor", [0, 2, 3, 5, 7, 8, 11]],
  ["melodic-minor-ascending", [0, 2, 3, 5, 7, 9, 11]],
] as const;
const tonics: readonly PitchClass[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const naturals = [["C", 0], ["D", 2], ["E", 4], ["F", 5], ["G", 7], ["A", 9], ["B", 11]] as const;
const up: ScaleRunOptions = { direction: "up", octaves: 1, includeEndpoint: true };

function expectedSpellings(sourceIndex: number, accidental: number, offsets: readonly number[]) {
  const sourceNatural = naturals[sourceIndex]![1];
  return offsets.map((offset, index) => {
    const targetIndex = sourceIndex + index;
    const [letter, natural] = naturals[targetIndex % 7]!;
    return { letter, accidental: sourceNatural + accidental + offset - natural - 12 * Math.floor(targetIndex / 7) };
  });
}

describe("direct minor-derived modes", () => {
  for (const [parent, degree, offsets, steps] of modes) {
    const mode = Object.freeze({ parent, degree });
    test.each(tonics)(`${parent} rotation ${degree} at tonic %i`, (tonic) => {
      const result = minorModePitchClasses(tonic, mode);
      expect(result).toEqual(offsets.map((offset) => (tonic + offset) % 12));
      expect(result).toHaveLength(7);
      expect(result[0]).toBe(tonic);
      expect(new Set(result).size).toBe(7);
      expect(result.map((pitch, index) => (result[(index + 1) % 7]! - pitch + 12) % 12)).toEqual(steps);
    });

    test(`all 35 tonic spellings of ${parent} rotation ${degree}`, () => {
      for (const [sourceIndex, [letter]] of naturals.entries()) {
        for (const accidental of [-2, -1, 0, 1, 2] as const) {
          const tonic = Object.freeze({ letter, accidental });
          const expected = expectedSpellings(sourceIndex, accidental, offsets);
          if (expected.some((note) => Math.abs(note.accidental) > 2)) {
            expect(() => minorModeNoteSpellings(tonic, mode)).toThrow(RangeError);
            expect(minorModePitchClasses(pitchClassFromSpelling(tonic), mode)).toHaveLength(7);
          } else {
            const result = minorModeNoteSpellings(tonic, mode);
            expect(result).toEqual(expected);
            expect(result.map(pitchClassFromSpelling)).toEqual(minorModePitchClasses(pitchClassFromSpelling(tonic), mode));
          }
          expect(tonic).toEqual({ letter, accidental });
        }
      }
    });
  }

  test("preserves a double-accidental tonic and each mode interval role", () => {
    const mode = { parent: "harmonic-minor", degree: 7 } as const;
    expect(minorModeNoteSpellings(parseNoteSpelling("C##"), mode).map((note) => formatNoteSpelling(note, "ascii")))
      .toEqual(["C##", "D#", "E#", "F#", "G#", "A#", "B"]);
  });

  test("harmonic rotation 7 spells a diminished seventh rather than a sixth", () => {
    expect(minorModeNoteSpellings(parseNoteSpelling("C"), { parent: "harmonic-minor", degree: 7 })
      .map((note) => formatNoteSpelling(note, "ascii")))
      .toEqual(["C", "Db", "Eb", "Fb", "Gb", "Ab", "Bbb"]);
  });
});

describe("relative minor-derived modes", () => {
  for (const [parent, offsets] of parents) {
    test.each(tonics)(`${parent} relative relationships from %i`, (tonic) => {
      const collection = offsets.map((offset) => (tonic + offset) % 12);
      for (const degree of [1, 2, 3, 4, 5, 6, 7] as const) {
        const result = relativeMinorModePitchClasses(tonic, parent, degree);
        const expected = collection.map((_, index) => collection[(index + degree - 1) % 7]);
        expect(result).toEqual({ tonic: expected[0], mode: { parent, degree }, pitchClasses: expected });
        expect(new Set(result.pitchClasses)).toEqual(new Set(collection));
        expect(minorModePitchClasses(result.tonic, result.mode)).toEqual(result.pitchClasses);
      }
    });

    test(`preserves exact ${parent} spellings at all 35 parent tonics`, () => {
      for (const [sourceIndex, [letter]] of naturals.entries()) {
        for (const accidental of [-2, -1, 0, 1, 2] as const) {
          const tonic = Object.freeze({ letter, accidental });
          const collection = expectedSpellings(sourceIndex, accidental, offsets);
          for (const degree of [1, 2, 3, 4, 5, 6, 7] as const) {
            if (collection.some((note) => Math.abs(note.accidental) > 2)) {
              expect(() => relativeMinorModeNoteSpellings(tonic, parent, degree)).toThrow(RangeError);
            } else {
              const expected = collection.map((_, index) => collection[(index + degree - 1) % 7]);
              const result = relativeMinorModeNoteSpellings(tonic, parent, degree);
              expect(result).toEqual({ tonic: expected[0], mode: { parent, degree }, noteSpellings: expected });
              expect(result.tonic).toBe(result.noteSpellings[0]);
              expect(minorModeNoteSpellings(result.tonic, result.mode)).toEqual(result.noteSpellings);
              expect(result.noteSpellings.map(pitchClassFromSpelling)).toEqual(
                relativeMinorModePitchClasses(pitchClassFromSpelling(tonic), parent, degree).pitchClasses,
              );
            }
          }
          expect(tonic).toEqual({ letter, accidental });
        }
      }
    });
  }

  test.each([
    ["harmonic-minor", ["D", "Eb", "F", "G", "Ab", "B", "C"]],
    ["melodic-minor-ascending", ["D", "Eb", "F", "G", "A", "B", "C"]],
  ] as const)("derives C %s rotation 2 with exact roles", (parent, expected) => {
    const result = relativeMinorModeNoteSpellings(parseNoteSpelling("C"), parent, 2);
    expect(result.tonic).toEqual(parseNoteSpelling("D"));
    expect(result.noteSpellings.map((note) => formatNoteSpelling(note, "ascii"))).toEqual(expected);
  });
});

describe("registered minor-mode runs", () => {
  for (const [parent, degree, offsets] of modes) {
    const mode = { parent, degree } as const;
    test(`independent numeric runs for ${parent} rotation ${degree}`, () => {
      for (const tonicClass of tonics) {
        for (const base of [-24, 48]) {
          const tonic = base + tonicClass;
          for (const octaves of [1, 2]) {
            const ascending = Array.from({ length: octaves }, (_, cycle) => offsets.map((offset) => tonic + cycle * 12 + offset)).flat();
            ascending.push(tonic + octaves * 12);
            const descending = ascending.map((pitch) => pitch - octaves * 12).reverse();
            for (const includeEndpoint of [false, true]) {
              for (const direction of ["up", "down"] as const) {
                const expected = direction === "up" ? ascending : descending;
                expect(minorModeRegisteredPitches(tonic, mode, { direction, octaves, includeEndpoint }))
                  .toEqual(includeEndpoint ? expected : expected.slice(0, -1));
              }
            }
          }
        }
      }
    });

    test(`registered spellings for all 35 tonics of ${parent} rotation ${degree}`, () => {
      for (const [sourceIndex, [letter, natural]] of naturals.entries()) {
        for (const accidental of [-2, -1, 0, 1, 2] as const) {
          const spellings = expectedSpellings(sourceIndex, accidental, offsets);
          for (const octave of [-1, 4]) {
            const tonic = Object.freeze({ letter, accidental, octave });
            for (const direction of ["up", "down"] as const) {
              const options = { direction, octaves: 2, includeEndpoint: true };
              if (spellings.some((note) => Math.abs(note.accidental) > 2)) {
                expect(() => minorModeRegisteredNotes(tonic, mode, options)).toThrow(RangeError);
                continue;
              }
              const ascending = [0, 1].flatMap((cycle) => spellings.map((note, index) => ({
                ...note, octave: octave + cycle + Math.floor((sourceIndex + index) / 7),
              })));
              ascending.push({ letter, accidental, octave: octave + 2 });
              const expected = direction === "up" ? ascending : ascending.map((note) => ({ ...note, octave: note.octave - 2 })).reverse();
              const result = minorModeRegisteredNotes(tonic, mode, options);
              expect(result).toEqual(expected);
              expect(result.map(registeredPitchFromNote)).toEqual(minorModeRegisteredPitches(12 * octave + natural + accidental, mode, options));
              expect(minorModeRegisteredNotes(tonic, mode, { ...options, includeEndpoint: false })).toEqual(expected.slice(0, -1));
            }
          }
        }
      }
    });
  }

  test("descending a melodic-minor-derived mode keeps the fixed collection", () => {
    const mode = { parent: "melodic-minor-ascending", degree: 2 } as const;
    expect(minorModeRegisteredNotes(parseRegisteredNote("D5"), mode, { ...up, direction: "down" })
      .map((note) => formatRegisteredNote(note, "ascii")))
      .toEqual(["D5", "C5", "B4", "A4", "G4", "F4", "Eb4", "D4"]);
  });
});

describe("minor-mode validation and isolation", () => {
  const valid: MinorMode = { parent: "harmonic-minor", degree: 2 };
  const tonic = Object.freeze(parseRegisteredNote("C4"));
  const invalidModes = [
    ...["major", "natural-minor", "minor", "melodic-minor", "major-pentatonic", "toString", undefined].map((parent) => ({ parent, degree: 1 })),
    ...[0, -1, 8, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER, undefined].map((degree) => ({ parent: "harmonic-minor", degree })),
  ];
  test.each(invalidModes)("rejects unsupported descriptor %o", (input) => {
    const mode = input as unknown as MinorMode;
    expect(() => minorModePitchClasses(0, mode)).toThrow(RangeError);
    expect(() => minorModeNoteSpellings(tonic, mode)).toThrow(RangeError);
    expect(() => minorModeRegisteredPitches(48, mode, up)).toThrow(RangeError);
    expect(() => minorModeRegisteredNotes(tonic, mode, up)).toThrow(RangeError);
    expect(() => relativeMinorModePitchClasses(0, mode.parent, mode.degree)).toThrow(RangeError);
    expect(() => relativeMinorModeNoteSpellings(tonic, mode.parent, mode.degree)).toThrow(RangeError);
  });

  test.each([
    { ...up, direction: "sideways" }, { ...up, direction: undefined },
    ...[undefined, 0, -1, 1.5, Infinity, NaN, Number.MAX_SAFE_INTEGER + 1].map((octaves) => ({ ...up, octaves })),
    ...[undefined, 0, "true"].map((includeEndpoint) => ({ ...up, includeEndpoint })),
  ])("retains explicit run option validation %o", (input) => {
    const options = input as unknown as ScaleRunOptions;
    expect(() => minorModeRegisteredPitches(48, valid, options)).toThrow(RangeError);
    expect(() => minorModeRegisteredNotes(tonic, valid, options)).toThrow(RangeError);
  });

  test.each(modes)("retains run limits for %s rotation %i", (parent, degree) => {
    const mode = { parent, degree };
    for (const direction of ["up", "down"] as const) {
      const options = { ...up, direction, octaves: 1428 };
      expect(minorModeRegisteredPitches(0, mode, options)).toHaveLength(9997);
      expect(minorModeRegisteredPitches(0, mode, { ...options, includeEndpoint: false })).toHaveLength(9996);
      for (const octaves of [1429, Number.MAX_SAFE_INTEGER]) {
        expect(() => minorModeRegisteredPitches(0, mode, { ...options, octaves })).toThrow(RangeError);
        expect(() => minorModeRegisteredNotes(tonic, mode, { ...options, octaves })).toThrow(RangeError);
      }
    }
    const high = Number.MAX_SAFE_INTEGER;
    const low = Number.MIN_SAFE_INTEGER;
    expect(minorModeRegisteredPitches(high, mode, { ...up, direction: "down" })).toHaveLength(8);
    expect(minorModeRegisteredPitches(low, mode, up)).toHaveLength(8);
    expect(() => minorModeRegisteredPitches(high, mode, up)).toThrow(RangeError);
    expect(() => minorModeRegisteredPitches(low, mode, { ...up, direction: "down" })).toThrow(RangeError);
    expect(minorModeRegisteredPitches(high - 11, mode, { ...up, includeEndpoint: false })).toHaveLength(7);
    expect(() => minorModeRegisteredPitches(high - 11, mode, up)).toThrow(RangeError);
    expect(minorModeRegisteredPitches(low + 11, mode, { ...up, direction: "down", includeEndpoint: false })).toHaveLength(7);
    expect(() => minorModeRegisteredPitches(low + 11, mode, { ...up, direction: "down" })).toThrow(RangeError);
  });

  test("spelled runs retain the shared cap and written-octave-base limits", () => {
    expect(MAX_SCALE_RUN_NOTES).toBe(10_000);
    expect(minorModeRegisteredNotes(tonic, valid, { ...up, octaves: 1428 })).toHaveLength(9997);
    const low = { letter: "F", accidental: 0, octave: -750599937895082 } as const;
    const options = { ...up, direction: "down" } as const;
    expect(minorModeRegisteredPitches(registeredPitchFromNote(low), valid, options)).toHaveLength(8);
    expect(() => minorModeRegisteredNotes(low, valid, options)).toThrow(RangeError);
  });

  test.each([NaN, Infinity, 0.5, Number.MAX_SAFE_INTEGER + 1])("rejects invalid pitch/register %s", (value) => {
    expect(() => minorModeRegisteredPitches(value, valid, up)).toThrow(RangeError);
    expect(() => minorModeRegisteredNotes({ ...tonic, octave: value }, valid, up)).toThrow(RangeError);
  });

  test("preserves frozen inputs and isolates descriptors, notes, and arrays between calls", () => {
    const mode = Object.freeze(valid);
    const options = Object.freeze(up);
    const direct = minorModeNoteSpellings(tonic, mode);
    const otherDirect = minorModeNoteSpellings(tonic, mode);
    (direct[0] as { accidental: Accidental }).accidental = 1;
    expect(otherDirect[0]).toEqual({ letter: "C", accidental: 0 });
    const first = relativeMinorModeNoteSpellings(tonic, mode.parent, mode.degree);
    const second = relativeMinorModeNoteSpellings(tonic, mode.parent, mode.degree);
    expect(first.mode).not.toBe(second.mode);
    expect(first.tonic).toBe(first.noteSpellings[0]);
    first.noteSpellings.forEach((note, index) => expect(note).not.toBe(second.noteSpellings[index]));
    (first.mode as { degree: number }).degree = 7;
    (first.tonic as { accidental: number }).accidental = 2;
    expect(second.mode).toEqual(valid);
    expect(second.tonic).toEqual(parseNoteSpelling("D"));
    const notes = minorModeRegisteredNotes(tonic, mode, options);
    const otherNotes = minorModeRegisteredNotes(tonic, mode, options);
    notes.forEach((note, index) => {
      expect(note).not.toBe(tonic);
      expect(note).not.toBe(otherNotes[index]);
    });
    (notes[0] as { octave: number }).octave = 99;
    expect(otherNotes[0]).toEqual(tonic);
    const classes = minorModePitchClasses(0, mode);
    (classes as PitchClass[])[0] = 1;
    expect(minorModePitchClasses(0, mode)[0]).toBe(0);
    const relative = relativeMinorModePitchClasses(0, mode.parent, mode.degree);
    (relative.pitchClasses as PitchClass[])[0] = 0;
    expect(relativeMinorModePitchClasses(0, mode.parent, mode.degree).tonic).toBe(2);
    const pitches = minorModeRegisteredPitches(48, mode, options);
    (pitches as number[])[0] = 0;
    expect(minorModeRegisteredPitches(48, mode, options)[0]).toBe(48);
    expect(tonic).toEqual(parseRegisteredNote("C4"));
    expect(mode).toEqual({ parent: "harmonic-minor", degree: 2 });
    expect(options).toEqual({ direction: "up", octaves: 1, includeEndpoint: true });
  });
});

if (false) {
  const mode: MinorMode = { parent: "harmonic-minor", degree: 2 };
  const tonic: NoteSpelling = { letter: "C", accidental: 0 };
  // @ts-expect-error Parent collection is required.
  minorModePitchClasses(0, { degree: 2 });
  // @ts-expect-error Rotation degree is required.
  minorModeNoteSpellings(tonic, { parent: "harmonic-minor" });
  // @ts-expect-error Major modes retain their separate canonical contracts.
  minorModePitchClasses(0, { parent: "major", degree: 2 });
  // @ts-expect-error Relative derivation supports only the two explicit minor parents.
  relativeMinorModePitchClasses(0, "natural-minor", 2);
  // @ts-expect-error Rotation degrees are 1..7.
  relativeMinorModeNoteSpellings(tonic, "harmonic-minor", 8);
  // @ts-expect-error Mode descriptors are readonly.
  mode.degree = 3;
  // @ts-expect-error Registered spellings require written octave.
  minorModeRegisteredNotes(tonic, mode, up);
  // @ts-expect-error Run options remain explicit.
  minorModeRegisteredPitches(48, mode, { direction: "up", octaves: 1 });
  // @ts-expect-error Collections are readonly.
  minorModePitchClasses(0, mode).push(0);
  // @ts-expect-error Spellings are readonly.
  minorModeNoteSpellings(tonic, mode)[0]!.accidental = 1;
  // @ts-expect-error Relative result descriptors are readonly.
  relativeMinorModePitchClasses(0, "harmonic-minor", 2).mode.degree = 3;
  // @ts-expect-error Registered note results are readonly.
  minorModeRegisteredNotes({ ...tonic, octave: 4 }, mode, up)[0]!.octave = 5;
}
