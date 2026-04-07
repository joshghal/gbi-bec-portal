import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'KOM — GBI Baranangsiang Evening Church';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

function getSiteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'https://gbibec.id';
}

const KOM_META: Record<string, { title: string; subtitle: string; sessions: number; bg: string; accent: string }> = {
  '100': { title: 'Pencari Tuhan',  subtitle: 'The Seeker',   sessions: 27, bg: '#0d1f14', accent: '#4ade80' },
  '200': { title: 'Pelayan Tuhan',  subtitle: 'The Servant',  sessions: 23, bg: '#0d1628', accent: '#60a5fa' },
  '300': { title: 'Prajurit Tuhan', subtitle: 'The Soldier',  sessions: 16, bg: '#1f0d0d', accent: '#f87171' },
  '400': { title: 'Penilik Tuhan',  subtitle: 'The Steward',  sessions: 16, bg: '#111111', accent: '#fbbf24' },
};

export default async function OgImage({ params }: { params: Promise<{ level: string }> }) {
  const { level } = await params;
  const siteUrl = getSiteUrl();
  const meta = KOM_META[level] ?? { title: 'Kehidupan Orientasi Melayani', subtitle: '', sessions: 0, bg: '#1a1410', accent: '#c8a96a' };

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: meta.bg,
          padding: '60px 80px',
        }}
      >
        <img
          src={`${siteUrl}/logo.png`}
          width={360}
          height={116}
          style={{ objectFit: 'contain', filter: 'brightness(0) invert(1)', opacity: 0.6 }}
        />
        <div style={{ marginTop: 32, width: 40, height: 2, backgroundColor: meta.accent, opacity: 0.6 }} />
        <div
          style={{
            marginTop: 24,
            fontFamily: 'system-ui, sans-serif',
            fontSize: 16,
            fontWeight: 600,
            color: meta.accent,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            opacity: 0.8,
          }}
        >
          KOM {level}
        </div>
        <div
          style={{
            marginTop: 12,
            fontFamily: 'Georgia, serif',
            fontSize: 48,
            fontWeight: 700,
            color: '#ffffff',
            letterSpacing: '-0.02em',
          }}
        >
          {meta.title}
        </div>
        <div
          style={{
            marginTop: 8,
            fontFamily: 'Georgia, serif',
            fontSize: 22,
            fontStyle: 'italic',
            color: '#ffffff',
            opacity: 0.4,
          }}
        >
          {meta.subtitle}
        </div>
        <div
          style={{
            marginTop: 20,
            fontFamily: 'system-ui, sans-serif',
            fontSize: 16,
            color: '#ffffff',
            opacity: 0.3,
          }}
        >
          {meta.sessions} sesi · Kurikulum Nasional GBI
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
