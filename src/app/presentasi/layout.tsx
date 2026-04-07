import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Presentasi Portal GBI BEC',
  robots: { index: false, follow: false },
}

export default function PresentationLayout({ children }: { children: React.ReactNode }) {
  return children
}
