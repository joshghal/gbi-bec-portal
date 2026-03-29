import { ImageResponse } from 'next/og';
import { getAdminFirestore } from '@/lib/firebase-admin';

export const runtime = 'nodejs';
export const alt = 'Kabar Terbaru — GBI BEC';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

function getSiteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'https://gbibec.id';
}

export default async function OgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const siteUrl = getSiteUrl();

  const db = getAdminFirestore();
  const snapshot = await db
    .collection('updates')
    .where('slug', '==', slug)
    .where('published', '==', true)
    .limit(1)
    .get();

  const update = snapshot.empty ? null : snapshot.docs[0].data();
  const title = update?.title ?? 'Kabar Terbaru';
  const category = update?.category ?? '';
  const date = update?.date ?? '';

  const formattedDate = date
    ? new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';

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
          width={280}
          height={90}
          style={{ objectFit: 'contain' }}
        />

        {/* Divider */}
        <div
          style={{
            marginTop: 32,
            width: 60,
            height: 2,
            backgroundColor: '#c8b89a',
          }}
        />

        {/* Category badge */}
        {category && (
          <div
            style={{
              marginTop: 24,
              fontSize: 16,
              color: '#6b5a48',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              fontWeight: 600,
            }}
          >
            {category}
          </div>
        )}

        {/* Title */}
        <div
          style={{
            marginTop: 16,
            fontSize: title.length > 60 ? 32 : 40,
            fontWeight: 700,
            color: '#2a2520',
            textAlign: 'center',
            lineHeight: 1.3,
            maxWidth: '90%',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {title}
        </div>

        {/* Date */}
        {formattedDate && (
          <div
            style={{
              marginTop: 20,
              fontSize: 18,
              color: '#6b5a48',
              letterSpacing: '0.02em',
            }}
          >
            {formattedDate}
          </div>
        )}
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
