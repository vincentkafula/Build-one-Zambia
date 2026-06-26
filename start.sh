#!/bin/bash
# ─── Build One Zambia Portal — Quick Start ───────────────────────────────────
set -e

echo ""
echo "🇿🇲  Build One Zambia Portal"
echo "────────────────────────────────────────"

# Start backend
echo "▶  Starting Node.js backend on :3001 ..."
cd backend
node src/index.js &
BACKEND_PID=$!
cd ..

echo "✅  Backend running (PID $BACKEND_PID)"
echo ""
echo "📦  Frontend build is in frontend/dist/"
echo "    Serve it with any static host, or run:"
echo "    npx serve frontend/dist"
echo ""
echo "    API: http://localhost:3001"
echo "    Admin login: superadmin / Admin@BOZ2024"
echo ""
echo "Press Ctrl+C to stop the backend."

wait $BACKEND_PID
