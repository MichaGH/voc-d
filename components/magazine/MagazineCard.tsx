import Link from "next/link";
import CoverStack from "@/components/magazine/CoverStack";
import { body, buttonPrimary, eyebrow, textLink } from "@/components/shared/ui";
import { editionsPath, magazinePath } from "@/constants/routes";
import { bindDashes } from "@/lib/format/text";
import type { EditionSummary, MagazineSummary } from "@/types/content";

interface MagazineCardProps {
  magazine: MagazineSummary;
  editions: EditionSummary[];
  headingLevel?: "h2" | "h3";
}

export default function MagazineCard({ magazine, editions, headingLevel = "h3" }: MagazineCardProps) {
  const Heading = headingLevel;
  const headingId = `casopis-${magazine.key}`;

  return (
    <article aria-labelledby={headingId} className="flex h-full flex-col items-center text-center">
      <Link
        href={magazinePath(magazine.key)}
        tabIndex={-1}
        aria-hidden="true"
        className="block w-full max-w-[560px] transition-transform duration-300 hover:-translate-y-1.5"
      >
        <CoverStack editions={editions} />
      </Link>
      <p className={`mt-10 ${eyebrow}`}>{magazine.audience}</p>
      <Heading
        id={headingId}
        className="mt-3 max-w-[16ch] text-[clamp(28px,2.6vw,38px)] leading-[1.08] font-bold tracking-[-.03em] text-balance"
      >
        {bindDashes(magazine.title)}
      </Heading>
      <p className={`mt-4 max-w-[40ch] ${body} sm:text-[17px]`}>{magazine.description}</p>
      <div className="mt-auto flex flex-wrap items-center justify-center gap-x-7 gap-y-4 pt-8">
        <Link href={magazinePath(magazine.key)} className={buttonPrimary}>
          Otvoriť časopis<span className="sr-only"> {magazine.title}</span> →
        </Link>
        <Link href={editionsPath(magazine.key)} className={textLink}>
          Všetky vydania<span className="sr-only"> časopisu {magazine.title}</span>
        </Link>
      </div>
    </article>
  );
}
