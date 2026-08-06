'use client';

import Link from 'next/link';
import { stripHtml } from '@/lib/slug';
import { formatDate, formatDateLong } from '@/lib/format-date';

export interface Update {
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

export function FeaturedCard({ update }: { update: Update }) {
  return (
    <Link href={`/kabar/${update.slug}`} className="group block col-span-full lg:col-span-2 lg:row-span-2">
      <article className="h-full rounded-2xl overflow-hidden bg-card hover:shadow-lg transition-all duration-300 flex flex-col">
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
        <div className="p-6 lg:p-8 flex flex-col gap-3 flex-1">
          <div className="flex items-center gap-3">
            <span className="text-[10px] uppercase tracking-[0.2em] font-semibold" style={{ color: update.color }}>
              {update.category}
            </span>
            <span className="text-[10px] text-muted-foreground font-mono">
              {formatDateLong(update.date)}
            </span>
          </div>
          <h2 className="font-serif text-2xl lg:text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground group-hover:opacity-65 transition-opacity">
            {update.title}
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 max-w-xl">
            {stripHtml(update.excerpt)}
          </p>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground group-hover:text-muted-foreground/70 transition-colors mt-auto pt-2">
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

export function ImageCard({ update }: { update: Update }) {
  return (
    <Link href={`/kabar/${update.slug}`} className="group block">
      <article className="h-full rounded-xl overflow-hidden bg-card hover:shadow-lg transition-all duration-300 flex flex-col">
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
            <span className="text-[9px] text-muted-foreground font-mono">
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

export function TextCard({ update }: { update: Update }) {
  return (
    <Link href={`/kabar/${update.slug}`} className="group block">
      <article className="h-full rounded-xl bg-card hover:shadow-lg transition-all duration-300 p-5 flex flex-col gap-2.5">
        <div className="flex items-center gap-2.5">
          <span className="text-[9px] uppercase tracking-[0.2em] font-semibold" style={{ color: update.color }}>
            {update.category}
          </span>
          <span className="text-[9px] text-muted-foreground font-mono">
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

export function UpdateCard({ update }: { update: Update }) {
  return update.imageUrl ? <ImageCard update={update} /> : <TextCard update={update} />;
}
