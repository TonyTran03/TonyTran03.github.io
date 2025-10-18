import React, { useEffect } from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Intro from "./pages/Intro";
import Projects from "./pages/Projects";

// Lerp function to smooth the transition
const lerp = (start, end, factor) => {
  return start + (end - start) * factor;
};

function App() {
  useEffect(() => {
    // Only initialize cursor functionality if not on mobile
    if (window.innerWidth <= 768) return;

    const cursorInner = document.querySelector(".cursor-inner");
    const cursorOuter = document.querySelector(".cursor-outer");

    if (!cursorInner || !cursorOuter) return;

    let mouseX = 0,
      mouseY = 0,
      posX = 0,
      posY = 0;

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      cursorInner.style.top = `${mouseY}px`;
      cursorInner.style.left = `${mouseX}px`;
    };

    const followCursor = () => {
      // Use lerp to smooth the position changes
      posX = lerp(posX, mouseX, 0.1);
      posY = lerp(posY, mouseY, 0.1);

      cursorOuter.style.top = `${posY}px`;
      cursorOuter.style.left = `${posX}px`;
      requestAnimationFrame(followCursor);
    };

    document.addEventListener("mousemove", handleMouseMove);
    followCursor();

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <Router>
      {/* Only render cursor elements if not on mobile - outside of main div */}
      {window.innerWidth > 768 && (
        <>
          <div className="cursor-inner" style={{ top: '0px', left: '0px' }}></div>
          <div className="cursor-outer" style={{ top: '0px', left: '0px' }}></div>
        </>
      )}
      <div>
        <Routes>
          <Route index element={<Intro />} />
          <Route path="/projects" element={<Projects />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
