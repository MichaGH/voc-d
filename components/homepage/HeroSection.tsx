import MagazineHeroStage, { type HeroSlide } from "@/components/hero/MagazineHeroStage";
import { editionPath, magazinePath, subscriptionPath } from "@/constants/routes";
import { getLatestEditions, getMagazine, getMagazines } from "@/lib/content";

export default async function HeroSection() {
  const summaries = await getMagazines();
  const slides = await Promise.all(
    summaries.map(async ({ key }): Promise<HeroSlide | null> => {
      const [magazine, [latest]] = await Promise.all([
        getMagazine(key),
        getLatestEditions({ magazineKey: key, limit: 1 }),
      ]);
      if (!magazine) return null;
      return {
        key,
        title: magazine.title,
        shortTitle: magazine.shortTitle,
        headline: magazine.hero.headline,
        summary: magazine.hero.summary,
        poster: magazine.hero.poster,
        video: magazine.hero.video,
        href: magazinePath(key),
        subscribeHref: subscriptionPath(key),
        readHref: latest?.hasDigitalVersion ? editionPath(key, latest.slug) : undefined,
        latest: latest ? { label: latest.label, cover: latest.cover } : undefined,
      };
    }),
  );

  return <MagazineHeroStage slides={slides.filter((slide): slide is HeroSlide => slide !== null)} />;
}
