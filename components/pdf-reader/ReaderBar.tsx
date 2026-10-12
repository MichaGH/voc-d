"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { ROUTES } from "@/constants/routes";
import { parsePageInput } from "@/lib/pdf-reader/navigation";
import { SHEET_FORMS, plural } from "@/lib/format/plural";
import { formatZoom } from "@/lib/pdf-reader/zoom";
import type { EditionInsert } from "@/types/content";

export interface ReaderIdentity {
  /** e.g. "Plynár – Vodár – Kúrenár + Klimatizácia". */
  magazineTitle: string;
  /** Short name for narrow screens, e.g. "PVK". */
  abbreviation: string;
  label: string;
}

export interface ReaderNavigation {
  ready: boolean;
  /** Current view, e.g. "12–13" or "5". */
  current: string;
  pageCount: number;
  canPrevious: boolean;
  canNext: boolean;
  onFirstJump: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onLastJump: () => void;
  onGoTo: (page: number) => void;
  zoom: number;
  canZoomIn: boolean;
  canZoomOut: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

interface ReaderBarProps {
  identity: ReaderIdentity;
  /** Document currently open instead of the issue (a vkladačka). */
  viewingInsert?: string;
  onCloseInsert?: () => void;
  inserts?: EditionInsert[];
  onOpenInsert?: (key: string) => void;
  navigation?: ReaderNavigation;
}

const iconButton =
  "grid size-10 shrink-0 place-items-center rounded-[10px] text-white transition-colors hover:bg-white/16 aria-disabled:cursor-default aria-disabled:opacity-35 aria-disabled:hover:bg-transparent disabled:opacity-35 disabled:hover:bg-transparent";

/**
 * The reader's single control surface, fixed to the bottom of the screen:
 * identity on the left, page controls on the right. Unavailable actions use
 * aria-disabled so the focused control keeps focus at the ends of the issue.
 */
export default function ReaderBar({ identity, viewingInsert, onCloseInsert, inserts = [], onOpenInsert, navigation }: ReaderBarProps) {
  return (
    <div className="relative z-30 shrink-0 bg-[var(--color-primary)] pb-[env(safe-area-inset-bottom)] text-white">
      <div className="flex h-16 items-center justify-between gap-2 px-2 sm:px-4">
        <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
          <Link href={ROUTES.home} aria-label="VOC.SK – úvodná stránka" className={iconButton}>
            <HomeIcon />
          </Link>
          <p className="min-w-0 truncate text-[15px] leading-tight">
            <span className="hidden font-bold tracking-[-.01em] sm:inline">VOC</span>
            <span className="hidden px-1.5 text-white/55 sm:inline">/</span>
            <span className="hidden md:inline">{identity.magazineTitle}</span>
            <span className="font-semibold md:hidden">{identity.abbreviation}</span>
            <span className="ml-1.5 font-bold sm:ml-2">{identity.label}</span>
            {viewingInsert && (
              <span className="hidden lg:inline">
                <span className="px-1.5 text-white/55">/</span>
                {viewingInsert}
              </span>
            )}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
          {viewingInsert ? (
            <button
              type="button"
              onClick={onCloseInsert}
              className="mr-1 inline-flex h-10 items-center gap-2 rounded-[10px] bg-white px-3 text-[14px] font-semibold text-[var(--color-primary)] transition-colors hover:bg-[var(--color-cyan)] hover:text-[var(--color-navy)]"
            >
              <span aria-hidden="true">←</span> <span className="hidden sm:inline">Späť na</span> časopis
            </button>
          ) : (
            inserts.length > 0 && onOpenInsert && <InsertsMenu inserts={inserts} onOpen={onOpenInsert} />
          )}
          {navigation && <PageControls navigation={navigation} />}
        </div>
      </div>
    </div>
  );
}

function PageControls({ navigation }: { navigation: ReaderNavigation }) {
  const { ready, current, pageCount, canPrevious, canNext } = navigation;
  const inputId = useId();
  const errorId = useId();
  const [draft, setDraft] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const result = parsePageInput(draft ?? "", pageCount);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setError(null);
    setDraft(null);
    (document.activeElement as HTMLElement | null)?.blur();
    navigation.onGoTo(result.page);
  };

