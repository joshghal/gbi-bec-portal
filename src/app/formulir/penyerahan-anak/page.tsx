import type { Metadata } from 'next';
import { getFormConfig } from '@/lib/form-config';
import { FormDirect } from '@/components/form-direct';

export const metadata: Metadata = {
  title: 'Formulir Penyerahan Anak',
  description: 'Formulir pendaftaran penyerahan anak GBI BEC Bandung. Komitmen orang tua mendidik anak dalam Tuhan, dilakukan bersama kedua orang tua di hadapan jemaat.',
  alternates: { canonical: '/formulir/penyerahan-anak' },
  openGraph: {
    title: 'Formulir Penyerahan Anak — GBI BEC',
    description: 'Daftar penyerahan anak di GBI Baranangsiang Evening Church, Bandung.',
    type: 'website',
  },
};

const config = getFormConfig('child-dedication')!;

export default function ChildDedicationFormPage() {
  return <FormDirect formConfig={config} />;
}
