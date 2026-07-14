import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "fs";

const URL = "https://brandforge.gg";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: "no-preference",
  });
  const page = await context.newPage();

  // Collect ALL console output
  const consoleLines = [];
  page.on("console", (msg) => {
    consoleLines.push(`[${msg.type()}] ${msg.text()}`);
  });
  page.on("pageerror", (err) => {
    consoleLines.push(`[PAGE_ERROR] ${err.message}`);
  });

  console.log(`Loading ${URL}...`);
  await page.goto(URL, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(5000);

  console.log("\n=== CHECK 1: CONSOLE OUTPUT ===");
  for (const line of consoleLines) {
    console.log(line);
  }
  console.log(`Total console messages: ${consoleLines.length}`);

  console.log("\n=== CHECK 2: DOM — canvas element ===");
  const canvasDOM = await page.evaluate(() => {
    const c = document.querySelector('canvas[aria-hidden="true"]');
    if (!c) return { exists: false, reason: "no canvas element found in DOM" };

    const section = c.closest("section");
    const computed = getComputedStyle(c);
    const parentComputed = getComputedStyle(c.parentElement);
    const sectionComputed = section ? getComputedStyle(section) : null;

    return {
      exists: true,
      tagName: c.tagName,
      attributes: {
        width: c.getAttribute("width"),
        height: c.getAttribute("height"),
        "aria-hidden": c.getAttribute("aria-hidden"),
        class: c.getAttribute("class"),
      },
      computedStyle: {
        width: computed.width,
        height: computed.height,
        opacity: computed.opacity,
        zIndex: computed.zIndex,
        display: computed.display,
        visibility: computed.visibility,
        position: computed.position,
        pointerEvents: computed.pointerEvents,
      },
      parentInfo: {
        tagName: c.parentElement?.tagName,
        id: c.parentElement?.id,
        classes: c.parentElement?.className,
        computedStyle: {
          width: parentComputed.width,
          height: parentComputed.height,
          display: parentComputed.display,
          position: parentComputed.position,
          overflow: parentComputed.overflow,
          opacity: parentComputed.opacity,
          zIndex: parentComputed.zIndex,
        },
        clientRect: c.parentElement?.getBoundingClientRect(),
      },
      sectionInfo: section
        ? {
            id: section.id,
            classes: section.className,
            computedStyle: {
              width: sectionComputed?.width,
              height: sectionComputed?.height,
              minHeight: sectionComputed?.minHeight,
              overflow: sectionComputed?.overflow,
              position: sectionComputed?.position,
              zIndex: sectionComputed?.zIndex,
              display: sectionComputed?.display,
            },
            clientRect: section.getBoundingClientRect(),
          }
        : null,
      canvasClientRect: c.getBoundingClientRect(),
    };
  });
  console.log(JSON.stringify(canvasDOM, null, 2));

  console.log("\n=== CHECK 3: Network tab — JS chunk loading ===");
  // We already waited for networkidle, but let's check specific chunks
  const chunkInfo = await page.evaluate(() => {
    const scripts = document.querySelectorAll('script[src*="chunk"]');
    return Array.from(scripts).map((s) => ({
      src: s.getAttribute("src"),
      async: s.hasAttribute("async"),
      type: s.getAttribute("type"),
    }));
  });
  console.log(`JS chunk scripts found: ${chunkInfo.length}`);
  for (const s of chunkInfo) {
    console.log(`  ${s.src || "(inline)"} async=${s.async} type=${s.type}`);
  }

  console.log("\n=== CHECK 4: Reduced motion check ===");
  const rmCheck = await page.evaluate(() => {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });
  console.log(`prefers-reduced-motion matches: ${rmCheck}`);

  console.log("\n=== CHECK 5: Canvas context and rendering check ===");
  const renderInfo = await page.evaluate(() => {
    const c = document.querySelector('canvas[aria-hidden="true"]');
    if (!c) return "no canvas";
    const ctx = c.getContext("2d");
    if (!ctx) return "no 2d context";
    return {
      ctxType: "2d",
      canvasWidth: c.width,
      canvasHeight: c.height,
      parentHeight: c.parentElement?.clientHeight,
      parentWidth: c.parentElement?.clientWidth,
      // Check if it's been cleared (black/near-zero vs drawn)
      centerPixel: Array.from(ctx.getImageData(Math.floor(c.width / 2), Math.floor(c.height * 0.9), 1, 1).data),
    };
  });
  console.log(JSON.stringify(renderInfo, null, 2));

  // Also take a screenshot
  await page.screenshot({ path: "production-hero.png", fullPage: false });
  console.log("\nScreenshot saved as production-hero.png");

  await browser.close();
}

main().catch(console.error);
