import React from "react";
import { useParticlesConnection } from "./ParticlesConnectionContext";

/**
 * MinimalPillNavbar – purely presentational, no functionality.
 * - Sideways oval (pill) buttons sized for a large circular cursor
 * - Subtle glass/blur card with soft shadow
 * - Clean hover/focus visuals; dark mode friendly
 * - No routing, no state — swap labels below to fit your site
 */

const NAV_ITEMS = ["About", "Projects", "Writing", "Contacts"];

export default function MinimalPillNavbar() {
  const { toggleConnections } = useParticlesConnection();

  const GlobalStyles = () => (
    <style>{`
      body.cursor-regular .cursor-inner, body.cursor-regular .cursor-outer { opacity: 0; }
      html[data-mode="day"] { --nav-fg: #1f2937; }
      html[data-mode="night"] { --nav-fg: #e5e7eb; }
    `}</style>
  );

  const labels = ["About", "Projects", "Writing", "Contacts"];

  // Text-only, right-justified nav with a center play/connect button
  const itemButton = (label) => (
    <button
      key={label}
      style={{
        color: "var(--nav-fg)",
        cursor: "pointer",
        background: "transparent",
        border: "none",
      }}
      className="text-sm md:text-base font-medium tracking-wide focus:outline-none"
    >
      {label}
    </button>
  );

  const nodes = labels.map(itemButton);

  const connectButton = (
    <button
      key="__connect__"
      onClick={toggleConnections}
      aria-label="Toggle connections"
      style={{
        color: "var(--nav-fg)",
        cursor: "pointer",
        background: "transparent",
        border: "none",
      }}
      className="mx-1 text-sm md:text-base font-semibold tracking-wide focus:outline-none"
    >
      ⏵
    </button>
  );

  // insert between Projects (index 1) and Writing (index 2)
  nodes.splice(2, 0, connectButton);

  return (
    <nav
      className="w-full fixed top-8 left-0 z-50"
      onMouseEnter={() => document.body.classList.add("cursor-regular")}
      onMouseLeave={() => document.body.classList.remove("cursor-regular")}
    >
      <GlobalStyles />
      <div className="w-full px-4 md:px-8 flex items-center justify-center">
        <div className="flex items-center gap-6 md:gap-8">{nodes}</div>
      </div>
    </nav>
  );
}

import { useTheme } from "./ThemeContext"; // adjust path if needed

export function ThemedDockBar() {
  const { isDayMode } = useTheme();
  const items = ["About", "Projects", "Writing", "Contacts"];

  return (
    <div
      className="fixed bottom-6 left-0 w-full z-50"
      onMouseEnter={() => document.body.classList.add("cursor-regular")}
      onMouseLeave={() => document.body.classList.remove("cursor-regular")}
    >
      <div className="w-full px-4 md:px-8 flex items-center justify-end">
        <div className="flex items-center gap-6 md:gap-8">
          {items.map((label) => (
            <button
              key={label}
              style={{
                color: isDayMode ? "#1f2937" : "#e5e7eb",
                cursor: "pointer",
                background: "transparent",
                border: "none",
              }}
              className="text-sm md:text-base font-medium tracking-wide focus:outline-none"
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
