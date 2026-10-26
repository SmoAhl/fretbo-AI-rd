import { type PitchClass } from "../pitch-pitch-classes-and-spelling/pitch-class.js";
import { type NoteSpelling, pitchClassFromSpelling } from "../pitch-pitch-classes-and-spelling/note-spelling.js";
import {
  type RegisteredPitch, registeredPitchFromNote, pitchClassFromRegisteredPitch, semitoneDistance,
} from "../pitch-pitch-classes-and-spelling/registered-pitch.js";
import {
  type PitchClassChordDescription, type SpelledChordDescription,
  chordDescriptionPitchClasses, chordDescriptionNoteSpellings,
} from "./chord-descriptions.js";
import { type ChordDegreeFormula, type ChordFormula } from "./chord-formulas.js";
import {
  type RegisteredPitchVoicing, type RegisteredNoteVoicing,
  createRegisteredPitchVoicing, createRegisteredNoteVoicing,
} from "./registered-chords.js";

export type ChordVoicingAnalysisOptions = Readonly<{
  /** Zero-based formula positions; every other position is required. */
  optionalFormulaIndices?: readonly number[];
}>;

export type ChordToneCoverage = Readonly<{
  formulaIndex: number;
  role: ChordDegreeFormula;
  required: boolean;
  /** Shared evidence: a tone can match more than one equivalent formula role. */
  toneIndices: readonly number[];
}>;

export type ChordBassAnalysis = Readonly<{
  pitch: RegisteredPitch;
  pitchClass: PitchClass;
  toneIndices: readonly number[];
  formulaIndices: readonly number[];
  unmatchedToneIndices: readonly number[];
}>;

export type ChordInversionAnalysis =
  | Readonly<{ status: "classified"; position: "root-position" | "first-inversion" | "second-inversion" | "third-inversion" }>
  | Readonly<{ status: "unsupported-structure" | "non-chord-bass" | "ambiguous" }>;

export type VoicingSpacing = Readonly<{
  /** Original tone indices, stably ordered by sounding pitch. */
  toneIndices: readonly number[];
  span: number;
  adjacentGaps: readonly number[];
}>;

export type ChordVoicingAnalysis = Readonly<{
  bass: ChordBassAnalysis;
  specifiedBass: "unspecified" | "matched" | "mismatched";
  coverage: readonly ChordToneCoverage[];
  missingRequiredFormulaIndices: readonly number[];
  missingOptionalFormulaIndices: readonly number[];
  /** All tones outside formula coverage, including permitted non-chord basses. */
  unmatchedToneIndices: readonly number[];
  /** Unmatched tones except lowest occurrences matching the specified bass. */
  unexpectedToneIndices: readonly number[];
  allowedSpecifiedBassToneIndices: readonly number[];
  inversion: ChordInversionAnalysis;
  spacing: VoicingSpacing;
}>;

export type PitchClassDoubling = Readonly<{
  pitchClass: PitchClass;
  count: number;
  toneIndices: readonly number[];
}>;
export type SpelledToneDoubling = PitchClassDoubling & Readonly<{ spelling: NoteSpelling }>;
export type RegisteredPitchVoicingAnalysis = ChordVoicingAnalysis & Readonly<{
  doublings: readonly PitchClassDoubling[];
}>;
export type RegisteredNoteVoicingAnalysis = ChordVoicingAnalysis & Readonly<{
  doublings: readonly SpelledToneDoubling[];
}>;

function optionalIndices(options: ChordVoicingAnalysisOptions | undefined, length: number): Set<number> {
  if (options !== undefined && (options === null || typeof options !== "object" || Array.isArray(options))) {
    throw new RangeError("Analysis options must be an object.");
  }
  const indices = options?.optionalFormulaIndices;
  if (indices === undefined) return new Set();
  if (!Array.isArray(indices)) throw new RangeError("Optional formula indices must be an array.");
  const result = new Set<number>();
  for (const index of indices) {
    if (!Number.isInteger(index) || index < 0 || index >= length || result.has(index)) {
      throw new RangeError("Optional formula indices must be distinct positions within the formula.");
    }
    result.add(index);
  }
  return result;
}

function inversion(formula: ChordFormula, bass: ChordBassAnalysis): ChordInversionAnalysis {
  const numbers = formula.map((role) => role.number).sort((a, b) => a - b);
  const expected = formula.length === 3 ? [1, 3, 5] : [1, 3, 5, 7];
  if ((formula.length !== 3 && formula.length !== 4)
    || numbers.some((number, index) => number !== expected[index])
    || !formula.some((role) => role.number === 1 && role.alteration === 0)) {
    return { status: "unsupported-structure" };
  }
  if (bass.formulaIndices.length === 0) return { status: "non-chord-bass" };
  if (bass.formulaIndices.length !== 1 || bass.unmatchedToneIndices.length !== 0) return { status: "ambiguous" };
  const role = formula[bass.formulaIndices[0]!]!.number;
  const position = role === 1 ? "root-position" : role === 3 ? "first-inversion"
    : role === 5 ? "second-inversion" : "third-inversion";
  return { status: "classified", position };
}

