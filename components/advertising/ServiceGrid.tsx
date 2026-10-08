import { advertisingServices } from "@/data/advertising";

function ServiceIcon({ name }: { name: string }) {
  const common = { width: 26, height: 26, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  if (name === "document") return <svg {...common}><path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H15l5 5v9.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5z"/><path d="M15 4v5h5"/><path d="M8 13h8M8 16.5h5"/></svg>;
  if (name === "design") return <svg {...common}><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>;
  if (name === "online") return <svg {...common}><rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8M12 17v4"/><path d="M7 9h6M7 12h10"/></svg>;
  return <svg {...common}><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>;
}

/** The publisher's advertising services as four cards. */
export default function ServiceGrid() {
  return (
    <ul className="grid list-none gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {advertisingServices.map((service) => (
        <li key={service.title} className="flex flex-col gap-8 rounded-[28px] bg-white p-[clamp(24px,2.4vw,32px)]">
          <span className="grid size-14 place-items-center rounded-2xl bg-[var(--color-blue-wash)] text-[var(--color-blue)]">
            <ServiceIcon name={service.icon} />
          </span>
          <div>
            <h3 className="text-[19px] leading-tight font-bold tracking-[-.015em]">{service.title}</h3>
            <p className="mt-2 text-[15px] leading-[1.6] text-[var(--color-copy)] text-pretty">{service.description}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
