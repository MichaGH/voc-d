"use client";

import Image from "next/image";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { PdfLink, PdfSession } from "@/components/pdf-reader/pdf-session";
import { isExternalHref } from "@/lib/url/safe-href";
import type { PageSize } from "@/lib/pdf-reader/zoom";
import type { ContentImage } from "@/types/content";

/** Shared with the reader skeleton so both request the same optimised cover. */
export const COVER_SIZES = "(max-width: 1055px) 100vw, 640px";

interface PdfPageProps {
  session: PdfSession | null;
  page: number;
  size: PageSize;
  /** CSS pixels per PDF unit. */
  cssScale: number;
  /** Which side of a spread the page sits on (for the fold shading). */
  side: "left" | "right" | "single";
  /** Shown in place of page 1 until its first bitmap exists. */
  cover?: ContentImage;
  /** Re-render trigger from the session store. */
  version: number;
  onNavigate: (page: number) => void;
}

/**
 * One PDF page: the session's canvas (moved, not redrawn, so prepared pages
 * appear instantly), a selectable text layer and safe link hotspots, all
 * positioned in page fractions so they stay aligned at every zoom.
 */
export default function PdfPage({ session, page, size, cssScale, side, cover, version, onNavigate }: PdfPageProps) {
  const canvasHost = useRef<HTMLDivElement>(null);
  const textHost = useRef<HTMLDivElement>(null);
  const [links, setLinks] = useState<{ page: number; items: PdfLink[] } | null>(null);
  const bitmap = session?.bitmap(page);
  const failed = session?.pageError(page) ?? false;
  const hasBitmap = Boolean(bitmap);

  useLayoutEffect(() => {
    const host = canvasHost.current;
    if (!host) return;
    if (bitmap) {
      if (host.firstChild !== bitmap.canvas) host.replaceChildren(bitmap.canvas);
    } else if (host.firstChild) {
      host.replaceChildren();
    }
    // `version` changes whenever the session swaps bitmaps.
  }, [bitmap, version]);

  // Text and links after the page is visible, so they never delay the picture.
  useEffect(() => {
    if (!session || !hasBitmap) return;
    let active = true;
    const host = textHost.current;
    session
      .textLayer(page)
      .then((layer) => {
        if (active && host && host.firstChild !== layer) host.replaceChildren(layer);
      })
      .catch(() => {});
    session.pageLinks(page).then((items) => {
      if (active) setLinks({ page, items });
    });
    return () => {
      active = false;
      host?.replaceChildren();
    };
  }, [session, page, hasBitmap]);

  const width = Math.round(size.width * cssScale);
  const height = Math.round(size.height * cssScale);
  const pageLinks = links?.page === page ? links.items : [];

  return (
    <div
      role="group"
      aria-label={`Strana ${page}`}
      className="reader-page relative shrink-0 bg-white shadow-[0_18px_40px_-24px_rgba(4,23,58,.55)]"
      style={{ width, height, ["--total-scale-factor" as string]: cssScale }}
    >
      {!bitmap && cover && page === 1 && !failed && (
        <Image src={cover.src} alt="" fill sizes={COVER_SIZES} className="object-fill" loading="eager" />
      )}
      <div ref={canvasHost} className="absolute inset-0" aria-hidden="true" />

      {side !== "single" && (
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-y-0 z-[1] w-[7%] ${
            side === "left"
              ? "right-0 bg-[linear-gradient(to_left,rgba(4,23,58,.16),rgba(4,23,58,0))]"
              : "left-0 bg-[linear-gradient(to_right,rgba(4,23,58,.16),rgba(4,23,58,0))]"
          }`}
        />
      )}

      <div ref={textHost} />

      {pageLinks.map((link, index) => (
        <LinkHotspot key={index} link={link} onNavigate={onNavigate} />
      ))}

      {!bitmap && !failed && page !== 1 && (
        <p className="reader-delayed absolute inset-0 grid place-items-center text-[15px] font-medium text-[var(--color-muted)]">
          Načítavam stranu…
        </p>
      )}

      {failed && (
        <div className="absolute inset-0 z-[4] grid place-items-center bg-white p-6 text-center">
          <div>
            <p className="text-[15px] font-semibold text-[var(--color-navy)]">Stranu {page} sa nepodarilo zobraziť.</p>
            <button
              type="button"
              onClick={() => session?.retryPage(page)}
              className="mt-4 inline-flex h-11 items-center rounded-full bg-[var(--color-navy)] px-5 text-[15px] font-semibold text-white transition-colors hover:bg-[var(--color-blue)]"
            >
              Skúsiť znova
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function LinkHotspot({ link, onNavigate }: { link: PdfLink; onNavigate: (page: number) => void }) {
  const style = {
    left: `${link.rect.left * 100}%`,
    top: `${link.rect.top * 100}%`,
    width: `${link.rect.width * 100}%`,
    height: `${link.rect.height * 100}%`,
  };
  const className =
    "absolute z-[3] rounded-[3px] transition-colors hover:bg-[rgba(0,111,232,.14)] focus-visible:bg-[rgba(0,111,232,.14)]";

  if (link.kind === "internal") {
    return (
      <button type="button" style={style} className={className} onClick={() => onNavigate(link.page)}>
        <span className="sr-only">Prejsť na stranu {link.page}</span>
      </button>
    );
  }
  const external = isExternalHref(link.href);
  return (
    <a
      href={link.href}
      style={style}
      className={className}
      {...(external ? { target: "_blank", rel: "noopener noreferrer nofollow" } : {})}
    >
      <span className="sr-only">
        Odkaz v časopise: {link.label}
        {external ? " (otvorí sa v novom okne)" : ""}
      </span>
    </a>
  );
}
