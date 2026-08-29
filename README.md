# Position Quest

A free, open-source game that teaches CSS `position` — like Flexbox Froggy, but for positioning. Play at [css-positions.techwebster.com](https://css-positions.techwebster.com).

Write real CSS in a live editor to land a "hero" box on a target mark across 10 blueprint-themed drafting levels:

1. `position: relative` + offset properties
2. Negative offsets
3. `position: absolute` (top/right anchoring)
4. Absolute centering (`inset: 0; margin: auto`)
5. Anchoring from bottom/right
6. `z-index` stacking (above)
7. `z-index` stacking (below)
8. `position: fixed` (viewport anchoring)
9. Negative offsets + `calc()`
10. Boss: fixed + centered

Progress is saved in `localStorage`. Includes a per-level hint system and a position cheat sheet.

## Run

Static site — no build step. Serve the folder:

```sh
python3 -m http.server 8000
```

## Test

End-to-end suite (Playwright, headless Chromium) that plays all 10 levels through the real editor UI:

```sh
node test-e2e.mjs
```
