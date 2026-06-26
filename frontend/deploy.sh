#!/usr/bin/env bash
# ================================================================
# Build One Zambia — One-Command Deployment Script
# Run this script ONCE to deploy the backend and configure secrets.
# After running, the system bootstraps itself automatically.
# ================================================================

set -euo pipefail

PROJECT_REF="jpysoquanfnphgvwdzbf"
BACKEND_URL="https://${PROJECT_REF}.supabase.co/functions/v1/server/make-server-8fca9621"

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║   Build One Zambia — Deployment Script               ║"
echo "║   Zambia 2026 General Election                       ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""

# ── Step 1: Check Supabase CLI ────────────────────────────────────
echo "→ [1/6] Checking Supabase CLI..."
if ! command -v supabase &>/dev/null; then
  echo "  Installing Supabase CLI via npm..."
  npm install -g supabase
fi
echo "  ✓ Supabase CLI ready"

# ── Step 2: Login ─────────────────────────────────────────────────
echo ""
echo "→ [2/6] Logging in to Supabase..."
supabase login

# ── Step 3: Link project ──────────────────────────────────────────
echo ""
echo "→ [3/6] Linking to project ${PROJECT_REF}..."
supabase link --project-ref "${PROJECT_REF}"

# ── Step 4: Set secrets ───────────────────────────────────────────
echo ""
echo "→ [4/6] Setting environment secrets..."
echo ""
echo "  You will be prompted for each secret."
echo "  Press Enter to skip a secret and set it later via the Supabase dashboard."
echo ""

read_secret() {
  local name="$1"
  local description="$2"
  echo "  ${description}"
  read -r -p "  ${name}: " value
  if [[ -n "${value}" ]]; then
    supabase secrets set "${name}=${value}"
    echo "  ✓ ${name} set"
  else
    echo "  ⚠ ${name} skipped — set manually in Supabase dashboard"
  fi
  echo ""
}

read_secret "RESEND_API_KEY"             "Email API key from resend.com (re_xxxxxxxxxxxxxxxx)"
read_secret "EMAIL_FROM_ADDRESS"         "Verified sender email (e.g. no-reply@bozplans.org)"
read_secret "TWILIO_ACCOUNT_SID"        "Twilio Account SID — from console.twilio.com (primary SMS provider)"
read_secret "TWILIO_AUTH_TOKEN"         "Twilio Auth Token — from console.twilio.com"
read_secret "TWILIO_FROM_NUMBER"        "Twilio phone number in E.164 format (e.g. +12015551234)"
read_secret "AFRICAS_TALKING_API_KEY"   "Africa's Talking API key — optional Twilio fallback"
read_secret "AFRICAS_TALKING_USERNAME"  "Africa's Talking username — optional (NOT 'sandbox')"
read_secret "AFRICAS_TALKING_SHORTCODE" "Africa's Talking shortcode — optional (e.g. BOZPLANS)"
read_secret "FLUTTERWAVE_SECRET_KEY"    "Flutterwave secret key (FLWSECK-xxxxxxxx)"
read_secret "FLUTTERWAVE_PUBLIC_KEY"    "Flutterwave public key (FLWPUBK-xxxxxxxx)"
read_secret "FLUTTERWAVE_WEBHOOK_HASH"  "Random secret string for Flutterwave webhook validation"
read_secret "SITE_URL"                  "Production site URL (e.g. https://bozplans.org)"

# ── Step 5: Run database migration ────────────────────────────────
echo "→ [5/6] Database migration..."
echo ""
echo "  IMPORTANT: You must manually run the SQL migration."
echo "  Open this URL and paste the contents of supabase/migrations/001_initial_setup.sql:"
echo ""
echo "  https://supabase.com/dashboard/project/${PROJECT_REF}/sql/new"
echo ""
read -r -p "  Press ENTER once you have run the migration SQL... "
echo "  ✓ Migration confirmed"

# ── Step 6: Deploy edge function ──────────────────────────────────
echo ""
echo "→ [6/6] Deploying edge function..."
supabase functions deploy server
echo "  ✓ Edge function deployed"

# ── Auto-bootstrap ────────────────────────────────────────────────
echo ""
echo "→ Triggering auto-bootstrap (creates admin account + seeds leadership)..."
HEALTH=$(curl -sf "${BACKEND_URL}/health" 2>/dev/null || echo '{"status":"error"}')
echo "  Health response: ${HEALTH}"

# ── Done ──────────────────────────────────────────────────────────
echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║   ✓ Deployment complete!                             ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""
echo "  Next steps:"
echo ""
echo "  1. Login at your app and go to Manager Dashboard → System Setup"
echo "     to seed candidates and upload the ECZ voter roll."
echo ""
echo "  2. IMMEDIATELY change the admin password:"
echo "     Username: Bozplans  |  Default password: Wakuca55"
echo "     Manager Dashboard → Security → Change Password"
echo ""
echo "  3. Register your Flutterwave webhook URL:"
echo "     ${BACKEND_URL}/gateway/webhook"
echo ""
echo "  System URL: ${BACKEND_URL}/health"
echo ""
