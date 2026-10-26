import { describe, expect, test } from "vitest";
import {
  analyzeRegisteredPitchVoicing, analyzeRegisteredNoteVoicing,
  type ChordVoicingAnalysisOptions,
} from "../domain/music-theory/chords-symbols-and-realization/chord-voicing-analysis.js";
import {
  createPitchClassChordDescription, createSpelledChordDescription,
} from "../domain/music-theory/chords-symbols-and-realization/chord-descriptions.js";
import { type ChordFormula } from "../domain/music-theory/chords-symbols-and-realization/chord-formulas.js";
import { triadFormula, type TriadQuality } from "../domain/music-theory/chords-symbols-and-realization/triads.js";
import { seventhChordFormula, type SeventhChordQuality } from "../domain/music-theory/chords-symbols-and-realization/seventh-chords.js";
import { parseChordSymbol } from "../domain/music-theory/chords-symbols-and-realization/chord-symbols.js";
import {
  createRegisteredNoteVoicing, rootPositionChordRegisteredNotes, rootPositionChordRegisteredPitches,
  type RegisteredPitchVoicing, type RegisteredNoteVoicing,
} from "../domain/music-theory/chords-symbols-and-realization/registered-chords.js";
import { harmonizedChordNoteSpellingsAtDegree } from "../domain/music-theory/chords-symbols-and-realization/scale-harmonization.js";
import { parseRegisteredNote } from "../domain/music-theory/pitch-pitch-classes-and-spelling/note-text.js";
import { registeredPitchFromNote } from "../domain/music-theory/pitch-pitch-classes-and-spelling/registered-pitch.js";
import { type PitchClass } from "../domain/music-theory/pitch-pitch-classes-and-spelling/pitch-class.js";

const major = createPitchClassChordDescription(0, triadFormula("major"));
const notes = (...text: string[]) => createRegisteredNoteVoicing(text.map(parseRegisteredNote));
const numeric = (symbol: string, ...text: string[]) => analyzeRegisteredPitchVoicing(
  parseChordSymbol(symbol), { pitches: text.map((tone) => registeredPitchFromNote(parseRegisteredNote(tone))) });
const spelled = (symbol: string, ...text: string[]) => analyzeRegisteredNoteVoicing(parseChordSymbol(symbol), notes(...text));

test("unsorted first inversion reports independent coverage, doubling, bass and spacing", () => {
  const result = spelled("C", "E3", "C4", "G4", "C5");
  expect(result).toEqual({
    bass: { pitch: 40, pitchClass: 4, toneIndices: [0], formulaIndices: [1], unmatchedToneIndices: [] },
    specifiedBass: "unspecified",
    coverage: [
      { formulaIndex: 0, role: { number: 1, alteration: 0 }, required: true, toneIndices: [1, 3] },
      { formulaIndex: 1, role: { number: 3, alteration: 0 }, required: true, toneIndices: [0] },
      { formulaIndex: 2, role: { number: 5, alteration: 0 }, required: true, toneIndices: [2] },
    ],
    missingRequiredFormulaIndices: [], missingOptionalFormulaIndices: [], unmatchedToneIndices: [],
    unexpectedToneIndices: [], allowedSpecifiedBassToneIndices: [],
    doublings: [{ pitchClass: 0, spelling: { letter: "C", accidental: 0 }, count: 2, toneIndices: [1, 3] }],
    inversion: { status: "classified", position: "first-inversion" },
    spacing: { toneIndices: [0, 1, 2, 3], span: 20, adjacentGaps: [8, 7, 5] },
  });
  expect(numeric("C", "C5", "G4", "E3", "C4")).toMatchObject({
    bass: { toneIndices: [2], formulaIndices: [1] },
    inversion: { status: "classified", position: "first-inversion" },
    spacing: { toneIndices: [2, 3, 1, 0], span: 20, adjacentGaps: [8, 7, 5] },
    doublings: [{ pitchClass: 0, count: 2, toneIndices: [0, 3] }],
  });
});

