import Image from "next/image";
import Link from "next/link";
import { articleKindLabel } from "@/components/education/labels";
import { eyebrow, eyebrowOnDark, meta } from "@/components/shared/ui";
import { articlePath } from "@/constants/routes";
import { formatEventRange, formatLongDate } from "@/lib/format/dates";
import type { ArticleSummary } from "@/types/content";

interface ArticleCardProps {
  article: ArticleSummary;
  /** YYYY-MM-DD in the site time zone, used to mark past events. */
  today: string;
  headingLevel?: "h2" | "h3";
}

export default function ArticleCard({ article, today, headingLevel = "h3" }: ArticleCardProps) {
  const Heading = headingLevel;
  const eventEnd = article.event ? (article.event.end ?? article.event.start).date : null;
  const isPast = eventEnd !== null && eventEnd < today;

  return (
    <article className="group relative flex h-full flex-col">
      <div className="relative aspect-[3/2] overflow-hidden rounded-3xl bg-[var(--color-navy)]">
        {article.image ? (
          <Image
            src={article.image.src}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <span aria-hidden="true" className="absolute inset-0 flex flex-col justify-end bg-[linear-gradient(135deg,var(--color-navy-light)_0%,var(--color-navy)_75%)] p-[clamp(24px,2.4vw,32px)] text-white">
            <span className={eyebrowOnDark}>{articleKindLabel[article.kind]}</span>
            <span className="mt-1.5 text-[clamp(24px,2.2vw,32px)] leading-[1.05] font-bold tracking-[-.025em] text-balance">
              {article.event ? formatEventRange(article.event) : article.title}
            </span>
            {article.event?.location && <span className="mt-2 text-[15px] text-[var(--color-card-copy)]">{article.event.location}</span>}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col pt-6">
        <p className={`flex flex-wrap items-center gap-x-2 ${eyebrow}`}>
          {articleKindLabel[article.kind]}
          <span aria-hidden="true" className="text-[var(--color-line-dark)]">·</span>
          <time dateTime={article.publishedOn} className="text-[var(--color-muted)]">
            {formatLongDate(article.publishedOn)}
          </time>
        </p>
        <Heading className="mt-3 text-[clamp(20px,1.6vw,24px)] leading-[1.2] font-bold tracking-[-.015em] text-balance">
          <Link href={articlePath(article.slug)} className="text-[var(--color-navy)] no-underline after:absolute after:inset-0 after:rounded-3xl group-hover:text-[var(--color-blue)]">
            {article.title}
          </Link>
        </Heading>
        <p className="mt-3 text-[15px] leading-[1.6] text-[var(--color-copy)] text-pretty">{article.excerpt}</p>
        {article.event && (
          <div className="mt-auto pt-5">
            <p className={`flex flex-wrap gap-x-2 border-t border-[var(--color-line)] pt-4 ${meta}`}>
              <span>Termín:</span>
              <span className="font-medium text-[var(--color-navy)]">{formatEventRange(article.event)}</span>
              {isPast && <span>· uskutočnilo sa</span>}
            </p>
          </div>
        )}
      </div>
    </article>
  );
}
