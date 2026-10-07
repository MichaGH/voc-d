import Link from "next/link";
import OfferCard from "@/components/education/OfferCard";
import { articleKindLabel } from "@/components/education/labels";
import { ROUTES, articlePath } from "@/constants/routes";
import { getArticles, getEducationOffers } from "@/lib/content";
import { formatEventRange, formatShortDate } from "@/lib/format/dates";

export default async function EducationSection() {
  const [offers, { items: posts }] = await Promise.all([
    getEducationOffers(),
    getArticles({ section: "education", limit: 3 }),
  ]);

  return (
    <section id="vzdelavanie" aria-labelledby="vzdel-nadpis" className="scroll-mt-[76px] px-5 pt-[clamp(88px,10vw,150px)] md:px-8 xl:px-12">
      <div className="mx-auto max-w-[1400px]">
        <div className="flex flex-wrap items-end justify-between gap-x-12 gap-y-5">
          <div>
            <p className="text-[15px] font-semibold text-[var(--color-blue)]">Vzdelávanie</p>
            <h2 id="vzdel-nadpis" className="mt-3 max-w-[16ch] text-[clamp(36px,4.4vw,64px)] leading-none font-bold tracking-[-.035em]">
              Stretnite sa s odborníkmi naživo.
            </h2>
          </div>
          <Link href={ROUTES.education} className="text-base font-semibold text-[var(--color-blue)]">
            Všetko zo vzdelávania →
          </Link>
        </div>

        <div className="mt-[clamp(40px,5vw,64px)] grid gap-4 lg:grid-cols-2">
          {offers.map((offer) => (
            <OfferCard key={offer.key} offer={offer} />
          ))}
        </div>

        {posts.length > 0 && (
          <div className="mt-[clamp(48px,5vw,72px)]">
            <h3 className="text-[15px] font-semibold text-[var(--color-muted)]">Novinky a pozvánky</h3>
            <ul className="mt-2 list-none border-t border-[var(--color-line)]">
              {posts.map((post) => (
                <li key={post.slug} className="border-b border-[var(--color-line)]">
                  <Link
                    href={articlePath(post.slug)}
                    className="group grid items-center gap-x-8 gap-y-1 py-5 text-[var(--color-navy)] no-underline md:grid-cols-[250px_minmax(0,1fr)_auto]"
                  >
                    <span className="text-sm font-semibold text-[var(--color-blue)]">
                      {articleKindLabel[post.kind]}
                      <span className="font-medium text-[var(--color-muted)]">
                        {" · "}
                        {post.event ? formatEventRange(post.event) : formatShortDate(post.publishedOn)}
                      </span>
                    </span>
                    <span className="text-[clamp(18px,1.5vw,21px)] leading-snug font-semibold tracking-[-.01em] text-balance group-hover:text-[var(--color-blue)]">
                      {post.title}
                    </span>
                    <span aria-hidden="true" className="hidden text-lg transition-transform group-hover:translate-x-1 md:block">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
