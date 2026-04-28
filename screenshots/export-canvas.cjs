/**
 * export-canvas.cjs — Export phone screens from the atlas.core design canvas.
 * Captures each phone frame as an individual 2x PNG.
 *
 * Usage: node screenshots/export-canvas.cjs
 */

const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const CANVAS_URL = 'http://127.0.0.1:8888/';
const EXPORT_DIR = path.resolve(__dirname, 'exports');

(async () => {
  fs.mkdirSync(EXPORT_DIR, { recursive: true });

  const browser = await chromium.launch();
  // Use a very wide viewport to render the full horizontal canvas
  const page = await browser.newPage({
    viewport: { width: 16000, height: 1600 },
    deviceScaleFactor: 2,
  });

  console.log('Loading design canvas...');
  await page.goto(CANVAS_URL);
  await page.waitForTimeout(10000); // Babel compile + full React render

  // Find all phone frame elements — they're divs with borderRadius ~44px,
  // width ~360px, height ~780-810px, and contain visible content
  const phoneHandles = await page.evaluateHandle(() => {
    const phones = [];
    document.querySelectorAll('div').forEach(el => {
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      const br = parseInt(getComputedStyle(el).borderRadius);
      if (w >= 355 && w <= 365 && h >= 795 && h <= 815 && br >= 40 && br <= 48) {
        // This is likely a phone frame (DCPhone outer shell)
        const rect = el.getBoundingClientRect();
        // Skip if out of viewport or already captured at same position
        if (rect.x >= 0 && rect.y >= 0) {
          phones.push(el);
        }
      }
    });
    // Deduplicate — keep only the outermost at each position
    const unique = [];
    const seen = new Set();
    for (const el of phones) {
      const rect = el.getBoundingClientRect();
      const key = Math.round(rect.x / 10) + ',' + Math.round(rect.y / 10);
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(el);
      }
    }
    // Sort left to right
    unique.sort((a, b) => a.getBoundingClientRect().x - b.getBoundingClientRect().x);
    // Store on window for access
    window.__phones = unique;
    return unique.length;
  });

  const count = await phoneHandles.jsonValue();
  console.log(`Found ${count} phone frames\n`);

  // Screenshot each phone frame
  const max = Math.min(count, 50);
  let exported = 0;
  for (let i = 0; i < max; i++) {
    const handle = await page.evaluateHandle((idx) => window.__phones[idx], i);
    const el = handle.asElement();
    if (!el) continue;

    // Get label from sibling or nearby text
    const label = await page.evaluate((idx) => {
      const el = window.__phones[idx];
      // Check for a label below the phone
      const parent = el.parentElement;
      if (!parent) return '';
      const siblings = Array.from(parent.children);
      const myIdx = siblings.indexOf(el);
      // Look at the next sibling for label text
      for (let j = myIdx + 1; j < siblings.length && j <= myIdx + 2; j++) {
        const sib = siblings[j];
        if (sib && sib.offsetHeight < 50 && sib.textContent?.trim()) {
          return sib.textContent.trim().slice(0, 40);
        }
      }
      // Fall back to first meaningful text inside the phone
      const inner = el.querySelector('div > div');
      if (inner) return inner.textContent?.trim()?.slice(0, 30) || '';
      return '';
    }, i);

    const safeName = label
      .replace(/[^a-zA-Z0-9 ]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .toLowerCase()
      .slice(0, 35) || `screen-${i + 1}`;

    const filename = `${String(i + 1).padStart(2, '0')}-${safeName}.png`;
    const filepath = path.join(EXPORT_DIR, filename);

    try {
      await el.screenshot({ path: filepath, type: 'png' });
      const kb = Math.round(fs.statSync(filepath).size / 1024);
      console.log(`  ${filename} (${kb}KB)`);
      exported++;
    } catch (err) {
      console.log(`  SKIP ${i + 1}: ${err.message.slice(0, 60)}`);
    }
  }

  await browser.close();
  console.log(`\nDone — ${exported} phone screens exported to screenshots/exports/`);
})();
