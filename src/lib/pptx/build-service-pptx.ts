'use client';

// Client-side .pptx generation that reproduces the church's real deck:
//   fixed slides  = full-bleed images (their designed graphics)
//   song slides   = the song-template background + white centered lyrics
// pptxgenjs (~1MB) is dynamically imported only when the admin clicks Download.

import type { ServiceSet } from '@/lib/service-slides/types';

const WHITE = 'FFFFFF';
const DARK = '1A1714'; // fallback song bg
const CREAM = 'FDF6E8'; // fallback fixed bg
const INK = '1A1714';
const LYRIC_FONT = 'Arial Rounded MT Bold'; // matches the deck's song font

const W = 13.333; // LAYOUT_WIDE inches
const H = 7.5;

/** Multi-line text → breakLine runs so PowerPoint keeps the line breaks. */
function lines(text: string) {
  return text.split('\n').map((line) => ({ text: line, options: { breakLine: true } }));
}

/** Pick a lyric font size that fits (more/longer lines → smaller). Deck uses ~32pt. */
function lyricFontSize(text: string): number {
  const ls = text.split('\n');
  const longest = ls.reduce((m, l) => Math.max(m, l.length), 1);
  if (ls.length <= 6 && longest <= 40) return 32;
  if (ls.length <= 10 && longest <= 50) return 26;
  return 21;
}

/** Fetch a (same-origin or CORS-enabled) image → data URI for embedding. */
async function toDataUrl(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`image ${res.status}`);
  const blob = await res.blob();
  return await new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onloadend = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
}

function sanitize(name: string): string {
  return (name || '')
    .replace(/[^\w\s.-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

/** Build the full presentation and trigger a browser download. */
export async function buildServicePptx(set: ServiceSet, songBackgroundUrl: string): Promise<void> {
  const PptxGenJSCtor = (await import('pptxgenjs')).default;
  const pptx = new PptxGenJSCtor();
  pptx.layout = 'LAYOUT_WIDE'; // 13.333 × 7.5in (16:9)
  pptx.title = set.title;
  pptx.author = 'GBI BEC Portal';

  // Cache image data URIs (song bg is reused across every lyric slide).
  const cache = new Map<string, string | null>();
  const getImg = async (url?: string): Promise<string | null> => {
    if (!url) return null;
    if (cache.has(url)) return cache.get(url)!;
    let data: string | null = null;
    try {
      data = await toDataUrl(url);
    } catch {
      data = null;
    }
    cache.set(url, data);
    return data;
  };

  const songBg = await getImg(songBackgroundUrl);

  for (const item of set.items) {
    if (item.type === 'fixed') {
      const slide = pptx.addSlide();
      const img = await getImg(item.imageUrl);
      if (img) {
        slide.addImage({ data: img, x: 0, y: 0, w: W, h: H });
      } else {
        // Fallback if the image is unreachable — show the label so nothing is silently blank.
        slide.background = { color: CREAM };
        slide.addText(item.label || '', {
          x: 0.8, y: 3, w: 11.73, h: 1.5,
          align: 'center', valign: 'middle', fontFace: 'Georgia', fontSize: 40, bold: true, color: INK,
        });
      }
    } else {
      const texts = item.slides.length ? item.slides : [item.title];
      for (const text of texts) {
        const slide = pptx.addSlide();
        if (songBg) slide.addImage({ data: songBg, x: 0, y: 0, w: W, h: H });
        else slide.background = { color: DARK };
        slide.addText(lines(text), {
          x: 0.7, y: 0.5, w: 11.93, h: 6.5,
          align: 'center', valign: 'middle',
          fontFace: LYRIC_FONT, fontSize: lyricFontSize(text), bold: true, color: WHITE,
          lineSpacingMultiple: 1.12,
          shadow: { type: 'outer', color: '000000', blur: 4, offset: 2, angle: 90, opacity: 0.7 },
        });
      }
    }
  }

  const fileName = `${sanitize(set.title) || 'ibadah'}.pptx`;
  await pptx.writeFile({ fileName });
}
