# Scroll Animation & Landing Page Research
## For Church-Chat Landing Page (March 2026)

Compiled from web research across 12+ sources covering Framer Motion APIs, church design patterns, award-winning animation techniques, performance, and accessibility.

---

## Table of Contents

1. [Top 10 Scroll Animation Patterns](#1-top-10-scroll-animation-patterns)
2. [Recommended Section Order for a Church Landing Page](#2-recommended-section-order-for-a-church-landing-page)
3. [Color & Typography Best Practices](#3-color--typography-best-practices)
4. [Framer Motion API Reference by Effect Type](#4-framer-motion-api-reference-by-effect-type)
5. [Performance Considerations](#5-performance-considerations)
6. [Accessibility Considerations](#6-accessibility-considerations)
7. [GSAP vs Framer Motion: Pick One or Combine?](#7-gsap-vs-framer-motion-pick-one-or-combine)
8. [Component Libraries & Inspiration](#8-component-libraries--inspiration)

---

## 1. Top 10 Scroll Animation Patterns

### Pattern 1: Sticky Scroll Reveal
A section with `position: sticky` stays pinned to the viewport while content inside it transitions — text fades in/out, images swap, or data changes — all driven by vertical scroll progress. The scroll acts as a "timeline scrubber" for the sticky stage. Used by Apple product pages, Stripe, and Linear.

**Implementation:** Tall outer container (e.g., `height: 300vh`), inner sticky container (`position: sticky; top: 0; height: 100vh`). Use `useScroll({ target: outerRef })` to track `scrollYProgress`, then `useTransform` to map progress to opacity, y-position, or scale of child elements.

**Use case for church:** "What We Believe" or "Our Story" section — pin a photo/illustration while text paragraphs fade in and out as the user scrolls.

---

### Pattern 2: Horizontal Scroll Section
Vertical scrolling translates into horizontal movement, creating a gallery or timeline that slides sideways. The container is sticky, and `scrollYProgress` maps to an `x` translation on a wide flex container.

**Implementation:** Outer container height = (number of panels) x 100vh. Inner `position: sticky; top: 0; height: 100vh; overflow: hidden`. A `motion.div` with `display: flex` and width = (panels x 100vw) receives `style={{ x }}` where `x = useTransform(scrollYProgress, [0, 1], ["0%", "-66.67%"])` (for 3 panels).

**Use case for church:** Weekly activities timeline — scroll sideways through Monday prayer, Wednesday youth, Friday service, Sunday worship.

---

### Pattern 3: Parallax Depth Layers
Multiple elements move at different speeds relative to scroll, creating an illusion of depth. Background moves slowly, midground at normal speed, foreground moves fast.

**Implementation:** Use `useScroll()` for page-level scroll, then `useTransform(scrollY, [startRange, endRange], [startValue, endValue])` with different output ranges per layer. Background might get `y: useTransform(scrollY, [0, 1000], [0, -100])` while foreground gets `[0, -400]`.

**Use case for church:** Hero section — church building photo in background moving slowly, text overlay floating at medium speed, decorative elements (cross, light rays) at foreground speed.

---

### Pattern 4: Text Split & Stagger Reveal
Text splits into individual words or characters, each animating in with staggered timing as the section enters the viewport. Creates a "typewriter" or "cascade" effect.

**Implementation:** Split text string into an array of words/characters. Wrap each in a `motion.span`. Use parent `variants` with `staggerChildren: 0.03` (characters) or `0.08` (words). Child variants animate from `{ opacity: 0, y: 20 }` to `{ opacity: 1, y: 0 }`. Trigger with `whileInView` on the parent.

**Accessibility note:** Set `aria-label` on the parent container with the full text. Set `aria-hidden="true"` on each individual character/word span so screen readers read the full sentence, not individual letters.

**Use case for church:** Mission statement or pastor's welcome message — words cascade in one by one for dramatic effect.

---

### Pattern 5: Scroll-Triggered Number Counter
Statistics animate from 0 to their target value when they scroll into view. Creates impact for data-driven sections ("500+ members", "12 years serving", "3 services weekly").

**Implementation:** Use `useInView(ref)` to detect when the stat enters the viewport. On enter, use `animate(motionValue, targetNumber, { duration: 2 })` from Framer Motion. Display with `useMotionValueEvent` or the `<AnimateNumber>` component (Motion v11+). Combine with `useTransform` to round to integers.

**Use case for church:** Impact/stats section — "Years serving: 15", "Weekly attendees: 500+", "Community groups: 24".

---

### Pattern 6: Fade-Up on Scroll (Viewport Reveal)
The most fundamental scroll animation. Elements fade in and slide up slightly as they enter the viewport. Simple but effective when applied consistently.

**Implementation:** `<motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6, ease: "easeOut" }}>`. The `once: true` ensures it only plays once (no re-triggering on scroll back). The negative margin triggers slightly before the element is fully in view.

**Use case for church:** Apply to every section as a baseline. Cards, text blocks, images — everything fades up on entry.

---

### Pattern 7: Image/Card Parallax Scroll
Individual cards or images move at slightly different rates during scroll, creating subtle depth within a grid or list. Unlike full parallax (Pattern 3), this applies to discrete UI elements.

**Implementation:** For each card, use `useScroll({ target: cardRef, offset: ["start end", "end start"] })` to get that card's individual scroll progress. Map `scrollYProgress` to a small `y` range (e.g., `[-30, 30]`) with `useTransform`. Different cards get different ranges for varied speeds.

**Use case for church:** Photo gallery of church life, event cards, or ministry cards — each shifts slightly as you scroll past, adding life to an otherwise static grid.

---

### Pattern 8: Scroll Progress Indicator
A thin bar (usually at the top of the page or along a section) that fills based on how far through the content the user has scrolled.

**Implementation:** `const { scrollYProgress } = useScroll()`. Apply `style={{ scaleX: scrollYProgress }}` to a `motion.div` with `position: fixed; top: 0; left: 0; right: 0; height: 3px; transformOrigin: "0%"`. The scaleX animates from 0 to 1 as the page scrolls.

**Use case for church:** Top-of-page progress bar showing how far through the landing page the visitor is. Also useful on long sermon/blog pages.

---

### Pattern 9: Zoom Parallax / Scale on Scroll
An element scales up (or down) as the user scrolls, creating a "zooming in" or "zooming out" effect. Often used for hero images or reveal moments.

**Implementation:** Use `useScroll({ target: sectionRef })` and `useTransform(scrollYProgress, [0, 1], [0.8, 1.2])` mapped to `scale`. Combine with opacity for a dramatic reveal. Can also use `[1, 0.5]` for a "shrink away" effect as a section exits.

**Use case for church:** Hero section — church photo starts slightly zoomed out and scales to full as user scrolls past the fold, creating a "welcome in" feeling.

---

### Pattern 10: Clip-Path / Mask Reveal
An element is hidden behind a CSS clip-path that expands on scroll, revealing the content underneath. Creates a dramatic "curtain opening" or "spotlight expanding" effect.

**Implementation:** Use `useScroll` to track progress, then `useTransform` to map to clip-path values. For a circle reveal: `clipPath: \`circle(\${radius}% at 50% 50%)\`` where `radius` maps from `0` to `150` based on scroll. For a horizontal wipe: `clipPath: \`inset(0 \${100 - progress}% 0 0)\``.

**Use case for church:** Transition between sections — as you scroll past the hero, the next section reveals through an expanding circle or horizontal wipe.

---

## 2. Recommended Section Order for a Church Landing Page

Based on research of top-performing church websites (Life.Church, Hillsong, Bethel, Elevation) and UX best practices for first-time visitor conversion:

### The Flow: Emotional Journey

```
WELCOME (warm, immediate)
  -> IDENTITY (who are we)
    -> PROOF (real people, real impact)
      -> LOGISTICS (when/where)
        -> ACTION (what to do next)
```

### Recommended Sections (in order):

| # | Section | Purpose | Animation Pattern |
|---|---------|---------|-------------------|
| 1 | **Hero / Welcome** | Full-viewport. Video or high-quality photo of real congregation. Church name + one-line tagline. Service times visible immediately. | Zoom parallax (Pattern 9) on background. Text split reveal (Pattern 4) on tagline. |
| 2 | **"Plan Your Visit" CTA Bar** | Sticky or prominent bar — "Join us this Sunday" with time, location, one-click map link. | Fade-up (Pattern 6). Stays visible or becomes sticky on scroll. |
| 3 | **Who We Are / Our Story** | 2-3 short paragraphs or a video. Pastor's welcome. Authentic voice, not corporate. | Sticky scroll reveal (Pattern 1) — pin a photo of the pastor while text transitions. |
| 4 | **What We Believe** | Core values or beliefs, presented as cards or a short list. Not a theological treatise — warm and accessible. | Staggered card fade-up (Pattern 6 with stagger). |
| 5 | **Community Life / Activities** | Horizontal scroll timeline or card grid of weekly activities (youth, prayer, small groups, worship). | Horizontal scroll (Pattern 2) or image parallax grid (Pattern 7). |
| 6 | **Impact / By the Numbers** | Stats section — years serving, members, community groups, lives impacted. | Number counter (Pattern 5) triggered on viewport entry. |
| 7 | **Testimonials / Real Stories** | 2-3 short quotes or video testimonials from real members. | Fade-up with stagger (Pattern 6). |
| 8 | **Upcoming Events** | Next 2-3 events with dates, times, one-line descriptions. | Card parallax (Pattern 7). |
| 9 | **Get Connected** | Connection card / prayer request form / "I'm new" form. This is the conversion point. | Clip-path reveal (Pattern 10) to make the form section feel like a new "space." |
| 10 | **Footer** | Location map embed, service times (repeated), social links, contact info. | Simple fade-up (Pattern 6). |

### Key Principles:
- **Service times within 3 seconds.** First-time visitors need this immediately. Put it in the hero or an unmissable bar just below.
- **Real photos, never stock.** Authentic congregation photography builds trust faster than any copy.
- **Mobile-first.** 60-70% of church website traffic is mobile. Every animation must work on touch/mobile.
- **"Plan Your Visit" is the #1 CTA.** Not "Give" or "Watch Sermons" — those are for existing members. The landing page serves new visitors.
- **Keep it short.** 5-7 scroll-lengths max. Every section earns its place or gets cut.

---

## 3. Color & Typography Best Practices

### Color Palettes for Modern Church Sites (2025-2026)

**Approach 1: Warm & Welcoming (Recommended for community-focused churches)**
- Primary: Deep warm tone (warm navy `#1a2744`, forest green `#2d4a3e`, or rich burgundy `#5a2d3a`)
- Accent: Warm gold/amber `#d4a853` or soft coral `#e8735a`
- Background: Off-white/cream `#faf8f5` (never pure white — too clinical)
- Text: Near-black `#1a1a2e` for body, muted gray `#6b7280` for secondary
- Surface: Warm gray `#f3f0eb` for card backgrounds

**Approach 2: Modern & Clean (Recommended for contemporary/urban churches)**
- Primary: Slate blue `#334155` or deep teal `#0f4c5c`
- Accent: Vibrant but not neon — emerald `#10b981` or soft blue `#3b82f6`
- Background: Pure white `#ffffff` with subtle warm gray sections `#f9fafb`
- Text: True dark `#111827` for headings, `#4b5563` for body

**Approach 3: Earth & Organic (Good for nature-connected or rural churches)**
- Primary: Olive `#4a5623` or terracotta `#c46744`
- Accent: Sage green `#87a878` or warm sand `#d4b896`
- Background: Linen `#faf0e6`
- Texture: Subtle grain/paper texture overlay at low opacity

### Key Color Rules:
- Limit to 3 colors max (primary, accent, neutral). More creates visual chaos.
- Accent color reserved exclusively for CTAs and interactive elements.
- Sufficient contrast ratios: 4.5:1 minimum for body text (WCAG AA), 3:1 for large text.
- Dark mode: Consider it. Many modern church websites offer it. Swap background to deep navy/charcoal, not pure black.

### Typography

**Recommended Pairings:**

| Heading | Body | Vibe |
|---------|------|------|
| **Playfair Display** (serif) | **Inter** (sans-serif) | Classic + modern. Elegant but readable. |
| **Montserrat** (geometric sans) | **Merriweather** (serif) | Contemporary + warm. Widely used in church sites. |
| **Raleway** (elegant sans) | **Lato** (humanist sans) | Light + approachable. Good for minimal designs. |
| **DM Serif Display** | **DM Sans** | Matched family. Cohesive, modern, premium feel. |
| **Fraunces** (soft serif) | **Commissioner** (sans) | Organic + friendly. Great for community-focused sites. |

**Typography Rules:**
- Hero heading: 48-72px desktop, 32-40px mobile. Bold or semibold.
- Section headings: 32-40px desktop, 24-28px mobile.
- Body text: 16-18px. Never smaller than 16px on mobile.
- Line height: 1.5-1.7 for body text. 1.1-1.2 for headings.
- Letter spacing: Slightly tight (-0.01em to -0.02em) on headings for premium feel. Normal on body.
- Max paragraph width: 65-75 characters (roughly 600-700px). Wider is hard to read.

---

## 4. Framer Motion API Reference by Effect Type

### Scroll-Triggered Animations (fire once when element enters viewport)

| API | Use Case | Notes |
|-----|----------|-------|
| `whileInView` | Simplest approach. Add directly to `motion.div`. | `whileInView={{ opacity: 1, y: 0 }}` with `initial={{ opacity: 0, y: 40 }}` |
| `viewport` prop | Configure trigger behavior. | `viewport={{ once: true, margin: "-100px", amount: 0.3 }}`. `once: true` = don't re-trigger. `amount` = how much must be visible (0-1). |
| `useInView(ref)` | When you need to trigger React state changes (not just animations) on viewport entry. | Returns boolean. Useful for number counters, data fetching, etc. |

### Scroll-Linked Animations (tied to scroll position)

| API | Use Case | Notes |
|-----|----------|-------|
| `useScroll()` | Get page-level scroll position. | Returns `{ scrollX, scrollY, scrollXProgress, scrollYProgress }` as MotionValues. |
| `useScroll({ target })` | Get scroll progress of a specific element relative to viewport. | Pass a `ref` to track when that element enters/exits. Returns `scrollYProgress` from 0 to 1. |
| `useScroll({ container })` | Track scroll inside a scrollable container (not the page). | For custom scroll areas. |
| `offset` option | Define when tracking starts/ends. | `offset: ["start end", "end start"]` = track from when element's top hits viewport bottom to when element's bottom hits viewport top. |
| `useTransform(motionValue, inputRange, outputRange)` | Map scroll progress to any CSS value. | `useTransform(scrollYProgress, [0, 1], [0, -200])` maps full scroll to -200px y movement. |
| `useMotionValueEvent(value, "change", callback)` | React to MotionValue changes imperatively. | For side effects like updating state based on scroll position. |

### Animation Orchestration

| API | Use Case | Notes |
|-----|----------|-------|
| `variants` | Define named animation states on parent, inherited by children. | Parent: `variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}` |
| `staggerChildren` | Delay between each child's animation start. | Set in parent's transition. `0.03` for characters, `0.08` for words, `0.15` for cards. |
| `delayChildren` | Delay before first child starts. | Useful to let the parent animate in first. |
| `when` | Control parent vs child timing. | `"beforeChildren"` or `"afterChildren"`. |
| `stagger()` function | Advanced stagger with `from` option. | `stagger(0.1, { from: "center" })` staggers outward from center. Also `"first"`, `"last"`, or index number. |

### Layout & Presence

| API | Use Case | Notes |
|-----|----------|-------|
| `AnimatePresence` | Animate elements in/out of the DOM. | Wrap conditional renders. Children must have unique `key` props. |
| `exit` prop | Define exit animation. | Only works inside `AnimatePresence`. `exit={{ opacity: 0, y: -20 }}` |
| `layout` prop | Animate layout changes (position, size). | Add `layout` to `motion.div`. When it re-renders at a new position, it animates there. |
| `layoutId` | Shared layout animation between different components. | Two elements with same `layoutId` animate between each other. Great for tabs, modals. |

### Values & Springs

| API | Use Case | Notes |
|-----|----------|-------|
| `useMotionValue(0)` | Create a manually-controlled motion value. | Doesn't trigger re-renders. Use for performance-critical animations. |
| `useSpring(motionValue)` | Apply spring physics to a motion value. | Smooths out jerky scroll-linked values. `useSpring(scrollY, { stiffness: 100, damping: 30 })` |
| `useVelocity(motionValue)` | Get the velocity of a motion value. | Useful for parallax that responds to scroll speed, not just position. |

### Number Animation

| API | Use Case | Notes |
|-----|----------|-------|
| `<AnimateNumber>` | Built-in component for animating numbers (Motion v11+). | `<AnimateNumber value={500} />` animates from previous value. |
| `animate(motionValue, target)` | Imperatively animate a MotionValue. | `animate(count, 500, { duration: 2 })` for counter effect triggered by `useInView`. |

---

## 5. Performance Considerations

### The Golden Rule
**Only animate `transform` and `opacity`.** These are the only CSS properties that can be composited on the GPU without triggering layout or paint recalculations. Animating `width`, `height`, `top`, `left`, `margin`, `padding`, `border`, `font-size` etc. causes layout thrashing and jank.

### GPU Acceleration

- `transform: translate3d()`, `scale()`, `rotate()` — hardware-accelerated by default.
- `opacity` — hardware-accelerated by default.
- `will-change: transform` — hints the browser to promote to its own GPU layer. Use sparingly (too many layers = memory bloat). Apply only to elements actively animating. Remove when done.
- `backface-visibility: hidden` — forces GPU layer creation. Useful as a "just in case" for stubborn elements.
- `contain: layout paint` — tells the browser this element's internals won't affect outside layout, enabling optimizations.

### Framer Motion Specific Performance

- **Use `MotionValues` over React state** for scroll-linked animations. MotionValues update without triggering React re-renders. `useScroll`, `useTransform`, `useSpring` all return MotionValues.
- **`useTransform` is declarative and non-rendering.** Chain multiple transforms without performance penalty: `const y = useTransform(scrollYProgress, ...)` then `const opacity = useTransform(y, ...)`.
- **`viewport={{ once: true }}`** — for fade-in-on-scroll effects, set `once: true` so the intersection observer disconnects after first trigger. Reduces ongoing observation overhead.
- **ScrollTimeline API** — Framer Motion v11+ can use the browser's native ScrollTimeline API for scroll-linked animations, running them on the compositor thread for maximum performance. This is automatic when available.

### Lazy Loading & Content Visibility

- **`content-visibility: auto`** on below-fold sections. Skips rendering (layout + paint) for off-screen sections entirely. Can produce a 7x rendering improvement on initial load. Pair with `contain-intrinsic-size` to prevent layout shifts.
- **Lazy load images** below the fold. Use `loading="lazy"` on `<img>` tags or Next.js `<Image>` component (lazy by default).
- **Lazy load animation-heavy sections** with dynamic imports: `const HeavySection = dynamic(() => import('./HeavySection'), { ssr: false })`.
- **Intersection Observer for deferred initialization.** Don't set up GSAP timelines or complex Framer Motion animations until the section is near the viewport.

### Bundle Size

- Framer Motion: ~32KB gzipped. Import only what you use: `import { motion, useScroll, useTransform } from "framer-motion"` — tree-shakeable.
- GSAP core: ~23KB gzipped. ScrollTrigger adds ~10KB. Modular, import only needed plugins.
- Lenis (smooth scroll): ~5KB gzipped. Optional — only add if smooth scroll is a design requirement.

### Mobile Considerations

- **Reduce animation complexity on mobile.** Parallax with 5 layers on desktop might need 2 layers on mobile. Use CSS media queries or a `useMediaQuery` hook.
- **Disable smooth scroll on mobile.** Native scrolling on mobile is already optimized. Lenis/smooth scroll adds overhead and can fight with native momentum scrolling.
- **Test on real devices.** Chrome DevTools throttling doesn't accurately reflect mobile GPU limitations.
- **Reduce motion on low-end devices.** Consider detecting `navigator.hardwareConcurrency` (CPU cores) and reducing animation complexity accordingly.

---

## 6. Accessibility Considerations

### prefers-reduced-motion (Critical)

The `prefers-reduced-motion` media query detects when a user has requested reduced motion in their OS settings. **This is not optional — it's essential for users with vestibular disorders** (affects 70+ million people globally, can cause vertigo, nausea, migraines, seizures).

**Implementation strategy:**

1. **CSS level:** Wrap all animations in `@media (prefers-reduced-motion: no-preference) { ... }`. If the user prefers reduced motion, animations simply don't play.

2. **Framer Motion level:** Create a hook:
   ```
   Hook: useReducedMotion() — returns true if user prefers reduced motion
   ```
   Then conditionally set `animate` props to their final state (no transition) when reduced motion is preferred.

3. **What to reduce (not remove):**
   - Parallax effects: disable entirely (just static positioning)
   - Fade-ins: keep opacity fade (gentle), remove y/x movement
   - Counters: show final number immediately, no counting animation
   - Horizontal scroll: convert to normal vertical scroll
   - Text split: show all text immediately, no stagger
   - Progress bars: still show, but no animation (just static width)

4. **Framer Motion has `useReducedMotion()` built in** — returns `true` when the user's system setting requests reduced motion.

### Screen Reader Considerations

- **Decorative animations need `aria-hidden="true"`.** Background parallax layers, floating decorative elements, etc.
- **Split text needs `aria-label` on parent.** Each individual `<span>` character gets `aria-hidden="true"`, parent gets `aria-label="Full sentence here"` and `role="heading"` (or appropriate role).
- **Meaningful content must not depend on animation to be readable.** If text is only visible after a scroll trigger, ensure it's in the DOM and accessible to screen readers regardless of scroll position.
- **Number counters: use `aria-live="polite"`** on the counter element so screen readers announce the final value.

### Keyboard & Focus

- **Horizontal scroll sections must be keyboard-navigable.** Add `tabindex="0"` and `role="region"` with `aria-label`. Allow arrow keys to scroll horizontally.
- **Don't hijack scroll/keyboard behavior in ways that prevent navigation.** Users must always be able to Tab through the page and reach all interactive elements.
- **Sticky sections should not trap focus.** Ensure Tab key moves past sticky sections normally.

### Color & Contrast

- WCAG AA: 4.5:1 contrast ratio for normal text, 3:1 for large text (18px+ bold or 24px+ normal).
- WCAG AAA: 7:1 for normal text, 4.5:1 for large text (aim for this on critical content).
- Don't rely on color alone to convey meaning. Use icons, labels, or patterns in addition to color.
- Test with a contrast checker tool (WebAIM, Stark, or browser DevTools).

---

## 7. GSAP vs Framer Motion: Pick One or Combine?

### Recommendation: Framer Motion Only (for this project)

For a church landing page built in Next.js with React, **Framer Motion alone is sufficient and recommended.** Here's why:

**Why Framer Motion is enough:**
- All 10 scroll patterns above are achievable with Framer Motion's built-in APIs.
- Declarative, React-native API — no ref management, no cleanup code, no imperative timelines.
- `whileInView`, `useScroll`, `useTransform`, `variants`, `staggerChildren` cover 95% of landing page animation needs.
- Built-in `AnimatePresence` for mount/unmount animations.
- Built-in `useReducedMotion` for accessibility.
- Tree-shakeable, well-maintained, excellent TypeScript support.
- Already in the project (ORACLE frontend used Framer Motion).

**When you'd need GSAP instead:**
- Thousands of simultaneous tweens (not applicable for a landing page).
- Canvas, WebGL, Three.js animations (not applicable).
- Extremely precise frame-by-frame timeline control (not applicable).
- Non-React environments.

**When you'd combine both:**
- A scroll-triggered 3D scene (GSAP for the 3D, Framer Motion for UI).
- Complex SVG morphing animations (GSAP's MorphSVG plugin).
- Neither applies to a church landing page.

### Smooth Scrolling: Lenis

If you want the "premium feel" of smooth/inertia scrolling (like award-winning sites on Awwwards), add **Lenis** (~5KB). It integrates with Framer Motion by disabling `autoRaf` on `ReactLenis` and syncing with Framer Motion's `frame.update` in a `useEffect`.

**Caveat:** Disable Lenis on mobile. Native mobile scroll is already smooth, and Lenis can fight with native momentum scrolling, causing a worse experience.

---

## 8. Component Libraries & Inspiration

### Aceternity UI (ui.aceternity.com)
200+ free copy-paste components built with React, Next.js, Tailwind CSS, and Framer Motion. Relevant components:
- **Sticky Scroll Reveal** — pre-built sticky section with text transitions
- **Container Scroll Animation** — 3D rotation on scroll for hero sections
- **Spotlight** — mouse-following spotlight effect
- **Text Reveal** — various text animation patterns
- **Lamp Effect** — dramatic lighting reveal

### shadcn/ui + Magic UI
- shadcn provides the base component system (already in church-chat via components.json)
- Magic UI (magicui.design) provides animated components that layer on top

### Olivier Larose Tutorials (blog.olivierlarose.com)
Excellent step-by-step tutorials for:
- Background image parallax with Framer Motion
- Cards parallax scroll
- Smooth parallax with Lenis + Framer Motion
- Zoom parallax
- Horizontal scroll sections
- Perspective section transitions

### Motion Examples (motion.dev/examples)
Official examples from the Framer Motion team:
- Scroll horizontal gallery
- Scroll-linked animations
- Viewport trigger animations
- Layout animations

### Awwwards (awwwards.com)
Browse "Landing Page" category for current award-winning designs. Filter by technology (React, Next.js) for relevant examples.

---

## Summary: Implementation Priority

For the church-chat landing page, prioritize in this order:

1. **Fade-up on scroll (Pattern 6)** — apply everywhere as baseline. Low effort, high impact.
2. **Text split reveal (Pattern 4)** — hero tagline and key headings. Medium effort, high wow factor.
3. **Parallax hero (Pattern 3)** — hero section depth. Medium effort, strong first impression.
4. **Number counter (Pattern 5)** — impact stats section. Low effort, high engagement.
5. **Sticky scroll reveal (Pattern 1)** — "Our Story" section. Medium effort, premium feel.
6. **Staggered cards (Pattern 6 + variants)** — beliefs, activities, events. Low effort, polished feel.
7. **Horizontal scroll (Pattern 2)** — activities timeline. Higher effort, strong differentiator.
8. **Zoom parallax (Pattern 9)** — hero enhancement. Low effort addition if parallax is already done.
9. **Clip-path reveal (Pattern 10)** — section transitions. Medium effort, dramatic.
10. **Scroll progress bar (Pattern 8)** — optional polish.

Always implement `prefers-reduced-motion` handling from the start, not as an afterthought.

---

## Sources

- [Motion Scroll Animations Documentation](https://motion.dev/docs/react-scroll-animations)
- [Motion useScroll Documentation](https://motion.dev/docs/react-use-scroll)
- [Motion splitText Documentation](https://motion.dev/docs/split-text)
- [Motion AnimateNumber Documentation](https://motion.dev/docs/react-animate-number)
- [Motion useInView Documentation](https://motion.dev/docs/react-use-in-view)
- [Motion GSAP vs Motion Comparison](https://motion.dev/docs/gsap-vs-motion)
- [Motion Animation Performance Tier List](https://motion.dev/magazine/web-animation-performance-tier-list)
- [Aceternity UI Components](https://ui.aceternity.com/components)
- [Aceternity Sticky Scroll Reveal](https://ui.aceternity.com/components/sticky-scroll-reveal)
- [Olivier Larose — Smooth Parallax Scroll Tutorial](https://blog.olivierlarose.com/tutorials/smooth-parallax-scroll)
- [Olivier Larose — Cards Parallax Tutorial](https://blog.olivierlarose.com/tutorials/cards-parallax)
- [Olivier Larose — Zoom Parallax Tutorial](https://blog.olivierlarose.com/tutorials/zoom-parallax)
- [Olivier Larose — Background Image Parallax Tutorial](https://blog.olivierlarose.com/tutorials/background-image-parallax)
- [Olivier Larose — Horizontal Scroll Section Tutorial](https://blog.olivierlarose.com/tutorials/horizontal-section)
- [Codrops — 3D Scroll-Driven Text Animations](https://tympanus.net/codrops/2025/11/04/creating-3d-scroll-driven-text-animations-with-css-and-gsap/)
- [Codrops — Sticky Grid Scroll](https://tympanus.net/codrops/2026/03/02/sticky-grid-scroll-building-a-scroll-driven-animated-grid/)
- [Tithely — Best Church Websites 2026](https://get.tithe.ly/blog/5-examples-of-great-church-websites-and-why-we-think-theyre-awesome)
- [OneEighty Digital — Church Website Design Trends 2025](https://oneeighty.digital/2025/01/13/church-website-design-trends-for-2025/)
- [Wix — 18 Best Church Website Examples](https://www.wix.com/blog/beautiful-church-websites)
- [99designs — 17 Church Websites That Welcome You In](https://99designs.com/blog/creative-inspiration/church-websites/)
- [ChurchTrac — Church Website Design Trends](https://www.churchtrac.com/articles/church-website-design-trends)
- [Discipls — 8 Church Color Palettes 2025](https://www.churchsocial.ai/blog/church-color-palettes)
- [Digital Fire University — Best Color Schemes for Church Websites](https://www.digitalfireu.com/post/website-color-scheme)
- [Really Good Designs — Web Design Trends 2026](https://reallygooddesigns.com/web-design-trends-2026/)
- [Pixlogix — Web Design Trends 2026](https://www.pixlogix.com/web-design-trends-2026/)
- [Wavespace — Best Website Design Examples 2026](https://www.wavespace.agency/blog/best-website-design-examples)
- [Semaphore — Framer Motion vs GSAP](https://semaphore.io/blog/react-framer-motion-gsap)
- [Pentaclay — Framer vs GSAP Comparison](https://pentaclay.com/blog/framer-vs-gsap-which-animation-library-should-you-choose)
- [UAV Development — Framer Motion vs GSAP Performance in Next.js](https://blog.uavdevelopment.io/blogs/comparing-the-performance-of-framer-motion-and-gsap-animations-in-next-js)
- [Lenis GitHub — Smooth Scroll Library](https://github.com/darkroomengineering/lenis)
- [FreeCodeCamp — Scroll Animations with Framer Motion](https://www.freecodecamp.org/news/create-scroll-animations-with-framer-motion-and-react/)
- [DEV Community — CSS Scroll Timeline Guide 2026](https://dev.to/softheartengineer/mastering-css-scroll-timeline-a-complete-guide-to-animation-on-scroll-in-2025-3g7p)
- [MDN — prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion)
- [Pixel Free Studio — Accessible Web Animations](https://blog.pixelfreestudio.com/best-practices-for-creating-accessible-web-animations/)
- [Lexo — CSS GPU Acceleration Guide](https://www.lexo.ch/blog/2025/01/boost-css-performance-with-will-change-and-transform-translate3d-why-gpu-acceleration-matters/)
- [Frontend.fyi — Staggered Text Animations with Motion](https://www.frontend.fyi/tutorials/staggered-text-animations-with-framer-motion)
- [Framer University — 10 Scroll Animations](https://framer.university/blog/10-scroll-animations-to-make-your-website-stand-out)
- [Prismic — 50 Interactive CSS Scroll Effects](https://prismic.io/blog/css-scroll-effects)
