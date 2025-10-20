// MOVED INTO INTRO BECAUSE IT GOT CONFUSING
import React, { useEffect, useRef, useState } from "react";
import Matter, { Engine, Bodies, Composite, Body, Events } from "matter-js";
import gsap from "gsap";

const sections = [
  { n: 1, id: "about", label: "About" },
  { n: 2, id: "projects", label: "Projects" },
  { n: 3, id: "writing", label: "Writing" },
  { n: 4, id: "contact", label: "Contact" },
];

function shuffle(a) {
  const x = [...a];
  for (let i = x.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [x[i], x[j]] = [x[j], x[i]];
  }
  return x;
}

function DiceFace({ size = 26, face, rolling }) {
  const [f, setF] = useState(face);
  useEffect(() => {
    if (!rolling) {
      setF(face);
      return;
    }
    let id;
    const tick = () => {
      setF(1 + ((Math.random() * 6) | 0));
      id = setTimeout(tick, 60 + ((Math.random() * 60) | 0));
    };
    tick();
    return () => clearTimeout(id);
  }, [rolling, face]);

  const faces = {
    1: [4],
    2: [0, 8],
    3: [0, 4, 8],
    4: [0, 2, 6, 8],
    5: [0, 2, 4, 6, 8],
    6: [0, 3, 6, 2, 5, 8],
  };
  const on = faces[Math.max(1, Math.min(6, f))] || [];

  return (
    <div
      className="grid grid-cols-3 grid-rows-3"
      style={{ width: size, height: size, gap: size * 0.14 }}
    >
      {Array.from({ length: 9 }, (_, i) => (
        <span
          key={i}
          className="rounded-full transition-transform duration-150"
          style={{
            width: size * 0.22,
            height: size * 0.22,
            transform: on.includes(i) ? "scale(1)" : "scale(0)",
            background:
              "radial-gradient(circle at 30% 30%, rgba(0,0,0,.7), rgba(0,0,0,.92))",
          }}
        />
      ))}
    </div>
  );
}

