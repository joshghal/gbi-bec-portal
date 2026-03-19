# UI Pattern Analysis: Schedule & Activity Cards

Research conducted March 17, 2026. Sources: Dribbble, Awwwards, Framer marketplace, Behance, design blogs, bentogrids.com, CSS-Tricks, Smashing Magazine, CodyHouse, scroll-driven-animations.style.

---

## Current State Assessment

### Schedule Section (`schedule.tsx`)
- Two-column grid: left = schedule list card, right = map card
- Schedule is a **vertical list inside a bordered card** with day/activity/time rows
- Sunday has a left-border accent and tinted background
- Problem: Looks like a data table stuffed into a card. No visual drama. The schedule is the most important "when should I show up?" content but it's buried in a generic card.

### Activities Section (`activities.tsx` + `activity-card.tsx`)
- **Sticky stacking cards** — `position: sticky` with increasing `top` offset per card
- Each card: dark background, noise texture, vignette, gradient text title, accent pill for schedule
- 8 cards in a vertical column, 150px gap on desktop
- Problem: Cards are well-crafted individually but the experience is repetitive — 8 identical-layout cards stacking feels like scrolling through a slideshow, not a curated page. Every card has the same visual weight.

### Services Section (`services.tsx`)
- 4-column grid of small icon+text cards
- Decorative large numbers (01-08) faded in background
- Problem: Fine as-is but generic. Could be on any SaaS landing page.

---

## PATTERN 1: Weekly Schedule / Timetable Display

### Recommendation: "Cinema Marquee" — Full-Width Horizontal Day Strips

This pattern is inspired by event schedule sections on Awwwards sites (Zorka Agency calendar page), horizontal timeline designs (uiCookies top 30), and the Framer "Church" template's event layout.

#### The Layout

Instead of a card containing a list, the schedule becomes the **section itself** — each day is a full-width horizontal strip that spans the entire viewport.

```
┌──────────────────────────────────────────────────────────┐
│  JADWAL MINGGUAN                                          │
│  Bergabung Bersama Kami                                   │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  SELASA ──────────────── COOL (Community of Love)        │
│                          Kelompok Sel                     │
│  ─────────────────────────────────────────────────────── │
│  RABU ────────────────── KOM 300                         │
│                          18:30 WIB · Online               │
│  ─────────────────────────────────────────────────────── │
│  KAMIS ───────────────── KOM 100 & 200                   │
│                          18:30 WIB · Online               │
│  ─────────────────────────────────────────────────────── │
│  SABTU ───────────────── Creative Ministry               │
│                          Latihan · Baranangsiang          │
│  ═══════════════════════════════════════════════════════ │
│  ▎ MINGGU ──────────── IBADAH RAYA ────────── 17:00 WIB │
│  ▎                     Terbuka untuk umum                 │
│  ═══════════════════════════════════════════════════════ │
│                                                          │
│          📍 Lihat di Google Maps                          │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

#### 1. Specific Layout Technique

```css
/* Full-width section, no card wrapper */
.schedule-section {
  padding: 6rem 0;
  /* No max-width constraint — bleeds to edges */
}

/* Each day row: CSS Grid with fixed columns */
.day-row {
  display: grid;
  grid-template-columns: 120px 1fr auto;
  /* [day-label] [activity-name + description] [time badge] */
  align-items: baseline;
  padding: 1.5rem 3rem; /* generous horizontal padding */
  border-bottom: 1px solid hsl(var(--border));
  transition: background-color 0.3s ease;
}

.day-row:hover {
  background-color: hsl(var(--muted) / 0.3);
}

/* Sunday row — special treatment */
.day-row--sunday {
  background: hsl(var(--primary) / 0.04);
  border-left: 3px solid hsl(var(--primary));
  border-bottom: 2px solid hsl(var(--primary) / 0.2);
  padding: 2rem 3rem;
}

