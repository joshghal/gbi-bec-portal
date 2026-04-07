'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import gsap from 'gsap'

// ─── Design tokens ────────────────────────────────────────────────
const C = {
  bg:         '#f7f5f2',
  surface:    '#ffffff',
  surfaceB:   '#f0ede8',
  border:     '#ddd8d0',
  gold:       '#9a7230',
  goldBg:     '#fdf6e8',
  white:      '#1a1714',
  muted:      '#6b6460',
  dim:        '#b8b0a6',
  teal:       '#2e7a94',
  tealBg:     '#eaf4f8',
  green:      '#2e7a56',
  greenBg:    '#eaf5ee',
  red:        '#8b3a3a',
  redBg:      '#faeaea',
} as const

const f = {
  sans:  'var(--font-plus-jakarta), system-ui, sans-serif',
  serif: 'var(--font-judson), Georgia, serif',
}

const N = 12

// ─── Atoms ────────────────────────────────────────────────────────

function Num({ n }: { n: number }) {
  return (
    <div style={{
      position: 'absolute', top: 28, right: 36,
      fontFamily: f.sans, fontSize: 16, color: C.muted,
      letterSpacing: '0.2em', fontWeight: 500, userSelect: 'none',
    }}>
      {String(n).padStart(2, '0')}
      <span style={{ color: C.dim, margin: '0 6px' }}>·</span>
      {String(N).padStart(2, '0')}
    </div>
  )
}

function GoldBar({ w = 44 }: { w?: number }) {
  return (
    <div style={{
      width: w, height: 2, background: C.gold,
      borderRadius: 1, marginBottom: 20,
    }} />
  )
}

function Chip({ label, color = C.gold }: { label: string; color?: string }) {
  return (
    <span style={{
      display: 'inline-block', padding: '4px 12px', borderRadius: 100,
      border: `1px solid ${color}`, color,
      fontSize: 16, fontFamily: f.sans, letterSpacing: '0.1em',
      fontWeight: 700, textTransform: 'uppercase',
    }}>
      {label}
    </span>
  )
}

function Title({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <h2 className={`s-title ${className}`} style={{
      fontFamily: f.serif, fontSize: 'clamp(24px,2.6vw,46px)',
      fontWeight: 700, color: C.white, lineHeight: 1.25, margin: 0,
    }}>
      {children}
    </h2>
  )
}

function Body({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <p className={`s-sub ${className}`} style={{
      fontFamily: f.sans, fontSize: 'clamp(16px,1.3vw,18px)',
      color: C.muted, lineHeight: 1.75, margin: 0, marginTop: 14,
    }}>
      {children}
    </p>
  )
}

function FeatureRow({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="s-item" style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
      <div style={{
        width: 34, height: 34, borderRadius: 8, background: C.surfaceB,
        border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: 16, flexShrink: 0, marginTop: 1,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ color: C.white, fontSize: 16, fontWeight: 600, fontFamily: f.sans }}>
          {title}
        </div>
        <div style={{ color: C.muted, fontSize: 16, fontFamily: f.sans, lineHeight: 1.55, marginTop: 2 }}>
          {desc}
        </div>
      </div>
    </div>
  )
}

function MiniScreen({ url, children, style, className }: {
  url?: string; children: React.ReactNode; style?: React.CSSProperties; className?: string
}) {
  return (
    <div className={className} style={{
      background: C.surface, border: `1px solid ${C.border}`,
      borderRadius: 10, overflow: 'hidden',
      ...style,
    }}>
      {url && (
        <div style={{
          background: C.surfaceB, borderBottom: `1px solid ${C.border}`,
          padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 7,
        }}>
          <div style={{ display: 'flex', gap: 4 }}>
            {['#e57373', '#ffb74d', '#81c784'].map((c, i) => (
              <div key={i} style={{ width: 7, height: 7, borderRadius: 100, background: c }} />
            ))}
          </div>
          <div style={{
            flex: 1, background: C.surface, border: `1px solid ${C.border}`,
            borderRadius: 3, padding: '2px 7px',
            fontSize: 10, fontFamily: f.sans, color: C.dim,
          }}>
            {url}
          </div>
        </div>
      )}
      {children}
    </div>
  )
}

// ─── Animation hook ───────────────────────────────────────────────
function useSlideAnim(ref: { current: HTMLDivElement | null }) {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
    const q = (cls: string) => el.querySelectorAll(cls)
    const titles = q('.s-title')
    const subs   = q('.s-sub')
    const items  = q('.s-item')
    const cards  = q('.s-card')
    if (titles.length) tl.fromTo(titles, { y: 28, opacity: 0 }, { y: 0, opacity: 1, duration: 0.65 }, 0)
    if (subs.length)   tl.fromTo(subs,   { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.06 }, 0.15)
    if (items.length)  tl.fromTo(items,  { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, stagger: 0.07 }, 0.28)
    if (cards.length)  tl.fromTo(cards,  { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, stagger: 0.09 }, 0.22)
    return () => { tl.kill() }
  }, [])
}

