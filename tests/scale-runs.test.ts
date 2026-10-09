import { describe, expect, test } from "vitest";
import { type Accidental, type NoteLetter } from "../domain/music-theory/note-spelling.js";
import { formatRegisteredNote, parseRegisteredNote } from "../domain/music-theory/note-text.js";
import { type RegisteredNote, registeredPitchFromNote } from "../domain/music-theory/registered-pitch.js";
import { MAX_SCALE_RUN_NOTES, type ScaleRunOptions, scaleRegisteredNotes, scaleRegisteredPitches } from "../domain/music-theory/scale-runs.js";
import { type ScaleType } from "../domain/music-theory/scales.js";

// Independent reference offsets, including pentatonic skipped degrees and aliases.
const patterns = [
  ["major", [0, 2, 4, 5, 7, 9, 11], [0, 1, 2, 3, 4, 5, 6]],
  ["ionian", [0, 2, 4, 5, 7, 9, 11], [0, 1, 2, 3, 4, 5, 6]],
  ["natural-minor", [0, 2, 3, 5, 7, 8, 10], [0, 1, 2, 3, 4, 5, 6]],
  ["aeolian", [0, 2, 3, 5, 7, 8, 10], [0, 1, 2, 3, 4, 5, 6]],
  ["harmonic-minor", [0, 2, 3, 5, 7, 8, 11], [0, 1, 2, 3, 4, 5, 6]],
  ["melodic-minor-ascending", [0, 2, 3, 5, 7, 9, 11], [0, 1, 2, 3, 4, 5, 6]],
  ["dorian", [0, 2, 3, 5, 7, 9, 10], [0, 1, 2, 3, 4, 5, 6]],
  ["phrygian", [0, 1, 3, 5, 7, 8, 10], [0, 1, 2, 3, 4, 5, 6]],
  ["lydian", [0, 2, 4, 6, 7, 9, 11], [0, 1, 2, 3, 4, 5, 6]],
  ["mixolydian", [0, 2, 4, 5, 7, 9, 10], [0, 1, 2, 3, 4, 5, 6]],
  ["locrian", [0, 1, 3, 5, 6, 8, 10], [0, 1, 2, 3, 4, 5, 6]],
  ["major-pentatonic", [0, 2, 4, 7, 9], [0, 1, 2, 4, 5]],
  ["minor-pentatonic", [0, 3, 5, 7, 10], [0, 2, 3, 4, 6]],
] as const satisfies readonly (readonly [ScaleType, readonly number[], readonly number[]])[];
const up: ScaleRunOptions = { direction: "up", octaves: 1, includeEndpoint: true };
const down: ScaleRunOptions = { ...up, direction: "down" };
const naturals: readonly (readonly [NoteLetter, number])[] = [["C", 0], ["D", 2], ["E", 4], ["F", 5], ["G", 7], ["A", 9], ["B", 11]];
const format = (notes: readonly RegisteredNote[]) => notes.map((note) => formatRegisteredNote(note, "ascii"));

