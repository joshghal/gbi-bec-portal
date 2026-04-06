'use client'

import { useState, useEffect, useRef } from 'react'
import {
  collection, addDoc, updateDoc, doc, increment,
  onSnapshot, query, where, serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { QA_SESSION_ID as SESSION_ID } from '@/lib/qa'

// Design tokens (match portal palette)
const C = {
  bg:       '#f7f5f2',
  surface:  '#ffffff',
  surfaceB: '#f0ede8',
  border:   '#ddd8d0',
  gold:     '#9a7230',
  goldBg:   '#fdf6e8',
  goldBorder: '#d4b068',
  white:    '#1a1714',
  muted:    '#6b6460',
  dim:      '#b8b0a6',
  green:    '#2e7a56',
  greenBg:  '#eaf5ee',
  greenBorder: '#b8dfc3',
}

interface Question {
  id: string
  text: string
  votes: number
  answered: boolean
  archived: boolean
  createdAt: { toMillis: () => number } | null
}

// ─── Question card ─────────────────────────────────────────────────
function QuestionCard({
  question, voted, onVote,
}: {
  question: Question
  voted: boolean
  onVote: () => void
}) {
  const isAnswered = question.answered
  return (
    <div style={{
      background: C.surface,
      borderRadius: 12,
      marginBottom: 10,
      border: isAnswered ? `1.5px solid ${C.greenBorder}` : `1.5px solid ${C.border}`,
      display: 'flex',
      overflow: 'hidden',
      opacity: isAnswered ? 0.65 : 1,
      transition: 'opacity 0.2s',
    }}>
      {/* Vote strip */}
      <button
        onClick={onVote}
        disabled={voted || isAnswered}
        aria-label="Upvote"
        style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', gap: 2, flexShrink: 0, width: 56,
          background: voted ? C.goldBg : C.surfaceB,
          borderTop: 'none', borderBottom: 'none', borderLeft: 'none',
          borderRight: `1.5px solid ${voted ? C.goldBorder : C.border}`,
          cursor: voted || isAnswered ? 'default' : 'pointer',
          padding: '12px 0',
        }}
      >
        <svg width="12" height="9" viewBox="0 0 14 10" fill="none">
          <path d="M7 1L13 9H1L7 1Z" fill={voted ? C.gold : C.dim} />
        </svg>
        <span style={{
          fontSize: 17, fontWeight: 700, lineHeight: 1,
          color: voted ? C.gold : C.white,
          fontFamily: 'var(--font-plus-jakarta), system-ui, sans-serif',
          marginTop: 2,
        }}>
          {question.votes}
        </span>
      </button>

      {/* Content */}
      <div style={{ flex: 1, padding: '14px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <p style={{
          margin: 0, fontSize: 15, lineHeight: 1.55,
          color: isAnswered ? C.muted : C.white,
          fontFamily: 'var(--font-plus-jakarta), system-ui, sans-serif',
          flex: 1,
        }}>
          {question.text}
        </p>
        {isAnswered && (
          <span style={{
            flexShrink: 0, fontSize: 11, fontWeight: 600, color: C.green,
            background: C.greenBg, border: `1px solid ${C.greenBorder}`,
            borderRadius: 20, padding: '2px 8px',
            fontFamily: 'var(--font-plus-jakarta), system-ui, sans-serif',
          }}>
            ✓ Dijawab
          </span>
        )}
      </div>
    </div>
  )
}

// ─── Main page ─────────────────────────────────────────────────────
const MAX_QUESTIONS = 5
const COOLDOWN_MS = 30_000

