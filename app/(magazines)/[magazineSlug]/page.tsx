import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ContactSection from "@/components/homepage/ContactSection";
import EditionCard from "@/components/magazine/EditionCard";
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import {
  body,
  buttonOnDark,
  buttonOutlineOnDark,
  buttonPrimary,
  buttonSecondary,
  display,
  eyebrow,
  eyebrowOnDark,
  h2,
  h3,
  headerGap,
  inner,
  lead,
  leadOnDark,
  sectionTop,
  sectionX,
  textLink,
} from "@/components/shared/ui";
import { CONTACT, LINKS } from "@/constants";
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
    <main id="obsah">
      {/* Identity */}
      <section aria-labelledby="casopis-nadpis" className="relative isolate overflow-hidden bg-[var(--color-navy)] pt-[76px] text-white">
        <Image src={magazine.hero.poster.src} alt="" fill preload sizes="100vw" className="-z-10 object-cover" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(4,23,58,.95)_0%,rgba(4,23,58,.82)_50%,rgba(4,23,58,.6)_100%)]" />
        <div className={sectionX}>
          <div className={`${inner} pt-[clamp(28px,3vw,40px)] pb-[clamp(64px,8vw,120px)]`}>
            <Breadcrumbs tone="dark" items={[{ label: "Časopisy", href: ROUTES.magazines }, { label: magazine.shortTitle }]} />
            <div className="mt-[clamp(48px,7vw,104px)] grid items-end gap-x-16 gap-y-14 lg:grid-cols-[minmax(0,1fr)_auto]">
              <div className="min-w-0">
                <p className={eyebrowOnDark}>{magazine.audience}</p>
                <h1 id="casopis-nadpis" className={`mt-4 max-w-[13ch] ${display}`}>
                  {bindDashes(magazine.title)}
                </h1>
                <p className={`mt-6 max-w-[46ch] ${leadOnDark}`}>{magazine.description}</p>
                <div className="mt-10 flex flex-wrap gap-3">
                  <Link href="#predplatne" className={buttonOnDark}>
                    Predplatné
                  </Link>
                  <Link href={editionsPath(key)} className={buttonOutlineOnDark}>
                    Všetky vydania
                  </Link>
                </div>
              </div>
              {latest && (
                <Link href={editionPath(key, latest.slug)} className="group block w-[min(56vw,260px)] text-white no-underline lg:w-[clamp(220px,19vw,280px)]">
                  <Image
                    src={latest.cover.src}
                    alt=""
                    width={latest.cover.width}
                    height={latest.cover.height}
                    sizes="280px"
                    preload
                    className="aspect-[595/842] h-auto w-full rounded-md shadow-[0_40px_70px_-26px_rgba(0,0,0,.8)] transition-transform duration-300 group-hover:-translate-y-1.5"
                  />
                  <span className="mt-4 block text-sm text-white/70">
                    Aktuálne číslo <span className="font-semibold text-white">{latest.label}</span>
                  </span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Who it is for */}
      <section aria-labelledby="pre-koho-nadpis" className={`${sectionX} ${sectionTop}`}>
        <div className={inner}>
          <p className={eyebrow}>Pre koho</p>
          <h2 id="pre-koho-nadpis" className={`mt-4 max-w-[20ch] ${h2}`}>
            {magazine.audienceStatement}
          </h2>
          <div className={`${headerGap} grid gap-x-[clamp(32px,5vw,80px)] gap-y-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]`}>
            <p className={`max-w-[48ch] ${lead}`}>{magazine.intro}</p>
            <ul className="grid list-none gap-x-8 border-b border-[var(--color-line)] sm:grid-cols-2">
              {magazine.readerGroups.map((group) => (
                <li key={group} className="flex min-h-16 items-center border-t border-[var(--color-line)] text-[17px] font-semibold">
                  {group}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Topics */}
      {magazine.topics.length > 0 && (
        <section aria-labelledby="temy-nadpis" className={`${sectionX} ${sectionTop}`}>
          <div className={`${inner} grid items-start gap-x-[clamp(40px,6vw,104px)] gap-y-12 lg:grid-cols-[minmax(0,.9fr)_minmax(0,1.1fr)]`}>
            <div className="lg:sticky lg:top-[116px]">
              <p className={eyebrow}>V každom čísle</p>
              <h2 id="temy-nadpis" className={`mt-4 ${h2}`}>Čo nájdete v časopise</h2>
              <div className="relative mt-10 aspect-[4/3] overflow-hidden rounded-[28px] bg-[var(--color-line)] lg:aspect-[4/5]">
                <Image src={magazine.image.src} alt={magazine.image.alt} fill sizes="(max-width: 1024px) 100vw, 40vw" className="object-cover" />
              </div>
            </div>
            <ul className="list-none border-b border-[var(--color-line)]">
              {magazine.topics.map((topic) => (
                <li key={topic.key} className="border-t border-[var(--color-line)] py-[clamp(28px,3vw,40px)]">
                  <h3 className={h3}>{topic.title}</h3>
                  <p className={`mt-3 max-w-[52ch] ${body}`}>{topic.description}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Editions */}
      {editions.length > 0 && (
        <section aria-labelledby="vydania-nadpis" className={`${sectionX} mt-[clamp(96px,10vw,152px)] bg-[var(--color-surface)] py-[clamp(80px,9vw,128px)]`}>
          <div className={inner}>
            <div className="flex flex-wrap items-end justify-between gap-x-12 gap-y-6">
              <div>
                <p className={eyebrow}>Vydania</p>
                <h2 id="vydania-nadpis" className={`mt-4 ${h2}`}>Posledné čísla</h2>
              </div>
              <Link href={editionsPath(key)} className={buttonSecondary}>
                Všetky vydania
              </Link>
            </div>
            <ul className={`${headerGap} grid list-none grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4`}>
              {editions.map((edition) => (
                <li key={edition.slug}>
                  <EditionCard edition={edition} magazineTitle={magazine.title} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Subscription & advertising */}
      <section id="predplatne" aria-label="Predplatné a inzercia" className={`${sectionX} ${sectionTop} scroll-mt-[76px]`}>
        <div className={`${inner} grid gap-5 lg:grid-cols-2`}>
          <div className="flex flex-col justify-between gap-12 rounded-[28px] bg-[linear-gradient(135deg,var(--color-navy-light)_0%,var(--color-navy)_75%)] p-[clamp(32px,4vw,56px)] text-white">
            <div>
              <p className={eyebrowOnDark}>Predplatné</p>
              <h2 className={`mt-4 max-w-[16ch] ${h3}`}>{magazine.subscription.title}</h2>
              <p className="mt-4 max-w-[44ch] text-base leading-[1.6] text-[var(--color-card-copy)] text-pretty">{magazine.subscription.text}</p>
            </div>
            <div>
              <Link
                href={`mailto:${CONTACT.email}?subject=${encodeURIComponent(`Predplatné – ${magazine.title}`)}`}
                className={buttonOnDark}
              >
                Objednať predplatné ↗
              </Link>
            </div>
          </div>
          <div className="flex flex-col justify-between gap-12 rounded-[28px] bg-[var(--color-surface)] p-[clamp(32px,4vw,56px)]">
            <div>
              <p className={eyebrow}>Inzercia</p>
              <h2 className={`mt-4 max-w-[16ch] ${h3}`}>Predstavte svoju firmu čitateľom časopisu</h2>
              <p className={`mt-4 max-w-[44ch] ${body}`}>{magazine.readers}</p>
            </div>
            <div className="flex flex-wrap items-center gap-x-7 gap-y-4">
              <Link href={LINKS.advertise} className={buttonPrimary}>
                Dohodnúť inzerciu ↗
              </Link>
              <Link href={editorialPlanPath(key)} className={textLink}>
                Edičný plán →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* The other title */}
      {other && (
        <section aria-labelledby="dalsi-casopis-nadpis" className={`${sectionX} ${sectionTop}`}>
          <div className={`${inner} grid items-center gap-x-10 gap-y-6 border-y border-[var(--color-line)] py-8 sm:grid-cols-[auto_minmax(0,1fr)] lg:grid-cols-[auto_minmax(0,1fr)_auto]`}>
            {otherLatest && (
              <Image
                src={otherLatest.cover.src}
                alt=""
                width={otherLatest.cover.width}
                height={otherLatest.cover.height}
                sizes="96px"
                className="h-auto w-20 rounded-sm shadow-[0_12px_22px_-14px_rgba(4,23,58,.45)] sm:w-24"
              />
            )}
            <div className="min-w-0">
              <p className={eyebrow}>Vydávame aj</p>
              <h2 id="dalsi-casopis-nadpis" className={`mt-2 ${h3}`}>{bindDashes(other.title)}</h2>
              <p className={`mt-2 max-w-[60ch] ${body}`}>{other.description}</p>
            </div>
            <Link href={magazinePath(other.key)} className={`${buttonSecondary} justify-self-start`}>
              Otvoriť časopis →
            </Link>
          </div>
        </section>
      )}

      <ContactSection />
    </main>
  );
}
