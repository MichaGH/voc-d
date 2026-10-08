import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ContactSection from "@/components/homepage/ContactSection";
import CoverCascade from "@/components/magazine/CoverCascade";
import EditionCard from "@/components/magazine/EditionCard";
import TopicExplorer from "@/components/magazine/TopicExplorer";
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import {
  body,
  buttonOnDark,
  buttonPrimary,
  buttonSecondary,
  display,
  eyebrowOnDark,
  h2,
  h3,
  headerGap,
  inner,
  lead,
  sectionTop,
  sectionX,
  textLink,
} from "@/components/shared/ui";
import { CONTACT } from "@/constants";
import { ROUTES, editionPath, editionsPath, editorialPlanPath, magazinePath } from "@/constants/routes";
import { getLatestEditions, getMagazine, getMagazineBySlug, getMagazines } from "@/lib/content";
import { bindDashes } from "@/lib/format/text";
import type { Magazine } from "@/types/content";

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

/** Renders the audience statement with its optional highlighted part. */
function AudienceStatement({ magazine }: { magazine: Magazine }) {
  const { audienceStatement: text, audienceHighlight: highlight } = magazine;
  const at = highlight ? text.indexOf(highlight) : -1;
  if (!highlight || at < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, at)}
      <span className="text-[var(--color-blue-light)]">{highlight}</span>
      {text.slice(at + highlight.length)}
    </>
  );
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
              <Link
                href={editionPath(key, latest.slug)}
                aria-label={`Aktuálne číslo ${latest.label}`}
                className="group relative block aspect-[1/.86] overflow-hidden rounded-[36px] bg-[var(--color-surface)] no-underline"
              >
                <span className="absolute inset-0 transition-transform duration-500 ease-out group-hover:-translate-y-2">
                  <CoverCascade editions={editions} preload />
                </span>
                <span className="absolute bottom-6 left-6 inline-flex h-10 items-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-[var(--color-navy)] shadow-[0_8px_20px_-12px_rgba(4,23,58,.4)]">
                  Aktuálne číslo {latest.label}
                  <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">→</span>
                </span>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Who we write for */}
      <section
        aria-labelledby="pre-koho-nadpis"
        className="relative isolate mt-[clamp(96px,10vw,152px)] flex min-h-[min(82vh,780px)] items-end overflow-hidden bg-[var(--color-navy)] text-white"
      >
        <Image src={magazine.image.src} alt={magazine.image.alt} fill sizes="100vw" className="-z-10 object-cover" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(0deg,rgba(4,23,58,.94)_0%,rgba(4,23,58,.55)_55%,rgba(4,23,58,.2)_100%)]" />
        <div className={`${sectionX} w-full`}>
          <div className={`${inner} py-[clamp(56px,7vw,112px)]`}>
            <p className={eyebrowOnDark}>Pre koho píšeme</p>
            <h2
              id="pre-koho-nadpis"
              className="mt-5 max-w-[19ch] text-[clamp(34px,4.6vw,72px)] leading-[1.03] font-bold tracking-[-.04em] text-balance"
            >
              <AudienceStatement magazine={magazine} />
            </h2>
            <ul aria-label="Čitatelia" className="mt-10 flex list-none flex-wrap gap-2.5">
              {magazine.readerGroups.map((group) => (
                <li
                  key={group}
                  className="inline-flex h-11 items-center rounded-full border border-white/25 bg-white/10 px-5 text-[15px] font-medium backdrop-blur-sm"
                >
                  {group}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* What is inside */}
      {magazine.topics.length > 0 && (
        <section aria-labelledby="temy-nadpis" className={`${sectionX} ${sectionTop}`}>
          <div className={inner}>
            <div className="grid items-end gap-x-[clamp(40px,6vw,104px)] gap-y-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
              <h2 id="temy-nadpis" className={h2}>Čo nájdete v časopise</h2>
              <p className={`max-w-[46ch] ${lead}`}>{magazine.intro}</p>
            </div>
            <div className={headerGap}>
              <TopicExplorer topics={magazine.topics} fallbackImage={magazine.image} />
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
          <div className="flex flex-col justify-between gap-12 rounded-[32px] bg-[linear-gradient(135deg,var(--color-navy-light)_0%,var(--color-navy)_75%)] p-[clamp(32px,4vw,56px)] text-white">
            <div>
              <p className={eyebrowOnDark}>Predplatné</p>
              <h2 className={`mt-4 max-w-[16ch] ${h3}`}>{magazine.subscription.title}</h2>
              <p className="mt-4 max-w-[44ch] text-base leading-[1.6] text-[var(--color-card-copy)] text-pretty">{magazine.subscription.text}</p>
            </div>
            <div>
              <Link
                href={`mailto:${CONTACT.email}?subject=${encodeURIComponent(`Predplatné – ${magazine.title}`)}`}
                className={`${buttonOnDark} h-14 px-7 text-base`}
              >
                Objednať predplatné ↗
              </Link>
            </div>
          </div>
          <div className="flex flex-col justify-between gap-12 rounded-[32px] bg-[var(--color-surface)] p-[clamp(32px,4vw,56px)]">
            <div>
              <p className="text-base font-semibold text-[var(--color-blue)]">Inzercia</p>
              <h2 className={`mt-4 max-w-[16ch] ${h3}`}>Predstavte svoju firmu čitateľom časopisu</h2>
              <p className={`mt-4 max-w-[44ch] ${body}`}>{magazine.readers}</p>
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
              <span className="block text-base font-semibold text-[var(--color-blue)]">Vydávame aj</span>
              <span id="dalsi-casopis-nadpis" className={`mt-2 block ${h3}`}>
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
