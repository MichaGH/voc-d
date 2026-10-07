import Image from "next/image";
import type { EditionSummary } from "@/types/content";

const positions = [
  "left-[8%] top-[14%] w-[32%] -rotate-[9deg] shadow-[0_24px_44px_-22px_rgba(4,23,58,.55)]",
  "right-[8%] top-[14%] w-[32%] rotate-[9deg] shadow-[0_24px_44px_-22px_rgba(4,23,58,.55)]",
  "left-1/2 top-0 w-[42%] -translate-x-1/2 shadow-[0_44px_70px_-30px_rgba(4,23,58,.65)]",
];

/** Three recent covers fanned out, newest in front. Decorative — callers label the link. */
export default function CoverStack({ editions }: { editions: EditionSummary[] }) {
  // Newest edition takes the front/centre slot; older ones sit behind it.
  const ordered = editions.slice(0, 3).reverse();
  const offset = 3 - ordered.length;
  return (
    <span className="relative block aspect-[1/.82] w-full">
      {ordered.map((edition, index) => (
        <Image
          key={edition.slug}
          src={edition.cover.src}
          alt=""
          width={edition.cover.width}
          height={edition.cover.height}
          sizes="(max-width: 1024px) 40vw, 240px"
          className={`absolute aspect-[595/842] h-auto rounded-sm ${positions[index + offset]}`}
        />
      ))}
    </span>
  );
}
