import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { stripHtml } from '@/lib/slug';
import { formatDate, formatDateLong } from '@/lib/format-date';
import { Button } from '@/components/ui/button';

export const revalidate = 3600;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gbibec.id';

export const metadata: Metadata = {
  title: 'Kabar Terbaru',
  description: 'Kabar gereja dan pengumuman GBI BEC — berita gereja Bandung terbaru dari GBI Baranangsiang Evening Church Sukawarna. Update gereja, jadwal ibadah, dan kegiatan.',
  keywords: ['kabar gereja', 'pengumuman GBI BEC', 'berita gereja Bandung', 'GBI Baranangsiang', 'update gereja'],
  alternates: { canonical: '/kabar' },
  openGraph: {
    title: 'Kabar Terbaru',
    description: 'Kabar terbaru dan pengumuman dari GBI BEC Sukawarna, Bandung.',
    url: `${siteUrl}/kabar`,
    type: 'website',
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
};

interface Update {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  date: string;
  color: string;
  imageUrl?: string;
  pinned?: boolean;
  published: boolean;
}

async function getPublishedUpdates(): Promise<Update[]> {
  try {
    const db = getAdminFirestore();
    const snapshot = await db
      .collection('updates')
      .where('published', '==', true)
      .orderBy('date', 'desc')
      .get();

    return snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() } as Update))
      .filter((u) => u.slug)
      .sort((a, b) => {
        // Pinned items always first
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return 0; // date order already from Firestore
      });
  } catch (error) {
    console.error('Failed to fetch updates:', error);
    return [];
  }
}

/* ── Card variants ────────────────────────────────────────────── */

function FeaturedCard({ update }: { update: Update }) {
  return (
    <Link href={`/kabar/${update.slug}`} className="group block col-span-full lg:col-span-2 lg:row-span-2">
      <article className="h-full rounded-2xl overflow-hidden bg-card hover:shadow-lg transition-all duration-300 flex flex-col">
        {/* Image — eager load (above the fold) */}
        {update.imageUrl && (
          <div className="shrink-0 overflow-hidden bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={update.imageUrl}
              alt={update.title}
              className="w-full h-auto max-h-[400px] object-contain"
            />
          </div>
        )}
        {/* Text below */}
        <div className="p-6 lg:p-8 flex flex-col gap-3 flex-1">
          <div className="flex items-center gap-3">
            <span className="text-[10px] uppercase tracking-[0.2em] font-semibold" style={{ color: update.color }}>
              {update.category}
            </span>
            <span className="text-[10px] text-muted-foreground/40 font-mono">
              {formatDateLong(update.date)}
            </span>
          </div>
          <h2 className="font-serif text-2xl lg:text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground group-hover:opacity-65 transition-opacity">
            {update.title}
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 max-w-xl">
            {stripHtml(update.excerpt)}
          </p>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground/35 group-hover:text-muted-foreground/70 transition-colors mt-auto pt-2">
            Selengkapnya
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>
      </article>
    </Link>
  );
}

function ImageCard({ update }: { update: Update }) {
  return (
    <Link href={`/kabar/${update.slug}`} className="group block">
      <article className="h-full rounded-xl overflow-hidden bg-card hover:shadow-lg transition-all duration-300 flex flex-col">
        {/* Image — gradient + blur fade */}
        {update.imageUrl && (
          <div className="shrink-0 overflow-hidden bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={update.imageUrl}
              alt={update.title}
              loading="lazy"
              decoding="async"
              className="w-full h-auto max-h-[220px] object-contain"
            />
          </div>
        )}
        <div className="p-4 flex flex-col gap-2 flex-1">
          <div className="flex items-center gap-2.5">
            <span className="text-[9px] uppercase tracking-[0.2em] font-semibold" style={{ color: update.color }}>
              {update.category}
            </span>
            <span className="text-[9px] text-muted-foreground/35 font-mono">
              {formatDate(update.date)}
            </span>
          </div>
          <h3 className="font-serif text-base font-bold leading-snug tracking-[-0.015em] text-foreground group-hover:opacity-65 transition-opacity line-clamp-2">
            {update.title}
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mt-auto">
            {stripHtml(update.excerpt)}
          </p>
        </div>
      </article>
    </Link>
  );
}

function TextCard({ update }: { update: Update }) {
  return (
    <Link href={`/kabar/${update.slug}`} className="group block">
      <article className="h-full rounded-xl bg-card hover:shadow-lg transition-all duration-300 p-5 flex flex-col gap-2.5">
        <div className="flex items-center gap-2.5">
          <span className="text-[9px] uppercase tracking-[0.2em] font-semibold" style={{ color: update.color }}>
            {update.category}
          </span>
          <span className="text-[9px] text-muted-foreground/35 font-mono">
            {formatDate(update.date)}
          </span>
        </div>
        <h3 className="font-serif text-lg font-bold leading-snug tracking-[-0.02em] text-foreground group-hover:opacity-65 transition-opacity">
          {update.title}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mt-auto">
          {stripHtml(update.excerpt)}
        </p>
        <span className="text-xs text-muted-foreground/30 font-mono mt-1">
          {formatDateLong(update.date)}
        </span>
      </article>
    </Link>
  );
}

/* ── Page ──────────────────────────────────────────────────────── */

export default async function KabarPage() {
  const updates = await getPublishedUpdates();

  const featured = updates[0];
  const rest = updates.slice(1);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm px-4 sm:px-6 py-3 flex items-center gap-3 sticky top-0 z-20">
        <Link href="/">
          <Button variant="ghost" size="icon" className="shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="BEC" width={32} height={32} className="w-8 h-8 object-contain" />
          <div>
            <h1 className="font-semibold text-sm leading-tight">Kabar Terbaru</h1>
            <p className="text-[10px] text-muted-foreground">GBI BEC Sukawarna</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 lg:py-12">
        {updates.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground text-sm">
            Belum ada kabar terbaru.
          </div>
        ) : (
          <>
            {/* Section title */}
            <div className="mb-8">
              <p className="text-[11px] tracking-[0.2em] text-muted-foreground font-medium uppercase">
                Update
              </p>
              <h2 className="mt-1 font-serif text-3xl lg:text-4xl font-bold tracking-[-0.03em] leading-[1.1]">
                Kabar Terbaru
              </h2>
              <div className="mt-3 w-[60px] h-px bg-primary/30" />
            </div>

            {/* Bento grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 lg:gap-4 auto-rows-auto">
              {/* Featured — spans 2 cols + 2 rows on desktop */}
              {featured && <FeaturedCard update={featured} />}

              {/* Rest — alternate between image and text cards */}
              {rest.map((update) =>
                update.imageUrl ? (
                  <ImageCard key={update.id} update={update} />
                ) : (
                  <TextCard key={update.id} update={update} />
                )
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