// Independent semitone fixtures; the analysis implementation does not import either catalog.
const triads: Record<Exclude<TriadQuality, "sus2" | "sus4">, readonly number[]> = {
  major: [0, 4, 7], minor: [0, 3, 7], diminished: [0, 3, 6], augmented: [0, 4, 8],
};
const sevenths: Record<Exclude<SeventhChordQuality, "dominant-seventh-sus2" | "dominant-seventh-sus4">, readonly number[]> = {
  "major-seventh": [0, 4, 7, 11], "dominant-seventh": [0, 4, 7, 10],
  "minor-seventh": [0, 3, 7, 10], "half-diminished-seventh": [0, 3, 6, 10],
  "diminished-seventh": [0, 3, 6, 9], "minor-major-seventh": [0, 3, 7, 11],
  "augmented-major-seventh": [0, 4, 8, 11], "augmented-seventh": [0, 4, 8, 10],
};
const positions = ["root-position", "first-inversion", "second-inversion", "third-inversion"] as const;
for (const [name, fixtures, formulaFor] of [
  ["triads", triads, (quality: string) => triadFormula(quality as TriadQuality)],
  ["sevenths", sevenths, (quality: string) => seventhChordFormula(quality as SeventhChordQuality)],
] as const) {
  describe(name, () => {
    for (const [quality, offsets] of Object.entries(fixtures)) {
      for (let root = 0; root < 12; root++) {
        test(`${quality}, root ${root}: every bass role with reordered formula and upper notes`, () => {
          const formula = [...formulaFor(quality)].reverse();
          const description = createPitchClassChordDescription(root as PitchClass, formula);
          for (let bassRole = 0; bassRole < offsets.length; bassRole++) {
            const pitches = offsets.map((offset, index) => root + offset + (index === bassRole ? 0 : 24)).reverse();
            const result = analyzeRegisteredPitchVoicing(description, { pitches });
            expect(result.inversion).toEqual({ status: "classified", position: positions[bassRole] });
            expect(result.bass.formulaIndices).toEqual([offsets.length - bassRole - 1]);
            expect(result.missingRequiredFormulaIndices).toEqual([]);
            expect(result.unexpectedToneIndices).toEqual([]);
          }
        });
      }
    }
  });
}

test("exact diminished seventh spelling identifies its seventh bass", () => {
  expect(spelled("Cdim7", "C4", "Eb4", "Gb4", "Bbb2").inversion)
    .toEqual({ status: "classified", position: "third-inversion" });
  expect(spelled("Cdim7", "C4", "Eb4", "Gb4", "A2")).toMatchObject({
    inversion: { status: "non-chord-bass" }, unmatchedToneIndices: [3], missingRequiredFormulaIndices: [3],
  });
  expect(numeric("Cdim7", "C4", "Eb4", "Gb4", "A2").inversion)
    .toEqual({ status: "classified", position: "third-inversion" });
});

test.each([
  ["C", ["C", "E", "G"]], ["Cm", ["C", "Eb", "G"]],
  ["Cdim", ["C", "Eb", "Gb"]], ["Caug", ["C", "E", "G#"]],
  ["Cmaj7", ["C", "E", "G", "B"]], ["C7", ["C", "E", "G", "Bb"]],
  ["Cm7", ["C", "Eb", "G", "Bb"]], ["Cm7(b5)", ["C", "Eb", "Gb", "Bb"]],
  ["Cdim7", ["C", "Eb", "Gb", "Bbb"]], ["Cm(maj7)", ["C", "Eb", "G", "B"]],
  ["Caug(maj7)", ["C", "E", "G#", "B"]], ["Caug7", ["C", "E", "G#", "Bb"]],
] as const)("%s: every inversion with exact spellings and reordered formula", (symbol, spellings) => {
  const description = parseChordSymbol(symbol);
  for (let bassRole = 0; bassRole < spellings.length; bassRole++) {
    const voicing = notes(...spellings.map((spelling, index) => `${spelling}${index === bassRole ? 2 : 4}`).reverse());
    const result = analyzeRegisteredNoteVoicing({ ...description, formula: [...description.formula].reverse() }, voicing);
    expect(result.inversion).toEqual({ status: "classified", position: positions[bassRole] });
    expect(result.bass.formulaIndices).toEqual([spellings.length - bassRole - 1]);
    expect(result.missingRequiredFormulaIndices).toEqual([]);
  }
});

