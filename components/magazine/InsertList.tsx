import Image from "next/image";
import { SHEET_FORMS, plural } from "@/lib/format/plural";
import type { EditionInsert, PaperFormat } from "@/types/content";

function formatLabel(format: PaperFormat) {
  return format.kind === "other" ? format.label : format.kind;
}

/** Vkladačky of one edition. Printed presence and digital availability are stated separately. */
export default function InsertList({ inserts }: { inserts: EditionInsert[] }) {
  return (
    <ul className="grid list-none gap-4 sm:grid-cols-2">
      {inserts.map((insert) => {
        const facts = [
          insert.paperFormat ? formatLabel(insert.paperFormat) : null,
          insert.physicalSheetCount ? `${insert.physicalSheetCount} ${plural(insert.physicalSheetCount, SHEET_FORMS)}` : null,
          insert.digital ? "tlačená aj elektronická verzia" : "len v tlačenom vydaní",
          insert.sponsor ? `partner: ${insert.sponsor}` : null,
        ].filter(Boolean);
        return (
          <li key={insert.key} className="flex gap-5 rounded-[24px] bg-[var(--color-surface)] p-6">
            {insert.preview && (
              <Image
                src={insert.preview.src}
                alt={insert.preview.alt}
                width={insert.preview.width}
                height={insert.preview.height}
                sizes="88px"
                className="h-auto w-[88px] shrink-0 self-start rounded-[3px] shadow-[0_12px_22px_-14px_rgba(4,23,58,.45)]"
              />
            )}
            <div className="min-w-0">
              <h3 className="text-lg leading-snug font-semibold text-balance">{insert.title}</h3>
              {insert.description && <p className="mt-2 text-[15px] leading-[1.6] text-[var(--color-copy)] text-pretty">{insert.description}</p>}
              <p className="mt-4 text-sm text-[var(--color-muted)]">{facts.join(" · ")}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
