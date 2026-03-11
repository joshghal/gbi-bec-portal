'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getFormConfig } from '@/lib/form-config';
import { FormChat } from '@/components/form-chat';

const config = getFormConfig('prayer')!;

export default function PrayerFormPage() {
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
