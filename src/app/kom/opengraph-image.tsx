import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Materi KOM — GBI Baranangsiang Evening Church';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

function getSiteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'https://gbibec.id';
}

export default async function OgImage() {
  const siteUrl = getSiteUrl();

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
          backgroundColor: '#1a1410',
          padding: '60px 80px',
        }}
      >
        <img
          src={`${siteUrl}/logo.png`}
          width={480}
          height={155}
          style={{ objectFit: 'contain', filter: 'brightness(0) invert(1)', opacity: 0.9 }}
        />
        <div style={{ marginTop: 36, width: 60, height: 2, backgroundColor: '#c8a96a' }} />
        <div
          style={{
            marginTop: 28,
            fontFamily: 'Georgia, serif',
            fontSize: 32,
            fontWeight: 700,
            color: '#e8d5a8',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}
        >
          Materi KOM
        </div>
        <div
          style={{
            marginTop: 12,
            fontFamily: 'system-ui, sans-serif',
            fontSize: 20,
            color: '#8a7a60',
            textAlign: 'center',
          }}
        >
          Kehidupan Orientasi Melayani · 4 Level · 82 Sesi · Gratis
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
