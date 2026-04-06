'use client';

import { useState } from 'react';
import { Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface SummaryRow {
  label: string;
  field: string;
  value: string;
  type: string;
  options?: string[];
}

interface FormSummaryProps {
  rows: SummaryRow[];
  editable?: boolean;
  onUpdate: (field: string, value: string) => void;
}

function formatDateDisplay(value: string): string {
  const [y, m, d] = value.split('-').map(Number);
  if (!y || !m || !d) return value;
  return new Date(y, m - 1, d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function FormSummary({ rows, editable = true, onUpdate }: FormSummaryProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Record<string, string>>(() =>
    Object.fromEntries(rows.map(r => [r.field, r.value]))
  );

  const handleToggleEdit = () => {
    if (editing) {
      for (const row of rows) {
        if (draft[row.field] !== row.value) {
          onUpdate(row.field, draft[row.field]);
        }
      }
    }
    setEditing(!editing);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium">Ringkasan jawaban Anda:</p>
        {editable && (
          <Button
            variant={editing ? 'default' : 'ghost'}
            size="xs"
            onClick={handleToggleEdit}
          >
            <Pencil className="w-2.5 h-2.5" />
            {editing ? 'Simpan' : 'Edit'}
          </Button>
        )}
      </div>

      <div className="divide-y divide-border/50">
        {rows.map(row => (
          <div key={row.field} className="py-1.5">
            <p className="text-xs text-muted-foreground leading-tight">{row.label}</p>
            {editing ? (
              <div className="mt-1">
                {row.type === 'select' && row.options ? (
                  <div className="flex flex-wrap gap-1">
                    {row.options.map(opt => (
                      <Button
                        key={opt}
                        type="button"
                        variant={draft[row.field] === opt ? 'default' : 'outline'}
                        size="xs"
                        className="rounded-full"
                        onClick={() => setDraft(d => ({ ...d, [row.field]: opt }))}
                      >
                        {opt}
                      </Button>
                    ))}
                  </div>
                ) : row.type === 'textarea' ? (
                  <Textarea
                    value={draft[row.field] || ''}
                    onChange={e => setDraft(d => ({ ...d, [row.field]: e.target.value }))}
                    className="text-xs min-h-7 py-1 px-2"
                    rows={2}
                  />
                ) : (
                  <Input
                    type={row.type === 'text' || row.type === 'select' ? 'text' : row.type}
                    value={draft[row.field] || ''}
                    onChange={e => setDraft(d => ({ ...d, [row.field]: e.target.value }))}
                    className="text-xs h-7 py-1 px-2"
                  />
                )}
              </div>
            ) : (
              <p className="text-xs mt-0.5">{(row.type === 'date' && row.value ? formatDateDisplay(row.value) : row.value) || <span className="text-muted-foreground italic">(kosong)</span>}</p>
            )}
          </div>
        ))}
      </div>

      {!editing && editable && (
        <p className="text-xs text-muted-foreground">
          Jika sudah benar, tekan tombol <strong>&quot;Kirim&quot;</strong> di bawah.
        </p>
      )}
    </div>
  );
}
