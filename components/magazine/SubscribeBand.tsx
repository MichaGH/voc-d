import Link from "next/link";
import { eyebrowOnDark } from "@/components/shared/ui";
import { subscriptionPath } from "@/constants/routes";
import type { MagazineSummary } from "@/types/content";

const hoverAccent: Record<MagazineSummary["key"], string> = {
  pvk: "hover:bg-[var(--color-cyan)]",
  sbd: "hover:bg-[var(--color-mint)]",
};

/** Subscription call to action (moved from the former topics section). */
export default function SubscribeBand({ magazines }: { magazines: MagazineSummary[] }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-12 gap-y-6 rounded-[28px] bg-[linear-gradient(135deg,var(--color-navy-light)_0%,var(--color-navy)_75%)] px-[clamp(28px,4vw,56px)] py-[clamp(32px,4vw,52px)] text-white">
      <div className="min-w-0 flex-[1_1_420px]">
        <p className={eyebrowOnDark}>Predplatné</p>
        <p className="mt-3 text-[clamp(26px,2.6vw,38px)] leading-[1.1] font-bold tracking-[-.025em] text-balance">
          Majte každé nové číslo medzi prvými.
        </p>
      </div>
      <div className="flex flex-wrap gap-2.5">
        {magazines.map((magazine) => (
          <Link
            key={magazine.key}
            href={subscriptionPath(magazine.key)}
            className={`inline-flex h-[52px] items-center rounded-full bg-white px-[22px] text-[15px] font-semibold whitespace-nowrap text-[var(--color-navy)] no-underline transition-colors hover:text-[var(--color-navy)] ${hoverAccent[magazine.key]}`}
          >
            Predplatiť {magazine.abbreviation}
            <span className="sr-only"> – {magazine.title}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
