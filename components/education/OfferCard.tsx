import Image from "next/image";
import Link from "next/link";
import type { EducationOffer } from "@/types/content";

const labelColor: Record<EducationOffer["kind"], string> = {
  conference: "text-[var(--color-teal)]",
  course: "text-[var(--color-blue)]",
};

/** Evergreen conference/course offer leading to its existing page. */
export default function OfferCard({ offer, headingLevel = "h3" }: { offer: EducationOffer; headingLevel?: "h2" | "h3" }) {
  const Heading = headingLevel;
  // The conference artwork is a wide logo strip, shown whole on navy rather than cropped.
  const isStrip = offer.image.width / offer.image.height > 3;
  return (
    <Link
      href={offer.href}
      className="flex flex-col overflow-hidden rounded-3xl bg-[var(--color-surface)] text-[var(--color-navy)] no-underline transition-colors hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-navy)]"
    >
      <div className={`relative aspect-video ${isStrip ? "bg-[var(--color-navy)]" : "bg-[var(--color-line)]"}`}>
        <Image
          src={offer.image.src}
          alt={offer.image.alt}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className={isStrip ? "object-contain p-7" : "object-cover"}
        />
      </div>
      <div className="flex flex-1 items-end justify-between gap-6 p-[clamp(24px,3vw,40px)]">
        <div>
          <p className={`text-[15px] font-semibold ${labelColor[offer.kind]}`}>{offer.label}</p>
          <Heading className="mt-2 text-[clamp(24px,2.2vw,32px)] leading-[1.1] font-bold tracking-[-.02em]">{offer.title}</Heading>
          <p className="mt-2.5 text-base text-[var(--color-copy)]">{offer.description}</p>
        </div>
        <span aria-hidden="true" className="grid size-[52px] shrink-0 place-items-center rounded-full bg-[var(--color-navy)] text-xl text-white">↗</span>
      </div>
    </Link>
  );
}
