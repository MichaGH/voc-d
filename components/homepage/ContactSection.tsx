import Link from "next/link";
import { CONTACT, LINKS } from "@/constants";

export default function ContactSection() {
  return (
    <section id="kontakt" aria-labelledby="cta-nadpis" className="scroll-mt-[76px] px-5 pt-[clamp(88px,10vw,150px)] pb-[clamp(40px,4vw,56px)] md:px-8 xl:px-12">
      <div className="mx-auto grid max-w-[1304px] items-end gap-10 rounded-[32px] bg-[var(--color-cta)] p-[clamp(40px,6vw,88px)] text-white lg:grid-cols-2">
        <div>
          <h2 id="cta-nadpis" className="text-[clamp(36px,4.8vw,72px)] leading-[.98] font-bold tracking-[-.04em] text-balance">Buďte v ďalšom čísle.</h2>
          <p className="mt-5 max-w-[40ch] text-lg text-[var(--color-cta-copy)]">Inzercia, predplatné, publikácia alebo prihláška na vzdelávanie — ozvite sa nám.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={LINKS.email} className="inline-flex h-14 items-center rounded-full bg-white px-7 text-base font-semibold whitespace-nowrap text-[var(--color-navy)] no-underline hover:bg-[var(--color-navy)] hover:text-white">Napísať e-mail ↗</Link>
            <Link href={CONTACT.phoneHref} className="inline-flex h-14 items-center rounded-full border border-white/55 px-7 text-base font-semibold whitespace-nowrap text-white no-underline hover:bg-white/14 hover:text-white">{CONTACT.phoneDisplay}</Link>
          </div>
        </div>
        <address className="justify-self-start text-base leading-[1.7] not-italic text-[var(--color-cta-copy)] lg:justify-self-end">
          {CONTACT.company}<br />{CONTACT.street}<br />{CONTACT.city}
        </address>
      </div>
    </section>
  );
}
