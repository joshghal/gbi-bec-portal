// Lyric → slide segmentation. Convention (same as OpenLP / ProPresenter):
// a BLANK LINE separates one projection slide from the next. This keeps the
// admin in full control of what appears on each slide — no AI, no invented
// words, fully predictable.

/**
 * Split raw pasted lyrics into projection slides.
 * A blank line (one or more empty lines) starts a new slide.
 */
export function segmentLyrics(raw: string): string[] {
  if (!raw) return [];
  return raw
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split(/\n[ \t]*\n+/) // blank line(s) = slide boundary
    .map((block) =>
      block
        .split('\n')
        .map((line) => line.replace(/[ \t]+$/g, '').trim())
        .filter((line) => line.length > 0)
        .join('\n'),
    )
    .filter((block) => block.length > 0);
}

/** Strip diacritics + punctuation and lowercase — for substring search. */
export function normalizeForSearch(text: string): string {
  return (text || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // combining diacritics
    .toLowerCase()
    .replace(/['’`]/g, '') // apostrophes: "s'perti" → "sperti"
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Build the stored search blob for a song (title + artist + lyrics). */
export function buildSongSearchText(title: string, artist: string, rawLyrics: string): string {
  return normalizeForSearch([title, artist, rawLyrics].filter(Boolean).join(' '));
}
