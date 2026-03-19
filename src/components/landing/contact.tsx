'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  fadeUp,
  fadeUpSmall,
  staggerContainer,
  viewportOnce,
} from '@/components/landing/animations';

/* ── Grain texture (same as hero) ─────────────────────────────── */

// Static PNG grain — replaces feTurbulence SVG filter which runs a GPU shader per-frame
const GRAIN_PNG = `url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAEklEQVQImWNgYGD4z8BQDwAEgAF/QualIQAAAABJRU5ErkJggg==")`;

/* ── Contact data ─────────────────────────────────────────────── */

const PRIMARY_CONTACT = {
  name: 'Call Centre BEC',
  role: 'Informasi Umum',
  phone: '0878-2342-0950',
  waLink: 'https://wa.me/6287823420950',
};

const SECONDARY_CONTACTS = [
  {
    name: 'Ps. Thomas Lukiman',
    role: 'Pelayanan Jemaat',
    phone: '0815-7309-7720',
    waLink: 'https://wa.me/6281573097720',
  },
  {
    name: 'Ps. Agus Sulistyono',
    role: 'Community of Love',
    phone: '0819-1023-8170',
    waLink: 'https://wa.me/6281910238170',
  },
];

const SOCIALS = [
  {
    label: 'Instagram',
    handle: '@sukawarna.bec',
    href: 'https://www.instagram.com/sukawarna.bec/',
    icon: 'instagram' as const,
  },
  {
    label: 'YouTube',
    handle: 'GBI Baranangsiang Evening Church',
    href: 'https://www.youtube.com/@GBIBaranangsiangEveningChurch',
    icon: 'youtube' as const,
  },
];

/* ── Inline SVG icons ─────────────────────────────────────────── */

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function YouTubeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function ChatIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      <path d="M8 10h.01" />
      <path d="M12 10h.01" />
      <path d="M16 10h.01" />
    </svg>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

/* ── Section component ────────────────────────────────────────── */

