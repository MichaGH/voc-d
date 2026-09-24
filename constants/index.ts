export const SITE_URL = "https://voc.sk";

export const CONTACT = {
  email: "voc@voc.sk",
  phoneDisplay: "+421 55 678 28 08",
  phoneHref: "tel:+421556782808",
  company: "V.O.Č. SLOVAKIA s.r.o.",
  street: "Školská 23",
  city: "040 11 Košice",
} as const;

export const LINKS = {
  sbd: `${SITE_URL}/spravca-bytovych-domov/zakladne-informacie/`,
  pvk: `${SITE_URL}/plynar-vodar-kurenar-klimatizacia/zakladne-informacie/`,
  sbdAds: `${SITE_URL}/spravca-bytovych-domov/inzercia/`,
  pvkAds: `${SITE_URL}/plynar-vodar-kurenar-klimatizacia/inzercia/`,
  about: `${SITE_URL}/uvod/o-nas/`,
  history: `${SITE_URL}/uvod/historia/`,
  services: `${SITE_URL}/uvod/sluzby/`,
  gdpr: `${SITE_URL}/uvod/ochrana-osobnych-udajov-gdpr/`,
  conference: `${SITE_URL}/konferencia-sprava-budov/`,
  course: `${SITE_URL}/kurz-sprava-bytoveho-fondu/`,
  publication: `${SITE_URL}/wp-content/uploads/LetakUcebnica.pdf`,
  tzbPortal: "http://www.tzbportal.sk/",
  advertise: "mailto:voc@voc.sk?subject=Inzercia",
  email: "mailto:voc@voc.sk",
} as const;
