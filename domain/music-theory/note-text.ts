import { type Accidental, type NoteLetter, type NoteSpelling } from "./note-spelling.js";
import { type RegisteredNote, registeredPitchFromNote } from "./registered-pitch.js";

export type AccidentalNotation = "ascii" | "unicode";

const accidentals: Readonly<Record<string, Accidental>> = {
  "": 0, "♮": 0, "#": 1, "♯": 1, "b": -1, "♭": -1,
  "##": 2, "𝄪": 2, "bb": -2, "𝄫": -2,
};
const symbols: Readonly<Record<AccidentalNotation, Readonly<Record<Accidental, string>>>> = {
  ascii: { [-2]: "bb", [-1]: "b", 0: "", 1: "#", 2: "##" },
  unicode: { [-2]: "𝄫", [-1]: "♭", 0: "", 1: "♯", 2: "𝄪" },
};

function parseParts(text: string): { spelling: NoteSpelling; octaveText: string | undefined } {
  const match = /^([A-G])(##|bb|#|b|♯|♭|𝄪|𝄫|♮)?([+-]?\d+)?$/u.exec(text.trim());
  if (!match) {
    throw new SyntaxError("Expected an uppercase note letter, supported accidental, and optional integer octave.");
  }

  return {
    spelling: {
      letter: match[1] as NoteLetter,
      accidental: accidentals[match[2] ?? ""] as Accidental,
    },
    octaveText: match[3],
  };
}

/** Parse a spelling without an octave. Outer whitespace is ignored. */
export function parseNoteSpelling(text: string): NoteSpelling {
  const { spelling, octaveText } = parseParts(text);
  if (octaveText !== undefined) {
    throw new SyntaxError("A note spelling must not include an octave.");
  }
  return spelling;
}

/** Parse a spelled note with a required, numerically supported written octave. */
export function parseRegisteredNote(text: string): RegisteredNote {
  const { spelling, octaveText } = parseParts(text);
  if (octaveText === undefined) {
    throw new SyntaxError("A registered note requires an integer octave.");
  }
  const note: RegisteredNote = { ...spelling, octave: Number(octaveText) };
  registeredPitchFromNote(note);
  return note;
}

/** Format the supplied spelling without choosing an enharmonic alternative. */
export function formatNoteSpelling(
  note: NoteSpelling,
  notation: AccidentalNotation = "unicode",
): string {
  if (notation !== "ascii" && notation !== "unicode") {
    throw new RangeError("Accidental notation must be ascii or unicode.");
  }
  return note.letter + symbols[notation][note.accidental];
}

/** Format the supplied spelling and written octave, preserving both. */
export function formatRegisteredNote(
  note: RegisteredNote,
  notation: AccidentalNotation = "unicode",
): string {
  registeredPitchFromNote(note);
  return formatNoteSpelling(note, notation) + String(note.octave);
}
