import type { MagazineKey } from "@/types/content";

/** Magazine accent used only for the hero selection line (on navy). Records never carry classes. */
export const magazineAccent: Record<MagazineKey, { bgOnDark: string }> = {
  pvk: { bgOnDark: "bg-[var(--color-cyan)]" },
  sbd: { bgOnDark: "bg-[var(--color-mint)]" },
};