// ─── SLIDE 01 — Opening ───────────────────────────────────────────
function Slide01() {
  const ref = useRef<HTMLDivElement>(null)
  useSlideAnim(ref)
  return (
    <div ref={ref} style={{
      position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: 'clamp(40px,5vw,80px)',
    }}>
      <Num n={1} />
      <div style={{
        position: 'absolute', inset: 0,
        background: C.goldBg,
        pointerEvents: 'none',
      }} />
      <div className="s-sub" style={{ marginBottom: 28 }}>
        <Chip label="Portal GBI Baranangsiang Evening Church" />
      </div>
      <div style={{ textAlign: 'center' }}>
        <Title>
          Semua ini bermula dari<br />
          <span style={{ color: C.gold }}>satu kebutuhan yang sederhana.</span>
        </Title>
      </div>
      <div className="s-sub" style={{
        marginTop: 40, display: 'flex', alignItems: 'center', gap: 14,
      }}>
        <div style={{ width: 36, height: 1, background: C.border }} />
        <span style={{
          fontSize: 16, fontFamily: f.sans, color: C.dim,
          letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: 0,
        }}>
          Bandung · 2025
        </span>
        <div style={{ width: 36, height: 1, background: C.border }} />
      </div>
    </div>
  )
}

// ─── SLIDE 02 — The problem ───────────────────────────────────────
function Slide02() {
  const ref = useRef<HTMLDivElement>(null)
  useSlideAnim(ref)
  const convos = [
    { q: 'Baptis kapan ya kak?', a: 'Sebentar, saya coba tanya dulu ke rekan saya ya..' },
    { q: 'Syarat penyerahan anak apa saja dan bagaimana pendaftarannya?', a: 'Ada formulirnya, tapi saya lupa di mana' },
  ]
  return (
    <div ref={ref} style={{
      position: 'absolute', inset: 0, display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      padding: 'clamp(40px,5vh,64px) clamp(48px,5vw,80px)',
      gap: 'clamp(32px,4vw,64px)', alignItems: 'center',
    }}>
      <Num n={2} />
      <div>
        <GoldBar />
        <Title>Tidak semua pekerja memiliki informasi seputar Gereja yang sama</Title>
        <Body>
          Setiap minggu, pertanyaan yang sama dijawab dengan cara yang berbeda oleh orang yang berbeda.
          Terkadang informasi ini terpisah-pisah dan hanya diketahui oleh beberapa pekerja saja. 
        </Body>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {convos.map(({ q, a }, i) => (
          <div key={i} className="s-card" style={{
            background: C.surface, border: `1px solid ${C.border}`,
            borderRadius: 12, padding: '14px 16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
              <div style={{
                width: 26, height: 26, borderRadius: 100, background: C.tealBg,
                border: `1px solid ${C.teal}`, display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 16, color: C.teal, flexShrink: 0, fontFamily: f.sans, fontWeight: 600,
              }}>J</div>
              <div style={{ fontSize: 16, color: C.white, fontFamily: f.sans, lineHeight: 1.45, paddingTop: 4 }}>
                {q}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, justifyContent: 'flex-end' }}>
              <div style={{
                fontSize: 16, color: C.muted, fontFamily: f.sans,
                lineHeight: 1.45, paddingTop: 4, textAlign: 'right',
              }}>{a}</div>
              <div style={{
                width: 26, height: 26, borderRadius: 100, background: C.goldBg,
                border: `1px solid ${C.gold}`, display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 16, color: C.gold, flexShrink: 0, fontFamily: f.sans, fontWeight: 600,
              }}>D</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── SLIDE 03 — The chatbot answer ───────────────────────────────
function Slide03() {
  const ref = useRef<HTMLDivElement>(null)
  useSlideAnim(ref)
  return (
    <div ref={ref} style={{
      position: 'absolute', inset: 0, display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      padding: 'clamp(40px,5vh,64px) clamp(48px,5vw,80px)',
      gap: 'clamp(32px,4vw,60px)', alignItems: 'center',
    }}>
      <Num n={3} />
      <div>
        <GoldBar />
        <Title>Bagaimana kalau ada alat yang bisa menjawab semua pertanyaan jemaat?</Title>
        <Body>
          Satu sumber informasi yang bisa diakses kapan saja,
          dengan jawaban yang konsisten untuk semua.
        </Body>
        <div style={{ marginTop: 28 }}>
          <FeatureRow icon="📚" title="Sumber Pengetahuan Gereja" desc="Info Gereja dikumpulkan di satu tempat, bisa diperbarui kapan saja" />
          <FeatureRow icon="⚡" title="Aktif 24/7" desc="Menjawab tanpa perlu admin aktif di setiap saat" />
        </div>
      </div>
      <div className="s-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Three-phone scene */}
        <div style={{ position: 'relative', width: 540, height: 620, flexShrink: 0 }}>

          {/* LEFT tilted phone image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/phone-left.webp" alt="" style={{
            position: 'absolute', left: -50, top: 10,
            width: 320, objectFit: 'contain',
            transform: 'rotate(-8deg)',
            zIndex: 0,
          }} />

          {/* RIGHT tilted phone image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/phone-right.webp" alt="" style={{
            position: 'absolute', right: -50, top: 10,
            width: 300, objectFit: 'contain',
            transform: 'rotate(8deg)',
            zIndex: 0,
          }} />

          {/* CENTER video phone */}
          <div style={{
            position: 'absolute', left: '50%', top: 0,
            transform: 'translateX(-50%)',
            width: 280, height: 600,
            background: '#1c1c1e',
            borderRadius: 28,
            boxShadow: 'none',
            padding: 8,
            zIndex: 1,
          }}>
            <div style={{ width: '100%', height: '100%', borderRadius: 22, overflow: 'hidden', background: '#000' }}>
              <video src="/chat.mp4" autoPlay loop muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ position: 'absolute', right: -3, top: 110, width: 3, height: 58, background: '#1c1c1e', borderRadius: '0 2px 2px 0' }} />
            <div style={{ position: 'absolute', left: -3, top: 90, width: 3, height: 34, background: '#1c1c1e', borderRadius: '2px 0 0 2px' }} />
            <div style={{ position: 'absolute', left: -3, top: 134, width: 3, height: 34, background: '#1c1c1e', borderRadius: '2px 0 0 2px' }} />
          </div>

        </div>
      </div>
    </div>
  )
}

// ─── SLIDE 04 — Growth moment ────────────────────────────────────
function Slide04() {
  const ref = useRef<HTMLDivElement>(null)
  useSlideAnim(ref)
  return (
    <div ref={ref} style={{
      position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '20px',
      gap: 'clamp(24px,3vh,40px)',
      width: '100%'
    }}>
      <Num n={4} />
      <div style={{ textAlign: 'center' }} className='w-full'>
        <div style={{ display: 'flex', justifyContent: 'center' }}><GoldBar /></div>
        <Title className=''>
          Apakah AI bisa menjawab pertanyaan dengan akurat?
        </Title>
        <Body>Bisa, Kuncinya berada pada basis pengetahuan dikelola dan diperkaya secara terus menerus</Body>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12, width: '100%' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/admin-kb.png" alt="" style={{ gridColumn: '1 / -1', width: '70%', margin: '0 auto', borderRadius: 12, objectFit: 'contain' }} />
      </div>
    </div>
  )
}

// ─── SLIDE 05 — Forms ─────────────────────────────────────────────
function Slide05() {
  const ref = useRef<HTMLDivElement>(null)
  useSlideAnim(ref)
  return (
    <div ref={ref} className='flex flex-col items-center justify-center p-[40px]'>
      <Num n={5} />

      {/* Left — text */}
      <div className='flex flex-col gap-5 items-center justify-center'>
        <GoldBar />
        <Title className='text-center'>Bukan hanya sebagai tempat tanya-jawab <br></br>— tapi juga sebagai sarana pendaftaran untuk jemaat</Title>
        <Body>Jemaat dapat mengisi form melalui percakapan AI atau melalui link langsung.</Body>
        <div className='flex flex-col gap-2 items-center justify-center mt-[24px] mb-[28px]'>
          <div style={{ fontSize: 14, fontFamily: f.sans, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
            Form yang kini tersedia
          </div>
          <div className='flex flex-row gap-5'>
            {['Baptisan Air', 'M-Class', 'Penyerahan Anak'].map(name => (
              <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.gold, flexShrink: 0 }} />
                <span style={{ fontSize: 14, fontFamily: f.sans, color: C.white, fontWeight: 500 }}>{name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — two portrait video panels sized to video */}
      <div className='flex w-5/6 flex-row'>
        {[
          { src: '/form-chat.mp4', label: 'Via percakapan AI', color: C.muted },
          { src: '/form-direct.mp4', label: 'Via link langsung', color: C.muted },
        ].map(({ src, label, color }) => (
          <div key={src} className='flex flex-1 w-full' style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
            <div style={{ width: 560, height: 426, borderRadius: 14, overflow: 'hidden', border: `1px solid ${C.border}` }}>
              <video src={src} autoPlay loop muted playsInline className='scale-110 origin-bottom'
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0 }} />
              <span style={{ fontSize: 14, fontFamily: f.sans, color, fontWeight: 600 }}>{label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* empty third column for grid balance */}
      <div />
    </div>
  )
}

// ─── SLIDE 06 ─────────────────────────────────────────────────────
function Slide06() {
  const ref = useRef<HTMLDivElement>(null)
  useSlideAnim(ref)
  return (
    <div ref={ref} className='flex flex-col items-center justify-center p-[40px]'>
      <Num n={6} />

      <div className='flex flex-col gap-5 items-center justify-center'>
        <GoldBar />
        <Title className='text-center'>Progress yang dapat dipantau jemaat<br />dan mempermudah operasional pekerja</Title>
        <Body className='text-center'>Pengelolaan, pendataan, pemantauan, pelaporan dan pencetakan<br />dilakukan dalam satu sistem yang sama</Body>
      </div>

      <div className='mt-[28px]' style={{ borderRadius: 14, overflow: 'hidden', border: `1px solid ${C.border}` }}>
        <video src='/e2e-form-cropped.mp4' autoPlay loop muted playsInline
          style={{ width: 900, display: 'block' }} />
      </div>
    </div>
  )
}

// ─── SLIDE 07 — Self-service ──────────────────────────────────────
function Slide07() {
  const ref = useRef<HTMLDivElement>(null)
  useSlideAnim(ref)
  return (
    <div ref={ref} style={{
      position: 'absolute', inset: 0, display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      padding: 'clamp(40px,5vh,64px) clamp(48px,5vw,80px)',
      gap: 'clamp(32px,4vw,60px)', alignItems: 'center',
    }}>
      <Num n={7} />
      <div>
        <GoldBar />
        <Title>Setelah mendaftar, jemaat bisa memantau prosesnya sendiri</Title>
        <Body>Tidak perlu menghubungi admin hanya untuk tahu apakah data mereka sudah diterima.</Body>
        {/* Abstract status flow */}
        <div style={{ display: 'flex', alignItems: 'center', marginTop: 28 }}>
          <div className="s-item" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 44, height: 44, borderRadius: 100, background: C.gold, border: `2px solid ${C.gold}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 14, height: 14, borderRadius: 100, background: '#ffffff' }} />
            </div>
            <div style={{ fontSize: 16, fontFamily: f.sans, color: C.gold, fontWeight: 600 }}>Diterima</div>
          </div>
          <div style={{ flex: 1, height: 1, background: C.border, margin: '0 10px', marginBottom: 20 }} />
          <div className="s-item" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 44, height: 44, borderRadius: 100, background: C.surfaceB, border: `2px solid ${C.teal}` }} />
            <div style={{ fontSize: 16, fontFamily: f.sans, color: C.muted }}>Ditinjau</div>
          </div>
          <div style={{ flex: 1, height: 1, background: C.border, margin: '0 10px', marginBottom: 20 }} />
          <div className="s-item" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 44, height: 44, borderRadius: 100, background: C.surfaceB, border: `2px solid ${C.green}` }} />
            <div style={{ fontSize: 16, fontFamily: f.sans, color: C.muted }}>Selesai</div>
          </div>
        </div>
      </div>
      {/* Mini status page */}
      <MiniScreen url="gbibec.id/formulir/edit/abc123" className="s-card" style={{ display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ background: C.goldBg, borderBottom: `1px solid ${C.border}`, padding: '10px 16px' }}>
          <div style={{ fontSize: 13, fontWeight: 700, fontFamily: f.sans, color: C.white }}>Status Pendaftaran Baptis</div>
          <div style={{ fontSize: 11, fontFamily: f.sans, color: C.muted, marginTop: 2 }}>Budi Santoso — Minggu, 15 Juni 2025</div>
        </div>
        {/* Status tracker */}
        <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 28, height: 28, borderRadius: 100, background: C.gold, border: `2px solid ${C.gold}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 10, height: 10, borderRadius: 100, background: '#ffffff' }} />
            </div>
            <div style={{ fontSize: 11, fontFamily: f.sans, color: C.gold, fontWeight: 600 }}>Diterima</div>
          </div>
          <div style={{ width: 52, height: 1, background: C.border, margin: '0 8px', marginBottom: 16 }} />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 28, height: 28, borderRadius: 100, background: C.surfaceB, border: `2px solid ${C.teal}` }} />
            <div style={{ fontSize: 11, fontFamily: f.sans, color: C.muted }}>Ditinjau</div>
          </div>
          <div style={{ width: 52, height: 1, background: C.border, margin: '0 8px', marginBottom: 16 }} />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 28, height: 28, borderRadius: 100, background: C.surfaceB, border: `2px solid ${C.green}` }} />
            <div style={{ fontSize: 11, fontFamily: f.sans, color: C.muted }}>Selesai</div>
          </div>
        </div>
        {/* Action buttons */}
        <div style={{ padding: '0 14px 10px', display: 'flex', gap: 7 }}>
          <div style={{ flex: 1, background: C.greenBg, border: `1px solid ${C.green}`, borderRadius: 5, padding: '7px 10px', fontSize: 11, fontFamily: f.sans, color: C.green, textAlign: 'center' }}>
            WhatsApp +6281234...
          </div>
          <div style={{ flex: 1, background: C.tealBg, border: `1px solid ${C.teal}`, borderRadius: 5, padding: '7px 10px', fontSize: 11, fontFamily: f.sans, color: C.teal, textAlign: 'center' }}>
            Lihat &amp; Edit Data
          </div>
          <div style={{ flex: 1, background: C.surfaceB, border: `1px solid ${C.border}`, borderRadius: 5, padding: '7px 10px', fontSize: 11, fontFamily: f.sans, color: C.muted, textAlign: 'center' }}>
            Salin Link
          </div>
        </div>
        {/* QR note */}
        <div style={{ margin: '0 14px 12px', background: C.goldBg, border: `1px solid ${C.gold}`, borderRadius: 5, padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 24, height: 24, background: C.gold, borderRadius: 3, flexShrink: 0 }} />
          <span style={{ fontSize: 11, fontFamily: f.sans, color: C.gold }}>QR Code tersedia untuk dibagikan ke jemaat</span>
        </div>
      </MiniScreen>
    </div>
  )
}

// ─── SLIDE 08 — Program info ──────────────────────────────────────
function Slide08() {
  const ref = useRef<HTMLDivElement>(null)
  useSlideAnim(ref)
  return (
    <div ref={ref} style={{
      position: 'absolute', inset: 0, display: 'grid',
      gridTemplateColumns: '2fr 5fr',
      padding: 'clamp(40px,5vh,64px) clamp(48px,5vw,80px)',
      gap: 'clamp(28px,4vw,56px)', alignItems: 'center',
    }}>
      <Num n={8} />
      <div>
        <GoldBar />
        <Title>Informasi program selalu tersedia, tepat saat dibutuhkan</Title>
        <Body>Jemaat bisa menemukan semua yang mereka butuhkan kapan saja, tanpa harus menghubungi siapapun.</Body>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        {/* KOM page */}
        <MiniScreen url="gbibec.id/kom" className="s-card">
          <div style={{ padding: '10px 12px' }}>
            <div style={{ fontSize: 12, fontWeight: 700, fontFamily: f.sans, color: C.white, marginBottom: 8 }}>Program KOM</div>
            {['KOM 100 — Pencari Tuhan', 'KOM 200 — Pejuang Tuhan', 'KOM 300 — Hamba Tuhan', 'KOM 400 — Rekan Tuhan'].map((l, i) => (
              <div key={l} style={{ fontSize: 10, fontFamily: f.sans, color: C.muted, padding: '5px 0', borderBottom: i < 3 ? `1px solid ${C.border}` : undefined }}>
                {l}
              </div>
            ))}
            <div style={{ marginTop: 8, fontSize: 10, fontFamily: f.sans, color: C.gold }}>
              82 sesi · Kurikulum lengkap · Gratis
            </div>
          </div>
        </MiniScreen>
        {/* Kabar page */}
        <MiniScreen url="gbibec.id/kabar" className="s-card">
          <div style={{ padding: '10px 12px' }}>
            <div style={{ fontSize: 12, fontWeight: 700, fontFamily: f.sans, color: C.white, marginBottom: 8 }}>Kabar Gereja</div>
            {[
              { title: 'KOM 100 Angkatan Baru', label: 'KOM' },
              { title: 'Jadwal M-Class Juni', label: 'Kegiatan' },
              { title: 'Baptis 15 Juni 2025', label: 'Baptis' },
            ].map(({ title, label }) => (
              <div key={title} style={{ padding: '6px 0', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 10, fontFamily: f.sans, color: C.white }}>{title}</span>
                <span style={{ fontSize: 9, fontFamily: f.sans, color: C.teal, border: `1px solid ${C.teal}`, borderRadius: 3, padding: '1px 5px' }}>{label}</span>
              </div>
            ))}
          </div>
        </MiniScreen>
        {/* Poster manager */}
        <MiniScreen url="gbibec.id/admin/posters" className="s-card">
          <div style={{ padding: '10px 12px' }}>
            <div style={{ fontSize: 12, fontWeight: 700, fontFamily: f.sans, color: C.white, marginBottom: 8 }}>Poster Digital</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
              {['Baptis', 'KOM', 'M-Class', 'COOL', 'Pernikahan', 'Pelayanan'].map(t => (
                <span key={t} style={{ fontSize: 9, fontFamily: f.sans, color: C.muted, padding: '2px 6px', border: `1px solid ${C.border}`, borderRadius: 3 }}>{t}</span>
              ))}
            </div>
            <div style={{ background: C.greenBg, border: `1px solid ${C.green}`, borderRadius: 5, padding: '5px 8px', fontSize: 10, fontFamily: f.sans, color: C.green }}>
              ✓ Ekspor PNG siap kirim via WhatsApp
            </div>
          </div>
        </MiniScreen>
      </div>
    </div>
  )
}

// ─── SLIDE 09 — Admin forms ───────────────────────────────────────
function Slide09() {
  const ref = useRef<HTMLDivElement>(null)
  useSlideAnim(ref)
  return (
    <div ref={ref} style={{
      position: 'absolute', inset: 0, display: 'grid',
      gridTemplateColumns: '2fr 3fr',
      padding: 'clamp(40px,5vh,64px) clamp(48px,5vw,80px)',
      gap: 'clamp(32px,4vw,60px)', alignItems: 'center',
    }}>
      <Num n={9} />
      <div>
        <GoldBar />
        <Title>Semua yang masuk tersimpan rapi, tanpa kerja ekstra dari siapapun</Title>
        <Body>
          Panel admin memberikan kendali penuh atas semua pendaftaran —
          tanpa perlu membuka spreadsheet terpisah atau laporan manual.
        </Body>
      </div>
      <MiniScreen url="gbibec.id/admin/formulir/baptis" className="s-card" style={{ display: 'flex', flexDirection: 'column' }}>
        {/* Search bar */}
        <div style={{ padding: '10px 14px', borderBottom: `1px solid ${C.border}`, display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ flex: 1, background: C.surfaceB, border: `1px solid ${C.border}`, borderRadius: 5, padding: '5px 10px', fontSize: 10, fontFamily: f.sans, color: C.dim }}>
            🔍 Cari nama / nomor WA...
          </div>
          <div style={{ background: C.surfaceB, border: `1px solid ${C.border}`, borderRadius: 5, padding: '5px 10px', fontSize: 10, fontFamily: f.sans, color: C.muted }}>
            Status ▾
          </div>
          <div style={{ background: C.goldBg, border: `1px solid ${C.gold}`, borderRadius: 5, padding: '5px 10px', fontSize: 10, fontFamily: f.sans, color: C.gold }}>
            Sheets
          </div>
        </div>
        {/* Table header */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 72px 88px 52px', padding: '7px 14px', borderBottom: `1px solid ${C.border}`, background: C.surfaceB }}>
          {['Nama Jemaat', 'Tanggal', 'Status', ''].map(h => (
            <div key={h} style={{ fontSize: 10, fontFamily: f.sans, color: C.muted, fontWeight: 600 }}>{h}</div>
          ))}
        </div>
        {/* Rows */}
        {[
          ['Budi Santoso', '15 Jun', 'Pending'],
          ['Siti Rahayu', '15 Jun', 'Selesai'],
          ['Dewi Permata', '22 Jun', 'Ditinjau'],
          ['Ahmad Fauzi', '22 Jun', 'Pending'],
        ].map(([name, date, status], i) => (
          <div key={i} className="s-item" style={{ display: 'grid', gridTemplateColumns: '1fr 72px 88px 52px', padding: '8px 14px', borderBottom: `1px solid ${C.border}`, alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontFamily: f.sans, color: C.white }}>{name}</span>
            <span style={{ fontSize: 10, fontFamily: f.sans, color: C.muted }}>{date}</span>
            <span style={{
              display: 'inline-block', fontSize: 10, fontFamily: f.sans,
              color: status === 'Selesai' ? C.green : status === 'Ditinjau' ? C.teal : C.gold,
              border: `1px solid ${status === 'Selesai' ? C.green : status === 'Ditinjau' ? C.teal : C.gold}`,
              borderRadius: 3, padding: '1px 5px',
            }}>{status}</span>
            <div style={{ display: 'flex', gap: 4 }}>
              <div style={{ width: 22, height: 22, background: C.greenBg, border: `1px solid ${C.green}`, borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: C.green }}>WA</div>
              <div style={{ width: 22, height: 22, background: C.surfaceB, border: `1px solid ${C.border}`, borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: C.muted }}>→</div>
            </div>
          </div>
        ))}
        {/* Pagination */}
        <div style={{ padding: '8px 14px', borderTop: `1px solid ${C.border}`, display: 'flex', justifyContent: 'flex-end', gap: 4, alignItems: 'center' }}>
          <div style={{ width: 24, height: 24, background: C.surfaceB, border: `1px solid ${C.border}`, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: C.muted }}>←</div>
          <div style={{ fontSize: 10, fontFamily: f.sans, color: C.muted, padding: '0 8px' }}>Hal. 1 / 3</div>
          <div style={{ width: 24, height: 24, background: C.goldBg, border: `1px solid ${C.gold}`, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: C.gold }}>→</div>
        </div>
      </MiniScreen>
    </div>
  )
}

// ─── SLIDE 10 — CMS ───────────────────────────────────────────────
function Slide10() {
  const ref = useRef<HTMLDivElement>(null)
  useSlideAnim(ref)
  return (
    <div ref={ref} style={{
      position: 'absolute', inset: 0, display: 'grid',
      gridTemplateColumns: '2fr 3fr',
      padding: 'clamp(40px,5vh,64px) clamp(48px,5vw,80px)',
      gap: 'clamp(32px,4vw,60px)', alignItems: 'center',
    }}>
      <Num n={10} />
      <div>
        <GoldBar />
        <Title>Konten yang jemaat lihat ada sepenuhnya di tangan kita</Title>
        <Body>
          Semua yang tampil di portal bisa dikelola langsung oleh tim —
          tanpa perlu bantuan developer, tanpa coding.
        </Body>
      </div>
      <MiniScreen url="gbibec.id/admin" className="s-card" style={{ display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ borderBottom: `1px solid ${C.border}`, padding: '8px 14px', background: C.surfaceB }}>
          <span style={{ fontSize: 12, fontWeight: 700, fontFamily: f.sans, color: C.white }}>Panel Admin — Kelola Konten</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr' }}>
          {/* Sidebar */}
          <div style={{ borderRight: `1px solid ${C.border}`, padding: '8px 0' }}>
            {[
              { icon: '📰', label: 'Kabar & Berita', active: true },
              { icon: '🎯', label: 'Kegiatan', active: false },
              { icon: '📣', label: 'Pengumuman', active: false },
              { icon: '👥', label: 'Kelompok COOL', active: false },
              { icon: '🖼️', label: 'Poster Digital', active: false },
            ].map(({ icon, label, active }) => (
              <div key={label} className="s-item" style={{
                padding: '7px 12px', fontSize: 11, fontFamily: f.sans,
                color: active ? C.gold : C.muted,
                background: active ? C.goldBg : C.surface,
                borderRight: `2px solid ${active ? C.gold : 'transparent'}`,
                display: 'flex', gap: 7, alignItems: 'center',
              }}>
                <span style={{ fontSize: 11 }}>{icon}</span>{label}
              </div>
            ))}
          </div>
          {/* Editor */}
          <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: 12, fontWeight: 700, fontFamily: f.sans, color: C.white }}>Kabar &amp; Berita</div>
            <div>
              <div style={{ fontSize: 10, fontFamily: f.sans, color: C.muted, marginBottom: 3 }}>Judul</div>
              <div style={{ background: C.surfaceB, border: `1px solid ${C.border}`, borderRadius: 4, padding: '5px 8px', fontSize: 11, fontFamily: f.sans, color: C.white }}>
                KOM 100 Angkatan Baru Dibuka
              </div>
            </div>
            <div>
              <div style={{ fontSize: 10, fontFamily: f.sans, color: C.muted, marginBottom: 3 }}>Isi Artikel</div>
              <div style={{ background: C.surfaceB, border: `1px solid ${C.border}`, borderRadius: 4, padding: '6px 8px', height: 46, fontSize: 10, fontFamily: f.sans, color: C.dim }}>
                Program KOM kembali dibuka untuk umum...
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <div style={{ background: C.gold, borderRadius: 4, padding: '5px 12px', fontSize: 11, fontFamily: f.sans, color: '#ffffff', fontWeight: 600 }}>Terbitkan</div>
              <div style={{ background: C.surfaceB, border: `1px solid ${C.border}`, borderRadius: 4, padding: '5px 12px', fontSize: 11, fontFamily: f.sans, color: C.muted }}>Pratinjau</div>
            </div>
            <div style={{ background: C.goldBg, border: `1px solid ${C.gold}`, borderRadius: 4, padding: '5px 8px', fontSize: 10, fontFamily: f.sans, color: C.gold }}>
              🔄 Buka / tutup pendaftaran — cukup satu klik
            </div>
          </div>
        </div>
      </MiniScreen>
    </div>
  )
}

