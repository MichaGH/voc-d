import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "VOC.SK – odborné časopisy, publikácie a vzdelávanie",
  description:
    "V.O.Č. SLOVAKIA vydáva časopisy Správca bytových domov a Plynár – vodár – kúrenár + klimatizácia, publikáciu Správca budov a organizuje odborné vzdelávanie.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="sk" className={`${geist.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