test("all-optional and empty policies, huge compound roles and repeated bass spellings", () => {
  const voicing = notes("C4", "C4");
  const description = parseChordSymbol("C/C");
  expect(analyzeRegisteredNoteVoicing(description, voicing, { optionalFormulaIndices: [0, 1, 2] }))
    .toMatchObject({ missingRequiredFormulaIndices: [], missingOptionalFormulaIndices: [1, 2], specifiedBass: "matched" });
  expect(analyzeRegisteredNoteVoicing(description, voicing, {}).missingRequiredFormulaIndices).toEqual([1, 2]);
  expect(analyzeRegisteredNoteVoicing(description, voicing, { optionalFormulaIndices: [] }).missingRequiredFormulaIndices)
    .toEqual([1, 2]);
  const formula: ChordFormula = [{ number: Number.MAX_SAFE_INTEGER, alteration: 0 }];
  // MAX_SAFE_INTEGER is degree 3 modulo seven. Coverage never calculates a registered displacement.
  expect(analyzeRegisteredPitchVoicing(createPitchClassChordDescription(0, formula), { pitches: [4] })
    .missingRequiredFormulaIndices).toEqual([]);
});

test("omissions and unexpected upper tones do not suppress known-chord inversion", () => {
  const description = parseChordSymbol("C7");
  const voicing = notes("E3", "Bb3", "C4", "F#5");
  const required = analyzeRegisteredNoteVoicing(description, voicing);
  const optional = analyzeRegisteredNoteVoicing(description, voicing, { optionalFormulaIndices: [2] });
  expect(required.missingRequiredFormulaIndices).toEqual([2]);
  expect(optional.missingRequiredFormulaIndices).toEqual([]);
  expect(optional.missingOptionalFormulaIndices).toEqual([2]);
  expect(optional.coverage[2]!.required).toBe(false);
  expect(required.inversion).toEqual({ status: "classified", position: "first-inversion" });
  expect(optional.inversion).toEqual(required.inversion);
  expect(optional.unexpectedToneIndices).toEqual([3]);
  expect(optional.spacing).toEqual(required.spacing);
  expect(optional.coverage.map((entry) => entry.toneIndices)).toEqual(required.coverage.map((entry) => entry.toneIndices));
});

test("specified non-chord bass is allowed only at the actual lowest occurrences", () => {
  for (const result of [numeric("C/F#", "C4", "F#2", "E4", "F#2", "F#5"),
    spelled("C/F#", "C4", "F#2", "E4", "F#2", "F#5")]) {
    expect(result).toMatchObject({
      bass: { pitch: 30, pitchClass: 6, toneIndices: [1, 3], formulaIndices: [], unmatchedToneIndices: [1, 3] },
      specifiedBass: "matched", missingRequiredFormulaIndices: [2],
      unmatchedToneIndices: [1, 3, 4], allowedSpecifiedBassToneIndices: [1, 3], unexpectedToneIndices: [4],
      inversion: { status: "non-chord-bass" },
    });
    expect(result.doublings[0]!.toneIndices).toEqual([1, 3, 4]);
  }
  expect(spelled("C/E", "C3", "E4", "G4").specifiedBass).toBe("mismatched");
  expect(spelled("C/C", "C3").specifiedBass).toBe("matched");
  expect(spelled("C/F#", "G2", "F#3")).toMatchObject({
    specifiedBass: "mismatched", allowedSpecifiedBassToneIndices: [], unexpectedToneIndices: [1],
    inversion: { status: "classified", position: "second-inversion" },
  });
});

