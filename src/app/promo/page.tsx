"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import { TextPlugin } from "gsap/TextPlugin";

gsap.registerPlugin(TextPlugin);

// ── Narration script (Indonesian, ~40s total) ──
const NARRATIONS: Record<string, string> = {
  intro:
    "Helpdesk. Asisten digital GBI Baranangsiang Evening Church.",
  chat:
    "Tanya apa saja tentang gereja, langsung dijawab oleh AI. Jadwal ibadah, syarat baptisan, pemberkatan nikah, semua informasi tersedia.",
  knowledge:
    "Mulai dari jadwal ibadah, pendaftaran baptis, KOM, hingga cara bergabung COOL. Semuanya bisa ditanyakan.",
  forms:
    "Mau daftar baptisan, penyerahan anak, atau M-Class? Langsung isi formulir online dari HP.",
  cta:
    "Semua informasi dan kebutuhan jemaat, ada di helpbec.vercel.app. Scan QR code untuk mulai.",
};

function useNarration() {
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [subtitle, setSubtitle] = useState("");
  const [muted, setMuted] = useState(false);

  const speak = useCallback(
    (sceneId: string) => {
      // Always cancel previous
      window.speechSynthesis?.cancel();

      const text = NARRATIONS[sceneId];
      if (!text) return;

      setSubtitle(text);

      if (muted || !window.speechSynthesis) return;

      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = "id-ID";
      utter.rate = 0.95;
      utter.pitch = 1;

      // Try to pick an Indonesian voice
      const voices = window.speechSynthesis.getVoices();
      const idVoice = voices.find(
        (v) => v.lang.startsWith("id") || v.lang.startsWith("in"),
      );
      if (idVoice) utter.voice = idVoice;

      utter.onend = () => setSubtitle("");
      utterRef.current = utter;
      window.speechSynthesis.speak(utter);
    },
    [muted],
  );

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel();
    setSubtitle("");
  }, []);

  const toggleMute = useCallback(() => {
    setMuted((prev) => {
      if (!prev) window.speechSynthesis?.cancel();
      return !prev;
    });
  }, []);

  return { speak, stop, subtitle, muted, toggleMute };
}

// ── Theme (matches helpbec.vercel.app) ──
const C = {
  bg: "#f5f0ea",
  surface: "#ffffff",
  primary: "#26425e",
  accent: "#b8942e",
  text: "#2a2520",
  muted: "#847a70",
  card: "rgba(0,0,0,0.03)",
  border: "rgba(0,0,0,0.08)",
  chatUser: "#26425e",
  chatBot: "#f0ece6",
};

// ── Scene definitions ──
interface SceneProps {
  playing: boolean;
  onDone: () => void;
}

const SCENES = [
  { id: "intro", label: "Intro" },
  { id: "chat", label: "AI Chat" },
  { id: "knowledge", label: "Knowledge" },
  { id: "forms", label: "Forms" },
  { id: "cta", label: "Penutup" },
];

// ── Scene 0: Intro ──

