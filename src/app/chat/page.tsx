import type { Metadata } from 'next';
import { Suspense } from 'react';
import ChatClient from './_chat-client';

export const metadata: Metadata = {
  title: 'Helpdesk | GBI Baranangsiang Evening Church',
  description: 'Tanya langsung seputar jadwal ibadah, baptisan, KOM, penyerahan anak, dan layanan GBI Baranangsiang Evening Church (BEC).',
};

export default function ChatPage() {
  return (
    <Suspense>
      <ChatClient />
    </Suspense>
  );
}
