// src/components/LoadingScreen.jsx
import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useTheme } from "./ThemeContext";

export default function LoadingScreen({
  active = true,
  ready = false,
  minDuration = 800,
  safetyTimeout = 4000,
  onLoadingComplete,
}) {
  const { isDayMode } = useTheme();
  const dieRef = useRef(null);
  const containerRef = useRef(null);

  const [face, setFace] = useState(1);
  const startedAtRef = useRef(performance.now());
  const canHideRef = useRef(false);
  // pip map
  const faces = {
    1: [4],
    2: [0, 8],
    3: [0, 4, 8],
    4: [0, 2, 6, 8],
    5: [0, 2, 4, 6, 8],
    6: [0, 3, 6, 2, 5, 8],
  };

  // Flip animation
  useEffect(() => {
    if (!active) return;

    let tl = gsap.timeline({ repeat: -1 });
    let next = face;
    const pickNext = () => {
      next = ((Math.random() * 6) | 0) + 1;
      if (next === face) next = (next % 6) + 1;
    };
    const addFlip = () => {
      pickNext();
      tl.to(dieRef.current, {
        rotationY: "+=90",
        duration: 0.6,
        ease: "power2.inOut",
      })
        .call(() => setFace(next), [], "-=0.30")
        .to(dieRef.current, { y: -6, duration: 0.3, ease: "power1.out" }, "<")
        .to(
          dieRef.current,
          { y: 0, duration: 0.3, ease: "bounce.out" },
          "<0.15"
        );
    };
    addFlip();
    addFlip();
    return () => tl.kill();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  // Complete with no fade, no gap
  useEffect(() => {
    if (!active) return;
    let cancelled = false;

    (async () => {
      // wait for window load or safety
      await new Promise((r) => {
        if (document.readyState === "complete") r();
        else window.addEventListener("load", r, { once: true });
        setTimeout(r, safetyTimeout);
      });

      // wait for fonts
      if ("fonts" in document && "ready" in document.fonts) {
        try {
          await document.fonts.ready;
        } catch {}
      }

      // honor min duration
      const elapsed = performance.now() - startedAtRef.current;
      const wait = Math.max(0, minDuration - elapsed);
      if (wait) await new Promise((r) => setTimeout(r, wait));

      canHideRef.current = true;
      // if the stage is already ready, hide now; otherwise wait for it:
      if (ready && !cancelled) {
        requestAnimationFrame(() => {
          if (!containerRef.current) return;
          containerRef.current.style.display = "none"; // no fade
          onLoadingComplete?.();
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [active, minDuration, safetyTimeout, onLoadingComplete, ready]);

  // also react to `ready` toggling later
  useEffect(() => {
    if (!active) return;
    if (ready && canHideRef.current && containerRef.current) {
      requestAnimationFrame(() => {
        containerRef.current.style.display = "none";
        onLoadingComplete?.();
      });
    }
  }, [active, ready, onLoadingComplete]);

  // theme bits
  const stroke = isDayMode ? "#0b0b0b" : "#ffffff";
  const fill = isDayMode ? "#ffffff" : "#0b0b0b";
  const shadow = isDayMode ? "rgba(0,0,0,.22)" : "rgba(0,0,0,.45)";

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] grid place-items-center"
      style={{
        // Transparent, so underlying page bg is visible (no blue flash)
        background: `hsl(var(--background))`,
      }}
    >
      <div
        style={{
          perspective: 800,
          filter: `drop-shadow(0 12px 24px ${shadow})`,
        }}
      >
        <div
          ref={dieRef}
          style={{
            width: 112,
            height: 112,
            transformStyle: "preserve-3d",
            transformOrigin: "50% 50%",
            borderRadius: 18,
            background: fill,
            border: `2px solid ${stroke}`,
          }}
        >
          <div style={{ position: "relative", width: "100%", height: "100%" }}>
            {Array.from({ length: 9 }, (_, i) => {
              const row = Math.floor(i / 3);
              const col = i % 3;
              const left = 16 + col * 32;
              const top = 16 + row * 32;
              const visible = (faces[face] || []).includes(i);
              return (
                <span
                  key={i}
                  style={{
                    position: "absolute",
                    left,
                    top,
                    width: 11,
                    height: 11,
                    borderRadius: "50%",
                    background: stroke,
                    opacity: visible ? 1 : 0,
                    transition: "opacity 0.08s linear",
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
