import Link from "next/link";
import { mailto } from "@/constants";
import { editionPath, subscriptionPath } from "@/constants/routes";
import type { MagazineKey } from "@/types/content";

interface EditionActionsProps {
  magazineKey: MagazineKey;
  slug: string;
  label: string;
  magazineTitle: string;
  hasDigitalVersion: boolean;
  /** "dark" for use on navy/blue backgrounds. */
  tone?: "light" | "dark";
}

const base =
  "inline-flex h-11 min-w-0 flex-1 items-center justify-center rounded-[10px] px-2 text-[14px] font-semibold whitespace-nowrap no-underline transition-colors sm:text-[15px]";

/**
 * The two actions under every cover: read the issue straight away (or order
 * the print copy when no PDF exists) and subscribe. Sized to the cover width.
 */
export default function EditionActions({ magazineKey, slug, label, magazineTitle, hasDigitalVersion, tone = "light" }: EditionActionsProps) {
  const primary =
    tone === "dark"
      ? `${base} bg-white text-[var(--color-primary)] hover:bg-[var(--color-cyan)] hover:text-[var(--color-navy)]`
      : `${base} bg-[var(--color-primary)] text-white hover:bg-[var(--color-navy)] hover:text-white`;
  const secondary =
    tone === "dark"
      ? `${base} border border-white/45 text-white hover:bg-white/12 hover:text-white`
      : `${base} border border-[var(--color-line-button)] bg-white text-[var(--color-navy)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]`;
  const issue = `${magazineTitle} ${label}`;

  return (
    <div className="flex gap-2">
      {hasDigitalVersion ? (
        <Link href={editionPath(magazineKey, slug)} prefetch={false} className={primary}>
          Čítať<span className="sr-only"> {issue}</span>
        </Link>
      ) : (
        <a href={mailto(`Objednávka výtlačku – ${issue}`)} className={primary}>
          Objednať<span className="sr-only"> výtlačok {issue}</span>
        </a>
      )}
      <Link href={subscriptionPath(magazineKey)} className={secondary}>
        Predplatiť<span className="sr-only"> {magazineTitle}</span>
      </Link>
    </div>
  );
}
