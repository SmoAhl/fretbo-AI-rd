import { describe, expect, expectTypeOf, test } from "vitest";
import {
  type HarmonizableCollection, type HarmonizationKind, type HarmonizedChordFormula,
  harmonizedChordFormulaAtDegree, harmonizedChordPitchClassesAtDegree, harmonizedChordNoteSpellingsAtDegree,
  harmonizeCollectionFormulas, harmonizeCollectionPitchClasses, harmonizeCollectionNoteSpellings,
} from "../domain/music-theory/chords-symbols-and-realization/scale-harmonization.js";
import { type ChordFormula } from "../domain/music-theory/chords-symbols-and-realization/chord-formulas.js";
import { type TriadQuality, triadFormula } from "../domain/music-theory/chords-symbols-and-realization/triads.js";
import { type SeventhChordQuality, seventhChordFormula } from "../domain/music-theory/chords-symbols-and-realization/seventh-chords.js";
import { type Accidental, pitchClassFromSpelling } from "../domain/music-theory/pitch-pitch-classes-and-spelling/note-spelling.js";
import { formatNoteSpelling, parseNoteSpelling } from "../domain/music-theory/pitch-pitch-classes-and-spelling/note-text.js";
import { type PitchClass } from "../domain/music-theory/pitch-pitch-classes-and-spelling/pitch-class.js";
import { type ScaleDegree, scaleNoteSpellings } from "../domain/music-theory/scales-and-modes/scales.js";

