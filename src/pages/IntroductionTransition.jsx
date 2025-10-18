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

  const isMobile = () => window.innerWidth <= 768;

  useEffect(() => {
    if (textContainerRef.current) {
      setTextWidth(textContainerRef.current.getBoundingClientRect().width);
    }
    const handleResize = () => {
      if (textContainerRef.current) {
        setTextWidth(textContainerRef.current.getBoundingClientRect().width);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useGSAP(() => {
    // Create a timeline that plays automatically on mount
    const timeline = gsap.timeline({
      delay: 0.5, // Delay before starting the animation
    });

    timeline
      .fromTo(
        lettersRef.current,
        { opacity: 0, y: "100px" },
        {
          opacity: 1,
          y: "0",
          ease: "power1.inOut",
          stagger: 0.03,
          duration: 0.8,
        }
      )
      .fromTo(
        diamondRef.current,
        { strokeDashoffset: 400 },
        {
          strokeDashoffset: 0,
          ease: "power1.inOut",
          duration: 1.5,
        },
        0.5
      );

    let screenSize = { lg: 1, md: 0.7, sm: 0.4 };

    const getScreenScale = () => {
      const width = window.innerWidth;

      if (width <= 768) {
        return screenSize.sm;
      } else if (width <= 1280) {
        return screenSize.md;
      } else {
        return screenSize.lg;
      }
    };

    const screenScale = getScreenScale();
    if (!isMobile()) {
      timeline.fromTo(
        boxRef.current,
        { opacity: 0, scale: 0 },
        {
          opacity: 1,
          scale: screenScale,
          ease: "power1.inOut",
          duration: 1,
        },
        "-=0.5"
      );
    } else {
      timeline.fromTo(
        boxRef.current,
        { opacity: 0 },
        {
          opacity: 1,
          ease: "power1.inOut",
          duration: 1,
        },
        "-=0.5"
      );
    }
  }, []);

  const text = "INTRODUCTION";

  // Dynamic styles based on day or night mode
  const boxStyle = {
    maxWidth: "85%",
    padding: "3rem",
    transform: "translateY(50px)",
    borderRadius: "20px",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
    backgroundColor: isDayMode ? "#fff" : "#2a2a2a", // Light for day, dark for night
    color: isDayMode ? "#333" : "#f0f0f0", // Text colors: dark for day, light for night
  };

  const linkColor = isDayMode ? "text-blue-500" : "text-blue-300"; // Slightly lighter in dark mode
  const textColor = isDayMode ? "text-gray-700" : "text-gray-300"; // Text color adjustment
  const headingColor = isDayMode ? "text-black" : "text-white"; // Headings for contrast in both modes

  let strokeColor = isDayMode ? "black" : "white"; // Stroke color for SVG diamond
  return (
    <>
      <div
        ref={introHeaderRef}
        className="flex bg-[var(--cookies)] h-screen justify-center items-center relative"
      >
        <Particles
          className="absolute w-full h-[100vh]"
          quantity={25}
          ease={80}
          color={"#181818"}
          refresh
        />
        <div ref={textContainerRef} className="relative text-center">
          <Typography
            variant="h1"
            sx={{
              fontFamily: "Poppins",
              fontSize: "5vw",
              marginTop: "3rem",
              color: isDayMode ? "#000" : "#fff", // Title color based on mode
            }}
          >
            {text.split("").map((letter, index) => (
              <span
                key={index}
                ref={(el) => (lettersRef.current[index] = el)}
                style={{ display: "inline-block" }}
              >
                {letter}
              </span>
            ))}
          </Typography>

          <svg
            className="diamond-svg flex"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 100 100"
            style={{
              width: `${textWidth * 0.8}px`,
              height: `${textWidth * 0.8}px`,
            }}
          >
            <path
              ref={diamondRef}
              d="M50 0 L100 50 L50 100 L0 50 Z"
              stroke={strokeColor}
              strokeWidth="0.5"
              fill="none"
              opacity="0.1"
              style={{
                strokeDasharray: 400,
                strokeDashoffset: 400,
              }}
            />
          </svg>
        </div>

        {/* Updated Box Content */}
        <div
          ref={boxRef}
          className="absolute mb-6 flex-col items-right justify-right rounded-lg shadow-xl mx-auto text-center"
          style={boxStyle}
        >
          <img
            src="/website_photo/selfie_1.jpg"
            alt="Tony"
            className="rounded-full w-40 h-40 object-cover mx-auto mb-4"
          />
          <div className={`text-xl font-bold mb-2 ${headingColor}`}>
            Tony Tran
          </div>
          <p className={`${textColor} mb-4 text-base leading-relaxed`}>
            I'm Tony Tran, a passionate developer specializing in web and mobile
            applications. My expertise spans machine learning, data science, and
            statistical modeling. I thrive on turning data into actionable
            insights.
          </p>

          <div className={`text-left mb-4 ${headingColor}`}>
            <h3 className="text-lg font-semibold">Key Skills</h3>
            <ul className={`list-disc list-inside ${textColor}`}>
              <li>
                Data Science & Machine Learning (TensorFlow, Scikit-learn)
              </li>
              <li>Statistical Analysis & Modeling (Pandas, NumPy, R)</li>
              <li>JavaScript (React, Node.js)</li>
              <li>Mobile Development (Flutter, React Native)</li>
            </ul>
          </div>

          {/* <div className={`text-left mb-4 ${headingColor}`}>
            <h3 className="text-lg font-semibold">Experience</h3>
            <p></p>
          </div> */}

          <div className={`text-left mb-4 ${headingColor}`}>
            <h3 className="text-lg font-semibold">Education</h3>
            <p>B.Math. in Mathematical Sciences (Statistics)</p>
            <p>University of Guelph</p>
          </div>

          <div className={`text-left ${headingColor}`}>
            <h3 className="text-lg font-semibold">Contact</h3>
            <p>Email: tony.tran03@hotmail.com</p>
            <p>
              LinkedIn:{" "}
              <a
                href="https://www.linkedin.com/in/tony-tran-a08b8a230/"
                target="_blank"
                rel="noopener noreferrer"
                className={linkColor}
              >
                tony-tran-a08b8a230
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
