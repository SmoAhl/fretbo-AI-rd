import { describe, expect, test } from "vitest";
import { degreeFormulas } from "../domain/music-theory/degrees.js";
import {
  type Key, type KeyMode, type KeySignatureAccidental,
  createKey, keySignature, parallelKey, relativeKey,
} from "../domain/music-theory/keys.js";
import { type Accidental, type NoteSpelling, pitchClassFromSpelling } from "../domain/music-theory/note-spelling.js";
import { formatNoteSpelling, parseNoteSpelling } from "../domain/music-theory/note-text.js";
import { scaleNoteSpellings } from "../domain/music-theory/scales.js";
import { parseScaleType } from "../domain/music-theory/scale-text.js";

const letters = ["C", "D", "E", "F", "G", "A", "B"] as const;
const accidentals = [-2, -1, 0, 1, 2] as const;
const modes = ["major", "minor"] as const;
const identities: readonly (readonly [NoteSpelling, KeyMode])[] = letters.flatMap((letter) =>
  accidentals.flatMap((accidental) => modes.map((mode) => [Object.freeze({ letter, accidental }), mode] as const)));

// Independent conventional pairs and exact signature order; zero has no altered letters.
const conventionalPairs = [
  ["Cb", "Ab", "BEADGCF", -1], ["Gb", "Eb", "BEADGC", -1],
  ["Db", "Bb", "BEADG", -1], ["Ab", "F", "BEAD", -1],
  ["Eb", "C", "BEA", -1], ["Bb", "G", "BE", -1], ["F", "D", "B", -1],
  ["C", "A", "", 0],
  ["G", "E", "F", 1], ["D", "B", "FC", 1], ["A", "F#", "FCG", 1],
  ["E", "C#", "FCGD", 1], ["B", "G#", "FCGDA", 1],
  ["F#", "D#", "FCGDAE", 1], ["C#", "A#", "FCGDAEB", 1],
] as const;
const invalidModes = ["natural-minor", "harmonic-minor", "melodic-minor-ascending", "dorian", "ionian", "aeolian", "Major", "", undefined, null, 0] as const;

describe("explicit key identity", () => {
  for (const [tonic, mode] of identities) {
    test(`creates ${formatNoteSpelling(tonic, "ascii")} ${mode} without constructing a collection`, () => {
      const key = createKey(tonic, mode);
      expect(key).toEqual({ tonic, mode });
      expect(Object.keys(key)).toEqual(["tonic", "mode"]);
      expect(key.tonic).not.toBe(tonic);
      expect(tonic).toEqual({ letter: tonic.letter, accidental: tonic.accidental });
    });
  }

  test("preserves enharmonic identity rather than canonicalizing the tonic", () => {
    const sharp = createKey(parseNoteSpelling("F#"), "major");
    const flat = createKey(parseNoteSpelling("Gb"), "major");
    expect(pitchClassFromSpelling(sharp.tonic)).toBe(pitchClassFromSpelling(flat.tonic));
    expect(sharp).not.toEqual(flat);
  });

  test("returns independent keys and tonic objects", () => {
    const tonic = Object.freeze(parseNoteSpelling("B"));
    const first = createKey(tonic, "minor");
    const second = createKey(tonic, "minor");
    expect(first).not.toBe(second);
    expect(first.tonic).not.toBe(second.tonic);
    expect(Object.isFrozen(first)).toBe(false);
    expect(Object.isFrozen(first.tonic)).toBe(false);
    (first.tonic as { accidental: Accidental }).accidental = 1;
    (first as { mode: KeyMode }).mode = "major";
    expect(second).toEqual({ tonic: { letter: "B", accidental: 0 }, mode: "minor" });
    expect(tonic).toEqual({ letter: "B", accidental: 0 });
  });

  test.each(invalidModes)("rejects unsupported runtime mode %s", (mode) => {
    expect(() => createKey(parseNoteSpelling("C"), mode as KeyMode)).toThrow(RangeError);
  });
});

