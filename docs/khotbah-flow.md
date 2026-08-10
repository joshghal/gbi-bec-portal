# Catatan Khotbah — Flow Diagrams

Visual companion to [`khotbah-automation.md`](./khotbah-automation.md). Diagrams
are Mermaid, so they render on GitHub.

---

## 1. The happy path

```mermaid
flowchart TD
    A["🕐 Cloud Scheduler<br/>Sun 17:30 WIB<br/><code>30 17 * * 0</code>"] --> B["Cloud Run Job<br/><code>sunday-runner.js</code>"]
    B --> C{"Poll YouTube RSS<br/>every 5 min<br/>live 'Ibadah Raya N'?"}
    C -- no --> C
    C -- yes --> D["Wait +20 min<br/>after stream start<br/>(skip worship)"]
    D --> E["spawn <code>live-summary.js</code>"]
    E --> F[("Firestore<br/>sermon_captures/{id}<br/>status = capturing")]
    F --> G["ffmpeg pulls HLS audio<br/>→ Gemini 3.1 Live transcribes"]

    G -->|"FIRST AUDIO byte"| H["🪝 HOOK 1<br/>POST /notify-notetaker"]
    H --> I["mint note_links/{token}<br/>12h TTL, single use"]
    I --> J["📱 WhatsApp template<br/>catatan_khotbah_link"]

    J --> K["🧑 Notulen opens the form"]
    L["🔖 or opens their permanent<br/>bookmark /notulen/&lt;slug&gt;"] --> K

    K --> M["✍️ writes notes<br/>→ Kirim (confirm dialog)"]
    M --> N[("manualNotes = ...<br/>stopRequested = true")]

    N --> O["Engine polls stopRequested<br/>every 15s → finish()"]
    O --> P["Gemini 2.5 Pro<br/>final summary on full transcript"]
    P --> Q["upload transcript + summary → GCS"]
    Q --> R[("status = captured")]

    R --> S["🪝 HOOK 2<br/>POST /publish-chain<br/>(awaited by the engine)"]
    S --> T["combine<br/>manual notes = skeleton<br/>AI summary = enrichment"]
    T --> U["create kabar post<br/>published = true"]
    U --> V["revalidatePath /kabar"]
    V --> W["🌐 live on gbibec.id/kabar"]
    V --> X["📱 admin notified"]

    style A fill:#e0f2fe,stroke:#0369a1
    style J fill:#dcfce7,stroke:#15803d
    style L fill:#dcfce7,stroke:#15803d
    style W fill:#fef9c3,stroke:#a16207
    style N fill:#fee2e2,stroke:#b91c1c
    style R fill:#fee2e2,stroke:#b91c1c
```

**The two red nodes are the whole trick.** Submitting the form writes the notes
*and* raises `stopRequested`. The engine was already polling that flag for the
admin's manual stop button, so the notulen inherits an existing mechanism rather
than needing a new one.

---

## 2. Who talks to whom

```mermaid
sequenceDiagram
    participant S as Cloud Scheduler
    participant E as Engine<br/>(Cloud Run Job)
    participant F as Firestore
    participant P as Portal<br/>(Vercel)
    participant M as Meta<br/>Cloud API
    participant N as Notulen
    participant G as Gemini

    S->>E: run job (SERVICE_NUMBER=5)
    E->>E: poll YouTube RSS until live
    E->>F: create capture (status=capturing)
    E->>G: stream audio → transcript

    Note over E: first audio received
    E->>P: POST /notify-notetaker<br/>x-internal-secret
    P->>F: read settings/notetakers
    P->>F: create note_links/{token}
    P->>M: send template + URL button
    M->>N: 📱 link

    Note over N: sermon ends
    N->>P: POST /api/notulen/{slug}<br/>{ notes }
    P->>F: manualNotes + stopRequested=true
    P-->>N: "Terima kasih" (immediate)

    E->>F: poll stopRequested (15s)
    F-->>E: true
    E->>G: final summary (2.5 Pro)
    E->>F: status=captured + finalSummary
    E->>P: POST /publish-chain (awaited)
    P->>G: combine manual + AI
    P->>F: create kabar (published)
    P->>M: notify admin
    P-->>E: outcome
    E->>E: exit 0
```

The engine **awaits** `/publish-chain` because the process exits immediately after;
an unawaited call would be killed mid-flight.

---

## 3. Publishing decision

