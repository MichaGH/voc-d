import Image from "next/image";
import Link from "next/link";
import { editionPath } from "@/constants/routes";
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
        className="aspect-[595/842] h-auto w-full rounded-[5px] bg-[var(--color-surface)] shadow-[0_22px_36px_-22px_rgba(4,23,58,.5)] transition-transform duration-300 ease-out group-hover:-translate-y-2"
      />
      <Heading className="mt-5 flex items-center justify-between gap-3 text-[17px] leading-snug font-semibold">
        <Link
          href={editionPath(edition.magazineKey, edition.slug)}
          className="text-[var(--color-navy)] no-underline after:absolute after:inset-0 group-hover:text-[var(--color-blue)]"
        >
          <span className="sr-only">{magazineTitle} </span>
          Číslo {edition.label}
        </Link>
        <span aria-hidden="true" className="text-[var(--color-steel)] transition-transform group-hover:translate-x-1 group-hover:text-[var(--color-blue)]">
          →
        </span>
      </Heading>
    </article>
  );
}