// ─── SLIDE 11 — Knowledge loop ────────────────────────────────────
function Slide11() {
  const ref = useRef<HTMLDivElement>(null)
  useSlideAnim(ref)
  return (
    <div ref={ref} style={{
      position: 'absolute', inset: 0, display: 'grid',
      gridTemplateColumns: '2fr 3fr',
      padding: 'clamp(40px,5vh,64px) clamp(48px,5vw,80px)',
      gap: 'clamp(32px,4vw,60px)', alignItems: 'center',
    }}>
      <Num n={11} />
      <div>
        <GoldBar />
        <Title>Chatbot kita semakin memahami jemaat dari setiap percakapan</Title>
        <Body>
          Chatbot bukan sistem yang statis. Ia tumbuh bersama pengetahuan yang kita masukkan
          dan belajar dari pertanyaan nyata yang jemaat ajukan.
        </Body>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Knowledge base */}
        <MiniScreen url="gbibec.id/admin/knowledge" className="s-card">
          <div style={{ padding: '10px 14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, paddingBottom: 8, borderBottom: `1px solid ${C.border}` }}>
              <span style={{ fontSize: 12, fontWeight: 700, fontFamily: f.sans, color: C.white }}>Basis Pengetahuan</span>
              <div style={{ background: C.goldBg, border: `1px solid ${C.gold}`, borderRadius: 4, padding: '3px 8px', fontSize: 10, fontFamily: f.sans, color: C.gold }}>+ Tambah</div>
            </div>
            {[
              { title: 'Jadwal Ibadah Minggu', cat: 'identitas' },
              { title: 'Syarat & Proses Baptis', cat: 'baptisan' },
              { title: 'Program KOM 100–400', cat: 'kom' },
              { title: 'Kontak Gembala & Pengurus', cat: 'kontak' },
            ].map(({ title, cat }) => (
              <div key={title} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: `1px solid ${C.border}` }}>
                <span style={{ fontSize: 11, fontFamily: f.sans, color: C.white }}>{title}</span>
                <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                  <span style={{ fontSize: 9, fontFamily: f.sans, color: C.teal, border: `1px solid ${C.teal}`, borderRadius: 3, padding: '1px 5px' }}>{cat}</span>
                  <div style={{ width: 18, height: 18, background: C.surfaceB, border: `1px solid ${C.border}`, borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: C.muted }}>✏</div>
                </div>
              </div>
            ))}
          </div>
        </MiniScreen>
        {/* Chat misses */}
        <MiniScreen url="gbibec.id/admin/pertanyaan-tak-terjawab" className="s-card">
          <div style={{ padding: '10px 14px' }}>
            <div style={{ fontSize: 12, fontWeight: 700, fontFamily: f.sans, color: C.white, marginBottom: 8 }}>Pertanyaan Belum Terjawab</div>
            {[
              'Kapan jadwal pernikahan gereja?',
              'Cara daftar pelayanan musik?',
              'Ada kelas untuk remaja?',
            ].map((q, i) => (
              <div key={i} style={{ padding: '5px 0', borderBottom: i < 2 ? `1px solid ${C.border}` : undefined, display: 'flex', gap: 8, alignItems: 'center' }}>
                <div style={{ width: 6, height: 6, borderRadius: 100, background: C.gold, flexShrink: 0 }} />
                <span style={{ fontSize: 10, fontFamily: f.sans, color: C.muted }}>{q}</span>
              </div>
            ))}
            <div style={{ marginTop: 8, background: C.tealBg, border: `1px solid ${C.teal}`, borderRadius: 4, padding: '5px 8px', fontSize: 10, fontFamily: f.sans, color: C.teal }}>
              Jadikan bahan pembaruan Basis Pengetahuan →
            </div>
          </div>
        </MiniScreen>
      </div>
    </div>
  )
}

