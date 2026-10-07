import { LINKS } from "@/constants";
import type { Article, EducationOffer, PortableTextBlock } from "@/types/content";

/**
 * Education fixtures. Event names, dates and venues come from the supplied
 * magazine covers; body copy is a neutral working draft for owner review.
 */

let keySeed = 0;
const nextKey = () => `k${(keySeed += 1)}`;

function block(
  style: PortableTextBlock["style"],
  text: string,
  listItem?: PortableTextBlock["listItem"],
): PortableTextBlock {
  return {
    _type: "block",
    _key: nextKey(),
    style,
    ...(listItem ? { listItem, level: 1 } : {}),
    children: [{ _type: "span", _key: nextKey(), text, marks: [] }],
    markDefs: [],
  };
}

const p = (text: string) => block("normal", text);
const h2 = (text: string) => block("h2", text);
const li = (text: string) => block("normal", text, "bullet");

const BRATISLAVA = "Europe/Bratislava";

export const mockArticles: Article[] = [
  {
    section: "education",
    slug: "konferencia-sprava-budov-jesen-2026",
    kind: "conference",
    title: "Konferencia Správa budov jeseň 2026",
    excerpt:
      "Jubilejná 20. konferencia pre správcov bytových domov a profesie TZB sa uskutoční 5.\u00a0–\u00a06.\u00a0novembra\u00a02026 v Hoteli Galeria Thermal Bešeňová.",
    image: { src: "/images/topic-events.jpg", alt: "Rečník na odbornej konferencii", width: 1200, height: 782 },
    publishedOn: "2026-09-01",
    event: {
      start: { date: "2026-11-05" },
      end: { date: "2026-11-06" },
      timeZone: BRATISLAVA,
      location: "Hotel Galeria Thermal Bešeňová",
      registration: { label: "Program a prihláška", href: LINKS.conference },
    },
    magazines: ["sbd", "pvk"],
    relatedOffer: { label: "Stránka konferencie Správa budov", href: LINKS.conference },
    body: [
      p("Konferencia Správa budov je stretnutím správcov bytových domov, zástupcov spoločenstiev vlastníkov, bytových družstiev a odborníkov z oblasti technických zariadení budov. Jesenný ročník 2026 je v poradí dvadsiaty."),
      h2("Pre koho je konferencia určená"),
      li("správcovia bytových domov a zástupcovia spoločenstiev vlastníkov,"),
      li("bytové družstvá a vlastníci nehnuteľností,"),
      li("projektanti, dodávatelia a firmy z oblasti TZB."),
      h2("Program a prihlásenie"),
      p("Podrobný program, podmienky účasti a prihlášku zverejňujeme na stránke konferencie. S otázkami vám radi pomôžeme aj e-mailom alebo telefonicky."),
    ],
  },
  {
    section: "education",
    slug: "kurz-sprava-bytoveho-fondu",
    kind: "course",
    title: "Akreditovaný kurz Správa bytového fondu",
    excerpt:
      "96-hodinový kurz pre záujemcov o kvalifikáciu správcu podľa zákona č. 246/2015 Z. z. o správcoch bytových domov.",
    image: { src: "/images/education-course.jpg", alt: "Štúdium pri pracovnom stole", width: 1400, height: 1750 },
    publishedOn: "2026-06-15",
    magazines: ["sbd"],
    relatedOffer: { label: "Stránka kurzu Správa bytového fondu", href: LINKS.course },
    body: [
      p("Akreditovaný kurz Správa bytového fondu pripravuje účastníkov na výkon činnosti správcu bytových domov. Rozsah kurzu je 96 hodín."),
      h2("Čo kurz pokrýva"),
      li("právne predpisy upravujúce správu bytových domov,"),
      li("hospodárenie s fondom prevádzky, údržby a opráv,"),
      li("technické zariadenia budov a ich prevádzku."),
      p("Termíny najbližších behov a podmienky prihlásenia nájdete na stránke kurzu."),
    ],
  },
  {
    section: "education",
    slug: "sprava-budov-jar-2026-tri-dni-odbornych-poznatkov",
    kind: "article",
    title: "Správa budov jar 2026: tri dni odborných poznatkov",
    excerpt:
      "19. medzinárodná konferencia Správa budov sa konala 15.\u00a0–\u00a017.\u00a0apríla\u00a02026 v Bešeňovej. Krátke ohliadnutie prináša aj vydanie 2/2026 časopisu Správca bytových domov.",
    image: { src: "/images/role-advertiser.jpg", alt: "Čitateľ s odborným časopisom", width: 1400, height: 933 },
    publishedOn: "2026-05-20",
    magazines: ["sbd"],
    body: [
      p("Jarná konferencia Správa budov 2026 opäť spojila správcov bytových domov, spoločenstvá vlastníkov a odborníkov z praxe. Tri dni prednášok a diskusií sa venovali legislatíve, obnove domov a technike budov."),
      p("Podrobnejšie ohliadnutie za konferenciou nájdete vo vydaní 2/2026 časopisu Správca bytových domov."),
    ],
  },
  {
    section: "education",
    slug: "konferencia-sprava-budov-jar-2026",
    kind: "conference",
    title: "Konferencia Správa budov jar 2026",
    excerpt:
      "19. medzinárodná konferencia Správa budov v Hoteli Galeria Thermal Bešeňová, 15.\u00a0–\u00a017.\u00a0apríla\u00a02026.",
    publishedOn: "2026-01-20",
    event: {
      start: { date: "2026-04-15" },
      end: { date: "2026-04-17" },
      timeZone: BRATISLAVA,
      location: "Hotel Galeria Thermal Bešeňová",
    },
    magazines: ["sbd", "pvk"],
    relatedOffer: { label: "Stránka konferencie Správa budov", href: LINKS.conference },
    body: [
      p("Pozývame vás na 19. medzinárodnú konferenciu Správa budov, ktorá sa uskutoční 15.\u00a0–\u00a017.\u00a0apríla\u00a02026 v Hoteli Galeria Thermal Bešeňová."),
      p("Program a prihlášku zverejňujeme na stránke konferencie."),
    ],
  },
  {
    section: "education",
    slug: "sprava-budov-jesen-2025-najnovsie-trendy",
    kind: "article",
    title: "Správa budov jeseň 2025 odhalila najnovšie trendy",
    excerpt:
      "Jesenná konferencia ukázala, čím žije správa bytových domov. Ohliadnutie prinieslo vydanie 4/2025 časopisu Správca bytových domov.",
    image: { src: "/images/about.jpg", alt: "Fasáda panelového bytového domu", width: 2400, height: 1600 },
    publishedOn: "2025-12-10",
    magazines: ["sbd"],
    body: [
      p("Jesenný ročník konferencie Správa budov 2025 priniesol prehľad tém, ktoré správcov bytových domov čakajú v nasledujúcom období — od legislatívnych zmien po obnovu a energie."),
      p("Celé ohliadnutie nájdete vo vydaní 4/2025 časopisu Správca bytových domov."),
    ],
  },
];

export const mockEducationOffers: EducationOffer[] = [
  {
    key: "konferencia",
    kind: "conference",
    label: "Medzinárodná konferencia",
    title: "Konferencia Správa budov",
    description: "Riešenia pre správu bytových domov a nehnuteľností. Jarný a jesenný ročník.",
    image: { src: "/images/conference.jpg", alt: "", width: 1980, height: 300 },
    href: LINKS.conference,
  },
  {
    key: "kurz",
    kind: "course",
    label: "Akreditovaný kurz · 96 hodín",
    title: "Kurz Správa bytového fondu",
    description: "Kvalifikácia podľa zákona č. 246/2015 Z. z. o správcoch bytových domov.",
    image: { src: "/images/education-course.jpg", alt: "Štúdium pri pracovnom stole", width: 1400, height: 1750 },
    href: LINKS.course,
  },
];
