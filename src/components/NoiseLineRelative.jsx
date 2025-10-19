import React, { useEffect, useRef } from "react";

export default function NoiseLineRelative({
  height = 64,
  thickness = 1.5,
  color = "var(--noise-line, rgba(25,31,44,0.85))",
  smoothing = 0.1, // 0 = sharp/ratchet
  capacityPx = 600, // how many samples to keep (~graph width in px)
  smoothWindow = 12, // moving-average window (de-trend)
  startFlat = true,
}) {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const historyRef = useRef([]); // ring buffer of normalized y
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    ctxRef.current = canvas.getContext("2d");

    const onResize = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctxRef.current.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw(); // draw baseline immediately if needed
    };

    const onUpdate = (e) => {
      const { lastPoint, sourceSize } = e.detail || {};
      if (!lastPoint || !sourceSize) return;

      // Normalize to our canvas height
      const scaleY = (canvasRef.current?.clientHeight || 1) / sourceSize.h;

      // Append normalized y
      historyRef.current.push(lastPoint.y * scaleY);

      // Cap length roughly to available pixels
      const max = Math.max(
        50,
        Math.floor(canvasRef.current?.clientWidth || capacityPx)
      );
      if (historyRef.current.length > max) {
        historyRef.current.splice(0, historyRef.current.length - max);
      }

      if (!rafRef.current) rafRef.current = requestAnimationFrame(draw);
    };

    onResize();
    window.addEventListener("resize", onResize);
    window.addEventListener("particleLineUpdate", onUpdate);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("particleLineUpdate", onUpdate);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const draw = () => {
    rafRef.current = null;
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;

    const W = canvas.clientWidth;
    const H = canvas.clientHeight;
    const baseY = H / 2;

    // If no data yet, draw a straight baseline (if startFlat)
    if (historyRef.current.length < 2 && startFlat) {
      ctx.clearRect(0, 0, W, H);
      ctx.lineWidth = thickness;
      ctx.strokeStyle = color;
      ctx.beginPath();
      ctx.moveTo(0, baseY);
      ctx.lineTo(W, baseY);
      ctx.stroke();
      return;
    }

    // De-trend with a small moving average
    const src = historyRef.current;
    if (src.length < 2) {
      ctx.clearRect(0, 0, W, H);
      return;
    }

    const smoothed = new Array(src.length);
    let acc = 0;
    for (let i = 0; i < src.length; i++) {
      acc += src[i];
      if (i >= smoothWindow) acc -= src[i - smoothWindow];
      const win = Math.min(i + 1, smoothWindow);
      smoothed[i] = src[i] - acc / win; // wiggle about 0
    }

    // Map across width left -> right
    const step = W / (smoothed.length - 1);
    ctx.clearRect(0, 0, W, H);
    ctx.lineWidth = thickness;
    ctx.strokeStyle = color;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    ctx.beginPath();
    ctx.moveTo(0, baseY + smoothed[0]);
    if (smoothing <= 0) {
      for (let i = 1; i < smoothed.length; i++) {
        ctx.lineTo(i * step, baseY + smoothed[i]);
      }
    } else {
      for (let i = 1; i < smoothed.length; i++) {
        const x0 = (i - 1) * step;
        const y0 = baseY + smoothed[i - 1];
        const x1 = i * step;
        const y1 = baseY + smoothed[i];
        const mx = x0 + (x1 - x0) * smoothing;
        const my = y0 + (y1 - y0) * smoothing;
        ctx.quadraticCurveTo(x0, y0, mx, my);
      }
      ctx.lineTo(W, baseY + smoothed[smoothed.length - 1]);
    }
    ctx.stroke();
  };

  return (
    <div
      className="relative w-full"
      style={{ height: `${height}px`, pointerEvents: "none" }}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}
