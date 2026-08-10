# Meta WhatsApp Test Number — Step-by-Step Setup

For someone who has never opened developers.facebook.com. Roughly 45 minutes,
excluding template approval (minutes to 24h).

End state: the portal can WhatsApp the notulen a form link every Sunday, for free,
with no SIM, no card, and nobody's personal phone linked.

> **Meta renames things constantly.** Where a label here doesn't match what you
> see, look for the thing that *does what the step describes* — the flow itself has
> been stable for years even as the wording moves.

---

## Order matters

Do these in order. Step 5 is **irreversible** and step 4 is the one that might fail
— so prove the token works before you burn any recipient slots.

```
1. Business Portfolio   ← you probably already have one (ads)
2. Create the app
3. Add WhatsApp → get Phone number ID
4. Permanent token      ← MAKE-OR-BREAK. Do this before step 5.
5. Add recipients       ← IRREVERSIBLE. Never removable.
6. Smoke test
7. Templates
8. Env vars
```

---

## 1. Business Portfolio

You need one, and if you have ever run a Facebook/Instagram ad you already have it.

1. Go to **business.facebook.com** and log in with the Facebook account that
   manages the church's Instagram/ads.
2. Top-left shows the portfolio name. Note it — you will pick it again in step 2.

If nothing exists: **Create a business portfolio** → name it `GBI BEC`, add
`https://www.gbibec.id` as the website.

> Use the **existing** portfolio, not a fresh one. Step 4 depends on the app and the
> test WABA living under a real portfolio.

## 2. Create the app

1. Go to **developers.facebook.com** — same login as step 1.
2. Top-right **My Apps** → **Create App**.
3. **App name**: `GBI BEC Automation`. Contact email: yours.
4. **Business portfolio**: select the one from step 1. ← *do not skip this*
5. Next you get a use-case picker. Choose **Other** → then app type **Business** →
   **Create app**.
6. It will ask for your Facebook password to confirm.

You land on the app dashboard.

## 3. Add WhatsApp and get the Phone number ID

1. On the app dashboard, find **Add products to your app** → locate **WhatsApp** →
   **Set up**.
2. It asks which business portfolio to attach — pick the same one again.
3. Meta now auto-creates a **test phone number** and a **test WhatsApp Business
   Account (WABA)**. Nothing to buy, nothing to verify.
4. Left sidebar → **WhatsApp → API Setup**.

Copy these two values and keep them somewhere:

| On screen | You need it for |
| --- | --- |
| **Phone number ID** (a long number under the test number) | `WHATSAPP_PHONE_NUMBER_ID` |
| **WhatsApp Business Account ID** | step 4 and templates |

> The **Phone number ID is NOT the phone number.** It's a numeric ID next to it.

Ignore the temporary access token on this screen — it dies in 24 hours. Step 4
replaces it.

## 4. Permanent token — the make-or-break step

The 24h token would break the automation every day. A permanent one comes from a
**System User**.

1. **business.facebook.com** → gear icon → **Business settings**.
2. Left sidebar → **Users → System users** → **Add**.
   - Name: `khotbah-bot`
   - Role: **Admin**
   - Create.
3. Select `khotbah-bot` → **Add assets**.
   - **Apps** tab → tick `GBI BEC Automation` → enable **Full control** → Save.
   - **Add assets** again → **WhatsApp accounts** tab → tick your **test WABA** →
     enable **Full control** → Save.

> ### ⚠ This is the verification point
>
> **Does the test WABA actually appear in that WhatsApp accounts list?**
>
> - **Yes** → continue. The approach works.
> - **No** → stop. Only the 24h token is available, the automation would break
>   daily, and this whole path is dead. Tell me and I'll build the permanent-link
>   fallback instead — it needs no Meta account at all.

4. Still on `khotbah-bot` → **Generate new token**.
   - App: `GBI BEC Automation`
   - Token expiration: **Never**
   - Permissions — tick exactly these two:
     - `whatsapp_business_messaging`
     - `whatsapp_business_management`
   - **Generate token**.