function IntroScene({ playing, onDone }: SceneProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!playing || !ref.current) return;
    const el = ref.current;
    const logo = el.querySelector(".logo") as HTMLElement;
    const tagline = el.querySelector(".tagline") as HTMLElement;
    const sub = el.querySelector(".sub") as HTMLElement;
    const glow = el.querySelector(".glow") as HTMLElement;

    const tl = gsap.timeline({ onComplete: onDone });

    tl.fromTo(
      glow,
      { scale: 0, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.96, ease: "power3.out" },
      0,
    );
    tl.fromTo(
      logo,
      { opacity: 0, scale: 1.8, filter: "blur(20px)" },
      {
        opacity: 1,
        scale: 1,
        filter: "blur(0px)",
        duration: 0.84,
        ease: "power4.out",
      },
      0.24,
    );
    tl.fromTo(
      tagline,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" },
      0.96,
    );
    tl.fromTo(
      sub,
      { opacity: 0, y: 20 },
      { opacity: 0.6, y: 0, duration: 0.48, ease: "power2.out" },
      1.32,
    );
    tl.to({}, { duration: 2.4 });
    tl.to(el, {
      opacity: 0,
      scale: 1.05,
      filter: "blur(6px)",
      duration: 0.48,
      ease: "power2.in",
    });

    return () => {
      tl.kill();
    };
  }, [playing, onDone]);

  return (
    <div
      ref={ref}
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
      }}
    >
      <div
        className="glow"
        style={{
          position: "absolute",
          width: 300,
          height: 300,
          background: `radial-gradient(circle, rgba(38,66,94,0.12) 0%, transparent 70%)`,
          borderRadius: "50%",
          pointerEvents: "none",
        }}
      />
      <div
        className="logo"
        style={{
          fontSize: 56,
          fontWeight: 800,
          letterSpacing: -2,
          background: `linear-gradient(135deg, ${C.text} 0%, ${C.primary} 50%, ${C.accent} 100%)`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          position: "relative",
          zIndex: 2,
        }}
      >
        Helpdesk
      </div>
      <div
        className="tagline"
        style={{
          fontSize: 16,
          fontWeight: 500,
          color: C.text,
          letterSpacing: 4,
          textTransform: "uppercase",
          position: "relative",
          zIndex: 2,
        }}
      >
        Asisten Digital Gereja
      </div>
      <div
        className="sub"
        style={{
          fontSize: 12,
          color: C.muted,
          position: "relative",
          zIndex: 2,
          textAlign: "center",
          padding: "0 40px",
        }}
      >
        GBI Baranangsiang Evening Church
      </div>
    </div>
  );
}

// ── Scene 1: AI Chat (multi-topic) ──

const chatExchanges = [
  {
    q: "Kapan jadwal ibadah Minggu?",
    a: "Jadwal Ibadah GBI Baranangsiang (GBI BEC/Sukawarna): setiap hari Minggu pukul 17:00 WIB. Lokasi: Jl. Baranang Siang No.8, Kb. Pisang, Kec. Sumur Bandung, Kota Bandung, Jawa Barat 40112.",
  },
  {
    q: "Saya ingin dibaptis. Apa syarat baptisan air?",
    a: "Baptisan air di GBI BEC dapat ",
    highlight: "diikuti oleh usia 12 tahun ke atas ",
    aSuffix:
      " dengan persyaratan mengisi formulir, pas foto 3x4, dan membawa baju ganti serta handuk. Baptisan diadakan setiap 2 bulan sekali secara gratis, dan peserta harus hadir satu jam sebelum pelaksanaan. Surat baptis dapat diambil setelah mengikuti KOM 100.",
  },
  {
    q: "Apa saja syarat pemberkatan nikah?",
    a: "Pemberkatan pernikahan di GBI Sukawarna mensyaratkan calon mempelai adalah ",
    highlight: "jemaat dengan KAJ, telah mengikuti KOM 100, ",
    aSuffix: "serta mengumpulkan dokumen lengkap minimal 5 bulan sebelum tanggal pernikahan.",
  },
];