const signatureCases = conventionalPairs.flatMap(([major, minor, signatureLetters, accidental]) =>
  modes.map((mode) => ({
    tonic: parseNoteSpelling(mode === "major" ? major : minor),
    mode,
    expected: [...signatureLetters].map((letter) => ({ letter, accidental })),
  })));

describe("conventional key signatures", () => {
  for (const [tonic, mode] of identities) {
    const fixture = signatureCases.find((candidate) => candidate.mode === mode
      && candidate.tonic.letter === tonic.letter && candidate.tonic.accidental === tonic.accidental);
    test(`${formatNoteSpelling(tonic, "ascii")} ${mode}: ${fixture ? "supported" : "unsupported"} signature`, () => {
      const key = Object.freeze({ tonic, mode });
      if (fixture) {
        const signature = keySignature(key);
        expect(signature).toEqual(fixture.expected);
        expect(signature).toHaveLength(fixture.expected.length);
        expect(signature.length).toBeLessThanOrEqual(7);
        expect(new Set(signature.map((note) => note.letter)).size).toBe(signature.length);
      } else {
        expect(() => keySignature(key)).toThrow(RangeError);
      }
      expect(key).toEqual({ tonic, mode });
    });
  }

  test("fixtures cover exactly 30 of the 70 identities", () => {
    expect(signatureCases).toHaveLength(30);
    expect(identities).toHaveLength(70);
    const supported = identities.filter(([tonic, mode]) => signatureCases.some((candidate) => candidate.mode === mode
      && candidate.tonic.letter === tonic.letter && candidate.tonic.accidental === tonic.accidental));
    expect(supported).toHaveLength(30);
    expect(identities.length - supported.length).toBe(40);
  });

  test("preserves six-sharp/six-flat signatures for enharmonic major keys", () => {
    const sharp = keySignature(createKey(parseNoteSpelling("F#"), "major"));
    const flat = keySignature(createKey(parseNoteSpelling("Gb"), "major"));
    expect(sharp.map((note) => formatNoteSpelling(note, "ascii"))).toEqual(["F#", "C#", "G#", "D#", "A#", "E#"]);
    expect(flat.map((note) => formatNoteSpelling(note, "ascii"))).toEqual(["Bb", "Eb", "Ab", "Db", "Gb", "Cb"]);
  });

  test("signature limits do not restrict key identity", () => {
    const key = createKey(parseNoteSpelling("Cb"), "minor");
    expect(key).toEqual({ tonic: { letter: "C", accidental: -1 }, mode: "minor" });
    expect(() => keySignature(key)).toThrow(RangeError);
  });

  test("minor-key signature is independent of separately chosen minor collections", () => {
    const tonic = Object.freeze(parseNoteSpelling("B"));
    const key = Object.freeze(createKey(tonic, "minor"));
    for (const type of ["natural-minor", "harmonic-minor", "melodic-minor-ascending"] as const) {
      const notes = scaleNoteSpellings(tonic, type);
      expect(formatNoteSpelling(notes[6]!, "ascii")).toBe(type === "natural-minor" ? "A" : "A#");
      expect(keySignature(key)).toEqual([{ letter: "F", accidental: 1 }, { letter: "C", accidental: 1 }]);
    }
    expect(Object.keys(key)).toEqual(["tonic", "mode"]);
  });

  test("returns independent arrays and entries without runtime freezing", () => {
    const tonic = Object.freeze(parseNoteSpelling("D"));
    const key = Object.freeze({ tonic, mode: "major" } as const);
    const first = keySignature(key);
    const second = keySignature(key);
    expect(first).not.toBe(second);
    expect(first[0]).not.toBe(second[0]);
    expect(Object.isFrozen(first)).toBe(false);
    expect(Object.isFrozen(first[0])).toBe(false);
    (first[0] as { accidental: -1 | 1 }).accidental = -1;
    expect(second).toEqual([{ letter: "F", accidental: 1 }, { letter: "C", accidental: 1 }]);
    expect(key).toEqual({ tonic: { letter: "D", accidental: 0 }, mode: "major" });
    const emptyKey = createKey(parseNoteSpelling("C"), "major");
    expect(keySignature(emptyKey)).not.toBe(keySignature(emptyKey));
  });

  test.each(invalidModes)("rejects unsupported mode %s before signature construction", (mode) => {
    expect(() => keySignature({ tonic: parseNoteSpelling("C"), mode: mode as KeyMode })).toThrow(RangeError);
  });
});

