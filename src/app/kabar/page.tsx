import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import { FieldPath } from 'firebase-admin/firestore';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { Button } from '@/components/ui/button';
import { FeaturedCard, type Update } from './_components/cards';
import { KabarGrid } from './_components/kabar-grid';

export const revalidate = 3600;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gbibec.id';

// Initial SSR page size. Featured (2x2 on lg) + ~11 rest cards = clean first
// viewport that's still cacheable. Client component takes over from here.
const INITIAL_PAGE_SIZE = 12;

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

interface KabarPageData {
  featured: Update | null;
  rest: Update[];
  nextCursor: { date: string; id: string } | null;
}

async function getInitialKabarPage(): Promise<KabarPageData> {
  try {
    const db = getAdminFirestore();

    // Fetch first page (limit+1 for hasMore detection) + the pinned doc in
    // parallel. The pinned query uses a single equality so no composite index
    // is required; we filter for `published` in JS.
    const [pageSnap, pinnedSnap] = await Promise.all([
      db
        .collection('updates')
        .where('published', '==', true)
        .orderBy('date', 'desc')
        .orderBy(FieldPath.documentId(), 'desc')
        .limit(INITIAL_PAGE_SIZE + 1)
        .get(),
      db.collection('updates').where('pinned', '==', true).limit(2).get(),
    ]);

    const allFetched: Update[] = pageSnap.docs.map(
      (d) => ({ id: d.id, ...d.data() } as Update),
    );
    const hasMore = allFetched.length > INITIAL_PAGE_SIZE;
    const pageItems = hasMore ? allFetched.slice(0, INITIAL_PAGE_SIZE) : allFetched;

    const pinned: Update | null =
      pinnedSnap.docs
        .map((d) => ({ id: d.id, ...d.data() } as Update))
        .find((u) => u.published) ?? null;

    let featured: Update | null;
    let rest: Update[];

    if (pinned) {
      featured = pinned;
      rest = pageItems.filter((u) => u.id !== pinned.id);
    } else {
      featured = pageItems[0] ?? null;
      rest = pageItems.slice(1);
    }

    // Cursor is the LAST item in pageItems (date, id). On the client, items
    // already shown (featured + rest) are added to seenIds so the next page is
    // automatically deduped at boundary.
    const last = pageItems[pageItems.length - 1];
    const nextCursor =
      hasMore && last ? { date: last.date, id: last.id } : null;

    return { featured, rest, nextCursor };
  } catch (error) {
    console.error('Failed to fetch initial kabar page:', error);
    return { featured: null, rest: [], nextCursor: null };
  }
}

export default async function KabarPage() {
  const { featured, rest, nextCursor } = await getInitialKabarPage();

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Beranda', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Kabar Terbaru', item: `${siteUrl}/kabar` },
    ],
  };

  const isEmpty = !featured && rest.length === 0;
  const excludeIds = featured ? [featured.id] : [];

  return (
    <div className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
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
        {isEmpty ? (
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
              {featured && <FeaturedCard update={featured} />}

              <KabarGrid
                initialItems={rest}
                initialNextCursor={nextCursor}
                excludeIds={excludeIds}
                pageSize={INITIAL_PAGE_SIZE}
              />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
