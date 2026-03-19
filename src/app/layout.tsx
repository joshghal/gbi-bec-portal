import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Judson } from "next/font/google";
import "./globals.css";
import { AnalyticsProvider } from "@/components/analytics-provider";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
});

const judson = Judson({
  variable: "--font-judson",
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bec.church';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'GBI Baranangsiang Evening Church',
    template: '%s | GBI BEC',
  },
  description: 'Gereja Bethel Indonesia Baranangsiang Evening Church (BEC) — ibadah setiap Minggu pukul 17:00 WIB di Bandung.',
  openGraph: {
    siteName: 'GBI Baranangsiang Evening Church',
    locale: 'id_ID',
    type: 'website',
  },
  icons: {
    icon: [
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16.png', sizes: '16x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body
        className={`${plusJakarta.variable} ${judson.variable} antialiased`}
      >
        <AnalyticsProvider>{children}</AnalyticsProvider>
      </body>
    </html>
  );
}