describe("registered scale runs", () => {
  test("constructs one-octave C major in both directions with explicit endpoint behavior", () => {
    expect(scaleRegisteredPitches(48, "major", up)).toEqual([48, 50, 52, 53, 55, 57, 59, 60]);
    expect(scaleRegisteredPitches(48, "major", down)).toEqual([48, 47, 45, 43, 41, 40, 38, 36]);
    expect(format(scaleRegisteredNotes(parseRegisteredNote("C4"), "major", up)))
      .toEqual(["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5"]);
    expect(format(scaleRegisteredNotes(parseRegisteredNote("C4"), "major", down)))
      .toEqual(["C4", "B3", "A3", "G3", "F3", "E3", "D3", "C3"]);
    for (const options of [up, down]) {
      const inclusive = scaleRegisteredPitches(48, "major", options);
      expect(scaleRegisteredPitches(48, "major", { ...options, includeEndpoint: false })).toEqual(inclusive.slice(0, -1));
    }
  });

  for (const [type, offsets, letterSteps] of patterns) {
    test.each([-25, -1, 0, 47, 48, 59, 60])(`orders ${type} from coordinate %i across octaves`, (tonic) => {
      for (const octaves of [1, 2, 3]) {
        // Independently enumerate all members within the requested pitch range.
        const ascending = Array.from({ length: octaves }, (_, octave) => offsets.map((offset) => tonic + octave * 12 + offset)).flat();
        ascending.push(tonic + octaves * 12);
        const descending = ascending.map((pitch) => pitch - octaves * 12).reverse();
        for (const includeEndpoint of [false, true]) {
          const upResult = scaleRegisteredPitches(tonic, type, { direction: "up", octaves, includeEndpoint });
          const downResult = scaleRegisteredPitches(tonic, type, { direction: "down", octaves, includeEndpoint });
          expect(upResult).toEqual(includeEndpoint ? ascending : ascending.slice(0, -1));
          expect(downResult).toEqual(includeEndpoint ? descending : descending.slice(0, -1));
          expect(upResult.filter((pitch) => (pitch - tonic) % 12 === 0)).toHaveLength(octaves + Number(includeEndpoint));
        }
      }
    });

    test(`preserves ${type} spellings at all 35 tonics and negative/positive written octaves`, () => {
      for (const [letterIndex, [letter, natural]] of naturals.entries()) {
        for (const accidental of [-2, -1, 0, 1, 2] as const) {
          const expectedPattern = offsets.map((offset, index) => {
            const targetIndex = letterIndex + letterSteps[index]!;
            const [targetLetter, targetNatural] = naturals[targetIndex % 7]!;
            const crossing = Math.floor(targetIndex / 7);
            return { letter: targetLetter, accidental: natural + accidental + offset - targetNatural - 12 * crossing, crossing };
          });
          for (const octave of [-1, 4]) {
            const tonic = Object.freeze({ letter, accidental, octave });
            for (const direction of ["up", "down"] as const) {
              const options = { direction, octaves: 2, includeEndpoint: true } as const;
              if (expectedPattern.some((note) => Math.abs(note.accidental) > 2)) {
                expect(() => scaleRegisteredNotes(tonic, type, options)).toThrow(RangeError);
                continue;
              }
              const expectedUp = [0, 1].flatMap((cycle) => expectedPattern.map((note) => ({
                letter: note.letter, accidental: note.accidental, octave: octave + cycle + note.crossing,
              })));
              expectedUp.push({ letter, accidental, octave: octave + 2 });
              const expected = direction === "up" ? expectedUp : expectedUp.map((note) => ({ ...note, octave: note.octave - 2 })).reverse();
              const result = scaleRegisteredNotes(tonic, type, options);
              expect(result).toEqual(expected);
              expect(result.map(registeredPitchFromNote)).toEqual(scaleRegisteredPitches(registeredPitchFromNote(tonic), type, options));
              expect(scaleRegisteredNotes(tonic, type, { ...options, includeEndpoint: false })).toEqual(expected.slice(0, -1));
            }
          }
        }
      }
    });
  }

  test.each([
    ["B#3", "major", ["B#3", "C##4", "D##4", "E#4", "F##4", "G##4", "A##4", "B#4"]],
    ["Cb0", "major", ["Cb0", "Db0", "Eb0", "Fb0", "Gb0", "Ab0", "Bb0", "Cb1"]],
    ["F#4", "major-pentatonic", ["F#4", "G#4", "A#4", "C#5", "D#5", "F#5"]],
  ] as const)("retains written register and interval roles for %s %s", (text, type, expected) => {
    expect(format(scaleRegisteredNotes(parseRegisteredNote(text), type, up))).toEqual(expected);
  });

  test("traverses fixed melodic-minor-ascending downward without choosing a classical convention", () => {
    expect(format(scaleRegisteredNotes(parseRegisteredNote("C4"), "melodic-minor-ascending", down)))
      .toEqual(["C4", "B3", "A3", "G3", "F3", "Eb3", "D3", "C3"]);
  });

  test.each([0, -1, 1.5, NaN, Infinity, -Infinity, Number.MAX_SAFE_INTEGER + 1])("rejects invalid octave extent %s", (octaves) => {
    expect(() => scaleRegisteredPitches(48, "major", { ...up, octaves })).toThrow(RangeError);
    expect(() => scaleRegisteredNotes(parseRegisteredNote("C4"), "major", { ...up, octaves })).toThrow(RangeError);
  });

  test.each(["sideways", "UP", "", undefined])("rejects missing or unsupported direction %s", (direction) => {
    const options = { ...up, direction } as unknown as ScaleRunOptions;
    expect(() => scaleRegisteredPitches(48, "major", options)).toThrow(RangeError);
    expect(() => scaleRegisteredNotes(parseRegisteredNote("C4"), "major", options)).toThrow(RangeError);
  });

  test.each([undefined, 0, 1, "true", null])("rejects nonboolean endpoint inclusion %s", (includeEndpoint) => {
    const options = { ...up, includeEndpoint } as unknown as ScaleRunOptions;
    expect(() => scaleRegisteredPitches(48, "major", options)).toThrow(RangeError);
    expect(() => scaleRegisteredNotes(parseRegisteredNote("C4"), "major", options)).toThrow(RangeError);
  });

  test.each([NaN, Infinity, -Infinity, 1.5, Number.MAX_SAFE_INTEGER + 1])("rejects invalid registered tonic or written octave %s", (value) => {
    expect(() => scaleRegisteredPitches(value, "major", up)).toThrow(RangeError);
    expect(() => scaleRegisteredNotes({ letter: "C", accidental: 0, octave: value }, "major", up)).toThrow(RangeError);
  });

  test.each(["chromatic", "melodic-minor", "toString", "constructor", "__proto__"])("rejects unsupported scale %s", (type) => {
    expect(() => scaleRegisteredPitches(48, type as ScaleType, up)).toThrow(RangeError);
    expect(() => scaleRegisteredNotes(parseRegisteredNote("C4"), type as ScaleType, up)).toThrow(RangeError);
  });

  test("checks the allocation budget including the optional endpoint before multiplication", () => {
    expect(MAX_SCALE_RUN_NOTES).toBe(10_000);
    const maximum = { ...up, octaves: 2000, includeEndpoint: false };
    expect(scaleRegisteredPitches(0, "major-pentatonic", maximum)).toHaveLength(MAX_SCALE_RUN_NOTES);
    expect(scaleRegisteredNotes(parseRegisteredNote("C0"), "major-pentatonic", maximum)).toHaveLength(MAX_SCALE_RUN_NOTES);
    for (const octaves of [2000, 2001, Number.MAX_SAFE_INTEGER]) {
      expect(() => scaleRegisteredPitches(0, "major-pentatonic", { ...up, octaves })).toThrow(RangeError);
      expect(() => scaleRegisteredNotes(parseRegisteredNote("C0"), "major-pentatonic", { ...up, octaves })).toThrow(RangeError);
    }
    expect(scaleRegisteredPitches(0, "major", { ...up, octaves: 1428 })).toHaveLength(9997);
    expect(() => scaleRegisteredPitches(0, "major", { ...up, octaves: 1429 })).toThrow(RangeError);
  });

  test("supports safe coordinate extremes when travelling inward and rejects emitted overflow", () => {
    const high = Number.MAX_SAFE_INTEGER;
    const low = Number.MIN_SAFE_INTEGER;
    expect(scaleRegisteredPitches(high, "major", down)).toEqual([high, high - 1, high - 3, high - 5, high - 7, high - 8, high - 10, high - 12]);
    expect(scaleRegisteredPitches(low, "major", up)).toEqual([low, low + 2, low + 4, low + 5, low + 7, low + 9, low + 11, low + 12]);
    expect(() => scaleRegisteredPitches(high, "major", up)).toThrow(RangeError);
    expect(() => scaleRegisteredPitches(low, "major", down)).toThrow(RangeError);
    // The excluded endpoint need not fit: every emitted note still does.
    expect(scaleRegisteredPitches(high - 11, "major", { ...up, includeEndpoint: false })).toHaveLength(7);
    expect(() => scaleRegisteredPitches(high - 11, "major", up)).toThrow(RangeError);
    expect(scaleRegisteredPitches(low + 10, "major", { ...down, includeEndpoint: false })).toHaveLength(7);
    expect(() => scaleRegisteredPitches(low + 10, "major", down)).toThrow(RangeError);
  });

  test("uses exact octave recovery while retaining spelled safe-octave-base restrictions", () => {
    const largestOctave = 750599937895082;
    const high = { letter: "G", accidental: -2, octave: largestOctave } as const;
    const low = { letter: "C", accidental: -2, octave: -largestOctave } as const;
    for (const [tonic, options] of [[high, down], [low, up]] as const) {
      const result = scaleRegisteredNotes(tonic, "major", options);
      expect(result[0]).toEqual(tonic);
      expect(result.map(registeredPitchFromNote)).toEqual(scaleRegisteredPitches(registeredPitchFromNote(tonic), "major", options));
    }
    // The upper run exceeds numeric limits; the lower numeric run fits, but an
    // emitted written octave would have an unsafe base.
    const upper = { letter: "C", accidental: -2, octave: largestOctave } as const;
    const lower = { letter: "F", accidental: 0, octave: -largestOctave } as const;
    expect(() => scaleRegisteredPitches(registeredPitchFromNote(upper), "major", up)).toThrow(RangeError);
    expect(() => scaleRegisteredNotes(upper, "major", up)).toThrow(RangeError);
    expect(scaleRegisteredPitches(registeredPitchFromNote(lower), "major", { ...down, includeEndpoint: false })).toHaveLength(7);
    expect(() => scaleRegisteredNotes(lower, "major", { ...down, includeEndpoint: false })).toThrow(RangeError);
    expect(() => scaleRegisteredNotes({ letter: "B", accidental: 0, octave: -largestOctave - 1 }, "major", up)).toThrow(RangeError);
  });

  test("rejects unsupported accidentals without restricting numeric runs", () => {
    const tonic = parseRegisteredNote("G##4");
    expect(() => scaleRegisteredNotes(tonic, "major", up)).toThrow(RangeError);
    expect(scaleRegisteredPitches(registeredPitchFromNote(tonic), "major", up)).toHaveLength(8);
  });

  test("preserves frozen inputs and returns independent arrays and per-note objects", () => {
    const tonic = Object.freeze(parseRegisteredNote("C4"));
    const options = Object.freeze({ ...up, octaves: 2 });
    const first = scaleRegisteredNotes(tonic, "major", options);
    const second = scaleRegisteredNotes(tonic, "major", options);
    expect(first).not.toBe(second);
    first.forEach((note, index) => {
      expect(note).not.toBe(tonic);
      expect(note).not.toBe(second[index]);
    });
    expect(first[0]).not.toBe(first[7]);
    (first[0] as { accidental: Accidental }).accidental = 1;
    expect(second[0]).toEqual(tonic);
    expect(first[7]).toEqual({ ...tonic, octave: 5 });
    const numeric = scaleRegisteredPitches(48, "major", options);
    (numeric as number[])[0] = 1;
    expect(scaleRegisteredPitches(48, "major", options)[0]).toBe(48);
    expect(tonic).toEqual(parseRegisteredNote("C4"));
    expect(options).toEqual({ direction: "up", octaves: 2, includeEndpoint: true });
  });
});

