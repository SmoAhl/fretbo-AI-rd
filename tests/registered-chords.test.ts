import { describe, expect, test } from "vitest";
import {
  createRegisteredPitchVoicing, createRegisteredNoteVoicing,
  rootPositionChordRegisteredPitches, rootPositionChordRegisteredNotes,
} from "../domain/music-theory/chords-symbols-and-realization/registered-chords.js";
import {
  createPitchClassChordDescription, createSpelledChordDescription,
} from "../domain/music-theory/chords-symbols-and-realization/chord-descriptions.js";
import { type ChordFormula } from "../domain/music-theory/chords-symbols-and-realization/chord-formulas.js";
import { type TriadQuality, triadFormula } from "../domain/music-theory/chords-symbols-and-realization/triads.js";
import { type SeventhChordQuality, seventhChordFormula } from "../domain/music-theory/chords-symbols-and-realization/seventh-chords.js";
import { type AddedToneChordQuality, addedToneChordFormula } from "../domain/music-theory/chords-symbols-and-realization/added-tone-chords.js";
import { type ExtendedChordQuality, extendedChordFormula } from "../domain/music-theory/chords-symbols-and-realization/extended-chords.js";
import { parseChordSymbol } from "../domain/music-theory/chords-symbols-and-realization/chord-symbols.js";
import { type Accidental } from "../domain/music-theory/pitch-pitch-classes-and-spelling/note-spelling.js";
import {
  type RegisteredNote, registeredPitchFromNote, pitchClassFromRegisteredPitch,
} from "../domain/music-theory/pitch-pitch-classes-and-spelling/registered-pitch.js";
import { type PitchClass } from "../domain/music-theory/pitch-pitch-classes-and-spelling/pitch-class.js";
import { parseRegisteredNote } from "../domain/music-theory/pitch-pitch-classes-and-spelling/note-text.js";

