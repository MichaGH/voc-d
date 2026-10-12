import type { ContentImage, Edition, MagazineKey, PdfAsset } from "@/types/content";

/**
 * Edition fixtures limited to the covers actually supplied in public/images.
 * This is not a complete archive.
 *
 * FIXTURE PDFs: public/pdfs holds generated sample issues (real cover, sample
 * pages) standing in for Sanity file assets, because real issues cannot be
 * downloaded yet. Swap them for the publisher's reading exports; the Sanity
 * adapter will return the asset CDN URL in the same PdfAsset shape.
 */

function cover(file: string, magazine: string, label: string): ContentImage {
  return {
    src: `/images/${file}.jpg`,
    alt: `Obálka časopisu ${magazine} ${label}`,
    width: 595,
    height: 842,
  };
}

/** Local stand-in for an uploaded PDF file asset. */
function localPdf(filename: string, byteSize: number, pageCount: number): PdfAsset {
  return { url: `/pdfs/${filename}`, filename, byteSize, pageCount };
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
  edition("pvk", 3, 2026, { pdf: localPdf("pvk-3-2026.pdf", 3_137_295, 28) }),
  edition("pvk", 4, 2026, {
    pdf: localPdf("pvk-4-2026.pdf", 4_911_841, 36),
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
    pdf: localPdf("sbd-2-2026.pdf", 2_791_457, 24),
  }),
];