if (false) {
  // @ts-expect-error A numeric registered tonic must be a number.
  scaleRegisteredPitches("C4", "major", up);
  // @ts-expect-error Spelled output requires a written octave.
  scaleRegisteredNotes({ letter: "C", accidental: 0 }, "major", up);
  // @ts-expect-error Direction is explicit.
  scaleRegisteredPitches(48, "major", { octaves: 1, includeEndpoint: true });
  // @ts-expect-error Extent is explicit.
  scaleRegisteredPitches(48, "major", { direction: "up", includeEndpoint: true });
  // @ts-expect-error Endpoint inclusion is explicit.
  scaleRegisteredPitches(48, "major", { direction: "up", octaves: 1 });
  // @ts-expect-error Unsupported direction.
  scaleRegisteredPitches(48, "major", { ...up, direction: "ascending" });
  // @ts-expect-error Unsupported scale identifier.
  scaleRegisteredPitches(48, "chromatic", up);
  // @ts-expect-error Options are readonly.
  up.octaves = 2;
  const pitches = scaleRegisteredPitches(48, "major", up);
  // @ts-expect-error Output is readonly.
  pitches.push(60);
  const notes = scaleRegisteredNotes({ letter: "C", accidental: 0, octave: 4 }, "major", up);
  // @ts-expect-error Output note is readonly.
  notes[0]!.octave = 5;
  // @ts-expect-error Output array is readonly.
  notes.push({ letter: "C", accidental: 0, octave: 5 });
}
