import { describe, expect, test } from "vitest";
import { formatNoteSpelling, parseNoteSpelling, parseRegisteredNote } from "../domain/music-theory/note-text.js";
import { registeredPitchFromNote } from "../domain/music-theory/registered-pitch.js";
import { scaleRegisteredNotes, scaleRegisteredPitches } from "../domain/music-theory/scale-runs.js";
import { parseScaleType } from "../domain/music-theory/scale-text.js";
import { type ScaleType, scaleNoteSpellings, scalePitchClasses } from "../domain/music-theory/scales.js";

// Independent catalog expectations cover every supported identifier.
const names = [
  ["major", "major", [0, 2, 4, 5, 7, 9, 11]],
  ["major-pentatonic", "major pentatonic", [0, 2, 4, 7, 9]],
  ["minor-pentatonic", "minor pentatonic", [0, 3, 5, 7, 10]],
  ["natural-minor", "natural minor", [0, 2, 3, 5, 7, 8, 10]],
  ["harmonic-minor", "harmonic minor", [0, 2, 3, 5, 7, 8, 11]],
  ["melodic-minor-ascending", "melodic minor ascending", [0, 2, 3, 5, 7, 9, 11]],
  ["ionian", "ionian", [0, 2, 4, 5, 7, 9, 11]],
  ["dorian", "dorian", [0, 2, 3, 5, 7, 9, 10]],
  ["phrygian", "phrygian", [0, 1, 3, 5, 7, 8, 10]],
  ["lydian", "lydian", [0, 2, 4, 6, 7, 9, 11]],
  ["mixolydian", "mixolydian", [0, 2, 4, 5, 7, 9, 10]],
  ["aeolian", "aeolian", [0, 2, 3, 5, 7, 8, 10]],
  ["locrian", "locrian", [0, 1, 3, 5, 6, 8, 10]],
] as const satisfies readonly (readonly [ScaleType, string, readonly number[]])[];

describe("parseScaleType", () => {
  test.each(names)("accepts %s and its explicit word form", (identifier, name) => {
    for (const form of [identifier, name]) {
      expect(parseScaleType(form)).toBe(identifier);
      expect(parseScaleType(form.toUpperCase())).toBe(identifier);
      const mixedCase = [...form].map((letter, index) => index % 2 === 0 ? letter.toUpperCase() : letter).join("");
      expect(parseScaleType(` \t${mixedCase}\r\n `)).toBe(identifier);
      expect(parseScaleType(form.replaceAll(" ", " \t\n  "))).toBe(identifier);
    }
  });

  test.each(names)("supplies existing construction and registered-run functions for %s", (identifier, name, offsets) => {
    const type = parseScaleType(name);
    expect(type).toBe(identifier);
    expect(scalePitchClasses(0, type)).toEqual(offsets);
    const options = { direction: "up", octaves: 1, includeEndpoint: true } as const;
    const expected = [...offsets.map((offset) => 48 + offset), 60];
    expect(scaleRegisteredPitches(48, type, options)).toEqual(expected);
    expect(scaleRegisteredNotes(parseRegisteredNote("C4"), type, options).map(registeredPitchFromNote)).toEqual(expected);
  });

  test("preserves existing alias identifiers instead of converting them to mode names", () => {
    expect(parseScaleType("major")).toBe("major");
    expect(parseScaleType("ionian")).toBe("ionian");
    expect(parseScaleType("natural minor")).toBe("natural-minor");
    expect(parseScaleType("aeolian")).toBe("aeolian");
    expect(scalePitchClasses(0, parseScaleType("major"))).toEqual(scalePitchClasses(0, parseScaleType("ionian")));
    expect(scalePitchClasses(0, parseScaleType("natural minor"))).toEqual(scalePitchClasses(0, parseScaleType("aeolian")));
  });

  test.each([
    "", " ", "\t\n", "minor", "melodic minor", "melodic-minor", "pentatonic",
    "maj", "min", "dorian mode", "major scale", "ascending melodic minor", "jazz melodic minor",
    "classical melodic minor", "melodic minor descending", "chromatic", "blues", "whole tone",
    "C major", "C# major", "A natural minor", "D dorian", "major up", "major or minor",
    "major_pentatonic", "majorpentatonic", "major--pentatonic", "major - pentatonic",
    "major- pentatonic", "major -pentatonic", "-major", "major-", "melodic-minor ascending",
    "melodic minor-ascending", "major/pentatonic", "major–pentatonic", "major‑pentatonic",
    "major2", "2", "major\0", "ma\tjor", "dorián", "toString", "constructor", "__proto__",
  ])("rejects unsupported or malformed text %s with SyntaxError", (text) => {
    expect(() => parseScaleType(text)).toThrow(SyntaxError);
  });

  test("accepts word whitespace without treating spaces around hyphens as valid", () => {
    expect(parseScaleType("\u00a0NATURAL\u00a0\u00a0MINOR\u00a0")).toBe("natural-minor");
    expect(() => parseScaleType("natural \t-\n minor")).toThrow(SyntaxError);
  });

  test("keeps parsing independent of tonic spelling validation", () => {
    const type = parseScaleType("HARMONIC MINOR");
    const notes = scaleNoteSpellings(parseNoteSpelling("G#"), type);
    expect(notes.map((note) => formatNoteSpelling(note, "ascii")))
      .toEqual(["G#", "A#", "B", "C#", "D#", "E", "F##"]);
    const unsupportedTonic = parseNoteSpelling("G##");
    expect(() => scaleNoteSpellings(unsupportedTonic, type)).toThrow(RangeError);
    expect(parseScaleType("harmonic minor")).toBe(type);
  });

  test("names the fixed melodic-minor collection without selecting descending behavior", () => {
    const type = parseScaleType("melodic minor ascending");
    expect(scaleRegisteredPitches(48, type, { direction: "down", octaves: 1, includeEndpoint: true }))
      .toEqual([48, 47, 45, 43, 41, 39, 38, 36]);
    expect(() => parseScaleType("melodic minor")).toThrow(SyntaxError);
  });
});

if (false) {
  const type: ScaleType = parseScaleType("major pentatonic");
  scalePitchClasses(0, type);
  // @ts-expect-error The text boundary requires a string.
  parseScaleType({ type: "major" });
  // @ts-expect-error The result is an identifier, not a constructed collection.
  const collection: readonly number[] = parseScaleType("major");
  void collection;
}
