"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { Fragment, useRef } from "react";
import type { ContentImage } from "@/types/content";

gsap.registerPlugin(useGSAP, ScrollTrigger);

interface CinematicStatementProps {
  id: string;
  image: ContentImage;
  text: string;
  /** Part of `text` shown in the accent colour. */
  highlight?: string;
}

/** Splits the statement into words and marks those inside the highlighted phrase. */
function splitWords(text: string, highlight?: string) {
  const highlightStart = highlight ? text.indexOf(highlight) : -1;
  const highlightEnd = highlightStart >= 0 && highlight ? highlightStart + highlight.length : -1;
  const words: { word: string; accent: boolean }[] = [];
  let cursor = 0;
  for (const word of text.split(" ")) {
    const start = text.indexOf(word, cursor);
    cursor = start + word.length;
    words.push({ word, accent: highlightStart >= 0 && start >= highlightStart && start < highlightEnd });
  }
  return words;
}

/**
 * Full-screen photographic statement. While it crosses the viewport the photo
 * slowly settles and the sentence brightens word by word, tied to scroll.
 * Without JavaScript or with reduced motion it is a static, fully legible scene.
 */
export default function CinematicStatement({ id, image, text, highlight }: CinematicStatementProps) {
  const rootRef = useRef<HTMLElement>(null);

  const words = splitWords(text, highlight);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          q("[data-cine-media]"),
          { scale: 1.14, yPercent: -7 },
          { scale: 1, yPercent: 7, ease: "none", scrollTrigger: { trigger: root, start: "top bottom", end: "bottom top", scrub: true } },
        );
        gsap.fromTo(
          q("[data-word]"),
          { opacity: 0.18 },
          {
            opacity: 1,
            ease: "none",
            stagger: 0.1,
            scrollTrigger: { trigger: q("[data-cine-text]")[0], start: "top 82%", end: "bottom 48%", scrub: 0.6 },
          },
        );
      });
      return () => mm.revert();
    },
    { scope: rootRef },
  );

  return (
    <section
      ref={rootRef}
      aria-labelledby={id}
      className="relative isolate flex min-h-[100svh] items-center overflow-hidden bg-[var(--color-navy)] text-white"
    >
      <div data-cine-media className="absolute inset-x-0 -top-[12%] -bottom-[12%] -z-10 will-change-transform">
        <Image src={image.src} alt={image.alt} fill sizes="100vw" className="object-cover" />
      </div>
      <div className="absolute inset-0 -z-10 bg-[rgba(4,23,58,.66)]" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(4,23,58,.85)_0%,rgba(4,23,58,0)_28%,rgba(4,23,58,0)_72%,rgba(4,23,58,.85)_100%)]" />

      <div className="w-full px-5 py-[clamp(96px,12vw,180px)] md:px-8 xl:px-12">
        <h2
          id={id}
          data-cine-text
          className="mx-auto max-w-[17ch] text-center text-[clamp(36px,5.4vw,88px)] leading-[1.04] font-bold tracking-[-.04em] text-balance"
        >
          {words.map(({ word, accent }, index) => (
            <Fragment key={`${word}-${index}`}>
              <span data-word className={accent ? "text-[var(--color-blue-light)]" : undefined}>
                {word}
              </span>
              {index < words.length - 1 ? " " : null}
            </Fragment>
          ))}
        </h2>
      </div>
    </section>
  );
}