```mermaid
flowchart TD
    A["capture reaches status=captured"] --> B{"notulen notes<br/>present?"}
    B -- no --> C{"AI summary<br/>present?"}
    C -- no --> D["❌ nothing created<br/>admin alerted<br/><code>draft-no-summary</code>"]
    C -- yes --> E["📝 kabar as UNPUBLISHED draft<br/>admin alerted<br/><code>draft-no-notes</code>"]
    B -- yes --> F["combine via Gemini"]
    F -- fails --> E
    F -- ok --> G["✅ kabar PUBLISHED live<br/>admin notified<br/><code>published</code>"]

    style G fill:#dcfce7,stroke:#15803d
    style E fill:#fef3c7,stroke:#a16207
    style D fill:#fee2e2,stroke:#b91c1c
```

**Only combined notes go public unattended.** The combine exists because ASR
mishears speaker names and Bible references; a notulen who was in the room has
cross-checked them. AI-only output has had no such check, so it stops at draft.

---

## 4. Two delivery paths

```mermaid
flowchart LR
    subgraph permanent["🔖 Permanent link — no Meta needed"]
        P1["/notulen/&lt;slug&gt;<br/>never changes"] --> P2["server resolves<br/>whichever service<br/>is live right now"]
    end
    subgraph onetime["📱 One-time link — needs Meta"]
        O1["/catatan/&lt;token&gt;<br/>new each service"] --> O2["pushed on first audio<br/>12h TTL, single use"]
    end
    P2 --> FORM["same notes form"]
    O2 --> FORM
    FORM --> PIPE["same pipeline"]

    style permanent fill:#f0fdf4,stroke:#15803d
    style onetime fill:#eff6ff,stroke:#1d4ed8
```

| | Permanent | One-time |
| --- | --- | --- |
| Needs a template | no | yes |
| Needs Meta allow-list | no | yes |
| Survives Meta breaking | **yes** | no |
| Delivery | bookmark once | automatic weekly |

The permanent link is the floor: if every Meta dependency fails, Sunday still
publishes.

---

## 5. Failure branches

```mermaid
flowchart TD
    A["Job fires 17:30"] --> B{"live stream<br/>found?"}
    B -- no --> Z1["exit — no link sent<br/>(HOOK 1 is on first audio,<br/>never on job start)"]
    B -- yes --> C{"notulen submits?"}
    C -- yes --> D["stopRequested → finalize → publish"]
    C -- "no, stream ends" --> E["endReason=stream-ended"]
    C -- "no, 90 min cap" --> F["endReason=max-duration<br/>⚠ sermon may be cut"]
    E --> G["HOOK 2 → draft only"]
    F --> G
    C -- "submits AFTER capture ended" --> H["no engine alive"]
    H --> I["submit handler runs chain<br/>itself via after()"]
    I --> D

    style Z1 fill:#f1f5f9,stroke:#475569
    style G fill:#fef3c7,stroke:#a16207
    style D fill:#dcfce7,stroke:#15803d
```

---

## 6. Deployment status

```mermaid
flowchart LR
    subgraph done["✅ Done"]
        D1["code committed<br/>+ pushed"]
        D2["permanent token<br/>expires_at 0"]
        D3["Vercel env vars"]
        D4["GCP secret +<br/>Job env"]
        D5["Scheduler ENABLED<br/>Sun 17:30"]
    end
    subgraph blocked["🔴 Blocking Sunday"]
        B1["merge + deploy prod<br/>routes are 404"]
        B2["rebuild engine image<br/>built 21 Jun, no hooks"]
        B3["firestore rules"]
    end
    subgraph optional["⚪ Optional — nudge only"]
        O1["create templates"]
        O2["Meta allow-list slots"]
    end

    style done fill:#f0fdf4,stroke:#15803d
    style blocked fill:#fef2f2,stroke:#b91c1c
    style optional fill:#f8fafc,stroke:#64748b
```

Until **B1 and B2** land, next Sunday behaves exactly as today: it transcribes and
stops. Every hook lives in code that production has never seen.

---

## Code map

| Step | File |
| --- | --- |
| Scheduler → job | `gbi-bec-youtube-live-sync/deploy.sh` |
| Poll + spawn | `src/sunday-runner.ts` |
| Capture + both hooks | `src/live-summary.ts` — `callPortal()` |
| HOOK 1 target | `src/app/api/sermon-captures/[id]/notify-notetaker/route.ts` |
| Token mint / resolve | `src/lib/notetaker.ts` |
| Which service is live | `src/lib/notetaker.ts` — `findActiveCaptureForNotes()` |
| Public forms | `src/app/notulen/[slug]/`, `src/app/catatan/[token]/` |
| Submit + stop signal | `src/lib/notetaker-submit.ts` — `saveNotesToCapture()` |
| HOOK 2 target | `src/app/api/sermon-captures/[id]/publish-chain/route.ts` |
| Combine prompt | `src/lib/ai/combine-sermon.ts` |
| Kabar creation | `src/lib/sermon-kabar.ts` |
| WhatsApp senders | `src/lib/whatsapp.ts` |
