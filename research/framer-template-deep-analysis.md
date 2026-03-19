# Deep Visual Analysis — Framer Church Templates & Indonesian Church Sites

**Created:** March 17, 2026
**Purpose:** Extract the specific, concrete design techniques that make premium Framer church templates feel elevated vs. generic AI/template output. Not "good typography" but "120px serif heading next to 14px sans body creates 8.5:1 scale ratio."

---

## Sites Analyzed

1. **Edify Church** (Framer) — https://edifychurch.framer.website/
2. **Edify Church /about** — https://edifychurch.framer.website/about
3. **Faith Template** (Framer) — https://faith-template.framer.website/
4. **GMS Church Indonesia** — https://gms.church/id
5. **GBI GATSU** — https://gbigatsu.id/

---

## 1. EDIFY CHURCH — The Gold Standard

### 1.1 Typography System

**The core technique: Serif/Sans pairing with extreme scale contrast.**

| Role | Font | Size Range | Weight | Spacing |
|------|------|-----------|--------|---------|
| Display headings | **Judson** (serif) | 50px desktop | 400 italic, 700 | `-0.06em` to `-0.03em` |
| UI/Navigation | **Outfit Variable** (geometric sans) | 16px | 400-700 | `-0.01em` |
| Body text | **Inter** (humanist sans) | 16px | 400 | Normal |

**What makes it work:**
- The 50px Judson italic heading next to 16px Outfit body creates a **3.1:1 size ratio** — enough to feel dramatic without being absurd. Most generic templates use 32px/16px (2:1) which feels flat.
- **Negative letter-spacing on headings** (`-0.03em` to `-0.06em`) makes large serif text feel tight, confident, and editorial — the opposite of the loose, spaced-out "default Google Fonts" look.
- **Three fonts, three roles.** Judson = emotion/identity. Outfit = function/navigation. Inter = readability. No font does double duty, which is why it feels considered rather than default.
- **Italic serif for emphasis.** The about page uses Judson 400 italic for hero text — italic serif at large scale reads as calligraphic and warm without being decorative. This is the single biggest differentiator from generic church sites that use bold sans everywhere.

### 1.2 Color System

**Palette is deliberately restrained — only 5 colors total:**

| Color | Hex | Usage | Opacity Variants |
|-------|-----|-------|-----------------|
| White | `#ffffff` | Primary background, hero text | 50%, 75% for overlays |
| Light gray | `#ededed` | Alternate section backgrounds | — |
| Black | `#000000` | Primary text, accents | — |
| Teal | `#2a967d` | Brand accent (CTAs, links) | — |
| Mid gray | `#949494` / `#cccccc` | Tertiary text, borders | — |

**What makes it work:**
- **Only ONE accent color** (teal `#2a967d`). Every other color is grayscale. This means when teal appears, it pops hard. Generic templates use 3-4 accent colors which dilutes impact.
- **The `#ededed` alternation trick.** Sections alternate between `#fff` and `#ededed` — a 7% luminance shift. This is subtle enough that you don't consciously notice "dark section / light section" but you DO feel rhythm. It's not a dark mode toggle, it's a whisper.
- **White at 50-75% opacity** is used for layered text effects (text over images). This creates depth without harsh contrast — the text feels like it's part of the image rather than stamped on top.

### 1.3 Layout & Spacing

**The core technique: Aggressive whitespace with asymmetric flex layouts.**

| Measurement | Value | Where Used |
|-------------|-------|------------|
| Max container | 1160px content, 1440px full | Page-wide |
| Section vertical gap | 150-200px | Between major sections |
| Element gap | 50-100px | Between content blocks within sections |
| Horizontal padding | 100px desktop, 60px tablet, 25px mobile | Content inset |
| Card padding | 40px | Inside activity cards |
| Card border-radius | 25px | Activity/event cards |
| Image border-radius | 15-30px | All photographs |

