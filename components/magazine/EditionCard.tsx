import Image from "next/image";
import Link from "next/link";
import EditionActions from "@/components/magazine/EditionActions";
import { editionPath } from "@/constants/routes";
import type { EditionSummary } from "@/types/content";

interface EditionCardProps {
  edition: EditionSummary;
  magazineTitle: string;
  headingLevel?: "h2" | "h3";
  sizes?: string;
}

/** Cover, issue label and the two direct actions. The cover opens the issue. */
export default function EditionCard({ edition, magazineTitle, headingLevel = "h3", sizes }: EditionCardProps) {
  const Heading = headingLevel;
  return (
    <article className="group">
      <Link href={editionPath(edition.magazineKey, edition.slug)} prefetch={false} tabIndex={-1} aria-hidden="true" className="block">
        <Image
          src={edition.cover.src}
          alt=""
          width={edition.cover.width}
          height={edition.cover.height}
          sizes={sizes ?? "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 260px"}
          className="aspect-[595/842] h-auto w-full rounded-[5px] bg-[var(--color-surface)] shadow-[0_22px_36px_-22px_rgba(4,23,58,.5)] transition-transform duration-300 ease-out group-hover:-translate-y-1.5"
        />
      </Link>
      <Heading className="mt-4 text-[17px] leading-snug font-semibold">
        <span className="sr-only">{magazineTitle} </span>
        Číslo {edition.label}
      </Heading>
      <div className="mt-3">
        <EditionActions
          magazineKey={edition.magazineKey}
          slug={edition.slug}
          label={edition.label}
          magazineTitle={magazineTitle}
          hasDigitalVersion={edition.hasDigitalVersion}
        />
      </div>
    </article>
  );
}
