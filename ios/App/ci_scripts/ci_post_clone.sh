#!/bin/bash
# Xcode Cloud pre-build script
# Runs after cloning the repo but before Xcode resolves SPM packages.
# Installs node_modules so Capacitor SPM plugin references resolve.

set -e

echo "▸ Installing Node.js via Homebrew..."
brew install node

echo "▸ Installing npm dependencies..."
cd "$CI_PRIMARY_REPOSITORY_PATH"
npm install --legacy-peer-deps

echo "▸ Building web assets..."
npm run build

echo "▸ Syncing Capacitor..."
npx cap sync ios

echo "✓ ci_post_clone complete"
