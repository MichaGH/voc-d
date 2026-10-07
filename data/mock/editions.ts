import type { ContentImage, Edition, MagazineKey } from "@/types/content";

/**
 * Edition fixtures limited to the covers actually supplied in public/images.
 * Highlights are transcribed from each cover's "V tomto čísle nájdete" panel.
 * Only the two PDFs already linked from the current website are referenced.
 * This is not a complete archive.
 */

function cover(file: string, magazine: string, label: string): ContentImage {
  return {
    src: `/images/${file}.jpg`,
    alt: `Obálka časopisu ${magazine} ${label}`,
    width: 595,
    height: 842,
  };
}

const PVK = "Plynár – Vodár – Kúrenár + Klimatizácia";
const SBD = "Správca bytových domov";

function edition(
  magazineKey: MagazineKey,
  number: number,
  year: number,
  rest: Partial<Edition> & Pick<Edition, "highlights">,
): Edition {
  const label = `${number}/${year}`;
  const inserts = rest.inserts ?? [];
  return {
    magazineKey,
    slug: `${number}-${year}`,
    label,
    year,
    order: number,
    cover: cover(`${magazineKey}-${number}-${year}`, magazineKey === "pvk" ? PVK : SBD, label),
    hasDigitalVersion: Boolean(rest.pdf),
    insertCount: inserts.length,
    ...rest,
    inserts,
  };
}

export const mockEditions: Edition[] = [
  edition("pvk", 1, 2026, {
    highlights: [
      { title: "Medzinárodná súťaž odborných zručností aj pre inštalatérov", page: 6 },
      { title: "Aquatherm Praha 2026", page: 20 },
      { title: "Fotovoltika a požiare striech", page: 32 },
    ],
  }),
  edition("pvk", 2, 2026, {
    highlights: [
      { title: "Nová generácia guľových kohútov BROEN Ballomax®", page: 14 },
      { title: "Výmena tepelných prípojok k bytovým domom priniesla výraznú úsporu", page: 30 },
      { title: "1. ročník súťaže odborných zručností", page: 34 },
    ],
  }),
  edition("pvk", 3, 2026, {
    highlights: [
      {
        title: "Zelené fasády v mestách V4: technické limity, hospodárenie s vodou a ekonomická realita",
        page: 8,
      },
      { title: "Osvedčené klimatizácie IVAR.2.0 nielen pre horúce dni", page: 13 },
      { title: "Legionella v budovách", page: 34 },
    ],
  }),
  edition("pvk", 4, 2026, {
    highlights: [
      { title: "Dažďová voda a jej využitie v penzióne", page: 8 },
      { title: "Inteligentný vstup do vykurovacej techniky budúcnosti", page: 14 },
      { title: "Vykurovacia sezóna s Reflexom", page: 35 },
    ],
    pdf: { url: "https://voc.sk/wp-content/uploads/PVK4_2026.pdf", filename: "PVK4_2026.pdf" },
    // FIXTURE: illustrative printed insert to exercise the vkladačky contract.
    // Replace with real insert records supplied by the publisher.
    inserts: [
      {
        key: "pozvanka-sprava-budov-jesen-2026",
        title: "Pozvánka na konferenciu Správa budov jeseň 2026",
        description: "Program a prihláška na 20. konferenciu v Bešeňovej.",
        paperFormat: { kind: "A4" },
        physicalSheetCount: 1,
      },
    ],
  }),
  edition("sbd", 4, 2025, {
    highlights: [
      { title: "Prípadové štúdie problémov TZB v bytových domoch", page: 12 },
      { title: "Zmena zákona a potreba kontroly režimu budovy", page: 21 },
      { title: "Správa budov jeseň 2025 odhalila najnovšie trendy", page: 31 },
    ],
  }),
  edition("sbd", 1, 2026, {
    highlights: [
      {
        title: "„Firmou časopisu Správca bytových domov“ za rok 2025 sa stala spoločnosť ALUMISTR SE",
        page: 20,
      },
      { title: "Elektrokolobežky ako rastúce riziko v bytových domoch", page: 34 },
      { title: "Ste už pripravení na novinky jarnej konferencie Správa budov?", page: 36 },
    ],
    // FIXTURE: illustrative printed insert (several sheets, printed only).
    inserts: [
      {
        key: "program-sprava-budov-jar-2026",
        title: "Program konferencie Správa budov jar 2026",
        description: "Prehľad prednášok a prihláška na 19. medzinárodnú konferenciu.",
        paperFormat: { kind: "A5" },
        physicalSheetCount: 2,
      },
    ],
  }),
  edition("sbd", 2, 2026, {
    highlights: [
      {
        title:
          "Aké je rozhodnutie Ústavného súdu, z ktorého vyplýva neúčinnosť troch ustanovení vyhlášky č. 503/2022 Z. z.",
        page: 8,
      },
      { title: "Aká bude odborná spôsobilosť správcov do budúcna?", page: 12 },
      { title: "Správa budov jar 2026: tri dni odborných poznatkov", page: 20 },
    ],
    pdf: { url: "https://voc.sk/wp-content/uploads/SBD2_2026.pdf", filename: "SBD2_2026.pdf" },
  }),
];