function ChatScene({ playing, onDone }: SceneProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!playing || !ref.current) return;
    const el = ref.current;
    const headline = el.querySelector(".headline") as HTMLElement;
    const phone = el.querySelector(".phone") as HTMLElement;
    const chatGroups = el.querySelectorAll(".chat-group");
    const typingEls = el.querySelectorAll(".typing");

    const tl = gsap.timeline({ onComplete: onDone });

    // Headline
    tl.fromTo(
      headline,
      { opacity: 0, y: -30 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" },
      0,
    );

    // Phone slides up
    tl.fromTo(
      phone,
      { opacity: 0, y: 60 },
      { opacity: 1, y: 0, duration: 0.84, ease: "power3.out" },
      0.24,
    );

    // Animate each exchange — fully clear between each
    let t = 1.08;
    chatGroups.forEach((group, i) => {
      const userMsg = group.querySelector(".user-msg") as HTMLElement;
      const botMsg = group.querySelector(".bot-msg") as HTMLElement;
      const typing = typingEls[i] as HTMLElement;

      // Show this group
      tl.set(group, { opacity: 1 }, t);

      // User message pops in
      tl.fromTo(
        userMsg,
        { opacity: 0, y: 15, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.36, ease: "back.out(2)" },
        t,
      );
      t += 0.6;

      // Typing indicator
      tl.fromTo(typing, { opacity: 0 }, { opacity: 1, duration: 0.18 }, t);
      t += 0.84;
      tl.to(
        typing,
        { opacity: 0, height: 0, marginBottom: 0, padding: 0, duration: 0.12 },
        t,
      );
      t += 0.12;

      // Bot response (replaces typing position)
      tl.fromTo(
        botMsg,
        { opacity: 0, y: 15, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.42, ease: "back.out(2)" },
        t,
      );
      t += 0.48;

      // Hold, then clear before next
      if (i < chatExchanges.length - 1) {
        t += 0.96;
        tl.to(group, { opacity: 0, duration: 0.3, ease: "power2.in" }, t);
        t += 0.36;
      }
    });

    // Hold on final exchange
    tl.to({}, { duration: 1.8 });

    // Exit
    tl.to(el, { opacity: 0, scale: 0.98, duration: 0.42, ease: "power2.in" });

    return () => {
      tl.kill();
    };
  }, [playing, onDone]);

  return (
    <div
      ref={ref}
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
        gap: 24,
      }}
    >
      {/* Headline */}
      <div style={{ textAlign: "center" }}>
        <div
          className="headline"
          style={{
            fontSize: 28,
            fontWeight: 700,
            lineHeight: 1.2,
            color: C.text,
            opacity: 0,
          }}
        >
          Tanya apa saja
          <br />
          <span style={{ color: C.primary }}>tentang gereja</span>
        </div>
      </div>

      {/* Phone mockup */}
      <div
        className="phone"
        style={{
          width: "85%",
          maxWidth: 320,
          background: C.surface,
          borderRadius: 24,
          border: `1px solid ${C.border}`,
          padding: 14,
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 4px 40px rgba(0,0,0,0.08)",
          flex: "0 1 auto",
          maxHeight: 520,
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "6px 0 10px",
            borderBottom: `1px solid ${C.border}`,
            marginBottom: 10,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${C.primary}, ${C.accent})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              fontWeight: 700,
              color: "#fff",
            }}
          >
            B
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>
              Helpdesk
            </div>
            <div style={{ fontSize: 9, color: "#22c55e" }}>Online</div>
          </div>
        </div>

        {/* Chat exchanges — stacked absolutely to prevent layout shift */}
        <div
          style={{ position: "relative", overflow: "hidden", minHeight: 280 }}
        >
          {chatExchanges.map((ex, i) => (
            <div
              key={i}
              className="chat-group"
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                gap: 6,
                opacity: i === 0 ? 1 : 0,
              }}
            >
              <div
                className="user-msg"
                style={{
                  alignSelf: "flex-end",
                  background: C.chatUser,
                  color: "#ffffff",
                  padding: "7px 11px",
                  borderRadius: "12px 12px 4px 12px",
                  fontSize: 11,
                  maxWidth: "80%",
                  opacity: 0,
                }}
              >
                {ex.q}
              </div>

              <div
                className="typing"
                style={{
                  alignSelf: "flex-start",
                  background: C.chatBot,
                  padding: "7px 12px",
                  borderRadius: "12px 12px 12px 4px",
                  fontSize: 11,
                  color: C.muted,
                  opacity: 0,
                }}
              >
                <span style={{ animation: "pulse 1s infinite" }}>●</span>
                <span style={{ animation: "pulse 1s infinite 0.2s" }}> ●</span>
                <span style={{ animation: "pulse 1s infinite 0.4s" }}> ●</span>
              </div>

              <div
                className="bot-msg"
                style={{
                  alignSelf: "flex-start",
                  background: C.chatBot,
                  color: C.text,
                  padding: "8px 11px",
                  borderRadius: "12px 12px 12px 4px",
                  fontSize: 11,
                  maxWidth: "88%",
                  lineHeight: 1.45,
                  opacity: 0,
                }}
              >
                {ex.a}{" "}
                <span style={{ color: C.accent, fontWeight: 600 }}>
                  {ex.highlight}
                </span>{" "}
                {ex.aSuffix}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Scene 2: What you can ask ──

const questions = [
  "Ibadah jam berapa?",
  "Cara daftar baptis?",
  "Jadwal KOM kapan?",
  "Syarat nikah apa saja?",
  "Mau serahkan anak",
  "Kontak siapa untuk pelayanan?",
  "Cara bergabung COOL?",
];

function KnowledgeScene({ playing, onDone }: SceneProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!playing || !ref.current) return;
    const el = ref.current;
    const heading = el.querySelector(".heading") as HTMLElement;
    const lines = el.querySelectorAll(".q-line");
    const footer = el.querySelector(".footer") as HTMLElement;

    const tl = gsap.timeline({ onComplete: onDone });

    tl.fromTo(
      heading,
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" },
      0,
    );

    // Questions cascade in like someone is typing them
    lines.forEach((line, i) => {
      tl.fromTo(
        line,
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.42, ease: "power2.out" },
        0.6 + i * 0.5,
      );
    });

    tl.fromTo(
      footer,
      { opacity: 0, y: 10 },
      { opacity: 0.6, y: 0, duration: 0.48, ease: "power2.out" },
      0.6 + questions.length * 0.5,
    );

    tl.to({}, { duration: 2.4 });
    tl.to(el, { opacity: 0, y: -20, duration: 0.42, ease: "power2.in" });

    return () => {
      tl.kill();
    };
  }, [playing, onDone]);

  return (
    <div
      ref={ref}
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "40px 32px",
        gap: 32,
      }}
    >
      <div className="heading" style={{ opacity: 0 }}>
        <div
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: C.text,
            lineHeight: 1.3,
          }}
        >
          Mau tanya soal gereja?
        </div>
        <div style={{ fontSize: 14, color: C.muted, marginTop: 6 }}>
          Langsung tanya, langsung dijawab.
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {questions.map((q, i) => (
          <div
            key={i}
            className="q-line"
            style={{
              fontSize: 17,
              fontWeight: 500,
              color: C.text,
              opacity: 0,
              paddingLeft: 16,
              borderLeft: `2px solid ${C.primary}`,
            }}
          >
            {q}
          </div>
        ))}
      </div>

      <div
        className="footer"
        style={{ fontSize: 13, color: C.muted, opacity: 0 }}
      >
        ...dan masih banyak lagi
      </div>
    </div>
  );
}

