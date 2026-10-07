import type { Metadata } from "next";
import ContactSection from "@/components/homepage/ContactSection";
import ArticleCard from "@/components/education/ArticleCard";
import OfferCard from "@/components/education/OfferCard";
import PageIntro from "@/components/shared/PageIntro";
import { getArticles, getEducationOffers } from "@/lib/content";
import { todayInSiteZone } from "@/lib/format/dates";

export const metadata: Metadata = {
  title: "Vzdelávanie",
  description: "Konferencia Správa budov, akreditovaný kurz Správa bytového fondu a odborné články pre správcov a profesie TZB.",
};

/** Past/upcoming event markers follow today's date. */
export const revalidate = 86400;

export default async function EducationPage() {
  const [offers, { items: posts }] = await Promise.all([
    getEducationOffers(),
    getArticles({ section: "education", limit: 24 }),
  ]);
  const today = todayInSiteZone();

  return (
    <main id="obsah">
      <PageIntro
        breadcrumbs={[{ label: "Vzdelávanie" }]}
        eyebrow="Vzdelávanie"
        title="Konferencie, kurzy a odborné poznatky."
        lead="Stretnutia správcov bytových domov a profesií TZB, akreditovaná príprava správcov a ohliadnutia za tým, čo sa v odbore deje."
      />

      {offers.length > 0 && (
        <section aria-labelledby="ponuka-nadpis" className="px-5 pt-[clamp(64px,7vw,104px)] md:px-8 xl:px-12">
          <div className="mx-auto max-w-[1400px]">
            <h2 id="ponuka-nadpis" className="text-[15px] font-semibold text-[var(--color-muted)]">Pravidelná ponuka</h2>
            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              {offers.map((offer) => (
                <OfferCard key={offer.key} offer={offer} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section aria-labelledby="prispevky-nadpis" className="px-5 pt-[clamp(88px,10vw,150px)] md:px-8 xl:px-12">
        <div className="mx-auto max-w-[1400px]">
          <h2 id="prispevky-nadpis" className="text-[clamp(36px,4.4vw,64px)] leading-none font-bold tracking-[-.035em]">Novinky a pozvánky</h2>
          {posts.length === 0 ? (
            <p className="mt-10 rounded-3xl bg-[var(--color-surface)] p-10 text-lg text-[var(--color-copy)]">Pripravujeme prvé príspevky.</p>
          ) : (
            <ul className="mt-[clamp(40px,5vw,64px)] grid list-none gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <li key={post.slug}>
                  <ArticleCard article={post} today={today} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <ContactSection />
    </main>
  );
}
