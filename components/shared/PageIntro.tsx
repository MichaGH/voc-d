import type { ReactNode } from "react";
import Breadcrumbs, { type Crumb } from "@/components/shared/Breadcrumbs";
import { display, inner, lead as leadClass, pageTop, sectionX } from "@/components/shared/ui";

interface PageIntroProps {
  breadcrumbs: Crumb[];
  title: ReactNode;
  lead?: ReactNode;
  children?: ReactNode;
}

/** Light page header used below the solid navigation on subpages. */
export default function PageIntro({ breadcrumbs, title, lead, children }: PageIntroProps) {
  return (
    <header className={`${sectionX} ${pageTop}`}>
      <div className={inner}>
        <Breadcrumbs items={breadcrumbs} />
        <h1 className={`mt-[clamp(32px,4vw,56px)] max-w-[18ch] ${display}`}>{title}</h1>
        {lead && <p className={`mt-6 max-w-[52ch] ${leadClass}`}>{lead}</p>}
        {children && <div className="mt-10">{children}</div>}
      </div>
    </header>
  );
}
