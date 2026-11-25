import { expect, test, type Page } from "@playwright/test";

test("the home page identifies the workbench", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle("FretboAIrd");
  await expect(
    page.getByRole("main").getByRole("heading", { level: 1, name: "FretboAIrd", exact: true }),
  ).toBeVisible();
});

async function checkNeck(page: Page, width: number, height: number) {
  await page.setViewportSize({ width, height });
  const svg = page.getByRole("img", { name: "Fretboard neck", exact: true });
  const rect = svg.locator('rect[fill="#4A2C25"]');
  await expect(rect).toHaveCount(1);
  await expect(rect).toBeVisible();
  if (width >= 1280) await expect(rect).toBeInViewport({ ratio: 1 });

  const frame = await svg.evaluate(element => element.getBoundingClientRect().toJSON());
  const shape = await rect.evaluate(element => element.getBoundingClientRect().toJSON());
  const scale = frame.width / 1248;
  const nut = svg.locator('rect[fill="#E8DCC2"]');
  await expect(nut).toHaveCSS("fill", "rgb(232, 220, 194)");
  const bone = await nut.evaluate(el => el.getBoundingClientRect().toJSON());
  expect(Math.abs(bone.left - shape.left)).toBeLessThan(0.5);
  expect(Math.abs(bone.width - 32 * scale)).toBeLessThan(0.5);
  expect(Math.abs(bone.top - shape.top)).toBeLessThan(0.5);
  expect(Math.abs(bone.bottom - shape.bottom)).toBeLessThan(0.5);
  const middleX = bone.left + bone.width / 2;
  expect(await nut.evaluate((el, x) =>
    el.ownerDocument.elementFromPoint(x, el.getBoundingClientRect().top + 2) === el, middleX)).toBe(true);
  const lines = svg.locator("line");
  await expect(lines).toHaveCount(24);
  const fretWires = svg.locator("[data-fret-wire]");
  await expect(fretWires).toHaveCount(18);
  const wireBounds = await fretWires.evaluateAll(elements =>
    elements.map(element => element.getBoundingClientRect().toJSON()));
  expect(Math.abs(wireBounds[0].x - bone.right)).toBeLessThan(0.5);
  expect(Math.abs(wireBounds[17].x - shape.right)).toBeLessThan(0.5);
  for (const wire of await fretWires.all()) {
    await expect(wire).toHaveCSS("stroke-width", "1.5px");
    const bounds = await wire.evaluate(el => el.getBoundingClientRect().toJSON());
    expect(Math.abs(bounds!.y - shape.top)).toBeLessThan(0.5);
    expect(Math.abs(bounds!.height - shape.height)).toBeLessThan(0.5);
  }
  const landmarks = svg.locator("[data-landmark-fret]");
  await expect(landmarks).toHaveCount(8);
  const landmarkFrets = [3, 5, 7, 9, 12, 12, 15, 17];
  const landmarkBounds = await landmarks.evaluateAll(elements =>
    elements.map(element => ({
      fret: Number(element.getAttribute("data-landmark-fret")),
      bounds: element.getBoundingClientRect().toJSON(),
    })));
  for (const [index, { fret, bounds }] of landmarkBounds.entries()) {
    expect(fret).toBe(landmarkFrets[index]);
    const x = (wireBounds[fret - 1]!.x + wireBounds[fret]!.x) / 2;
    expect(Math.abs(bounds.x + bounds.width / 2 - x)).toBeLessThan(0.75);
    expect(bounds.width).toBeLessThan(16 * scale);
    expect(bounds.height).toBeLessThan(16 * scale);
  }
  const twelfthPair = landmarkBounds.slice(4, 6).map(({ bounds }) => bounds);
  expect(Math.abs(twelfthPair[0]!.x - twelfthPair[1]!.x)).toBeLessThan(0.5);
  if (width >= 1280) {
    expect(Math.abs(twelfthPair[0]!.y + twelfthPair[0]!.height / 2 - (frame.top + 88 * scale))).toBeLessThan(0.75);
    expect(Math.abs(twelfthPair[1]!.y + twelfthPair[1]!.height / 2 - (frame.top + 152 * scale))).toBeLessThan(0.75);
  }
  const labels = svg.locator("text");
  await expect(labels).toHaveText(["E4", "B3", "G3", "D3", "A2", "E2"]);
  await expect(svg.locator("[data-open-string-label]")).toHaveCount(6);
  let previousBottom = 0;
  for (const [index, y] of [40, 72, 104, 136, 168, 200].entries()) {
    const line = svg.locator(`[data-string-id="${index + 1}"]`);
    await expect(line).toHaveCSS("stroke", "rgb(192, 192, 192)");
    await expect(line).toHaveCSS("stroke-width", `${1 + index * 0.5}px`);
    await expect(line).toHaveCSS("vector-effect", "non-scaling-stroke");
    const bounds = await line.evaluate(el => el.getBoundingClientRect().toJSON());
    expect(Math.abs(bounds.left - shape.left)).toBeLessThan(0.5);
    expect(Math.abs(bounds.right - shape.right)).toBeLessThan(0.5);
    expect(Math.abs(bounds.top - frame.top - y * scale)).toBeLessThan(0.5);
    const circle = svg.locator("[data-open-string-label]").nth(index);
    await expect(circle).toBeInViewport({ ratio: 1 });
    const disk = await circle.evaluate(el => el.getBoundingClientRect().toJSON());
    const text = await labels.nth(index).evaluate(el => el.getBoundingClientRect().toJSON());
    expect(disk.right).toBeLessThan(bone.left);
    expect(disk.top).toBeGreaterThan(previousBottom);
    expect(Math.abs(disk.top + disk.height / 2 - bounds.top)).toBeLessThan(0.5);
    expect(Math.abs(text.top + text.height / 2 - bounds.top)).toBeLessThan(1);
    expect(Math.abs(text.left + text.width / 2 - (disk.left + disk.width / 2))).toBeLessThan(1);
    expect(text.width).toBeLessThan(disk.width);
    previousBottom = disk.bottom;
    expect(bounds.height).toBe(0);
    expect(await line.evaluate((el, x) =>
      el.ownerDocument.elementFromPoint(x, el.getBoundingClientRect().top) === el, middleX)).toBe(true);
  }
  // SVG coordinates scale uniformly. Allow half a CSS pixel for layout rounding.
  expect(Math.abs(frame.height - 240 * scale)).toBeLessThan(0.5);
  expect(Math.abs(shape.x - frame.x - 44 * scale)).toBeLessThan(0.5);
  expect(Math.abs(shape.y - frame.y - 20 * scale)).toBeLessThan(0.5);
  expect(Math.abs(shape.width - 1160 * scale)).toBeLessThan(0.5);
  expect(Math.abs(shape.height - 200 * scale)).toBeLessThan(0.5);
  const bottomGap = height - shape.bottom;
  expect(bottomGap).toBeGreaterThanOrEqual(8);
  expect(bottomGap).toBeLessThanOrEqual(32);
  if (width >= 1280) expect(Math.abs(shape.left - (width - shape.right))).toBeLessThan(0.5);
  return { svgWidth: frame.width, width: shape.width, top: shape.top, gutter: shape.left, bottomGap };
}

