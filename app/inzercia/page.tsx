import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import CoverCascade from "@/components/magazine/CoverCascade";
import { buttonOnDark, buttonOutlineOnDark, buttonPrimary, buttonSecondary, display, h2, headerGap, inner, sectionTop, sectionX } from "@/components/shared/ui";
import { CONTACT, LINKS, mailto } from "@/constants";
import { editorialPlanPath } from "@/constants/routes";
import { advertisingMedia, type AdvertisingMedium } from "@/data/advertising";
import { getEditorialPlan, getEditorialPlanYears, getLatestEditions } from "@/lib/content";
import { findNextDeadlineEntry } from "@/lib/content/rules";
import { formatPlanDate, todayInSiteZone } from "@/lib/format/dates";
import { bindDashes } from "@/lib/format/text";
import type { EditionSummary, EditorialPlanEntry, MagazineKey } from "@/types/content";

export const metadata: Metadata = {
  title: "Inzercia",
  description:
    "Inzercia v časopisoch Správca bytových domov a Plynár – Vodár – Kúrenár + Klimatizácia a na TZBportal.sk. Plošná inzercia, odborné články, direct-mailing.",
};

/** Next deadlines follow today's date. */
export const revalidate = 86400;

async function nextDeadline(key: MagazineKey, today: string) {
  const currentYear = Number(today.slice(0, 4));
  const years = (await getEditorialPlanYears(key)).filter((year) => year >= currentYear);
  const plans = (await Promise.all(years.map((year) => getEditorialPlan(key, year)))).filter((plan) => plan !== null);
  return findNextDeadlineEntry(plans, today);
}

/** Visual for a medium: magazine covers, or the TZBportal mark on white. */
function MediumVisual({ medium, editions }: { medium: AdvertisingMedium; editions: EditionSummary[] }) {
  if (medium.key === "tzbportal") {
    return (
      <span className="grid size-full place-items-center">
        <span className="grid aspect-square w-[34%] place-items-center rounded-[28px] bg-white shadow-[0_30px_60px_-30px_rgba(4,23,58,.45)]">
          <Image src={medium.image.src} alt="" width={medium.image.width} height={medium.image.height} sizes="160px" className="h-auto w-[72%]" />
        </span>
      </span>
    );
  }
  return (
    <span className="absolute inset-x-[8%] top-[14%] bottom-[12%]">
      <CoverCascade editions={editions} />
    </span>
  );
}

