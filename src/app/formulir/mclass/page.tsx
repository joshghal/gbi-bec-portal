import type { Metadata } from 'next';
import { getFormConfig } from '@/lib/form-config';
import { FormDirect } from '@/components/form-direct';

export const metadata: Metadata = {
  title: 'Formulir Pendaftaran M-Class',
  description: 'Daftar M-Class GBI BEC Bandung — kelas online untuk pertumbuhan rohani jemaat. Terbuka untuk semua jemaat.',
  alternates: { canonical: '/formulir/mclass' },
  openGraph: {
    title: 'Formulir Pendaftaran M-Class — GBI BEC',
    description: 'Daftar M-Class di GBI Baranangsiang Evening Church, Bandung.',
    type: 'website',
  },
};

const config = getFormConfig('mclass')!;

export default function MclassFormPage() {
  return <FormDirect formConfig={config} />;
}
