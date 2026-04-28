import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const outRoot = path.join(root, 'screenshots');
const watchOut = path.join(outRoot, 'watch-screenshots');

const icon180 = path.join(root, 'ios/App/App/Assets.xcassets/AppIcon.appiconset/180.png');
const archivoBlack = '/tmp/ArchivoBlack-Regular.ttf';
const sfDisplayRegular = '/Library/Fonts/SF-Pro-Display-Regular.otf';
const sfDisplaySemibold = '/Library/Fonts/SF-Pro-Display-Semibold.otf';
const sfDisplayBold = '/Library/Fonts/SF-Pro-Display-Bold.otf';
const sfDisplayHeavy = '/Library/Fonts/SF-Pro-Display-Heavy.otf';
const sfTextRegular = '/Library/Fonts/SF-Pro-Text-Regular.otf';
const sfTextMedium = '/Library/Fonts/SF-Pro-Text-Medium.otf';
const sfTextSemibold = '/Library/Fonts/SF-Pro-Text-Semibold.otf';
const sfTextBold = '/Library/Fonts/SF-Pro-Text-Bold.otf';
const sfMono = '/System/Library/Fonts/SFNSMono.ttf';

const required = [
  icon180,
  archivoBlack,
  sfDisplayRegular,
  sfDisplaySemibold,
  sfDisplayBold,
  sfDisplayHeavy,
  sfTextRegular,
  sfTextMedium,
  sfTextSemibold,
  sfTextBold,
  sfMono,
];

for (const file of required) {
  if (!fs.existsSync(file)) {
    throw new Error(`Required render asset missing: ${file}`);
  }
}

fs.mkdirSync(watchOut, { recursive: true });

function dataUrl(file, mime) {
  return `data:${mime};base64,${fs.readFileSync(file).toString('base64')}`;
}

const urls = {
  icon: dataUrl(icon180, 'image/png'),
  archivo: dataUrl(archivoBlack, 'font/ttf'),
  sfDisplayRegular: dataUrl(sfDisplayRegular, 'font/otf'),
  sfDisplaySemibold: dataUrl(sfDisplaySemibold, 'font/otf'),
  sfDisplayBold: dataUrl(sfDisplayBold, 'font/otf'),
  sfDisplayHeavy: dataUrl(sfDisplayHeavy, 'font/otf'),
  sfTextRegular: dataUrl(sfTextRegular, 'font/otf'),
  sfTextMedium: dataUrl(sfTextMedium, 'font/otf'),
  sfTextSemibold: dataUrl(sfTextSemibold, 'font/otf'),
  sfTextBold: dataUrl(sfTextBold, 'font/otf'),
  sfMono: dataUrl(sfMono, 'font/ttf'),
};

const baseFonts = `
  @font-face { font-family: "Archivo Black Local"; src: url("${urls.archivo}") format("truetype"); font-weight: 900; font-style: normal; font-display: block; }
  @font-face { font-family: "SF Pro Display Local"; src: url("${urls.sfDisplayRegular}") format("opentype"); font-weight: 400; font-style: normal; font-display: block; }
  @font-face { font-family: "SF Pro Display Local"; src: url("${urls.sfDisplaySemibold}") format("opentype"); font-weight: 600; font-style: normal; font-display: block; }
  @font-face { font-family: "SF Pro Display Local"; src: url("${urls.sfDisplayBold}") format("opentype"); font-weight: 700; font-style: normal; font-display: block; }
  @font-face { font-family: "SF Pro Display Local"; src: url("${urls.sfDisplayHeavy}") format("opentype"); font-weight: 800; font-style: normal; font-display: block; }
  @font-face { font-family: "SF Pro Text Local"; src: url("${urls.sfTextRegular}") format("opentype"); font-weight: 400; font-style: normal; font-display: block; }
  @font-face { font-family: "SF Pro Text Local"; src: url("${urls.sfTextMedium}") format("opentype"); font-weight: 500; font-style: normal; font-display: block; }
  @font-face { font-family: "SF Pro Text Local"; src: url("${urls.sfTextSemibold}") format("opentype"); font-weight: 600; font-style: normal; font-display: block; }
  @font-face { font-family: "SF Pro Text Local"; src: url("${urls.sfTextBold}") format("opentype"); font-weight: 700; font-style: normal; font-display: block; }
  @font-face { font-family: "SF Mono Local"; src: url("${urls.sfMono}") format("truetype"); font-weight: 400 800; font-style: normal; font-display: block; }
`;

