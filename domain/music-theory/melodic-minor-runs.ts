import { type RegisteredNote, type RegisteredPitch } from "./registered-pitch.js";
import {
  type ScaleRunOptions,
  scaleRegisteredNotes,
  scaleRegisteredPitches,
} from "./scale-runs.js";

export type MelodicMinorConvention = "fixed-collection" | "classical-exercise";
export type MelodicMinorRunOptions = ScaleRunOptions & Readonly<{
  convention: MelodicMinorConvention;
}>;

function collectionFor(options: MelodicMinorRunOptions): "melodic-minor-ascending" | "natural-minor" {
  if (options.convention !== "fixed-collection" && options.convention !== "classical-exercise") {
    throw new RangeError("Melodic-minor convention must be fixed-collection or classical-exercise.");
  }
  return options.convention === "classical-exercise" && options.direction === "down"
    ? "natural-minor" : "melodic-minor-ascending";
}

/** Generate one directional leg using the explicitly selected melodic-minor convention. */
export function melodicMinorRegisteredPitches(
  tonic: RegisteredPitch,
  options: MelodicMinorRunOptions,
): readonly RegisteredPitch[] {
  return scaleRegisteredPitches(tonic, collectionFor(options), options);
}

/** Preserve the selected leg's degree spellings and written register. */
export function melodicMinorRegisteredNotes(
  tonic: RegisteredNote,
  options: MelodicMinorRunOptions,
): readonly RegisteredNote[] {
  return scaleRegisteredNotes(tonic, collectionFor(options), options);
}
