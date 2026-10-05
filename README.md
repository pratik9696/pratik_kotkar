# Pratik Kotkar — portfolio

Plain HTML/CSS/JS, no build step, hosted on GitHub Pages. Two views behind a "Who are you?" page.

| Path | Audience | What it is |
|---|---|---|
| `/` | everyone | "Who are you?" chooser |
| `/tech/` | engineers, data folks | interactive terminal: type or click `whoami`, `impact`, `timeline`, `projects`, `open ezquote`, `log`, `theme amber`, `tour`, `help` |
| `/business/` | leadership, business, product, HR | animated purple glass version: impact, timeline, projects, experience |

## Layout

- `data.js` — **all content**, shared by both views. Edit this once to update both.
- `index.html` — chooser page (self-contained)
- `tech/` — `index.html`, `script.js`, `styles.css` (terminal)
- `business/` — `index.html`, `script.js`, `styles.css` (purple glass)

## Run locally

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Deploy

GitHub Pages: **Settings → Pages → Deploy from a branch → `main` / root**.
Site: https://pratik9696.github.io/pratik_kotkar/
