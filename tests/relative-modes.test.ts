import { describe, expect, test } from "vitest";
import { type Accidental, type NoteSpelling, pitchClassFromSpelling } from "../domain/music-theory/note-spelling.js";
import { formatNoteSpelling, parseNoteSpelling } from "../domain/music-theory/note-text.js";
import { type PitchClass } from "../domain/music-theory/pitch-class.js";
import {
  type MajorScaleMode,
  type RelativeModeParent,
  relativeModeNoteSpellings,
  relativeModePitchClasses,
} from "../domain/music-theory/relative-modes.js";
import { type ScaleDegree, scaleNoteSpellings, scalePitchClasses } from "../domain/music-theory/scales.js";

// Independent semitone offsets and mode positions, including both parent aliases.
const parents = [
  ["major", 0, [0, 2, 4, 5, 7, 9, 11]],
  ["ionian", 0, [0, 2, 4, 5, 7, 9, 11]],
  ["dorian", 1, [0, 2, 3, 5, 7, 9, 10]],
  ["phrygian", 2, [0, 1, 3, 5, 7, 8, 10]],
  ["lydian", 3, [0, 2, 4, 6, 7, 9, 11]],
  ["mixolydian", 4, [0, 2, 4, 5, 7, 9, 10]],
  ["natural-minor", 5, [0, 2, 3, 5, 7, 8, 10]],
  ["aeolian", 5, [0, 2, 3, 5, 7, 8, 10]],
  ["locrian", 6, [0, 1, 3, 5, 6, 8, 10]],
] as const;
const modeNames: readonly MajorScaleMode[] = ["ionian", "dorian", "phrygian", "lydian", "mixolydian", "aeolian", "locrian"];
const degrees: readonly ScaleDegree[] = [1, 2, 3, 4, 5, 6, 7];
const tonics: readonly PitchClass[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

describe("relative modes", () => {
  test("derives both requested relationships with tonic-relative ordering", () => {
    expect(relativeModePitchClasses(0, "major", 2)).toEqual({
      tonic: 2, mode: "dorian", pitchClasses: [2, 4, 5, 7, 9, 11, 0],
    });
    expect(relativeModePitchClasses(2, "dorian", 6)).toEqual({
      tonic: 11, mode: "locrian", pitchClasses: [11, 0, 2, 4, 5, 7, 9],
    });
    const result = relativeModeNoteSpellings(parseNoteSpelling("D"), "dorian", 6);
    expect(result.tonic).toEqual(parseNoteSpelling("B"));
    expect(result.mode).toBe("locrian");
    expect(result.noteSpellings.map((note) => formatNoteSpelling(note, "ascii")))
      .toEqual(["B", "C", "D", "E", "F", "G", "A"]);
  });

  for (const [parent, position, offsets] of parents) {
    test.each(tonics)(`derives all degrees of ${parent} at tonic %i`, (tonic) => {
      const source = offsets.map((offset) => (tonic + offset) % 12);
      for (const degree of degrees) {
        const result = relativeModePitchClasses(tonic, parent, degree);
        const expected = source.map((_, index) => source[(index + degree - 1) % 7]);
        expect(result.pitchClasses).toEqual(expected);
        expect(result.tonic).toBe(source[degree - 1]);
        expect(result.mode).toBe(modeNames[(position + degree - 1) % 7]);
        expect(new Set(result.pitchClasses)).toEqual(new Set(source));
        expect(result.pitchClasses).toEqual(scalePitchClasses(result.tonic, result.mode));
        // Return to the original tonic from the derived mode.
        const backDegree = (degree === 1 ? 1 : 9 - degree) as ScaleDegree;
        const back = relativeModePitchClasses(result.tonic, result.mode, backDegree);
        expect(back).toEqual({ tonic, mode: modeNames[position], pitchClasses: source });
      }
    });

    test(`preserves exact spellings across all 35 tonic spellings of ${parent}`, () => {
      const naturals = [["C", 0], ["D", 2], ["E", 4], ["F", 5], ["G", 7], ["A", 9], ["B", 11]] as const;
      for (const [letterIndex, [letter, natural]] of naturals.entries()) {
        for (const accidental of [-2, -1, 0, 1, 2] as const) {
          const tonic = Object.freeze({ letter, accidental });
          const expectedParent = offsets.map((offset, index) => {
            const targetIndex = letterIndex + index;
            const [targetLetter, targetNatural] = naturals[targetIndex % 7]!;
            const alteration = natural + accidental + offset - targetNatural - 12 * Math.floor(targetIndex / 7);
            return { letter: targetLetter, accidental: alteration };
          });
          const supported = expectedParent.every((note) => Math.abs(note.accidental) <= 2);
          for (const degree of degrees) {
            if (!supported) {
              expect(() => relativeModeNoteSpellings(tonic, parent, degree)).toThrow(RangeError);
              continue;
            }
            const result = relativeModeNoteSpellings(tonic, parent, degree);
            const expected = expectedParent.map((_, index) => expectedParent[(index + degree - 1) % 7]);
            expect(result.noteSpellings).toEqual(expected);
            expect(result.tonic).toEqual(expected[0]);
            expect(result.mode).toBe(modeNames[(position + degree - 1) % 7]);
            expect(result.noteSpellings).toEqual(scaleNoteSpellings(result.tonic, result.mode));
            expect(result.noteSpellings.map(pitchClassFromSpelling)).toEqual(
              relativeModePitchClasses(pitchClassFromSpelling(tonic), parent, degree).pitchClasses,
            );
          }
          expect(tonic).toEqual({ letter, accidental });
        }
      }
    });
  }

  test.each([
    ["F#", ["G#", "A#", "B", "C#", "D#", "E#", "F#"]],
    ["Gb", ["Ab", "Bb", "Cb", "Db", "Eb", "F", "Gb"]],
    ["C##", ["D##", "E##", "F##", "G##", "A##", "B##", "C##"]],
  ] as const)("retains parent spellings when deriving Dorian from %s major", (text, expected) => {
    const result = relativeModeNoteSpellings(parseNoteSpelling(text), "major", 2);
    expect(result.mode).toBe("dorian");
    expect(result.noteSpellings.map((note) => formatNoteSpelling(note, "ascii"))).toEqual(expected);
  });

  test.each(["major", "natural-minor"] as const)("canonicalizes the %s alias at every degree", (alias) => {
    const canonical = alias === "major" ? "ionian" : "aeolian";
    for (const degree of degrees) {
      expect(relativeModePitchClasses(0, alias, degree)).toEqual(relativeModePitchClasses(0, canonical, degree));
      expect(relativeModeNoteSpellings(parseNoteSpelling("C"), alias, degree))
        .toEqual(relativeModeNoteSpellings(parseNoteSpelling("C"), canonical, degree));
    }
  });

  test.each(["harmonic-minor", "melodic-minor-ascending", "major-pentatonic", "minor-pentatonic", "minor", "MAJOR", "toString", "constructor", "__proto__"])(
    "rejects unsupported parent %s", (parent) => {
      expect(() => relativeModePitchClasses(0, parent as RelativeModeParent, 1)).toThrow(RangeError);
      expect(() => relativeModeNoteSpellings(parseNoteSpelling("C"), parent as RelativeModeParent, 1)).toThrow(RangeError);
    },
  );

  test.each([0, -1, 8, 1.5, NaN, Infinity, -Infinity, Number.MAX_SAFE_INTEGER])("rejects invalid degree %s", (degree) => {
    expect(() => relativeModePitchClasses(0, "major", degree as ScaleDegree)).toThrow(RangeError);
    expect(() => relativeModeNoteSpellings(parseNoteSpelling("C"), "major", degree as ScaleDegree)).toThrow(RangeError);
  });

  test("isolates repeated results and preserves a frozen supplied tonic", () => {
    const tonic: NoteSpelling = Object.freeze({ letter: "C", accidental: 0 });
    const first = relativeModeNoteSpellings(tonic, "major", 1);
    const second = relativeModeNoteSpellings(tonic, "major", 1);
    expect(first).not.toBe(second);
    expect(first.tonic).toBe(first.noteSpellings[0]);
    expect(first.tonic).not.toBe(tonic);
    expect(first.noteSpellings).not.toBe(second.noteSpellings);
    first.noteSpellings.forEach((note, index) => expect(note).not.toBe(second.noteSpellings[index]));
    (first.tonic as { accidental: Accidental }).accidental = 1;
    expect(second.tonic).toEqual(tonic);
    expect(relativeModeNoteSpellings(tonic, "major", 1)).toEqual(second);
    const numeric = relativeModePitchClasses(0, "major", 1);
    (numeric.pitchClasses as PitchClass[])[0] = 11;
    expect(relativeModePitchClasses(0, "major", 1).pitchClasses[0]).toBe(0);
    expect(tonic).toEqual({ letter: "C", accidental: 0 });
  });
});

if (false) {
  // @ts-expect-error Non-diatonic parents are outside the helper's contract.
  relativeModePitchClasses(0, "harmonic-minor", 1);
  // @ts-expect-error Pentatonic parents are outside the helper's contract.
  relativeModeNoteSpellings({ letter: "C", accidental: 0 }, "major-pentatonic", 1);
  // @ts-expect-error Ordinal degrees are 1..7.
  relativeModePitchClasses(0, "major", 8);
  // @ts-expect-error A spelled tonic requires an explicit accidental.
  relativeModeNoteSpellings({ letter: "C" }, "major", 1);
  const result = relativeModePitchClasses(0, "major", 1);
  const canonical: MajorScaleMode = result.mode;
  void canonical;
  // @ts-expect-error Result metadata is readonly.
  result.mode = "dorian";
  // @ts-expect-error Collections are readonly.
  result.pitchClasses.push(1);
  const spelled = relativeModeNoteSpellings({ letter: "C", accidental: 0 }, "major", 1);
  // @ts-expect-error Result notes are readonly.
  spelled.tonic.accidental = 1;
  // @ts-expect-error Spelled collections are readonly.
  spelled.noteSpellings.push({ letter: "D", accidental: 0 });
}
