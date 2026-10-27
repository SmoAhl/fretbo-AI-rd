import { expect, test } from "vitest";
import {
  parseNoteSpelling, parseRegisteredNote, formatNoteSpelling, formatRegisteredNote,
} from "../domain/music-theory/pitch-pitch-classes-and-spelling/note-text.js";
import {
  registeredPitchFromNote, pitchClassFromRegisteredPitch,
} from "../domain/music-theory/pitch-pitch-classes-and-spelling/registered-pitch.js";
import { pitchClassFromSpelling } from "../domain/music-theory/pitch-pitch-classes-and-spelling/note-spelling.js";
import { parseSpelledInterval, formatSpelledInterval } from "../domain/music-theory/intervals-and-transposition/interval-text.js";
import {
  transposeRegisteredNote, identifySpelledInterval,
} from "../domain/music-theory/intervals-and-transposition/spelled-transposition.js";
import { parseScaleType } from "../domain/music-theory/scales-and-modes/scale-text.js";
import { scaleRegisteredNotes, scaleRegisteredPitches } from "../domain/music-theory/scales-and-modes/scale-runs.js";
import { relativeModeNoteSpellings } from "../domain/music-theory/scales-and-modes/relative-modes.js";
import {
  relativeMinorModeNoteSpellings, minorModeRegisteredNotes,
} from "../domain/music-theory/scales-and-modes/minor-modes.js";
import { melodicMinorRegisteredNotes } from "../domain/music-theory/scales-and-modes/melodic-minor-runs.js";
import { createKey, keySignature, relativeKey } from "../domain/music-theory/degrees-keys-and-spelling/keys.js";
import { spellingFromPitchClassInKey } from "../domain/music-theory/degrees-keys-and-spelling/key-aware-spelling.js";
import { collectionDegreeOfPitchClass } from "../domain/music-theory/degrees-keys-and-spelling/degrees.js";
import { harmonizedChordNoteSpellingsAtDegree } from "../domain/music-theory/chords-symbols-and-realization/scale-harmonization.js";
import {
  createSpelledChordDescription, chordDescriptionPitchClasses,
} from "../domain/music-theory/chords-symbols-and-realization/chord-descriptions.js";
import { parseChordSymbol, formatChordSymbol } from "../domain/music-theory/chords-symbols-and-realization/chord-symbols.js";
import {
  rootPositionChordRegisteredNotes, rootPositionChordRegisteredPitches, createRegisteredNoteVoicing,
} from "../domain/music-theory/chords-symbols-and-realization/registered-chords.js";
import {
  analyzeRegisteredNoteVoicing, analyzeRegisteredPitchVoicing,
} from "../domain/music-theory/chords-symbols-and-realization/chord-voicing-analysis.js";
import {
  identifyChordsFromRegisteredNotes, identifyChordsFromRegisteredPitches,
} from "../domain/music-theory/chords-symbols-and-realization/chord-identification.js";

test("key, scale, degree, harmonization, symbol and realization preserve a spelled chord through identification", () => {
  const tonic = parseNoteSpelling("F#");
  const key = createKey(tonic, "major");
  expect(keySignature(key)).toHaveLength(6);
  expect(relativeKey(key)).toEqual(createKey(parseNoteSpelling("D#"), "minor"));
  expect(spellingFromPitchClassInKey(5, key)).toEqual(parseNoteSpelling("E#"));
  const type = parseScaleType("major");
  // A parsed scale may be pentatonic; harmonization deliberately accepts only seven-note collections.
  if (type === "major-pentatonic" || type === "minor-pentatonic") throw new RangeError("Seven-note collection required.");
  expect(collectionDegreeOfPitchClass(6, type, 1)).toEqual({ ordinal: 5, formula: { number: 5, alteration: 0 } });
  const chord = harmonizedChordNoteSpellingsAtDegree(tonic, type, 5, "seventh");
  expect(chord.noteSpellings.map((note) => formatNoteSpelling(note, "ascii"))).toEqual(["C#", "E#", "G#", "B"]);
  const description = createSpelledChordDescription(chord.root, chord.formula);
  expect(formatChordSymbol(description, "ascii")).toBe("C#7");
  expect(parseChordSymbol(formatChordSymbol(description))).toEqual(description);
  const voicing = rootPositionChordRegisteredNotes(description, parseRegisteredNote("C#4"));
  expect(voicing.notes.map((note) => formatRegisteredNote(note, "ascii"))).toEqual(["C#4", "E#4", "G#4", "B4"]);
  expect(voicing.notes.map(registeredPitchFromNote)).toEqual([49, 53, 56, 59]);
  expect(analyzeRegisteredNoteVoicing(description, voicing)).toMatchObject({
    missingRequiredFormulaIndices: [], unexpectedToneIndices: [], inversion: { status: "classified", position: "root-position" },
  });
  expect(identifyChordsFromRegisteredNotes(voicing).candidates).toContainEqual({
    family: "seventh", quality: "dominant-seventh", description: { root: 1, formula: description.formula }, bassFormulaIndices: [0],
  });
});

