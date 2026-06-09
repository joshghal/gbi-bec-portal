import { ImageResponse } from 'next/og';
import { readFileSync } from 'fs';
import { join } from 'path';
import { formatDateFull } from '../format-date';
import { generateBackground, uploadPoster } from './background';

/**
 * Catatan-khotbah poster generator (Style A cover).
 *
 * Pipeline:
 *   1. generateBackground()  -> Gemini 2.5 Flash Image, a cinematic worship scene (no text)
 *   2. composePoster()       -> next/og (Satori) overlays the brand text at 1920x1080
 *   3. uploadPoster()        -> Cloudinary unsigned preset -> optimized delivery URL
 *
 * All steps run server-side (Node runtime) so this works on Vercel.
 */

const W = 1920;
const H = 1080;

// Fonts are bundled in ./fonts and shipped via outputFileTracingIncludes (next.config.ts).
const FONT_DIR = join(process.cwd(), 'src/lib/poster/fonts');
let _fonts: { cormorantItalic: Buffer; jakartaMedium: Buffer; jakartaSemiBold: Buffer } | null = null;
function fonts() {
  if (!_fonts) {
    _fonts = {
      cormorantItalic: readFileSync(join(FONT_DIR, 'CormorantGaramond-SemiBoldItalic.ttf')),
      jakartaMedium: readFileSync(join(FONT_DIR, 'PlusJakartaSans-Medium.ttf')),
      jakartaSemiBold: readFileSync(join(FONT_DIR, 'PlusJakartaSans-SemiBold.ttf')),
    };
  }
  return _fonts;
}

interface PosterText {
  serviceType: string; // e.g. "Ibadah Raya"
  speaker: string;     // e.g. "Ps. Franky Kuncoro"
  date: string;        // YYYY-MM-DD
}

/** Overlay the Style-A brand text on the background and return a PNG buffer. */
export async function composePoster(bg: Buffer, t: PosterText): Promise<Buffer> {
  const f = fonts();
  const bgUri = `data:image/png;base64,${bg.toString('base64')}`;
  const dateLabel = formatDateFull(t.date); // "Minggu, 7 Juni 2026"

  const scriptStyle = {
    fontFamily: 'Cormorant Garamond',
    fontStyle: 'italic' as const,
    fontWeight: 600,
    fontSize: 158,
    lineHeight: 0.98,
    color: '#fdfbf5',
    textShadow: '0 6px 30px rgba(0,0,0,0.55)',
  };

  const element = (
    <div style={{ position: 'relative', display: 'flex', width: W, height: H, backgroundColor: '#000' }}>
      {/* background */}
      <img src={bgUri} width={W} height={H} style={{ position: 'absolute', top: 0, left: 0, width: W, height: H, objectFit: 'cover' }} />
      {/* scrim for text contrast */}
      <div
        style={{
          position: 'absolute', top: 0, left: 0, width: W, height: H, display: 'flex',
          backgroundImage:
            'linear-gradient(to bottom, rgba(8,6,4,0.64) 0%, rgba(8,6,4,0.12) 26%, rgba(8,6,4,0.10) 58%, rgba(8,6,4,0.72) 100%)',
        }}
      />
      {/* text frame */}
      <div
        style={{
          position: 'absolute', top: 0, left: 0, width: W, height: H,
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center',
          padding: '78px 0 96px', textAlign: 'center',
        }}
      >
        <div
          style={{
            fontFamily: 'Plus Jakarta Sans', fontWeight: 500, fontSize: 27, letterSpacing: 11,
            textTransform: 'uppercase', color: 'rgba(247,241,231,0.94)', textShadow: '0 2px 10px rgba(0,0,0,0.6)',
          }}
        >
          BARANANGSIANG EVENING CHURCH
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'center', alignItems: 'center' }}>
          <div style={scriptStyle}>Catatan Khotbah</div>
          <div style={scriptStyle}>{t.serviceType}</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {t.speaker ? (
            <div style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 600, fontSize: 35, letterSpacing: 6, textTransform: 'uppercase', color: '#fbf6ec', textShadow: '0 2px 10px rgba(0,0,0,0.65)', marginBottom: 14 }}>
              {t.speaker}
            </div>
          ) : null}
          <div style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 500, fontSize: 27, letterSpacing: 6, textTransform: 'uppercase', color: 'rgba(243,236,225,0.86)', textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}>
            {dateLabel}
          </div>
        </div>
      </div>
    </div>
  );

  const resp = new ImageResponse(element, {
    width: W,
    height: H,
    fonts: [
      { name: 'Cormorant Garamond', data: f.cormorantItalic, weight: 600, style: 'italic' },
      { name: 'Plus Jakarta Sans', data: f.jakartaMedium, weight: 500, style: 'normal' },
      { name: 'Plus Jakarta Sans', data: f.jakartaSemiBold, weight: 600, style: 'normal' },
    ],
  });
  return Buffer.from(await resp.arrayBuffer());
}

/** Full pipeline: theme + speaker + date -> hosted poster URL. */
export async function generateKhotbahPoster(opts: {
  theme: string;
  serviceType: string;
  speaker: string;
  date: string;
}): Promise<string> {
  const bg = await generateBackground(opts.theme);
  const png = await composePoster(bg, { serviceType: opts.serviceType, speaker: opts.speaker, date: opts.date });
  return uploadPoster(png);
}

export { generateBackground, uploadPoster };
