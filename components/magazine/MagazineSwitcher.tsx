import Image from "next/image";
import Link from "next/link";
import type { MagazineKey } from "@/types/content";

export interface SwitcherItem {
  key: MagazineKey;
  label: string;
  href: string;
  cover?: { src: string; width: number; height: number };
}

/** Segmented control switching the same page (editions, plan) between the two magazines. */
export default function MagazineSwitcher({ items, current, label }: { items: SwitcherItem[]; current: MagazineKey; label: string }) {
  return (
    <nav aria-label={label}>
      <ul className="inline-flex max-w-full list-none flex-wrap gap-1.5 rounded-[28px] bg-[var(--color-surface)] p-1.5">
        {items.map((item) => {
          const selected = item.key === current;
          return (
            <li key={item.key}>
              <Link
                href={item.href}
                aria-current={selected ? "page" : undefined}
                className={`flex h-14 items-center gap-3 rounded-[22px] pr-5 pl-2 text-[15px] font-semibold no-underline transition-colors ${
                  selected
                    ? "bg-[var(--color-navy)] text-white shadow-[0_8px_20px_-12px_rgba(4,23,58,.6)] hover:text-white"
                    : "text-[var(--color-navy)] hover:bg-white hover:text-[var(--color-navy)]"
                }`}
              >
                {item.cover && (
                  <Image
                    src={item.cover.src}
                    alt=""
                    width={item.cover.width}
                    height={item.cover.height}
                    sizes="28px"
                    loading="eager"
                    className="h-10 w-auto rounded-[3px]"
                  />
                )}
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
