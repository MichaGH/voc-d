import type { EditorialPlan } from "@/types/content";

/**
 * FIXTURE editorial plans. Dates are illustrative placeholders that only
 * demonstrate the contract (day vs. month precision, past/current/future
 * years, links to published editions). Replace with owner-approved schedules.
 */
export const mockEditorialPlans: EditorialPlan[] = [
  {
    magazineKey: "pvk",
    year: 2025,
    entries: [
      { key: "pvk-2025-1", issueLabel: "1/2025", order: 1, distribution: { precision: "month", value: "2025-02" }, submissionDeadline: { precision: "day", value: "2025-01-24" }, theme: "Veľtrhy a novinky výrobcov" },
      { key: "pvk-2025-2", issueLabel: "2/2025", order: 2, distribution: { precision: "month", value: "2025-04" }, submissionDeadline: { precision: "day", value: "2025-03-21" }, theme: "Zdravotechnika a rozvody vody" },
      { key: "pvk-2025-3", issueLabel: "3/2025", order: 3, distribution: { precision: "month", value: "2025-06" }, submissionDeadline: { precision: "day", value: "2025-05-23" }, theme: "Klimatizácia a vetranie" },
      { key: "pvk-2025-4", issueLabel: "4/2025", order: 4, distribution: { precision: "month", value: "2025-09" }, submissionDeadline: { precision: "day", value: "2025-08-22" }, theme: "Vykurovacia sezóna" },
    ],
  },
  {
    magazineKey: "pvk",
    year: 2026,
    entries: [
      { key: "pvk-2026-1", issueLabel: "1/2026", order: 1, distribution: { precision: "month", value: "2026-02" }, submissionDeadline: { precision: "day", value: "2026-01-23" }, theme: "Aquatherm Praha, fotovoltika", editionSlug: "1-2026" },
      { key: "pvk-2026-2", issueLabel: "2/2026", order: 2, distribution: { precision: "month", value: "2026-04" }, submissionDeadline: { precision: "day", value: "2026-03-20" }, theme: "Armatúry a tepelné siete", editionSlug: "2-2026" },
      { key: "pvk-2026-3", issueLabel: "3/2026", order: 3, distribution: { precision: "month", value: "2026-06" }, submissionDeadline: { precision: "day", value: "2026-05-22" }, theme: "Klimatizácia a kvalita vody", editionSlug: "3-2026" },
      { key: "pvk-2026-4", issueLabel: "4/2026", order: 4, distribution: { precision: "month", value: "2026-09" }, submissionDeadline: { precision: "day", value: "2026-08-21" }, theme: "Vykurovacia sezóna", note: "Pozvánka na konferenciu Správa budov jeseň 2026", editionSlug: "4-2026" },
    ],
  },
  {
    magazineKey: "pvk",
    year: 2027,
    entries: [
      { key: "pvk-2027-1", issueLabel: "1/2027", order: 1, distribution: { precision: "month", value: "2027-02" }, submissionDeadline: { precision: "day", value: "2027-01-22" }, theme: "Veľtrhové vydanie" },
      { key: "pvk-2027-2", issueLabel: "2/2027", order: 2, distribution: { precision: "month", value: "2027-04" }, theme: "Zdravotechnika a rozvody" },
      { key: "pvk-2027-3", issueLabel: "3/2027", order: 3, distribution: { precision: "month", value: "2027-06" } },
      { key: "pvk-2027-4", issueLabel: "4/2027", order: 4, distribution: { precision: "month", value: "2027-09" } },
    ],
  },
  {
    magazineKey: "sbd",
    year: 2026,
    entries: [
      { key: "sbd-2026-1", issueLabel: "1/2026", order: 1, distribution: { precision: "month", value: "2026-03" }, submissionDeadline: { precision: "day", value: "2026-02-13" }, theme: "Firma časopisu 2025, bezpečnosť v domoch", editionSlug: "1-2026" },
      { key: "sbd-2026-2", issueLabel: "2/2026", order: 2, distribution: { precision: "month", value: "2026-06" }, submissionDeadline: { precision: "day", value: "2026-05-15" }, theme: "Legislatíva a odborná spôsobilosť", editionSlug: "2-2026" },
      { key: "sbd-2026-3", issueLabel: "3/2026", order: 3, distribution: { precision: "month", value: "2026-10" }, submissionDeadline: { precision: "day", value: "2026-09-18" }, theme: "Obnova a energie" },
      { key: "sbd-2026-4", issueLabel: "4/2026", order: 4, distribution: { precision: "day", value: "2026-12-07" }, submissionDeadline: { precision: "day", value: "2026-11-13" }, theme: "Správa budov jeseň 2026", note: "Reportáž z jesennej konferencie" },
    ],
  },
  {
    magazineKey: "sbd",
    year: 2027,
    entries: [
      { key: "sbd-2027-1", issueLabel: "1/2027", order: 1, distribution: { precision: "month", value: "2027-03" }, theme: "Firma časopisu 2026" },
      { key: "sbd-2027-2", issueLabel: "2/2027", order: 2, distribution: { precision: "month", value: "2027-06" } },
    ],
  },
];
