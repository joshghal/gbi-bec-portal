import type { Metadata } from 'next';
import { AlertCircle, CalendarClock, CheckCircle2 } from 'lucide-react';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { findActiveCaptureForNotes, findRecipientBySlug, serviceLabel } from '@/lib/notetaker';
import { NotetakerForm } from '../../catatan/[token]/notetaker-form';

/**
 * The notulen's PERMANENT bookmark.
 *
 * Unlike /catatan/[token], this URL never changes and carries no capture ID —
 * every visit re-resolves whichever service is live right now. That is what makes
 * it survivable without WhatsApp: nothing has to be delivered to anyone.
 */

// Personal link, and the answer changes by the minute — never cache, never index.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Catatan Notulen',
  robots: { index: false, follow: false, nocache: true },
};

export default async function NotulenPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const db = getAdminFirestore();
  const recipient = await findRecipientBySlug(db, slug);

  if (!recipient) {
    return (
      <Shell>
        <StatusCard
          icon={<AlertCircle className="w-6 h-6 text-destructive" />}
          title="Link tidak dikenali"
          body="Link ini tidak terdaftar. Pastikan Anda membuka bookmark yang diberikan admin, atau hubungi admin untuk link baru."
        />
      </Shell>
    );
  }

  const capture = await findActiveCaptureForNotes(db);

  if (!capture) {
    return (
      <Shell name={recipient.name}>
        <StatusCard
          icon={<CalendarClock className="w-6 h-6 text-muted-foreground" />}
          title="Belum ada ibadah live"
          body="Saat ini tidak ada ibadah yang sedang berlangsung. Simpan halaman ini sebagai bookmark — buka lagi setelah khotbah selesai dan formulir catatan akan muncul otomatis di sini."
        />
      </Shell>
    );
  }

  // Notes already in for this service — never offer the form again, even while the
  // capture is still 'capturing' (there is a window of up to 15s before the engine
  // acts on stopRequested, and if it crashed the window never closes).
  if (capture.hasNotes) {
    return (
      <Shell name={recipient.name}>
        <StatusCard
          icon={<CheckCircle2 className="w-6 h-6 text-emerald-600" />}
          title="Catatan sudah terkirim"
          body={`Catatan untuk ${serviceLabel(capture.serviceNumber, capture.sermonDate)} sudah kami terima dan sedang diproses menjadi catatan khotbah. Tidak perlu mengirim ulang.`}
        />
      </Shell>
    );
  }

  return (
    <Shell name={recipient.name}>
      <NotetakerForm
        draftId={`${slug}:${capture.id}`}
        endpoint={`/api/notulen/${slug}`}
        service={serviceLabel(capture.serviceNumber, capture.sermonDate)}
        live={capture.live}
      />
    </Shell>
  );
}

function Shell({ children, name }: { children: React.ReactNode; name?: string }) {
  return (
    <main className="min-h-dvh bg-muted/30 px-4 py-8 sm:py-14">
      <div className="mx-auto w-full max-w-2xl">
        <header className="mb-6">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            GBI Baranangsiang Evening Church
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Catatan Notulen Ibadah</h1>
          {name && <p className="mt-1 text-sm text-muted-foreground">Shalom, {name}.</p>}
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
