"use client";

import { useLayoutEffect, useRef } from "react";

export interface PageTurnSpec {
  id: number;
  direction: 1 | -1;
  /** Page box size in CSS pixels (one page of the spread). */
  pageWidth: number;
  pageHeight: number;
  /** Bitmaps of the outgoing view [left, right] and the incoming view [left, right]. */
  from: [HTMLCanvasElement, HTMLCanvasElement];
  to: [HTMLCanvasElement, HTMLCanvasElement];
}

const DURATION = 680;
const EASING = "cubic-bezier(.32,.08,.18,1)";

/**
 * A magazine page turn drawn over the spread. The real view has already
 * switched underneath; this overlay shows copies of the prepared bitmaps
 * (no re-render, no download) and removes itself when the leaf lands.
 *
 * Forward: the right page lifts at the spine and turns left, showing the
 * next left page on its back while the next right page is revealed beneath.
 * Backward mirrors it.
 */
export default function PageTurn({ spec, onDone }: { spec: PageTurnSpec; onDone: (id: number) => void }) {
  const leafRef = useRef<HTMLDivElement>(null);
  const leftHost = useRef<HTMLDivElement>(null);
  const rightHost = useRef<HTMLDivElement>(null);
  const frontHost = useRef<HTMLDivElement>(null);
  const backHost = useRef<HTMLDivElement>(null);
  const shadeFront = useRef<HTMLDivElement>(null);
  const shadeBack = useRef<HTMLDivElement>(null);
  const shadeUnder = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const forward = spec.direction === 1;
    const [fromLeft, fromRight] = spec.from;
    const [toLeft, toRight] = spec.to;
    const copies = {
      left: copy(forward ? fromLeft : toLeft),
      right: copy(forward ? toRight : fromRight),
      front: copy(forward ? fromRight : fromLeft),
      back: copy(forward ? toLeft : toRight),
    };
    leftHost.current?.replaceChildren(copies.left);
    rightHost.current?.replaceChildren(copies.right);
    frontHost.current?.replaceChildren(copies.front);
    backHost.current?.replaceChildren(copies.back);

    const options: KeyframeAnimationOptions = { duration: DURATION, easing: EASING, fill: "forwards" };
    const end = forward ? -180 : 180;
    const animations = [
      leafRef.current?.animate([{ transform: "rotateY(0deg)" }, { transform: `rotateY(${end}deg)` }], options),
      shadeFront.current?.animate([{ opacity: 0 }, { opacity: 0.32 }], { ...options, duration: DURATION / 2 }),
      shadeBack.current?.animate([{ opacity: 0.32 }, { opacity: 0.32, offset: 0.5 }, { opacity: 0 }], options),
      shadeUnder.current?.animate([{ opacity: 0.22 }, { opacity: 0 }], options),
    ];
    const leaf = animations[0];
    if (leaf) leaf.onfinish = () => onDone(spec.id);
    else onDone(spec.id);

    return () => {
      for (const animation of animations) animation?.cancel();
      for (const canvas of Object.values(copies)) {
        canvas.width = 0;
        canvas.height = 0;
      }
    };
    // A spec is immutable; a new turn arrives with a new key.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const forward = spec.direction === 1;
  const { pageWidth: width, pageHeight: height } = spec;
  const face = "absolute inset-0 overflow-hidden [backface-visibility:hidden] [-webkit-backface-visibility:hidden]";

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-10" style={{ perspective: width * 5.5 }}>
      <div ref={leftHost} className="reader-turn-page absolute top-0 left-0 bg-white" style={{ width, height }} />
      <div ref={rightHost} className="reader-turn-page absolute top-0 bg-white" style={{ left: width, width, height }} />
      {/* Shadow cast on the page being uncovered. */}
      <div
        ref={shadeUnder}
        className="absolute top-0"
        style={{
          left: forward ? width : 0,
          width,
          height,
          background: forward
            ? "linear-gradient(to right, rgba(4,23,58,.55), rgba(4,23,58,0) 45%)"
            : "linear-gradient(to left, rgba(4,23,58,.55), rgba(4,23,58,0) 45%)",
        }}
      />
      <div
        ref={leafRef}
        className="absolute top-0 [transform-style:preserve-3d]"
        style={{ left: forward ? width : 0, width, height, transformOrigin: forward ? "left center" : "right center" }}
      >
        <div className={`${face} bg-white`}>
          <div ref={frontHost} className="reader-turn-page size-full" />
          <div
            ref={shadeFront}
            className="absolute inset-0 opacity-0"
            style={{ background: `linear-gradient(to ${forward ? "left" : "right"}, rgba(4,23,58,.7), rgba(4,23,58,0) 70%)` }}
          />
        </div>
        <div className={`${face} bg-white [transform:rotateY(180deg)]`}>
          <div ref={backHost} className="reader-turn-page size-full" />
          <div
            ref={shadeBack}
            className="absolute inset-0"
            style={{ background: `linear-gradient(to ${forward ? "left" : "right"}, rgba(4,23,58,0) 30%, rgba(4,23,58,.6))` }}
          />
        </div>
      </div>
    </div>
  );
}

/** GPU copy of a page bitmap (the original stays in the live page). */
function copy(source: HTMLCanvasElement) {
  const canvas = document.createElement("canvas");
  canvas.width = source.width;
  canvas.height = source.height;
  canvas.getContext("2d")?.drawImage(source, 0, 0);
  return canvas;
}
