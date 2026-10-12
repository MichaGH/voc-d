"use client";

import { forwardRef, useId, useState, type FormEvent, type ReactNode } from "react";
import { parsePageInput } from "@/lib/pdf-reader/navigation";
import { formatZoom } from "@/lib/pdf-reader/zoom";

interface ReaderControlsProps {
  ready: boolean;
  label: string;
  pageCount: number;
  canPrevious: boolean;
  canNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onGoTo: (page: number) => void;
  zoom: number;
  canZoomIn: boolean;
  canZoomOut: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFit: () => void;
}

const iconButton =
  "inline-flex h-11 min-w-11 items-center justify-center gap-2 rounded-full px-3 text-[15px] font-semibold text-[var(--color-navy)] transition-colors hover:bg-[var(--color-surface-hover)] disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent aria-disabled:cursor-not-allowed aria-disabled:opacity-35 aria-disabled:hover:bg-transparent";
const primaryButton =
  "inline-flex h-11 min-w-11 items-center justify-center gap-2 rounded-full bg-[var(--color-navy)] px-3 text-[15px] font-semibold text-white transition-colors hover:bg-[var(--color-blue)] disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-[var(--color-navy)] aria-disabled:cursor-not-allowed aria-disabled:opacity-35 aria-disabled:hover:bg-[var(--color-navy)] sm:px-5";

/**
 * Unavailable actions use aria-disabled instead of disabled so the focused
 * control keeps focus when it becomes unavailable (e.g. on the last page).
 */
function unavailable(isUnavailable: boolean, action: () => void) {
  return {
    "aria-disabled": isUnavailable || undefined,
    onClick: () => {
      if (!isUnavailable) action();
    },
  };
}

/**
 * Bottom controls. Page navigation is sticky so it is always reachable; on
 * wide screens "Prejsť na stranu" and zoom share the same bar, on phones they
 * sit in a normal row below the pages so the sticky bar stays one row high.
 */
const ReaderControls = forwardRef<HTMLDivElement, ReaderControlsProps>(function ReaderControls(props, ref) {
  const { ready, label, canPrevious, canNext, onPrevious, onNext } = props;

  return (
    <>
      <div ref={ref} className="sticky bottom-0 z-20 pt-3 pb-[max(12px,env(safe-area-inset-bottom))]">
        <div className="mx-auto flex w-fit max-w-full items-center justify-center gap-x-2 rounded-[28px] border border-[var(--color-line)] bg-white/95 p-1.5 shadow-[0_18px_40px_-22px_rgba(4,23,58,.45)] backdrop-blur-md">
          <div className="flex items-center gap-1">
            <button type="button" className={iconButton} disabled={!ready} {...unavailable(!canPrevious, onPrevious)}>
              <span aria-hidden="true">←</span>
              <span className="sr-only sm:not-sr-only">Predchádzajúca</span>
            </button>
            <span className="min-w-[9.5rem] px-1 text-center text-[15px] font-semibold text-[var(--color-navy)] tabular-nums">
              {ready ? label : "Načítavam časopis…"}
            </span>
            <button type="button" className={primaryButton} disabled={!ready} {...unavailable(!canNext, onNext)}>
              <span className="sr-only sm:not-sr-only">Nasledujúca</span>
              <span aria-hidden="true">→</span>
            </button>
          </div>
          <div className="hidden items-center gap-x-2 md:flex">
            <Divider />
            <ReaderTools {...props} />
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 pb-6 md:hidden">
        <ReaderTools {...props} />
      </div>
    </>
  );
});

/** "Prejsť na stranu" and zoom (rendered once per breakpoint; the hidden copy is display:none). */
function ReaderTools(props: ReaderControlsProps) {
  const { ready, pageCount, onGoTo, zoom, canZoomIn, canZoomOut, onZoomIn, onZoomOut, onFit } = props;
  const inputId = useId();
  const errorId = useId();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const result = parsePageInput(value, pageCount);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setError(null);
    setValue("");
    onGoTo(result.page);
  };

  return (
    <>
      <form onSubmit={submit} className="relative flex items-center gap-1" noValidate>
        <label htmlFor={inputId} className="pl-2 text-[14px] font-medium whitespace-nowrap text-[var(--color-muted)]">
          Prejsť na stranu
        </label>
        <input
          id={inputId}
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            if (error) setError(null);
          }}
          inputMode="numeric"
          autoComplete="off"
          enterKeyHint="go"
          disabled={!ready}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className="h-11 w-14 rounded-full border border-[var(--color-line-button)] bg-white px-2 text-center text-[15px] font-semibold text-[var(--color-navy)] tabular-nums outline-none focus-visible:border-[var(--color-blue)] aria-invalid:border-[#c2410c] disabled:opacity-35"
        />
        <button type="submit" className={iconButton} disabled={!ready}>
          OK
        </button>
        {error && (
          <p
            id={errorId}
            role="alert"
            className="absolute bottom-[calc(100%+12px)] left-1/2 w-max max-w-[80vw] -translate-x-1/2 rounded-full bg-[var(--color-navy)] px-4 py-2 text-[14px] font-medium text-white shadow-lg"
          >
            {error}
          </p>
        )}
      </form>

      <Divider />

      <div className="flex items-center gap-1" role="group" aria-label="Veľkosť strán">
        <ZoomButton label="Zmenšiť" ready={ready} available={canZoomOut} onClick={onZoomOut}>
          −
        </ZoomButton>
        <span className="w-14 text-center text-[14px] font-semibold text-[var(--color-muted)] tabular-nums" aria-live="polite">
          <span className="sr-only">Priblíženie </span>
          {formatZoom(zoom)}
        </span>
        <ZoomButton label="Zväčšiť" ready={ready} available={canZoomIn} onClick={onZoomIn}>
          +
        </ZoomButton>
        <button type="button" className={iconButton} disabled={!ready} {...unavailable(zoom === 1, onFit)}>
          Prispôsobiť
        </button>
      </div>
    </>
  );
}

export default ReaderControls;

interface ZoomButtonProps {
  label: string;
  ready: boolean;
  available: boolean;
  onClick: () => void;
  children: ReactNode;
}

function ZoomButton({ label, ready, available, onClick, children }: ZoomButtonProps) {
  return (
    <button
      type="button"
      className={`${iconButton} w-11 px-0 text-[22px] leading-none`}
      disabled={!ready}
      {...unavailable(!available, onClick)}
      aria-label={label}
      title={label}
    >
      <span aria-hidden="true">{children}</span>
    </button>
  );
}

function Divider() {
  return <span aria-hidden="true" className="mx-1 hidden h-7 w-px bg-[var(--color-line)] md:block" />;
}
