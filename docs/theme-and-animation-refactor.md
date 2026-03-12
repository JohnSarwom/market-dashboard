# Theme & Animation Refactor — Session Log

**Date:** March 2026
**Scope:** `app/src/` — all UI components, CSS theme, chart/animation system
**Sessions:** 3 successive audits + fixes

---

## 1. Theme Overhaul

### 1.1 Dark Mode — Maroon → TradingView Navy

The original dark theme used a deep maroon/blood-red palette that felt heavy and brand-limited.
It was replaced with a TradingView-inspired dark navy that is neutral, professional, and lets
company brand colours (color1/color2) stand out.

**File:** `src/index.css`

| Variable | Old (maroon) | New (TradingView navy) |
|---|---|---|
| `--bg` | `#0d0205` | `#131722` |
| `--surface` | `#160407` | `#1e222d` |
| `--card` | `#1e060a` | `#2a2e39` |
| `--border` | `#3d0c10` | `#363a45` |
| `--text` | `#f0e6e6` | `#d1d4dc` |
| `--muted` | `#8a6870` | `#787b86` |
| `--dim` | `#a07880` | `#9598a1` |
| `--red` | `#ff5252` | `#f23645` |
| `--accent` | `#e8b800` | `#e8b800` (unchanged) |

Both `--name` (manual CSS) and `--color-name` (Tailwind v4 utilities) sets were updated.
The `@theme` block at the top of the file sets the Tailwind defaults for the dark mode.

---

### 1.2 Light Mode — Pinkish → Clean White

The original light theme (`#faf4f4` background) retained rosy/pink tones from the maroon
palette. It was replaced with a clean, neutral white/grey palette.

**File:** `src/index.css` — `[data-theme="light"]` block

| Variable | Old (pinkish) | New (clean white) |
|---|---|---|
| `--bg` | `#faf4f4` | `#ffffff` |
| `--surface` | `#ffffff` | `#f8f9fd` |
| `--card` | `#f4ecec` | `#f0f3fa` |
| `--border` | `#d8c0c0` | `#e0e3eb` |
| `--text` | `#1a0406` | `#131722` |
| `--muted` | `#7a5050` | `#787b86` |
| `--dim` | `#4a2828` | `#4c525e` |
| `--red` | `#cc1111` | `#f23645` |
| `--accent` | `#b8920a` | `#b8920a` (unchanged) |

---

### 1.3 Theme Switching Mechanics (unchanged, confirmed working)

`App.jsx` applies `data-theme="dark"` / `data-theme="light"` to `<html>`.
`[data-theme="light"]` overrides `:root` CSS variables with higher CSS specificity.
Both `--name` and `--color-name` variants are updated so both manual CSS and Tailwind utilities resolve correctly.

**Per-company brand colours are unaffected.** `App.jsx` sets `--accent` and `--color-accent`
via inline styles when a stock slide becomes active, overriding both theme defaults.

---

## 2. Pin Card CSS — Theme-Aware

Pin cards and ghost cards in the chart were previously hardcoded with dark colours.

**File:** `src/index.css` — pin card section

| Class / Property | Old (hardcoded dark) | New (CSS variable) |
|---|---|---|
| `.pin-card` background | `#181f2a` | `var(--card)` |
| `.pin-card` box-shadow | `rgba(0,0,0,.45)` | `rgba(0,0,0,.25)` |
| `.ghost-card` background | `rgba(19,24,32,0.92)` | `var(--surface)` |
| `.ghost-card` border | `rgba(30,42,56,.55)` | `var(--border)` |
| `.pc-date` color | `#5a6a7e` | `var(--muted)` |
| `.pc-lbl` color | `#5a6a7e` | `var(--muted)` |
| `.pc-val` color | `#8a9bb0` | `var(--dim)` |
| `.pc-divider` background | `#1e2a38` | `var(--border)` |
| `.pc-52bar` background | `#1e2a38` | `var(--border)` |
| `.pc-52ends` color | `#5a6a7e` | `var(--muted)` |
| `.gc-date` color | `#5a6a7e` | `var(--muted)` |

---

## 3. Chart Chrome — Theme-Aware (StockChart.jsx)

Chart.js tooltip, axis ticks, grid lines, and axis borders were previously hardcoded dark values.
They now read from live CSS variables at chart creation time.

**File:** `src/components/StockChart.jsx`

```js
const cssVars = getComputedStyle(document.documentElement);
const isDark   = document.documentElement.dataset.theme !== 'light';
const muteColor    = cssVars.getPropertyValue('--muted').trim()   || '#787b86';
const dimColor     = cssVars.getPropertyValue('--dim').trim()     || '#9598a1';
const borderColor  = cssVars.getPropertyValue('--border').trim()  || '#363a45';
const surfaceColor = cssVars.getPropertyValue('--surface').trim() || '#1e222d';
const textColor    = cssVars.getPropertyValue('--text').trim()    || '#d1d4dc';
const gridColor    = isDark ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.06)';
```

Applied to:
- `tooltip.backgroundColor` → `surfaceColor`
- `tooltip.borderColor` → `borderColor`
- `tooltip.titleColor` → `muteColor`
- `tooltip.bodyColor` → `textColor`
- `x.border.color` → `borderColor`
- `x.ticks.color` → `muteColor`
- `y.grid.color` → `gridColor`
- `y.ticks.color` → `muteColor`

Note: The chart re-renders whenever `prices`, `labels`, `isUp`, `brandColor`, or `brandColor2`
change (i.e. on every slide/timeframe transition), so CSS vars are always read fresh.

