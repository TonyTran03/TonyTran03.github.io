import React, { useRef, useEffect, useState } from "react";
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
import LoadingScreen from "../components/LoadingScreen.jsx";

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
  const [isLoading, setIsLoading] = useState(true);
  const contentRef = useRef();

  useEffect(() => {
    // Trigger ScrollTrigger refresh to recalculate after all content is rendered
    ScrollTrigger.refresh();
  }, []);

  const { isDayMode } = useTheme();

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  useEffect(() => {
    if (!isLoading && contentRef.current) {
      // Fade in the main content after loading screen is done
      gsap.fromTo(
        contentRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: "power1.inOut" }
      );
    }
  }, [isLoading]);

  return (
    <MuiThemeProvider theme={muiTheme}>
      {isLoading && <LoadingScreen onLoadingComplete={handleLoadingComplete} />}
      <div
        ref={contentRef}
        style={{ opacity: 0 }}
      >
        <div className="w-full h-screen bg-[var(--cookies)]">
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
                  fontStyle: "italic",
                }}
              >
                Software Developer
              </Typography>
              <Typography
                sx={{
                  mt: 2,
                  fontSize: "1rem",
                  fontFamily: "Poppins, sans-serif",
                  color: isDayMode ? "#666" : "#aaa",
                  maxWidth: "600px",
                  textAlign: "center",
                  px: 2,
                }}
              >
                I build large scale, business-forward data solutions driven by statistics and computation. Currently, I'm driving operational decisions with stochastic and time series analysis at <u>OO company</u>.
              </Typography>
              <DockBar />
            </div>
          </div>
        </div>
      </div>
    </MuiThemeProvider>
  );
}
