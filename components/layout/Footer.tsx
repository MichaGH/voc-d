import Link from "next/link";
import { LINKS } from "@/constants";

const footerLinks = [
  { label: "O nás", href: LINKS.about, muted: false },
  { label: "História", href: LINKS.history, muted: false },
  { label: "Služby", href: LINKS.services, muted: false },
  { label: "TZBportal.sk ↗", href: LINKS.tzbPortal, muted: false },
  { label: "GDPR", href: LINKS.gdpr, muted: true },
] as const;

export default function Footer() {
  return (
    <footer className="mx-auto w-full max-w-[1400px] px-5 pb-9 md:px-8 xl:px-12">
      <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4 border-t border-[var(--color-line-light)] pt-7 text-sm text-[var(--color-muted)]">
        <p>© {new Date().getFullYear()} V.O.Č. SLOVAKIA s.r.o.</p>
        <ul className="flex list-none flex-wrap gap-x-6 gap-y-1">
          {footerLinks.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`${item.muted ? "text-[var(--color-muted)]" : "font-medium text-[var(--color-navy)]"} no-underline hover:text-[var(--color-blue)]`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
