import Image from "next/image";
import Link from "next/link";
import { editionPath } from "@/constants/routes";
import { INSERT_FORMS, plural } from "@/lib/format/plural";
import type { EditionSummary } from "@/types/content";

interface EditionCardProps {
  edition: EditionSummary;
  magazineTitle: string;
  headingLevel?: "h2" | "h3";
  sizes?: string;
}

export default function EditionCard({ edition, magazineTitle, headingLevel = "h3", sizes }: EditionCardProps) {
  const Heading = headingLevel;
  return (
    <article className="group relative">
      <Image
        src={edition.cover.src}
        alt=""
        width={edition.cover.width}
        height={edition.cover.height}
        sizes={sizes ?? "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 260px"}
        className="aspect-[595/842] h-auto w-full rounded-md bg-[var(--color-surface)] shadow-[0_18px_30px_-20px_rgba(4,23,58,.45)] transition-transform duration-300 group-hover:-translate-y-1.5"
      />
      <Heading className="mt-4 text-base leading-snug font-semibold">
        <Link
          href={editionPath(edition.magazineKey, edition.slug)}
          className="text-[var(--color-navy)] no-underline after:absolute after:inset-0 group-hover:text-[var(--color-blue)]"
        >
          <span className="sr-only">{magazineTitle} </span>
          Číslo {edition.label}
        </Link>
      </Heading>
      {edition.insertCount > 0 && (
        <p className="mt-0.5 text-sm text-[var(--color-muted)]">
          + {edition.insertCount} {plural(edition.insertCount, INSERT_FORMS)}
        </p>
      )}
    </article>
  );
}
