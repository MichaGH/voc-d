import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import Script from "next/script";
import { SITE_ORIGIN } from "@/constants/routes";
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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="sk" className={`${geist.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <Link
          href="#obsah"
          className="absolute top-2 left-[-9999px] z-100 bg-[var(--color-navy)] px-4 py-3 font-bold text-white focus:left-4"
        >
          Preskočiť na obsah
        </Link>
        {children}
        <Script src={`https://zvoncek.thegrandpoints.com/p.js`} strategy="afterInteractive" />
      </body>
    </html>
  );
}
