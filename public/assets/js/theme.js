/* Single source of truth for appearance. Loaded synchronously in <head> so saved settings apply before first paint. */
(() => {
  const CONFIG = {
    storageKey: 'admin.prefs.v2',
    tabletBreakpoint: 1100,
    defaults: { theme: 'system', accentColor: 'violet', density: 'comfortable', sidebar: 'expanded', contentWidth: 'default', cornerRadius: 'medium', typography: 'default', animations: 'on', shadows: 'on', reducedMotion: 'off' },
    allowed: {
      theme: ['light', 'dark', 'system'], accentColor: ['blue', 'green', 'purple', 'violet', 'red', 'orange'],
      density: ['compact', 'comfortable', 'spacious'], sidebar: ['expanded', 'collapsed'], contentWidth: ['default', 'wide', 'full'],
      cornerRadius: ['sharp', 'small', 'medium', 'rounded'], typography: ['small', 'default', 'large'],
      animations: ['on', 'off'], shadows: ['on', 'off'], reducedMotion: ['on', 'off']
    },
    // preference key -> <html data-*> attribute
    attr: { accentColor: 'accent', density: 'density', sidebar: 'sidebar', contentWidth: 'width', cornerRadius: 'radius', typography: 'type', animations: 'animations', shadows: 'shadows', reducedMotion: 'reduced' }
  };
  let prefs = { ...CONFIG.defaults }, stored = null;
  try { stored = JSON.parse(localStorage.getItem(CONFIG.storageKey)); } catch (e) {}
  if (stored && typeof stored === 'object') {
    for (const k in CONFIG.defaults) if (CONFIG.allowed[k].includes(stored[k])) prefs[k] = stored[k];
  } else if (innerWidth < CONFIG.tabletBreakpoint) prefs.sidebar = 'collapsed';
  const mq = matchMedia('(prefers-color-scheme: dark)'), root = document.documentElement;
  const apply = () => {
    root.classList.toggle('dark', prefs.theme === 'dark' || (prefs.theme === 'system' && mq.matches));
    for (const k in CONFIG.attr) root.dataset[CONFIG.attr[k]] = prefs[k];
  };
  const save = () => { try { localStorage.setItem(CONFIG.storageKey, JSON.stringify(prefs)); } catch (e) {} };
  const notify = () => document.dispatchEvent(new CustomEvent('prefs:change'));
  mq.addEventListener('change', () => { if (prefs.theme === 'system') { apply(); notify(); } });
  window.AdminPrefs = {
    get: k => prefs[k],
    set(k, v) { if (CONFIG.allowed[k] && CONFIG.allowed[k].includes(v)) { prefs[k] = v; apply(); save(); notify(); } },
    reset() { prefs = { ...CONFIG.defaults }; apply(); save(); notify(); }
  };
  apply();
})();
