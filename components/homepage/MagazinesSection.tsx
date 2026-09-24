import Image from "next/image";
import Link from "next/link";
import { magazines } from "@/data/homepage";

export default function MagazinesSection() {
  return (
    <section id="casopisy" aria-labelledby="casopisy-nadpis" className="scroll-mt-[76px] px-5 pt-[clamp(96px,11vw,160px)] md:px-8 xl:px-12">
      <div className="mx-auto max-w-[1400px]">
        <div className="mx-auto max-w-[980px] text-center">
          <h2 id="casopisy-nadpis" className="mx-auto max-w-[16ch] text-[clamp(40px,5.4vw,84px)] leading-[.98] font-bold tracking-[-.04em] text-balance">
            Vždy o krok vpred v správe a technike budov.
          </h2>
          <p className="mx-auto mt-7 max-w-[60ch] text-[clamp(17px,1.5vw,20px)] text-[var(--color-copy)] text-pretty">
            Či spravujete bytový dom, navrhujete vykurovanie, montujete rozvody vody a plynu, alebo servisujete klimatizáciu — v každom čísle nájdete legislatívu, technológie, produkty a skúsenosti z praxe, ktoré vás posunú ďalej.
          </p>
        </div>

        <div className="mt-[clamp(56px,7vw,104px)] grid gap-x-[clamp(32px,5vw,80px)] gap-y-[clamp(72px,8vw,120px)] lg:grid-cols-2">
          {magazines.map((magazine) => (
            <article key={magazine.id} aria-labelledby={magazine.id} className="flex h-full flex-col items-center text-center">
              <Link href={magazine.href} tabIndex={-1} aria-hidden="true" className="relative block aspect-[1/.82] w-full max-w-[560px] transition-transform duration-200 hover:-translate-y-1.5">
                {magazine.covers.map((cover, index) => {
                  const position = index === 0
                    ? "left-[8%] top-[14%] w-[32%] -rotate-[9deg] shadow-[0_24px_44px_-22px_rgba(4,23,58,.55)]"
                    : index === 1
                      ? "right-[8%] top-[14%] w-[32%] rotate-[9deg] shadow-[0_24px_44px_-22px_rgba(4,23,58,.55)]"
                      : "left-1/2 top-0 w-[42%] -translate-x-1/2 shadow-[0_44px_70px_-30px_rgba(4,23,58,.65)]";
                  return <Image key={cover} src={cover} alt="" width={595} height={842} className={`absolute aspect-[595/842] h-auto rounded-sm ${position}`} />;
                })}
              </Link>
              <p className={`mt-9 text-[15px] font-semibold ${magazine.eyebrowClass}`}>{magazine.eyebrow}</p>
              <h3 id={magazine.id} className="mt-2.5 flex min-h-0 items-center justify-center text-[clamp(28px,2.8vw,42px)] leading-[1.05] font-bold tracking-[-.03em] text-balance lg:min-h-[2.1em]">
                {magazine.title}
              </h3>
              <p className="mt-3.5 min-h-0 max-w-[40ch] text-lg text-[var(--color-copy)] text-pretty lg:min-h-[3.2em]">{magazine.description}</p>
              <div className="mt-auto flex flex-wrap items-center justify-center gap-x-6 gap-y-3 pt-7">
                <Link href={magazine.href} className="inline-flex h-[52px] items-center gap-2.5 rounded-full bg-[var(--color-navy)] px-6 text-[15px] font-semibold whitespace-nowrap text-white no-underline hover:bg-[var(--color-blue)] hover:text-white">
                  Otvoriť časopis →
                </Link>
                <Link href={magazine.sampleHref} className="text-[15px] font-semibold text-[var(--color-blue)]">{magazine.sampleLabel}</Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
