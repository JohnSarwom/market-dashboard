# SCPNG Market Dashboard — Changelog

---

## March 2026

### WordPress / Vercel Embedding

**`vercel.json` (new file)**
Added Vercel response headers to allow the dashboard to be embedded in an iframe on any external site (e.g. WordPress/Elementor):
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "ALLOWALL" },
        { "key": "Content-Security-Policy", "value": "frame-ancestors *" }
      ]
    }
  ]
}
```
Without this, browsers block iframe embedding with a "refused to connect" error.

**WordPress shortcode (Code Snippets plugin)**
Use the following shortcode to embed the dashboard in Elementor or any WordPress page:
```php
function market_dashboard_embed() {
    return '<iframe src="https://market-dashboard-scpng.vercel.app/" width="100%" height="800px" style="border:none; border-radius:16px; overflow:hidden;" allowfullscreen></iframe>';
}
add_shortcode('market_dashboard', 'market_dashboard_embed');
```
- Use the **production URL** (`market-dashboard-scpng.vercel.app`), not the branch preview URL
- The PHP return string must be on a single line (no line breaks inside the string)
- `border-radius:16px` on the iframe matches the `rounded-2xl` on the app root

---

### Rounded Corners — `App.jsx`

Added `rounded-2xl` (16px border radius) to the root div so the dashboard has soft rounded corners when embedded:
```jsx
<div className="w-screen h-screen overflow-hidden bg-bg text-text font-sans antialiased rounded-2xl">
```

---

### Dropdown Fix for iframe — `ThreeDotsMenu.jsx`

**Problem:** The three-dot dropdown was not visible when the dashboard was embedded in an iframe on WordPress/Elementor. Root cause: `html, body { overflow: hidden }` in `index.css` can trap `position: absolute` children of `position: fixed` elements in some browsers inside iframes.

**Fix:** Changed the dropdown from `position: absolute` (relative to its parent) to `position: fixed` with coordinates calculated from the button's actual viewport position via `getBoundingClientRect()`. This escapes all overflow containers.

Key changes:
- Added `buttonRef` to the three-dot button
- Added `dropPos` state `{ top, right }` — calculated on click
- Dropdown now uses `style={{ position: 'fixed', top: dropPos.top, right: dropPos.right }}`
- z-index raised from `400` to `9999` for maximum stacking guarantee

---

### Refresh Button — `ThreeDotsMenu.jsx`

Added a **Refresh** item as the first entry in the three-dot dropdown menu:

| Menu item | Action |
|---|---|
| **Refresh** | `window.location.reload()` — reloads the entire dashboard |
| Fullscreen | (unchanged) |
| Light / Dark Mode | (unchanged) |
| Admin Login | (unchanged) |
| Export Data | (unchanged) |

A matching `IconRefresh` SVG icon was added alongside the existing icons.

---

### Auto-Hide Navigation Bar

The navigation bar now auto-hides after 3 seconds and reveals on hover. This gives the dashboard a cleaner, more immersive look — especially when embedded.

#### Behaviour
1. On load, the nav is visible
2. 3 seconds after the intro overlay closes, the nav slides up out of view (eases out)
3. The progress bar, ticker strip, and content area all slide up to fill the space
4. Hovering over the top ~12px of the screen brings the nav back (eases in)
5. While the mouse is over the nav it stays visible; leaving the nav starts a 0.6s countdown before it hides again

#### Files changed

**`App.jsx`**
- New state: `navVisible` (boolean, starts `true`)
- New ref: `hideNavTimer`
- New functions: `showNav()`, `scheduleHideNav()`
- `useEffect` on `showIntro` — starts the 3s auto-hide timer once the intro completes
- Added invisible hover-trigger `<div>` at `top-0`, `z-[302]`, height 12px when nav is hidden / 50px when visible
- Passes `navVisible`, `onMouseEnter={showNav}`, `onMouseLeave={scheduleHideNav}` to `NavigationBar`
- Passes `navVisible` to `ProgressBar` and `Strip`
- Content area `<div>` transitions `top` between `96px` (nav visible) and `46px` (nav hidden)

**`NavigationBar.jsx`**
- New props: `navVisible`, `onMouseEnter`, `onMouseLeave`
- Root div now has:
  ```js
  style={{ transform: navVisible ? 'translateY(0)' : 'translateY(-100%)', transition: 'transform 0.35s ease' }}
  ```

**`ProgressBar.jsx`**
- New prop: `navVisible`
- `top` transitions between `50px` (nav visible) and `0px` (nav hidden) with `transition: 'top 0.35s ease'`
- When nav is hidden, the green progress line sits at the very top edge of the screen as a subtle indicator

**`Strip.jsx`**
- New prop: `navVisible`
- `top` transitions between `52px` (nav visible) and `2px` (nav hidden) with `transition: 'top 0.35s ease'`

All four transitions use the same `0.35s ease` duration so the layout shifts in sync.

---

*Last updated: March 2026*
