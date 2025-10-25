import gsap from "gsap";
import React, { useRef, useEffect, useState } from "react";
import { useGSAP } from "@gsap/react";
import Particles from "../components/magicui/particles";
import { Typography } from "@mui/material";
import "./about.css";
import { useTheme } from "../components/ThemeContext.jsx";

export default function IntroductionTransition() {
  const { isDayMode } = useTheme();
  const introHeaderRef = useRef();
  const lettersRef = useRef([]);
  const diamondRef = useRef();
  const textContainerRef = useRef();
  const boxRef = useRef();
  const [textWidth, setTextWidth] = useState(0);

  useEffect(() => {
    const measure = () => {
      if (textContainerRef.current) {
        setTextWidth(textContainerRef.current.getBoundingClientRect().width);
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useGSAP(() => {
    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: introHeaderRef.current,
        start: "top top",
        end: "+=100%",
        pin: true,
        scrub: true,
        markers: false,
      },
    });
    gsap.set(boxRef.current, { opacity: 1, willChange: "transform" });
    timeline
      .fromTo(
        lettersRef.current,
        { opacity: 0, y: "100px" },
        { opacity: 1, y: "0", ease: "power1.inOut", stagger: 0.03 }
      )
      .fromTo(
        diamondRef.current,
        { strokeDasharray: 400, strokeDashoffset: 400 },
        { strokeDashoffset: 0, ease: "power1.inOut", duration: 1.25 },
        0
      )
      .fromTo(
        boxRef.current,
        { opacity: 0.75, scale: 0.85, y: 40 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          ease: "back.out(2)",
          duration: 0.2,
        },
        "-=1"
      );
  }, []);

  const text = "陳明合";
  const strokeColor = isDayMode ? "black" : "white";
  const cardBg = isDayMode ? "rgba(255,255,255,0.85)" : "rgba(32,32,32,0.6)";
  const borderColor = isDayMode ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.1)";
  const textColor = isDayMode ? "text-gray-700" : "text-gray-300";
  const headingColor = isDayMode ? "text-black" : "text-white";

  return (
    <div
      ref={introHeaderRef}
      className="flex bg-[var(--cookies)] h-screen justify-center items-center relative overflow-hidden"
    >
      <Particles
        className="absolute w-full h-full"
        quantity={25}
        ease={80}
        color={"#181818"}
        refresh
      />

      {/* Background layered name + diamond */}
      <div
        ref={textContainerRef}
        className="absolute text-center pointer-events-none select-none"
      >
        <Typography
          variant="h1"
          sx={{
            fontFamily: "Poppins",
            fontSize: "5vw",
            color: isDayMode ? "#000" : "#fff",
            letterSpacing: "0.1em",
          }}
        >
          {text.split("").map((letter, i) => (
            <span
              key={i}
              ref={(el) => (lettersRef.current[i] = el)}
              style={{ display: "inline-block" }}
            >
              {letter}
            </span>
          ))}
        </Typography>

        <svg
          ref={diamondRef}
          className="mx-auto"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 100 100"
          style={{
            width: `${textWidth * 0.8}px`,
            height: `${textWidth * 0.8}px`,
            opacity: 0.1,
          }}
        >
          <path
            d="M50 0 L100 50 L50 100 L0 50 Z"
            stroke={strokeColor}
            strokeWidth="0.6"
            fill="none"
          />
        </svg>
      </div>

      {/* Single centered floating card */}
      <div
        ref={boxRef}
        className="absolute mx-auto p-6 sm:p-8 rounded-3xl text-center shadow-[0_10px_40px_rgba(0,0,0,0.25)] border backdrop-blur-md"
        style={{
          backgroundColor: cardBg,
          borderColor,
          maxWidth: "720px",
          transform: "translateY(40px)",
          fontFamily: "Outfit, Poppins, system-ui, sans-serif",
        }}
      >
        <img
          src="/website_photo/selfie_1.jpg"
          alt="Tony Tran"
          className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover mx-auto mb-4 ring-4"
          style={{
            ringColor: isDayMode
              ? "rgba(0,0,0,0.06)"
              : "rgba(255,255,255,0.12)",
          }}
        />

        <h1
          className={`mb-1 ${headingColor}`}
          style={{
            fontWeight: 700,
            fontSize: "clamp(1.25rem, 2.2vw, 1.6rem)",
            letterSpacing: "-0.01em",
          }}
        >
          Tony Tran
        </h1>
        <p
          className={`${headingColor} opacity-70`}
          style={{ fontSize: "clamp(0.9rem, 1.1vw, 1rem)" }}
        >
          Statistics & Software
        </p>

        <p
          className={`${textColor} mt-4 mx-auto max-w-prose`}
          style={{ fontSize: "clamp(0.95rem, 1.1vw, 1rem)", lineHeight: 1.6 }}
        >
          mmm yes, statistics :)
        </p>

        <div className={`${textColor} mt-5 text-sm sm:text-[0.95rem]`}>
          Time Series · Multivariate · Experimental Design · Simulation
        </div>

        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {["R", "Python", "SQL", "Power BI"].map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 rounded-full text-xs sm:text-[0.8rem]"
              style={{
                color: isDayMode ? "#111" : "#e5e5e5",
                background: isDayMode
                  ? "rgba(0,0,0,0.06)"
                  : "rgba(255,255,255,0.08)",
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-6 space-y-1 text-xs sm:text-[0.85rem]">
          <div className={`${textColor}`}>tony.tran03@hotmail.com</div>
          <a
            href="https://www.linkedin.com/in/tony-tran-a08b8a230/"
            target="_blank"
            rel="noopener noreferrer"
            className={`${
              isDayMode ? "text-blue-600" : "text-blue-300"
            } underline underline-offset-2`}
          >
            linkedin.com/in/tony-tran-a08b8a230
          </a>
        </div>
      </div>
    </div>
  );
}
