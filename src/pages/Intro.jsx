// src/pages/Intro.jsx
import React, { useEffect, useRef, useState } from "react";
import "@fontsource/poppins";
import {
  createTheme,
  ThemeProvider as MuiThemeProvider,
} from "@mui/material/styles";
import { useTheme } from "../components/ThemeContext.jsx";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { BackgroundEffects } from "../components/BackgroundEffects";
import LoadingScreen from "../components/LoadingScreen.jsx";
import Matter, { Engine, Bodies, Composite, Body, Events } from "matter-js";

gsap.registerPlugin(ScrollTrigger);

const muiTheme = createTheme({
  typography: { fontFamily: "Poppins, sans-serif" },
});

// ToC targets (1..4)
const sections = [
  { n: 1, id: "about", label: "About" },
  { n: 2, id: "projects", label: "Projects" },
  { n: 3, id: "writing", label: "Writing" },
  { n: 4, id: "contact", label: "Contact" },
];

const shuffle = (a) => {
  const x = [...a];
  for (let i = x.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [x[i], x[j]] = [x[j], x[i]];
  }
  return x;
};

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

export default function Intro() {
  const [isLoading, setIsLoading] = useState(true);
  const contentRef = useRef(null);
  const { isDayMode } = useTheme();

  // Layout refs / measurements
  const titleRowRef = useRef(null);
  const frameRef = useRef(null);
  const stageRef = useRef(null);

  // Physics
  const engineRef = useRef(null);
  const bodiesRef = useRef([]);
  const rafRef = useRef(null);
  const dieEls = useRef([]);

  const [assign, setAssign] = useState([1, 2, 3, 4]);
  const [rolling, setRolling] = useState([true, true, true, true]);
  const rollingRef = useRef(rolling);
  const [boxSize, setBoxSize] = useState(148);
  const [stageH, setStageH] = useState(520);
  // Drag state ################################################
  const dragRef = useRef(null); // {i, startX, startY, lastX, lastY, lastT, moved}

  const toLocal = (e) => {
    const r = stageRef.current.getBoundingClientRect();
    return {
      x: e.clientX - r.left,
      y: e.clientY - r.top,
      t: performance.now(),
    };
  };

  const onPointerDown = (i) => (e) => {
    const { x, y, t } = toLocal(e);
    dragRef.current = {
      i,
      startX: x,
      startY: y,
      lastX: x,
      lastY: y,
      lastT: t,
      moved: false,
    };
    // while dragging, cancel default text selection / clicks
    e.preventDefault();
  };

  useEffect(() => {
    const move = (e) => {
      const d = dragRef.current;
      if (!d) return;
      const b = bodiesRef.current[d.i];
      if (!b) return;
      const { x, y, t } = toLocal(e);
      const dx = x - d.lastX,
        dy = y - d.lastY;
      if (Math.hypot(x - d.startX, y - d.startY) > 6) d.moved = true;
      // follow pointer
      Body.setPosition(b, { x, y });
      // give a little spin based on lateral motion
      Body.setAngularVelocity(b, Math.max(-3, Math.min(3, dx * 0.02)));
      d.lastX = x;
      d.lastY = y;
      d.lastT = t;
    };
    const up = (e) => {
      const d = dragRef.current;
      if (!d) return;
      const b = bodiesRef.current[d.i];
      if (b) {
        const { x, y, t } = toLocal(e);
        const dt = Math.max(16, t - d.lastT);
        // toss velocity scaled from last motion
        const vx = ((x - d.lastX) / dt) * 16;
        const vy = ((y - d.lastY) / dt) * 16;
        Body.setVelocity(b, { x: vx, y: vy - 1.2 }); // a little upward flick
      }

      // If it was a tap (no significant move), treat as click -> navigate
      if (!d.moved) {
        const n = assign[d.i];
        const m = sections.find((s) => s.n === n);
        if (m) {
          const el = document.getElementById(m.id);
          if (el) {
            if (window.lenis) window.lenis.scrollTo(el, { offset: -12 });
            else el.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }
      }
      dragRef.current = null;
    };

    window.addEventListener("pointermove", move, { passive: false });
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [assign]);
  // Drag state  END ################################################

  useEffect(() => {
    ScrollTrigger.refresh();
  }, []);
  useEffect(() => {
    rollingRef.current = rolling;
  }, [rolling]);

  // Fade in wrapper
  useEffect(() => {
    if (!isLoading && contentRef.current) {
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.35, ease: "power1.out" }
      );
    }
  }, [isLoading]);

  // Compute “playing field” height = viewport - (title bottom) - margin
  useEffect(() => {
    const calc = () => {
      const r = titleRowRef.current?.getBoundingClientRect();
      const topCut = r?.bottom ?? 0;
      const vh = window.innerHeight;
      const bottomGap = 32;
      const h = Math.max(340, vh - topCut - bottomGap);
      setStageH(h);
    };
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);

  // Init Matter.js inside the stage
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;

    const W = el.clientWidth;
    const H = el.clientHeight;

    // Tile size from width
    const size = Math.round(Math.min(200, Math.max(132, Math.floor(W / 4.2))));
    setBoxSize(size);

    const engine = Engine.create({ gravity: { x: 0, y: 1 } });
    engineRef.current = engine;

    // World bounds strictly inside the stage (floor at the visual bottom)
    const wall = (x, y, w, h) =>
      Bodies.rectangle(x, y, w, h, {
        isStatic: true,
        restitution: 0.8,
        render: { visible: false },
      });

    const thick = 60;
    const floorLift = 0.5; // nudge up ~0.5px so it visually kisses the border
    const walls = [
      wall(W / 2, H - floorLift + thick / 2, W, thick), // floor = frame bottom
      wall(W / 2, 0 - thick / 2, W, thick), // ceiling
      wall(0 - thick / 2, H / 2, thick, H), // left
      wall(W + thick / 2, H / 2, thick, H), // right
    ];

    const die = (x, y) =>
      Bodies.rectangle(x, y, size, size, {
        chamfer: { radius: 26 },
        restitution: 0.68,
        friction: 0.12,
        frictionAir: 0.018,
        density: 0.0028,
      });

    const dice = [
      die(W * 0.3, H * 0.18),
      die(W * 0.48, H * 0.12),
      die(W * 0.66, H * 0.18),
      die(W * 0.57, H * 0.1),
    ];

    Composite.add(engine.world, [...walls, ...dice]);
    bodiesRef.current = dice;

    // reshuffle numbers when dice hit each other
    const reshuffle = (() => {
      let lock = false;
      return () => {
        if (lock) return;
        lock = true;
        setAssign((p) => shuffle(p));
        setTimeout(() => (lock = false), 250);
      };
    })();

    Events.on(engine, "collisionStart", (e) => {
      for (const p of e.pairs) {
        if (dice.includes(p.bodyA) && dice.includes(p.bodyB)) {
          reshuffle();
          break;
        }
      }
    });

    // RAF loop maps physics -> DOM transforms
    const loop = () => {
      const ds = bodiesRef.current;
      const next = [...rollingRef.current];
      for (let i = 0; i < ds.length; i++) {
        const { position, angle, velocity } = ds[i];
        const moving = Math.hypot(velocity.x, velocity.y) > 0.35;
        if (moving !== next[i]) next[i] = moving;
        const elBtn = dieEls.current[i];
        if (elBtn) {
          elBtn.style.transform = `translate(${position.x - size / 2}px, ${
            position.y - size / 2
          }px) rotate(${angle}rad)`;
        }
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
  }, [stageH]);

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

  const scrollToId = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (window.lenis) window.lenis.scrollTo(el, { offset: -12 });
    else el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // gentle periodic reshuffle to keep motion
  useEffect(() => {
    const id = setInterval(() => setAssign((a) => shuffle(a)), 8000);
    return () => clearInterval(id);
  }, []);

  return (
    <MuiThemeProvider theme={muiTheme}>
      {isLoading && (
        <LoadingScreen onLoadingComplete={() => setIsLoading(false)} />
      )}
      <div ref={contentRef} style={{ opacity: 0 }}>
        <div className="min-h-screen bg-[var(--background)] relative">
          <BackgroundEffects isDayMode={isDayMode} />

          {/* HERO */}
          <section className="mx-auto max-w-6xl px-4 pt-28 md:pt-32 lg:pt-36">
            <div
              ref={titleRowRef}
              className="grid md:grid-cols-[1fr,420px] gap-10 items-start mb-4"
            >
              <h1 className="text-[clamp(40px,8.5vw,88px)] leading-[1.06] tracking-[-0.01em] font-[530] font-[CustomFont,ui-sans-serif]">
                Tony Tran
              </h1>
            </div>

            {/* Thin rounded frame that exactly fits the playing field */}
            <div
              ref={frameRef}
              className="relative rounded-[22px] md:rounded-[28px] border border-black/10 dark:border-white/10 overflow-hidden"
              style={{ height: stageH }}
            >
              {/* minimal inner bevel */}
              <div
                className="pointer-events-none absolute inset-0"
                style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,.04)" }}
              />

              {/* ToC (sticky to viewport left, unchanged) */}
              <aside className="fixed left-4 sm:left-5 top-28 z-40 select-none">
                <ol className="space-y-1.5">
                  {sections.map((s) => (
                    <li key={s.id}>
                      <button
                        onClick={() => scrollToId(s.id)}
                        className="group flex items-baseline gap-2 text-[13px] text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white"
                      >
                        <span className="w-4 text-right font-mono text-[12px] opacity-60">
                          {s.n}
                        </span>
                        <span className="font-mono text-[11px] opacity-50">
                          #
                        </span>
                        <span className="underline decoration-zinc-400/50 underline-offset-[6px] decoration-1 group-hover:decoration-zinc-600/80">
                          {s.label}
                        </span>
                      </button>
                    </li>
                  ))}
                </ol>
              </aside>

              {/* DICE STAGE (physics + DOM-mapped tiles) */}
              <div
                ref={stageRef}
                className="relative mx-auto max-w-7xl h-full overflow-hidden"
              >
                <div className="absolute inset-0">
                  {Array.from({ length: 4 }).map((_, i) => {
                    const label = sections.find(
                      (s) => s.n === assign[i]
                    )?.label;
                    return (
                      <button
                        key={i}
                        ref={(el) => (dieEls.current[i] = el)}
                        onPointerDown={onPointerDown(i)}
                        className="absolute will-change-transform rounded-[28px] border border-zinc-900/10 dark:border-white/10
             bg-white/80 dark:bg-zinc-900/70 backdrop-blur
             shadow-[0_8px_40px_-12px_rgba(0,0,0,.18)] overflow-hidden select-none"
                        style={{
                          width: boxSize,
                          height: boxSize,
                          touchAction: "none",
                        }}
                        aria-label={
                          sections.find((s) => s.n === assign[i])?.label
                        }
                      >
                        <div className="absolute inset-0 grid place-items-center pointer-events-none">
                          <DiceFace face={assign[i]} rolling={rolling[i]} />
                        </div>
                        <div className="absolute bottom-2 left-3 text-[12px] opacity-70 pointer-events-none">
                          {sections.find((s) => s.n === assign[i])?.label}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </MuiThemeProvider>
  );
}
