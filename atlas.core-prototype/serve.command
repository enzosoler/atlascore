#!/bin/bash
# atlas.core — double-click to preview the prototype in your browser.
# Serves this folder on http://localhost:8765 and opens the page.

cd "$(dirname "$0")"
PORT=8765

# Pick an available port in case 8765 is taken
while lsof -i :$PORT -sTCP:LISTEN >/dev/null 2>&1; do
  PORT=$((PORT + 1))
done

URL="http://localhost:$PORT/"
echo ""
echo "atlas.core prototype — serving at $URL"
echo "Press Ctrl+C in this window to stop the server."
echo ""

# Open the browser after a brief delay so the server is ready
( sleep 0.8 && open "$URL" ) &

# Python 3 is preinstalled on modern macOS
exec python3 -m http.server $PORT
