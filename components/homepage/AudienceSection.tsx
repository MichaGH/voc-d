"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { audienceGroups } from "@/data/homepage";

export default function AudienceSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeGroup = audienceGroups[activeIndex];

  return (
    <section id="pre-koho" aria-labelledby="role-nadpis" className="scroll-mt-[76px] px-5 pt-[clamp(88px,10vw,150px)] md:px-8 xl:px-12">
      <div className="mx-auto max-w-[1400px]">
        <div className="flex flex-col items-center text-center">
          <p className="text-[15px] font-semibold text-[var(--color-blue)]">Pre koho</p>
          <h2 id="role-nadpis" className="mt-3 text-[clamp(36px,4.4vw,64px)] leading-none font-bold tracking-[-.035em]">Čo hľadáte vy?</h2>
          <div role="tablist" aria-label="Vyberte, kto ste" className="mt-8 flex max-w-full flex-wrap justify-center gap-1.5 rounded-[28px] bg-[var(--color-surface)] p-1.5 sm:rounded-full">
            {audienceGroups.map((group, index) => {
              const active = activeIndex === index;
              return (
                <button
                  key={group.tab}
                  id={`audience-tab-${index}`}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  aria-controls={`audience-panel-${index}`}
                  onClick={() => setActiveIndex(index)}
                  className={`h-12 cursor-pointer rounded-full border-0 px-[22px] text-[15px] font-semibold whitespace-nowrap transition-colors ${active ? "bg-[var(--color-navy)] text-white shadow-[0_6px_16px_-8px_rgba(4,23,58,.5)]" : "bg-transparent text-[var(--color-navy)] hover:bg-white"}`}
                >
                  {group.tab}
                </button>
              );
            })}
          </div>
        </div>

        <div id={`audience-panel-${activeIndex}`} role="tabpanel" aria-labelledby={`audience-tab-${activeIndex}`} className="mt-[clamp(48px,6vw,72px)] grid items-center gap-[clamp(32px,5vw,80px)] lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[28px] bg-[var(--color-line)]">
            <Image key={activeGroup.image} src={activeGroup.image} alt={activeGroup.alt} fill sizes="(max-width: 1024px) 100vw, 52vw" className="object-cover" />
          </div>
          <div>
            <h3 className="text-[clamp(28px,3vw,44px)] leading-[1.05] font-bold tracking-[-.03em] text-balance">{activeGroup.title}</h3>
            <p className="mt-4 max-w-[44ch] text-lg text-[var(--color-copy)] text-pretty">{activeGroup.description}</p>
            <ul className="mt-7 list-none border-t border-[var(--color-line)]">
              {activeGroup.links.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="flex min-h-[60px] items-center justify-between gap-4 border-b border-[var(--color-line)] text-[17px] font-semibold text-[var(--color-navy)] no-underline hover:text-[var(--color-blue)]">
                    {item.label}<span aria-hidden="true">{item.arrow}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <Link href={activeGroup.ctaHref} className="mt-7 inline-flex min-h-[54px] items-center rounded-full bg-[var(--color-blue)] px-[26px] py-3 text-base font-semibold text-white no-underline hover:bg-[var(--color-navy)] hover:text-white">
              {activeGroup.cta}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