const reset = `
  ${baseFonts}
  :root {
    --paper: #efe9da;
    --ink: #0a0a0a;
    --accent: #e8b500;
    --card-dark: #19150f;
    --card-elevated: #231c14;
    --body-paper: rgba(10,10,10,0.76);
    --dim-paper: rgba(10,10,10,0.64);
    --mute-paper: rgba(10,10,10,0.50);
    --hair-paper: rgba(10,10,10,0.10);
    --body-ink: rgba(239,233,218,0.76);
    --dim-ink: rgba(239,233,218,0.60);
    --hair-ink: rgba(239,233,218,0.10);
    --display: "SF Pro Display Local", -apple-system, "SF Pro Display", "SF Pro", system-ui, sans-serif;
    --body: "SF Pro Text Local", -apple-system, "SF Pro Text", "SF Pro", system-ui, sans-serif;
    --mono: "SF Mono Local", ui-monospace, "SF Mono", "JetBrains Mono", Menlo, monospace;
    --brand: "Archivo Black Local", "Archivo Black", "Arial Black", sans-serif;
  }
  * { box-sizing: border-box; }
  html, body { margin: 0; width: 100%; min-height: 100%; }
  body {
    -webkit-font-smoothing: antialiased;
    text-rendering: geometricPrecision;
    font-family: var(--body);
  }
  svg { display: block; }
`;

function pageHtml({ width, height, background, body, styles = '' }) {
  return `<!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=${width}, initial-scale=1" />
      <style>
        ${reset}
        html, body { width: ${width}px; height: ${height}px; overflow: hidden; background: ${background}; }
        #shot { position: relative; width: ${width}px; height: ${height}px; overflow: hidden; background: ${background}; }
        ${styles}
      </style>
    </head>
    <body>
      <div id="shot">${body}</div>
    </body>
  </html>`;
}

function iPhoneStatusGlyphs() {
  return `
    <div class="phone-status-glyphs" aria-hidden="true">
      <div class="bars">
        <i style="height: 17px"></i><i style="height: 25px"></i><i style="height: 33px"></i><i style="height: 41px"></i>
      </div>
      <svg class="wifi" width="48" height="36" viewBox="0 0 48 36" fill="none">
        <path d="M5 12C15.5 3.5 32.5 3.5 43 12" stroke="#0a0a0a" stroke-width="5" stroke-linecap="round"/>
        <path d="M13.5 20.5C19.5 15.5 28.5 15.5 34.5 20.5" stroke="#0a0a0a" stroke-width="5" stroke-linecap="round"/>
        <path d="M22 29C23.3 27.8 24.7 27.8 26 29" stroke="#0a0a0a" stroke-width="5" stroke-linecap="round"/>
      </svg>
      <div class="battery"><div></div></div>
    </div>`;
}

