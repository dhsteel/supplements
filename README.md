# supplements

Daily supplement checklist, served by GitHub Pages from `main`. Plain HTML/CSS/JS, no build step.

- `routine.js` — the supplement list (edit this to change the routine)
- `app.js` — checklist logic, saved in localStorage
- `style.css` — styles · `index.html` — page markup
- `sw.js` — offline cache (bump `VERSION` to force phones to refresh it)

Debugging: open the app with `?debug` to log `[supp]` lines to the console and get `supp.state()`; `?debug=0` turns it off.