// ── Scene 3: Forms ──

const formItems = [
  { name: "Daftar Baptisan", desc: "Langsung dari HP" },
  { name: "Penyerahan Anak", desc: "Isi data lengkap online" },
  { name: "Daftar M-Class", desc: "Kelas membership" },
];

function FormsScene({ playing, onDone }: SceneProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!playing || !ref.current) return;
    const el = ref.current;
    const heading = el.querySelector(".heading") as HTMLElement;
    const cards = el.querySelectorAll(".form-item");
    const note = el.querySelector(".note") as HTMLElement;

    const tl = gsap.timeline({ onComplete: onDone });

    tl.fromTo(
      heading,
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" },
      0,
    );

    cards.forEach((card, i) => {
      tl.fromTo(
        card,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.48, ease: "power3.out" },
        0.48 + i * 0.5,
      );
    });

    tl.fromTo(
      note,
      { opacity: 0, y: 10 },
      { opacity: 0.6, y: 0, duration: 0.48, ease: "power2.out" },
      0.48 + formItems.length * 0.5 + 0.24,
    );

    tl.to({}, { duration: 2.4 });
    tl.to(el, { opacity: 0, scale: 0.98, duration: 0.42, ease: "power2.in" });

    return () => {
      tl.kill();
    };
  }, [playing, onDone]);

  return (
    <div
      ref={ref}
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "40px 32px",
        gap: 24,
      }}
    >
      <div className="heading" style={{ opacity: 0 }}>
        <div
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: C.text,
            lineHeight: 1.3,
          }}
        >
          Mau daftar?
          <br />
          <span style={{ color: C.primary }}>Tinggal isi.</span>
        </div>
        <div style={{ fontSize: 14, color: C.muted, marginTop: 6 }}>
          Tidak perlu datang ke gereja dulu.
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {formItems.map((f, i) => (
          <div
            key={i}
            className="form-item"
            style={{
              padding: "14px 16px",
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: 12,
              opacity: 0,
            }}
          >
            <div style={{ fontSize: 15, fontWeight: 600, color: C.text }}>
              {f.name}
            </div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
              {f.desc}
            </div>
          </div>
        ))}
      </div>

      <div
        className="note"
        style={{ fontSize: 13, color: C.muted, opacity: 0 }}
      >
        Bisa diisi kapan saja, dari mana saja.
      </div>
    </div>
  );
}

