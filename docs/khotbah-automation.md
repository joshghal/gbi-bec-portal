# Catatan Khotbah — Sunday Automation

End-to-end automation of the sermon-notes pipeline: from "a live stream started"
to "the catatan khotbah is published on gbibec.id", with the notulen's phone as
the only human touchpoint.

Replaces the old manual loop (wait for YouTube → paste notes into admin → copy the
combined summary → create a kabar post → publish).

---

## Two ways the notulen gets the form

| | Permanent link (**default**) | One-time WhatsApp link |
| --- | --- | --- |
| URL | `/notulen/<slug>` — never changes | `/catatan/<token>` — new each service |
| Delivery | They bookmark it once | Pushed automatically over WhatsApp |
| Needs | Nothing | Meta Business account + approved template + a sender number |
| Status | **Live now** | Blocked — see setup step 1 |

Both feed the identical pipeline; only how the notulen reaches the form differs.

**The permanent link is the one that works today.** The WhatsApp push is an
optional layer that requires a Meta setup currently blocked by an advertising
restriction on the church's Business Portfolio. Everything below about templates
and phone numbers applies *only* to that optional layer — skip setup steps 1-2 if
you are using permanent links.

A permanent link carries no capture ID. Each time it is opened the server resolves
whichever service is live (or finished within the last 18h without notes) — that is
what lets a fixed bookmark work every Sunday. See `findActiveCaptureForNotes()`.

## The flow

```
Sun 17:30 WIB   Cloud Scheduler → Cloud Run Job → live-summary.js
                └─ registers sermon_captures/{docId}, status='capturing'

first audio     HOOK 1 → POST /api/sermon-captures/{id}/notify-notetaker
                └─ OPTIONAL WhatsApp push; no-ops when unconfigured

sermon ends     notulen opens their bookmark and submits
                └─ writes manualNotes + stopRequested=true

≤15s later      engine polls stopRequested → finalize
                └─ Gemini 2.5 Pro final summary → GCS → status='captured'

                HOOK 2 → POST /api/sermon-captures/{id}/publish-chain
                └─ combine (manual + AI) → create kabar → PUBLISH → revalidate
                └─ WhatsApps the admin what happened
```

The link is sent on **first audio**, not at job start. A scheduled run that finds
no live stream must not message the notulen.

Submitting the form **is** the "khotbah selesai" signal — there is no separate
stop button for the notulen. The confirm dialog says so explicitly, because an
accidental tap mid-sermon truncates the capture irreversibly.

## Publishing policy

Only **combined** notes auto-publish.

| Situation | Result |
| --- | --- |
| Notulen submitted notes | combine → **published live** → admin notified |
| Notes never arrived | kabar created as **unpublished draft** → admin alerted |
| Combine failed (Gemini down) | **unpublished draft** → admin alerted |
| Transcript empty | nothing created → admin alerted |

Rationale: the combine exists precisely because ASR mishears speaker names and
Bible references. A human who was in the room has cross-checked those in the
combined path. AI-only output has had no such check, so it does not go on the
public site unattended.

## Go-live checklist

Tick these in order. Everything in the portal is already built and deployed-ready;
these are configuration steps only.

- [ ] **1. Permanent token.** business.facebook.com → Business settings → Users →
      System users → Add (role Admin) → Add assets → *Apps* (Full control) →
      Add assets → *WhatsApp accounts* → your WABA (Full control) → Generate new
      token, expiration **Never**, scopes `whatsapp_business_messaging` +
      `whatsapp_business_management`. Copy immediately — shown once.
      → **If the WABA isn't in that asset list, stop and use a ~60-day long-lived
      user token instead**, with a rotation reminder.
- [ ] **2. Recipients.** Meta → WhatsApp → API Setup → *To* → Manage phone number
      list. **Max 5, permanent, unremovable.** Add 2 notulen + you. Each gets a
      WhatsApp code they must read back to you.
- [ ] **3. Vercel env vars** (Production), then redeploy:
      `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_TEMPLATE_LANG=id`,
      `WHATSAPP_API_VERSION=v21.0`,
      `WHATSAPP_NOTE_TEMPLATE_NAME=catatan_khotbah_link`,
      `WHATSAPP_STATUS_TEMPLATE_NAME=catatan_khotbah_status`,
      `INTERNAL_WEBHOOK_SECRET=<openssl rand -hex 32>`.
- [ ] **4. Prove it.** `/admin/khotbah` → Pengaturan Notulen → the ✈ button next
      to a number sends Meta's `hello_world`. A failure shows Meta's own error plus
      the fix. **Do this before writing any templates** — it validates token,
      phone number ID and recipient list in one call.
- [ ] **5. Re-test tomorrow.** Same ✈ button, 24h later. Still working ⇒ the token
      is genuinely permanent. This is the only real proof of step 1.
