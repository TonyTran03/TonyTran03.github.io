"use client";
import { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Typography } from "@mui/material";
import { cn } from "@/lib/utils";

export const TextRevealByWord2 = ({ text, className }) => {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"],
  });

  const words = text.split("");
  const [isDayMode, setIsDayMode] = useState(true);

  useEffect(() => {
    const html = document.querySelector("html");

    const observer = new MutationObserver(() => {
      const mode = html.getAttribute("data-mode");
      setIsDayMode(mode === "day");
    });

    observer.observe(html, {
      attributes: true,
      attributeFilter: ["data-mode"],
    });

    // Initial check
    const mode = html.getAttribute("data-mode");
    setIsDayMode(mode === "day");

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={targetRef} className={cn(" z-0 h-[100vh]", className)}>
      <div
        className={
          "sticky   mx-auto flex justify-end items-end  px-[1rem] py-[5rem] z-1"
        }
      >
        <Typography
          variant="h2"
          className={className}
          sx={{
            display: "flex",
            alignItems: "center",
            flexDirection: "column",
            fontFamily: "Bebas Neue, sans-serif",
            "-webkit-text-stroke": isDayMode ? "2px #000" : "2px #FFFFFD",
            "-webkit-text-fill-color": "transparent",
            fontSize: "9rem",
          }}
        >
          {words.map((char, i) => {
            const start = i / words.length;
            const end = start + 1 / words.length;
            const adjustedEnd = i === words.length - 1 ? end : end;
            return (
              <Word
                key={i}
                progress={scrollYProgress}
                range={[start, adjustedEnd]}
              >
                {char}
              </Word>
            );
          })}
        </Typography>
      </div>
    </div>
  );
};

const Word = ({ children, progress, range }) => {
  const opacity = useTransform(progress, range, [0.1, 1]);
  const translateY = useTransform(progress, range, [100, 0]);

  return (
    <motion.span
      style={{
        opacity: opacity,
        transform: `translateY(${translateY}px)`,
      }}
      className={"text-black dark:text-white"}
    >
      {children}
    </motion.span>
  );
};

export default TextRevealByWord2;
