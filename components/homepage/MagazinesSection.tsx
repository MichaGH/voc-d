import MagazineCard from "@/components/magazine/MagazineCard";
import SubscribeBand from "@/components/magazine/SubscribeBand";
import { lead } from "@/components/shared/ui";
import { getLatestEditions, getMagazines } from "@/lib/content";

export default async function MagazinesSection() {
  const summaries = await getMagazines();
  const entries = await Promise.all(
    summaries.map(async ({ key }) => ({
      magazine: summaries.find((summary) => summary.key === key)!,
      editions: await getLatestEditions({ magazineKey: key, limit: 3 }),
    })),
  );

  return (
    <section id="casopisy" aria-labelledby="casopisy-nadpis" className="scroll-mt-[76px] px-5 pt-[clamp(96px,11vw,160px)] md:px-8 xl:px-12">
      <div className="mx-auto max-w-[1400px]">
        <div className="mx-auto max-w-[980px] text-center">
          <h2 id="casopisy-nadpis" className="text-[clamp(40px,5.4vw,84px)] leading-[.98] font-bold tracking-[-.04em] text-balance">
            Vždy o krok vpred
          </h2>
          <p className={`mx-auto mt-6 max-w-[48ch] ${lead}`}>
            Dva odborné časopisy — jeden pre správu bytových domov, druhý pre profesie technických zariadení budov.
          </p>
        </div>

        <div className="mt-[clamp(56px,7vw,104px)] grid gap-x-[clamp(32px,5vw,80px)] gap-y-[clamp(72px,8vw,120px)] lg:grid-cols-2">
          {entries.map(({ magazine, editions }) => (
            <MagazineCard key={magazine.key} magazine={magazine} editions={editions} />
          ))}
        </div>

        <div className="mt-[clamp(72px,8vw,120px)]">
          <SubscribeBand magazines={summaries} />
        </div>
      </div>
    </section>
  );
}
