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
    console.log('Particles component mounted, setting up event listener');
    const handleToggle = (event) => {
      console.log('Particles received pulse trigger event');
      // Start a new pulse animation and freeze current particle positions
      connectionAnimationProgress.current = 0;
      animationStartTime.current = Date.now();
      isAnimating.current = true;
      // Snapshot the current positions
      frozenCircles.current = circles.current.map(c => ({
        x: c.x,
        y: c.y,
        originalRef: c
      }));
    };
    window.addEventListener('toggleParticleConnections', handleToggle);
    return () => {
      console.log('Particles component unmounting, removing event listener');
      window.removeEventListener('toggleParticleConnections', handleToggle);
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
        context.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      } else {
        context.current.clearRect(0, 0, canvasSize.current.w, canvasSize.current.h);
      }
      context.current.restore();
    }
  };

  const drawConnections = () => {
    if (!context.current) return;
    if (!isAnimating.current) return;
    
    // Use frozen snapshot of particles to prevent flickering from particle movement
    // Sort circles from bottom-left to top-right (by x - y diagonal)
    const sortedCircles = [...frozenCircles.current].sort((a, b) => {
      const diagA = a.x - a.y; // Diagonal position (bottom-left to top-right)
      const diagB = b.x - b.y;
      return diagA - diagB;
    });
    
    // Build a continuous path by chaining particles (frozen positions for order only)
    const minDistance = 20; // Minimum horizontal distance to consider
    const maxVerticalDistance = 150; // Maximum vertical distance to consider

    // Path points can be either fixed points or live particle refs
    // Start with an imaginary point at bottom-left (0, viewport height)
    const startFixedPoint = {
      type: "fixed",
      x: 0,
      y: canvasSize.current.h,
    };

    // End with an imaginary point at top-right (viewport width, 0)
    const endFixedPoint = {
      type: "fixed",
      x: canvasSize.current.w,
      y: 0,
    };

    const chainRefs = [];

    // Start chaining from the bottom-left-most particle in sorted order
    if (sortedCircles.length > 0) {
      chainRefs.push(sortedCircles[0].originalRef);
      let currentParticle = sortedCircles[0];
      const usedIndices = new Set([0]);

      // Build path by finding next particle that goes right and up
      while (chainRefs.length < sortedCircles.length) {
        let nextParticle = null;
        let bestIndex = -1;

        for (let j = 0; j < sortedCircles.length; j++) {
          if (usedIndices.has(j)) continue;

          const candidate = sortedCircles[j];
          const horizontalDistance = candidate.x - currentParticle.x;
          const verticalDistance = currentParticle.y - candidate.y; // Positive means candidate is above

          // Only consider particles that are to the right AND up, within vertical distance limit
          if (
            horizontalDistance >= minDistance &&
            verticalDistance > 0 &&
            verticalDistance <= maxVerticalDistance
          ) {
            nextParticle = candidate;
            bestIndex = j;
            break; // Take the first valid one in sorted order
          }
        }

        if (nextParticle && bestIndex >= 0) {
          chainRefs.push(nextParticle.originalRef);
          usedIndices.add(bestIndex);
          currentParticle = nextParticle;
        } else {
          break; // No more valid particles to connect
        }
      }
    }

    // Combine points: fixed start -> chained particle refs -> fixed end
    const pathPoints = [startFixedPoint, ...chainRefs.map((ref) => ({ type: "live", ref })), endFixedPoint];

    // Calculate the visible window of the line
    const totalSegments = pathPoints.length - 1;
    if (totalSegments <= 0) return;

    // Update animation progress based on number of segments and per-segment duration
    if (animationStartTime.current) {
      const elapsed = Date.now() - animationStartTime.current;
      const pulseDuration = Math.max(1, totalSegments * connectionSegmentMs);
      const pulseProgress = Math.min(elapsed / pulseDuration, 1);

      // Linear progress for continuous line growth
      connectionAnimationProgress.current = pulseProgress;

      // Stop animating when pulse is complete
      if (pulseProgress >= 1) {
        isAnimating.current = false;
      }
    }
    const windowSize = 5; // Show only a handful of segments at a time
    const currentPosition = connectionAnimationProgress.current * totalSegments;
    const currentSegment = Math.floor(currentPosition);

    // Draw the continuous line with bell curve opacity using current positions
    context.current.lineWidth = 1;

    const startSegment = Math.max(0, currentSegment - windowSize + 1);
    const endSegment = Math.min(totalSegments, currentSegment + 1);

    const getPos = (pt) => {
      if (pt.type === "fixed") return { x: pt.x, y: pt.y };
      const c = pt.ref;
      return { x: c.x, y: c.y };
    };

    for (let i = startSegment; i < endSegment; i++) {
      const distanceFromCurrent = currentSegment - i; // 0 = newest
      let opacity = 0.7 * Math.exp(-Math.pow(distanceFromCurrent / 1.5, 2));
      opacity = Math.max(0.1, Math.min(0.7, opacity));

      const a = getPos(pathPoints[i]);
      const b = getPos(pathPoints[i + 1]);

      context.current.strokeStyle = `rgba(${rgb.join(", ")}, ${opacity})`;
      context.current.beginPath();
      context.current.moveTo(a.x, a.y);
      context.current.lineTo(b.x, b.y);
      context.current.stroke();
    }
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
