import Image from "next/image";
import Link from "next/link";
import { LINKS } from "@/constants";

export default function HeroSection() {
  return (
    <section
      aria-labelledby="hero-nadpis"
      className="relative flex flex-1 flex-col justify-center overflow-hidden bg-[var(--color-navy)] pt-[76px] text-white"
    >
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster="/images/hero.jpg"
        aria-hidden="true"
        className="absolute inset-0 size-full object-cover"
      >
        <source src="/videos/herovideo.mp4" type="video/mp4" />
      </video>
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(4,23,58,.62)_0%,rgba(4,23,58,.24)_30%,rgba(4,23,58,.43)_60%,rgba(4,23,58,.92)_100%)]" />

      <div className="pointer-events-none relative mx-auto flex w-full max-w-[1400px] flex-wrap items-center justify-between gap-x-16 gap-y-10 px-5 py-[clamp(40px,5vw,64px)] md:px-8 xl:px-12">
        <div className="pointer-events-auto min-w-0 flex-[1_1_560px] max-w-[860px]">
          <h1
            id="hero-nadpis"
            className="max-w-[9em] text-[clamp(44px,6vw,92px)] leading-[.98] font-bold tracking-[-.04em] text-balance"
          >
            Odborný svet budov na jednom mieste.
          </h1>
          <p className="mt-6 max-w-[44ch] text-[clamp(17px,1.5vw,21px)] leading-normal text-[var(--color-hero-copy)] text-pretty">
            Časopisy, publikácie a odborné vzdelávanie pre správcov budov a profesionálov v oblasti technických zariadení budov.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="#casopisy" className="inline-flex h-14 items-center gap-3 rounded-full bg-white px-7 text-base font-semibold whitespace-nowrap text-[var(--color-navy)] no-underline hover:bg-[var(--color-cyan)] hover:text-[var(--color-navy)]">
              Objaviť časopisy <span aria-hidden="true">↓</span>
            </Link>
            <Link href={LINKS.about} className="inline-flex h-14 items-center rounded-full border border-white/45 px-7 text-base font-semibold whitespace-nowrap text-white no-underline hover:bg-white/12 hover:text-white">
              Spoznať VOC.SK
            </Link>
          </div>
          <div className="mt-9 flex flex-wrap items-center gap-x-4 gap-y-3">
            <div className="flex" aria-hidden="true">
              {[
                ["MK", "bg-[var(--color-slate-blue)]", "z-30"],
                ["JH", "bg-[var(--color-green)]", "z-20 -ml-3"],
                ["PS", "bg-[var(--color-teal)]", "z-10 -ml-3"],
              ].map(([initials, color, position]) => (
                <span key={initials} className={`relative grid size-11 place-items-center overflow-hidden rounded-full border-2 border-[var(--color-navy)] text-sm font-semibold text-white ${color} ${position}`}>
                  {initials}
                </span>
              ))}
            </div>
            <div>
              <p role="img" aria-label="Hodnotenie 5 z 5" className="text-base leading-none tracking-[2px] text-[var(--color-gold)]">★★★★★</p>
              <p className="mt-1.5 text-[15px] leading-[1.3] text-[var(--color-hero-copy)]">
                Číta nás viac ako <strong className="font-semibold text-white">10 000</strong> odborníkov z praxe
              </p>
            </div>
          </div>
        </div>

        <div role="group" aria-label="Aktuálne čísla" className="pointer-events-auto relative hidden aspect-[1/1.02] w-[clamp(320px,31vw,486px)] shrink-0 lg:block">
          <Link href={LINKS.sbd} aria-label="Správca bytových domov 2/2026" className="absolute top-0 left-0 z-10 block w-[60%] -rotate-[8deg] transition-transform duration-200 hover:-translate-y-2 hover:-rotate-[5deg]">
            <Image src="/images/sbd-2-2026.jpg" alt="" width={595} height={842} priority className="aspect-[595/842] h-auto w-full rounded-md brightness-90 shadow-[0_40px_70px_-26px_rgba(0,0,0,.75)]" />
          </Link>
          <Link href={LINKS.pvk} aria-label="Plynár – vodár – kúrenár + klimatizácia 4/2026" className="absolute right-0 bottom-0 z-20 block w-[62%] rotate-[4deg] transition-transform duration-200 hover:-translate-y-2 hover:rotate-[2deg]">
            <Image src="/images/pvk-4-2026.jpg" alt="" width={595} height={842} priority className="aspect-[595/842] h-auto w-full rounded-md shadow-[0_50px_90px_-30px_rgba(0,0,0,.85)]" />
          </Link>
        </div>
      </div>
    </section>
  );
}