test("tied enharmonic bass retains all indices, exact spelling and ambiguity", () => {
  const exact = spelled("C/B#", "G4", "B#3", "C4", "E4", "C5");
  expect(exact).toMatchObject({
    bass: { pitch: 48, toneIndices: [1, 2], formulaIndices: [0], unmatchedToneIndices: [1] },
    specifiedBass: "mismatched", allowedSpecifiedBassToneIndices: [1], unexpectedToneIndices: [],
    inversion: { status: "ambiguous" },
    spacing: { toneIndices: [1, 2, 3, 0, 4], span: 12, adjacentGaps: [0, 4, 3, 5] },
    doublings: [{ pitchClass: 0, spelling: { letter: "C", accidental: 0 }, count: 2, toneIndices: [2, 4] }],
  });
  expect(numeric("C/B#", "G4", "B#3", "C4", "E4", "C5")).toMatchObject({
    specifiedBass: "matched", inversion: { status: "classified", position: "root-position" },
    doublings: [{ pitchClass: 0, count: 3, toneIndices: [1, 2, 4] }],
  });
  expect(spelled("C/B#", "B#3", "E4", "G4")).toMatchObject({
    specifiedBass: "matched", missingRequiredFormulaIndices: [0],
    inversion: { status: "non-chord-bass" }, allowedSpecifiedBassToneIndices: [0],
  });
});

test("equivalent compound and duplicate roles share evidence without register allocation", () => {
  const formula: ChordFormula = [
    { number: 9, alteration: 0 }, { number: 2, alteration: 0 },
    { number: 9, alteration: 0 }, { number: 1, alteration: 0 },
  ];
  for (const result of [
    analyzeRegisteredPitchVoicing(createPitchClassChordDescription(0, formula), { pitches: [26, 36, 26] }, { optionalFormulaIndices: [0] }),
    analyzeRegisteredNoteVoicing(createSpelledChordDescription({ letter: "C", accidental: 0 }, formula), notes("D2", "C3", "D2"), { optionalFormulaIndices: [0] }),
  ]) {
    expect(result.coverage.map((entry) => entry.toneIndices)).toEqual([[0, 2], [0, 2], [0, 2], [1]]);
    expect(result.coverage.map((entry) => entry.role)).toEqual(formula);
    expect(result.missingRequiredFormulaIndices).toEqual([]);
    expect(result.missingOptionalFormulaIndices).toEqual([]);
    expect(result.inversion.status).toBe("unsupported-structure");
    expect(result.doublings[0]!.count).toBe(2);
  }
});

test.each(["Csus2", "Csus4", "C7sus2", "C7sus4", "C6", "Cadd9", "C9", "C13"])(
  "%s has coverage but no conventional inversion label", (symbol) => {
    const description = parseChordSymbol(symbol);
    const voicing = rootPositionChordRegisteredNotes(description, parseRegisteredNote("C4"));
    const result = analyzeRegisteredNoteVoicing(description, voicing);
    expect(result.inversion.status).toBe("unsupported-structure");
    expect(result.missingRequiredFormulaIndices).toEqual([]);
    expect(result.unexpectedToneIndices).toEqual([]);
  });

test("custom tertian structures classify without a catalog name; collisions remain ambiguous", () => {
  const custom: ChordFormula = [{ number: 5, alteration: -2 }, { number: 1, alteration: 0 }, { number: 3, alteration: 1 }];
  const description = createPitchClassChordDescription(0, custom);
  expect(analyzeRegisteredPitchVoicing(description, { pitches: [17, 24] }).inversion)
    .toEqual({ status: "ambiguous" }); // sharp third and double-flat fifth both sound F.
  const exact = createSpelledChordDescription({ letter: "C", accidental: 0 }, custom);
  expect(analyzeRegisteredNoteVoicing(exact, notes("E#1", "C2")).inversion)
    .toEqual({ status: "classified", position: "first-inversion" });
  expect(analyzeRegisteredNoteVoicing(exact, notes("E#1", "Gbb1")).inversion).toEqual({ status: "ambiguous" });
  expect(analyzeRegisteredPitchVoicing(createPitchClassChordDescription(0, [
    { number: 1, alteration: 0 }, { number: 3, alteration: -2 }, { number: 5, alteration: 0 },
  ]), { pitches: [2] }).inversion).toEqual({ status: "classified", position: "first-inversion" });
});

