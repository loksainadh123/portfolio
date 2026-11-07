/* A tiny interactive shell — recruiters can "talk" to the portfolio */
(() => {
  const term = document.querySelector(".term");
  if (!term) return;
  const out = term.querySelector(".term__out");
  const form = term.querySelector(".term__form");
  const input = term.querySelector(".term__input");

  const RESUME = "assets/Lok_Sainadh_Kesana_Resume.pdf";
  const LINKS = {
    github: "https://github.com/loksainadh123",
    linkedin: "https://www.linkedin.com/in/lok-sainadh-kesana-842210277/",
    demo: "https://job-portfolio-sigma.vercel.app/",
    email: "mailto:kesanaloksainadh@gmail.com",
  };
  const FILES = {
    "about.md": () => cmds.about(),
    "projects.md": () => cmds.projects(),
    "skills.json": () => cmds.skills(),
    "experience.log": () => cmds.experience(),
    "resume.pdf": () => cmds.resume(),
  };

  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const print = (html, cls = "") => {
    const p = document.createElement("p");
    if (cls) p.className = cls;
    p.innerHTML = html;
    out.appendChild(p);
    out.scrollTop = out.scrollHeight;
  };
  const link = (href, label) => `<a href="${href}" target="_blank" rel="noopener">${label}</a>`;

  const cmds = {
    help: () => print(
`<span class="ok">available commands</span>
  whoami        who is this guy?
  about         the short version
  experience    where I've worked
  projects      what I've built
  skills        my stack
  education     degrees
  contact       ways to reach me
  resume        open my resume (PDF)
  github · linkedin · demo
  ls · cat &lt;file&gt; · history · clear
<span class="muted">tip: ↑/↓ for history, tab to autocomplete. there may be secrets.</span>`),

    whoami: () => print(`<b>Lok Sainadh Kesana</b>, Software Engineer.
MS Information Systems @ Northeastern (GPA 3.78), graduating Dec 2026, based in Boston, MA.
<span class="muted">open to full-time Software Engineer · Data Engineer · Web Developer roles.</span>`),

    about: () => print(`I like building things end to end: the database schema, the API, the UI and the deploy.
16 months shipping production web software at Power Mech, and since then full-stack
apps (Next.js + Claude API) and data pipelines (Airflow → MySQL star schema) at Northeastern.
I also have a design background, so the things I build tend to be pleasant to use.`),

    experience: () => print(
`<span class="ok">Software Engineer (Level 1)</span> · Power Mech Projects Limited · Aug 2023 – Dec 2024
  + careers product handling ~500+ applications / month (PHP, JS, jQuery)
  + responsive UIs, form validation, 3 file formats, SMTP delivery to HR
  + staging tests, plugin maintenance, SEO and image optimization
<span class="ok">Data Analyst Intern</span> · SR Constructions · May 2022 – Aug 2022
  + ~50+ customer inquiries / week turned into decision-ready summaries`),

    projects: () => print(
`<span class="ok">Pipeline</span>: AI job application tracker  [${link(LINKS.demo, "live")}] [${link("https://github.com/loksainadh123/Job_portfolio", "code")}]
  Next.js · TypeScript · Prisma · SQLite · Claude API · dnd-kit
<span class="ok">Stock Market ETL &amp; Forecasting</span>
  Airflow · AWS S3 · MySQL star schema · 42,000+ rows · 7 DQ checks · 0 dupes
<span class="ok">SupplyMind AI</span>: RAG assistant over supply-chain docs
<span class="ok">NYPD Arrest Analysis</span>: 168,825 records · SQL · Python · Tableau
<span class="muted">scroll up to ↑ #work to play with live demos.</span>`),

    skills: () => print(
`{
  "languages": ["Java", "Python", "JavaScript", "TypeScript", "SQL", "PHP", "HTML", "CSS"],
  "web":       ["React", "Next.js", "Node.js", "FastAPI", "Prisma", "REST APIs"],
  "data":      ["MySQL", "SQLite", "MongoDB", "pandas", "NumPy", "scikit-learn", "ETL"],
  "tools":     ["Git", "Docker", "AWS S3", "Apache Airflow", "Claude API", "Streamlit"]
}`),

    education: () => print(
`MS Information Systems · Northeastern University · Boston · Jan 2025 – Dec 2026 · GPA 3.78
B.Tech Electronics &amp; Computer Engineering · Mahindra University · Hyderabad · 2020 – 2024`),

    contact: () => print(
`email     ${link(LINKS.email, "kesanaloksainadh@gmail.com")}
linkedin  ${link(LINKS.linkedin, "lok-sainadh-kesana")}
github    ${link(LINKS.github, "loksainadh123")}`),

    resume: () => { print(`opening ${link(RESUME, "Lok_Sainadh_Kesana_Resume.pdf")} …`, "muted"); window.open(RESUME, "_blank", "noopener"); },
    github: () => { print("opening github…", "muted"); window.open(LINKS.github, "_blank", "noopener"); },
    linkedin: () => { print("opening linkedin…", "muted"); window.open(LINKS.linkedin, "_blank", "noopener"); },
    demo: () => { print("opening Pipeline live demo…", "muted"); window.open(LINKS.demo, "_blank", "noopener"); },
    email: () => cmds.contact(),

    ls: () => print(Object.keys(FILES).join("    ")),
    cat: (arg) => {
      if (!arg) return print("usage: cat &lt;file&gt;  (try: ls)", "muted");
      const f = FILES[arg];
      f ? f() : print(`cat: ${esc(arg)}: No such file or directory`, "muted");
    },
    pwd: () => print("/home/guest/lok-portfolio"),
    date: () => print(new Date().toString()),
    echo: (arg) => print(esc(arg || "")),
    history: () => print(hist.map((h, i) => `  ${String(i + 1).padStart(3)}  ${esc(h)}`).join("\n") || "(empty)"),
    clear: () => { out.innerHTML = ""; },
    exit: () => print("there is no escape. but you can always <a href=\"#contact\">say hi</a> 👋", "muted"),

    sudo: (arg) => {
      if (/^hire\s+lok/i.test(arg || "")) {
        print("[sudo] password for guest: ********", "muted");
        setTimeout(() => print(
`<span class="ok">✔ permission granted.</span>
  → drafting offer letter…………… done
  → scheduling interview……………… waiting on you
  next step: ${link(LINKS.email, "kesanaloksainadh@gmail.com")} 👾`), 650);
      } else {
        print(`guest is not in the sudoers file. this incident will be reported. <span class="muted">(try: sudo hire lok)</span>`);
      }
    },
    hire: () => cmds.sudo("hire lok"),
    rm: () => print("nice try. 🙂 this portfolio is immutable.", "muted"),
    vim: () => print("you can check out any time you like, but you can never leave. (:q! anyway)", "muted"),
    coffee: () => print("☕ brewing… let's grab one in Boston and talk shop.", "muted"),
    "👾": () => print("👾 👾 👾  you found the invaders. they approve of you.", "ok"),
  };

  const NAMES = Object.keys(cmds);
  const hist = [];
  let hi = -1;

  function run(raw) {
    const line = raw.trim();
    print(esc(line), "cmd");
    if (!line) return;
    hist.push(line); hi = hist.length;
    const [name, ...rest] = line.split(/\s+/);
    const fn = cmds[name.toLowerCase()];
    if (fn) fn(rest.join(" "));
    else print(`command not found: ${esc(name)}. type <b>help</b>`, "muted");
  }

  form.addEventListener("submit", (e) => { e.preventDefault(); run(input.value); input.value = ""; });
  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp") { e.preventDefault(); if (hi > 0) input.value = hist[--hi]; }
    else if (e.key === "ArrowDown") { e.preventDefault(); hi = Math.min(hist.length, hi + 1); input.value = hist[hi] || ""; }
    else if (e.key === "Tab") {
      e.preventDefault();
      const v = input.value.trim().toLowerCase();
      const m = NAMES.filter((n) => n.startsWith(v));
      if (m.length === 1) input.value = m[0] + " ";
      else if (m.length > 1) print(m.join("   "), "muted");
    } else if (e.key === "l" && e.ctrlKey) { e.preventDefault(); cmds.clear(); }
  });
  term.addEventListener("click", (e) => {
    if (!e.target.closest("a, button") && !getSelection().toString()) input.focus({ preventScroll: true });
  });
  term.querySelectorAll("[data-cmd]").forEach((b) => b.addEventListener("click", () => run(b.dataset.cmd)));

  print(`Welcome to <b>lok-portfolio</b> v2.0 (vanilla-js) · ${new Date().toDateString()}`, "muted");
  print(`type <b>help</b> to see what I can do, or tap a command below.`, "muted");

  // first time the shell scrolls into view, it "types" whoami by itself
  const demo = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return;
    demo.disconnect();
    if (hist.length) return;
    const word = "whoami";
    let i = 0;
    const t = setInterval(() => {
      input.value = word.slice(0, ++i);
      if (i === word.length) { clearInterval(t); setTimeout(() => { run(word); input.value = ""; }, 350); }
    }, 120);
  }, { threshold: 0.6 });
  demo.observe(term);
})();
