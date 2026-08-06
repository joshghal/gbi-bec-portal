import type { Metadata } from 'next';
import { getFormConfig } from '@/lib/form-config';
import { FormDirect } from '@/components/form-direct';

export const metadata: Metadata = {
  title: 'Formulir Pendataan Jemaat',
  description: 'Selamat datang di GBI Baranangsiang Evening Church, Bandung. Lengkapi data Anda sebagai jemaat dan kami akan menyambut Anda melalui WhatsApp.',
  alternates: { canonical: '/formulir/anggota-baru' },
  openGraph: {
    title: 'Formulir Pendataan Jemaat — GBI BEC',
    description: 'Lengkapi data Anda sebagai jemaat GBI Baranangsiang Evening Church, Bandung.',
    type: 'website',
  },
};

const config = getFormConfig('member')!;

export default function MemberFormPage() {
  return <FormDirect formConfig={config} />;
}