/* On mobile: stack vertically */
@media (max-width: 768px) {
  .day-row {
    grid-template-columns: 1fr;
    gap: 0.25rem;
    padding: 1.25rem 1.5rem;
  }
}
```

#### 2. Typography Treatment

- **Day name:** `text-xs uppercase tracking-[0.3em] font-medium text-muted-foreground` — deliberately small, letterspaced, like a table header. The day is the constant; make it quiet.
- **Activity name:** `font-serif text-xl lg:text-2xl font-bold text-foreground` — the hero of each row. This is what people care about. Make it the largest element.
- **Time/details:** `text-sm text-muted-foreground` — secondary. Right-aligned on desktop as a pill/badge: `rounded-full bg-muted px-3 py-1`.
- **Sunday row — activity name:** `font-serif text-2xl lg:text-3xl font-bold` — bigger than other rows. Time displayed as a **large monospace number**: `font-mono text-3xl lg:text-4xl font-bold text-primary tracking-tight` for "17:00".
- **Key insight from research:** Premium schedule sections make the TIME the hero element when it's a fixed recurring event. The Zorka Agency calendar page uses oversized time typography as a visual anchor.

#### 3. Color/Contrast Approach

- **No card.** The schedule rows sit directly on the page background with only `border-bottom` separators. This is the key difference from the current design.
- **Weekday rows:** Monochrome. Muted day labels, strong activity names, muted time.
- **Sunday row:** Subtle warm tint (`bg-primary/[0.04]`), left accent bar, primary-colored time number. The only row with color. This creates **information hierarchy through scarcity** — if only one thing has color, it's the most important.
- **Hover state:** Rows get a subtle `bg-muted/30` on hover with the activity name transitioning to `text-primary`.
- **Separator lines:** Use a long horizontal rule between rows — `1px solid border` for weekdays, thicker `2px solid primary/20` above and below Sunday.

#### 4. What Makes It NOT Look Like a Template

1. **No card wrapper.** Templates wrap everything in cards. This pattern lets the schedule breathe as a section-level element, like an editorial masthead.
2. **Asymmetric column sizes.** The day column is narrow (120px), the activity stretches, the time is auto-width. This creates visual tension, unlike a 50/50 split.
3. **Sunday is visually distinct.** Not just "highlighted" — it's a different size, different layout, different weight. Templates treat all items identically.
4. **Horizontal rule rhythm.** The lines create a rhythm like a printed program or theater marquee. It reads like a printed piece, not a web form.
5. **Time as typography.** Displaying "17:00" in large monospace font makes it feel like a departure board or event poster, not a data cell.

#### 5. Application to Church (5 schedule items)

With only 5 items, you have the luxury of giving each row breathing room. The section should be compact but generous:

- **Selasa, Rabu, Kamis:** Regular rows with 3-column grid. Day left, activity center, time-pill right.
- **Sabtu:** Regular row but time-pill says "Baranangsiang" as location instead of time.
- **Minggu:** Double-height row with `17:00` displayed in 48px monospace font. Activity "Ibadah Raya" in largest serif. A short description below: "Ibadah utama, terbuka untuk umum."
- **Below the rows:** A single-line CTA for Google Maps, not a separate card. Keep the location card for the map embed only, or remove it entirely and put just the address + map link inline.

#### Alternative Variant: "Day Pill Selector"

If you want interactivity, use horizontal day pills as a filter:

```
[ Selasa ] [ Rabu ] [ Kamis ] [ Sabtu ] [ ★ Minggu ]
```

Clicking a pill reveals that day's details below with a smooth height animation. Sunday pill is pre-selected and visually distinct (filled primary color vs outlined). This works well on mobile where a full list might feel long.

---

## PATTERN 2: Activity/Service Cards — Kegiatan Section

### Current Problem Analysis

The current sticky-stacking approach has good bones but suffers from:
- **Visual monotony:** 8 cards with identical dimensions and layout
- **Scroll fatigue:** 8 * (500px + 150px gap) = 5,200px of scrolling
- **No hierarchy:** Baptism, KOM, Creative Ministry, and Pemberkatan Pernikahan all get the same visual weight. But KOM is a 4-level program and Pemberkatan is rarely used.

### Recommendation: "Editorial Bento" — Mixed-Size Grid with Featured Cards

Inspired by: Apple's bento grid (bentogrids.com), Smashing Magazine's editorial grid patterns, the Framer "Edify" church template, and the "Bento 2.0" trend (exaggerated corner rounding, 12-24px border-radius).

#### The Layout

Instead of 8 identical stacking cards, use a **CSS Grid bento layout** where important activities get larger cards and secondary ones are compact.

```
Desktop (3-column, 6 rows):

