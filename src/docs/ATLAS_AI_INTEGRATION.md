# Deterministic Insights - MVP Integration

## Overview

The old Atlas AI MVP has been replaced by a deterministic insights layer. The app now uses existing user data to generate trustworthy progress readings without any LLM or external AI calls.

The main surfaces are:

- `Today` - a short daily preview of the strongest deterministic next action
- `Insights` - the full summary page with progress, training, nutrition, recovery, and next action
- Legacy routes like `/AtlasAI` and `/atlas-ai` now redirect to the new insights experience

## Core Files

- `src/lib/insightsEngine.js` - pure rule-based insights engine
- `src/pages/Insights.jsx` - insights dashboard UI
- `src/pages/Today.jsx` - daily preview that pulls the next action from the engine
- `src/lib/routes.js` - route aliases and legacy redirects

## What The Engine Produces

### Categories

- Progress
- Training
- Nutrition
- Recovery
- Next action

### Summary Cards

- This week
- Since start
- Trends
- Next best action

### Product Rules

- Never invent unsupported insights
- Prefer weekly averages over noisy daily values
- Avoid shaming language
- Show context alongside every reading
- Return a safe baseline when there is not enough data

## Data Inputs

The engine reads only the current user's own data:

- body measurements
- workouts
- food logs
- daily check-ins
- active workout and diet plans
- profile targets

## UI Behaviour

### Today

The Today page now previews the next deterministic action, chosen from the weakest meaningful signal in the dashboard.

### Insights

The Insights page presents:

- a consistency score
- weekly summary cards
- lifetime / since-start deltas
- trend readings
- a deterministic next action card

## No AI Dependency

This implementation does not call:

- LLM APIs
- prompt services
- third-party inference providers

All outputs are derived from deterministic calculations in the app.

## Validation

Recommended checks:

1. Run the engine tests
2. Build the app
3. Confirm the Today page and Insights page render without loading errors

## Legacy Notes

The old Atlas AI chat page was removed from the MVP path. Routes now point to the deterministic Insights experience instead.
