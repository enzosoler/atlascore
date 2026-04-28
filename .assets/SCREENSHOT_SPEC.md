# atlas.core — App Store Submission Screenshot Spec

Hand this to Codex. Every dimension, color, font, copy line, and spacing value is exact. Do not change any value without flagging.

---

## 0. Brand tokens (use everywhere)

### Colors (hex, exact, never substitute)
- `paper` = `#efe9da` — light cream background
- `ink` = `#0a0a0a` — near-black foreground
- `accent` = `#e8b500` — sulfur yellow / amber
- `error` = `#c65b4b` — only if needed for error states
- Card surface (dark variant): `#19150f`
- Card surface elevated (dark variant): `#231c14`
- Card surface (light variant): `#e7dec6`
- Body text on paper: `rgba(10,10,10,0.76)`
- Dim text on paper: `rgba(10,10,10,0.64)`
- Mute text on paper: `rgba(10,10,10,0.50)`
- Hairline / borders on paper: `rgba(10,10,10,0.10)`
- Body text on ink: `rgba(239,233,218,0.76)`
- Dim text on ink: `rgba(239,233,218,0.60)`
- Hairline on ink: `rgba(239,233,218,0.10)`

### Fonts (in priority order — first available wins on system)
- `display`: `-apple-system, "SF Pro Display", "SF Pro", system-ui, sans-serif`
- `body`: `-apple-system, "SF Pro Text", "SF Pro", system-ui, sans-serif`
- `mono`: `ui-monospace, "SF Mono", "JetBrains Mono", Menlo, monospace`
- `brand`: `"Archivo Black", "Arial Black", sans-serif` — used **only** for headlines that read like a logotype, and the lockup. Always lowercase. Letter-spacing `-0.04em`. Line-height `0.9`.

### Radii (border-radius, px)
- chip: `8`
- button: `12`
- input: `14`
- card: `18`
- sheet: `24`

### Type scale rules
- Eyebrow / labels: `mono`, 11px, letter-spacing 2, uppercase, color `dim`
- Body: `body`, 16px, line-height 1.55
- Section title: `display`, 28px, weight 700
- Hero headline: `brand`, lowercase, 56px, letter-spacing -0.04em, line-height 0.9
- The accent word inside a headline gets `color: accent` — everything else `ink`

### Brand mark (icon)
Black rounded-square (radius ~22% of width). Inside: cream heart filled, sulfur ECG pulse line crossing it horizontally. Already in repo at `ios/App/App/Assets.xcassets/AppIcon.appiconset/1024.png`. Do not redraw — use that asset and downscale.

---

## 1. iPhone Paywall — Subscription Review Screenshot (one PNG re-used for all 3 IAP slots)