type Fixture = Readonly<{ offsets: readonly number[]; roles: readonly number[] }>;
const naturalLetters = [["C", 0], ["D", 2], ["E", 4], ["F", 5], ["G", 7], ["A", 9], ["B", 11]] as const;
const alterations = [-3, -2, -1, 0, 1, 2, 3] as const;
const spelledRoots = naturalLetters.flatMap(([letter], index) => alterations.map((accidental) => ({ index, letter, accidental })));
const pitchClasses: readonly PitchClass[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const unison: ChordFormula = [{ number: 1, alteration: 0 }];
const c4 = Object.freeze(parseRegisteredNote("C4"));
const numericDescription = (formula: ChordFormula) => createPitchClassChordDescription(0, formula);

function verifyCatalog<Q extends string>(name: string, fixtures: Readonly<Record<Q, Fixture>>, formulaFor: (quality: Q) => ChordFormula) {
  describe(name, () => {
    for (const quality of Object.keys(fixtures) as Q[]) {
      const fixture = fixtures[quality];
      test.each(pitchClasses)(`${quality}: numeric root class %i`, (pitchClass) => {
        const root = 48 + pitchClass;
        const description = createPitchClassChordDescription(pitchClass, formulaFor(quality));
        expect(rootPositionChordRegisteredPitches(description, root)).toEqual({
          pitches: fixture.offsets.map((offset) => root + offset),
        });
      });
      test.each(spelledRoots)(`${quality}: $letter ($accidental) in negative, zero and positive octaves`, ({ letter, accidental, index }) => {
        for (const octave of [-1, 0, 4]) {
          const root = Object.freeze({ letter, accidental, octave });
          const description = createSpelledChordDescription(root, formulaFor(quality));
          const rootPitch = 12 * octave + naturalLetters[index]![1] + accidental;
          const expectedPitches = fixture.offsets.map((offset) => rootPitch + offset);
          const expectedNotes = fixture.roles.map((role, position) => {
            const writtenPosition = index + role - 1;
            const [targetLetter, natural] = naturalLetters[writtenPosition % 7]!;
            const targetOctave = octave + Math.floor(writtenPosition / 7);
            return { letter: targetLetter, accidental: expectedPitches[position]! - (12 * targetOctave + natural), octave: targetOctave };
          });
          expect(rootPositionChordRegisteredPitches(description, rootPitch)).toEqual({ pitches: expectedPitches });
          if (expectedNotes.some((note) => Math.abs(note.accidental) > 3)) {
            expect(() => rootPositionChordRegisteredNotes(description, root)).toThrow(RangeError);
          } else {
            const voicing = rootPositionChordRegisteredNotes(description, root);
            expect(voicing).toEqual({ notes: expectedNotes });
            expect(voicing.notes.map(registeredPitchFromNote)).toEqual(expectedPitches);
          }
          expect(root).toEqual({ letter, accidental, octave });
        }
      });
    }
  });
}

// Independent unwrapped sounding offsets and written roles supply the register/spelling oracle.
const triads = {
  major: { offsets: [0, 4, 7], roles: [1, 3, 5] }, minor: { offsets: [0, 3, 7], roles: [1, 3, 5] },
  diminished: { offsets: [0, 3, 6], roles: [1, 3, 5] }, augmented: { offsets: [0, 4, 8], roles: [1, 3, 5] },
  sus2: { offsets: [0, 2, 7], roles: [1, 2, 5] }, sus4: { offsets: [0, 5, 7], roles: [1, 4, 5] },
} as const satisfies Readonly<Record<TriadQuality, Fixture>>;
const sevenths = {
  "major-seventh": { offsets: [0, 4, 7, 11], roles: [1, 3, 5, 7] },
  "dominant-seventh": { offsets: [0, 4, 7, 10], roles: [1, 3, 5, 7] },
  "minor-seventh": { offsets: [0, 3, 7, 10], roles: [1, 3, 5, 7] },
  "half-diminished-seventh": { offsets: [0, 3, 6, 10], roles: [1, 3, 5, 7] },
  "diminished-seventh": { offsets: [0, 3, 6, 9], roles: [1, 3, 5, 7] },
  "minor-major-seventh": { offsets: [0, 3, 7, 11], roles: [1, 3, 5, 7] },
  "augmented-major-seventh": { offsets: [0, 4, 8, 11], roles: [1, 3, 5, 7] },
  "augmented-seventh": { offsets: [0, 4, 8, 10], roles: [1, 3, 5, 7] },
  "dominant-seventh-sus2": { offsets: [0, 2, 7, 10], roles: [1, 2, 5, 7] },
  "dominant-seventh-sus4": { offsets: [0, 5, 7, 10], roles: [1, 4, 5, 7] },
} as const satisfies Readonly<Record<SeventhChordQuality, Fixture>>;
const additions = {
  "major-add2": { offsets: [0, 4, 7, 2], roles: [1, 3, 5, 2] },
  "major-add9": { offsets: [0, 4, 7, 14], roles: [1, 3, 5, 9] },
  "minor-add9": { offsets: [0, 3, 7, 14], roles: [1, 3, 5, 9] },
  "major-add11": { offsets: [0, 4, 7, 17], roles: [1, 3, 5, 11] },
  "major-sixth": { offsets: [0, 4, 7, 9], roles: [1, 3, 5, 6] },
  "minor-sixth": { offsets: [0, 3, 7, 9], roles: [1, 3, 5, 6] },
  "major-sixth-ninth": { offsets: [0, 4, 7, 9, 14], roles: [1, 3, 5, 6, 9] },
} as const satisfies Readonly<Record<AddedToneChordQuality, Fixture>>;
const extensions = {
  "dominant-ninth": { offsets: [0, 4, 7, 10, 14], roles: [1, 3, 5, 7, 9] },
  "major-ninth": { offsets: [0, 4, 7, 11, 14], roles: [1, 3, 5, 7, 9] },
  "minor-ninth": { offsets: [0, 3, 7, 10, 14], roles: [1, 3, 5, 7, 9] },
  "dominant-eleventh": { offsets: [0, 4, 7, 10, 14, 17], roles: [1, 3, 5, 7, 9, 11] },
  "major-eleventh": { offsets: [0, 4, 7, 11, 14, 17], roles: [1, 3, 5, 7, 9, 11] },
  "minor-eleventh": { offsets: [0, 3, 7, 10, 14, 17], roles: [1, 3, 5, 7, 9, 11] },
  "dominant-thirteenth": { offsets: [0, 4, 7, 10, 14, 17, 21], roles: [1, 3, 5, 7, 9, 11, 13] },
  "major-thirteenth": { offsets: [0, 4, 7, 11, 14, 17, 21], roles: [1, 3, 5, 7, 9, 11, 13] },
  "minor-thirteenth": { offsets: [0, 3, 7, 10, 14, 17, 21], roles: [1, 3, 5, 7, 9, 11, 13] },
  "dominant-flat-ninth": { offsets: [0, 4, 7, 10, 13], roles: [1, 3, 5, 7, 9] },
  "dominant-sharp-ninth": { offsets: [0, 4, 7, 10, 15], roles: [1, 3, 5, 7, 9] },
  "dominant-sharp-eleventh": { offsets: [0, 4, 7, 10, 14, 18], roles: [1, 3, 5, 7, 9, 11] },
  "dominant-flat-thirteenth": { offsets: [0, 4, 7, 10, 14, 17, 20], roles: [1, 3, 5, 7, 9, 11, 13] },
  "major-sharp-eleventh": { offsets: [0, 4, 7, 11, 14, 18], roles: [1, 3, 5, 7, 9, 11] },
} as const satisfies Readonly<Record<ExtendedChordQuality, Fixture>>;
verifyCatalog("triads", triads, triadFormula);
verifyCatalog("sevenths", sevenths, seventhChordFormula);
verifyCatalog("added tones", additions, addedToneChordFormula);
verifyCatalog("extensions", extensions, extendedChordFormula);

test("compound roles retain register and formula order without sorting or deduplication", () => {
  const formula: ChordFormula = [1, 2, 9, 4, 11, 6, 13, 9, 1].map((number) => ({ number, alteration: 0 }));
  const description = createSpelledChordDescription(c4, formula);
  expect(rootPositionChordRegisteredPitches(description, 48).pitches).toEqual([48, 50, 62, 53, 65, 57, 69, 62, 48]);
  expect(rootPositionChordRegisteredNotes(description, c4).notes)
    .toEqual(["C4", "D4", "D5", "F4", "F5", "A4", "A5", "D5", "C4"].map(parseRegisteredNote));
  const reordered = createSpelledChordDescription(c4, [{ number: 5, alteration: 0 }, ...unison, { number: 3, alteration: 0 }]);
  expect(rootPositionChordRegisteredNotes(reordered, c4).notes).toEqual(["G4", "C4", "E4"].map(parseRegisteredNote));
});

test.each([
  ["B#3", "B#", ["B#3", "D##4", "F##4"]],
  ["Cb4", "Cb", ["Cb4", "Eb4", "Gb4"]],
  ["C4", "Cdim7", ["C4", "Eb4", "Gb4", "Bbb4"]],
] as const)("preserves written register and roles at %s", (root, symbol, notes) => {
  expect(rootPositionChordRegisteredNotes(parseChordSymbol(symbol), parseRegisteredNote(root)).notes)
    .toEqual(notes.map(parseRegisteredNote));
});

test("supplied voicings preserve unsorted, repeated and enharmonic notes without identity checks", () => {
  const notes = ["E3", "C4", "G4", "C5", "B#3", "C4", "C-1"].map(parseRegisteredNote);
  expect(createRegisteredNoteVoicing(notes).notes).toEqual(notes);
  const pitches = [40, 48, 55, 60, 48, 48, -12];
  expect(createRegisteredPitchVoicing(pitches).pitches).toEqual(pitches);
});

test("factories and constructors preserve frozen inputs and return independent unfrozen data", () => {
  const shared = Object.freeze(parseRegisteredNote("C4"));
  const input = Object.freeze([shared, shared]);
  const first = createRegisteredNoteVoicing(input);
  const second = createRegisteredNoteVoicing(input);
  const numericInput = Object.freeze([48, 48]);
  const numeric = createRegisteredPitchVoicing(numericInput);
  for (const item of [first, first.notes, ...first.notes, numeric, numeric.pitches]) expect(Object.isFrozen(item)).toBe(false);
  expect(first.notes).not.toBe(input);
  expect(first.notes[0]).not.toBe(first.notes[1]);
  expect(first.notes[0]).not.toBe(shared);
  (first.notes[0] as { octave: number }).octave = 5;
  (numeric.pitches as number[])[0] = 60;
  expect(second.notes).toEqual(input);
  expect(first.notes[1]).toEqual(shared);
  expect(numericInput).toEqual([48, 48]);
  const mutable = [{ ...shared }];
  const copied = createRegisteredNoteVoicing(mutable);
  mutable[0]!.octave = 3;
  expect(copied.notes[0]).toEqual(shared);
  const description = parseChordSymbol("C/C");
  Object.freeze(description.root);
  Object.freeze(description.bass);
  description.formula.forEach(Object.freeze);
  Object.freeze(description.formula);
  Object.freeze(description);
  const snapshot = structuredClone(description);
  const realized = rootPositionChordRegisteredNotes(description, shared);
  expect(realized.notes[0]).not.toBe(shared);
  expect(realized.notes[0]).not.toBe(description.root);
  (realized.notes[0] as { accidental: number }).accidental = 1;
  expect(rootPositionChordRegisteredNotes(description, shared).notes[0]).toEqual(shared);
  expect(description).toEqual(snapshot);
});

test.each(["C/E", "C/F#"])("rejects incompatible specified bass %s in both constructors", (symbol) => {
  expect(() => rootPositionChordRegisteredPitches(parseChordSymbol(symbol), 48)).toThrow(RangeError);
  expect(() => rootPositionChordRegisteredNotes(parseChordSymbol(symbol), c4)).toThrow(RangeError);
});
test("numeric bass equivalence does not silently discard a spelled bass constraint", () => {
  const description = parseChordSymbol("C/B#");
  expect(rootPositionChordRegisteredPitches(description, 48).pitches).toEqual([48, 52, 55]);
  expect(() => rootPositionChordRegisteredNotes(description, c4)).toThrow(RangeError);
  expect(() => rootPositionChordRegisteredPitches(createPitchClassChordDescription(0, triadFormula("major"), 4), 48))
    .toThrow(RangeError);
  expect(rootPositionChordRegisteredPitches(createPitchClassChordDescription(0, triadFormula("major"), 0), 48).pitches)
    .toEqual([48, 52, 55]);
});
test("rejects mismatching anchors and preserves numeric independence from spelling", () => {
  const c = parseChordSymbol("C");
  expect(() => rootPositionChordRegisteredPitches(c, 49)).toThrow(RangeError);
  expect(() => rootPositionChordRegisteredNotes(c, parseRegisteredNote("B#3"))).toThrow(RangeError);
  const g = parseChordSymbol("G###maj7");
  expect(rootPositionChordRegisteredPitches(g, 58).pitches).toEqual([58, 62, 65, 69]);
  expect(() => rootPositionChordRegisteredNotes(g, parseRegisteredNote("G###4"))).toThrow(RangeError);
});
test.each([
  [{ number: 3, alteration: 0 }], [{ number: 8, alteration: 0 }], [{ number: 1, alteration: 1 }],
  [...unison, { number: 1, alteration: -1 }], [...unison, { number: 2, alteration: -3 }],
] as ChordFormula[])("rejects missing root or below-root formula %j", (...roles) => {
  const formula = roles as ChordFormula;
  expect(() => rootPositionChordRegisteredPitches(numericDescription(formula), 48)).toThrow(RangeError);
  expect(() => rootPositionChordRegisteredNotes(createSpelledChordDescription(c4, formula), c4)).toThrow(RangeError);
});

const largestSafeOctave = 750599937895082;
test("safe boundary roots work without imposing spelling bounds on numeric voicings", () => {
  for (const root of [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER]) {
    expect(rootPositionChordRegisteredPitches(createPitchClassChordDescription(pitchClassFromRegisteredPitch(root), unison), root).pitches)
      .toEqual([root]);
  }
  const root: RegisteredNote = { letter: "G", accidental: 0, octave: largestSafeOctave };
  expect(rootPositionChordRegisteredNotes(createSpelledChordDescription(root, unison), root).notes).toEqual([root]);
  expect(() => rootPositionChordRegisteredNotes(createSpelledChordDescription(root, triadFormula("major")), root)).toThrow(RangeError);
  expect(() => rootPositionChordRegisteredPitches(createPitchClassChordDescription(7, triadFormula("major")), Number.MAX_SAFE_INTEGER))
    .toThrow(RangeError);
});
test("huge compound distances use exact arithmetic including final alteration compensation", () => {
  const cycles = BigInt(largestSafeOctave);
  for (const [simple, alteration, letter] of [[5, 0, "G"], [6, -2, "A"]] as const) {
    const formula: ChordFormula = [...unison, { number: Number(cycles * 7n + BigInt(simple)), alteration }];
    const description = createSpelledChordDescription(c4, formula);
    expect(rootPositionChordRegisteredPitches(description, 0).pitches).toEqual([0, Number.MAX_SAFE_INTEGER]);
    expect(rootPositionChordRegisteredNotes(description, { ...c4, octave: 0 }).notes).toEqual([
      { ...c4, octave: 0 }, { letter, accidental: alteration, octave: largestSafeOctave },
    ]);
  }
  const unsafeDisplacement: ChordFormula = [...unison, { number: Number(cycles * 7n + 6n), alteration: 0 }];
  // The final sum would fit after adding -12, but the required displacement itself is unsafe.
  expect(() => rootPositionChordRegisteredPitches(numericDescription(unsafeDisplacement), -12)).toThrow(RangeError);
  const huge: ChordFormula = [...unison, { number: Number.MAX_SAFE_INTEGER, alteration: 0 }];
  expect(() => rootPositionChordRegisteredPitches(numericDescription(huge), 0)).toThrow(RangeError);
  expect(() => rootPositionChordRegisteredNotes(createSpelledChordDescription(c4, huge), c4)).toThrow(RangeError);
});

test.each([[], null, undefined, {}, new Array(1), [undefined], [null], [NaN], [Infinity], [0.5], [Number.MAX_SAFE_INTEGER + 1]]
  .map((input) => [input]))(
  "rejects invalid supplied numeric voicing %j", (input) => {
    expect(() => createRegisteredPitchVoicing(input as readonly number[])).toThrow(RangeError);
  });
test.each([[], null, undefined, {}, new Array(1), [undefined], [null], [1], [{}],
  [{ letter: "C", accidental: 0, octave: NaN }], [{ letter: "C", accidental: 0, octave: 0.5 }],
  [{ letter: "C", accidental: 0, octave: largestSafeOctave + 1 }],
  [{ letter: "B", accidental: 1, octave: -largestSafeOctave - 1 }],
].map((input) => [input]))("rejects invalid supplied spelled voicing %j", (input) => {
  expect(() => createRegisteredNoteVoicing(input as readonly RegisteredNote[])).toThrow(RangeError);
});
test.each([NaN, Infinity, -Infinity, 0.5, Number.MAX_SAFE_INTEGER + 1])("rejects invalid anchor %s", (root) => {
  expect(() => rootPositionChordRegisteredPitches(numericDescription(unison), root)).toThrow(RangeError);
  expect(() => rootPositionChordRegisteredNotes(createSpelledChordDescription(c4, unison), { ...c4, octave: root })).toThrow(RangeError);
});
test.each([[], null, undefined, new Array(1), [null], [{ number: 0, alteration: 0 }], [{ number: 1, alteration: 4 }]]
  .map((formula) => [formula]))(
  "rejects malformed realization formula %j", (formula) => {
    expect(() => rootPositionChordRegisteredPitches({ root: 0, formula: formula as ChordFormula }, 48)).toThrow(RangeError);
    expect(() => rootPositionChordRegisteredNotes({ root: c4, formula: formula as ChordFormula }, c4)).toThrow(RangeError);
  });

if (false) {
  // @ts-expect-error Explicit root is required.
  rootPositionChordRegisteredPitches(numericDescription(unison));
  // @ts-expect-error Numeric descriptions cannot request spelled output.
  rootPositionChordRegisteredNotes(numericDescription(unison), c4);
  // @ts-expect-error Spelled anchors require a written octave.
  rootPositionChordRegisteredNotes(parseChordSymbol("C"), { letter: "C", accidental: 0 });
  // @ts-expect-error Note objects are not numeric coordinates.
  createRegisteredPitchVoicing([c4]);
  // @ts-expect-error Numeric coordinates are not registered notes.
  createRegisteredNoteVoicing([48]);
  const numeric = createRegisteredPitchVoicing([48]);
  // @ts-expect-error Voicing records are readonly.
  numeric.pitches = [];
  // @ts-expect-error Tone arrays are readonly.
  numeric.pitches.push(60);
  const spelled = createRegisteredNoteVoicing([c4]);
  // @ts-expect-error Supplied note copies are readonly.
  spelled.notes[0]!.octave = 5;
}