test("the rosewood neck stays centered near the bottom as the viewport changes", async ({ page }) => {
  await page.goto("/");
  const wide = await checkNeck(page, 1920, 920);
  const desktop = await checkNeck(page, 1280, 800);
  for (const fraction of [wide.width / 1920, desktop.width / 1280]) {
    expect(fraction).toBeGreaterThanOrEqual(0.62);
    expect(fraction).toBeLessThanOrEqual(0.72);
  }

  const taller = await checkNeck(page, 1280, 920);
  expect(Math.abs(taller.top - desktop.top - 120)).toBeLessThan(0.5);
  expect(Math.abs(taller.width - desktop.width)).toBeLessThan(0.5);
  expect(Math.abs(taller.bottomGap - desktop.bottomGap)).toBeLessThan(0.5);

});

test("portrait phone board starts at the nut and scrolls to the complete final fret", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const svg = page.getByRole("img", { name: "Fretboard neck" });
  const area = page.getByRole("region", { name: "Fretboard scroll area" });
  const box = await area.boundingBox();
  expect(box).not.toBeNull();
  expect(Math.abs(box!.y + box!.height - 840)).toBeLessThan(1);
  expect(await area.evaluate(el => el.scrollTop)).toBe(0);
  await expect(svg.locator("text")).toHaveText(["E4", "B3", "G3", "D3", "A2", "E2"]);
  for (const label of await svg.locator("text").all()) {
    const direction = await label.evaluate(el => {
      const matrix = (el as unknown as { getScreenCTM(): { a: number; b: number } }).getScreenCTM();
      return { x: matrix.a, y: matrix.b };
    });
    expect(Math.abs(direction.x)).toBeLessThan(0.001);
    expect(direction.y).toBeGreaterThan(0);
  }
  for (const label of await svg.locator("[data-open-string-label]").all()) await expect(label).toBeInViewport({ ratio: 1 });
  const nut = await svg.locator('rect[fill="#E8DCC2"]').boundingBox();
  const wood = await svg.locator('rect[fill="#4A2C25"]').boundingBox();
  expect(Math.abs(nut!.y - wood!.y)).toBeLessThan(0.5);
  expect(nut!.width).toBeCloseTo(wood!.width);
  let previousLeft = 390;
  for (let index = 0; index < 6; index += 1) {
    const circle = await svg.locator("[data-open-string-label]").nth(index).boundingBox();
    const text = await svg.locator("text").nth(index).boundingBox();
    const string = svg.locator("[data-string-id]").nth(index);
    const line = await string.evaluate(el => el.getBoundingClientRect().toJSON());
    await expect(string).toHaveCSS("stroke-width", `${1 + index * 0.5}px`);
    expect(circle!.x + circle!.width).toBeLessThan(previousLeft);
    expect(circle!.y + circle!.height).toBeLessThan(nut!.y);
    expect(Math.abs(circle!.x + circle!.width / 2 - line!.x)).toBeLessThan(0.5);
    expect(Math.abs(text!.x + text!.width / 2 - line!.x)).toBeLessThan(0.5);
    expect(Math.abs(text!.y + text!.height / 2 - circle!.y - circle!.height / 2)).toBeLessThan(1);
    previousLeft = circle!.x;
  }
  await area.evaluate(el => { el.scrollTop = el.scrollHeight; });
  for (const fret of [16, 17]) {
    const wire = await svg.locator(`[data-fret-wire="${fret}"]`).boundingBox();
    expect(wire!.y).toBeGreaterThan(box!.y);
    expect(wire!.y).toBeLessThan(box!.y + box!.height);
    expect(wire!.width).toBeGreaterThan(100);
  }
  expect(await page.locator("html").evaluate(el => el.scrollWidth)).toBe(390);
});

