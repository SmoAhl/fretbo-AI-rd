import type { FretboardString } from "../domain/fretboard/fretboard.js";

import { formatRegisteredNote } from "@/domain/music-theory/pitch-pitch-classes-and-spelling/note-text";
import { noteFromRegisteredPitch } from "@/domain/music-theory/pitch-pitch-classes-and-spelling/spelling-selection";

const strings: readonly FretboardString[] = [
  { id: 1, position: 1, openPitch: 52 }, // E4
  { id: 2, position: 2, openPitch: 47 }, // B3
  { id: 3, position: 3, openPitch: 43 }, // G3
  { id: 4, position: 4, openPitch: 38 }, // D3
  { id: 5, position: 5, openPitch: 33 }, // A2
  { id: 6, position: 6, openPitch: 28 }, // E2
];

export default function Home() {
  return (
    <main className="flex min-h-dvh flex-col items-center pt-16 pb-1">
      <h1 className="w-full max-w-2xl px-6 text-3xl font-semibold">FretboAIrd</h1>
      <div className="mt-auto w-[94%] overflow-x-auto md:w-[72.8%]">
        <svg
          viewBox="-24 0 1248 240"
          role="img"
          aria-label="Fretboard neck"
          className="block h-auto w-full min-w-[920px]"
        >
          <rect x="20" y="20" width="1160" height="200" fill="#4A2C25" />
          <rect x="20" y="20" width="32" height="200" fill="#E8DCC2" />
          {strings.map(({ id, position, openPitch }) => {
            const y = 40 + (position - 1) * 32;
            const strokeWidth = 1 + (position - 1) * 0.5;
            return (
              <g key={id}>
                <circle cx="-2" cy={y} r="15" fill="#41362E" />
                <text x="-2" y={y} textAnchor="middle" dominantBaseline="central" fontSize="18" fill="white">
                  {formatRegisteredNote(noteFromRegisteredPitch(openPitch, "sharps"))}
                </text>
                <line x1="20" x2="1180" y1={y} y2={y}
                  stroke="silver" strokeWidth={strokeWidth} vectorEffect="non-scaling-stroke" />
              </g>
            );
          })}
        </svg>
      </div>
    </main>
  );
}
