import {
  type IntervalDirection,
  type IntervalQuality,
  type SpelledInterval,
  validateSpelledInterval,
} from "./spelled-transposition.js";

const compactQualities: Readonly<Record<string, IntervalQuality>> = {
  P: "perfect", M: "major", m: "minor", A: "augmented", d: "diminished",
};
const qualities = ["perfect", "major", "minor", "augmented", "diminished"] as const;
const namedNumbers = {
  unison: 1, second: 2, third: 3, fourth: 4, fifth: 5, sixth: 6, seventh: 7,
  octave: 8, ninth: 9, tenth: 10, eleventh: 11, twelfth: 12,
  thirteenth: 13, fourteenth: 14, fifteenth: 15,
} as const;

/**
 * Parse compact (m3 up), named (minor third down), or numeric (major 9 up)
 * interval text. Direction is required; full words are case-insensitive.
 */
export function parseSpelledInterval(text: string): SpelledInterval {
  const tokens = text.trim().split(/\s+/u);
  if (tokens.length !== 2 && tokens.length !== 3) {
    throw new SyntaxError("Expected a qualified interval followed by up or down.");
  }
  const directionText = tokens[tokens.length - 1]!.toLowerCase();
  if (directionText !== "up" && directionText !== "down") {
    throw new SyntaxError("Interval direction must be up or down.");
  }
  const direction: IntervalDirection = directionText;
  let quality: IntervalQuality;
  let number: number;

  if (tokens.length === 2) {
    const match = /^([PMmAd])([0-9]+)$/u.exec(tokens[0]!);
    if (!match) {
      throw new SyntaxError("Expected P, M, m, A, or d followed by a decimal interval number.");
    }
    quality = compactQualities[match[1]!]!;
    number = Number(match[2]);
  } else {
    const qualityText = tokens[0]!.toLowerCase();
    const matchedQuality = qualities.find((candidate) => candidate === qualityText);
    if (matchedQuality === undefined) {
      throw new SyntaxError("Expected perfect, major, minor, augmented, or diminished quality.");
    }
    quality = matchedQuality;

    const numberText = tokens[1]!.toLowerCase();
    if (Object.hasOwn(namedNumbers, numberText)) {
      number = namedNumbers[numberText as keyof typeof namedNumbers];
    } else if (/^[0-9]+$/u.test(numberText)) {
      number = Number(numberText);
    } else {
      throw new SyntaxError("Expected an interval name from unison through fifteenth, or a decimal number.");
    }
  }

  const interval: SpelledInterval = { number, quality, direction };
  // Validate the interval itself, without imposing the limits of a particular note.
  validateSpelledInterval(interval);
  return interval;
}
