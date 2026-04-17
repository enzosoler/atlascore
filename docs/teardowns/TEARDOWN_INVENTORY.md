# Atlas Core — Teardown Inventory

This is the authoritative list of every surface to be torn down. Each entry has a stable number, a name, reference apps, and a hint for where to find the implementation in the codebase.

The "file hint" is a starting point, not an exhaustive list. Subagents should grep the codebase to find all files implementing a surface.

---

| # | Area | Surface | Primary ref | Secondary ref | File hint (grep starting point) |
|---|------|---------|-------------|---------------|-------------------------------|
| 01 | AI Coach | Coach chat | ChatGPT | Character.ai | `src/components/ai/CoachChatSheet.jsx`, `src/hooks/useCoachChat.js`, `supabase/functions/ai-coach-chat/` |
| 02 | Onboarding & auth | Welcome / splash | Duolingo | — | Search `Welcome`, `Splash`, `src/pages/`, `src/App.jsx` routing |
| 03 | Onboarding & auth | Sign up / Log in | Linear | — | Search `SignUp`, `Login`, `Auth` in `src/pages/` and `src/components/` |
| 04 | Onboarding & auth | Onboarding V2 (28 screens) | Cal AI | Noom | Search `onboarding`, `Onboarding`, `projectionEngine` — this is a flow, not one file |
| 05 | Onboarding & auth | Post-onboarding paywall | Cal AI | Fastic | Search `Paywall`, `EntitlementGate`, `src/pages/Pricing.jsx` for native paywall variant |
| 06 | Today / home | TodayV2 dashboard | Whoop | Apple Fitness | `src/pages/TodayV2.jsx` |
| 07 | Today / home | Weekly review | Strava | — | Search `Weekly`, `Review`, `Summary` in `src/pages/` and `src/components/` |
| 08 | Nutrition | Daily nutrition log | MyFitnessPal | — | Search `Nutrition`, `FoodLog`, `Meal` in `src/pages/` and `src/components/nutrition/` |
| 09 | Nutrition | Meal plan view | MacroFactor | — | Search `MealPlan`, `Plan` in `src/pages/` |
| 10 | Nutrition | AI food logging (photo/text/barcode) | Cal AI | — | Search `log-food-text`, `food-vision`, `barcode`, AI logging components |
| 11 | Nutrition | Macro target setup | MacroFactor | — | Search `Macro`, `Target`, `Goal` in onboarding + settings |
| 12 | Workouts | Workout library | Fitbod | — | Search `Workout` in `src/pages/`, look for list/catalog components |
| 13 | Workouts | Active workout | Hevy | Strong | Search for active/in-progress workout components, rest timer |
| 14 | Workouts | Workout history & protocol | Hevy | — | Search `History`, `Protocol`, `ProtocolCard` |
| 15 | Measurements & body | Weight + body comp entry | Happy Scale | — | Search `Weight`, `Measurement`, `BodyComp` entry components |
| 16 | Measurements & body | Measurements history & charts | MacroFactor | — | Search for chart components near measurement files |
| 17 | Measurements & body | Progress photos | Happy Scale | BodyFast | Search `Progress`, `Photo`, `Compare` in `src/components/` |
| 18 | AI Coach | Coach insights / proactive cards | Whoop | Oura | Search `Insight`, `Proactive`, `aiInsightsService` |
| 19 | Check-ins & habits | Daily check-in flow | Stoic | Finch | Search `CheckIn`, `Daily`, `Streak` |
| 20 | Lab / medical | Lab results | Function Health | InsideTracker | Search `Lab`, `lab_exam_results` |
| 21 | Subscription & billing | Pricing page (web) | Linear | Superhuman | `src/pages/Pricing.jsx` |
| 22 | Subscription & billing | Native paywall | Cal AI | — | Native paywall variant, `EntitlementGate`, RevenueCat integration |
| 23 | Subscription & billing | Manage subscription | Apple Settings | Blinkist | Search `Manage`, `Subscription`, `useCustomerPortal`, `Account.jsx` |
| 24 | Account & settings | Account / profile | Linear | — | `src/pages/Account.jsx` |
| 25 | Account & settings | Settings hub | Things 3 | iOS Settings | Search `Settings`, `Preferences` pages |
| 26 | Account & settings | Integrations | Notion | Raycast | Search `Integration`, `Connect`, `HealthKit`, `Apple Health` |
| 27 | Social / sharing | Share cards | Strava | Spotify Wrapped | Search `Share`, `ShareCard`, `Capacitor Share` |
| 28 | Social / sharing | Affiliate / creator code | Cameo | Beehiiv | Search `Affiliate`, `CreatorCode`, `CreatorCodeModal` |
| 29 | Admin | Admin (dashboard + settings + audit + users) | Linear | — | `src/pages/admin/`, `src/lib/adminService.js` |
| 30 | Dev / internal | Styleguide | Shadcn docs | Radix docs | `src/pages/styleguide/StyleguidePage.jsx` |
| 31 | System states | Empty, loading, errors, offline, permissions | Linear | Things 3 + Duolingo (permissions) | Cross-cutting — search for empty states, error boundaries, offline banners, permission prompts across the app |

---

## Audience note

Atlas serves a **mix audience**: serious optimizers (Whoop/MacroFactor/Hevy users) AND general fitness users (Noom/Cal AI/Finch users). Every teardown should flag where these two audiences want different things and propose a resolution that serves both, not one.

## Tier assignments (for reference only — all 31 get equal rigor)

- **Tier 1 (6):** 01, 04, 05, 06, 08, 13
- **Tier 2 (9):** 07, 10, 11, 17, 18, 22, 27, 16, 31
- **Tier 3 (10):** 02, 03, 09, 12, 14, 15, 19, 20, 21, 26
- **Tier 4 (6):** 23, 24, 25, 28, 29, 30

Tier is for reading order and retry priority if a subagent fails. Every teardown follows the full template.
