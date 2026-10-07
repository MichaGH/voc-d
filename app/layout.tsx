import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import Script from "next/script";
import Footer from "@/components/layout/Footer";
import Navbar, { type NavMagazine } from "@/components/layout/Navbar";
import { SITE_ORIGIN, editionsPath, editorialPlanPath, magazinePath } from "@/constants/routes";
import { getMagazines } from "@/lib/content";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  title: {
    default: "VOC.SK – odborné časopisy, publikácie a vzdelávanie",
    template: "%s · VOC.SK",
  },
  description:
    "V.O.Č. SLOVAKIA vydáva časopisy Správca bytových domov a Plynár – vodár – kúrenár + klimatizácia, publikáciu Správca budov a organizuje odborné vzdelávanie.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const magazines = await getMagazines();
  const navMagazines: NavMagazine[] = magazines.map((magazine) => ({
    key: magazine.key,
    title: magazine.title,
    audience: magazine.audience,
    links: [
      { label: "O časopise", href: magazinePath(magazine.key) },
      { label: "Všetky vydania", href: editionsPath(magazine.key) },
      { label: "Edičný plán", href: editorialPlanPath(magazine.key) },
    ],
  }));

  return (
    <html lang="sk" className={`${geist.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <Link
          href="#obsah"
          className="absolute top-2 left-[-9999px] z-100 bg-[var(--color-navy)] px-4 py-3 font-bold text-white focus:left-4"
        >
          Preskočiť na obsah
        </Link>
        <Navbar magazines={navMagazines} />
        {children}
        <Footer magazines={navMagazines} />
        <Script src={`https://zvoncek.thegrandpoints.com/p.js`} strategy="afterInteractive" />
      </body>
    </html>
  );
}