- [ ] **6. Templates.** Create `catatan_khotbah_link` (required) and
      `catatan_khotbah_status` (optional) — see step 2 of the optional setup below.
- [ ] **7. Engine secret.** Same `INTERNAL_WEBHOOK_SECRET` into Secret Manager and
      onto the Cloud Run Job, then redeploy the engine image (setup step 4 below).
- [ ] **8. Firestore rules.** `firebase deploy --only firestore:rules --project baranangsiang-evening-chur`
- [ ] **9. Notulen.** Add names in `/admin/khotbah`, Save, copy each permanent link
      and send it to them. **Do this even with WhatsApp working** — it's the
      fallback that keeps Sunday alive if a send fails.

Steps 1-7 are only for the WhatsApp push. Steps 8-9 alone give a fully working
pipeline.

## Setup — permanent links (the working path)

No Meta account, no phone number, no card, no approval. Two minutes.

1. **/admin/khotbah → Pengaturan Notulen & Otomasi.**
2. Under **Notulen**, add each person's **name**. The phone field is optional —
   leave it blank if you're not using the WhatsApp layer.
3. **Simpan.** Each person now has a permanent link.
4. Hit **Salin link** next to each name and send it to them however you like
   (your own WhatsApp, SMS, email). Tell them to **bookmark it**.

That's the whole setup. Then finish setup steps 3-6 below (webhook secret, Cloud
Run secret, Firestore rules).

What the notulen sees when they open it:
- **A service is live** → the notes form. Submitting stops the transcription.
- **A service finished < 18h ago with no notes** → the notes form, with copy
  saying nothing will be interrupted.
- **Nothing live** → *"Belum ada ibadah live"* and a nudge to bookmark the page.

Links never expire and are safe to reuse every week. They're unguessable
(64 bits of randomness) and `noindex`, but they are bearer links — anyone holding
one can submit notes, so treat them like a password.

To revoke someone: delete their row and save. Their link stops working
immediately. Adding them back mints a new link.

---

## Optional setup — the WhatsApp push

> **Status (10 Aug 2026): working.** The portfolio's advertising restriction
> ("prohibited from advertising, including claiming apps") turned out to block ads
> only — **reusing an already-existing developer app** sidesteps the claiming step
> that fails when creating a new one. A `hello_world` send returned HTTP 200.
>
> Two things to know:
> - **Reuse the existing app.** Creating a new one hits the claiming block.
> - **The permanent token is the remaining unknown** — see checklist step 1.

### 1. A sender phone number — Meta's free test number

We use the **test phone number Meta provisions with every app**. No SIM, no
purchase, no card, and no borrowing anyone's personal phone.

Why the alternatives were all ruled out:

| Option | Blocker |
| --- | --- |
| Prepaid SIM | Not wanted |
| Twilio virtual number | Twilio needs its own card payment; card gets limited |
| Real number on Cloud API | **Meta requires a payment method for real numbers.** Prepaid/virtual cards are rejected — it wants a bank-issued card enabled for international online charges. PayPal is not accepted. |
| Coexistence on a church number | All three published numbers are volunteers' personal phones |

Test numbers are the one official path that needs **no payment method at all** —
they have relaxed messaging limits and send template messages without billing.

> **Never opened developers.facebook.com before?** Follow
> [`meta-test-number-setup.md`](./meta-test-number-setup.md) — a click-by-click
> walkthrough of everything below — then come back here for step 2.

**a. Get the number**

developers.facebook.com → your app → **WhatsApp → API Setup**. Meta has already
created a test number and a test WABA. Copy the **Phone number ID** →
`WHATSAPP_PHONE_NUMBER_ID`.

Create the app under your **existing (ads) Business Portfolio**, not a new test
portfolio — step (c) depends on it.

**b. Add the recipients — ⚠ THIS IS IRREVERSIBLE**

Same API Setup screen → **To → Manage phone number list** → add each number.

> **Hard cap of 5, and a number can NEVER be removed once added.** Notulen *and*
> admin-alert numbers both count against the 5.
>
> Add **2 notulen + 1 admin** and keep 2 slots spare for turnover. Triple-check
> each number in full international form (`628xxxxxxxxxx`) before saving — a typo
> permanently burns a slot.

**c. Get a permanent token — verify this before relying on it**

The token on the API Setup screen **expires in 24 hours**. A non-expiring one comes
from a System User: follow `whatsapp-setup.md` Part A step 5, and when assigning
assets pick the **test WABA** in the WhatsApp Accounts tab.

This works because the app lives under your real Business Portfolio, so the test
WABA is a portfolio-owned asset. **Confirm the test WABA actually appears in that
asset list.** If it does not, and only the 24h token is available, this approach is
dead — the automation would break every day. Fall back to the permanent-link option
(see below).