test("harmonic-minor harmonization preserves seventh spelling while identification preserves alternatives", () => {
  const chord = harmonizedChordNoteSpellingsAtDegree(parseNoteSpelling("C"), "harmonic-minor", 7, "seventh");
  const description = createSpelledChordDescription(chord.root, chord.formula);
  expect(formatChordSymbol(description)).toBe("Bdim7");
  const voicing = rootPositionChordRegisteredNotes(description, parseRegisteredNote("B3"));
  expect(voicing.notes.map((note) => formatRegisteredNote(note, "ascii"))).toEqual(["B3", "D4", "F4", "Ab4"]);
  expect(voicing.notes.map(registeredPitchFromNote)).toEqual([47, 50, 53, 56]);
  const identification = identifyChordsFromRegisteredNotes(voicing);
  expect(identification.candidates.map((candidate) => [candidate.description.root, candidate.quality]))
    .toEqual([[2, "diminished-seventh"], [5, "diminished-seventh"], [8, "diminished-seventh"], [11, "diminished-seventh"]]);
  expect(identification.bass.pitch).toBe(47);
  expect(identification.candidates.find((candidate) => candidate.description.root === 11)!.bassFormulaIndices).toEqual([0]);
  expect(analyzeRegisteredNoteVoicing(description, voicing).missingRequiredFormulaIndices).toEqual([]);
});

test("interval text and registered scale targets preserve enharmonic letter/octave crossings", () => {
  const tonic = parseRegisteredNote("B#3");
  const interval = parseSpelledInterval("major second up");
  const second = transposeRegisteredNote(tonic, interval);
  expect(formatRegisteredNote(second, "ascii")).toBe("C##4");
  expect(formatSpelledInterval(identifySpelledInterval(tonic, second))).toBe("M2 up");
  const options = { direction: "up", octaves: 1, includeEndpoint: true } as const;
  const run = scaleRegisteredNotes(tonic, "major", options);
  expect(run.map((note) => formatRegisteredNote(note, "ascii")))
    .toEqual(["B#3", "C##4", "D##4", "E#4", "F##4", "G##4", "A##4", "B#4"]);
  expect(run.map(registeredPitchFromNote)).toEqual([48, 50, 52, 53, 55, 57, 59, 60]);
  expect(scaleRegisteredPitches(registeredPitchFromNote(tonic), "major", options)).toEqual(run.map(registeredPitchFromNote));
});

test("relative modes retain their own tonic, degree roles and fixed descending collection", () => {
  const dorian = relativeModeNoteSpellings(parseNoteSpelling("C"), "major", 2);
  expect(dorian.tonic).toEqual(parseNoteSpelling("D"));
  expect(dorian.mode).toBe("dorian");
  expect(collectionDegreeOfPitchClass(pitchClassFromSpelling(dorian.tonic), dorian.mode, 5))
    .toEqual({ ordinal: 3, formula: { number: 3, alteration: -1 } });
  expect(scaleRegisteredNotes({ ...dorian.tonic, octave: 4 }, dorian.mode,
    { direction: "down", octaves: 1, includeEndpoint: true }).map(registeredPitchFromNote))
    .toEqual([50, 48, 47, 45, 43, 41, 40, 38]);
  const minorMode = relativeMinorModeNoteSpellings(parseNoteSpelling("C"), "harmonic-minor", 2);
  expect(minorMode.tonic).toEqual(parseNoteSpelling("D"));
  expect(minorModeRegisteredNotes({ ...minorMode.tonic, octave: 4 }, minorMode.mode,
    { direction: "down", octaves: 1, includeEndpoint: true }).map((note) => formatRegisteredNote(note, "ascii")))
    .toEqual(["D4", "C4", "B3", "Ab3", "G3", "F3", "Eb3", "D3"]);
});

test("melodic-minor traversal choice survives into explicit registered targets", () => {
  const options = { direction: "down", octaves: 1, includeEndpoint: true } as const;
  const classical = melodicMinorRegisteredNotes(parseRegisteredNote("C5"), { ...options, convention: "classical-exercise" });
  const fixed = melodicMinorRegisteredNotes(parseRegisteredNote("C5"), { ...options, convention: "fixed-collection" });
  expect(classical.map((note) => formatRegisteredNote(note, "ascii"))).toEqual(["C5", "Bb4", "Ab4", "G4", "F4", "Eb4", "D4", "C4"]);
  expect(fixed.map((note) => formatRegisteredNote(note, "ascii"))).toEqual(["C5", "B4", "A4", "G4", "F4", "Eb4", "D4", "C4"]);
  expect(classical.map(registeredPitchFromNote)).toEqual([60, 58, 56, 55, 53, 51, 50, 48]);
  expect(fixed.map(registeredPitchFromNote)).toEqual([60, 59, 57, 55, 53, 51, 50, 48]);
});

