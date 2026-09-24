import Image from "next/image";
import Link from "next/link";
import { LINKS } from "@/constants";
import { advertisingChannels, advertisingServices } from "@/data/homepage";

function ServiceIcon({ name }: { name: string }) {
  const common = { width: 26, height: 26, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  if (name === "document") return <svg {...common}><path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H15l5 5v9.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5z"/><path d="M15 4v5h5"/><path d="M8 13h8M8 16.5h5"/></svg>;
  if (name === "design") return <svg {...common}><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>;
  if (name === "online") return <svg {...common}><rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8M12 17v4"/><path d="M7 9h6M7 12h10"/></svg>;
  return <svg {...common}><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>;
}

export default function AdvertisingSection() {
  return (
    <section id="inzercia" aria-labelledby="inz-nadpis" className="mt-[clamp(88px,10vw,150px)] scroll-mt-[76px] bg-[var(--color-surface)]">
      <div className="mx-auto grid max-w-[1400px] items-start gap-x-[clamp(48px,7vw,120px)] gap-y-12 px-5 pt-[clamp(80px,9vw,140px)] pb-[clamp(56px,6vw,88px)] md:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] xl:px-12">
        <div className="lg:sticky lg:top-[108px]">
          <p className="text-[15px] font-semibold text-[var(--color-blue)]">Inzercia</p>
          <h2 id="inz-nadpis" className="mt-3 text-[clamp(36px,4.2vw,60px)] leading-none font-bold tracking-[-.035em] text-balance">Oslovte odborníkov, ktorí budovy spravujú, navrhujú a udržiavajú.</h2>
          <p className="mt-[22px] max-w-[44ch] text-lg text-[var(--color-copy)] text-pretty">Viac ako 20 rokov prinášame recenzované informácie správcom budov a profesiám TZB. Vašu firmu predstavíme v tlači aj online — presne tým, ktorí o technike budov rozhodujú.</p>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link href={LINKS.advertise} className="inline-flex h-14 items-center rounded-full bg-[var(--color-navy)] px-7 text-base font-semibold whitespace-nowrap text-white no-underline hover:bg-[var(--color-blue)] hover:text-white">Dohodnúť inzerciu ↗</Link>
            <Link href={LINKS.services} className="text-base font-semibold text-[var(--color-blue)]">Všetky služby →</Link>
          </div>
        </div>

        <div>
          <h3 className="text-[15px] font-semibold text-[var(--color-muted)]">Kde vás uvidia</h3>
          <ul className="mt-2 list-none border-t border-[var(--color-line)]">
            {advertisingChannels.map((channel) => (
              <li key={channel.title} className="border-b border-[var(--color-line)]">
                <Link href={channel.href} className="grid grid-cols-[56px_minmax(0,1fr)_auto] items-center gap-4 py-[22px] text-[var(--color-navy)] no-underline hover:text-[var(--color-blue)] sm:grid-cols-[64px_minmax(0,1fr)_auto] sm:gap-5">
                  <Image src={channel.image} alt="" width={64} height={90} className="h-[84px] w-14 rounded-sm bg-white object-cover shadow-[0_12px_22px_-14px_rgba(4,23,58,.45)] sm:h-[90px] sm:w-16" />
                  <span className="min-w-0">
                    <span className="block text-[clamp(19px,1.6vw,22px)] leading-tight font-bold tracking-[-.015em]">{channel.title}</span>
                    <span className="mt-1 block text-[15px] text-[var(--color-copy)]">{channel.audience}</span>
                    <span className="mt-2 block text-sm font-medium text-[var(--color-muted)]">{channel.formats}</span>
                  </span>
                  <span aria-hidden="true" className="grid size-11 place-items-center rounded-full border border-[var(--color-line-dark)] text-[17px]">{channel.arrow}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-5 pb-[clamp(80px,9vw,140px)] md:px-8 xl:px-12">
        <h3 className="text-[15px] font-semibold text-[var(--color-muted)]">Ako vám pomôžeme</h3>
        <ul className="mt-5 grid list-none gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {advertisingServices.map((service) => (
            <li key={service.title} className="flex flex-col gap-7 rounded-3xl bg-white p-[clamp(24px,2.4vw,32px)] shadow-[0_1px_0_rgba(4,23,58,.04)]">
              <span className="grid size-14 place-items-center rounded-2xl bg-[var(--color-blue-wash)] text-[var(--color-blue)]"><ServiceIcon name={service.icon} /></span>
              <div>
                <h3 className="text-[19px] leading-tight font-bold tracking-[-.015em]">{service.title}</h3>
                <p className="mt-2 text-[15px] text-[var(--color-copy)] text-pretty">{service.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
