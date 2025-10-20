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
import { Highlighter } from "../components/ui/highlighter.jsx";

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

function DiceFace({ size = 100, face, rolling }) {
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

  // Measured stage size (fixes “0 width at first paint”)
  const [stageSize, setStageSize] = useState({ w: 0, h: 0 });

  // Physics
  const engineRef = useRef(null);
  const bodiesRef = useRef([]);
  const rafRef = useRef(null);
  const dieEls = useRef([]);
  const boxRef = useRef(148);

  const [assign, setAssign] = useState([1, 2, 3, 4]);
  const [rolling, setRolling] = useState([true, true, true, true]);
  const rollingRef = useRef(rolling);
  const [boxSize, setBoxSize] = useState(148);
  const [stageH, setStageH] = useState(520);

  // Drag state
  const dragRef = useRef(null); // {i, startX, startY, lastX, lastY, lastT, moved}
  const [hoverN, setHoverN] = useState(null); // 1..4 or null

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const TARGET_AR = 16 / 6; // width / height
  const MIN_H = 700; //
  const MAX_H = 900;

  const ROOF_INSET = 12;
  const BOUNDS_PAD = 6;
  const MAX_VX = 22;
  const MAX_VY = 28;
  const BOUNCE_DAMPING = 0.35;
  const markedReadyRef = useRef(false);
  const [stageReady, setStageReady] = useState(false);
  const [introAnimReady, setIntroAnimReady] = useState(false);

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
    const b = bodiesRef.current[i];
    if (b) {
      Body.setStatic(b, true);
      Body.setVelocity(b, { x: 0, y: 0 });
      Body.setAngularVelocity(b, 0);
    }
    e.preventDefault();
  };

  useEffect(() => {
    const move = (e) => {
      const d = dragRef.current;
      if (!d) return;
      const b = bodiesRef.current[d.i];
      if (!b) return;
      const { x, y, t } = toLocal(e);

      const W = stageSize.w,
        H = stageSize.h;
      const half = boxRef.current / 2;

      const left = half + 6;
      const right = W - half - 6;
      const top = ROOF_INSET + half;
      const bottom = H - half - 6;

      const cx = clamp(x, left, right);
      const cy = clamp(y, top, bottom);

      const dx = cx - d.lastX;
      if (Math.hypot(cx - d.startX, cy - d.startY) > 6) d.moved = true;

      Body.setPosition(b, { x: cx, y: cy });
      Body.setAngularVelocity(b, Math.max(-3.5, Math.min(3.5, dx * 0.02)));

      d.lastX = cx;
      d.lastY = cy;
      d.lastT = t;
    };

    const up = (e) => {
      const d = dragRef.current;
      if (!d) return;
      const b = bodiesRef.current[d.i];
      if (b) {
        const { x, y, t } = toLocal(e);
        const dt = Math.max(16, t - d.lastT);
        let vx = ((x - d.lastX) / dt) * 22;
        let vy = ((y - d.lastY) / dt) * 22;
        vx = Math.max(-MAX_VX, Math.min(MAX_VX, vx));
        vy = Math.max(-MAX_VY, Math.min(MAX_VY, vy));
        Body.setStatic(b, false);

        Matter.Sleeping.set(b, false);

        const speed = Math.hypot(vx, vy);
        if (speed < 0.05) {
          Body.applyForce(b, b.position, { x: 0.0005, y: -0.001 }); // tiny upward/side tickle
        }
        Body.setVelocity(b, { x: vx, y: vy });
      }
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
  }, [assign, stageSize.w, stageSize.h]);

  useEffect(() => {
    ScrollTrigger.refresh();
  }, []);
  useEffect(() => {
    rollingRef.current = rolling;
  }, [rolling]);

  // Playing-field height = viewport - (title bottom) - margin
  useEffect(() => {
    const calc = () => {
      const w = frameRef.current?.clientWidth ?? 0;
      if (!w) return;
      const hFromAR = Math.round(w / TARGET_AR);
      setStageH(clamp(hFromAR, MIN_H, MAX_H));
    };
    // initial + on resize
    calc();
    window.addEventListener("resize", calc);
    // also re-run when fonts load or after loader in case widths shift
    const id = requestAnimationFrame(calc);
    return () => {
      window.removeEventListener("resize", calc);
      cancelAnimationFrame(id);
    };
  }, []);

  // Measure stage size continuously
  useEffect(() => {
    if (!isLoading && contentRef.current) {
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.35, ease: "power1.out" }
      );
    }
  }, [isLoading]);
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;

    const update = () => {
      const w = el.clientWidth || 0;
      const h = el.clientHeight || 0;
      setStageSize((s) => (s.w !== w || s.h !== h ? { w, h } : s));
    };

    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("resize", update);
    // do an immediate read too
    update();

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  // Init Matter.js once we have a real stage size; rebuild on size change
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;

    const W = stageSize.w,
      H = stageSize.h;
    if (W < 50 || H < 50) return; // guard against first zero paint

    const byW = (W - 48) / 4;
    const byH = (H - 64) / 2.2;
    const size = Math.round(clamp(Math.min(byW, byH), 132, 260));
    setBoxSize(size);
    boxRef.current = size;

    const engine = Engine.create({ gravity: { x: 0, y: 1 } });
    engine.enableSleeping = true;
    engine.positionIterations = 10; // default 6
    engine.velocityIterations = 8; // default 4
    engineRef.current = engine;

    const wall = (x, y, w, h) =>
      Bodies.rectangle(x, y, w, h, {
        isStatic: true,
        restitution: 0,
        friction: 1,
        frictionStatic: 1,
        render: { visible: false },
      });

    const thick = 60;
    const walls = [
      wall(W / 2, H - 0.5 + thick / 2, W, thick),
      wall(W / 2, ROOF_INSET - thick / 2, W, thick),
      wall(0 - thick / 2, H / 2, thick, H),
      wall(W + thick / 2, H / 2, thick, H),
    ];

    const die = (x, y) =>
      Bodies.rectangle(x, y, size, size, {
        chamfer: { radius: 16 }, // was 26
        restitution: 0.04, // was 0.18
        friction: 0.8, // was 0.35
        frictionStatic: 1.0, // was 0.6
        frictionAir: 0.02, // was 0.035
        density: 0.006, // was 0.0045
        sleepThreshold: 30, // settle easier on stacks
      });

    const dice = [
      die(W * 0.28, H * 0.15),
      die(W * 0.46, H * 0.12),
      die(W * 0.64, H * 0.16),
      die(W * 0.54, H * 0.1),
    ];

    Composite.add(engine.world, [...walls, ...dice]);
    bodiesRef.current = dice;

    // reshuffle on dice-dice collisions
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

    // RAF loop
    const loop = () => {
      const next = [...rollingRef.current];
      const sz = boxRef.current;
      const half = sz / 2;

      for (let i = 0; i < dice.length; i++) {
        const b = dice[i];
        let { x, y } = b.position;
        let { x: vx, y: vy } = b.velocity;

        vx = Math.max(-MAX_VX, Math.min(MAX_VX, vx));
        vy = Math.max(-MAX_VY, Math.min(MAX_VY, vy));
        if (vx !== b.velocity.x || vy !== b.velocity.y)
          Body.setVelocity(b, { x: vx, y: vy });

        const minX = half + BOUNDS_PAD;
        const maxX = W - half - BOUNDS_PAD;
        const minY = ROOF_INSET + half;
        const maxY = H - half - BOUNDS_PAD;

        if (x < minX) {
          x = minX;
          Body.setPosition(b, { x, y });
          Body.setVelocity(b, { x: Math.abs(vx) * BOUNCE_DAMPING, y: vy });
        } else if (x > maxX) {
          x = maxX;
          Body.setPosition(b, { x, y });
          Body.setVelocity(b, { x: -Math.abs(vx) * BOUNCE_DAMPING, y: vy });
        }

        if (y < minY) {
          y = minY;
          Body.setPosition(b, { x, y });
          Body.setVelocity(b, { x: vx, y: Math.abs(vy) * BOUNCE_DAMPING });
        } else if (y > maxY) {
          y = maxY;
          Body.setPosition(b, { x, y });
          Body.setVelocity(b, { x: vx, y: -Math.abs(vy) * BOUNCE_DAMPING });
        }

        const moving = Math.hypot(vx, vy) > 0.35;
        if (moving !== next[i]) next[i] = moving;

        const elBtn = dieEls.current[i];
        if (elBtn)
          elBtn.style.transform = `translate(${x - half}px, ${
            y - half
          }px) rotate(${b.angle}rad)`;
      }

      if (next.some((v, i) => v !== rollingRef.current[i])) setRolling(next);
      Engine.update(engine, 1000 / 60);

      if (!stageReady) {
        markedReadyRef.current = true;
        requestAnimationFrame(() => setStageReady(true));
      }

      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      Engine.clear(engine);
      engineRef.current = null;
      bodiesRef.current = [];
    };
  }, [stageSize.w, stageSize.h]);

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

  useEffect(() => {
    boxRef.current = boxSize;
  }, [boxSize]);

  return (
    <MuiThemeProvider theme={muiTheme}>
      <LoadingScreen
        active={isLoading}
        ready={stageReady}
        minDuration={2000}
        safetyTimeout={6000}
        onLoadingComplete={() => {
          setIsLoading(false);
          // delay intro animations slightly so the loader is fully gone
          setTimeout(() => setIntroAnimReady(true), 350);
        }}
      />

      <div ref={contentRef}>
        <div className="min-h-screen bg-[hsl(var(--background))] relative">
          <BackgroundEffects isDayMode={isDayMode} />

          {/* HERO */}
          <section className="mx-auto max-w-6xl px-4 pt-16 md:pt-20 lg:pt-24">
            <div
              ref={titleRowRef}
              className="grid md:grid-cols-[1fr,420px] gap-10 items-start mb-4"
            >
              <h1 className="text-[clamp(40px,8.5vw,88px)] leading-[1.06] tracking-[-0.01em] font-[530] font-[synonym,ui-sans-serif]">
                {introAnimReady ? (
                  <Highlighter action="underline" color="#FF9800">
                    Tony Tran
                  </Highlighter>
                ) : (
                  // render plain text until we kick off the highlight animation
                  "Tony Tran"
                )}
              </h1>
            </div>

            {/* Frame that fits the playing field */}
            <div
              ref={frameRef}
              className="relative rounded-[22px] md:rounded-[28px] border border-black/10 dark:border-white/10 overflow-hidden"
              style={{ height: stageH }}
            >
              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-black/5 to-transparent"
                style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,.04)" }}
              />

              {/* TOC */}
              {/* TOC */}
              <aside className="fixed left-6 xl:left-9 top-1/2 -translate-y-1/2 z-40 select-none">
                <ol className="space-y-3">
                  {sections.map((s) => {
                    const isActive = hoverN === s.n;
                    return (
                      <li key={s.id}>
                        <button
                          onClick={() => scrollToId(s.id)}
                          onPointerEnter={() => setHoverN(s.n)}
                          onPointerLeave={() => setHoverN(null)}
                          className="group flex items-baseline gap-3"
                          style={{ lineHeight: 1.04 }}
                        >
                          <span
                            className="font-mono select-none"
                            style={{
                              fontSize: "clamp(32px, 5vw, 64px)",
                              WebkitTextStroke: "1.2px currentColor",
                              color: "transparent",
                              opacity: 0.9,
                            }}
                          >
                            {s.n}
                          </span>
                          <span
                            className="font-mono select-none"
                            style={{
                              fontSize: "clamp(18px, 2vw, 28px)",
                              WebkitTextStroke: "1px currentColor",
                              color: "transparent",
                              opacity: 0.6,
                            }}
                          >
                            #
                          </span>

                          <Highlighter
                            action="highlight"
                            color="#87CEFA"
                            active={isActive}
                          >
                            <span
                              className="select-none underline underline-offset-[10px] decoration-[3px]"
                              style={{
                                fontSize: "clamp(28px, 3.5vw, 48px)",
                                WebkitTextStroke: "1px currentColor",
                                color: "currentColor",
                                opacity: isActive ? 1 : 0.85,
                                transition: "opacity .15s linear",
                              }}
                            >
                              {s.label}
                            </span>
                          </Highlighter>
                        </button>
                      </li>
                    );
                  })}
                </ol>
              </aside>

              {/* DICE STAGE */}
              <div
                ref={stageRef}
                className="relative mx-auto max-w-7xl h-full overflow-hidden"
              >
                <div className="absolute inset-0">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <button
                      key={i}
                      ref={(el) => (dieEls.current[i] = el)}
                      onPointerEnter={() => setHoverN(assign[i])}
                      onPointerLeave={() => setHoverN(null)}
                      onPointerDown={onPointerDown(i)}
                      className={`absolute will-change-transform rounded-[28px] border border-zinc-900/10 dark:border-white/10 bg-white/80 dark:bg-zinc-900/70 backdrop-blur shadow-[0_8px_40px_-12px_rgba(0,0,0,.18)] overflow-hidden select-none ${
                        hoverN === assign[i] ? "ring-4 ring-black" : "ring-0"
                      }`}
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
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </MuiThemeProvider>
  );
}
