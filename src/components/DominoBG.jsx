// DominoBG.jsx
import React from "react";

const DominoBG = React.forwardRef(function DominoBG(
  { color = "#000", size = 320 },
  ref
) {
  const w = size;
  const h = size * 0.55;
  const r = Math.max(10, size * 0.03);
  const strokeW = Math.max(1, size * 0.006);
  const pad = size * 0.08;
  const midX = w / 2;

  const pip = (cx, cy) => (
    <circle cx={cx} cy={cy} r={Math.max(2, size * 0.02)} fill={color} />
  );

  const grid = (x0, y0, sx, sy) => ({
    c: [x0 + sx, y0 + sy],
    tl: [x0, y0],
    tr: [x0 + 2 * sx, y0],
    bl: [x0, y0 + 2 * sy],
    br: [x0 + 2 * sx, y0 + 2 * sy],
  });

  const sx = (w - pad * 2) / 6;
  const sy = (h - pad * 2) / 4;
  const Gleft = grid(pad, pad, sx, sy);
  const Gright = grid(pad + 3 * sx + sx * 0.5, pad, sx, sy);

  return (
    <svg
      ref={ref}
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      className="pointer-events-none select-none mx-auto"
      style={{
        opacity: 0.12,
        // 👇 important for rotating SVG nicely
        transformBox: "fill-box",
        transformOrigin: "50% 50%",
        display: "block",
      }}
    >
      <rect
        x={0}
        y={0}
        width={w}
        height={h}
        rx={r}
        ry={r}
        fill="none"
        stroke={color}
        strokeWidth={strokeW}
      />
      <line
        x1={midX}
        y1={pad * 0.6}
        x2={midX}
        y2={h - pad * 0.6}
        stroke={color}
        strokeWidth={strokeW}
        strokeLinecap="round"
      />

      {/* left half pips: 3 */}
      {[Gleft.tl, Gleft.c, Gleft.br].map(([x, y], i) => (
        <g key={`l${i}`}>{pip(x, y)}</g>
      ))}

      {/* right half pips: 5 */}
      {[Gright.tl, Gright.tr, Gright.c, Gright.bl, Gright.br].map(
        ([x, y], i) => (
          <g key={`r${i}`}>{pip(x, y)}</g>
        )
      )}
    </svg>
  );
});

export default DominoBG;
