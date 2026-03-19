import type { Metadata } from 'next';
import AdminShell from './_admin-shell';

export const metadata: Metadata = {
  title: 'Admin | GBI BEC',
  description: 'Panel administrasi GBI Baranangsiang Evening Church.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
