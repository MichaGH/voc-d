import Link from "next/link";
import { ROUTES } from "@/constants/routes";

export default function NotFound() {
  return (
    <main id="obsah" className="flex flex-1 items-center px-5 pt-[calc(76px+64px)] pb-16 md:px-8 xl:px-12">
      <div className="mx-auto w-full max-w-[1400px]">
        <p className="text-[15px] font-semibold text-[var(--color-blue)]">Chyba 404</p>
        <h1 className="mt-3 max-w-[14ch] text-[clamp(40px,5.2vw,80px)] leading-[.98] font-bold tracking-[-.04em] text-balance">
          Túto stránku sme nenašli.
        </h1>
        <p className="mt-6 max-w-[52ch] text-lg text-[var(--color-copy)] text-pretty">
          Adresa mohla byť zmenená alebo už neexistuje. Skúste začať od časopisov alebo z úvodnej stránky.
        </p>
        <div className="mt-9 flex flex-wrap gap-3">
          <Link href={ROUTES.magazines} className="inline-flex h-14 items-center rounded-full bg-[var(--color-navy)] px-7 text-base font-semibold text-white no-underline hover:bg-[var(--color-blue)] hover:text-white">
            Časopisy
          </Link>
          <Link href={ROUTES.home} className="inline-flex h-14 items-center rounded-full border border-[var(--color-line-button)] px-7 text-base font-semibold text-[var(--color-navy)] no-underline hover:bg-[var(--color-surface)]">
            Úvodná stránka
          </Link>
        </div>
      </div>
    </main>
  );
}
