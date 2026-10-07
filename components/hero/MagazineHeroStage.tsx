"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type KeyboardEvent } from "react";
import { magazineAccent } from "@/components/magazine/identity";
import { bindDashes } from "@/lib/format/text";
import type { ContentImage, ContentVideo, MagazineKey } from "@/types/content";

gsap.registerPlugin(useGSAP);

export interface HeroSlide {
  key: MagazineKey;
  title: string;
  shortTitle: string;
  headline: string;
  summary: string;
  poster: ContentImage;
  video?: ContentVideo;
  href: string;
  editionsHref: string;
  latest?: { label: string; cover: ContentImage };
}

/** Scale of the non-selected cover; hit areas never change size. */
const INACTIVE_SCALE = 0.8;
const INACTIVE_DIM = 0.42;
/** Short intentional-hover delay so passing the pointer over a cover does not switch. */
const HOVER_INTENT_MS = 140;

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(callback: () => void) {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}

function prefersReducedMotion() {
  return window.matchMedia(REDUCED_MOTION).matches;
}

function prefersSavedData() {
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  return Boolean(connection?.saveData);
}

export default function MagazineHeroStage({ slides }: { slides: HeroSlide[] }) {
  const rootRef = useRef<HTMLElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const hoverTimer = useRef<number | undefined>(undefined);
  const firstRun = useRef(true);

  const [active, setActive] = useState(0);
  const [inView, setInView] = useState(true);
  const [pageVisible, setPageVisible] = useState(true);
  /** null = no explicit visitor choice yet; reduced motion / data saver then start paused. */
  const [userPaused, setUserPaused] = useState<boolean | null>(null);
  const [readyVideos, setReadyVideos] = useState<Record<number, boolean>>({});
  const [failedVideos, setFailedVideos] = useState<Record<number, boolean>>({});
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);

  const reducedMotion = useSyncExternalStore(subscribeReducedMotion, prefersReducedMotion, () => false);
  const savedData = useSyncExternalStore(() => () => {}, prefersSavedData, () => false);
  const wantsPlayback = userPaused === null ? !reducedMotion && !savedData : !userPaused;

  const activeSlide = slides[active];
  const activeHasVideo = Boolean(activeSlide.video) && !failedVideos[active];

  const select = useCallback((index: number) => {
    window.clearTimeout(hoverTimer.current);
    setActive(index);
  }, []);

  /* ---------------------------------------------------------------- */
  /* Motion: latest selection always wins; superseded tweens are killed */
  /* ---------------------------------------------------------------- */
  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const q = gsap.utils.selector(root);
      const media = q("[data-hero-media]");
      const panels = q("[data-hero-panel]");
      const covers = q("[data-hero-cover]");
      const dims = q("[data-hero-dim]");
      const lines = q("[data-hero-line]");
      const reduce = window.matchMedia(REDUCED_MOTION).matches;
      const isFirstRun = firstRun.current;
      firstRun.current = false;

      gsap.killTweensOf([...media, ...panels, ...covers, ...dims, ...lines, ...q("[data-hero-reveal]")]);

      if (isFirstRun || reduce) {
        media.forEach((el, i) => gsap.set(el, { autoAlpha: i === active ? 1 : 0, zIndex: i === active ? 2 : 1, scale: 1 }));
        panels.forEach((el, i) => gsap.set(el, { autoAlpha: i === active ? 1 : 0, y: 0 }));
        gsap.set(q("[data-hero-reveal]"), { autoAlpha: 1, y: 0 });
        covers.forEach((el, i) => gsap.set(el, { scale: i === active ? 1 : INACTIVE_SCALE }));
        dims.forEach((el, i) => gsap.set(el, { opacity: i === active ? 0 : INACTIVE_DIM }));
        lines.forEach((el, i) => gsap.set(el, { scaleX: i === active ? 1 : 0 }));

        // A quiet settle of the opening image — content is readable from the first frame.
        if (isFirstRun && !reduce) {
          gsap.fromTo(media[active], { scale: 1.06 }, { scale: 1, duration: 2.4, ease: "power2.out" });
        }
        return;
      }

      media.forEach((el, i) => {
        if (i === active) {
          const wasHidden = Number(gsap.getProperty(el, "opacity")) < 0.02;
          const isStill = !slides[i].video;
          gsap.set(el, { zIndex: 2 });
          if (wasHidden) gsap.set(el, { scale: isStill ? 1.08 : 1.05 });
          gsap.to(el, { autoAlpha: 1, duration: 0.9, ease: "power2.out" });
          // Footage settles quickly; a still poster keeps a slow, barely visible drift.
          gsap.to(el, { scale: 1, duration: isStill ? 9 : 1.6, ease: isStill ? "power1.out" : "power3.out" });
        } else {
          gsap.set(el, { zIndex: 1 });
          gsap.to(el, { autoAlpha: 0, duration: 0.25, delay: 0.8, ease: "none" });
        }
      });

      panels.forEach((panel, i) => {
        const reveals = panel.querySelectorAll("[data-hero-reveal]");
        if (i === active) {
          gsap.set(panel, { autoAlpha: 1, y: 0 });
          gsap.fromTo(
            reveals,
            { autoAlpha: 0, y: 26 },
            { autoAlpha: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.07, delay: 0.22 },
          );
        } else {
          gsap.to(panel, { autoAlpha: 0, y: -14, duration: 0.26, ease: "power2.in" });
        }
      });

      covers.forEach((el, i) =>
        gsap.to(el, { scale: i === active ? 1 : INACTIVE_SCALE, duration: 0.9, ease: "power3.out" }),
      );
      dims.forEach((el, i) => gsap.to(el, { opacity: i === active ? 0 : INACTIVE_DIM, duration: 0.6, ease: "power2.out" }));
      lines.forEach((el, i) => gsap.to(el, { scaleX: i === active ? 1 : 0, duration: 0.7, ease: "power3.inOut" }));
    },
    { dependencies: [active], scope: rootRef },
  );

  /* ---------------------------------------------------------------- */
  /* Video: only the active clip loads/plays; others pause after fade  */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    const timers: number[] = [];
    // Read live preferences here: during hydration the store still reports the server snapshot,
    // and a reduced-motion or data-saver visitor must never trigger a video download.
    const allowed = userPaused === null ? wantsPlayback && !prefersReducedMotion() && !prefersSavedData() : !userPaused;
    videoRefs.current.forEach((video, i) => {
      const source = slides[i]?.video;
      if (!video || !source) return;
      const shouldPlay = i === active && allowed && inView && pageVisible && !failedVideos[i];
      if (shouldPlay) {
        // Assign the source only on deliberate activation — never download every clip up front.
        if (!video.getAttribute("src")) video.src = source.src;
        video.play().catch(() => {
          /* Autoplay blocked: the poster stays visible and the play control remains available. */
        });
      } else if (i !== active) {
        timers.push(window.setTimeout(() => video.pause(), 1100));
      } else {
        video.pause();
      }
    });
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [active, wantsPlayback, userPaused, inView, pageVisible, failedVideos, slides]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.05 });
    observer.observe(root);
    const onVisibility = () => setPageVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  useEffect(
    () => () => {
      window.clearTimeout(hoverTimer.current);
      // A remount (e.g. React StrictMode) should apply the settled state again, not animate into it.
      firstRun.current = true;
    },
    [],
  );

  const onTabKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const last = slides.length - 1;
    const next =
      event.key === "ArrowRight" || event.key === "ArrowDown" ? (active === last ? 0 : active + 1)
      : event.key === "ArrowLeft" || event.key === "ArrowUp" ? (active === 0 ? last : active - 1)
      : event.key === "Home" ? 0
      : event.key === "End" ? last
      : null;
    if (next === null) return;
    event.preventDefault();
    select(next);
    tabRefs.current[next]?.focus();
  };

  const isPlaying = playingIndex === active;

  return (
    <section
      ref={rootRef}
      aria-labelledby="hero-nadpis"
      className="relative isolate flex flex-1 flex-col overflow-hidden bg-[var(--color-navy)] pt-[76px] text-white"
    >
      {/* Media stage */}
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        {slides.map((slide, i) => (
          <div
            key={slide.key}
            data-hero-media
            className="absolute inset-0 will-change-[opacity,transform]"
            style={i === 0 ? undefined : { opacity: 0, visibility: "hidden" }}
          >
            <Image
              src={slide.poster.src}
              alt=""
              fill
              sizes="100vw"
              preload={i === 0}
              className="object-cover"
            />
            {slide.video && (
              <video
                ref={(element) => {
                  videoRefs.current[i] = element;
                }}
                muted
                loop
                playsInline
                preload="none"
                onPlaying={() => {
                  setReadyVideos((state) => (state[i] ? state : { ...state, [i]: true }));
                  setPlayingIndex(i);
                }}
                onPause={() => setPlayingIndex((current) => (current === i ? null : current))}
                onError={() => setFailedVideos((state) => ({ ...state, [i]: true }))}
                className={`absolute inset-0 size-full object-cover transition-opacity duration-700 ${
                  readyVideos[i] && !failedVideos[i] ? "opacity-100" : "opacity-0"
                }`}
              />
            )}
          </div>
        ))}
        <div className="absolute inset-0 z-10 bg-[linear-gradient(180deg,rgba(4,23,58,.66)_0%,rgba(4,23,58,.22)_30%,rgba(4,23,58,.5)_62%,rgba(4,23,58,.94)_100%)]" />
        <div className="absolute inset-0 z-10 bg-[linear-gradient(90deg,rgba(4,23,58,.7)_0%,rgba(4,23,58,.3)_50%,rgba(4,23,58,0)_80%)]" />
      </div>

      {/*
        Mobile: kicker → compact selector row → copy, so both magazines are visible on the first screen.
        Desktop: copy on the left, covers on the right.
      */}
      <div className="relative mx-auto grid w-full max-w-[1400px] flex-1 content-center gap-x-16 gap-y-7 px-5 py-[clamp(32px,5vw,72px)] [grid-template-areas:'kicker'_'tabs'_'panel'] md:px-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-y-6 lg:[grid-template-areas:'kicker_tabs'_'panel_tabs'] xl:px-12">
        <h1 id="hero-nadpis" className="flex items-center gap-3 self-end text-[15px] leading-snug font-semibold text-white/80 [grid-area:kicker]">
            <span
              aria-hidden="true"
              className={`h-0.5 w-7 shrink-0 rounded-full transition-colors duration-500 ${magazineAccent[activeSlide.key].bgOnDark}`}
            />
            Odborné časopisy o správe a technike budov
        </h1>

        {/* Magazine selectors — the covers themselves are the navigation */}
        <div
          role="tablist"
          aria-label="Vyberte časopis"
          onKeyDown={onTabKeyDown}
          className="flex items-end gap-4 [grid-area:tabs] sm:gap-6 lg:gap-[clamp(18px,2.4vw,36px)] lg:self-center"
        >
          {slides.map((slide, i) => {
            const selected = i === active;
            return (
              <button
                key={slide.key}
                ref={(element) => {
                  tabRefs.current[i] = element;
                }}
                id={`hero-tab-${slide.key}`}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={`hero-panel-${slide.key}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => select(i)}
                onPointerEnter={(event) => {
                  if (event.pointerType !== "mouse" || selected) return;
                  window.clearTimeout(hoverTimer.current);
                  hoverTimer.current = window.setTimeout(() => select(i), HOVER_INTENT_MS);
                }}
                onPointerLeave={() => window.clearTimeout(hoverTimer.current)}
                className="group flex min-w-0 flex-1 cursor-pointer items-end gap-3 rounded-lg border-0 bg-transparent p-0 text-left text-white sm:flex-none lg:w-[clamp(176px,15vw,232px)] lg:flex-col lg:items-stretch lg:gap-0"
              >
                <span className="relative block aspect-[595/842] w-[clamp(64px,19vw,96px)] shrink-0 lg:w-full">
                  <span
                    data-hero-cover
                    className="absolute inset-0 origin-bottom will-change-transform"
                    style={i === 0 ? undefined : { transform: `scale(${INACTIVE_SCALE})` }}
                  >
                    {slide.latest && (
                      <Image
                        src={slide.latest.cover.src}
                        alt=""
                        width={slide.latest.cover.width}
                        height={slide.latest.cover.height}
                        sizes="(min-width: 1024px) 232px, 96px"
                        fetchPriority={i === 0 ? "high" : "auto"}
                        loading="eager"
                        className="size-full rounded-md object-cover shadow-[0_40px_70px_-26px_rgba(0,0,0,.8)]"
                      />
                    )}
                    <span
                      data-hero-dim
                      className="absolute inset-0 rounded-md bg-[var(--color-navy)]"
                      style={{ opacity: i === 0 ? 0 : INACTIVE_DIM }}
                    />
                  </span>
                </span>
                <span className="block min-w-0 flex-1 pb-0.5 lg:mt-5 lg:w-full lg:flex-none lg:pb-0">
                  <span aria-hidden="true" className="relative block h-0.5 w-full overflow-hidden rounded-full bg-white/20">
                    <span
                      data-hero-line
                      className={`absolute inset-0 origin-left ${magazineAccent[slide.key].bgOnDark}`}
                      style={i === 0 ? undefined : { transform: "scaleX(0)" }}
                    />
                  </span>
                  <span
                    className={`mt-2.5 block text-sm leading-snug font-semibold text-balance sm:text-[15px] lg:mt-3 transition-colors duration-300 ${
                      selected ? "text-white" : "text-white/65 group-hover:text-white"
                    }`}
                  >
                    {bindDashes(slide.shortTitle)}
                  </span>
                  {slide.latest && (
                    <span className="mt-0.5 block text-[13px] text-white/55 sm:text-sm">
                      <span className="sr-only sm:not-sr-only">Aktuálne číslo </span>
                      {slide.latest.label}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>

        <div className="grid min-w-0 self-start [grid-area:panel]">
            {slides.map((slide, i) => (
              <div
                key={slide.key}
                id={`hero-panel-${slide.key}`}
                role="tabpanel"
                aria-labelledby={`hero-tab-${slide.key}`}
                inert={i !== active}
                data-hero-panel
                className="[grid-area:1/1]"
                style={i === 0 ? undefined : { opacity: 0, visibility: "hidden" }}
              >
                <p
                  data-hero-reveal
                  className="max-w-[11em] text-[clamp(42px,5.8vw,92px)] leading-[.98] font-bold tracking-[-.04em] text-balance"
                >
                  {slide.headline}
                </p>
                <p
                  data-hero-reveal
                  className="mt-6 max-w-[46ch] text-[clamp(17px,1.4vw,20px)] leading-normal text-[var(--color-hero-copy)] text-pretty"
                >
                  {slide.summary}
                </p>
                <div data-hero-reveal className="mt-9 flex flex-wrap gap-3">
                  <Link
                    href={slide.href}
                    className="inline-flex h-14 items-center gap-3 rounded-full bg-white px-7 text-base font-semibold whitespace-nowrap text-[var(--color-navy)] no-underline transition-colors hover:bg-[var(--color-cyan)] hover:text-[var(--color-navy)]"
                  >
                    Otvoriť časopis<span className="sr-only"> {slide.title}</span> <span aria-hidden="true">→</span>
                  </Link>
                  <Link
                    href={slide.editionsHref}
                    className="inline-flex h-14 items-center rounded-full border border-white/45 px-7 text-base font-semibold whitespace-nowrap text-white no-underline transition-colors hover:bg-white/12 hover:text-white"
                  >
                    Všetky vydania<span className="sr-only"> časopisu {slide.title}</span>
                  </Link>
                </div>
              </div>
            ))}
        </div>
      </div>

      {activeHasVideo && (
        <button
          type="button"
          onClick={() => setUserPaused(isPlaying)}
          aria-label={isPlaying ? "Pozastaviť video v pozadí" : "Prehrať video v pozadí"}
          className="absolute right-5 bottom-5 z-10 grid size-10 cursor-pointer place-items-center rounded-full border border-white/25 bg-[rgba(4,23,58,.35)] text-white backdrop-blur-sm transition-colors hover:bg-white/15 md:right-8 xl:right-12"
        >
          {isPlaying ? (
            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" fill="currentColor">
              <rect x="2" y="1.5" width="2.6" height="9" rx=".6" />
              <rect x="7.4" y="1.5" width="2.6" height="9" rx=".6" />
            </svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" fill="currentColor">
              <path d="M3 1.8v8.4a.6.6 0 0 0 .9.5l6.8-4.2a.6.6 0 0 0 0-1L3.9 1.3a.6.6 0 0 0-.9.5z" />
            </svg>
          )}
        </button>
      )}
    </section>
  );
}
