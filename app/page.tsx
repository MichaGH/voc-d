import AboutSection from "@/components/homepage/AboutSection";
import AdvertisingSection from "@/components/homepage/AdvertisingSection";
import ArchiveSection from "@/components/homepage/ArchiveSection";
import AudienceSection from "@/components/homepage/AudienceSection";
import ContactSection from "@/components/homepage/ContactSection";
import EducationSection from "@/components/homepage/EducationSection";
import FaqSection from "@/components/homepage/FaqSection";
import HeroSection from "@/components/homepage/HeroSection";
import MagazinesSection from "@/components/homepage/MagazinesSection";
import PartnersSection from "@/components/homepage/PartnersSection";
import StatsSection from "@/components/homepage/StatsSection";

export default function Home() {
  return (
    <main id="obsah">
      <div className="flex min-h-[max(100svh,720px)] w-full flex-col xl:h-[100svh] xl:min-h-[720px]">
        <HeroSection />
        <PartnersSection />
      </div>
      <StatsSection />
      <MagazinesSection />
      <AboutSection />
      <AudienceSection />
      <EducationSection />
      <AdvertisingSection />
      <ArchiveSection />
      <FaqSection />
      <ContactSection />
    </main>
  );
}
