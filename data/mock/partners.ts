import type { Partner } from "@/types/content";

/** FIXTURE partner names carried over from the chosen design; roster unverified. */
const names = [
  "Viessmann",
  "Buderus",
  "Vaillant",
  "Protherm",
  "Geberit",
  "Danfoss",
  "Grundfos",
  "Wilo",
  "Rehau",
  "Uponor",
  "Honeywell",
  "Siemens",
];

export const mockPartners: Partner[] = names.map((name) => ({
  key: name.toLowerCase(),
  name,
}));
