import Image from "next/image";
import Link from "next/link";
import { LINKS } from "@/constants";

export default function AboutSection() {
  return (
    <section aria-labelledby="onas-veta" className="relative mt-[clamp(112px,12vw,176px)] overflow-hidden bg-[var(--color-navy)] text-white">
      <Image src="/images/about.jpg" alt="" fill sizes="100vw" className="object-cover grayscale" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(4,23,58,.95)_0%,rgba(4,23,58,.72)_60%,rgba(4,23,58,.5)_100%)]" />
      <div className="relative mx-auto max-w-[1400px] px-5 py-[clamp(112px,13vw,200px)] md:px-8 xl:px-12">
        <p id="onas-veta" className="max-w-[22em] text-[clamp(30px,3.9vw,62px)] leading-[1.16] tracking-[-.03em] text-[var(--color-about-copy)] text-pretty">
          Viac ako <strong className="font-bold text-white">20 rokov</strong> prinášame správcom budov a profesiám TZB <strong className="font-bold text-[var(--color-blue-light)]">overené odborné informácie</strong> — recenzované, z praxe a vždy <strong className="font-bold text-white">o krok pred zmenami</strong> v legislatíve a technológiách.
        </p>
        <Link href={LINKS.about} className="mt-[clamp(40px,5vw,64px)] inline-flex h-[54px] items-center gap-3 rounded-full border border-white/40 px-[26px] text-base font-semibold text-white no-underline hover:bg-white hover:text-[var(--color-navy)]">
          Spoznať vydavateľstvo →
        </Link>
      </div>
    </section>
  );
}
