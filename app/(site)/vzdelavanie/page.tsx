import type { Metadata } from "next";
import ContactSection from "@/components/homepage/ContactSection";
import ArticleCard from "@/components/education/ArticleCard";
import OfferCard from "@/components/education/OfferCard";
import PageIntro from "@/components/shared/PageIntro";
import { h2, headerGap, inner, sectionTop, sectionX } from "@/components/shared/ui";
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
        title="Vzdelávanie"
        lead="Konferencia Správa budov, akreditovaný kurz pre správcov a odborné články z praxe."
      />

      {offers.length > 0 && (
        <section aria-label="Konferencia a kurz" className={`${sectionX} pt-[clamp(72px,8vw,120px)]`}>
          <div className={inner}>
            <div className="grid gap-4 lg:grid-cols-2">
              {offers.map((offer) => (
                <OfferCard key={offer.key} offer={offer} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section aria-labelledby="prispevky-nadpis" className={`${sectionX} ${sectionTop}`}>
        <div className={inner}>
          <h2 id="prispevky-nadpis" className={h2}>Novinky a pozvánky</h2>
          {posts.length === 0 ? (
            <p className="mt-10 rounded-3xl bg-[var(--color-surface)] p-10 text-lg text-[var(--color-copy)]">Pripravujeme prvé príspevky.</p>
          ) : (
            <ul className={`${headerGap} grid list-none gap-x-6 gap-y-16 sm:grid-cols-2 lg:grid-cols-3`}>
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
