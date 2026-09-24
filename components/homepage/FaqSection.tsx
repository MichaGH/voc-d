"use client";

import Link from "next/link";
import { useState } from "react";
import { LINKS } from "@/constants";
import { faqs } from "@/data/homepage";

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section aria-labelledby="faq-nadpis" className="px-5 pt-[clamp(88px,10vw,150px)] md:px-8 xl:px-12">
      <div className="mx-auto grid max-w-[1400px] gap-x-[clamp(40px,6vw,96px)] gap-y-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]">
        <div>
          <h2 id="faq-nadpis" className="text-[clamp(36px,4.4vw,64px)] leading-none font-bold tracking-[-.035em]">Časté otázky</h2>
          <p className="mt-[18px] text-[17px] text-[var(--color-copy)]">Nenašli ste odpoveď? Napíšte na <Link href={LINKS.email} className="font-semibold text-[var(--color-blue)]">voc@voc.sk</Link>.</p>
        </div>
        <div className="border-t border-[var(--color-line-light)]">
          {faqs.map((faq, index) => {
            const open = openIndex === index;
            return (
              <div key={faq.question} className="border-b border-[var(--color-line-light)]">
                <button type="button" aria-expanded={open} aria-controls={`faq-answer-${index}`} onClick={() => setOpenIndex(open ? -1 : index)} className="flex w-full cursor-pointer items-center justify-between gap-6 border-0 bg-transparent py-6 text-left text-[clamp(18px,1.5vw,21px)] leading-[1.35] font-semibold text-[var(--color-navy)]">
                  <span>{faq.question}</span>
                  <span aria-hidden="true" className={`grid size-9 shrink-0 place-items-center rounded-full text-xl font-medium ${open ? "bg-[var(--color-navy)] text-white" : "bg-[var(--color-surface)] text-[var(--color-navy)]"}`}>{open ? "−" : "+"}</span>
                </button>
                {open && <p id={`faq-answer-${index}`} className="pr-0 pb-[26px] text-[17px] text-[var(--color-copy)] text-pretty sm:pr-16">{faq.answer}</p>}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
