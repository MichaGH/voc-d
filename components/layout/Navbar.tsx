"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { LINKS, SITE_URL } from "@/constants";
import { navigation } from "@/data/navigation";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-60 border-b transition-colors duration-300 ${
        scrolled || menuOpen
          ? "border-white/10 bg-[rgba(4,23,58,.94)] backdrop-blur-md"
          : "border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-[76px] max-w-[1400px] items-center gap-7 px-5 md:px-8 xl:px-12">
        <Link
          href={SITE_URL}
          aria-label="VOC.SK – úvodná stránka"
          className="flex min-h-11 shrink-0 items-center"
        >
          <Image
            src="/images/voc-logo-white.png"
            alt="V.O.Č. SLOVAKIA"
            width={2188}
            height={351}
            priority
            className="h-[26px] w-auto"
          />
        </Link>

        <nav aria-label="Hlavná navigácia" className="mx-auto hidden lg:block">
          <ul className="flex list-none gap-1">
            {navigation.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex min-h-11 items-center rounded-full px-3.5 text-[15px] font-medium text-white no-underline transition-colors hover:bg-white/12 hover:text-white"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <Link
          href={LINKS.advertise}
          className="hidden h-[46px] shrink-0 items-center gap-2 whitespace-nowrap rounded-full bg-white px-5 text-[15px] font-semibold text-[var(--color-navy)] no-underline transition-colors hover:bg-[var(--color-cyan)] hover:text-[var(--color-navy)] lg:inline-flex"
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
        <nav id="mobilne-menu" aria-label="Hlavná navigácia" className="border-t border-white/12 bg-[var(--color-navy)] lg:hidden">
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
