import type { Metadata } from 'next';
import { getFormConfig } from '@/lib/form-config';
import { FormDirect } from '@/components/form-direct';

export const metadata: Metadata = {
  title: 'Formulir Baptisan',
  description: 'Formulir pendaftaran baptisan air GBI BEC Bandung. Isi data diri, pilih jadwal baptisan, dan kirim — cepat dan mudah.',
  alternates: { canonical: '/formulir/baptis' },
  openGraph: {
    title: 'Formulir Baptisan — GBI BEC',
    description: 'Daftar baptisan air di GBI Baranangsiang Evening Church, Bandung. Mudah diisi dan cepat diproses.',
    type: 'website',
  },
};

const config = getFormConfig('baptism')!;

export default function BaptismFormPage() {
  return <FormDirect formConfig={config} />;
}
