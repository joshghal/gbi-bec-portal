'use client'

import { useState, useEffect } from 'react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'

const MAX_SUBMISSIONS = 3
const COOLDOWN_MS = 60_000

const C = {
  bg:         '#f7f5f2',
  surface:    '#ffffff',
  surfaceB:   '#f0ede8',
  border:     '#ddd8d0',
  gold:       '#9a7230',
  goldBg:     '#fdf6e8',
  goldBorder: '#d4b068',
  white:      '#1a1714',
  muted:      '#6b6460',
  dim:        '#b8b0a6',
  green:      '#2e7a56',
  greenBg:    '#eaf5ee',
  greenBorder:'#b8dfc3',
}

export default function SaranPage() {
  const [name, setName] = useState('')
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [submitCount, setSubmitCount] = useState(0)
  const [cooldownUntil, setCooldownUntil] = useState(0)
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    try {
      const count = parseInt(localStorage.getItem('saran_count') || '0', 10)
      setSubmitCount(count)
      const until = parseInt(localStorage.getItem('saran_cooldown') || '0', 10)
      setCooldownUntil(until)
    } catch {}
  }, [])

  useEffect(() => {
    if (cooldownUntil <= Date.now()) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [cooldownUntil])

  const inCooldown = now < cooldownUntil
  const atLimit = submitCount >= MAX_SUBMISSIONS
  const cooldownSec = Math.ceil((cooldownUntil - now) / 1000)
  const canSubmit = name.trim().length > 0 && text.trim().length > 0 && !submitting && !inCooldown && !atLimit

  async function submit() {
    if (!canSubmit) return
    setSubmitting(true)
    setError('')
    try {
      await addDoc(collection(db, 'suggestions'), {
        name: name.trim(),
        text: text.trim(),
        createdAt: serverTimestamp(),
      })
      const nextCount = submitCount + 1
      const nextCooldown = Date.now() + COOLDOWN_MS
      setSubmitCount(nextCount)
      setCooldownUntil(nextCooldown)
      setNow(Date.now())
      localStorage.setItem('saran_count', String(nextCount))
      localStorage.setItem('saran_cooldown', String(nextCooldown))
      setDone(true)
    } catch {
      setError('Gagal mengirim. Silakan coba lagi.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{
      minHeight: '100dvh',
      background: C.bg,
      fontFamily: 'var(--font-plus-jakarta), system-ui, sans-serif',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        background: C.surface,
        borderBottom: `1px solid ${C.border}`,
        padding: '16px 20px 18px',
      }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <div style={{
            fontSize: 11, color: C.dim, letterSpacing: '0.08em',
            textTransform: 'uppercase', marginBottom: 3,
          }}>
            GBI Baranangsiang Evening Church
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: C.white, letterSpacing: '-0.01em' }}>
            Saran & Masukan
          </div>
          <div style={{ fontSize: 13, color: C.muted, marginTop: 4, lineHeight: 1.5 }}>
            Bantu kami melayani jemaat lebih baik
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 560, margin: '0 auto', padding: '24px 16px 48px', width: '100%' }}>
        {done ? (
          /* Success state */
          <div style={{
            background: C.surface, borderRadius: 16,
            border: `1px solid ${C.greenBorder}`,
            padding: '40px 24px', textAlign: 'center',
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: C.greenBg, border: `1px solid ${C.greenBorder}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px', fontSize: 24,
            }}>
              ✓
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: C.white, marginBottom: 8 }}>
              Terima kasih, {name}!
            </div>
            <div style={{ fontSize: 14, color: C.muted, lineHeight: 1.6 }}>
              Saran kamu sudah kami terima.<br />
              Masukan ini sangat berarti bagi kami.
            </div>
            <button
              onClick={() => { setDone(false); setName(''); setText('') }}
              style={{
                marginTop: 24, padding: '10px 24px', borderRadius: 8,
                background: C.surfaceB, border: `1px solid ${C.border}`,
                color: C.muted, fontSize: 13, cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Kirim saran lain
            </button>
          </div>
        ) : (
          /* Form */
          <div style={{
            background: C.surface, borderRadius: 16,
            border: `1px solid ${C.border}`,
            padding: 20,
          }}>
            <div style={{ marginBottom: 16 }}>
              <label style={{
                display: 'block', fontSize: 12, fontWeight: 600,
                color: C.muted, marginBottom: 6, letterSpacing: '0.02em',
              }}>
                Nama
              </label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Tulis namamu..."
                maxLength={100}
                style={{
                  width: '100%', border: `1.5px solid ${C.border}`, borderRadius: 8,
                  padding: '10px 12px', fontSize: 15, fontFamily: 'inherit',
                  outline: 'none', color: C.white, background: C.bg,
                  boxSizing: 'border-box', transition: 'border-color 0.15s',
                }}
                onFocus={e => { e.target.style.borderColor = C.gold }}
                onBlur={e => { e.target.style.borderColor = C.border }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{
                display: 'block', fontSize: 12, fontWeight: 600,
                color: C.muted, marginBottom: 6, letterSpacing: '0.02em',
              }}>
                Saran atau Masukan
              </label>
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Tulis saran, masukan, atau harapanmu untuk GBI BEC di sini..."
                rows={7}
                maxLength={1000}
                style={{
                  width: '100%', border: `1.5px solid ${C.border}`, borderRadius: 8,
                  padding: '10px 12px', fontSize: 15, fontFamily: 'inherit',
                  resize: 'vertical', outline: 'none', color: C.white,
                  background: C.bg, boxSizing: 'border-box', lineHeight: 1.6,
                  transition: 'border-color 0.15s',
                }}
                onFocus={e => { e.target.style.borderColor = C.gold }}
                onBlur={e => { e.target.style.borderColor = C.border }}
              />
              <div style={{ textAlign: 'right', fontSize: 11, color: C.dim, marginTop: 4 }}>
                {text.length} / 1000
              </div>
            </div>

            {error && (
              <div style={{
                fontSize: 13, color: '#8b3a3a', background: '#faeaea',
                border: '1px solid #e8c0c0', borderRadius: 8,
                padding: '8px 12px', marginBottom: 12,
              }}>
                {error}
              </div>
            )}

            <button
              onClick={submit}
              disabled={!canSubmit}
              style={{
                width: '100%', padding: '13px 0',
                background: canSubmit ? C.gold : C.dim,
                color: 'white', border: 'none', borderRadius: 8,
                fontSize: 14, fontWeight: 600,
                cursor: canSubmit ? 'pointer' : 'not-allowed',
                fontFamily: 'inherit', letterSpacing: '0.02em',
                transition: 'background 0.2s',
              }}
            >
              {submitting ? 'Mengirim...'
                : atLimit ? `Batas ${MAX_SUBMISSIONS} saran per sesi`
                : inCooldown ? `Tunggu ${cooldownSec}s...`
                : 'Kirim Saran'}
            </button>

            <p style={{ margin: '10px 0 0', fontSize: 12, color: C.dim, textAlign: 'center' }}>
              Saran bersifat pribadi · maks {MAX_SUBMISSIONS} per sesi
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