export default function QAPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [input, setInput] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [submitCount, setSubmitCount] = useState(0)
  const [cooldownUntil, setCooldownUntil] = useState(0)
  const [now, setNow] = useState(Date.now())
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('qa_voted_bec2026')
      if (stored) setVotedIds(new Set(JSON.parse(stored)))
      const count = parseInt(localStorage.getItem('qa_count_bec2026') || '0', 10)
      setSubmitCount(count)
      const until = parseInt(localStorage.getItem('qa_cooldown_bec2026') || '0', 10)
      setCooldownUntil(until)
    } catch {}
  }, [])

  // Tick every second while cooling down
  useEffect(() => {
    if (cooldownUntil <= Date.now()) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [cooldownUntil])

  useEffect(() => {
    const q = query(
      collection(db, 'qa_questions'),
      where('sessionId', '==', SESSION_ID),
    )
    const unsub = onSnapshot(q, snap => {
      const all = snap.docs
        .map(d => ({ id: d.id, ...d.data() } as Question))
        .filter(q => !q.archived)
        .sort((a, b) => {
          const voteDiff = (b.votes || 0) - (a.votes || 0)
          if (voteDiff !== 0) return voteDiff
          return (a.createdAt?.toMillis() ?? 0) - (b.createdAt?.toMillis() ?? 0)
        })
      setQuestions(all)
      setLoading(false)
    })
    return unsub
  }, [])

  async function submit() {
    const text = input.trim()
    if (!text || submitting) return
    if (submitCount >= MAX_QUESTIONS) return
    if (Date.now() < cooldownUntil) return
    setSubmitting(true)
    try {
      await addDoc(collection(db, 'qa_questions'), {
        sessionId: SESSION_ID,
        text,
        votes: 0,
        answered: false,
        archived: false,
        createdAt: serverTimestamp(),
      })
      const nextCount = submitCount + 1
      const nextCooldown = Date.now() + COOLDOWN_MS
      setSubmitCount(nextCount)
      setCooldownUntil(nextCooldown)
      setNow(Date.now())
      localStorage.setItem('qa_count_bec2026', String(nextCount))
      localStorage.setItem('qa_cooldown_bec2026', String(nextCooldown))
      setInput('')
      setSubmitted(true)
      setTimeout(() => setSubmitted(false), 2500)
    } finally {
      setSubmitting(false)
    }
  }

  async function vote(id: string) {
    if (votedIds.has(id)) return
    await updateDoc(doc(db, 'qa_questions', id), { votes: increment(1) })
    const next = new Set(votedIds)
    next.add(id)
    setVotedIds(next)
    localStorage.setItem('qa_voted_bec2026', JSON.stringify([...next]))
  }

  const open = questions.filter(q => !q.answered)
  const answered = questions.filter(q => q.answered)
  const inCooldown = now < cooldownUntil
  const atLimit = submitCount >= MAX_QUESTIONS
  const cooldownSec = Math.ceil((cooldownUntil - now) / 1000)
  const canSubmit = input.trim().length > 0 && !submitting && !inCooldown && !atLimit

  return (
    <div style={{
      minHeight: '100dvh',
      background: C.bg,
      fontFamily: 'var(--font-plus-jakarta), system-ui, sans-serif',
    }}>

      {/* Header */}
      <div style={{
        background: C.surface,
        borderBottom: `1px solid ${C.border}`,
        padding: '16px 20px 18px',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <div style={{
            fontSize: 11, color: C.dim, letterSpacing: '0.08em',
            textTransform: 'uppercase', marginBottom: 3,
          }}>
            GBI Baranangsiang Evening Church
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: C.white, letterSpacing: '-0.01em' }}>
            Tanya Jawab
          </div>
          <div style={{ fontSize: 12, color: C.dim, marginTop: 3 }}>
            {loading ? '—' : `${questions.length} pertanyaan masuk`}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 560, margin: '0 auto', padding: '0 16px 48px' }}>

        {/* Submit card */}
        <div style={{
          background: C.surface,
          borderRadius: 14,
          padding: 18,
          marginTop: 16,
          border: `1px solid ${C.border}`,
        }}>
          <div style={{
            fontSize: 13, fontWeight: 600, color: C.white,
            marginBottom: 10, letterSpacing: '0.01em',
          }}>
            Kirim Pertanyaan
          </div>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                submit()
              }
            }}
            placeholder="Tulis pertanyaanmu di sini..."
            rows={3}
            style={{
              width: '100%', border: `1.5px solid ${C.border}`, borderRadius: 8,
              padding: '10px 12px', fontSize: 15, fontFamily: 'inherit',
              resize: 'none', outline: 'none', boxSizing: 'border-box',
              lineHeight: 1.5, color: C.white, background: C.bg,
              transition: 'border-color 0.15s',
            }}
            onFocus={e => { e.target.style.borderColor = C.gold }}
            onBlur={e => { e.target.style.borderColor = C.border }}
          />
          <button
            onClick={submit}
            disabled={!canSubmit}
            style={{
              marginTop: 10, width: '100%', padding: '12px 0',
              background: canSubmit ? (submitted ? C.green : C.gold) : C.dim,
              color: 'white', border: 'none', borderRadius: 8,
              fontSize: 14, fontWeight: 600,
              cursor: canSubmit ? 'pointer' : 'not-allowed',
              transition: 'background 0.2s',
              letterSpacing: '0.02em',
            }}
          >
            {submitting ? 'Mengirim...'
              : submitted ? '✓ Pertanyaan Terkirim!'
              : atLimit ? `Batas ${MAX_QUESTIONS} pertanyaan per sesi`
              : inCooldown ? `Tunggu ${cooldownSec}s...`
              : 'Kirim Pertanyaan'}
          </button>
          <p style={{ margin: '8px 0 0', fontSize: 12, color: C.dim, textAlign: 'center' }}>
            Anonim · maks {MAX_QUESTIONS} pertanyaan · upvote yang sama
          </p>
        </div>

        {/* Question list */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: C.dim, fontSize: 14 }}>
            Memuat pertanyaan...
          </div>
        ) : questions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: C.dim, fontSize: 14, lineHeight: 1.7 }}>
            Belum ada pertanyaan.<br />Jadilah yang pertama!
          </div>
        ) : (
          <>
            {open.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <div style={{
                  fontSize: 11, fontWeight: 700, color: C.dim,
                  textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10,
                }}>
                  Pertanyaan · {open.length}
                </div>
                {open.map(q => (
                  <QuestionCard
                    key={q.id}
                    question={q}
                    voted={votedIds.has(q.id)}
                    onVote={() => vote(q.id)}
                  />
                ))}
              </div>
            )}
            {answered.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <div style={{
                  fontSize: 11, fontWeight: 700, color: C.dim,
                  textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10,
                }}>
                  Sudah Dijawab · {answered.length}
                </div>
                {answered.map(q => (
                  <QuestionCard
                    key={q.id}
                    question={q}
                    voted={votedIds.has(q.id)}
                    onVote={() => {}}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