// ── Scene 4: CTA ──

function CTAScene({ playing, onDone }: SceneProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!playing || !ref.current) return;
    const el = ref.current;
    const title = el.querySelector(".cta-title") as HTMLElement;
    const qr = el.querySelector(".cta-qr") as HTMLElement;
    const url = el.querySelector(".cta-url") as HTMLElement;
    const sub = el.querySelector(".cta-sub") as HTMLElement;

    const tl = gsap.timeline({ onComplete: onDone });

    // 1. Title appears
    tl.fromTo(
      title,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.84, ease: "power3.out" },
      0.3,
    );

    // Hold on title
    tl.to({}, { duration: 1.5 });

    // Hide title
    tl.to(title, { opacity: 0, y: -15, duration: 0.4, ease: "power2.in" });

    // 2. QR code
    tl.fromTo(
      qr,
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.5)" },
      "+=0.2",
    );

    // 3. URL below QR
    tl.fromTo(
      url,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
      "+=0.3",
    );

    // 4. Church name
    tl.fromTo(
      sub,
      { opacity: 0, y: 10 },
      { opacity: 0.6, y: 0, duration: 0.48, ease: "power2.out" },
      "+=0.3",
    );

    // Hold
    tl.to({}, { duration: 3 });

    return () => {
      tl.kill();
    };
  }, [playing, onDone]);

  return (
    <div
      ref={ref}
      style={{
        position: "absolute",
        inset: 0,
      }}
    >
      {/* Title — centered on its own */}
      <div
        className="cta-title"
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          flexDirection: "column",
          justifyContent: "center",
          padding: "40px 28px",
          fontSize: 28,
          fontWeight: 800,
          color: C.text,
          textAlign: "center",
          lineHeight: 1.35,
          opacity: 0,
        }}
      >
        Semua informasi GBI BEC dan semua kebutuhan jemaat,{" "}
        <span style={{ color: C.accent }}>ada di sini</span>
      </div>

      {/* QR group — centered on its own */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="cta-qr"
          src="/posters/qr-helpbec.png"
          alt="QR helpbec"
          style={{
            width: 140,
            height: 140,
            borderRadius: 12,
            opacity: 0,
            background: C.surface,
            padding: 8,
            border: `1px solid ${C.border}`,
          }}
        />
        <div
          className="cta-url"
          style={{
            fontSize: 18,
            color: C.accent,
            fontWeight: 700,
            letterSpacing: 1,
            opacity: 0,
          }}
        >
          helpbec.vercel.app
        </div>
        <div
          className="cta-sub"
          style={{
            fontSize: 12,
            color: C.muted,
            opacity: 0,
            textAlign: "center",
          }}
        >
          GBI Baranangsiang Evening Church
        </div>
      </div>
    </div>
  );
}

// ── Control Bar (outside recording frame) ──

