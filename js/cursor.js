/* 👾 cursor — replaces the pointer on mouse/trackpad devices only.
   Touch devices and keyboard users keep native behaviour. */
(() => {
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (!finePointer) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const root = document.documentElement;
  const cursor = document.querySelector(".cursor");
  const emoji = cursor.querySelector(".cursor__emoji");
  root.classList.add("has-cursor");

  const INTERACTIVE = "a, button, summary, input, textarea, [draggable='true'], .phone, .copy, label, .badge";
  const DARK = ".band--dark, .logwin, .dag, .term, .btn--dark, .pill, .scramble, .kanban__gen";

  let x = innerWidth / 2, y = innerHeight / 2;
  let lastX = x, lastY = y, lastTrail = 0, seen = false;

  cursor.classList.add("is-hidden");

  addEventListener("mousemove", (e) => {
    x = e.clientX; y = e.clientY;
    if (!seen) { seen = true; cursor.classList.remove("is-hidden"); }
    const t = e.target instanceof Element ? e.target : null;
    cursor.classList.toggle("is-hover", !!(t && t.closest(INTERACTIVE)));

    // pixel trail
    const now = performance.now();
    if (!reduced && now - lastTrail > 28 && Math.hypot(x - lastX, y - lastY) > 6) {
      lastTrail = now;
      spawnTrail(x, y, !!(t && t.closest(DARK)));
    }
  }, { passive: true });

  document.addEventListener("mouseleave", () => cursor.classList.add("is-hidden"));
  document.addEventListener("mouseenter", () => cursor.classList.remove("is-hidden"));
  addEventListener("mousedown", () => cursor.classList.add("is-down"));
  addEventListener("mouseup", () => cursor.classList.remove("is-down"));
  addEventListener("click", (e) => { if (!reduced) burst(e.clientX, e.clientY); });

  function frame() {
    const vx = x - lastX;
    lastX += vx * 0.55; lastY += (y - lastY) * 0.55;
    cursor.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    // tilt with horizontal velocity — the invader leans into the motion
    const tilt = Math.max(-22, Math.min(22, vx * 0.9));
    emoji.style.setProperty("--tilt", `${tilt}deg`);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  let trailCount = 0;
  function spawnTrail(px, py, onDark) {
    if (trailCount > 40) return;
    const d = document.createElement("i");
    d.className = "cursor-trail" + (onDark ? " on-dark" : "");
    const ox = (Math.random() - 0.5) * 10, oy = (Math.random() - 0.5) * 10;
    d.style.left = `${px + ox - 3}px`;
    d.style.top = `${py + oy + 8}px`;
    d.style.setProperty("--x", `${(Math.random() - 0.5) * 16}px`);
    d.style.setProperty("--y", `${10 + Math.random() * 14}px`);
    document.body.appendChild(d);
    trailCount++;
    d.addEventListener("animationend", () => { d.remove(); trailCount--; });
  }

  const BITS = ["👾", "✦", "▪", "👾", "✦", "▪", "👾"];
  function burst(px, py) {
    BITS.forEach((b, i) => {
      const s = document.createElement("span");
      s.className = "cursor-burst";
      s.textContent = b;
      const a = (i / BITS.length) * Math.PI * 2 + Math.random() * 0.5;
      const r = 36 + Math.random() * 26;
      s.style.setProperty("--x0", `${px - 8}px`);
      s.style.setProperty("--y0", `${py - 10}px`);
      s.style.setProperty("--x1", `${px - 8 + Math.cos(a) * r}px`);
      s.style.setProperty("--y1", `${py - 10 + Math.sin(a) * r}px`);
      s.style.setProperty("--r", `${(Math.random() - 0.5) * 180}deg`);
      document.body.appendChild(s);
      s.addEventListener("animationend", () => s.remove());
    });
  }
})();
