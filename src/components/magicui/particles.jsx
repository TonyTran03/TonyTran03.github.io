"use client";
import React, { useEffect, useRef, useState } from "react";

function MousePosition() {
  const [mousePosition, setMousePosition] = useState({
    x: 0,
    y: 0,
  });

  useEffect(() => {
    const handleMouseMove = (event) => {
      setMousePosition({ x: event.clientX, y: event.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return mousePosition;
}

function hexToRgb(hex) {
  hex = hex.replace("#", "");

  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((char) => char + char)
      .join("");
  }

  const hexInt = parseInt(hex, 16);
  const red = (hexInt >> 16) & 255;
  const green = (hexInt >> 8) & 255;
  const blue = hexInt & 255;
  return [red, green, blue];
}

const Particles = ({
  className = "",
  quantity = 100,
  staticity = 50,
  ease = 50,
  size = 0.4,
  refresh = false,
  color = "#ffffff",
  vx = 0,
  vy = 0,
  // Duration in ms for each segment (jump) from one point to the next
  connectionSegmentMs = 50,
}) => {
  const canvasRef = useRef(null);
  const canvasContainerRef = useRef(null);
  const context = useRef(null);
  const circles = useRef([]);
  const mousePosition = MousePosition();
  const mouse = useRef({ x: 0, y: 0 });
  const canvasSize = useRef({ w: 0, h: 0 });
  const dpr = typeof window !== "undefined" ? window.devicePixelRatio : 1;
  const connectionAnimationProgress = useRef(0);
  const animationStartTime = useRef(null);
  const isAnimating = useRef(false);
  const frozenCircles = useRef([]); // Store snapshot of particles when animation starts
  const rafId = useRef(null); // Track requestAnimationFrame id for cleanup

  // Listen for pulse trigger events
  useEffect(() => {
    console.log("Particles component mounted, setting up event listener");
    const handleToggle = (event) => {
      console.log("Particles received pulse trigger event");
      // Start a new pulse animation and freeze current particle positions
      connectionAnimationProgress.current = 0;
      animationStartTime.current = Date.now();
      isAnimating.current = true;
      // Snapshot the current positions
      frozenCircles.current = circles.current.map((c) => ({
        x: c.x,
        y: c.y,
        originalRef: c,
      }));
    };
    window.addEventListener("toggleParticleConnections", handleToggle);
    return () => {
      console.log("Particles component unmounting, removing event listener");
      window.removeEventListener("toggleParticleConnections", handleToggle);
    };
  }, []);

  useEffect(() => {
    if (canvasRef.current) {
      context.current = canvasRef.current.getContext("2d");
    }
    initCanvas();
    // Start animation loop and store raf id for cleanup
    animate();
    window.addEventListener("resize", initCanvas);

    return () => {
      window.removeEventListener("resize", initCanvas);
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
        rafId.current = null;
      }
    };
  }, [color]);

  useEffect(() => {
    onMouseMove();
  }, [mousePosition.x, mousePosition.y]);

  useEffect(() => {
    initCanvas();
  }, [refresh]);

  const initCanvas = () => {
    resizeCanvas();
    drawParticles();
  };

  const onMouseMove = () => {
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const { w, h } = canvasSize.current;
      const x = mousePosition.x - rect.left - w / 2;
      const y = mousePosition.y - rect.top - h / 2;
      const inside = x < w / 2 && x > -w / 2 && y < h / 2 && y > -h / 2;
      if (inside) {
        mouse.current.x = x;
        mouse.current.y = y;
      }
    }
  };

  const resizeCanvas = () => {
    if (canvasContainerRef.current && canvasRef.current && context.current) {
      circles.current.length = 0;
      canvasSize.current.w = canvasContainerRef.current.offsetWidth;
      canvasSize.current.h = canvasContainerRef.current.offsetHeight;
      canvasRef.current.width = canvasSize.current.w * dpr;
      canvasRef.current.height = canvasSize.current.h * dpr;
      canvasRef.current.style.width = `${canvasSize.current.w}px`;
      canvasRef.current.style.height = `${canvasSize.current.h}px`;
      // Reset transform to avoid compounded scaling across resizes
      context.current.setTransform(1, 0, 0, 1, 0, 0);
      context.current.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  };

  const circleParams = () => {
    const x = Math.floor(Math.random() * canvasSize.current.w);
    const y = Math.floor(Math.random() * canvasSize.current.h);
    const translateX = 0;
    const translateY = 0;
    const pSize = Math.floor(Math.random() * 2) + size;
    const alpha = 0;
    const targetAlpha = parseFloat((Math.random() * 0.6 + 0.1).toFixed(1));
    const dx = (Math.random() - 0.5) * 0.1;
    const dy = (Math.random() - 0.5) * 0.1;
    const magnetism = 0.1 + Math.random() * 4;
    return {
      x,
      y,
      translateX,
      translateY,
      size: pSize,
      alpha,
      targetAlpha,
      dx,
      dy,
      magnetism,
    };
  };

  const rgb = hexToRgb(color);

  const drawCircle = (circle, update = false) => {
    if (context.current) {
      const { x, y, translateX, translateY, size, alpha } = circle;
      context.current.translate(translateX, translateY);
      context.current.beginPath();
      context.current.arc(x, y, size, 0, 2 * Math.PI);
      context.current.fillStyle = `rgba(${rgb.join(", ")}, ${alpha})`;
      context.current.fill();
      context.current.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (!update) {
        circles.current.push(circle);
      }
    }
  };

  const clearContext = () => {
    if (context.current) {
      // Clear using identity transform to cover full backing store
      context.current.save();
      context.current.setTransform(1, 0, 0, 1, 0, 0);
      if (canvasRef.current) {
        context.current.clearRect(
          0,
          0,
          canvasRef.current.width,
          canvasRef.current.height
        );
      } else {
        context.current.clearRect(
          0,
          0,
          canvasSize.current.w,
          canvasSize.current.h
        );
      }
      context.current.restore();
    }
  };

  const drawConnections = () => {
    if (!context.current || !isAnimating.current) return;
    if (!frozenCircles.current || frozenCircles.current.length === 0) return;

    const W = canvasSize.current.w;
    const H = canvasSize.current.h;

    // ---- Config ---------------------------------------------------
    const WINDOW_POINTS = Math.min(80, Math.max(20, Math.floor(W / 16))); // short clean window
    const DOT_RADIUS = 2.2; // dot size
    const RED = [239, 68, 68]; // tailwind red-500-ish
    const BLUE = [59, 130, 246]; // tailwind blue-500-ish
    // ---------------------------------------------------------------

    // 1) Sort snapshot by x (left -> right)
    const sortedByX = [...frozenCircles.current].sort((a, b) => a.x - b.x);

    // 2) Progress 0 -> 1 across entire width
    if (animationStartTime.current == null)
      animationStartTime.current = Date.now();
    const elapsed = Date.now() - animationStartTime.current;
    const pulseDuration = Math.max(
      1,
      (sortedByX.length - 1) * connectionSegmentMs
    );
    const progress = Math.min(elapsed / pulseDuration, 1);

    // 3) End index advances with progress; short fixed window behind it
    let endIdx = Math.floor(progress * (sortedByX.length - 1));
    endIdx = Math.min(sortedByX.length - 1, Math.max(0, endIdx));
    const startIdx = Math.max(0, endIdx - WINDOW_POINTS + 1);

    // 4) Build live window (left -> right)
    const windowPolyline = [];
    for (let i = startIdx; i <= endIdx; i++) {
      const live = sortedByX[i].originalRef; // follow live motion
      windowPolyline.push({ x: live.x, y: live.y });
    }
    if (windowPolyline.length < 2) return;

    // 5) DRAW DOTS (alternate red/blue), fade at edges
    for (let i = 0; i < windowPolyline.length; i++) {
      const p = windowPolyline[i];
      const t = i / (windowPolyline.length - 1); // 0..1 across window
      const edgeFade = Math.min(t, 1 - t); // fade at both ends
      const alpha = 0.35 + 0.45 * (edgeFade * 2); // 0.35..0.80

      const color = i % 2 === 0 ? RED : BLUE;
      context.current.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha})`;
      context.current.beginPath();
      context.current.arc(p.x, p.y, DOT_RADIUS, 0, Math.PI * 2);
      context.current.fill();
    }

    // 6) Broadcast for the center graph (still works)
    const evt = new CustomEvent("particleLineUpdate", {
      detail: {
        points: windowPolyline,
        lastPoint: windowPolyline[windowPolyline.length - 1],
        sourceSize: { w: W, h: H },
        done: progress >= 1,
      },
    });
    window.dispatchEvent(evt);

    // 7) Stop at the far right
    if (progress >= 1) isAnimating.current = false;
  };

  const drawParticles = () => {
    clearContext();
    const particleCount = quantity;
    for (let i = 0; i < particleCount; i++) {
      const circle = circleParams();
      drawCircle(circle);
    }
  };

  const remapValue = (value, start1, end1, start2, end2) => {
    const remapped =
      ((value - start1) * (end2 - start2)) / (end1 - start1) + start2;
    return remapped > 0 ? remapped : 0;
  };

  const animate = () => {
    clearContext();
    circles.current.forEach((circle, i) => {
      // Handle the alpha value
      const edge = [
        circle.x + circle.translateX - circle.size, // distance from left edge
        canvasSize.current.w - circle.x - circle.translateX - circle.size, // distance from right edge
        circle.y + circle.translateY - circle.size, // distance from top edge
        canvasSize.current.h - circle.y - circle.translateY - circle.size, // distance from bottom edge
      ];
      const closestEdge = edge.reduce((a, b) => Math.min(a, b));
      const remapClosestEdge = parseFloat(
        remapValue(closestEdge, 0, 20, 0, 1).toFixed(2)
      );
      if (remapClosestEdge > 1) {
        circle.alpha += 0.02;
        if (circle.alpha > circle.targetAlpha) {
          circle.alpha = circle.targetAlpha;
        }
      } else {
        circle.alpha = circle.targetAlpha * remapClosestEdge;
      }
      circle.x += circle.dx + vx;
      circle.y += circle.dy + vy;
      circle.translateX +=
        (mouse.current.x / (staticity / circle.magnetism) - circle.translateX) /
        ease;
      circle.translateY +=
        (mouse.current.y / (staticity / circle.magnetism) - circle.translateY) /
        ease;

      drawCircle(circle, true);

      // circle gets out of the canvas
      if (
        circle.x < -circle.size ||
        circle.x > canvasSize.current.w + circle.size ||
        circle.y < -circle.size ||
        circle.y > canvasSize.current.h + circle.size
      ) {
        // remove the circle from the array
        circles.current.splice(i, 1);
        // create a new circle
        const newCircle = circleParams();
        drawCircle(newCircle);
        // update the circle position
      }
    });

    // Draw connections after all particles
    drawConnections();

    // Schedule next frame and keep the id for potential cancellation
    rafId.current = window.requestAnimationFrame(animate);
  };

  return (
    <div className={className} ref={canvasContainerRef} aria-hidden="true">
      <canvas ref={canvasRef} className="size-full" />
    </div>
  );
};

export default Particles;
