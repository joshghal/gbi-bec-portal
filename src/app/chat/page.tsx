import type { Metadata } from 'next';
import { Suspense } from 'react';
import ChatClient from './_chat-client';

export const metadata: Metadata = {
  title: 'Helpdesk',
  description: 'Tanya langsung seputar jadwal ibadah, baptisan, KOM, penyerahan anak, dan layanan GBI Baranangsiang Evening Church (BEC).',
  keywords: ['helpdesk gereja', 'GBI BEC', 'jadwal ibadah', 'baptisan GBI', 'KOM gereja', 'chatbot gereja'],
  openGraph: {
    title: 'Helpdesk GBI Baranangsiang Evening Church',
    description: 'Tanya AI kami 24/7 — jadwal ibadah, baptisan, KOM, penyerahan anak, dan layanan lainnya.',
    url: '/chat',
    type: 'website',
  },
  alternates: {
    canonical: '/chat',
  },
  robots: {
    index: true,
    follow: true,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Helpdesk GBI Baranangsiang Evening Church',
    description: 'Tanya AI kami 24/7 — jadwal ibadah, baptisan, KOM, penyerahan anak, dan layanan lainnya.',
  },
};

export default function ChatPage() {
  return (
    <Suspense>
      <ChatClient />
    </Suspense>
  );
}
