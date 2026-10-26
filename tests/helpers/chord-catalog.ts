import { describe, expect, test } from "vitest";
import { type ChordFormula } from "../../domain/music-theory/chords-symbols-and-realization/chord-formulas.js";
import { type Accidental, type NoteSpelling, pitchClassFromSpelling } from "../../domain/music-theory/pitch-pitch-classes-and-spelling/note-spelling.js";
import { parseNoteSpelling, formatNoteSpelling } from "../../domain/music-theory/pitch-pitch-classes-and-spelling/note-text.js";
import { type PitchClass } from "../../domain/music-theory/pitch-pitch-classes-and-spelling/pitch-class.js";

export type ChordFixture = Readonly<{
  roles: readonly (readonly [number, Accidental])[];
  offsets: readonly number[];
  notes: readonly string[];
}>;

const naturals = [["C", 0], ["D", 2], ["E", 4], ["F", 5], ["G", 7], ["A", 9], ["B", 11]] as const;
const accidentals = [-3, -2, -1, 0, 1, 2, 3] as const;
const roots = naturals.flatMap(([letter], index) => accidentals.map((accidental) => ({ root: { letter, accidental }, index })));
const pitchClasses: readonly PitchClass[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const wrap = (value: number) => ((value % 12 + 12) % 12) as PitchClass;

/** Test-only musical oracle: fixtures supply independent roles, distances and spelled C examples. */
export function verifyChordCatalog<Q extends string>(
  fixtures: Readonly<Record<Q, ChordFixture>>,
  formulaFor: (quality: Q) => ChordFormula,
  pitchesFor: (root: PitchClass, quality: Q) => readonly PitchClass[],
  notesFor: (root: NoteSpelling, quality: Q) => readonly NoteSpelling[],
): void {
  for (const quality of Object.keys(fixtures) as Q[]) {
    const fixture = fixtures[quality];
    const expectedFormula = fixture.roles.map(([number, alteration]) => ({ number, alteration }));
    describe(quality, () => {
      test.each(pitchClasses)("numeric root %i", (root) => {
        const expected = fixture.offsets.map((offset) => wrap(root + offset));
        expect(pitchesFor(root, quality)).toEqual(expected);
      });

      test.each(roots)("spelled root $root.letter ($root.accidental)", ({ root: input, index }) => {
        const root = Object.freeze({ ...input });
        // Absolute natural-letter coordinates retain compound distances in the independent oracle.
        const expected = fixture.roles.map(([number], position) => {
          const targetIndex = index + number - 1;
          const [letter, natural] = naturals[targetIndex % 7]!;
          const accidental = naturals[index]![1] + root.accidental + fixture.offsets[position]!
            - natural - 12 * Math.floor(targetIndex / 7);
          return { letter, accidental };
        });
        const numeric = fixture.offsets.map((offset) => wrap(naturals[index]![1] + root.accidental + offset));
        expect(pitchesFor(wrap(naturals[index]![1] + root.accidental), quality)).toEqual(numeric);
        if (expected.some((note) => Math.abs(note.accidental) > 3)) {
          expect(() => notesFor(root, quality)).toThrow(RangeError);
        } else {
          const result = notesFor(root, quality);
          expect(result).toEqual(expected);
          expect(result.map(pitchClassFromSpelling)).toEqual(numeric);
        }
        expect(root).toEqual(input);
      });

      test("independent formula and exact parse/construct/format example", () => {
        expect(formulaFor(quality)).toEqual(expectedFormula);
        expect(notesFor(parseNoteSpelling("C"), quality).map((note) => formatNoteSpelling(note, "ascii")))
          .toEqual(fixture.notes);
      });

      test("formula retrieval and constructors return isolated unfrozen results", () => {
        const formula = formulaFor(quality);
        const otherFormula = formulaFor(quality);
        expect(formula).not.toBe(otherFormula);
        expect(Object.isFrozen(formula)).toBe(false);
        formula.forEach((role, index) => {
          expect(role).not.toBe(otherFormula[index]);
          expect(Object.isFrozen(role)).toBe(false);
          (role as { number: number }).number = 99;
        });
        (formula as { number: number; alteration: Accidental }[]).push({ number: 1, alteration: 0 });
        expect(otherFormula).toEqual(expectedFormula);
        expect(formulaFor(quality)).toEqual(expectedFormula);
        const root = Object.freeze(parseNoteSpelling("C"));
        const first = notesFor(root, quality);
        const second = notesFor(root, quality);
        expect(first).not.toBe(second);
        expect(Object.isFrozen(first)).toBe(false);
        first.forEach((note, index) => {
          expect(note).not.toBe(root);
          expect(note).not.toBe(second[index]);
          expect(Object.isFrozen(note)).toBe(false);
          (note as { accidental: number }).accidental = 3;
        });
        (first as NoteSpelling[]).push(parseNoteSpelling("C"));
        expect(second).toEqual(fixture.notes.map(parseNoteSpelling));
        expect(notesFor(root, quality)).toEqual(second);
        const pitches = pitchesFor(11, quality);
        const otherPitches = pitchesFor(11, quality);
        expect(pitches).not.toBe(otherPitches);
        expect(Object.isFrozen(pitches)).toBe(false);
        (pitches as PitchClass[])[0] = 0;
        expect(pitchesFor(11, quality)).toEqual(otherPitches);
        expect(otherPitches).toEqual(fixture.offsets.map((offset) => wrap(11 + offset)));
        expect(root).toEqual(parseNoteSpelling("C"));
      });
    });
  }

  test.each(["", "major", "maj9", "C9", "toString", "constructor", "__proto__", "hasOwnProperty", null, undefined, 0])(
    "rejects unsupported catalog quality %s", (quality) => {
      expect(() => formulaFor(quality as Q)).toThrow(RangeError);
      expect(() => pitchesFor(0, quality as Q)).toThrow(RangeError);
      expect(() => notesFor({ letter: "C", accidental: 0 }, quality as Q)).toThrow(RangeError);
    });
}
