/**
 * Entity-based structured data (schema.org JSON-LD) — the modern replacement
 * for keyword "tags".
 *
 * Strategy (mirrors how best-in-class sites like Yoast model their graph):
 *   - Define the church ONCE as a stable entity with a fixed `@id`.
 *   - Give it `alternateName` (every nickname people actually search — "GBI
 *     Barsi", "gbibarsi", "BEC"…) and `sameAs` (links to authoritative profiles
 *     — Instagram, YouTube, Linktree, and the parent church's Wikipedia page).
 *   - Reference that same `@id` from every page's graph instead of re-declaring
 *     a fresh Church node, so search engines and AI models (Google Knowledge
 *     Graph, Gemini, ChatGPT, Perplexity) consolidate everything into one
 *     recognized entity rather than scattered duplicates.
 *
 * The main node is multi-typed `["Church", "Organization"]` so it can carry
 * both Place properties (address, openingHours, geo, telephone) and
 * Organization properties (parentOrganization, memberOf, logo, areaServed).
 */

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://www.gbibec.id';

// Stable entity identifiers. Never reuse an @id for a different entity.
export const ORG_ID = `${SITE_URL}/#church`;
export const PARENT_ORG_ID = `${SITE_URL}/#gbi-sukawarna`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

/**
 * Every name the community is actually searched by. These come straight from
 * real usage (Instagram handle, hashtags, congregation shorthand). This is what
 * teaches Google that a query like "gbi barsi" refers to THIS church.
 */
export const ALTERNATE_NAMES = [
  'GBI BEC',
  'BEC',
  'BEC Sukawarna',
  'GBI Barsi',
  'GBIBarsi',
  'GBI Baranangsiang',
  'Baranangsiang Evening Church',
];

/** Authoritative external profiles (sameAs). Add Facebook / the exact @gbibarsi
 *  IG handle here once confirmed — every entry strengthens entity recognition. */
export const SOCIAL_PROFILES = [
  'https://www.instagram.com/sukawarna.bec/',
  'https://www.youtube.com/@gbibaranangsiangsukawarna7008',
  'https://linktr.ee/barsi',
];

type JsonLdNode = Record<string, unknown>;

/** The parent church (mother congregation). Its sameAs → Wikipedia is a strong
 *  Knowledge-Graph signal that also disambiguates the BEC entity. */
export function parentOrganizationEntity(): JsonLdNode {
  return {
    '@type': ['Church', 'Organization'],
    '@id': PARENT_ORG_ID,
    name: 'GBI Sukawarna',
    alternateName: ['Gereja Bethel Indonesia Sukawarna', 'GBI Sukawarna Bandung'],
    url: 'https://www.gbisukawarna.org/',
    sameAs: [
      'https://id.wikipedia.org/wiki/GBI_Sukawarna_Bandung',
      'https://www.gbisukawarna.org/',
    ],
  };
}

/** The canonical church entity. Referenced by @id from every page. */
export function churchEntity(): JsonLdNode {
  return {
    '@type': ['Church', 'Organization'],
    '@id': ORG_ID,
    name: 'GBI Baranangsiang Evening Church',
    alternateName: ALTERNATE_NAMES,
    legalName: 'GBI Baranangsiang Evening Church',
    description:
      'Gereja Bethel Indonesia Baranangsiang Evening Church (GBI Barsi / BEC) — komunitas gereja di Bandung, bagian dari GBI Sukawarna. Ibadah Raya setiap Minggu pukul 17:00 WIB.',
    url: SITE_URL,
    logo: `${SITE_URL}/apple-touch-icon.png`,
    image: `${SITE_URL}/apple-touch-icon.png`,
    telephone: '+6287823420950',
    parentOrganization: { '@id': PARENT_ORG_ID },
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Jl. Baranang Siang No.8',
      addressLocality: 'Bandung',
      addressRegion: 'Jawa Barat',
      postalCode: '40112',
      addressCountry: 'ID',
    },
    areaServed: { '@type': 'City', name: 'Bandung' },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Sunday',
        opens: '17:00',
        closes: '19:00',
      },
    ],
    sameAs: SOCIAL_PROFILES,
    inLanguage: 'id-ID',
  };
}

/** The WebSite entity — publisher points back at the church by @id. */
export function websiteEntity(): JsonLdNode {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: SITE_URL,
    name: 'GBI Baranangsiang Evening Church',
    alternateName: ALTERNATE_NAMES,
    publisher: { '@id': ORG_ID },
    inLanguage: 'id-ID',
  };
}

/** BreadcrumbList from {name, path} pairs (path is relative, e.g. "/kom"). */
export function breadcrumbEntity(
  items: { name: string; path: string }[],
): JsonLdNode {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: `${SITE_URL}${it.path}`,
    })),
  };
}

/** FAQPage from {question, answer} pairs. */
export function faqEntity(
  items: { question: string; answer: string }[],
): JsonLdNode {
  return {
    '@type': 'FAQPage',
    mainEntity: items.map((it) => ({
      '@type': 'Question',
      name: it.question,
      acceptedAnswer: { '@type': 'Answer', text: it.answer },
    })),
  };
}

/**
 * A WebPage node that ties a page to the site + church entities by @id.
 * Use as the "anchor" node for any sub-page graph.
 */
export function webPageEntity(opts: {
  path: string;
  name: string;
  description?: string;
}): JsonLdNode {
  return {
    '@type': 'WebPage',
    '@id': `${SITE_URL}${opts.path}#webpage`,
    url: `${SITE_URL}${opts.path}`,
    name: opts.name,
    ...(opts.description ? { description: opts.description } : {}),
    isPartOf: { '@id': WEBSITE_ID },
    about: { '@id': ORG_ID },
    inLanguage: 'id-ID',
  };
}

/** Wrap any set of nodes in a single @graph document. */
export function jsonLdGraph(...nodes: JsonLdNode[]) {
  return { '@context': 'https://schema.org', '@graph': nodes };
}
