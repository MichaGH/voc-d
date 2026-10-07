import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ContactSection from "@/components/homepage/ContactSection";
import EditionCard from "@/components/magazine/EditionCard";
import NextIssueCard from "@/components/magazine/NextIssueCard";
import TopicGrid from "@/components/magazine/TopicGrid";
import { magazineAccent } from "@/components/magazine/identity";
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import { LINKS } from "@/constants";
import { ROUTES, editionPath, editionsPath, editorialPlanPath } from "@/constants/routes";
import {
  getEdition,
  getEditorialPlan,
  getEditorialPlanYears,
  getLatestEditions,
  getMagazineBySlug,
  getMagazines,
} from "@/lib/content";
import { findNextPlanEntry } from "@/lib/content/rules";
import { todayInSiteZone } from "@/lib/format/dates";
import { bindDashes } from "@/lib/format/text";

export const dynamicParams = false;
/** The "next issue" teaser depends on today's date. */
export const revalidate = 86400;

export async function generateStaticParams() {
  const magazines = await getMagazines();
  return magazines.map((magazine) => ({ magazineSlug: magazine.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[magazineSlug]">): Promise<Metadata> {
  const magazine = await getMagazineBySlug((await params).magazineSlug);
  if (!magazine) return {};
  return { title: magazine.title, description: magazine.description };
}

export default async function MagazinePage({ params }: PageProps<"/[magazineSlug]">) {
  const magazine = await getMagazineBySlug((await params).magazineSlug);
  if (!magazine) notFound();
  const { key } = magazine;

  const [editions, planYears] = await Promise.all([
    getLatestEditions({ magazineKey: key, limit: 5 }),
    getEditorialPlanYears(key),
  ]);
  const latest = editions[0] ? await getEdition(key, editions[0].slug) : null;
  const today = todayInSiteZone();
  const currentYear = Number(today.slice(0, 4));
  const plans = (
    await Promise.all(planYears.filter((year) => year >= currentYear).map((year) => getEditorialPlan(key, year)))
  ).filter((plan) => plan !== null);
  const nextIssue = findNextPlanEntry(plans, today);
  const accent = magazineAccent[key];

  return (
    <main id="obsah">
      {/* Identity */}
      <section aria-labelledby="casopis-nadpis" className="relative isolate overflow-hidden bg-[var(--color-navy)] pt-[76px] text-white">
        <Image src={magazine.hero.poster.src} alt="" fill preload sizes="100vw" className="-z-10 object-cover" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(4,23,58,.94)_0%,rgba(4,23,58,.78)_55%,rgba(4,23,58,.55)_100%)]" />
        <div className="mx-auto grid max-w-[1400px] items-end gap-x-16 gap-y-12 px-5 pt-[clamp(32px,4vw,56px)] pb-[clamp(56px,7vw,112px)] md:px-8 lg:grid-cols-[minmax(0,1fr)_auto] xl:px-12">
          <div className="min-w-0">
            <Breadcrumbs tone="dark" items={[{ label: "Časopisy", href: ROUTES.magazines }, { label: magazine.shortTitle }]} />
            <p className={`mt-[clamp(40px,6vw,96px)] text-[15px] font-semibold ${accent.textOnDark}`}>{magazine.audience}</p>
            <h1 id="casopis-nadpis" className="mt-3 max-w-[16ch] text-[clamp(40px,5.4vw,84px)] leading-[.98] font-bold tracking-[-.04em] text-balance">
              {bindDashes(magazine.title)}
            </h1>
            <p className="mt-6 max-w-[56ch] text-[clamp(17px,1.4vw,20px)] text-[var(--color-hero-copy)] text-pretty">{magazine.intro}</p>
            <p className="mt-4 text-[15px] text-white/60">{magazine.readers}</p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link href="#predplatne" className="inline-flex h-14 items-center rounded-full bg-white px-7 text-base font-semibold whitespace-nowrap text-[var(--color-navy)] no-underline transition-colors hover:bg-[var(--color-cyan)] hover:text-[var(--color-navy)]">
                Predplatné
              </Link>
              <Link href={editionsPath(key)} className="inline-flex h-14 items-center rounded-full border border-white/45 px-7 text-base font-semibold whitespace-nowrap text-white no-underline transition-colors hover:bg-white/12 hover:text-white">
                Všetky vydania
              </Link>
              <Link href={editorialPlanPath(key)} className="inline-flex h-14 items-center px-3 text-base font-semibold text-white no-underline hover:text-[var(--color-blue-pale)]">
                Edičný plán →
              </Link>
            </div>
          </div>
          {latest && (
            <Link href={editionPath(key, latest.slug)} className="group block w-[min(62vw,300px)] text-white no-underline lg:w-[clamp(220px,20vw,300px)]">
              <Image
                src={latest.cover.src}
                alt=""
                width={latest.cover.width}
                height={latest.cover.height}
                sizes="300px"
                preload
                className="aspect-[595/842] h-auto w-full rounded-md shadow-[0_40px_70px_-26px_rgba(0,0,0,.8)] transition-transform duration-300 group-hover:-translate-y-1.5"
              />
              <span className="mt-4 flex items-center justify-between text-[15px] font-semibold">
                <span>
                  Aktuálne číslo {latest.label}
                </span>
                <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">→</span>
              </span>
            </Link>
          )}
        </div>
      </section>

      {/* Latest issue contents */}
      {latest && latest.highlights.length > 0 && (
        <section aria-labelledby="aktualne-nadpis" className="px-5 pt-[clamp(88px,10vw,150px)] md:px-8 xl:px-12">
          <div className="mx-auto grid max-w-[1400px] gap-x-[clamp(40px,6vw,96px)] gap-y-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]">
            <div>
              <p className="text-[15px] font-semibold text-[var(--color-blue)]">Číslo {latest.label}</p>
              <h2 id="aktualne-nadpis" className="mt-3 text-[clamp(36px,4.4vw,64px)] leading-none font-bold tracking-[-.035em] text-balance">V aktuálnom čísle</h2>
              <Link href={editionPath(key, latest.slug)} className="mt-6 inline-block text-base font-semibold text-[var(--color-blue)]">
                Viac o vydaní {latest.label} →
              </Link>
            </div>
            <ol className="list-none border-t border-[var(--color-line)]">
              {latest.highlights.map((highlight) => (
                <li key={highlight.title} className="flex items-baseline justify-between gap-6 border-b border-[var(--color-line)] py-6">
                  <span className="text-[clamp(19px,1.6vw,23px)] leading-snug font-semibold tracking-[-.01em] text-balance">{highlight.title}</span>
                  {highlight.page && <span className="shrink-0 text-[15px] text-[var(--color-muted)]">str. {highlight.page}</span>}
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* Čo nájdete */}
      {magazine.topics.length > 0 && (
        <section id="temy" aria-labelledby="temy-nadpis" className="scroll-mt-[76px] px-5 pt-[clamp(88px,10vw,150px)] md:px-8 xl:px-12">
          <div className="mx-auto max-w-[1400px]">
            <div className="flex flex-wrap items-end justify-between gap-x-16 gap-y-5">
              <div>
                <p className={`text-[15px] font-semibold ${accent.text}`}>{magazine.audience}</p>
                <h2 id="temy-nadpis" className="mt-3 max-w-[14ch] text-[clamp(36px,4.4vw,64px)] leading-none font-bold tracking-[-.035em] text-balance">Čo nájdete v časopise</h2>
              </div>
              <p className="max-w-[40ch] text-lg text-[var(--color-copy)] text-pretty">{magazine.description}</p>
            </div>
            <div className="mt-[clamp(40px,5vw,64px)]">
              <TopicGrid topics={magazine.topics} />
            </div>
          </div>
        </section>
      )}

      {/* Editions */}
      {editions.length > 0 && (
        <section aria-labelledby="vydania-nadpis" className="px-5 pt-[clamp(88px,10vw,150px)] md:px-8 xl:px-12">
          <div className="mx-auto max-w-[1400px]">
            <div className="flex flex-wrap items-end justify-between gap-x-12 gap-y-5">
              <div>
                <p className="text-[15px] font-semibold text-[var(--color-blue)]">Vydania</p>
                <h2 id="vydania-nadpis" className="mt-3 text-[clamp(36px,4.4vw,64px)] leading-none font-bold tracking-[-.035em]">Posledné čísla</h2>
              </div>
              <Link href={editionsPath(key)} className="text-base font-semibold text-[var(--color-blue)]">
                Všetky vydania →
              </Link>
            </div>
            <ul className="mt-[clamp(40px,5vw,64px)] grid list-none grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-5">
              {editions.map((edition) => (
                <li key={edition.slug}>
                  <EditionCard edition={edition} magazineTitle={magazine.title} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Editorial plan */}
      <section aria-label="Edičný plán" className="px-5 pt-[clamp(88px,10vw,150px)] md:px-8 xl:px-12">
        <div className="mx-auto max-w-[1400px]">
          <NextIssueCard magazineKey={key} entry={nextIssue} />
        </div>
      </section>

      {/* Subscription & advertising */}
      <section id="predplatne" aria-labelledby="predplatne-nadpis" className="scroll-mt-[76px] px-5 pt-[clamp(88px,10vw,150px)] md:px-8 xl:px-12">
        <div className="mx-auto grid max-w-[1400px] gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
          <div className="flex flex-col justify-between gap-10 rounded-[28px] bg-[linear-gradient(135deg,var(--color-navy-light)_0%,var(--color-navy)_75%)] p-[clamp(28px,4vw,56px)] text-white">
            <div>
              <p className="text-sm font-semibold text-[var(--color-blue-pale)]">Predplatné</p>
              <h2 id="predplatne-nadpis" className="mt-2 max-w-[18ch] text-[clamp(28px,3vw,44px)] leading-[1.05] font-bold tracking-[-.03em] text-balance">
                {magazine.subscription.title}
              </h2>
              <p className="mt-4 max-w-[48ch] text-[17px] text-[var(--color-card-copy)] text-pretty">{magazine.subscription.text}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href={`mailto:voc@voc.sk?subject=${encodeURIComponent(`Predplatné – ${magazine.title}`)}`}
                className="inline-flex h-[52px] items-center rounded-full bg-white px-6 text-[15px] font-semibold whitespace-nowrap text-[var(--color-navy)] no-underline transition-colors hover:bg-[var(--color-cyan)] hover:text-[var(--color-navy)]"
              >
                Objednať predplatné ↗
              </Link>
            </div>
          </div>
          <div className="flex flex-col justify-between gap-10 rounded-[28px] bg-[var(--color-surface)] p-[clamp(28px,4vw,56px)]">
            <div>
              <p className="text-sm font-semibold text-[var(--color-blue)]">Inzercia</p>
              <h2 className="mt-2 max-w-[18ch] text-[clamp(28px,3vw,44px)] leading-[1.05] font-bold tracking-[-.03em] text-balance">Oslovte čitateľov časopisu</h2>
              <p className="mt-4 max-w-[44ch] text-[17px] text-[var(--color-copy)] text-pretty">{magazine.readers}</p>
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <Link
                href={LINKS.advertise}
                className="inline-flex h-[52px] items-center rounded-full bg-[var(--color-navy)] px-6 text-[15px] font-semibold whitespace-nowrap text-white no-underline transition-colors hover:bg-[var(--color-blue)] hover:text-white"
              >
                Dohodnúť inzerciu ↗
              </Link>
              <Link href={magazine.advertisingInfoUrl} className="text-[15px] font-semibold text-[var(--color-blue)]">
                Cenník a formáty ↗
              </Link>
              <Link href={editorialPlanPath(key)} className="text-[15px] font-semibold text-[var(--color-blue)]">
                Termíny uzávierok →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <ContactSection />
    </main>
  );
}