function paywallHtml() {
  const body = `
    <div class="status">
      <div class="time">9:41</div>
      ${iPhoneStatusGlyphs()}
    </div>

    <div class="top-row">
      <img class="app-icon" src="${urls.icon}" alt="">
      <div class="wordmark">atlas.core</div>
    </div>

    <div class="eyebrow">PRO MEMBERSHIP</div>

    <h1 class="hero">
      <span>unlock the</span>
      <span>full <em>system</em>.</span>
    </h1>

    <div class="subtitle">Unlimited AI logs, full history, AI insights, photo scanner, and unlimited progress photos.</div>

    <div class="plans">
      ${planCard('WEEKLY', '$3.99', 'per week')}
      ${planCard('MONTHLY', '$9.99', 'per month')}
      ${planCard('YEARLY', '$79', 'per year &mdash; save 75%', true)}
    </div>

    <div class="trial">
      <span class="trial-dot"></span>
      <span>7-day free trial. Cancel anytime.</span>
    </div>

    <div class="cta">Start Free Trial</div>

    <div class="links">
      <span>RESTORE PURCHASE</span><b>&middot;</b><span>TERMS</span><b>&middot;</b><span>PRIVACY</span>
    </div>

    <div class="home-indicator"></div>
  `;

  const styles = `
    #shot { color: var(--ink); }
    .status {
      position: absolute;
      left: 64px;
      top: 64px;
      width: 1162px;
      height: 132px;
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      padding-top: 23px;
    }
    .time {
      font-family: var(--body);
      font-size: 51px;
      font-weight: 600;
      line-height: 1;
      color: var(--ink);
      font-variant-numeric: tabular-nums;
      letter-spacing: 0;
    }
    .phone-status-glyphs {
      display: flex;
      align-items: center;
      gap: 22px;
      padding-top: 4px;
    }
    .bars {
      display: flex;
      align-items: flex-end;
      gap: 5px;
      height: 43px;
    }
    .bars i {
      width: 8px;
      border-radius: 5px;
      background: var(--ink);
      display: block;
    }
    .wifi { width: 48px; height: 36px; }
    .battery {
      position: relative;
      width: 78px;
      height: 39px;
      border: 4px solid var(--ink);
      border-radius: 10px;
      padding: 5px;
    }
    .battery::after {
      content: "";
      position: absolute;
      right: -10px;
      top: 11px;
      width: 6px;
      height: 15px;
      border-radius: 0 5px 5px 0;
      background: var(--ink);
    }
    .battery div {
      width: 50px;
      height: 21px;
      border-radius: 5px;
      background: var(--ink);
    }
    .top-row {
      position: absolute;
      left: 64px;
      top: 196px;
      width: 1162px;
      height: 132px;
      display: flex;
      align-items: center;
      gap: 24px;
    }
    .app-icon {
      width: 96px;
      height: 96px;
      border-radius: 21px;
      display: block;
    }
    .wordmark {
      font-family: var(--brand);
      font-size: 60px;
      line-height: 0.9;
      letter-spacing: -0.04em;
      color: var(--ink);
      text-transform: lowercase;
      padding-top: 4px;
    }
    .eyebrow {
      position: absolute;
      left: 64px;
      top: 360px;
      font-family: var(--mono);
      font-size: 33px;
      line-height: 1;
      letter-spacing: 6px;
      text-transform: uppercase;
      color: var(--dim-paper);
    }
    .hero {
      position: absolute;
      left: 64px;
      top: 417px;
      margin: 0;
      font-family: var(--brand);
      font-size: 168px;
      font-weight: 900;
      line-height: 0.9;
      letter-spacing: -0.04em;
      color: var(--ink);
      text-transform: lowercase;
    }
    .hero span { display: block; }
    .hero em {
      font-style: normal;
      color: var(--accent);
    }
    .subtitle {
      position: absolute;
      left: 64px;
      top: 778px;
      width: 870px;
      font-family: var(--body);
      font-size: 51px;
      font-weight: 400;
      line-height: 1.55;
      color: var(--body-paper);
      letter-spacing: 0;
    }
    .plans {
      position: absolute;
      left: 66px;
      top: 1145px;
      width: 1158px;
      height: 540px;
      display: grid;
      grid-template-columns: repeat(3, 354px);
      gap: 48px;
      overflow: visible;
    }
    .plan {
      position: relative;
      width: 354px;
      height: 540px;
      border: 6px solid var(--hair-paper);
      border-radius: 54px;
      background: transparent;
      color: var(--ink);
      overflow: visible;
    }
    .plan.selected {
      border-color: var(--accent);
      background: rgba(232,181,0,0.08);
    }
    .badge {
      position: absolute;
      right: 48px;
      top: -33px;
      height: 54px;
      display: flex;
      align-items: center;
      padding: 12px 24px;
      border-radius: 999px;
      background: var(--accent);
      color: var(--ink);
      font-family: var(--mono);
      font-size: 27px;
      font-weight: 700;
      line-height: 1;
      letter-spacing: 1.8px;
      white-space: nowrap;
    }
    .cadence {
      position: absolute;
      left: 0;
      top: 84px;
      width: 100%;
      text-align: center;
      font-family: var(--mono);
      font-size: 33px;
      line-height: 1;
      letter-spacing: 3px;
      color: var(--dim-paper);
      text-transform: uppercase;
    }
    .price {
      position: absolute;
      left: 50%;
      top: 174px;
      transform: translateX(-50%);
      font-family: var(--display);
      font-size: 126px;
      font-weight: 700;
      line-height: 0.9;
      letter-spacing: -4px;
      color: var(--ink);
      white-space: nowrap;
      font-variant-numeric: tabular-nums;
    }
    .secondary {
      position: absolute;
      left: 24px;
      right: 24px;
      top: 327px;
      font-family: var(--body);
      font-size: 36px;
      font-weight: 400;
      line-height: 1.22;
      color: var(--dim-paper);
      text-align: center;
    }
    .trial {
      position: absolute;
      left: 210px;
      top: 1769px;
      width: 870px;
      min-height: 192px;
      padding: 60px 72px;
      border-radius: 54px;
      border: 6px solid var(--accent);
      background: rgba(232,181,0,0.12);
      display: flex;
      align-items: center;
      gap: 30px;
      font-family: var(--body);
      font-size: 45px;
      font-weight: 500;
      line-height: 1.25;
      color: var(--ink);
    }
    .trial-dot {
      flex: 0 0 auto;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: var(--accent);
    }
    .cta {
      position: absolute;
      left: 64px;
      top: 2045px;
      width: 1162px;
      height: 240px;
      border-radius: 36px;
      background: var(--ink);
      color: var(--paper);
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--display);
      font-size: 60px;
      font-weight: 700;
      line-height: 1;
      letter-spacing: 0;
    }
    .links {
      position: absolute;
      left: 64px;
      top: 2333px;
      width: 1162px;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 38px;
      font-family: var(--mono);
      font-size: 33px;
      line-height: 1;
      letter-spacing: 1.8px;
      color: var(--dim-paper);
      text-transform: uppercase;
      white-space: nowrap;
    }
    .links b { font-weight: 400; color: var(--mute-paper); }
    .home-indicator {
      position: absolute;
      left: 429px;
      top: 2709px;
      width: 432px;
      height: 15px;
      border-radius: 999px;
      background: var(--dim-paper);
    }
  `;

  return pageHtml({ width: 1290, height: 2796, background: '#efe9da', body, styles });
}

