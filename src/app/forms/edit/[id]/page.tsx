'use client';

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FormTraditional from '@/components/form-traditional';

export default function EditFormPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { id } = use(params);
  const { token } = use(searchParams);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card px-4 py-3 flex items-center gap-3">
        <Link href="/">
          <Button variant="ghost" size="icon" className="shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="font-semibold text-lg">Status Formulir</h1>
      </header>

      <main className="p-4">
        {!token ? (
          <div className="max-w-2xl mx-auto text-center py-20">
            <p className="text-destructive">Link tidak valid. Token akses diperlukan.</p>
          </div>
        ) : (
          <FormTraditional submissionId={id} editToken={token} />
        )}
      </main>
    </div>
  );
}
