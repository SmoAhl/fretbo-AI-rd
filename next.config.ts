import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Resolve the domain's native ESM specifiers against its TypeScript sources.
  turbopack: {
    resolveAlias: {
      "../domain/fretboard/fretboard.js": "./domain/fretboard/fretboard.ts",
      "../domain/music-theory/pitch-pitch-classes-and-spelling/note-text.js": "./domain/music-theory/pitch-pitch-classes-and-spelling/note-text.ts",
      "../domain/music-theory/pitch-pitch-classes-and-spelling/spelling-selection.js": "./domain/music-theory/pitch-pitch-classes-and-spelling/spelling-selection.ts",
      "../music-theory/pitch-pitch-classes-and-spelling/registered-pitch.js": "./domain/music-theory/pitch-pitch-classes-and-spelling/registered-pitch.ts",
      "./registered-pitch.js": "./domain/music-theory/pitch-pitch-classes-and-spelling/registered-pitch.ts",
      "./note-spelling.js": "./domain/music-theory/pitch-pitch-classes-and-spelling/note-spelling.ts",
      "./pitch-class.js": "./domain/music-theory/pitch-pitch-classes-and-spelling/pitch-class.ts",
    },
  },
  agentRules: false,
};

export default nextConfig;
