/* Hero: reactive dot grid, typed prompt, scrambling role, streaming build log */
(() => {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hero = document.querySelector(".hero");
  if (!hero) return;

  /* ---------- reactive dot grid ---------- */
  const canvas = hero.querySelector(".hero__grid");
  const ctx = canvas.getContext("2d");
  const GAP = 26, RADIUS = 150;
  let w = 0, h = 0, dpr = 1, dots = [];
  let mx = -9999, my = -9999, hasMouse = false, visible = true, t0 = performance.now();

  function resize() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    w = hero.clientWidth; h = hero.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    dots = [];
    const ox = (w % GAP) / 2, oy = (h % GAP) / 2;
    for (let yy = oy; yy < h; yy += GAP) for (let xx = ox; xx < w; xx += GAP) dots.push({ x: xx, y: yy, ox: xx, oy: yy });
  }

  hero.addEventListener("mousemove", (e) => {
    const r = canvas.getBoundingClientRect();
    mx = e.clientX - r.left; my = e.clientY - r.top; hasMouse = true;
  });
  hero.addEventListener("mouseleave", () => { hasMouse = false; });

  function draw(now) {
    if (visible) {
      ctx.clearRect(0, 0, w, h);
      // without a mouse (touch / idle), a "ghost" invader wanders so the grid still breathes
      let px = mx, py = my;
      if (!hasMouse) {
        const t = (now - t0) / 1000;
        px = w * (0.62 + 0.28 * Math.sin(t * 0.45));
        py = h * (0.42 + 0.22 * Math.sin(t * 0.7 + 1));
      }
      for (const d of dots) {
        const dx = d.ox - px, dy = d.oy - py;
        const dist = Math.hypot(dx, dy);
        let tx = d.ox, ty = d.oy, k = 0;
        if (dist < RADIUS) {
          k = 1 - dist / RADIUS;
          const push = k * k * 22;
          tx += (dx / (dist || 1)) * push;
          ty += (dy / (dist || 1)) * push;
        }
        d.x += (tx - d.x) * 0.18; d.y += (ty - d.y) * 0.18;
        const shade = Math.round(205 - k * 195);
        ctx.fillStyle = `rgb(${shade},${shade},${shade + 2})`;
        const s = 1.1 + k * 1.9;
        ctx.fillRect(d.x - s / 2, d.y - s / 2, s, s);
      }
    }
    if (!reduced) requestAnimationFrame(draw);
  }

  resize();
  addEventListener("resize", () => { resize(); if (reduced) requestAnimationFrame(draw); });
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(hero);
  requestAnimationFrame(draw);

  /* ---------- typed prompt ---------- */
  const typed = hero.querySelector(".type");
  const word = typed.dataset.type;
  let i = 0;
  (function type() {
    typed.textContent = word.slice(0, ++i);
    if (i < word.length) setTimeout(type, 110 + Math.random() * 90);
  })();

  /* ---------- scrambling role ---------- */
  const scr = hero.querySelector(".scramble");
  const words = scr.dataset.words.split("|");
  const GLYPHS = "!<>-_\\/[]{}—=+*^?#01";
  let wi = 0;
  function scrambleTo(next) {
    const from = scr.textContent, len = Math.max(from.length, next.length);
    const queue = [];
    for (let n = 0; n < len; n++) {
      const start = Math.floor(Math.random() * 14), end = start + Math.floor(Math.random() * 14) + 4;
      queue.push({ from: from[n] || "", to: next[n] || "", start, end });
    }
    let frame = 0;
    (function tick() {
      let out = "", done = 0;
      for (const q of queue) {
        if (frame >= q.end) { out += q.to; done++; }
        else if (frame >= q.start) out += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        else out += q.from;
      }
      scr.textContent = out;
      frame++;
      if (done < queue.length) requestAnimationFrame(tick);
    })();
  }
  if (!reduced) setInterval(() => { wi = (wi + 1) % words.length; scrambleTo(words[wi]); }, 2800);

  /* ---------- ID badge: spring-physics swing driven by the cursor ---------- */
  const badge = hero.querySelector(".badge");
  if (badge && !reduced) {
    let angle = 0, vel = 0, push = 0, lastMX = null, badgeOn = true;
    hero.addEventListener("mousemove", (e) => {
      if (lastMX !== null) {
        const r = badge.getBoundingClientRect();
        // movement near the badge pushes it harder
        const near = Math.max(0, 1 - Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2)) / 420);
        push += (e.clientX - lastMX) * (0.04 + near * 0.22);
      }
      lastMX = e.clientX;
    });
    hero.addEventListener("mouseleave", () => { lastMX = null; });
    new IntersectionObserver(([e]) => { badgeOn = e.isIntersecting; }).observe(badge);
    const t1 = performance.now();
    (function swing(now) {
      if (badgeOn && innerWidth > 1024) {
        const idle = Math.sin((now - t1) / 1400) * 0.6;          // gentle breathing sway
        const acc = -0.045 * (angle - idle) - 0.09 * vel + push * 0.05;
        push *= 0.6;
        vel += acc; angle += vel;
        angle = Math.max(-14, Math.min(14, angle));
        badge.style.setProperty("--swing", `${angle.toFixed(3)}deg`);
      }
      requestAnimationFrame(swing);
    })(t1);
  }

  /* ---------- streaming build log ---------- */
  const log = hero.querySelector(".logwin__body");
  const LINES = [
    ['<span class="lg-tag">[boot]</span>     loading lok.profile…'],
    ['<span class="lg-tag">[extract]</span>  B.Tech ECE · MS Info Systems <span class="lg-ok">✓</span>'],
    ['<span class="lg-tag">[extract]</span>  16 months as a software engineer <span class="lg-ok">✓</span>'],
    ['<span class="lg-tag">[validate]</span> GPA 3.78 / 4.0 <span class="lg-ok">✓</span>'],
    ['<span class="lg-tag">[transform]</span> requirements → shipped code <span class="lg-ok">✓</span>'],
    ['<span class="lg-tag">[load]</span>     stack: java · python · ts · sql <span class="lg-ok">✓</span>'],
    ['<span class="lg-tag">[serve]</span>    status: <span class="lg-hi">open to full-time roles</span>'],
    ['<span class="lg-ok">✔ run succeeded</span> <span class="lg-tag">· next: your team</span>'],
  ];
  function runLog() {
    log.innerHTML = "";
    LINES.forEach(([html], n) => {
      setTimeout(() => {
        const li = document.createElement("li");
        li.innerHTML = html;
        log.appendChild(li);
      }, reduced ? 0 : 500 + n * 520);
    });
    if (!reduced) setTimeout(runLog, 500 + LINES.length * 520 + 6000);
  }
  runLog();
})();
