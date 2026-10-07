import { LINKS } from "@/constants";
import { MAGAZINE_SLUGS } from "@/constants/routes";
import type { Magazine } from "@/types/content";

/**
 * Magazine fixtures. Copy is a working draft derived from the current VOC
 * website and awaits owner approval before launch.
 */
export const mockMagazines: Magazine[] = [
  {
    key: "pvk",
    slug: MAGAZINE_SLUGS.pvk,
    title: "Plynár – Vodár – Kúrenár + Klimatizácia",
    shortTitle: "Plynár – Vodár – Kúrenár",
    abbreviation: "PVK",
    audience: "Pre profesie TZB",
    description:
      "Vykurovanie, voda, plyn, klimatizácia a vzduchotechnika vo vedecko-odbornom časopise.",
    readers: "Projektanti, montážnici a firmy TZB · Slovensko a Česko",
    intro:
      "Odborný časopis pre projektantov, montážnikov, servisných technikov a firmy z oblasti technických zariadení budov. V každom čísle prináša technické riešenia, skúsenosti z realizácií, zmeny v predpisoch a novinky výrobcov.",
    hero: {
      headline: "Technika budov, ktorá obstojí v praxi.",
      summary:
        "Vykurovanie, voda, plyn, klimatizácia a vzduchotechnika — riešenia, dáta a skúsenosti pre projektantov, montážnikov a firmy TZB.",
      poster: {
        src: "/images/hero-pvk.jpg",
        alt: "",
        width: 1920,
        height: 1080,
      },
      video: { src: "/videos/herovideo.mp4", mimeType: "video/mp4" },
    },
    topics: [
      {
        key: "vykurovanie",
        title: "Vykurovanie a obnoviteľné zdroje",
        description:
          "Tepelné čerpadlá, kotly, solárne systémy a tepelné siete — s dátami z prevádzky, nie z prospektov.",
        image: {
          src: "/images/topic-technology.jpg",
          alt: "Tepelné čerpadlo pri rodinnom dome",
          width: 1200,
          height: 800,
        },
      },
      {
        key: "voda-plyn",
        title: "Voda, plyn a rozvody",
        description:
          "Potrubné systémy, armatúry, hygiena pitnej vody a bezpečná prevádzka plynových zariadení.",
        image: {
          src: "/images/role-tzb.jpg",
          alt: "Potrubia a meradlá vykurovacej sústavy",
          width: 1400,
          height: 2106,
        },
      },
      {
        key: "klimatizacia",
        title: "Klimatizácia a vzduchotechnika",
        description:
          "Chladenie, vetranie a kvalita vnútorného prostredia v nových aj obnovovaných budovách.",
      },
      {
        key: "legislativa",
        title: "Predpisy a normy",
        description:
          "Zmeny zákonov a technických noriem vysvetlené odborníkmi — skôr, než začnú platiť.",
      },
      {
        key: "produkty",
        title: "Produkty, veľtrhy a súťaže",
        description:
          "Novinky výrobcov, reportáže z veľtrhov ako Aquatherm a súťaže odborných zručností.",
        image: {
          src: "/images/topic-events.jpg",
          alt: "Rečník na odbornom podujatí",
          width: 1200,
          height: 782,
        },
      },
    ],
    subscription: {
      title: "Predplatné časopisu Plynár – Vodár – Kúrenár",
      text: "Tlačené vydanie vám pošleme poštou hneď po vyjdení. Napíšte nám a pripravíme predplatné pre vás alebo celú firmu.",
    },
    advertisingInfoUrl: LINKS.pvkAds,
  },
  {
    key: "sbd",
    slug: MAGAZINE_SLUGS.sbd,
    title: "Správca bytových domov",
    shortTitle: "Správca bytových domov",
    abbreviation: "SBD",
    audience: "Pre správcov bytových domov",
    description:
      "Legislatíva, obnova, energie a technika bytových domov v recenzovanom odbornom časopise.",
    readers: "Správcovia, spoločenstvá a bytové družstvá · Slovensko",
    intro:
      "Recenzovaný odborný časopis pre správcov bytových domov, spoločenstvá vlastníkov a bytové družstvá. Pomáha zorientovať sa v legislatíve, obnove domov, energiách a technike — s príkladmi z praxe.",
    hero: {
      headline: "Spravujte bytové domy s istotou.",
      summary:
        "Legislatíva, obnova, energie a technika bytových domov — overené informácie pre správcov, spoločenstvá a družstvá.",
      // No approved SBD footage yet: an honest still poster instead of reusing the PVK clip.
      poster: {
        src: "/images/hero-sbd.jpg",
        alt: "",
        width: 1920,
        height: 1080,
      },
    },
    topics: [
      {
        key: "legislativa",
        title: "Legislatíva a judikatúra",
        description:
          "Zákony, vyhlášky a rozhodnutia súdov, ktoré menia správu domov — vysvetlené zrozumiteľne.",
        image: {
          src: "/images/topic-legislation.jpg",
          alt: "Čitateľ s odborným časopisom",
          width: 1200,
          height: 1800,
        },
      },
      {
        key: "obnova",
        title: "Obnova a energie",
        description:
          "Zatepľovanie, výmena zdrojov tepla a úspory energie v bytových domoch krok za krokom.",
        image: {
          src: "/images/role-manager.jpg",
          alt: "Moderný bytový dom",
          width: 1400,
          height: 2100,
        },
      },
      {
        key: "technika",
        title: "Technika domu",
        description:
          "Výťahy, rozvody, vetranie a požiarna bezpečnosť — prípadové štúdie problémov z bytových domov.",
      },
      {
        key: "hospodarenie",
        title: "Hospodárenie a správa",
        description:
          "Fond prevádzky, údržby a opráv, zmluvy, schôdze vlastníkov a komunikácia s nimi.",
      },
      {
        key: "konferencie",
        title: "Firma časopisu a konferencie",
        description:
          "Ocenenie Firma časopisu Správca bytových domov a novinky z konferencie Správa budov.",
        image: {
          src: "/images/topic-events.jpg",
          alt: "Rečník na konferencii",
          width: 1200,
          height: 782,
        },
      },
    ],
    subscription: {
      title: "Predplatné časopisu Správca bytových domov",
      text: "Tlačené vydanie vám pošleme poštou hneď po vyjdení. Napíšte nám a pripravíme predplatné pre vás, vaše spoločenstvo alebo družstvo.",
    },
    advertisingInfoUrl: LINKS.sbdAds,
  },
];
