import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ArticleCard from "@/components/education/ArticleCard";
import PortableTextBody from "@/components/education/PortableTextBody";
import { articleKindLabel } from "@/components/education/labels";
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import { buttonPrimary, display, eyebrow, h2, headerGap, inner, lead, meta, pageTop, sectionTop, sectionX, textLink } from "@/components/shared/ui";
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
    <main id="obsah" className={`${sectionX} ${pageTop}`}>
      <article className={inner}>
        <Breadcrumbs items={[{ label: "Vzdelávanie", href: ROUTES.education }, { label: article.title }]} />

        <header className="mt-[clamp(40px,5vw,72px)] max-w-[980px]">
          <p className={`flex flex-wrap items-center gap-x-2 ${eyebrow}`}>
            {articleKindLabel[article.kind]}
            <span aria-hidden="true" className="text-[var(--color-line-dark)]">·</span>
            <time dateTime={article.publishedOn} className="text-[var(--color-muted)]">{formatLongDate(article.publishedOn)}</time>
          </p>
          <h1 className={`mt-4 max-w-[20ch] ${display}`}>{article.title}</h1>
          <p className={`mt-6 max-w-[56ch] ${lead}`}>{article.excerpt}</p>
        </header>

        {article.image && (
          <div className="relative mt-[clamp(40px,5vw,64px)] aspect-[16/9] overflow-hidden rounded-[28px] bg-[var(--color-line)] lg:aspect-[21/9]">
            <Image src={article.image.src} alt={article.image.alt} fill preload sizes="(max-width: 1400px) 100vw, 1304px" className="object-cover" />
          </div>
        )}

        <div className="mt-[clamp(40px,5vw,72px)] grid items-start gap-x-[clamp(40px,6vw,96px)] gap-y-10 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="max-w-[70ch]">
            <PortableTextBody blocks={article.body} />
          </div>

          {event && (
            <aside aria-labelledby="podujatie-nadpis" className="rounded-[28px] bg-[var(--color-surface)] p-8 lg:sticky lg:top-[108px]">
              <h2 id="podujatie-nadpis" className={eyebrow}>
                {isPast ? "Podujatie sa uskutočnilo" : "Podujatie"}
              </h2>
              <dl className="mt-5 grid gap-5">
                <div>
                  <dt className={meta}>Termín</dt>
                  <dd className="mt-1 text-[19px] leading-snug font-bold">
                    <time dateTime={event.start.date}>{formatEventRange(event)}</time>
                  </dd>
                </div>
                {event.location && (
                  <div>
                    <dt className={meta}>Miesto</dt>
                    <dd className="mt-1 text-[17px] font-semibold">{event.location}</dd>
                  </div>
                )}
              </dl>
              {!isPast && event.registration && (
                <Link
                  href={event.registration.href}
                  className={`mt-8 w-full ${buttonPrimary}`}
                >
                  {event.registration.label} ↗
                </Link>
              )}
              <p className="mt-5 text-center">
                <Link href={LINKS.email} className={textLink}>
                  Otázky? Napíšte nám
                </Link>
              </p>
            </aside>
          )}
        </div>

        {related.length > 0 && (
          <section aria-labelledby="dalsie-nadpis" className={sectionTop}>
            <div className="flex flex-wrap items-end justify-between gap-x-12 gap-y-6">
              <h2 id="dalsie-nadpis" className={h2}>Ďalšie zo vzdelávania</h2>
              <Link href={ROUTES.education} className={textLink}>Všetky príspevky →</Link>
            </div>
            <ul className={`${headerGap} grid list-none gap-x-6 gap-y-16 sm:grid-cols-2 lg:grid-cols-3`}>
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
