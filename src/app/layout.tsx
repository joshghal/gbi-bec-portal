import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Judson } from "next/font/google";
import "./globals.css";
import { AnalyticsProvider } from "@/components/analytics-provider";
import { LazyToaster } from "@/components/lazy-toaster";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  display: "swap",
  // Don't preload — body copy can swap from fallback without perceptible
  // shift, and skipping preload frees bandwidth for the hero LCP image.
  preload: false,
});

const judson = Judson({
  variable: "--font-judson",
  subsets: ["latin"],
  // Drop italic 700 — only needed for decorative wordmarks in CTA banners,
  // which are below the LCP fold and the browser can synthesize italic from
  // weight 700 normal.
  weight: ["400", "700"],
  style: ["normal", "italic"],
  display: "swap",
  preload: true,
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: '#f5f0e8',
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gbibec.id';

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
  twitter: {
    card: 'summary_large_image',
  },
  icons: {
    icon: [
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16.png', sizes: '16x16', type: 'image/png' },
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
        <LazyToaster />
      </body>
    </html>
  );
}