test.each([
  [{ number: 1, alteration: 1 }, { number: 3, alteration: 0 }, { number: 5, alteration: 0 }],
  [{ number: 1, alteration: 0 }, { number: 10, alteration: 0 }, { number: 5, alteration: 0 }],
  [{ number: 1, alteration: 0 }, { number: 3, alteration: 0 }, { number: 3, alteration: 0 }],
].map((formula) => [formula]))("unsupported structural formula %j", (formula) => {
  expect(analyzeRegisteredPitchVoicing(createPitchClassChordDescription(0, formula as ChordFormula), { pitches: [0] })
    .inversion.status).toBe("unsupported-structure");
});

test("negative registers, stable repeated tones and singleton spacing", () => {
  expect(analyzeRegisteredPitchVoicing(major, { pitches: [7, -12, -8, -12] }).spacing)
    .toEqual({ toneIndices: [1, 3, 2, 0], span: 19, adjacentGaps: [0, 4, 15] });
  expect(spelled("C", "B#-1")).toMatchObject({
    bass: { pitch: 0, pitchClass: 0 }, spacing: { toneIndices: [0], span: 0, adjacentGaps: [] },
  });
  const limit = Number.MAX_SAFE_INTEGER;
  expect(analyzeRegisteredPitchVoicing(major, { pitches: [-limit, 0] }).spacing.span).toBe(limit);
  expect(analyzeRegisteredPitchVoicing(major, { pitches: [limit, limit - 1] }).spacing.adjacentGaps).toEqual([1]);
  expect(() => analyzeRegisteredPitchVoicing(major, { pitches: [-1, limit] })).toThrow(RangeError);
  expect(() => analyzeRegisteredPitchVoicing(major, { pitches: [-limit, limit] })).toThrow(RangeError);
  const octave = Math.floor(limit / 12);
  expect(() => analyzeRegisteredNoteVoicing(parseChordSymbol("C"), {
    notes: [{ letter: "C", accidental: 0, octave: -octave }, { letter: "C", accidental: 0, octave }],
  })).toThrow(RangeError);
});

test("symbol, harmonization and realization paths compose; numeric analysis defers spelling limits", () => {
  const chord = harmonizedChordNoteSpellingsAtDegree({ letter: "C", accidental: 0 }, "major", 7, "seventh");
  const description = createSpelledChordDescription(chord.root, chord.formula);
  const realized = rootPositionChordRegisteredNotes(description, parseRegisteredNote("B3"));
  expect(analyzeRegisteredNoteVoicing(description, realized)).toMatchObject({
    missingRequiredFormulaIndices: [], inversion: { status: "classified", position: "root-position" },
  });
  const unspellable = parseChordSymbol("G###maj7");
  const numericVoicing = rootPositionChordRegisteredPitches(unspellable, 58);
  expect(analyzeRegisteredPitchVoicing(unspellable, numericVoicing).missingRequiredFormulaIndices).toEqual([]);
  expect(() => analyzeRegisteredNoteVoicing(unspellable, notes("G###4"))).toThrow(RangeError);
});

test.each([[], null, undefined, {}, new Array(1), [undefined], [null],
  [{ number: 0, alteration: 0 }], [{ number: 1, alteration: 4 }], [{ number: 1.5, alteration: 0 }],
].map((input) => [input]))("malformed formula %j rejects in both paths", (input) => {
  const formula = input as ChordFormula;
  expect(() => analyzeRegisteredPitchVoicing({ root: 0, formula }, { pitches: [0] })).toThrow(RangeError);
  expect(() => analyzeRegisteredNoteVoicing({ root: { letter: "C", accidental: 0 }, formula }, notes("C0"))).toThrow(RangeError);
});

test.each([null, 1, [], { optionalFormulaIndices: null }, { optionalFormulaIndices: {} },
  ...[[-1], [3], [0.5], [NaN], [Infinity], [0, 0], new Array(1), [undefined]].map((indices) => ({ optionalFormulaIndices: indices })),
].map((input) => [input]))("invalid analysis options %j reject", (input) => {
  const options = input as ChordVoicingAnalysisOptions;
  expect(() => analyzeRegisteredPitchVoicing(major, { pitches: [0] }, options)).toThrow(RangeError);
  expect(() => analyzeRegisteredNoteVoicing(parseChordSymbol("C"), notes("C0"), options)).toThrow(RangeError);
});

