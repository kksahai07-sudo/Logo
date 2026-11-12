# AdminKit — Admin Dashboard (HTML + Tailwind CDN + CSS + Vanilla JS)

## Structure
- `public/assets/css`: `theme.css` (design tokens, light/dark, brand/density/radius/font), `app.css` (base styles), `components.css` (shell, sidebar, header, cards, tables, forms).
- `public/assets/js`: `theme.js` (loads in `<head>`; Light/Dark/System, brand, persistence, CONFIG), `sidebar.js` (collapse, accordion, floating submenu, drawer, active state), `header.js` (dropdowns, Ctrl/Cmd+K, theme shortcut, table filter), `appearance.js`, `dashboard.js` (SVG chart). `navigation.js` and `app.js` are placeholders.
- `src/components` and `src/pages`: editable source markup. `dist/`: complete pages, each embedding header, sidebar, page content and footer (marked with `<!-- X:start/end -->`).

## Updating shared components
Edit `src/components/*.html`, then paste the new markup between the matching marker comments in every `dist/*.html`. Nothing is fetched at runtime.

## Run
Open the project in VS Code and use Live Server on `dist/index.html`, or serve the folder with any static HTTP server (for example `python3 -m http.server` from `Admin-Dashboard/`, then open `/dist/`).

## External resources
Tailwind Play CDN (`cdn.tailwindcss.com`, pinned 3.4.17). It is for development/prototyping only; replace it with a compiled stylesheet in production (e.g. via Laravel's asset pipeline).

## Laravel later
`dist/index.html` → `dashboard.blade.php`, `sidebar.html` → `partials/sidebar.blade.php`, `header.html` → `partials/header.blade.php`, `footer.html` → `partials/footer.blade.php`, `appearance.html` → `settings/appearance.blade.php`. Move `public/assets` into Laravel's `public/`.

## Navigation
Collapsed desktop sidebar: hovering an icon opens cascading menus built from the nested sidebar HTML (any depth). Timings live in the CONFIG object at the top of sidebar.js (closeDelay, hoverDelay, tipDelay).

## Preferences
All appearance settings live in one object (`AdminPrefs` in theme.js, localStorage key `admin.prefs.v2`). Edit its CONFIG to change defaults.

## Notes
All data is demo data; logout, forms and actions are frontend demonstrations only.
