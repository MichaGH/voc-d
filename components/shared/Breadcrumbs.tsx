import Link from "next/link";
import { ROUTES, SITE_ORIGIN } from "@/constants/routes";

export interface Crumb {
  label: string;
  href?: string;
}

/** Breadcrumb trail; the last item is the current page. Includes BreadcrumbList structured data. */
export default function Breadcrumbs({ items, tone = "light" }: { items: Crumb[]; tone?: "light" | "dark" }) {
  const trail: Crumb[] = [{ label: "Úvod", href: ROUTES.home }, ...items];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.label,
      ...(crumb.href ? { item: `${SITE_ORIGIN}${crumb.href}` } : {}),
    })),
  };
  const linkClass =
    tone === "dark"
      ? "text-white/70 no-underline hover:text-white"
      : "text-[var(--color-muted)] no-underline hover:text-[var(--color-blue)]";

  return (
    <nav aria-label="Omrvinková navigácia">
      <ol className={`flex list-none flex-wrap items-center gap-x-2 gap-y-1 text-sm font-medium ${tone === "dark" ? "text-white" : "text-[var(--color-navy)]"}`}>
        {trail.map((crumb, index) => {
          const last = index === trail.length - 1;
          return (
            <li key={`${crumb.label}-${index}`} className="flex items-center gap-2">
              {index > 0 && <span aria-hidden="true" className={tone === "dark" ? "text-white/40" : "text-[var(--color-line-dark)]"}>/</span>}
              {last || !crumb.href ? (
                <span aria-current={last ? "page" : undefined}>{crumb.label}</span>
              ) : (
                <Link href={crumb.href} className={linkClass}>
                  {crumb.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    </nav>
  );
}
