import { LINKS } from "@/constants";

export const brands = [
  "Viessmann",
  "Buderus",
  "Vaillant",
  "Protherm",
  "Geberit",
  "Danfoss",
  "Grundfos",
  "Wilo",
  "Rehau",
  "Uponor",
  "Honeywell",
  "Siemens",
] as const;

export const stats = [
  { value: "20+", label: "rokov odborného publikovania" },
  { value: "2", label: "recenzované odborné časopisy" },
  { value: "4×", label: "vydania ročne každého titulu" },
  { value: "96 h", label: "akreditovaného kurzu pre správcov" },
] as const;

export const magazines = [
  {
    id: "sbd-nadpis",
    eyebrow: "Pre správcov bytových domov",
    eyebrowClass: "text-[var(--color-green)]",
    title: "Správca bytových domov",
    description:
      "Legislatíva, obnova, energie a technika bytových domov v recenzovanom odbornom časopise.",
    href: LINKS.sbd,
    sampleHref: "https://voc.sk/wp-content/uploads/SBD2_2026.pdf",
    sampleLabel: "Ukážka čísla 2/2026",
    covers: [
      "/images/sbd-4-2025.jpg",
      "/images/sbd-1-2026.jpg",
      "/images/sbd-2-2026.jpg",
    ],
  },
  {
    id: "pvk-nadpis",
    eyebrow: "Pre profesie TZB",
    eyebrowClass: "text-[var(--color-teal)]",
    title: "Plynár – Vodár – Kúrenár + Klimatizácia",
    description:
      "Vykurovanie, voda, plyn, klimatizácia a vzduchotechnika vo vedecko-odbornom časopise.",
    href: LINKS.pvk,
    sampleHref: "https://voc.sk/wp-content/uploads/PVK4_2026.pdf",
    sampleLabel: "Ukážka čísla 4/2026",
    covers: [
      "/images/pvk-2-2026.jpg",
      "/images/pvk-3-2026.jpg",
      "/images/pvk-4-2026.jpg",
    ],
  },
] as const;

export const topics = [
  {
    number: "01",
    title: "Legislatíva zrozumiteľne",
    description:
      "Zmeny zákonov a noriem vysvetlené odborníkmi — skôr, než začnú platiť.",
    image: "/images/topic-legislation.jpg",
    alt: "Čitateľ s časopisom",
  },
  {
    number: "02",
    title: "Overené technológie",
    description:
      "Tepelné čerpadlá, OZE a obnova domov. Riešenia s dátami z praxe, nie z prospektov.",
    image: "/images/topic-technology.jpg",
    alt: "Tepelné čerpadlo pri obnovenom dome",
  },
  {
    number: "03",
    title: "Produkty, veľtrhy a ocenenia",
    description:
      "Novinky výrobcov, reportáže z Infothermy či Aquathermu a ocenenie Firma časopisu.",
    image: "/images/topic-events.jpg",
    alt: "Rečník na odbornom podujatí",
  },
] as const;

export const audienceGroups = [
  {
    tab: "Spravujem bytové domy",
    title: "Pre správcov a spoločenstvá vlastníkov",
    description:
      "Legislatíva, obnova a energie bytových domov v jednom časopise — plus učebnica a akreditovaný kurz, ktoré vás pripravia na prax.",
    image: "/images/role-manager.jpg",
    alt: "Moderný bytový dom",
    links: [
      { label: "Časopis Správca bytových domov", href: LINKS.sbd, arrow: "→" },
      { label: "Publikácia Správca budov", href: LINKS.publication, arrow: "→" },
      { label: "Kurz Správa bytového fondu", href: LINKS.course, arrow: "→" },
    ],
    cta: "Predplatiť Správcu bytových domov",
    ctaHref: LINKS.sbd,
  },
  {
    tab: "Pracujem v TZB",
    title: "Pre projektantov, montážnikov a firmy TZB",
    description:
      "Vykurovanie, voda, plyn, klimatizácia a vzduchotechnika — technické riešenia, dáta a produktové novinky z praxe.",
    image: "/images/role-tzb.jpg",
    alt: "Potrubia a meradlá vykurovacej sústavy",
    links: [
      { label: "Časopis Plynár – Vodár – Kúrenár + K", href: LINKS.pvk, arrow: "→" },
      { label: "TZBportal.sk a NEWS", href: LINKS.tzbPortal, arrow: "↗" },
      { label: "Konferencia Správa budov", href: LINKS.conference, arrow: "→" },
    ],
    cta: "Predplatiť Plynár – Vodár – Kúrenár",
    ctaHref: LINKS.pvk,
  },
  {
    tab: "Chcem inzerovať",
    title: "Pre výrobcov, dodávateľov a partnerov",
    description:
      "Oslovte správcov budov aj profesie TZB — v tlači, direct-mailingom aj online.",
    image: "/images/role-advertiser.jpg",
    alt: "Čitateľ s odborným časopisom",
    links: [
      { label: "Inzercia v Správcovi bytových domov", href: LINKS.sbdAds, arrow: "→" },
      { label: "Inzercia v Plynár – Vodár – Kúrenár", href: LINKS.pvkAds, arrow: "→" },
      { label: "Všetky služby vydavateľstva", href: LINKS.services, arrow: "→" },
    ],
    cta: "Dohodnúť inzerciu",
    ctaHref: LINKS.advertise,
  },
] as const;

