import type { Metadata } from 'next';
import { AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { resolveNoteLink, serviceLabel } from '@/lib/notetaker';
import { NotetakerForm } from './notetaker-form';

// Single-use link — must never be indexed, cached, or statically rendered.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Catatan Khotbah',
  robots: { index: false, follow: false, nocache: true },
};

export default async function CatatanPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const db = getAdminFirestore();
  const state = await resolveNoteLink(db, token);

  if (state.status === 'not-found') {
    return (
      <Shell>
        <StatusCard
          icon={<AlertCircle className="w-6 h-6 text-destructive" />}
          title="Link tidak valid"
          body="Link ini tidak dikenali. Pastikan Anda membuka link terbaru dari pesan WhatsApp, atau hubungi admin."
        />
      </Shell>
    );
  }

  const label = serviceLabel(state.link.serviceNumber, state.link.sermonDate);

  if (state.status === 'used') {
    return (
      <Shell>
        <StatusCard
          icon={<CheckCircle2 className="w-6 h-6 text-emerald-600" />}
          title="Catatan sudah terkirim"
          body={`Terima kasih! Catatan untuk ${label} sudah kami terima dan sedang diproses menjadi catatan khotbah.`}
        />
        {state.link.submittedNotes && (
          <section className="mt-4 rounded-xl border bg-card p-5">
            <h2 className="text-sm font-semibold text-muted-foreground mb-2">Catatan yang Anda kirim</h2>
            <pre className="whitespace-pre-wrap break-words text-sm leading-relaxed font-sans">
              {state.link.submittedNotes}
            </pre>
          </section>
        )}
      </Shell>
    );
  }

  if (state.status === 'expired') {
    return (
      <Shell>
        <StatusCard
          icon={<Clock className="w-6 h-6 text-amber-600" />}
          title="Link sudah kedaluwarsa"
          body={`Link untuk ${label} sudah lewat masa berlakunya. Hubungi admin untuk minta link baru.`}
        />
      </Shell>
    );
  }

  return (
    <Shell>
      <NotetakerForm
        draftId={token}
        endpoint={`/api/notetaker/${token}`}
        service={label}
      />
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-dvh bg-muted/30 px-4 py-8 sm:py-14">
      <div className="mx-auto w-full max-w-2xl">
        <header className="mb-6">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            GBI Baranangsiang Evening Church
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Catatan Notulen Ibadah</h1>
        </header>
        {children}
      </div>
    </main>
  );
}

function StatusCard({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <section className="rounded-xl border bg-card p-6">
      <div className="flex items-start gap-3">
        <span className="shrink-0 mt-0.5">{icon}</span>
        <div>
          <h2 className="font-semibold">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{body}</p>
        </div>
      </div>
    </section>
  );
}
