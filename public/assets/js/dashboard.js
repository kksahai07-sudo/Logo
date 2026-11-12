/* Dashboard: native SVG revenue chart with daily / weekly / monthly views (demo data, $ thousands). */
(() => {
  const box = document.getElementById('revenue-chart');
  if (!box) return;
  const CONFIG = { w: 640, h: 240, l: 44, r: 12, t: 12, b: 28, maxLabels: 8 };
  const seq = (p, n) => Array.from({ length: n }, (_, i) => p + (i + 1));
  const DATA = {
    day: { labels: seq('Day ', 14), values: [3.2, 3.8, 3.1, 4.2, 4.6, 3.9, 5.1, 4.4, 4.8, 5.3, 4.9, 5.8, 5.4, 6.1] },
    week: { labels: seq('Wk ', 12), values: [22, 25, 24, 28, 27, 31, 30, 34, 33, 37, 36, 41] },
    month: { labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], values: [78, 82, 80, 91, 95, 99, 104, 101, 110, 118, 121, 128] }
  };
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, attrs = {}, text) => {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (text != null) n.textContent = text;
    return n;
  };
  function render(period) {
    const { labels, values } = DATA[period], { w, h, l, r, t, b } = CONFIG;
    const max = Math.ceil(Math.max(...values) * 1.1);
    const x = i => l + i * (w - l - r) / (values.length - 1), y = v => t + (h - t - b) * (1 - v / max);
    const svg = el('svg', { viewBox: `0 0 ${w} ${h}`, role: 'img', 'aria-label': `Revenue, ${period} view` });
    for (let i = 0; i <= 4; i++) {
      const v = max * i / 4;
      svg.append(el('line', { x1: l, x2: w - r, y1: y(v), y2: y(v), stroke: 'var(--border)' }),
        el('text', { x: l - 6, y: y(v) + 4, 'text-anchor': 'end', 'font-size': 11, fill: 'var(--muted)' }, `$${Math.round(v)}k`));
    }
    const pts = values.map((v, i) => `${x(i)},${y(v)}`).join(' ');
    svg.append(el('polygon', { points: `${x(0)},${y(0)} ${pts} ${x(values.length - 1)},${y(0)}`, fill: 'var(--brand)', opacity: .12 }),
      el('polyline', { points: pts, fill: 'none', stroke: 'var(--brand)', 'stroke-width': 2.5, 'stroke-linejoin': 'round' }));
    values.forEach((v, i) => {
      const c = el('circle', { cx: x(i), cy: y(v), r: 4, fill: 'var(--brand)' });
      c.append(el('title', {}, `${labels[i]}: $${v}k`));
      svg.append(c);
      if (i % Math.ceil(values.length / CONFIG.maxLabels) === 0)
        svg.append(el('text', { x: x(i), y: h - 8, 'text-anchor': 'middle', 'font-size': 11, fill: 'var(--muted)' }, labels[i]));
    });
    box.replaceChildren(svg);
  }
  const seg = document.getElementById('period-seg');
  seg?.addEventListener('click', e => {
    const b = e.target.closest('button[data-period]');
    if (!b) return;
    seg.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    render(b.dataset.period);
  });
  render('month');
})();

/* Welcome line, KPI sparklines and the interactive todo list. */
(() => {
  const welcome = document.getElementById('welcome');
  if (welcome) {
    const now = new Date(), h = now.getHours();
    const greet = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
    welcome.textContent = `${greet}, Krishna 👋 — ${now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}`;
  }
  const SPARK = { w: 90, h: 36 };
  const mk = (tag, a) => { const n = document.createElementNS('http://www.w3.org/2000/svg', tag); for (const k in a) n.setAttribute(k, a[k]); return n; };
  document.querySelectorAll('svg.spark').forEach(svg => {
    const v = svg.dataset.spark.split(',').map(Number), max = Math.max(...v), min = Math.min(...v);
    const pts = v.map((n, i) => `${i * SPARK.w / (v.length - 1)},${SPARK.h - 2 - (n - min) / (max - min || 1) * (SPARK.h - 6)}`).join(' ');
    const color = svg.dataset.trend === 'up' ? '#16A34A' : '#DC2626';
    svg.setAttribute('viewBox', `0 0 ${SPARK.w} ${SPARK.h}`);
    svg.append(mk('polygon', { points: `0,${SPARK.h} ${pts} ${SPARK.w},${SPARK.h}`, fill: color, opacity: .18 }), mk('polyline', { points: pts, fill: 'none', stroke: color, 'stroke-width': 1.8 }));
  });
  const list = document.getElementById('todo-list');
  if (!list) return;
  const TODO = { key: 'admin.todos', defaults: [{ t: 'Review Q3 marketing budget', d: 0 }, { t: 'Approve new product listing: Aria Desk Lamp', d: 0 }, { t: 'Sync with design on dashboard v2', d: 1 }, { t: 'Reply to enterprise support ticket #482', d: 0 }] };
  let tasks = null;
  try { tasks = JSON.parse(localStorage.getItem(TODO.key)); } catch (e) {}
  if (!Array.isArray(tasks)) tasks = TODO.defaults.map(x => ({ ...x }));
  const save = () => { try { localStorage.setItem(TODO.key, JSON.stringify(tasks)); } catch (e) {} };
  const count = document.getElementById('todo-count'), form = document.getElementById('todo-form'), input = document.getElementById('todo-input'), tpl = document.getElementById('todo-tpl');
  function render() {
    const rows = tasks.map((task, i) => {
      const row = tpl.content.firstElementChild.cloneNode(true);
      row.dataset.i = i; row.classList.toggle('done', !!task.d);
      row.querySelector('input').checked = !!task.d;
      row.querySelector('span').textContent = task.t;
      return row;
    });
    list.replaceChildren(...rows);
    if (!rows.length) { const p = document.createElement('p'); p.className = 'muted'; p.textContent = 'No tasks yet.'; list.append(p); }
    count.textContent = tasks.filter(t => !t.d).length;
  }
  list.addEventListener('change', e => { tasks[e.target.closest('.todo').dataset.i].d = e.target.checked ? 1 : 0; save(); render(); });
  list.addEventListener('click', e => { const del = e.target.closest('.todo-del'); if (del) { tasks.splice(+del.closest('.todo').dataset.i, 1); save(); render(); } });
  document.getElementById('todo-add').addEventListener('click', () => { form.hidden = !form.hidden; if (!form.hidden) input.focus(); });
  form.addEventListener('submit', e => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    tasks.unshift({ t: text, d: 0 }); save(); input.value = ''; render();
  });
  render();
})();
