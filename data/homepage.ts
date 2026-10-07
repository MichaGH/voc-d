import { LINKS } from "@/constants";
import { ROUTES, magazinePath, subscriptionPath } from "@/constants/routes";

export const stats = [
  { value: "20+", label: "rokov odborného publikovania" },
  { value: "2", label: "recenzované odborné časopisy" },
  { value: "4×", label: "vydania ročne každého titulu" },
  { value: "96 h", label: "akreditovaného kurzu pre správcov" },
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
      { label: "Časopis Správca bytových domov", href: magazinePath("sbd"), arrow: "→" },
      { label: "Publikácia Správca budov (PDF)", href: LINKS.publication, arrow: "↗" },
      { label: "Kurz Správa bytového fondu", href: LINKS.course, arrow: "↗" },
    ],
    cta: "Predplatiť Správcu bytových domov",
    ctaHref: subscriptionPath("sbd"),
  },
  {
    tab: "Pracujem v TZB",
    title: "Pre projektantov, montážnikov a firmy TZB",
    description:
      "Vykurovanie, voda, plyn, klimatizácia a vzduchotechnika — technické riešenia, dáta a produktové novinky z praxe.",
    image: "/images/role-tzb.jpg",
    alt: "Potrubia a meradlá vykurovacej sústavy",
    links: [
      { label: "Časopis Plynár – Vodár – Kúrenár + K", href: magazinePath("pvk"), arrow: "→" },
      { label: "TZBportal.sk a NEWS", href: LINKS.tzbPortal, arrow: "↗" },
      { label: "Vzdelávanie a konferencie", href: ROUTES.education, arrow: "→" },
    ],
    cta: "Predplatiť Plynár – Vodár – Kúrenár",
    ctaHref: subscriptionPath("pvk"),
  },
  {
    tab: "Chcem inzerovať",
    title: "Pre výrobcov, dodávateľov a partnerov",
    description:
      "Oslovte správcov budov aj profesie TZB — v tlači, direct-mailingom aj online.",
    image: "/images/role-advertiser.jpg",
    alt: "Čitateľ s odborným časopisom",
    links: [
      { label: "Inzercia v Správcovi bytových domov", href: LINKS.sbdAds, arrow: "↗" },
      { label: "Inzercia v Plynár – Vodár – Kúrenár", href: LINKS.pvkAds, arrow: "↗" },
      { label: "Všetky služby vydavateľstva", href: LINKS.services, arrow: "↗" },
    ],
    cta: "Dohodnúť inzerciu",
    ctaHref: LINKS.advertise,
  },
] as const;

export const advertisingChannels = [
  {
    href: LINKS.sbdAds,
    image: "/images/sbd-2-2026.jpg",
    title: "Správca bytových domov",
    audience: "Správcovia, spoločenstvá a bytové družstvá · Slovensko",
    formats: "Plošná inzercia · Odborný článok · Direct-mailing",
    arrow: "↗",
  },
  {
    href: LINKS.pvkAds,
    image: "/images/pvk-4-2026.jpg",
    title: "Plynár – Vodár – Kúrenár + Klimatizácia",
    audience: "Projektanti, montážnici a firmy TZB · Slovensko a Česko",
    formats: "Plošná inzercia · Odborný článok · Direct-mailing",
    arrow: "↗",
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
