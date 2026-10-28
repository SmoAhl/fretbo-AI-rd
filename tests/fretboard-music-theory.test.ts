import { expect, test } from "vitest";
import {
  createFretboard, findPitchClassLocations, findRegisteredPitchLocations,
} from "../domain/fretboard/fretboard.js";
import {
  parseNoteSpelling, parseRegisteredNote, formatNoteSpelling, formatRegisteredNote,
} from "../domain/music-theory/pitch-pitch-classes-and-spelling/note-text.js";
import { pitchClassFromSpelling } from "../domain/music-theory/pitch-pitch-classes-and-spelling/note-spelling.js";
import { registeredPitchFromNote } from "../domain/music-theory/pitch-pitch-classes-and-spelling/registered-pitch.js";
import { scaleNoteSpellings, scalePitchClasses } from "../domain/music-theory/scales-and-modes/scales.js";
import { scaleRegisteredNotes, scaleRegisteredPitches } from "../domain/music-theory/scales-and-modes/scale-runs.js";
import { collectionDegreeOfPitchClass } from "../domain/music-theory/degrees-keys-and-spelling/degrees.js";
import { parseChordSymbol } from "../domain/music-theory/chords-symbols-and-realization/chord-symbols.js";
import { createRegisteredNoteVoicing, createRegisteredPitchVoicing } from "../domain/music-theory/chords-symbols-and-realization/registered-chords.js";

const board = createFretboard([
  { id: 1, position: 1, openPitch: 52 }, { id: 2, position: 2, openPitch: 47 }, { id: 3, position: 3, openPitch: 43 },
  { id: 4, position: 4, openPitch: 38 }, { id: 5, position: 5, openPitch: 33 }, { id: 6, position: 6, openPitch: 28 },
], 12);

