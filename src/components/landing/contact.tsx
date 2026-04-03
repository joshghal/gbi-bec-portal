'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  fadeUp,
  fadeUpSmall,
  staggerContainer,
  viewportOnce,
} from '@/components/landing/animations';
import { WaIcon as WhatsAppIcon, InstagramIcon, YouTubeIcon, ChatIcon, ArrowRightIcon } from '@/components/landing/icons';

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
    href: 'https://www.youtube.com/@gbibaranangsiangsukawarna7008',
    icon: 'youtube' as const,
  },
];

/* ── Inline SVG icons ─────────────────────────────────────────── */


/* ── Section component ────────────────────────────────────────── */

export default function ContactSection() {
  return (
    <section
      id="kontak"
      className="relative overflow-hidden"
      style={{ backgroundColor: 'oklch(0.15 0.010 60)' }}
    >
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
