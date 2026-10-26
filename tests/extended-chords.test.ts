import { expect, test } from "vitest";
import { type ExtendedChordQuality, extendedChordFormula, extendedChordNoteSpellings, extendedChordPitchClasses } from "../domain/music-theory/chords-symbols-and-realization/extended-chords.js";
import { type ChordFixture, verifyChordCatalog } from "./helpers/chord-catalog.js";

const fixtures = {
  "dominant-ninth": { roles: [[1, 0], [3, 0], [5, 0], [7, -1], [9, 0]], offsets: [0, 4, 7, 10, 14], notes: ["C", "E", "G", "Bb", "D"] },
  "major-ninth": { roles: [[1, 0], [3, 0], [5, 0], [7, 0], [9, 0]], offsets: [0, 4, 7, 11, 14], notes: ["C", "E", "G", "B", "D"] },
  "minor-ninth": { roles: [[1, 0], [3, -1], [5, 0], [7, -1], [9, 0]], offsets: [0, 3, 7, 10, 14], notes: ["C", "Eb", "G", "Bb", "D"] },
  "dominant-eleventh": { roles: [[1, 0], [3, 0], [5, 0], [7, -1], [9, 0], [11, 0]], offsets: [0, 4, 7, 10, 14, 17], notes: ["C", "E", "G", "Bb", "D", "F"] },
  "major-eleventh": { roles: [[1, 0], [3, 0], [5, 0], [7, 0], [9, 0], [11, 0]], offsets: [0, 4, 7, 11, 14, 17], notes: ["C", "E", "G", "B", "D", "F"] },
  "minor-eleventh": { roles: [[1, 0], [3, -1], [5, 0], [7, -1], [9, 0], [11, 0]], offsets: [0, 3, 7, 10, 14, 17], notes: ["C", "Eb", "G", "Bb", "D", "F"] },
  "dominant-thirteenth": { roles: [[1, 0], [3, 0], [5, 0], [7, -1], [9, 0], [11, 0], [13, 0]], offsets: [0, 4, 7, 10, 14, 17, 21], notes: ["C", "E", "G", "Bb", "D", "F", "A"] },
  "major-thirteenth": { roles: [[1, 0], [3, 0], [5, 0], [7, 0], [9, 0], [11, 0], [13, 0]], offsets: [0, 4, 7, 11, 14, 17, 21], notes: ["C", "E", "G", "B", "D", "F", "A"] },
  "minor-thirteenth": { roles: [[1, 0], [3, -1], [5, 0], [7, -1], [9, 0], [11, 0], [13, 0]], offsets: [0, 3, 7, 10, 14, 17, 21], notes: ["C", "Eb", "G", "Bb", "D", "F", "A"] },
  "dominant-flat-ninth": { roles: [[1, 0], [3, 0], [5, 0], [7, -1], [9, -1]], offsets: [0, 4, 7, 10, 13], notes: ["C", "E", "G", "Bb", "Db"] },
  "dominant-sharp-ninth": { roles: [[1, 0], [3, 0], [5, 0], [7, -1], [9, 1]], offsets: [0, 4, 7, 10, 15], notes: ["C", "E", "G", "Bb", "D#"] },
  "dominant-sharp-eleventh": { roles: [[1, 0], [3, 0], [5, 0], [7, -1], [9, 0], [11, 1]], offsets: [0, 4, 7, 10, 14, 18], notes: ["C", "E", "G", "Bb", "D", "F#"] },
  "dominant-flat-thirteenth": { roles: [[1, 0], [3, 0], [5, 0], [7, -1], [9, 0], [11, 0], [13, -1]], offsets: [0, 4, 7, 10, 14, 17, 20], notes: ["C", "E", "G", "Bb", "D", "F", "Ab"] },
  "major-sharp-eleventh": { roles: [[1, 0], [3, 0], [5, 0], [7, 0], [9, 0], [11, 1]], offsets: [0, 4, 7, 11, 14, 18], notes: ["C", "E", "G", "B", "D", "F#"] },
} as const satisfies Readonly<Record<ExtendedChordQuality, ChordFixture>>;

verifyChordCatalog<ExtendedChordQuality>(fixtures, extendedChordFormula, extendedChordPitchClasses, extendedChordNoteSpellings);

test("complete formulas retain thirds and natural elevenths without voicing omissions", () => {
  expect(extendedChordPitchClasses(0, "dominant-thirteenth")).toEqual([0, 4, 7, 10, 2, 5, 9]);
  expect(extendedChordFormula("major-eleventh").map((role) => role.number)).toEqual([1, 3, 5, 7, 9, 11]);
  expect(extendedChordFormula("minor-thirteenth").map((role) => role.number)).toEqual([1, 3, 5, 7, 9, 11, 13]);
});

test.each([
  ["dominant-flat-ninth", "dominant-ninth", 9, -1],
  ["dominant-sharp-ninth", "dominant-ninth", 9, 1],
  ["dominant-sharp-eleventh", "dominant-eleventh", 11, 1],
  ["dominant-flat-thirteenth", "dominant-thirteenth", 13, -1],
  ["major-sharp-eleventh", "major-eleventh", 11, 1],
] as const)("%s replaces only its selected extension without affecting %s", (quality, base, number, alteration) => {
  const before = extendedChordFormula(base);
  const altered = extendedChordFormula(quality);
  expect(altered.filter((role) => role.number === number)).toEqual([{ number, alteration }]);
  expect(altered.filter((role) => role.number !== number)).toEqual(before.filter((role) => role.number !== number));
  altered.forEach((role, index) => expect(role).not.toBe(before[index]));
  expect(extendedChordFormula(base)).toEqual(before);
  if (quality === "dominant-flat-thirteenth") {
    expect(altered.find((role) => role.number === 11)).toEqual({ number: 11, alteration: 0 });
  }
});

if (false) {
  // @ts-expect-error Quality is required.
  extendedChordFormula();
  // @ts-expect-error Bare chord symbols are not quality identifiers.
  extendedChordPitchClasses(0, "C13");
  // @ts-expect-error Added-tone quality is not an extended quality.
  extendedChordFormula("major-add9");
  // @ts-expect-error Root is a pitch class.
  extendedChordPitchClasses(12, "major-ninth");
  // @ts-expect-error Note text requires parsing.
  extendedChordNoteSpellings("C", "major-ninth");
  // @ts-expect-error Explicit quality is required.
  extendedChordPitchClasses(0);
  // @ts-expect-error Spelled root requires accidental.
  extendedChordNoteSpellings({ letter: "C" }, "major-ninth");
  // @ts-expect-error Root accidental range is unchanged.
  extendedChordNoteSpellings({ letter: "C", accidental: 4 }, "major-ninth");
  // @ts-expect-error Formula roles are readonly.
  extendedChordFormula("major-ninth")[0]!.alteration = 1;
  // @ts-expect-error Formula arrays are readonly.
  extendedChordFormula("major-ninth").push({ number: 9, alteration: 0 });
  // @ts-expect-error Numeric results are readonly.
  extendedChordPitchClasses(0, "major-ninth")[0] = 1;
  // @ts-expect-error Spelled arrays are readonly.
  extendedChordNoteSpellings({ letter: "C", accidental: 0 }, "major-ninth").push({ letter: "D", accidental: 0 });
  // @ts-expect-error Spelled results are readonly.
  extendedChordNoteSpellings({ letter: "C", accidental: 0 }, "major-ninth")[0]!.accidental = 1;
}