// ─── SLIDE 12 — Closing ───────────────────────────────────────────
function Slide12() {
  const ref = useRef<HTMLDivElement>(null)
  useSlideAnim(ref)
  return (
    <div ref={ref} style={{
      position: 'absolute', inset: 0, display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      padding: 'clamp(40px,5vh,64px) clamp(48px,5vw,80px)',
      gap: 'clamp(32px,4vw,60px)', alignItems: 'center',
    }}>
      <Num n={12} />
      <div>
        <GoldBar />
        <Title>Semua ini bisa kita lihat, ukur, dan kelola bersama</Title>
        <Body>
          Portal ini bukan milik satu orang atau satu divisi.
          Ia dirancang untuk dikelola bersama, dengan peran yang jelas bagi setiap pelayan.
        </Body>
        <div style={{ marginTop: 28 }}>
          <FeatureRow icon="📊" title="Analitik Kunjungan"    desc="Lihat berapa jemaat yang mengakses portal dan halaman apa yang paling banyak dibuka" />
          <FeatureRow icon="🔐" title="Akses Berbasis Peran"  desc="Setiap tim hanya melihat bagian yang relevan dengan tugasnya" />
          <FeatureRow icon="📋" title="Log Aktivitas Admin"   desc="Setiap perubahan tercatat — siapa mengubah apa dan kapan" />
          <FeatureRow icon="📱" title="Bisa Diinstal di HP"   desc="Tidak perlu App Store — cukup tambahkan ke layar utama ponsel" />
        </div>
      </div>
      <div className="s-card" style={{
        background: C.surface, border: `1px solid ${C.border}`,
        borderRadius: 18, padding: 'clamp(24px,3vw,40px)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', textAlign: 'center',
      }}>
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 18,
          background: C.goldBg,
          pointerEvents: 'none',
        }} />
        <div style={{
          width: 64, height: 64, borderRadius: 16, background: C.goldBg,
          border: `1px solid ${C.gold}`, display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 28, marginBottom: 20,
        }}>⛪</div>
        <div style={{ fontSize: 16, fontWeight: 700, fontFamily: f.sans, color: C.white, marginBottom: 10 }}>
          GBI Baranangsiang Evening Church
        </div>
        <div style={{
          fontSize: 16, fontFamily: f.sans, color: C.muted,
          marginBottom: 24, lineHeight: 1.7,
        }}>
          Portal ini bukan proyek teknologi.<br />
          <span style={{ color: C.white }}>Ini adalah alat pelayanan.</span>
        </div>
        <div style={{
          padding: '9px 22px', borderRadius: 100,
          background: C.goldBg, border: `1px solid ${C.gold}`,
          fontSize: 16, fontFamily: f.sans, color: C.gold, fontWeight: 600,
          letterSpacing: '0.05em',
        }}>
          gbibec.id
        </div>
      </div>
    </div>
  )
}