test("slash bass, repeated registered tones and identity remain separate throughout a supplied voicing", () => {
  const description = parseChordSymbol("C/F#");
  expect(chordDescriptionPitchClasses(description)).toEqual([0, 4, 7]);
  const voicing = createRegisteredNoteVoicing(["C4", "F#2", "E3", "G3", "C3"].map(parseRegisteredNote));
  const pitches = voicing.notes.map(registeredPitchFromNote);
  expect(pitches).toEqual([48, 30, 40, 43, 36]);
  const analysis = analyzeRegisteredNoteVoicing(description, voicing);
  expect(analysis).toMatchObject({
    specifiedBass: "matched", bass: { pitch: 30, toneIndices: [1] }, missingRequiredFormulaIndices: [],
    unmatchedToneIndices: [1], unexpectedToneIndices: [], allowedSpecifiedBassToneIndices: [1],
    inversion: { status: "non-chord-bass" },
    doublings: [{ pitchClass: 0, spelling: parseNoteSpelling("C"), count: 2, toneIndices: [0, 4] }],
  });
  expect(formatChordSymbol(description, "ascii")).toBe("C/F#");
  expect(identifyChordsFromRegisteredNotes(voicing)).toEqual({ bass: { pitch: 30, pitchClass: 6, toneIndices: [1] }, candidates: [] });
  expect(() => rootPositionChordRegisteredNotes(description, parseRegisteredNote("C3"))).toThrow(RangeError);
  expect(voicing.notes.map(registeredPitchFromNote)).toEqual(pitches);
});

test("optional coverage does not rewrite construction, identification or exact registered requirements", () => {
  const description = parseChordSymbol("C9");
  const policy = Object.freeze({ optionalFormulaIndices: Object.freeze([2]) });
  const voicing = createRegisteredNoteVoicing(["E3", "Bb3", "D4", "C5", "C5"].map(parseRegisteredNote));
  const analysis = analyzeRegisteredNoteVoicing(description, voicing, policy);
  expect(analysis).toMatchObject({ missingRequiredFormulaIndices: [], missingOptionalFormulaIndices: [2],
    inversion: { status: "unsupported-structure" } });
  expect(chordDescriptionPitchClasses(description)).toEqual([0, 4, 7, 10, 2]);
  expect(identifyChordsFromRegisteredNotes(voicing).candidates.some((candidate) =>
    candidate.description.root === 0 && candidate.quality === "dominant-ninth")).toBe(false);
  expect(voicing.notes.map(registeredPitchFromNote)).toEqual([40, 46, 50, 60, 60]);
  // Coverage is role membership, not enforcement of a requested registered multiset.
  const moved = createRegisteredNoteVoicing(["E3", "Bb3", "D4", "C4"].map(parseRegisteredNote));
  expect(analyzeRegisteredNoteVoicing(description, moved, policy).coverage.map((entry) => entry.toneIndices.length > 0))
    .toEqual(analysis.coverage.map((entry) => entry.toneIndices.length > 0));
});

test("compound roles survive shared class targets and separate registered realizations", () => {
  const add2 = parseChordSymbol("Cadd2");
  const add9 = parseChordSymbol("Cadd9");
  expect(chordDescriptionPitchClasses(add2)).toEqual(chordDescriptionPitchClasses(add9));
  const root = parseRegisteredNote("C4");
  const simple = rootPositionChordRegisteredNotes(add2, root);
  const compound = rootPositionChordRegisteredNotes(add9, root);
  expect(simple.notes.map(registeredPitchFromNote)).toEqual([48, 52, 55, 50]);
  expect(compound.notes.map(registeredPitchFromNote)).toEqual([48, 52, 55, 62]);
  expect(simple.notes.map(registeredPitchFromNote).map(pitchClassFromRegisteredPitch)).toEqual(chordDescriptionPitchClasses(add2));
  expect(identifyChordsFromRegisteredNotes(simple).candidates.map((candidate) => candidate.quality))
    .toEqual(["major-add2", "major-add9"]);
  expect(analyzeRegisteredNoteVoicing(add9, simple).missingRequiredFormulaIndices).toEqual([]);
  expect(add2.formula[3]!.number).toBe(2);
  expect(add9.formula[3]!.number).toBe(9);
});

test("unsupported notation/spelling remains explicit while numeric target composition stays available", () => {
  expect(() => parseChordSymbol("C7(#11)")).toThrow(SyntaxError);
  const description = parseChordSymbol("G###maj7");
  const root = parseRegisteredNote("G###4");
  const numeric = rootPositionChordRegisteredPitches(description, registeredPitchFromNote(root));
  expect(numeric.pitches).toEqual([58, 62, 65, 69]);
  expect(() => rootPositionChordRegisteredNotes(description, root)).toThrow(RangeError);
  expect(analyzeRegisteredPitchVoicing(description, numeric).missingRequiredFormulaIndices).toEqual([]);
  expect(identifyChordsFromRegisteredPitches(numeric).candidates.some((candidate) =>
    candidate.description.root === 10 && candidate.quality === "major-seventh")).toBe(true);
  expect(formatChordSymbol(description, "ascii")).toBe("G###maj7");
});
