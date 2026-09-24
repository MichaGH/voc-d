import Image from "next/image";

export default function AudienceDividerSection() {
  return (
    <section aria-label="Pre koho píšeme" className="relative mt-[clamp(112px,12vw,176px)] flex min-h-[min(88vh,860px)] items-end overflow-hidden bg-[var(--color-navy)] text-white">
      <Image src="/images/building-divider.jpg" alt="Fasáda bytového domu s balkónmi" fill sizes="100vw" className="object-cover object-[center_30%]" />
      <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(4,23,58,.9)_0%,rgba(4,23,58,.25)_55%,rgba(4,23,58,.1)_100%)]" />
      <div className="relative mx-auto w-full max-w-[1400px] px-5 py-[clamp(56px,7vw,112px)] md:px-8 xl:px-12">
        <p className="max-w-[15em] text-[clamp(34px,4.6vw,76px)] leading-[1.02] font-bold tracking-[-.04em] text-balance">
          Pre tých, ktorí budovy <span className="text-[var(--color-blue-light)]">spravujú, navrhujú a udržiavajú.</span>
        </p>
      </div>
    </section>
  );
}