### Output
- **Filename:** `paywall-review-screenshot.png`
- **Save path:** `/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/.assets/paywall-review-screenshot.png`
- **Dimensions:** **1290 × 2796 px** (iPhone 15 Pro Max @3x — Apple's required screenshot size for 6.7"/6.9" devices)
- **Format:** PNG, RGB, no alpha, 72 DPI metadata
- **Background:** `paper` (#efe9da)

### Layout (top to bottom, in 3x device pixels)
Padding: 64px top, 64px left/right, 96px bottom.

1. **Status bar mock** (top 132px)
   - Time `9:41` left, font `body` 51px weight 600 ink
   - Right-side cluster: signal/wifi/battery glyphs (use SF Symbols equivalents). All ink.

2. **Top app row** — 132px tall, full-width
   - Left: brand mark icon (use the 180.png from AppIcon.appiconset, displayed 96×96)
   - Right of mark, vertically centered: wordmark `atlas.core` font `brand` 60px lowercase ink

3. **Eyebrow line** (32px below top row)
   - Text: `PRO MEMBERSHIP`
   - Font: `mono` 33px, letter-spacing 6px, uppercase, color `dim`

4. **Hero headline** (24px below eyebrow)
   - Text on two lines: `unlock the` then `full system.`
   - The word `system` colored `accent` (#e8b500); rest `ink`
   - Font: `brand`, 168px, lowercase, letter-spacing `-0.04em`, line-height `0.9`

5. **Subtitle** (48px below headline, max-width 870px)
   - Text: `Unlimited AI logs, full history, AI insights, photo scanner, and unlimited progress photos.`
   - Font: `body` 51px, line-height 1.55, color body-on-paper

6. **Plan cards row** (132px below subtitle)
   - 3 cards in a horizontal row, equal width, gap 48px between
   - Each card: 333px wide, 540px tall, padding 84px, radius 54px (this is `card` radius scaled to @3x), border 6px
   - Yearly card (middle, **selected** state): border `accent` (#e8b500), background `rgba(232,181,0,0.08)`. Add a "BEST VALUE" pill above the card (top -33px, right 48px): pill bg `accent`, text `ink`, font `mono` 27px, weight 700, letter-spacing 1.8, uppercase, padding 12px 24px, radius 999px.
   - Weekly + Monthly cards: border `rgba(10,10,10,0.10)`, transparent bg
   - Inside each card, top to bottom:
     - Cadence label, font `mono` 33px, letter-spacing 3, uppercase, color `dim`
     - Price line (large), font `display` weight 700, 144px, ink. Examples: `$3.99`, `$9.99`, `$79`
     - Below price, secondary line, font `body` 36px, color `dim`. Example for weekly: `per week`. For yearly: `per year — save 75%`.

7. **Trial banner** (84px below cards, 870px wide, centered)
   - Padding 60px 72px, radius 54px, bg `rgba(232,181,0,0.12)`, 6px border `accent`
   - Inside row: small accent dot 24px, then text `7-day free trial. Cancel anytime.`
   - Text: font `body` 45px weight 500, ink

8. **Primary CTA button** (84px below trial banner, full width within padding)
   - Height 240px, radius 36px (button radius scaled @3x), bg `ink`, text `paper`
   - Label: `Start Free Trial`
   - Font: `display` 60px, weight 700, letter-spacing 0px

9. **Secondary line** (48px below CTA, centered)
   - Text: `Restore Purchase` left side, `Terms` middle, `Privacy` right side, separated by · (mono dot)
   - Font: `mono` 33px, letter-spacing 1.8, uppercase, color `dim`

10. **Home indicator** (bottom-most 48px tall element, centered, 432px wide)
    - Round-rect, `rgba(10,10,10,0.64)`

### What MUST be visible to satisfy Apple
- All 3 cadence prices: `$3.99`, `$9.99`, `$79`
- Trial language: `7-day free trial`
- Brand: `atlas.core` wordmark and the heart-pulse mark
- A primary purchase CTA

### What MUST NOT be visible
- The phrase `no credit card`
- Any `Performance` tier wording
- The dollar sign `$19` or `$159` (those are the deleted Performance tier)

---

## 2. Apple Watch screenshots (3 frames, 410×502 each)

### Output
- **Save path:** `/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/.assets/watch-screenshots/`
- **Dimensions:** **410 × 502 px** (Apple Watch Ultra 2 / Series 10 49mm — covers all newer watches)
- **Format:** PNG, RGB, no alpha
- **Background:** `ink` (#0a0a0a) for the watch face area; outside the rounded screen, transparent or matching neighboring pixel — but since 410×502 IS the watch screen size, the entire image is the watch face. No bezels.

Each watch face has:
- Outer corner radius **88px** (matches Apple Watch Ultra crown radius)
- Top status row at y=0 to 60px:
  - Left: app name, font `mono` 18px, weight 700, letter-spacing 1, color `accent` (#e8b500). Example: `ATLAS.CORE`
  - Right: time `9:41`, font `display` 30px, weight 600, color `paper`
- Content area: y=60 to y=502, padding 24px left/right

### Frame 1 — `01-main-list.png` (Main list / app launcher)
Same content as the existing mockup. Replicate exactly:
- 4 stacked rows, gap 12px, first row at y=88
- Row dimensions: width 362px (24px side padding), height 78px, radius 24px
- Row 1 (selected, primary CTA — workout): bg `accent` (#e8b500), text `ink`
  - Left circular icon 48×48 at left edge inset 12px: `ink` bg, cream heart-pulse glyph inside
  - Title: `Push A`, font `display` 24px weight 700
  - Subtitle: `Today · 5 ex`, font `body` 14px, color `rgba(10,10,10,0.64)`
- Row 2 (not selected — log meal): bg `#19150f`, text `paper`
  - Icon: utensils glyph (◉)
  - Title: `Log meal`, font `display` 24px weight 700
- Row 3 (not selected — weigh-in): same pattern
  - Icon: scale glyph
  - Title: `Weigh-in`
- Row 4 (not selected — water): same pattern with right-aligned counter
  - Icon: droplet glyph
  - Title: `Water` + right side `6 / 8` font `mono` 18px

### Frame 2 — `02-today-glance.png` (Daily fuel / calorie ring)
- Top status row: left `TODAY` (mono uppercase accent), right `9:41`
- Centered ring: y=148, diameter 230px, stroke 18px
  - Background ring: `rgba(239,233,218,0.18)`
  - Progress arc: 65% sweep starting at 12 o'clock, color `accent`
- Inside ring, centered text stack (vertical):
  - Tiny label `FUEL`, mono 14px uppercase color dim-on-ink, weight 600
  - Number `1,248`, font `display` 56px, weight 700, color `paper`
  - Sub `of 2,550 kcal`, body 12px, color dim-on-ink
- Below ring, single row (y=410): macros `P 92   C 142   F 38`, font `mono` 16px, weight 600, color `paper`. Each label/value pair has the label `paper` and the value also `paper`; visually separated by 24px.
- Page indicator dots at bottom (y=470): 3 dots, middle one `paper`, sides `rgba(239,233,218,0.30)`. 8px each, gap 8px, centered.

### Frame 3 — `03-active-workout.png` (Logging a set, mid-workout)
- Top status: left `2 / 5` (mono uppercase accent), right `9:41`
- y=70: label `BENCH PRESS`, font `mono` 16px uppercase, color dim-on-ink
- y=98: subtitle `Set 3 of 4 · last 80×8`, font `body` 14px, color dim-on-ink
- y=160: huge weight readout
  - `82.5` font `display` 110px weight 800 color `paper` (left-aligned at x=24)
  - `kg` font `display` 36px weight 600 color dim-on-ink, baseline-aligned with the bottom of `82.5`
- y=300: reps line `× 8 reps` font `display` 40px weight 600 color `paper` left, `accent` for the `× 8` numeral
- y=400: action bar — three circular buttons in a row, vertically centered, gap 16px, centered horizontally:
  - Minus button: 60px circle, bg `#231c14`, paper minus glyph
  - Check button (primary): 80px circle, bg `accent`, ink checkmark glyph
  - Plus button: 60px circle, bg `#231c14`, paper plus glyph

---

## 3. (Conditional) iPad 13-inch screenshot — only build IF you're keeping iPad support

If you restrict the build to iPhone-only (`TARGETED_DEVICE_FAMILY = "1"` in `ios/App/App.xcodeproj/project.pbxproj`), skip this entire section. Otherwise produce these.

### Output
- **Save path:** `/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/.assets/ipad-screenshots/`
- **Dimensions:** **2064 × 2752 px** (13-inch iPad Pro M4 portrait)
- **Format:** PNG, RGB, no alpha
- **Background:** `paper` (#efe9da)
- **Number of frames:** 3 minimum

The iPad design is the same paywall content as iPhone but with two-column layout and more breathing room:
- Left column (max-width 50% of canvas, padding 192px left, 96px top): wordmark, eyebrow, hero headline, subtitle, trial banner, primary CTA. Same fonts/colors as iPhone but display sizes scaled +25%.
- Right column: 3 plan cards stacked vertically (not horizontal), each card 720px wide, gap 36px between. Same card styling as iPhone paywall.

---

## 4. Quality bar — every output must pass this checklist

For each screenshot:
- [ ] Pixel-exact dimensions (no off-by-one)
- [ ] No alpha channel (RGB only)
- [ ] PNG, optimize=true (DEFLATE)
- [ ] All text legible at 100% (no jagged sub-pixel rendering)
- [ ] Brand fonts loaded — if `Archivo Black` is not available on the rendering machine, install it first; do not silently fall back
- [ ] No placeholder text (`Lorem`, `Sample`, `[…]`)
- [ ] No dev artifacts (debug overlays, console output, layout guides)
- [ ] Color values match the hex tokens in §0 exactly — no rounded approximations
- [ ] No `Performance` tier copy anywhere
- [ ] No `no credit card required` copy anywhere

---

## 5. Where to deliver

Drop all files in:
- `/.assets/paywall-review-screenshot.png` (1 file)
- `/.assets/watch-screenshots/01-main-list.png`, `02-today-glance.png`, `03-active-workout.png` (3 files)
- `/.assets/ipad-screenshots/01.png`, `02.png`, `03.png` (3 files, only if keeping iPad)

I'll upload them to App Store Connect once they're in those paths.
