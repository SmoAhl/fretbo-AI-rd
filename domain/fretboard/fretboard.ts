import {
  type RegisteredPitch,
  pitchClassFromRegisteredPitch,
  transposeRegisteredPitch,
} from "../music-theory/pitch-pitch-classes-and-spelling/registered-pitch.js";
import { type PitchClass } from "../music-theory/pitch-pitch-classes-and-spelling/pitch-class.js";

/** Stable identity, independent of tuning, array order, or presentation. */
export type StringId = number;

export type FretboardString = Readonly<{
  id: StringId;
  /** Physical ordinal 1..string count, from the designated first-string edge.
   * Conventional guitar: from the standard high-E edge toward the low-E edge,
   * independent of actual tuning, input order, IDs, handedness or display.
   * Consecutive positions are adjacent strings; this is not a distance.
   */
  position: number;
  openPitch: RegisteredPitch;
}>;

/** Available frets are 0 (open) through fretCount, inclusive. */
export type Fretboard = Readonly<{
  strings: readonly FretboardString[];
  fretCount: number;
}>;

export type FretboardLocation = Readonly<{
  stringId: StringId;
  fret: number;
}>;

export type FretboardPitchLocation = FretboardLocation & Readonly<{
  pitch: RegisteredPitch;
}>;

export type FretRange = Readonly<{
  min: number;
  max: number;
}>;

export type FretboardSearchRegion = Readonly<{
  stringIds?: readonly StringId[] | undefined;
  frets?: FretRange | undefined;
}>;

/** Allocation limit, independent of the board's valid coordinate range. */
export const MAX_FRETBOARD_SEARCH_RESULTS = 10_000;

function assertRecord(value: unknown, name: string): asserts value is Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new RangeError(`${name} must be a record.`);
  }
}

function assertNonnegativeInteger(value: unknown, name: string): asserts value is number {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0) {
    throw new RangeError(`${name} must be a nonnegative safe integer.`);
  }
}

function assertStringId(value: unknown): asserts value is StringId {
  assertNonnegativeInteger(value, "String ID");
  if (value === 0) throw new RangeError("String ID must be positive.");
}

function validateBoard(board: Fretboard): void {
  assertRecord(board, "Fretboard");
  assertNonnegativeInteger(board.fretCount, "Fret count");
  if (!Array.isArray(board.strings) || board.strings.length === 0) {
    throw new RangeError("Strings must be a nonempty dense array.");
  }
  const ids = new Set<StringId>();
  const positions = new Set<number>();
  for (let index = 0; index < board.strings.length; index += 1) {
    if (!Object.hasOwn(board.strings, index)) {
      throw new RangeError("Strings must be a dense array.");
    }
    const string = board.strings[index];
    assertRecord(string, "String");
    assertStringId(string.id);
    if (ids.has(string.id)) throw new RangeError("String IDs must be unique.");
    ids.add(string.id);
    assertNonnegativeInteger(string.position, "String position");
    if (string.position === 0 || string.position > board.strings.length || positions.has(string.position)) {
      throw new RangeError("String positions must cover 1 through string count exactly once.");
    }
    // N distinct positions in 1..N guarantee completeness without enumerating a range.
    positions.add(string.position);
    if (typeof string.openPitch !== "number") {
      throw new RangeError("Open pitch must be a safe integer.");
    }
    // Validate open and highest pitch; every intermediate pitch is then safe.
    transposeRegisteredPitch(string.openPitch, board.fretCount);
  }
}

/** Copy explicit tuning into canonical ID order; no instrument defaults. */
export function createFretboard(
  strings: readonly FretboardString[],
  fretCount: number,
): Fretboard {
  const board = { strings, fretCount };
  validateBoard(board);
  return {
    strings: strings.map(({ id, position, openPitch }) => ({ id, position, openPitch }))
      .sort((a, b) => a.id - b.id),
    fretCount,
  };
}

/** Calculate a sounding coordinate at an available identified location. */
export function registeredPitchAtLocation(
  board: Fretboard,
  location: FretboardLocation,
): RegisteredPitch {
  validateBoard(board);
  assertRecord(location, "Location");
  assertStringId(location.stringId);
  assertNonnegativeInteger(location.fret, "Fret");
  if (location.fret > board.fretCount) throw new RangeError("Fret is outside the board.");
  const string = board.strings.find(({ id }) => id === location.stringId);
  if (string === undefined) throw new RangeError("String ID is not on the board.");
  return transposeRegisteredPitch(string.openPitch, location.fret);
}

