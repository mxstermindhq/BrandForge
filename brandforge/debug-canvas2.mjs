import { chromium } from "playwright";
import { writeFileSync } from "fs";

const URL = "https://brandforge.gg";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  await page.goto(URL, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(5000);

  // Take a full-page screenshot
  await page.screenshot({ path: "production-hero-full.png", fullPage: false });
  console.log("Screenshot saved");

  // Analyze the anvil area for visible particle clusters
  const anvilAnalysis = await page.evaluate(() => {
    const c = document.querySelector('canvas[aria-hidden="true"]');
    if (!c) return "no canvas";
    const ctx = c.getContext("2d");
    if (!ctx) return "no ctx";

    const w = c.width, h = c.height;
    const centerX = Math.floor(w / 2);
    const centerY = Math.floor(h * 0.92); // anvil y

    // Sample a grid of 100x100 around the anvil
    const sampleSize = 100;
    const startX = centerX - 50;
    const startY = centerY - 50;
    const data = ctx.getImageData(startX, startY, sampleSize, sampleSize).data;

    let totalAlpha = 0;
    let nonZeroPixels = 0;
    let brightPixels = 0; // alpha > 128 and any of R/G/B > 100
    for (let i = 3; i < data.length; i += 4) {
      const alpha = data[i];
      if (alpha > 0) {
        totalAlpha += alpha;
        nonZeroPixels++;
        const r = data[i - 3], g = data[i - 2], b = data[i - 1];
        if (alpha > 128 && (r > 100 || g > 100 || b > 100)) {
          brightPixels++;
        }
      }
    }
    const avgAlpha = nonZeroPixels > 0 ? totalAlpha / nonZeroPixels / 255 : 0;

    // Also scan the full bottom third where the anvil is
    const bottomThirdStart = Math.floor(h * 0.7);
    const bottomData = ctx.getImageData(0, bottomThirdStart, w, h - bottomThirdStart).data;
    let bottomNonZero = 0;
    let bottomBright = 0;
    for (let i = 3; i < bottomData.length; i += 4) {
      if (bottomData[i] > 0) {
        bottomNonZero++;
        const r = bottomData[i - 3], g = bottomData[i - 2], b = bottomData[i - 1];
        if (bottomData[i] > 128 && (r > 100 || g > 100 || b > 100)) bottomBright++;
      }
    }
    const bottomTotalPixels = (h - bottomThirdStart) * w;

    return {
      anvil100x100Sample: {
        nonZeroAlphaPixels: nonZeroPixels,
        totalPixels: sampleSize * sampleSize,
        density: (nonZeroPixels / (sampleSize * sampleSize) * 100).toFixed(3) + "%",
        avgAlpha: avgAlpha.toFixed(3),
        brightPixels,
      },
      bottomThird: {
        nonZeroAlphaPixels: bottomNonZero,
        totalPixels: bottomTotalPixels,
        density: (bottomNonZero / bottomTotalPixels * 100).toFixed(4) + "%",
        brightPixels: bottomBright,
      },
      canvasDimensions: { w, h },
      anvilPosition: { x: centerX, y: centerY },
    };
  });
  console.log(JSON.stringify(anvilAnalysis, null, 2));

  // Now let's check the color of a few individual sparks
  const sparkColors = await page.evaluate(() => {
    const c = document.querySelector('canvas[aria-hidden="true"]');
    if (!c) return "no canvas";
    const ctx = c.getContext("2d");
    if (!ctx) return "no ctx";
    const w = c.width, h = c.height;

    // Look for bright particles in the canvas
    // Scan a 500x200 region in the lower half
    const results = [];
    const data = ctx.getImageData(Math.floor(w * 0.25), Math.floor(h * 0.5), Math.floor(w * 0.5), Math.floor(h * 0.4)).data;
    let found = 0;
    for (let i = 3; i < data.length && found < 10; i += 4) {
      if (data[i] > 200) { // high alpha
        const r = data[i - 3], g = data[i - 2], b = data[i - 1];
        if (r > 150 || g > 150) {
          results.push({ r, g, b, a: data[i] });
          found++;
        }
      }
    }
    return results;
  });
  console.log("Bright spark samples:", JSON.stringify(sparkColors));

  await browser.close();
}

main().catch(console.error);
