import { expect, test } from "vitest";
import { type AddedToneChordQuality, addedToneChordFormula, addedToneChordNoteSpellings, addedToneChordPitchClasses } from "../domain/music-theory/chords-symbols-and-realization/added-tone-chords.js";
import { type ChordFixture, verifyChordCatalog } from "./helpers/chord-catalog.js";

const fixtures = {
  "major-add2": { roles: [[1, 0], [3, 0], [5, 0], [2, 0]], offsets: [0, 4, 7, 2], notes: ["C", "E", "G", "D"] },
  "major-add9": { roles: [[1, 0], [3, 0], [5, 0], [9, 0]], offsets: [0, 4, 7, 14], notes: ["C", "E", "G", "D"] },
  "minor-add9": { roles: [[1, 0], [3, -1], [5, 0], [9, 0]], offsets: [0, 3, 7, 14], notes: ["C", "Eb", "G", "D"] },
  "major-add11": { roles: [[1, 0], [3, 0], [5, 0], [11, 0]], offsets: [0, 4, 7, 17], notes: ["C", "E", "G", "F"] },
  "major-sixth": { roles: [[1, 0], [3, 0], [5, 0], [6, 0]], offsets: [0, 4, 7, 9], notes: ["C", "E", "G", "A"] },
  "minor-sixth": { roles: [[1, 0], [3, -1], [5, 0], [6, 0]], offsets: [0, 3, 7, 9], notes: ["C", "Eb", "G", "A"] },
  "major-sixth-ninth": { roles: [[1, 0], [3, 0], [5, 0], [6, 0], [9, 0]], offsets: [0, 4, 7, 9, 14], notes: ["C", "E", "G", "A", "D"] },
} as const satisfies Readonly<Record<AddedToneChordQuality, ChordFixture>>;

verifyChordCatalog<AddedToneChordQuality>(fixtures, addedToneChordFormula, addedToneChordPitchClasses, addedToneChordNoteSpellings);

test("add2 and add9 preserve different roles without imposing register or a seventh", () => {
  expect(addedToneChordFormula("major-add2")[3]!.number).toBe(2);
  expect(addedToneChordFormula("major-add9")[3]!.number).toBe(9);
  expect(addedToneChordPitchClasses(0, "major-add2")).toEqual(addedToneChordPitchClasses(0, "major-add9"));
  for (const quality of Object.keys(fixtures) as AddedToneChordQuality[]) {
    expect(addedToneChordFormula(quality).some((role) => role.number === 7)).toBe(false);
  }
});

if (false) {
  // @ts-expect-error Quality is required.
  addedToneChordFormula();
  // @ts-expect-error Seventh quality is not an added-tone quality.
  addedToneChordPitchClasses(0, "dominant-seventh");
  // @ts-expect-error Root must be a pitch class.
  addedToneChordPitchClasses(12, "major-add9");
  // @ts-expect-error Note text requires parsing.
  addedToneChordNoteSpellings("C", "major-add9");
  // @ts-expect-error Explicit quality is required.
  addedToneChordPitchClasses(0);
  // @ts-expect-error Spelled root requires accidental.
  addedToneChordNoteSpellings({ letter: "C" }, "major-add9");
  // @ts-expect-error Root accidental range is unchanged.
  addedToneChordNoteSpellings({ letter: "C", accidental: 4 }, "major-add9");
  // @ts-expect-error Formula roles are readonly.
  addedToneChordFormula("major-add9")[0]!.number = 9;
  // @ts-expect-error Formula arrays are readonly.
  addedToneChordFormula("major-add9").push({ number: 9, alteration: 0 });
  // @ts-expect-error Numeric results are readonly.
  addedToneChordPitchClasses(0, "major-add9")[0] = 1;
  // @ts-expect-error Spelled arrays are readonly.
  addedToneChordNoteSpellings({ letter: "C", accidental: 0 }, "major-add9").push({ letter: "D", accidental: 0 });
  // @ts-expect-error Spelled results are readonly.
  addedToneChordNoteSpellings({ letter: "C", accidental: 0 }, "major-add9")[0]!.accidental = 1;
}
