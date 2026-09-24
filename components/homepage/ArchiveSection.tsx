"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { issues } from "@/data/homepage";

export default function ArchiveSection() {
  const railRef = useRef<HTMLUListElement>(null);

  const moveRail = (direction: number) => {
    const rail = railRef.current;
    const item = rail?.firstElementChild;
    if (!rail || !item) return;
    rail.scrollBy({ left: direction * (item.getBoundingClientRect().width + 20) * 2, behavior: "smooth" });
  };

  return (
    <section id="archiv" aria-labelledby="archiv-nadpis" className="scroll-mt-[76px] px-5 pt-[clamp(88px,10vw,150px)] md:px-8 xl:px-12">
      <div className="mx-auto max-w-[1400px]">
        <div className="flex flex-wrap items-end justify-between gap-x-12 gap-y-5">
          <div>
            <p className="text-[15px] font-semibold text-[var(--color-blue)]">Posledné čísla</p>
            <h2 id="archiv-nadpis" className="mt-3 text-[clamp(36px,4.4vw,64px)] leading-none font-bold tracking-[-.035em]">Pozrite sa, čo vychádza.</h2>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => moveRail(-1)} aria-label="Posunúť späť" className="size-[52px] cursor-pointer rounded-full border border-[var(--color-line-button)] bg-white text-lg text-[var(--color-navy)] hover:bg-[var(--color-navy)] hover:text-white">←</button>
            <button type="button" onClick={() => moveRail(1)} aria-label="Posunúť ďalej" className="size-[52px] cursor-pointer rounded-full border border-[var(--color-line-button)] bg-white text-lg text-[var(--color-navy)] hover:bg-[var(--color-navy)] hover:text-white">→</button>
          </div>
        </div>
        <ul ref={railRef} className="archive-rail mt-10 flex list-none gap-5 overflow-x-auto pb-2 [scroll-snap-type:x_mandatory] [scrollbar-width:none]">
          {issues.map((issue) => (
            <li key={`${issue.title}-${issue.issue}`} className="w-[62%] shrink-0 snap-start sm:w-[30%] lg:w-[calc((100%_-_80px)/5)]">
              <Link href={issue.href} className="block text-[var(--color-navy)] no-underline hover:text-[var(--color-blue)]">
                <Image src={issue.image} alt="" width={595} height={842} className="aspect-[595/842] h-auto w-full rounded-md shadow-[0_18px_30px_-20px_rgba(4,23,58,.45)]" />
                <span className="mt-3.5 block text-[15px] font-semibold">{issue.title}</span>
                <span className="block text-sm text-[var(--color-muted)]">{issue.issue}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
