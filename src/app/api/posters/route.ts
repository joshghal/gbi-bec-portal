import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { verifyAuthToken } from '@/lib/firebase-admin';

const POSTERS_DIR = path.join(process.cwd(), 'public/posters');
const EXPORTS_DIR = path.join(POSTERS_DIR, 'exports');

interface PosterGroup {
  slug: string;
  title: string;
  cover: string | null;
  content: string | null;
  coverExport: string | null;
  contentExport: string | null;
}

function slugToTitle(slug: string): string {
  const map: Record<string, string> = {
    'baptisan': 'Baptisan',
    'cool': 'COOL',
    'creative': 'Creative Ministry',
    'kom': 'KOM',
    'mclass': 'M-Class',
    'pelayanan': 'Pelayanan Jemaat',
    'penyerahan-anak': 'Penyerahan Anak',
    'pernikahan': 'Pernikahan',
  };
  return map[slug] || slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export async function GET(request: NextRequest) {
  const authError = await verifyAuthToken(request);
  if (authError) return authError;

  const htmlFiles = fs.readdirSync(POSTERS_DIR).filter(f => f.endsWith('.html')).sort();
  const exportFiles = fs.existsSync(EXPORTS_DIR)
    ? new Set(fs.readdirSync(EXPORTS_DIR))
    : new Set<string>();

  const groups = new Map<string, PosterGroup>();

  for (const file of htmlFiles) {
    const isCover = file.endsWith('-cover.html');
    const isContent = file.endsWith('-content.html');
    if (!isCover && !isContent) continue;

    const slug = file.replace(/-cover\.html$/, '').replace(/-content\.html$/, '');
    if (!groups.has(slug)) {
      groups.set(slug, {
        slug,
        title: slugToTitle(slug),
        cover: null,
        content: null,
        coverExport: null,
        contentExport: null,
      });
    }

    const group = groups.get(slug)!;
    const pngName = file.replace('.html', '.png');

    if (isCover) {
      group.cover = file;
      group.coverExport = exportFiles.has(pngName) ? pngName : null;
    } else {
      group.content = file;
      group.contentExport = exportFiles.has(pngName) ? pngName : null;
    }
  }

  return NextResponse.json({
    posters: Array.from(groups.values()),
    hasExports: exportFiles.size > 0,
  });
}