**What makes it work:**
- **200px between sections** is massive. Most templates use 60-80px. The whitespace is doing work — it lets each section breathe as its own moment, like pages in a book. When you scroll, each section arrival feels like an event.
- **Asymmetric flex ratios.** Columns use `flex: 1 0 0` vs `flex: 1.3 0 0` — a 1:1.3 ratio rather than 50/50. This breaks the "centered and symmetrical" default that screams template.
- **100px horizontal padding** on desktop means content floats in a generous frame. The page never feels edge-to-edge cramped.
- **300px bottom padding** on extended sections creates a "breathing room" zone where the previous section's emotional weight can settle before the next one arrives.

### 1.4 Sticky Stacking Cards

**This is the hero technique of the Edify template.**

```
Card 1: position:sticky, top:250px, height:500px, z-index:1, border-radius:25px
Card 2: position:sticky, top:270px  (+20px offset)
Card 3: position:sticky, top:290px  (+20px offset)
Card 4: position:sticky, top:310px  (+20px offset)
...
Outer container: flex-direction:column, gap:150px
```

**How it feels:** As you scroll, each card slides up and sticks at its position. The previous card is still visible — peeking out 20px above. The 150px gap between cards in the DOM creates enough scroll distance that each card gets a full "reveal" moment. Cards use dark backgrounds with light text, creating high contrast against the light page.

**Why this is premium:**
- It rewards scrolling. You don't see everything at once — the page unfolds.
- The stacking creates physical depth metaphor — like flipping through a stack of thick cards.
- Each card's dark background is an environment change — you leave the airy white page and enter a dark, focused space, then emerge back out.

### 1.5 Image Treatment

| Property | Value | Effect |
|----------|-------|--------|
| Border radius | 15-30px | Softened edges, never harsh rectangles |
| Box shadow | `0 0 10px -5px #000` | Very subtle depth — the `-5px` spread shrinks the shadow tighter than the element, creating a "lifted paper" effect |
| Aspect ratios | 0.75:1 (tall portrait), 1.33:1 (4:3), 1.45:1, 1.625:1 (wide) | Multiple ratios in single layout creates asymmetric visual interest |
| Image rendering | `image-rendering: auto` | Browser-optimized |

**Key insight:** Edify uses at least 4 different aspect ratios across the page. Generic templates use ONE ratio (16:9 everywhere or square everywhere). Mixing ratios creates compositional variety — tall images next to wide images feel curated, like a magazine layout.

### 1.6 Hero Section

| Property | Value |
|----------|-------|
| Height | 100vh with 110vh image container |
| Background | Full-bleed photograph |
| Background treatment | `filter: brightness(0.77) blur(10px)` |
| Text shadow | `0 0 50px rgba(0,0,0,0.5)` — massive soft black glow |
| Layout | Centered vertical flex |
| Text color | White with opacity variants |

**What makes it NOT generic:**
- The **110vh image container** means the image extends beyond the viewport, so when you start scrolling there's a parallax-like "the world extends beyond the frame" feeling.
- The **brightness(0.77) + blur(10px)** combo is specific. Not a solid color overlay (too flat), not unmodified (text unreadable), not a gradient overlay (too 2015). The blur makes the photo atmospheric — shapes are visible but soft, like looking through frosted glass. The brightness reduction is gentle (77% not 50%), so the image retains warmth.
- The `0 0 50px` text shadow is a **50px soft glow**, not a drop shadow. It creates a luminous halo effect around white text, like the text is lit from behind. This is the hero's signature technique.

### 1.7 About Page Specifics

**Additional patterns from /about:**

- **Hero has absolute-positioned image element** (350x550px, portrait aspect) floated to the right of centered text — this breaks the "centered everything" pattern with an asymmetric anchor.
- **Blur background depth:** `filter: brightness(0.77) blur(10px)` used again but with white text shadow at `0 0 65px rgba(255,255,255,0.75)` — a white glow on white text over a darkened/blurred background. The glow makes text feel ethereal.
- **Weighted columns:** `flex: 1.3 0 0` vs `flex: 1 0 0` for text-heavy vs image columns — subtle 56%/44% split rather than 50/50.

---

## 2. FAITH TEMPLATE — The Warm Alternative

### 2.1 Typography System

| Role | Font | Weights | Spacing |
|------|------|---------|---------|
| Headings | **General Sans** | 400, 500, 700 | `-0.01em` |
| Body | **Inter** | 400, 500 | Normal |