function planCard(label, price, secondary, selected = false) {
  return `
    <div class="plan${selected ? ' selected' : ''}">
      ${selected ? '<div class="badge">BEST VALUE</div>' : ''}
      <div class="cadence">${label}</div>
      <div class="price">${price}</div>
      <div class="secondary">${secondary}</div>
    </div>
  `;
}

function watchBase({ label, body }) {
  const styles = `
    #shot {
      border-radius: 88px;
      background: var(--ink);
      color: var(--paper);
      font-family: var(--body);
    }
    .watch-status {
      position: absolute;
      left: 24px;
      right: 24px;
      top: 0;
      height: 60px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .watch-label {
      font-family: var(--mono);
      font-size: 18px;
      font-weight: 700;
      line-height: 1;
      letter-spacing: 1px;
      color: var(--accent);
      text-transform: uppercase;
    }
    .watch-time {
      font-family: var(--display);
      font-size: 30px;
      font-weight: 600;
      line-height: 1;
      color: var(--paper);
      font-variant-numeric: tabular-nums;
    }
    .icon svg { width: 100%; height: 100%; }
  `;

  return pageHtml({
    width: 410,
    height: 502,
    background: '#0a0a0a',
    styles,
    body: `
      <div class="watch-status">
        <div class="watch-label">${label}</div>
        <div class="watch-time">9:41</div>
      </div>
      ${body}
    `,
  });
}

