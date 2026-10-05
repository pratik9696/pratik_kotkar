(function () {
  'use strict';
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const NS = 'http://www.w3.org/2000/svg';
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const svgEl = (name, attrs = {}, parent) => {
    const e = document.createElementNS(NS, name);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  };

  /* ---------- theme: paper (default) / night ---------- */
  const themeBtn = $('#theme');
  const syncTheme = () => { themeBtn.textContent = root.getAttribute('data-theme') === 'dark' ? 'Paper edition' : 'Night edition'; };
  function toggleTheme() {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
    syncTheme();
  }
  themeBtn.addEventListener('click', toggleTheme);
  syncTheme();
  $('#yr').textContent = new Date().getFullYear();
  $('#edition').textContent = 'Edition ' + new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

  /* ---------- ticker (every figure comes from the résumé) ---------- */
  const TICKS = [
    ['GMV impact', '+$280K / mo', '▲', 'Twid Pay'], ['API latency', '−64%', '▼', 'Twid Pay'],
    ['Disbursement rate', '+20%', '▲', 'Niyo'], ['VKYC approvals', '20 → 24%', '▲', 'Niyo'],
    ['FT activation', '40 → 48%', '▲', 'Niyo'], ['Forecast accuracy', '30–40 → 50–70%', '▲', 'PharmEasy'],
    ['Events validated', '~34M', '', 'Bicycle.ai'], ['Daily orders forecast', '~675K', '', 'Bicycle.ai'],
    ['Weekly user growth', '+5–7%', '▲', 'Niyo'], ['RAG key-fact accuracy', '1.000', '▲', 'dataworkz']
  ];
  const tk = TICKS.map(([a, v, d, c]) => `<span>${esc(a)} <b>${esc(v)} ${d}</b><i>${esc(c)}</i></span>`).join('');
  $('#ticker').innerHTML = tk + tk;

  /* ---------- nav highlight, reveals, counters ---------- */
  const navLinks = $$('.mast nav a');
  const secObs = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) navLinks.forEach((a) => a.classList.toggle('cur', a.getAttribute('href') === '#' + e.target.id));
  }), { rootMargin: '-40% 0px -55% 0px' });
  $$('main section[id]').forEach((s) => secObs.observe(s));

  function countUp(el) {
    const to = +el.dataset.to, pre = el.dataset.pre || '', suf = el.dataset.suf || '';
    if (reduced) { el.textContent = pre + to + suf; return; }
    const t0 = performance.now(), dur = 1400;
    (function step(t) {
      const k = Math.min(1, (t - t0) / dur), v = Math.round(to * (1 - Math.pow(1 - k, 3)));
      el.textContent = pre + v + suf;
      if (k < 1) requestAnimationFrame(step);
    })(t0);
  }
  const revObs = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in'); revObs.unobserve(e.target);
    $$('.count', e.target).forEach(countUp);
  }), { threshold: .12 });
  const observeReveals = (scope = document) => $$('.reveal', scope).forEach((el) => revObs.observe(el));

  /* =====================================================
     hero: a forecast chart of the career, with scrubber
  ===================================================== */
  const hc = $('#hero-chart');
  (function heroChart() {
    const X0 = 30, X1 = 970, TA = 2018, TB = 2030, YB = 292;
    const hx = (t) => X0 + ((t - TA) / (TB - TA)) * (X1 - X0);
    const data = [[2018.58, 262], [2019.4, 252], [2020.2, 256], [2020.83, 238], [2021.6, 224], [2022.0, 210], [2022.7, 218], [2023.2, 200],
      [2023.42, 188], [2024.2, 172], [2025.0, 154], [2025.9, 132], [2026.1, 116], [NOW, 88]];
    const P = data.map(([t, y]) => [hx(t), y]);
    const yAt = (t) => { // piecewise-linear lookup for pins and the scrubber
      if (t <= data[0][0]) return data[0][1];
      for (let i = 1; i < data.length; i++) if (t <= data[i][0]) { const [a, ya] = data[i - 1], [b, yb] = data[i]; return ya + ((t - a) / (b - a)) * (yb - ya); }
      return data[data.length - 1][1];
    };
    // Catmull-Rom -> cubic Bezier
    let d = `M${P[0][0]} ${P[0][1]}`;
    for (let i = 0; i < P.length - 1; i++) {
      const p0 = P[i - 1] || P[i], p1 = P[i], p2 = P[i + 1], p3 = P[i + 2] || p2;
      d += ` C${p1[0] + (p2[0] - p0[0]) / 6} ${p1[1] + (p2[1] - p0[1]) / 6}, ${p2[0] - (p3[0] - p1[0]) / 6} ${p2[1] - (p3[1] - p1[1]) / 6}, ${p2[0]} ${p2[1]}`;
    }
    const nx = hx(NOW), ny = 88, mid = nx + (X1 - nx) * .5;

    // axis + ticks
    const ax = svgEl('g', { class: 'axis' }, hc);
    svgEl('line', { x1: X0, x2: X1, y1: YB, y2: YB }, ax);
    for (let yr = TA; yr <= TB; yr += 2) {
      svgEl('line', { class: 'tick', x1: hx(yr), x2: hx(yr), y1: 12, y2: YB }, ax);
      svgEl('text', { x: hx(yr), y: YB + 18, 'text-anchor': 'middle' }, ax).textContent = yr;
    }
    // prediction interval + forecast
    svgEl('path', { class: 'cone', d: `M${nx} ${ny} Q${mid} 62 ${X1} 8 L${X1} 168 Q${mid} 118 ${nx} ${ny} Z` }, hc);
    svgEl('path', { class: 'fline', d: `M${nx} ${ny} Q${mid} 84 ${X1} 46` }, hc);
    svgEl('line', { class: 'today', x1: nx, x2: nx, y1: 12, y2: YB }, hc);
    svgEl('text', { x: nx - 6, y: 24, 'text-anchor': 'end', style: 'fill:var(--accent)' }, hc).textContent = 'TODAY';
    // history
    svgEl('path', { class: 'hline', pathLength: 1, d }, hc);
    // role pins
    ROLES.forEach((r, i) => {
      const x = hx(r.start), y = yAt(r.start);
      const g = svgEl('g', { class: 'pin', style: `--d:${(0.4 + ((r.start - 2018) / 8.77) * 1.9).toFixed(2)}s` }, hc);
      svgEl('circle', { cx: x, cy: y, r: 5 }, g);
      svgEl('text', { x: x - 9, y: y - 10 }, g).textContent = r.company.split(' ')[0].toUpperCase().replace('.AI', '') + " ’" + String(Math.floor(r.start)).slice(2);
    });
    // you-are-here
    svgEl('circle', { class: 'now-ring', cx: nx, cy: ny, r: 6 }, hc);
    svgEl('circle', { class: 'now-dot', cx: nx, cy: ny, r: 6 }, hc);
    const n1 = svgEl('text', { class: 'note', x: nx - 150, y: 62, style: 'animation-delay:2.5s' }, hc); n1.textContent = 'you are here';
    svgEl('path', { class: 'arrow', style: 'animation-delay:2.6s', d: `M${nx - 56} 64 C ${nx - 30} 66, ${nx - 22} 76, ${nx - 12} 84 M${nx - 20} 80 L${nx - 12} 84 L${nx - 21} 90` }, hc);
    const n2 = svgEl('text', { class: 'note', x: hx(2028.4), y: 112, style: 'animation-delay:2.8s' }, hc); n2.textContent = 'next role: ?';

    // scrubber
    const sg = svgEl('g', { class: 'scrub' }, hc);
    const sl = svgEl('line', { y1: 12, y2: YB }, sg), sc = svgEl('circle', { r: 4.5 }, sg);
    const ro = svgEl('text', { class: 'readout', x: X0, y: 8 }, sg);
    const roleAt = (t) => ROLES.find((r) => t >= r.start && t < (r.end == null ? NOW : r.end));
    function read(t) {
      const yr = Math.floor(t);
      if (t > NOW) return `${yr} · forecast: wide interval, role TBD`;
      const r = roleAt(t);
      if (r) return `${yr} · ${r.title}, ${r.company}`;
      if (t < ROLES[0].start) return `${yr} · B.E. Computer Science, MIT College of Engineering`;
      return `${yr} · between roles`;
    }
    function scrub(e) {
      const b = hc.getBoundingClientRect();
      const px = ((e.clientX - b.left) / b.width) * 1000;
      const x = Math.max(X0, Math.min(X1, px)), t = TA + ((x - X0) / (X1 - X0)) * (TB - TA);
      sl.setAttribute('x1', x); sl.setAttribute('x2', x);
      sc.setAttribute('cx', x); sc.setAttribute('cy', t > NOW ? ny + (46 - ny) * ((x - nx) / (X1 - nx)) : yAt(t));
      ro.textContent = read(t);
      hc.classList.add('scrubbing');
    }
    hc.addEventListener('pointermove', scrub);
    hc.addEventListener('pointerdown', scrub);
    hc.addEventListener('pointerleave', () => hc.classList.remove('scrubbing'));
  })();

  /* =====================================================
     timeline figure (Fig. 1)
  ===================================================== */
  const projChips = (ids) => ids && ids.length
    ? `<div class="role-projects"><span>Projects</span>${ids.map((id) => `<button type="button" class="pchip" data-open="${esc(id)}">${esc(PROJECTS.find((p) => p.id === id).name)}</button>`).join('')}</div>`
    : '';

  const W = 1040, PAD_L = 92, PAD_R = 24;
  const T0 = 2018.0, T1 = NOW + 0.1;
  const x = (t) => PAD_L + ((t - T0) / (T1 - T0)) * (W - PAD_L - PAD_R);
  const LANES = {
    ms:   { y: 40,  h: 60,  label: 'Milestones' },
    role: { y: 112, h: 62,  label: 'Roles' },
    work: { y: 186, h: 112, label: 'Work' },
    proj: { y: 310, h: 136, label: 'Projects' }
  };
  const AXIS_Y = LANES.proj.y + LANES.proj.h + 8;
  const H = AXIS_Y + 34;
  const SWEEP = 2.0;
  const delayFor = (cx) => (((cx - PAD_L) / (W - PAD_L - PAD_R)) * SWEEP).toFixed(2) + 's';

  const svg = $('#chart');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  const defs = svgEl('defs', {}, svg);
  const hatch = svgEl('pattern', { id: 'hatch', width: 7, height: 7, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, defs);
  svgEl('line', { x1: 0, y1: 0, x2: 0, y2: 7, style: 'stroke:var(--hair);stroke-width:1.2' }, hatch);

  // lane labels + rules (no filled boxes: the figure sits on the page like a printed plate)
  Object.values(LANES).forEach((l) => {
    svgEl('line', { class: 'lane-line', x1: PAD_L - 8, x2: W - PAD_R + 8, y1: l.y, y2: l.y }, svg);
    svgEl('text', { class: 'lane-label', x: 0, y: l.y + 16 }, svg).textContent = l.label;
  });
  svgEl('line', { class: 'lane-line', x1: PAD_L - 8, x2: W - PAD_R + 8, y1: AXIS_Y, y2: AXIS_Y }, svg);

  ROLES.filter((r) => WORK_PROJECTS.some((w) => w.role === r.id)).forEach((r) => {
    const x0 = x(r.start), x1 = x(r.end == null ? NOW : r.end);
    svgEl('rect', { class: 'wband', x: x0, y: LANES.work.y + 4, width: x1 - x0 - 2, height: LANES.work.h - 8 }, svg);
    svgEl('text', { class: 'wband-label', x: x0 + 8, y: LANES.work.y + 17 }, svg).textContent = r.company;
  });

  const grid = svgEl('g', { class: 'grid' }, svg);
  const axis = svgEl('g', { class: 'axis' }, svg);
  for (let yr = 2018; yr <= 2026; yr++) {
    svgEl('line', { x1: x(yr), x2: x(yr), y1: 30, y2: AXIS_Y }, grid);
    svgEl('text', { x: x(yr) + 4, y: AXIS_Y + 20 }, axis).textContent = yr;
  }
  svgEl('line', { class: 'today', x1: x(NOW), x2: x(NOW), y1: 30, y2: AXIS_Y }, svg);
  svgEl('text', { class: 'today-t', x: x(NOW), y: 20, 'text-anchor': 'end' }, svg).textContent = 'today';

  const detail = $('#detail');
  let selected = null;
  function select(node, html) {
    if (selected) selected.classList.remove('sel');
    selected = node; node.classList.add('sel');
    detail.style.animation = 'none'; void detail.offsetWidth; detail.style.animation = '';
    detail.innerHTML = html;
  }
  function makeItem(label, cx, onActivate) {
    const g = svgEl('g', { class: 'item', tabindex: 0, role: 'button', 'aria-label': label }, svg);
    g.style.setProperty('--d', delayFor(cx));
    g.addEventListener('click', () => onActivate(g));
    g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onActivate(g); } });
    return g;
  }

  ROLES.forEach((r) => {
    const isNow = r.end == null;
    const end = isNow ? NOW : r.end;
    const x0 = x(r.start), w = Math.max(6, x(end) - x0 - 2);
    const y0 = LANES.role.y + 10, h = LANES.role.h - 20;
    const g = makeItem(`${r.title}, ${r.company}, ${r.range}`, x0, (n) => select(n,
      `<h3>${esc(r.title)} · ${esc(r.company)}</h3><div class="meta">${esc(r.range)} · ${esc(r.place)}</div>` +
      `<ul>${r.points.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>${projChips(r.projectIds)}`));
    svgEl('rect', { class: 'role-bar' + (isNow ? ' now' : ''), x: x0, y: y0, width: w, height: h, rx: 1 }, g);
    const clip = svgEl('clipPath', { id: 'c-' + r.id }, g);
    const narrow = w < 90;
    svgEl('rect', { x: x0 + 4, y: y0, width: Math.max(0, w - 8), height: h }, clip);
    svgEl('text', { class: 'role-text' + (isNow ? ' now-t' : ''), x: x0 + (narrow ? 7 : 10), y: y0 + h / 2 + 4.5, 'clip-path': `url(#c-${r.id})`, style: narrow ? 'font-size:10.5px' : '' }, g).textContent = narrow ? r.company.split('.')[0] : r.company;
  });

  MILESTONES.forEach((m) => {
    const cx = x(m.date), cy = LANES.ms.y + LANES.ms.h / 2 + 4;
    const g = makeItem(m.label, cx, (n) => select(n, `<h3>${esc(m.label)}</h3><p>${esc(m.text)}</p>`));
    svgEl('circle', { class: 'hit', cx, cy, r: 16 }, g);
    svgEl('rect', { class: 'ms-dot', x: cx - 5, y: cy - 5, width: 10, height: 10, transform: `rotate(45 ${cx} ${cy})` }, g);
    svgEl('text', { class: 'tag', x: cx + 14, y: cy + 4 }, g).textContent = m.label;
  });

  WORK_PROJECTS.forEach((w) => {
    const r = ROLES.find((q) => q.id === w.role), p = w.open && PROJECTS.find((q) => q.id === w.open);
    const cx = x(w.date), cy = LANES.work.y + 34 + w.row * 22;
    const link = p ? `<p style="margin-top:.6rem"><a href="#${esc(p.id)}" data-open="${esc(p.id)}">Open case file →</a></p>` : '';
    const g = makeItem(`${w.label}, ${r.company}`, cx, (n) => select(n,
      `<h3>${esc(w.label)}</h3><div class="meta">${esc(r.title)} · ${esc(r.company)} · ${esc(r.range)}</div><p>${esc(w.text)}</p>${link}`));
    svgEl('circle', { class: 'hit', cx, cy, r: 14 }, g);
    svgEl('circle', { class: 'wdot', cx, cy, r: 5 }, g);
    svgEl('text', { class: 'tag', x: cx + 12, y: cy + 4 }, g).textContent = w.label;
  });

  const rowY = (row) => LANES.proj.y + 22 + row * 25;
  CHART_PROJECTS.forEach((p) => {
    const cx = x(p.date), cy = rowY(p.row);
    const link = p.url
      ? `<p style="margin-top:.6rem"><a href="${esc(p.url)}" target="_blank" rel="noopener">View on GitHub ↗</a></p>`
      : `<p style="margin-top:.6rem"><a href="#${esc(p.anchor)}" data-open="${esc(p.anchor)}">Open case file →</a></p>`;
    const g = makeItem(p.label, cx, (n) => select(n, `<h3>${esc(p.label)}</h3><p>${esc(p.text)}</p>${link}`));
    const left = p.side === 'left';
    svgEl('circle', { class: 'hit', cx, cy, r: 16 }, g);
    if (p.date > 2026.4) svgEl('circle', { class: 'ring', cx, cy, r: 6, style: 'pointer-events:none' }, g);
    svgEl('circle', { class: 'dot', cx, cy, r: 6 }, g);
    svgEl('text', { class: 'tag', x: cx + (left ? -13 : 13), y: cy + 4, 'text-anchor': left ? 'end' : 'start' }, g).textContent = p.label;
  });
  svgEl('rect', { class: 'scan', x: PAD_L - 8, y: 30, width: 2, height: AXIS_Y - 30, 'pointer-events': 'none' }, svg);

  const first = $$('.item', svg)[ROLES.length - 1];
  if (first) first.dispatchEvent(new Event('click'));
  const sc = $('.chart-scroll');
  if (sc.scrollWidth > sc.clientWidth) sc.scrollLeft = sc.scrollWidth;
  const chartObs = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { svg.classList.add('draw'); chartObs.disconnect(); }
  }), { threshold: .3 });
  chartObs.observe(svg);

  /* =====================================================
     case-file ledger
  ===================================================== */
  const statusClass = (s) => ({ 'In progress': 's-prog', 'Coming soon': 's-soon', Live: 's-live', 'Live prototype': 's-live', Production: 's-prod' }[s] || '');
  const byId = (id) => PROJECTS.find((p) => p.id === id);
  const RECENT = 6; // PROJECTS[0..5] are recent agentic/product work; the rest are earlier roles
  const ledger = $('#ledger');

  function row(p, n, delay) {
    return `<li class="row" style="--d:${delay}s" id="${esc(p.id)}">
      <span class="no mono">${String(n).padStart(2, '0')}</span>
      <div><div class="r-tag">${esc(p.tag)}</div>
        <h3><button type="button" class="open" data-open="${esc(p.id)}">${esc(p.name)}</button></h3>
        <p>${esc(p.blurb)}</p></div>
      <div class="r-kpi">${p.kpi ? `<b>${esc(p.kpi.v)}</b><small>${esc(p.kpi.l)}</small>` : ''}</div>
      <div class="r-meta"><span class="badge ${statusClass(p.status)}">${esc(p.status)}</span>
        ${p.repo ? `<a class="src" href="${esc(p.repo)}" target="_blank" rel="noopener">Source ↗</a>` : '<span class="priv">private</span>'}</div>
    </li>`;
  }
  function renderLedger(filter) {
    const list = PROJECTS.filter((p) => filter === 'all' || p.cat.includes(filter));
    let html = '', n = 0;
    list.forEach((p, i) => {
      if (filter === 'all') {
        const idx = PROJECTS.indexOf(p);
        if (idx === 0) html += '<li class="group">Recent · agents &amp; product</li>';
        if (idx === RECENT) html += '<li class="group">Earlier · ML shipped at Twid Pay, Niyo &amp; PharmEasy</li>';
      }
      html += row(p, ++n, Math.min(i, 8) * 0.05);
    });
    ledger.innerHTML = html;
  }
  renderLedger('all');
  $('#filters').addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    $$('#filters button').forEach((el) => { const on = el === b; el.classList.toggle('on', on); el.setAttribute('aria-selected', on); });
    renderLedger(b.dataset.f);
  });

  $('#repo-list').innerHTML = MORE_REPOS.map((r, i) =>
    `<li class="reveal" style="--d:${i * 0.06}s"><a href="${esc(r.url)}" target="_blank" rel="noopener"><b>${esc(r.name)}</b><span>${esc(r.desc)} · ${r.year}</span></a></li>`).join('');

  /* experience + skills */
  $('#exp').innerHTML = ROLES.slice().reverse().map((r) => {
    const a = Math.floor(r.start), b = r.end == null ? 'now' : Math.floor(r.end);
    return `<li class="job reveal ${r.end == null ? 'now' : ''}">
      <div class="yrs">${a}<span>to ${b}</span></div>
      <div><h3>${esc(r.title)}</h3><div class="co">${esc(r.company)} · ${esc(r.place)}</div>
        <ul>${r.points.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>${projChips(r.projectIds)}</div>
    </li>`;
  }).join('');
  $('#skills-grid').innerHTML = SKILLS.map(([title, items], i) =>
    `<div class="reveal" style="--d:${i * 0.05}s"><dt>${esc(title)}</dt><dd>${items.map((s) => `<span>${esc(s)}</span>`).join('')}</dd></div>`).join('');

  observeReveals();

  /* =====================================================
     overlays: case-file drawer + index palette
  ===================================================== */
  const modal = $('#modal'), mBody = $('#m-body'), pal = $('#palette');
  let lastFocus = null;
  const FOCUSABLE = 'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])';
  const palOpen = () => !pal.hidden;

  function openOverlay(el, focusEl) {
    lastFocus = document.activeElement;
    el.hidden = false; document.body.classList.add('lock');
    (focusEl || el).focus({ preventScroll: true });
  }
  function closeOverlay(el) {
    el.hidden = true;
    if ($$('.scrim').every((o) => o.hidden)) document.body.classList.remove('lock');
    if (lastFocus && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
  }

  function openProject(id) {
    const p = byId(id); if (!p) return;
    const steps = p.arch.length
      ? `<h4>${esc(p.archTitle || 'How it works')}</h4><ol class="steps">${p.arch.map((s, i) => `<li style="--i:${i}"><b>${String(i + 1).padStart(2, '0')}</b><span>${esc(s)}</span></li>`).join('')}</ol>`
      : '';
    mBody.innerHTML = `
      <div class="d-tag"><span>${esc(p.tag)}</span><span class="badge ${statusClass(p.status)}">${esc(p.status)}</span></div>
      <h2 id="m-title">${esc(p.name)}</h2>
      <p class="d-lead">${esc(p.blurb)}</p>
      ${p.kpi ? `<div class="d-kpi"><b>${esc(p.kpi.v)}</b><span>${esc(p.kpi.l)}</span></div>` : ''}
      ${p.problem ? `<h4>The problem</h4><p>${esc(p.problem)}</p>` : ''}
      ${steps}
      ${p.facts.length ? `<h4>${p.problem ? 'What it moves' : 'Highlights'}</h4><ul class="d-list">${p.facts.map((f) => `<li>${esc(f)}</li>`).join('')}</ul>` : ''}
      ${p.stack.length ? `<h4>Stack</h4><p class="d-stack">${p.stack.map(esc).join(' · ')}</p>` : ''}
      ${p.note ? `<p class="d-note">${esc(p.note)}</p>` : ''}
      <div class="d-actions">
        ${p.repo ? `<a class="solid" href="${esc(p.repo)}" target="_blank" rel="noopener">View source ↗</a>` : ''}
        ${p.live ? `<a class="ulink" href="${esc(p.live)}" target="_blank" rel="noopener">Live site ↗</a>` : ''}
      </div>`;
    $('.drawer', modal).scrollTop = 0;
    openOverlay(modal, $('.drawer', modal));
  }

  $('#m-close').addEventListener('click', () => closeOverlay(modal));
  modal.addEventListener('click', (e) => { if (e.target === modal) closeOverlay(modal); });
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-open]');
    if (t) { e.preventDefault(); openProject(t.dataset.open); }
  });

  const palInput = $('#pal-input'), palList = $('#pal-list');
  const goto = (id) => () => { const el = document.getElementById(id); el && el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' }); };
  const ext = (u) => () => window.open(u, '_blank', 'noopener');
  const ACTIONS = [
    ...[['timeline', 'Timeline'], ['projects', 'Case files'], ['experience', 'Experience'], ['skills', 'Skills'], ['contact', 'Contact']]
      .map(([id, l]) => ({ label: 'Go to ' + l, hint: 'section', run: goto(id) })),
    ...PROJECTS.map((p) => ({ label: p.name, hint: 'case file', run: () => openProject(p.id) })),
    { label: 'GitHub profile', hint: 'link ↗', run: ext('https://github.com/pratik9696') },
    { label: 'LinkedIn', hint: 'link ↗', run: ext('https://linkedin.com/in/pratikkotkar9696') },
    { label: 'Résumé (PDF)', hint: 'link ↗', run: ext('https://github.com/pratik9696/resume/blob/HEAD/Pratik_Kotkar_AI_ML_Eng.pdf') },
    { label: 'Email Pratik', hint: 'mailto', run: () => { location.href = 'mailto:pratikkotkar9696@gmail.com'; } },
    { label: 'Switch paper / night edition', hint: 'action', run: toggleTheme }
  ];
  let palItems = [], palSel = 0;
  function renderPal() {
    const q = palInput.value.trim().toLowerCase();
    palItems = ACTIONS.filter((a) => !q || (a.label + ' ' + a.hint).toLowerCase().includes(q));
    palSel = Math.min(palSel, Math.max(0, palItems.length - 1));
    palList.innerHTML = palItems.length
      ? palItems.map((a, i) => `<li role="option" data-i="${i}" class="${i === palSel ? 'sel' : ''}">${esc(a.label)}<small>${esc(a.hint)}</small></li>`).join('')
      : '<li style="cursor:default">No matches</li>';
  }
  function openPal() { palInput.value = ''; palSel = 0; renderPal(); openOverlay(pal, palInput); }
  function runPal(i) {
    const a = palItems[i]; if (!a) return;
    closeOverlay(pal);
    a.run();
    if (a.hint === 'case file') lastFocus = $('#palette-btn');
  }
  palInput.addEventListener('input', () => { palSel = 0; renderPal(); });
  palList.addEventListener('click', (e) => { const li = e.target.closest('li[data-i]'); if (li) runPal(+li.dataset.i); });
  palList.addEventListener('pointermove', (e) => {
    const li = e.target.closest('li[data-i]');
    if (li && +li.dataset.i !== palSel) { palSel = +li.dataset.i; $$('li', palList).forEach((n, i) => n.classList.toggle('sel', i === palSel)); }
  });
  pal.addEventListener('click', (e) => { if (e.target === pal) closeOverlay(pal); });
  $('#palette-btn').addEventListener('click', openPal);

  document.addEventListener('keydown', (e) => {
    const typing = /^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName);
    if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) { e.preventDefault(); palOpen() ? closeOverlay(pal) : openPal(); return; }
    if (e.key === '/' && !typing && !palOpen() && modal.hidden) { e.preventDefault(); openPal(); return; }
    if (e.key === 'Escape') {
      if (palOpen()) closeOverlay(pal); else if (!modal.hidden) closeOverlay(modal);
      return;
    }
    if (palOpen()) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        palSel = (palSel + (e.key === 'ArrowDown' ? 1 : -1) + palItems.length) % Math.max(1, palItems.length);
        $$('li', palList).forEach((n, i) => n.classList.toggle('sel', i === palSel));
        const s = $('li.sel', palList); s && s.scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'Enter') { e.preventDefault(); runPal(palSel); }
      else if (e.key === 'Tab') e.preventDefault();
      return;
    }
    if (e.key === 'Tab' && !modal.hidden) { // keep focus inside the drawer
      const f = $$(FOCUSABLE, modal).filter((n) => n.offsetParent !== null);
      if (!f.length) return;
      const a = f[0], z = f[f.length - 1], dr = $('.drawer', modal);
      if (e.shiftKey && (document.activeElement === a || document.activeElement === dr)) { e.preventDefault(); z.focus(); }
      else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
    }
  });
})();
