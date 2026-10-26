import { describe, expect, test } from "vitest";
import {
  identifyChordsFromPitchClasses, identifyChordsFromNoteSpellings,
  identifyChordsFromRegisteredPitches, identifyChordsFromRegisteredNotes,
  type ChordIdentificationCandidate,
} from "../domain/music-theory/chords-symbols-and-realization/chord-identification.js";
import { type TriadQuality } from "../domain/music-theory/chords-symbols-and-realization/triads.js";
import { type SeventhChordQuality } from "../domain/music-theory/chords-symbols-and-realization/seventh-chords.js";
import { type AddedToneChordQuality } from "../domain/music-theory/chords-symbols-and-realization/added-tone-chords.js";
import { type ExtendedChordQuality } from "../domain/music-theory/chords-symbols-and-realization/extended-chords.js";
import {
  type PitchClassChordDescription, createSpelledChordDescription,
} from "../domain/music-theory/chords-symbols-and-realization/chord-descriptions.js";
import {
  type RegisteredPitchVoicing, type RegisteredNoteVoicing,
  rootPositionChordRegisteredPitches, rootPositionChordRegisteredNotes,
} from "../domain/music-theory/chords-symbols-and-realization/registered-chords.js";
import { analyzeRegisteredPitchVoicing } from "../domain/music-theory/chords-symbols-and-realization/chord-voicing-analysis.js";
import { parseChordSymbol, formatChordSymbol } from "../domain/music-theory/chords-symbols-and-realization/chord-symbols.js";
import { type PitchClass } from "../domain/music-theory/pitch-pitch-classes-and-spelling/pitch-class.js";
import { type NoteSpelling, type Accidental } from "../domain/music-theory/pitch-pitch-classes-and-spelling/note-spelling.js";
import { parseNoteSpelling, parseRegisteredNote } from "../domain/music-theory/pitch-pitch-classes-and-spelling/note-text.js";
import { spellingFromPitchClass, noteFromRegisteredPitch } from "../domain/music-theory/pitch-pitch-classes-and-spelling/spelling-selection.js";

