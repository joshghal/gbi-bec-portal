import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Saran & Masukan',
  description: 'Sampaikan saran dan masukanmu untuk GBI Baranangsiang Evening Church — bantu kami melayani jemaat lebih baik.',
  keywords: ['saran gereja', 'masukan GBI BEC', 'GBI Baranangsiang', 'feedback gereja Bandung'],
  alternates: { canonical: '/saran' },
  openGraph: {
    title: 'Saran & Masukan — GBI BEC',
    description: 'Sampaikan saran dan masukanmu untuk GBI Baranangsiang Evening Church.',
    type: 'website',
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
};

export default function SaranLayout({ children }: { children: React.ReactNode }) {
  return children;
}
