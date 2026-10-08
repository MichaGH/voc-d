import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import ServiceGrid from "@/components/advertising/ServiceGrid";
import ContactSection from "@/components/homepage/ContactSection";
import PageIntro from "@/components/shared/PageIntro";
import { body, buttonPrimary, buttonSecondary, eyebrowOnDark, h2, h3, headerGap, inner, sectionTop, sectionX, textLink } from "@/components/shared/ui";
import { CONTACT, LINKS } from "@/constants";
import { editorialPlanPath } from "@/constants/routes";
import { advertisingChannels } from "@/data/advertising";
import { getEditorialPlan, getEditorialPlanYears, getMagazines } from "@/lib/content";
import { findNextDeadlineEntry } from "@/lib/content/rules";
import { formatPlanDate, todayInSiteZone } from "@/lib/format/dates";
import { bindDashes } from "@/lib/format/text";

export const metadata: Metadata = {
  title: "Inzercia",
  description:
    "Inzercia v časopisoch Správca bytových domov a Plynár – Vodár – Kúrenár + Klimatizácia a na TZBportal.sk. Plošná inzercia, odborné články, direct-mailing.",
};

/** Next deadlines follow today's date. */
export const revalidate = 86400;

export default async function AdvertisingPage() {
  const today = todayInSiteZone();
  const currentYear = Number(today.slice(0, 4));
  const magazines = await getMagazines();
  const deadlines = await Promise.all(
    magazines.map(async (magazine) => {
      const years = (await getEditorialPlanYears(magazine.key)).filter((year) => year >= currentYear);
      const plans = (await Promise.all(years.map((year) => getEditorialPlan(magazine.key, year)))).filter((plan) => plan !== null);
      return { magazine, next: findNextDeadlineEntry(plans, today) };
    }),
  );

  return (
    <main id="obsah">
      <PageIntro
        breadcrumbs={[{ label: "Inzercia" }]}
        title="Oslovte ľudí, ktorí o budovách rozhodujú."
        lead="Správcovia bytových domov, spoločenstvá vlastníkov, projektanti a firmy TZB. Vašu firmu im predstavíme v tlači, direct-mailingom aj online."
      >
        <div className="flex flex-wrap gap-3">
          <Link href={LINKS.advertise} className={`${buttonPrimary} h-14 px-7 text-base`}>
            Dohodnúť inzerciu ↗
          </Link>
          <Link href={CONTACT.phoneHref} className={`${buttonSecondary} h-14 px-7 text-base`}>
            {CONTACT.phoneDisplay}
          </Link>
        </div>
      </PageIntro>

      {/* Channels */}
      <section aria-labelledby="kanaly-nadpis" className={`${sectionX} ${sectionTop}`}>
        <div className={inner}>
          <h2 id="kanaly-nadpis" className={h2}>Kde vás uvidia</h2>
          <ul className={`${headerGap} grid list-none gap-5 lg:grid-cols-3`}>
            {advertisingChannels.map((channel) => (
              <li key={channel.key} id={channel.key} className="flex scroll-mt-[100px] flex-col rounded-[32px] bg-[var(--color-surface)] p-[clamp(24px,2.6vw,36px)]">
                <div className="grid aspect-[16/11] place-items-center rounded-[22px] bg-white">
                  <Image
                    src={channel.image.src}
                    alt=""
                    width={channel.image.width}
                    height={channel.image.height}
                    sizes="160px"
                    className={
                      channel.key === "tzbportal"
                        ? "h-auto w-[34%]"
                        : "h-[78%] w-auto rounded-[4px] shadow-[0_24px_40px_-22px_rgba(4,23,58,.55)]"
                    }
                  />
                </div>
                <h3 className={`mt-8 ${h3}`}>{bindDashes(channel.title)}</h3>
                <p className={`mt-3 ${body}`}>{channel.audience}</p>
                <ul aria-label="Formáty" className="mt-5 flex list-none flex-wrap gap-2">
                  {channel.formats.map((format) => (
                    <li key={format} className="inline-flex h-9 items-center rounded-full bg-white px-4 text-sm font-medium text-[var(--color-navy)]">
                      {format}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto flex flex-wrap gap-x-6 gap-y-2 pt-8">
                  {channel.planHref && (
                    <Link href={channel.planHref} className={textLink}>
                      Edičný plán →
                    </Link>
                  )}
                  <Link href={channel.infoHref} className={textLink}>
                    {channel.planHref ? "Cenník a podklady ↗" : "TZBportal.sk ↗"}
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Next deadlines */}
      <section aria-labelledby="uzavierky-nadpis" className={`${sectionX} ${sectionTop}`}>
        <div className={`${inner} rounded-[36px] bg-[linear-gradient(135deg,var(--color-navy-light)_0%,var(--color-navy)_75%)] p-[clamp(32px,5vw,72px)] text-white`}>
          <p className={eyebrowOnDark}>Termíny</p>
          <h2 id="uzavierky-nadpis" className={`mt-4 max-w-[16ch] ${h2}`}>Najbližšie uzávierky</h2>
          <ul className="mt-[clamp(40px,5vw,64px)] grid list-none gap-4 md:grid-cols-2">
            {deadlines.map(({ magazine, next }) => (
              <li key={magazine.key} className="flex flex-col rounded-[24px] bg-white/[.07] p-[clamp(24px,2.6vw,36px)] ring-1 ring-white/10">
                <p className="text-[17px] font-semibold text-balance">{bindDashes(magazine.title)}</p>
                {next ? (
                  <>
                    <p className="mt-6 text-[clamp(40px,4vw,56px)] leading-none font-bold tracking-[-.04em]">
                      {next.submissionDeadline ? formatPlanDate(next.submissionDeadline) : "upresníme"}
                    </p>
                    <p className="mt-3 text-[15px] text-[var(--color-stat-copy)]">
                      Uzávierka čísla {next.issueLabel} · vychádza {formatPlanDate(next.distribution)}
                    </p>
                  </>
                ) : (
                  <p className="mt-6 text-lg text-[var(--color-card-copy)]">Termíny upresníme e-mailom.</p>
                )}
                <Link
                  href={editorialPlanPath(magazine.key)}
                  className="mt-auto inline-flex items-center gap-1.5 pt-8 text-[15px] font-semibold text-white no-underline hover:text-[var(--color-blue-pale)]"
                >
                  Celý edičný plán →
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Services */}
      <section aria-labelledby="sluzby-nadpis" className={`${sectionX} mt-[clamp(96px,10vw,152px)] bg-[var(--color-surface)] py-[clamp(80px,9vw,128px)]`}>
        <div className={inner}>
          <div className="flex flex-wrap items-end justify-between gap-x-12 gap-y-6">
            <h2 id="sluzby-nadpis" className={`max-w-[14ch] ${h2}`}>Ako vám pomôžeme</h2>
            <Link href={LINKS.services} className={textLink}>
              Všetky služby vydavateľstva ↗
            </Link>
          </div>
          <div className={headerGap}>
            <ServiceGrid />
          </div>
        </div>
      </section>

      <ContactSection />
    </main>
  );
}