function ControlBar({
  scenes,
  current,
  onSelect,
  autoPlay,
  onToggleAuto,
  muted,
  onToggleMute,
}: {
  scenes: typeof SCENES;
  current: number;
  onSelect: (i: number) => void;
  autoPlay: boolean;
  onToggleAuto: () => void;
  muted: boolean;
  onToggleMute: () => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        padding: "10px 16px",
        flexWrap: "wrap",
      }}
    >
      <button
        onClick={onToggleAuto}
        style={{
          padding: "6px 14px",
          borderRadius: 8,
          border: "none",
          cursor: "pointer",
          background: autoPlay ? C.primary : "rgba(0,0,0,0.05)",
          color: autoPlay ? "#fff" : C.muted,
          fontSize: 12,
          fontWeight: 600,
          marginRight: 4,
          transition: "all 0.2s",
        }}
      >
        {autoPlay ? "⏸ Pause" : "▶ Play"}
      </button>
      <button
        onClick={onToggleMute}
        style={{
          padding: "6px 10px",
          borderRadius: 8,
          border: "none",
          cursor: "pointer",
          background: muted ? "rgba(220,50,50,0.1)" : "rgba(0,0,0,0.05)",
          color: muted ? "#c33" : C.muted,
          fontSize: 12,
          fontWeight: 600,
          marginRight: 8,
          transition: "all 0.2s",
        }}
      >
        {muted ? "🔇" : "🔊"}
      </button>
      {scenes.map((s, i) => (
        <button
          key={s.id}
          onClick={() => onSelect(i)}
          style={{
            padding: "6px 12px",
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
            background:
              i === current ? "rgba(38,66,94,0.12)" : "rgba(0,0,0,0.03)",
            color: i === current ? C.primary : C.muted,
            fontSize: 11,
            fontWeight: i === current ? 600 : 400,
            transition: "all 0.2s",
          }}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}

// ── Director ──

export default function PromoPage() {
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [autoPlay, setAutoPlay] = useState(true);
  const { speak, stop, subtitle, muted, toggleMute } = useNarration();

  const sceneComponents = [
    IntroScene,
    ChatScene,
    KnowledgeScene,
    FormsScene,
    CTAScene,
  ];

  // Trigger narration when scene changes and is playing
  useEffect(() => {
    if (playing) {
      speak(SCENES[current].id);
    }
    return () => stop();
  }, [current, playing, speak, stop]);

  // Load voices (some browsers load async)
  useEffect(() => {
    window.speechSynthesis?.getVoices();
    const handler = () => window.speechSynthesis?.getVoices();
    window.speechSynthesis?.addEventListener?.("voiceschanged", handler);
    return () =>
      window.speechSynthesis?.removeEventListener?.("voiceschanged", handler);
  }, []);

  const next = useCallback(() => {
    setCurrent((prev) => {
      const n = prev + 1;
      if (n >= SCENES.length) {
        setAutoPlay(false);
        setPlaying(false);
        return prev;
      }
      setPlaying(true);
      return n;
    });
  }, []);

  const handleDone = useCallback(() => {
    setPlaying(false);
    if (autoPlay) {
      setTimeout(() => next(), 250);
    }
  }, [autoPlay, next]);

  const goToScene = useCallback(
    (i: number) => {
      stop();
      setCurrent(i);
      setPlaying(true);
    },
    [stop],
  );

  const toggleAuto = useCallback(() => {
    setAutoPlay((prev) => {
      const newVal = !prev;
      if (newVal) {
        setPlaying(true);
      } else {
        stop();
      }
      return newVal;
    });
  }, [stop]);

  // Keyboard nav
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight")
        goToScene(Math.min(current + 1, SCENES.length - 1));
      else if (e.key === "ArrowLeft") goToScene(Math.max(current - 1, 0));
      else if (e.key === " ") {
        e.preventDefault();
        toggleAuto();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [current, goToScene, toggleAuto]);

  const SceneComponent = sceneComponents[current];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: C.bg,
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        overflow: "hidden",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        @keyframes pulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }
      `}</style>

      {/* 9:16 recording canvas */}
      <div
        style={{
          position: "relative",
          aspectRatio: "9 / 16",
          height: "100vh",
          overflow: "hidden",
          border: "1px solid rgba(0,0,0,0.15)",
        }}
      >
        <SceneComponent playing={playing} onDone={handleDone} />

        {/* Subtitle overlay */}
        {subtitle && (
          <div
            style={{
              position: "absolute",
              bottom: 40,
              left: 16,
              right: 16,
              textAlign: "center",
              zIndex: 50,
              pointerEvents: "none",
            }}
          >
            <span
              style={{
                display: "inline-block",
                background: "rgba(0,0,0,0.65)",
                color: "#fff",
                fontSize: 13,
                fontWeight: 500,
                padding: "6px 14px",
                borderRadius: 8,
                lineHeight: 1.5,
                maxWidth: "90%",
              }}
            >
              {subtitle}
            </span>
          </div>
        )}
      </div>

      {/* Controls below the canvas */}
      <ControlBar
        scenes={SCENES}
        current={current}
        onSelect={goToScene}
        autoPlay={autoPlay}
        onToggleAuto={toggleAuto}
        muted={muted}
        onToggleMute={toggleMute}
      />
    </div>
  );
}