**Key difference from Edify:** Faith uses a sans-serif for headings (General Sans) rather than a serif. The result is more modern/tech-forward but less "warm church" feeling. General Sans is a geometric sans with slightly rounded terminals — it splits the difference between clinical and friendly.

**Line height: `1.6em`** for body text — noticeably spacious compared to the typical 1.4-1.5. This creates generous paragraph spacing that reads as "luxurious" — each line of text has room to breathe.

### 2.2 Color System — The Warm Palette

**This is Faith's standout feature.**

| Color | Hex | Role |
|-------|-----|------|
| Background | `#f9f7f5` | **Warm off-white/cream** — NOT pure white |
| Light card bg | `#f6f3f0` | Even warmer variant for cards |
| Dark text | `#231f1b` | **Dark brown, NOT black** |
| Warm gray | `#615c57` | **Taupe gray** for secondary text |
| Purple-blue accent | `#525fbd` | Primary CTA color |
| Mauve | `#c24f77` | Secondary accent |
| Terracotta | `#c26a4f` | Tertiary accent |
| Gold | `#f0bc21` | Highlight accent |
| Hero gradient | `#36302ba8` → `#312c2682` | Radial gradient, deep warm brown with transparency |

**What makes this palette special:**
- **Zero pure white, zero pure black.** The warmest background is `#f9f7f5` (yellowish cream), the darkest text is `#231f1b` (dark chocolate brown). This means the overall page has a warm temperature — it feels like afternoon light, not fluorescent office lighting.
- **The secondary text is taupe (`#615c57`), not gray.** Standard designs use `#666` or `#888` (neutral gray) for secondary text. Taupe has a brown undertone that harmonizes with the cream background.
- **Four accent colors** (purple-blue, mauve, terracotta, gold) — more than Edify's one, but they're all in the same warm-muted family. None are saturated or neon. They feel like colors found in nature or old books.
- **Radial gradient hero background** (`#36302ba8` → `#312c2682`) — this is a deep brown with alpha transparency, creating a warm atmospheric depth. The radial shape means light gathers at the center and darkens at edges, like a vignette photograph.

### 2.3 Layout

| Property | Value |
|----------|-------|
| Max container | 1200px |
| Nav height | 72px with 16px padding |
| Nav z-index | 6 |
| Hero | 100vh, flex-row (content left, visual right) |
| Hero content max-width | 540px (left-aligned within container) |
| Section gaps | 40px vertical |
| Component gaps | 8-24px |
| Standard padding | 16px containers, 48px larger sections |
| Breakpoints | 320px, 767px, 810px, 1200px |

