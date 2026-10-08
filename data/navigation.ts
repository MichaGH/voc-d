import { ROUTES } from "@/constants/routes";

/**
 * Primary navigation labels. Destinations come from the central route
 * registry; the magazines entry expands into per-magazine links.
 */
export interface NavigationItem {
  label: string;
  href: string;
  kind?: "magazines";
}

export const navigation: NavigationItem[] = [
  { label: "Časopisy", href: ROUTES.magazines, kind: "magazines" },
  { label: "Vzdelávanie", href: ROUTES.education },
  { label: "Inzercia", href: ROUTES.advertising },
  { label: "O nás", href: ROUTES.about },
  { label: "Kontakt", href: ROUTES.contact },
];
