import Link from "next/link";
import EditionRail from "@/components/magazine/EditionRail";
import { editionPath, editionsPath } from "@/constants/routes";
import { getLatestEditions, getMagazines } from "@/lib/content";

export default async function ArchiveSection() {
  const [magazines, editions] = await Promise.all([getMagazines(), getLatestEditions({ limit: 10 })]);
  const titles = Object.fromEntries(magazines.map((magazine) => [magazine.key, magazine.shortTitle]));

  return (
    <section id="archiv" aria-labelledby="archiv-nadpis" className="scroll-mt-[76px] px-5 pt-[clamp(88px,10vw,150px)] md:px-8 xl:px-12">
      <div className="mx-auto max-w-[1400px]">
        <EditionRail
          label="Posledné vydania časopisov"
          heading={
            <div>
              <p className="text-[15px] font-semibold text-[var(--color-blue)]">Posledné čísla</p>
              <h2 id="archiv-nadpis" className="mt-3 text-[clamp(36px,4.4vw,64px)] leading-none font-bold tracking-[-.035em]">Pozrite sa, čo vychádza.</h2>
            </div>
          }
          editions={editions.map((edition) => ({
            key: `${edition.magazineKey}-${edition.slug}`,
            href: editionPath(edition.magazineKey, edition.slug),
            magazineTitle: titles[edition.magazineKey] ?? "",
            label: edition.label,
            cover: edition.cover,
          }))}
        />
        <ul className="mt-8 flex list-none flex-wrap gap-x-8 gap-y-2">
          {magazines.map((magazine) => (
            <li key={magazine.key}>
              <Link href={editionsPath(magazine.key)} className="text-base font-semibold text-[var(--color-blue)]">
                Všetky vydania – {magazine.shortTitle} →
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
