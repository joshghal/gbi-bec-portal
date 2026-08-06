# WhatsApp Welcome Message — Setup Guide

How to make the **Pendaftaran Jemaat Baru** form (`/formulir/anggota-baru`) automatically
send a WhatsApp welcome to each new member, using the **official Meta WhatsApp Cloud API**
with **Coexistence** (keep using the WhatsApp Business app on the same number).

The code is already built. This guide covers the one-time Meta setup, which only you can do
in Meta's dashboards. Once you fill in the 2 environment variables at the end, it works.

---

## How it works (the two non-negotiable rules)

1. **It must be a pre-approved template.** The message is business-initiated (the member never
   messaged us first), so WhatsApp does **not** allow free-form text. Meta reviews and approves
   the wording once; after that we can send it with the member's name filled in. Our template is
   named `welcome_new_member`.
2. **The number needs Coexistence** so it stays usable in the WhatsApp Business *app* on the phone
   while ALSO sending via the API. Without Coexistence, migrating a number to the API removes it
   from the app.

## Requirements before you start

- The number is on the **WhatsApp Business app** (not personal WhatsApp), version **2.24.17+**.
- The number has been active on the Business app for **at least 7 days**.
- The number is **not** already connected to any other WhatsApp API/BSP.
- A **Meta (Facebook) account** you'll use as the admin.
- Indonesia is supported for Coexistence. ✅

---

## Part A — Meta Business + WhatsApp (one-time, ~30–45 min)

### 1. Create a Meta Business Portfolio
- Go to **business.facebook.com** → create a Business Portfolio for the church
  (name e.g. "GBI BEC"). Add the church name, website `https://www.gbibec.id`.

### 2. Create a Developer App
- Go to **developers.facebook.com** → **My Apps** → **Create App**.
- Type: **Business**. Link it to the Business Portfolio from step 1.
- On the app dashboard, **Add product → WhatsApp → Set up**.

### 3. Connect the existing number via Coexistence
- In the WhatsApp setup flow, choose to **connect an existing WhatsApp Business app number**
  (the Coexistence / "already use the WhatsApp Business app" option) rather than registering a
  brand-new number.
- You'll be shown a **QR code**. On the phone that holds the number, open **WhatsApp Business app
  → Settings → scan the QR** (under the linked-devices / advanced-tools area the flow points you to).
- Approve the link. The number is now on both the app and the Cloud API. Existing 1-on-1 chats stay
  in the app; new messages sync both ways.

> Menu labels shift over time. If the exact wording differs, the thing you're looking for is
> "**use my existing WhatsApp Business app number**" / "**Coexistence**" during WhatsApp onboarding
> — not "add a new phone number."

### 4. Grab the Phone Number ID
- In the app dashboard → **WhatsApp → API Setup**.
- Copy the **Phone number ID** (a long number — NOT the phone number itself).
  → this is `WHATSAPP_PHONE_NUMBER_ID`.

### 5. Create a permanent access token
The temporary token on the API Setup page expires in 24h. Make a permanent one:
- **business.facebook.com → Business Settings → Users → System users → Add** →
  create a system user (e.g. "whatsapp-bot"), role **Admin**.
- **Assign assets** → assign the **WhatsApp Account** (and the App) with full control.
- **Generate new token** → select the app → permissions **`whatsapp_business_messaging`** and
  **`whatsapp_business_management`** → generate.
- Copy it now (shown once). → this is `WHATSAPP_TOKEN`.

### 6. Submit the welcome template for approval
- **business.facebook.com → WhatsApp Manager → Manage templates → Create template**.
- Name: **`welcome_new_member`** (must match exactly).
- Category: **Utility** (keeps cost low and approval easy — do NOT pick Marketing).
- Language: **Indonesian (id)**.
- Body — paste exactly (the `{{1}}` is where the member's name is injected):

  ```
  Shalom {{1}}! 🙏

  Selamat datang di GBI Baranangsiang Evening Church (BEC). Terima kasih sudah mendaftar sebagai jemaat. Kami senang Anda menjadi bagian dari keluarga BEC.

  Ibadah Raya kami setiap Minggu pukul 17.00 WIB. Jika ada pertanyaan, silakan balas pesan ini.

  Tuhan Yesus memberkati. 🕊️
  ```

- In the template's **sample values**, set `{{1}}` = a sample name like `Budi` so Meta can review it.
- Submit. Approval usually takes minutes to a few hours (occasionally up to 24h).

> Keep the wording transactional (a welcome/confirmation). If you add promotional lines
> ("ajak teman", event ads), Meta reclassifies it as **Marketing** and it costs more per message.

---

## Part B — Plug it into the site (2 minutes)

Once the template is **Approved** and you have the token + phone number ID, set these env vars in
**Vercel → Project → Settings → Environment Variables** (Production), then redeploy:

```
WHATSAPP_TOKEN=<the permanent system-user token from A5>
WHATSAPP_PHONE_NUMBER_ID=<the phone number ID from A4>
WHATSAPP_TEMPLATE_NAME=welcome_new_member
WHATSAPP_TEMPLATE_LANG=id
WHATSAPP_API_VERSION=v21.0
```

That's it. Submit the form at `/formulir/anggota-baru` with your own number to test — you should
get the welcome within seconds. Until these are set, the form works normally and simply sends no
message (nothing breaks).

---

## Costs

Billed per message by Meta, category **Utility** (our template). Indonesia rate ≈ **$0.02/message**
(Meta adjusts periodically — check the official rate card). At real volume this is negligible:

| New members / month | ~Monthly cost |
| --- | --- |
| 20 | ~$0.40 |
| 50 | ~$1.00 |
| 100 | ~$2.00 |
| 300 | ~$6.00 |

Meta also includes a small monthly free allotment. If a member replies within 24h, your replies
back to them in that window are free (a normal "service" conversation).

---

## Troubleshooting

- **Nothing sent, no error in logs:** env vars not set → the sender no-ops (`skipped`). Confirm the
  two required vars exist in the deployed environment.
- **`(#132000) template ... does not exist` / language mismatch:** template name or `WHATSAPP_TEMPLATE_LANG`
  doesn't match the approved template. It must be `welcome_new_member` and language `id`.
- **`(#131030) recipient not in allowed list`:** before business verification, Cloud API only sends to
  numbers you added as test recipients in **API Setup**. Complete Meta **Business Verification** to
  message anyone, or add test numbers for now.
- **`(#131047) re-engagement / 24h`:** shouldn't happen for a template send; means the template send
  was rejected — re-check the template is Approved.
- **Number fell out of the app after linking:** you used the "new number" path, not Coexistence.
  Redo Part A step 3 choosing the existing-number/Coexistence option.

## Where it lives in the code

- Sender: `src/lib/whatsapp.ts` — `sendWelcomeMessage(phone, name)`, no-ops until configured, never throws.
- Trigger: `src/app/api/forms/route.ts` — POST handler, right after the Firestore write, `if (type === 'member')`.
- Form definition: `src/lib/form-config.ts` (`type: 'member'`) and page `src/app/formulir/anggota-baru/page.tsx`.
