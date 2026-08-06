// Shared types for the "Slide Ibadah" worship-service presentation builder.
//
// Three collections:
//   songs                  — reusable song library (paste once, reuse weekly)
//   service_sets           — a weekly presentation = ordered list of items
//   settings/service_slides — the 5 editable fixed-slide templates
//
// A weekly set is SELF-CONTAINED: song lyrics are snapshotted into the set at
// add-time (kept stable for export, immune to later library edits), while the
// original `songId` is retained so the item can be traced back to the library.

/** A saved song in the reusable library. */
export interface Song {
  id?: string;
  title: string;
  artist?: string;
  /** The original pasted lyrics (source for re-editing / re-segmenting). */
  rawLyrics: string;
  /** Projection slides — blank line in rawLyrics separates slides. */
  slides: string[];
  /** Normalized `title + artist + lyrics`, used for substring search. */
  searchText: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

/** A fixed-slide template (the 5 designed graphics that repeat every week).
 * Fixed slides are full-bleed IMAGES (their real deck is image-based), not text. */
export interface FixedSlide {
  id: string;
  /** Admin-facing name for the slide (not shown on the projection). */
  label: string;
  /** Full-slide image URL (local /ibadah/* default, or a Cloudinary upload). */
  imageUrl: string;
  order: number;
}

export type ServiceItemType = 'fixed' | 'song';

interface ServiceItemBase {
  /** Stable per-item id used for dnd + React keys (independent of Firestore). */
  key: string;
  type: ServiceItemType;
}

/** A fixed-slide item inside a set — an image snapshotted from the template. */
export interface FixedServiceItem extends ServiceItemBase {
  type: 'fixed';
  /** Template id it was seeded from (for reference; may be empty for ad-hoc). */
  fixedId?: string;
  label: string;
  imageUrl: string;
}

/** A song item inside a set — lyrics snapshotted from the library at add-time. */
export interface SongServiceItem extends ServiceItemBase {
  type: 'song';
  /** Library song id (retained so we can re-sync from the library later). */
  songId?: string;
  title: string;
  artist?: string;
  slides: string[];
}

export type ServiceItem = FixedServiceItem | SongServiceItem;

/** A weekly worship-service presentation. */
export interface ServiceSet {
  id?: string;
  title: string;
  /** ISO date of the service (optional). */
  serviceDate?: string;
  /** Running order — interleaves fixed slides and song blocks. */
  items: ServiceItem[];
  createdAt: string;
  updatedAt: string;
}

/** Total number of rendered slides a set will export to. */
export function countSlides(items: ServiceItem[]): number {
  return items.reduce(
    (n, item) => n + (item.type === 'song' ? Math.max(1, item.slides.length) : 1),
    0,
  );
}

/** Background image applied behind song-lyric slides (the deck's song template). */
export const DEFAULT_SONG_BACKGROUND = '/ibadah/song-bg.jpg';

/** Default fixed slides — seeded from the Rumah Doa BEC deck (image-based). */
export const DEFAULT_FIXED_SLIDES: FixedSlide[] = [
  { id: 'opening',       label: 'Pembuka (Zoom)',         imageUrl: '/ibadah/opening.jpg',       order: 0 },
  { id: 'bangsa-negara', label: 'Doa Bangsa & Negara',    imageUrl: '/ibadah/bangsa-negara.jpg', order: 1 },
  { id: 'amanat-agung',  label: 'Doa Jiwa-jiwa & Jemaat', imageUrl: '/ibadah/amanat-agung.jpg',  order: 2 },
  { id: 'gembala',       label: 'Doa Gembala & Pengerja', imageUrl: '/ibadah/gembala.jpg',       order: 3 },
  { id: 'penutup',       label: 'Doa Penutup & Berkat',   imageUrl: '/ibadah/penutup.jpg',       order: 4 },
];
