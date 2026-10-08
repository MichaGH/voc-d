import Image from "next/image";
import type { EditionSummary } from "@/types/content";

/**
 * Up to three recent covers standing on a shared baseline, growing from back
 * (older, left) to front (newest, right). Decorative; callers label any link.
 */
const slots = [
  "left-[6%] w-[31%] z-10 -rotate-[4deg] shadow-[0_22px_40px_-24px_rgba(4,23,58,.55)]",
  "left-[24%] w-[36%] z-20 -rotate-[1.5deg] shadow-[0_28px_50px_-26px_rgba(4,23,58,.6)]",
  "left-[47%] w-[44%] z-30 rotate-[2deg] shadow-[0_44px_70px_-30px_rgba(4,23,58,.7)]",
];

export default function CoverCascade({ editions, preload = false }: { editions: EditionSummary[]; preload?: boolean }) {
  const ordered = editions.slice(0, 3).reverse();
  const offset = 3 - ordered.length;
  return (
    <span className="relative block size-full">
      {ordered.map((edition, index) => {
        const isFront = index === ordered.length - 1;
        return (
          <Image
            key={edition.slug}
            src={edition.cover.src}
            alt=""
            width={edition.cover.width}
            height={edition.cover.height}
            sizes="(max-width: 1024px) 45vw, 300px"
            preload={preload && isFront}
            className={`absolute bottom-[19%] aspect-[595/842] h-auto origin-bottom rounded-[5px] ${slots[index + offset]}`}
          />
        );
      })}
    </span>
  );
}
