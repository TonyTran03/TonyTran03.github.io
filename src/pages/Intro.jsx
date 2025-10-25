import React, { useRef, useEffect } from "react";
import Typography from "@mui/material/Typography";
import "@fontsource/poppins";
import {
  createTheme,
  ThemeProvider as MuiThemeProvider,
} from "@mui/material/styles";
import WordPullUp from "../components/magicui/word-pull-up";
import Particles from "../components/magicui/particles";
import { DockBar } from "../components/DockBar";
import Meteors from "../components/magicui/Meteors";
import { useTheme } from "../components/ThemeContext.jsx";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "@fontsource/bebas-neue";
import { useGSAP } from "@gsap/react";
import IntroductionTransition from "./IntroductionTransition.jsx";
import { BackgroundEffects } from "../components/BackgroundEffects";

import "./Intro.css";
import Project from "./Project.jsx";

const muiTheme = createTheme({
  typography: {
    fontFamily: "Poppins, sans-serif",
  },
});

gsap.registerPlugin(ScrollTrigger);

export default function Intro() {
  const refName = useRef();
  const introSectionRef = useRef();

  // Intro.jsx (only the GSAP part changes + one extra tween)
  useGSAP(() => {
    const isMobile = window.innerWidth <= 500;
    if (!isMobile) {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: introSectionRef.current,
          start: "top top",
          end: "bottom+=30% center+=10%",
          scrub: true,
          pin: refName.current,
          pinSpacing: true,
          markers: false,
        },
      });

      // fade/slide hero out
      tl.fromTo(
        refName.current,
        { opacity: 1, y: 0 },
        { opacity: 0, y: -200, ease: "power1.inOut" }
      );

      // fade/slide the cards in (the next section)
      tl.fromTo(
        "#intro-cards",
        { opacity: 0, y: 60 },
        { opacity: 1, y: 0, ease: "power2.out" },
        "-=0.35" // slight overlap for a seamless handoff
      );
    }
  }, []);

  useEffect(() => {
    // Trigger ScrollTrigger refresh to recalculate after all content is rendered
    ScrollTrigger.refresh();
  }, []);

  const { isDayMode } = useTheme();

  return (
    <MuiThemeProvider theme={muiTheme}>
      <div
        ref={introSectionRef}
        className="flex flex-col lg:flex-row min-h-screen shadow-sm"
      >
        <div className="absolute w-full h-screen bg-[var(--cookies)] z-10">
          <BackgroundEffects isDayMode={isDayMode} />

          <div
            ref={refName}
            className="flex flex-col justify-center items-center h-full w-full"
          >
            <div className="flex justify-center w-full items-center">
              <Typography
                sx={{
                  ml: 2,
                  fontFamily: "CustomFont, sans-serif",
                  fontSize: {
                    xs: "3rem",
                    sm: "4rem",
                    md: "4rem",
                    lg: "9rem",
                  },
                }}
                variant="h1"
              >
                <WordPullUp words={"Tony Tran"} />
              </Typography>
            </div>

            <div className="flex flex-col justify-center w-full items-center">
              <Typography
                sx={{
                  ml: 4,
                  pt: 3,
                  fontSize: "2rem",
                  fontFamily: "CustomFont, sans-serif",
                }}
              >
                Statistical Science
              </Typography>
              <DockBar />
            </div>
          </div>
        </div>
      </div>
      <IntroductionTransition />
      <Project />
    </MuiThemeProvider>
  );
}
