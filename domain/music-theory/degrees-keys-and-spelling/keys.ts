import { noteSpellingFromDegreeFormula } from "./degrees.js";
import { type NoteLetter, type NoteSpelling } from "../pitch-pitch-classes-and-spelling/note-spelling.js";
import { scaleNoteSpellings } from "../scales-and-modes/scales.js";

export type KeyMode = "major" | "minor";
/** Tonal identity, independent of signature availability or a selected scale collection. */
export type Key = Readonly<{ tonic: NoteSpelling; mode: KeyMode }>;
export type KeySignatureAccidental = Readonly<{ letter: NoteLetter; accidental: -1 | 1 }>;
export type KeySignature = readonly KeySignatureAccidental[];

const sharpOrder = ["F", "C", "G", "D", "A", "E", "B"] as const;
const flatOrder = ["B", "E", "A", "D", "G", "C", "F"] as const;

function validateMode(mode: KeyMode): void {
  if (mode !== "major" && mode !== "minor") {
    throw new RangeError("Key mode must be major or minor.");
  }
}

/** Create an explicitly spelled identity without checking its signature or scale spelling. */
export function createKey(tonic: NoteSpelling, mode: KeyMode): Key {
  validateMode(mode);
  return { tonic: { letter: tonic.letter, accidental: tonic.accidental }, mode };
}

/** Construct a conventional signature; the minor baseline does not select a musical collection. */
export function keySignature(key: Key): KeySignature {
  validateMode(key.mode);
  const notes = scaleNoteSpellings(key.tonic, key.mode === "major" ? "major" : "natural-minor");
  const altered = notes.filter((note) => note.accidental !== 0);
  if (altered.length === 0) return [];

  const accidental = altered[0]!.accidental;
  if ((accidental !== -1 && accidental !== 1) || altered.some((note) => note.accidental !== accidental)) {
    throw new RangeError("Key signature requires uniform single sharps or flats, with at most seven altered letters.");
  }
  const order = accidental === 1 ? sharpOrder : flatOrder;
  const prefix = order.slice(0, altered.length);
  if (!prefix.every((letter) => altered.some((note) => note.letter === letter))) {
    throw new RangeError("Key signature must follow the conventional sharp or flat order.");
  }
  return prefix.map((letter) => ({ letter, accidental }));
}

/** Change tonic and mode while retaining exact relative spelling, without checking signatures. */
export function relativeKey(key: Key): Key {
  validateMode(key.mode);
  const tonic = noteSpellingFromDegreeFormula(key.tonic, key.mode === "major"
    ? { number: 6, alteration: 0 }
    : { number: 3, alteration: -1 });
  return createKey(tonic, key.mode === "major" ? "minor" : "major");
}

/** Preserve the spelled tonic and change major/minor identity, regardless of signature support. */
export function parallelKey(key: Key): Key {
  validateMode(key.mode);
  return createKey(key.tonic, key.mode === "major" ? "minor" : "major");
}