// ─── Slide registry ───────────────────────────────────────────────
const SLIDES = [
  Slide01, Slide02, Slide03, Slide04, Slide05, Slide06,
  Slide07, Slide08, Slide09, Slide10, Slide11, Slide12,
]

// ─── Shell ────────────────────────────────────────────────────────
export default function PresentationPage() {
  const [current, setCurrent] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const blocking     = useRef(false)

  const go = useCallback((delta: number) => {
    if (blocking.current) return
    const next = Math.max(0, Math.min(N - 1, current + delta))
    if (next === current) return
    blocking.current = true

    const exitY  =  8
    const enterY = -8

    gsap.to(containerRef.current, {
      opacity: 0, y: exitY, duration: 0.22, ease: 'power2.in',
      onComplete: () => {
        gsap.set(containerRef.current, { y: enterY })
        setCurrent(next)
        requestAnimationFrame(() => requestAnimationFrame(() => {
          gsap.to(containerRef.current, {
            opacity: 1, y: 0, duration: 0.32, ease: 'power2.out',
            onComplete: () => { blocking.current = false },
          })
        }))
      },
    })
  }, [current])

  const goTo = useCallback((index: number) => {
    go(index - current)
  }, [current, go])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown')  go(1)
      if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')    go(-1)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [go])

  const SlideComp = SLIDES[current]

  return (
    <div style={{
      position: 'fixed', inset: 0, background: C.bg,
      overflow: 'hidden', fontFamily: f.sans, userSelect: 'none',
    }}>

      {/* Slide container */}
      <div ref={containerRef} style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
        <SlideComp key={current} />
      </div>

      {/* Bottom-center dot nav */}
      <div style={{
        position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)',
        display: 'flex', alignItems: 'center', gap: 6,
        zIndex: 100,
      }}>
        {Array.from({ length: N }).map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            style={{
              width: i === current ? 20 : 6, height: 6, borderRadius: 100,
              background: i === current ? C.gold : i < current ? C.dim : C.border,
              border: 'none', padding: 0, cursor: 'pointer',
              transition: 'all 0.3s ease', outline: 'none',
            }}
          />
        ))}
      </div>

      {/* Corner arrows */}
      <button
        onClick={() => go(-1)}
        disabled={current === 0}
        style={{
          position: 'absolute', bottom: 16, left: 24, zIndex: 100,
          width: 32, height: 32, borderRadius: '50%',
          background: 'transparent', border: 'none',
          color: current === 0 ? C.dim : C.muted,
          cursor: current === 0 ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, outline: 'none',
        }}
      >←</button>
      <button
        onClick={() => go(1)}
        disabled={current === N - 1}
        style={{
          position: 'absolute', bottom: 16, right: 24, zIndex: 100,
          width: 32, height: 32, borderRadius: '50%',
          background: 'transparent', border: 'none',
          color: current === N - 1 ? C.dim : C.white,
          cursor: current === N - 1 ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, outline: 'none',
        }}
      >→</button>
    </div>
  )
}
