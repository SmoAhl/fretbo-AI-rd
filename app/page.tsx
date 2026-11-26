import { createFretboard } from "../domain/fretboard/fretboard.js";
import { calculateFretWireBoundaries, FINAL_FRET_WIDTH_RATIO } from "./fret-wire-layout";
import { denseNoteLabels, noteLabelAtLocation } from "./note-label-data";
import { getStringRows, positionNoteLabels, type NoteLabelPosition } from "./note-label-layout";
import { sparseNoteFixture } from "./sparse-note-fixture";

const board = createFretboard([
  { id: 1, position: 1, openPitch: 52 }, // E4
  { id: 2, position: 2, openPitch: 47 }, // B3
  { id: 3, position: 3, openPitch: 43 }, // G3
  { id: 4, position: 4, openPitch: 38 }, // D3
  { id: 5, position: 5, openPitch: 33 }, // A2
  { id: 6, position: 6, openPitch: 28 }, // E2
], 17);

const fretStart = 52;
const fretSpan = 1180 - fretStart;
const firstFretSpaceWidth = (2 * fretSpan) / (board.fretCount * (1 + FINAL_FRET_WIDTH_RATIO));
const fretBoundaries = calculateFretWireBoundaries(
  fretStart,
  firstFretSpaceWidth,
  board.fretCount,
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

const strings = [...board.strings].sort((a, b) => a.position - b.position);
const stringRows = getStringRows(strings);
const openStringCenter = (-24 + 20) / 2;
const tuningLabels = new Map(strings.map(({ id }) => [id, noteLabelAtLocation(board, { stringId: id, fret: 0 }).text]));

function Fretboard({ portrait = false, reviewNotes }: { portrait?: boolean; reviewNotes: NoteLabelPosition[] | undefined }) {
  return (
    <svg viewBox={portrait ? "0 0 240 1248" : "-24 0 1248 240"} role="img" aria-label="Fretboard neck"
      className={portrait ? "mx-auto block h-[936px] w-[180px] overflow-visible" : "block h-auto w-full overflow-visible"}>
      <g transform={portrait ? "translate(240 24) rotate(90)" : undefined}>
        {Array.from({ length: board.fretCount + 1 }, (_, fret) => {
          const x = fret === 0 ? (20 + fretStart) / 2 : (fretBoundaries[fret - 1]! + fretBoundaries[fret]!) / 2;
          return <text key={fret} data-fret-number={fret} x={x} y="2" textAnchor="middle"
            dominantBaseline="central" fontSize="18" fontWeight="700" fill="#30231F">{fret}</text>;
        })}
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
        {strings.map(({ id, position }) => {
          const y = stringRows.get(id)!;
          const strokeWidth = 1 + (position - 1) * 0.5;
          const active = reviewNotes?.some(note => note.stringId === id && note.fret === 0) ?? false;
          return (
            <g key={id}>
                  <circle data-open-string-label data-open-string-id={id} data-active={active} cx={openStringCenter} cy={y} r="15" fill={active ? "#D5C4A1" : "#41362E"} />
                  <text x={openStringCenter} y={y} textAnchor="middle" dominantBaseline="central" fontSize="18" fill={active ? "#30231F" : "white"}>
                    {tuningLabels.get(id)}
                  </text>
              <line data-string-id={id} x1="20" x2="1180" y1={y} y2={y}
                stroke="silver" strokeWidth={strokeWidth} vectorEffect="non-scaling-stroke" />
            </g>
          );
        })}
        {reviewNotes?.filter(note => note.fret > 0).map(({ stringId, fret, text, x, y }) => (
          <g key={`${stringId}-${fret}`} data-note-label data-note-string-id={stringId} data-note-fret={fret}>
            <circle cx={x} cy={y} r="15" fill="#D5C4A1" stroke="#33231F" strokeWidth="1" />
            <text x={x} y={y} textAnchor="middle" dominantBaseline="central"
              fontSize="15" fontWeight="600" fill="#30231F">{text}</text>
          </g>
        ))}
      </g>
    </svg>
  );
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ review?: string | string[] }>;
}) {
  const { review } = await searchParams;
  const dense = review === "dense";
  const labels = dense ? denseNoteLabels(board)
    : review === "sparse" ? sparseNoteFixture.map(location => noteLabelAtLocation(board, location))
    : undefined;
  const reviewNotes = labels && positionNoteLabels(labels, stringRows, fretBoundaries, openStringCenter);

  return (
    <main className="flex min-h-dvh flex-col items-center pt-16 pb-1">
      <h1 className="w-full max-w-2xl px-6 text-3xl font-semibold">FretboAIrd</h1>
      <div role={dense ? "region" : undefined} aria-label={dense ? "Fretboard scroll area" : undefined}
        className={dense ? "mt-auto hidden w-[94%] overflow-x-auto pt-3 md:block lg:w-[72.8%]" : "mt-auto hidden w-[72.8%] pt-3 md:block"}>
        <div className={dense ? "min-w-[920px]" : undefined}>
          <Fretboard reviewNotes={reviewNotes} />
        </div>
      </div>
      <div aria-label="Fretboard scroll area" role="region" tabIndex={0}
        className="mt-auto h-[72dvh] w-[94%] overflow-y-auto md:hidden">
        <Fretboard portrait reviewNotes={reviewNotes} />
      </div>
    </main>
  );
}
