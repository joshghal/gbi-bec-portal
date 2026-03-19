# Activity/Program Section Design Research

> Research for replacing the current bento grid layout with a premium, scannable design for 8 church activities/programs of varying complexity.

---

## The Problem

Bento grids create **visual chaos** when items have varying content complexity. Different card sizes break scanning patterns — the eye doesn't know where to go next. For 8 items where some have sub-items/tags and others are simple, the bento approach forces artificial size differentiation that confuses rather than clarifies.

---

## 5 Viable Approaches (Ranked by Fit)

### 1. Editorial Accordion (Recommended)

**The Pattern:** Full-width rows with large typography. Each row is a collapsed activity. Clicking/tapping expands to reveal details, schedule, tags. Only one open at a time (exclusive accordion).

**Why it fits:** Church activities have varying complexity — some need sub-items (e.g., youth programs with age groups), others are one-liners. The accordion naturally accommodates this without visual imbalance. It reads like a **program guide**, not a dashboard.

**Reference sites:** Dennis Snellenberg's portfolio (dennissnellenberg.com), Obys Agency — both use numbered row lists with hover reveals. The pattern is dominant across Awwwards winners for service/work listings.

**Layout structure:**
```
┌──────────────────────────────────────────────────────────┐
│  01   Ibadah Raya                            Minggu  ▾  │
├──────────────────────────────────────────────────────────┤
│  02   Pemahaman Alkitab                      Rabu    ▾  │
│       ┌─────────────────────────────────────────────┐   │
│       │  Setiap Rabu, 18:30 WIB                     │   │
│       │  Gratis · Semua umur · Gedung Gereja Lt. 2  │   │
│       │                                              │   │
│       │  Pendalaman firman Tuhan secara interaktif   │   │
│       │  dengan pembicara yang bergantian setiap...  │   │
│       └─────────────────────────────────────────────┘   │
├──────────────────────────────────────────────────────────┤
│  03   Komisi Pemuda/Remaja                   Sabtu   ▾  │
├──────────────────────────────────────────────────────────┤
│  ...                                                     │
└──────────────────────────────────────────────────────────┘
```

**CSS/Tailwind implementation:**

```tsx
// Using native <details> with name attribute for exclusive accordion
// Chrome 131+, Safari 18.4+, Firefox 143+ support ::details-content

<section className="max-w-4xl mx-auto px-6">
  <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-12">
    Kegiatan Kami
  </h2>

  {activities.map((activity, i) => (
    <details
      key={activity.id}
      name="activities"           {/* exclusive: only one open at a time */}
      className="group border-t border-neutral-200 last:border-b"
    >
      <summary className="
        flex items-center justify-between
        py-6 md:py-8
        cursor-pointer
        list-none                  /* remove default marker */
        [&::-webkit-details-marker]:hidden
      ">
        {/* Left: number + title */}
        <div className="flex items-center gap-6">
          <span className="text-sm text-neutral-400 font-mono tabular-nums">
            {String(i + 1).padStart(2, '0')}
          </span>
          <h3 className="text-xl md:text-2xl lg:text-3xl font-semibold
                         group-open:text-primary transition-colors duration-300">
            {activity.title}
          </h3>
        </div>

        {/* Right: day tag + chevron */}
        <div className="flex items-center gap-4">
          <span className="text-sm text-neutral-500 hidden sm:block">
            {activity.day}
          </span>
          <ChevronDown className="
            w-5 h-5 text-neutral-400
            transition-transform duration-300
            group-open:rotate-180
          " />
        </div>
      </summary>

      {/* Expandable content — animate with ::details-content */}
      <div className="pb-8 pl-12 md:pl-16 pr-6">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr] gap-6">
          {/* Meta column */}
          <div className="space-y-3">
            <p className="text-sm font-medium">{activity.schedule}</p>
            <div className="flex flex-wrap gap-2">
              {activity.tags.map(tag => (
                <span key={tag} className="
                  text-xs px-3 py-1 rounded-full
                  bg-neutral-100 text-neutral-600
                ">{tag}</span>
              ))}
            </div>
          </div>
          {/* Description column */}
          <p className="text-neutral-600 leading-relaxed">
            {activity.description}
          </p>
        </div>
      </div>
    </details>
  ))}
</section>
```

**Smooth open/close animation (CSS):**

