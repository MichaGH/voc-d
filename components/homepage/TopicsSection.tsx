import Image from "next/image";
import Link from "next/link";
import { LINKS } from "@/constants";
import { topics } from "@/data/homepage";

export default function TopicsSection() {
  return (
    <section id="temy" aria-labelledby="temy-nadpis" className="scroll-mt-[76px] px-5 pt-[clamp(96px,11vw,160px)] md:px-8 xl:px-12">
      <div className="mx-auto max-w-[1400px]">
        <div className="flex flex-wrap items-end justify-between gap-x-16 gap-y-5">
          <div>
            <p className="text-[15px] font-semibold text-[var(--color-blue)]">Prečo nás čítať</p>
            <h2 id="temy-nadpis" className="mt-3 max-w-[14ch] text-[clamp(36px,4.4vw,64px)] leading-none font-bold tracking-[-.035em] text-balance">Čo nájdete v časopisoch</h2>
          </div>
          <p className="max-w-[40ch] text-lg text-[var(--color-copy)] text-pretty">Informácie, ktoré šetria čas, peniaze a starosti — v každom čísle.</p>
        </div>

        <div className="mt-[clamp(40px,5vw,64px)] grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {topics.map((topic) => (
            <article key={topic.number} className="relative aspect-[4/5] overflow-hidden rounded-[28px] bg-[var(--color-navy)] text-white">
              <Image src={topic.image} alt={topic.alt} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover" />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,23,58,0)_30%,rgba(4,23,58,.55)_60%,rgba(4,23,58,.95)_100%)]" />
              <div className="absolute inset-x-0 bottom-0 p-[clamp(28px,3vw,40px)]">
                <p className="text-[15px] font-semibold text-[var(--color-blue-pale)]">{topic.number}</p>
                <h3 className="mt-2.5 text-[clamp(26px,2.4vw,36px)] leading-[1.08] font-bold tracking-[-.03em] text-balance">{topic.title}</h3>
                <p className="mt-3 max-w-[34ch] text-base leading-[1.55] text-[var(--color-card-copy)] text-pretty">{topic.description}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-[clamp(56px,6vw,88px)] flex flex-wrap items-center justify-between gap-x-12 gap-y-6 rounded-[28px] bg-[linear-gradient(135deg,var(--color-navy-light)_0%,var(--color-navy)_75%)] px-[clamp(28px,4vw,56px)] py-[clamp(32px,4vw,52px)] text-white">
          <div className="min-w-0 flex-[1_1_420px]">
            <p className="text-sm font-semibold text-[var(--color-blue-pale)]">Predplatné</p>
            <h2 className="mt-2 text-[clamp(26px,2.6vw,38px)] leading-[1.1] font-bold tracking-[-.025em] text-balance">Majte každé nové číslo medzi prvými.</h2>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Link href={LINKS.sbd} className="inline-flex h-[52px] items-center rounded-full bg-white px-[22px] text-[15px] font-semibold whitespace-nowrap text-[var(--color-navy)] no-underline hover:bg-[var(--color-mint)] hover:text-[var(--color-navy)]">Predplatiť SBD</Link>
            <Link href={LINKS.pvk} className="inline-flex h-[52px] items-center rounded-full bg-white px-[22px] text-[15px] font-semibold whitespace-nowrap text-[var(--color-navy)] no-underline hover:bg-[var(--color-cyan)] hover:text-[var(--color-navy)]">Predplatiť PVK</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
