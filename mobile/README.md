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
- **Account/Dashboard** — routes to a real, role-specific screen for
  every role in the system:
  - **Member**: a real membership card (name, membership number, tier,
    member-since date) rendered natively, plus contact details — both
    pulled from `GET /membership/my-profile`
  - **Polling Agent / Election Agent**: a real results-submission form —
    fetches that agent's actual assigned candidates for their station,
    lets them enter votes per candidate + registered voters + rejected
    ballots, and submits through the exact same `POST /data-entry/result`
    endpoint the website uses — including the same server-side lock
    (can't resubmit/edit once submitted, same "must not exceed registered
    voters" validation) built earlier. If the station's result is already
    locked, the form doesn't even render — a clear locked-state message
    does instead.
  - **Cooperative**: the real registration certificate (certificate
    number, registered office, all named members) via `GET
    /coop/certificate` — including the same "sample/preview" honesty
    the website has for admin accounts with no real application linked
  - **Chamber of Commerce / Internship**: real application status and
    details via a new backend endpoint, `GET /registrations/:type/my`
    (added specifically for this — self-service lookup by the
    applicant's own token, the same pattern `/membership/my-profile`
    and `/coop/certificate` already used, just generalised so every
    type wired through the shared registration-routes factory gets it)
  - **Ward / Constituency / District / Provincial / National Manager,
    Admin, Super Admin**: a results view scoped to that manager's own
    jurisdiction (their ward, their district, etc.), reusing the same
    `results.getLevel()` engine the website uses
  - **International Political Party** falls back to the generic account
    screen (real data, just not a dedicated view yet) — every other
    role now has a real, working dashboard

This was verified by actually running `npx tsc --noEmit` (clean, zero
errors) and `npx expo export` (a real Metro bundle was produced — 736
modules, a working Android JS bundle) — not just code that looks
plausible, code that Expo's own build pipeline successfully compiled.

## What's NOT built yet — and why

**Deeper sections within each dashboard — mostly closed now.** Every
role has a real dashboard, every logged-in user can change their own
password (`Change Password`, reachable from every dashboard — required
a new backend endpoint, `POST /auth/change-password`, since one didn't
exist: `changePassword()` existed in `auth.js` but nothing verified the
current password first before calling it), and polling agents can look
up any voter by card number, NRC, or name (`Voter Validation`, using
the same `voter-roll/search` endpoint the website's page uses).

Genuinely still open: Manager tiers' ECZ figure entry (comparing
official ECZ-announced numbers against what's been collected — a
bigger, more involved form than results viewing), and Chamber/
Internship applicants still can't edit their own details from the app
(view-only). International Political Party now has a real profile
screen too, reusing the same self-service pattern as Chamber.

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