```css
/* Modern approach — Chrome 131+, progressive enhancement */
@supports selector(::details-content) {
  details::details-content {
    transition: height 0.4s ease, opacity 0.4s ease,
                content-visibility 0.4s ease allow-discrete;
    height: 0;
    opacity: 0;
    overflow: clip;
  }

  details[open]::details-content {
    height: auto;         /* requires interpolate-size: allow-keywords */
    opacity: 1;
  }
}

/* Enable height: auto interpolation */
@supports (interpolate-size: allow-keywords) {
  :root {
    interpolate-size: allow-keywords;
  }
}

/* Fallback for older browsers — instant toggle, no animation */
@supports not selector(::details-content) {
  details:not([open]) > :not(summary) {
    display: none;
  }
}
```

**Fallback approach (wider browser support) using grid-template-rows:**

```css
/* Works in all modern browsers — Chrome 107+, Firefox 66+, Safari 16+ */
.accordion-content {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.4s ease;
}

.accordion-content.open {
  grid-template-rows: 1fr;
}

.accordion-content > .inner {
  overflow: hidden;
}
```

**React implementation (fallback for broader support):**

```tsx
// If you need wider browser support than native <details> animation,
// use controlled state + grid-template-rows animation

const [openIndex, setOpenIndex] = useState<number | null>(null);

{activities.map((activity, i) => {
  const isOpen = openIndex === i;
  return (
    <div key={activity.id} className="border-t border-neutral-200">
      <button
        onClick={() => setOpenIndex(isOpen ? null : i)}
        className="w-full flex items-center justify-between py-6 md:py-8"
      >
        {/* ...same summary content... */}
      </button>
      <div
        className="grid transition-[grid-template-rows] duration-400 ease-out"
        style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          {/* ...expanded content... */}
        </div>
      </div>
    </div>
  );
})}
```

---

### 2. Editorial Row List with Hover Reveal

**The Pattern:** Full-width text rows (no cards). Large typography per item. On desktop hover, a small image/icon slides in. Mobile: tappable rows that navigate to detail.

**Why it fits:** The simplest premium pattern. Works beautifully when you want to convey "there are 8 things — scan them fast." Each row is identical in structure, creating visual rhythm. The hover image adds delight without clutter.

**Reference:** Dennis Snellenberg, Locomotive.ca, Obys Agency — the "project list with hover image" pattern is the most awarded layout on Awwwards for multi-item listings.

**Layout structure:**
```
┌──────────────────────────────────────────────────────────┐
│  Ibadah Raya                    Minggu · 07:00 & 09:30  │
│──────────────────────────────────────────────────────────│
│  Pemahaman Alkitab              Rabu · 18:30            │
│──────────────────────────────────────────────────────────│
│  Komisi Pemuda/Remaja           Sabtu · 17:00           │
│──────────────────────────────────────────────────────────│
│  Sekolah Minggu                 Minggu · 09:00          │
│──────────────────────────────────────────────────────────│
│  ...                                                     │
└──────────────────────────────────────────────────────────┘
```

**CSS/Tailwind implementation:**

```tsx
<section className="max-w-5xl mx-auto px-6">
  {activities.map((activity) => (
    <a
      key={activity.id}
      href={`#${activity.id}`}
      className="
        group relative flex items-center justify-between
        py-8 md:py-10
        border-b border-neutral-200
        hover:border-neutral-900
        transition-colors duration-300
      "
    >
      {/* Title — large, bold, left-aligned */}
      <h3 className="
        text-2xl md:text-4xl lg:text-5xl
        font-bold tracking-tight
        group-hover:translate-x-4
        transition-transform duration-300
      ">
        {activity.title}
      </h3>

      {/* Metadata — right-aligned, smaller */}
      <div className="flex items-center gap-4 text-neutral-500">
        <span className="text-sm md:text-base">{activity.day}</span>
        <span className="text-sm">·</span>
        <span className="text-sm md:text-base">{activity.time}</span>
        <ArrowRight className="
          w-5 h-5 opacity-0 -translate-x-2
          group-hover:opacity-100 group-hover:translate-x-0
          transition-all duration-300
        " />
      </div>

      {/* Hover image reveal (desktop only) */}
      <div className="
        hidden md:block
        absolute left-1/2 top-1/2 -translate-y-1/2
        w-48 h-32 rounded-lg overflow-hidden
        opacity-0 scale-90
        group-hover:opacity-100 group-hover:scale-100
        transition-all duration-300
        pointer-events-none z-10
      ">
        <img
          src={activity.image}
          alt=""
          className="w-full h-full object-cover"
        />
      </div>
    </a>
  ))}