┌─────────────────────┬──────────┐
│                     │          │
│    IBADAH RAYA      │  KOM     │
│    (featured,       │  (tall,  │
│     2-col wide)     │  1-col)  │
│                     │          │
├──────────┬──────────┤          │
│          │          │          │
│  M-Class │  COOL    ├──────────┤
│          │          │ Creative │
│          │          │ Ministry │
├──────────┴──────────┤          │
│                     ├──────────┤
│  Pelayanan Jemaat   │Penyerahan│
│  (2-col wide)       │  Anak    │
├──────────┬──────────┼──────────┤
│ Baptisan │Pernikahan│          │
│  Air     │          │          │
└──────────┴──────────┴──────────┘
```

#### 1. Specific Layout Technique

```css
.activities-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-auto-rows: minmax(220px, auto);
  gap: 16px; /* tight gap for bento feel */
}

/* Featured card spans 2 columns */
.card--featured {
  grid-column: span 2;
  grid-row: span 2;
  min-height: 440px;
}

/* Tall card spans 2 rows */
.card--tall {
  grid-row: span 2;
}

/* Wide card spans 2 columns */
.card--wide {
  grid-column: span 2;
}

/* Default 1x1 cards */
.card--default {
  /* inherits single cell */
}

/* Mobile: single column, all cards equal */
@media (max-width: 768px) {
  .activities-grid {
    grid-template-columns: 1fr;
    grid-auto-rows: auto;
  }
  .card--featured,
  .card--tall,
  .card--wide {
    grid-column: span 1;
    grid-row: span 1;
  }
}

/* Tablet: 2 columns */
@media (min-width: 769px) and (max-width: 1024px) {
  .activities-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .card--featured {
    grid-column: span 2;
    grid-row: span 1;
  }
}
```

Using Tailwind (since the project uses Tailwind 4):

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Featured: Ibadah Raya — 2 col, 2 row */}
  <div className="md:col-span-2 md:row-span-2 min-h-[440px]">...</div>

  {/* Tall: KOM — 1 col, 2 row */}
  <div className="lg:row-span-2">...</div>

  {/* Standard: M-Class, COOL */}
  <div>...</div>
  <div>...</div>

  {/* Tall: Creative Ministry — 1 col, 2 row */}
  <div className="lg:row-span-2">...</div>

  {/* Wide: Pelayanan Jemaat — 2 col */}
  <div className="md:col-span-2">...</div>

  {/* Standard: Penyerahan Anak, Baptisan, Pernikahan */}
  <div>...</div>
  <div>...</div>
  <div>...</div>
</div>
```

#### 2. Typography Treatment Within Cards

**Featured card (Ibadah Raya):**
- Category label: `text-xs uppercase tracking-[0.25em] text-white/60`
- Title: `font-serif text-4xl lg:text-5xl font-bold` with gradient text (white to accent)
- Time: `font-mono text-6xl lg:text-7xl font-bold text-primary/30` — positioned absolutely as a background element, like a watermark
- Description: `text-base text-white/80 max-w-md`
- This card should feel like a poster, not a data card