function heartPulseSvg(width = 30, height = 30, heart = '#efe9da', pulse = '#e8b500') {
  return `
    <svg width="${width}" height="${height}" viewBox="0 0 48 48" aria-hidden="true">
      <path d="M24 39.5S9 30.4 9 18.2c0-5 3.4-8.7 8.1-8.7 2.9 0 5.3 1.5 6.9 3.9 1.6-2.4 4-3.9 6.9-3.9 4.7 0 8.1 3.7 8.1 8.7 0 12.2-15 21.3-15 21.3Z" fill="${heart}"/>
      <path d="M7 24h8l3.5-7.5 5.5 15 4.8-10.5 3.1 3H41" fill="none" stroke="${pulse}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;
}

function glyphSvg(name, color) {
  const stroke = color;
  if (name === 'utensils') {
    return `<svg viewBox="0 0 48 48" fill="none"><path d="M16 8v15M11 8v15M21 8v15M11 23c0 4 2.4 6 5 6s5-2 5-6M16 29v12M31 8c-4 4-5.5 9.5-4.4 15.2.6 3.2 2.5 5.1 5.4 5.7V41" stroke="${stroke}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  }
  if (name === 'scale') {
    return `<svg viewBox="0 0 48 48" fill="none"><rect x="9" y="10" width="30" height="30" rx="8" stroke="${stroke}" stroke-width="4"/><path d="M18 22c2-3 10-3 12 0M24 18v6" stroke="${stroke}" stroke-width="4" stroke-linecap="round"/></svg>`;
  }
  if (name === 'drop') {
    return `<svg viewBox="0 0 48 48" fill="${color}"><path d="M24 6c8 10 14 16.5 14 25a14 14 0 0 1-28 0C10 22.5 16 16 24 6Z"/></svg>`;
  }
  return '';
}

function mainListHtml() {
  const body = `
    <div class="rows">
      <div class="row selected">
        <div class="row-icon primary-icon">${heartPulseSvg(32, 32)}</div>
        <div class="row-copy">
          <div class="row-title">Push A</div>
          <div class="row-sub">Today &middot; 5 ex</div>
        </div>
      </div>
      <div class="row">
        <div class="row-icon icon">${glyphSvg('utensils', '#efe9da')}</div>
        <div class="row-copy"><div class="row-title">Log meal</div></div>
      </div>
      <div class="row">
        <div class="row-icon icon">${glyphSvg('scale', '#efe9da')}</div>
        <div class="row-copy"><div class="row-title">Weigh-in</div></div>
      </div>
      <div class="row">
        <div class="row-icon icon">${glyphSvg('drop', '#efe9da')}</div>
        <div class="row-copy"><div class="row-title">Water</div></div>
        <div class="counter">6 / 8</div>
      </div>
    </div>
  `;

  const html = watchBase({ label: 'ATLAS.CORE', body });
  return html.replace('</style>', `
    .rows {
      position: absolute;
      left: 24px;
      top: 88px;
      width: 362px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .row {
      width: 362px;
      height: 78px;
      border-radius: 24px;
      background: var(--card-dark);
      display: flex;
      align-items: center;
      padding: 0 16px 0 12px;
      color: var(--paper);
    }
    .row.selected {
      background: var(--accent);
      color: var(--ink);
    }
    .row-icon {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      flex: 0 0 auto;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 12px;
    }
    .selected .row-icon { background: var(--ink); }
    .row:not(.selected) .row-icon { background: var(--card-elevated); }
    .row-copy {
      min-width: 0;
      flex: 1;
      padding-top: 1px;
    }
    .row-title {
      font-family: var(--display);
      font-size: 24px;
      font-weight: 700;
      line-height: 1.05;
      letter-spacing: 0;
      color: currentColor;
    }
    .row-sub {
      margin-top: 4px;
      font-family: var(--body);
      font-size: 14px;
      font-weight: 400;
      line-height: 1;
      color: rgba(10,10,10,0.64);
    }
    .counter {
      font-family: var(--mono);
      font-size: 18px;
      font-weight: 400;
      line-height: 1;
      color: var(--paper);
      letter-spacing: 0;
    }
  </style>`);
}