</section>
```

**Key CSS details:**
- `clamp(1.5rem, 4vw, 3.5rem)` for fluid title sizing
- Border transitions (neutral-200 → neutral-900) on hover create "selection" feel
- Title `translate-x` on hover gives kinetic feedback
- Arrow slides in from left on hover (opacity + translateX)
- Hover image is `pointer-events-none` so it doesn't interfere with click target

---

### 3. Tabbed/Filtered Category View

**The Pattern:** Activities grouped into 2-3 tabs (e.g., "Ibadah", "Komisi", "Pelayanan"). Each tab shows a clean list or mini-cards for that category. Horizontal tab bar at top.

**Why it fits:** If 8 activities span distinct categories, tabs reduce cognitive load by showing 2-4 items at a time instead of all 8. This is how premium program guides work — you flip to the section you care about.

**Layout structure:**
```
  [ Ibadah ]  [ Komisi ]  [ Pelayanan ]
  ─────────────────────────────────────

  Ibadah Raya
  Minggu, 07:00 & 09:30 WIB
  Kebaktian utama dengan pujian penyembahan...

  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─

  Pemahaman Alkitab
  Rabu, 18:30 WIB
  Pendalaman firman Tuhan secara interaktif...
```

**CSS/Tailwind implementation:**

```tsx
const categories = ['Ibadah', 'Komisi', 'Pelayanan'];
const [activeTab, setActiveTab] = useState('Ibadah');

<section className="max-w-4xl mx-auto px-6">
  {/* Tab bar */}
  <div className="flex gap-1 mb-12 border-b border-neutral-200">
    {categories.map(cat => (
      <button
        key={cat}
        onClick={() => setActiveTab(cat)}
        className={`
          relative px-6 py-3 text-sm font-medium
          transition-colors duration-200
          ${activeTab === cat
            ? 'text-neutral-900'
            : 'text-neutral-400 hover:text-neutral-600'}
        `}
      >
        {cat}
        {/* Active indicator — animated underline */}
        {activeTab === cat && (
          <span className="
            absolute bottom-0 left-0 right-0 h-0.5
            bg-neutral-900
            motion-safe:animate-[scaleX_0.2s_ease-out]
          " />
        )}
      </button>
    ))}
  </div>

  {/* Activity list for active tab */}
  <div className="space-y-0">
    {activities
      .filter(a => a.category === activeTab)
      .map(activity => (
        <div
          key={activity.id}
          className="py-8 border-b border-neutral-100 last:border-0"
        >
          <h3 className="text-xl md:text-2xl font-semibold mb-2">
            {activity.title}
          </h3>
          <p className="text-sm text-neutral-500 mb-3">
            {activity.schedule}
          </p>
          <p className="text-neutral-600 leading-relaxed max-w-prose">
            {activity.description}
          </p>
          {activity.tags && (
            <div className="flex flex-wrap gap-2 mt-4">
              {activity.tags.map(tag => (
                <span key={tag} className="
                  text-xs px-3 py-1 rounded-full
                  bg-neutral-50 text-neutral-500 border border-neutral-200
                ">{tag}</span>
              ))}
            </div>
          )}
        </div>
      ))}
  </div>
</section>
```

**Tab animation (shared layout animation with Framer Motion):**

```tsx
import { motion, LayoutGroup } from 'framer-motion';

<LayoutGroup>
  {categories.map(cat => (
    <button key={cat} onClick={() => setActiveTab(cat)} className="relative ...">
      {cat}
      {activeTab === cat && (
        <motion.span
          layoutId="activeTab"
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-neutral-900"
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      )}
    </button>
  ))}
</LayoutGroup>
```

---

### 4. Numbered Timeline / Program Guide

**The Pattern:** Vertical timeline-like layout with large numbers, titles, and staggered content blocks. Reads like a printed church program or conference schedule.

**Why it fits:** Churches already print program guides. This digital version of that format feels immediately familiar to the congregation while looking modern.

**Layout structure:**
```
  01 ─────────────────────────────

     Ibadah Raya
     Kebaktian utama gereja

     Minggu · 07:00 & 09:30 WIB
     Gedung Gereja Utama


  02 ─────────────────────────────

     Pemahaman Alkitab
     Pendalaman firman Tuhan

     Rabu · 18:30 WIB
     Gedung Gereja Lt. 2


  03 ─────────────────────────────
     ...