**Tall card (KOM):**
- Title: `font-serif text-2xl font-bold`
- KOM levels displayed as a **vertical progression** (not horizontal pills): stacked badges with connecting line, like a progress tracker
- Each level: `text-sm font-medium` in accent-bordered pill

**Standard 1x1 cards:**
- Title: `font-serif text-xl font-bold`
- Description: `text-sm text-white/70` — 2-3 lines max, truncated
- Schedule pill: `text-xs` — smaller than in the current design
- Contact/CTA: hidden by default, visible on hover/click (or always visible on mobile)
- **Key insight:** Small cards should have LESS content. The current cards try to fit everything (subtitle, description, schedule, contact, CTA, children) into every card. In a bento grid, small cards show title + 1 key detail. Everything else is behind a click.

**Wide card (Pelayanan Jemaat):**
- Services displayed as a **horizontal icon row** inside the card rather than a separate section
- Icons from the current `services.tsx` become inline elements: `flex gap-6` with icon + short label
- Title: `font-serif text-2xl font-bold`
- This absorbs the current ServicesSection into the Kegiatan bento grid

#### 3. Color/Contrast Approach

Keep the existing dark card backgrounds (`bgColor` per card) but add differentiation:

- **Featured card:** Richest/deepest background with a subtle radial gradient bloom from the accent color. The accent color should be visible as a glow, not just text.
- **Tall cards:** Current approach works — dark bg, gradient text, noise texture.
- **Standard 1x1 cards:** Slightly lighter/more muted treatment. Less noise overlay. Let the featured cards dominate.
- **Wide card (Pelayanan):** Use a different surface treatment — `bg-card` (the light card bg from the design system) instead of dark. This breaks the monotony of all-dark cards and creates a visual "breath."
- **Border radius:** Increase to 20-24px (currently 25px, consistent). Use the same radius for all cards — this is what makes bento grids feel cohesive.
- **Gap:** 12-16px between cards (currently the gap is managed by the 150px column layout). Tight gaps make the grid feel unified.

#### 4. What Makes It NOT Look Like a Template

1. **Mixed card sizes.** Templates use uniform grids. A bento layout where the featured card is 4x the area of the smallest card creates visual drama.
2. **Absorbing ServicesSection.** Instead of schedule > activities > services as three separate sections, merge services into the Kegiatan bento grid as the wide card. This reduces section count and creates a denser, more magazine-like page.
3. **Content density varies by importance.** Featured cards have generous whitespace and poster-like typography. Small cards are compact and information-dense. Templates give every item the same treatment.
4. **Background watermark numbers.** The current `services.tsx` has faint "01"-"08" numbers. Apply this to the bento cards too — a large `font-mono` number in `text-white/[0.03]` positioned absolutely. This adds a layer of designed detail.
5. **Hover reveals.** Small cards show just title + accent color on load. On hover, a subtle overlay slides up revealing schedule + contact + CTA. This keeps the grid clean and rewards exploration.
6. **No uniform stacking.** The sticky-stack creates a predictable "card after card" rhythm. A bento grid creates spatial variety — the eye moves across the grid, not just down.

#### 5. Application to Church (8 Activities)

Assign card sizes based on importance/engagement:

| Activity | Card Size | Rationale |
|----------|-----------|-----------|
| Ibadah Raya (not currently in activities, but should be) | **Featured (2x2)** | The most important event. Deserves hero treatment. |
| KOM | **Tall (1x2)** | 4 levels to show — needs vertical space for progression display |
| M-Class | Standard (1x1) | Simple 2-step process |
| COOL | Standard (1x1) | Simple weekly meeting |
| Creative Ministry | **Tall (1x2)** | 6 sub-ministries to display |
| Pelayanan Jemaat | **Wide (2x1)** | 8 services displayed as icon row |
| Baptisan Air | Standard (1x1) | Periodic event |
| Penyerahan Anak | Standard (1x1) | Periodic event |
| Pernikahan | Standard (1x1) | Periodic event |

