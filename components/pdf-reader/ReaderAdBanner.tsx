"use client";

import { getImageProps } from "next/image";
import { useCallback, useState } from "react";
import { mailto } from "@/constants";
import { isExternalHref } from "@/lib/url/safe-href";
import type { ReaderAd, ReaderAdCreative } from "@/types/content";

/**
 * Slot geometry is a shared layout setting, never derived from the artwork:
 * desktop leaderboard 970×90, mobile 320×100 (below 640px). Paid, fallback
 * and house states all use it, so a failing image never moves the reader.
 * Artwork is fitted without cropping.
 */
const MOBILE_QUERY = "(max-width: 639px)";
const slot = "relative mx-auto w-full max-w-[970px] overflow-hidden rounded-[14px] aspect-[320/100] sm:aspect-[970/90]";

interface ReaderAdBannerProps {
  ad: ReaderAd;
  magazineTitle: string;
}

export default function ReaderAdBanner({ ad, magazineTitle }: ReaderAdBannerProps) {
  // Index into the creative chain; an image error moves to the next entry, never back.
  const [index, setIndex] = useState(0);
  const creative = ad.creatives[index];
  const fail = useCallback(() => setIndex((current) => current + 1), []);

  return (
    <aside aria-label="Inzercia" className="w-full">
      <p className="mx-auto mb-1.5 max-w-[970px] text-[12px] leading-none font-semibold tracking-[.08em] text-[var(--color-steel)] uppercase">
        Inzercia
      </p>
      <div className={slot}>
        {creative ? <Creative key={index} creative={creative} onFail={fail} /> : <HouseBanner magazineTitle={magazineTitle} />}
      </div>
    </aside>
  );
}

function Creative({ creative, onFail }: { creative: ReaderAdCreative; onFail: () => void }) {
  const common = { alt: creative.image.alt, sizes: "(max-width: 639px) 100vw, 970px" };
  const { props: desktop } = getImageProps({ ...common, ...dimensions(creative.image), loading: "eager" });
  const mobileSrcSet = creative.mobileImage
    ? getImageProps({ ...common, ...dimensions(creative.mobileImage) }).props.srcSet
    : undefined;

  // An image that failed before hydration never fires onError; check on mount.
  const detectEarlyFailure = useCallback(
    (img: HTMLImageElement | null) => {
      if (img && img.complete && img.naturalWidth === 0) onFail();
    },
    [onFail],
  );

  const picture = (
    <picture>
      {mobileSrcSet && <source media={MOBILE_QUERY} srcSet={mobileSrcSet} sizes="100vw" />}
      {/* eslint-disable-next-line jsx-a11y/alt-text -- alt comes from getImageProps */}
      <img
        {...desktop}
        ref={detectEarlyFailure}
        onError={onFail}
        className="absolute inset-0 h-full w-full bg-[var(--color-surface)] object-contain"
      />
    </picture>
  );

  if (!creative.href) return picture;
  const external = isExternalHref(creative.href);
  return (
    <a
      href={creative.href}
      className="block h-full w-full"
      {...(external ? { target: "_blank", rel: "noopener noreferrer sponsored" } : {})}
    >
      {picture}
      {external && <span className="sr-only"> (otvorí sa v novom okne)</span>}
    </a>
  );
}

function dimensions(image: ReaderAdCreative["image"]) {
  return { src: image.src, width: image.width, height: image.height };
}

/** Built-in banner: text only, so it cannot fail to load. */
function HouseBanner({ magazineTitle }: { magazineTitle: string }) {
  return (
    <div className="flex h-full w-full flex-col justify-center gap-2 bg-[linear-gradient(120deg,var(--color-navy-light)_0%,var(--color-navy)_70%)] px-5 text-white sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-7">
      <p className="min-w-0 text-[15px] leading-tight font-semibold sm:text-[clamp(15px,1.6vw,19px)]">
        Inzerujte v časopise {magazineTitle}
        <span className="hidden font-normal text-[var(--color-card-copy)] lg:inline"> – váš banner uvidia čitatelia každého vydania.</span>
      </p>
      <a
        href={mailto(`Inzercia v online čítačke – ${magazineTitle}`)}
        className="inline-flex h-9 shrink-0 items-center gap-2 self-start rounded-full bg-white px-4 text-[14px] font-semibold text-[var(--color-navy)] no-underline transition-colors hover:bg-[var(--color-cyan)] hover:text-[var(--color-navy)] sm:self-auto sm:h-10"
      >
        Dohodnúť inzerciu <span aria-hidden="true">↗</span>
      </a>
    </div>
  );
}