  useEffect(() => {
    if (!error) return;
    const timer = window.setTimeout(() => setError(null), 3200);
    return () => window.clearTimeout(timer);
  }, [error]);

  return (
    <>
      <div className="mr-1 hidden items-center md:flex" role="group" aria-label="Veľkosť strán">
        <ControlButton label="Zmenšiť" ready={ready} available={navigation.canZoomOut} onClick={navigation.onZoomOut}>
          <MinusIcon />
        </ControlButton>
        <span className="w-12 text-center text-[13px] font-semibold text-white/75 tabular-nums">{formatZoom(navigation.zoom)}</span>
        <ControlButton label="Zväčšiť" ready={ready} available={navigation.canZoomIn} onClick={navigation.onZoomIn}>
          <PlusIcon />
        </ControlButton>
        <span aria-hidden="true" className="mx-2 h-6 w-px bg-white/25" />
      </div>

      <span className="hidden sm:contents">
        <ControlButton label="O 10 strán späť" ready={ready} available={canPrevious} onClick={navigation.onFirstJump}>
          <ChevronIcon double direction="left" />
        </ControlButton>
      </span>
      <ControlButton label="Predchádzajúca strana" ready={ready} available={canPrevious} onClick={navigation.onPrevious}>
        <ChevronIcon direction="left" />
      </ControlButton>

      <form onSubmit={submit} className="relative mx-0.5 flex items-center gap-1.5" noValidate>
        <label htmlFor={inputId} className="sr-only">
          Prejsť na stranu (aktuálne {current} z {pageCount})
        </label>
        <input
          id={inputId}
          value={draft ?? (ready ? current : "–")}
          onFocus={(event) => {
            setDraft(current.split("–")[0]);
            requestAnimationFrame(() => event.target.select());
          }}
          onBlur={() => setDraft(null)}
          onChange={(event) => {
            setDraft(event.target.value);
            if (error) setError(null);
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") (event.target as HTMLInputElement).blur();
          }}
          inputMode="numeric"
          autoComplete="off"
          enterKeyHint="go"
          disabled={!ready}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className="h-10 w-[4.75rem] rounded-[10px] border border-white/25 bg-white/12 px-1 text-center text-[15px] font-semibold text-white tabular-nums outline-none transition-colors placeholder:text-white/60 hover:bg-white/18 focus-visible:border-white focus-visible:bg-white focus-visible:text-[var(--color-primary)] aria-invalid:border-[#ffb4a8]"
        />
        <span className="text-[15px] font-medium text-white/75 tabular-nums">/ {ready ? pageCount : "–"}</span>
        {error && (
          <p
            id={errorId}
            role="alert"
            className="absolute right-0 bottom-[calc(100%+14px)] w-max max-w-[70vw] rounded-[10px] bg-[var(--color-navy)] px-3.5 py-2 text-[14px] font-medium text-white shadow-lg"
          >
            {error}
          </p>
        )}
      </form>

      <ControlButton label="Nasledujúca strana" ready={ready} available={canNext} onClick={navigation.onNext}>
        <ChevronIcon direction="right" />
      </ControlButton>
      <span className="hidden sm:contents">
        <ControlButton label="O 10 strán ďalej" ready={ready} available={canNext} onClick={navigation.onLastJump}>
          <ChevronIcon double direction="right" />
        </ControlButton>
      </span>
    </>
  );
}

function ControlButton({ label, ready, available, onClick, children }: { label: string; ready: boolean; available: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      className={iconButton}
      disabled={!ready}
      aria-disabled={!available || undefined}
      aria-label={label}
      title={label}
      onClick={() => available && onClick()}
    >
      {children}
    </button>
  );
}

