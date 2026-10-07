import { expect, test } from "vitest";
import { pitchClassFromSpelling } from "../domain/music-theory/note-spelling.js";
import { parseNoteSpelling, formatRegisteredNote } from "../domain/music-theory/note-text.js";
import { type PitchClass } from "../domain/music-theory/pitch-class.js";
import { registeredPitchFromNote } from "../domain/music-theory/registered-pitch.js";
import { spellingFromPitchClass, noteFromRegisteredPitch } from "../domain/music-theory/spelling-selection.js";

const expectedSharps = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const expectedFlats = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
const classes: readonly PitchClass[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

test.each(classes)("selects and round trips class %i under both policies", (pitchClass) => {
  expect(spellingFromPitchClass(pitchClass, "sharps")).toEqual(parseNoteSpelling(expectedSharps[pitchClass]!));
  expect(spellingFromPitchClass(pitchClass, "flats")).toEqual(parseNoteSpelling(expectedFlats[pitchClass]!));
  for (const policy of ["sharps", "flats"] as const) {
    expect(pitchClassFromSpelling(spellingFromPitchClass(pitchClass, policy))).toBe(pitchClass);
  }
});

test("round trips registered pitches through all classes, policies, and octave boundaries", () => {
  for (const pitch of Array.from({ length: 85 }, (_, index) => index - 25)) {
    for (const policy of ["sharps", "flats"] as const) {
      const note = noteFromRegisteredPitch(pitch, policy);
      expect(registeredPitchFromNote(note)).toBe(pitch);
      expect(policy === "sharps" ? note.accidental >= 0 : note.accidental <= 0).toBe(true);
    }
  }
  expect(formatRegisteredNote(noteFromRegisteredPitch(-1, "sharps"))).toBe("B-1");
  expect(formatRegisteredNote(noteFromRegisteredPitch(48, "flats"))).toBe("C4");
  expect(formatRegisteredNote(noteFromRegisteredPitch(49, "sharps"))).toBe("C♯4");
  expect(formatRegisteredNote(noteFromRegisteredPitch(49, "flats"))).toBe("D♭4");
});

test("respects the registered-note safe-octave-base contract at numerical boundaries", () => {
  const lowestSafeBase = -9007199254740984;
  for (const policy of ["sharps", "flats"] as const) {
    expect(registeredPitchFromNote(noteFromRegisteredPitch(Number.MAX_SAFE_INTEGER, policy)))
      .toBe(Number.MAX_SAFE_INTEGER);
    expect(registeredPitchFromNote(noteFromRegisteredPitch(lowestSafeBase, policy))).toBe(lowestSafeBase);
    expect(() => noteFromRegisteredPitch(Number.MIN_SAFE_INTEGER, policy)).toThrow(RangeError);
    expect(() => noteFromRegisteredPitch(lowestSafeBase - 1, policy)).toThrow(RangeError);
    for (const pitch of [0.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
      expect(() => noteFromRegisteredPitch(pitch, policy)).toThrow(RangeError);
    }
  }
});

test("returns independent spelling objects", () => {
  expect(spellingFromPitchClass(1, "sharps")).not.toBe(spellingFromPitchClass(1, "sharps"));
});

if (false) {
  // @ts-expect-error Reverse conversion requires an explicit spelling policy.
  spellingFromPitchClass(1);
  // @ts-expect-error Registered reverse conversion also requires a policy.
  noteFromRegisteredPitch(49);
  // @ts-expect-error Key names are not supported as spelling policies.
  spellingFromPitchClass(1, "C major");
}
