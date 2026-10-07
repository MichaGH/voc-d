import Image from "next/image";
import type { MagazineTopic } from "@/types/content";

/**
 * Magazine-specific "Čo nájdete" topics, for any number of records.
 * Topics with an image become photographic cards; the rest follow as a quiet
 * bordered list, so missing images never leave empty tiles or holes.
 */
export default function TopicGrid({ topics }: { topics: MagazineTopic[] }) {
  const withImage = topics.filter((topic) => topic.image);
  const textOnly = topics.filter((topic) => !topic.image);

  return (
    <div>
      {withImage.length > 0 && (
        <ul className="grid list-none gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {withImage.map((topic) => (
            <li key={topic.key} className="relative min-h-[400px] overflow-hidden rounded-[28px] bg-[var(--color-navy)] text-white sm:aspect-[4/5] sm:min-h-0">
              {topic.image && (
                <Image src={topic.image.src} alt={topic.image.alt} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover" />
              )}
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,23,58,0)_30%,rgba(4,23,58,.55)_60%,rgba(4,23,58,.95)_100%)]" />
              <div className="absolute inset-x-0 bottom-0 p-[clamp(28px,3vw,40px)]">
                <h3 className="text-[clamp(26px,2.4vw,34px)] leading-[1.08] font-bold tracking-[-.03em] text-balance">{topic.title}</h3>
                <p className="mt-3 max-w-[34ch] text-base leading-[1.55] text-[var(--color-card-copy)] text-pretty">{topic.description}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
      {textOnly.length > 0 && (
        <ul className={`grid list-none gap-x-[clamp(24px,3vw,48px)] sm:grid-cols-2 lg:grid-cols-3 ${withImage.length > 0 ? "mt-[clamp(40px,4vw,56px)]" : ""}`}>
          {textOnly.map((topic) => (
            <li key={topic.key} className="border-t border-[var(--color-line-dark)] pt-6 pb-8">
              <h3 className="text-[clamp(21px,1.8vw,25px)] leading-[1.15] font-bold tracking-[-.02em] text-balance">{topic.title}</h3>
              <p className="mt-2.5 max-w-[40ch] text-base text-[var(--color-copy)] text-pretty">{topic.description}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
