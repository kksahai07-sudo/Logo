/* Appearance page: option groups ([data-pref]) and switches ([data-toggle]) read/write AdminPrefs (theme.js). */
(() => {
  const P = window.AdminPrefs;
  const groups = [...document.querySelectorAll('[data-pref]')], toggles = [...document.querySelectorAll('[data-toggle]')];
  if (!P || !(groups.length || toggles.length)) return;
  const sync = () => {
    groups.forEach(g => g.querySelectorAll('button[data-value]').forEach(b => b.setAttribute('aria-pressed', String(P.get(g.dataset.pref) === b.dataset.value))));
    toggles.forEach(t => t.setAttribute('aria-checked', String(P.get(t.dataset.toggle) === 'on')));
  };
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-pref] button[data-value]'), t = e.target.closest('[data-toggle]');
    if (b) P.set(b.closest('[data-pref]').dataset.pref, b.dataset.value);
    if (t) P.set(t.dataset.toggle, P.get(t.dataset.toggle) === 'on' ? 'off' : 'on');
    if (e.target.closest('#reset-prefs') && confirm('Reset all appearance preferences to their defaults?')) P.reset();
  });
  document.addEventListener('prefs:change', sync);
  sync();
})();
