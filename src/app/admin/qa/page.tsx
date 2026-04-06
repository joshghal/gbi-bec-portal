'use client';

import { useState, useEffect } from 'react';
import {
  collection, updateDoc, doc,
  onSnapshot, query, where, addDoc, serverTimestamp,
} from 'firebase/firestore';
import { ChevronUp, Check, X, Monitor, Plus, Loader2 } from 'lucide-react';
import { db } from '@/lib/firebase';
import { QA_SESSION_ID } from '@/lib/qa';
import { RequirePermission } from '@/components/require-permission';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface Question {
  id: string;
  text: string;
  votes: number;
  answered: boolean;
  archived: boolean;
  createdAt: { toMillis: () => number } | null;
}

function QuestionRow({
  question, onToggleAnswered, onArchive, highlighted, onHighlight,
}: {
  question: Question;
  onToggleAnswered: () => void;
  onArchive: () => void;
  highlighted: boolean;
  onHighlight: () => void;
}) {
  return (
    <div className={`flex items-center gap-3 px-4 py-3 border-b last:border-b-0 transition-colors ${
      highlighted ? 'bg-amber-50' : ''
    }`}>
      <div className="flex items-center gap-1 w-10 shrink-0 text-muted-foreground">
        <ChevronUp className="w-3.5 h-3.5" />
        <span className="text-sm font-semibold tabular-nums text-foreground">{question.votes}</span>
      </div>

      <p className={`flex-1 text-sm leading-snug ${question.answered ? 'line-through text-muted-foreground' : ''}`}>
        {question.text}
      </p>

      <div className="flex items-center gap-2 shrink-0">
        {question.answered && (
          <Badge variant="secondary" className="text-green-700 bg-green-50 border-green-200 text-xs">
            Dijawab
          </Badge>
        )}
        {highlighted && (
          <Badge variant="secondary" className="text-amber-700 bg-amber-50 border-amber-200 text-xs">
            Ditampilkan
          </Badge>
        )}
        <Button size="sm" variant={highlighted ? 'default' : 'outline'} className="h-7 w-7 p-0" onClick={onHighlight} title="Tampilkan overlay">
          <Monitor className="w-3 h-3" />
        </Button>
        <Button size="sm" variant={question.answered ? 'secondary' : 'outline'} className={`h-7 w-7 p-0 ${question.answered ? 'text-green-700' : ''}`} onClick={onToggleAnswered} title={question.answered ? 'Buka kembali' : 'Tandai terjawab'}>
          <Check className="w-3 h-3" />
        </Button>
        <Button size="sm" variant="outline" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={onArchive} title="Hapus">
          <X className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}

function HighlightOverlay({ question, onClose }: { question: Question; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-8 cursor-pointer"
      style={{ background: 'rgba(26,23,20,0.88)' }}
      onClick={onClose}
    >
      <div
        className="bg-background rounded-2xl p-10 max-w-2xl w-full text-center shadow-2xl border"
        onClick={e => e.stopPropagation()}
      >
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-4">Pertanyaan Jemaat</p>
        <p className="text-3xl font-bold leading-snug mb-6">{question.text}</p>
        <div className="flex items-center justify-center gap-1.5 text-amber-600">
          <ChevronUp className="w-4 h-4" />
          <span className="text-base font-semibold">{question.votes} upvote</span>
        </div>
        <Button variant="outline" className="mt-6" onClick={onClose}>Tutup</Button>
      </div>
    </div>
  );
}

function QAContent() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [newQuestion, setNewQuestion] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, 'qa_questions'),
      where('sessionId', '==', QA_SESSION_ID),
    );
    return onSnapshot(q, snap => {
      const all = snap.docs
        .map(d => ({ id: d.id, ...d.data() } as Question))
        .filter(q => !q.archived)
        .sort((a, b) => {
          const voteDiff = (b.votes || 0) - (a.votes || 0);
          if (voteDiff !== 0) return voteDiff;
          return (a.createdAt?.toMillis() ?? 0) - (b.createdAt?.toMillis() ?? 0);
        });
      setQuestions(all);
      setLoading(false);
    });
  }, []);

  async function toggleAnswered(q: Question) {
    await updateDoc(doc(db, 'qa_questions', q.id), { answered: !q.answered });
  }

  async function archive(id: string) {
    if (id === highlightedId) setHighlightedId(null);
    await updateDoc(doc(db, 'qa_questions', id), { archived: true });
  }

  async function addQuestion() {
    const text = newQuestion.trim();
    if (!text || adding) return;
    setAdding(true);
    try {
      await addDoc(collection(db, 'qa_questions'), {
        sessionId: QA_SESSION_ID,
        text, votes: 0, answered: false, archived: false,
        createdAt: serverTimestamp(),
      });
      setNewQuestion('');
    } finally {
      setAdding(false);
    }
  }

  const highlighted = questions.find(q => q.id === highlightedId);
  const open = questions.filter(q => !q.answered);
  const answered = questions.filter(q => q.answered);

  return (
    <div className="min-h-0 flex-1">
      <header className="border-b bg-card px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="font-semibold text-lg">Tanya Jawab</h1>
            <p className="text-xs text-muted-foreground">
              {loading ? 'Memuat...' : `${questions.length} pertanyaan masuk`}
            </p>
          </div>
        </div>
      </header>

      <main className="p-6 max-w-3xl mx-auto space-y-4">
        {/* Add manual question */}
        <div className="rounded-lg border bg-card p-5 space-y-3">
          <p className="text-sm font-medium">Tambah Pertanyaan Manual</p>
          <div className="flex gap-2">
            <Input
              value={newQuestion}
              onChange={e => setNewQuestion(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addQuestion()}
              placeholder="Ketik pertanyaan dari jemaat..."
              className="flex-1"
            />
            <Button onClick={addQuestion} disabled={!newQuestion.trim() || adding} size="sm">
              {adding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5 mr-1" />}
              Tambah
            </Button>
          </div>
        </div>

        {/* Question list */}
        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin mr-2" /> Memuat...
          </div>
        ) : questions.length === 0 ? (
          <div className="text-center py-16 text-sm text-muted-foreground">Belum ada pertanyaan.</div>
        ) : (
          <div className="space-y-4">
            {open.length > 0 && (
              <div className="rounded-lg border bg-card overflow-hidden">
                <div className="px-4 py-2.5 border-b bg-muted/40">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Pertanyaan Masuk · {open.length}
                  </span>
                </div>
                {open.map(q => (
                  <QuestionRow key={q.id} question={q}
                    onToggleAnswered={() => toggleAnswered(q)}
                    onArchive={() => archive(q.id)}
                    highlighted={highlightedId === q.id}
                    onHighlight={() => setHighlightedId(highlightedId === q.id ? null : q.id)}
                  />
                ))}
              </div>
            )}
            {answered.length > 0 && (
              <div className="rounded-lg border bg-card overflow-hidden">
                <div className="px-4 py-2.5 border-b bg-muted/40">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Sudah Dijawab · {answered.length}
                  </span>
                </div>
                {answered.map(q => (
                  <QuestionRow key={q.id} question={q}
                    onToggleAnswered={() => toggleAnswered(q)}
                    onArchive={() => archive(q.id)}
                    highlighted={highlightedId === q.id}
                    onHighlight={() => setHighlightedId(highlightedId === q.id ? null : q.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {highlighted && (
        <HighlightOverlay question={highlighted} onClose={() => setHighlightedId(null)} />
      )}
    </div>
  );
}

export default function AdminQAPage() {
  return (
    <RequirePermission permission="page:qa">
      <QAContent />
    </RequirePermission>
  );
}
