import { type PitchClass } from "../pitch-pitch-classes-and-spelling/pitch-class.js";
import { type NoteSpelling, pitchClassFromSpelling } from "../pitch-pitch-classes-and-spelling/note-spelling.js";
import {
  type RegisteredPitch, registeredPitchFromNote, pitchClassFromRegisteredPitch,
} from "../pitch-pitch-classes-and-spelling/registered-pitch.js";
import { type ChordFormula } from "./chord-formulas.js";
import {
  type PitchClassChordDescription, createPitchClassChordDescription, chordDescriptionPitchClasses,
} from "./chord-descriptions.js";
import { type TriadQuality, triadFormula } from "./triads.js";
import { type SeventhChordQuality, seventhChordFormula } from "./seventh-chords.js";
import { type AddedToneChordQuality, addedToneChordFormula } from "./added-tone-chords.js";
import { type ExtendedChordQuality, extendedChordFormula } from "./extended-chords.js";
import {
  type RegisteredPitchVoicing, type RegisteredNoteVoicing,
  createRegisteredPitchVoicing, createRegisteredNoteVoicing,
} from "./registered-chords.js";

export type ChordIdentificationCandidate = Readonly<{ description: PitchClassChordDescription }> & (
  | Readonly<{ family: "triad"; quality: TriadQuality }>
  | Readonly<{ family: "seventh"; quality: SeventhChordQuality }>
  | Readonly<{ family: "added-tone"; quality: AddedToneChordQuality }>
  | Readonly<{ family: "extended"; quality: ExtendedChordQuality }>
);

export type RegisteredChordIdentificationCandidate = ChordIdentificationCandidate & Readonly<{
  bassFormulaIndices: readonly number[];
}>;

export type RegisteredChordIdentification = Readonly<{
  /** Observed bass, not a specified-bass constraint on candidate descriptions. */
  bass: Readonly<{ pitch: RegisteredPitch; pitchClass: PitchClass; toneIndices: readonly number[] }>;
  candidates: readonly RegisteredChordIdentificationCandidate[];
}>;

// Exhaustive identifiers only: musical definitions remain in the catalog getters.
const triadQualities: Readonly<Record<TriadQuality, true>> = {
  major: true, minor: true, diminished: true, augmented: true, sus2: true, sus4: true,
};
const seventhQualities: Readonly<Record<SeventhChordQuality, true>> = {
  "major-seventh": true, "dominant-seventh": true, "minor-seventh": true,
  "half-diminished-seventh": true, "diminished-seventh": true, "minor-major-seventh": true,
  "augmented-major-seventh": true, "augmented-seventh": true,
  "dominant-seventh-sus2": true, "dominant-seventh-sus4": true,
};
const addedToneQualities: Readonly<Record<AddedToneChordQuality, true>> = {
  "major-add2": true, "major-add9": true, "minor-add9": true, "major-add11": true,
  "major-sixth": true, "minor-sixth": true, "major-sixth-ninth": true,
};
const extendedQualities: Readonly<Record<ExtendedChordQuality, true>> = {
  "dominant-ninth": true, "major-ninth": true, "minor-ninth": true,
  "dominant-eleventh": true, "major-eleventh": true, "minor-eleventh": true,
  "dominant-thirteenth": true, "major-thirteenth": true, "minor-thirteenth": true,
  "dominant-flat-ninth": true, "dominant-sharp-ninth": true, "dominant-sharp-eleventh": true,
  "dominant-flat-thirteenth": true, "major-sharp-eleventh": true,
};

function entriesFor<F extends string, Q extends string>(
  family: F, qualities: Readonly<Record<Q, true>>, formulaFor: (quality: Q) => ChordFormula,
) {
  return (Object.keys(qualities) as Q[]).sort().map((quality) => ({ family, quality, formula: formulaFor(quality) }));
}

function requireCollection(tones: readonly unknown[]): void {
  if (!Array.isArray(tones) || tones.length === 0) {
    throw new RangeError("Chord identification requires a nonempty array of notes.");
  }
}

function pitchClassMask(pitchClasses: readonly PitchClass[]): number {
  requireCollection(pitchClasses);
  let mask = 0;
  // Iteration visits sparse slots; validate before bit shifts can coerce bad values.
  for (const pitchClass of pitchClasses) {
    if (!Number.isInteger(pitchClass) || pitchClass < 0 || pitchClass > 11) {
      throw new RangeError("Identification pitch classes must be integers in 0..11.");
    }
    mask |= 1 << pitchClass;
  }
  return mask;
}

const definitions = [
  ...entriesFor("triad", triadQualities, triadFormula),
  ...entriesFor("seventh", seventhQualities, seventhChordFormula),
  ...entriesFor("added-tone", addedToneQualities, addedToneChordFormula),
  ...entriesFor("extended", extendedQualities, extendedChordFormula),
];
const roots: readonly PitchClass[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const catalog = roots.flatMap((root) => definitions.map(({ formula, ...identity }) => {
  const description = createPitchClassChordDescription(root, formula);
  return { ...identity, description, mask: pitchClassMask(chordDescriptionPitchClasses(description)) };
}));

/** Exact sets only; enumeration order expresses no confidence or preferred interpretation. */
export function identifyChordsFromPitchClasses(pitchClasses: readonly PitchClass[]): readonly ChordIdentificationCandidate[] {
  const mask = pitchClassMask(pitchClasses);
  return catalog.filter((entry) => entry.mask === mask).map(({ mask: _mask, description, ...identity }) => ({
    ...identity, description: createPitchClassChordDescription(description.root, description.formula),
  }));
}

/** Supplied spelling does not filter identities or select a candidate's enharmonic root name. */
export function identifyChordsFromNoteSpellings(notes: readonly NoteSpelling[]): readonly ChordIdentificationCandidate[] {
  requireCollection(notes);
  const classes: PitchClass[] = [];
  for (const note of notes) {
    if (note === null || typeof note !== "object") {
      throw new RangeError("Chord identification requires note spelling entries.");
    }
    classes.push(pitchClassFromSpelling(note));
  }
  return identifyChordsFromPitchClasses(classes);
}

function identifyRegistered(pitches: readonly RegisteredPitch[]): RegisteredChordIdentification {
  const classes = pitches.map(pitchClassFromRegisteredPitch);
  let lowest = pitches[0]!;
  // Compare coordinates without subtracting endpoints or computing an unsafe span.
  for (const pitch of pitches) if (pitch < lowest) lowest = pitch;
  const bassClass = pitchClassFromRegisteredPitch(lowest);
  return {
    bass: {
      pitch: lowest, pitchClass: bassClass,
      toneIndices: pitches.flatMap((pitch, index) => pitch === lowest ? [index] : []),
    },
    candidates: identifyChordsFromPitchClasses(classes).map((candidate) => ({
      ...candidate,
      bassFormulaIndices: chordDescriptionPitchClasses(candidate.description)
        .flatMap((pitchClass, index) => pitchClass === bassClass ? [index] : []),
    })),
  };
}

/** Registered order and duplicates affect bass evidence, never exact-set candidate matching. */
export function identifyChordsFromRegisteredPitches(voicing: RegisteredPitchVoicing): RegisteredChordIdentification {
  return identifyRegistered(createRegisteredPitchVoicing(voicing?.pitches).pitches);
}

/** Retain tied source indices even when lowest supplied notes use different spellings. */
export function identifyChordsFromRegisteredNotes(voicing: RegisteredNoteVoicing): RegisteredChordIdentification {
  const { notes } = createRegisteredNoteVoicing(voicing?.notes);
  return identifyRegistered(notes.map(registeredPitchFromNote));
}
