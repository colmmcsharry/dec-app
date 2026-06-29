# Kit (ConvertKit) email signup

The app sends optional marketing signups to **Kit** via a Netlify serverless function. Declan manages the list and sends newsletters from the [Kit dashboard](https://kit.com).

## App behaviour

- **Onboarding** — last slide, “Stay in the loop”, skippable (Continue / Skip without subscribing).
- **About** — “Email updates” card; subscribe or unsubscribe.
- Subscribers are added to your Kit **form** (triggers welcome automation if configured).

API endpoint (derived from `pdfBaseUrl` in `app.json`):

`https://dailydiesel.netlify.app/.netlify/functions/kit-subscribe`

---

## 1. Create Kit account

1. Sign up at [kit.com](https://kit.com) (free **Newsletter** plan supports up to 10,000 subscribers).
2. You and Declan can share one login (same as Dropbox).

## 2. Create a signup form

1. Kit → **Grow** → **Landing Pages & Forms** → **Create form**.
2. Name it e.g. `Peak Performance Code – App`.
3. Note the **Form ID** from the URL or form settings (numeric id).

Optional: connect a one-email **welcome sequence** to this form.

## 3. API key

1. Kit → **Settings** → **Developer** → **V4 API key**.
2. Create a key with permission to manage subscribers.

## 4. Netlify environment variables

In [Netlify](https://app.netlify.com) → site **dailydiesel** → **Project configuration** → **Environment variables**, add:

| Variable | Required | Description |
|---|---|---|
| `KIT_API_KEY` | Yes | Kit V4 API key |
| `KIT_FORM_ID` | Yes | **Numeric** form id from the form URL (e.g. `8736451`) — not the API key |
| `KIT_TAG_ONBOARDING` | No | Tag id for app onboarding signups |
| `KIT_TAG_ABOUT` | No | Tag id for About page signups |

Redeploy after setting variables by **pushing to the `Daily-Diesel` GitHub repo** (Netlify site `dailydiesel` / `performancetreanor.com` builds from that repo — **not** `dec-app`).

These paths must exist in **`Daily-Diesel`**:

- `netlify/functions/kit-subscribe.mjs`
- `netlify.toml` (with `[functions] directory = "netlify/functions"`)

The copy under `dec-app/netlify-site/` is a mirror for reference only.

Quick check after deploy:

```bash
curl -X POST https://dailydiesel.netlify.app/.netlify/functions/kit-subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","source":"onboarding"}'
```

You should get JSON back (not an HTML “Page not found”).

---

## 5. Import Declan’s old WordPress list (~550 subscribers)

**Yes — you can import them into Kit.**

1. **Export from WordPress**
   - If using **Jetpack** / **Subscribe to Comments** / similar: look for **Export subscribers** in the plugin settings.
   - Or **Tools → Export** if emails were stored as users (filter to subscribers only).
   - You need a **CSV with at least an `email` column** (header row required).

2. **Import into Kit**
   - Kit → **Subscribers** → **Import subscribers**.
   - Upload the CSV.
   - Map columns (email → Email).
   - For an **existing opted-in list**, choose import as **confirmed / active** subscribers (you should only import people who originally signed up for Declan’s blog emails).
   - Optionally add a tag e.g. `wordpress-legacy` to distinguish them from app signups.

3. **550 subscribers** fits easily on Kit’s free plan (10,000 limit).

**Legal note:** Only import addresses that previously opted in to Declan’s emails. Keep a copy of the export for your records.

---

## 6. Test

1. Deploy Netlify with env vars set.
2. In the app, complete onboarding email slide or use About → Subscribe with a test address.
3. Confirm the address appears under Kit → **Subscribers** and on the correct form.

---

## Troubleshooting

| Issue | Fix |
|---|---|
| “Email signup is not configured” | Set `KIT_API_KEY` and `KIT_FORM_ID` on Netlify and redeploy |
| Subscriber not on form | Check `KIT_FORM_ID`; verify form exists |
| Network error in app | Confirm device has internet; URL matches deployed Netlify site |

Do **not** put `KIT_API_KEY` in the mobile app or `app.json` — only on Netlify.
