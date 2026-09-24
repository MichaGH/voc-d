import AboutSection from "@/components/homepage/AboutSection";
import AdvertisingSection from "@/components/homepage/AdvertisingSection";
import ArchiveSection from "@/components/homepage/ArchiveSection";
import AudienceDividerSection from "@/components/homepage/AudienceDividerSection";
import AudienceSection from "@/components/homepage/AudienceSection";
import ContactSection from "@/components/homepage/ContactSection";
import EducationSection from "@/components/homepage/EducationSection";
import FaqSection from "@/components/homepage/FaqSection";
import HeroSection from "@/components/homepage/HeroSection";
import MagazinesSection from "@/components/homepage/MagazinesSection";
import PartnersSection from "@/components/homepage/PartnersSection";
import StatsSection from "@/components/homepage/StatsSection";
import TopicsSection from "@/components/homepage/TopicsSection";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Link href="#obsah" className="absolute top-2 left-[-9999px] z-100 bg-[var(--color-navy)] px-4 py-3 font-bold text-white focus:left-4">
        Preskočiť na obsah
      </Link>
      <Navbar />
      <main id="obsah">
        <div className="flex min-h-[max(100svh,720px)] flex-col">
          <HeroSection />
          <PartnersSection />
        </div>
        <StatsSection />
        <MagazinesSection />
        <AboutSection />
        <TopicsSection />
        <AudienceDividerSection />
        <AudienceSection />
        <EducationSection />
        <AdvertisingSection />
        <ArchiveSection />
        <FaqSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
