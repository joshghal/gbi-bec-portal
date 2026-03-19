import Link from 'next/link';

const KEGIATAN_LINKS = [
  { label: 'Baptisan', href: '#kegiatan' },
  { label: 'KOM', href: '#kegiatan' },
  { label: 'M-Class', href: '#kegiatan' },
  { label: 'COOL', href: '#kegiatan' },
  { label: 'Creative Ministry', href: '#kegiatan' },
] as const;

const INFO_LINKS = [
  { label: 'Jadwal', href: '#jadwal' },
  { label: 'Lokasi', href: '#jadwal' },
  { label: 'Kontak', href: '#kontak' },
] as const;

const LAINNYA_LINKS = [
  { label: 'Chat AI', href: '/chat' },
] as const;

const SOCIAL_LINKS = [
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/sukawarna.bec',
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: 'YouTube',
    href: 'https://www.youtube.com/@GBIBaranangsiang',
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
        <path d="m10 15 5-3-5-3z" />
      </svg>
    ),
  },
] as const;

function FooterLinkColumn({
  title,
  links,
}: {
  title: string;
  links: ReadonlyArray<{ label: string; href: string }>;
}) {
  return (
    <div>
      <h3 className="text-sm font-medium text-white/90 mb-3">{title}</h3>
      <ul className="space-y-2">
        {links.map(({ label, href }) => {
          const isExternal = href.startsWith('http');
          const isAnchor = href.startsWith('#');
          const Element = isAnchor ? 'a' : Link;

          return (
            <li key={label}>
              <Element
                href={href}
                {...(isExternal
                  ? { target: '_blank', rel: 'noopener noreferrer' }
                  : {})}
                className="text-sm text-white/60 transition-colors duration-200 hover:text-white"
              >
                {label}
              </Element>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function Footer() {
  return (
    <footer
      className="border-t border-white/10 py-12 px-6 lg:px-12"
      style={{ backgroundColor: 'oklch(0.12 0.008 60)' }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Main grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8">
          {/* Brand column */}
          <div>
            <p className="font-serif text-lg font-bold text-white leading-tight">
              GBI Baranangsiang Evening Church
            </p>
            <p className="mt-1 text-sm text-white/60">BEC Sukawarna</p>
          </div>

          {/* Kegiatan */}
          <FooterLinkColumn title="Kegiatan" links={KEGIATAN_LINKS} />

          {/* Info */}
          <FooterLinkColumn title="Info" links={INFO_LINKS} />

          {/* Lainnya */}
          <FooterLinkColumn title="Lainnya" links={LAINNYA_LINKS} />
        </div>

        {/* Social row */}
        <div className="mt-10 flex items-center gap-4">
          {SOCIAL_LINKS.map(({ label, href, icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="text-white/60 transition-colors duration-200 hover:text-white"
            >
              {icon}
            </a>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <p className="text-xs text-white/40">
            &copy; 2026 GBI Baranangsiang Evening Church. Semua hak dilindungi.
          </p>
        </div>
      </div>
    </footer>
  );
}
