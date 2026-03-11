'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Loader2 } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { FORM_CONFIGS } from '@/lib/form-config';

const glassImageMap: Record<string, string> = {
  kom: '/glass-one.webp',
  baptism: '/glass-second.webp',
  'child-dedication': '/glass-third.webp',
  prayer: '/glass-fourth.webp',
  mclass: '/glass-one.webp',
};
const getGlassImage = (type: string) => glassImageMap[type] || '/glass-one.webp';

export default function FormsPage() {
  const [disabledForms, setDisabledForms] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/forms/settings')
      .then(r => r.json())
      .then(data => setDisabledForms(data.disabledForms || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const activeForms = FORM_CONFIGS.filter(
    c => !c.externalUrl && !disabledForms.includes(c.type),
  );

  return (
    <div className="min-h-dvh bg-background">
      <header className="border-b bg-card px-4 py-3 flex items-center gap-3">
        <Link
          href="/"
          className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="font-semibold text-lg">Formulir Gereja</h1>
      </header>

      <div className="max-w-2xl mx-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
          </div>
        ) : activeForms.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground text-sm">
            Belum ada formulir yang tersedia saat ini.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {activeForms.map(config => (
              <Link key={config.type} href={`/forms/${config.type}`}>
                <Card className="h-full hover:ring-2 hover:ring-primary/20 transition-all cursor-pointer relative overflow-hidden">
                  <Image
                    src={getGlassImage(config.type)}
                    alt=""
                    width={320}
                    height={320}
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none blur-sm"
                  />
                  <CardHeader className="relative z-10">
                    <CardTitle>{config.title}</CardTitle>
                    <CardDescription>{config.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
