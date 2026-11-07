/* Project demos: draggable Kanban (Pipeline) + animated Airflow DAG (Stock ETL) */
(() => {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const wait = (ms) => new Promise((r) => setTimeout(r, reduced ? 0 : ms));

  /* =================== KANBAN =================== */
  const board = document.querySelector(".kanban");
  if (board) {
    const cols = [...board.querySelectorAll(".kanban__col")];
    let dragged = null, userTouched = false, inView = false;

    const updateCounts = () => cols.forEach((c) => {
      c.querySelector(".kanban__count").textContent = c.querySelectorAll(".kanban__card").length;
    });
    const land = (card) => {
      card.classList.remove("is-landed"); void card.offsetWidth; card.classList.add("is-landed");
    };
    const moveTo = (card, col) => { col.appendChild(card); land(card); updateCounts(); };

    board.querySelectorAll(".kanban__card").forEach((card) => {
      card.addEventListener("dragstart", (e) => {
        dragged = card; userTouched = true; card.classList.add("is-dragging");
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", "");
      });
      card.addEventListener("dragend", () => {
        card.classList.remove("is-dragging"); dragged = null;
        cols.forEach((c) => c.classList.remove("is-over"));
      });
      // click / Enter = advance to the next stage (touch + keyboard friendly)
      const advance = () => {
        userTouched = true;
        const i = cols.indexOf(card.parentElement);
        moveTo(card, cols[(i + 1) % cols.length]);
        card.focus({ preventScroll: true });
      };
      card.addEventListener("click", advance);
      card.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); advance(); } });
    });

    cols.forEach((col) => {
      col.addEventListener("dragover", (e) => { e.preventDefault(); col.classList.add("is-over"); });
      col.addEventListener("dragleave", (e) => { if (!col.contains(e.relatedTarget)) col.classList.remove("is-over"); });
      col.addEventListener("drop", (e) => {
        e.preventDefault(); col.classList.remove("is-over");
        if (dragged) moveTo(dragged, col);
      });
    });

    // auto-demo until the visitor interacts
    new IntersectionObserver(([e]) => { inView = e.isIntersecting; }, { threshold: 0.4 }).observe(board);
    let step = 0;
    if (!reduced) setInterval(() => {
      if (userTouched || !inView) return;
      const [saved, applied, interview] = cols;
      const plan = [[saved, applied], [applied, interview], [interview, saved]];
      for (let k = 0; k < 3; k++) {
        const [from, to] = plan[(step + k) % 3];
        const card = from.querySelector(".kanban__card");
        if (card) { moveTo(card, to); break; }
      }
      step = (step + 1) % 3;
    }, 2200);

    // ✦ generate kit
    const gen = board.querySelector(".kanban__gen");
    const kit = [...board.querySelectorAll(".kanban__kit li")];
    let busy = false;
    gen.addEventListener("click", async () => {
      if (busy) return;
      if (kit.every((k) => k.classList.contains("is-on"))) {
        kit.forEach((k) => k.classList.remove("is-on"));
        gen.textContent = "✦ generate application kit";
        return;
      }
      busy = true;
      gen.textContent = "◐ calling claude api…";
      for (const k of kit) { await wait(520); k.classList.add("is-on"); }
      gen.textContent = "✓ kit ready · 4 files";
      busy = false;
    });
  }

  /* =================== DAG =================== */
  const dag = document.querySelector(".dag");
  if (dag) {
    const svg = dag.querySelector(".dag__svg");
    const nodes = [...svg.querySelectorAll(".node")];
    const edges = [...svg.querySelectorAll(".dag__edges path")];
    const packets = svg.querySelector(".dag__packets");
    const state = dag.querySelector(".dag__state");
    const log = dag.querySelector(".dag__log");
    const btn = document.querySelector(".dag__run");
    const NS = "http://www.w3.org/2000/svg";
    const MSG = [
      "extracting: alpha_vantage (live) + s3_history (172 symbols)",
      "extract ok · merging sources",
      "running 7 data-quality checks… <b>7/7 passed</b>",
      "transform · idempotent upserts · <b>0 duplicates</b>",
      "loading star schema: 1 fact · 2 dims · 1 view",
      "fitting time-series forecast…",
      "dashboard refreshed · <b>42,000+ rows</b> served",
    ];
    let running = false;

    const flow = (path) => new Promise((resolve) => {
      path.classList.add("is-on");
      if (reduced) return resolve();
      const len = path.getTotalLength();
      const dots = [0, 0.22, 0.44].map(() => {
        const c = document.createElementNS(NS, "circle");
        c.setAttribute("r", "3.2"); c.setAttribute("class", "packet");
        packets.appendChild(c); return c;
      });
      const dur = 560, start = performance.now();
      (function tick(now) {
        const t = (now - start) / dur;
        dots.forEach((c, i) => {
          const p = Math.min(Math.max(t - i * 0.22, 0), 1);
          const pt = path.getPointAtLength(p * len);
          c.setAttribute("cx", pt.x); c.setAttribute("cy", pt.y);
          c.style.opacity = p <= 0 || p >= 1 ? 0 : 1;
        });
        if (t < 1.5) requestAnimationFrame(tick);
        else { dots.forEach((c) => c.remove()); resolve(); }
      })(start);
    });

    async function run() {
      if (running) return;
      running = true;
      btn && (btn.disabled = true, btn.textContent = "◐ running…");
      nodes.forEach((n) => n.classList.remove("is-running", "is-done"));
      edges.forEach((e) => e.classList.remove("is-on"));
      state.textContent = "running"; state.className = "dag__state mono is-running";

      for (let s = 0; s <= 6; s++) {
        log.innerHTML = `<span class="dim">$</span> ${MSG[s]}`;
        const ns = nodes.filter((n) => +n.dataset.step === s);
        ns.forEach((n) => n.classList.add("is-running"));
        await wait(620);
        ns.forEach((n) => { n.classList.remove("is-running"); n.classList.add("is-done"); });
        const next = edges.filter((e) => +e.dataset.step === s + 1);
        if (next.length) await Promise.all(next.map(flow));
      }
      state.textContent = "success"; state.className = "dag__state mono is-success";
      log.innerHTML = `<span class="dim">$</span> <b>✔ dag run succeeded</b> · 7 tasks · 0 failures · 0 duplicate rows`;
      btn && (btn.disabled = false, btn.textContent = "↻ Run it again");
      running = false;
    }

    btn && btn.addEventListener("click", run);
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { run(); io.disconnect(); }
    }, { threshold: 0.55 });
    io.observe(dag);
  }
})();
