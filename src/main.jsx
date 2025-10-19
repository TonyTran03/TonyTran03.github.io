import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import Lenis from "@studio-freight/lenis";
import { ThemeProvider } from "./components/ThemeContext.jsx";
import { ParticlesConnectionProvider } from "./components/ParticlesConnectionContext.jsx";
import CasinoCursor from "./components/CasinoCursor.jsx";

// Lenis smooth scroll setup
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smooth: true,
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}

requestAnimationFrame(raf);

// Wrap the entire app with ThemeProvider to ensure consistent theme state
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider>
      <ParticlesConnectionProvider>
        <CasinoCursor />
        <App />
      </ParticlesConnectionProvider>
    </ThemeProvider>
  </StrictMode>
);
