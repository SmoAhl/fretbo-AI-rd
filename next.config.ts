import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Resolve the domain's native ESM specifiers against its TypeScript sources.
  turbopack: {
    resolveAlias: {
      "./registered-pitch.js": "./domain/music-theory/pitch-pitch-classes-and-spelling/registered-pitch.ts",
      "./note-spelling.js": "./domain/music-theory/pitch-pitch-classes-and-spelling/note-spelling.ts",
      "./pitch-class.js": "./domain/music-theory/pitch-pitch-classes-and-spelling/pitch-class.ts",
    },
  },
  agentRules: false,
};

export default nextConfig;