This gives you 9 cards total (adding Ibadah Raya as the featured hero), fitting cleanly into a 3-column bento.

**Alternative: Keep stacking but improve it.** If you want to keep the scroll-stack:
- Reduce to 4-5 "featured" cards that stack (KOM, Creative Ministry, Pelayanan Jemaat, Baptisan, COOL)
- Remaining 3 (M-Class, Penyerahan Anak, Pernikahan) become a small 3-column grid BELOW the stacking section
- This creates a "featured + supporting" hierarchy without abandoning the stack entirely

---

## BONUS: Combining Both Patterns

Consider merging the schedule INTO the bento grid as the featured card:

```
┌─────────────────────┬──────────┐
│                     │          │
│  JADWAL MINGGU      │   KOM    │
│  ┌───┐              │  (tall)  │
│  │17:│ Ibadah Raya  │          │
│  │00 │ Minggu sore  │          │
│  └───┘              │          │
│  + 4 more days ↓    ├──────────┤
│                     │  COOL    │
├──────────┬──────────┤          │
│ M-Class  │ Baptisan ├──────────┤
│          │          │ Creative │
│          │          │ Ministry │
...
```

The featured card shows Sunday service prominently with a collapsible/expandable list of weekday activities. This eliminates the need for a separate schedule section entirely, creating a single, dense, premium-feeling "Kegiatan" section that tells visitors everything they need to know.

---

## Implementation Priority

1. **Quick win:** Restyle schedule as full-width day strips (no card wrapper). ~2 hours.
2. **Medium effort:** Convert activities to bento grid with mixed sizes. ~4-6 hours.
3. **Larger effort:** Absorb ServicesSection into bento grid + merge schedule as featured card. ~8 hours.

---

## Sources

- [Zorka Agency Events Calendar (Awwwards)](https://www.awwwards.com/inspiration/events-calendar-page-zorka-agency-website)
- [BentoGrids.com — Curated Collection](https://bentogrids.com/)
- [Bento Grid Design Guide 2026 (Landdding)](https://landdding.com/blog/blog-bento-grid-design-guide)
- [Build a Bento Layout with CSS Grid (iamsteve)](https://iamsteve.me/blog/bento-layout-css-grid)
- [Tailwind CSS Bento Grids (Official)](https://tailwindcss.com/plus/ui-blocks/marketing/sections/bento-grids)
- [Magazine Layout with CSS Grid Areas (Smashing Magazine)](https://www.smashingmagazine.com/2023/02/build-magazine-layout-css-grid-areas/)
- [Stacking Cards CSS (scroll-driven-animations.style)](https://scroll-driven-animations.style/demos/stacking-cards/css/)
- [Stacking Cards Tutorial (CodyHouse)](https://codyhouse.co/tutorials/how-stacking-cards)
- [Calendar UI Examples (Eleken)](https://www.eleken.co/blog-posts/calendar-ui)
- [30 Best Horizontal Timeline Examples 2026 (uiCookies)](https://uicookies.com/horizontal-timeline/)
- [EDIFY Church Template (Framer)](https://www.framer.com/marketplace/templates/edify/)
- [Faith Church Template (Framer)](https://www.framer.com/marketplace/templates/church/)
- [Church Template Live Demo (Framer)](https://church-template.framer.website/)
- [Elevation Church Website Analysis (Hostinger)](https://www.hostinger.com/tutorials/church-website-examples)
- [Best Church Websites (Colorlib)](https://colorlib.com/wp/church-websites/)
- [CSS Snippets for Bento Layouts (Speckyboy)](https://speckyboy.com/css-bento-grid-layouts/)
- [Apple Bento Grid Analysis (Medium)](https://medium.com/@jefyjery10/apples-bento-grid-secret-how-a-lunchbox-layout-sells-premium-tech-7c118ce898aa)
- [Bento Grid Web Design 2026 (Desinance)](https://desinance.com/design/bento-grid-web-design/)
