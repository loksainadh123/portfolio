/* Shared behaviours: scroll reveals, counters, copy-to-clipboard, adaptive nav */
(() => {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- scroll reveal ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("is-in");
      io.unobserve(e.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  document.querySelectorAll(".reveal").forEach((el, i) => {
    el.style.transitionDelay = `${(i % 4) * 70}ms`;
    io.observe(el);
  });

  /* ---------- counters ---------- */
  const fmt = new Intl.NumberFormat("en-US");
  const cio = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      cio.unobserve(e.target);
      const el = e.target, end = +el.dataset.count, suffix = el.dataset.suffix || "";
      if (reduced || end === 0) { el.textContent = fmt.format(end) + suffix; return; }
      const dur = 1600, start = performance.now();
      (function tick(now) {
        const t = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - t, 4);
        el.textContent = fmt.format(Math.round(end * eased)) + (t === 1 ? suffix : "");
        if (t < 1) requestAnimationFrame(tick);
      })(start);
    });
  }, { threshold: 0.6 });
  document.querySelectorAll("[data-count]").forEach((el) => cio.observe(el));

  /* ---------- copy email ---------- */
  const toast = document.querySelector(".toast");
  let tt;
  const say = (msg) => {
    toast.textContent = msg; toast.classList.add("is-on");
    clearTimeout(tt); tt = setTimeout(() => toast.classList.remove("is-on"), 2200);
  };
  document.querySelectorAll(".copy").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const text = btn.dataset.copy;
      try {
        await navigator.clipboard.writeText(text);
        btn.classList.add("is-copied");
        say("👾 email copied, talk soon!");
      } catch {
        window.location.href = `mailto:${text}`;
      }
    });
  });

  /* ---------- nav flips to dark over dark bands ---------- */
  const nav = document.querySelector(".nav");
  const darks = [...document.querySelectorAll(".band--dark")];
  const checkNav = () => {
    const y = nav.getBoundingClientRect().top + nav.offsetHeight / 2;
    nav.classList.toggle("is-dark", darks.some((d) => {
      const r = d.getBoundingClientRect();
      return r.top <= y && r.bottom >= y;
    }));
  };
  addEventListener("scroll", checkNav, { passive: true });
  addEventListener("resize", checkNav);
  checkNav();

  /* ---------- hello, fellow developer ---------- */
  console.log(
    "%c👾 hey, you opened devtools.%c\nThis site is hand-written HTML/CSS/JS, no frameworks.\nLet's talk → kesanaloksainadh@gmail.com",
    "font: 600 16px system-ui; padding: 6px 0;",
    "font: 13px ui-monospace, monospace; color: #888;"
  );
})();