const naturalCoordinates = [0, 2, 4, 5, 7, 9, 11] as const;
function expectedRelative(tonic: NoteSpelling, mode: KeyMode) {
  const sourceIndex = letters.indexOf(tonic.letter);
  const targetIndex = sourceIndex + (mode === "major" ? 5 : 2);
  const displacement = mode === "major" ? 9 : 3;
  const targetNatural = naturalCoordinates[targetIndex % 7]! + 12 * Math.floor(targetIndex / 7);
  return {
    tonic: {
      letter: letters[targetIndex % 7]!,
      accidental: naturalCoordinates[sourceIndex]! + tonic.accidental + displacement - targetNatural,
    },
    mode: mode === "major" ? "minor" : "major",
  };
}

describe("relative and parallel key relationships", () => {
  for (const [tonic, mode] of identities) {
    const name = `${formatNoteSpelling(tonic, "ascii")} ${mode}`;
    test(`${name} relative preserves spelling or rejects an unrepresentable tonic`, () => {
      const key = Object.freeze({ tonic, mode });
      const expected = expectedRelative(tonic, mode);
      if (Math.abs(expected.tonic.accidental) > 2) {
        expect(() => relativeKey(key)).toThrow(RangeError);
      } else {
        const result = relativeKey(key);
        expect(result).toEqual(expected);
        expect(relativeKey(Object.freeze(result))).toEqual(key);
      }
      expect(key).toEqual({ tonic, mode });
    });

    test(`${name} parallel preserves its tonic and round-trips`, () => {
      const key = Object.freeze({ tonic, mode });
      const result = parallelKey(key);
      expect(result).toEqual({ tonic, mode: mode === "major" ? "minor" : "major" });
      expect(result.tonic).not.toBe(tonic);
      expect(parallelKey(Object.freeze(result))).toEqual(key);
      expect(key).toEqual({ tonic, mode });
    });
  }

  test.each(conventionalPairs)("relative pair %s major / %s minor shares a signature", (major, minor) => {
    const majorKey = Object.freeze(createKey(parseNoteSpelling(major), "major"));
    const minorKey = Object.freeze(createKey(parseNoteSpelling(minor), "minor"));
    expect(relativeKey(majorKey)).toEqual(minorKey);
    expect(relativeKey(minorKey)).toEqual(majorKey);
    expect(keySignature(majorKey)).toEqual(keySignature(minorKey));
  });

  test("64 representable relationships and six representation failures match independent expectations", () => {
    const unsupported = identities.filter(([tonic, mode]) => Math.abs(expectedRelative(tonic, mode).tonic.accidental) > 2);
    expect(identities.length - unsupported.length).toBe(64);
    expect(unsupported.map(([tonic, mode]) => `${formatNoteSpelling(tonic, "ascii")} ${mode}`))
      .toEqual(["Cbb minor", "E## major", "Fbb minor", "Gbb minor", "A## major", "B## major"]);
  });

  test("parallel C-flat minor exists even though its signature is unsupported", () => {
    const major = createKey(parseNoteSpelling("Cb"), "major");
    const minor = parallelKey(major);
    expect(minor).toEqual({ tonic: { letter: "C", accidental: -1 }, mode: "minor" });
    expect(keySignature(major)).toHaveLength(7);
    expect(() => keySignature(minor)).toThrow(RangeError);
  });

  test("relative B-sharp major / G-double-sharp minor does not check signatures", () => {
    const major = createKey(parseNoteSpelling("B#"), "major");
    const minor = relativeKey(major);
    expect(minor).toEqual({ tonic: { letter: "G", accidental: 2 }, mode: "minor" });
    expect(relativeKey(minor)).toEqual(major);
    expect(() => keySignature(major)).toThrow(RangeError);
    expect(() => keySignature(minor)).toThrow(RangeError);
  });

  test("relative B-double-sharp major remains a representation-limit RangeError", () => {
    const major = createKey(parseNoteSpelling("B##"), "major");
    expect(() => relativeKey(major)).toThrow(RangeError);
    expect(() => relativeKey(major)).toThrow("accidental outside -2..2");
  });

  test("relationship results do not alias each other or the source key", () => {
    const tonic = Object.freeze(parseNoteSpelling("D"));
    const key = Object.freeze({ tonic, mode: "major" } as const);
    for (const relationship of [relativeKey, parallelKey]) {
      const first = relationship(key);
      const second = relationship(key);
      const expected = relationship(key);
      expect(first).not.toBe(second);
      expect(first.tonic).not.toBe(second.tonic);
      expect(first.tonic).not.toBe(tonic);
      expect(Object.isFrozen(first)).toBe(false);
      expect(Object.isFrozen(first.tonic)).toBe(false);
      (first.tonic as { accidental: Accidental }).accidental = -2;
      (first as { mode: KeyMode }).mode = "major";
      expect(second).toEqual(expected);
      expect(key).toEqual({ tonic: { letter: "D", accidental: 0 }, mode: "major" });
    }
  });

  test.each(invalidModes)("both relationships reject unsupported runtime mode %s", (mode) => {
    const key = { tonic: parseNoteSpelling("C"), mode: mode as KeyMode };
    expect(() => relativeKey(key)).toThrow(RangeError);
    expect(() => parallelKey(key)).toThrow(RangeError);
  });

  test("minor-key identity adds no bare-minor scale parsing or degree-selector support", () => {
    expect(createKey(parseNoteSpelling("B"), "minor").mode).toBe("minor");
    expect(() => parseScaleType("minor")).toThrow(SyntaxError);
  });
});

