import Image from "next/image";
import type { ContentImage, MagazineTopic } from "@/types/content";

/** Column span (of 6) per card: two wide cards, then rows of three; leftovers widen to fill their row. */
function spans(count: number) {
  const result: string[] = [];
  const lead = Math.min(2, count);
  for (let i = 0; i < lead; i += 1) result.push(lead === 1 ? "md:col-span-6" : "md:col-span-3");
  let rest = count - lead;
  while (rest > 0) {
    const row = rest >= 3 ? 3 : rest;
    const span = row === 3 ? "md:col-span-2" : row === 2 ? "md:col-span-3" : "md:col-span-6";
    for (let i = 0; i < row; i += 1) result.push(span);
    rest -= row;
  }
  return result;
}

/** "Čo nájdete v časopise": photographic topic cards, informative only (not links). */
export default function TopicCards({ topics, fallbackImage }: { topics: MagazineTopic[]; fallbackImage: ContentImage }) {
  const columnSpans = spans(topics.length);
  return (
    <ul className="grid list-none gap-4 md:grid-cols-6 md:gap-5">
      {topics.map((topic, index) => {
        const image = topic.image ?? fallbackImage;
        const wide = columnSpans[index] !== "md:col-span-2";
        return (
          <li
            key={topic.key}
            className={`relative isolate flex min-h-[420px] flex-col justify-end overflow-hidden rounded-[28px] bg-[var(--color-navy)] text-white ${columnSpans[index]} ${
              wide ? "md:aspect-[16/11] md:min-h-0" : "md:aspect-[4/5] md:min-h-0"
            }`}
          >
            <Image src={image.src} alt={image.alt} fill sizes={wide ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 100vw, 33vw"} className="-z-10 object-cover" />
            <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(4,23,58,0)_35%,rgba(4,23,58,.6)_65%,rgba(4,23,58,.94)_100%)]" />
            <div className="p-[clamp(28px,3vw,44px)]">
              <h3 className={`${wide ? "text-[clamp(28px,2.8vw,42px)]" : "text-[clamp(24px,2.2vw,32px)]"} max-w-[16ch] leading-[1.06] font-bold tracking-[-.03em] text-balance`}>
                {topic.title}
              </h3>
              <p className="mt-3 max-w-[40ch] text-base leading-[1.55] text-[var(--color-card-copy)] text-pretty">{topic.description}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
