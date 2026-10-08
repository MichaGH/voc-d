import { LINKS } from "@/constants";
import { editorialPlanPath } from "@/constants/routes";

/** Advertising channels and services (presentational copy shared by homepage and /inzercia). */
export const advertisingChannels = [
  {
    key: "sbd",
    image: { src: "/images/sbd-2-2026.jpg", width: 595, height: 842 },
    title: "Správca bytových domov",
    audience: "Správcovia, spoločenstvá a bytové družstvá · Slovensko",
    formats: ["Plošná inzercia", "Odborný článok", "Direct-mailing"],
    planHref: editorialPlanPath("sbd"),
    infoHref: LINKS.sbdAds,
  },
  {
    key: "pvk",
    image: { src: "/images/pvk-4-2026.jpg", width: 595, height: 842 },
    title: "Plynár – Vodár – Kúrenár + Klimatizácia",
    audience: "Projektanti, montážnici a firmy TZB · Slovensko a Česko",
    formats: ["Plošná inzercia", "Odborný článok", "Direct-mailing"],
    planHref: editorialPlanPath("pvk"),
    infoHref: LINKS.pvkAds,
  },
  {
    key: "tzbportal",
    image: { src: "/images/tzb-portal.jpg", width: 176, height: 200 },
    title: "TZBportal.sk a NEWS",
    audience: "Online čitatelia z oblasti technických zariadení budov",
    formats: ["Odborné články", "Prezentácia firmy online"],
    planHref: null,
    infoHref: LINKS.tzbPortal,
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
