import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ArticleCard from "@/components/education/ArticleCard";
import PortableTextBody from "@/components/education/PortableTextBody";
import { articleKindLabel } from "@/components/education/labels";
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import { LINKS } from "@/constants";
import { ROUTES, SITE_ORIGIN } from "@/constants/routes";
import { getArticleBySlug, getArticles } from "@/lib/content";
import { formatEventRange, formatLongDate, todayInSiteZone } from "@/lib/format/dates";

export const dynamicParams = false;
export const revalidate = 86400;

export async function generateStaticParams() {
  const { items } = await getArticles({ section: "education", limit: 48 });
  return items.map((article) => ({ postSlug: article.slug }));
}

export async function generateMetadata({ params }: PageProps<"/vzdelavanie/[postSlug]">): Promise<Metadata> {
  const article = await getArticleBySlug("education", (await params).postSlug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.excerpt,
    openGraph: article.image ? { images: [{ url: article.image.src, width: article.image.width, height: article.image.height }] } : undefined,
  };
}

export default async function EducationArticlePage({ params }: PageProps<"/vzdelavanie/[postSlug]">) {
  const article = await getArticleBySlug("education", (await params).postSlug);
  if (!article) notFound();

  const today = todayInSiteZone();
  const { items } = await getArticles({ section: "education", limit: 4 });
  const related = items.filter((item) => item.slug !== article.slug).slice(0, 3);
  const event = article.event;
  const eventEnd = event ? (event.end ?? event.start).date : null;
  const isPast = eventEnd !== null && eventEnd < today;

  const eventJsonLd = event && {
    "@context": "https://schema.org",
    "@type": "Event",
    name: article.title,
    description: article.excerpt,
    startDate: event.start.date,
    ...(event.end ? { endDate: event.end.date } : {}),
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    ...(event.location ? { location: { "@type": "Place", name: event.location } } : {}),
    organizer: { "@type": "Organization", name: "V.O.Č. SLOVAKIA s.r.o.", url: SITE_ORIGIN },
  };

  return (
    <main id="obsah" className="px-5 pt-[calc(76px+clamp(32px,4vw,56px))] md:px-8 xl:px-12">
      <article className="mx-auto max-w-[1400px]">
        <Breadcrumbs items={[{ label: "Vzdelávanie", href: ROUTES.education }, { label: article.title }]} />

        <header className="mt-[clamp(32px,4vw,56px)] max-w-[980px]">
          <p className="flex flex-wrap items-center gap-x-2 text-[15px] font-semibold text-[var(--color-blue)]">
            {articleKindLabel[article.kind]}
            <span aria-hidden="true" className="text-[var(--color-line-dark)]">·</span>
            <span className="font-medium text-[var(--color-muted)]">
              Publikované <time dateTime={article.publishedOn}>{formatLongDate(article.publishedOn)}</time>
            </span>
          </p>
          <h1 className="mt-4 text-[clamp(38px,4.8vw,72px)] leading-[1] font-bold tracking-[-.04em] text-balance">{article.title}</h1>
          <p className="mt-6 max-w-[60ch] text-[clamp(18px,1.6vw,22px)] text-[var(--color-copy)] text-pretty">{article.excerpt}</p>
        </header>

        {article.image && (
          <div className="relative mt-[clamp(40px,5vw,64px)] aspect-[16/9] overflow-hidden rounded-[28px] bg-[var(--color-line)] lg:aspect-[21/9]">
            <Image src={article.image.src} alt={article.image.alt} fill preload sizes="(max-width: 1400px) 100vw, 1304px" className="object-cover" />
          </div>
        )}

        <div className="mt-[clamp(40px,5vw,72px)] grid items-start gap-x-[clamp(40px,6vw,96px)] gap-y-10 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="max-w-[70ch]">
            <PortableTextBody blocks={article.body} />
            {article.relatedOffer && (
              <p className="mt-10">
                <Link href={article.relatedOffer.href} className="text-[17px] font-semibold text-[var(--color-blue)]">
                  {article.relatedOffer.label} ↗
                </Link>
              </p>
            )}
          </div>

          {event && (
            <aside aria-labelledby="podujatie-nadpis" className="rounded-[28px] bg-[var(--color-surface)] p-8 lg:sticky lg:top-[108px]">
              <h2 id="podujatie-nadpis" className="text-[15px] font-semibold text-[var(--color-muted)]">
                {isPast ? "Podujatie sa uskutočnilo" : "Podujatie"}
              </h2>
              <dl className="mt-5 grid gap-5">
                <div>
                  <dt className="text-sm text-[var(--color-muted)]">Termín</dt>
                  <dd className="mt-1 text-[19px] leading-snug font-bold">
                    <time dateTime={event.start.date}>{formatEventRange(event)}</time>
                  </dd>
                </div>
                {event.location && (
                  <div>
                    <dt className="text-sm text-[var(--color-muted)]">Miesto</dt>
                    <dd className="mt-1 text-[17px] font-semibold">{event.location}</dd>
                  </div>
                )}
              </dl>
              {!isPast && event.registration && (
                <Link
                  href={event.registration.href}
                  className="mt-7 inline-flex h-[52px] w-full items-center justify-center rounded-full bg-[var(--color-navy)] px-6 text-[15px] font-semibold text-white no-underline transition-colors hover:bg-[var(--color-blue)] hover:text-white"
                >
                  {event.registration.label} ↗
                </Link>
              )}
              <Link href={LINKS.email} className="mt-4 block text-center text-[15px] font-semibold text-[var(--color-blue)]">
                Otázky? Napíšte nám
              </Link>
            </aside>
          )}
        </div>

        {related.length > 0 && (
          <section aria-labelledby="dalsie-nadpis" className="mt-[clamp(88px,10vw,150px)]">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <h2 id="dalsie-nadpis" className="text-[clamp(32px,3.6vw,52px)] leading-none font-bold tracking-[-.035em]">Ďalšie zo vzdelávania</h2>
              <Link href={ROUTES.education} className="text-base font-semibold text-[var(--color-blue)]">Všetky príspevky →</Link>
            </div>
            <ul className="mt-[clamp(32px,4vw,56px)] grid list-none gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((post) => (
                <li key={post.slug}>
                  <ArticleCard article={post} today={today} />
                </li>
              ))}
            </ul>
          </section>
        )}
      </article>
      {eventJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd).replace(/</g, "\\u003c") }} />
      )}
    </main>
  );
}
