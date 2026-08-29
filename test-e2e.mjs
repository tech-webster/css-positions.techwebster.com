// Headless end-to-end test for Position Quest
import { createRequire } from "module";
const require = createRequire("/Users/ashirbadpanigrahi/.npm/_npx/9833c18b2d85bc59/node_modules/");
const { chromium } = require("playwright");

const url = "file://" + process.cwd() + "/index.html";
const errors = [];
let pass = 0, fail = 0;
const ok = (cond, label) => {
  if (cond) { pass++; console.log("  ✓ " + label); }
  else { fail++; console.log("  ✗ " + label); }
};

const browser = await chromium.launch({
  executablePath: "/Users/ashirbadpanigrahi/Library/Caches/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-mac-arm64/chrome-headless-shell",
});
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
page.on("console", (m) => { if (m.type() === "error") errors.push("console: " + m.text()); });

await page.goto(url);
await page.waitForTimeout(300);

console.log("— boot —");
ok((await page.locator(".chip").count()) === 10, "10 level chips rendered");
ok(await page.locator("#lv-name").textContent() !== "", "level 1 title shown");
ok((await errors.length) === 0, "no console/page errors on boot");

console.log("— solving levels —");
async function solve(css) {
  await page.fill("#editor", css);
  await page.waitForTimeout(400);
}
async function winVisible() { return await page.locator("#win").isVisible(); }

// L1: relative %
await solve("position:relative; left:55%; top:55%;");
ok(await winVisible(), "L1 solved with position:relative + % offsets");

// L2: navigate + negative relative (compute delta from rects)
await page.click("#next-btn");
await page.waitForTimeout(200);
{
  const css = await page.evaluate(() => {
    const h = document.getElementById("hero").getBoundingClientRect();
    const t = document.getElementById("target").getBoundingClientRect();
    const dx = (t.left - h.left).toFixed(0), dy = (t.top - h.top).toFixed(0);
    return `position:relative; left:${dx}px; top:${dy}px;`;
  });
  await solve(css);
  ok(await winVisible(), "L2 solved with negative relative offsets");
}

// L3: absolute top/right
await page.click("#next-btn");
await solve("position:absolute; top:8%; right:6%;");
ok(await winVisible(), "L3 solved with absolute top/right");

// L4: absolute inset 0 margin auto
await page.click("#next-btn");
await solve("position:absolute; inset:0; margin:auto;");
ok(await winVisible(), "L4 solved with inset:0;margin:auto centring");

// L5: absolute bottom/left
await page.click("#next-btn");
await solve("position:absolute; left:8%; bottom:10%;");
ok(await winVisible(), "L5 solved with bottom anchor");

// L6: z-index above crate (must FAIL without z-index first)
await page.click("#next-btn");
await solve("position:absolute; left:42%; top:42%;");
await page.waitForTimeout(300);
ok(!(await winVisible()), "L6 correctly rejected without z-index");
await solve("position:absolute; left:42%; top:42%; z-index:6;");
ok(await winVisible(), "L6 solved with z-index:6 above crate");

// L7: z-index below crate
await page.click("#next-btn");
{
  const css = await page.evaluate(() => {
    const h = document.getElementById("hero").getBoundingClientRect();
    const t = document.getElementById("target").getBoundingClientRect();
    const dx = (t.left - h.left).toFixed(0), dy = (t.top - h.top).toFixed(0);
    return `z-index:4; left:${dx}px; top:${dy}px;`;
  });
  await solve(css);
  ok(await winVisible(), "L7 solved behind crate (z-index:4)");
}

// L8: fixed to viewport corner
await page.click("#next-btn");
await solve("position:fixed; right:24px; bottom:24px;");
ok(await winVisible(), "L8 solved with position:fixed");

// L9: negative top, calc left
await page.click("#next-btn");
await solve("position:absolute; top:-26px; left:calc(50% - 26px);");
ok(await winVisible(), "L9 solved with negative top + calc()");

// L10: boss — fixed centred
await page.click("#next-btn");
await solve("position:fixed; inset:0; margin:auto;");
ok(await winVisible(), "L10 (boss) solved with fixed centring");

console.log("— flow —");
ok((await page.locator(".chip.done").count()) === 10, "all 10 chips marked done");
await page.click("#next-btn");
await page.waitForTimeout(200);
ok((await page.locator("#lv-name").textContent()).includes("01"), "wraps back to level 1 (replay)");
await page.reload();
await page.waitForTimeout(300);
ok((await page.locator(".chip.done").count()) === 10, "progress persisted after reload (localStorage)");

console.log("— ui extras —");
await page.click("#hint-btn");
ok(await page.locator("#hint").isVisible(), "hint toggle works");
await page.click("#cheat-btn");
await page.waitForTimeout(200);
const cdbg = await page.evaluate(() => {
  const d = document.getElementById("cheat");
  return { exists: !!d, open: d.open, inDOM: document.contains(d),
    btnListeners: "n/a", nodeName: d ? d.nodeName : null };
});
console.log("cheat debug:", JSON.stringify(cdbg));
ok(await page.evaluate(() => document.getElementById("cheat").open), "cheat sheet dialog opens");
await page.keyboard.press("Escape");
await page.click("#reset-btn");
ok((await page.inputValue("#editor")).length > 0, "reset restores starter CSS");
ok((await errors.length) === 0, "zero console/page errors across full session");

await browser.close();
console.log(`\n${pass} passed, ${fail} failed`);
if (errors.length) console.log(errors.join("\n"));
process.exit(fail || errors.length ? 1 : 0);
