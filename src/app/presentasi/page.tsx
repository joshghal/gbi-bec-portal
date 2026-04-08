'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import gsap from 'gsap'
import QRCode from 'qrcode'

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

const N = 9

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
      position: 'absolute', inset: 0,
      display: 'flex', flexDirection: 'column',
      background: C.goldBg,
    }}>
      <Num n={1} />

      {/* Mockup — hero, fills remaining space, flush to bottom */}
      <div className="s-sub" style={{
        flex: 1, display: 'flex',
        alignItems: 'flex-end', justifyContent: 'center',
        padding: '20px clamp(24px,3vw,48px) 0',
        overflow: 'hidden',
        minHeight: 0,
      }}>
        <img
          src="/portal-mockup.webp"
          alt="GBI BEC Portal mockup"
          style={{
            width: '100%', height: '100%',
            maxWidth: 1100,
            objectFit: 'contain',
            objectPosition: 'center',
            filter: 'drop-shadow(0 -2px 0px transparent)',
            marginTop: '400px'
          }}
        />
      </div>
    </div>
  )
}

// ─── SLIDE 02 — QR Tanya-Jawab ────────────────────────────────────
function Slide02() {
  const ref = useRef<HTMLDivElement>(null)
  useSlideAnim(ref)
  const [qrSrc, setQrSrc] = useState('')

  useEffect(() => {
    QRCode.toDataURL('https://www.gbibec.id/tanya-jawab', {
      margin: 2,
      width: 500,
      color: { dark: '#1a1714', light: '#ffffff' },
    }).then(setQrSrc)
  }, [])

  return (
    <div ref={ref} style={{
      position: 'absolute', inset: 0,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 28, background: C.goldBg,
    }}>
      <Num n={2} />

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <GoldBar w={44} />
      </div>

      <h2 className="s-title" style={{
        fontFamily: f.serif, fontSize: 'clamp(28px,3vw,52px)',
        fontWeight: 700, color: C.white, margin: 0, textAlign: 'center',
        lineHeight: 1.2,
      }}>
        Silakan Taruh Pertanyaan
      </h2>

      <div className="s-sub" style={{
        background: C.surface, border: `1px solid ${C.border}`,
        borderRadius: 16, padding: 16,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {qrSrc
          ? <img src={qrSrc} alt="QR tanya-jawab" style={{ width: 420, height: 420, borderRadius: 8, display: 'block' }} />
          : <div style={{ width: 420, height: 420, background: C.surfaceB, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: f.sans, fontSize: 14, color: C.dim }}>Loading…</span>
            </div>
        }
      </div>

      <div className="s-sub" style={{
        fontFamily: f.sans, fontSize: 'clamp(14px,1.2vw,18px)',
        color: C.muted, letterSpacing: '0.03em',
      }}>
        https://www.gbibec.id/tanya-jawab
      </div>
    </div>
  )
}

// ─── SLIDE 03 — The problem ───────────────────────────────────────
function Slide03() {
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
      <Num n={3} />
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

// ─── SLIDE 04 — The chatbot answer ───────────────────────────────
function Slide04() {
  const ref = useRef<HTMLDivElement>(null)
  useSlideAnim(ref)
  return (
    <div ref={ref} style={{
      position: 'absolute', inset: 0, display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      padding: 'clamp(40px,5vh,64px) clamp(48px,5vw,80px)',
      gap: 'clamp(32px,4vw,60px)', alignItems: 'center',
    }}>
      <Num n={4} />
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
              <video src="/chat.webm" autoPlay loop muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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

// ─── SLIDE 05 — Growth moment ────────────────────────────────────
function Slide05() {
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
      <Num n={5} />
      <div style={{ textAlign: 'center' }} className='w-full'>
        <div style={{ display: 'flex', justifyContent: 'center' }}><GoldBar /></div>
        <Title className=''>
          Apakah AI bisa menjawab pertanyaan dengan akurat?
        </Title>
        <Body>Bisa, Kuncinya berada pada basis pengetahuan dikelola dan diperkaya secara terus menerus</Body>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12, width: '100%' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/admin-kb.webp" alt="" style={{ gridColumn: '1 / -1', width: '70%', margin: '0 auto', borderRadius: 12, objectFit: 'contain' }} />
      </div>
    </div>
  )
}

// ─── SLIDE 06 — Forms ─────────────────────────────────────────────
function Slide06() {
  const ref = useRef<HTMLDivElement>(null)
  useSlideAnim(ref)
  return (
    <div ref={ref} className='flex flex-col items-center justify-center p-[40px]'>
      <Num n={6} />

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
          { src: '/form-chat.webm', label: 'Via percakapan AI', color: C.muted },
          { src: '/form-direct.webm', label: 'Via link langsung', color: C.muted },
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

// ─── SLIDE 07 ─────────────────────────────────────────────────────
function Slide07() {
  const ref = useRef<HTMLDivElement>(null)
  useSlideAnim(ref)
  return (
    <div ref={ref} className='flex flex-col items-center justify-center p-[40px]'>
      <Num n={7} />

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

// ─── SLIDE 08 — Portal sections carousel ─────────────────────────
function Slide08() {
  const ref = useRef<HTMLDivElement>(null)
  useSlideAnim(ref)

  const videos = [
    { src: '/pengumuman-walkthrough.webm', label: 'Pengumuman', desc: 'Informasi terkini dari gereja' },
    { src: '/kabar-walkthrough.webm', label: 'Kabar Terbaru', desc: 'Berita dan artikel gereja' },
    { src: '/kegiatan-walkthrough.webm', label: 'Kegiatan', desc: 'Program dan aktivitas jemaat' },
  ]

  const [active, setActive] = useState(0)
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([null, null, null])

  useEffect(() => {
    videoRefs.current.forEach((v, i) => {
      if (!v) return
      if (i === active) {
        v.currentTime = 0
        v.play().catch(() => {})
      } else {
        v.pause()
      }
    })
  }, [active])

  const handleEnded = useCallback(() => {
    setActive(prev => (prev + 1) % 3)
  }, [])

  return (
    <div ref={ref} className='flex flex-col items-center justify-center p-[40px]'>
      <Num n={8} />

      {/* Text */}
      <div className='flex flex-col gap-3 items-center justify-center mb-[20px]'>
        <GoldBar />
        <Title className='text-center'>Satu portal untuk semua informasi yang dibutuhkan jemaat</Title>
        <Body className='text-center'>Pengumuman, kabar terbaru, dan kegiatan — semuanya dapat dikelola dan dapat diakses kapan saja.</Body>
      </div>

      {/* Section selector */}
      <div style={{ display: 'flex', gap: 28, marginBottom: 20 }}>
        {videos.map(({ label }, i) => (
          <div
            key={label}
            onClick={() => setActive(i)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
          >
            <div style={{
              width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
              background: i === active ? C.gold : C.dim,
              transition: 'background 0.2s',
            }} />
            <span style={{
              fontSize: 14, fontFamily: f.sans,
              color: i === active ? C.white : C.muted,
              fontWeight: i === active ? 600 : 500,
              transition: 'color 0.2s',
            }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Video */}
      <div className="s-card" style={{
        width: '100%', maxWidth: 900,
        borderRadius: 12, overflow: 'hidden',
        border: `1px solid ${C.border}`,
        background: '#000', position: 'relative', aspectRatio: '16/9',
      }}>
        {videos.map(({ src }, i) => (
          // eslint-disable-next-line jsx-a11y/media-has-caption
          <video
            key={src}
            ref={el => { videoRefs.current[i] = el }}
            src={src}
            muted
            playsInline
            onEnded={handleEnded}
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%',
              objectFit: 'cover', display: 'block',
              opacity: i === active ? 1 : 0,
              transition: 'opacity 0.35s ease',
            }}
          />
        ))}
      </div>
    </div>
  )
}

// ─── SLIDE 09 — QR Saran ──────────────────────────────────────────
function Slide09() {
  const ref = useRef<HTMLDivElement>(null)
  useSlideAnim(ref)
  const [qrSrc, setQrSrc] = useState('')

  useEffect(() => {
    QRCode.toDataURL('https://www.gbibec.id/saran', {
      margin: 2,
      width: 500,
      color: { dark: '#1a1714', light: '#ffffff' },
    }).then(setQrSrc)
  }, [])

  return (
    <div ref={ref} style={{
      position: 'absolute', inset: 0,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 28, background: C.goldBg,
    }}>
      <Num n={9} />
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <GoldBar w={44} />
      </div>

      <h2 className="s-title" style={{
        fontFamily: f.serif, fontSize: 'clamp(28px,3vw,52px)',
        fontWeight: 700, color: C.white, margin: 0, textAlign: 'center',
        lineHeight: 1.2,
      }}>
        Saran, Ide, & Pendapat
      </h2>

      <div className="s-sub" style={{
        background: C.surface, border: `1px solid ${C.border}`,
        borderRadius: 16, padding: 16,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {qrSrc
          ? <img src={qrSrc} alt="QR saran" style={{ width: 420, height: 420, borderRadius: 8, display: 'block' }} />
          : <div style={{ width: 420, height: 420, background: C.surfaceB, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: f.sans, fontSize: 14, color: C.dim }}>Loading…</span>
            </div>
        }
      </div>

      <div className="s-sub" style={{
        fontFamily: f.sans, fontSize: 'clamp(14px,1.2vw,18px)',
        color: C.muted, letterSpacing: '0.03em',
      }}>
        https://www.gbibec.id/saran
      </div>
    </div>
  )
}

// ─── Slide registry ───────────────────────────────────────────────
const SLIDES = [
  Slide01, Slide02, Slide03, Slide04, Slide05, Slide06,
  Slide07, Slide08, Slide09,
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
