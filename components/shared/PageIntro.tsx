import type { ReactNode } from "react";
import Breadcrumbs, { type Crumb } from "@/components/shared/Breadcrumbs";
import { display, eyebrow as eyebrowClass, inner, lead as leadClass, pageTop, sectionX } from "@/components/shared/ui";

interface PageIntroProps {
  breadcrumbs: Crumb[];
  eyebrow?: ReactNode;
  title: ReactNode;
  lead?: ReactNode;
  children?: ReactNode;
}

/** Light page header used below the solid navigation on subpages. */
export default function PageIntro({ breadcrumbs, eyebrow, title, lead, children }: PageIntroProps) {
  return (
    <header className={`${sectionX} ${pageTop}`}>
      <div className={inner}>
        <Breadcrumbs items={breadcrumbs} />
        <div className="mt-[clamp(40px,5vw,72px)]">
          {eyebrow && <p className={`mb-4 ${eyebrowClass}`}>{eyebrow}</p>}
          <h1 className={`max-w-[18ch] ${display}`}>{title}</h1>
          {lead && <p className={`mt-6 max-w-[52ch] ${leadClass}`}>{lead}</p>}
          {children && <div className="mt-10">{children}</div>}
        </div>
      </div>
    </header>
  );
}
