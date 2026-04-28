#!/bin/bash
# Xcode Cloud pre-build script
# Runs after cloning the repo but before Xcode resolves SPM packages.
# Installs node_modules, builds web assets, and syncs Capacitor.
#
# Required Xcode Cloud environment variables (set in Workflow → Environment):
#   VITE_SUPABASE_URL
#   VITE_SUPABASE_PUBLISHABLE_KEY
#   VITE_REVENUECAT_IOS_KEY
#
# Optional (analytics / monitoring — gracefully absent):
#   VITE_POSTHOG_KEY, VITE_POSTHOG_HOST
#   VITE_SENTRY_DSN
#   VITE_STRIPE_PUBLISHABLE_KEY

set -e

echo "▸ Installing Node.js via Homebrew..."
export HOMEBREW_NO_AUTO_UPDATE=1
brew install node

cd "$CI_PRIMARY_REPOSITORY_PATH"

echo "▸ Writing .env.local from Xcode Cloud environment..."
{
  echo "VITE_SUPABASE_URL=${VITE_SUPABASE_URL:?Missing VITE_SUPABASE_URL in Xcode Cloud env}"
  echo "VITE_SUPABASE_PUBLISHABLE_KEY=${VITE_SUPABASE_PUBLISHABLE_KEY:?Missing VITE_SUPABASE_PUBLISHABLE_KEY in Xcode Cloud env}"
  echo "VITE_REVENUECAT_IOS_KEY=${VITE_REVENUECAT_IOS_KEY:?Missing VITE_REVENUECAT_IOS_KEY in Xcode Cloud env}"
  [ -n "$VITE_POSTHOG_KEY" ]            && echo "VITE_POSTHOG_KEY=$VITE_POSTHOG_KEY"
  [ -n "$VITE_POSTHOG_HOST" ]           && echo "VITE_POSTHOG_HOST=$VITE_POSTHOG_HOST"
  [ -n "$VITE_SENTRY_DSN" ]             && echo "VITE_SENTRY_DSN=$VITE_SENTRY_DSN"
  [ -n "$VITE_STRIPE_PUBLISHABLE_KEY" ] && echo "VITE_STRIPE_PUBLISHABLE_KEY=$VITE_STRIPE_PUBLISHABLE_KEY"
} > .env.local

echo "▸ Installing npm dependencies..."
npm install --legacy-peer-deps

echo "▸ Building web assets..."
npm run build

echo "▸ Syncing Capacitor..."
npx cap sync ios

echo "✓ ci_post_clone complete"
