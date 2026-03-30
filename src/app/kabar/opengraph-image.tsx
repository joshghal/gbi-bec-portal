import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Kabar Terbaru — GBI BEC';
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
        <img
          src={`${siteUrl}/logo.png`}
          width={280}
          height={90}
          style={{ objectFit: 'contain' }}
        />
        <div
          style={{
            marginTop: 32,
            width: 60,
            height: 2,
            backgroundColor: '#c8b89a',
          }}
        />
        <div
          style={{
            marginTop: 28,
            fontSize: 40,
            fontWeight: 700,
            color: '#2a2520',
            textAlign: 'center',
          }}
        >
          Kabar Terbaru
        </div>
        <div
          style={{
            marginTop: 16,
            fontSize: 20,
            color: '#6b5a48',
            textAlign: 'center',
            letterSpacing: '0.05em',
          }}
        >
          Berita & Pengumuman Gereja
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
