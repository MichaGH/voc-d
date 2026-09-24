import Image from "next/image";
import Link from "next/link";
import { educationCards } from "@/data/homepage";

export default function EducationSection() {
  return (
    <section id="vzdelavanie" aria-labelledby="vzdel-nadpis" className="scroll-mt-[76px] px-5 pt-[clamp(88px,10vw,150px)] md:px-8 xl:px-12">
      <div className="mx-auto max-w-[1400px]">
        <p className="text-[15px] font-semibold text-[var(--color-blue)]">Vzdelávanie</p>
        <h2 id="vzdel-nadpis" className="mt-3 max-w-[16ch] text-[clamp(36px,4.4vw,64px)] leading-none font-bold tracking-[-.035em]">Stretnite sa s odborníkmi naživo.</h2>
        <div className="mt-[clamp(40px,5vw,64px)] grid gap-4 lg:grid-cols-2">
          {educationCards.map((card) => (
            <Link key={card.title} href={card.href} className="flex flex-col overflow-hidden rounded-3xl bg-[var(--color-surface)] text-[var(--color-navy)] no-underline transition-colors hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-navy)]">
              <div className="relative aspect-video bg-[var(--color-line)]">
                <Image src={card.image} alt={card.alt} fill sizes="(max-width: 1024px) 100vw, 50vw" className={card.imageClass} />
              </div>
              <div className="flex flex-1 items-end justify-between gap-6 p-[clamp(24px,3vw,40px)]">
                <div>
                  <p className={`text-[15px] font-semibold ${card.eyebrowClass}`}>{card.eyebrow}</p>
                  <h3 className="mt-2 text-[clamp(24px,2.2vw,32px)] leading-[1.1] font-bold tracking-[-.02em]">{card.title}</h3>
                  <p className="mt-2.5 text-base text-[var(--color-copy)]">{card.description}</p>
                </div>
                <span aria-hidden="true" className="grid size-[52px] shrink-0 place-items-center rounded-full bg-[var(--color-navy)] text-xl text-white">↗</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
