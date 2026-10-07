import type { MagazineKey } from "@/types/content";

/**
 * Presentation mapping from semantic magazine identity to the existing VOC
 * accents. Content records never carry these classes.
 */
export const magazineAccent: Record<
  MagazineKey,
  { text: string; textOnDark: string; bg: string; bgOnDark: string }
> = {
  pvk: {
    text: "text-[var(--color-teal)]",
    textOnDark: "text-[var(--color-cyan)]",
    bg: "bg-[var(--color-teal)]",
    bgOnDark: "bg-[var(--color-cyan)]",
  },
  sbd: {
    text: "text-[var(--color-green)]",
    textOnDark: "text-[var(--color-mint)]",
    bg: "bg-[var(--color-green)]",
    bgOnDark: "bg-[var(--color-mint)]",
  },
};
