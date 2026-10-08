import type { ContentImage, Edition, MagazineKey } from "@/types/content";

/**
 * Edition fixtures limited to the covers actually supplied in public/images.
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
  rest: Partial<Edition> = {},
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
  edition("pvk", 1, 2026),
  edition("pvk", 2, 2026),
  edition("pvk", 3, 2026),
  edition("pvk", 4, 2026, {
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
  edition("sbd", 4, 2025),
  edition("sbd", 1, 2026, {
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
    pdf: { url: "https://voc.sk/wp-content/uploads/SBD2_2026.pdf", filename: "SBD2_2026.pdf" },
  }),
];
