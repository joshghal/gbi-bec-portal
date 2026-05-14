# CLAUDE.md — Church Chat (GBI BEC)

Church management chatbot + form system for GBI Baranangsiang Evening Church (BEC) Sukawarna, Bandung.

---

## Tech Stack

- **Framework:** Next.js 16.1 (App Router) + React 19 + TypeScript 5
- **Styling:** Tailwind CSS 4 + Shadcn/UI (via @base-ui/react)
- **Database:** Cloud Firestore
- **Vector DB:** Pinecone (multilingual-e5-small, 384-dim)
- **LLM:** ASI1 Mini (via `https://api.asi1.ai/v1/chat/completions`)
- **Embedding:** Custom GCP Cloud Run service (`EMBEDDING_API_URL`)
- **Auth:** Firebase Auth (Google Sign-in) + custom RBAC
- **Sync:** Google Sheets API (auto-sync form submissions)
- **Deploy:** Vercel + Firebase (`baranangsiang-evening-chur`)

## Architecture

```
User → Chat (/) → /api/chat → Embed query → Pinecone search → ASI1 LLM → Response
User → Forms (/forms/*) → Chat-style step-by-step → /api/forms POST → Firestore + Sheets
Admin → /admin/* → JWT verify → RBAC permission check → Firestore CRUD
```

### Key Data Flows

- **Chat:** User message → embed → Pinecone top-5 → inject context into ASI1 prompt → JSON response with `response`, `suggestedQuestions`, `formTrigger`
- **Form submission:** Validate → duplicate check (name/phone) → Firestore write (with `searchTerms`) → Google Sheets sync → return editToken
- **Search:** `searchTerms` array on each doc, queried via Firestore `array-contains`. Tokens: name words, phone variants (08xx/628xx), email.
- **Admin auth:** Firebase JWT → lookup `admins/users/{email}` → role → permissions array → `hasPermission()` check

## Directory Structure

```
src/
  app/
    page.tsx              — Main chat interface (~2000 lines)
    forms/                — Public form pages (baptism, child-dedication, kom, prayer, mclass, edit/[id])
    admin/                — Admin panel (forms/*, settings, analytics, monitor, users)
    api/
      chat/               — Chat endpoint (embed → search → LLM)
      forms/              — Form CRUD + search + pagination + backfill-search
      forms/[id]/         — Single form GET/PUT/DELETE + status PATCH
      forms/baptism-dates — Dynamic baptism date options
      forms/settings      — Enable/disable forms
      documents/          — Knowledge base CRUD (Pinecone)
      admin/              — verify, users, roles
      analytics/          — Form analytics
      monitor/            — System monitoring
  components/
    form-direct.tsx       — Traditional form layout (sectioned cards, 2-col grid, pills)
    form-chat.tsx         — Chat-style UI (no longer used for forms)
    admin-form-table.tsx  — Admin table with search, pagination, WhatsApp
    chat-message.tsx      — Chat bubble renderer
    ui/                   — Shadcn primitives
  hooks/
    useAuth.ts            — Auth + permission hook (5-min role cache)
    useFormFlow.ts        — Form state machine
  lib/
    firebase.ts           — Client SDK init
    firebase-admin.ts     — Admin SDK + role cache + legacy migration
    pinecone.ts           — Vector search/upsert
    embeddings.ts         — Embedding API client
    google-sheets.ts      — Sheets sync (600+ lines, monthly tabs)
    ai/chat-handler.ts    — ASI1 API calls
    ai/chat-prompts.ts    — System prompt builder
    form-config.ts        — Form definitions (5 forms, steps, validation)
    form-types.ts         — TypeScript interfaces
    permissions.ts        — RBAC permission definitions
    search-utils.ts       — generateSearchTerms() + normalizePhoneForWhatsApp()
scripts/
  ingest.ts               — Bulk upload 22 knowledge base chunks to Pinecone
  seed-roles.ts           — Create default roles in Firestore
  setup-sheets.ts         — Create Google Sheets for each form type
```

## Firestore Schema

```
form_submissions/{docId}
  type: 'kom' | 'baptism' | 'child-dedication' | 'prayer' | 'mclass'
  status: 'pending' | 'reviewed' | 'completed'
  data: { namaLengkap, noTelepon, email, ... }
  editToken: UUID
  searchTerms: string[]       ← array-contains search tokens
  createdAt / updatedAt: ISO

settings/forms
  disabledForms: string[]

admins/users
  users: { 'email': { role, name, addedAt, addedBy } }

admins/roles
  roles: { 'role_name': { label, description, permissions[], isSystem } }

sheet_registry/{formType}
  spreadsheetId, spreadsheetUrl
```

## Firestore Indexes

