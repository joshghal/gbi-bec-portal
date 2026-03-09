'use client';

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getFormConfig } from '@/lib/form-config';
import { FormChat } from '@/components/form-chat';

export default function FormTypePage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = use(params);
  const config = getFormConfig(type);

  if (!config) {
    return (
      <div className="flex flex-col items-center justify-center h-dvh gap-4">
        <p className="text-muted-foreground">Formulir tidak ditemukan</p>
        <Link
          href="/forms"
          className="text-sm text-primary hover:underline flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke daftar formulir
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-dvh bg-background">
      <header className="border-b bg-card px-4 py-3 flex items-center gap-3 shrink-0">
        <Link
          href="/forms"
          className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="font-semibold text-lg">{config.title}</h1>
      </header>
      <FormChat formConfig={config} />
    </div>
  );
}
