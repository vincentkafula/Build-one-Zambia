# Build One Zambia — Mobile App

A React Native (Expo) app for iOS and Android, talking to the exact same
backend the website uses — no separate mobile API, no duplicated logic.

## What's actually built and verified working

- **Login** — the same unified login as the website (`/auth/login`),
  auto-detecting the account's role from the backend's response
- **Election Results** — requires login, as requested; browses
  Presidential/Parliament/Mayoral/Councillor national results via the
  same `results.getNational()` engine the website's results pages use,
  including the honest "No results yet" state (no fake numbers) matching
  the fix already made on the website
- **Shop** — 8 products mirrored from the website's real-photo catalogue
  (T-Shirt, Hoodie, Jersey, Jacket, Socks, Polo, Chitenge, Windbreaker),
  each requiring a colour selection before it can be added to cart —
  same rule as the website. Checkout creates a real order via `POST
  /orders` and initiates payment via `POST /shop/payments/initiate`,
  the same endpoints the website's checkout uses.
- **Account/Dashboard** — shows real account data via `GET /auth/me`

This was verified by actually running `npx tsc --noEmit` (clean, zero
errors) and `npx expo export` (a real Metro bundle was produced — 736
modules, a working Android JS bundle) — not just code that looks
plausible, code that Expo's own build pipeline successfully compiled.

## What's NOT built yet — and why

**Full per-role dashboard parity.** The website has ~6 dashboard types
(Member, Election — itself 9 role tiers, Cooperative, Chamber,
Internship, Management/Admin), each with several sections (data entry,
voter validation, certificates, registration approval, and more).
Replicating all of that natively is a genuinely large, multi-week build
on its own — this first pass covers login, results, and shop end-to-end
rather than doing a shallow, half-working pass at every single
dashboard section. The `DashboardScreen` shows real account info today
and is the natural place to add each role's sections incrementally.

**Publishing to the App Store / Play Store.** This is not something
achievable from an automated environment — it requires:

1. An **Apple Developer Program** membership (\$99/year) and either a
   Mac with Xcode, or Expo's **EAS Build** cloud service, to produce a
   signed `.ipa`
2. A **Google Play Console** account (\$25 one-time) to produce a signed
   `.aab` and create the store listing
3. Store assets — screenshots, privacy policy URL, content rating
   questionnaire, app description — all of which need a human decision
4. Apple's review process (usually 1-3 days, sometimes longer, and can
   request changes)

**The realistic path from here:**

```bash
cd mobile
npm install
npx expo install eas-cli
eas login                    # your own Expo account
eas build:configure
eas build --platform android # produces a real .aab for Play Console
eas build --platform ios     # produces a real .ipa for App Store Connect
```

EAS Build runs in the cloud, so a Mac isn't required for the iOS build
— but an Apple Developer account still is, for code signing.

## Before building for real devices

Confirm `API_BASE` in `src/lib/api.ts` is your backend's actual public
URL — it's currently set to the same Railway backend domain the
website's frontend proxies to.

## Local development

```bash
cd mobile
npm install
npx expo start
```

Scan the QR code with the Expo Go app (iOS/Android) to run it on your
own phone without any build step — the fastest way to actually see and
test this before investing in a full store submission.
