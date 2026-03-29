/**
 * Slug generation and HTML stripping utilities for SEO pages.
 */

/** Generate a URL-safe slug from a title (Indonesian-friendly). */
export function generateSlug(title: string): string {
  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[&]/g, 'dan')
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '');

  return slug || `post-${Date.now()}`;
}

/** Generate a unique slug by appending -2, -3, etc. if collision exists. */
export async function generateUniqueSlug(
  title: string,
  db: FirebaseFirestore.Firestore,
  excludeId?: string
): Promise<string> {
  const baseSlug = generateSlug(title);
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const snapshot = await db
      .collection('updates')
      .where('slug', '==', slug)
      .limit(1)
      .get();

    const collision = snapshot.docs.find((doc) => doc.id !== excludeId);
    if (!collision) return slug;

    counter++;
    slug = `${baseSlug}-${counter}`;
  }
}

/** Strip HTML tags and decode basic entities for meta descriptions. */
export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