**d. What you give up**

- 5 recipients, forever. Enough for notulen, not for congregation-wide messaging.
- Templates created on a test WABA do **not** transfer if you later move to a real
  number — you would recreate them (a 10-minute job).
- `welcome_new_member` stays dormant: messaging real members needs a real number,
  which needs a card Meta will accept.

**If this path fails** at step (b) or (c), the zero-dependency fallback is to drop
the WhatsApp push entirely and give each notulen a **permanent bookmark link** that
always shows whichever service is currently live. No number, no card, no Meta
account, no recipient cap. Everything else in this pipeline stays exactly as-is —
only the delivery of the link changes.

### 2. Two message templates

Business-initiated messages require approved templates. Create both in
**business.facebook.com → WhatsApp Manager → Manage templates**, category
**Utility**, language **Indonesian (id)**.

#### `catatan_khotbah_link` — required

Body:

```
Shalom {{1}}! 🙏

Transkripsi {{2}} sudah berjalan. Setelah khotbah selesai, silakan kirim catatan Anda lewat tombol di bawah.

Catatan Anda akan digabung dengan hasil transkrip dan diterbitkan otomatis di halaman Kabar.

Tuhan Yesus memberkati. 🕊️
```

Sample values: `{{1}}` = `Budi`, `{{2}}` = `Ibadah Raya 5 · 10 Agustus 2026`.

Button → **Call to action → Visit website → Dynamic**:
- Base URL: `https://www.gbibec.id/catatan/`
- Button text: `Isi Catatan Khotbah`
- Sample suffix: any 32 hex chars, e.g. `0123456789abcdef0123456789abcdef`

> The base URL is baked into the approved template; only the token travels at send
> time as the suffix. That is why tokens are plain hex — no escaping ambiguity.

#### `catatan_khotbah_status` — optional

Admin notifications. If this never gets approved the pipeline is unaffected — you
just lose the alerts.

Body:

```
Update otomasi catatan khotbah.

Ibadah: {{1}}
Status: {{2}}
```

Sample values: `{{1}}` = `Ibadah Raya 5 · 10 Agustus 2026`, `{{2}}` = `Catatan khotbah sudah TERBIT otomatis.`

Button → **Visit website → Dynamic**, base URL `https://www.gbibec.id/`,
button text `Buka`, sample suffix `admin/khotbah`.

### 3. Environment variables

**Vercel → Settings → Environment Variables (Production)**, then redeploy:

```
WHATSAPP_TOKEN=<permanent system-user token>
WHATSAPP_PHONE_NUMBER_ID=<phone number ID>
WHATSAPP_TEMPLATE_LANG=id
WHATSAPP_API_VERSION=v21.0
WHATSAPP_NOTE_TEMPLATE_NAME=catatan_khotbah_link
WHATSAPP_STATUS_TEMPLATE_NAME=catatan_khotbah_status

INTERNAL_WEBHOOK_SECRET=<generate: openssl rand -hex 32>
GEMINI_API_KEY=<already set — used by the combine>
```

`INTERNAL_WEBHOOK_SECRET` is how the Cloud Run engine authenticates to the portal.
**If it is unset, the callback endpoints reject everything** — a missing env var
must never make them public.

### 4. Give the engine the same secret

```bash
PROJECT=baranangsiang-evening-chur

# Store it once
printf '%s' '<the same secret>' | gcloud secrets create internal-webhook-secret \
  --project "$PROJECT" --data-file=- \
  || printf '%s' '<the same secret>' | gcloud secrets versions add internal-webhook-secret \
       --project "$PROJECT" --data-file=-

# Attach to the job
gcloud run jobs update gbi-bec-youtube-live-sync \
  --region asia-southeast1 --project "$PROJECT" \
  --update-secrets "INTERNAL_WEBHOOK_SECRET=internal-webhook-secret:latest" \
  --update-env-vars "PORTAL_URL=https://www.gbibec.id"
```

Then rebuild and redeploy the engine image so the new hooks ship:

```bash
cd ../gbi-bec-youtube-live-sync && ASI1_API_KEY=<key> bash deploy.sh
```

### 5. Firestore rules

```bash
firebase deploy --only firestore:rules --project baranangsiang-evening-chur
```

`note_links` must stay closed to clients: the document ID **is** the credential, so
a readable collection would hand out every live link.

### 6. Register the notulen

**/admin/khotbah → Pengaturan Notulen & Otomasi**: add names (+ numbers only if
using WhatsApp), set the admin alert numbers, Save.

The *Kirim link otomatis via WhatsApp* switch controls **only** the WhatsApp push.
Permanent links work whether it is on or off — turning it off does not disable the
pipeline, it just stops the outbound messages.

---

## Verifying before a real Sunday