```

**CSS/Tailwind implementation:**

```tsx
<section className="max-w-4xl mx-auto px-6">
  {activities.map((activity, i) => (
    <div
      key={activity.id}
      className="
        relative grid grid-cols-[auto_1fr] gap-x-8 md:gap-x-12
        pb-16 last:pb-0
      "
    >
      {/* Left: large number + vertical line */}
      <div className="flex flex-col items-center">
        <span className="
          text-6xl md:text-8xl font-bold
          text-neutral-100
          leading-none
        ">
          {String(i + 1).padStart(2, '0')}
        </span>
        {i < activities.length - 1 && (
          <div className="w-px flex-1 bg-neutral-200 mt-4" />
        )}
      </div>

      {/* Right: content */}
      <div className="pt-2">
        <h3 className="text-2xl md:text-3xl font-bold mb-2">
          {activity.title}
        </h3>
        <p className="text-neutral-500 text-sm mb-4">
          {activity.subtitle}
        </p>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2
                        text-sm text-neutral-600 mb-4">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            {activity.day}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            {activity.time}
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4" />
            {activity.location}
          </span>
        </div>

        <p className="text-neutral-600 leading-relaxed max-w-prose">
          {activity.description}
        </p>
      </div>
    </div>
  ))}
</section>
```

**Key CSS details:**
- `grid-cols-[auto_1fr]` — number column is intrinsic, content takes remaining space
- Oversized numbers in `text-neutral-100` (very light) create depth without competing with content
- Vertical line between numbers creates visual continuity
- Content is left-aligned with consistent metadata structure per item

---

### 5. Two-Column Magazine Layout

**The Pattern:** Left column has the activity title/number (sticky on scroll). Right column has the details. As you scroll, titles on the left update to match the visible content on the right.

**Why it fits:** Works when activity descriptions are longer and you want a reading experience. The sticky left column acts as a persistent table of contents.

**Layout structure:**
```
┌────────────────┬─────────────────────────────────────┐
│                │                                      │
│  01            │  Ibadah Raya                         │
│  Ibadah Raya   │                                      │
│                │  Kebaktian utama gereja dengan        │
│                │  pujian penyembahan dan khotbah       │
│                │  firman Tuhan...                      │
│                │                                      │
│                │  Minggu · 07:00 & 09:30              │
│                │  Gedung Gereja Utama                  │
│                │                                      │
│────────────────│──────────────────────────────────────│
│                │                                      │
│  02            │  Pemahaman Alkitab                   │
│  PA            │                                      │
│                │  Pendalaman firman Tuhan secara       │
│                │  interaktif...                        │
│                │                                      │
└────────────────┴─────────────────────────────────────┘
```

**CSS/Tailwind implementation:**

```tsx
<section className="max-w-6xl mx-auto px-6">
  <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-0">
    {activities.map((activity, i) => (
      <Fragment key={activity.id}>
        {/* Left: sticky label (desktop only) */}
        <div className="
          hidden md:block
          sticky top-24
          self-start
          py-12
          border-t border-neutral-200
        ">
          <span className="text-xs text-neutral-400 font-mono block mb-2">
            {String(i + 1).padStart(2, '0')}
          </span>
          <span className="text-sm font-medium text-neutral-900">
            {activity.shortTitle}
          </span>
        </div>

        {/* Right: full content */}
        <div className="py-12 border-t border-neutral-200">
          <h3 className="text-2xl md:text-3xl font-bold mb-4">
            {activity.title}
          </h3>
          <p className="text-neutral-600 leading-relaxed mb-6 max-w-prose">
            {activity.description}
          </p>
          <div className="flex flex-wrap gap-4 text-sm text-neutral-500">
            <span>{activity.schedule}</span>
            <span>{activity.location}</span>
          </div>
          {activity.tags && (
            <div className="flex flex-wrap gap-2 mt-4">
              {activity.tags.map(tag => (
                <span key={tag} className="
                  text-xs px-3 py-1 rounded-full border border-neutral-200
                ">{tag}</span>
              ))}
            </div>
          )}
        </div>
      </Fragment>
    ))}
  </div>
