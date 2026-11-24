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
      </svg>
    </main>
  );
}
