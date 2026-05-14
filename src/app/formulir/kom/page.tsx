import type { Metadata } from 'next';
import { getFormConfig } from '@/lib/form-config';
import { FormDirect } from '@/components/form-direct';

export const metadata: Metadata = {
  title: 'Formulir Pendaftaran KOM',
  description: 'Daftar Kelas Orientasi Murid (KOM) GBI BEC Bandung — kurikulum rohani berjenjang 100, 200, 300, 400 dengan sertifikat resmi GBI.',
  alternates: { canonical: '/formulir/kom' },
  openGraph: {
    title: 'Formulir Pendaftaran KOM — GBI BEC',
    description: 'Daftar Kelas Orientasi Murid (KOM) di GBI Baranangsiang Evening Church, Bandung.',
    type: 'website',
  },
};

const config = getFormConfig('kom')!;

export default function KomFormPage() {
  return <FormDirect formConfig={config} />;
}
