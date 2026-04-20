# atlas.core — LANES

Two autonomous agents ship this product in parallel. This file is the
contract that keeps them from overwriting each other.

**Read this first** before editing any file. If you are unsure which
lane owns a file, treat it as the other lane's until this doc says
otherwise.

---

## Design lane

**Owns the pixels.** Visual layout, typography, tokens, icons, motion,
copy tone inside screen components, design canvas.

### Design lane MAY edit

| Path | Why it's design |
|---|---|
| `src/redesign/v3/screens/S*_*.jsx` | The canvas screens — visual source of truth |
| `src/redesign/v3/lib/paper.jsx` | Design tokens + visual primitives |
| `src/redesign/v3/lib/brandMarks.jsx` | Brand marks / logos |
| `src/redesign/v3/gallery/**` | Canvas preview harness |
| `claude-design-import/**` | The full design canvas (HTML + JSX) |
| `src/index.css` | Global CSS variables + tokens |
| `tailwind.config.js` | Design token surface for Tailwind |
| `public/branding/**`, `public/brand/**` | Brand assets (logos, favicons) |
| `ios/App/App/Assets.xcassets/**` | App icons + splash images |

### Design lane MUST NOT edit

- Anything in the Engineering table below.
- **Never remove an existing `t('…')` call or `useT()` import** from a
  screen you're editing. The key lives in message JSON (engineering's
  file) — the screen just reads it.
- Never edit `src/i18n/messages/*.json`. Instead file a row under
  `## Handoffs to engineering` in `BACKLOG.md`.

---

## Engineering lane

**Owns everything except pixels.** Wiring, data, state, routing,
platform integrations, i18n infrastructure + wiring, build + deploy,
tooling, performance.

### Engineering lane MAY edit

| Path | Why it's engineering |
|---|---|
| `src/App.jsx` | Router, providers, route wrappers |
| `src/redesign/v3/routes/V3*.jsx` | Route-level wiring: data, nav, handlers |
| `src/redesign/v3/layouts/**` | Platform gates, shell logic |
| `src/redesign/v2/**` | Legacy teardown + v2 route wrappers |
| `src/i18n/**` | Dictionaries + translation engine |
| `src/lib/**` | Services, contexts, hooks |
| `src/hooks/**`, `src/services/**`, `src/store/**` | Data layer |
| `src/components/app/**` | App-level shells (error boundaries, splash, boot) |
| `package.json`, `package-lock.json` | Dependencies |
| `vite.config*.js`, `eslint.config.js` | Build + lint |
| `capacitor.config.json`, `ios/App/Podfile`, `ios/App/CapApp-SPM/Package.swift`, `ios/App/**/Info.plist`, `ios/App/App.xcodeproj/**/Package.resolved` | Capacitor + iOS config |
| `vercel.json`, `netlify.toml` | Hosting config |
| `.github/**` and any CI config | Build automation |
| `BACKLOG.md`, `PRODUCT_AUDIT.md`, `KNOWN_ISSUES.md`, `LANES.md` | Operational memory |

### Engineering lane MUST NOT edit

- Anything in the Design table above.
- Never redesign a screen. If a screen is visually broken, file a row
  under `## Handoffs to design` in `BACKLOG.md` with:
  - the file path
  - a screenshot or one-sentence description
  - the acceptance criterion
- Never edit `ios/App/App/Assets.xcassets/**` unless fixing a build
  or store-validation error (e.g. ITMS-90717 alpha channel). In that
  case commit only the file fix with a clear `chore(ios): …` message.

---

## Edge cases — resolve by intent, not by path

1. **An `S*_*.jsx` canvas screen needs new behavior** (numpad wiring,
   real `onSave` payload, data fetching):
   - Design lane is responsible for the screen's prop contract.
   - Engineering lane consumes that contract from a `V3*.jsx` route.
   - If the prop contract doesn't exist yet, design files a
     `## Handoffs to engineering` row asking for the data shape, or
     engineering files a `## Handoffs to design` row asking for the
     prop interface.

2. **Hardcoded English string inside an `S*_*.jsx` screen**:
   - Engineering lane MAY add `useT()` + replace the string with
     `t('namespace.key')`.
   - Engineering lane adds the key to `en.json` + `pt-BR.json`.
   - Design lane MUST preserve the `t()` call on subsequent edits.
     If design wants the copy changed, design updates the JSON
     (OK in this one direction for copy tweaks — flag in commit
     message so engineering knows).

3. **Fixing a build or deploy error touches a design file**:
   - Engineering may commit the minimum fix. Scope the commit tightly
     (`chore(ios): strip alpha channel` — only the one file).

4. **New file that could arguably belong to either lane**:
   - If it contains JSX that renders pixels → design lane.
   - If it contains logic, hooks, services, data, or config → engineering.
   - Place it in the right directory from day one and update this doc.

---

## Handoff protocol

The two lanes coordinate ONLY through `BACKLOG.md`. Two sections:

```
## Handoffs to engineering
- `[ ]` <date> — <target-file> — <problem> — <acceptance criterion>

## Handoffs to design
- `[ ]` <date> — <target-file> — <problem> — <acceptance criterion>
```

- Claim a row by flipping `[ ]` → `[~]` in-progress.
- Close a row by flipping to `[x]` and writing the commit hash at the
  end of the line.
- Never implement work in the other lane's ownership directly — even
  if you know how. Write the handoff, commit, move on.

---

## When in doubt

**Stop. Do not edit.** Read the row in the table above. If still
ambiguous, file a handoff. Cross-lane edits are the #1 cause of work
getting reverted in this repo — don't be the reason.

The only acceptable reason to cross lanes silently: a literal
production incident (site down, build red, store rejection). Commit
the minimum fix, scope the commit tightly, and flag it in the commit
message body (`NOTE: crossed lane to fix <thing>, handoff opened`).

---

## Updates to this document

Either lane may propose an edit to `LANES.md`. Commit a change to this
file alone with the message `docs(lanes): <what>` so both agents see
it at the top of the log next cycle.
