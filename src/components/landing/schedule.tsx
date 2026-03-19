'use client';

import { motion, type Variants } from 'framer-motion';
import {
  fadeUp,
  fadeUpSmall,
  staggerContainer,
  viewportOnce,
} from '@/components/landing/animations';

/* ── Schedule data ─────────────────────────────────────────────── */

interface ScheduleItem {
  day: string;
  activity: string;
  detail: string;
  highlight?: boolean;
}

const WEEKLY_SCHEDULE: ScheduleItem[] = [
  { day: 'Selasa', activity: 'COOL (Community of Love)', detail: 'Kelompok Sel' },
  { day: 'Rabu', activity: 'KOM 300', detail: '18:30 WIB (Online via Zoom)' },
  { day: 'Kamis', activity: 'KOM 100 & 200', detail: '18:30 WIB (Online via Zoom)' },
  { day: 'Sabtu', activity: 'Creative Ministry', detail: 'Latihan di Baranangsiang' },
  { day: 'Minggu', activity: 'Ibadah Raya', detail: '17:00 WIB', highlight: true },
];

const MAPS_URL = 'https://maps.app.goo.gl/LaBh4cVqvMy5mUFX6';
const MAPS_EMBED_URL =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3961.0!2d107.620721!3d-6.918881!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68e63b1f3f1b6d%3A0x0!2sJl.+Baranang+Siang+No.8!5e0!3m2!1sen!2sid!4v1';

/* ── Variants ────────────────────────────────────────────────────── */

const scheduleRow: Variants = {
  hidden: { opacity: 0, x: -16 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: 'easeOut' as const },
  },
};

/* ── Component ─────────────────────────────────────────────────── */

export default function ScheduleSection() {
  return (
    <section id="jadwal" className="py-16 lg:py-24 px-6 lg:px-12">
      <div className="max-w-6xl mx-auto">

        {/* ── Header ──────────────────────────────────────────── */}
        <motion.div
          className="mb-12 lg:mb-16 max-w-2xl"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
        >
          <p className="text-sm tracking-[0.2em] text-muted-foreground font-medium uppercase">
            Jadwal &amp; Lokasi
          </p>
          <h2 className="mt-4 font-serif text-4xl lg:text-5xl font-bold tracking-[-0.03em] leading-[1.1]">
            Bergabung Bersama Kami
          </h2>
          <div className="mt-5 w-[80px] h-px bg-primary/40" />
        </motion.div>

        {/* ── Two-column layout ────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-12 lg:gap-16">

          {/* LEFT — Schedule rows (no card wrapper) */}
          <div>
            <motion.p
              variants={fadeUpSmall}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              className="text-xs tracking-[0.15em] text-muted-foreground font-medium uppercase mb-6"
            >
              Jadwal Mingguan
            </motion.p>

            <motion.div
              variants={staggerContainer(0.06)}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              role="list"
              aria-label="Jadwal mingguan"
            >
              {WEEKLY_SCHEDULE.map((item) => (
                <motion.div
                  key={item.day}
                  variants={scheduleRow}
                  role="listitem"
                  className={`flex items-baseline gap-4 py-4 pr-4 border-b border-border ${
                    item.highlight
                      ? 'border-l-[3px] border-l-primary pl-4 -ml-4 bg-primary/[0.04]'
                      : ''
                  }`}
                >
                  <span className={`w-20 shrink-0 text-sm font-semibold ${
                    item.highlight ? 'text-primary' : 'text-foreground'
                  }`}>
                    {item.day}
                  </span>
                  <span className={`flex-1 text-sm ${
                    item.highlight ? 'text-primary font-medium' : 'text-foreground'
                  }`}>
                    {item.activity}
                  </span>
                  <span className="text-xs text-muted-foreground text-right">
                    {item.detail}
                  </span>
                </motion.div>
              ))}
            </motion.div>

            {/* Sunday callout */}
            <motion.p
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              className="mt-6 text-sm text-muted-foreground"
            >
              <span className="font-semibold text-foreground">Ibadah Minggu sore</span> terbuka
              untuk umum setiap Minggu pukul 17:00 WIB di Kota Bandung.
            </motion.p>
          </div>

          {/* RIGHT — Location (no card wrapper) */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
          >
            <p className="text-xs tracking-[0.15em] text-muted-foreground font-medium uppercase mb-6">
              Lokasi
            </p>

            {/* Map */}
            <div
              className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden mb-6"
              style={{ boxShadow: '0 0 10px -5px #000' }}
            >
              <iframe
                src={MAPS_EMBED_URL}
                className="absolute inset-0 w-full h-full border-0"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Lokasi GBI BEC Sukawarna"
              />
            </div>

            {/* Address */}
            <p className="text-sm text-foreground leading-relaxed">
              Jl. Baranang Siang No.8, Kel. Lebak Siliwangi,
              Kec. Coblong, Kota Bandung, Jawa Barat 40132
            </p>

            <p className="mt-3 text-xs text-muted-foreground">
              Tersedia area parkir terbatas. Dapat dijangkau dengan angkutan kota atau ojek online.
            </p>

            <a
              href={MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Buka di Google Maps
              <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" aria-hidden="true">
                <path d="M7 17L17 7M17 7H7M17 7v10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </motion.div>
        </div>

      </div>
    </section>
  );
}
