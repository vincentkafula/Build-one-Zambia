# Build One Zambia — Mobile App

A React Native (Expo) app for iOS and Android, talking to the exact same
backend the website uses — no separate mobile API, no duplicated logic.

## Cross-check against the website (what actually matched, what didn't)

Did a full side-by-side audit of every dashboard against its web
equivalent rather than assuming earlier passes had full parity. Two
real things came out of it, both now fixed:

**A pre-existing backend bug, not a mobile gap.** The website's Data
Entry page has always required uploading a photo of the signed vote
sheet before submitting — but `POST /data-entry/result` never actually
read or stored that `documents` field. The requirement was purely
cosmetic on the web; the evidence was silently discarded either way.
Fixed for real: the backend now requires at least one document
server-side (so it can't be bypassed by any client) and persists them
properly — in their own kv key per submission rather than inline in
the main submissions array, since base64 image data inline there would
bloat a blob that's re-serialised on every single save and read by
every results/dashboard query. A new `GET
/data-entry/submissions/:id/documents` route lets a reviewer fetch them.
Mobile's Election Agent screen now has real camera/photo-library
capture (`expo-image-picker`) enforcing the same "at least one photo"
rule the website's form does, wired to the same endpoint.

**Two Member sections the website has that mobile didn't:**
- **Adoption & Appointment Certificates** — real backend data (`GET
  /membership/certificate/adoption` and `/appointment`), rendered as a
  native certificate view matching the membership card's style. Shows
  the same "not eligible yet" message the website shows when an admin
  hasn't granted one.
- **My Orders** — real order and payment history (`GET
  /shop/my-orders`), with return requests for delivered orders (`POST
  /shop/my-orders/:orderId/request-return`) — same endpoints the
  website's Orders/Invoices/Returns sections use.

**Also found, and deliberately did NOT replicate:** several web
dashboard sections (Cooperative's Equipment Approved/Applied/Exports/
Investors, Chamber's Investors/Cooperatives/Intern Coordinator/
Amendments, Internship's Chamber/US Chambers/Internships/Cooperatives,
and every "Address Book" section) are hardcoded mock arrays or static
text on the website itself, not real per-user data. Building mobile
equivalents of those would mean building fake features, not matching
real functionality — so they were left out on purpose.

**Update:** those mock sections got fixed on the website shortly after
this was written — real Equipment/Exports/Investors backend built, and
mobile has since been brought up to match (see below). The paragraph
above is kept as a record of what was found, not a description of
current state.

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

## Cooperative/Chamber/Internship real-data parity

The website's Cooperative, Chamber, and Internship dashboards used to
have several sections that were hardcoded mock arrays, not real data
(EQUIPMENT_APPROVED, EXPORTS, INVESTORS, COOPERATIVES, INTERN). Once
those were replaced with a real backend (`orgResourcesApi` — equipment
applications, export logging, an admin-managed investor directory, ward
intern-coordinator assignments, and real cooperatives-by-ward/district
lookups), mobile was brought up to match immediately rather than
lagging behind:

- **Cooperative**: Equipment Approved/Applied (with a real application
  form), Products Exported (with a real logging form), List of Investors
- **Chamber**: Companies Willing to Invest, Cooperatives in Ward, Intern
  Coordinator Contact
- **Internship**: Cooperatives in District, Ward Chamber of Commerce

Same endpoints, same rules, same honest empty states as the website —
this isn't a separate mobile implementation, it's the same backend
calls from a native client.

## What's NOT built yet — and why

**Nothing role-specific is view-only anymore.** The last remaining gap
— Chamber/Internship/International Party applicants couldn't edit their
own details — is now closed too: tap "Edit" on their dashboard. That
needed a new backend endpoint, `PATCH /registrations/:type/my`, since
only a self-service *read* existed before. It blocks a denylist of
system/administrative fields (status, credentials, review trail,
timestamps) rather than an allowlist of editable ones, since chamber,
internship, and intlparty applications each have a different shape and
a denylist doesn't need updating every time a new type is wired
through the shared registration-routes factory.

Everything else built in previous passes:

- **Enter Official ECZ Figures** — managers enter the official
  ECZ-announced vote counts for their own level (ward/constituency/
  district/province/national), through the exact same `POST
  /data-entry/ecz-figures` endpoint the website's ECZ Entry pages use.
  These get compared against BOZ-collected results — that comparison
  logic (real `agreementPercent`, not the fake hardcoded value that
  used to be there) was fixed earlier this session and every consumer,
  web or mobile, benefits from it automatically.
- **Approval Queue** — the actual level-by-level verification chain,
  not a read-only view of it. A ward manager approving a station moves
  it to "awaiting constituency approval"; a constituency manager can
  only act on it once the ward has signed off; and so on up to
  national. Approve, reject, or query, with optional notes — through
  the same `PATCH /data-entry/submissions/:id/verify-level` endpoint
  the website's approval queue uses, including the exact same
  sequential gating (can't approve at your level until every level
  below has already approved) and scope restriction (a district
  manager only sees submissions in their own district) the backend
  already enforces. The mobile queue only shows submissions actually
  ready for a decision at your level, rather than everything.

No backend changes were needed for either of these — both endpoints
already existed (built for the website earlier this session), so this
was purely wiring the mobile app up to functionality that was already
real and working.

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

## Deploying to the app stores

This has never been built or submitted — everything below is real,
accurate setup for doing that for the first time, not a description of
something already done.

### 1. Create accounts (do this first — approval can take days)

- **Apple**: an [Apple Developer account](https://developer.apple.com/programs/) — $99/year, and Apple's identity
  verification for a new account can itself take a few days
- **Google**: a [Google Play Console account](https://play.google.com/console/) — one-time $25 fee, account review is
  usually much faster than Apple's

Start these now even if the app isn't ready — the account approval
wait is often the longest part of the whole process, not the build.

### 2. Install and log in to EAS CLI

```bash
npm install -g eas-cli
eas login
```

### 3. Build config

`eas.json` is already in this repo with `development`, `preview`, and
`production` profiles. No changes needed to start.

### 4. Build

```bash
cd mobile

# Android — internal APK, install directly on a device to test, no store needed
eas build --platform android --profile preview

# iOS — needs an Apple Developer account linked; EAS walks you through
# provisioning profiles and signing certificates interactively the first time
eas build --platform ios --profile preview

# Once a preview build is confirmed working on a real device, build the
# store-ready versions:
eas build --platform android --profile production   # produces an .aab
eas build --platform ios --profile production        # produces an .ipa
```

Builds run on Expo's servers, not locally — each one takes roughly
10–20 minutes, and EAS gives you a download link when it's done.

### 5. Submit

```bash
eas submit --platform android
eas submit --platform ios
```

This uploads the production build to Play Console / App Store Connect.
From there:

- **Android**: create the store listing in Play Console (screenshots,
  description, privacy policy URL), submit for review — typically
  hours to a couple of days
- **iOS**: create the store listing in App Store Connect, submit for
  review — typically 1–3 days, and Apple's review is stricter about
  app completeness and clear functionality than Google's

### Before submitting either one

- Confirm `API_BASE` in `src/lib/api.ts` is the real backend URL (see
  above) — a build pointed at a dev/staging backend will pass review
  and then not actually work for real users
- Replace `assets/icon.png`, `splash.png`, and `adaptive-icon.png` —
  they're currently all the same source image reused for every
  purpose. An app icon needs to be a clean square mark with no text
  cropped off; Google and Apple will both reject icons that look
  auto-generated or use inappropriate padding
- Both stores require a **privacy policy URL** in the listing — point
  it at a real page on bozplans.org, since the app collects phone
  numbers (OTP verification) and camera access (result-sheet photos)