export default function PhysicsDiceStage({
  scale = 1,
  heightPx = 520,
  className = "",
}) {
  const stageRef = useRef(null);
  const rafRef = useRef(null);
  const bodiesRef = useRef([]);
  const engineRef = useRef(null);
  const dieEls = useRef([]);
  const [assign, setAssign] = useState([1, 2, 3, 4]);
  const [rolling, setRolling] = useState([true, true, true, true]);
  const rollingRef = useRef(rolling);
  const [boxSize, setBoxSize] = useState(148);

  useEffect(() => {
    rollingRef.current = rolling;
  }, [rolling]);

  const scrollToId = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (window.lenis) window.lenis.scrollTo(el, { offset: -12 });
    else el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const reshuffle = (() => {
    let lock = false;
    return () => {
      if (lock) return;
      lock = true;
      setAssign((p) => shuffle(p));
      setTimeout(() => (lock = false), 250);
    };
  })();

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const W = el.clientWidth;
    const H = el.clientHeight;

    const base = Math.min(200, Math.max(132, Math.floor(W / 4.2)));
    const size = Math.round(base * scale);
    setBoxSize(size);

    const engine = Engine.create({ gravity: { x: 0, y: 1 } });
    engineRef.current = engine;

    const wall = (x, y, w, h) =>
      Bodies.rectangle(x, y, w, h, {
        isStatic: true,
        restitution: 0.8,
        render: { visible: false },
      });
    const thick = 60;
    const walls = [
      wall(W / 2, H + thick / 2, W, thick),
      wall(W / 2, -thick / 2, W, thick),
      wall(-thick / 2, H / 2, thick, H),
      wall(W + thick / 2, H / 2, thick, H),
    ];

    const shelf = (cx, cy, w, angle = 0) =>
      Bodies.rectangle(cx, cy, w, 16, {
        isStatic: true,
        angle,
        restitution: 0.9,
        render: { visible: false },
      });
    const shelves = [
      shelf(W * 0.5, H * 0.62, W * 0.78, -0.02),
      shelf(W * 0.52, H * 0.74, W * 0.86, 0.02),
    ];

    const die = (x, y) =>
      Bodies.rectangle(x, y, size, size, {
        chamfer: { radius: 26 * scale },
        restitution: 0.68,
        friction: 0.08,
        frictionAir: 0.02,
        density: 0.0028,
      });

    const dice = [
      die(W * 0.32, H * 0.12),
      die(W * 0.5, H * 0.08),
      die(W * 0.68, H * 0.12),
      die(W * 0.44, H * 0.18),
    ];
    Composite.add(engine.world, [...walls, ...shelves, ...dice]);
    bodiesRef.current = dice;

    Events.on(engine, "collisionStart", (e) => {
      for (const p of e.pairs) {
        if (dice.includes(p.bodyA) && dice.includes(p.bodyB)) {
          reshuffle();
          break;
        }
      }
    });

    const loop = () => {
      const ds = bodiesRef.current;
      const next = [...rollingRef.current];
      for (let i = 0; i < ds.length; i++) {
        const { position, angle, velocity } = ds[i];
        const moving = Math.hypot(velocity.x, velocity.y) > 0.35;
        if (moving !== next[i]) next[i] = moving;
        const elBtn = dieEls.current[i];
        if (elBtn)
          elBtn.style.transform = `translate(${position.x - boxSize / 2}px, ${
            position.y - boxSize / 2
          }px) rotate(${angle}rad)`;
      }
      if (next.some((v, i) => v !== rollingRef.current[i])) setRolling(next);
      Engine.update(engine, 1000 / 60);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      Engine.clear(engine);
      engineRef.current = null;
      bodiesRef.current = [];
    };
  }, [scale]);

  const toss = (i) => {
    const b = bodiesRef.current[i];
    if (!b) return;
    const angle = (Math.random() * Math.PI) / 2 - Math.PI / 4;
    const power = 0.035 + Math.random() * 0.045;
    Body.applyForce(b, b.position, {
      x: power * Math.cos(angle),
      y: -Math.abs(power * Math.sin(angle)) - 0.05,
    });
    Body.setAngularVelocity(
      b,
      (Math.random() < 0.5 ? -1 : 1) * (1.1 + Math.random() * 1.6)
    );
    const el = dieEls.current[i];
    if (el)
      gsap.fromTo(
        el,
        { scale: 0.985 },
        { scale: 1, duration: 0.18, ease: "power2.out" }
      );
  };

  const onDieClick = (i) => {
    const n = assign[i];
    const m = sections.find((s) => s.n === n);
    if (m) scrollToId(m.id);
  };

  useEffect(() => {
    const id = setInterval(() => setAssign((a) => shuffle(a)), 8000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      ref={stageRef}
      className={`relative mx-auto max-w-7xl overflow-hidden ${className}`}
      style={{ height: `${heightPx}px` }} // <— fixed height from parent
    >
      {/* dice */}
      <div className="absolute inset-0">
        {Array.from({ length: 4 }).map((_, i) => {
          const label = sections.find((s) => s.n === assign[i])?.label;
          return (
            <button
              key={i}
              ref={(el) => (dieEls.current[i] = el)}
              onClick={() => {
                toss(i);
                onDieClick(i);
              }}
              className="absolute will-change-transform rounded-[28px] border border-zinc-900/5 dark:border-white/10 bg-white/80 dark:bg-zinc-900/70 backdrop-blur shadow-[0_8px_40px_-12px_rgba(0,0,0,.15)] overflow-hidden"
              style={{ width: boxSize, height: boxSize }}
              aria-label={label}
            >
              <div className="absolute inset-0 grid place-items-center pointer-events-none">
                <DiceFace face={assign[i]} rolling={rolling[i]} />
              </div>
              <div className="absolute bottom-2 left-3 text-[12px] opacity-70 pointer-events-none">
                {label}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
