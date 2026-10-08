/**
 * Shared VOC type scale, spacing and actions. Every section uses these so
 * headings, eyebrows, gaps and buttons stay identical across pages.
 */

/* Layout */
export const sectionX = "px-5 md:px-8 xl:px-12";
export const inner = "mx-auto w-full max-w-[1400px]";
export const sectionTop = "pt-[clamp(96px,10vw,152px)]";
/** Gap between a section header and its content. */
export const headerGap = "mt-[clamp(40px,4.5vw,64px)]";
/** First element below the fixed 76px header on light subpages. */
export const pageTop = "pt-[calc(76px+clamp(36px,4.5vw,64px))]";

/* Type */
export const eyebrow = "text-base font-semibold text-[var(--color-blue)]";
export const eyebrowOnDark = "text-base font-semibold text-[var(--color-blue-pale)]";
export const display = "text-[clamp(42px,5.4vw,84px)] leading-[.98] font-bold tracking-[-.04em] text-balance";
export const h2 = "text-[clamp(36px,4.4vw,64px)] leading-[1.02] font-bold tracking-[-.035em] text-balance";
export const h3 = "text-[clamp(24px,2.2vw,32px)] leading-[1.1] font-bold tracking-[-.025em] text-balance";
export const h4 = "text-[clamp(19px,1.5vw,22px)] leading-[1.25] font-semibold tracking-[-.01em] text-balance";
export const lead = "text-[clamp(17px,1.4vw,20px)] leading-[1.55] text-[var(--color-copy)] text-pretty";
export const leadOnDark = "text-[clamp(17px,1.4vw,20px)] leading-[1.55] text-[var(--color-hero-copy)] text-pretty";
export const body = "text-base leading-[1.6] text-[var(--color-copy)] text-pretty";
export const meta = "text-sm text-[var(--color-muted)]";

/* Actions */
const button =
  "inline-flex h-[52px] items-center justify-center gap-2.5 rounded-full px-6 text-[15px] font-semibold whitespace-nowrap no-underline transition-colors";
export const buttonPrimary = `${button} bg-[var(--color-navy)] text-white hover:bg-[var(--color-blue)] hover:text-white`;
export const buttonSecondary = `${button} border border-[var(--color-line-button)] bg-white text-[var(--color-navy)] hover:border-[var(--color-navy)] hover:text-[var(--color-navy)]`;
export const buttonOnDark = `${button} bg-white text-[var(--color-navy)] hover:bg-[var(--color-cyan)] hover:text-[var(--color-navy)]`;
export const buttonOutlineOnDark = `${button} border border-white/40 text-white hover:bg-white/12 hover:text-white`;
export const textLink =
  "inline-flex items-center gap-1.5 text-[15px] font-semibold text-[var(--color-blue)] no-underline transition-colors hover:text-[var(--color-navy)]";
export const textLinkOnDark =
  "inline-flex items-center gap-1.5 text-[15px] font-semibold text-white no-underline transition-colors hover:text-[var(--color-blue-pale)]";
