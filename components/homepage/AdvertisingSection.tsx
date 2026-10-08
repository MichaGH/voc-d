import Image from "next/image";
import Link from "next/link";
import { buttonPrimary, eyebrow, textLink } from "@/components/shared/ui";
import { LINKS } from "@/constants";
import { ROUTES } from "@/constants/routes";
import { advertisingChannels } from "@/data/advertising";

export default function AdvertisingSection() {
  return (
    <section id="inzercia" aria-labelledby="inz-nadpis" className="mt-[clamp(88px,10vw,150px)] scroll-mt-[76px] bg-[var(--color-surface)] px-5 md:px-8 xl:px-12">
      <div className="mx-auto grid max-w-[1400px] items-start gap-x-[clamp(48px,7vw,120px)] gap-y-12 py-[clamp(80px,9vw,140px)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <div className="lg:sticky lg:top-[108px]">
          <p className={eyebrow}>Inzercia</p>
          <h2 id="inz-nadpis" className="mt-4 text-[clamp(36px,4.2vw,60px)] leading-[1.02] font-bold tracking-[-.035em] text-balance">Oslovte odborníkov, ktorí budovy spravujú, navrhujú a udržiavajú.</h2>
          <p className="mt-[22px] max-w-[44ch] text-lg text-[var(--color-copy)] text-pretty">Vašu firmu predstavíme v tlači aj online — presne tým, ktorí o technike budov rozhodujú.</p>
          <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
            <Link href={ROUTES.advertising} className={`${buttonPrimary} h-14 px-7 text-base`}>
              Možnosti inzercie
            </Link>
            <Link href={LINKS.advertise} className={textLink}>
              Dohodnúť inzerciu ↗
            </Link>
          </div>
        </div>

        <ul aria-label="Kde vás uvidia" className="grid list-none gap-3">
          {advertisingChannels.map((channel) => (
            <li key={channel.key}>
              <Link
                href={`${ROUTES.advertising}#${channel.key}`}
                className="group grid grid-cols-[56px_minmax(0,1fr)_auto] items-center gap-4 rounded-[24px] bg-white p-4 pr-5 text-[var(--color-navy)] no-underline transition-shadow hover:shadow-[0_18px_36px_-24px_rgba(4,23,58,.45)] hover:text-[var(--color-navy)] sm:grid-cols-[64px_minmax(0,1fr)_auto] sm:gap-5 sm:p-5"
              >
                <Image src={channel.image.src} alt="" width={64} height={90} className="h-[84px] w-14 rounded-[3px] bg-white object-cover shadow-[0_12px_22px_-14px_rgba(4,23,58,.45)] sm:h-[90px] sm:w-16" />
                <span className="min-w-0">
                  <span className="block text-[clamp(19px,1.6vw,22px)] leading-tight font-bold tracking-[-.015em]">{channel.title}</span>
                  <span className="mt-1.5 block text-[15px] text-[var(--color-copy)]">{channel.audience}</span>
                </span>
                <span aria-hidden="true" className="grid size-11 place-items-center rounded-full bg-[var(--color-surface)] text-[17px] transition-transform group-hover:translate-x-0.5">→</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
