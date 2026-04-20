# Redesign — push to GitHub

Sandbox file-descriptor permissions here blocked the automated push (can't
remove `.git/*.lock`, no GitHub credentials in-sandbox). The commit is
ready — it just needs one push from your terminal.

## Two commands — run them in your own terminal

From the repo root `atlas.core-official/`:

```bash
# 1. Pull my commit in from the bundle
git fetch ./redesign-v2.bundle redesign/v2-preview:redesign/v2-preview

# 2. Push it to GitHub
git push -u origin redesign/v2-preview
```

That's it. Then open a PR from `redesign/v2-preview` → your main branch on
https://github.com/enzosoler/atlascore.

## What's in the commit

- 67 files — all under `src/redesign/` plus small wiring in `tailwind.config.js`,
  `src/index.css`, `src/App.jsx`, and `REDESIGN-PREVIEW.html`.
- Zero existing files deleted. Zero behavior changes to current routes.
- New routes live at `/v2/*`; hit `/v2` in your running dev server for the
  gallery.

## What's NOT in the commit (deliberate)

Your other uncommitted work on this branch stays as-is:

- `src/features/onboarding/OnboardingEngine.jsx` (modified)
- `src/features/onboarding/schema.js` (modified)
- 12 new TSX files in `src/components/ui/` (AppContainer, Badge, Button, Card,
  EmptyState, ErrorState, Input, LoadingState, PageHeader, Section, Select,
  Skeleton)
- `src/features/auth/`, `src/features/dashboard/`, `src/features/nutrition/`
- 5 new onboarding TSX screens
- `src/layouts/`, `src/lib/navigation/`, `src/lib/theme/`

That looks like a *parallel* prior redesign attempt in TypeScript (your
commit log shows two earlier "Complete UI/UX redesign v2.0" commits already).
None of it collides with my JSX-based `src/redesign/` — they sit in different
trees. If you want me to reconcile the two attempts, say the word.

## If you'd rather push directly from the clone

I committed it here too: `/tmp/atlas-work/atlas-clone/`. If you have shell
access to that path with your GitHub credentials:

```bash
cd /tmp/atlas-work/atlas-clone
git push -u origin redesign/v2-preview
```

## Clean up after pushing

Once the branch is on GitHub, these files can be deleted — they're just carriers:

```bash
rm redesign-v2.bundle REDESIGN-PUSH-INSTRUCTIONS.md
```
