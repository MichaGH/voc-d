import Link from "next/link";
import CoverStack from "@/components/magazine/CoverStack";
import { magazineAccent } from "@/components/magazine/identity";
import { editionsPath, editorialPlanPath, magazinePath } from "@/constants/routes";
import { bindDashes } from "@/lib/format/text";
import type { EditionSummary, Magazine } from "@/types/content";

interface MagazineCardProps {
  magazine: Magazine;
  editions: EditionSummary[];
  headingLevel?: "h2" | "h3";
}

export default function MagazineCard({ magazine, editions, headingLevel = "h3" }: MagazineCardProps) {
  const Heading = headingLevel;
  const headingId = `casopis-${magazine.key}`;
  const benefits = magazine.topics.slice(0, 3);

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
      <p className={`mt-9 text-[15px] font-semibold ${magazineAccent[magazine.key].text}`}>{magazine.audience}</p>
      <Heading
        id={headingId}
        className="mt-2.5 flex items-center justify-center text-[clamp(28px,2.8vw,42px)] leading-[1.05] font-bold tracking-[-.03em] text-balance lg:min-h-[2.1em]"
      >
        {bindDashes(magazine.title)}
      </Heading>
      <p className="mt-3.5 max-w-[40ch] text-lg text-[var(--color-copy)] text-pretty lg:min-h-[3.2em]">{magazine.description}</p>
      {benefits.length > 0 && (
        <ul aria-label="Hlavné témy" className="mt-5 flex max-w-[46ch] list-none flex-wrap justify-center gap-x-2 gap-y-1 text-[15px] text-[var(--color-muted)]">
          {benefits.map((topic, index) => (
            <li key={topic.key} className="flex items-center gap-2">
              {index > 0 && <span aria-hidden="true" className="text-[var(--color-line-dark)]">·</span>}
              {topic.title}
            </li>
          ))}
        </ul>
      )}
      <div className="mt-auto flex flex-wrap items-center justify-center gap-x-6 gap-y-3 pt-8">
        <Link
          href={magazinePath(magazine.key)}
          className="inline-flex h-[52px] items-center gap-2.5 rounded-full bg-[var(--color-navy)] px-6 text-[15px] font-semibold whitespace-nowrap text-white no-underline transition-colors hover:bg-[var(--color-blue)] hover:text-white"
        >
          Otvoriť časopis<span className="sr-only"> {magazine.title}</span> →
        </Link>
        <Link href={editionsPath(magazine.key)} className="text-[15px] font-semibold text-[var(--color-blue)]">
          Všetky vydania<span className="sr-only"> časopisu {magazine.title}</span>
        </Link>
        <Link href={editorialPlanPath(magazine.key)} className="text-[15px] font-semibold text-[var(--color-blue)]">
          Edičný plán<span className="sr-only"> časopisu {magazine.title}</span>
        </Link>
      </div>
    </article>
  );
}
