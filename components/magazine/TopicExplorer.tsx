"use client";

import Image from "next/image";
import { useId, useState } from "react";
import type { MagazineTopic } from "@/types/content";

/**
 * "Čo nájdete v časopise": topic titles on the left, the selected topic's
 * photograph on the right. Pointer hover or click/keyboard selects a topic;
 * its description opens beneath the title. Exactly one topic is always open.
 */
export default function TopicExplorer({ topics, fallbackImage }: { topics: MagazineTopic[]; fallbackImage: MagazineTopic["image"] }) {
  const [active, setActive] = useState(0);
  const baseId = useId();
  const imageFor = (topic: MagazineTopic) => topic.image ?? fallbackImage;

  return (
    <div className="grid items-start gap-x-[clamp(40px,6vw,104px)] gap-y-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <ol className="order-2 list-none lg:order-1">
        {topics.map((topic, index) => {
          const open = index === active;
          const panelId = `${baseId}-${topic.key}`;
          return (
            <li key={topic.key}>
              <button
                type="button"
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setActive(index)}
                onPointerEnter={(event) => {
                  if (event.pointerType === "mouse") setActive(index);
                }}
                className={`flex w-full cursor-pointer border-0 bg-transparent py-4 text-left transition-colors ${
                  open ? "text-[var(--color-navy)]" : "text-[var(--color-steel)] hover:text-[var(--color-navy)]"
                }`}
              >
                <span className="text-[clamp(26px,2.6vw,40px)] leading-[1.08] font-bold tracking-[-.03em] text-balance">{topic.title}</span>
              </button>
              <div
                id={panelId}
                role="region"
                aria-label={topic.title}
                inert={!open}
                className={`grid transition-[grid-template-rows] duration-500 ease-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
              >
                <div className="overflow-hidden">
                  <p className="max-w-[44ch] pb-6 text-[17px] leading-[1.6] text-[var(--color-copy)] text-pretty">{topic.description}</p>
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      <div aria-hidden="true" className="relative order-1 aspect-[4/3] overflow-hidden rounded-[32px] bg-[var(--color-line)] lg:sticky lg:top-[116px] lg:order-2 lg:aspect-[4/3.4]">
        {topics.map((topic, index) => {
          const image = imageFor(topic);
          if (!image) return null;
          return (
            <Image
              key={topic.key}
              src={image.src}
              alt=""
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className={`object-cover transition-[opacity,transform] duration-700 ease-out ${
                index === active ? "scale-100 opacity-100" : "scale-[1.04] opacity-0"
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}
