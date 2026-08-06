import { getAdminFirestore } from '@/lib/firebase-admin';
import {
  DEFAULT_FIXED_SLIDES,
  DEFAULT_SONG_BACKGROUND,
  type FixedSlide,
  type FixedServiceItem,
} from './types';

const SETTINGS_DOC = 'service_slides';

export interface FixedConfig {
  slides: FixedSlide[];
  songBackgroundUrl: string;
}

/** Read the fixed-slide templates + song background, seeding defaults when unset. */
export async function getFixedConfig(): Promise<FixedConfig> {
  const db = getAdminFirestore();
  const doc = await db.collection('settings').doc(SETTINGS_DOC).get();
  const data = doc.data();
  const slides =
    doc.exists && Array.isArray(data?.fixedSlides) && data!.fixedSlides.length
      ? (data!.fixedSlides as FixedSlide[]).slice().sort((a, b) => a.order - b.order)
      : DEFAULT_FIXED_SLIDES;
  const songBackgroundUrl =
    (doc.exists && typeof data?.songBackgroundUrl === 'string' && data!.songBackgroundUrl) ||
    DEFAULT_SONG_BACKGROUND;
  return { slides, songBackgroundUrl };
}

/** Persist the fixed-slide templates + song background. */
export async function saveFixedConfig(slides: FixedSlide[], songBackgroundUrl: string): Promise<void> {
  const db = getAdminFirestore();
  await db
    .collection('settings')
    .doc(SETTINGS_DOC)
    .set(
      { fixedSlides: slides, songBackgroundUrl, updatedAt: new Date().toISOString() },
      { merge: true },
    );
}

/** Snapshot the fixed-slide templates into fresh set items. */
export function fixedSlidesToItems(slides: FixedSlide[]): FixedServiceItem[] {
  return slides.map((s) => ({
    key: crypto.randomUUID(),
    type: 'fixed' as const,
    fixedId: s.id,
    label: s.label,
    imageUrl: s.imageUrl,
  }));
}
