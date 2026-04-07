import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tanya Jawab',
  description: 'Kirim pertanyaanmu dan upvote pertanyaan jemaat lain — sesi tanya jawab live GBI Baranangsiang Evening Church Bandung.',
  keywords: ['tanya jawab gereja', 'GBI BEC', 'sesi tanya jawab', 'GBI Baranangsiang', 'pertanyaan jemaat'],
  alternates: { canonical: '/tanya-jawab' },
  openGraph: {
    title: 'Tanya Jawab — GBI BEC',
    description: 'Kirim pertanyaanmu dan upvote pertanyaan jemaat lain.',
    type: 'website',
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
}

export default function QALayout({ children }: { children: React.ReactNode }) {
  return children
}
