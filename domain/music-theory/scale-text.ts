import { type ScaleType } from "./scales.js";

// Exhaustive existing identifiers and their explicit English word forms.
const scaleNames: Readonly<Record<ScaleType, string>> = {
  major: "major",
  "major-pentatonic": "major pentatonic",
  "minor-pentatonic": "minor pentatonic",
  "natural-minor": "natural minor",
  "harmonic-minor": "harmonic minor",
  "melodic-minor-ascending": "melodic minor ascending",
  ionian: "ionian",
  dorian: "dorian",
  phrygian: "phrygian",
  lydian: "lydian",
  mixolydian: "mixolydian",
  aeolian: "aeolian",
  locrian: "locrian",
};

/** Parse a supported scale name without inferring a tonic, key, or traversal convention. */
export function parseScaleType(text: string): ScaleType {
  const normalized = text.trim().toLowerCase().replace(/\s+/gu, " ");
  const entry = Object.entries(scaleNames).find(([identifier, name]) =>
    normalized === identifier || normalized === name,
  );
  if (entry === undefined) {
    throw new SyntaxError("Expected a supported scale identifier or its space-separated name.");
  }
  return entry[0] as ScaleType;
}
