import type { ReactNode } from "react";
import Breadcrumbs, { type Crumb } from "@/components/shared/Breadcrumbs";

interface PageIntroProps {
  breadcrumbs: Crumb[];
  eyebrow?: ReactNode;
  eyebrowClass?: string;
  title: ReactNode;
  lead?: ReactNode;
  children?: ReactNode;
}

/** Light page header used below the solid navigation on subpages. */
export default function PageIntro({ breadcrumbs, eyebrow, eyebrowClass, title, lead, children }: PageIntroProps) {
  return (
    <header className="px-5 pt-[calc(76px+clamp(32px,4vw,56px))] md:px-8 xl:px-12">
      <div className="mx-auto max-w-[1400px]">
        <Breadcrumbs items={breadcrumbs} />
        {eyebrow && (
          <p className={`mt-[clamp(32px,4vw,56px)] text-[15px] font-semibold ${eyebrowClass ?? "text-[var(--color-blue)]"}`}>{eyebrow}</p>
        )}
        <h1
          className={`${eyebrow ? "mt-3" : "mt-[clamp(32px,4vw,56px)]"} max-w-[18ch] text-[clamp(40px,5.2vw,80px)] leading-[.98] font-bold tracking-[-.04em] text-balance`}
        >
          {title}
        </h1>
        {lead && <p className="mt-6 max-w-[58ch] text-[clamp(17px,1.5vw,20px)] text-[var(--color-copy)] text-pretty">{lead}</p>}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </header>
  );
}
