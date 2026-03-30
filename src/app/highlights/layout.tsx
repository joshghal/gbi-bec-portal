import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Highlights',
  description: 'Momen-momen penting dan sorotan kegiatan GBI Baranangsiang Evening Church Sukawarna.',
  robots: { index: false, follow: false },
};

export default function HighlightsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