test("fretboard landmarks sit in their spaces at desktop and landscape phone sizes", async ({ page }) => {
  for (const viewport of [{ width: 1280, height: 800 }, { width: 844, height: 390 }]) {
    await page.setViewportSize(viewport);
    await page.goto("/");
    const svg = page.getByRole("img", { name: "Fretboard neck" });
    const landmarks = svg.locator("[data-landmark-fret]");
    await expect(landmarks).toHaveCount(8);
    const wires = await svg.locator("[data-fret-wire]").evaluateAll(elements =>
      elements.map(element => element.getBoundingClientRect().toJSON()));
    const dots = await landmarks.evaluateAll(elements =>
      elements.map(element => ({
        fret: Number(element.getAttribute("data-landmark-fret")),
        bounds: element.getBoundingClientRect().toJSON(),
      })));
    expect(dots.map(dot => dot.fret)).toEqual([3, 5, 7, 9, 12, 12, 15, 17]);
    for (const dot of dots) {
      const centerX = dot.bounds.x + dot.bounds.width / 2;
      const firstBoundary = wires[dot.fret - 1]!.x;
      const secondBoundary = wires[dot.fret]!.x;
      expect(centerX).toBeGreaterThan(firstBoundary);
      expect(centerX).toBeLessThan(secondBoundary);
      expect(dot.bounds.width).toBeLessThan(Math.abs(secondBoundary - firstBoundary) * 0.3);
    }
    const pair = dots.slice(4, 6).map(dot => dot.bounds.y + dot.bounds.height / 2);
    const stringRows = await svg.locator("[data-string-id]").evaluateAll(elements =>
      elements.map(element => element.getBoundingClientRect().y));
    expect(Math.abs(pair[0]! - (stringRows[1]! + stringRows[2]!) / 2)).toBeLessThan(0.75);
    expect(Math.abs(pair[1]! - (stringRows[3]! + stringRows[4]!) / 2)).toBeLessThan(0.75);
    expect(Math.abs(dots[4]!.bounds.x - dots[5]!.bounds.x)).toBeLessThan(0.5);
    await page.screenshot({ path: `.local/neck-review/landmarks-${viewport.width}.png` });
  }
});