if (false) {
  // @ts-expect-error Key mode is required; no major/minor default is inferred.
  createKey({ letter: "C", accidental: 0 });
  // @ts-expect-error Keys require explicit spelling, not a pitch class.
  createKey(0, "major");
  // @ts-expect-error Tonic accidental is required even for natural letters.
  createKey({ letter: "C" }, "major");
  // @ts-expect-error A fixed collection is not a minor-key identity.
  createKey({ letter: "C", accidental: 0 }, "harmonic-minor");
  // @ts-expect-error Triple accidentals remain deferred.
  createKey({ letter: "C", accidental: 3 }, "major");
  const key: Key = createKey({ letter: "C", accidental: 0 }, "major");
  // @ts-expect-error Key identity is readonly.
  key.mode = "minor";
  // @ts-expect-error Nested tonic spelling is readonly.
  key.tonic.accidental = 1;
  const signature = keySignature(key);
  // @ts-expect-error Signature arrays are readonly.
  signature.push({ letter: "F", accidental: 1 });
  // @ts-expect-error Signature entries are readonly.
  signature[0]!.accidental = -1;
  // @ts-expect-error Signature entries contain altered letters only.
  const natural: KeySignatureAccidental = { letter: "F", accidental: 0 };
  // @ts-expect-error Double accidentals are not conventional signature entries.
  const double: KeySignatureAccidental = { letter: "F", accidental: 2 };
  // @ts-expect-error Relative lookup requires key identity, not a scale type.
  relativeKey("natural-minor");
  // @ts-expect-error Parallel lookup requires explicit key mode.
  parallelKey({ tonic: { letter: "C", accidental: 0 } });
  // @ts-expect-error Keys remain separate from scale/mode degree selectors.
  degreeFormulas(key);
}
