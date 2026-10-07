import Link from "next/link";
import { buttonPrimary, buttonSecondary, display, eyebrow, lead } from "@/components/shared/ui";
import { ROUTES } from "@/constants/routes";

export default function NotFound() {
  return (
    <main id="obsah" className="flex flex-1 items-center px-5 pt-[calc(76px+64px)] pb-16 md:px-8 xl:px-12">
      <div className="mx-auto w-full max-w-[1400px]">
        <p className={eyebrow}>Chyba 404</p>
        <h1 className={`mt-4 max-w-[14ch] ${display}`}>
          Túto stránku sme nenašli.
        </h1>
        <p className={`mt-6 max-w-[48ch] ${lead}`}>
          Adresa mohla byť zmenená alebo už neexistuje. Skúste začať od časopisov alebo z úvodnej stránky.
        </p>
        <div className="mt-9 flex flex-wrap gap-3">
          <Link href={ROUTES.magazines} className={buttonPrimary}>
            Časopisy
          </Link>
          <Link href={ROUTES.home} className={buttonSecondary}>
            Úvodná stránka
          </Link>
        </div>
      </div>
    </main>
  );
}
