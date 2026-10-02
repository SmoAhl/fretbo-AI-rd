import { expect, test } from "vitest";
import { cn } from "../lib/utils.js";

test("runs TypeScript tests in the Node environment without a DOM", () => {
  const runtime: string = process.versions.node;

  expect(runtime.split(".")[0]).toBe("24");
  expect("document" in globalThis).toBe(false);
  expect("window" in globalThis).toBe(false);
});

test("loads the shadcn class utility through an ESM import", () => {
  expect(cn("px-2", false, undefined, "px-4")).toBe("px-4");
});
