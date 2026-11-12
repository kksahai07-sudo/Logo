/* Header: dropdowns, theme shortcut, Ctrl/Cmd+K search, table filter demo. */
(() => {
  // Global search: indexes the sidebar links (label + parent trail), Ctrl/Cmd+K focuses it.
  const sInput = document.getElementById('global-search'), sOut = document.getElementById('search-results');
  if (sInput && sOut) {
    const entries = [...document.querySelectorAll('#sidebar a.nl')].map(a => {
      const trail = [];
      for (let g = a.closest('li').parentElement.closest('li.group'); g; g = g.parentElement.closest('li.group')) trail.unshift(g.querySelector(':scope>.nl .label').textContent);
      return { label: a.querySelector('.label').textContent, href: a.getAttribute('href'), trail: trail.join(' › ') };
    });
    const show = () => {
      const q = sInput.value.trim().toLowerCase();
      sOut.replaceChildren();
      if (!q) { sOut.hidden = true; return; }
      const hits = entries.filter(x => (x.label + ' ' + x.trail).toLowerCase().includes(q)).slice(0, 8);
      if (!hits.length) { const li = document.createElement('li'); li.className = 'muted'; li.style.padding = '8px 10px'; li.textContent = 'No results found'; sOut.append(li); }
      hits.forEach(x => {
        const li = document.createElement('li'), a = document.createElement('a'), small = document.createElement('small');
        a.href = x.href; a.textContent = x.label; small.textContent = x.trail || 'Page'; a.append(small); li.append(a); sOut.append(li);
      });
      sOut.hidden = false;
    };
    sInput.addEventListener('input', show);
    sInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') sOut.querySelector('a')?.click();
      if (e.key === 'ArrowDown') { e.preventDefault(); sOut.querySelector('a')?.focus(); }
    });
    sOut.addEventListener('keydown', e => {
      const links = [...sOut.querySelectorAll('a')], i = links.indexOf(document.activeElement);
      if (e.key === 'ArrowDown') { e.preventDefault(); links[Math.min(i + 1, links.length - 1)]?.focus(); }
      if (e.key === 'ArrowUp') { e.preventDefault(); (links[i - 1] || sInput).focus(); }
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') sOut.hidden = true; });
    document.addEventListener('click', e => { if (!e.target.closest('.search')) sOut.hidden = true; });
  }
  const themeBtn = document.getElementById('theme-shortcut');
  const syncThemeButton = () => {
    if (!themeBtn) return;
    const label = document.documentElement.classList.contains('dark') ? 'Switch to light mode' : 'Switch to dark mode';
    themeBtn.setAttribute('aria-label', label); themeBtn.title = label;
  };
  document.addEventListener('prefs:change', syncThemeButton);
  syncThemeButton();
  const dds = [...document.querySelectorAll('.dd')];
  const closeAll = except => dds.forEach(d => { if (d !== except) { d.classList.remove('open'); d.querySelector('[aria-haspopup]')?.setAttribute('aria-expanded', 'false'); } });
  const items = d => [...d.querySelectorAll('.dd-menu a, .dd-menu button')];
  document.addEventListener('click', e => {
    const dd = e.target.closest('.dd'), trigger = e.target.closest('.dd > [aria-haspopup]');
    if (trigger) {
      const open = !dd.classList.contains('open');
      closeAll(dd); dd.classList.toggle('open', open); trigger.setAttribute('aria-expanded', String(open));
      if (open && e.detail === 0) items(dd)[0]?.focus();
    } else if (!dd) closeAll();
    if (e.target.closest('#mark-read')) {
      document.querySelectorAll('.ntf.unread').forEach(n => n.classList.remove('unread'));
      document.getElementById('ntf-dot')?.remove();
    }
    // One click always flips the *visible* theme (System resolves to light or dark first); System is chosen on the Appearance page.
    if (e.target.closest('#theme-shortcut')) AdminPrefs.set('theme', document.documentElement.classList.contains('dark') ? 'light' : 'dark');
  });
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); document.getElementById('global-search')?.focus(); }
    const open = dds.find(d => d.classList.contains('open'));
    if (!open) return;
    if (e.key === 'Escape') { closeAll(); open.querySelector('[aria-haspopup]').focus(); }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const list = items(open), i = list.indexOf(document.activeElement);
      list[(i + (e.key === 'ArrowDown' ? 1 : -1) + list.length) % list.length]?.focus();
    }
  });
  document.addEventListener('input', e => {
    const input = e.target.closest('[data-filter-table]');
    if (!input) return;
    const q = input.value.toLowerCase();
    document.querySelectorAll(`#${input.dataset.filterTable} tbody tr`).forEach(r => { r.hidden = !r.textContent.toLowerCase().includes(q); });
  });
})();