function MediumSection({
  medium,
  editions,
  deadline,
  reverse,
}: {
  medium: AdvertisingMedium;
  editions: EditionSummary[];
  deadline: EditorialPlanEntry | null;
  reverse: boolean;
}) {
  const isMagazine = medium.key !== "tzbportal";
  return (
    <section id={medium.key} aria-labelledby={`${medium.key}-nadpis`} className={`${sectionX} ${sectionTop} scroll-mt-[60px]`}>
      <div className={`${inner} grid items-center gap-x-[clamp(40px,6vw,104px)] gap-y-12 lg:grid-cols-2`}>
        <div className={`relative aspect-[1/.92] overflow-hidden rounded-[36px] bg-[var(--color-surface)] ${reverse ? "lg:order-2" : ""}`}>
          <MediumVisual medium={medium} editions={editions} />
        </div>

        <div className="min-w-0">
          <h2 id={`${medium.key}-nadpis`} className={`max-w-[14ch] ${h2}`}>
            {bindDashes(medium.title)}
          </h2>
          <p className="mt-5 max-w-[42ch] text-[clamp(17px,1.4vw,20px)] leading-[1.55] text-[var(--color-copy)] text-pretty">{medium.audience}</p>

          <dl className="mt-10 grid gap-x-10 gap-y-7 sm:grid-cols-2">
            {medium.options.map((option) => (
              <div key={option.title}>
                <dt className="text-lg leading-snug font-semibold">{option.title}</dt>
                <dd className="mt-1.5 text-[15px] leading-[1.6] text-[var(--color-copy)] text-pretty">{option.description}</dd>
              </div>
            ))}
          </dl>

          {isMagazine && deadline && (
            <p className="mt-10 text-[17px] text-[var(--color-copy)]">
              Najbližšia uzávierka{" "}
              <strong className="font-semibold text-[var(--color-navy)]">
                {deadline.submissionDeadline ? formatPlanDate(deadline.submissionDeadline) : formatPlanDate(deadline.distribution)}
              </strong>{" "}
              pre číslo {deadline.issueLabel}.
            </p>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href={mailto(`Inzercia – ${medium.title}`)} className={`${buttonPrimary} h-14 px-7 text-base`}>
              Dohodnúť inzerciu ↗
            </Link>
            {isMagazine ? (
              <Link href={editorialPlanPath(medium.key as MagazineKey)} className={`${buttonSecondary} h-14 px-7 text-base`}>
                Edičný plán
              </Link>
            ) : (
              <Link href={LINKS.tzbPortal} className={`${buttonSecondary} h-14 px-7 text-base`}>
                TZBportal.sk ↗
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default async function AdvertisingPage() {
  const today = todayInSiteZone();
  const data = await Promise.all(
    advertisingMedia.map(async (medium) => {
      if (medium.key === "tzbportal") return { medium, editions: [], deadline: null };
      const [editions, deadline] = await Promise.all([
        getLatestEditions({ magazineKey: medium.key, limit: 3 }),
        nextDeadline(medium.key, today),
      ]);
      return { medium, editions, deadline };
    }),
  );

  return (
    <main id="obsah">
      {/* Hero */}
      <section aria-labelledby="inzercia-nadpis" className="relative isolate overflow-hidden bg-[var(--color-navy)] pt-[76px] text-white">
        <Image src="/images/role-advertiser.jpg" alt="" fill preload sizes="100vw" className="-z-10 object-cover" />
        <div className="absolute inset-0 -z-10 bg-[rgba(4,23,58,.76)]" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(4,23,58,.6)_0%,rgba(4,23,58,0)_40%,rgba(4,23,58,.7)_100%)]" />
        <div className={`${sectionX} py-[clamp(104px,13vw,200px)] text-center`}>
          <h1 id="inzercia-nadpis" className={`mx-auto max-w-[14ch] ${display}`}>
            Oslovte ľudí, ktorí o budovách rozhodujú.
          </h1>
          <p className="mx-auto mt-7 max-w-[48ch] text-[clamp(17px,1.5vw,21px)] leading-[1.55] text-[var(--color-hero-copy)] text-pretty">
            Inzerujte v dvoch odborných časopisoch a na portáli TZBportal.sk — v tlači, direct-mailingom aj online.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link href={LINKS.advertise} className={`${buttonOnDark} h-14 px-7 text-base`}>
              Dohodnúť inzerciu ↗
            </Link>
            <Link href={CONTACT.phoneHref} className={`${buttonOutlineOnDark} h-14 px-7 text-base`}>
              {CONTACT.phoneDisplay}
            </Link>
          </div>
        </div>
      </section>

      {/* Where */}
      <section aria-labelledby="kde-nadpis" className={`${sectionX} ${sectionTop}`}>
        <div className={inner}>
          <h2 id="kde-nadpis" className={`mx-auto max-w-[16ch] text-center ${h2}`}>Kde môžete inzerovať?</h2>
          <ul className={`${headerGap} grid list-none gap-5 lg:grid-cols-3`}>
            {data.map(({ medium, editions }) => {
              const cover = editions[0]?.cover;
              return (
                <li key={medium.key}>
                  <Link
                    href={`#${medium.key}`}
                    className="group flex h-full flex-col overflow-hidden rounded-[32px] border border-[var(--color-line-light)] bg-white text-[var(--color-navy)] no-underline transition-shadow duration-300 hover:shadow-[0_30px_60px_-36px_rgba(4,23,58,.45)] hover:text-[var(--color-navy)]"
                  >
                    <span className="relative block aspect-[4/3.2] overflow-hidden bg-[var(--color-surface)]">
                      {cover ? (
                        <Image
                          src={cover.src}
                          alt=""
                          width={cover.width}
                          height={cover.height}
                          sizes="(max-width: 1024px) 60vw, 240px"
                          className="absolute bottom-0 left-1/2 w-[50%] -translate-x-1/2 translate-y-[18%] rounded-[5px] shadow-[0_40px_60px_-28px_rgba(4,23,58,.65)] transition-transform duration-500 ease-out group-hover:translate-y-[10%]"
                        />
                      ) : (
                        <span className="absolute inset-0 grid place-items-center">
                          <span className="grid aspect-square w-[40%] place-items-center rounded-[26px] bg-white shadow-[0_30px_50px_-28px_rgba(4,23,58,.5)] transition-transform duration-500 ease-out group-hover:-translate-y-2">
                            <Image src={medium.image.src} alt="" width={medium.image.width} height={medium.image.height} sizes="120px" className="h-auto w-[72%]" />
                          </span>
                        </span>
                      )}
                    </span>
                    <span className="flex flex-1 items-end justify-between gap-6 p-[clamp(24px,2.6vw,36px)]">
                      <span>
                        <span className="block text-[clamp(22px,1.9vw,27px)] leading-[1.12] font-bold tracking-[-.02em] text-balance">{bindDashes(medium.title)}</span>
                        <span className="mt-2.5 block text-[15px] leading-[1.55] text-[var(--color-copy)] text-pretty">{medium.audience}</span>
                      </span>
                      <span
                        aria-hidden="true"
                        className="grid size-12 shrink-0 place-items-center rounded-full bg-[var(--color-navy)] text-lg text-white transition-transform duration-300 group-hover:translate-y-0.5"
                      >
                        ↓
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {data.map(({ medium, editions, deadline }, index) => (
        <MediumSection key={medium.key} medium={medium} editions={editions} deadline={deadline} reverse={index % 2 === 1} />
      ))}

      {/* Offer */}
      <section aria-labelledby="ponuka-nadpis" className={`${sectionX} ${sectionTop}`}>
        <div className={`${inner} rounded-[36px] bg-[var(--color-cta)] px-[clamp(28px,6vw,96px)] py-[clamp(64px,8vw,120px)] text-center text-white`}>
          <h2 id="ponuka-nadpis" className={`mx-auto max-w-[16ch] ${h2}`}>Pripravíme vám ponuku na mieru.</h2>
          <p className="mx-auto mt-6 max-w-[48ch] text-[clamp(17px,1.4vw,20px)] leading-[1.55] text-[var(--color-cta-copy)] text-pretty">
            Pri inzercii vo viacerých médiách poskytujeme zľavy. Ozvite sa — poradíme s formátom aj termínom.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link href={LINKS.advertise} className={`${buttonOnDark} h-14 px-7 text-base`}>
              Napísať e-mail ↗
            </Link>
            <Link href={CONTACT.phoneHref} className={`${buttonOutlineOnDark} h-14 px-7 text-base`}>
              {CONTACT.phoneDisplay}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