**Key differences from Edify:**
- **Left-aligned hero** with 540px max-width content block. Edify centers everything. Faith's asymmetric hero feels editorial — the text sits on one side while the other side breathes or holds a visual.
- **Tighter section gaps** (40px vs Edify's 150-200px). Faith is more compact, content flows closer together. This creates a different reading rhythm — continuous rather than episodic.
- **More breakpoints** (5 vs Edify's 3). Faith handles more device sizes explicitly, suggesting more careful responsive design.

### 2.4 Navigation

- **72px height** — taller than typical (60px) which gives the nav more presence.
- **Fixed at z-index 6** — sits above all content.
- **Hamburger menu:** Two bars (not three), 20px wide, positioned at 62.5%/37.5% — asymmetric bar positions are a subtle premium detail vs the standard equally-spaced three-bar hamburger.
- **8px circular indicator dots** for navigation states — a boutique touch.

### 2.5 Unique Elements

- **Text underlines as design elements:** Custom `text-decoration` with specific color and thickness properties. Links have visible underlines styled as intentional design rather than default browser underlines.
- **SVG icon masks:** Navigation uses `icon-mask` property for custom icon rendering — icons aren't font icons or inline SVGs, they're CSS-mask-powered, which allows color theming.
- **Button hover states:** `cursor: grab` on draggable elements, `will-change: transform` prepared — suggests drag/gesture interactions.

---

## 3. GMS CHURCH — Scale & Professionalism

### 3.1 What Makes It Feel "Real" vs "Template"

GMS Church (gms.church/id) is a production megachurch site for a congregation of 300,000+. The key differentiators from template sites:

**Content density signals scale:**
- Growth metrics displayed prominently: "bertumbuh cepat ke arah 300.000 jemaat" (growing rapidly toward 300,000 members)
- Mission statement with specific numbers: "1.000 gereja lokal yang kuat dengan 1.000.000 murid" (1,000 strong local churches with 1,000,000 disciples)
- Multi-continent presence (not just "we have a location")

**Technical infrastructure signals maturity:**
- **Multi-language support:** 7 locales (Indonesian, English, Dutch, Chinese, French, German, Korean)
- **CDN-delivered assets:** Images served from `gmschurch-assets-2.b-cdn.net` (BunnyCDN)
- **WebP image format:** Modern optimization
- **GTM integration:** Professional analytics
- **Native app ecosystem:** Android, iOS, Huawei app stores
- **Geolocation for services:** "Gunakan lokasi saya" (Use my location) to find nearest service

### 3.2 Design Patterns

| Pattern | Details |
|---------|---------|
| Navigation | Sidebar hamburger menu (not top nav) — distinctive, app-like |
| Hero | Full-bleed imagery with large overlay text. Vision statement ("TAHUN PERSATUAN & SORGA YANG TERBUKA") as hero text — NOT "welcome" |
| Carousels | Horizontal scroll with arrow navigation for Connect Groups and Highlights (15+ event photos) |
| Pastor feature | Dedicated section for Ps. Philip Mantofa with portrait — leadership as brand |
| Affiliations | Logo grid showing partner organizations — credibility through association |
| Location services | Google Maps integration with geolocation — functional, not decorative |
| Footer | Mega-menu structure organized by category (Church, Service, Connect Group, Media, Give, Mission, Ministry) |

**Key insight:** GMS doesn't try to be "pretty" — it tries to be **functional at scale.** The design is clean, professional, and information-dense. Carousels with 15+ items, 7-language support, and app download CTAs all communicate "this is an institution" not "this is a nice website."

### 3.3 Techniques Worth Borrowing

1. **Vision statement as hero text** — not "Welcome to our church" but the annual vision/theme. This makes the hero feel alive and current, not evergreen-template.
2. **Horizontal scroll carousels** for event highlights — shows activity density without overwhelming vertical scroll.
3. **Repeating/motion text** in hero — text appears to repeat, suggesting an emphasis/motion animation effect.
4. **Social proof through numbers** — explicit member counts, church counts, mission targets.

---

## 4. GBI GATSU — Leadership-Centric Design

### 4.1 Design Approach

GBI GATSU (gbigatsu.id) takes a different approach from both template sites and GMS — it's **leadership-and-doctrine-centric.**

| Element | Treatment |
|---------|-----------|
| Color | Dark base `#343a40` (professional gray) for footer/banners. Minimal palette. Monochromatic navy branding |
| Typography | Sans-serif primary, clear hierarchy, generous line spacing |
| Layout | Full-bleed hero sections with modular grid for events and ministries |
| Hero | **Video prominence** — embedded video player with registration CTA. Modal dialog system |
| Navigation | **Mega menu** with nested categories (Gereja Kami, Pelayanan, Materi) — deep content structure |

### 4.2 Unique Patterns

1. **Geographic tabs:** Content filtered by continent (Indonesia, Asia, Australia, Europe, America, Africa) — communicates global reach through UI pattern, not just text.
2. **Theological positioning pages:** VOP Articles, dedicated Theological Position sections — unusual for a church website, signals intellectual seriousness.
3. **Doctrine as design element:** "Pentakosta Ketiga" presented as a numbered 5-point belief statement — structured content, not prose.
4. **Multi-format content taxonomy:** Devotionals, Supplements, Book Reviews, COOL materials, JC & Youth, UMAS — shows content depth through categorization.
5. **Partnership ecosystem showcase:** Logo grid of affiliated organizations — credibility through network visualization.

### 4.3 Techniques Worth Borrowing

1. **Video-first hero** — video player as the primary hero element, not just a background.
2. **Structured doctrine/beliefs** — numbered, scannable, not hidden in paragraphs.
3. **Content depth signaling** through mega-menu categories — shows visitors there's substance behind the homepage.

---

## 5. SYNTHESIS: What Specifically Makes Premium vs. Generic

### 5.1 Typography Techniques (Most Impactful)

| Technique | Generic Default | Premium Treatment | Impact Level |
|-----------|----------------|-------------------|-------------|
| Font pairing | One sans-serif everywhere | Serif display + sans body (Judson + Outfit) | **Critical** — single biggest differentiator |
| Scale ratio | 2:1 (32px / 16px) | 3:1+ (50px / 16px) | **High** — creates drama |
| Letter-spacing on headings | Default (0) | Tight negative (`-0.03em` to `-0.06em`) | **High** — feels editorial |
| Italic serif at large scale | Never used | Judson 400 italic for hero/display | **High** — feels calligraphic, warm |
| Line-height for body | 1.4-1.5 | 1.6em (Faith) or match with tight heading line-height 1.1 | **Medium** — luxury breathing room |
| Uppercase section labels | Bold, same font | Separate sans, `2px` letter-spacing, lighter weight | **Medium** — creates clear hierarchy |

### 5.2 Color Techniques

| Technique | Generic Default | Premium Treatment | Impact Level |
|-----------|----------------|-------------------|-------------|
| Background temperature | Pure white `#fff` | Warm cream `#f9f7f5` or `#f6f3f0` | **Critical** — warm = welcoming, white = clinical |
| Text color | Pure black `#000` | Dark brown `#231f1b` or near-black | **High** — softer contrast, easier on eyes |
| Section alternation | All same background | 7% luminance shift (`#fff` ↔ `#ededed`) | **High** — creates rhythm without harsh contrast |
| Accent discipline | 3-4 bright colors | ONE strong accent (teal `#2a967d`) or warm muted family | **High** — focus vs. noise |
| Secondary text | Neutral gray `#666` | Taupe/warm gray `#615c57` | **Medium** — harmonizes with warm scheme |
| Hero overlay | Solid color at 50% opacity | `brightness(0.77) + blur(10px)` | **High** — atmospheric vs. flat |
| Text glow | Drop shadow or none | Soft halo `text-shadow: 0 0 50px` | **Medium** — luminous, ethereal quality |

### 5.3 Spacing Techniques

| Technique | Generic Default | Premium Treatment | Impact Level |
|-----------|----------------|-------------------|-------------|
| Section gap | 60-80px | 150-200px | **Critical** — single biggest layout differentiator |
| Horizontal padding | 16-24px | 100px desktop, 60px tablet, 25px mobile | **High** — content floats in frame |
| Card internal padding | 16-24px | 40px | **High** — content doesn't feel cramped |
| Container max-width | 1200px | 1160px content / 1440px full | **Medium** — similar but considered |
| Section bottom breathing | Same padding top and bottom | 300px bottom padding on key sections | **Medium** — emotional weight settling |
| Column ratios | 50/50 | 56/44 (`flex: 1.3` vs `flex: 1`) | **Medium** — breaks symmetry |

### 5.4 Layout Techniques

| Technique | Generic Default | Premium Treatment | Impact Level |
|-----------|----------------|-------------------|-------------|
| Content stacking | Scroll through sections | Sticky stacking cards (incrementing `top` values) | **Critical** — reward for scrolling |
| Image aspect ratios | Single ratio (16:9 or square) | Mixed ratios (0.75:1, 1.33:1, 1.45:1, 1.625:1) | **High** — magazine-like composition |
| Hero alignment | Centered | Left-aligned with 540px max-width (Faith) or centered with asymmetric image anchor (Edify) | **Medium** — breaks template feel |
| Grid patterns | Equal columns | Weighted flex ratios (1:1.3) | **Medium** — subtle asymmetry |
| Image corners | Square or small radius | 15-30px radius with `-5px spread` shadows | **Medium** — soft but not bubbly |

### 5.5 Atmospheric Techniques

| Technique | Generic Default | Premium Treatment | Impact Level |
|-----------|----------------|-------------------|-------------|
| Hero background | Static image, color overlay | Blur(10px) + brightness(0.77) + 110vh overflow | **High** — atmospheric, extends beyond viewport |
| Shadow style | `box-shadow: 0 2px 4px rgba(0,0,0,0.1)` | `box-shadow: 0 0 10px -5px #000` (inward spread) | **Medium** — lifted paper vs. generic shadow |
| White text on images | White + drop shadow | White + `text-shadow: 0 0 50px` soft glow | **Medium** — luminous vs. stamped |
| Background depth | Flat colors | Radial gradient with transparency (`#36302ba8`) | **Medium** — vignette warmth |
| Section transitions | Hard color change | Subtle luminance shift + generous gap | **High** — smooth rhythm |

### 5.6 Navigation Techniques

| Technique | Generic Default | Premium Treatment |
|-----------|----------------|-------------------|
| Navbar | Solid background from start | Transparent → solid with blur on scroll |
| Height | 56-60px | 72px (Faith) — taller = more presence |
| Hamburger | Three equal bars | Two bars at asymmetric positions (62.5%/37.5%) |
| State indicators | Underline or bold | 8px circular dots |
| CTA button | Standard button | Distinct from nav links (accent-colored, rounded) |

---

## 6. ACTIONABLE RULES FOR BEC LANDING PAGE

Based on this analysis, these are the non-negotiable techniques ordered by impact:

### Must-Have (Critical Impact)

1. **Judson serif headings** at 48-72px with `-0.03em` letter-spacing. The serif/sans pairing IS the design.
2. **Warm cream background** (`oklch(0.965 0.012 75)` — already in BEC palette, good). Never pure white.
3. **150-200px section gaps.** This is the #1 spacing technique. Do not compress.
4. **Sticky stacking cards** for the 8 activities. Incrementing `top` values (+20px), 500px height, 25px radius, 150px gap. Dark backgrounds per activity.
5. **Hero with blur+dim background:** `filter: brightness(0.77) blur(10px)` on background image, white text with `text-shadow: 0 0 50px rgba(0,0,0,0.5)`.

### Should-Have (High Impact)

6. **One accent color dominance.** BEC uses deep blue (`oklch(0.370 0.060 250)`) — keep it as the ONLY saturated color. Activity card accents are scoped to their dark cards only.
7. **Section background alternation.** Alternate between `--background` (warm cream) and `--secondary` (light warm gray) — a ~7% luminance shift.
8. **100px horizontal padding** on desktop sections. Content should float.
9. **Asymmetric column layouts.** Use `flex: 1.3` vs `flex: 1` for two-column sections (Tentang Kami, Jadwal).
10. **Mixed image aspect ratios.** Don't use the same ratio everywhere. Portrait (0.75:1) for featured, landscape (1.45:1) for context shots.
11. **Dark brown text** — BEC already uses `oklch(0.250 0.015 60)` which is dark brownish, not pure black. Keep it.
12. **Italic Judson** for emotional/spiritual headings (e.g., "Rumah Bagi Semua").

### Nice-to-Have (Medium Impact)

13. **40px card internal padding.** Generous, not cramped.
14. **15-30px image border-radius** with `box-shadow: 0 0 10px -5px #000`.
15. **Uppercase section labels** in Plus Jakarta Sans with `2px` letter-spacing.
16. **Transparent → blur nav** on scroll.
17. **300px bottom padding** on hero and kegiatan sections for breathing room.
18. **Text glow** on hero heading: `text-shadow: 0 0 65px rgba(255,255,255,0.75)`.

### Borrowed from Indonesian Church Sites

19. **Vision/theme as hero element** (from GMS) — if BEC has an annual theme, feature it.
20. **Structured numbered content** (from GBI GATSU) — the 8 Pelayanan Jemaat services as "01"-"08" numbered cards, not a bullet list.
21. **Activity density visualization** — show the breadth of activities through card count and visual variety, signaling "this is an active community."

---

## 7. ANTI-PATTERNS TO AVOID

These are patterns commonly seen in AI-generated or generic church websites that immediately signal "template":

| Anti-Pattern | Why It Feels Generic | What To Do Instead |
|-------------|---------------------|-------------------|
| Pure white background | Clinical, cold, institutional | Warm cream `#f9f7f5` - `#f6f3f0` |
| All sans-serif typography | Every SaaS landing page looks like this | Serif display + sans body |
| Equal-width columns (50/50) | Perfectly symmetrical = obviously grid-based | 56/44 or 60/40 splits |
| Same image aspect ratio everywhere | Repetitive, uncurated | Mix 3-4 ratios intentionally |
| 60px section gaps | Content feels rushed, no breathing room | 150-200px minimum |
| Solid color hero overlay | Flat, dated, obvious | Blur + brightness filter |
| Drop shadows on text | 2010s web design | Soft glow (`text-shadow: 0 0 50px`) |
| 3+ saturated accent colors | Visual noise, no hierarchy | ONE accent color + grayscale |
| Small card padding (16px) | Content touches edges, feels cheap | 40px padding |
| Stock photo hero without treatment | Instantly recognizable as stock | Blur, dim, or crop uniquely |
| "Welcome to Our Church" hero text | Every church site ever | Vision statement, service time, or emotional phrase |
| Hamburger with 3 equal bars | Default, unconsidered | 2 bars or custom icon |
| Underline nav state | Browser default | Dot indicator or accent color |
| Cards with identical sizing | Grid template, not design | Varied sizes, featured cards larger |
| Bright blue `#0066ff` accent | Default link color energy | Muted teal, warm blue, or contextual accent |

---

## 8. CSS REFERENCE VALUES (Copy-Paste Ready)

```css
/* === EDIFY-CONFIRMED VALUES === */

/* Hero background treatment */
.hero-bg {
  filter: brightness(0.77) blur(10px);
  height: 110vh; /* extends beyond viewport */
}

/* Hero text glow */
.hero-heading {
  text-shadow: 0 0 50px rgba(0, 0, 0, 0.5);
  /* OR for white glow variant: */
  text-shadow: 0 0 65px rgba(255, 255, 255, 0.75);
}

/* Subtle body text shadow */
.body-text-shadow {
  text-shadow: 0 0 33px rgba(0, 0, 0, 0.09);
}

/* Card styling */
.premium-card {
  border-radius: 25px;
  padding: 40px;
  box-shadow: 0 0 10px -5px #000;
}

/* Image treatment */
.premium-image {
  border-radius: 15px; /* or 30px for featured */
  box-shadow: 0 0 10px -5px #000;
}

/* Sticky stacking cards */
.sticky-card {
  position: sticky;
  height: 500px;
  border-radius: 25px;
}
.sticky-card:nth-child(1) { top: 250px; }
.sticky-card:nth-child(2) { top: 270px; }
.sticky-card:nth-child(3) { top: 290px; }
.sticky-card:nth-child(4) { top: 310px; }
.sticky-card:nth-child(5) { top: 330px; }
.sticky-card:nth-child(6) { top: 350px; }
.sticky-card:nth-child(7) { top: 370px; }
.sticky-card:nth-child(8) { top: 390px; }

/* Outer container for sticky cards */
.sticky-container {
  display: flex;
  flex-direction: column;
  gap: 150px;
}

/* Section spacing */
.section {
  padding: 100px 100px 150px; /* top horizontal bottom */
}

/* Typography */
.heading-display {
  font-family: 'Judson', serif;
  font-size: 50px;
  letter-spacing: -0.03em;
  line-height: 1.1;
}

.heading-italic {
  font-family: 'Judson', serif;
  font-style: italic;
  font-weight: 400;
  letter-spacing: -0.06em;
}

.section-label {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-weight: 500;
}

.body-text {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 16px;
  letter-spacing: -0.01em;
  line-height: 1.6;
}

/* === FAITH-CONFIRMED VALUES === */

/* Warm palette */
:root {
  --faith-bg: #f9f7f5;
  --faith-card: #f6f3f0;
  --faith-text: #231f1b;
  --faith-muted: #615c57;
  --faith-accent: #525fbd;
}

/* Navigation */
.nav-premium {
  height: 72px;
  padding: 16px;
  position: fixed;
  z-index: 6;
}

/* Radial gradient hero */
.hero-gradient {
  background: radial-gradient(
    circle at center,
    #36302ba8,
    #312c2682
  );
}
```

---

*Analysis complete. The through-line across all premium church sites: restraint in color, generosity in space, drama in typography, and atmosphere in imagery. The gap between "template" and "premium" is not about adding more — it's about being more intentional with less.*
