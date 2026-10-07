import Link from "next/link";
import type { NavMagazine } from "@/components/layout/Navbar";
import { CONTACT, LINKS } from "@/constants";
import { ROUTES } from "@/constants/routes";

const publisherLinks = [
  { label: "Vzdelávanie", href: ROUTES.education },
  { label: "Inzercia", href: ROUTES.advertising },
  { label: "O nás ↗", href: LINKS.about },
  { label: "História ↗", href: LINKS.history },
  { label: "Služby ↗", href: LINKS.services },
  { label: "TZBportal.sk ↗", href: LINKS.tzbPortal },
];

const linkClass =
  "inline-flex min-h-8 items-center text-[15px] text-[var(--color-copy)] no-underline hover:text-[var(--color-blue)]";

export default function Footer({ magazines }: { magazines: NavMagazine[] }) {
  return (
    <footer className="mx-auto w-full max-w-[1400px] px-5 pt-[clamp(64px,7vw,104px)] pb-9 md:px-8 xl:px-12">
      <div className="grid gap-x-10 gap-y-10 border-t border-[var(--color-line-light)] pt-12 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.3fr)_repeat(3,minmax(0,1fr))]">
        <div>
          <p className="text-lg font-bold tracking-[-.01em] text-[var(--color-navy)]">{CONTACT.company}</p>
          <p className="mt-2 max-w-[34ch] text-[15px] text-[var(--color-copy)] text-pretty">
            Vydavateľstvo odborných časopisov a vzdelávania pre správu a techniku budov.
          </p>
          <address className="mt-5 text-[15px] leading-[1.7] not-italic text-[var(--color-copy)]">
            {CONTACT.street}, {CONTACT.city}
            <br />
            <Link href={LINKS.email} className="font-semibold text-[var(--color-navy)] no-underline hover:text-[var(--color-blue)]">
              {CONTACT.email}
            </Link>
            <span aria-hidden="true" className="px-2 text-[var(--color-line-dark)]">·</span>
            <Link href={CONTACT.phoneHref} className="font-semibold whitespace-nowrap text-[var(--color-navy)] no-underline hover:text-[var(--color-blue)]">
              {CONTACT.phoneDisplay}
            </Link>
          </address>
        </div>

        {magazines.map((magazine) => (
          <nav key={magazine.key} aria-label={magazine.title}>
            <p className="text-[15px] font-semibold text-[var(--color-navy)] text-balance">{magazine.title}</p>
            <ul className="mt-3 grid list-none">
              {magazine.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={linkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        <nav aria-label="Vydavateľstvo">
          <p className="text-[15px] font-semibold text-[var(--color-navy)]">Vydavateľstvo</p>
          <ul className="mt-3 grid list-none">
            {publisherLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={linkClass}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="mt-12 flex flex-wrap items-center justify-between gap-x-8 gap-y-2 border-t border-[var(--color-line-light)] pt-6 text-sm text-[var(--color-muted)]">
        <p>© {new Date().getFullYear()} {CONTACT.company}</p>
        <Link href={LINKS.gdpr} className="text-[var(--color-muted)] no-underline hover:text-[var(--color-blue)]">
          Ochrana osobných údajov (GDPR)
        </Link>
      </div>
    </footer>
  );
}
