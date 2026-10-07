"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, type ReactNode } from "react";

export interface RailEdition {
  key: string;
  href: string;
  magazineTitle: string;
  label: string;
  cover: { src: string; width: number; height: number };
}

interface EditionRailProps {
  editions: RailEdition[];
  label: string;
  /** Section heading rendered beside the scroll controls. */
  heading: ReactNode;
}

export default function EditionRail({ editions, label, heading }: EditionRailProps) {
  const railRef = useRef<HTMLUListElement>(null);

  const moveRail = (direction: number) => {
    const rail = railRef.current;
    const item = rail?.firstElementChild;
    if (!rail || !item) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    rail.scrollBy({ left: direction * (item.getBoundingClientRect().width + 20) * 2, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-x-12 gap-y-5">
        {heading}
        <div className="flex gap-2">
          <button type="button" onClick={() => moveRail(-1)} aria-label="Posunúť späť" className="size-[52px] cursor-pointer rounded-full border border-[var(--color-line-button)] bg-white text-lg text-[var(--color-navy)] transition-colors hover:bg-[var(--color-navy)] hover:text-white">←</button>
          <button type="button" onClick={() => moveRail(1)} aria-label="Posunúť ďalej" className="size-[52px] cursor-pointer rounded-full border border-[var(--color-line-button)] bg-white text-lg text-[var(--color-navy)] transition-colors hover:bg-[var(--color-navy)] hover:text-white">→</button>
        </div>
      </div>
      <ul ref={railRef} aria-label={label} className="archive-rail mt-10 flex list-none gap-5 overflow-x-auto pb-2 [scroll-snap-type:x_mandatory] [scrollbar-width:none]">
        {editions.map((edition) => (
          <li key={edition.key} className="w-[62%] shrink-0 snap-start sm:w-[30%] lg:w-[calc((100%_-_80px)/5)]">
            <Link href={edition.href} className="group block text-[var(--color-navy)] no-underline hover:text-[var(--color-blue)]">
              <Image
                src={edition.cover.src}
                alt=""
                width={edition.cover.width}
                height={edition.cover.height}
                sizes="(max-width: 640px) 62vw, (max-width: 1024px) 30vw, 260px"
                className="aspect-[595/842] h-auto w-full rounded-md shadow-[0_18px_30px_-20px_rgba(4,23,58,.45)] transition-transform duration-300 group-hover:-translate-y-1.5"
              />
              <span className="mt-3.5 block text-[15px] font-semibold">{edition.magazineTitle}</span>
              <span className="block text-sm text-[var(--color-muted)]">{edition.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
