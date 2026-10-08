import "server-only";

import type { SwitcherItem } from "@/components/magazine/MagazineSwitcher";
import { getLatestEditions, getMagazines } from "@/lib/content";
import type { MagazineKey } from "@/types/content";

/** Builds the magazine switcher for a per-magazine page family (editions, plan). */
export async function getSwitcherItems(hrefFor: (key: MagazineKey) => string): Promise<SwitcherItem[]> {
  const magazines = await getMagazines();
  return Promise.all(
    magazines.map(async (magazine) => {
      const [latest] = await getLatestEditions({ magazineKey: magazine.key, limit: 1 });
      return { key: magazine.key, label: magazine.shortTitle, href: hrefFor(magazine.key), cover: latest?.cover };
    }),
  );
}
