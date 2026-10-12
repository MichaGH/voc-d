import type { Metadata } from "next";
import ContactSection from "@/components/homepage/ContactSection";
import MagazineCard from "@/components/magazine/MagazineCard";
import SubscribeBand from "@/components/magazine/SubscribeBand";
import PageIntro from "@/components/shared/PageIntro";
import { inner, sectionTop, sectionX } from "@/components/shared/ui";
import { getLatestEditions, getMagazines } from "@/lib/content";

export const metadata: Metadata = {
  title: "Časopisy",
  description:
    "Plynár – Vodár – Kúrenár + Klimatizácia pre profesie TZB a Správca bytových domov pre správcov, spoločenstvá a družstvá.",
};

export default async function MagazinesPage() {
  const magazines = await getMagazines();
  const entries = await Promise.all(
    magazines.map(async (magazine) => ({
      magazine,
      editions: await getLatestEditions({ magazineKey: magazine.key, limit: 3 }),
    })),
  );

  return (
    <main id="obsah">
      <PageIntro
        breadcrumbs={[{ label: "Časopisy" }]}
        title="Časopisy"
        lead="Jeden pre správu bytových domov, druhý pre profesie technických zariadení budov."
      />

      <section aria-label="Prehľad časopisov" className={`${sectionX} pt-[clamp(72px,8vw,120px)]`}>
        <div className={`${inner} grid gap-x-[clamp(32px,5vw,80px)] gap-y-[clamp(80px,9vw,128px)] lg:grid-cols-2`}>
          {entries.map(({ magazine, editions }) => (
            <MagazineCard key={magazine.key} magazine={magazine} editions={editions} headingLevel="h2" />
          ))}
        </div>
      </section>

      <div className={`${sectionX} ${sectionTop}`}>
        <div className={inner}>
          <SubscribeBand magazines={magazines} />
        </div>
      </div>

      <ContactSection />
    </main>
  );
}
