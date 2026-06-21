/**
 * Renders a schema.org JSON-LD block. Server component — the markup ships in
 * the initial HTML where crawlers and AI agents read it.
 *
 * Usage:
 *   import { JsonLd } from '@/components/json-ld';
 *   import { jsonLdGraph, churchEntity, websiteEntity } from '@/lib/seo';
 *   <JsonLd data={jsonLdGraph(churchEntity(), websiteEntity())} />
 */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // Content is built from trusted constants, not user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