test("the sparse note review fixture is opt-in and centers labels in their cells", async ({ page }) => {
  const viewports = [{ width: 1280, height: 800 }, { width: 844, height: 390 }];
  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await page.goto("/");
    const svg = page.getByRole("img", { name: "Fretboard neck" });
    await expect(svg.locator("[data-note-label]")).toHaveCount(0);
    await page.screenshot({ path: `.local/neck-review/notes-empty-${viewport.width}.png`, fullPage: true });

    await page.goto("/?review=sparse");
    const noteLabels = svg.locator("[data-note-label]");
    await expect(noteLabels).toHaveCount(11);
    await expect(svg.locator("[data-open-string-label]")).toHaveCount(0);
    await expect(noteLabels.locator("text")).toHaveText([
      "E4", "E2", "F4", "F2", "G4", "G2", "E5", "E3", "A5", "A3", "E♭4",
    ]);
    const wires = await svg.locator("[data-fret-wire]").evaluateAll(elements =>
      elements.map(element => element.getBoundingClientRect().toJSON()));
    const nutLeft = await svg.locator('rect[fill="#E8DCC2"]').evaluate(element =>
      element.getBoundingClientRect().left);
    const frame = await svg.evaluate(element => element.getBoundingClientRect().toJSON());
    const stringRows = await svg.locator("line[data-string-id]").evaluateAll(elements =>
      Object.fromEntries(elements.map(element => [
        Number(element.getAttribute("data-string-id")),
        element.getBoundingClientRect().y + element.getBoundingClientRect().height / 2,
      ])));
    const labels = await noteLabels.evaluateAll(elements => elements.map(element => ({
      stringId: Number(element.getAttribute("data-note-string-id")),
      fret: Number(element.getAttribute("data-note-fret")),
      circle: element.querySelector("circle")!.getBoundingClientRect().toJSON(),
      text: element.querySelector("text")!.getBoundingClientRect().toJSON(),
    })));
    expect(labels.map(({ stringId, fret }) => [Number(stringId), fret])).toEqual([
      [1, 0], [6, 0], [1, 1], [6, 1], [1, 3], [6, 3],
      [1, 12], [6, 12], [1, 17], [6, 17], [2, 5],
    ]);
    let minimumNutOrWireClearance = Number.POSITIVE_INFINITY;
    let labelDiameter = 0;
    let textHeight = 0;
    const clearanceByFret = new Map<number, number>();
    for (const label of labels) {
      const centerX = label.circle.x + label.circle.width / 2;
      const centerY = label.circle.y + label.circle.height / 2;
      const left = label.fret === 0 ? frame.x : wires[label.fret - 1]!.x + wires[label.fret - 1]!.width / 2;
      const right = label.fret === 0 ? nutLeft : wires[label.fret]!.x + wires[label.fret]!.width / 2;
      expect(Math.abs(centerX - (left + right) / 2)).toBeLessThan(0.75);
      expect(Math.abs(centerY - stringRows[label.stringId]!)).toBeLessThan(0.75);
      const edgeClearance = Math.min(centerX - left, right - centerX) - label.circle.width / 2 - 0.75;
      minimumNutOrWireClearance = Math.min(minimumNutOrWireClearance, edgeClearance);
      clearanceByFret.set(label.fret, Math.min(clearanceByFret.get(label.fret) ?? Number.POSITIVE_INFINITY, edgeClearance));
      labelDiameter = label.circle.width;
      textHeight = label.text.height;
      expect(edgeClearance).toBeGreaterThan(0);
      expect(label.text.width).toBeGreaterThan(0);
      expect(label.text.height).toBeGreaterThan(7);
    }
    for (const fret of [1, 12, 17]) expect(clearanceByFret.get(fret)).toBeGreaterThan(0);
    console.log(`Sparse notes ${viewport.width}x${viewport.height}: circle ${labelDiameter.toFixed(2)}px, text box ${textHeight.toFixed(2)}px; minimum nut/wire clearance ${minimumNutOrWireClearance.toFixed(2)}px; frets 1/12/17 ${[1, 12, 17].map(fret => clearanceByFret.get(fret)!.toFixed(2)).join("/")}px.`);
    await page.screenshot({ path: `.local/neck-review/notes-sparse-${viewport.width}.png`, fullPage: true });
  }
});
