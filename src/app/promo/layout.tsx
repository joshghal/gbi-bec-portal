import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Promo',
  description: 'Video promosi dan konten GBI Baranangsiang Evening Church Sukawarna.',
  robots: { index: false, follow: false },
};

export default function PromoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
