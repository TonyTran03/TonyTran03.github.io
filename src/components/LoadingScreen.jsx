import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useTheme } from "./ThemeContext";

export default function LoadingScreen({ onLoadingComplete }) {
  const diamondRef = useRef();
  const containerRef = useRef();
  const { isDayMode } = useTheme();

  useGSAP(() => {
    const timeline = gsap.timeline({
      delay: 0.1,
      onComplete: () => {
        // Fade out the loading screen when animation completes
        gsap.to(containerRef.current, {
          opacity: 0,
          duration: 0.3,
          onComplete: onLoadingComplete,
        });
      },
    });

    // Animate the diamond drawing - draw in then draw out
    timeline
      .fromTo(
        diamondRef.current,
        { strokeDashoffset: 400, opacity: 1 },
        {
          strokeDashoffset: 0,
          ease: "power2.inOut",
          duration: 0.6,
        }
      )
      .to(
        diamondRef.current,
        {
          strokeDashoffset: -400,
          ease: "power2.inOut",
          duration: 0.6,
        },
        "+=0.05"
      );
  }, [onLoadingComplete]);

  const strokeColor = isDayMode ? "#000" : "#fff";

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--cookies)]"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 100 100"
        className="w-64 h-64"
      >
        <path
          ref={diamondRef}
          d="M50 0 L100 50 L50 100 L0 50 Z"
          stroke={strokeColor}
          strokeWidth="0.5"
          fill="none"
          opacity="1"
          style={{
            strokeDasharray: 400,
            strokeDashoffset: 400,
          }}
        />
      </svg>
    </div>
  );
}
