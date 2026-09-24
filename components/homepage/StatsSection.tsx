import { stats } from "@/data/homepage";

export default function StatsSection() {
  return (
    <section aria-label="VOC.SK v číslach" className="bg-[linear-gradient(135deg,var(--color-navy-light)_0%,var(--color-navy)_70%)] text-white">
      <div className="mx-auto grid max-w-[1400px] grid-cols-2 gap-y-12 px-5 py-[clamp(56px,6vw,96px)] md:px-8 lg:grid-cols-4 xl:px-12">
        {stats.map((stat, index) => (
          <div key={stat.label} className={`px-[clamp(16px,2.5vw,40px)] text-center ${index % 2 === 1 || index >= 2 ? "border-l border-white/18" : ""} ${index === 2 ? "border-l-0 lg:border-l" : ""}`}>
            <p className="text-[clamp(48px,4.8vw,76px)] leading-[.95] font-bold tracking-[-.045em] text-white">{stat.value}</p>
            <p className="mt-4 text-base text-[var(--color-stat-copy)]">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