export const educationCards = [
  {
    href: LINKS.conference,
    image: "/images/conference.jpg",
    alt: "",
    eyebrow: "Medzinárodná konferencia",
    eyebrowClass: "text-[var(--color-teal)]",
    title: "Konferencia Správa budov",
    description: "Riešenia pre správu bytových domov a nehnuteľností.",
    imageClass: "object-contain p-7 bg-[var(--color-navy)]",
  },
  {
    href: LINKS.course,
    image: "/images/education-course.jpg",
    alt: "Štúdium pri pracovnom stole",
    eyebrow: "Akreditovaný kurz · 96 hodín",
    eyebrowClass: "text-[var(--color-blue)]",
    title: "Kurz Správa bytového fondu",
    description:
      "Kvalifikácia podľa zákona č. 246/2015 Z. z. o správcoch bytových domov.",
    imageClass: "object-cover",
  },
] as const;

export const advertisingChannels = [
  {
    href: LINKS.sbdAds,
    image: "/images/sbd-2-2026.jpg",
    title: "Správca bytových domov",
    audience: "Správcovia, spoločenstvá a bytové družstvá · Slovensko",
    formats: "Plošná inzercia · Odborný článok · Direct-mailing",
    arrow: "→",
  },
  {
    href: LINKS.pvkAds,
    image: "/images/pvk-4-2026.jpg",
    title: "Plynár – Vodár – Kúrenár + Klimatizácia",
    audience: "Projektanti, montážnici a firmy TZB · Slovensko a Česko",
    formats: "Plošná inzercia · Odborný článok · Direct-mailing",
    arrow: "→",
  },
  {
    href: LINKS.tzbPortal,
    image: "/images/tzb-portal.jpg",
    title: "TZBportal.sk a NEWS",
    audience: "Online čitatelia z oblasti technických zariadení budov",
    formats: "Odborné články · Prezentácia firmy online",
    arrow: "↗",
  },
] as const;

export const advertisingServices = [
  {
    icon: "document",
    title: "Prezentácia v časopise",
    description: "Plošná inzercia, odborný článok a pozvánky na výstavy či podujatia.",
  },
  {
    icon: "design",
    title: "Grafické návrhy",
    description: "Inzercie a firemné materiály — letáky, plagáty, katalógy.",
  },
  {
    icon: "online",
    title: "Online na TZBportal.sk",
    description: "Umiestnenie odborných článkov na portáli a v newslettri NEWS.",
  },
  {
    icon: "send",
    title: "Výtlačky pre vašich klientov",
    description: "Až 100 výtlačkov s vašou inzerciou pošleme na náklady vydavateľstva.",
  },
] as const;

export const issues = [
  { title: "Správca bytových domov", issue: "2/2026", image: "/images/sbd-2-2026.jpg", href: "https://voc.sk/wp-content/uploads/SBD2_2026.pdf" },
  { title: "Plynár – Vodár – Kúrenár", issue: "4/2026", image: "/images/pvk-4-2026.jpg", href: "https://voc.sk/wp-content/uploads/PVK4_2026.pdf" },
  { title: "Plynár – Vodár – Kúrenár", issue: "3/2026", image: "/images/pvk-3-2026.jpg", href: LINKS.pvk },
  { title: "Správca bytových domov", issue: "1/2026", image: "/images/sbd-1-2026.jpg", href: LINKS.sbd },
  { title: "Plynár – Vodár – Kúrenár", issue: "2/2026", image: "/images/pvk-2-2026.jpg", href: LINKS.pvk },
  { title: "Plynár – Vodár – Kúrenár", issue: "1/2026", image: "/images/pvk-1-2026.jpg", href: LINKS.pvk },
  { title: "Správca bytových domov", issue: "4/2025", image: "/images/sbd-4-2025.jpg", href: LINKS.sbd },
] as const;

export const faqs = [
  {
    question: "Ako si objednám predplatné časopisu?",
    answer:
      "Predplatné si objednáte na stránke príslušného časopisu alebo e-mailom na voc@voc.sk. Radi vám poradíme s tlačenou aj elektronickou verziou.",
  },
  {
    question: "Ako môžem inzerovať v časopisoch a na TZBportal.sk?",
    answer:
      "Napíšte nám na voc@voc.sk alebo zavolajte na +421 55 678 28 08. Pripravíme ponuku podľa média a formátu — pri inzercii vo viacerých médiách poskytujeme zľavy.",
  },
  {
    question: "Kde kúpim publikáciu Správca budov?",
    answer:
      "Publikáciu si objednáte prostredníctvom objednávkového letáka (PDF) na tejto stránke alebo e-mailom.",
  },
  {
    question: "Pre koho je kurz Správa bytového fondu?",
    answer:
      "Akreditovaný 96-hodinový kurz je určený pre záujemcov o kvalifikáciu správcu podľa zákona č. 246/2015 Z. z. o správcoch bytových domov.",
  },
] as const;