function todayGlanceHtml() {
  const radius = 106;
  const circumference = 2 * Math.PI * radius;
  const progress = circumference * 0.65;
  const gap = circumference - progress;
  const body = `
    <svg class="fuel-ring" width="230" height="230" viewBox="0 0 230 230" aria-hidden="true">
      <circle cx="115" cy="115" r="${radius}" fill="none" stroke="rgba(239,233,218,0.18)" stroke-width="18"/>
      <circle cx="115" cy="115" r="${radius}" fill="none" stroke="#e8b500" stroke-width="18" stroke-linecap="round"
        stroke-dasharray="${progress} ${gap}" transform="rotate(-90 115 115)"/>
    </svg>
    <div class="ring-copy">
      <div class="fuel-label">FUEL</div>
      <div class="fuel-number">1,248</div>
      <div class="fuel-sub">of 2,550 kcal</div>
    </div>
    <div class="macros">P 92&nbsp;&nbsp;&nbsp;C 142&nbsp;&nbsp;&nbsp;F 38</div>
    <div class="dots"><i></i><i class="active"></i><i></i></div>
  `;

  const html = watchBase({ label: 'TODAY', body });
  return html.replace('</style>', `
    .fuel-ring {
      position: absolute;
      left: 90px;
      top: 148px;
      width: 230px;
      height: 230px;
    }
    .ring-copy {
      position: absolute;
      left: 90px;
      top: 207px;
      width: 230px;
      text-align: center;
    }
    .fuel-label {
      font-family: var(--mono);
      font-size: 14px;
      font-weight: 600;
      line-height: 1;
      letter-spacing: 1px;
      color: var(--dim-ink);
    }
    .fuel-number {
      margin-top: 10px;
      font-family: var(--display);
      font-size: 56px;
      font-weight: 700;
      line-height: 0.96;
      color: var(--paper);
      font-variant-numeric: tabular-nums;
    }
    .fuel-sub {
      margin-top: 8px;
      font-family: var(--body);
      font-size: 12px;
      font-weight: 400;
      line-height: 1;
      color: var(--dim-ink);
    }
    .macros {
      position: absolute;
      left: 24px;
      top: 410px;
      width: 362px;
      text-align: center;
      font-family: var(--mono);
      font-size: 16px;
      font-weight: 600;
      line-height: 1;
      color: var(--paper);
      white-space: nowrap;
      letter-spacing: 0;
    }
    .dots {
      position: absolute;
      left: 0;
      top: 466px;
      width: 410px;
      display: flex;
      justify-content: center;
      gap: 8px;
    }
    .dots i {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: rgba(239,233,218,0.30);
    }
    .dots .active { background: var(--paper); }
  </style>`);
}

