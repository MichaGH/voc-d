"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { magazineAccent } from "@/components/magazine/identity";
import { LINKS } from "@/constants";
import { ROUTES, hasOverlayHeader } from "@/constants/routes";
import { navigation } from "@/data/navigation";
import type { MagazineKey } from "@/types/content";

export interface NavMagazine {
  key: MagazineKey;
  title: string;
  audience: string;
  links: { label: string; href: string }[];
}

function isCurrent(pathname: string, href: string) {
  if (href.includes("#") || href.startsWith("http") || href.startsWith("mailto:")) return false;
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export default function Navbar({ magazines }: { magazines: NavMagazine[] }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [magazinesOpen, setMagazinesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [lastPathname, setLastPathname] = useState(pathname);
  const dropdownRef = useRef<HTMLLIElement>(null);
  const panelId = useId();

  // Close menus after client-side navigation.
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setMenuOpen(false);
    setMagazinesOpen(false);
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!magazinesOpen && !menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setMagazinesOpen(false);
      setMenuOpen(false);
    };
    const onPointerDown = (event: PointerEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setMagazinesOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [magazinesOpen, menuOpen]);

  const solid = !hasOverlayHeader(pathname) || scrolled || menuOpen || magazinesOpen;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-60 border-b transition-colors duration-300 ${
        solid ? "border-white/10 bg-[rgba(4,23,58,.94)] backdrop-blur-md" : "border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-[76px] max-w-[1400px] items-center gap-7 px-5 md:px-8 xl:px-12">
        <Link href={ROUTES.home} aria-label="VOC.SK – úvodná stránka" className="flex min-h-11 shrink-0 items-center">
          <Image
            src="/images/voc-logo-white.png"
            alt="V.O.Č. SLOVAKIA"
            width={2188}
            height={351}
            preload
            className="h-[26px] w-auto"
          />
        </Link>

        <nav aria-label="Hlavná navigácia" className="mx-auto hidden lg:block">
          <ul className="flex list-none gap-1">
            {navigation.map((item) =>
              item.kind === "magazines" ? (
                <li key={item.href} ref={dropdownRef} className="relative">
                  <button
                    type="button"
                    aria-expanded={magazinesOpen}
                    aria-controls={panelId}
                    onClick={() => setMagazinesOpen((open) => !open)}
                    className={`flex min-h-11 cursor-pointer items-center gap-1.5 rounded-full border-0 px-3.5 text-[15px] font-medium text-white transition-colors hover:bg-white/12 ${
                      magazinesOpen || isCurrent(pathname, item.href) || magazines.some((m) => m.links.some((l) => isCurrent(pathname, l.href)))
                        ? "bg-white/12"
                        : "bg-transparent"
                    }`}
                  >
                    {item.label}
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 10 10"
                      aria-hidden="true"
                      className={`transition-transform duration-200 ${magazinesOpen ? "rotate-180" : ""}`}
                    >
                      <path d="M2 3.5 5 6.5 8 3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>

                  <div
                    id={panelId}
                    hidden={!magazinesOpen}
                    className="absolute top-[calc(100%+14px)] left-1/2 w-[640px] -translate-x-1/2 rounded-3xl bg-white p-3 text-[var(--color-navy)] shadow-[0_30px_60px_-24px_rgba(4,23,58,.45)]"
                  >
                    <div className="grid grid-cols-2 gap-1">
                      {magazines.map((magazine) => (
                        <div key={magazine.key} className="rounded-2xl p-5 hover:bg-[var(--color-surface)]">
                          <p className={`text-sm font-semibold ${magazineAccent[magazine.key].text}`}>{magazine.audience}</p>
                          <p className="mt-1 text-[17px] leading-snug font-bold tracking-[-.01em] text-balance">{magazine.title}</p>
                          <ul className="mt-3 grid list-none gap-0.5">
                            {magazine.links.map((link) => (
                              <li key={link.href}>
                                <Link
                                  href={link.href}
                                  aria-current={pathname === link.href ? "page" : undefined}
                                  className="flex min-h-9 items-center justify-between text-[15px] font-medium text-[var(--color-copy)] no-underline hover:text-[var(--color-blue)] aria-[current=page]:text-[var(--color-blue)]"
                                >
                                  {link.label}
                                  <span aria-hidden="true">→</span>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                    <Link
                      href={item.href}
                      className="mt-1 flex min-h-12 items-center justify-between rounded-2xl bg-[var(--color-surface)] px-5 text-[15px] font-semibold text-[var(--color-navy)] no-underline hover:bg-[var(--color-surface-hover)]"
                    >
                      Porovnať oba časopisy
                      <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                </li>
              ) : (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isCurrent(pathname, item.href) ? "page" : undefined}
                    className="flex min-h-11 items-center rounded-full px-3.5 text-[15px] font-medium text-white no-underline transition-colors hover:bg-white/12 hover:text-white aria-[current=page]:bg-white/12"
                  >
                    {item.label}
                    {item.kind === "external" && <span aria-hidden="true" className="ml-1 text-white/60">↗</span>}
                  </Link>
                </li>
              ),
            )}
          </ul>
        </nav>

        <Link
          href={LINKS.advertise}
          className="hidden h-[46px] shrink-0 items-center gap-2 rounded-full bg-white px-5 text-[15px] font-semibold whitespace-nowrap text-[var(--color-navy)] no-underline transition-colors hover:bg-[var(--color-cyan)] hover:text-[var(--color-navy)] lg:inline-flex"
        >
          Inzerovať u nás ↗
        </Link>

        <button
          type="button"
          aria-expanded={menuOpen}
          aria-controls="mobilne-menu"
          onClick={() => setMenuOpen((open) => !open)}
          className="ml-auto inline-flex h-[46px] cursor-pointer items-center gap-2.5 rounded-full border-0 bg-white/14 px-[18px] text-[15px] font-semibold text-white lg:hidden"
        >
          <span aria-hidden="true" className="grid w-4 gap-1">
            <span className="h-0.5 bg-white" />
            <span className="h-0.5 bg-white" />
          </span>
          {menuOpen ? "Zavrieť" : "Menu"}
        </button>
      </div>

      {menuOpen && (
        <nav
          id="mobilne-menu"
          aria-label="Hlavná navigácia"
          className="max-h-[calc(100svh-76px)] overflow-y-auto border-t border-white/12 bg-[var(--color-navy)] lg:hidden"
        >
          <ul className="grid list-none px-5 pt-2 pb-6 md:px-8">
            {navigation.map((item) => (
              <li key={item.href} className="border-b border-white/12">
                <Link
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex min-h-14 items-center text-xl font-semibold text-white no-underline"
                >
                  {item.label}
                  {item.kind === "external" && <span aria-hidden="true" className="ml-2 text-white/50">↗</span>}
                </Link>
                {item.kind === "magazines" && (
                  <div className="grid gap-5 pb-5 sm:grid-cols-2">
                    {magazines.map((magazine) => (
                      <div key={magazine.key}>
                        <p className={`text-sm font-semibold ${magazineAccent[magazine.key].textOnDark}`}>{magazine.title}</p>
                        <ul className="mt-1 grid list-none">
                          {magazine.links.map((link) => (
                            <li key={link.href}>
                              <Link
                                href={link.href}
                                onClick={() => setMenuOpen(false)}
                                className="flex min-h-11 items-center text-base text-[var(--color-hero-copy)] no-underline"
                              >
                                {link.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </li>
            ))}
            <li className="pt-[18px]">
              <Link
                href={LINKS.advertise}
                className="flex min-h-[54px] items-center justify-center rounded-full bg-white text-[17px] font-semibold text-[var(--color-navy)] no-underline"
              >
                Inzerovať u nás
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
