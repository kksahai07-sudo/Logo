/* Sidebar: active state (navigation), accordion groups, collapse, mobile drawer, floating submenu. */
(() => {
  const root = document.documentElement;
  const sb = document.getElementById('sidebar'), fly = document.getElementById('flyout');
  if (!sb || !fly) return;
  const CONFIG = { closeDelay: 200, mobileQuery: '(max-width:900px)', hoverDelay: 90, tipDelay: 300 }; // keep in sync with the 900px media queries in components.css
  const isMobile = () => matchMedia(CONFIG.mobileQuery).matches;
  const isCollapsed = () => !isMobile() && root.dataset.sidebar === 'collapsed';
  // Drawer state only exists in the mobile layout; the closed drawer is inert so offscreen links are not focusable.
  const setDrawer = on => { root.dataset.drawer = on ? 'open' : ''; sb.inert = isMobile() && !on; };
  const layoutMq = matchMedia(CONFIG.mobileQuery);
  const links = [...sb.querySelectorAll('a.nl')];
  const motionOk = () => root.dataset.animations !== 'off' && root.dataset.reduced !== 'on' && !matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Opens/closes one branch; animate=true tweens the submenu height (skipped when motion is reduced or disabled).
  function setOpen(li, on, animate = false) {
    const btn = li.querySelector(':scope>.nl'), sub = li.querySelector(':scope>.sub');
    const was = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(on));
    sub.style.cssText = '';
    if (!animate || was === on || !motionOk()) { li.classList.toggle('open', on); return; }
    sub.style.overflow = 'hidden';
    if (on) { li.classList.add('open'); const h = sub.scrollHeight; sub.style.height = '0px'; sub.offsetHeight; sub.style.height = h + 'px'; }
    else { sub.style.height = sub.offsetHeight + 'px'; sub.offsetHeight; sub.style.height = '0px'; }
    let finished = false;
    const finish = () => { if (finished) return; finished = true; sub.style.cssText = ''; if (!on) li.classList.remove('open'); };
    sub.addEventListener('transitionend', e => { if (e.target === sub) finish(); }, { once: true });
    setTimeout(finish, 400);
  }

  function markActive() {
    const page = location.pathname.split('/').pop() || 'index.html';
    links.forEach(a => a.removeAttribute('aria-current'));
    sb.querySelectorAll('li.group').forEach(li => { li.classList.remove('has-active'); setOpen(li, false); });
    const here = links.filter(a => a.getAttribute('href').split('#')[0] === page);
    const cur = here.find(a => a.hash && a.hash === location.hash) || here[0];
    if (!cur) return;
    cur.setAttribute('aria-current', 'page');
    for (let g = cur.closest('li.group'); g; g = g.parentElement.closest('li.group')) { g.classList.add('has-active'); setOpen(g, true); }
  }

  let timer, subTimer, tipTimer;
  const tip = document.getElementById('nav-tip');
  const panels = [];   // open cascading panels; panels[0] belongs to the hovered sidebar icon
  const hideTip = () => { clearTimeout(tipTimer); if (tip) tip.hidden = true; };
  const closePanelsFrom = n => { while (panels.length > n) panels.pop().remove(); };
  const closeFly = () => { clearTimeout(subTimer); closePanelsFrom(0); fly.hidden = true; };
  const closeLater = () => { clearTimeout(timer); timer = setTimeout(closeFly, CONFIG.closeDelay); };
  // Builds one panel from a nested <ul class="sub"> in the sidebar markup (any depth, no per-menu logic).
  function showPanel(depth, srcUl, anchor, title) {
    clearTimeout(timer); closePanelsFrom(depth); hideTip();
    const panel = document.createElement('div');
    panel.className = 'fp'; panel.setAttribute('role', 'menu');
    if (title) { const h = document.createElement('div'); h.className = 'fp-title'; h.textContent = title; panel.append(h); }
    const list = srcUl.cloneNode(true);
    list.classList.replace('sub', 'fp-list');
    list.querySelectorAll('.open').forEach(n => n.classList.remove('open'));
    panel.append(list);
    fly.hidden = false; fly.append(panel); panels.push(panel);
    const prev = panels[depth - 1], r = panel.getBoundingClientRect();
    let left = prev ? prev.getBoundingClientRect().right - 2 : sb.getBoundingClientRect().right;
    if (left + r.width > innerWidth - 8) left = (prev ? prev.getBoundingClientRect().left + 2 : left) - r.width;   // flip to the left edge
    panel.style.left = Math.max(8, left) + 'px';
    panel.style.top = Math.max(8, Math.min(anchor.top - 6, innerHeight - r.height - 8)) + 'px';
    panel.style.maxHeight = innerHeight - 16 + 'px';
    return panel;
  }
  function openFly(btn, focus) {
    const label = btn.querySelector('.label').textContent;
    if (panels[0] && panels[0].dataset.for === label) { clearTimeout(timer); return; }
    const p = showPanel(0, btn.closest('li').querySelector(':scope>.sub'), btn.getBoundingClientRect(), label);
    p.dataset.for = label;
    if (focus) p.querySelector('.nl')?.focus();
  }
  function showTip(row) {   // one plain tooltip, only for collapsed icons without children
    hideTip();
    tipTimer = setTimeout(() => {
      tip.textContent = row.querySelector('.label').textContent;
      tip.hidden = false;
      const r = row.getBoundingClientRect();
      tip.style.left = r.right + 8 + 'px';
      tip.style.top = r.top + r.height / 2 - tip.offsetHeight / 2 + 'px';
    }, CONFIG.tipDelay);
  }

  sb.addEventListener('click', e => {
    if (isMobile() && e.target.closest('a.nl')) setDrawer(false);
    const btn = e.target.closest('button.nl[aria-expanded]');
    if (btn) {
      if (isCollapsed()) return openFly(btn, e.detail === 0);
      setOpen(btn.closest('li'), btn.getAttribute('aria-expanded') !== 'true', true);   // one handler on the row; the +/− sits inside the button, so no double toggle
    } else if (e.target.closest('[data-dashboard]')) {
      sb.querySelectorAll('li.group.open').forEach(g => setOpen(g, false)); closeFly();
    }
  });
  sb.addEventListener('mouseover', e => {
    if (!isCollapsed() || matchMedia('(hover:none)').matches) return;
    const row = e.target.closest('.nl');
    if (row && row.matches('button[aria-expanded]')) { hideTip(); openFly(row); }
    else if (row) { closeFly(); showTip(row); }   // another icon: switch immediately
    else { hideTip(); closeLater(); }               // rail padding/scrollbar: grace period so the pointer can reach the panel
  });
  sb.addEventListener('mouseleave', () => { hideTip(); closeLater(); });
  fly.addEventListener('mouseenter', () => clearTimeout(timer));
  fly.addEventListener('mouseleave', closeLater);
  // Hovering an item inside a panel opens its child panel after a short delay and closes deeper siblings.
  fly.addEventListener('mouseover', e => {
    const li = e.target.closest('.fp li'), panel = e.target.closest('.fp');
    if (!li || !panel) return;
    clearTimeout(timer); clearTimeout(subTimer);
    const depth = panels.indexOf(panel), row = li.querySelector(':scope>.nl'), sub = li.querySelector(':scope>.sub');
    panel.querySelectorAll('.nl.on').forEach(n => n.classList.remove('on'));
    subTimer = setTimeout(() => {
      closePanelsFrom(depth + 1);
      if (li.classList.contains('group') && sub) { row.classList.add('on'); showPanel(depth + 1, sub, row.getBoundingClientRect()); }
    }, CONFIG.hoverDelay);
  });
  const openChild = row => {   // keyboard / tap equivalent of hover
    const li = row.closest('li'), depth = panels.indexOf(row.closest('.fp'));
    const p = showPanel(depth + 1, li.querySelector(':scope>.sub'), row.getBoundingClientRect());
    row.classList.add('on'); p.querySelector('.nl')?.focus();
  };
  fly.addEventListener('click', e => { const row = e.target.closest('.fp button.nl'); if (row) openChild(row); });
  fly.addEventListener('keydown', e => {
    const row = e.target.closest('.fp .nl');
    if (!row) return;
    const panel = row.closest('.fp'), depth = panels.indexOf(panel);
    if (e.key === 'ArrowRight' && row.matches('button')) { e.preventDefault(); openChild(row); }
    else if (e.key === 'ArrowLeft' && depth > 0) { e.preventDefault(); closePanelsFrom(depth); panels[depth - 1].querySelector('.nl.on')?.focus(); }
    else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const items = [...panel.querySelectorAll(':scope>.fp-list>li>.nl')], i = items.indexOf(row);
      items[(i + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length]?.focus();
    }
  });

  document.addEventListener('click', e => {
    const toggle = e.target.closest('[data-sidebar-toggle]');
    if (toggle) {
      if (isMobile()) setDrawer(root.dataset.drawer !== 'open');
      else {
        if (search && search.value) { search.value = ''; search.dispatchEvent(new Event('input')); }
        AdminPrefs.set('sidebar', root.dataset.sidebar === 'collapsed' ? 'expanded' : 'collapsed'); closeFly();
      }
      return;
    }
    if (!e.target.closest('#flyout, .sb')) { closeFly(); setDrawer(false); }
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeFly(); setDrawer(false); } });
  const search = document.getElementById('nav-search');
  let openSnapshot = null;   // branches that were open before a search started
  const ownLabel = li => li.querySelector(':scope>.nl .label');
  function highlight(label, q) {
    const text = label.dataset.text || (label.dataset.text = label.textContent), i = q ? text.toLowerCase().indexOf(q) : -1;
    if (i < 0) { label.textContent = text; return; }
    const mark = document.createElement('mark');
    mark.textContent = text.slice(i, i + q.length);
    label.replaceChildren(text.slice(0, i), mark, text.slice(i + q.length));
  }
  // Recursive filter: visible if the item, an ancestor or a descendant matches; the path to a match opens.
  function filterItem(li, q, ancestorHit) {
    const label = ownLabel(li), hit = (label.dataset.text || label.textContent).toLowerCase().includes(q);
    const kids = [...li.querySelectorAll(':scope>.sub>li')];
    const anyKid = kids.map(k => filterItem(k, q, ancestorHit || hit)).includes(true);
    li.hidden = !(ancestorHit || hit || anyKid);
    highlight(label, hit ? q : '');
    if (kids.length) setOpen(li, anyKid || hit);
    return !li.hidden;
  }
  search?.addEventListener('input', () => {
    const q = search.value.trim().toLowerCase();
    if (q && !openSnapshot) openSnapshot = [...sb.querySelectorAll('li.group.open')];
    if (!q) {
      sb.querySelectorAll('.sb-nav li, .sb-nav .sec, .sb-nav>ul').forEach(n => { n.hidden = false; });
      sb.querySelectorAll('.label[data-text]').forEach(l => highlight(l, ''));
      markActive();
      (openSnapshot || []).forEach(li => setOpen(li, true));
      openSnapshot = null;
      return;
    }
    sb.querySelectorAll('.sb-nav>ul').forEach(ul => {
      const any = [...ul.children].map(li => filterItem(li, q, false)).includes(true);
      ul.hidden = !any;
      if (ul.previousElementSibling?.classList.contains('sec')) ul.previousElementSibling.hidden = !any;
    });
  });
  const syncLayout = () => { root.dataset.layout = isMobile() ? 'mobile' : 'desktop'; setDrawer(false); closeFly(); };
  layoutMq.addEventListener('change', syncLayout);   // resize, rotate, Desktop Site toggle: never leave stale drawer state
  syncLayout();
  addEventListener('hashchange', markActive);
  markActive();
})();
