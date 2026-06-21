import type { Metadata } from 'next';
import { getLandingData } from '@/lib/landing-data';
import SmoothScroll from '@/components/smooth-scroll';
import Nav from '@/components/landing/nav';
import Hero from '@/components/landing/hero';
import AboutIntro from '@/components/landing/about-intro';
import ActivitiesSection from '@/components/landing/activities';
import ServicesSection from '@/components/landing/services';
import ScheduleSection from '@/components/landing/schedule';
import UpdatesSection from '@/components/landing/updates';
import VideoParallaxSection from '@/components/landing/video-parallax';
import ContactSection from '@/components/landing/contact';
import Footer from '@/components/landing/footer';
import LandingLoader from '@/components/landing/landing-loader';
import GrainOverlay from '@/components/grain-overlay';
import { JsonLd } from '@/components/json-ld';
import {
  jsonLdGraph,
  churchEntity,
  parentOrganizationEntity,
  websiteEntity,
} from '@/lib/seo';

export const metadata: Metadata = {
  // Real name + the nicknames people actually search ("GBI Barsi", "BEC").
  // The title tag is a direct ranking factor — this is the single strongest
  // legitimate place to surface the brand aliases. `absolute` bypasses the
  // root layout's "%s | GBI BEC" template so the tag stays tight (~49 chars).
  title: {
    absolute: 'GBI Baranangsiang Evening Church (GBI Barsi · BEC)',
  },
  description:
    'GBI Baranangsiang Evening Church (GBI Barsi / BEC), bagian dari GBI Sukawarna — ibadah setiap Minggu pukul 17:00 WIB di Jl. Baranang Siang No.8, Bandung.',
  openGraph: {
    title: 'GBI Baranangsiang Evening Church (GBI Barsi · BEC)',
    description:
      'Ibadah setiap Minggu pukul 17:00 WIB. Bergabunglah bersama komunitas GBI Barsi / BEC di Bandung — bagian dari GBI Sukawarna.',
    url: '/',
    type: 'website',
  },
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GBI Baranangsiang Evening Church (GBI Barsi · BEC)',
    description:
      'Ibadah setiap Minggu pukul 17:00 WIB. Komunitas GBI Barsi / BEC di Bandung, bagian dari GBI Sukawarna.',
  },
};

// One linked entity graph (Church ←→ parent GBI Sukawarna ←→ WebSite),
// referenced by @id across the site. See src/lib/seo.ts.
const jsonLd = jsonLdGraph(
  churchEntity(),
  parentOrganizationEntity(),
  websiteEntity(),
);

// Revalidate every 60 seconds so content stays fresh without being fully static
export const revalidate = 60;

export default async function LandingPage() {
  const data = await getLandingData();

  return (
    <>
      <JsonLd data={jsonLd} />
      <LandingLoader data={data}>
        <GrainOverlay />
        <SmoothScroll>
          <Nav />
          <main>
            <Hero />
            <VideoParallaxSection />
            <UpdatesSection />
            <AboutIntro />
            <ActivitiesSection />
            <ServicesSection />
            <ScheduleSection />
            <ContactSection />
          </main>
          <Footer />
        </SmoothScroll>
      </LandingLoader>
    </>
  );
}
