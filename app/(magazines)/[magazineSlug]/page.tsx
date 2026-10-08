import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ContactSection from "@/components/homepage/ContactSection";
import CoverCascade from "@/components/magazine/CoverCascade";
import EditionCard from "@/components/magazine/EditionCard";
import CinematicStatement from "@/components/magazine/CinematicStatement";
import TopicCards from "@/components/magazine/TopicCards";
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import {
  body,
  buttonOnDark,
  buttonPrimary,
  buttonSecondary,
  display,
  h2,
  headerGap,
  inner,
  lead,
  sectionTop,
  sectionX,
  textLink,
} from "@/components/shared/ui";
import { mailto } from "@/constants";
import { ROUTES, editionPath, editionsPath, editorialPlanPath, magazinePath } from "@/constants/routes";
import { getLatestEditions, getMagazine, getMagazineBySlug, getMagazines } from "@/lib/content";
import { bindDashes } from "@/lib/format/text";

export const dynamicParams = false;

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

  const [editions, summaries] = await Promise.all([getLatestEditions({ magazineKey: key, limit: 4 }), getMagazines()]);
  const latest = editions[0];
  const otherKey = summaries.find((summary) => summary.key !== key)?.key;
  const [other, [otherLatest]] = otherKey
    ? await Promise.all([getMagazine(otherKey), getLatestEditions({ magazineKey: otherKey, limit: 1 })])
    : [null, []];

  return (
    <main id="obsah" className="pt-[76px]">
      {/* Identity: light, cover-led — deliberately unlike the homepage video hero */}
      <section aria-labelledby="casopis-nadpis" className={sectionX}>
        <div className={`${inner} pt-[clamp(28px,3vw,40px)]`}>
          <Breadcrumbs items={[{ label: "Časopisy", href: ROUTES.magazines }, { label: magazine.shortTitle }]} />
          <div className="mt-[clamp(32px,4vw,56px)] grid items-center gap-x-[clamp(40px,6vw,96px)] gap-y-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
            <div className="min-w-0">
              <h1 id="casopis-nadpis" className={`max-w-[12ch] ${display}`}>
                {bindDashes(magazine.title)}
              </h1>
              <p className={`mt-7 max-w-[42ch] ${lead}`}>{magazine.description}</p>
              <div className="mt-10 flex flex-wrap items-center gap-3">
                <Link href="#predplatne" className={`${buttonPrimary} h-14 px-7 text-base`}>
                  Predplatiť časopis
                </Link>
                <Link href={editionsPath(key)} className={`${buttonSecondary} h-14 px-7 text-base`}>
                  Všetky vydania
                </Link>
              </div>
            </div>

            {latest && (
              <Link href={editionPath(key, latest.slug)} className="group block text-[var(--color-navy)] no-underline">
                <span className="relative block aspect-[1/.74] transition-transform duration-500 ease-out group-hover:-translate-y-1.5">
                  <CoverCascade editions={editions} preload />
                </span>
                <span className="mt-8 flex items-center justify-between gap-6 pl-[47%] pr-[9%]">
                  <span>
                    <span className="block text-[15px] text-[var(--color-muted)]">Aktuálne číslo</span>
                    <span className="mt-0.5 block text-[clamp(24px,2vw,30px)] leading-none font-bold tracking-[-.03em]">{latest.label}</span>
                  </span>
                  <span
                    aria-hidden="true"
                    className="grid size-12 shrink-0 place-items-center rounded-full bg-[var(--color-navy)] text-lg text-white transition-transform duration-300 group-hover:translate-x-1"
                  >
                    →
                  </span>
                </span>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Who we write for — a cinematic, full-screen statement */}
      <div className="mt-[clamp(96px,10vw,152px)]">
        <CinematicStatement
          id="pre-koho-nadpis"
          image={magazine.image}
          text={magazine.audienceStatement}
          highlight={magazine.audienceHighlight}
        />
      </div>

      {/* What is inside */}
      {magazine.topics.length > 0 && (
        <section aria-labelledby="temy-nadpis" className={`${sectionX} ${sectionTop}`}>
          <div className={inner}>
            <div className="grid items-end gap-x-[clamp(40px,6vw,104px)] gap-y-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
              <h2 id="temy-nadpis" className={h2}>Čo nájdete v časopise</h2>
              <p className={`max-w-[46ch] ${lead}`}>{magazine.intro}</p>
            </div>
            <div className={headerGap}>
              <TopicCards topics={magazine.topics} fallbackImage={magazine.image} />
            </div>
          </div>
        </section>
      )}

      {/* Latest covers */}
      {editions.length > 0 && (
        <section aria-labelledby="vydania-nadpis" className={`${sectionX} ${sectionTop}`}>
          <div className={inner}>
            <div className="flex flex-wrap items-end justify-between gap-x-12 gap-y-6">
              <h2 id="vydania-nadpis" className={h2}>Posledné čísla</h2>
              <Link href={editionsPath(key)} className={buttonSecondary}>
                Všetky vydania →
              </Link>
            </div>
            <ul className={`${headerGap} grid list-none grid-cols-2 gap-x-[clamp(16px,2vw,28px)] gap-y-12 lg:grid-cols-4`}>
              {editions.map((edition) => (
                <li key={edition.slug}>
                  <EditionCard edition={edition} magazineTitle={magazine.title} sizes="(max-width: 1024px) 50vw, 320px" />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Subscription & advertising */}
      <section id="predplatne" aria-label="Predplatné a inzercia" className={`${sectionX} ${sectionTop} scroll-mt-[76px]`}>
        <div className={`${inner} grid gap-5 lg:grid-cols-2`}>
          <div className="flex flex-col justify-between gap-14 rounded-[32px] bg-[var(--color-navy)] p-[clamp(32px,4.5vw,64px)] text-white">
            <div>
              <h2 className="text-[clamp(36px,3.6vw,52px)] leading-[1.02] font-bold tracking-[-.035em]">Predplatné</h2>
              <p className="mt-5 max-w-[40ch] text-[17px] leading-[1.6] text-[var(--color-card-copy)] text-pretty">
                {magazine.subscription.title}. {magazine.subscription.text}
              </p>
            </div>
            <div>
              <Link href={mailto(`Predplatné – ${magazine.title}`)} className={`${buttonOnDark} h-14 px-7 text-base`}>
                Objednať predplatné ↗
              </Link>
            </div>
          </div>
          <div className="flex flex-col justify-between gap-14 rounded-[32px] bg-[var(--color-surface)] p-[clamp(32px,4.5vw,64px)]">
            <div>
              <h2 className="text-[clamp(36px,3.6vw,52px)] leading-[1.02] font-bold tracking-[-.035em]">Inzercia</h2>
              <p className={`mt-5 max-w-[40ch] ${body} text-[17px]`}>Predstavte svoju firmu ľuďom, ktorí časopis čítajú.</p>
              <p className="mt-2 text-[15px] text-[var(--color-muted)]">{magazine.readers}</p>
            </div>
            <div className="flex flex-wrap items-center gap-x-7 gap-y-4">
              <Link href={`${ROUTES.advertising}#${key}`} className={`${buttonPrimary} h-14 px-7 text-base`}>
                Možnosti inzercie
              </Link>
              <Link href={editorialPlanPath(key)} className={textLink}>
                Edičný plán →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* The sister magazine */}
      {other && (
        <section aria-labelledby="dalsi-casopis-nadpis" className={`${sectionX} ${sectionTop}`}>
          <Link
            href={magazinePath(other.key)}
            className={`${inner} group grid items-center gap-x-10 gap-y-6 rounded-[32px] bg-[var(--color-surface)] p-[clamp(24px,3vw,40px)] text-[var(--color-navy)] no-underline transition-colors hover:bg-[var(--color-surface-hover)] sm:grid-cols-[auto_minmax(0,1fr)_auto]`}
          >
            {otherLatest && (
              <Image
                src={otherLatest.cover.src}
                alt=""
                width={otherLatest.cover.width}
                height={otherLatest.cover.height}
                sizes="112px"
                className="h-auto w-24 rounded-[4px] shadow-[0_16px_28px_-16px_rgba(4,23,58,.55)] transition-transform duration-300 group-hover:-translate-y-1 sm:w-28"
              />
            )}
            <span className="min-w-0">
              <span className="block text-[15px] text-[var(--color-muted)]">Vydávame aj</span>
              <span id="dalsi-casopis-nadpis" className="mt-1.5 block text-[clamp(24px,2.2vw,32px)] leading-[1.1] font-bold tracking-[-.025em] text-balance">
                {bindDashes(other.title)}
              </span>
              <span className={`mt-2 block max-w-[56ch] ${body}`}>{other.description}</span>
            </span>
            <span
              aria-hidden="true"
              className="grid size-14 place-items-center rounded-full bg-[var(--color-navy)] text-xl text-white transition-transform group-hover:translate-x-1"
            >
              →
            </span>
          </Link>
        </section>
      )}

      <ContactSection />
    </main>
  );
}
