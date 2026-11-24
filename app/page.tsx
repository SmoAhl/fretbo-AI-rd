import type { FretboardString } from "../domain/fretboard/fretboard.js";

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
      <svg
        viewBox="0 0 1200 240"
        role="img"
        aria-label="Fretboard neck"
        className="mt-auto block h-auto w-[94%] md:w-[70%]"
      >
        <rect x="20" y="20" width="1160" height="200" fill="#4A2C25" />
        <rect x="20" y="20" width="32" height="200" fill="#E8DCC2" />
        {strings.map(({ id, position }) => {
          const y = 40 + (position - 1) * 32;
          const strokeWidth = 1 + (position - 1) * 0.5;
          return (
            <line key={id} x1="20" x2="1180" y1={y} y2={y}
              stroke="silver" strokeWidth={strokeWidth} vectorEffect="non-scaling-stroke" />
          );
        })}
      </svg>
    </main>
  );
}
