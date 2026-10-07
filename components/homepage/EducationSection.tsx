import Link from "next/link";
import OfferCard from "@/components/education/OfferCard";
import { eyebrow, h2, headerGap, textLink } from "@/components/shared/ui";
import { ROUTES } from "@/constants/routes";
import { getEducationOffers } from "@/lib/content";

export default async function EducationSection() {
  const offers = await getEducationOffers();

  return (
    <section id="vzdelavanie" aria-labelledby="vzdel-nadpis" className="scroll-mt-[76px] px-5 pt-[clamp(88px,10vw,150px)] md:px-8 xl:px-12">
      <div className="mx-auto max-w-[1400px]">
        <div className="flex flex-wrap items-end justify-between gap-x-12 gap-y-6">
          <div>
            <p className={eyebrow}>Vzdelávanie</p>
            <h2 id="vzdel-nadpis" className={`mt-4 max-w-[16ch] ${h2}`}>
              Stretnite sa s odborníkmi naživo.
            </h2>
          </div>
          <Link href={ROUTES.education} className={textLink}>
            Konferencie, kurzy a články →
          </Link>
        </div>

        <div className={`${headerGap} grid gap-4 lg:grid-cols-2`}>
          {offers.map((offer) => (
            <OfferCard key={offer.key} offer={offer} />
          ))}
        </div>
      </div>
    </section>
  );
}
