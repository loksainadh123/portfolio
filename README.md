# Lok Sainadh Kesana — Portfolio

Personal portfolio for full-time **Software Engineer · Data Engineer · Web Developer** roles.

Hand-built with plain **HTML, CSS and vanilla JavaScript**: no frameworks, no build step, no dependencies.

## What's inside

| Section | What it does |
| --- | --- |
| Hero | Reactive dot grid that moves away from the cursor, a scrambling role line, and a streaming "build log" |
| 👾 Cursor | Custom emoji cursor with a pixel trail and click bursts (mouse devices only; touch keeps native behaviour) |
| Work | **Pipeline**: a draggable Kanban demo plus a "generate kit" animation. **Stock ETL**: an animated Airflow-style DAG run |
| Journey | Career history written as a `git log` |
| Stack | Skills written as code files (`.ts`, `.tsx`, `.sql`, `.yml`) |
| Shell | An interactive terminal: try `help`, `projects`, `sudo hire lok` |
| Design | Earlier UX work, shown in grayscale that turns to colour on hover |

Respects `prefers-reduced-motion` and is fully responsive.

## Run locally

```bash
python3 -m http.server 5173
# open http://localhost:5173
```

## Structure

```
index.html
css/style.css
js/cursor.js     👾 cursor
js/hero.js       dot grid, scramble text, build log
js/projects.js   kanban + DAG demos
js/terminal.js   interactive shell
js/main.js       reveals, counters, copy email, nav
assets/          resume PDF + design screenshots
```

The previous UX-focused version is preserved at the git tag `v1-ux`.
