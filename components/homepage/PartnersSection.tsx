import { brands } from "@/data/homepage";

export default function PartnersSection() {
  return (
    <section aria-label="Partneri a inzerenti" className="shrink-0 overflow-hidden bg-white py-10">
      <p className="mx-auto mb-7 max-w-[1400px] px-5 text-center text-sm font-semibold tracking-[.16em] text-[var(--color-steel)] md:px-8 xl:px-12">
        INZERUJÚ U NÁS
      </p>
      <div className="marquee-mask">
        <div className="marquee-track flex w-max">
          {[...brands, ...brands].map((brand, index) => (
            <span key={`${brand}-${index}`} className="shrink-0 px-[clamp(28px,3.5vw,56px)] text-[clamp(22px,2.2vw,30px)] font-bold tracking-[-.02em] whitespace-nowrap text-[var(--color-steel)]">
              {brand}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