5. **Copy it now.** Meta shows it once and never again. This is `WHATSAPP_TOKEN`.

## 5. Add recipients — IRREVERSIBLE

> **Read this before clicking anything.**
>
> The test number can message a maximum of **5 phone numbers, ever**. A number
> added here can **never** be removed or edited. A typo permanently destroys one of
> your five slots.
>
> Add **2 notulen + 1 admin (you)**. Keep 2 slots spare for turnover.

1. Back to **developers.facebook.com → your app → WhatsApp → API Setup**.
2. Find the **To** field → **Manage phone number list** → **Add phone number**.
3. Enter in full international form, no `+`, no spaces: `628xxxxxxxxxx`.
   - An Indonesian `0812...` becomes `62812...`.
4. Meta sends a verification code **to that number over WhatsApp**. The person
   holding the phone must read it to you, and you enter it to confirm.
   - So do this while your notulen are reachable. Each one takes ~30 seconds.
5. Repeat for each recipient. **Check every digit before saving.**

## 6. Smoke test — before touching templates

Prove the token and ID work using Meta's built-in `hello_world` template.
Substitute your three values:

```bash
curl -X POST "https://graph.facebook.com/v21.0/<PHONE_NUMBER_ID>/messages" \
  -H "Authorization: Bearer <PERMANENT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "messaging_product": "whatsapp",
    "to": "628xxxxxxxxxx",
    "type": "template",
    "template": { "name": "hello_world", "language": { "code": "en_US" } }
  }'
```

A WhatsApp message should arrive within seconds.

| Response | Meaning |
| --- | --- |
| `{"messages":[{"id":"wamid...."}]}` | Working. Continue. |
| `(#131030) recipient not in allowed list` | That number isn't in the step-5 list. |
| `Invalid OAuth access token` | Wrong or expired token — redo step 4. |
| `(#100) ... phone_number_id` | You used the phone *number* instead of its **ID**. |

**Re-run this exact command tomorrow.** If it still works 24h later, your token is
genuinely permanent and step 4 succeeded.

## 7. Create the two templates

**business.facebook.com → WhatsApp Manager → Manage templates → Create template**,
selecting your test WABA. Category **Utility**, language **Indonesian (id)**.

Exact body text and the dynamic-URL-button configuration for both
`catatan_khotbah_link` and `catatan_khotbah_status` are in
[`khotbah-automation.md`](./khotbah-automation.md) setup step 2.

Approval takes minutes to 24h. `catatan_khotbah_link` is required;
`catatan_khotbah_status` (admin alerts) is optional.

> Templates created on a test WABA do **not** transfer if you ever move to a real
> number. Recreating them is a 10-minute job.

## 8. Wire it up

Vercel → project → **Settings → Environment Variables** (Production), then redeploy:

```
WHATSAPP_TOKEN=<step 4>
WHATSAPP_PHONE_NUMBER_ID=<step 3>
WHATSAPP_TEMPLATE_LANG=id
WHATSAPP_API_VERSION=v21.0
WHATSAPP_NOTE_TEMPLATE_NAME=catatan_khotbah_link
WHATSAPP_STATUS_TEMPLATE_NAME=catatan_khotbah_status
```

Then finish setup steps 3–6 of [`khotbah-automation.md`](./khotbah-automation.md):
the internal webhook secret, the Cloud Run secret, Firestore rules, and registering
the notulen in `/admin/khotbah`.

---

## Common stumbles

| Symptom | Cause |
| --- | --- |
| Test WABA missing in step 4's asset list | App was created under a *test* portfolio instead of your real one. Redo step 2 selecting the existing portfolio. |
| Token worked yesterday, dead today | You copied the API Setup token, not the System User token. Redo step 4. |
| `hello_world` fails but the recipient is listed | Number stored in the wrong format. It must be `628...`, not `08...` or `+62...`. |
| Can't find "Business settings" | You're on developers.facebook.com. Business settings live on **business**.facebook.com. |
| Added a wrong number | Unrecoverable — that slot is gone. You have 5 total. |
