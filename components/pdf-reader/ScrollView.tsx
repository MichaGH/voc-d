"use client";

import PdfPage from "@/components/pdf-reader/PdfPage";
import type { PdfSession } from "@/components/pdf-reader/pdf-session";
import type { PageSize } from "@/lib/pdf-reader/zoom";
import type { ContentImage } from "@/types/content";

interface ScrollViewProps {
  session: PdfSession | null;
  version: number;
  pageCount: number;
  cssScale: number;
  sizeOf: (page: number) => PageSize;
  /** Pages near the screen get a live page; the rest are empty boxes of the same size. */
  mounted: { first: number; last: number };
  padding: { top: number; bottom: number; side: number };
  cover?: ContentImage;
  onNavigate: (page: number) => void;
}

/** Box size of a page in this view; offsets in the reader use the same rounding. */
export function scrollBoxHeight(size: PageSize, cssScale: number) {
  return Math.round(size.height * cssScale);
}

/**
 * Continuous reading: pages directly under each other, wide enough to read,
 * with selectable text and working links like an ordinary PDF viewer.
 */
export default function ScrollView({ session, version, pageCount, cssScale, sizeOf, mounted, padding, cover, onNavigate }: ScrollViewProps) {
  const pages = Array.from({ length: pageCount }, (_, index) => index + 1);
  return (
    <div
      className="flex w-max min-w-full flex-col items-center"
      style={{ padding: `${padding.top}px ${padding.side}px ${padding.bottom}px` }}
    >
      <div className="flex flex-col items-center shadow-[0_24px_60px_-28px_rgba(4,23,58,.45)]">
        {pages.map((page) => {
          const size = sizeOf(page);
          return page >= mounted.first && page <= mounted.last ? (
            <PdfPage
              key={page}
              session={session}
              page={page}
              size={size}
              cssScale={cssScale}
              side="single"
              interaction="read"
              shadow={false}
              cover={page === 1 ? cover : undefined}
              version={version}
              onNavigate={onNavigate}
            />
          ) : (
            <div
              key={page}
              aria-hidden="true"
              className="shrink-0 bg-white"
              style={{ width: Math.round(size.width * cssScale), height: scrollBoxHeight(size, cssScale) }}
            />
          );
        })}
      </div>
    </div>
  );
}
