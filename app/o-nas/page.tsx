import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import AboutSection from "@/components/homepage/AboutSection";
import AudienceDividerSection from "@/components/homepage/AudienceDividerSection";
import ContactSection from "@/components/homepage/ContactSection";
import StatsSection from "@/components/homepage/StatsSection";
import PageIntro from "@/components/shared/PageIntro";
import { body, h2, h3, headerGap, inner, sectionTop, sectionX, textLink } from "@/components/shared/ui";
import { LINKS } from "@/constants";
import { ROUTES } from "@/constants/routes";
import { getLatestEditions } from "@/lib/content";

export const metadata: Metadata = {
  title: "O nás",
  description:
    "V.O.Č. SLOVAKIA s.r.o. — vydavateľstvo odborných časopisov a organizátor vzdelávania pre správu a techniku budov.",
};

interface Activity {
  title: string;
  description: string;
  href: string;
  linkLabel: string;
  visual: React.ReactNode;
}

export default async function AboutPage() {
  const covers = await getLatestEditions({ limit: 6 });
  const [pvk, sbd] = [covers.find((c) => c.magazineKey === "pvk"), covers.find((c) => c.magazineKey === "sbd")];

  const activities: Activity[] = [
    {
      title: "Odborné časopisy",
      description: "Správca bytových domov a Plynár – Vodár – Kúrenár + Klimatizácia. Recenzované informácie z praxe v každom čísle.",
      href: ROUTES.magazines,
      linkLabel: "Časopisy →",
      visual: (
        <span className="flex h-full items-end justify-center gap-[6%] pt-[8%]">
          {[sbd, pvk].map((edition, index) =>
            edition ? (
              <Image
                key={edition.slug}
                src={edition.cover.src}
                alt=""
                width={edition.cover.width}
                height={edition.cover.height}
                sizes="200px"
                className={`h-[88%] w-auto translate-y-[6%] rounded-[4px] shadow-[0_30px_50px_-26px_rgba(4,23,58,.6)] ${index === 0 ? "-rotate-3" : "rotate-3"}`}
              />
            ) : null,
          )}
        </span>
      ),
    },
    {
      title: "Konferencie a kurzy",
      description: "Konferencia Správa budov dvakrát ročne a akreditovaný kurz Správa bytového fondu pre budúcich správcov.",
      href: ROUTES.education,
      linkLabel: "Vzdelávanie →",
      visual: <Image src="/images/topic-events.jpg" alt="" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />,
    },
    {
      title: "Publikácia Správca budov",
      description: "Učebnica pre správcov bytových domov, ktorá vás pripraví na prax.",
      href: LINKS.publication,
      linkLabel: "Objednávkový leták (PDF) ↗",
      visual: <Image src="/images/role-advertiser.jpg" alt="" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />,
    },
    {
      title: "TZBportal.sk a NEWS",
      description: "Online portál a newsletter o technických zariadeniach budov s odbornými článkami a novinkami firiem.",
      href: LINKS.tzbPortal,
      linkLabel: "TZBportal.sk ↗",
      visual: (
        <span className="grid h-full place-items-center bg-white">
          <Image src="/images/tzb-portal.jpg" alt="" width={176} height={200} className="h-auto w-[22%]" />
        </span>
      ),
    },
  ];

  return (
    <main id="obsah">
      <PageIntro
        breadcrumbs={[{ label: "O nás" }]}
        title="Vydavateľstvo pre správu a techniku budov."
        lead="V.O.Č. SLOVAKIA s.r.o. vydáva odborné časopisy a publikácie a organizuje vzdelávanie pre správcov bytových domov a profesie technických zariadení budov."
      >
        <Link href={LINKS.history} className={textLink}>
          História vydavateľstva ↗
        </Link>
      </PageIntro>

      <AboutSection showLink={false} />

      <section aria-labelledby="robime-nadpis" className={`${sectionX} ${sectionTop}`}>
        <div className={inner}>
          <h2 id="robime-nadpis" className={h2}>Čo robíme</h2>
          <ul className={`${headerGap} grid list-none gap-5 md:grid-cols-2`}>
            {activities.map((activity) => (
              <li key={activity.title}>
                <Link
                  href={activity.href}
                  className="group flex h-full flex-col overflow-hidden rounded-[32px] bg-[var(--color-surface)] text-[var(--color-navy)] no-underline transition-colors hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-navy)]"
                >
                  <span className="relative block aspect-[16/9] overflow-hidden bg-[var(--color-line-light)]">{activity.visual}</span>
                  <span className="flex flex-1 flex-col p-[clamp(28px,3vw,40px)]">
                    <span className={`block ${h3}`}>{activity.title}</span>
                    <span className={`mt-3 block max-w-[48ch] ${body}`}>{activity.description}</span>
                    <span className="mt-auto pt-7 text-[15px] font-semibold text-[var(--color-blue)]">{activity.linkLabel}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="mt-[clamp(96px,10vw,152px)]">
        <StatsSection />
      </div>

      <AudienceDividerSection />

      <ContactSection />
    </main>
  );
}