</section>
```

---

## Design Principles (From Research)

### Typography Hierarchy (Refactoring UI + Awwwards patterns)

- **Primary:** Activity title — `text-2xl md:text-3xl font-bold` (or larger for row-list pattern)
- **Secondary:** Schedule/day — `text-sm text-neutral-500`
- **Tertiary:** Description — `text-base text-neutral-600 leading-relaxed`
- **Tags/Labels:** `text-xs` in pill badges
- **Numbers:** Either bold and large (timeline) or small and muted (accordion)

Use `clamp()` for fluid typography:
```css
.activity-title {
  font-size: clamp(1.25rem, 2.5vw + 0.5rem, 2.25rem);
}
```

### Spacing System

From the Awwwards and premium portfolio research, generous vertical padding is the single biggest differentiator between "template" and "premium":

| Element | Padding |
|---------|---------|
| Section top/bottom | `py-24 md:py-32` |
| Between items | `py-8 md:py-10` (row list) or `pb-16` (timeline) |
| Content within expanded accordion | `pb-8` |
| Tag group from text | `mt-4` |

### Interaction Patterns

**Accordion (NNGroup research):**
- Use **caret/chevron** icon (not plus, not arrow) — statistically strongest user expectation for expand-in-place behavior
- Rotate 180deg on open (not slide to new icon)
- Exclusive behavior (one open at a time) reduces cognitive load
- Label and icon should trigger the same action (not split-button)

**Hover (performance-aware):**
- Animate `transform` and `opacity` only (avoid `height`, `width`, `top/left`)
- Use `will-change: transform` on elements that will animate
- Duration: 200-300ms for enter, 300-400ms for exit
- Timing: `ease-out` for enter, `ease-in` for exit
- Respect `prefers-reduced-motion`:
  ```css
  @media (prefers-reduced-motion: reduce) {
    * { transition-duration: 0.01ms !important; }
  }
  ```

### Color Strategy

From the premium sites analyzed, the pattern is:
- **Background:** white or very light neutral (`bg-white` or `bg-neutral-50`)
- **Borders:** `border-neutral-200` (light) → `border-neutral-900` on hover
- **Primary text:** `text-neutral-900`
- **Secondary text:** `text-neutral-500`
- **Accent:** One brand color used sparingly (active tab indicator, open state title, hover number)
- **Tags:** `bg-neutral-100 text-neutral-600` (muted pills, not colorful)

---

## Recommendation for Church-Chat

**Go with Approach 1 (Editorial Accordion)** for these reasons:

1. **Variable complexity handled gracefully.** Ibadah Raya might need just day/time. Komisi Pemuda might need age groups, sub-activities, contact info. The accordion naturally accommodates both without visual imbalance.

2. **Scannable.** All 8 items visible at once in collapsed state. Users can scan titles + days in under 3 seconds. No scrolling through cards.

3. **Mobile-first.** Accordions are the most natural touch pattern. NNGroup research confirms they're the preferred mobile pattern for "collapsing content into manageable page lengths."

4. **Progressive disclosure.** Congregation members who know the schedule just need a reminder of the day/time (visible in collapsed row). New visitors can expand for full details.

5. **Premium feel.** The numbered row + large type + smooth expand animation reads as editorial/magazine, not template. This is the dominant pattern on Awwwards-winning agency sites.

6. **Implementation simplicity.** Native `<details>` with `name` attribute gives you exclusive accordion behavior with zero JavaScript. The `grid-template-rows: 0fr → 1fr` fallback works in all modern browsers. React state version works everywhere.

**Enhancement options:**
- Add Framer Motion `AnimatePresence` for enter/exit animations on expanded content
- Use `layoutId` for shared layout animations if items reorder
- Add subtle background color shift on the open item (`bg-neutral-50`)
- On desktop, show a small preview image in the expanded state

---

## Implementation Checklist

```
[ ] Define activity data structure (title, shortTitle, day, time, location, description, tags[], category)
[ ] Build AccordionSection component with exclusive behavior
[ ] Style collapsed rows: number + title + day + chevron
[ ] Style expanded content: schedule + tags + description (2-column on desktop)
[ ] Add grid-template-rows animation (0fr → 1fr)
[ ] Add chevron rotation animation
[ ] Add title color change on open (neutral-900 → primary)
[ ] Test with 8 real activities of varying complexity
[ ] Verify mobile touch targets (min 44px tap area on summary)
[ ] Add prefers-reduced-motion handling
[ ] Optional: Framer Motion enter/exit for expanded content
```
