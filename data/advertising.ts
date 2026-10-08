import type { MagazineKey } from "@/types/content";

/** Advertising media (presentational copy shared by the homepage teaser and /inzercia). */
export interface AdvertisingOption {
  title: string;
  description: string;
}

export interface AdvertisingMedium {
  key: MagazineKey | "tzbportal";
  title: string;
  audience: string;
  image: { src: string; width: number; height: number };
  options: AdvertisingOption[];
}

const printOptions: AdvertisingOption[] = [
  { title: "Plošná inzercia", description: "Inzerát v tlačenom vydaní časopisu. Grafický návrh vám radi pripravíme." },
  { title: "Odborný článok", description: "Predstavte svoje riešenie, produkt alebo realizáciu formou odborného textu." },
  { title: "Direct-mailing", description: "Váš leták alebo katalóg doručíme čitateľom spolu s časopisom." },
  { title: "Výtlačky pre vašich klientov", description: "Až 100 výtlačkov s vašou inzerciou pošleme na náklady vydavateľstva." },
];

export const advertisingMedia: AdvertisingMedium[] = [
  {
    key: "sbd",
    title: "Správca bytových domov",
    audience: "Správcovia, spoločenstvá vlastníkov a bytové družstvá na Slovensku.",
    image: { src: "/images/sbd-2-2026.jpg", width: 595, height: 842 },
    options: printOptions,
  },
  {
    key: "pvk",
    title: "Plynár – Vodár – Kúrenár + Klimatizácia",
    audience: "Projektanti, montážnici a firmy z oblasti TZB na Slovensku a v Česku.",
    image: { src: "/images/pvk-4-2026.jpg", width: 595, height: 842 },
    options: printOptions,
  },
  {
    key: "tzbportal",
    title: "TZBportal.sk a NEWS",
    audience: "Online čitatelia z oblasti technických zariadení budov.",
    image: { src: "/images/tzb-portal.jpg", width: 176, height: 200 },
    options: [
      { title: "Odborný článok na portáli", description: "Váš text zverejníme na TZBportal.sk medzi odbornými článkami." },
      { title: "Newsletter NEWS", description: "Článok alebo novinka vašej firmy v pravidelnom newslettri." },
      { title: "Prezentácia firmy online", description: "Predstavenie firmy a produktov čitateľom portálu." },
    ],
  },
];