### Permanent links

No live stream needed. The link resolves any capture finished within 18h that has
no notes yet, so a recent Sunday works as the fixture:

```bash
# What does the link think is active right now?
curl -s https://www.gbibec.id/api/notulen/<slug> | jq
```

| Response | Meaning |
| --- | --- |
| `{"status":"ok","service":"...","live":true}` | A capture is running. Submitting will stop it. |
| `{"status":"ok","live":false}` | Recent capture awaiting notes. Safe to rehearse on. |
| `{"status":"idle"}` | Nothing to write notes for — the page shows "Belum ada ibadah live". |
| `{"status":"not-found"}` | Bad slug, or that notulen was removed. |

Then open `/notulen/<slug>` on a phone, submit, and confirm the post at
`/kabar`. Because a capture accepts notes only once, use a capture you don't mind
consuming — or clear `manualNotes` on it from `/admin/khotbah` first.

### The WhatsApp push (only if unblocked)

```bash
curl -X POST "https://www.gbibec.id/api/sermon-captures/<docId>/notify-notetaker?force=1" \
  -H "x-internal-secret: $INTERNAL_WEBHOOK_SECRET"
```

Returns `{"skipped":true,...}` when the switch is off or no numbers are registered,
and `sentCount: 0` when the template or token is wrong — the `results[]` array
carries Meta's error message per recipient.

### The engine

To rehearse the engine side without waiting for Sunday, run a capture against any
live YouTube URL — `scripts/launch-service.sh` in the engine repo takes a video ID
directly.

## Failure modes

| Symptom | Cause |
| --- | --- |
| Notulen sees "Belum ada ibadah live" during a service | The capture never registered — check `/admin/khotbah` for a `capturing` row, and the Cloud Run Job logs. |
| Notulen sees "Link tidak dikenali" | Their row was removed, or renamed in a way that regenerated the slug. Copy the current link from settings and resend. |
| "Catatan untuk ibadah ini sudah dikirim" | Someone already submitted for this service — by design, one submission per capture. |
| A notulen's link stopped working | Deleting and re-adding a person mints a NEW slug. Their old bookmark is dead; send the new link. |
| No WhatsApp, no error | The WhatsApp switch is off, or no numbers registered. Permanent links are unaffected. |
| `sentCount: 0`, results say `template ... does not exist` | Template name or language mismatch. Must be `catatan_khotbah_link` / `id`. |
| `(#131030) recipient not in allowed list` | That number was never added to the test number's 5-slot recipient list. Add it in API Setup → Manage phone number list — but remember additions are permanent. |
| Everything worked yesterday, all sends fail today | The 24h API Setup token was used instead of a permanent System User token. See setup step 1c. |
| Can't add a 6th notulen | The test number's cap. No way around it — move to a real number (needs a Meta-accepted card) or switch to permanent bookmark links. |
| Link opens "tidak valid" | Token expired (default 12h) or already used. Press *Kirim ulang* for a fresh one. |
| Notes saved but capture stays `capturing` | The engine died mid-run, so nothing is polling `stopRequested`. Notes are safe on the doc — re-run the capture or finish from `/admin/khotbah` manually. |
| Stream had already ended when notes were submitted | Expected. No engine is alive to call back, so the submit handler runs the chain itself via `after()`. Nothing to do. |
| Post created but not published | No notulen notes, or the combine failed — by design. See the outcome badge on the capture row. |
| `[portal] ... skipped` in engine logs | `INTERNAL_WEBHOOK_SECRET` or `PORTAL_URL` missing on the Cloud Run Job. |

## Where it lives

**Portal**
- `src/lib/notetaker.ts` — token mint/resolve, settings, `note_links` shape
- `src/lib/whatsapp.ts` — `sendNotetakerLink()`, `sendKhotbahStatus()`, `waMeLink()`
- `src/lib/internal-auth.ts` — shared-secret verification for engine callbacks
- `src/lib/ai/combine-sermon.ts` — the merge prompt (single source of truth)
- `src/lib/sermon-combine-runner.ts` — combine + persist, shared by route and chain
- `src/lib/sermon-kabar.ts` — kabar document construction, shared by both paths
- `src/app/api/sermon-captures/[id]/notify-notetaker/route.ts` — HOOK 1
- `src/app/api/sermon-captures/[id]/publish-chain/route.ts` — HOOK 2
- `src/app/api/notetaker/[token]/route.ts` — public submit (ends the capture)
- `src/app/catatan/[token]/` — public form page
- `src/components/notetaker-settings.tsx` — recipient config UI

**Engine** (`gbi-bec-youtube-live-sync`)
- `src/live-summary.ts` — `callPortal()` plus both hooks; the existing
  `stopRequested` poll at the "3c. Manual stop check" block is what the form trips.
