/**
 * export-pngs.js — Export each portfolio card as a separate 2x PNG.
 *
 * Usage:
 *   node screenshots/export-pngs.js
 *   npm run export:pngs
 *
 * Outputs to: screenshots/exports/
 */

const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

const HTML_PATH = path.resolve(__dirname, 'portfolio-showcase.html');
const EXPORT_DIR = path.resolve(__dirname, 'exports');
const SCALE = 2; // 2x resolution

(async () => {
  fs.mkdirSync(EXPORT_DIR, { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1400, height: 900 },
    deviceScaleFactor: SCALE,
  });
  const page = await context.newPage();

  await page.goto(`file://${HTML_PATH}`);

  // Wait for fonts + images
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // Wait for all images to load
  await page.evaluate(() => {
    return Promise.all(
      Array.from(document.images)
        .filter(img => !img.complete)
        .map(img => new Promise(resolve => {
          img.onload = resolve;
          img.onerror = resolve;
        }))
    );
  });

  // Find all exportable sections
  const sections = await page.$$('[data-export-id]');
  console.log(`Found ${sections.length} exportable sections\n`);

  for (const section of sections) {
    const id = await section.getAttribute('data-export-id');
    const filename = `${id}.png`;
    const filepath = path.join(EXPORT_DIR, filename);

    // Get the inner card's bounding box (the .card child) for tighter crop,
    // but use the wrapper's box to include shadow padding
    const box = await section.boundingBox();
    if (!box) {
      console.log(`  SKIP ${id} — not visible`);
      continue;
    }

    await section.screenshot({
      path: filepath,
      type: 'png',
    });

    const stat = fs.statSync(filepath);
    const kb = Math.round(stat.size / 1024);
    console.log(`  ${filename}  (${Math.round(box.width * SCALE)}×${Math.round(box.height * SCALE)}px, ${kb}KB)`);
  }

  await browser.close();

  const files = fs.readdirSync(EXPORT_DIR).filter(f => f.endsWith('.png'));
  console.log(`\nDone — ${files.length} PNGs exported to screenshots/exports/`);
})();
