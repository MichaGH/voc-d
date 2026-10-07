import EditionRail from "@/components/magazine/EditionRail";
import { eyebrow, h2 } from "@/components/shared/ui";
import { editionPath } from "@/constants/routes";
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
              <p className={eyebrow}>Posledné čísla</p>
              <h2 id="archiv-nadpis" className={`mt-4 ${h2}`}>Pozrite sa, čo vychádza.</h2>
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
      </div>
    </section>
  );
}
