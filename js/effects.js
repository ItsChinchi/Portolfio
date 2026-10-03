/* ==========================================================================
   Visual effects — all are skipped for users who prefer reduced motion,
   and the cursor effects only run on devices with a real mouse.

   Performance notes:
   - the cursor moves with a transform (no layout), batched to one update per frame
   - particles run at ~30fps, draw all links in one stroke, and pause off-screen
   - the canvas cursor trail is the most expensive effect, so it is OFF by default
   ========================================================================== */
(() => {
  "use strict";

  const ENABLE_CURSOR_TRAIL = false; // set to true if you want the red trail back (costs CPU)

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer   = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- Intro (plays once per browser session) ---------- */
  const intro = document.getElementById("intro");
  if (intro) {
    const dismiss = () => {
      intro.remove();
      try { sessionStorage.setItem("introSeen", "1"); } catch (_) { /* storage blocked */ }
    };
    if (reducedMotion || document.documentElement.classList.contains("no-intro")) dismiss();
    else {
      intro.addEventListener("animationend", (e) => { if (e.animationName === "introOut") dismiss(); });
      intro.addEventListener("click", dismiss); // let impatient visitors skip it
    }
  }

  if (reducedMotion) return;

  /* ---------- Custom cursor ---------- */
  if (finePointer) {
    document.documentElement.classList.add("custom-cursor");

    const cursor = document.getElementById("cursor");
    const dot = document.getElementById("cursor-dot");
    let mx = -100, my = -100, queued = false;

    // Optional trail (off by default)
    let trailCtx = null, points = [], trailRaf = 0;
    if (ENABLE_CURSOR_TRAIL) {
      const canvas = document.createElement("canvas");
      canvas.setAttribute("aria-hidden", "true");
      canvas.style.cssText = "position:fixed;inset:0;width:100%;height:100%;z-index:99990;pointer-events:none";
      document.body.append(canvas);
      const size = () => { canvas.width = innerWidth; canvas.height = innerHeight; };
      size(); addEventListener("resize", size);
      trailCtx = canvas.getContext("2d");
      const LIFE = 500;
      const draw = (now) => {
        trailCtx.clearRect(0, 0, canvas.width, canvas.height);
        points = points.filter((p) => now - p.t < LIFE);
        trailCtx.fillStyle = "#e03030";
        for (const p of points) {
          const k = 1 - (now - p.t) / LIFE;
          trailCtx.globalAlpha = k;
          trailCtx.beginPath(); trailCtx.arc(p.x, p.y, 2 * k, 0, 6.2832); trailCtx.fill();
        }
        trailRaf = points.length ? requestAnimationFrame(draw) : 0;
      };
      addEventListener("mousemove", () => { points.push({ x: mx, y: my, t: performance.now() }); if (!trailRaf) trailRaf = requestAnimationFrame(draw); }, { passive: true });
    }

    function paintCursor() {
      queued = false;
      cursor.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
      dot.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
    }
    document.addEventListener("mousemove", (e) => {
      mx = e.clientX; my = e.clientY;
      if (!queued) { queued = true; requestAnimationFrame(paintCursor); }
    }, { passive: true });
    document.addEventListener("mousedown", () => cursor.classList.add("clicking"));
    document.addEventListener("mouseup",   () => cursor.classList.remove("clicking"));
  }

  /* ---------- Hero particles ---------- */
  const canvas = document.getElementById("particles-canvas");
  const hero = document.getElementById("home");
  if (!canvas || !hero) return;

  const ctx = canvas.getContext("2d");
  const LINK_DIST = 90, LINK_DIST_SQ = LINK_DIST * LINK_DIST;
  const FRAME_MS = 1000 / 30;
  let W = 0, H = 0, particles = [], running = false, heroVisible = true, lastDraw = 0;

  class Particle {
    constructor() { this.reset(true); }
    reset(initial = false) {
      this.x = Math.random() * W;
      this.y = initial ? Math.random() * H : H + 10;
      this.vx = (Math.random() - 0.5) * 0.6;
      this.vy = -Math.random() * 1 - 0.2;       // doubled: we only step at 30fps
      this.r = Math.random() * 1.5 + 0.5;
      this.a = Math.random() * 0.6 + 0.15;
      this.maxLife = Math.random() * 100 + 50;
      this.life = initial ? Math.random() * this.maxLife : 0;
      this.red = Math.random() > 0.7;
    }
    update() {
      this.x += this.vx; this.y += this.vy; this.life++;
      if (this.life > this.maxLife || this.y < -10) this.reset();
    }
  }

  function resize() {
    W = canvas.width = hero.clientWidth;
    H = canvas.height = hero.clientHeight;
    const count = W < 700 ? 22 : 45;
    particles = Array.from({ length: count }, () => new Particle());
  }

  function frame(now) {
    if (!running) return;
    requestAnimationFrame(frame);
    if (now - lastDraw < FRAME_MS) return;
    lastDraw = now;

    ctx.clearRect(0, 0, W, H);
    for (const p of particles) p.update();

    // All links in a single path / single stroke call.
    ctx.globalAlpha = 0.07;
    ctx.strokeStyle = "#e03030";
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    for (let i = 0; i < particles.length; i++) {
      const a = particles[i];
      for (let j = i + 1; j < particles.length; j++) {
        const b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        if (dx * dx + dy * dy < LINK_DIST_SQ) { ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); }
      }
    }
    ctx.stroke();

    // Dots, batched by colour (two fills instead of one per particle).
    for (const red of [true, false]) {
      ctx.fillStyle = red ? "#e03030" : "#4da6ff";
      ctx.globalAlpha = 0.45;
      ctx.beginPath();
      for (const p of particles) {
        if (p.red !== red) continue;
        ctx.moveTo(p.x + p.r, p.y);
        ctx.arc(p.x, p.y, p.r, 0, 6.2832);
      }
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  /** Only animate while the hero is on screen and the tab is visible. */
  function syncRunning() {
    const shouldRun = heroVisible && !document.hidden;
    if (shouldRun && !running) { running = true; requestAnimationFrame(frame); }
    else if (!shouldRun) running = false;
  }

  resize();
  let resizeTimer;
  addEventListener("resize", () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(resize, 150); });
  new IntersectionObserver(([entry]) => { heroVisible = entry.isIntersecting; syncRunning(); }).observe(hero);
  document.addEventListener("visibilitychange", syncRunning);
  syncRunning();
})();
