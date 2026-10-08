export const CONTACT = {
  email: "voc@voc.sk",
  phoneDisplay: "+421 55 678 28 08",
  phoneHref: "tel:+421556782808",
  company: "V.O.Č. SLOVAKIA s.r.o.",
  street: "Školská 23",
  city: "040 11 Košice",
} as const;

/** Builds a pre-filled e-mail link to the publisher. */
export function mailto(subject?: string) {
  return subject ? `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}` : `mailto:${CONTACT.email}`;
}

/**
 * Shared non-route destinations. The legacy voc.sk website is deliberately not
 * linked from anywhere: every destination is a page of this site, an e-mail,
 * or TZBportal.sk (a separate portal of the publisher).
 */
export const LINKS = {
  tzbPortal: "https://www.tzbportal.sk/",
  advertise: mailto("Inzercia"),
  email: mailto(),
} as const;
