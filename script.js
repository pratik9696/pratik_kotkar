(function () {
  'use strict';
  const $ = (s, el = document) => el.querySelector(s);
  const NS = 'http://www.w3.org/2000/svg';
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const svgEl = (name, attrs = {}, parent) => {
    const e = document.createElementNS(NS, name);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  };

  /* ---------- theme ---------- */
  $('#theme').addEventListener('click', () => {
    const root = document.documentElement;
    const cur = root.getAttribute('data-theme') ||
      (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    const next = cur === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
  });
  $('#yr').textContent = new Date().getFullYear();

  /* ---------- timeline chart ---------- */
  const W = 1040, PAD_L = 92, PAD_R = 24;
  const T0 = 2018.0, T1 = NOW + 0.1;
  const x = (t) => PAD_L + ((t - T0) / (T1 - T0)) * (W - PAD_L - PAD_R);

  const LANES = {
    ms:   { y: 40,  h: 60,  label: 'Milestones' },
    role: { y: 112, h: 62,  label: 'Roles' },
    proj: { y: 186, h: 136, label: 'Projects' }
  };
  const AXIS_Y = LANES.proj.y + LANES.proj.h + 8;
  const H = AXIS_Y + 34;

  const svg = $('#chart');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);

  // lane backgrounds + labels
  Object.values(LANES).forEach((l) => {
    svgEl('rect', { class: 'lane-bg', x: PAD_L - 8, y: l.y, width: W - PAD_L - PAD_R + 16, height: l.h, rx: 10 }, svg);
    const t = svgEl('text', { class: 'lane-label', x: 0, y: l.y + l.h / 2 + 4 }, svg);
    t.textContent = l.label;
  });

  // year grid + axis
  const grid = svgEl('g', { class: 'grid' }, svg);
  const axis = svgEl('g', { class: 'axis' }, svg);
  for (let yr = 2018; yr <= 2026; yr++) {
    svgEl('line', { x1: x(yr), x2: x(yr), y1: 28, y2: AXIS_Y }, grid);
    const t = svgEl('text', { x: x(yr) + 4, y: AXIS_Y + 20 }, axis);
    t.textContent = yr;
  }
  svgEl('line', { class: 'today', x1: x(NOW), x2: x(NOW), y1: 28, y2: AXIS_Y }, svg);
  const nowT = svgEl('text', { x: x(NOW), y: 20, 'text-anchor': 'end', class: 'tag' }, svg);
  nowT.setAttribute('style', 'font-size:10.5px;fill:var(--muted)');
  nowT.textContent = 'today';

  const detail = $('#detail');
  let selected = null;

  function select(node, html) {
    if (selected) selected.classList.remove('sel');
    selected = node; node.classList.add('sel');
    detail.innerHTML = html;
  }

  function makeItem(parent, label, onActivate) {
    const g = svgEl('g', { class: 'item', tabindex: 0, role: 'button', 'aria-label': label }, parent);
    g.addEventListener('click', () => onActivate(g));
    g.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onActivate(g); }
    });
    return g;
  }

  // roles
  ROLES.forEach((r) => {
    const end = r.end == null ? NOW : r.end;
    const x0 = x(r.start), w = Math.max(6, x(end) - x0 - 2);
    const y0 = LANES.role.y + 10, h = LANES.role.h - 20;
    const g = makeItem(svg, `${r.title}, ${r.company}, ${r.range}`, (n) => select(n,
      `<h3>${esc(r.title)} · ${esc(r.company)}</h3><div class="meta">${esc(r.range)} · ${esc(r.place)}</div>` +
      `<ul>${r.points.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>`));
    svgEl('rect', { class: 'role-bar' + (r.end == null ? ' now' : ''), x: x0, y: y0, width: w, height: h, rx: 8 }, g);
    const clip = svgEl('clipPath', { id: 'c-' + r.id }, g);
    svgEl('rect', { x: x0 + 6, y: y0, width: Math.max(0, w - 12), height: h }, clip);
    const t = svgEl('text', { class: 'role-text', x: x0 + 10, y: y0 + h / 2 + 4.5, 'clip-path': `url(#c-${r.id})` }, g);
    t.textContent = r.company;
  });

  // milestones
  MILESTONES.forEach((m) => {
    const cx = x(m.date), cy = LANES.ms.y + LANES.ms.h / 2;
    const g = makeItem(svg, m.label, (n) => select(n,
      `<h3>${esc(m.label)}</h3><p>${esc(m.text)}</p>`));
    svgEl('circle', { class: 'hit', cx, cy, r: 16 }, g);
    svgEl('rect', { class: 'ms-dot', x: cx - 6, y: cy - 6, width: 12, height: 12, rx: 2, transform: `rotate(45 ${cx} ${cy})` }, g);
    const t = svgEl('text', { class: 'tag', x: cx + 14, y: cy + 4 }, g);
    t.textContent = m.label;
  });

  // projects
  const rowY = (row) => LANES.proj.y + 18 + row * 25;
  CHART_PROJECTS.forEach((p) => {
    const cx = x(p.date), cy = rowY(p.row);
    const link = p.url
      ? `<p style="margin-top:.5rem"><a href="${esc(p.url)}" target="_blank" rel="noopener">View on GitHub ↗</a></p>`
      : `<p style="margin-top:.5rem"><a href="#${esc(p.anchor)}">Read more below ↓</a></p>`;
    const g = makeItem(svg, p.label, (n) => select(n, `<h3>${esc(p.label)}</h3><p>${esc(p.text)}</p>${link}`));
    const left = p.side === 'left';
    svgEl('circle', { class: 'hit', cx, cy, r: 16 }, g);
    svgEl('circle', { class: 'dot', cx, cy, r: 6 }, g);
    const t = svgEl('text', { class: 'tag', x: cx + (left ? -13 : 13), y: cy + 4, 'text-anchor': left ? 'end' : 'start' }, g);
    t.textContent = p.label;
  });

  // default selection: current role
  const first = svg.querySelectorAll('.item')[ROLES.length - 1];
  if (first) first.dispatchEvent(new Event('click'));

  // scroll chart so the recent years are visible on narrow screens
  const sc = $('.chart-scroll');
  if (sc.scrollWidth > sc.clientWidth) sc.scrollLeft = sc.scrollWidth;

  /* ---------- project cards ---------- */
  const grid2 = $('#project-grid');
  grid2.innerHTML = PROJECTS.map((p) => {
    const links = [
      p.repo ? `<a href="${esc(p.repo)}" target="_blank" rel="noopener">Source ↗</a>` : '',
      p.live ? `<a href="${esc(p.live)}" target="_blank" rel="noopener">Live ↗</a>` : ''
    ].join('');
    return `<article class="card proj-card" id="${esc(p.id)}">
      <div class="proj-top"><h3>${esc(p.name)}</h3><span class="tag-chip">${esc(p.tag)}</span></div>
      <p>${esc(p.blurb)}</p>
      ${p.facts.length ? `<ul>${p.facts.map((f) => `<li>${esc(f)}</li>`).join('')}</ul>` : ''}
      ${p.note ? `<p class="note">${esc(p.note)}</p>` : ''}
      ${links ? `<div class="links">${links}</div>` : ''}
      ${p.stack.length ? `<div class="chips">${p.stack.map((s) => `<span class="chip">${esc(s)}</span>`).join('')}</div>` : ''}
    </article>`;
  }).join('');

  // flash the card when arriving from the chart
  addEventListener('hashchange', flash);
  function flash() {
    const el = location.hash && document.getElementById(location.hash.slice(1));
    if (el && el.classList.contains('proj-card')) {
      el.classList.add('flash'); setTimeout(() => el.classList.remove('flash'), 1800);
    }
  }
  flash();

  $('#repo-list').innerHTML = MORE_REPOS.map((r) =>
    `<li><a href="${esc(r.url)}" target="_blank" rel="noopener"><b>${esc(r.name)}</b><span>${esc(r.desc)} · ${r.year}</span></a></li>`).join('');

  /* ---------- experience ---------- */
  $('#exp').innerHTML = ROLES.slice().reverse().map((r) =>
    `<li class="${r.end == null ? 'now' : ''}">
      <div class="when">${esc(r.range)}</div>
      <h3>${esc(r.title)}</h3>
      <div class="co">${esc(r.company)} · ${esc(r.place)}</div>
      <ul>${r.points.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>
    </li>`).join('');

  /* ---------- skills ---------- */
  $('#skills-grid').innerHTML = SKILLS.map(([title, items]) =>
    `<div class="card"><h3>${esc(title)}</h3><div class="chips" style="margin-top:0">${items.map((i) => `<span class="chip">${esc(i)}</span>`).join('')}</div></div>`).join('');
})();
