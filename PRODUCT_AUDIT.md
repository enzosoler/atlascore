# atlas.core — Product Audit

Last updated: 2026-04-19

## Activation Funnel Status

| Step | Route | Screen | Version | Inputs | Data Capture | Status |
|------|-------|--------|---------|--------|-------------|--------|
| 1 | /onboarding | Identity | v3 | Sex only (age/height hardcoded) | None | ⚠️ Placeholder |
| 2 | /onboarding/goal | Goal | v3 | 4 goal buttons | Local only | ✅ Working |
| 3 | /onboarding/activity | Activity | v3 | 5 activity levels | Local only | ✅ Working |
| 4 | /onboarding/stats | Plan preview | v3 | Display only | None | ⚠️ Hardcoded |
| 5 | /onboarding/diet | Permissions | v3 | Display only | None | ✅ Navigates to step 6 |
| 6 | /onboarding/workout | Workout | v2 | Experience/freq/equipment | ✅ via onChange | ✅ Working |
| 7 | /onboarding/habits | Habits | v2 | Sleep/steps/water | ✅ via onChange | ✅ Working |
| 8 | /onboarding/constraints | Constraints | v2 | Injuries/medical/notes | ✅ via onChange | ✅ Working |
| 9 | /onboarding/summary | Summary | v2 | Display only | N/A | ✅ Working |
| 10 | /onboarding/paywall | Paywall | v2 | Plan picker | ✅ planId | ✅ Working |

### Critical gaps
- Steps 1-5 (v3) don't persist user choices — local state only, lost on navigation
- Step 1 has hardcoded age (32) and height (5'11") — not editable
- Step 4 shows hardcoded calorie/macro targets — should compute from steps 1-3

## Route Coverage: v3 vs v2

- 14 primary tab routes: **v3** (done)
- 25 sub-screens inside V3AppShell: **v2**
- 15 fullscreen flows: **v2**
- 7 onboarding steps: **v2** (steps 6-10 + tour + smart)
- 5 onboarding steps: **v3** (steps 1-5)

## Design Debt (19 routes, no canvas design)

1. Active Workout tracker (/app/workouts/active) — daily use, highest priority
2. Food Diary (/app/nutrition/diary)
3. CustomFood creator (/app/nutrition/food/new)
4. Macro Targets (/app/nutrition/targets)
5. Water Log (/app/nutrition/water)
6. Meal Plans (/app/nutrition/meal-plans)
7. Body Check-in (/app/body/checkin)
8. Body Composition History (/app/body/composition)
9. Lab Upload (/app/labs/upload)
10. Insights (/app/insights)
11. Diary (/app/diary)
12. Focus Mode (/app/today/focus)
13. Streaks Detail (/app/today/streaks)
14. Celebrations (/app/today/celebrate/:kind)
15. Social Feed/Friends/Follow (/app/social/*)
16. Settings sub-screens (Account, Integrations, Danger, Diagnostics)
17. System screens (Maintenance, Force Update)
18. Smart Onboarding (/onboarding/smart)
19. Onboarding Tour (/onboarding/tour)
20. Body photo capture (new route needed)

## Platform Gate

V3AppShell has PlatformGate — redirects web users to /download-app.
But fullscreen flows (Category B routes declared before /app) have NO gate.
Web users can directly access /app/workouts/active, /app/body/weight, etc.
