import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'GBI Baranangsiang Evening Church';
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
          backgroundColor: '#f5f0e8',
          padding: '60px 80px',
          gap: 0,
        }}
      >
        {/* Logo */}
        <img
          src={`${siteUrl}/logo.png`}
          width={560}
          height={180}
          style={{ objectFit: 'contain' }}
        />

        {/* Divider */}
        <div
          style={{
            marginTop: 40,
            width: 60,
            height: 2,
            backgroundColor: '#c8b89a',
          }}
        />

        {/* Tagline */}
        <div
          style={{
            marginTop: 28,
            fontFamily: 'Georgia, serif',
            fontSize: 26,
            color: '#6b5a48',
            textAlign: 'center',
            letterSpacing: '0.05em',
          }}
        >
          Ibadah setiap Minggu · 17:00 WIB · Bandung
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
