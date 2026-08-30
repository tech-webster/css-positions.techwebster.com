// Watch Position Quest get played: opens a visible Chrome window, types each
// level's solution slowly, waits for the win, screenshots, advances.
import { createRequire } from "module";
const require = createRequire("/Users/ashirbadpanigrahi/.npm/_npx/9833c18b2d85bc59/node_modules/");
const { chromium } = require("playwright");

const browser = await chromium.launch({
  headless: false,
  slowMo: 120,
  executablePath:
    "/Users/ashirbadpanigrahi/Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing",
});
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await page.goto("http://localhost:8000");
await page.evaluate(() => localStorage.clear()); // fresh run
await page.reload();
await page.waitForTimeout(800);

const solve = async (css) => {
  await page.fill("#editor", "");
  await page.type("#editor", css, { delay: 45 }); // watchable typing
  await page.waitForSelector("#win:not([hidden])", { timeout: 5000 });
};
const deltaCSS = async (extra) => {
  const css = await page.evaluate((pre) => {
    const h = document.getElementById("hero").getBoundingClientRect();
    const t = document.getElementById("target").getBoundingClientRect();
    return pre + `left:${(t.left - h.left).toFixed(0)}px; top:${(t.top - h.top).toFixed(0)}px;`;
  }, extra);
  await solve(css);
};

const levels = [
  "position:relative; left:55%; top:55%;",
  null, // computed: negative relative
  "position:absolute; top:8%; right:6%;",
  "position:absolute; inset:0; margin:auto;",
  "position:absolute; left:8%; bottom:10%;",
  "position:absolute; left:42%; top:42%; z-index:6;",
  null, // computed: behind crate
  "position:fixed; right:24px; bottom:24px;",
  "position:absolute; top:-26px; left:calc(50% - 26px);",
  "position:fixed; inset:0; margin:auto;",
];

import { mkdirSync } from "fs";
mkdirSync("shots", { recursive: true });

for (let i = 0; i < levels.length; i++) {
  await page.waitForTimeout(1200); // pause to read the brief
  if (levels[i] === null) await deltaCSS(i === 6 ? "z-index:4; " : "position:relative; ");
  else await solve(levels[i]);
  await page.waitForTimeout(1600); // admire the win + confetti
  await page.screenshot({ path: `shots/level-${String(i + 1).padStart(2, "0")}.png` });
  await page.click("#next-btn");
}

await page.waitForTimeout(1000);
await browser.close();
console.log("walkthrough done — 10 levels played");
