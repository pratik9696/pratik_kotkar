(function () {
  'use strict';
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const NS = 'http://www.w3.org/2000/svg';
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const touch = matchMedia('(hover: none)').matches;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const svgEl = (name, attrs = {}, parent) => {
    const e = document.createElementNS(NS, name);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  };
  const sleep = (ms) => new Promise((r) => setTimeout(r, reduced ? 0 : ms));
  const slug = (s) => s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const hash7 = (s) => { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; } return h.toString(16).padStart(8, '0').slice(0, 7); };
  const lev = (a, b) => { const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]); for (let j = 1; j <= b.length; j++) d[0][j] = j; for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); return d[a.length][b.length]; };
  const link = (cmd, label) => `<button type="button" class="cmdlink" data-cmd="${esc(cmd)}">${esc(label || cmd)}</button>`;
  const byId = (id) => PROJECTS.find((p) => p.id === id);

  /* ======================================================= elements */
  const out = $('#out'), sc = $('#scroll'), inp = $('#in'), promptEl = $('#prompt');
  const PS1 = '<span class="u">pratik</span><span class="at">@</span><span class="h">portfolio</span> <span class="p">~</span> <span class="sym">❯</span>';
  $('#ps1').innerHTML = PS1;

  /* ======================================================= themes */
  const THEMES = ['midnight', 'amber', 'matrix', 'paper'];
  const themeBtn = $('#theme-btn');
  function setTheme(n) {
    root.setAttribute('data-theme', n);
    themeBtn.textContent = 'theme: ' + n;
    const meta = $('meta[name="theme-color"]');
    if (meta) meta.content = getComputedStyle(root).getPropertyValue('--bg').trim();
    try { localStorage.setItem('pk-theme', n); } catch (e) {}
  }
  const curTheme = () => root.getAttribute('data-theme') || 'midnight';
  themeBtn.addEventListener('click', () => setTheme(THEMES[(THEMES.indexOf(curTheme()) + 1) % THEMES.length]));
  setTheme(THEMES.includes(curTheme()) ? curTheme() : 'midnight');

  /* ======================================================= renderers */
  const LOGO_P = ['██████╗ ', '██╔══██╗', '██████╔╝', '██╔═══╝ ', '██║     ', '╚═╝     '];
  const LOGO_K = ['██╗  ██╗', '██║ ██╔╝', '█████╔╝ ', '██╔═██╗ ', '██║  ██╗', '╚═╝  ╚═╝'];
  function uptime() {
    const start = new Date(2018, 7, 1), now = new Date();
    let m = (now.getFullYear() - start.getFullYear()) * 12 + now.getMonth() - start.getMonth();
    return `${Math.floor(m / 12)}y ${m % 12}m`;
  }

  const R = {};

  R.whoami = () => `
    <div class="nf">
      <pre class="logo" aria-hidden="true">${LOGO_P.map((p, i) => `<span class="l1">${p}</span><span class="l2">${LOGO_K[i]}</span>`).join('\n')}</pre>
      <div class="nf-info">
        <div class="nf-user"><span class="u">pratik</span><span class="at">@</span><span class="h">portfolio</span></div>
        <div class="nf-rule">──────────────────────────────</div>
        <dl class="kv">
          <dt>Role</dt><dd>Principal Data Scientist</dd>
          <dt>Company</dt><dd>Bicycle.ai <span class="dim">(since Feb 2026)</span></dd>
          <dt>Focus</dt><dd>Agentic AI · RAG · Causal ML · Forecasting</dd>
          <dt>Uptime</dt><dd>${uptime()} <span class="dim">(since Aug 2018)</span></dd>
          <dt>Sectors</dt><dd>Fintech · E-commerce · Telecom</dd>
          <dt>Stack</dt><dd>Python · XGBoost · Claude Agent SDK · AWS</dd>
          <dt>Impact</dt><dd><span class="c3">$280K/mo GMV</span> · <span class="c3">−64% latency</span> · <span class="c3">~34M events</span></dd>
          <dt>Location</dt><dd>Bangalore, India</dd>
          <dt>Status</dt><dd><span class="status-dot">●</span> open to conversations</dd>
        </dl>
        <div class="swatch" aria-hidden="true">${['--accent', '--c2', '--c3', '--c4', '--red', '--green', '--fg', '--dim'].map((v) => `<i style="background:var(${v})"></i>`).join('')}</div>
      </div>
    </div>
    <p style="margin:1.1rem 0 .2rem;max-width:78ch">8+ years shipping ML that people trust with real decisions. Today I architect Claude-based multi-agent pipelines, RAG layers and causal-ML platforms; before that, models behind $280K+ of monthly GMV at Twid Pay.</p>
    <div class="about-links">${link('impact')} ${link('timeline')} ${link('projects')} ${link('log')} ${link('skills')} ${link('contact')} ${link('tour', 'tour ▶')}</div>`;

  // del/add: [label, solid bar %, optional upper bound % for ranges]
  const IMPACT = [
    { co: 'twid-pay', label: 'API response time', del: ['700 ms', 100], add: ['250 ms', 36], delta: '−64%' },
    { co: 'twid-pay', label: 'monthly GMV impact', add: ['$280K / month'], delta: 'RFM models' },
    { co: 'niyo', label: 'VKYC approval rate', del: ['20%', 20], add: ['24%', 24], delta: '+4 pts, week one' },
    { co: 'niyo', label: 'funds-transfer activation', del: ['40%', 40], add: ['48%', 48], delta: '+8 pts' },
    { co: 'niyo', label: 'loan disbursement rate', add: ['+20%'], delta: 'propensity model' },
    { co: 'pharmeasy', label: 'forecast accuracy', del: ['30–40%', 30, 40], add: ['50–70%', 50, 70], delta: 'ensemble' }
  ];
  R.impact = () => {
    const bar = (v) => v[1] == null ? '<span></span>' : `<span class="bar"><i style="--w:${v[1]}%"></i>${v[2] != null ? `<i class="hi" style="--w:${v[2]}%;--w0:${v[1]}%"></i>` : ''}</span>`;
    const rows = IMPACT.map((r) => {
      const d = r.del ? `<div class="dl-row del"><span>-</span><span>${esc(r.del[0])}</span>${bar(r.del)}<span></span></div>` : '';
      const a = `<div class="dl-row add"><span>+</span><span>${esc(r.add[0])}</span>${bar(r.add)}<span class="dlt">${esc(r.delta)}</span></div>`;
      return `<div class="hunk">@@ ${esc(r.co)} · ${esc(r.label)} @@</div>${d}${a}`;
    }).join('');
    return `<p class="note"># git diff --stat results/ &nbsp;(red = before, green = after)</p><div class="diff">${rows}</div>
      <p class="note" style="margin-top:1rem">For ranges the solid bar is the lower bound and the faded part reaches the upper bound. Details: ${link('log')} · ${link('projects')}</p>`;
  };

  R.help = () => {
    const rows = [
      ['whoami', 'neofetch-style card: who I am'], ['impact', 'measurable results, as a diff'], ['timeline', 'interactive career and project timeline'],
      ['forecast', 'my career, drawn as a forecast chart'], ['projects', 'all case files (flags: --ai --prod --app --ml)'], ['open <id>', 'read one case file, e.g. open ezquote'],
      ['log', 'work experience as a git log'], ['skills', 'what I work with'], ['education', 'education and achievements'], ['contact', 'how to reach me'],
      ['resume', 'open the résumé PDF'], ['theme [name]', THEMES.join(' · ')], ['tour', 'guided run of everything'], ['clear', 'clear the screen'], ['history', 'commands you have run']
    ];
    return `<p class="note">click a command or type it. Tab completes, ↑/↓ recalls history.</p>
      <div class="tbl-wrap"><table class="tbl"><tbody>${rows.map(([c, d]) => `<tr class="clk" tabindex="0" data-cmd="${esc(c.split(' ')[0] === 'open' ? 'projects' : c.replace(/ \[.*|<.*/, '').trim())}"><td class="id">${esc(c)}</td><td>${esc(d)}</td></tr>`).join('')}</tbody></table></div>`;
  };

  const tagFor = (s) => ({ Production: 'prod', Live: 'live', 'Live prototype': 'live', 'In progress': 'prog', 'Coming soon': 'soon', 'Public repo': 'pub' }[s] || 'pub');
  R.projects = (flag) => {
    const list = PROJECTS.filter((p) => !flag || p.cat.includes(flag));
    let rows = '';
    list.forEach((p) => {
      if (!flag) {
        const i = PROJECTS.indexOf(p);
        if (i === 0) rows += '<tr class="group-row"><td colspan="4"># recent — agents &amp; product</td></tr>';
        if (i === 6) rows += '<tr class="group-row"><td colspan="4"># earlier — ML shipped at Twid Pay, Niyo &amp; PharmEasy</td></tr>';
      }
      rows += `<tr class="clk" tabindex="0" role="button" data-cmd="open ${esc(p.id)}">
        <td class="id">${esc(p.id)}</td>
        <td class="nm"><b>${esc(p.name)}</b><small>${esc(p.tag)}</small></td>
        <td class="imp col-imp">${p.kpi ? `${esc(p.kpi.v)}<small>${esc(p.kpi.l)}</small>` : '<span class="dim">—</span>'}</td>
        <td><span class="tag ${tagFor(p.status)}">${esc(p.status)}</span></td></tr>`;
    });
    return `<p class="note"># ${list.length} case files${flag ? ` matching --${flag}` : ''}. Click a row or run ${link('open ezquote')}</p>
      <div class="tbl-wrap"><table class="tbl"><thead><tr><th>id</th><th>project</th><th class="col-imp">impact</th><th>status</th></tr></thead><tbody>${rows}</tbody></table></div>
      <p class="note" style="margin-top:.8rem">filter: ${['ai', 'prod', 'app', 'ml'].map((f) => link('projects --' + f)).join(' ')} · ${link('projects --all', 'all')} &nbsp;|&nbsp; also on GitHub: ${MORE_REPOS.map((r) => `<a href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.name)}</a>`).join(' · ')}</p>`;
  };

  R.caseFile = (p) => {
    const steps = p.arch.length
      ? `<h2>${esc((p.archTitle || 'HOW IT WORKS').toUpperCase())}</h2><div class="sec"><div class="pipe">${p.arch.map((s, i) => `${i ? '<span class="arrow">──▶</span>' : ''}<span class="stage" style="--i:${i}"><b>${String(i + 1).padStart(2, '0')}</b>${esc(s)}</span>`).join('')}</div></div>` : '';
    return `<article class="man">
      <div class="man-h"><span>${esc(p.id.toUpperCase())}(1)</span><span>${esc(p.tag)}</span><span>${esc(p.id.toUpperCase())}(1)</span></div>
      <h2>NAME</h2><div class="sec"><div class="man-name glow">${esc(p.name)} <span class="tag ${tagFor(p.status)}" style="vertical-align:middle">${esc(p.status)}</span></div><p>${esc(p.blurb)}</p>
      ${p.kpi ? `<div class="kpi-line"><b>${esc(p.kpi.v)}</b><span class="dim">${esc(p.kpi.l)}</span></div>` : ''}</div>
      ${p.problem ? `<h2>THE PROBLEM</h2><div class="sec"><p>${esc(p.problem)}</p></div>` : ''}
      ${steps}
      ${p.facts.length ? `<h2>${p.problem ? 'WHAT IT MOVES' : 'HIGHLIGHTS'}</h2><div class="sec"><ul class="facts">${p.facts.map((f) => `<li>${esc(f)}</li>`).join('')}</ul></div>` : ''}
      ${p.stack.length ? `<h2>STACK</h2><div class="sec stackline">${p.stack.map((s) => `<span>${esc(s)}</span>`).join('')}</div>` : ''}
      ${p.note ? `<h2>NOTES</h2><div class="sec"><p class="dim">${esc(p.note)}</p></div>` : ''}
      <div class="btnrow">${p.repo ? `<a class="btn" href="${esc(p.repo)}" target="_blank" rel="noopener">view source ↗</a>` : ''}${p.live ? `<a class="btn alt" href="${esc(p.live)}" target="_blank" rel="noopener">live site ↗</a>` : ''}<button class="btn alt" type="button" data-cmd="projects">← back to projects</button></div>
    </article>`;
  };

  R.log = () => {
    const roles = ROLES.slice().reverse();
    const commits = roles.map((r, i) => {
      const proj = (r.projectIds || []).map((id) => link('open ' + id, id)).join(' ');
      const refs = `(${i === 0 ? '<span class="hd">HEAD -> main</span>, ' : ''}tag: ${esc(slug(r.company))}${i === roles.length - 1 ? ', root' : ''})`;
      return `<div class="commit${i === 0 ? ' head' : ''}">
        <div><span class="hash">${hash7(r.company + r.title)}</span> <span class="refs">${refs}</span></div>
        <div class="c-title">${esc(r.title)} · ${esc(r.company)}</div>
        <div class="c-meta">Author: Pratik Kotkar &nbsp;·&nbsp; Date: ${esc(r.range)} &nbsp;·&nbsp; ${esc(r.place)}</div>
        <ul>${r.points.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>
        ${proj ? `<div class="c-proj">projects: ${proj}</div>` : ''}</div>`;
    }).join('');
    return `<p class="note"># git log --graph --stat career/ &nbsp;(newest first)</p><div class="glog">${commits}</div>`;
  };

  R.skills = () => `<p class="note"># ls -R skills/</p><div class="lsr">${SKILLS.map(([t, items]) =>
    `<div><div class="dir">./${esc(slug(t))}/</div><div class="items">${items.map((s) => `<span>${esc(s)}</span>`).join('')}</div></div>`).join('')}</div>`;

  R.education = () => `<div class="cols">
    <div><p class="note"># cat education.txt</p><p><b class="acc">B.E. Computer Science</b><br>MIT College of Engineering, Pune<br><span class="dim">2018</span></p></div>
    <div><p class="note"># cat achievements.txt</p><ul class="facts">
      <li>Top 100 finalist, Rakathon by Rakuten (LLM-based project), Sep 2023</li>
      <li>Winner, Vodafone-Idea Hackathon (VIL CodeFest), Feb 2020</li>
      <li>AWS Certified Machine Learning Practitioner <span class="dim">(pursuing)</span></li></ul></div></div>`;

  R.contact = () => `<p class="note"># cat contact.txt</p><dl class="contact-grid">
    <dt>email</dt><dd><a href="mailto:pratikkotkar9696@gmail.com">pratikkotkar9696@gmail.com</a><button class="copy" type="button" data-copy="pratikkotkar9696@gmail.com">copy</button></dd>
    <dt>linkedin</dt><dd><a href="https://linkedin.com/in/pratikkotkar9696" target="_blank" rel="noopener">linkedin.com/in/pratikkotkar9696</a></dd>
    <dt>github</dt><dd><a href="https://github.com/pratik9696" target="_blank" rel="noopener">github.com/pratik9696</a></dd>
    <dt>résumé</dt><dd><a href="https://github.com/pratik9696/resume/blob/HEAD/Pratik_Kotkar_AI_ML_Eng.pdf" target="_blank" rel="noopener">Pratik_Kotkar_AI_ML_Eng.pdf</a></dd>
    <dt>location</dt><dd>Bangalore, India</dd></dl>
    <p>Hiring for applied AI, agentic systems or ML platform work, or want to compare notes on RAG evals? Email is best.</p>
    <div class="btnrow"><a class="btn" href="mailto:pratikkotkar9696@gmail.com">send email →</a></div>`;

  R.theme = (name) => `<p>theme → <b class="acc">${esc(name)}</b></p><div class="themes">${THEMES.map((t) => `<button type="button" class="cmdlink${t === name ? ' on' : ''}" data-cmd="theme ${t}">${t}</button>`).join('')}</div>`;

  /* ---------- forecast chart (the career as a time series) ---------- */
  R.forecast = (res) => {
    res.insertAdjacentHTML('beforeend', '<p class="note"># forecast --horizon 2030 &nbsp;· responsibility over time, arbitrary units, 80% prediction interval · move your pointer across it</p><div class="plot"><svg class="fc" viewBox="0 0 1000 320" role="img" aria-label="Illustrative chart of responsibility rising across five roles from 2018 to today, then a dashed forecast with a widening prediction interval."></svg></div>');
    const hc = $('.fc', res);
    const X0 = 30, X1 = 970, TA = 2018, TB = 2030, YB = 292;
    const hx = (t) => X0 + ((t - TA) / (TB - TA)) * (X1 - X0);
    const data = [[2018.58, 262], [2019.4, 252], [2020.2, 256], [2020.83, 238], [2021.6, 224], [2022.0, 210], [2022.7, 218], [2023.2, 200], [2023.42, 188], [2024.2, 172], [2025.0, 154], [2025.9, 132], [2026.1, 116], [NOW, 88]];
    const P = data.map(([t, y]) => [hx(t), y]);
    const yAt = (t) => { if (t <= data[0][0]) return data[0][1]; for (let i = 1; i < data.length; i++) if (t <= data[i][0]) { const [a, ya] = data[i - 1], [b, yb] = data[i]; return ya + ((t - a) / (b - a)) * (yb - ya); } return data[data.length - 1][1]; };
    let d = `M${P[0][0]} ${P[0][1]}`;
    for (let i = 0; i < P.length - 1; i++) { const p0 = P[i - 1] || P[i], p1 = P[i], p2 = P[i + 1], p3 = P[i + 2] || p2; d += ` C${p1[0] + (p2[0] - p0[0]) / 6} ${p1[1] + (p2[1] - p0[1]) / 6}, ${p2[0] - (p3[0] - p1[0]) / 6} ${p2[1] - (p3[1] - p1[1]) / 6}, ${p2[0]} ${p2[1]}`; }
    const nx = hx(NOW), ny = 88, mid = nx + (X1 - nx) * .5;
    const ax = svgEl('g', { class: 'axis' }, hc);
    svgEl('line', { class: 'base', x1: X0, x2: X1, y1: YB, y2: YB }, ax);
    for (let yr = TA; yr <= TB; yr += 2) { svgEl('line', { class: 'tick', x1: hx(yr), x2: hx(yr), y1: 12, y2: YB }, ax); svgEl('text', { x: hx(yr), y: YB + 18, 'text-anchor': 'middle' }, ax).textContent = yr; }
    svgEl('path', { class: 'cone', d: `M${nx} ${ny} Q${mid} 62 ${X1} 8 L${X1} 168 Q${mid} 118 ${nx} ${ny} Z` }, hc);
    svgEl('path', { class: 'fline', d: `M${nx} ${ny} Q${mid} 84 ${X1} 46` }, hc);
    svgEl('line', { class: 'today', x1: nx, x2: nx, y1: 12, y2: YB }, hc);
    svgEl('path', { class: 'hline', pathLength: 1, d }, hc);
    ROLES.forEach((r) => {
      const x = hx(r.start), y = yAt(r.start);
      const g = svgEl('g', { class: 'pin', style: `--d:${(0.3 + ((r.start - 2018) / 8.77) * 1.8).toFixed(2)}s` }, hc);
      svgEl('circle', { cx: x, cy: y, r: 5 }, g);
      svgEl('text', { x: x - 9, y: y - 10 }, g).textContent = r.company.split(' ')[0].replace('.ai', '').toUpperCase() + " ’" + String(Math.floor(r.start)).slice(2);
    });
    svgEl('circle', { class: 'now-ring', cx: nx, cy: ny, r: 6 }, hc); svgEl('circle', { class: 'now-dot', cx: nx, cy: ny, r: 6 }, hc);
    svgEl('text', { class: 'note', x: nx - 120, y: 58, style: 'animation-delay:2.4s' }, hc).textContent = '← you are here';
    svgEl('text', { class: 'note', x: hx(2027.6), y: 112, style: 'animation-delay:2.6s' }, hc).textContent = 'next role: ?';
    const sg = svgEl('g', { class: 'scrub' }, hc);
    const sl = svgEl('line', { y1: 12, y2: YB }, sg), sd = svgEl('circle', { r: 4.5 }, sg), ro = svgEl('text', { class: 'readout', x: X0, y: 8 }, sg);
    const roleAt = (t) => ROLES.find((r) => t >= r.start && t < (r.end == null ? NOW : r.end));
    const read = (t) => { const yr = Math.floor(t); if (t > NOW) return `${yr} · forecast: wide interval, role TBD`; const r = roleAt(t); if (r) return `${yr} · ${r.title}, ${r.company}`; return t < ROLES[0].start ? `${yr} · B.E. Computer Science, MIT College of Engineering` : `${yr} · between roles`; };
    const scrub = (e) => { const b = hc.getBoundingClientRect(); const x = Math.max(X0, Math.min(X1, ((e.clientX - b.left) / b.width) * 1000)), t = TA + ((x - X0) / (X1 - X0)) * (TB - TA); sl.setAttribute('x1', x); sl.setAttribute('x2', x); sd.setAttribute('cx', x); sd.setAttribute('cy', t > NOW ? ny + (46 - ny) * ((x - nx) / (X1 - nx)) : yAt(t)); ro.textContent = read(t); hc.classList.add('scrubbing'); };
    hc.addEventListener('pointermove', scrub); hc.addEventListener('pointerdown', scrub); hc.addEventListener('pointerleave', () => hc.classList.remove('scrubbing'));
  };

  /* ---------- timeline chart ---------- */
  R.timeline = (res) => {
    res.insertAdjacentHTML('beforeend', `<p class="note"># timeline --plot &nbsp;· click any bar or marker</p>
      <div class="legend" aria-hidden="true"><span><i class="a"></i>role</span><span><i class="b"></i>work inside a role</span><span><i class="c"></i>project / repo</span><span><i class="d"></i>milestone</span></div>
      <div class="plot" tabindex="0" aria-label="Career timeline chart, scrollable"><svg class="tl" role="img" aria-label="Timeline from 2018 to 2026 showing roles, work inside each role, projects and milestones"></svg></div>
      <div class="detail" aria-live="polite"></div>
      <p class="note" style="margin-top:.7rem">Dates inside a role are approximate. Try ${link('forecast')} or ${link('log')}.</p>`);
    const svg = $('.tl', res), detail = $('.detail', res);
    const W = 1040, PAD_L = 92, PAD_R = 24, T0 = 2018.0, T1 = NOW + 0.1;
    const x = (t) => PAD_L + ((t - T0) / (T1 - T0)) * (W - PAD_L - PAD_R);
    const LANES = { ms: { y: 40, h: 60, label: 'Milestones' }, role: { y: 112, h: 62, label: 'Roles' }, work: { y: 186, h: 112, label: 'Work' }, proj: { y: 310, h: 136, label: 'Projects' } };
    const AXIS_Y = LANES.proj.y + LANES.proj.h + 8, H = AXIS_Y + 34;
    const delayFor = (cx) => (((cx - PAD_L) / (W - PAD_L - PAD_R)) * 2.0).toFixed(2) + 's';
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    Object.values(LANES).forEach((l) => { svgEl('line', { class: 'lane-line', x1: PAD_L - 8, x2: W - PAD_R + 8, y1: l.y, y2: l.y }, svg); svgEl('text', { class: 'lane-label', x: 0, y: l.y + 16 }, svg).textContent = l.label; });
    svgEl('line', { class: 'lane-line', x1: PAD_L - 8, x2: W - PAD_R + 8, y1: AXIS_Y, y2: AXIS_Y }, svg);
    ROLES.filter((r) => WORK_PROJECTS.some((w) => w.role === r.id)).forEach((r) => {
      const x0 = x(r.start), x1 = x(r.end == null ? NOW : r.end);
      svgEl('rect', { class: 'wband', x: x0, y: LANES.work.y + 4, width: x1 - x0 - 2, height: LANES.work.h - 8 }, svg);
      svgEl('text', { class: 'wband-label', x: x0 + 8, y: LANES.work.y + 17 }, svg).textContent = r.company;
    });
    const grid = svgEl('g', { class: 'grid' }, svg), axis = svgEl('g', { class: 'axis' }, svg);
    for (let yr = 2018; yr <= 2026; yr++) { svgEl('line', { x1: x(yr), x2: x(yr), y1: 30, y2: AXIS_Y }, grid); svgEl('text', { x: x(yr) + 4, y: AXIS_Y + 20 }, axis).textContent = yr; }
    svgEl('line', { class: 'today', x1: x(NOW), x2: x(NOW), y1: 30, y2: AXIS_Y }, svg);
    svgEl('text', { class: 'today-t', x: x(NOW), y: 20, 'text-anchor': 'end' }, svg).textContent = 'today';

    let selected = null;
    const select = (node, html) => { if (selected) selected.classList.remove('sel'); selected = node; node.classList.add('sel'); detail.innerHTML = html; };
    const item = (label, cx, fn) => {
      const g = svgEl('g', { class: 'item', tabindex: 0, role: 'button', 'aria-label': label }, svg);
      g.style.setProperty('--d', delayFor(cx));
      g.addEventListener('click', () => fn(g));
      g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); fn(g); } });
      return g;
    };
    const chips = (ids) => ids && ids.length ? `<p style="margin-top:.6rem" class="dim">projects: ${ids.map((id) => link('open ' + id, id)).join(' ')}</p>` : '';

    ROLES.forEach((r) => {
      const now = r.end == null, end = now ? NOW : r.end, x0 = x(r.start), w = Math.max(6, x(end) - x0 - 2), y0 = LANES.role.y + 10, h = LANES.role.h - 20;
      const g = item(`${r.title}, ${r.company}, ${r.range}`, x0, (n) => select(n, `<h3>${esc(r.title)} · ${esc(r.company)}</h3><div class="meta">${esc(r.range)} · ${esc(r.place)}</div><ul>${r.points.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>${chips(r.projectIds)}`));
      svgEl('rect', { class: 'role-bar' + (now ? ' now' : ''), x: x0, y: y0, width: w, height: h, rx: 2 }, g);
      const clip = svgEl('clipPath', { id: 'c-' + r.id }, g); const narrow = w < 90;
      svgEl('rect', { x: x0 + 4, y: y0, width: Math.max(0, w - 8), height: h }, clip);
      svgEl('text', { class: 'role-text', x: x0 + (narrow ? 7 : 10), y: y0 + h / 2 + 4.5, 'clip-path': `url(#c-${r.id})`, style: narrow ? 'font-size:10.5px' : '' }, g).textContent = narrow ? r.company.split('.')[0] : r.company;
    });
    MILESTONES.forEach((m) => {
      const cx = x(m.date), cy = LANES.ms.y + LANES.ms.h / 2 + 4;
      const g = item(m.label, cx, (n) => select(n, `<h3>${esc(m.label)}</h3><p>${esc(m.text)}</p>`));
      svgEl('circle', { class: 'hit', cx, cy, r: 16 }, g);
      svgEl('rect', { class: 'ms-dot', x: cx - 5, y: cy - 5, width: 10, height: 10, transform: `rotate(45 ${cx} ${cy})` }, g);
      svgEl('text', { class: 'tag-t', x: cx + 14, y: cy + 4 }, g).textContent = m.label;
    });
    WORK_PROJECTS.forEach((w) => {
      const r = ROLES.find((q) => q.id === w.role), p = w.open && byId(w.open), cx = x(w.date), cy = LANES.work.y + 34 + w.row * 22;
      const g = item(`${w.label}, ${r.company}`, cx, (n) => select(n, `<h3>${esc(w.label)}</h3><div class="meta">${esc(r.title)} · ${esc(r.company)} · ${esc(r.range)}</div><p>${esc(w.text)}</p>${p ? `<p style="margin-top:.6rem">${link('open ' + p.id, 'open ' + p.id + ' →')}</p>` : ''}`));
      svgEl('circle', { class: 'hit', cx, cy, r: 14 }, g); svgEl('circle', { class: 'wdot', cx, cy, r: 5 }, g);
      svgEl('text', { class: 'tag-t', x: cx + 12, y: cy + 4 }, g).textContent = w.label;
    });
    CHART_PROJECTS.forEach((p) => {
      const cx = x(p.date), cy = LANES.proj.y + 22 + p.row * 25, left = p.side === 'left';
      const lnk = p.url ? `<p style="margin-top:.6rem"><a href="${esc(p.url)}" target="_blank" rel="noopener">view on GitHub ↗</a></p>` : `<p style="margin-top:.6rem">${link('open ' + p.anchor, 'open ' + p.anchor + ' →')}</p>`;
      const g = item(p.label, cx, (n) => select(n, `<h3>${esc(p.label)}</h3><p>${esc(p.text)}</p>${lnk}`));
      svgEl('circle', { class: 'hit', cx, cy, r: 16 }, g);
      if (p.date > 2026.4) svgEl('circle', { class: 'ring', cx, cy, r: 6, style: 'pointer-events:none' }, g);
      svgEl('circle', { class: 'dot', cx, cy, r: 6 }, g);
      svgEl('text', { class: 'tag-t', x: cx + (left ? -13 : 13), y: cy + 4, 'text-anchor': left ? 'end' : 'start' }, g).textContent = p.label;
    });
    svgEl('rect', { class: 'scan', x: PAD_L - 8, y: 30, width: 2, height: AXIS_Y - 30, 'pointer-events': 'none' }, svg);
    const items = $$('.item', svg); if (items[ROLES.length - 1]) items[ROLES.length - 1].dispatchEvent(new Event('click'));
    const plot = $('.plot', res); if (plot.scrollWidth > plot.clientWidth) plot.scrollLeft = plot.scrollWidth;
    requestAnimationFrame(() => svg.classList.add('draw'));
  };

  /* ======================================================= command table */
  const WINS = [['0:about', 'whoami'], ['1:timeline', 'timeline'], ['2:projects', 'projects'], ['3:log', 'log'], ['4:skills', 'skills'], ['5:contact', 'contact']];
  const CMDS = {
    whoami: { win: 0, alias: ['about', 'neofetch', 'me'], run: (a, res) => res.insertAdjacentHTML('beforeend', R.whoami()) },
    impact: { win: 0, alias: ['results', 'diff'], run: (a, res) => res.insertAdjacentHTML('beforeend', R.impact()) },
    timeline: { win: 1, alias: ['plot'], run: (a, res) => R.timeline(res) },
    forecast: { win: 1, alias: [], run: (a, res) => R.forecast(res) },
    projects: { win: 2, alias: ['work', 'ls-projects'], run: (a, res) => {
      const f = (a.find((x) => /^--?(ai|prod|app|ml|all)$/.test(x)) || a.find((x) => ['ai', 'prod', 'app', 'ml'].includes(x)) || '').replace(/^--?/, '');
      res.insertAdjacentHTML('beforeend', R.projects(f && f !== 'all' ? f : ''));
    } },
    open: { win: 2, alias: ['man', 'cat-project'], run: (a, res) => {
      const id = (a[0] || '').toLowerCase().replace(/\/$/, ''), p = byId(id);
      if (p) res.insertAdjacentHTML('beforeend', R.caseFile(p));
      else notFound(res, 'open ' + id, PROJECTS.map((x) => x.id), a[0] ? `no case file called "${esc(a[0])}"` : 'usage: open &lt;id&gt;');
    } },
    log: { win: 3, alias: ['experience', 'jobs', 'career', 'history-work'], run: (a, res) => res.insertAdjacentHTML('beforeend', R.log()) },
    skills: { win: 4, alias: ['stack'], run: (a, res) => res.insertAdjacentHTML('beforeend', R.skills()) },
    education: { win: 4, alias: ['achievements', 'edu'], run: (a, res) => res.insertAdjacentHTML('beforeend', R.education()) },
    contact: { win: 5, alias: ['email', 'hire', 'hello'], run: (a, res) => res.insertAdjacentHTML('beforeend', R.contact()) },
    resume: { win: 5, alias: ['cv'], run: (a, res) => res.insertAdjacentHTML('beforeend', '<p>résumé → <a class="btn" href="https://github.com/pratik9696/resume/blob/HEAD/Pratik_Kotkar_AI_ML_Eng.pdf" target="_blank" rel="noopener">open Pratik_Kotkar_AI_ML_Eng.pdf ↗</a></p>') },
    theme: { win: null, alias: [], run: (a, res) => {
      const n = (a[0] || '').toLowerCase();
      if (n && !THEMES.includes(n)) { res.insertAdjacentHTML('beforeend', `<p class="err">theme: unknown theme "${esc(n)}"</p>${R.theme(curTheme())}`); return; }
      if (n) setTheme(n);
      res.insertAdjacentHTML('beforeend', R.theme(curTheme()));
    } },
    help: { win: null, alias: ['?', 'commands'], run: (a, res) => res.insertAdjacentHTML('beforeend', R.help()) },
    ls: { win: null, alias: ['dir'], run: (a, res) => res.insertAdjacentHTML('beforeend', `<p>${['about.txt', 'impact.diff', 'timeline/', 'projects/', 'experience.log', 'skills/', 'education.txt', 'contact.txt', 'resume.pdf'].map((f) => {
      const m = { 'about.txt': 'whoami', 'impact.diff': 'impact', 'timeline/': 'timeline', 'projects/': 'projects', 'experience.log': 'log', 'skills/': 'skills', 'education.txt': 'education', 'contact.txt': 'contact', 'resume.pdf': 'resume' }[f];
      return `<button type="button" class="cmdlink${f.endsWith('/') ? '' : ''}" data-cmd="${m}">${f}</button>`; }).join('&nbsp;&nbsp;&nbsp;')}</p>`) },
    clear: { win: null, alias: ['cls'], run: () => {} },
    history: { win: null, alias: [], run: (a, res) => res.insertAdjacentHTML('beforeend', hist.length ? hist.map((h, i) => `<div><span class="dim">${String(i + 1).padStart(3)}</span> ${link(h)}</div>`).join('') : '<p class="dim">nothing yet</p>') },
    tour: { win: null, alias: [], run: () => {} },
    pwd: { win: null, alias: [], run: (a, res) => res.insertAdjacentHTML('beforeend', '<p>/home/pratik/portfolio</p>') },
    whoareyou: { win: null, alias: [], run: (a, res) => res.insertAdjacentHTML('beforeend', '<p>a data scientist who prefers ' + link('open ezquote', 'systems with a human approval step') + '.</p>') }
  };
  const NAMES = Object.keys(CMDS).filter((k) => k !== 'whoareyou');
  const resolve = (name) => CMDS[name] ? name : Object.keys(CMDS).find((k) => CMDS[k].alias.includes(name));

  function notFound(res, typed, pool, msg) {
    const best = pool.map((n) => [n, lev(typed.split(' ').pop(), n)]).sort((a, b) => a[1] - b[1])[0];
    res.insertAdjacentHTML('beforeend', `<p class="err">${msg || `zsh: command not found: ${esc(typed)}`}</p>${best && best[1] <= 3 ? `<p class="sugg">did you mean ${link(typed.includes(' ') ? typed.split(' ').slice(0, -1).join(' ') + ' ' + best[0] : best[0])}?</p>` : ''}<p class="dim">type ${link('help')} to see what works.</p>`);
  }

  /* ======================================================= terminal engine */
  const hist = []; let hIdx = 0, busy = false, win = 0, cancelTour = false;
  function setWin(i) { win = i; $$('.win').forEach((b, j) => b.classList.toggle('cur', j === i)); }
  $('#wins').innerHTML = WINS.map(([l, c], i) => `<button type="button" class="win${i === 0 ? ' cur' : ''}" data-cmd="${c}">${l}</button>`).join('');
  $('#chips').innerHTML = ['whoami', 'impact', 'timeline', 'projects', 'log', 'skills', 'contact', 'help'].map((c) => `<button type="button" class="chip" data-cmd="${c}">${c}</button>`).join('') + '<button type="button" class="chip hot" data-cmd="tour">▶ tour</button>';
  const tick = () => { $('#clock').textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }; tick(); setInterval(tick, 20000);

  function scrollTo(entry, long) {
    const go = () => { const top = long ? entry.offsetTop - 12 : sc.scrollHeight; sc.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' }); };
    requestAnimationFrame(go); setTimeout(go, 450); // again after charts/tables settle
  }

  function newEntry(raw) {
    const e = document.createElement('div'); e.className = 'entry';
    e.innerHTML = `<div class="echo"><span class="ps1">${PS1}</span><span class="cmd">${esc(raw)}</span></div><div class="res"></div>`;
    out.appendChild(e); return e;
  }

  async function exec(raw, silent) {
    raw = raw.trim();
    if (!raw) { if (!silent) newEntry(''); scrollTo(out.lastElementChild, false); return; }
    if (hist[hist.length - 1] !== raw) hist.push(raw); hIdx = hist.length;
    const entry = newEntry(raw), res = $('.res', entry);
    let t = raw.split(/\s+/); let name = t[0].toLowerCase(), args = t.slice(1);
    // filesystem-flavoured shortcuts
    const FILES = { 'about.txt': 'whoami', 'impact.diff': 'impact', 'contact.txt': 'contact', 'experience.log': 'log', 'education.txt': 'education', 'achievements.txt': 'education', 'resume.pdf': 'resume' };
    const DIRS = { projects: 'projects', skills: 'skills', timeline: 'timeline' };
    if (name === 'cat' && args[0]) { const f = args[0].toLowerCase(); if (FILES[f]) { name = FILES[f]; args = []; } else if (byId(f)) { name = 'open'; } }
    else if ((name === 'cd' || name === 'ls') && args[0]) { const d = args[0].replace(/\/$/, '').toLowerCase(); if (DIRS[d]) { name = DIRS[d]; args = []; } else if (name === 'cd') { res.insertAdjacentHTML('beforeend', `<p class="err">cd: no such directory: ${esc(args[0])}</p>`); scrollTo(entry, false); return; } }
    else if (name === 'git' && args[0] === 'log') { name = 'log'; args = []; }
    else if (name === 'sudo') {
      res.insertAdjacentHTML('beforeend', `<p class="dim">[sudo] password for recruiter: ********</p>`);
      await sleep(500);
      res.insertAdjacentHTML('beforeend', `<p class="grn">✓ permission granted. Nice move.</p><div class="btnrow"><a class="btn" href="mailto:pratikkotkar9696@gmail.com">draft the email →</a>${link('contact')}</div>`);
      scrollTo(entry, false); setWin(5); return;
    } else if (name === 'rm') { res.insertAdjacentHTML('beforeend', '<p class="err">rm: refusing to delete a portfolio. nice try.</p>'); scrollTo(entry, false); return; }
    else if (name === 'exit' || name === 'quit' || name === ':q') { res.insertAdjacentHTML('beforeend', '<p class="dim">there is no exit. but there is a ' + link('contact') + '.</p>'); scrollTo(entry, false); return; }
    else if (name === 'vim' || name === 'nano' || name === 'emacs') { res.insertAdjacentHTML('beforeend', '<p class="dim">opinions on editors available on request.</p>'); scrollTo(entry, false); return; }

    const key = resolve(name);
    if (!key) { notFound(res, name, [...NAMES, ...Object.values(CMDS).flatMap((c) => c.alias)]); scrollTo(entry, false); return; }
    if (key === 'clear') { out.innerHTML = ''; return; }
    if (key === 'tour') { await tour(); return; }
    const c = CMDS[key];
    c.run(args, res);
    if (c.win != null) setWin(c.win);
    scrollTo(entry, ['timeline', 'forecast', 'projects', 'open', 'log', 'skills', 'impact', 'whoami', 'help', 'education', 'contact'].includes(key));
  }

  /* typing a command into the live prompt, then running it */
  async function typeCmd(text, speed = 22) {
    busy = true; promptEl.classList.add('typing');
    for (let i = 1; i <= text.length; i++) { inp.value = text.slice(0, i); draw(); await sleep(speed); }
    await sleep(180); inp.value = ''; draw(); promptEl.classList.remove('typing');
    await exec(text); busy = false;
  }
  async function tour() {
    cancelTour = false; busy = true;
    for (const c of ['whoami', 'impact', 'timeline', 'projects', 'open ezquote', 'log', 'skills', 'contact']) {
      if (cancelTour) break;
      busy = false; await typeCmd(c, 28); busy = true; await sleep(1500);
    }
    busy = false;
  }

  /* ======================================================= prompt rendering + autocomplete */
  const pb = $('#pb'), pc = $('#pc'), pa = $('#pa'), pg = $('#pg');
  function complete(v) {
    if (!v) return '';
    const parts = v.split(/\s+/), last = parts[parts.length - 1], first = parts[0].toLowerCase();
    let pool;
    if (parts.length === 1) pool = [...NAMES, 'sudo hire-me', 'git log', 'cat about.txt'];
    else if (['open', 'man'].includes(first) || (first === 'cat' && parts.length === 2)) pool = PROJECTS.map((p) => p.id).concat(first === 'cat' ? ['about.txt', 'contact.txt', 'experience.log', 'education.txt', 'impact.diff'] : []);
    else if (first === 'projects') pool = ['--ai', '--prod', '--app', '--ml', '--all'];
    else if (first === 'theme') pool = THEMES;
    else if (first === 'cd' || first === 'ls') pool = ['projects/', 'skills/', 'timeline/'];
    else return '';
    const cand = pool.find((n) => n.toLowerCase().startsWith(last.toLowerCase()) && n.toLowerCase() !== last.toLowerCase());
    return cand ? cand.slice(last.length) : '';
  }
  function draw() {
    const v = inp.value, pos = inp.selectionStart == null ? v.length : inp.selectionStart;
    pb.textContent = v.slice(0, pos); pc.textContent = v[pos] || ' '; pa.textContent = v.slice(pos + 1);
    pg.textContent = pos >= v.length ? complete(v) : '';
  }
  ['input', 'keyup', 'click', 'select', 'focus'].forEach((ev) => inp.addEventListener(ev, draw));
  document.addEventListener('selectionchange', () => { if (document.activeElement === inp) draw(); });
  promptEl.addEventListener('pointerdown', () => { if (!busy) inp.focus(); });

  inp.addEventListener('keydown', async (e) => {
    cancelTour = true;
    if (busy) { e.preventDefault(); return; }
    if (e.key === 'Enter') { e.preventDefault(); const v = inp.value; inp.value = ''; draw(); await exec(v); }
    else if (e.key === 'Tab') { e.preventDefault(); const g = complete(inp.value); if (g) { inp.value += g; draw(); } }
    else if (e.key === 'ArrowUp') { e.preventDefault(); if (hist.length) { hIdx = Math.max(0, hIdx - 1); inp.value = hist[hIdx] || ''; draw(); } }
    else if (e.key === 'ArrowDown') { e.preventDefault(); hIdx = Math.min(hist.length, hIdx + 1); inp.value = hist[hIdx] || ''; draw(); }
    else if (e.key === 'l' && e.ctrlKey) { e.preventDefault(); out.innerHTML = ''; }
    else if (e.key === 'c' && e.ctrlKey) { e.preventDefault(); const en = newEntry(inp.value + '^C'); inp.value = ''; draw(); scrollTo(en, false); }
    else if (e.key === 'ArrowRight' && inp.selectionStart === inp.value.length) { const g = complete(inp.value); if (g) { e.preventDefault(); inp.value += g; draw(); } }
  });

  // anywhere on the page: typing focuses the prompt; clicks on command links run them
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') cancelTour = true;
    if (document.activeElement === inp || e.metaKey || e.ctrlKey || e.altKey || busy) return;
    const tag = document.activeElement && document.activeElement.tagName;
    if ((e.key === 'Enter' || e.key === ' ') && document.activeElement && document.activeElement.matches('[data-cmd]')) return;
    if (/^(INPUT|TEXTAREA)$/.test(tag)) return;
    if (e.key.length === 1 && !getSelection().toString()) { inp.focus(); }
  });
  document.addEventListener('click', (e) => {
    const cp = e.target.closest('[data-copy]');
    if (cp) { try { navigator.clipboard.writeText(cp.dataset.copy); cp.textContent = 'copied ✓'; setTimeout(() => (cp.textContent = 'copy'), 1500); } catch (x) {} return; }
    const t = e.target.closest('[data-cmd]'); if (!t || e.target.closest('a')) return;
    cancelTour = true; e.preventDefault(); if (busy) return;
    typeCmd(t.dataset.cmd, 16);
  });
  document.addEventListener('keydown', (e) => {
    const t = document.activeElement;
    if ((e.key === 'Enter' || e.key === ' ') && t && t.matches('tr[data-cmd]')) { e.preventDefault(); if (!busy) typeCmd(t.dataset.cmd, 16); }
  });

  /* ======================================================= boot */
  async function boot() {
    const lines = [
      ['pk-os 8.2 · tty1 · bangalore', ''], ['mount /experience', '8y'], ['mount /projects', PROJECTS.length + ' case files'], ['start agents.service', '5/5 online'], ['link github.com/pratik9896', 'ok']
    ];
    const el = document.createElement('div'); el.className = 'boot'; out.appendChild(el);
    for (const [l, v] of lines) {
      el.insertAdjacentHTML('beforeend', v ? `<div><span class="ok">[  ok  ]</span> ${esc(l)} <span class="dim">${'.'.repeat(Math.max(2, 30 - l.length))}</span> ${esc(v)}</div>` : `<div>${esc(l)}</div>`);
      await sleep(110);
    }
    await sleep(250);
    busy = true; await typeCmd('whoami', 70);
    await sleep(350); await typeCmd('impact', 55);
    out.lastElementChild.insertAdjacentHTML('beforeend', `<p class="note" style="margin-top:1rem">type ${link('help')}, click a command below, or take the ${link('tour', 'tour ▶')}.</p>`);
    busy = false;
    if (!touch) inp.focus();
  }
  draw(); boot();
})();