test.each([null, undefined, {}, { pitches: [] }, { pitches: new Array(1) }, { pitches: [null] },
  { pitches: [NaN] }, { pitches: [Infinity] }, { pitches: [0.5] }, { pitches: [Number.MAX_SAFE_INTEGER + 1] },
].map((input) => [input]))("direct malformed numeric voicing %j rejects", (input) => {
  expect(() => analyzeRegisteredPitchVoicing(major, input as RegisteredPitchVoicing)).toThrow(RangeError);
});

test.each([null, undefined, {}, { notes: [] }, { notes: new Array(1) }, { notes: [null] }, { notes: [1] },
  { notes: [{}] }, { notes: [{ letter: "C", accidental: 0, octave: NaN }] },
  { notes: [{ letter: "C", accidental: 0, octave: Number.MAX_SAFE_INTEGER }] },
].map((input) => [input]))("direct malformed spelled voicing %j rejects", (input) => {
  expect(() => analyzeRegisteredNoteVoicing(parseChordSymbol("C"), input as RegisteredNoteVoicing)).toThrow(RangeError);
});

test("frozen inputs, copied roles and doubling spellings, independent unfrozen outputs", () => {
  const formula = Object.freeze(triadFormula("major").map((role) => Object.freeze(role)));
  const root = Object.freeze({ letter: "C", accidental: 0 } as const);
  const description = Object.freeze({ root, formula, bass: root });
  const voicing = Object.freeze({ notes: Object.freeze(notes("C4", "C4", "E4").notes.map((note) => Object.freeze(note))) });
  const options = Object.freeze({ optionalFormulaIndices: Object.freeze([2]) });
  const before = JSON.stringify({ description, voicing, options });
  const first = analyzeRegisteredNoteVoicing(description, voicing, options);
  const second = analyzeRegisteredNoteVoicing(description, voicing, options);
  expect(first).toEqual(second);
  expect(first.coverage[0]!.role).not.toBe(formula[0]);
  expect(first.doublings[0]!.spelling).not.toBe(root);
  (first.coverage[0]!.role as { number: number }).number = 9;
  (first.doublings[0]!.spelling as { accidental: number }).accidental = 1;
  (first.bass.toneIndices as number[]).push(99);
  expect(second.coverage[0]!.role.number).toBe(1);
  expect(second.doublings[0]!.spelling.accidental).toBe(0);
  expect(second.bass.toneIndices).toEqual([0, 1]);
  expect(JSON.stringify({ description, voicing, options })).toBe(before);
  expect(Object.isFrozen(first)).toBe(false);
  expect(Object.isFrozen(first.coverage)).toBe(false);
  expect(Object.isFrozen(first.doublings[0]!.spelling)).toBe(false);
});

if (false) {
  // @ts-expect-error Numeric descriptions cannot request spelled analysis.
  analyzeRegisteredNoteVoicing(major, notes("C4"));
  // @ts-expect-error Explicit voicing is required.
  analyzeRegisteredPitchVoicing(major);
  // @ts-expect-error Numeric analysis requires numeric registered tones.
  analyzeRegisteredPitchVoicing(major, notes("C4"));
  const result = analyzeRegisteredNoteVoicing(parseChordSymbol("C"), notes("C4"));
  // @ts-expect-error Results are readonly.
  result.specifiedBass = "matched";
  // @ts-expect-error Coverage arrays are readonly.
  result.coverage.push(result.coverage[0]!);
  // @ts-expect-error Coverage roles are readonly.
  result.coverage[0]!.role.number = 9;
  // @ts-expect-error Nested index arrays are readonly.
  result.bass.toneIndices.push(1);
  // @ts-expect-error Returned spellings are readonly.
  result.doublings[0]!.spelling.accidental = 1;
  // @ts-expect-error Spacing gaps are readonly.
  result.spacing.adjacentGaps[0] = 1;
}
