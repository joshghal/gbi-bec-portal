import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { stripHtml } from '@/lib/slug';
import { formatDateFull } from '@/lib/format-date';
import { Button } from '@/components/ui/button';
import { LandingButton } from '@/components/landing/landing-button';
import { AdaptiveImage } from '@/components/adaptive-image';

export const revalidate = 3600;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gbibec.id';

/* ── Category → form mapping ─────────────────────────────────── */

const CATEGORY_FORM_MAP: Record<string, { type: string; href: string; label: string }> = {
  'Penyerahan Anak': { type: 'child-dedication', href: '/formulir/penyerahan-anak', label: 'Daftar Penyerahan Anak' },
  'M-Class': { type: 'mclass', href: '/formulir/mclass', label: 'Daftar M-Class' },
};

async function getDisabledForms(): Promise<string[]> {
  try {
    const db = getAdminFirestore();
    const doc = await db.collection('settings').doc('forms').get();
    return doc.exists ? (doc.data()?.disabledForms ?? []) : [];
  } catch {
    return [];
  }
}

interface Update {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content?: string;
  category: string;
  date: string;
  color: string;
  imageUrl?: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

async function getUpdateBySlug(slug: string): Promise<Update | null> {
  const db = getAdminFirestore();
  const snapshot = await db
    .collection('updates')
    .where('slug', '==', slug)
    .where('published', '==', true)
    .limit(1)
    .get();

  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() } as Update;
}

export async function generateStaticParams() {
  try {
    const db = getAdminFirestore();
    const snapshot = await db
      .collection('updates')
      .where('published', '==', true)
      .get();

    return snapshot.docs
      .map((doc) => doc.data().slug)
      .filter(Boolean)
      .map((slug) => ({ slug }));
  } catch (error) {
    console.error('Failed to generate static params:', error);
    return [];
  }
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const update = await getUpdateBySlug(slug);

  if (!update) {
    return { title: 'Tidak Ditemukan' };
  }

  const description = stripHtml(update.excerpt).slice(0, 155);

  return {
    title: update.title,
    description,
    keywords: [update.category, 'GBI BEC', 'kabar gereja', 'Baranangsiang Evening Church'],
    alternates: { canonical: `/kabar/${update.slug}` },
    openGraph: {
      title: update.title,
      description,
      url: `${siteUrl}/kabar/${update.slug}`,
      type: 'article',
      publishedTime: update.date,
      modifiedTime: update.updatedAt,
      images: update.imageUrl ? [{ url: update.imageUrl }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: update.title,
      description,
    },
    robots: { index: true, follow: true },
  };
}

export default async function KabarDetailPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const [update, disabledForms] = await Promise.all([
    getUpdateBySlug(slug),
    getDisabledForms(),
  ]);

  if (!update) notFound();

  const htmlContent = update.content || update.excerpt;
  const formLink = CATEGORY_FORM_MAP[update.category];
  const dateStillValid = update.date >= new Date().toISOString().slice(0, 10);
  const formEnabled = formLink && !disabledForms.includes(formLink.type) && dateStillValid;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: update.title,
    datePublished: update.date,
    dateModified: update.updatedAt,
    description: stripHtml(update.excerpt).slice(0, 155),
    image: update.imageUrl || `${siteUrl}/logo.png`,
    publisher: {
      '@type': 'Organization',
      name: 'GBI Baranangsiang Evening Church',
      url: siteUrl,
    },
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Beranda', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Kabar Terbaru', item: `${siteUrl}/kabar` },
      { '@type': 'ListItem', position: 3, name: update.title },
    ],
  };

  return (
    <div className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="border-b bg-card px-4 py-3 flex items-center gap-3">
        <Link href="/kabar">
          <Button variant="ghost" size="icon" className="shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <p className="text-xs text-muted-foreground">Kabar Terbaru</p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Meta info */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <span
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: update.color }}
          >
            {update.category}
          </span>
          <span className="text-muted-foreground text-xs">·</span>
          <span className="text-xs text-muted-foreground font-mono">
            {formatDateFull(update.date)}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold leading-tight font-serif">{update.title}</h1>

        {/* Image */}
        {update.imageUrl && (
          <div className="rounded-lg overflow-hidden bg-muted max-h-[480px]">
            <AdaptiveImage
              src={update.imageUrl}
              alt={update.title}
              className="w-full h-full max-h-[480px]"
            />
          </div>
        )}

        {/* Content */}
        <div
          className="prose prose-neutral max-w-none prose-headings:font-semibold prose-a:text-primary prose-img:rounded-lg prose-p:leading-relaxed"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />

        {/* Form CTA banner */}
        {formEnabled && (
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">Pendaftaran Dibuka</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Formulir {formLink.label.replace('Daftar ', '')} sedang dibuka. Daftar sekarang secara online.
              </p>
            </div>
            <LandingButton variant="primary-sm" href={formLink.href} arrow className="shrink-0">
              {formLink.label}
            </LandingButton>
          </div>
        )}

        {/* Back link */}
        <div className="pt-8 border-t">
          <Link href="/kabar" className="text-sm text-primary hover:underline flex items-center gap-1.5">
            <ArrowLeft className="w-3.5 h-3.5" />
            Kembali ke Kabar Terbaru
          </Link>
        </div>
      </main>
    </div>
  );
}
