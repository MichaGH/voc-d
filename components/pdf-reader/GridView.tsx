"use client";

import PdfPage from "@/components/pdf-reader/PdfPage";
import type { PdfSession } from "@/components/pdf-reader/pdf-session";
import { GRID_GAP, type GridLayout } from "@/lib/pdf-reader/grid";
import type { PageSize } from "@/lib/pdf-reader/zoom";
import type { ContentImage } from "@/types/content";

interface GridViewProps {
  session: PdfSession | null;
  version: number;
  pageCount: number;
  grid: GridLayout;
  /** CSS pixels per PDF unit for every page of the overview. */
  cssScale: number;
  sizeOf: (page: number) => PageSize;
  /** Pages near the screen get a live page; the rest are empty boxes of the same size. */
  mounted: { first: number; last: number };
  padding: { top: number; bottom: number };
  cover?: ContentImage;
  picked: number | null;
  onPick: (page: number) => void;
  onNavigate: (page: number) => void;
}

/**
 * Page overview: equal columns, each page centred in its column, so the
 * space between pages is what the column leaves. Pages are buttons that
 * open the page for continuous reading.
 */
export default function GridView({ session, version, pageCount, grid, cssScale, sizeOf, mounted, padding, cover, picked, onPick, onNavigate }: GridViewProps) {
  const pages = Array.from({ length: pageCount }, (_, index) => index + 1);
  return (
    <div style={{ paddingTop: padding.top, paddingBottom: padding.bottom }}>
      <ol
        aria-label="Náhľad strán"
        className="grid list-none"
        style={{ gridTemplateColumns: `repeat(${grid.columns}, minmax(0, 1fr))`, rowGap: GRID_GAP }}
      >
        {pages.map((page) => {
          const size = sizeOf(page);
          return (
            <li key={page} className="flex justify-center" style={{ height: grid.pageHeight }}>
              {page >= mounted.first && page <= mounted.last ? (
                <PdfPage
                  session={session}
                  page={page}
                  size={size}
                  cssScale={cssScale}
                  side="single"
                  interaction="pick"
                  picked={picked === page}
                  onPick={onPick}
                  cover={page === 1 ? cover : undefined}
                  version={version}
                  onNavigate={onNavigate}
                />
              ) : (
                <div
                  aria-hidden="true"
                  className="bg-white shadow-[0_18px_40px_-24px_rgba(4,23,58,.55)]"
                  style={{ width: Math.round(size.width * cssScale), height: Math.round(size.height * cssScale) }}
                />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
