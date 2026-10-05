# Pratik Kotkar — portfolio

An interactive terminal portfolio. Plain HTML/CSS/JS, no build step, hosted on GitHub Pages.

Type a command (or click one): `whoami`, `impact`, `timeline`, `forecast`, `projects`, `open ezquote`, `log`, `skills`, `contact`, `theme amber`, `tour`, `help`.

- `index.html` — page shell
- `data.js` — all content (roles, projects, timeline dates, skills). Edit this to update the site.
- `script.js` — command engine and renderers (neofetch card, git-log experience, diff results, SVG charts)
- `styles.css` — four themes: midnight, amber, matrix, paper

## Run locally

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Deploy

GitHub Pages: **Settings → Pages → Deploy from a branch → `main` / root**.
Site: https://pratik9696.github.io/pratik_kotkar/