Defined in `firestore.indexes.json`. Four composite indexes on `form_submissions`:
1. `[type ASC, createdAt DESC]`
2. `[type ASC, status ASC, createdAt DESC]`
3. `[type ASC, searchTerms CONTAINS, createdAt DESC]`
4. `[type ASC, status ASC, searchTerms CONTAINS, createdAt DESC]`

Deploy with: `firebase deploy --only firestore:indexes --project baranangsiang-evening-chur`

## Knowledge Base

22 chunks in `scripts/ingest.ts`, embedded and stored in Pinecone. Categories:
- `identitas` — Church identity, address, Google Maps, schedule
- `identitas/kontak` — WhatsApp numbers, Instagram, YouTube
- `jadwal` — Sunday worship (17:00 WIB), KOM schedule, M-Class schedule
- `baptisan` — Requirements, info
- `penyerahan_anak` — Child dedication requirements
- `pernikahan` — Marriage blessing requirements + documents
- `kaj` — Membership card requirements
- `kom` — KOM overview, curriculum (100-400), prerequisites, graduation
- `kegiatan` — COOL, M-Class
- `doa_kesaksian` — Prayer & testimony
- `pelayanan_jemaat` — Congregational care services

All activities state "tidak dipungut biaya". Do NOT use the word "gratis" — removed sitewide for tone reasons.

Re-ingest: `npx tsx scripts/ingest.ts` (requires embedding service running)

## Auth & Roles

5 default roles (seeded via `scripts/seed-roles.ts`):
- **super_admin** — `*` (all permissions)
- **form_manager** — All form pages + settings
- **content_editor** — Knowledge base only
- **viewer** — Read-only forms + analytics

Permission format: `page:{resource}` (e.g., `page:forms/baptism`, `page:settings`)

## Rate Limiting

In-memory sliding window (`src/middleware.ts`):
- `/api/chat` — 15/min
- `/api/forms` POST — 2/min (public submissions)
- `/api/forms` GET — 30/min
- `/api/documents`, `/api/analytics`, `/api/monitor` — 2/5s

## Forms

5 form types defined in `src/lib/form-config.ts`:
- **KOM** (10 steps) — external URL redirect to Google Form
- **Baptism** (12 steps) — includes dynamic date picker from `/api/forms/baptism-dates`
- **Child Dedication** (9 steps)
- **Prayer** (5 steps)
- **M-Class** (2 steps)

Form filling uses traditional direct-input layout (`FormDirect` component) — sectioned cards with 2-column grid, pill buttons for short selects, sticky submit. Chat-style `FormChat` is no longer used for forms.

## Admin Features

- **Form tables** — Search (Firestore array-contains), status filter, cursor pagination, WhatsApp inline button
- **Knowledge base** — Add/edit/delete Pinecone documents
- **Settings** — Enable/disable forms globally
- **Users** — Role assignment (super_admin only)
- **Analytics** — Form submission stats
- **Google Sheets** — Auto-linked per form type, monthly tabs

## Environment Variables

```
EMBEDDING_API_URL          — Embedding service endpoint
PINECONE_API_KEY           — Pinecone auth
PINECONE_HOST              — Pinecone endpoint
PINECONE_INDEX             — Index name (baranangsiang-evening-chruch)
ASI1_API_KEY               — LLM API key
GOOGLE_APPLICATION_CREDENTIALS — Path to GCP service account JSON
GOOGLE_SHEETS_SHARE_EMAIL  — Email to auto-share created sheets with
```

Note: Firebase client config is hardcoded in `src/lib/firebase.ts` (public keys, safe for client).

## Common Operations

```bash
# Dev server
npm run dev

# Deploy Firestore indexes
firebase deploy --only firestore:indexes --project baranangsiang-evening-chur

# Re-ingest knowledge base to Pinecone
npx tsx scripts/ingest.ts

# Seed default roles
npx tsx scripts/seed-roles.ts

# Backfill searchTerms on existing docs (one-time, needs admin auth token)
curl -X POST http://localhost:3000/api/forms/backfill-search -H 'Authorization: Bearer <token>'

# Type check
npx tsc --noEmit
```

## UI/UX Research Rule

**Always research Dribbble first** before implementing any UI/layout changes. When the user asks to research, redesign, or relayout any UI component:

1. Search Dribbble for relevant design patterns (e.g., "mobile form UI", "card list layout", "settings page")
2. If Dribbble is inaccessible (JS-rendered), fall back to design blogs (mockplus, justinmind, uicookies, etc.)
3. Extract concrete patterns (spacing, shadows, icon treatments, color usage) before writing any code
4. Apply patterns using the existing design token system — don't introduce one-off colors or sizes

## Known Quirks

- Pinecone index name has typo: `baranangsiang-evening-chruch` (missing 'h') — consistent everywhere, don't fix
- Google Sheets sync is fire-and-forget — errors logged but not surfaced to users
- Rate limiting is in-memory only — resets on Vercel cold starts (acceptable)
- KOM registration redirects to external Google Form, not built-in
