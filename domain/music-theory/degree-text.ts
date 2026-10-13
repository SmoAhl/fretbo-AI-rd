import { type DegreeFormula, pitchClassFromDegreeFormula } from "./degrees.js";
import { type Accidental } from "./note-spelling.js";
import { type AccidentalNotation } from "./note-text.js";
import { type ScaleDegree } from "./scales.js";

const alterations: Readonly<Record<string, Accidental>> = {
  "": 0, "♮": 0, "b": -1, "♭": -1, "bb": -2, "♭♭": -2, "𝄫": -2,
  "#": 1, "♯": 1, "##": 2, "♯♯": 2, "𝄪": 2,
  "bbb": -3, "♭♭♭": -3, "♭𝄫": -3, "###": 3, "♯♯♯": 3, "♯𝄪": 3,
};
const symbols: Readonly<Record<AccidentalNotation, Readonly<Record<Accidental, string>>>> = {
  ascii: { [-3]: "bbb", [-2]: "bb", [-1]: "b", 0: "", 1: "#", 2: "##", 3: "###" },
  unicode: { [-3]: "♭♭♭", [-2]: "♭♭", [-1]: "♭", 0: "", 1: "♯", 2: "♯♯", 3: "♯♯♯" },
};

/** Parse one simple major-relative formula; outer whitespace and leading zeroes are allowed. */
export function parseDegreeFormula(text: string): DegreeFormula {
  const match = /^(bbb|###|♭♭♭|♯♯♯|♭𝄫|♯𝄪|bb|##|♭♭|♯♯|b|#|♭|♯|𝄫|𝄪|♮)?([0-9]+)$/u.exec(text.trim());
  if (!match) {
    throw new SyntaxError("Expected an optional accidental prefix and an unsigned decimal degree number.");
  }
  const formula: DegreeFormula = {
    number: Number(match[2]) as ScaleDegree,
    alteration: alterations[match[1] ?? ""]!,
  };
  // Numeric conversion shares formula validation without imposing any tonic spelling limits.
  pitchClassFromDegreeFormula(0, formula);
  return formula;
}

/** Canonical formula text uses repeated Unicode signs for double/triple alterations by default. */
export function formatDegreeFormula(
  formula: DegreeFormula,
  notation: AccidentalNotation = "unicode",
): string {
  pitchClassFromDegreeFormula(0, formula);
  if (notation !== "ascii" && notation !== "unicode") {
    throw new RangeError("Accidental notation must be ascii or unicode.");
  }
  return symbols[notation][formula.alteration] + formula.number;
}
