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
  const rect = svg.locator("rect");
  await expect(rect).toHaveCount(1);
  await expect(rect).toBeVisible();
  await expect(rect).toBeInViewport({ ratio: 1 });

  const frame = await svg.evaluate(element => element.getBoundingClientRect().toJSON());
  const shape = await rect.evaluate(element => element.getBoundingClientRect().toJSON());
  const scale = frame.width / 1200;
  const lines = svg.locator("line");
  await expect(lines).toHaveCount(6);
  for (const [index, y] of [40, 72, 104, 136, 168, 200].entries()) {
    const line = lines.nth(index);
    await expect(line).toHaveCSS("stroke", "rgb(192, 192, 192)");
    await expect(line).toHaveCSS("stroke-width", `${1 + index * 0.5}px`);
    await expect(line).toHaveCSS("vector-effect", "non-scaling-stroke");
    const bounds = await line.evaluate(el => el.getBoundingClientRect().toJSON());
    expect(Math.abs(bounds.left - shape.left)).toBeLessThan(0.5);
    expect(Math.abs(bounds.right - shape.right)).toBeLessThan(0.5);
    expect(Math.abs(bounds.top - frame.top - y * scale)).toBeLessThan(0.5);
    expect(bounds.height).toBe(0);
  }
  // SVG coordinates scale uniformly. Allow half a CSS pixel for layout rounding.
  expect(Math.abs(frame.height - 240 * scale)).toBeLessThan(0.5);
  expect(Math.abs(shape.x - frame.x - 20 * scale)).toBeLessThan(0.5);
  expect(Math.abs(shape.y - frame.y - 20 * scale)).toBeLessThan(0.5);
  expect(Math.abs(shape.width - 1160 * scale)).toBeLessThan(0.5);
  expect(Math.abs(shape.height - 200 * scale)).toBeLessThan(0.5);
  const bottomGap = height - shape.bottom;
  expect(bottomGap).toBeGreaterThanOrEqual(8);
  expect(bottomGap).toBeLessThanOrEqual(32);
  expect(Math.abs(shape.left - (width - shape.right))).toBeLessThan(0.5);
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
  expect(phone.svgWidth).toBeLessThan(desktop.svgWidth);
  expect(phone.gutter).toBeGreaterThanOrEqual(8);
  expect(phone.gutter).toBeLessThanOrEqual(32);
  const heading = page.getByRole("heading", { name: "FretboAIrd", level: 1 });
  await expect(heading).toBeInViewport({ ratio: 1 });
  expect(await heading.evaluate(el => el.getBoundingClientRect().bottom)).toBeLessThan(phone.top);
  expect(await page.locator("html").evaluate(el => el.scrollWidth)).toBeLessThanOrEqual(390);
});
