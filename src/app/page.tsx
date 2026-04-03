import type { Metadata } from 'next';
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

export const metadata: Metadata = {
  title: 'GBI Baranangsiang Evening Church',
  description: 'Gereja Bethel Indonesia Baranangsiang Evening Church (BEC) — ibadah setiap Minggu pukul 17:00 WIB di Jl. Baranang Siang No.8, Bandung.',
  keywords: ['GBI BEC', 'Baranangsiang Evening Church', 'gereja Bandung', 'GBI Bandung', 'ibadah Bandung', 'gereja Bethel Indonesia'],
  openGraph: {
    title: 'GBI Baranangsiang Evening Church',
    description: 'Ibadah setiap Minggu pukul 17:00 WIB. Bergabunglah bersama komunitas BEC di Bandung.',
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
    title: 'GBI Baranangsiang Evening Church',
    description: 'Ibadah setiap Minggu pukul 17:00 WIB. Bergabunglah bersama komunitas BEC di Bandung.',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Church',
  name: 'GBI Baranangsiang Evening Church',
  alternateName: 'GBI BEC',
  url: 'https://gbibec.id',
  telephone: '+6287823420950',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Jl. Baranang Siang No.8',
    addressLocality: 'Sumur Bandung',
    addressRegion: 'Bandung',
    postalCode: '40113',
    addressCountry: 'ID',
  },
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: 'Sunday',
    opens: '17:00',
    closes: '19:00',
  },
  sameAs: [
    'https://www.instagram.com/sukawarna.bec/',
    'https://www.youtube.com/@gbibaranangsiangsukawarna7008',
  ],
};

export default function LandingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LandingLoader>
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
