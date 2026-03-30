import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Formulir Pendaftaran',
  description: 'Formulir online GBI BEC — daftar baptisan air, penyerahan anak, M-Class, dan pokok doa. Isi langsung dari HP kapan saja.',
  keywords: ['formulir gereja', 'daftar baptisan', 'pendaftaran GBI BEC', 'M-Class', 'penyerahan anak'],
  robots: { index: false, follow: true },
};

export default function FormsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