function activeWorkoutHtml() {
  const body = `
    <div class="exercise-label">BENCH PRESS</div>
    <div class="exercise-sub">Set 3 of 4 &middot; last 80&times;8</div>
    <div class="weight-line"><span class="weight">82.5</span><span class="kg">kg</span></div>
    <div class="reps-line"><span>&times; 8</span> reps</div>
    <div class="actions">
      <div class="small">${minusSvg()}</div>
      <div class="primary">${checkSvg()}</div>
      <div class="small">${plusSvg()}</div>
    </div>
  `;

  const html = watchBase({ label: '2 / 5', body });
  return html.replace('</style>', `
    .exercise-label {
      position: absolute;
      left: 24px;
      top: 70px;
      font-family: var(--mono);
      font-size: 16px;
      font-weight: 400;
      line-height: 1;
      letter-spacing: 1px;
      color: var(--dim-ink);
      text-transform: uppercase;
    }
    .exercise-sub {
      position: absolute;
      left: 24px;
      top: 98px;
      font-family: var(--body);
      font-size: 14px;
      font-weight: 400;
      line-height: 1;
      color: var(--dim-ink);
    }
    .weight-line {
      position: absolute;
      left: 24px;
      top: 150px;
      display: flex;
      align-items: baseline;
      gap: 10px;
    }
    .weight {
      font-family: var(--display);
      font-size: 110px;
      font-weight: 800;
      line-height: 0.92;
      color: var(--paper);
      letter-spacing: -2px;
      font-variant-numeric: tabular-nums;
    }
    .kg {
      font-family: var(--display);
      font-size: 36px;
      font-weight: 600;
      line-height: 1;
      color: var(--dim-ink);
    }
    .reps-line {
      position: absolute;
      left: 24px;
      top: 300px;
      font-family: var(--display);
      font-size: 40px;
      font-weight: 600;
      line-height: 1;
      color: var(--paper);
    }
    .reps-line span { color: var(--accent); }
    .actions {
      position: absolute;
      left: 89px;
      top: 360px;
      width: 232px;
      height: 80px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
    }
    .actions div {
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .actions .small {
      width: 60px;
      height: 60px;
      background: var(--card-elevated);
      color: var(--paper);
    }
    .actions .primary {
      width: 80px;
      height: 80px;
      background: var(--accent);
      color: var(--ink);
    }
  </style>`);
}

function minusSvg() {
  return `<svg width="30" height="30" viewBox="0 0 30 30" aria-hidden="true"><path d="M7 15h16" stroke="#efe9da" stroke-width="4" stroke-linecap="round"/></svg>`;
}

function plusSvg() {
  return `<svg width="30" height="30" viewBox="0 0 30 30" aria-hidden="true"><path d="M15 7v16M7 15h16" stroke="#efe9da" stroke-width="4" stroke-linecap="round"/></svg>`;
}

function checkSvg() {
  return `<svg width="42" height="42" viewBox="0 0 42 42" aria-hidden="true"><path d="M10 22l7 7 15-18" fill="none" stroke="#0a0a0a" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

async function render(browser, html, viewport, outPath) {
  const page = await browser.newPage({
    viewport,
    deviceScaleFactor: 1,
    colorScheme: 'light',
  });

  await page.setContent(html, { waitUntil: 'load' });
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(
      Array.from(document.images)
        .filter((img) => !img.complete)
        .map((img) => new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
        })),
    );
  });
  await page.screenshot({
    path: outPath,
    type: 'png',
    fullPage: false,
    omitBackground: false,
  });
  await page.close();
}

const jobs = [
  {
    name: 'paywall-review-screenshot.png',
    path: path.join(outRoot, 'paywall-review-screenshot.png'),
    viewport: { width: 1290, height: 2796 },
    html: paywallHtml(),
  },
  {
    name: 'watch-screenshots/01-main-list.png',
    path: path.join(watchOut, '01-main-list.png'),
    viewport: { width: 410, height: 502 },
    html: mainListHtml(),
  },
  {
    name: 'watch-screenshots/02-today-glance.png',
    path: path.join(watchOut, '02-today-glance.png'),
    viewport: { width: 410, height: 502 },
    html: todayGlanceHtml(),
  },
  {
    name: 'watch-screenshots/03-active-workout.png',
    path: path.join(watchOut, '03-active-workout.png'),
    viewport: { width: 410, height: 502 },
    html: activeWorkoutHtml(),
  },
];

const browser = await chromium.launch({ headless: true });
try {
  for (const job of jobs) {
    await render(browser, job.html, job.viewport, job.path);
    console.log(`rendered ${job.name}`);
  }
} finally {
  await browser.close();
}
