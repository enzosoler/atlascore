# App Store Listing Copy — atlas.core

**Status:** Ready to paste into App Store Connect.
**Two versions** to choose between. Pick A or B (do not mix).
**Important:** Apple indexes Title + Subtitle + Keywords together. Do not repeat words across them.

---

## VERSION A — Fitness & Results Focused

### Title (30 char max)
```
atlas.core: Fitness Tracker
```
27 chars ✓

### Subtitle (30 char max)
```
Workouts, nutrition, progress
```
29 chars ✓

### Promotional Text / Short Description
```
A clean, modern fitness app for tracking workouts, nutrition, and body measurements in one place. Built for everyday people who want to see real progress without the noise.
```

### Description
```
Train. Eat. Measure. See progress.

atlas.core is an all-in-one fitness tracker designed for people who want to get in shape and actually see how far they've come. No clutter. No gimmicks. Just the tools you need to train with intent and track what matters.

Plan your workouts, log your sets, track your meals, and check in on your body measurements at regular checkpoints. Everything flows into a single daily dashboard so you always know where you stand.

Whether you're starting your first program or returning after a break, atlas.core gives you the structure to train consistently and the data to know it's working.

WORKOUTS THAT FIT YOUR ROUTINE
Follow a guided program or build your own. Log sets, reps, and weight quickly between sets. Review your training history and watch your numbers climb.

NUTRITION WITHOUT THE SPREADSHEET
Log meals, track macros, and stay aware of what you're eating — without turning every meal into a chore.

MEASURABLE PROGRESS
Take body measurements at your own pace and compare checkpoints over time. Progress shows up as a clear line, not a guess.

DAILY DASHBOARD
One screen for today: your workout, your meals, your numbers. Open the app, see what's next, get on with your day.

COACHING AND GUIDANCE
Optional coaching content helps you stay on track when motivation dips and gives you a direction when you're not sure what to do next.

Designed mobile-first. Built for consistency. Made for the long run.
```

### Feature Bullets (6) — for "What's New" or marketing pages
- Workouts & routines — Follow programs or build your own. Log sets in seconds.
- Nutrition tracking — Log meals and macros without the spreadsheet feel.
- Body measurements — Track checkpoints and compare progress over time.
- Daily dashboard — Today's workout, meals, and numbers on one screen.
- Coaching & guidance — Direction when you need it, quiet when you don't.
- Clean, modern design — Mobile-first. Minimal. Built to be opened daily.

### Keywords (100 char max, comma-separated, NO spaces)
```
fitness,workout,gym,tracker,nutrition,macros,routine,training,progress,measurements,health,coach
```
98 chars ✓

### Tagline / Subtitle alternative
```
Train with intent. See the line move.
```

---

## VERSION B — Consistency & Habit Focused

### Title (30 char max)
```
atlas.core: Daily Fitness
```
25 chars ✓

### Subtitle (30 char max)
```
Show up. Stay consistent.
```
25 chars ✓

### Promotional Text / Short Description
```
A calm, all-in-one fitness app built around the daily habit. Workouts, nutrition, and progress checkpoints in one quiet dashboard — designed to help you show up consistently.
```

### Description
```
The hard part isn't the workout. It's showing up.

atlas.core is a fitness app built around a single idea: consistency beats intensity. Open the app, see what today asks of you, do it, close the app. That's the loop.

Your workouts, your meals, your measurements, and your guidance all live in one quiet dashboard. No streaks shouting at you. No leaderboards. Just a clear picture of today and an honest record of the weeks behind you.

Built for everyday people — not professional athletes — atlas.core fits into your life instead of taking it over.

A DAILY DASHBOARD, NOT A FEED
Open the app and see today: your planned workout, your meals so far, your next checkpoint. One screen, one focus.

WORKOUTS THAT RESPECT YOUR TIME
Follow a routine or build your own. Log quickly. Move on. Your training history is there when you want to look back.

NUTRITION, KEPT SIMPLE
Log meals and stay aware of your macros without making food complicated.

PROGRESS AT YOUR PACE
Body measurement checkpoints give you an honest read on the long arc — not the daily noise.

GUIDANCE WHEN YOU WANT IT
Coaching content is there to help you stay on track and give you direction, without nagging you.

Calm, modern, and mobile-first. Designed to be opened every day for years, not deleted in a week.
```

### Feature Bullets (7)
- One daily dashboard — Today's plan in one quiet view.
- Workouts & routines — Guided programs or your own. Log in seconds.
- Nutrition tracking — Meals and macros, kept simple.
- Progress checkpoints — Body measurements at your pace.
- Coaching & guidance — Direction when you want it.
- Built for the long run — Designed for daily use over years, not weeks.
- Calm by design — No streaks, no leaderboards, no noise.

### Keywords (100 char max, no spaces)
```
fitness,habit,routine,workout,daily,nutrition,tracker,progress,health,training,gym,consistency
```
96 chars ✓

### Tagline
```
Show up. Every day. Quietly.
```

---

## Other App Store Connect fields (apply to either version)

- **Category — Primary:** Health & Fitness
- **Category — Secondary:** Lifestyle (suggested) or Productivity
- **Age Rating:** 4+ (no objectionable content)
- **Support URL:** `https://useatlascore.com/help` *(verify route exists in production)*
- **Marketing URL:** `https://useatlascore.com` *(verify)*
- **Privacy Policy URL:** `https://useatlascore.com/privacy` *(verify route exists)*
- **Copyright:** `© 2026 atlas.core` *(or legal entity name)*
- **Version Number:** `1.0`
- **Build Number:** `21`

---

## Privacy nutrition labels (App Store Connect → App Privacy)

Based on `ios/App/App/Info.plist` permissions, you will be asked to declare:
- **HealthKit** — read & write (workouts, body measurements, nutrition)
- **Camera** — for food / barcode scanning
- **Microphone** — for voice meal logging
- **Speech Recognition** — for converting voice meals to text
- **Location (When in Use)** — for weather conditions
- **Photos** — for saving / sharing progress cards
- **Email address** — collected at sign up
- **Contact info** — none beyond email
- **Identifiers** — Sentry crash reports, PostHog analytics

You will also be asked: *"Is data linked to user?"* For PostHog & Sentry, the
honest answer is **yes** (events tied to user_id). You will need to disclose
analytics + crash reporting under "Diagnostics → Crash Data" and "Usage
Data → Product Interaction".

---

## Reviewer notes (suggested)

```
atlas.core is a fitness operating system: workouts, nutrition, body
measurements, and a daily dashboard.

A demo account is provided below. Sign in with the password method (not
the magic link, which requires an inbox).

Main flows to evaluate:
1. After sign in you land on /app/today — the daily dashboard.
2. Bottom tab bar: Today, Workouts, Nutrition, Coach, Profile.
3. Workouts tab: browse routines, start a workout, log sets.
4. Nutrition tab: log a meal manually or via the camera.
5. Body / measurements: tap "+ Log checkpoint" to record measurements.
6. Profile: account settings, billing, account deletion.

Subscriptions are handled via In-App Purchase through RevenueCat.
Paywall appears on protected actions; restore-purchase is in Profile → Billing.

Account deletion: Profile → Settings → Danger Zone → Delete account.
```

---

## Recommendation

**I recommend Version B.** It matches CLAUDE.md §9 design tone (precise, calm,
directive, system-oriented), §7 UX philosophy (replace thinking with execution,
reduce friction to near-zero), and the "no streaks, no leaderboards" stance
fits the "performance operating system" positioning better than the more
generic Version A "fitness tracker" framing. Version A reads more like every
other tracker on the App Store; Version B is differentiated.
