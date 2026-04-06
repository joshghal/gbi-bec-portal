import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tanya Jawab — GBI BEC',
  robots: { index: false, follow: false },
}

export default function QALayout({ children }: { children: React.ReactNode }) {
  return children
}
