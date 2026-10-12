import type { ReactNode } from "react";
import Footer from "@/components/layout/Footer";
import Navbar, { type NavMagazine } from "@/components/layout/Navbar";
import { magazinePath } from "@/constants/routes";
import { getLatestEditions, getMagazines } from "@/lib/content";

/**
 * Website navigation and footer around ordinary pages. The full-screen
 * reader deliberately lives outside it (app/(reader)).
 */
export default async function SiteChrome({ children }: { children: ReactNode }) {
  const magazines = await getMagazines();
  const navMagazines: NavMagazine[] = await Promise.all(
    magazines.map(async (magazine) => {
      const [latest] = await getLatestEditions({ magazineKey: magazine.key, limit: 1 });
      return {
        key: magazine.key,
        title: magazine.title,
        audience: magazine.audience,
        href: magazinePath(magazine.key),
        cover: latest?.cover,
      };
    }),
  );

  return (
    <>
      <Navbar magazines={navMagazines} />
      {children}
      <Footer magazines={navMagazines} />
    </>
  );
}