test("D natural minor retains tonic, collection, ordinals, formula roles and spellings alongside 47 locations", () => {
  const tonic = parseNoteSpelling("D");
  const collection = "natural-minor";
  const tonicClass = pitchClassFromSpelling(tonic);
  const classes = scalePitchClasses(tonicClass, collection);
  const notes = scaleNoteSpellings(tonic, collection);
  const source = {
    tonic, collection,
    entries: classes.map((pitchClass, index) => ({
      pitchClass, spelling: notes[index]!,
      ...collectionDegreeOfPitchClass(tonicClass, collection, pitchClass)!,
    })),
  };
  const before = structuredClone(source);
  const mapped = {
    ...source,
    entries: source.entries.map((entry) => ({
      ...entry, locations: findPitchClassLocations(board, entry.pitchClass),
    })),
  };
  expect(source).toEqual(before);
  expect(mapped.tonic).toEqual({ letter: "D", accidental: 0 });
  expect(mapped.collection).toBe("natural-minor");
  expect(mapped.entries.map(({ pitchClass }) => pitchClass)).toEqual([2, 4, 5, 7, 9, 10, 0]);
  expect(mapped.entries.map(({ ordinal }) => ordinal)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  expect(mapped.entries.map(({ formula }) => formula)).toEqual([
    { number: 1, alteration: 0 }, { number: 2, alteration: 0 }, { number: 3, alteration: -1 },
    { number: 4, alteration: 0 }, { number: 5, alteration: 0 }, { number: 6, alteration: -1 },
    { number: 7, alteration: -1 },
  ]);
  expect(mapped.entries.map(({ spelling }) => formatNoteSpelling(spelling, "ascii")))
    .toEqual(["D", "E", "F", "G", "A", "Bb", "C"]);
  expect(mapped.entries.map(({ locations, ...entry }) => entry)).toEqual(before.entries);
  for (const entry of mapped.entries) {
    expect(entry.locations.length).toBeGreaterThan(0);
    expect(entry.locations.every(({ pitch }) => pitch % 12 === entry.pitchClass)).toBe(true);
  }
  const allLocations = mapped.entries.flatMap(({ locations }) => locations);
  expect(allLocations).toHaveLength(47);
  expect(new Set(allLocations.map(({ stringId, fret }) => `${stringId}:${fret}`)).size).toBe(47);
  const expectedFrets = [
    [0, 1, 3, 5, 6, 8, 10, 12], [1, 3, 5, 6, 8, 10, 11],
    [0, 2, 3, 5, 7, 9, 10, 12], [0, 2, 3, 5, 7, 8, 10, 12],
    [0, 1, 3, 5, 7, 8, 10, 12], [0, 1, 3, 5, 6, 8, 10, 12],
  ];
  for (const [index, frets] of expectedFrets.entries()) {
    expect(allLocations.filter(({ stringId }) => stringId === index + 1)
      .map(({ fret }) => fret).sort((a, b) => a - b)).toEqual(frets);
  }
});

test("an ascending D3 natural-minor run keeps every registered note and source index", () => {
  const tonic = parseRegisteredNote("D3");
  const options = { direction: "up", octaves: 1, includeEndpoint: true } as const;
  const notes = scaleRegisteredNotes(tonic, "natural-minor", options);
  const before = structuredClone(notes);
  const mapped = notes.map((note, sourceIndex) => ({
    sourceIndex, note, locations: findRegisteredPitchLocations(board, registeredPitchFromNote(note)),
  }));
  expect(notes).toEqual(before);
  expect(mapped.map(({ sourceIndex }) => sourceIndex)).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
  expect(mapped.map(({ note }) => formatRegisteredNote(note, "ascii")))
    .toEqual(["D3", "E3", "F3", "G3", "A3", "Bb3", "C4", "D4"]);
  const pitches = [38, 40, 41, 43, 45, 46, 48, 50];
  expect(mapped.map(({ note }) => registeredPitchFromNote(note))).toEqual(pitches);
  expect(scaleRegisteredPitches(38, "natural-minor", options)).toEqual(pitches);
  const expectedLocations = [
    [[4, 0], [5, 5], [6, 10]], [[4, 2], [5, 7], [6, 12]],
    [[4, 3], [5, 8]], [[3, 0], [4, 5], [5, 10]],
    [[3, 2], [4, 7], [5, 12]], [[3, 3], [4, 8]],
    [[2, 1], [3, 5], [4, 10]], [[2, 3], [3, 7], [4, 12]],
  ];
  for (const [index, entry] of mapped.entries()) {
    expect(entry.note).toBe(notes[index]);
    expect(entry.locations.map(({ stringId, fret }) => [stringId, fret])).toEqual(expectedLocations[index]);
    expect(entry.locations.every(({ pitch }) => pitch === pitches[index])).toBe(true);
  }
});

test("enharmonic sources share sounding locations while retaining distinct written notes", () => {
  const notes = ["B#3", "C4"].map(parseRegisteredNote);
  const mapped = notes.map((note) => ({ note, locations: findRegisteredPitchLocations(board, registeredPitchFromNote(note)) }));
  expect(mapped[0]!.locations).toEqual(mapped[1]!.locations);
  expect(mapped[0]!.locations).toEqual([
    { stringId: 2, fret: 1, pitch: 48 }, { stringId: 3, fret: 5, pitch: 48 },
    { stringId: 4, fret: 10, pitch: 48 },
  ]);
  expect(mapped.map(({ note }) => formatRegisteredNote(note, "ascii"))).toEqual(["B#3", "C4"]);
});

test("repeated and unavailable targets retain every source occurrence", () => {
  const voicing = createRegisteredPitchVoicing([38, 38, 50, 120]);
  const mapped = voicing.pitches.map((pitch, sourceIndex) => ({
    sourceIndex, pitch, locations: findRegisteredPitchLocations(board, pitch),
  }));
  expect(mapped.map(({ sourceIndex, pitch }) => [sourceIndex, pitch])).toEqual([[0, 38], [1, 38], [2, 50], [3, 120]]);
  expect(mapped[0]!.locations).toEqual(mapped[1]!.locations);
  expect(mapped[0]!.locations).not.toBe(mapped[1]!.locations);
  expect(mapped[2]!.locations).toEqual([
    { stringId: 2, fret: 3, pitch: 50 }, { stringId: 3, fret: 7, pitch: 50 }, { stringId: 4, fret: 12, pitch: 50 },
  ]);
  expect(mapped[3]).toEqual({ sourceIndex: 3, pitch: 120, locations: [] });
  expect(voicing.pitches).toEqual([38, 38, 50, 120]);
});

test("separate availability on one string does not establish simultaneous realization", () => {
  const oneString = createFretboard([{ id: 1, position: 1, openPitch: 38 }], 2);
  const alternatives = [38, 40].map((pitch) => findRegisteredPitchLocations(oneString, pitch));
  expect(alternatives).toEqual([
    [{ stringId: 1, fret: 0, pitch: 38 }], [{ stringId: 1, fret: 2, pitch: 40 }],
  ]);
  // Both requirements are individually available, but compete for the same
  // string at different frets. These lists are not a simultaneous assignment.
  expect(new Set(alternatives.flat().map(({ stringId }) => stringId)).size).toBe(1);
  expect(new Set(alternatives.flat().map(({ fret }) => fret)).size).toBe(2);
});

test("a test-local chord consumer preserves identity, specified bass, omission policy and supplied occurrences", () => {
  const description = parseChordSymbol("C9/E");
  const optionalFormulaIndices = Object.freeze([2]);
  const voicing = createRegisteredNoteVoicing(["C4", "E3", "Bb3", "D6", "C4"].map(parseRegisteredNote));
  const source = { description, optionalFormulaIndices, voicing };
  const before = structuredClone(source);
  // Composition belongs to the consumer; no generic request schema or chord
  // adapter is introduced in the Fretboard engine.
  const mapped = {
    ...source,
    occurrences: voicing.notes.map((note, sourceIndex) => ({
      sourceIndex, note, locations: findRegisteredPitchLocations(board, registeredPitchFromNote(note)),
    })),
  };
  expect(source).toEqual(before);
  expect(mapped.description).toEqual(before.description);
  expect(mapped.description.root).toEqual({ letter: "C", accidental: 0 });
  expect(mapped.description.bass).toEqual({ letter: "E", accidental: 0 });
  expect(mapped.description.formula).toEqual([
    { number: 1, alteration: 0 }, { number: 3, alteration: 0 }, { number: 5, alteration: 0 },
    { number: 7, alteration: -1 }, { number: 9, alteration: 0 },
  ]);
  expect(mapped.optionalFormulaIndices).toEqual([2]);
  expect(mapped.voicing).toEqual(before.voicing);
  expect(mapped.occurrences.map(({ sourceIndex, note }) => [sourceIndex, formatRegisteredNote(note, "ascii")]))
    .toEqual([[0, "C4"], [1, "E3"], [2, "Bb3"], [3, "D6"], [4, "C4"]]);
  expect(mapped.occurrences.map(({ note }) => registeredPitchFromNote(note))).toEqual([48, 40, 46, 74, 48]);
  expect(mapped.occurrences[3]!.locations).toEqual([]);
  expect(mapped.occurrences[0]!.locations).toEqual(mapped.occurrences[4]!.locations);
  expect(mapped.occurrences.every(({ locations }) => locations.every((location) =>
    Object.keys(location).sort().join(",") === "fret,pitch,stringId"))).toBe(true);
  // With no specified bass, mapping still leaves it unspecified.
  const unspecified = parseChordSymbol("C9");
  const unspecifiedMapping = { description: unspecified, occurrences: mapped.occurrences };
  expect(unspecifiedMapping.description).not.toHaveProperty("bass");
  expect(mapped).not.toHaveProperty("playable");
});
