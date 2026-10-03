/* ==========================================================================
   Crystal Collector — a tiny canvas remake of the UE5 project.
   Collect crystals, dodge cannon fire. More cannons + faster shots over time.

   Cost model: nothing runs until you press Play. The loop stops again when the
   game is scrolled off-screen, the tab is hidden, or the run is over.
   ========================================================================== */
(() => {
  "use strict";

  const canvas  = document.getElementById("gameCanvas");
  const overlay = document.getElementById("gameOverlay");
  const titleEl = document.getElementById("gameTitle");
  const msgEl   = document.getElementById("gameMsg");
  const btn     = document.getElementById("gameBtn");
  const status  = document.getElementById("gameStatus");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const W = 800, H = 450;
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = W * DPR;
  canvas.height = H * DPR;
  ctx.scale(DPR, DPR);

  /* ---------- Tuning ---------- */
  const PLAYER_R = 11, PLAYER_SPEED = 250;
  const LIVES = 3, INVULN = 1.2;
  const CRYSTAL_R = 11, CRYSTAL_POINTS = 10;
  const SHOT_R = 5;
  const MAX_CANNONS = 4;
  const CANNON_SLOTS = [            // where cannons sit, unlocked in order
    { x: W / 2, y: 0,  angle: Math.PI / 2 },
    { x: W / 2, y: H,  angle: -Math.PI / 2 },
    { x: 0,     y: H / 2, angle: 0 },
    { x: W,     y: H / 2, angle: Math.PI },
  ];

  /* ---------- State ---------- */
  let state = "idle";               // idle | playing | paused | over
  let player, crystal, cannons, shots, score, crystals, lives, invuln, elapsed, best = 0;
  let rafId = 0, lastT = 0, onScreen = false;
  const keys = new Set();
  let pointer = null;               // {x, y} in game coordinates while touching/dragging

  try { best = Number(localStorage.getItem("cc-best")) || 0; } catch (_) { /* storage blocked */ }

  const rand = (a, b) => a + Math.random() * (b - a);

  function reset() {
    player = { x: W / 2, y: H / 2 };
    cannons = [];
    shots = [];
    score = 0; crystals = 0; lives = LIVES; invuln = 1; elapsed = 0;
    addCannon();
    spawnCrystal();
  }

  function addCannon() {
    if (cannons.length >= MAX_CANNONS) return;
    const slot = CANNON_SLOTS[cannons.length];
    cannons.push({ ...slot, timer: rand(0.6, 1.4) });
  }

  function spawnCrystal() {
    let x, y;
    do { x = rand(50, W - 50); y = rand(60, H - 50); }
    while (Math.hypot(x - player.x, y - player.y) < 120);
    crystal = { x, y, t: 0 };
  }

  /* ---------- Update ---------- */
  function update(dt) {
    elapsed += dt;
    invuln = Math.max(0, invuln - dt);

    // Movement: keyboard, or follow the finger/cursor while dragging
    let dx = 0, dy = 0;
    if (keys.has("left"))  dx -= 1;
    if (keys.has("right")) dx += 1;
    if (keys.has("up"))    dy -= 1;
    if (keys.has("down"))  dy += 1;
    if (dx || dy) {
      const len = Math.hypot(dx, dy);
      player.x += (dx / len) * PLAYER_SPEED * dt;
      player.y += (dy / len) * PLAYER_SPEED * dt;
    } else if (pointer) {
      const vx = pointer.x - player.x, vy = pointer.y - player.y;
      const dist = Math.hypot(vx, vy);
      if (dist > 4) {
        const step = Math.min(dist, PLAYER_SPEED * 1.15 * dt);
        player.x += (vx / dist) * step;
        player.y += (vy / dist) * step;
      }
    }
    player.x = Math.max(PLAYER_R, Math.min(W - PLAYER_R, player.x));
    player.y = Math.max(PLAYER_R, Math.min(H - PLAYER_R, player.y));

    // Difficulty ramps with crystals collected
    const interval = Math.max(0.75, 1.7 - crystals * 0.06);
    const speed = Math.min(260, 150 + crystals * 6);

    for (const c of cannons) {
      c.aim = Math.atan2(player.y - c.y, player.x - c.x);
      c.timer -= dt;
      if (c.timer <= 0) {
        c.timer = interval * rand(0.85, 1.25);
        shots.push({ x: c.x, y: c.y, vx: Math.cos(c.aim) * speed, vy: Math.sin(c.aim) * speed });
      }
    }

    for (let i = shots.length - 1; i >= 0; i--) {
      const s = shots[i];
      s.x += s.vx * dt; s.y += s.vy * dt;
      if (s.x < -20 || s.x > W + 20 || s.y < -20 || s.y > H + 20) { shots.splice(i, 1); continue; }
      if (invuln === 0 && Math.hypot(s.x - player.x, s.y - player.y) < PLAYER_R + SHOT_R - 1) {
        shots.splice(i, 1);
        lives--;
        invuln = INVULN;
        if (lives <= 0) { endGame(); return; }
      }
    }

    crystal.t += dt;
    if (Math.hypot(crystal.x - player.x, crystal.y - player.y) < PLAYER_R + CRYSTAL_R) {
      crystals++;
      score += CRYSTAL_POINTS;
      if (crystals % 4 === 0) addCannon();
      spawnCrystal();
    }
  }

  /* ---------- Draw ---------- */
  function draw() {
    ctx.fillStyle = "#0a0a12";
    ctx.fillRect(0, 0, W, H);

    // faint grid
    ctx.strokeStyle = "rgba(77,166,255,.07)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 50; x < W; x += 50) { ctx.moveTo(x, 0); ctx.lineTo(x, H); }
    for (let y = 50; y < H; y += 50) { ctx.moveTo(0, y); ctx.lineTo(W, y); }
    ctx.stroke();

    // crystal (diamond + soft halo, no shadowBlur — it's slow)
    const bob = Math.sin(crystal.t * 4) * 2;
    ctx.fillStyle = "rgba(120,220,255,.12)";
    ctx.beginPath(); ctx.arc(crystal.x, crystal.y + bob, CRYSTAL_R + 7, 0, 6.2832); ctx.fill();
    ctx.fillStyle = "#8fe3ff";
    ctx.beginPath();
    ctx.moveTo(crystal.x, crystal.y + bob - CRYSTAL_R);
    ctx.lineTo(crystal.x + CRYSTAL_R * 0.75, crystal.y + bob);
    ctx.lineTo(crystal.x, crystal.y + bob + CRYSTAL_R);
    ctx.lineTo(crystal.x - CRYSTAL_R * 0.75, crystal.y + bob);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(crystal.x - 1, crystal.y + bob - CRYSTAL_R * 0.6, 2, CRYSTAL_R * 0.5);

    // cannons
    for (const c of cannons) {
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate(c.aim ?? c.angle);
      ctx.fillStyle = "#3a1414";
      ctx.fillRect(0, -6, 30, 12);
      ctx.fillStyle = "#e03030";
      ctx.fillRect(22, -4, 10, 8);
      ctx.restore();
      ctx.fillStyle = "#2a2a3a";
      ctx.beginPath(); ctx.arc(c.x, c.y, 16, 0, 6.2832); ctx.fill();
    }

    // shots
    ctx.fillStyle = "#ff6a3d";
    ctx.beginPath();
    for (const s of shots) { ctx.moveTo(s.x + SHOT_R, s.y); ctx.arc(s.x, s.y, SHOT_R, 0, 6.2832); }
    ctx.fill();

    // player (blinks while invulnerable)
    if (invuln === 0 || Math.floor(invuln * 12) % 2 === 0) {
      ctx.fillStyle = "#4da6ff";
      ctx.beginPath(); ctx.arc(player.x, player.y, PLAYER_R, 0, 6.2832); ctx.fill();
      ctx.fillStyle = "#eeeeff";
      ctx.beginPath(); ctx.arc(player.x, player.y, 3.5, 0, 6.2832); ctx.fill();
    }

    // HUD
    ctx.fillStyle = "#eeeeff";
    ctx.font = "16px 'Share Tech Mono', monospace";
    ctx.textAlign = "left";
    ctx.fillText(`SCORE ${score}`, 16, 28);
    ctx.fillStyle = "#7a7a92";
    ctx.fillText(`BEST ${Math.max(best, score)}`, 16, 50);
    ctx.fillStyle = "#e03030";
    for (let i = 0; i < lives; i++) { ctx.beginPath(); ctx.arc(W - 22 - i * 22, 24, 7, 0, 6.2832); ctx.fill(); }
  }

  /* ---------- Loop control ---------- */
  function loop(t) {
    rafId = 0;
    if (state !== "playing") return;
    const dt = Math.min(0.05, (t - lastT) / 1000 || 0);
    lastT = t;
    update(dt);
    if (state === "playing") { draw(); rafId = requestAnimationFrame(loop); }
  }

  function startLoop() {
    if (rafId || state !== "playing") return;
    lastT = performance.now();
    rafId = requestAnimationFrame(loop);
  }

  function showOverlay(title, msg, label) {
    titleEl.textContent = title;
    msgEl.textContent = msg;
    btn.textContent = label;
    overlay.hidden = false;
  }

  function startGame() {
    reset();
    state = "playing";
    overlay.hidden = true;
    status.textContent = "";
    startLoop();
  }

  function endGame() {
    state = "over";
    keys.clear(); pointer = null;
    if (score > best) {
      best = score;
      try { localStorage.setItem("cc-best", String(best)); } catch (_) { /* storage blocked */ }
    }
    draw();
    showOverlay("Game over", `You collected ${crystals} crystal${crystals === 1 ? "" : "s"} — score ${score}. Best: ${best}.`, "Play again");
    status.textContent = `Game over. Score ${score}, best ${best}.`;
    btn.focus({ preventScroll: true });
  }

  function pause(reason) {
    if (state !== "playing") return;
    state = "paused";
    keys.clear(); pointer = null;
    if (rafId) { cancelAnimationFrame(rafId); rafId = 0; }
    showOverlay("Paused", reason, "Resume");
  }

  function resume() {
    state = "playing";
    overlay.hidden = true;
    startLoop();
  }

  btn.addEventListener("click", () => (state === "paused" ? resume() : startGame()));

  // Stop doing any work when the game isn't visible
  new IntersectionObserver(([entry]) => {
    onScreen = entry.isIntersecting;
    if (!onScreen) pause("Paused while you were away.");
  }, { threshold: 0.25 }).observe(canvas);
  document.addEventListener("visibilitychange", () => { if (document.hidden) pause("Paused while you were away."); });
  window.addEventListener("blur", () => pause("Paused — click Resume to continue."));

  /* ---------- Input ---------- */
  const KEYMAP = {
    ArrowLeft: "left", KeyA: "left", ArrowRight: "right", KeyD: "right",
    ArrowUp: "up", KeyW: "up", ArrowDown: "down", KeyS: "down",
  };

  document.addEventListener("keydown", (e) => {
    const dir = KEYMAP[e.code];
    if (!dir || state !== "playing") return;
    const tag = (e.target.tagName || "").toLowerCase();
    if (tag === "input" || tag === "textarea") return;
    keys.add(dir);
    e.preventDefault(); // stop the page scrolling while you play
  });
  document.addEventListener("keyup", (e) => { const dir = KEYMAP[e.code]; if (dir) keys.delete(dir); });

  function toGame(e) {
    const r = canvas.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H };
  }
  canvas.addEventListener("pointerdown", (e) => {
    if (state !== "playing") return;
    canvas.setPointerCapture(e.pointerId);
    pointer = toGame(e);
  });
  canvas.addEventListener("pointermove", (e) => { if (pointer) pointer = toGame(e); });
  const release = () => { pointer = null; };
  canvas.addEventListener("pointerup", release);
  canvas.addEventListener("pointercancel", release);

  // First frame behind the title overlay
  reset();
  draw();
})();