// Independent musical fixtures: production catalogs and collection constructors are not the oracle.
const triads = {
  major: [0, 0, 0], minor: [0, -1, 0], diminished: [0, -1, -1], augmented: [0, 0, 1],
} as const;
const sevenths = {
  "major-seventh": [0, 0, 0, 0], "dominant-seventh": [0, 0, 0, -1],
  "minor-seventh": [0, -1, 0, -1], "half-diminished-seventh": [0, -1, -1, -1],
  "diminished-seventh": [0, -1, -1, -2], "minor-major-seventh": [0, -1, 0, 0],
  "augmented-major-seventh": [0, 0, 1, 0], "augmented-seventh": [0, 0, 1, -1],
} as const;
type TertianTriad = keyof typeof triads;
type TertianSeventh = keyof typeof sevenths;
type Fixture = Readonly<{
  collection: HarmonizableCollection;
  offsets: readonly number[];
  triad: readonly TertianTriad[];
  seventh: readonly TertianSeventh[];
}>;
const major: Fixture = {
  collection: "major", offsets: [0, 2, 4, 5, 7, 9, 11],
  triad: ["major", "minor", "minor", "major", "major", "minor", "diminished"],
  seventh: ["major-seventh", "minor-seventh", "minor-seventh", "major-seventh", "dominant-seventh", "minor-seventh", "half-diminished-seventh"],
};
const natural: Fixture = {
  collection: "natural-minor", offsets: [0, 2, 3, 5, 7, 8, 10],
  triad: ["minor", "diminished", "major", "minor", "minor", "major", "major"],
  seventh: ["minor-seventh", "half-diminished-seventh", "major-seventh", "minor-seventh", "minor-seventh", "major-seventh", "dominant-seventh"],
};
const harmonic: Fixture = {
  collection: "harmonic-minor", offsets: [0, 2, 3, 5, 7, 8, 11],
  triad: ["minor", "diminished", "augmented", "minor", "major", "major", "diminished"],
  seventh: ["minor-major-seventh", "half-diminished-seventh", "augmented-major-seventh", "minor-seventh", "dominant-seventh", "major-seventh", "diminished-seventh"],
};
const melodic: Fixture = {
  collection: "melodic-minor-ascending", offsets: [0, 2, 3, 5, 7, 9, 11],
  triad: ["minor", "minor", "augmented", "major", "major", "diminished", "diminished"],
  seventh: ["minor-major-seventh", "minor-seventh", "augmented-major-seventh", "dominant-seventh", "dominant-seventh", "half-diminished-seventh", "half-diminished-seventh"],
};
const degrees = [1, 2, 3, 4, 5, 6, 7] as const;
const kinds = ["triad", "seventh"] as const;
const pitchClasses: readonly PitchClass[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const naturals = [["C", 0], ["D", 2], ["E", 4], ["F", 5], ["G", 7], ["A", 9], ["B", 11]] as const;
const accidentals = [-3, -2, -1, 0, 1, 2, 3] as const;
const roots = naturals.flatMap(([letter], index) => accidentals.map((accidental) => ({ index, root: { letter, accidental } })));
const wrap = (n: number) => ((n % 12 + 12) % 12) as PitchClass;

function rotation(base: Fixture, start: number, collection: HarmonizableCollection): Fixture {
  const rotate = <T,>(items: readonly T[]) => [...items.slice(start), ...items.slice(0, start)];
  return {
    collection,
    offsets: rotate(base.offsets).map((offset) => wrap(offset - base.offsets[start]!)),
    triad: rotate(base.triad), seventh: rotate(base.seventh),
  };
}
const modeNames = ["ionian", "dorian", "phrygian", "lydian", "mixolydian", "aeolian", "locrian"] as const;
const fixtures: readonly Fixture[] = [
  major, natural, harmonic, melodic,
  ...modeNames.map((name, index) => rotation(major, index, name)),
  ...(["harmonic-minor", "melodic-minor-ascending"] as const).flatMap((parent) =>
    degrees.map((degree) => rotation(parent === "harmonic-minor" ? harmonic : melodic,
      degree - 1, Object.freeze({ parent, degree })))),
];
function expectedFormula(fixture: Fixture, degree: ScaleDegree, kind: HarmonizationKind): ChordFormula {
  const alterations = kind === "triad" ? triads[fixture.triad[degree - 1]!]
    : sevenths[fixture.seventh[degree - 1]!];
  return alterations.map((alteration, index) => ({ number: 1 + index * 2, alteration }));
}
function expectedNotes(fixture: Fixture, index: number, accidental: number) {
  return fixture.offsets.map((offset, position) => {
    const absoluteLetter = index + position;
    const [letter, naturalPitch] = naturals[absoluteLetter % 7]!;
    return {
      letter,
      accidental: naturals[index]![1] + accidental + offset
        - naturalPitch - 12 * Math.floor(absoluteLetter / 7),
    };
  });
}
function chordMembers<T>(notes: readonly T[], degree: ScaleDegree, kind: HarmonizationKind) {
  return Array.from({ length: kind === "triad" ? 3 : 4 }, (_, i) => notes[(degree - 1 + 2 * i) % 7]!);
}

for (const fixture of fixtures) {
  describe(JSON.stringify(fixture.collection), () => {
    for (const kind of kinds) {
      test(`${kind}: all derived formulas and catalog labels`, () => {
        const result = harmonizeCollectionFormulas(fixture.collection, kind);
        expect(result).toHaveLength(7);
        for (const degree of degrees) {
          const expected = {
            degree, kind, formula: expectedFormula(fixture, degree, kind), quality: fixture[kind][degree - 1],
          };
          expect(result[degree - 1]).toEqual(expected);
          expect(harmonizedChordFormulaAtDegree(fixture.collection, degree, kind)).toEqual(expected);
          const catalog = kind === "triad" ? triadFormula(fixture.triad[degree - 1]!)
            : seventhChordFormula(fixture.seventh[degree - 1]!);
          expect(expected.formula).toEqual(catalog);
        }
      });

      test.each(pitchClasses)(`${kind}: numeric tonic %i`, (tonic) => {
        const collection = fixture.offsets.map((offset) => wrap(tonic + offset));
        const all = harmonizeCollectionPitchClasses(tonic, fixture.collection, kind);
        expect(all).toHaveLength(7);
        for (const degree of degrees) {
          const result = harmonizedChordPitchClassesAtDegree(tonic, fixture.collection, degree, kind);
          expect(result).toEqual({
            degree, kind, formula: expectedFormula(fixture, degree, kind), quality: fixture[kind][degree - 1],
            root: collection[degree - 1], pitchClasses: chordMembers(collection, degree, kind),
          });
          expect(all[degree - 1]).toEqual(result);
        }
      });

      test.each(roots)(`${kind}: spelled tonic $root.letter ($root.accidental)`, ({ root, index }) => {
        const tonic = Object.freeze({ ...root });
        const collection = expectedNotes(fixture, index, root.accidental);
        const anyUnsupported = collection.some((note) => Math.abs(note.accidental) > 3);
        const all = anyUnsupported ? undefined : harmonizeCollectionNoteSpellings(tonic, fixture.collection, kind);
        if (anyUnsupported) {
          expect(() => harmonizeCollectionNoteSpellings(tonic, fixture.collection, kind)).toThrow(RangeError);
        } else {
          expect(all).toHaveLength(7);
        }
        for (const degree of degrees) {
          const noteSpellings = chordMembers(collection, degree, kind);
          if (noteSpellings.some((note) => Math.abs(note.accidental) > 3)) {
            expect(() => harmonizedChordNoteSpellingsAtDegree(tonic, fixture.collection, degree, kind)).toThrow(RangeError);
          } else {
            const result = harmonizedChordNoteSpellingsAtDegree(tonic, fixture.collection, degree, kind);
            expect(result).toEqual({
              degree, kind, formula: expectedFormula(fixture, degree, kind), quality: fixture[kind][degree - 1],
              root: collection[degree - 1], noteSpellings,
            });
            expect(result.noteSpellings.map(pitchClassFromSpelling)).toEqual(
              harmonizedChordPitchClassesAtDegree(pitchClassFromSpelling(tonic), fixture.collection, degree, kind).pitchClasses);
            if (all) expect(all[degree - 1]).toEqual(result);
          }
        }
        expect(tonic).toEqual(root);
      });
    }
  });
}

test("exact wraparound, altered minor qualities, and diminished-seventh letter identity", () => {
  const names = (tonic: string, collection: HarmonizableCollection, degree: ScaleDegree) =>
    harmonizedChordNoteSpellingsAtDegree(parseNoteSpelling(tonic), collection, degree, "seventh")
      .noteSpellings.map((note) => formatNoteSpelling(note, "ascii"));
  expect(names("C", "major", 7)).toEqual(["B", "D", "F", "A"]);
  expect(names("C", "harmonic-minor", 7)).toEqual(["B", "D", "F", "Ab"]);
  expect(names("C", { parent: "harmonic-minor", degree: 7 }, 1)).toEqual(["C", "Eb", "Gb", "Bbb"]);
  expect(names("C", "melodic-minor-ascending", 1)).toEqual(["C", "Eb", "G", "B"]);
  expect(harmonizedChordFormulaAtDegree("harmonic-minor", 3, "triad").quality).toBe("augmented");
});

test("selected chord succeeds even when unrelated major-scale spellings exceed the limit", () => {
  const tonic = Object.freeze(parseNoteSpelling("G###"));
  expect(() => scaleNoteSpellings(tonic, "major")).toThrow(RangeError);
  const result = harmonizedChordNoteSpellingsAtDegree(tonic, "major", 1, "triad");
  expect(result.noteSpellings.map((note) => formatNoteSpelling(note, "ascii")))
    .toEqual(["G###", "B###", "D###"]);
  expect(() => harmonizeCollectionNoteSpellings(tonic, "major", "triad")).toThrow(RangeError);
  expect(harmonizeCollectionPitchClasses(pitchClassFromSpelling(tonic), "major", "seventh")).toHaveLength(7);
});

test("mode rotation and chord degree remain separate, using the mode's own tonic", () => {
  const mode = Object.freeze({ parent: "harmonic-minor", degree: 2 } as const);
  const result = harmonizedChordNoteSpellingsAtDegree(parseNoteSpelling("D"), mode, 2, "seventh");
  expect(result.degree).toBe(2);
  expect(result.quality).toBe("augmented-major-seventh");
  expect(result.noteSpellings.map((note) => formatNoteSpelling(note, "ascii"))).toEqual(["Eb", "G", "B", "D"]);
  expect(mode).toEqual({ parent: "harmonic-minor", degree: 2 });
});

test("results are unfrozen and independent between calls, entries, metadata and root objects", () => {
  const tonic = Object.freeze(parseNoteSpelling("C"));
  const all = harmonizeCollectionNoteSpellings(tonic, "major", "seventh");
  const baseline = harmonizeCollectionNoteSpellings(tonic, "major", "seventh");
  const secondEntry = structuredClone(all[1]);
  const first = all[0]!;
  expect(Object.isFrozen(all)).toBe(false);
  expect(Object.isFrozen(first)).toBe(false);
  expect(Object.isFrozen(first.formula)).toBe(false);
  expect(Object.isFrozen(first.formula[0])).toBe(false);
  expect(Object.isFrozen(first.root)).toBe(false);
  expect(Object.isFrozen(first.noteSpellings)).toBe(false);
  expect(Object.isFrozen(first.noteSpellings[0])).toBe(false);
  expect(first.root).not.toBe(first.noteSpellings[0]);
  expect(first.root).not.toBe(tonic);
  (first.formula[0] as { alteration: number }).alteration = 3;
  (first.root as { accidental: number }).accidental = 2;
  expect(first.noteSpellings[0]).toEqual(tonic);
  (first.noteSpellings[0] as { accidental: number }).accidental = -3;
  expect(all[1]).toEqual(secondEntry);
  expect(harmonizeCollectionNoteSpellings(tonic, "major", "seventh")).toEqual(baseline);
  expect(tonic).toEqual(parseNoteSpelling("C"));
  const formulas = harmonizeCollectionFormulas("major", "triad");
  (formulas[0]!.formula as { number: number; alteration: Accidental }[]).push({ number: 9, alteration: 0 });
  expect(formulas[1]!.formula).toHaveLength(3);
  expect(harmonizeCollectionFormulas("major", "triad")[0]!.formula).toHaveLength(3);
  const numeric = harmonizeCollectionPitchClasses(0, "major", "triad");
  expect(Object.isFrozen(numeric[0]!.pitchClasses)).toBe(false);
  (numeric[0]!.pitchClasses as PitchClass[])[0] = 11;
  expect(numeric[1]!.pitchClasses).toEqual([2, 5, 9]);
  expect(harmonizeCollectionPitchClasses(0, "major", "triad")[0]!.pitchClasses).toEqual([0, 4, 7]);
});

// All entry points must reject unsupported collections and kinds, not just the formula helper.
const queryAll = (collection: HarmonizableCollection, kind: HarmonizationKind, degree: ScaleDegree = 1) => [
  () => harmonizedChordFormulaAtDegree(collection, degree, kind),
  () => harmonizedChordPitchClassesAtDegree(0, collection, degree, kind),
  () => harmonizedChordNoteSpellingsAtDegree({ letter: "C", accidental: 0 }, collection, degree, kind),
  () => harmonizeCollectionFormulas(collection, kind),
  () => harmonizeCollectionPitchClasses(0, collection, kind),
  () => harmonizeCollectionNoteSpellings({ letter: "C", accidental: 0 }, collection, kind),
];
test.each([
  "major-pentatonic", "minor-pentatonic", "chromatic", "minor", "toString", "__proto__", "", undefined, null, 1,
  {}, { parent: "major", degree: 1 }, { parent: "harmonic-minor", degree: 0 },
  { parent: "melodic-minor-ascending", degree: 8 }, { parent: "harmonic-minor", degree: 1.5 },
  { parent: "harmonic-minor", degree: NaN }, { parent: "harmonic-minor" },
])("rejects unsupported collection %j", (collection) => {
  for (const query of queryAll(collection as HarmonizableCollection, "triad")) expect(query).toThrow(RangeError);
});
test.each(["", "ninth", "Triad", "toString", undefined, null, 3])("rejects unsupported kind %j", (kind) => {
  for (const query of queryAll("major", kind as HarmonizationKind)) expect(query).toThrow(RangeError);
});
test.each([0, -1, 8, 1.5, NaN, Infinity, -Infinity, Number.MAX_SAFE_INTEGER, undefined, "1", null])(
  "rejects invalid selected degree %j", (degree) => {
    const invalidDegree = degree as ScaleDegree;
    for (const query of [
      () => harmonizedChordFormulaAtDegree("major", invalidDegree, "seventh"),
      () => harmonizedChordPitchClassesAtDegree(0, "major", invalidDegree, "seventh"),
      () => harmonizedChordNoteSpellingsAtDegree({ letter: "C", accidental: 0 }, "major", invalidDegree, "seventh"),
    ]) {
      expect(query).toThrow(RangeError);
    }
  });

test("public results narrow quality by kind", () => {
  const result: HarmonizedChordFormula = harmonizedChordFormulaAtDegree("major", 1, "triad");
  if (result.kind === "triad") expectTypeOf(result.quality).toEqualTypeOf<TriadQuality | undefined>();
  else expectTypeOf(result.quality).toEqualTypeOf<SeventhChordQuality | undefined>();
});

// Compile-time-only contracts; these invalid calls must not execute.
if (false) {
  // @ts-expect-error Pentatonic collections cannot be harmonized by this API.
  harmonizeCollectionFormulas("major-pentatonic", "triad");
  // @ts-expect-error Chord kind is required.
  harmonizeCollectionPitchClasses(0, "major");
  // @ts-expect-error Chord degrees are 1..7.
  harmonizedChordFormulaAtDegree("major", 8, "seventh");
  // @ts-expect-error Ninth harmonization is outside this contract.
  harmonizeCollectionFormulas("major", "ninth");
  const result = harmonizedChordNoteSpellingsAtDegree({ letter: "C", accidental: 0 }, "major", 1, "triad");
  // @ts-expect-error Formula roles are readonly.
  result.formula[0]!.alteration = 1;
  // @ts-expect-error Note spellings are readonly.
  result.noteSpellings[0]!.accidental = 1;
  // @ts-expect-error Metadata is readonly.
  result.degree = 2;
  // @ts-expect-error Results are readonly arrays.
  harmonizeCollectionFormulas("major", "triad").push(result);
}
