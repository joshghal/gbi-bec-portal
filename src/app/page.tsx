import type { Metadata } from 'next';
import SmoothScroll from '@/components/smooth-scroll';

export const metadata: Metadata = {
  title: 'GBI Baranangsiang Evening Church',
  description: 'Gereja Bethel Indonesia Baranangsiang Evening Church (BEC) — ibadah setiap Minggu pukul 17:00 WIB di Jl. Baranang Siang No.8, Bandung.',
};
import Nav from '@/components/landing/nav';
import Hero from '@/components/landing/hero';
import AboutIntro from '@/components/landing/about-intro';
import ActivitiesSection from '@/components/landing/activities';
import ServicesSection from '@/components/landing/services';
import ScheduleSection from '@/components/landing/schedule';
import UpdatesSection from '@/components/landing/updates';
import ContactSection from '@/components/landing/contact';
import Footer from '@/components/landing/footer';

export default function LandingPage() {
  return (
    <SmoothScroll>
      <Nav />
      <main>
        <Hero />
        <AboutIntro />
        <ActivitiesSection />
        <ServicesSection />
        <ScheduleSection />
        <UpdatesSection />
        <ContactSection />
      </main>
      <Footer />
    </SmoothScroll>
  );
}
