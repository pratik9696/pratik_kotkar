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

  /* =====================================================
     theme
  ===================================================== */
  function toggleTheme() {
    const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
    readColors();
  }
  $('#theme').addEventListener('click', toggleTheme);
  $('#yr').textContent = new Date().getFullYear();

  /* =====================================================
     neural-network background
  ===================================================== */
  const cv = $('#bg'), ctx = cv.getContext('2d');
  let W0, H0, dpr, pts = [], C = { c1: '#22d3ee', c2: '#8b5cf6', c3: '#f472b6' };
  const mouse = { x: -999, y: -999 };
  function readColors() {
    const cs = getComputedStyle(root);
    C = { c1: cs.getPropertyValue('--c1').trim(), c2: cs.getPropertyValue('--c2').trim(), c3: cs.getPropertyValue('--c3').trim() };
    if (reduced) frame();
  }
  function resize() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    W0 = innerWidth; H0 = innerHeight;
    cv.width = W0 * dpr; cv.height = H0 * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.min(95, Math.floor((W0 * H0) / 17000));
    pts = Array.from({ length: n }, (_, i) => ({
      x: Math.random() * W0, y: Math.random() * H0,
      vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35, k: i % 3
    }));
    if (reduced) frame();
  }
  function frame() {
    ctx.clearRect(0, 0, W0, H0);
    const L = 135;
    for (const p of pts) {
      if (!reduced) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W0) p.vx *= -1;
        if (p.y < 0 || p.y > H0) p.vy *= -1;
      }
    }
    ctx.lineWidth = 1;
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i];
      for (let j = i + 1; j < pts.length; j++) {
        const b = pts[j], dx = a.x - b.x, dy = a.y - b.y, d = Math.hypot(dx, dy);
        if (d < L) { ctx.globalAlpha = (1 - d / L) * .3; ctx.strokeStyle = C.c1; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
      }
      const md = Math.hypot(a.x - mouse.x, a.y - mouse.y);
      if (md < 190) {
        ctx.globalAlpha = (1 - md / 190) * .7; ctx.strokeStyle = C.c3;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
        if (!reduced) { a.x += (mouse.x - a.x) * .004; a.y += (mouse.y - a.y) * .004; }
      }
    }
    ctx.globalAlpha = .9;
    for (const p of pts) { ctx.fillStyle = p.k === 0 ? C.c1 : p.k === 1 ? C.c2 : C.c3; ctx.beginPath(); ctx.arc(p.x, p.y, 1.7, 0, 6.283); ctx.fill(); }
    ctx.globalAlpha = 1;
  }
  let raf;
  function loop() { frame(); raf = requestAnimationFrame(loop); }
  addEventListener('resize', resize);
  document.addEventListener('visibilitychange', () => {
    if (reduced) return;
    document.hidden ? cancelAnimationFrame(raf) : loop();
  });
  readColors(); resize();
  if (!reduced) loop();

  /* =====================================================
     pointer effects: cursor glow, spotlight + 3D tilt
  ===================================================== */
  const glow = $('#glow');
  let gx = 0, gy = 0, tx = 0, ty = 0, glowOn = false;
  addEventListener('pointermove', (e) => {
    mouse.x = e.clientX; mouse.y = e.clientY; tx = e.clientX; ty = e.clientY;
    if (!glowOn) { glowOn = true; glow.style.opacity = 1; gx = tx; gy = ty; glowTick(); }
  }, { passive: true });
  document.addEventListener('pointerleave', () => { mouse.x = mouse.y = -999; glow.style.opacity = 0; glowOn = false; });
  function glowTick() {
    if (!glowOn) return;
    gx += (tx - gx) * .12; gy += (ty - gy) * .12;
    glow.style.transform = `translate(${gx}px, ${gy}px)`;
    requestAnimationFrame(glowTick);
  }

  let hot = null;
  const resetTilt = (el) => { if (el) el.style.transform = ''; };
  document.addEventListener('pointermove', (e) => {
    const el = e.target.closest && e.target.closest('.tilt');
    if (el !== hot) { resetTilt(hot); hot = el; }
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
    el.style.setProperty('--mx', (px * 100) + '%'); el.style.setProperty('--my', (py * 100) + '%');
    if (reduced || !el.classList.contains('in') && el.classList.contains('reveal')) return;
    const max = el.classList.contains('term') ? 4 : 7;
    el.style.transform = `perspective(900px) rotateX(${(.5 - py) * max}deg) rotateY(${(px - .5) * max}deg) translateY(-3px)`;
  });
  document.addEventListener('pointerleave', () => { resetTilt(hot); hot = null; });

  /* =====================================================
     scroll: progress bar, nav highlight, reveal, counters
  ===================================================== */
  const bar = $('#progress');
  let ticking = false;
  addEventListener('scroll', () => {
    if (ticking) return; ticking = true;
    requestAnimationFrame(() => {
      const m = document.documentElement.scrollHeight - innerHeight;
      bar.style.transform = `scaleX(${m > 0 ? scrollY / m : 0})`;
      ticking = false;
    });
  }, { passive: true });

  const navLinks = $$('.nav nav a');
  const secObs = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) navLinks.forEach((a) => a.classList.toggle('cur', a.getAttribute('href') === '#' + e.target.id));
  }), { rootMargin: '-40% 0px -55% 0px' });
  $$('main section[id]').forEach((s) => secObs.observe(s));

  function countUp(el) {
    const to = +el.dataset.to, pre = el.dataset.pre || '', suf = el.dataset.suf || '';
    if (reduced) { el.textContent = pre + to + suf; return; }
    const t0 = performance.now(), dur = 1500;
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
     hero: typed headline + agent pipeline
  ===================================================== */
  const typed = $('#typed');
  const phrases = ['agentic AI systems', 'RAG pipelines', 'causal-ML platforms', 'forecasting engines', 'explainable risk models'];
  if (!reduced) {
    let pi = 0, ci = 0, del = false;
    (function tick() {
      const word = phrases[pi];
      typed.textContent = word.slice(0, ci);
      let wait = del ? 28 : 70;
      if (!del && ci === word.length) { del = true; wait = 1700; }
      else if (del && ci === 0) { del = false; pi = (pi + 1) % phrases.length; wait = 350; }
      else ci += del ? -1 : 1;
      setTimeout(tick, wait);
    })();
  }

  const agents = $$('#agents li'), logEl = $('#log'), barEl = $('#bar');
  const logs = ['> data-analyzer: scanning raw CSVs…', '> classifier: ADI/CV² → demand shape', '> builder: assembling dataset, no schema',
    '> trainer: Prophet · SARIMA · LSTM · Croston', '> analyst: ranking fulfilment centres by risk', '✓ benchmarks complete · ~675K orders · 186 days'];
  let stage = 0;
  function pipe() {
    agents.forEach((li, i) => { li.classList.toggle('done', i < stage); li.classList.toggle('run', i === stage); });
    logEl.textContent = logs[Math.min(stage, logs.length - 1)];
    barEl.style.width = Math.min(100, (stage / 5) * 100) + '%';
    stage = (stage + 1) % 7;
  }
  if (reduced) { stage = 5; pipe(); } else { pipe(); setInterval(pipe, 1500); }

  /* marquee */
  const allSkills = [...new Set(SKILLS.flatMap((s) => s[1]))];
  const mq = allSkills.map((s) => `<span>${esc(s)}</span>`).join('');
  $('#marquee').innerHTML = mq + mq;

  const projChips = (ids) => ids && ids.length
    ? `<div class="role-projects"><span class="mono">projects</span>${ids.map((id) => `<button type="button" class="pchip" data-open="${esc(id)}">${esc(PROJECTS.find((p) => p.id === id).name)}</button>`).join('')}</div>`
    : '';

  /* =====================================================
     timeline chart
  ===================================================== */
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
  const SWEEP = 2.0; // seconds for the intro scan line to cross the chart
  const delayFor = (cx) => (((cx - PAD_L) / (W - PAD_L - PAD_R)) * SWEEP).toFixed(2) + 's';

  const svg = $('#chart');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);

  const defs = svgEl('defs', {}, svg);
  const mkGrad = (id, a, b) => {
    const g = svgEl('linearGradient', { id, x1: 0, y1: 0, x2: 1, y2: 0 }, defs);
    svgEl('stop', { offset: 0, style: `stop-color:var(${a})` }, g);
    svgEl('stop', { offset: 1, style: `stop-color:var(${b})` }, g);
  };
  mkGrad('rg', '--c1', '--c2'); mkGrad('rgNow', '--warm', '--c3');
  const sg = svgEl('linearGradient', { id: 'scanG', x1: 0, y1: 0, x2: 1, y2: 0 }, defs);
  svgEl('stop', { offset: 0, style: 'stop-color:var(--c1);stop-opacity:0' }, sg);
  svgEl('stop', { offset: 1, style: 'stop-color:var(--c1);stop-opacity:.55' }, sg);

  Object.values(LANES).forEach((l) => {
    svgEl('rect', { class: 'lane-bg', x: PAD_L - 8, y: l.y, width: W - PAD_L - PAD_R + 16, height: l.h, rx: 10 }, svg);
    svgEl('text', { class: 'lane-label', x: 0, y: l.y + l.h / 2 + 4 }, svg).textContent = l.label;
  });

  // shaded band per company so work items read as belonging to that role
  ROLES.filter((r) => WORK_PROJECTS.some((w) => w.role === r.id)).forEach((r) => {
    const x0 = x(r.start), x1 = x(r.end == null ? NOW : r.end);
    svgEl('rect', { class: 'wband', x: x0, y: LANES.work.y + 4, width: x1 - x0 - 2, height: LANES.work.h - 8, rx: 8 }, svg);
    svgEl('text', { class: 'wband-label', x: x0 + 8, y: LANES.work.y + 17 }, svg).textContent = r.company;
  });

  const grid = svgEl('g', { class: 'grid' }, svg);
  const axis = svgEl('g', { class: 'axis' }, svg);
  for (let yr = 2018; yr <= 2026; yr++) {
    svgEl('line', { x1: x(yr), x2: x(yr), y1: 28, y2: AXIS_Y }, grid);
    svgEl('text', { x: x(yr) + 4, y: AXIS_Y + 20 }, axis).textContent = yr;
  }
  svgEl('line', { class: 'today', x1: x(NOW), x2: x(NOW), y1: 28, y2: AXIS_Y }, svg);
  const nowT = svgEl('text', { x: x(NOW), y: 20, 'text-anchor': 'end', class: 'tag', style: 'font-size:10.5px;fill:var(--warm)' }, svg);
  nowT.textContent = 'today';
  svgEl('circle', { class: 'now-pulse', cx: x(NOW), cy: LANES.role.y + LANES.role.h / 2, r: 7 }, svg);

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
    const end = r.end == null ? NOW : r.end;
    const x0 = x(r.start), w = Math.max(6, x(end) - x0 - 2);
    const y0 = LANES.role.y + 10, h = LANES.role.h - 20;
    const g = makeItem(`${r.title}, ${r.company}, ${r.range}`, x0, (n) => select(n,
      `<h3>${esc(r.title)} · ${esc(r.company)}</h3><div class="meta">${esc(r.range)} · ${esc(r.place)}</div>` +
      `<ul>${r.points.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>${projChips(r.projectIds)}`));
    svgEl('rect', { class: 'role-bar' + (r.end == null ? ' now' : ''), x: x0, y: y0, width: w, height: h, rx: 8 }, g);
    const clip = svgEl('clipPath', { id: 'c-' + r.id }, g);
    const narrow = w < 90;
    svgEl('rect', { x: x0 + 4, y: y0, width: Math.max(0, w - 8), height: h }, clip);
    svgEl('text', { class: 'role-text', x: x0 + (narrow ? 7 : 10), y: y0 + h / 2 + 4.5, 'clip-path': `url(#c-${r.id})`, style: narrow ? 'font-size:10.5px' : '' }, g).textContent = narrow ? r.company.split('.')[0] : r.company;
  });

  MILESTONES.forEach((m) => {
    const cx = x(m.date), cy = LANES.ms.y + LANES.ms.h / 2;
    const g = makeItem(m.label, cx, (n) => select(n, `<h3>${esc(m.label)}</h3><p>${esc(m.text)}</p>`));
    svgEl('circle', { class: 'hit', cx, cy, r: 16 }, g);
    svgEl('rect', { class: 'ms-dot', x: cx - 6, y: cy - 6, width: 12, height: 12, rx: 2, transform: `rotate(45 ${cx} ${cy})` }, g);
    svgEl('text', { class: 'tag', x: cx + 14, y: cy + 4 }, g).textContent = m.label;
  });

  WORK_PROJECTS.forEach((w) => {
    const r = ROLES.find((q) => q.id === w.role), p = w.open && PROJECTS.find((q) => q.id === w.open);
    const cx = x(w.date), cy = LANES.work.y + 34 + w.row * 22;
    const link = p ? `<p style="margin-top:.6rem"><a href="#${esc(p.id)}" data-open="${esc(p.id)}">Open project details →</a></p>` : '';
    const g = makeItem(`${w.label}, ${r.company}`, cx, (n) => select(n,
      `<h3>${esc(w.label)}</h3><div class="meta">${esc(r.title)} · ${esc(r.company)} · ${esc(r.range)}</div><p>${esc(w.text)}</p>${link}`));
    svgEl('circle', { class: 'hit', cx, cy, r: 14 }, g);
    svgEl('circle', { class: 'wdot', cx, cy, r: 5 }, g);
    svgEl('text', { class: 'tag', x: cx + 12, y: cy + 4 }, g).textContent = w.label;
  });

  const rowY = (row) => LANES.proj.y + 18 + row * 25;
  CHART_PROJECTS.forEach((p) => {
    const cx = x(p.date), cy = rowY(p.row);
    const link = p.url
      ? `<p style="margin-top:.6rem"><a href="${esc(p.url)}" target="_blank" rel="noopener">View on GitHub ↗</a></p>`
      : `<p style="margin-top:.6rem"><a href="#${esc(p.anchor)}" data-open="${esc(p.anchor)}">Open project details →</a></p>`;
    const g = makeItem(p.label, cx, (n) => select(n, `<h3>${esc(p.label)}</h3><p>${esc(p.text)}</p>${link}`));
    const left = p.side === 'left';
    svgEl('circle', { class: 'hit', cx, cy, r: 16 }, g);
    if (p.date > 2026.4) svgEl('circle', { class: 'ring', cx, cy, r: 6, style: 'pointer-events:none' }, g);
    svgEl('circle', { class: 'dot', cx, cy, r: 6 }, g);
    svgEl('text', { class: 'tag', x: cx + (left ? -13 : 13), y: cy + 4, 'text-anchor': left ? 'end' : 'start' }, g).textContent = p.label;
  });
  svgEl('rect', { class: 'scan', x: PAD_L - 8, y: 28, width: 70, height: AXIS_Y - 28, rx: 4, 'pointer-events': 'none' }, svg);

  const first = $$('.item', svg)[ROLES.length - 1];
  if (first) first.dispatchEvent(new Event('click'));
  const sc = $('.chart-scroll');
  if (sc.scrollWidth > sc.clientWidth) sc.scrollLeft = sc.scrollWidth;

  const chartObs = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { svg.classList.add('draw'); chartObs.disconnect(); }
  }), { threshold: .3 });
  chartObs.observe(svg);

  /* =====================================================
     project cards, filters
  ===================================================== */
  const ICONS = {
    ai: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="7" r="2"/><circle cx="18" cy="6" r="2"/><circle cx="12" cy="18" r="2"/><circle cx="12" cy="11" r="2.4"/><path d="M7.7 8.2l2.6 1.6M16.3 7.4l-2.7 2.6M12 13.4V16"/></svg>',
    prod: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="6" rx="1.5"/><rect x="3" y="14" width="18" height="6" rx="1.5"/><path d="M7 7h.01M7 17h.01"/></svg>',
    ml: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/><path d="M4 7l6-3 6 5 5-4"/></svg>',
    app: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5"/></svg>'
  };
  const iconFor = (p) => (p.cat.includes('ai') ? 'ai' : p.cat.includes('ml') ? 'ml' : p.cat.includes('app') ? 'app' : 'prod');
  const statusClass = (s) => ({ 'In progress': 's-prog', 'Coming soon': 's-soon', Live: 's-live', 'Live prototype': 's-live', Production: 's-prod' }[s] || '');
  const byId = (id) => PROJECTS.find((p) => p.id === id);
  const grid2 = $('#project-grid');

  const LIMIT = 6;
  let curFilter = 'all', expanded = false;
  const moreWrap = $('#more-wrap'), moreBtn = $('#more-btn');
  function renderCards(filter) {
    curFilter = filter;
    const all = PROJECTS.filter((p) => filter === 'all' || p.cat.includes(filter));
    const capped = filter === 'all' && !expanded && all.length > LIMIT;
    const list = capped ? all.slice(0, LIMIT) : all;
    grid2.innerHTML = list.map((p, i) => {
      return `<article class="glass tilt proj-card" id="${esc(p.id)}" data-id="${esc(p.id)}" style="--d:${(i % LIMIT) * 0.07}s">
        <div class="proj-top"><span class="ico">${ICONS[iconFor(p)]}</span><span class="badge ${statusClass(p.status)}">${esc(p.status)}</span></div>
        <h3>${esc(p.name)}</h3><div class="tag-chip">${esc(p.tag)}</div>
        <p>${esc(p.blurb)}</p>
        ${p.kpi ? `<div class="kpi"><b>${esc(p.kpi.v)}</b><span>${esc(p.kpi.l)}</span></div>` : ''}
        ${p.stack.length ? `<div class="chips">${p.stack.slice(0, 4).map((s) => `<span class="chip">${esc(s)}</span>`).join('')}</div>` : ''}
        <div class="card-foot"><button class="btn ghost" type="button" data-open="${esc(p.id)}" style="padding:.4rem .8rem"><span>Details</span><i class="arrow">→</i></button>
          ${p.repo ? `<a href="${esc(p.repo)}" target="_blank" rel="noopener">Source ↗</a>` : '<span style="color:var(--muted);font-size:.8rem">private</span>'}</div>
      </article>`;
    }).join('');
    moreWrap.hidden = !(filter === 'all' && all.length > LIMIT);
    moreBtn.querySelector('span').textContent = expanded ? 'Show fewer' : `Show all ${all.length} projects`;
    moreBtn.setAttribute('aria-expanded', expanded);
  }
  moreBtn.addEventListener('click', () => { expanded = !expanded; renderCards('all'); if (!expanded) $('#projects').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' }); });
  renderCards('all');
  grid2.addEventListener('click', (e) => {
    if (e.target.closest('a')) return;
    const card = e.target.closest('.proj-card');
    if (card) openProject(card.dataset.id, e.target.closest('button') || card);
  });

  $('#filters').addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    $$('#filters button').forEach((x) => { const on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-selected', on); });
    renderCards(b.dataset.f);
  });

  $('#repo-list').innerHTML = MORE_REPOS.map((r, i) =>
    `<li class="reveal" style="--d:${i * 0.07}s"><a class="glass tilt" href="${esc(r.url)}" target="_blank" rel="noopener"><b>${esc(r.name)}</b><span>${esc(r.desc)} · ${r.year}</span></a></li>`).join('');

  /* experience + skills */
  $('#exp').innerHTML = ROLES.slice().reverse().map((r) =>
    `<li class="glass tilt reveal ${r.end == null ? 'now' : ''}"><span class="node"></span>
      <div class="when">${esc(r.range)}</div>
      <h3>${esc(r.title)}</h3>
      <div class="co">${esc(r.company)} · ${esc(r.place)}</div>
      <ul>${r.points.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>
      ${projChips(r.projectIds)}
    </li>`).join('');
  $('#skills-grid').innerHTML = SKILLS.map(([title, items], i) =>
    `<div class="glass card tilt reveal" style="--d:${i * 0.06}s"><h3>// ${esc(title)}</h3><div class="chips">${items.map((s) => `<span class="chip">${esc(s)}</span>`).join('')}</div></div>`).join('');

  observeReveals();

  /* =====================================================
     overlays: project modal + command palette
  ===================================================== */
  const modal = $('#modal'), mBody = $('#m-body'), pal = $('#palette');
  let lastFocus = null;
  const FOCUSABLE = 'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])';

  function openOverlay(el, focusEl) {
    lastFocus = document.activeElement;
    el.hidden = false; document.body.classList.add('lock');
    (focusEl || el.querySelector('[tabindex="-1"]') || el).focus({ preventScroll: true });
  }
  function closeOverlay(el) {
    el.hidden = true;
    if ($$('.overlay').every((o) => o.hidden)) document.body.classList.remove('lock');
    if (lastFocus && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
  }

  function openProject(id) {
    const p = byId(id); if (!p) return;
    const primary = iconFor(p);
    const flow = p.arch.length
      ? `<h4>${esc(p.archTitle || 'How it works')}</h4><div class="flow">` +
        p.arch.map((s, i) => `${i ? `<span class="sep" style="--i:${i}">→</span>` : ''}<span class="step" style="--i:${i}"><b>${String(i + 1).padStart(2, '0')}</b>${esc(s)}</span>`).join('') + '</div>'
      : '';
    mBody.innerHTML = `
      <div style="display:flex;align-items:center;gap:.7rem"><span class="ico">${ICONS[primary]}</span><span class="tag-chip mono" style="margin:0">${esc(p.tag)}</span><span class="badge ${statusClass(p.status)}">${esc(p.status)}</span></div>
      <h2 id="m-title">${esc(p.name)}</h2>
      <p class="lead">${esc(p.blurb)}</p>
      ${p.kpi ? `<div class="kpi"><b>${esc(p.kpi.v)}</b><span>${esc(p.kpi.l)}</span></div>` : ''}
      ${p.problem ? `<h4>The problem</h4><p class="lead" style="margin:0">${esc(p.problem)}</p>` : ''}
      ${flow}
      ${p.facts.length ? `<h4>${p.problem ? 'What it moves' : 'Highlights'}</h4><div class="tiles">${p.facts.map((f) => `<div class="tile">${esc(f)}</div>`).join('')}</div>` : ''}
      ${p.stack.length ? `<h4>Stack</h4><div class="chips">${p.stack.map((s) => `<span class="chip">${esc(s)}</span>`).join('')}</div>` : ''}
      ${p.note ? `<p class="note">${esc(p.note)}</p>` : ''}
      <div class="m-actions">
        ${p.repo ? `<a class="btn primary" href="${esc(p.repo)}" target="_blank" rel="noopener"><span>View source</span><i class="arrow">↗</i></a>` : ''}
        ${p.live ? `<a class="btn" href="${esc(p.live)}" target="_blank" rel="noopener">Live site ↗</a>` : ''}
      </div>`;
    if (!palOpen()) lastFocus = document.activeElement; // keep original trigger when coming from palette
    openOverlay(modal, $('.modal', modal));
  }
  const palOpen = () => !pal.hidden;

  $('#m-close').addEventListener('click', () => closeOverlay(modal));
  modal.addEventListener('click', (e) => { if (e.target === modal) closeOverlay(modal); });
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-open]');
    if (t && !t.closest('.proj-card')) { e.preventDefault(); openProject(t.dataset.open); }
  });

  /* command palette */
  const palInput = $('#pal-input'), palList = $('#pal-list');
  const goto = (id) => () => { const el = document.getElementById(id); el && el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' }); };
  const ext = (u) => () => window.open(u, '_blank', 'noopener');
  const ACTIONS = [
    ...[['timeline', 'Timeline'], ['projects', 'Projects'], ['experience', 'Experience'], ['skills', 'Skills'], ['contact', 'Contact']]
      .map(([id, l]) => ({ label: 'Go to ' + l, hint: 'section', run: goto(id) })),
    ...PROJECTS.map((p) => ({ label: p.name, hint: 'project', run: () => openProject(p.id) })),
    { label: 'GitHub profile', hint: 'link ↗', run: ext('https://github.com/pratik9696') },
    { label: 'LinkedIn', hint: 'link ↗', run: ext('https://linkedin.com/in/pratikkotkar9696') },
    { label: 'Résumé (PDF)', hint: 'link ↗', run: ext('https://github.com/pratik9696/resume/blob/HEAD/Pratik_Kotkar_AI_ML_Eng.pdf') },
    { label: 'Email Pratik', hint: 'mailto', run: () => { location.href = 'mailto:pratikkotkar9696@gmail.com'; } },
    { label: 'Toggle light / dark theme', hint: 'action', run: toggleTheme }
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
    const isProject = a.hint === 'project';
    closeOverlay(pal);
    a.run();
    if (isProject) lastFocus = $('#palette-btn');
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
    if (e.key === 'Tab' && !modal.hidden) { // trap focus inside the modal
      const f = $$(FOCUSABLE, modal).filter((n) => n.offsetParent !== null);
      if (!f.length) return;
      const a = f[0], z = f[f.length - 1];
      if (e.shiftKey && (document.activeElement === a || document.activeElement === $('.modal', modal))) { e.preventDefault(); z.focus(); }
      else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
    }
  });

  // deep link: #project-id flashes its card
  function flash() {
    const el = location.hash && document.getElementById(location.hash.slice(1));
    if (el && el.classList.contains('proj-card')) { el.classList.add('flash'); setTimeout(() => el.classList.remove('flash'), 1800); }
  }
  addEventListener('hashchange', flash); flash();
})();