function searchRegion(board: Fretboard, region: FretboardSearchRegion | undefined) {
  let min = 0;
  let max = board.fretCount;
  let selectedIds: Set<StringId> | undefined;
  if (region !== undefined) {
    assertRecord(region, "Search region");
    if (region.frets !== undefined) {
      assertRecord(region.frets, "Fret range");
      min = region.frets.min;
      max = region.frets.max;
      assertNonnegativeInteger(min, "Minimum fret");
      assertNonnegativeInteger(max, "Maximum fret");
      if (min > max || max > board.fretCount) {
        throw new RangeError("Fret range must be ordered and within the board.");
      }
    }
    if (region.stringIds !== undefined) {
      if (!Array.isArray(region.stringIds)) throw new RangeError("String IDs must be a dense array.");
      const existingIds = new Set(board.strings.map(({ id }) => id));
      selectedIds = new Set();
      for (let index = 0; index < region.stringIds.length; index += 1) {
        if (!Object.hasOwn(region.stringIds, index)) throw new RangeError("String IDs must be a dense array.");
        const id: unknown = region.stringIds[index];
        assertStringId(id);
        if (!existingIds.has(id) || selectedIds.has(id)) {
          throw new RangeError("Selected string IDs must exist and be distinct.");
        }
        selectedIds.add(id);
      }
    }
  }
  const strings = board.strings.filter(({ id }) => selectedIds === undefined || selectedIds.has(id))
    .sort((a, b) => a.id - b.id);
  return { strings, min: BigInt(min), max: BigInt(max) };
}

function assertResultCount(count: bigint): void {
  if (count > BigInt(MAX_FRETBOARD_SEARCH_RESULTS)) {
    throw new RangeError(`Search exceeds ${MAX_FRETBOARD_SEARCH_RESULTS} locations.`);
  }
}

/** All alternatives for one exact registered pitch, ordered by string ID. */
export function findRegisteredPitchLocations(
  board: Fretboard,
  pitch: RegisteredPitch,
  region?: FretboardSearchRegion,
): readonly FretboardPitchLocation[] {
  validateBoard(board);
  transposeRegisteredPitch(pitch, 0);
  const { strings, min, max } = searchRegion(board, region);
  const target = BigInt(pitch);
  let count = 0n;
  for (const { openPitch } of strings) {
    const fret = target - BigInt(openPitch);
    if (fret >= min && fret <= max) count += 1n;
  }
  assertResultCount(count);
  const results: FretboardPitchLocation[] = [];
  for (const { id, openPitch } of strings) {
    // Valid endpoints can have an unsafe Number difference. Convert only a match.
    const fret = target - BigInt(openPitch);
    if (fret >= min && fret <= max) {
      results.push({ stringId: id, fret: Number(fret), pitch });
    }
  }
  return results;
}

/** All matching registers, ordered by string ID then fret; these are alternatives. */
export function findPitchClassLocations(
  board: Fretboard,
  pitchClass: PitchClass,
  region?: FretboardSearchRegion,
): readonly FretboardPitchLocation[] {
  validateBoard(board);
  if (!Number.isInteger(pitchClass) || pitchClass < 0 || pitchClass > 11) {
    throw new RangeError("Pitch class must be an integer in 0..11.");
  }
  const { strings, min, max } = searchRegion(board, region);
  const firstFret = (openPitch: RegisteredPitch): bigint => {
    const lowerClass = pitchClassFromRegisteredPitch(transposeRegisteredPitch(openPitch, Number(min)));
    return min + BigInt((pitchClass - lowerClass + 12) % 12);
  };
  let count = 0n;
  for (const { openPitch } of strings) {
    const first = firstFret(openPitch);
    if (first <= max) count += (max - first) / 12n + 1n;
  }
  assertResultCount(count);
  const results: FretboardPitchLocation[] = [];
  for (const { id, openPitch } of strings) {
    // Exact stepping also avoids rounding the first out-of-range fret at MAX_SAFE_INTEGER.
    for (let fret = firstFret(openPitch); fret <= max; fret += 12n) {
      const numericFret = Number(fret);
      results.push({
        stringId: id,
        fret: numericFret,
        pitch: transposeRegisteredPitch(openPitch, numericFret),
      });
    }
  }
  return results;
}
