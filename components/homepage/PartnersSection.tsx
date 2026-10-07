import { getPartners } from "@/lib/content";

export default async function PartnersSection() {
  const partners = await getPartners();
  if (partners.length === 0) return null;

  return (
    <section aria-labelledby="partneri-nadpis" className="shrink-0 overflow-hidden bg-white py-10">
      <h2 id="partneri-nadpis" className="mx-auto mb-7 max-w-[1400px] px-5 text-center text-sm font-semibold tracking-[.16em] text-[var(--color-steel)] uppercase md:px-8 xl:px-12">
        Partneri
      </h2>
      <ul className="sr-only">
        {partners.map((partner) => (
          <li key={partner.key}>{partner.name}</li>
        ))}
      </ul>
      <div className="marquee-mask" aria-hidden="true">
        <div className="marquee-track flex w-max">
          {[...partners, ...partners].map((partner, index) => (
            <span key={`${partner.key}-${index}`} className="shrink-0 px-[clamp(28px,3.5vw,56px)] text-[clamp(22px,2.2vw,30px)] font-bold tracking-[-.02em] whitespace-nowrap text-[var(--color-steel)]">
              {partner.name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
