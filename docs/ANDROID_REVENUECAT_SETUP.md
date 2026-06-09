# Android + RevenueCat setup (Peak Performance Code)

Use this checklist to ship the **same subscription** on Google Play as on iOS. The app code is already cross-platform — `services/purchases.ts`, `app/paywall-placeholder.tsx`, and `requirePro()` work on both platforms once the stores and RevenueCat are configured.

Shared identifiers live in [`constants/revenuecat.ts`](../constants/revenuecat.ts).

---

## 1. Google Play Console

1. Open [Google Play Console](https://play.google.com/console) → **Create app** (if needed).
2. Set **Package name** to **`com.colmmcs.dailydiesel`** — must match `app.json` / `constants/revenuecat.ts`. You cannot change it later.
3. Complete required setup items (privacy policy, content rating, etc.) — internal testing has a lower bar than production but some fields are still required.

### Subscriptions (mirror iOS)

4. Go to **Monetize → Products → Subscriptions**.
5. Create products on Google Play with these **same product IDs** (RevenueCat supports matching IDs across stores):

   | Product ID | Type | iOS name in RevenueCat |
   |------------|------|------------------------|
   | `dailydiesel_monthly` | Subscription | Peak Performance Code Monthly |
   | `dailydiesel_yearly` | Subscription | Peak Performance Code Yearly |
   | `dailydiesel_lifetime` | One-time / non-subscription IAP | Peak Performance Code Lifetime |

6. Activate each product and configure pricing.
7. Add **License testers** under **Setup → License testing** (your Gmail accounts) for sandbox purchases before going live.

---

## 2. RevenueCat dashboard

1. Open [RevenueCat](https://app.revenuecat.com) → your **Peak Performance Code** project.
2. **Apps** → **+ New** → **Google Play Store**.
   - Package name: `com.colmmcs.dailydiesel`
3. Link Google Play (service account):
   - Play Console → **Setup → API access** → link/RevenueCat instructions.
   - Create a service account with **View financial data** + **Manage orders** (RevenueCat docs show exact roles).
   - Upload the JSON key in RevenueCat → Android app settings.
4. Copy the **Google Play API key** (`goog_…`) from RevenueCat → **Project settings → API keys → Android**.

### Products & entitlement (same as iOS)

5. **Product catalog → Entitlements** — confirm **`Daily Diesel Pro`** exists (same ID as iOS; legacy RevenueCat identifier).
6. **Products** — import/link your Google Play subscription product IDs.
7. Attach **both** iOS and Android products to the **`Daily Diesel Pro`** entitlement.
8. **Offerings → default** — add Google Play products to each package:
   - `$rc_monthly` → `dailydiesel_monthly`
   - `$rc_annual` → `dailydiesel_yearly`
   - `$rc_lifetime` → `dailydiesel_lifetime`
9. **Paywalls** — use the same hosted paywall as iOS (already rendered in `app/paywall-placeholder.tsx`).

---

## 3. Put the Android API key in the app

**Option A — `app.json` (simplest)**

Replace the placeholder in `app.json`:

```json
"revenueCatAndroidKey": "goog_your_actual_key"
```

**Option B — EAS secret (recommended for CI)**

```bash
eas secret:create --name REVENUECAT_ANDROID_KEY --value goog_your_actual_key --scope project
```

`app.config.ts` reads `REVENUECAT_ANDROID_KEY` at build time. For local dev, copy `.env.example` → `.env.local`.

---

## 4. Build for Android

### Internal APK (quick sideload to testers)

```bash
eas build --platform android --profile preview
```

Share the download link from the EAS dashboard. Testers may need to allow installs from unknown sources.

### Google Play internal testing (TestFlight equivalent)

```bash
eas build --platform android --profile production
eas submit --platform android --latest
```

Or upload the `.aab` manually in Play Console → **Testing → Internal testing**.

Bump **`android.versionCode`** in `app.json` (or let EAS `autoIncrement` handle production builds) for every new upload.

---

## 5. Test purchases on Android

1. Install a **release/preview build** — billing does not work in Expo Go.
2. Sign in on the device with a **License tester** Google account.
3. Open the app → trigger paywall (onboarding end, or tap gated content).
4. Complete a test purchase → confirm **Daily Diesel Pro** unlocks content.
5. Test **Restore purchases** on the paywall.
6. In RevenueCat → **Customers**, confirm the device appears with the entitlement.

---

## 6. What the app already does (no extra code needed)

| Feature | File |
|---------|------|
| Configure SDK per platform | `services/purchases.ts` |
| Hosted paywall | `app/paywall-placeholder.tsx` |
| Gate videos, PDFs, workbooks | `requirePro()` callers |
| Entitlement listener | `addCustomerInfoListener()` on About, etc. |
| Startup configure | `app/_layout.tsx` |

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| “No API key configured for platform android” | Set `revenueCatAndroidKey` / `REVENUECAT_ANDROID_KEY` |
| Paywall empty / products missing | Products not imported in RC or not in **default** offering |
| Purchase fails immediately | License tester not added, or app not signed with Play upload key |
| iOS purchase doesn’t unlock Android | Enable **Restore**; for cross-platform same RC user, users must restore or use same account — or set up [RevenueCat identity](https://www.revenuecat.com/docs/customers/user-ids) if you add logins later |

---

## Checklist

- [ ] Play app created with `com.colmmcs.dailydiesel`
- [ ] Subscriptions created and active in Play Console
- [ ] License testers added
- [ ] Google Play app + service account linked in RevenueCat
- [ ] Products attached to **Daily Diesel Pro** entitlement
- [ ] Default offering configured
- [ ] `goog_…` API key in project
- [ ] EAS Android build uploaded
- [ ] Test purchase + restore on a real device
