"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

interface Theme {
  bg: string;
  accent: string;
  rgb: string;
}

interface CardData {
  label: string;
  title?: string;
  desc?: string;
  items?: string[];
  steps?: { n: string; t: string }[];
  age?: string;
  num?: string;
  qr?: { src: string; label: string; text: string };
}

interface ContactQR {
  src: string;
  label: string;
  text: string;
}

interface HighlightDef {
  id: string;
  title: string;
  sub: string;
  theme: Theme;
  pages: CardData[][];
  contact: string;
  note: string;
  logo?: string;
  contactQrs: ContactQR[];
}

// ═══════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════

const NOISE_PNG = `url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAEklEQVQImWNgYGD4z8BQDwAEgAF/QualIQAAAABJRU5ErkJggg==")`;

// ═══════════════════════════════════════════════════════════════
// DATA — 8 HIGHLIGHTS
// ═══════════════════════════════════════════════════════════════

const H: HighlightDef[] = [
  // ── 1. BAPTISAN ──
  {
    id: "baptisan",
    title: "Baptisan",
    sub: "Baptisan Air — Baptisan Selam",
    theme: { bg: "#08061a", accent: "#6EA4FF", rgb: "110,164,255" },
    pages: [
      [
        { label: "Persyaratan", title: "Siapa yang Boleh?", desc: "Usia 12 tahun ke atas. Terbuka untuk semua jemaat." },
        { label: "Yang Perlu Dibawa", items: ["Pas foto 3x4 berwarna (2 lembar)", "Baju ganti & perlengkapan mandi", "Pakaian rapi dan sopan", "Hadir 1 jam sebelumnya"] },
      ],
      [
        { label: "Jadwal", title: "Tersedia Sepanjang Tahun", desc: "Baptisan dilaksanakan dua bulan sekali dalam setahun. Cek tanggal terbaru dan daftar melalui website." },
        { label: "Non-Kristen", title: "Syarat Tambahan", desc: "Membuat Surat Pernyataan di atas meterai Rp 10.000, disertai fotocopy KTP. Menyatakan tidak dipaksa dalam mengikuti baptisan." },
      ],
      [
        { label: "Catatan Penting", title: "Sertifikat Baptis", desc: "Sertifikat baptis diberikan setelah mengikuti KOM 100. Hubungi Call Centre BEC untuk pengambilan sertifikat." },
      ],
    ],
    contact: "Call Centre BEC — 0878-2342-0950",
    note: "Baptisan diadakan dua bulan sekali",
    contactQrs: [{ src: "/posters/qr-baptisan.webp", label: "Daftar Baptisan", text: "helpbec.vercel.app/formulir/baptis" }],
  },

  // ── 2. KOM ──
  {
    id: "kom",
    title: "KOM",
    sub: "Kehidupan Orientasi Melayani",
    theme: { bg: "#0e0e10", accent: "#C0C0D8", rgb: "192,192,216" },
    pages: [
      [
        { label: "Tentang", title: "Program Keanggotaan", desc: "Pembinaan jemaat 4 level menuju kedewasaan rohani dan kesiapan melayani." },
        { label: "4 Level", items: ["KOM 100 · Pencari Tuhan", "KOM 200 · Pelayan Tuhan", "KOM 300 · Prajurit Tuhan", "KOM 400 · Penilik Tuhan"] },
      ],
      [
        { label: "Jadwal", title: "Kelas Online", desc: "KOM 100 & 200: Kamis 18:30.\nKOM 300: Rabu 18:30.\nSemua kelas online via Zoom." },
        { label: "Persyaratan", title: "Berjenjang", desc: "KOM 100 terbuka untuk semua jemaat. Level selanjutnya wajib lulus level sebelumnya." },
      ],
      [
        { label: "Keuntungan", title: "Sertifikat Nasional", desc: "Sertifikat resmi GBI setiap level. Membuka jalan melayani di gereja." },
      ],
    ],
    contact: "Henny — 0858-6006-0050",
    note: "Kelas online via Zoom",
    contactQrs: [{ src: "/posters/qr-kom.webp", label: "Ibu Henny Liana", text: "0858-6006-0050 (WhatsApp)" }],
  },

  // ── 3. M-CLASS ──
  {
    id: "mclass",
    title: "M-Class",
    sub: "Kelas Membership GBI BEC",
    theme: { bg: "#081020", accent: "#F0CC50", rgb: "240,204,80" },
    logo: "/posters/mclass-logo.webp",
    pages: [
      [
        { label: "Apa Itu M-Class?", title: "Kelas Keanggotaan Jemaat", desc: "Kelas wajib bagi jemaat yang ingin menjadi anggota resmi GBI BEC dan memperoleh Kartu Anggota Jemaat (KAJ)." },
        { label: "Syarat Mengikuti", title: "Terbuka untuk Semua", desc: "Usia di atas 15 tahun dan sudah pernah beribadah di GBI BEC atau mengikuti ibadah online di YouTube." },
      ],
      [
        { label: "Jadwal", title: "Tersedia Setiap Bulan", desc: "Jadwal M-Class tersedia setiap bulan. Setiap hari Senin setelah hari Minggu pertama. Cek tanggal terbaru di website." },
        { label: "Setelah Lulus", title: "Kartu Anggota Jemaat", desc: "Setelah lulus M-Class dan baptisan selam, Anda dapat mengajukan KAJ sebagai anggota resmi." },
      ],
      [
        { label: "Jalur Keanggotaan", steps: [{ n: "1", t: "Ikuti M-Class" }, { n: "2", t: "Baptisan Selam" }, { n: "3", t: "Ajukan KAJ" }, { n: "4", t: "Anggota Resmi GBI BEC" }] },
      ],
    ],
    contact: "Call Centre BEC — 0878-2342-0950",
    note: "Tersedia setiap bulan",
    contactQrs: [{ src: "/posters/qr-mclass.webp", label: "Daftar M-Class", text: "helpbec.vercel.app/formulir/mclass" }],
  },

  // ── 4. COOL ──
  {
    id: "cool",
    title: "COOL",
    sub: "Community of Love",
    theme: { bg: "#0e0a07", accent: "#F8BE70", rgb: "248,190,112" },
    pages: [
      [
        { label: "Apa Itu COOL?", title: "Kelompok Sel / Komsel", desc: "Komunitas kecil jemaat yang bertemu secara rutin untuk saling mendukung, berdoa, dan bertumbuh bersama dalam iman." },
        { label: "Cara Bergabung", title: "Hubungi Call Centre", desc: "Pendaftaran COOL dilakukan melalui call centre BEC." },
      ],
      [
        { label: "Pilihan", title: "Gabung COOL", desc: "Cool BEC dilaksanakan setiap hari Selasa di GBI Baranangsiang." },
        { label: "Data Pendaftaran", items: ["Nama lengkap", "No. HP / WhatsApp", "Alamat lengkap & daerah", "Usia"] },
      ],
      [
        { label: "Keuntungan", title: "Komunitas yang Peduli", desc: "Saling mendoakan, berbagi kesaksian, dan bertumbuh bersama dalam kelompok kecil yang penuh kasih." },
      ],
    ],
    contact: "Ps. Agus Sulistyono — 0819-1023-8170",
    note: "Terbuka untuk semua jemaat",
    contactQrs: [{ src: "/posters/qr-cool-agus.webp", label: "Ps. Agus Sulistyono", text: "0819-1023-8170 (WhatsApp)" }],
  },

  // ── 5. PENYERAHAN ANAK ──
  {
    id: "penyerahan-anak",
    title: "Penyerahan\nAnak",
    sub: "GBI Baranangsiang Evening Church",
    theme: { bg: "#100816", accent: "#C098F0", rgb: "192,152,240" },
    pages: [
      [
        { label: "Tentang", title: "Penyerahan Anak", desc: "Penyerahan anak dilakukan bersama kedua orang tua di hadapan jemaat sebagai komitmen orang tua kepada Tuhan." },
        { label: "Dokumen", items: ["Pas foto anak 3x4 berwarna (2 lembar)", "Fotocopy KTP ayah & ibu", "Fotocopy akta nikah", "Fotocopy akta lahir anak", "Fotocopy KAJ ayah & ibu"] },
      ],
      [
        { label: "Pendaftaran", title: "Serahkan ke Diaken BEC", desc: "Dokumen diserahkan langsung ke diaken BEC secara fisik. Tidak melalui website." },
        { label: "Jadwal", title: "Hubungi Call Centre", desc: "Jadwal pelaksanaan menyesuaikan ketersediaan Gembala BEC. Lakukan pendaftaran di website dan hubungi Call Centre untuk penjadwalan." },
      ],
      [
        { label: "Catatan", title: "Surat Penyerahan Anak", desc: "Jika surat hilang, hanya dapat digantikan dengan surat keterangan. Simpan surat asli dengan baik." },
      ],
    ],
    contact: "Call Centre BEC — 0878-2342-0950",
    note: "Dokumen diserahkan ke diaken BEC",
    contactQrs: [{ src: "/posters/qr-penyerahan-anak.webp", label: "Daftar Penyerahan Anak", text: "helpbec.vercel.app/formulir/penyerahan-anak" }],
  },

  // ── 6. PERNIKAHAN ──
  {
    id: "pernikahan",
    title: "Pemberkatan\nPernikahan",
    sub: "GBI Baranangsiang Evening Church",
    theme: { bg: "#140a0e", accent: "#F8A0B8", rgb: "248,160,184" },
    pages: [
      [
        { label: "Syarat Utama", items: ["Jemaat GBI Sukawarna & punya KAJ", "Lulus KOM 100", "Sudah dibaptis", "Daftar min. 5 bulan sebelumnya"] },
        { label: "Dokumen Pribadi", items: ["Fotocopy KTP calon mempelai", "Fotocopy Kartu Keluarga", "Fotocopy akte lahir", "Fotocopy surat baptis", "Fotocopy KAJ & sertifikat KOM 100"] },
      ],
      [
        { label: "Dokumen Tambahan", items: ["Surat persetujuan orang tua (materai Rp 10.000)", "Fotocopy KTP orang tua", "Pas foto berdampingan 4x6 (3 lembar)", "Surat ganti nama (jika ada)"] },
        { label: "Proses", title: "Setelah Pendaftaran", desc: "Mengikuti konseling pernikahan dan kelas Bimbingan Pranikah (BPN) setelah persyaratan lengkap diterima." },
      ],
      [
        { label: "Catatan", title: "Persiapkan Lebih Awal", desc: "Pastikan tanggal & tempat dengan pihak gereja. Bagi yang belum punya surat baptis, KAJ, atau KOM 100 — ikuti terlebih dahulu." },
      ],
    ],
    contact: "Unit Pernikahan — 0896-7929-9098",
    note: "Daftar minimal 5 bulan sebelumnya",
    contactQrs: [{ src: "/posters/qr-pernikahan.webp", label: "Unit Pernikahan", text: "0896-7929-9098 (WhatsApp)" }],
  },

  // ── 7. PELAYANAN ──
  {
    id: "pelayanan",
    title: "Pelayanan\nJemaat",
    sub: "GBI Baranangsiang Evening Church",
    theme: { bg: "#07080e", accent: "#f0cc50", rgb: "240,204,80" },
    pages: [
      [
        { num: "01", label: "Pelayanan Kedukaan", desc: "Pendampingan dan pelayanan ibadah penghiburan bagi keluarga yang berduka." },
        { num: "02", label: "Ucapan Syukur", desc: "Pelayanan peringatan 40 hari, 100 hari, dan 1 tahun almarhum/ah." },
      ],
      [
        { num: "03", label: "Kunjungan Sakit di RS", desc: "Kunjungan pendoa untuk mendoakan jemaat yang dirawat di rumah sakit." },
        { num: "04", label: "Kunjungan Sakit di Rumah", desc: "Kunjungan dan pendoaan bagi jemaat yang sedang sakit atau dalam pemulihan di rumah." },
      ],
      [
        { num: "05", label: "Pengudusan", desc: "Pengudusan rumah, kantor, tempat usaha, atau pabrik untuk penyerahan kepada Tuhan." },
        { num: "06", label: "Konseling", desc: "Konseling pribadi, pernikahan, dan keluarga bersama hamba Tuhan yang berpengalaman." },
      ],
      [
        { num: "07", label: "Pelayanan Pelepasan", desc: "Pelayanan pelepasan dari ikatan kutuk dan okultisme melalui doa dan kuasa Tuhan." },
        { num: "08", label: "Perjamuan Kudus di Rumah", desc: "Pelayanan perjamuan kudus bagi jemaat lansia atau yang tidak dapat hadir ke gereja." },
      ],
    ],
    contact: "Ps. Thomas Lukiman — 0815-7309-7720",
    note: "Hubungi untuk pelayanan",
    contactQrs: [{ src: "/posters/qr-thomas.webp", label: "Ps. Thomas Lukiman", text: "0815-7309-7720 (WhatsApp)" }],
  },

  // ── 8. CREATIVE ──
  {
    id: "creative",
    title: "Creative\nMinistry",
    sub: "Melayani Tuhan Melalui Seni & Kreativitas",
    theme: { bg: "#141008", accent: "#F8BE58", rgb: "248,190,88" },
    pages: [
      [
        { label: "Choir Dewasa", title: "Paduan Suara", desc: "Pelayanan paduan suara untuk ibadah dan acara gereja.", age: "Usia 17–45 thn · Sabtu 18:30" },
        { label: "Choir Anak", title: "Paduan Suara Anak", desc: "Membentuk karakter anak melalui pelayanan pujian.", age: "Usia 7–13 thn · Sabtu 15:30" },
      ],
      [
        { label: "Balet", title: "Tarian Balet", desc: "Mengekspresikan pujian melalui gerakan balet.", age: "Usia 10 thn ke atas · Sabtu" },
        { label: "Tamborine", title: "Tari Tamborine", desc: "Pelayanan tari tamborine untuk anak hingga dewasa.", age: "Usia 12 thn ke atas · Sabtu" },
      ],
      [
        { label: "Banner", title: "Tari Banner", desc: "Memuliakan Tuhan melalui tarian bendera pujian.", age: "Usia 10 thn ke atas · Sabtu" },
        { label: "Modern Dance", title: "Tarian Modern", desc: "Pelayanan tari kontemporer dan modern untuk ibadah.", age: "Usia 17 thn ke atas · Sabtu" },
      ],
    ],
    contact: "Ibu Fera 0821-1974-9869 · Ibu Lia 0857-7491-0351",
    note: "Latihan setiap Sabtu di Baranangsiang",
    contactQrs: [
      { src: "/posters/qr-cm-fera.webp", label: "Ibu Fera (Choir / Makeup)", text: "0821-1974-9869 (WhatsApp)" },
      { src: "/posters/qr-cm-lia.webp", label: "Ibu Lia (Balet / Tamborine / Banner / Modern Dance)", text: "0857-7491-0351 (WhatsApp)" },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════
// SHARED BACKGROUND
// ═══════════════════════════════════════════════════════════════

function Bg({ rgb, intensity = 0.12 }: { rgb: string; intensity?: number }) {
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 80% 50% at 50% 30%, rgba(${rgb}, ${intensity}) 0%, transparent 70%)` }} />
      {/* <div style={{ position: "absolute", inset: 0, backgroundImage: NOISE_PNG, backgroundRepeat: "repeat", backgroundSize: 200 }} /> */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 85% 85% at 50% 50%, transparent 40%, rgba(0,0,0,0.45) 100%)" }} />
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
// COVER (GSAP animated)
// ═══════════════════════════════════════════════════════════════

function Cover({ highlight, onDone }: { highlight: HighlightDef; onDone: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const { theme, title, sub } = highlight;

  const hasNewline = title.includes("\n");
  const titleSize = hasNewline ? (title.length > 20 ? 36 : 42) : 52;

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const glow = el.querySelector(".c-glow") as HTMLElement;
    const topLine = el.querySelector(".c-top-line") as HTMLElement;
    const titleEl = el.querySelector(".c-title") as HTMLElement;
    const subEl = el.querySelector(".c-sub") as HTMLElement;
    const badge = el.querySelector(".c-badge") as HTMLElement;
    const botLine = el.querySelector(".c-bot-line") as HTMLElement;
    const tl = gsap.timeline({ onComplete: onDone });

    // Glow expands
    tl.fromTo(glow,
      { scale: 0, opacity: 0 },
      { scale: 1, opacity: 1, duration: 1, ease: "power3.out" },
      0,
    );

    // Top accent line draws from center
    tl.fromTo(topLine,
      { scaleX: 0 },
      { scaleX: 1, duration: 0.6, ease: "power2.inOut" },
      0.2,
    );

    // Title slams in from blur
    tl.fromTo(titleEl,
      { opacity: 0, scale: 1.8, filter: "blur(20px)" },
      { opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.9, ease: "power4.out" },
      0.4,
    );

    // Subtitle fades up
    tl.fromTo(subEl,
      { opacity: 0, y: 25 },
      { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" },
      1.1,
    );

    // BEC badge
    tl.fromTo(badge,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" },
      1.4,
    );

    // Bottom accent line
    tl.fromTo(botLine,
      { scaleX: 0 },
      { scaleX: 1, duration: 0.5, ease: "power2.inOut" },
      1.5,
    );

    // Baptisan ornaments
    if (highlight.id === "baptisan") {
      const dove = el.querySelector(".c-dove") as HTMLElement;
      const waterSplash = el.querySelector(".c-water-splash") as HTMLElement;
      if (dove) tl.fromTo(dove, { opacity: 0, y: -50, x: 30, scale: 0.7 }, { opacity: 0.15, y: 0, x: 0, scale: 1, duration: 1.3, ease: "power3.out" }, 0.3);
      if (waterSplash) tl.fromTo(waterSplash, { opacity: 0, y: 50, scale: 0.8 }, { opacity: 0.15, y: 0, scale: 2, duration: 1.2, ease: "power3.out" }, 0.5);
    }

    // KOM book covers
    if (highlight.id === "kom") {
      const komBooks = el.querySelectorAll(".c-kom-book");
      if (komBooks.length) tl.fromTo(komBooks, { opacity: 0, y: 50, scale: 0.6 }, { opacity: 1, y: 0, scale: 1, duration: 0.9, stagger: 0.15, ease: "back.out(1.4)" }, 0.5);
    }

    // Hold
    tl.to({}, { duration: 2.5 });

    return () => { tl.kill(); };
  }, [onDone, theme, title, sub]);

  return (
    <div ref={ref} style={{ position: "absolute", inset: 0, background: theme.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <Bg rgb={theme.rgb} intensity={0.15} />

      {/* Glow */}
      <div className="c-glow" style={{
        position: "absolute",
        width: 300, height: 300,
        borderRadius: "50%",
        background: `radial-gradient(circle, rgba(${theme.rgb}, 0.2) 0%, transparent 70%)`,
        pointerEvents: "none",
      }} />

      {/* Top accent line */}
      <div className="c-top-line" style={{
        position: "absolute", top: 50,
        left: "12%", right: "12%",
        height: 1,
        background: `linear-gradient(90deg, transparent, ${theme.accent}, transparent)`,
        opacity: 0.35,
        transformOrigin: "center",
      }} />

      {/* Title (logo or text) */}
      {highlight.logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="c-title" src={highlight.logo} alt={title} style={{
          height: 70,
          width: "auto",
          objectFit: "contain",
          position: "relative",
          zIndex: 2,
          filter: `drop-shadow(0 2px 12px rgba(${theme.rgb}, 0.3))`,
          opacity: 0,
        }} />
      ) : (
        <div className="c-title" style={{
          fontSize: titleSize,
          fontWeight: 900,
          fontFamily: "'Playfair Display', serif",
          textAlign: "center",
          lineHeight: 1.1,
          background: `linear-gradient(135deg, #ffffff 0%, rgba(${theme.rgb}, 0.9) 100%)`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          position: "relative",
          zIndex: 2,
          padding: "0 36px",
          whiteSpace: "pre-line",
          opacity: 0,
        }}>
          {title}
        </div>
      )}

      {/* Subtitle */}
      <div className="c-sub" style={{
        fontSize: 11,
        fontWeight: 500,
        fontFamily: "'Inter', sans-serif",
        letterSpacing: 2.5,
        textTransform: "uppercase",
        color: `rgba(${theme.rgb}, 0.8)`,
        marginTop: 14,
        position: "relative",
        zIndex: 2,
        textAlign: "center",
        padding: "0 32px",
        opacity: 0,
      }}>
        {sub}
      </div>

      {/* BEC Badge */}
      <div className="c-badge" style={{
        position: "absolute",
        bottom: 50,
        fontSize: 8,
        fontWeight: 600,
        fontFamily: "'Inter', sans-serif",
        letterSpacing: 2.5,
        textTransform: "uppercase",
        color: "rgba(255,255,255,0.75)",
        opacity: 0,
      }}>
        GBI Baranangsiang Evening Church
      </div>

      {/* Bottom accent line */}
      <div className="c-bot-line" style={{
        position: "absolute", bottom: 38,
        left: "12%", right: "12%",
        height: 1,
        background: `linear-gradient(90deg, transparent, ${theme.accent}, transparent)`,
        opacity: 0.35,
        transformOrigin: "center",
      }} />

      {/* Baptisan ornaments */}
      {highlight.id === "baptisan" && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="c-water-splash" src="/posters/baptism-water-splash.webp" alt="" style={{
            position: "absolute", bottom: "18%", left: "50%", transform: "translateX(-50%)",
            width: "55%", opacity: 0,
            filter: `brightness(1.3) saturate(1.5) drop-shadow(0 0 20px rgba(${theme.rgb}, 0.4))`,
            zIndex: 1, pointerEvents: "none",
          }} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="c-dove" src="/posters/baptism-dove.webp" alt="" style={{
            position: "absolute", top: "4%", right: "2%", width: "44%",
            opacity: 0, filter: `brightness(0.85) drop-shadow(0 2px 25px rgba(${theme.rgb}, 0.5))`,
            zIndex: 1, pointerEvents: "none",
          }} />
        </>
      )}

      {/* KOM book covers */}
      {highlight.id === "kom" && (
        <div style={{
          position: "absolute", top: "72%", left: "50%", transform: "translate(-50%, -50%)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1, pointerEvents: "none",
        }}>
          {[
            { src: "/posters/kom100.webp", rotate: -8, top: '10%' },
            { src: "/posters/kom200.webp", rotate: 0 },
            { src: "/posters/kom300.webp", rotate: 8 },
          ].map((book, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} className="c-kom-book" src={book.src} alt="" style={{
              width: 80, height: 97, objectFit: "cover", borderRadius: 6,
              border: `1px solid rgba(${theme.rgb}, 0.25)`,
              transform: `rotate(${book.rotate}deg)`,
              marginLeft: i > 0 ? -10 : 0,
              boxShadow: `0 4px 20px rgba(0,0,0,0.5), 0 0 12px rgba(${theme.rgb}, 0.2)`,
              opacity: 0,
            }} />
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// CARD RENDERER
// ═══════════════════════════════════════════════════════════════

function Card({ data, theme }: { data: CardData; theme: Theme }) {
  // QR card
  if (data.qr) {
    return (
      <div style={{
        background: `rgba(255,255,255,0.03)`,
        border: `1px solid rgba(${theme.rgb}, 0.12)`,
        borderRadius: 12,
        padding: "14px 14px",
        display: "flex",
        alignItems: "center",
        gap: 14,
        flex: 1,
      }}>
        <div style={{ background: "#fff", borderRadius: 8, padding: 4, flexShrink: 0 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={data.qr.src} alt={data.qr.label} style={{ width: 70, height: 70, display: "block", imageRendering: "pixelated" }} />
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", color: theme.accent, marginBottom: 5 }}>{data.qr.label}</div>
          <div style={{ fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.85)", lineHeight: 1.4, whiteSpace: "pre-line" }}>{data.qr.text}</div>
        </div>
      </div>
    );
  }

  // Standard card
  return (
    <div style={{
      background: `rgba(255,255,255,0.03)`,
      border: `1px solid rgba(${theme.rgb}, 0.12)`,
      borderRadius: 12,
      padding: "14px 14px",
      flex: 1,
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
    }}>
      {/* Label with optional service number */}
      {data.num ? (
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <span style={{ fontWeight: 800, fontSize: 17, color: theme.accent, fontFamily: "'Inter', sans-serif" }}>{data.num}</span>
          <span style={{ fontWeight: 700, fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", color: theme.accent, fontFamily: "'Inter', sans-serif" }}>{data.label}</span>
        </div>
      ) : (
        <div style={{ fontWeight: 700, fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", color: theme.accent, marginBottom: 6, fontFamily: "'Inter', sans-serif" }}>{data.label}</div>
      )}

      {/* Title */}
      {data.title && (
        <div style={{ fontWeight: 600, fontSize: 14, color: "rgba(255,255,255,0.95)", marginBottom: 4, lineHeight: 1.3, fontFamily: "'Inter', sans-serif" }}>{data.title}</div>
      )}

      {/* Description */}
      {data.desc && (
        <div style={{ fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.75)", lineHeight: 1.5, whiteSpace: "pre-line", fontFamily: "'Inter', sans-serif" }}>{data.desc}</div>
      )}

      {/* Checklist */}
      {data.items && (
        <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 2 }}>
          {data.items.map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 7 }}>
              <div style={{ width: 4, height: 4, borderRadius: "50%", background: `rgba(${theme.rgb}, 0.5)`, marginTop: 5, flexShrink: 0 }} />
              <span style={{ fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.8)", lineHeight: 1.4, fontFamily: "'Inter', sans-serif" }}>{item}</span>
            </div>
          ))}
        </div>
      )}

      {/* Steps (pathway) */}
      {data.steps && (
        <div style={{ display: "flex", flexDirection: "column", gap: 7, marginTop: 4 }}>
          {data.steps.map((step, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 22, height: 22, borderRadius: "50%",
                background: `rgba(${theme.rgb}, 0.1)`,
                border: `1px solid rgba(${theme.rgb}, 0.25)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 700, fontSize: 11, color: theme.accent, flexShrink: 0,
                fontFamily: "'Inter', sans-serif",
              }}>{step.n}</div>
              <span style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.85)", fontFamily: "'Inter', sans-serif" }}>{step.t}</span>
            </div>
          ))}
        </div>
      )}

      {/* Age badge */}
      {data.age && (
        <div style={{ marginTop: "auto", paddingTop: 8, fontSize: 11, fontWeight: 600, color: theme.accent, fontFamily: "'Inter', sans-serif" }}>{data.age}</div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// DETAIL PAGE (static, for screenshot)
// ═══════════════════════════════════════════════════════════════

function DetailPage({ highlight, pageIndex }: { highlight: HighlightDef; pageIndex: number }) {
  const { theme, title, pages } = highlight;
  const cards = pages[pageIndex];
  const totalPages = pages.length;
  const displayTitle = title.replace(/\n/g, " ");

  return (
    <div style={{ position: "absolute", inset: 0, background: theme.bg, display: "flex", flexDirection: "column" }}>
      <Bg rgb={theme.rgb} />

      {/* Frame */}
      <div style={{ position: "absolute", top: 14, left: 14, right: 14, bottom: 14, border: `1px solid rgba(${theme.rgb}, 0.1)`, pointerEvents: "none", zIndex: 1 }} />

      {/* Top accent line */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${theme.accent} 30%, ${theme.accent} 70%, transparent)`, opacity: 0.45, zIndex: 2 }} />

      {/* Content */}
      <div style={{ position: "relative", zIndex: 10, flex: 1, display: "flex", flexDirection: "column", padding: "28px 18px 20px" }}>
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: 12, paddingBottom: 10,
          borderBottom: `1px solid rgba(${theme.rgb}, 0.1)`,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 22, height: 22, borderRadius: "50%",
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.12)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 800, fontSize: 8, color: "rgba(255,255,255,0.85)",
              letterSpacing: 0.5, fontFamily: "'Inter', sans-serif",
            }}>BEC</div>
            <div style={{
              fontWeight: 700, fontSize: 14,
              fontFamily: "'Playfair Display', serif",
              background: `linear-gradient(135deg, #fff 0%, ${theme.accent} 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>{displayTitle}</div>
          </div>
          <div style={{
            fontSize: 10, fontWeight: 600,
            color: `rgba(${theme.rgb}, 0.6)`,
            letterSpacing: 1,
            fontFamily: "'Inter', sans-serif",
          }}>{pageIndex + 1} / {totalPages}</div>
        </div>

        {/* Cards */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
          {cards.map((card, i) => (
            <Card key={i} data={card} theme={theme} />
          ))}
        </div>

        {/* Spacer at bottom */}
        <div style={{ height: 4 }} />
      </div>

      {/* Bottom accent line */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${theme.accent} 30%, ${theme.accent} 70%, transparent)`, opacity: 0.45, zIndex: 2 }} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// CONTACT PAGE (last page of each highlight)
// ═══════════════════════════════════════════════════════════════

function ContactPage({ highlight }: { highlight: HighlightDef }) {
  const { theme, title, contactQrs, note } = highlight;
  const displayTitle = title.replace(/\n/g, " ");
  const hasMultipleQrs = contactQrs.length > 1;

  return (
    <div style={{ position: "absolute", inset: 0, background: theme.bg, display: "flex", flexDirection: "column" }}>
      <Bg rgb={theme.rgb} intensity={0.18} />

      {/* Frame */}
      <div style={{ position: "absolute", top: 14, left: 14, right: 14, bottom: 14, border: `1px solid rgba(${theme.rgb}, 0.1)`, pointerEvents: "none", zIndex: 1 }} />

      {/* Top accent line */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${theme.accent} 30%, ${theme.accent} 70%, transparent)`, opacity: 0.45, zIndex: 2 }} />

      {/* Content */}
      <div style={{ position: "relative", zIndex: 10, flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "36px 24px", gap: 20 }}>
        {/* Heading */}
        <div style={{ textAlign: "center" }}>
          <div style={{
            fontWeight: 700, fontSize: 10, letterSpacing: 2.5, textTransform: "uppercase",
            color: `rgba(${theme.rgb}, 0.6)`, fontFamily: "'Inter', sans-serif", marginBottom: 6,
          }}>Informasi & Kontak</div>
          <div style={{
            fontWeight: 700, fontSize: 18, fontFamily: "'Playfair Display', serif",
            background: `linear-gradient(135deg, #fff 0%, ${theme.accent} 100%)`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>{displayTitle}</div>
        </div>

        {/* QR Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14, width: "100%", alignItems: "center" }}>
          {contactQrs.map((qr, i) => (
            <div key={i} style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
              background: `rgba(255,255,255,0.03)`, border: `1px solid rgba(${theme.rgb}, 0.12)`,
              borderRadius: 14, padding: hasMultipleQrs ? "14px 18px" : "20px 24px",
              width: "100%", maxWidth: 240,
            }}>
              <div style={{ background: "#fff", borderRadius: 8, padding: 6 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qr.src} alt={qr.label} style={{
                  width: hasMultipleQrs ? 70 : 90,
                  height: hasMultipleQrs ? 70 : 90,
                  display: "block", imageRendering: "pixelated",
                }} />
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{
                  fontWeight: 700, fontSize: 11, color: theme.accent,
                  fontFamily: "'Inter', sans-serif", marginBottom: 3,
                }}>{qr.label}</div>
                <div style={{
                  fontSize: 10, fontWeight: 500, color: "rgba(255,255,255,0.75)",
                  fontFamily: "'Inter', sans-serif", lineHeight: 1.4,
                }}>{qr.text}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Note */}
        <div style={{
          fontSize: 10, fontWeight: 500, color: `rgba(${theme.rgb}, 0.5)`,
          fontFamily: "'Inter', sans-serif", textAlign: "center",
          letterSpacing: 0.5,
        }}>{note}</div>

        {/* Church branding */}
        <div style={{
          position: "absolute", bottom: 30,
          fontSize: 8, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase",
          color: "rgba(255,255,255,0.3)", fontFamily: "'Inter', sans-serif",
        }}>
          GBI Baranangsiang Evening Church
        </div>
      </div>

      {/* Bottom accent line */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${theme.accent} 30%, ${theme.accent} 70%, transparent)`, opacity: 0.45, zIndex: 2 }} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════

export default function HighlightsPage() {
  const [highlightIdx, setHighlightIdx] = useState(0);
  const [pageIdx, setPageIdx] = useState(0); // 0 = cover, 1+ = detail pages
  const [replayKey, setReplayKey] = useState(0);

  const highlight = H[highlightIdx];
  const detailCount = highlight.pages.length;
  const maxPageIdx = detailCount + 1; // 0=cover, 1..detailCount=detail, detailCount+1=contact
  const isContactPage = pageIdx === maxPageIdx;

  const pageLabels = [
    "Cover",
    ...Array.from({ length: detailCount }, (_, i) => `${i + 1} / ${detailCount}`),
    "Kontak",
  ];

  const handleCoverDone = useCallback(() => {
    // Cover animation finished — stay on screen
  }, []);

  const goTo = useCallback((hi: number, pi: number) => {
    const maxP = H[hi].pages.length + 1;
    const clampedPi = Math.min(pi, maxP);
    setHighlightIdx(hi);
    setPageIdx(clampedPi);
    if (clampedPi === 0) setReplayKey((k) => k + 1);
  }, []);

  const replay = useCallback(() => {
    setReplayKey((k) => k + 1);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        if (pageIdx < maxPageIdx) goTo(highlightIdx, pageIdx + 1);
        else if (highlightIdx < H.length - 1) goTo(highlightIdx + 1, 0);
      } else if (e.key === "ArrowLeft") {
        if (pageIdx > 0) goTo(highlightIdx, pageIdx - 1);
        else if (highlightIdx > 0) goTo(highlightIdx - 1, H[highlightIdx - 1].pages.length + 1);
      } else if (e.key === " ") {
        e.preventDefault();
        if (pageIdx === 0) replay();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [highlightIdx, pageIdx, maxPageIdx, goTo, replay]);

  return (
    <div style={{
      position: "fixed", inset: 0,
      display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center",
      gap: 28,
      background: "#0a0a0a",
      fontFamily: "'Inter', system-ui, sans-serif",
      overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Inter:wght@300;400;500;600;700;800;900&display=swap');
      `}</style>

      {/* 9:16 canvas */}
      <div style={{
        position: "relative",
        aspectRatio: "9 / 16",
        height: "min(80vh, 693px)",
        overflow: "hidden",
        borderRadius: 8,
        border: "1px solid rgba(255,255,255,0.08)",
        flexShrink: 0,
      }}>
        {pageIdx === 0 ? (
          <Cover key={`${highlight.id}-${replayKey}`} highlight={highlight} onDone={handleCoverDone} />
        ) : isContactPage ? (
          <ContactPage key={`${highlight.id}-contact`} highlight={highlight} />
        ) : (
          <DetailPage key={`${highlight.id}-${pageIdx}`} highlight={highlight} pageIndex={pageIdx - 1} />
        )}
      </div>

      {/* Controls — right side */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 140 }}>
        {/* Highlight selector */}
        <div>
          <div style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.25)", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8, fontFamily: "'Inter', sans-serif" }}>Highlights</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {H.map((h, i) => (
              <button key={h.id} onClick={() => goTo(i, 0)} style={{
                padding: "6px 12px", borderRadius: 6, border: "none", cursor: "pointer",
                background: i === highlightIdx ? highlight.theme.accent : "transparent",
                color: i === highlightIdx ? highlight.theme.bg : "rgba(255,255,255,0.4)",
                fontSize: 12, fontWeight: i === highlightIdx ? 700 : 400,
                transition: "all 0.2s",
                fontFamily: "'Inter', sans-serif",
                textAlign: "left",
              }}>
                {h.title.replace(/\n/g, " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "rgba(255,255,255,0.06)" }} />

        {/* Page selector */}
        <div>
          <div style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.25)", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8, fontFamily: "'Inter', sans-serif" }}>Pages</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {pageLabels.map((label, i) => (
              <button key={i} onClick={() => goTo(highlightIdx, i)} style={{
                padding: "6px 12px", borderRadius: 6, border: "none", cursor: "pointer",
                background: i === pageIdx ? `rgba(${highlight.theme.rgb}, 0.15)` : "transparent",
                color: i === pageIdx ? highlight.theme.accent : "rgba(255,255,255,0.3)",
                fontSize: 12, fontWeight: i === pageIdx ? 600 : 400,
                transition: "all 0.2s",
                fontFamily: "'Inter', sans-serif",
                textAlign: "left",
              }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Replay */}
        {pageIdx === 0 && (
          <>
            <div style={{ height: 1, background: "rgba(255,255,255,0.06)" }} />
            <button onClick={replay} style={{
              padding: "6px 12px", borderRadius: 6, border: "none", cursor: "pointer",
              background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)",
              fontSize: 12, fontWeight: 600,
              fontFamily: "'Inter', sans-serif",
              textAlign: "left",
            }}>
              Replay
            </button>
          </>
        )}

        {/* Keyboard hints */}
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.15)", lineHeight: 1.6, fontFamily: "'Inter', sans-serif" }}>
          Arrow keys to navigate<br />Space to replay cover
        </div>
      </div>
    </div>
  );
}
