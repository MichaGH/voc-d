"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { ROUTES, hasOverlayHeader } from "@/constants/routes";
import { navigation } from "@/data/navigation";
import type { MagazineKey } from "@/types/content";

export interface NavMagazine {
  key: MagazineKey;
  title: string;
  audience: string;
  href: string;
  cover?: { src: string; width: number; height: number };
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
  const closeTimer = useRef<number | undefined>(undefined);
  const panelId = useId();

  // Mouse users get hover-to-open with a short grace period; click/keyboard toggle as usual.
  const openOnHover = (event: ReactPointerEvent) => {
    if (event.pointerType !== "mouse") return;
    window.clearTimeout(closeTimer.current);
    setMagazinesOpen(true);
  };
  const closeOnLeave = (event: ReactPointerEvent) => {
    if (event.pointerType !== "mouse") return;
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setMagazinesOpen(false), 180);
  };

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
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(closeTimer.current);
    };
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
                <li key={item.href} ref={dropdownRef} className="relative" onPointerEnter={openOnHover} onPointerLeave={closeOnLeave}>
                  <button
                    type="button"
                    aria-expanded={magazinesOpen}
                    aria-controls={panelId}
                    onClick={() => setMagazinesOpen((open) => !open)}
                    className={`flex min-h-11 cursor-pointer items-center gap-1.5 rounded-full border-0 px-3.5 text-[15px] font-medium text-white transition-colors hover:bg-white/12 ${
                      magazinesOpen || magazines.some((m) => isCurrent(pathname, m.href)) ? "bg-white/12" : "bg-transparent"
                    }`}
                  >
                    {item.label}
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 10 10"
                      aria-hidden="true"
                      className={`opacity-70 transition-transform duration-200 ${magazinesOpen ? "rotate-180" : ""}`}
                    >
                      <path d="M2 3.5 5 6.5 8 3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>

                  {/* Padding bridges the gap so the pointer can travel into the panel. */}
                  <div id={panelId} hidden={!magazinesOpen} className="absolute top-full left-1/2 w-[440px] -translate-x-1/2 pt-3">
                    <ul className="grid list-none gap-1 rounded-2xl bg-white p-2 shadow-[0_24px_48px_-20px_rgba(4,23,58,.5)]">
                      {magazines.map((magazine) => (
                        <li key={magazine.key}>
                          <Link
                            href={magazine.href}
                            aria-current={pathname === magazine.href ? "page" : undefined}
                            className="group flex items-center gap-4 rounded-xl p-3 text-[var(--color-navy)] no-underline transition-colors hover:bg-[var(--color-surface)]"
                          >
                            {magazine.cover && (
                              <Image
                                src={magazine.cover.src}
                                alt=""
                                width={magazine.cover.width}
                                height={magazine.cover.height}
                                sizes="44px"
                                loading="eager"
                                className="h-auto w-11 shrink-0 rounded-[3px] shadow-[0_8px_16px_-8px_rgba(4,23,58,.5)]"
                              />
                            )}
                            <span className="min-w-0 flex-1">
                              <span className="block text-[15px] leading-snug font-semibold">{magazine.title}</span>
                              <span className="mt-0.5 block text-sm text-[var(--color-muted)]">{magazine.audience}</span>
                            </span>
                            <span aria-hidden="true" className="text-[var(--color-steel)] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--color-navy)]">→</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
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
                  </Link>
                </li>
              ),
            )}
          </ul>
        </nav>

        <Link
          href={ROUTES.advertising}
          className="hidden h-[46px] shrink-0 items-center gap-2 rounded-full bg-white px-5 text-[15px] font-semibold whitespace-nowrap text-[var(--color-navy)] no-underline transition-colors hover:bg-[var(--color-cyan)] hover:text-[var(--color-navy)] lg:inline-flex"
        >
          Inzerovať u nás
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
                </Link>
                {item.kind === "magazines" && (
                  <ul className="grid list-none gap-1 pb-4">
                    {magazines.map((magazine) => (
                      <li key={magazine.key}>
                        <Link
                          href={magazine.href}
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-4 rounded-xl py-2 text-white no-underline"
                        >
                          {magazine.cover && (
                            <Image
                              src={magazine.cover.src}
                              alt=""
                              width={magazine.cover.width}
                              height={magazine.cover.height}
                              sizes="40px"
                              className="h-auto w-10 shrink-0 rounded-[3px]"
                            />
                          )}
                          <span className="min-w-0">
                            <span className="block text-base leading-snug font-semibold">{magazine.title}</span>
                            <span className="block text-sm text-white/60">{magazine.audience}</span>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
            <li className="pt-[18px]">
              <Link
                href={ROUTES.advertising}
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
