# SCPNG Market Dashboard — Documentation

**Securities Commission of Papua New Guinea**
Live market data display dashboard for the KPort Moresby Exchange (KPEX).

---

## Table of Contents

1. [Overview](#overview)
2. [Getting Started](#getting-started)
3. [Project Structure](#project-structure)
4. [Tech Stack](#tech-stack)
5. [Components Reference](#components-reference)
6. [Data Model](#data-model)
7. [Theme System](#theme-system)
8. [Per-Company Brand Theming](#per-company-brand-theming)
9. [Admin Panel](#admin-panel)
10. [Three-Dot Menu Features](#three-dot-menu-features)
11. [Export Feature](#export-feature)
12. [Adding or Updating Company Logos](#adding-or-updating-company-logos)
13. [Company Brand Colors Reference](#company-brand-colors-reference)
14. [Persistence & localStorage](#persistence--localstorage)

---

## Overview

The SCPNG Market Dashboard is a fullscreen, auto-cycling display board for the Papua New Guinea stock exchange. It is designed to be shown on a large screen in a public or office setting.

**What it does:**
- Cycles through each listed stock automatically, showing price, chart, key metrics and announcements
- Each company slide has a fully branded look using that company's primary and secondary colors
- A Market Table slide shows all stocks at a glance
- A scrolling ticker strip shows real-time price changes across all stocks
- A right-side panel shows the SCPNG Market Index, Top Movers, and Volume Leaders

**Branding note:** The dashboard is published by the **Securities Commission of Papua New Guinea (SCPNG)**. The underlying exchange data source is KPEX (Kina Exchange).

---

## Getting Started

```bash
# Install dependencies
cd app
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

The dev server runs at `http://localhost:5173` by default.

> **Important:** All source code lives in `app/src/`. The file `marketDashboard.html` at the project root is a legacy/unused file — do not edit it.

---

## Project Structure

```
market-dashboard/
├── docs.md                         ← This file
├── app/
│   ├── index.html                  ← Entry HTML (loads Google Fonts)
│   ├── package.json
│   ├── public/
│   │   └── logos/                  ← Place company logo images here
│   │       └── {TICKER}.png        ← e.g. BSP.png, KSL.png
│   └── src/
│       ├── main.jsx                ← React entry point
│       ├── App.jsx                 ← Root component, state management
│       ├── App.css
│       ├── index.css               ← Global styles, CSS variables, Tailwind v4 theme
│       ├── data.js                 ← All stock data, timeframe config, announcements
│       ├── utils.js                ← Helper functions (cls, cs, genC, getDateRange)
│       └── components/
│           ├── NavigationBar.jsx   ← Top nav bar with title, controls, clock
│           ├── ThreeDotsMenu.jsx   ← ⋮ menu (fullscreen, theme, admin login, export)
│           ├── AdminPanel.jsx      ← Full-screen admin editor for companies
│           ├── IntroOverlay.jsx    ← Splash/loading screen on startup
│           ├── ProgressBar.jsx     ← Thin bar below nav showing slide timer
│           ├── Strip.jsx           ← Scrolling ticker strip
│           ├── StockSlide.jsx      ← Individual company detail slide
│           ├── StockChart.jsx      ← Chart.js chart with LTR animation + pin cards
│           ├── RightPanel.jsx      ← SCPNG Index, Top Movers, Volume Leaders
│           └── TableSlide.jsx      ← Full market table slide
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 |
| Build tool | Vite 7 |
| Styling | Tailwind CSS v4 (with `@theme` CSS variables) |
| Charting | Chart.js 4 (via `react-chartjs-2`) |
| Fonts | Syne (headings/body), Space Mono (data/mono) — Google Fonts |
| Export Excel | SheetJS (`xlsx` v0.18) |
| Export PDF | jsPDF v4 + jspdf-autotable v5 |

---

## Components Reference

### `App.jsx`
The root component. Manages all global state:

| State | Type | Description |
|---|---|---|
| `showIntro` | boolean | Whether the splash screen is visible |
| `curSlide` | number | Active slide index (0–13 for stocks, 14 for table) |
| `curTFIdx` | number | Active timeframe index within TF_SEQUENCE |
| `paused` | boolean | Whether auto-advance is paused |
| `resetKey` | number | Incremented to force ProgressBar reset |
| `darkMode` | boolean | `true` = dark theme (default), `false` = light |
| `companyData` | array | Merged stock data with localStorage customisations |
| `showAdminPanel` | boolean | Whether AdminPanel is shown |

**Key behaviors:**
- Applies `data-theme="dark"/"light"` to `<html>` when `darkMode` changes
- Sets `--accent` / `--color-accent` CSS variables when `curSlide` changes, pulling from `companyData[curSlide].color1`
- Restores default accent when on the table slide
- Saves/loads company customisations from `localStorage` key `scpng_company_data`

---

### `NavigationBar.jsx`
Fixed top bar (50px height). Contains:
- **Left:** `MARKET DASHBOARD — Securities Commission of PNG`
- **Centre:** Current slide label, navigation dots (click to jump to any slide)
- **Right:** PAUSE/RESUME button · SESSION OPEN indicator · live clock (GMT+10) · `ThreeDotsMenu`

Props: `curSlide`, `paused`, `onTogglePause`, `onDotClick`, `darkMode`, `onToggleDarkMode`, `onOpenAdmin`

---

### `ThreeDotsMenu.jsx`
The `⋮` button at the far right of the nav bar. Opens a dropdown with four actions:

| Menu item | What it does |
|---|---|
| **Fullscreen** | Toggles browser fullscreen (`document.requestFullscreen`). Label/icon switches to "Exit Fullscreen" when active. |
| **Light Mode / Dark Mode** | Switches global theme. Sun icon = currently dark (click for light). Moon = currently light (click for dark). |
| **Admin Login** | Opens a login modal. On success, opens the Admin Panel. |
| **Export Data** | Opens the export picker (Excel or PDF). |

---

### `AdminPanel.jsx`
Full-screen overlay for managing company branding. Accessible after admin login.

**Layout:**
- Left sidebar: scrollable list of all 13 companies, each showing their ticker, full name, and a two-tone color swatch
- Right area: editor for the selected company

**Editor fields per company:**
- **Company Name** — freetext input, updates the display name shown on slides
- **Logo** — URL input OR file upload (converted to base64 data URL). Supports PNG, JPG, SVG, etc.
- **Primary Color (`color1`)** — native color picker + hex input. Used for: chart line (up days), nav accent, active buttons, dots, pin card highlights
- **Secondary Color (`color2`)** — native color picker + hex input. Used for: chart gradient fill
- **Live Preview** — mini mock-up showing a mini nav bar, a company card with the logo and a mock chart, and a two-color swatch bar

**Buttons:**
- **Reset to Default** — restores `data.js` defaults for that company
- **Save Changes** — persists to localStorage immediately; button turns green with ✓ SAVED confirmation

---

### `StockSlide.jsx`
The main company detail slide. Rendered for all 13 stocks simultaneously (only the active one is visible via opacity/transform). Uses CSS animations to fade in sections.

**Layout:**
- Left (flexible):
  - Company logo box (with brand color accent bar on left edge)
  - Company name, price, change, session stats
  - Announcements ticker
  - Timeframe selector buttons (1D / 3D / 5D / 1M / 3M / 6M / 1Y)
  - `StockChart`
  - Stats row (52W High/Low, Prev Close, Bid, Offer)
  - Footer disclaimer
- Right (248px fixed): `RightPanel`

**Logo resolution order:**
1. `stock.logo` (from admin panel, URL or base64)
2. `/logos/{TICKER}.png` (static file in `public/logos/`)
3. Falls back to ticker text placeholder if both fail

---

### `StockChart.jsx`
Chart.js line chart with custom features.

**Props:** `stock`, `prices`, `labels`, `isUp`, `brandColor`, `brandColor2`

**Features:**
- **Left-to-right reveal animation** — custom `leftToRight` plugin clips the canvas during animation so the chart draws from left to right. The Y axis is not clipped (uses `beforeDatasetsDraw`/`afterDatasetsDraw` hooks).
- **Brand colors:** `brandColor` (= `stock.color1`) is used for up-day line color; `brandColor2` (= `stock.color2`) is used for the gradient fill. Down days use red (`#ff5252`).
- **Pin cards** — after animation completes, 3 key data points are annotated with floating cards showing price, change, H/L, volume, and 52W range bar. Each pin uses `brandColor` for up moves.
- **Ghost cards** — lighter mini-cards appear between pins showing intermediate price points.
- **Y axis** — positioned on the right, with `afterFit` forcing 72px width to prevent layout shift.
- Re-renders whenever `prices`, `labels`, `isUp`, `brandColor`, or `brandColor2` change.

---

### `RightPanel.jsx`
Fixed-width right column (248px). Shows:
- **SCPNG Market Index** — KPEX Composite value, total market cap, day change
- **Top Movers** — top 5 stocks by % change
- **Volume Leaders** — top 4 stocks by volume with a bar indicator

---

### `Strip.jsx`
Scrolling ticker strip below the nav bar. Shows all stock tickers with price and % change. Clicking a ticker pauses the dashboard and jumps to that stock.

---

### `IntroOverlay.jsx`
Splash screen shown on first load. Fades out after `INTRO_DURATION` (5 seconds).

---

### `ProgressBar.jsx`
Thin bar just below the nav bar showing time remaining for the current slide/timeframe. Resets on `resetKey` change.

---

### `TableSlide.jsx`
Full market summary table showing all 13 stocks in a grid with price, change, volume, market cap. The last slide in the rotation.

---

## Data Model

### Stock object (`data.js`)

```js
{
  t:      'BSP',                   // Ticker symbol
  n:      'Bank South Pacific',    // Company name
  p:      14.80,                   // Current price (PGK)
  pv:     14.60,                   // Previous close
  h:      15.00,                   // Day high
  l:      14.55,                   // Day low
  v:      12400,                   // Volume (trades)
  mc:     '11.2B',                 // Market cap string
  pe:     '8.4x',                  // P/E ratio
  dv:     '6.8%',                  // Dividend yield
  h52:    16.20,                   // 52-week high
  l52:    12.10,                   // 52-week low
  o:      14.60,                   // Session open price
  color1: '#1976D2',               // Primary brand color
  color2: '#64B5F6',               // Secondary brand color
  logo:   '',                      // Logo URL or base64 (empty = use /public/logos/)
}
```

### Timeframe config (`TF_CONFIG`)

| Key | Days | Label |
|---|---|---|
| 1D | 1 | today's session |
| 3D | 3 | 3 trading days |
| 5D | 5 | 5 trading days |
| 1M | 22 | 1 month |
| 3M | 66 | 3 months |
| 6M | 130 | 6 months |
| 1Y | 252 | 1 year |

### Timing constants

| Constant | Value | Description |
|---|---|---|
| `TF_DURATION` | 30,000 ms | Time per timeframe per stock |
| `TABLE_DURATION` | 12,000 ms | Time on the market table slide |
| `INTRO_DURATION` | 5,000 ms | Splash screen duration |

---

## Theme System

### CSS Variables

Defined in `app/src/index.css` using Tailwind v4's `@theme` directive plus `:root`:

| Variable | Dark value | Light value |
|---|---|---|
| `--bg` | `#0d0205` | `#faf4f4` |
| `--surface` | `#160407` | `#ffffff` |
| `--card` | `#1e060a` | `#f4ecec` |
| `--border` | `#3d0c10` | `#d8c0c0` |
| `--accent` | `#e8b800` | `#b8920a` |
| `--red` | `#ff5252` | `#cc1111` |
| `--text` | `#f0e6e6` | `#1a0406` |
| `--muted` | `#8a6870` | `#7a5050` |
| `--dim` | `#a07880` | `#4a2828` |

### Switching themes

- **Dark mode** (default): `document.documentElement.dataset.theme` is absent or `"dark"` — `:root` variables apply
- **Light mode**: `data-theme="light"` on `<html>` — `[data-theme="light"]` block overrides the `:root` variables

Both `--name` (used in manual CSS) and `--color-name` (used by Tailwind utilities like `bg-bg`, `text-text`) are overridden.

---

## Per-Company Brand Theming

When the dashboard advances to a company slide, `App.jsx` overrides two CSS variables using inline styles (which have higher specificity than class/rule styles):

```js
document.documentElement.style.setProperty('--accent', company.color1);
document.documentElement.style.setProperty('--color-accent', company.color1);
```

This instantly re-colors every element that uses `--accent`:
- Navigation dots (active dot)
- PAUSE/RESUME button border/text when active
- Progress bar fill
- Timeframe selector active button
- SESSION OPEN blinking dot
- Stock ticker strip active/highlighted items
- Logo box accent bar (`color1` directly via inline style in StockSlide)

When the table slide is active, these inline styles are removed, restoring the theme default.

The **chart** uses brand colors directly via props (not CSS variables):
- `brandColor` (= `color1`) → chart line (up days) + pin card dots/lines
- `brandColor2` (= `color2`) → chart gradient fill background

---

## Admin Panel

### Access

1. Click **⋮** (three-dot menu) in the top-right of the nav bar
2. Click **Admin Login**
3. Enter credentials:
   - **Username:** `scpng@123`
   - **Password:** `scapng@123`
4. The Admin Panel opens full-screen; the dashboard auto-pauses

### What you can edit

| Field | Notes |
|---|---|
| Company Name | Shown on the slide, in the ticker strip, and in exports |
| Logo | Enter a public URL, or click "Choose Image…" to upload a local file. Uploaded images are stored as base64 in localStorage. |
| Primary Color (`color1`) | Click the color swatch or type a hex value. Affects chart line, all nav accents, active states. |
| Secondary Color (`color2`) | Affects chart gradient fill area. |

### Saving

Click **Save Changes** — changes persist immediately to `localStorage` and take effect on the next slide transition (or instantly if that company is currently shown).

Click **Reset to Default** to restore the original values from `data.js`.

Click **← BACK TO DASHBOARD** to close the admin panel.

---

## Three-Dot Menu Features

| Feature | Details |
|---|---|
| **Fullscreen** | Calls `document.documentElement.requestFullscreen()`. The button label and icon update to reflect current state. Useful for kiosk/display mode. |
| **Light / Dark Mode** | Toggles `data-theme` attribute on `<html>`. Persists for the session (not saved to localStorage — resets to dark on reload). |
| **Admin Login** | See [Admin Panel](#admin-panel) section. |
| **Export Data** | Opens a modal with two options — see [Export Feature](#export-feature). |

---

## Export Feature

### Excel (`.xlsx`)

Uses **SheetJS** (`xlsx`). Generates a workbook with two sheets:

**Sheet 1 — Market Data**

| Column | Description |
|---|---|
| Ticker | Stock ticker symbol |
| Company | Full company name |
| Price (K) | Current price in PGK |
| Prev Close | Previous closing price |
| Open | Session open price |
| Day High / Day Low | Intraday range |
| Volume | Trade count |
| Change % | Calculated from `(price - prevClose) / prevClose` |
| Mkt Cap (PGK) | Market capitalisation |
| P/E Ratio | Price/Earnings ratio |
| Div Yield | Dividend yield |
| 52W High / Low | 52-week price range |

Columns are auto-sized. File is named `SCPNG_Market_Data_{date}.xlsx`.

**Sheet 2 — Info**

Contains export metadata: export date, stock count, source attribution.

### PDF (`.pdf`)

Uses **jsPDF** + **jspdf-autotable**. Generates a landscape A4 report with:
- Dark SCPNG branded header (navy background, amber title)
- Data table with alternating row shading
- Change % column color-coded (amber for gains, red for losses)
- Footer on every page: session/settlement disclaimer + page numbers

File is named `SCPNG_Market_Data_{date}.pdf`.

---

## Adding or Updating Company Logos

### Method 1 — Static file (recommended for permanent logos)

Place a PNG image at:
```
app/public/logos/{TICKER}.png
```
Example: `app/public/logos/BSP.png`

The image should ideally be square (e.g. 200×200px), on a transparent or dark background.

### Method 2 — Admin Panel upload

1. Open Admin Panel (see [Admin Panel](#admin-panel))
2. Select the company
3. Either paste a public image URL, or click **Choose Image…** to upload a local file
4. Click **Save Changes**

Uploaded images are stored as base64 in `localStorage`. They take priority over static files. If the image URL/upload is cleared, the static file is used as fallback.

---

## Company Brand Colors Reference

Default colors assigned in `data.js`. All editable via the Admin Panel.

| Ticker | Company | Primary (color1) | Secondary (color2) |
|---|---|---|---|
| BSP | Bank South Pacific | `#1976D2` blue | `#64B5F6` light blue |
| KSL | Kina Securities Ltd | `#00897B` teal | `#4DB6AC` light teal |
| CPL | CPL Group | `#EF6C00` orange | `#FFA726` light orange |
| SST | Steamships Trading | `#5E35B1` purple | `#9575CD` light purple |
| NEM | Newmont Corporation | `#F9A825` amber | `#FFD54F` light amber |
| STO | Santos Limited | `#0097A7` teal-blue | `#4FC3F7` light blue |
| NIU | Niuminco Group | `#43A047` green | `#81C784` light green |
| NGP | New Guinea Islands Produce | `#7CB342` olive | `#AED581` light olive |
| PLC | Pacific Lime & Cement | `#546E7A` steel blue | `#90A4AE` light steel |
| KAM | Kina Asset Management | `#3949AB` indigo | `#7986CB` light indigo |
| KAML | Kina Asset Mgmt (Listed) | `#039BE5` sky blue | `#4FC3F7` light blue |
| NCM | Newcrest Mining | `#BF6900` dark amber | `#FFB300` gold |
| TTM | Tininga Ltd | `#D81B60` deep pink | `#F48FB1` light pink |

---

## Persistence & localStorage

| Key | Contents | Set by |
|---|---|---|
| `scpng_company_data` | JSON object keyed by ticker. Each entry has `{ n, logo, color1, color2 }`. Only stores differences from `data.js` defaults (though currently saves all fields on save). | Admin Panel "Save Changes" |

**To reset all customisations**, open browser DevTools → Application → Local Storage → delete `scpng_company_data`.

**Dark/light mode preference** is not persisted — the dashboard always starts in dark mode.

---

*Last updated: March 2026*
