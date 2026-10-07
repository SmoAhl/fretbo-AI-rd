import { describe, expect, test } from "vitest";
import { type NoteLetter, type NoteSpelling } from "../domain/music-theory/note-spelling.js";
import {
  formatNoteSpelling, formatRegisteredNote, parseNoteSpelling, parseRegisteredNote,
} from "../domain/music-theory/note-text.js";

describe("note text", () => {
  test.each([
    ["C", "C", 0], ["D#", "D", 1], ["D♯", "D", 1],
    ["Eb", "E", -1], ["E♭", "E", -1], ["F##", "F", 2], ["F𝄪", "F", 2],
    ["Gbb", "G", -2], ["G𝄫", "G", -2], ["A♮", "A", 0], [" B♭ \n", "B", -1],
  ])("parses spelling %s", (text, letter, accidental) => {
    expect(parseNoteSpelling(text)).toEqual({ letter, accidental });
  });

  test.each([
    ["C#4", { letter: "C", accidental: 1, octave: 4 }],
    ["D♭4", { letter: "D", accidental: -1, octave: 4 }],
    ["B♯3", { letter: "B", accidental: 1, octave: 3 }],
    ["Cbb-1", { letter: "C", accidental: -2, octave: -1 }],
    [" F𝄪+04 \n", { letter: "F", accidental: 2, octave: 4 }],
    ["E♮0", { letter: "E", accidental: 0, octave: 0 }],
  ])("parses registered text %s without respelling", (text, expected) => {
    expect(parseRegisteredNote(text)).toEqual(expected);
  });

  test.each([
    "", " ", "H4", "c#4", "C #4", "C# 4", "C4x", "C###4", "Cbbb4",
    "Cx4", "C♯♯4", "C♭♭4", "C#b4", "C♮#4", "C4.5", "C1e2", "C+", "C--1",
    "C4\nD4", "C4\0", "C٤", "C−1",
  ])("rejects malformed registered text %s", (text) => {
    expect(() => parseRegisteredNote(text)).toThrow(SyntaxError);
  });

  test.each(["C", "D#", "F𝄪"])("requires an octave in registered parsing: %s", (text) => {
    expect(() => parseRegisteredNote(text)).toThrow(SyntaxError);
  });
  test.each(["C4", "D#-1"])("rejects an octave in spelling parsing: %s", (text) => {
    expect(() => parseNoteSpelling(text)).toThrow(SyntaxError);
  });
  test.each(["C9007199254740992", "C750599937895083", "G#750599937895082"])(
    "rejects numerically unsupported registered text %s", (text) => {
      expect(() => parseRegisteredNote(text)).toThrow(RangeError);
    },
  );

  test("formats supplied spellings and written octaves without reverse selection", () => {
    expect(formatRegisteredNote({ letter: "D", accidental: -1, octave: 4 })).toBe("D♭4");
    expect(formatRegisteredNote({ letter: "B", accidental: 1, octave: 3 })).toBe("B♯3");
    expect(formatRegisteredNote({ letter: "C", accidental: -2, octave: -1 }, "ascii")).toBe("Cbb-1");
    expect(formatNoteSpelling({ letter: "E", accidental: 0 })).toBe("E");
  });

  test("round trips all 35 spellings in both notations and multiple registers", () => {
    const expectedAscii = ["bb", "b", "", "#", "##"];
    const expectedUnicode = ["𝄫", "♭", "", "♯", "𝄪"];
    for (const letter of ["A", "B", "C", "D", "E", "F", "G"] as const satisfies readonly NoteLetter[]) {
      ([-2, -1, 0, 1, 2] as const).forEach((accidental, index) => {
        const spelling: NoteSpelling = { letter, accidental };
        expect(formatNoteSpelling(spelling, "ascii")).toBe(letter + expectedAscii[index]);
        expect(formatNoteSpelling(spelling)).toBe(letter + expectedUnicode[index]);
        for (const notation of ["ascii", "unicode"] as const) {
          expect(parseNoteSpelling(formatNoteSpelling(spelling, notation))).toEqual(spelling);
          for (const octave of [-1, 0, 4]) {
            const note = { ...spelling, octave };
            expect(parseRegisteredNote(formatRegisteredNote(note, notation))).toEqual(note);
          }
        }
      });
    }
  });

  test("formatting does not mutate frozen input and rejects unsupported numeric register", () => {
    const note = Object.freeze({ letter: "D", accidental: -1, octave: 4 } as const);
    expect(formatRegisteredNote(note)).toBe("D♭4");
    expect(note).toEqual({ letter: "D", accidental: -1, octave: 4 });
    for (const octave of [0.5, NaN, Infinity, 750599937895083]) {
      expect(() => formatRegisteredNote({ letter: "C", accidental: 0, octave })).toThrow(RangeError);
    }
  });
});

if (false) {
  // @ts-expect-error Formatting accepts only the agreed notation names.
  formatNoteSpelling({ letter: "C", accidental: 0 }, "fancy");
  // @ts-expect-error Registered formatting requires an octave.
  formatRegisteredNote({ letter: "C", accidental: 0 });
}
