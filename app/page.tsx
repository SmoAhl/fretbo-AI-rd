import type { FretboardString } from "../domain/fretboard/fretboard.js";

import { formatRegisteredNote } from "@/domain/music-theory/pitch-pitch-classes-and-spelling/note-text";
import { noteFromRegisteredPitch } from "@/domain/music-theory/pitch-pitch-classes-and-spelling/spelling-selection";
import { calculateFretWireBoundaries, FINAL_FRET_WIDTH_RATIO, FRET_COUNT } from "./fret-wire-layout";
import { positionNoteLabels } from "./note-label-layout";
import { sparseNoteFixture } from "./sparse-note-fixture";

const fretStart = 52;
const fretSpan = 1180 - fretStart;
const firstFretSpaceWidth = (2 * fretSpan) / (FRET_COUNT * (1 + FINAL_FRET_WIDTH_RATIO));
const fretBoundaries = calculateFretWireBoundaries(
  fretStart,
  firstFretSpaceWidth,
  FRET_COUNT,
  FINAL_FRET_WIDTH_RATIO,
);
const landmarkFrets = [3, 5, 7, 9, 12, 15, 17] as const;
const landmarkPositions = landmarkFrets.reduce<{ fret: number; x: number; y: number }[]>((positions, fret) => {
  const left = fretBoundaries[fret - 1]!;
  const right = fretBoundaries[fret]!;
  const center = (left + right) / 2;

  positions.push({ fret, x: center, y: fret === 12 ? 88 : 120 });
  if (fret === 12) positions.push({ fret, x: center, y: 152 });
  return positions;
}, []);

const strings: readonly FretboardString[] = [
  { id: 1, position: 1, openPitch: 52 }, // E4
  { id: 2, position: 2, openPitch: 47 }, // B3
  { id: 3, position: 3, openPitch: 43 }, // G3
  { id: 4, position: 4, openPitch: 38 }, // D3
  { id: 5, position: 5, openPitch: 33 }, // A2
  { id: 6, position: 6, openPitch: 28 }, // E2
];
const stringRows = new Map(strings.map(({ id, position }) => [id, 40 + (position - 1) * 32]));
const openStringCenter = (-24 + 20) / 2;
const sparseNotePositions = positionNoteLabels(sparseNoteFixture, stringRows, fretBoundaries, openStringCenter);

function Fretboard({ portrait = false, showSparseNotes = false }: { portrait?: boolean; showSparseNotes?: boolean }) {
  return (
    <svg viewBox={portrait ? "0 0 240 1248" : "-24 0 1248 240"} role="img" aria-label="Fretboard neck"
      className={portrait ? "mx-auto block h-[936px] w-[180px]" : "block h-auto w-full"}>
      <g transform={portrait ? "translate(240 24) rotate(90)" : undefined}>
        <rect x="20" y="20" width="1160" height="200" fill="#4A2C25" />
        <rect x="20" y="20" width="32" height="200" fill="#E8DCC2" />
        {fretBoundaries.map((x, index) => (
          <line key={index} data-fret-wire={index}
            x1={x} x2={x} y1="20" y2="220" stroke="#B8B6B2" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        ))}
        {landmarkPositions.map(({ fret, x, y }, index) => (
          <circle key={`${fret}-${index}`} data-landmark-fret={fret}
            cx={x} cy={y} r="7" fill="#D5C4A1" />
        ))}
        {strings.map(({ id, position, openPitch }) => {
          const y = 40 + (position - 1) * 32;
          const strokeWidth = 1 + (position - 1) * 0.5;
          return (
            <g key={id}>
              {!showSparseNotes && (
                <>
                  <circle data-open-string-label cx={openStringCenter} cy={y} r="15" fill="#41362E" />
                  <text x={openStringCenter} y={y} textAnchor="middle" dominantBaseline="central" fontSize="18" fill="white">
                    {formatRegisteredNote(noteFromRegisteredPitch(openPitch, "sharps"))}
                  </text>
                </>
              )}
              <line data-string-id={id} x1="20" x2="1180" y1={y} y2={y}
                stroke="silver" strokeWidth={strokeWidth} vectorEffect="non-scaling-stroke" />
            </g>
          );
        })}
        {showSparseNotes && sparseNotePositions.map(({ stringId, fret, text, x, y }) => (
          <g key={`${stringId}-${fret}`} data-note-label data-note-string-id={stringId} data-note-fret={fret}>
            <circle cx={x} cy={y} r="15" fill="#D5C4A1" stroke="#33231F" strokeWidth="1" />
            <text x={x} y={y} textAnchor="middle" dominantBaseline="central"
              fontSize="16" fontWeight="600" fill="#30231F">{text}</text>
          </g>
        ))}
      </g>
    </svg>
  );
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ review?: string }>;
}) {
  const showSparseNotes = (await searchParams).review === "sparse";
  return (
    <main className="flex min-h-dvh flex-col items-center pt-16 pb-1">
      <h1 className="w-full max-w-2xl px-6 text-3xl font-semibold">FretboAIrd</h1>
      <div className="mt-auto hidden w-[72.8%] md:block">
        <Fretboard showSparseNotes={showSparseNotes} />
      </div>
      <div aria-label="Fretboard scroll area" role="region" tabIndex={0}
        className="mt-auto h-[72dvh] w-[94%] overflow-y-auto md:hidden">
        <Fretboard portrait showSparseNotes={showSparseNotes} />
      </div>
    </main>
  );
}
