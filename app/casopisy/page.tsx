import type { Metadata } from "next";
import Link from "next/link";
import ContactSection from "@/components/homepage/ContactSection";
import MagazineCard from "@/components/magazine/MagazineCard";
import SubscribeBand from "@/components/magazine/SubscribeBand";
import { magazineAccent } from "@/components/magazine/identity";
import PageIntro from "@/components/shared/PageIntro";
import { editionsPath, editorialPlanPath, magazinePath } from "@/constants/routes";
import { getLatestEditions, getMagazine, getMagazines } from "@/lib/content";

export const metadata: Metadata = {
  title: "Časopisy",
  description:
    "Plynár – Vodár – Kúrenár + Klimatizácia pre profesie TZB a Správca bytových domov pre správcov, spoločenstvá a družstvá.",
};

export default async function MagazinesPage() {
  const summaries = await getMagazines();
  const entries = (
    await Promise.all(
      summaries.map(async ({ key }) => ({
        magazine: await getMagazine(key),
        editions: await getLatestEditions({ magazineKey: key, limit: 3 }),
      })),
    )
  ).filter((entry) => entry.magazine !== null);

  return (
    <main id="obsah">
      <PageIntro
        breadcrumbs={[{ label: "Časopisy" }]}
        eyebrow="Časopisy"
        title="Dva časopisy, každý pre svoju prax."
        lead="Vyberte si titul podľa toho, čomu sa venujete. Na stránke časopisu nájdete jeho témy, všetky vydania, edičný plán a predplatné."
      />

      <section aria-label="Prehľad časopisov" className="px-5 pt-[clamp(64px,8vw,120px)] md:px-8 xl:px-12">
        <div className="mx-auto grid max-w-[1400px] gap-x-[clamp(32px,5vw,80px)] gap-y-[clamp(72px,8vw,120px)] lg:grid-cols-2">
          {entries.map(({ magazine, editions }) =>
            magazine ? <MagazineCard key={magazine.key} magazine={magazine} editions={editions} headingLevel="h2" /> : null,
          )}
        </div>
      </section>

      <section aria-labelledby="porovnanie-nadpis" className="px-5 pt-[clamp(88px,10vw,150px)] md:px-8 xl:px-12">
        <div className="mx-auto max-w-[1400px]">
          <h2 id="porovnanie-nadpis" className="text-[clamp(36px,4.4vw,64px)] leading-none font-bold tracking-[-.035em]">Porovnanie</h2>
          <div className="mt-[clamp(32px,4vw,56px)] grid gap-5 lg:grid-cols-2">
            {entries.map(({ magazine }) =>
              magazine ? (
                <div key={magazine.key} className="rounded-[28px] bg-[var(--color-surface)] p-[clamp(28px,3.5vw,48px)]">
                  <p className={`text-[15px] font-semibold ${magazineAccent[magazine.key].text}`}>{magazine.audience}</p>
                  <h3 className="mt-2 text-[clamp(24px,2.2vw,32px)] leading-[1.1] font-bold tracking-[-.02em] text-balance">{magazine.title}</h3>
                  <dl className="mt-7 grid gap-5">
                    <div>
                      <dt className="text-sm text-[var(--color-muted)]">Pre koho</dt>
                      <dd className="mt-1 text-[17px] font-medium">{magazine.readers}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-[var(--color-muted)]">Hlavné témy</dt>
                      <dd className="mt-1 text-[17px] font-medium">{magazine.topics.map((topic) => topic.title).join(" · ")}</dd>
                    </div>
                  </dl>
                  <ul className="mt-8 list-none border-t border-[var(--color-line-dark)]">
                    {[
                      { label: "O časopise", href: magazinePath(magazine.key) },
                      { label: "Všetky vydania", href: editionsPath(magazine.key) },
                      { label: "Edičný plán", href: editorialPlanPath(magazine.key) },
                    ].map((link) => (
                      <li key={link.href}>
                        <Link href={link.href} className="flex min-h-[56px] items-center justify-between border-b border-[var(--color-line-dark)] text-[17px] font-semibold text-[var(--color-navy)] no-underline hover:text-[var(--color-blue)]">
                          {link.label}
                          <span aria-hidden="true">→</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null,
            )}
          </div>
          <div className="mt-[clamp(56px,6vw,88px)]">
            <SubscribeBand magazines={summaries} />
          </div>
        </div>
      </section>

      <ContactSection />
    </main>
  );
}