---

## 4. UI Audit Fixes — Light Mode Invisible Elements

A full component audit revealed 7 elements that were invisible or broken in light mode
due to hardcoded white-based opacity classes.

### 4.1 Announcements Ticker — `src/components/StockSlide.jsx`

```diff
- border border-white/5 bg-white/5
+ border border-border  bg-card

- before:border-white/5
+ before:border-border

- text-[#8a9bb0a6]   (hardcoded dark muted)
+ text-muted

- text-[#5a6a7e80]   (hardcoded dark dim with alpha)
+ text-muted/60
```

### 4.2 Table Row Separators & Hover — `src/components/TableSlide.jsx`

```diff
- border-white/5 hover:bg-[#00e6760a]
+ border-border   hover:bg-card
```

### 4.3 Top Movers Row Separators — `src/components/RightPanel.jsx`

```diff
- border-white/5
+ border-border
```

### 4.4 Ticker Strip — `src/components/Strip.jsx`

```diff
- bg-[#00e67612]          (active item bg)
+ bg-accent/[0.07]

- hover:bg-white/5        (inactive hover)
+ hover:bg-card

- bg-[#00e6761a]          (up badge bg)
+ bg-accent/10

- bg-[#ff52521a]          (down badge bg)
+ bg-red/10
```

### 4.5 PDF Export Header — `src/components/ThreeDotsMenu.jsx`

```diff
- doc.setFillColor(22, 4, 7)        // old maroon #160407
+ doc.setFillColor(19, 23, 34)      // new navy   #131722

- fillColor: [30, 6, 10]            // old maroon table header
+ fillColor: [30, 34, 45]           // new navy   #1e222d

- doc.setTextColor(138, 104, 112)   // old muted pinkish
+ doc.setTextColor(120, 123, 134)   // new muted grey #787b86

- doc.setTextColor(160, 120, 128)   // old footer pinkish
+ doc.setTextColor(120, 123, 134)   // new muted grey
```

---

## 5. Chart & Animation Audit Fixes

A second deep audit of `StockChart.jsx` produced 3 further fixes.

### 5.1 Ghost Card Down-Day Colour Consistency

Ghost cards for down-day intermediate data points used a different red from the rest.

**File:** `src/components/StockChart.jsx` lines 189–190

```diff
- 'rgba(255,82,82,.45)'             // #ff5252 — old red
+ hexToRgba('#f23645', 0.45)        // consistent with downColor

- 'rgba(255,82,82,.7)'
+ hexToRgba('#f23645', 0.7)
```

### 5.2 Gradient Fill Opacity — Light Mode

On a white background, the brand-colour gradient fill at 28% opacity became too pale.
Opacity is now scaled by theme.

**File:** `src/components/StockChart.jsx` lines 249–255

```js
// Before (flat, dark-optimised):
grad.addColorStop(0,   hexToRgba(gradFill, 0.28));
grad.addColorStop(0.4, hexToRgba(gradFill, 0.10));

// After (adaptive):
const gradTop = isDark ? 0.28 : 0.50;
const gradMid = isDark ? 0.10 : 0.20;
grad.addColorStop(0,   hexToRgba(gradFill, gradTop));
grad.addColorStop(0.4, hexToRgba(gradFill, gradMid));
```

### 5.3 Pin Selection — `maxIdx` Fallback

The `pick3Indices` function searches for a price peak to use as one of the 3 annotated
points. When no candidate passes the distance guard (must be >2 from both min and last),
`maxIdx` was left at `0` — placing a pin at the very start of the chart regardless of price.

**File:** `src/components/StockChart.jsx` line 44

```diff
- let maxIdx = 0;
+ let maxIdx = last;   // last price is always a valid, meaningful fallback
```

This ensures all 3 pins always represent meaningful price points:
- **Pin 0** — price minimum
- **Pin 1** — price peak (or last price if no peak qualifies)
- **Pin 2** — most recent price

---

## 6. Files Changed Summary

| File | Changes |
|---|---|
| `src/index.css` | Dark theme → TradingView navy; light theme → clean white; pin card CSS → CSS variables |
| `src/components/StockChart.jsx` | Chart chrome reads CSS vars; ghost down colours; gradient opacity; maxIdx fallback |
| `src/components/StockSlide.jsx` | Announcements ticker: border, bg, text colours |
| `src/components/TableSlide.jsx` | Row borders, hover background |
| `src/components/RightPanel.jsx` | Movers row separator |
| `src/components/Strip.jsx` | Active bg, hover bg, up/down badge backgrounds |
| `src/components/ThreeDotsMenu.jsx` | PDF export header/table colours updated to navy |

---

## 7. Known Remaining Limitations (non-breaking)

| Issue | Location | Notes |
|---|---|---|
| Pin cards don't reposition on window resize | `StockChart.jsx` | `_pinsPlaced` guard prevents re-layout after initial placement. Low risk for kiosk display. |
| `.anim-*` classes don't re-trigger on slide return | `StockSlide.jsx`, `index.css` | Entrance animations (fadeIn) only fire on initial mount. Subsequent visits to the same slide use the outer opacity/translate transition instead. |
| Card overlap on closely-spaced pins | `StockChart.jsx` | No collision detection between pin cards. On 1D/3D timeframes with tight price ranges, cards can overlap. |
| LTR clip ratio is linear; chart easing is `easeInOutQuart` | `StockChart.jsx` | Minor visual mismatch: the clip boundary advances linearly while the line draw is eased. Imperceptible in practice. |

---

*Generated March 2026 — SCPNG Market Dashboard*