export default function ContactSection() {
  return (
    <section
      id="kontak"
      className="relative overflow-hidden"
      style={{ backgroundColor: 'oklch(0.15 0.010 60)' }}
    >
      {/* ── Grain texture overlay — commented out */}
      {/* <div
        className="pointer-events-none absolute inset-0 z-10 opacity-[0.035]"
        style={{
          backgroundImage: GRAIN_PNG,
          backgroundRepeat: 'repeat',
          backgroundSize: '128px 128px',
        }}
      /> */}

      <div className="relative z-20 max-w-6xl mx-auto px-6 lg:px-12">
        {/* ═══════════════════════════════════════════════════════
            PART 1: The Headline
        ═══════════════════════════════════════════════════════ */}
        <div className="pt-16 lg:pt-20 pb-12 lg:pb-16">
          <motion.h2
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            className="font-serif font-bold text-white leading-[1.05]"
            style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)' }}
          >
            Kami Siap Membantu
          </motion.h2>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            className="mt-5 text-lg lg:text-xl text-white/55 max-w-xl leading-relaxed"
          >
            Jangan ragu menghubungi kami melalui WhatsApp
            atau tanya AI kami 24/7.
          </motion.p>
        </div>

        {/* ═══════════════════════════════════════════════════════
            PART 2: Editorial Contact Grid
        ═══════════════════════════════════════════════════════ */}
        <motion.div
          variants={staggerContainer(0.15)}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="grid grid-cols-1 lg:grid-cols-5 gap-5 lg:gap-6"
        >
          {/* ── Left: Featured primary contact (~40%) ──────────── */}
          <motion.div
            variants={fadeUpSmall}
            className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/[0.04] p-8 lg:p-10 flex flex-col justify-between"
          >
            <div>
              <p className="text-xs tracking-[0.2em] font-medium uppercase text-white/40 mb-6">
                Kontak Utama
              </p>
              <h3 className="text-2xl lg:text-3xl font-semibold text-white leading-tight">
                {PRIMARY_CONTACT.name}
              </h3>
              <p className="mt-1.5 text-sm text-white/45">
                {PRIMARY_CONTACT.role}
              </p>
              <a
                href={`tel:${PRIMARY_CONTACT.phone.replace(/-/g, '')}`}
                className="mt-5 block text-2xl lg:text-3xl font-light text-white/80 tracking-wide transition-colors hover:text-white"
              >
                {PRIMARY_CONTACT.phone}
              </a>
            </div>

            <div className="mt-8">
              <motion.a
                href={PRIMARY_CONTACT.waLink}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2.5 rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition-colors hover:bg-white/90"
              >
                <WhatsAppIcon className="h-4.5 w-4.5" />
                Hubungi via WhatsApp
              </motion.a>
            </div>
          </motion.div>

          {/* ── Right: Secondary contacts stacked (~60%) ───────── */}
          <motion.div
            variants={fadeUpSmall}
            className="lg:col-span-3 flex flex-col"
          >
            {SECONDARY_CONTACTS.map((contact, i) => (
              <div key={contact.name}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-7 lg:py-8">
                  {/* Info */}
                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold text-white">
                      {contact.name}
                    </h3>
                    <p className="mt-0.5 text-sm text-white/40">
                      {contact.role}
                    </p>
                    <a
                      href={`tel:${contact.phone.replace(/-/g, '')}`}
                      className="mt-2 inline-block text-base text-white/60 transition-colors hover:text-white"
                    >
                      {contact.phone}
                    </a>
                  </div>

                  {/* WhatsApp button */}
                  <motion.a
                    href={contact.waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/[0.07] px-5 py-2.5 text-sm font-medium text-white/75 transition-colors hover:bg-white/[0.12] hover:text-white w-full sm:w-auto"
                  >
                    <WhatsAppIcon className="h-4 w-4" />
                    Hubungi via WhatsApp
                  </motion.a>
                </div>

                {/* Divider between contacts, not after last */}
                {i < SECONDARY_CONTACTS.length - 1 && (
                  <div className="h-px bg-white/10" />
                )}
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* ═══════════════════════════════════════════════════════
            Social Media Row
        ═══════════════════════════════════════════════════════ */}
        <div className="mt-16 h-px bg-white/10" />

        <motion.div
          variants={staggerContainer(0.1, 0.2)}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="py-8 flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-10"
        >
          {SOCIALS.map((social) => (
            <motion.a
              key={social.label}
              variants={fadeUpSmall}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 text-white/50 transition-colors hover:text-white group"
            >
              {social.icon === 'instagram' ? (
                <InstagramIcon className="h-5 w-5 shrink-0" />
              ) : (
                <YouTubeIcon className="h-5 w-5 shrink-0" />
              )}
              <span className="text-sm">{social.handle}</span>
            </motion.a>
          ))}
        </motion.div>

        {/* ═══════════════════════════════════════════════════════
            CTA: Chatbot Promo
        ═══════════════════════════════════════════════════════ */}
        <div className="h-px bg-white/10" />

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="my-16 lg:my-20"
        >
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 lg:p-12">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              <div className="max-w-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                    <ChatIcon className="h-5 w-5 text-white/70" />
                  </div>
                  <p className="text-xs tracking-[0.15em] font-medium uppercase text-white/40">
                    AI Helpdesk
                  </p>
                </div>
                <h3
                  className="font-serif font-bold text-white leading-tight"
                  style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)' }}
                >
                  Atau tanya AI kami
                </h3>
                <p className="mt-3 text-base text-white/50 leading-relaxed">
                  Helpdesk AI kami tersedia 24/7 untuk menjawab pertanyaan
                  seputar gereja.
                </p>
              </div>

              <Link
                href="/chat"
                className="inline-flex items-center gap-2.5 rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-black transition-all hover:bg-white/90 hover:shadow-lg hover:shadow-white/10 shrink-0 w-fit"
              >
                Mulai Percakapan
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