/** "Súčasťou čísla": the issue's inserts, opened above the bar. */
function InsertsMenu({ inserts, onOpen }: { inserts: EditionInsert[]; onOpen: (key: string) => void }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative mr-1 sm:mr-2">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-white/30 px-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-white/16 aria-expanded:bg-white aria-expanded:text-[var(--color-primary)] sm:px-3"
      >
        <InsertIcon />
        <span className="hidden lg:inline">Súčasťou čísla</span>
        <span className="grid size-5 place-items-center rounded-full bg-[var(--color-cyan)] text-[12px] font-bold text-[var(--color-navy)]">{inserts.length}</span>
      </button>
      {open && (
        <div
          id={panelId}
          role="region"
          aria-label="Súčasťou čísla"
          className="absolute right-0 bottom-[calc(100%+12px)] w-[min(420px,calc(100vw-16px))] rounded-[18px] border border-[var(--color-line)] bg-white p-3 text-[var(--color-navy)] shadow-[0_24px_60px_-20px_rgba(4,23,58,.45)]"
        >
          <p className="px-2 pt-1 pb-2 text-[13px] font-semibold tracking-[.06em] text-[var(--color-muted)] uppercase">Súčasťou čísla</p>
          <ul className="grid list-none gap-1">
            {inserts.map((insert) => {
              const facts = [
                insert.paperFormat ? (insert.paperFormat.kind === "other" ? insert.paperFormat.label : insert.paperFormat.kind) : null,
                insert.physicalSheetCount ? `${insert.physicalSheetCount} ${plural(insert.physicalSheetCount, SHEET_FORMS)}` : null,
                insert.digital ? null : "len v tlačenom vydaní",
              ].filter(Boolean);
              const body = (
                <>
                  {insert.preview ? (
                    <Image src={insert.preview.src} alt="" width={insert.preview.width} height={insert.preview.height} sizes="48px" className="h-auto w-12 shrink-0 rounded-[3px] shadow" />
                  ) : (
                    <span aria-hidden="true" className="grid h-16 w-12 shrink-0 place-items-center rounded-[4px] bg-[var(--color-blue-wash)] text-[var(--color-primary)]">
                      <InsertIcon />
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] leading-snug font-semibold text-balance">{insert.title}</span>
                    {insert.description && <span className="mt-1 block text-[14px] leading-snug text-[var(--color-copy)]">{insert.description}</span>}
                    {facts.length > 0 && <span className="mt-1.5 block text-[13px] text-[var(--color-muted)]">{facts.join(" · ")}</span>}
                  </span>
                  {insert.digital && <span className="shrink-0 self-center rounded-[8px] bg-[var(--color-primary)] px-3 py-1.5 text-[13px] font-semibold text-white">Otvoriť</span>}
                </>
              );
              return (
                <li key={insert.key}>
                  {insert.digital ? (
                    <button
                      type="button"
                      onClick={() => {
                        setOpen(false);
                        onOpen(insert.key);
                      }}
                      className="flex w-full items-start gap-3 rounded-[12px] p-2 text-left transition-colors hover:bg-[var(--color-surface)]"
                    >
                      {body}
                    </button>
                  ) : (
                    <div className="flex items-start gap-3 p-2">{body}</div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

/* Icons (stroke icons, 20px) */

function HomeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5.5 9v11h13V9" />
      <path d="M10 20v-5.5h4V20" />
    </svg>
  );
}

function ChevronIcon({ direction, double = false }: { direction: "left" | "right"; double?: boolean }) {
  const flip = direction === "left" ? "scale(-1 1) translate(-24 0)" : undefined;
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <g transform={flip}>{double ? <path d="m6 6 6 6-6 6M13 6l6 6-6 6" /> : <path d="m9 6 6 6-6 6" />}</g>
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function MinusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
      <path d="M5 12h14" />
    </svg>
  );
}

function InsertIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7 3h7l5 5v13H7z" />
      <path d="M14 3v5h5" />
      <path d="M4 7v14h11" />
    </svg>
  );
}
