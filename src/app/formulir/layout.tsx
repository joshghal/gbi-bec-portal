import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Formulir',
  description: 'Formulir pendaftaran GBI BEC — baptisan, penyerahan anak, pendaftaran KOM, permohonan doa, dan M-Class. Gratis dan mudah diisi.',
  keywords: ['formulir gereja', 'pendaftaran baptisan', 'formulir KOM', 'GBI BEC', 'pendaftaran gereja Bandung', 'penyerahan anak'],
  alternates: { canonical: '/formulir' },
  openGraph: {
    title: 'Formulir — GBI BEC',
    description: 'Formulir pendaftaran GBI Baranangsiang Evening Church — baptisan, penyerahan anak, KOM, doa, dan M-Class.',
    type: 'website',
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
};

export default function FormsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
