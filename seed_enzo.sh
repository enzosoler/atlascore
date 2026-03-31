#!/bin/bash

# ============================================================
# Script to run Enzo's seed data
# ============================================================

if [ -z "$1" ] || [ -z "$2" ]; then
  echo "Usage: ./seed_enzo.sh <SUPABASE_SERVICE_ROLE_KEY> <USER_ID>"
  exit 1
fi

export SUPABASE_SERVICE_ROLE_KEY="$1"
export SEED_USER_ID="$2"

echo "🚀 Starting seed for user $SEED_USER_ID..."
npm run seed:enzo
