import type { Metadata } from 'next';
import { getFormConfig } from '@/lib/form-config';
import { FormDirect } from '@/components/form-direct';

export const metadata: Metadata = {
  title: 'Formulir Permohonan Doa',
  description: 'Kirim permohonan doa kepada tim doa GBI BEC Bandung. Doa akan didoakan dalam kerahasiaan oleh tim doa gereja.',
  alternates: { canonical: '/formulir/doa' },
  openGraph: {
    title: 'Formulir Permohonan Doa — GBI BEC',
    description: 'Sampaikan pokok doa Anda kepada tim doa GBI Baranangsiang Evening Church, Bandung.',
    type: 'website',
  },
};

const config = getFormConfig('prayer')!;

export default function PrayerFormPage() {
  return <FormDirect formConfig={config} />;
}