type Fixture = Readonly<{ offsets: readonly number[]; roles: readonly (readonly [number, Accidental])[] }>;
// Independent complete theoretical constructions, not values retrieved from production getters.
const triads: Readonly<Record<TriadQuality, Fixture>> = {
  major: { offsets: [0, 4, 7], roles: [[1, 0], [3, 0], [5, 0]] },
  minor: { offsets: [0, 3, 7], roles: [[1, 0], [3, -1], [5, 0]] },
  diminished: { offsets: [0, 3, 6], roles: [[1, 0], [3, -1], [5, -1]] },
  augmented: { offsets: [0, 4, 8], roles: [[1, 0], [3, 0], [5, 1]] },
  sus2: { offsets: [0, 2, 7], roles: [[1, 0], [2, 0], [5, 0]] },
  sus4: { offsets: [0, 5, 7], roles: [[1, 0], [4, 0], [5, 0]] },
};
const sevenths: Readonly<Record<SeventhChordQuality, Fixture>> = {
  "major-seventh": { offsets: [0, 4, 7, 11], roles: [[1, 0], [3, 0], [5, 0], [7, 0]] },
  "dominant-seventh": { offsets: [0, 4, 7, 10], roles: [[1, 0], [3, 0], [5, 0], [7, -1]] },
  "minor-seventh": { offsets: [0, 3, 7, 10], roles: [[1, 0], [3, -1], [5, 0], [7, -1]] },
  "half-diminished-seventh": { offsets: [0, 3, 6, 10], roles: [[1, 0], [3, -1], [5, -1], [7, -1]] },
  "diminished-seventh": { offsets: [0, 3, 6, 9], roles: [[1, 0], [3, -1], [5, -1], [7, -2]] },
  "minor-major-seventh": { offsets: [0, 3, 7, 11], roles: [[1, 0], [3, -1], [5, 0], [7, 0]] },
  "augmented-major-seventh": { offsets: [0, 4, 8, 11], roles: [[1, 0], [3, 0], [5, 1], [7, 0]] },
  "augmented-seventh": { offsets: [0, 4, 8, 10], roles: [[1, 0], [3, 0], [5, 1], [7, -1]] },
  "dominant-seventh-sus2": { offsets: [0, 2, 7, 10], roles: [[1, 0], [2, 0], [5, 0], [7, -1]] },
  "dominant-seventh-sus4": { offsets: [0, 5, 7, 10], roles: [[1, 0], [4, 0], [5, 0], [7, -1]] },
};
const addedTones: Readonly<Record<AddedToneChordQuality, Fixture>> = {
  "major-add2": { offsets: [0, 4, 7, 2], roles: [[1, 0], [3, 0], [5, 0], [2, 0]] },
  "major-add9": { offsets: [0, 4, 7, 14], roles: [[1, 0], [3, 0], [5, 0], [9, 0]] },
  "minor-add9": { offsets: [0, 3, 7, 14], roles: [[1, 0], [3, -1], [5, 0], [9, 0]] },
  "major-add11": { offsets: [0, 4, 7, 17], roles: [[1, 0], [3, 0], [5, 0], [11, 0]] },
  "major-sixth": { offsets: [0, 4, 7, 9], roles: [[1, 0], [3, 0], [5, 0], [6, 0]] },
  "minor-sixth": { offsets: [0, 3, 7, 9], roles: [[1, 0], [3, -1], [5, 0], [6, 0]] },
  "major-sixth-ninth": { offsets: [0, 4, 7, 9, 14], roles: [[1, 0], [3, 0], [5, 0], [6, 0], [9, 0]] },
};
const extended: Readonly<Record<ExtendedChordQuality, Fixture>> = {
  "dominant-ninth": { offsets: [0, 4, 7, 10, 14], roles: [[1, 0], [3, 0], [5, 0], [7, -1], [9, 0]] },
  "major-ninth": { offsets: [0, 4, 7, 11, 14], roles: [[1, 0], [3, 0], [5, 0], [7, 0], [9, 0]] },
  "minor-ninth": { offsets: [0, 3, 7, 10, 14], roles: [[1, 0], [3, -1], [5, 0], [7, -1], [9, 0]] },
  "dominant-eleventh": { offsets: [0, 4, 7, 10, 14, 17], roles: [[1, 0], [3, 0], [5, 0], [7, -1], [9, 0], [11, 0]] },
  "major-eleventh": { offsets: [0, 4, 7, 11, 14, 17], roles: [[1, 0], [3, 0], [5, 0], [7, 0], [9, 0], [11, 0]] },
  "minor-eleventh": { offsets: [0, 3, 7, 10, 14, 17], roles: [[1, 0], [3, -1], [5, 0], [7, -1], [9, 0], [11, 0]] },
  "dominant-thirteenth": { offsets: [0, 4, 7, 10, 14, 17, 21], roles: [[1, 0], [3, 0], [5, 0], [7, -1], [9, 0], [11, 0], [13, 0]] },
  "major-thirteenth": { offsets: [0, 4, 7, 11, 14, 17, 21], roles: [[1, 0], [3, 0], [5, 0], [7, 0], [9, 0], [11, 0], [13, 0]] },
  "minor-thirteenth": { offsets: [0, 3, 7, 10, 14, 17, 21], roles: [[1, 0], [3, -1], [5, 0], [7, -1], [9, 0], [11, 0], [13, 0]] },
  "dominant-flat-ninth": { offsets: [0, 4, 7, 10, 13], roles: [[1, 0], [3, 0], [5, 0], [7, -1], [9, -1]] },
  "dominant-sharp-ninth": { offsets: [0, 4, 7, 10, 15], roles: [[1, 0], [3, 0], [5, 0], [7, -1], [9, 1]] },
  "dominant-sharp-eleventh": { offsets: [0, 4, 7, 10, 14, 18], roles: [[1, 0], [3, 0], [5, 0], [7, -1], [9, 0], [11, 1]] },
  "dominant-flat-thirteenth": { offsets: [0, 4, 7, 10, 14, 17, 20], roles: [[1, 0], [3, 0], [5, 0], [7, -1], [9, 0], [11, 0], [13, -1]] },
  "major-sharp-eleventh": { offsets: [0, 4, 7, 11, 14, 18], roles: [[1, 0], [3, 0], [5, 0], [7, 0], [9, 0], [11, 1]] },
};
const fixtureFamilies = [["triad", triads], ["seventh", sevenths], ["added-tone", addedTones], ["extended", extended]] as const;
const roots: readonly PitchClass[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const wrap = (pitch: number) => ((pitch % 12 + 12) % 12) as PitchClass;
const classKey = (classes: readonly number[]) => [...new Set(classes)].sort((a, b) => a - b).join(",");
// Set comparison oracle deliberately uses sorted values, not production's bit masks.
const expectedCatalog = roots.flatMap((root) => fixtureFamilies.flatMap(([family, fixtures]) =>
  Object.entries(fixtures).sort(([left], [right]) => left < right ? -1 : left > right ? 1 : 0)
    .map(([quality, fixture]) => ({
      key: classKey(fixture.offsets.map((offset) => wrap(root + offset))),
      candidate: { family, quality, description: {
        root, formula: fixture.roles.map(([number, alteration]) => ({ number, alteration })),
      } },
    }))));
function expectedFor(classes: readonly PitchClass[]) {
  const key = classKey(classes);
  return expectedCatalog.filter((entry) => entry.key === key).map((entry) => entry.candidate);
}
const identities = (candidates: readonly ChordIdentificationCandidate[]) => candidates.map((candidate) =>
  [candidate.description.root, candidate.family, candidate.quality]);

for (const [family, fixtures] of fixtureFamilies) {
  describe(family, () => {
    for (const [quality, fixture] of Object.entries(fixtures)) {
      test.each(roots)(`${quality}, root %i: complete alternatives and exact roles through all adapters`, (root) => {
        const classes = fixture.offsets.map((offset) => wrap(root + offset));
        const repeated = [...classes].reverse().concat(classes[0]!);
        const expected = expectedFor(classes);
        expect(identifyChordsFromPitchClasses(repeated)).toEqual(expected);
        expect(identifyChordsFromNoteSpellings(repeated.map((pitchClass) => spellingFromPitchClass(pitchClass, "flats"))))
          .toEqual(expected);
        const pitches = fixture.offsets.map((offset) => 12 + root + offset).reverse();
        pitches.push(12 + root);
        const registered = identifyChordsFromRegisteredPitches({ pitches });
        const spelled = identifyChordsFromRegisteredNotes({ notes: pitches.map((pitch) => noteFromRegisteredPitch(pitch, "sharps")) });
        expect(spelled).toEqual(registered);
        expect(registered.bass).toEqual({ pitch: 12 + root, pitchClass: root,
          toneIndices: [fixture.offsets.length - 1, fixture.offsets.length] });
        expect(registered.candidates.map(({ bassFormulaIndices: _indices, ...candidate }) => candidate)).toEqual(expected);
        for (const candidate of registered.candidates) {
          const entry = expectedCatalog.find((entry) => entry.candidate.description.root === candidate.description.root
            && entry.candidate.family === candidate.family && entry.candidate.quality === candidate.quality)!;
          const candidateFixture = fixtureFamilies.find(([name]) => name === candidate.family)![1] as Readonly<Record<string, Fixture>>;
          expect(candidate.bassFormulaIndices).toEqual(candidateFixture[candidate.quality]!.offsets
            .flatMap((offset, index) => wrap(entry.candidate.description.root + offset) === root ? [index] : []));
          expect(candidate.description).not.toHaveProperty("bass");
          expect(candidate).not.toHaveProperty("inversion");
        }
      });
    }
  });
}

test("retains C6/Am7, add2/add9 and suspended alternatives without preferring a name", () => {
  expect(identities(identifyChordsFromPitchClasses([0, 4, 7, 9]))).toEqual([
    [0, "added-tone", "major-sixth"], [9, "seventh", "minor-seventh"],
  ]);
  expect(identities(identifyChordsFromPitchClasses([0, 2, 4, 7]))).toEqual([
    [0, "added-tone", "major-add2"], [0, "added-tone", "major-add9"],
  ]);
  expect(identities(identifyChordsFromPitchClasses([0, 2, 7]))).toEqual([
    [0, "triad", "sus2"], [7, "triad", "sus4"],
  ]);
});

test("symmetric roots remain distinct and sorted by numeric root", () => {
  expect(identities(identifyChordsFromPitchClasses([8, 0, 4, 0]))).toEqual([
    [0, "triad", "augmented"], [4, "triad", "augmented"], [8, "triad", "augmented"],
  ]);
  expect(identities(identifyChordsFromPitchClasses([9, 6, 3, 0]))).toEqual([
    [0, "seventh", "diminished-seventh"], [3, "seventh", "diminished-seventh"],
    [6, "seventh", "diminished-seventh"], [9, "seventh", "diminished-seventh"],
  ]);
});

test("spellings and registered bass never rank or filter exact-set candidates", () => {
  const spellings = ["B#", "Fb", "F##", "G##"].map(parseNoteSpelling);
  const expected = identifyChordsFromPitchClasses([0, 4, 7, 9]);
  expect(identifyChordsFromNoteSpellings(spellings)).toEqual(expected);
  const result = identifyChordsFromRegisteredNotes({ notes: ["E3", "C4", "G4", "C5"].map(parseRegisteredNote) });
  expect(result).toEqual({
    bass: { pitch: 40, pitchClass: 4, toneIndices: [0] },
    candidates: [{ family: "triad", quality: "major", description: {
      root: 0, formula: [{ number: 1, alteration: 0 }, { number: 3, alteration: 0 }, { number: 5, alteration: 0 }],
    }, bassFormulaIndices: [1] }],
  });
  const tied = identifyChordsFromRegisteredNotes({ notes: ["G4", "B#3", "C4", "E4"].map(parseRegisteredNote) });
  expect(tied.bass).toEqual({ pitch: 48, pitchClass: 0, toneIndices: [1, 2] });
  expect(tied.candidates[0]!.bassFormulaIndices).toEqual([0]);
  expect(identifyChordsFromNoteSpellings(["C", "Eb", "Gb", "A"].map(parseNoteSpelling)))
    .toEqual(identifyChordsFromNoteSpellings(["C", "Eb", "Gb", "Bbb"].map(parseNoteSpelling)));
});

test("incomplete/extra classes cannot match the affected identity or synthesize slash chords", () => {
  const isC7 = (candidate: ChordIdentificationCandidate) => candidate.description.root === 0
    && candidate.quality === "dominant-seventh";
  expect(identifyChordsFromPitchClasses([0, 4, 10]).some(isC7)).toBe(false); // missing fifth
  expect(identifyChordsFromPitchClasses([4, 7, 10]).some(isC7)).toBe(false); // missing root
  expect(identifyChordsFromPitchClasses([0, 4, 7, 10, 1]).some(isC7)).toBe(false);
  expect(identifyChordsFromPitchClasses([0, 4, 6, 7])).toEqual([]); // no C/F-sharp invention
  expect(identifyChordsFromPitchClasses([0])).toEqual([]);
  expect(identifyChordsFromPitchClasses(roots)).toEqual([]);
  expect(identifyChordsFromRegisteredPitches({ pitches: [48, 30, 52, 55] })).toEqual({
    bass: { pitch: 30, pitchClass: 6, toneIndices: [1] }, candidates: [],
  });
});

test("negative registers and safe endpoints work even when spacing distance cannot be represented", () => {
  expect(identifyChordsFromRegisteredPitches({ pitches: [-5, -12, -8, -12] }).bass)
    .toEqual({ pitch: -12, pitchClass: 0, toneIndices: [1, 3] });
  const limit = Number.MAX_SAFE_INTEGER;
  const extreme = identifyChordsFromRegisteredPitches({ pitches: [limit, -limit, 0, 4] });
  expect(extreme.bass).toEqual({ pitch: -limit, pitchClass: 5, toneIndices: [1] });
  expect(extreme.candidates.map(({ bassFormulaIndices: _indices, ...candidate }) => candidate))
    .toEqual(identifyChordsFromPitchClasses([7, 5, 0, 4]));
  const octave = Math.floor(limit / 12);
  expect(identifyChordsFromRegisteredNotes({ notes: [
    { letter: "C", accidental: 0, octave }, { letter: "C", accidental: 0, octave: -octave },
  ] })).toEqual({ bass: { pitch: -12 * octave, pitchClass: 0, toneIndices: [1] }, candidates: [] });
});

test("composes with symbols, registered realization and numeric D052 analysis", () => {
  const description = parseChordSymbol("C9/E");
  const voicing = rootPositionChordRegisteredPitches(createSpelledChordDescription(description.root, description.formula), 48);
  const identified = identifyChordsFromRegisteredPitches(voicing);
  const c9 = identified.candidates.find((candidate) => candidate.description.root === 0 && candidate.quality === "dominant-ninth")!;
  expect(c9.bassFormulaIndices).toEqual([0]);
  expect(analyzeRegisteredPitchVoicing(c9.description, voicing)).toMatchObject({
    inversion: { status: "unsupported-structure" }, missingRequiredFormulaIndices: [],
  });
  const root = spellingFromPitchClass(c9.description.root, "sharps");
  expect(formatChordSymbol(createSpelledChordDescription(root, c9.description.formula))).toBe("C9");
  const oddSpelling = parseChordSymbol("G###maj7");
  const numeric = identifyChordsFromRegisteredPitches(rootPositionChordRegisteredPitches(oddSpelling, 58));
  expect(numeric.candidates.some((candidate) => candidate.description.root === 10 && candidate.quality === "major-seventh")).toBe(true);
  const spelled = rootPositionChordRegisteredNotes(parseChordSymbol("Cdim7"), parseRegisteredNote("C-1"));
  expect(identifyChordsFromRegisteredNotes(spelled).candidates).toHaveLength(4);
});

test.each([[], null, undefined, {}, new Array(1), [undefined], [null], [NaN], [Infinity], [-1], [12], [0.5], ["0"], [0, 4, 7, undefined]]
  .map((input) => [input]))("invalid numeric class collection %j rejects", (input) => {
  expect(() => identifyChordsFromPitchClasses(input as readonly PitchClass[])).toThrow(RangeError);
});

test.each([[], null, undefined, {}, new Array(1), [undefined], [null], [0], [{}],
  [{ letter: "C", accidental: NaN }], [{ letter: "C", accidental: 0 }, undefined],
].map((input) => [input]))("invalid spelling collection %j rejects", (input) => {
  expect(() => identifyChordsFromNoteSpellings(input as readonly NoteSpelling[])).toThrow(RangeError);
});

test.each([null, undefined, {}, { pitches: [] }, { pitches: new Array(1) }, { pitches: [undefined] },
  { pitches: [NaN] }, { pitches: [Infinity] }, { pitches: [0.5] }, { pitches: [Number.MAX_SAFE_INTEGER + 1] },
].map((input) => [input]))("invalid direct numeric voicing %j rejects", (input) => {
  expect(() => identifyChordsFromRegisteredPitches(input as RegisteredPitchVoicing)).toThrow(RangeError);
});

test.each([null, undefined, {}, { notes: [] }, { notes: new Array(1) }, { notes: [undefined] }, { notes: [null] },
  { notes: [0] }, { notes: [{}] }, { notes: [{ letter: "C", accidental: 0, octave: 0.5 }] },
  { notes: [{ letter: "C", accidental: 0, octave: Number.MAX_SAFE_INTEGER }] },
].map((input) => [input]))("invalid direct spelled voicing %j rejects", (input) => {
  expect(() => identifyChordsFromRegisteredNotes(input as RegisteredNoteVoicing)).toThrow(RangeError);
});

test("frozen inputs and independent mutable runtime outputs cannot alter the private catalog", () => {
  const classes = Object.freeze([0, 2, 4, 7] as const);
  const spellings = Object.freeze(["C", "D", "E", "G"].map((text) => Object.freeze(parseNoteSpelling(text))));
  const pitches = Object.freeze({ pitches: Object.freeze([48, 50, 52, 55]) });
  const notes = Object.freeze({ notes: Object.freeze(["C4", "D4", "E4", "G4"].map((text) => Object.freeze(parseRegisteredNote(text)))) });
  const before = JSON.stringify({ classes, spellings, pitches, notes });
  const first = identifyChordsFromPitchClasses(classes);
  const second = identifyChordsFromPitchClasses(classes);
  expect(identifyChordsFromNoteSpellings(spellings)).toEqual(second);
  expect(identifyChordsFromRegisteredNotes(notes)).toEqual(identifyChordsFromRegisteredPitches(pitches));
  expect(first[0]!.description.formula).not.toBe(first[1]!.description.formula);
  (first[0]!.description as { root: number }).root = 11;
  (first[0]!.description.formula[0]! as { number: number }).number = 99;
  (first as ChordIdentificationCandidate[]).pop();
  expect(identifyChordsFromPitchClasses(classes)).toEqual(second);
  const registered = identifyChordsFromRegisteredPitches(pitches);
  (registered.bass.toneIndices as number[]).push(99);
  (registered.candidates[0]!.bassFormulaIndices as number[]).push(99);
  (registered.candidates[0]!.description.formula[0]! as { number: number }).number = 99;
  const fresh = identifyChordsFromRegisteredPitches(pitches);
  expect(fresh.bass.toneIndices).toEqual([0]);
  expect(fresh.candidates[0]!.bassFormulaIndices).toEqual([0]);
  expect(fresh.candidates[0]!.description.formula[0]!.number).toBe(1);
  expect(JSON.stringify({ classes, spellings, pitches, notes })).toBe(before);
  expect(Object.isFrozen(first)).toBe(false);
  expect(Object.isFrozen(second[0]!.description)).toBe(false);
  expect(Object.isFrozen(second[0]!.description.formula[0])).toBe(false);
  expect(identifyChordsFromPitchClasses([0, 1])).not.toBe(identifyChordsFromPitchClasses([0, 1]));
});

if (false) {
  // @ts-expect-error Classes retain the bounded PitchClass type.
  identifyChordsFromPitchClasses([12]);
  // @ts-expect-error A registered record is required, not an array.
  identifyChordsFromRegisteredPitches([48, 52, 55]);
  // @ts-expect-error Numeric records cannot request spelled registered input.
  identifyChordsFromRegisteredNotes({ pitches: [48, 52, 55] });
  // @ts-expect-error Note spellings are not numeric input.
  identifyChordsFromPitchClasses([parseNoteSpelling("C")]);
  const candidates = identifyChordsFromPitchClasses([0, 4, 7]);
  // @ts-expect-error Returned arrays are readonly.
  candidates.push(candidates[0]!);
  // @ts-expect-error Nested descriptions are readonly.
  candidates[0]!.description.root = 1;
  // @ts-expect-error Nested formula roles are readonly.
  candidates[0]!.description.formula[0]!.number = 9;
  const registered = identifyChordsFromRegisteredPitches({ pitches: [48] });
  // @ts-expect-error Bass evidence is readonly.
  registered.bass.pitch = 0;
  // @ts-expect-error Candidate role indices are readonly.
  registered.candidates[0]!.bassFormulaIndices.push(1);
  // A function body has normal control flow even inside this never-executed type fixture.
  const checkFamily = (candidate: ChordIdentificationCandidate) => {
    if (candidate.family === "triad") {
      const quality: TriadQuality = candidate.quality;
      void quality;
      // @ts-expect-error Family narrows quality, excluding extended identities.
      const extendedQuality: ExtendedChordQuality = candidate.quality;
      void extendedQuality;
    }
  };
  checkFamily(candidates[0]!);
  const description: PitchClassChordDescription = candidates[0]!.description;
  void description;
}
