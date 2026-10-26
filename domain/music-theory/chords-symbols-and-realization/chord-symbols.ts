import { type NoteSpelling } from "../pitch-pitch-classes-and-spelling/note-spelling.js";
import {
  type AccidentalNotation, parseNoteSpelling, formatNoteSpelling,
} from "../pitch-pitch-classes-and-spelling/note-text.js";
import { type SpelledChordDescription, createSpelledChordDescription } from "./chord-descriptions.js";
import { type ChordFormula, validateChordFormula } from "./chord-formulas.js";
import { type TriadQuality, triadFormula } from "./triads.js";
import { type SeventhChordQuality, seventhChordFormula } from "./seventh-chords.js";
import { type AddedToneChordQuality, addedToneChordFormula } from "./added-tone-chords.js";
import { type ExtendedChordQuality, extendedChordFormula } from "./extended-chords.js";

// Notation only: musical definitions remain in the existing catalog getters.
const triadSuffixes = {
  major: "", minor: "m", diminished: "dim", augmented: "aug", sus2: "sus2", sus4: "sus4",
} as const satisfies Readonly<Record<TriadQuality, string>>;
const seventhSuffixes = {
  "major-seventh": "maj7", "dominant-seventh": "7", "minor-seventh": "m7",
  "half-diminished-seventh": "m7(b5)", "diminished-seventh": "dim7",
  "minor-major-seventh": "m(maj7)", "augmented-major-seventh": "aug(maj7)",
  "augmented-seventh": "aug7", "dominant-seventh-sus2": "7sus2", "dominant-seventh-sus4": "7sus4",
} as const satisfies Readonly<Record<SeventhChordQuality, string>>;
const addedToneSuffixes = {
  "major-add2": "add2", "major-add9": "add9", "minor-add9": "madd9", "major-add11": "add11",
  "major-sixth": "6", "minor-sixth": "m6", "major-sixth-ninth": "6/9",
} as const satisfies Readonly<Record<AddedToneChordQuality, string>>;
const extendedSuffixes = {
  "dominant-ninth": "9", "major-ninth": "maj9", "minor-ninth": "m9",
  "dominant-eleventh": "11", "major-eleventh": "maj11", "minor-eleventh": "m11",
  "dominant-thirteenth": "13", "major-thirteenth": "maj13", "minor-thirteenth": "m13",
  "dominant-flat-ninth": "7(b9)", "dominant-sharp-ninth": "7(#9)",
  "dominant-sharp-eleventh": "9(#11)", "dominant-flat-thirteenth": "13(b13)",
  "major-sharp-eleventh": "maj9(#11)",
} as const satisfies Readonly<Record<ExtendedChordQuality, string>>;

type SymbolEntry = Readonly<{ suffix: string; formula: () => ChordFormula }>;

function entriesFor<Q extends string>(
  suffixes: Readonly<Record<Q, string>>,
  formulaFor: (quality: Q) => ChordFormula,
): readonly SymbolEntry[] {
  return (Object.keys(suffixes) as Q[]).map((quality) => ({
    suffix: suffixes[quality], formula: () => formulaFor(quality),
  }));
}

const canonicalEntries = [
  ...entriesFor(triadSuffixes, triadFormula),
  ...entriesFor(seventhSuffixes, seventhChordFormula),
  ...entriesFor(addedToneSuffixes, addedToneChordFormula),
  ...entriesFor(extendedSuffixes, extendedChordFormula),
];
const suffixEntries = new Map(canonicalEntries.map((entry) => [entry.suffix, entry]));
const aliases = {
  sus: triadSuffixes.sus4,
  "7sus": seventhSuffixes["dominant-seventh-sus4"],
  "°": triadSuffixes.diminished,
  "°7": seventhSuffixes["diminished-seventh"],
  "ø7": seventhSuffixes["half-diminished-seventh"],
  "7(#5)": seventhSuffixes["augmented-seventh"],
};
for (const [alias, canonical] of Object.entries(aliases)) {
  suffixEntries.set(alias, suffixEntries.get(canonical)!);
}

/** Parse the bounded catalog grammar, preserving specified bass without resolving tones. */
export function parseChordSymbol(text: string): SpelledChordDescription {
  let body = text.trim();
  if (/\s/u.test(body)) {
    throw new SyntaxError("Chord symbols must not contain internal whitespace.");
  }
  let bass: NoteSpelling | undefined;
  const slash = body.lastIndexOf("/");
  if (slash !== -1) {
    try {
      // A terminal /9 belongs to 6/9; only a complete note spelling selects a bass.
      bass = parseNoteSpelling(body.slice(slash + 1));
      body = body.slice(0, slash);
    } catch (error) {
      if (!(error instanceof SyntaxError)) throw error;
    }
  }
  // Capture the whole accidental token, including malformed combinations, for shared validation.
  const rootToken = /^[A-G][#b♯♭𝄪𝄫♮]*/u.exec(body)?.[0];
  if (rootToken === undefined) {
    throw new SyntaxError("Chord symbols require an uppercase root note.");
  }
  const root = parseNoteSpelling(rootToken);
  const suffix = body.slice(rootToken.length).replaceAll("♭", "b").replaceAll("♯", "#");
  const entry = suffixEntries.get(suffix);
  if (entry === undefined) {
    throw new SyntaxError("Unsupported chord-symbol suffix or slash bass.");
  }
  return createSpelledChordDescription(root, entry.formula(), bass);
}

/** Format exact catalog roles only; do not infer spelling, rearrange tones or resolve register. */
export function formatChordSymbol(
  description: SpelledChordDescription,
  notation: AccidentalNotation = "unicode",
): string {
  validateChordFormula(description.formula);
  const root = formatNoteSpelling(description.root, notation);
  const entry = canonicalEntries.find((candidate) => {
    const formula = candidate.formula();
    return formula.length === description.formula.length && formula.every((role, index) =>
      role.number === description.formula[index]!.number
      && role.alteration === description.formula[index]!.alteration);
  });
  if (entry === undefined) {
    throw new RangeError("Chord formula has no supported canonical symbol.");
  }
  const suffix = notation === "ascii" ? entry.suffix : entry.suffix.replaceAll("b", "♭").replaceAll("#", "♯");
  const bass = description.bass === undefined ? "" : "/" + formatNoteSpelling(description.bass, notation);
  return root + suffix + bass;
}
