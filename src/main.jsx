import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import Lenis from "@studio-freight/lenis";
import { ThemeProvider } from "./components/ThemeContext.jsx";
import { ParticlesConnectionProvider } from "./components/ParticlesConnectionContext.jsx";

// Lenis smooth scroll setup
const lenis = new Lenis({
  duration: 1.2, // The duration of the smooth scroll
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smooth: true, // Enable/disable smooth scrolling
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
        <App />
      </ParticlesConnectionProvider>
    </ThemeProvider>
  </StrictMode>
);
