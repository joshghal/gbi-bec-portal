'use client';

import { useState, useEffect, useCallback } from 'react';
import { Loader2, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { RequirePermission } from '@/components/require-permission';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Suggestion {
  id: string;
  name: string;
  text: string;
  createdAt: string | null;
}

function SuggestionCard({
  item, onDelete,
}: {
  item: Suggestion;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const date = item.createdAt
    ? new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    : '—';
  const preview = item.text.length > 120 ? item.text.slice(0, 120) + '...' : item.text;

  return (
    <div className="px-4 py-3 border-b last:border-b-0">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-medium">{item.name}</span>
            <span className="text-xs text-muted-foreground">{date}</span>
          </div>
          <p className="text-sm text-muted-foreground leading-snug">
            {expanded ? item.text : preview}
          </p>
          {item.text.length > 120 && (
            <button
              onClick={() => setExpanded(v => !v)}
              className="text-xs text-primary mt-1 flex items-center gap-0.5 hover:underline"
            >
              {expanded ? <><ChevronUp className="w-3 h-3" /> Tampilkan lebih sedikit</> : <><ChevronDown className="w-3 h-3" /> Baca selengkapnya</>}
            </button>
          )}
        </div>
        <Button
          size="sm" variant="ghost"
          className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive shrink-0 mt-0.5"
          onClick={onDelete}
          title="Hapus"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}

function SaranContent() {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSuggestions = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/suggestions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSuggestions(data.suggestions);
    } catch {
      toast.error('Gagal memuat saran.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchSuggestions(); }, [fetchSuggestions]);

  async function deleteSuggestion(id: string) {
    const token = await user?.getIdToken();
    try {
      const res = await fetch('/api/suggestions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error();
      setSuggestions(prev => prev.filter(s => s.id !== id));
      toast.success('Saran dihapus.');
    } catch {
      toast.error('Gagal menghapus.');
    }
  }

  return (
    <div className="min-h-0 flex-1">
      <header className="border-b bg-card px-6 py-4">
        <div>
          <h1 className="font-semibold text-lg">Saran & Masukan</h1>
          <p className="text-xs text-muted-foreground">
            {loading ? 'Memuat...' : `${suggestions.length} saran masuk`}
          </p>
        </div>
      </header>

      <main className="p-6 max-w-3xl mx-auto">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin mr-2" /> Memuat...
          </div>
        ) : suggestions.length === 0 ? (
          <div className="text-center py-16 text-sm text-muted-foreground">Belum ada saran masuk.</div>
        ) : (
          <div className="rounded-lg border bg-card overflow-hidden">
            {suggestions.map(s => (
              <SuggestionCard key={s.id} item={s} onDelete={() => deleteSuggestion(s.id)} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function AdminSaranPage() {
  return (
    <RequirePermission permission="page:saran">
      <SaranContent />
    </RequirePermission>
  );
}
