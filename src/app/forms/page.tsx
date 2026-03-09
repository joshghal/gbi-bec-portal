'use client';

import Link from 'next/link';
import { GraduationCap, Droplets, Baby, Heart, ArrowLeft } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { FORM_CONFIGS } from '@/lib/form-config';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  GraduationCap,
  Droplets,
  Baby,
  HandHeart: Heart,
};

export default function FormsPage() {
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {FORM_CONFIGS.map(config => {
            const Icon = iconMap[config.icon];
            return (
              <Link key={config.type} href={`/forms/${config.type}`}>
                <Card className="h-full hover:ring-2 hover:ring-primary/30 transition-all cursor-pointer">
                  <CardHeader>
                    {Icon && (
                      <Icon className="w-8 h-8 text-primary mb-1" />
                    )}
                    <CardTitle>{config.title}</CardTitle>
                    <CardDescription>{config.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
