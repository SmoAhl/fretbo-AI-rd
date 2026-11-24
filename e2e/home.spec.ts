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
  await expect(lines).toHaveCount(6);
  const labels = svg.locator("text");
  await expect(labels).toHaveText(["E4", "B3", "G3", "D3", "A2", "E2"]);
  await expect(svg.locator("circle")).toHaveCount(6);
  let previousBottom = 0;
  for (const [index, y] of [40, 72, 104, 136, 168, 200].entries()) {
    const line = lines.nth(index);
    await expect(line).toHaveCSS("stroke", "rgb(192, 192, 192)");
    await expect(line).toHaveCSS("stroke-width", `${1 + index * 0.5}px`);
    await expect(line).toHaveCSS("vector-effect", "non-scaling-stroke");
    const bounds = await line.evaluate(el => el.getBoundingClientRect().toJSON());
    expect(Math.abs(bounds.left - shape.left)).toBeLessThan(0.5);
    expect(Math.abs(bounds.right - shape.right)).toBeLessThan(0.5);
    expect(Math.abs(bounds.top - frame.top - y * scale)).toBeLessThan(0.5);
    const circle = svg.locator("circle").nth(index);
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

  const phone = await checkNeck(page, 390, 844);
  const svg = page.getByRole("img", { name: "Fretboard neck" });
  const scrollArea = svg.locator("..");
  const farEdge = () => svg.locator('rect[fill="#4A2C25"]').evaluate(el => el.getBoundingClientRect().right);
  const viewportRight = await scrollArea.evaluate(el => el.getBoundingClientRect().right);
  expect(await scrollArea.evaluate(el => el.scrollLeft)).toBe(0);
  expect(await farEdge()).toBeGreaterThan(viewportRight);
  await scrollArea.evaluate(el => { el.scrollLeft = el.scrollWidth; });
  expect(await farEdge()).toBeLessThanOrEqual(viewportRight);
  const heading = page.getByRole("heading", { name: "FretboAIrd", level: 1 });
  await expect(heading).toBeInViewport({ ratio: 1 });
  expect(await heading.evaluate(el => el.getBoundingClientRect().bottom)).toBeLessThan(phone.top);
  expect(await page.locator("html").evaluate(el => el.scrollWidth)).toBeLessThanOrEqual(390);
});
