# Landing Page Blueprint — BEC Sukawarna
## Comprehensive Design & Animation Specification

**Created:** March 17, 2026
**Status:** Approved — ready for implementation
**Reference sites:** [Edify Church](https://edifychurch.framer.website/), [Faith Template](https://faith-template.framer.website/)

---

## Table of Contents

1. [Content Inventory](#1-content-inventory)
2. [Sitemap](#2-sitemap)
3. [Typography](#3-typography)
4. [Color System](#4-color-system)
5. [Landing Page Sections](#5-landing-page-sections)
6. [Animation Blueprint](#6-animation-blueprint)
7. [Reference Site Analysis](#7-reference-site-analysis)
8. [Codebase Changes](#8-codebase-changes)
9. [Performance & Accessibility](#9-performance--accessibility)

---

## 1. Content Inventory

### Church Identity

- **Name:** GBI Baranangsiang Evening Church (BEC) / GBI Sukawarna
- **Address:** Jl. Baranang Siang No.8, Kb. Pisang, Kec. Sumur Bandung, Kota Bandung, Jawa Barat 40112
- **Coordinates:** -6.918881, 107.620721
- **Google Maps:** https://maps.app.goo.gl/DxqwnNHV8sZWEzHS7
- **Service time:** Setiap Minggu, 17:00 WIB

### Contacts

| Contact | Person | WhatsApp |
|---------|--------|----------|
| Call Centre BEC | — | 0878-2342-0950 |
| Unit Pernikahan | — | 0896-7929-9098 |
| KOM | Henny | 0858-6006-0050 |
| Pelayanan Jemaat | Ps. Thomas Lukiman | 0815-7309-7720 |
| Creative Ministry | Ibu Fera | 0821-1974-9869 |
| Creative Ministry | Ibu Lia | 0857-7491-0351 |
| COOL | Ps. Agus Sulistyono | 0819-1023-8170 |

### Social Media

- **Instagram:** @sukawarna.bec
- **YouTube:** youtube.com/@gbibaranangsiangsukawarna7008

### 8 Church Activities

| # | Activity | Color (from posters) | Schedule | Contact | Form/Link |
|---|----------|---------------------|----------|---------|-----------|
| 1 | **Baptisan Air** | Indigo `#6EA4FF` | 5 dates/year (bimonthly): 14 Mar, 9 May, 18 Jul, 12 Sep, 7 Nov 2026 | Call Centre | `/forms/baptism` |
| 2 | **KOM** | Silver `#C0C0D8` | KOM 100 & 200: Kamis 18:30 (online), KOM 300: Rabu 18:30 (online) | Henny | External Google Form |
| 3 | **M-Class** | Navy+Gold `#F0CC50` | Monthly — Senin setelah Minggu pertama | Call Centre | `/forms/mclass` |
| 4 | **COOL** | Amber `#F8BE70` | Setiap Selasa | Ps. Agus | WhatsApp |
| 5 | **Creative Ministry** | Gold `#F8BE58` | Setiap Sabtu | Ibu Fera / Ibu Lia | WhatsApp |
| 6 | **Pelayanan Jemaat** | Gold `#E0C468` | On request | Ps. Thomas | WhatsApp |
| 7 | **Penyerahan Anak** | Violet `#C098F0` | Per Gembala schedule | Call Centre | `/forms/child-dedication` |
| 8 | **Pemberkatan Nikah** | Rose `#F8A0B8` | By appointment (min 5 bulan sebelumnya) | Unit Pernikahan | WhatsApp |

### Creative Ministry Sub-Ministries (6)

| Ministry | Age | Schedule |
|----------|-----|----------|
| Choir Dewasa (Paduan Suara) | 17–45 thn | Sabtu 18:30 |
| Choir Anak (Paduan Suara Anak) | 7–13 thn | Sabtu 15:30 |
| Balet (Tarian Balet) | 10+ thn | Sabtu |
| Tamborine (Tari Tamborine) | 12+ thn | Sabtu |
| Banner (Tari Banner) | 10+ thn | Sabtu |
| Modern Dance (Tarian Modern) | 17+ thn | Sabtu |

### Pelayanan Jemaat Services (8)

| # | Service | Description |
|---|---------|-------------|
| 01 | Pelayanan Kedukaan | Pendampingan dan ibadah penghiburan |
| 02 | Ucapan Syukur | Peringatan 40/100 hari, 1 tahun |
| 03 | Kunjungan Sakit (RS) | Pendoaan di rumah sakit |
| 04 | Kunjungan Sakit (Rumah) | Pendoaan di rumah |
| 05 | Pengudusan | Rumah, kantor, tempat usaha, pabrik |
| 06 | Konseling | Pribadi, pernikahan, keluarga |
| 07 | Pelayanan Pelepasan | Kutuk/okultisme |
| 08 | Perjamuan Kudus di Rumah | Bagi lansia/tidak bisa ke gereja |

### Existing Forms (5)

| Form | Steps | Route |
|------|-------|-------|
| Baptisan | 12 | `/forms/baptism` |
| KOM | 10 | `/forms/kom` (redirect) |
| M-Class | 2 | `/forms/mclass` |
| Penyerahan Anak | 9 | `/forms/child-dedication` |
| Pokok Doa | 5 | `/forms/prayer` |

### Existing Assets

- **Poster HTML files:** 8 content posters + 8 cover posters in `public/posters/`
- **QR codes:** 12 QR PNGs (baptism, call centre, CM contacts, COOL, helpdesk, KOM, M-Class, pelayanan, penyerahan anak, pernikahan)
- **KOM images:** kom100.jpg, kom200.jpg, kom300.jpg
- **M-Class logo:** mclass-logo.png
- **Baptism assets:** dove, light-rays, water-splash, water-wave PNGs

---

## 2. Sitemap

```
PUBLIC
══════════════════════════════════════════════════════════════

/                              ← NEW: Landing page (animated)
│
├── #hero                      Welcome + service time + 2 CTAs
├── #tentang                   About BEC (identity, warm intro)
├── #kegiatan                  8 activities (sticky colored cards)
├── #pelayanan                 8 congregational services (4x2 grid)
├── #jadwal                    Full schedule table + Google Maps
├── #kontak                    All contacts + chat CTA + social
└── #footer                    Address, links, social, copyright

/chat                          ← AI chatbot (moved from /)

/forms                         ← Form selection
/forms/baptism                 ← Baptism registration (12 steps)
/forms/child-dedication        ← Child dedication (9 steps)
/forms/kom                     ← KOM redirect (Google Form)
/forms/prayer                  ← Prayer request (5 steps)
/forms/mclass                  ← M-Class registration (2 steps)
/forms/edit/[id]               ← Edit submission

/kom                           ← KOM materials listing
/kom/[level]                   ← KOM 100-400 content

/highlights                    ← Gallery
/promo                         ← Promo video (GSAP)


ADMIN (unchanged)
══════════════════════════════════════════════════════════════

/admin                         KB management
/admin/forms/*                 Submission tables
/admin/settings                Form toggles
/admin/analytics               Stats
/admin/monitor                 System health
/admin/users                   Role management
/admin/posters                 Poster management
```

---

## 3. Typography

### Decision

| Role | Font | Weights | Source |
|------|------|---------|--------|
| **Headings/Display** | **Judson** (serif) | 400, 700, 400 italic | Google Fonts, SIL OFL 1.1 |
| **Navigation/UI** | Plus Jakarta Sans (existing) | 300-800 | Already loaded |
| **Body** | Plus Jakarta Sans (existing) | 300-800 | Already loaded |

### Rationale

- Judson is the exact font Edify Church uses for headings (confirmed from CSS)
- Matches the serif + sans contrast pattern that gives premium feel
- BEC posters use Playfair Display (serif) + Inter (sans) — same pattern, Judson is lighter weight
- Plus Jakarta Sans stays for body/UI — no need to change existing app font
- Judson: 3 styles only (Regular, Bold, Italic) — lean, fast loading

### Typography Rules (from Edify analysis)

- Headings: Judson, `-0.03em` letter-spacing, `1.1em` line-height
- Body/Nav: Plus Jakarta Sans, `-0.01em` letter-spacing, `1.2em` line-height
- Hero heading: 48-72px desktop, 32-40px mobile
- Section headings: 32-40px desktop, 24-28px mobile
- Body: 16-18px, never smaller than 16px mobile
- Section labels (uppercase): Plus Jakarta Sans, `2px` letter-spacing, uppercase
- Max paragraph width: 65-75 characters (~600-700px)

---

## 4. Color System

### Current BEC Palette (OKLch, globals.css)

| Token | Value | Role |
|-------|-------|------|
| `--background` | `oklch(0.965 0.012 75)` | Warm cream page bg |
| `--foreground` | `oklch(0.250 0.015 60)` | Dark text |
| `--card` | `oklch(0.985 0.008 75)` | Card background |
| `--primary` | `oklch(0.370 0.060 250)` | Deep blue, CTAs |
| `--secondary` | `oklch(0.930 0.010 75)` | Light warm gray |
| `--muted-foreground` | `oklch(0.550 0.015 60)` | Gray text |
| `--border` | `oklch(0.905 0.010 70)` | Subtle borders |

### Activity Card Colors (from poster system)

Each sticky card on the Kegiatan section uses its poster accent as a dark background with light text:

| Activity | Background | Accent | Text |
|----------|-----------|--------|------|
| Baptisan Air | `#08061a` | `#6EA4FF` | White 85% |
| KOM | `#0e0e10` | `#C0C0D8` | White 85% |
| M-Class | `#081020` | `#F0CC50` | White 85% |
| COOL | `#0e0a07` | `#F8BE70` | White 85% |
| Creative Ministry | `#141008` | `#F8BE58` | White 85% |
| Pelayanan Jemaat | `#07080e` | `#E0C468` | White 85% |
| Penyerahan Anak | `#100816` | `#C098F0` | White 85% |
| Pemberkatan Nikah | `#140a0e` | `#F8A0B8` | White 85% |

### Reference Site Comparison

| Element | BEC Current | Edify | Faith |
|---------|-------------|-------|-------|
| Background | Warm cream | White `#fff` | Cream `#f9f7f5` |
| Text | Dark brown | Black `#000` | Dark brown `#231f1b` |
| Accent | Deep blue | Teal `#2a967d` | Purple-blue `#525fbd` |
| Cards | Off-white | Light gray `#ededed` | Off-white `#f6f3f0` |

---

## 5. Landing Page Sections

### Section 1: Hero (`#hero`)

- Full viewport height (100vh)
- Warm cream background with atmospheric background image/gradient
- Content centered
- **Text:**
  - Subtitle: "Selamat Datang"
  - Heading: "GBI Baranangsiang Evening Church" (Judson serif)
  - Service badge: "Setiap Minggu, 17:00 WIB"
  - Address: "Jl. Baranang Siang No.8, Sumur Bandung, Bandung"
- **CTAs:**
  - Primary: "Jadwal & Lokasi" → scroll to `#jadwal`
  - Secondary: "Tanya AI Kami" → `/chat`
- **Scroll indicator:** Animated chevron at bottom

### Section 2: Tentang Kami (`#tentang`)

- 2-column layout: text left, image/visual right
- **Text:**
  - Section label: "TENTANG KAMI" (uppercase, muted)
  - Heading: "Rumah Bagi Semua" or similar welcoming phrase (Judson)
  - Body: Short church identity from `identitas-gereja` knowledge base chunk
  - Part of GBI (Gereja Bethel Indonesia) network
- **Visual:** Congregation photo or atmospheric church visual (placeholder initially)

### Section 3: Kegiatan (`#kegiatan`) — Main Section

- **8 sticky stacking cards** (Edify events pattern)
- Each card is full-width, `height: 500px`, `border-radius: 25px`
- Cards use their poster dark background + accent color
- Each card contains:
  - Activity name (Judson serif, gradient text white → accent)
  - One-line description
  - Schedule / day / time
  - Contact person + WhatsApp link
  - CTA button (form link or WhatsApp)
  - "GRATIS" badge where applicable
- Activity-specific content per card:
  - **Creative Ministry:** Shows all 6 sub-ministries with age ranges
  - **KOM:** Shows 4 levels with progression
  - **M-Class:** Shows pathway (M-Class → Baptis → KAJ → Anggota)
  - **Pelayanan Jemaat:** Brief list of 8 services (detail in next section)
  - **COOL:** What it is + how to join
  - **Baptisan:** Requirements + next date
  - **Penyerahan Anak:** Requirements + registration process
  - **Pemberkatan Nikah:** Requirements + timeline (5 months ahead)

### Section 4: Pelayanan Jemaat (`#pelayanan`)

- 4x2 grid (matches poster layout)
- 8 numbered service cards ("01"–"08")
- Each card: number, service name, description
- "Semua pelayanan gratis" badge
- Contact: Ps. Thomas + WhatsApp button

### Section 5: Jadwal & Lokasi (`#jadwal`)

- 2-column: schedule table (left) + Google Maps embed (right)
- **Weekly schedule:**
  - Ibadah Minggu: 17:00 WIB
  - COOL: Selasa
  - KOM 100 & 200: Kamis 18:30
  - KOM 300: Rabu 18:30
  - Creative Ministry: Sabtu
- **Upcoming dates:**
  - Next baptism date
  - Next M-Class date
- **Map:** Google Maps embed or static image with link
- **Address:** Full address + directions link

### Section 6: Kontak (`#kontak`)

- All WhatsApp contacts with labels and direct links
- Social media: Instagram + YouTube with icons
- **Featured CTA:** "Punya Pertanyaan? Tanya AI Kami 24/7" → `/chat`
  - Mini chat preview mockup showing chatbot interface

### Section 7: Footer (`#footer`)

- Church full name + address
- Quick links: Formulir, KOM, Chat, Highlights
- Social icons: WhatsApp, Instagram, YouTube
- "Semua pelayanan dan pendaftaran gratis"
- Copyright 2026 GBI Baranangsiang Sukawarna

---

## 6. Animation Blueprint

### Global Animations

| Element | Animation | Type | Implementation |
|---------|-----------|------|----------------|
| Nav background | Transparent → solid with blur | Scroll-triggered | `useScroll()` → `scrollY > 100px` → `bg-background/90 backdrop-blur-md`, `AnimatePresence` |
| `prefers-reduced-motion` | All motion disabled | System setting | `useReducedMotion()` — instant final states |

### Section 1: Hero

| Element | Animation | Type | Implementation |
|---------|-----------|------|----------------|
| Background | Slow parallax upward + `brightness(0.77) blur(10px)` | Scroll-linked | `useTransform(scrollY, [0,500], [0,-150])` + CSS filter |
| Subtitle | Fade up | On mount | `initial={{ opacity:0, y:20 }}` → `animate`, delay `0.2s` |
| Church name | Word-by-word stagger reveal | On mount | Split words, `staggerChildren: 0.08`, `y:30→0`. `aria-label` on parent |
| Service badge | Fade up + scale | On mount | `scale:0.9→1, opacity:0→1`, delay `0.6s` |
| Address | Fade in | On mount | `opacity:0→1`, delay `0.7s` |
| CTA buttons | Stagger fade up | On mount | `staggerChildren: 0.1`, delay `0.8s` |
| Scroll indicator | Bounce loop | Infinite | `y:[0,8,0]`, `repeat:Infinity`, `duration:2s` |
| Hero text | Glow shadow (CSS) | Static | `text-shadow: 0 0 65px #ffffffbf` (Edify-confirmed) |

### Section 2: Tentang Kami

| Element | Animation | Type | Implementation |
|---------|-----------|------|----------------|
| Section label | Fade up | Viewport enter | `whileInView`, `once:true`, `margin:"-100px"` |
| Heading | Word split stagger | Viewport enter | `whileInView`, `staggerChildren: 0.05` |
| Body paragraph | Fade up | Viewport enter | `y:30→0, opacity:0→1`, delay `0.3s` |
| Image | Parallax + scale reveal | Scroll-linked | `useScroll({target})` → `y:[60,-60]` + `scale:[0.95,1]` |

### Section 3: Kegiatan (Sticky Cards)

| Element | Animation | Type | Implementation |
|---------|-----------|------|----------------|
| Section heading | Fade up | Viewport enter | Standard `whileInView` |
| Outer container | Creates scroll distance | Layout | Calculated height based on card count, `gap:150px` |
| 8 activity cards | CSS sticky stacking | Scroll (CSS) | `position:sticky` with incrementing `top` (+20px each, starting 250px). `height:500px`, `border-radius:25px`, `padding:40px` |
| Card content | Fade up | Viewport enter | `whileInView` on inner content, `y:20→0, opacity:0→1` |
| Previous cards | Scale down + dim | Scroll-linked | `useScroll` per segment → `scale:1→0.95`, `filter:brightness(0.7)` |
| Card CTA buttons | Hover micro-interaction | Hover | `whileHover={{scale:1.03}}`, `whileTap={{scale:0.98}}` |

**Sticky card CSS values (from Edify):**

```
Card 1: position:sticky, top:250px, height:500px, z-index:1
Card 2: position:sticky, top:270px, height:500px, z-index:1
Card 3: position:sticky, top:290px, height:500px, z-index:1
Card 4: position:sticky, top:310px, height:500px, z-index:1
Card 5: position:sticky, top:330px, height:500px, z-index:1
Card 6: position:sticky, top:350px, height:500px, z-index:1
Card 7: position:sticky, top:370px, height:500px, z-index:1
Card 8: position:sticky, top:390px, height:500px, z-index:1

Outer container: gap:150px (creates scroll distance between cards)
```

**Scroll behavior diagram:**

```
Scroll position:  [0%]───[12.5%]───[25%]───[37.5%]───...───[100%]
Active card:      Card 1  Card 2    Card 3   Card 4         Card 8
Previous cards:   —       scale     scale    scale          all scaled
                          0.95      0.93     0.91           down
```

### Section 4: Pelayanan Jemaat

| Element | Animation | Type | Implementation |
|---------|-----------|------|----------------|
| Section heading | Fade up | Viewport enter | Standard |
| "Gratis" badge | Fade up + scale | Viewport enter | `scale:0.9→1` |
| 8 service cards | Staggered fade up | Viewport enter | `staggerChildren:0.08`, `y:40→0, opacity:0→1` |
| Card numbers | Number counter | Viewport enter | `useInView` → `animate(motionValue, target, {duration:0.8})` |
| Individual cards | Subtle parallax | Scroll-linked | `useScroll({target:cardRef})` → `y:[-15,15]` per card |
| Cards hover | Lift + border glow | Hover | `whileHover={{y:-4}}`, border → gold `#E0C468` |

### Section 5: Jadwal & Lokasi

| Element | Animation | Type | Implementation |
|---------|-----------|------|----------------|
| Section heading | Fade up | Viewport enter | Standard |
| Schedule rows | Stagger slide from left | Viewport enter | `x:-30→0, opacity:0→1`, `staggerChildren:0.1` |
| Time values | Highlight pulse | After slide-in | `background-color` flash, primary 10% → transparent, `1s` |
| Map container | Clip-path reveal | Viewport enter | `clipPath: inset(10%)→inset(0%)` + `opacity:0→1` |
| Upcoming date badges | Pop in with spring | Viewport enter | `scale:0→1`, `type:"spring", stiffness:300, damping:20` |

### Section 6: Kontak

| Element | Animation | Type | Implementation |
|---------|-----------|------|----------------|
| Section background | Color shift | Scroll-linked | `useTransform` → overlay opacity increases |
| Section heading | Fade up | Viewport enter | Standard |
| Contact cards | Stagger fade up | Viewport enter | `staggerChildren:0.06`, `y:25→0` |
| Contact cards hover | Slide right + icon pulse | Hover | `whileHover={{x:4}}`, icon `scale:[1,1.15,1]` |
| Social icons | Stagger scale in | Viewport enter | `scale:0→1`, `staggerChildren:0.1`, spring |
| Chat CTA block | Circle clip-path reveal | Viewport enter | `clipPath: circle(0%)→circle(100%)`, `duration:0.8s` |
| Chat preview | Typing dots | After reveal | 3 dots `opacity:[0.3,1,0.3]`, `staggerChildren:0.15`, loop |

### Section 7: Footer

| Element | Animation | Type | Implementation |
|---------|-----------|------|----------------|
| All content | Simple fade up | Viewport enter | Single wrapper, `y:20→0, opacity:0→1` |
| Social icons | Hover scale | Hover | `whileHover={{scale:1.1}}`, `whileTap{{scale:0.95}}` |

### Framer Motion APIs Used

| API | Where Used |
|-----|------------|
| `useScroll()` | Nav bg, hero parallax, sticky cards, pelayanan parallax |
| `useTransform()` | Every scroll-linked value mapping |
| `useSpring()` | Smooth scroll-linked values on sticky cards |
| `useInView()` | Number counters in pelayanan |
| `useReducedMotion()` | Global accessibility check |
| `whileInView` | Every section's viewport-triggered animations |
| `variants` + `staggerChildren` | Hero text, pelayanan grid, contact cards, schedule rows |
| `whileHover` / `whileTap` | All buttons, cards, social icons |
| `AnimatePresence` | Nav transition |

---

## 7. Reference Site Analysis

### What was CONFIRMED from Edify Church CSS/HTML

| Feature | Evidence | Details |
|---------|----------|---------|
| Sticky stacking cards | `position:sticky` with staggered `top` values | 4 cards: top 250/270/290/310px, height 500px, gap 150px |
| 3 fonts | CSS declarations | Judson (serif headings), Outfit Variable (nav/display), Inter (body) |
| Color palette | CSS tokens | White `#fff`, gray `#ededed`, teal `#2a967d`, black `#000` |
| Fixed navigation | `position: fixed` | Standard sticky header |
| Hero background blur | `filter: brightness(0.77) blur(10px)` | Atmospheric darkened background |
| Text glow | `text-shadow: 0 0 65px #ffffffbf` | White glow on hero text |
| Subtle text shadow | `text-shadow: 0 0 33px #00000017` | Soft depth on body text |
| Card styling | CSS | `border-radius: 25px`, `padding: 40px`, `box-shadow: 0 0 10px -5px #000` |
| Rounded images | CSS | `border-radius: 15px/30px` with shadow |
| Spacing | CSS | 150px section gaps, 100px horizontal padding, 50px element gaps |
| Cursor states | `data-framer-cursor` | pointer, grab, grabbing |
| `will-change: transform` | Many elements | Suggests JS runtime animations exist but not visible in CSS |

### What was CONFIRMED from Faith Template CSS/HTML

| Feature | Evidence | Details |
|---------|----------|---------|
| 2 fonts | CSS declarations | General Sans (headings/nav), Inter (body) |
| Color palette | CSS tokens | Cream `#f9f7f5`, dark brown `#231f1b`, purple-blue `#525fbd` |
| Fixed navigation | `position: fixed, z-index: 6` | Standard |
| `will-change: transform` | Some elements | Infrastructure only |

### What was NOT confirmed (from research, not from sites)

- Fade-up on scroll
- Parallax effects
- Stagger animations
- Word-split text reveals
- Number counters
- Scale-on-scroll
- Clip-path reveals
- Typing dot animations

These are included in our plan based on Framer Motion best practices research and represent enhancements beyond what the reference sites visibly demonstrate in their CSS/HTML. Framer's JS runtime may execute these animations at runtime, but this cannot be confirmed from static analysis.

---

## 8. Codebase Changes

### File Changes Required

| Change | Scope |
|--------|-------|
| Move current `/` (chat) to `/chat` | Rename `src/app/page.tsx` → `src/app/chat/page.tsx` |
| Create new landing page at `/` | New `src/app/page.tsx` |
| Install Framer Motion | `npm install framer-motion` |
| Add Judson font | Add to `src/app/layout.tsx` via `next/font/google` alongside Plus Jakarta Sans |
| Shared nav component | New component: transparent on landing, solid on other pages |
| Landing page section components | New files in `src/components/landing/` |

### New Dependencies

| Package | Purpose | Size (gzipped) |
|---------|---------|----------------|
| `framer-motion` | All animations | ~32KB |

### New Files (estimated)

```
src/
  app/
    page.tsx                    ← NEW: Landing page (imports sections)
    chat/
      page.tsx                  ← MOVED from src/app/page.tsx
  components/
    landing/
      hero.tsx                  ← Hero section
      about.tsx                 ← Tentang Kami section
      activities.tsx            ← Kegiatan sticky cards
      activity-card.tsx         ← Individual activity card
      services.tsx              ← Pelayanan Jemaat grid
      schedule.tsx              ← Jadwal & Lokasi
      contact.tsx               ← Kontak section
      footer.tsx                ← Landing page footer
      nav.tsx                   ← Shared navigation (transparent/solid)
      animations.tsx            ← Shared animation variants & hooks
```

---

## 9. Performance & Accessibility

### Performance Rules

| Rule | Implementation |
|------|----------------|
| Only animate `transform` + `opacity` | No width/height/margin/layout-triggering animations |
| `viewport={{ once: true }}` | All `whileInView` fire once, observer disconnects |
| MotionValues only | All scroll-linked chains via `useTransform`, zero React re-renders |
| `content-visibility: auto` | Below-fold sections get CSS optimization |
| Mobile simplification | Sticky cards → vertical stack with fade-up. Parallax reduced. `useMediaQuery` |
| Lazy load images | Next.js `<Image loading="lazy">` on everything below fold |
| GPU acceleration | `will-change: transform` on actively animating elements only |
| Bundle optimization | Import only used Framer Motion APIs (tree-shakeable) |

### Accessibility

| Concern | Implementation |
|---------|----------------|
| `prefers-reduced-motion` | `useReducedMotion()` built-in. Reduced = instant final state, no transforms |
| Split text screen readers | `aria-label` on parent with full text, `aria-hidden="true"` on individual spans |
| Sticky sections | Must not trap keyboard focus — Tab moves past normally |
| Color contrast | WCAG AA minimum: 4.5:1 body text, 3:1 large text |
| Number counters | `aria-live="polite"` for screen reader announcement |
| Decorative elements | `aria-hidden="true"` on parallax layers, floating elements |
| Interactive elements | All buttons/links keyboard accessible with visible focus states |

### Mobile Behavior

| Desktop | Mobile |
|---------|--------|
| Sticky stacking cards | Vertical stack with fade-up |
| Parallax depth layers | Static positioning |
| 4x2 pelayanan grid | 2x4 or single column |
| 2-col schedule + map | Stacked vertically |
| Clip-path reveals | Simple fade-in |
| Word split stagger | Simple fade-up |
