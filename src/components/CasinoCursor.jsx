// src/components/CasinoCursor.jsx
import React, { useEffect, useRef } from "react";

const HOVER_SELECTOR =
  'a,button,[role="button"],input,select,textarea,[data-cursor="link"],.as-link';

export default function CasinoCursor() {
  const ref = useRef(null);

  useEffect(() => {
    const supportsCustom = matchMedia(
      "(hover: hover) and (pointer: fine)"
    ).matches;
    const root = document.documentElement;

    if (!supportsCustom) {
      root.setAttribute("data-cursor", "regular"); // fallback to OS cursor
      return;
    }
    root.removeAttribute("data-cursor");

    const el = ref.current;
    if (!el) return;

    // start hidden to avoid a dot at (0,0)
    el.classList.add("is-hidden");

    // preload svgs
    [
      "/cursors/openhand.svg",
      "/cursors/pointinghand.svg",
      "/cursors/closedhand.svg",
    ].forEach((src) => {
      const i = new Image();
      i.src = src;
    });

    const onMove = (e) => {
      el.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%) translateZ(0)`;
      el.classList.remove("is-hidden");
      el.classList.toggle("is-point", !!e.target.closest(HOVER_SELECTOR));
    };
    const onDown = (e) => {
      if (e.button === 0) el.classList.add("is-down");
    };
    const onUp = () => el.classList.remove("is-down");

    // hide while scrolling/gesture; will reappear on next pointermove
    const hide = () => el.classList.add("is-hidden");
    const leave = () => el.classList.add("is-hidden");

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("wheel", hide, { passive: true });
    window.addEventListener("scroll", hide, { passive: true });
    window.addEventListener("touchmove", hide, { passive: true });
    window.addEventListener("pointerleave", leave);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("wheel", hide);
      window.removeEventListener("scroll", hide);
      window.removeEventListener("touchmove", hide);
      window.removeEventListener("pointerleave", leave);
    };
  }, []);

  return <div className="cursor-inner" aria-hidden="true" ref={ref} />;
}