/** Private aggregation shares evidence, not a configurable matching policy. */
function analyze(
  formula: ChordFormula,
  pitches: readonly RegisteredPitch[],
  toneKeys: readonly string[],
  formulaKeys: readonly string[],
  bassKey: string | undefined,
  options: ChordVoicingAnalysisOptions | undefined,
): ChordVoicingAnalysis & Readonly<{ doublingIndices: readonly (readonly number[])[] }> {
  const optional = optionalIndices(options, formula.length);
  const toneIndices = pitches.map((_, index) => index);
  const ordered = [...toneIndices].sort((left, right) =>
    pitches[left]! < pitches[right]! ? -1 : pitches[left]! > pitches[right]! ? 1 : left - right);
  const lowest = pitches[ordered[0]!]!;
  const bassIndices = ordered.filter((index) => pitches[index] === lowest);
  const coverage = formula.map((role, formulaIndex) => ({
    formulaIndex, role: { number: role.number, alteration: role.alteration },
    required: !optional.has(formulaIndex),
    toneIndices: toneIndices.filter((index) => toneKeys[index] === formulaKeys[formulaIndex]),
  }));
  const coveredKeys = new Set(formulaKeys);
  const unmatched = toneIndices.filter((index) => !coveredKeys.has(toneKeys[index]!));
  const bass: ChordBassAnalysis = {
    pitch: lowest, pitchClass: pitchClassFromRegisteredPitch(lowest), toneIndices: bassIndices,
    formulaIndices: coverage.filter((entry) => entry.toneIndices.some((index) => pitches[index] === lowest))
      .map((entry) => entry.formulaIndex),
    unmatchedToneIndices: bassIndices.filter((index) => !coveredKeys.has(toneKeys[index]!)),
  };
  const allowedBass = new Set(bass.unmatchedToneIndices.filter((index) => toneKeys[index] === bassKey));
  const groups = new Map<string, number[]>();
  for (const index of toneIndices) {
    const key = toneKeys[index]!;
    const group = groups.get(key);
    if (group) group.push(index);
    else groups.set(key, [index]);
  }
  return {
    bass,
    specifiedBass: bassKey === undefined ? "unspecified"
      : bassIndices.every((index) => toneKeys[index] === bassKey) ? "matched" : "mismatched",
    coverage,
    missingRequiredFormulaIndices: coverage.filter((entry) => entry.required && entry.toneIndices.length === 0)
      .map((entry) => entry.formulaIndex),
    missingOptionalFormulaIndices: coverage.filter((entry) => !entry.required && entry.toneIndices.length === 0)
      .map((entry) => entry.formulaIndex),
    unmatchedToneIndices: unmatched,
    unexpectedToneIndices: unmatched.filter((index) => !allowedBass.has(index)),
    allowedSpecifiedBassToneIndices: [...allowedBass],
    doublingIndices: [...groups.values()].filter((group) => group.length > 1),
    inversion: inversion(formula, bass),
    spacing: {
      toneIndices: ordered,
      span: semitoneDistance(lowest, pitches[ordered[ordered.length - 1]!]!),
      adjacentGaps: ordered.slice(1).map((index, position) => semitoneDistance(pitches[ordered[position]!]!, pitches[index]!)),
    },
  };
}

function spellingKey(note: NoteSpelling): string {
  return `${note.letter}:${note.accidental}`;
}

/** Analyze sounding classes without imposing spelling or compound-role register constraints. */
export function analyzeRegisteredPitchVoicing(
  description: PitchClassChordDescription | SpelledChordDescription,
  voicing: RegisteredPitchVoicing,
  options?: ChordVoicingAnalysisOptions,
): RegisteredPitchVoicingAnalysis {
  const tones = chordDescriptionPitchClasses(description);
  const { pitches } = createRegisteredPitchVoicing(voicing?.pitches);
  const classes = pitches.map(pitchClassFromRegisteredPitch);
  const specifiedBass = description.bass === undefined ? undefined
    : typeof description.bass === "number" ? description.bass : pitchClassFromSpelling(description.bass);
  const { doublingIndices, ...result } = analyze(description.formula, pitches, classes.map(String), tones.map(String),
    specifiedBass === undefined ? undefined : String(specifiedBass), options);
  return { ...result, doublings: doublingIndices.map((indices) => ({
    pitchClass: classes[indices[0]!]!, count: indices.length, toneIndices: indices,
  })) };
}

/** Exact written identities determine membership; sounding coordinates determine bass and spacing. */
export function analyzeRegisteredNoteVoicing(
  description: SpelledChordDescription,
  voicing: RegisteredNoteVoicing,
  options?: ChordVoicingAnalysisOptions,
): RegisteredNoteVoicingAnalysis {
  const tones = chordDescriptionNoteSpellings(description);
  const { notes } = createRegisteredNoteVoicing(voicing?.notes);
  const pitches = notes.map(registeredPitchFromNote);
  const { doublingIndices, ...result } = analyze(description.formula, pitches, notes.map(spellingKey), tones.map(spellingKey),
    description.bass === undefined ? undefined : spellingKey(description.bass), options);
  return { ...result, doublings: doublingIndices.map((indices) => {
    const note = notes[indices[0]!]!;
    return {
      pitchClass: pitchClassFromRegisteredPitch(pitches[indices[0]!]!),
      spelling: { letter: note.letter, accidental: note.accidental },
      count: indices.length, toneIndices: indices,
    };
  }) };
}
