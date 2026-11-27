// Daily supplements checklist. The routine itself lives in routine.js, styles in style.css.
// Saved state (localStorage, JSON): supp-day-YYYY-MM-DD, supp-gym-YYYY-MM-DD,
// supp-week-<Monday's date>, supp-settings. Keep these keys so saved checks survive.
// Debugging: open the app with ?debug to log [supp] lines to the console (sticks until ?debug=0).
(() => {
  const $ = (id) => document.getElementById(id);
  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const CHIP_ORDER = [1, 2, 3, 4, 5, 6, 0];
  const IRON_START = Date.UTC(2026, 10, 18) / 864e5; // Wed Nov 18, 2026 = iron day

  // --- Debug logging: quiet unless turned on ---
  const q = new URLSearchParams(location.search);
  let DEBUG = q.has('debug') && q.get('debug') !== '0';
  try {
    if (q.has('debug')) DEBUG ? localStorage.setItem('supp-debug', '1') : localStorage.removeItem('supp-debug');
    DEBUG = localStorage.getItem('supp-debug') === '1';
  } catch {}
  const log = (...a) => DEBUG && console.log('[supp]', ...a);

  // --- Storage, with an in-memory fallback when localStorage is blocked ---
  const mem = {};
  const get = (k, d) => {
    try {
      const v = JSON.parse(localStorage.getItem(k));
      if (v != null) return v;
    } catch (e) { log('read failed', k, e.message); }
    return mem[k] ?? d;
  };
  const set = (k, v) => {
    mem[k] = v;
    try { localStorage.setItem(k, JSON.stringify(v)); log('saved', k, v); }
    catch (e) { log('save failed (memory only)', k, e.message); }
  };

  // --- Dates and schedule ---
  const pad = (n) => String(n).padStart(2, '0');
  const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const dayNum = (d) => Math.round(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 864e5);

  const settings = get('supp-settings', { gymDays: [1, 2, 4, 5], offset: 0 });
  if (!settings.v2) { Object.assign(settings, { gymDays: [1, 2, 4, 5], v2: true }); set('supp-settings', settings); }

  const mineralFor = (d) => (((dayNum(d) - IRON_START + settings.offset) % 2) + 2) % 2 === 0 ? 'iron' : 'zinc';
  const defaultGym = (d) => settings.gymDays.includes(d.getDay());
  const gymToday = () => (typeof gymSet === 'boolean' ? gymSet : defaultGym(now));
  const isActive = (only) => !only || (only === 'gym' ? gymToday() : only === 'sunday' ? now.getDay() === 0 : only === mineralFor(now));

  // --- Build the checklist from routine.js ---
  const mk = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  };
  const slots = [], rows = [];
  for (const slot of window.ROUTINE ?? []) {
    const s = mk('div', 'slot'), h = mk('header');
    h.append(mk('h2', null, slot.title));
    if (slot.note) h.append(mk('p', null, slot.note));
    s.append(h);
    const labels = [];
    for (const it of slot.items ?? []) {
      const label = mk('label', 'item'), cb = mk('input'), b = mk('b', null, it.name), txt = mk('div');
      if (it.when) label.dataset.only = it.when;
      cb.type = 'checkbox';
      cb.dataset.id = it.id;
      if (it.weekly) cb.dataset.weekly = '1';
      if (it.tag) b.append(' ', mk('em', 'tag t-week', it.tag));
      txt.append(b);
      if (it.note) txt.append(mk('span', null, it.note));
      label.append(cb, txt);
      s.append(label);
      labels.push(label);
      rows.push({ id: it.id, only: it.when, weekly: !!it.weekly, cb, label });
    }
    $('slots').append(s);
    if (labels.length) slots.push({ el: s, labels });
  }
  log('routine loaded', rows.length, 'items');

  // --- Everything that depends on "today", re-run when the date changes ---
  let now, mon, dayKey, gymKey, weekKey, day, gymSet, week;
  function loadDay() {
    now = new Date();
    dayKey = `supp-day-${ymd(now)}`;
    gymKey = `supp-gym-${ymd(now)}`;
    mon = new Date(now);
    mon.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    weekKey = `supp-week-${ymd(mon)}`;
    day = get(dayKey, {});
    gymSet = get(gymKey, null);
    week = get(weekKey, {});
    $('today').textContent = now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
    for (const r of rows) r.cb.checked = !!(r.weekly ? week : day)[r.id];
    log('day loaded', { date: ymd(now), mineral: mineralFor(now), gym: gymToday(), day, week, settings });
  }

  function render() {
    const m = mineralFor(now), gym = gymToday();
    const pill = $('mineralPill');
    pill.textContent = m === 'iron' ? 'Iron day' : 'Zinc day';
    pill.className = `pill p-${m}`;
    $('gymToggle').checked = gym;
    $('gymHint').textContent = gym ? 'Electrolytes added to today.' : 'Turn on to add electrolytes.';

    for (const r of rows) if (r.only) r.label.classList.toggle('hidden', !isActive(r.only));
    for (const { el, labels } of slots) {
      let first = true;
      for (const l of labels) {
        if (l.classList.contains('hidden')) continue;
        l.classList.toggle('first', first);
        first = false;
      }
      el.classList.toggle('hidden', first);
    }

    const daily = rows.filter((r) => isActive(r.only));
    const n = daily.filter((r) => r.cb.checked).length;
    $('count').textContent = `${n} of ${daily.length} done today`;
    $('fill').style.width = `${daily.length ? (n / daily.length) * 100 : 0}%`;
    for (const r of rows) r.label.classList.toggle('done', r.cb.checked);

    renderWeek('wk0', 0);
    renderWeek('wk1', 7);
    $('gymDays').innerHTML = CHIP_ORDER.map((wd) => `<button class="chip${settings.gymDays.includes(wd) ? ' on' : ''}">${DAYS[wd]}</button>`).join('');
  }

  function renderWeek(id, shift) {
    $(id).innerHTML = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(mon);
      d.setDate(mon.getDate() + shift + i);
      const m = mineralFor(d), isToday = ymd(d) === ymd(now);
      const gym = isToday ? gymToday() : defaultGym(d);
      return `<div class="day${isToday ? ' today' : ''}"><div class="dn">${DAYS[d.getDay()]}</div><div class="dd">${d.getMonth() + 1}/${d.getDate()}</div>` +
        `<span class="mk p-${m}">${m === 'iron' ? 'Fe' : 'Zn'}</span><span class="g">${gym ? 'gym' : d.getDay() === 0 ? 'D2' : ''}</span></div>`;
    }).join('');
  }

  // --- Events ---
  $('slots').addEventListener('change', (e) => {
    const r = rows.find((r) => r.cb === e.target);
    if (!r) return;
    if (r.weekly) { week[r.id] = r.cb.checked; set(weekKey, week); }
    else { day[r.id] = r.cb.checked; set(dayKey, day); }
    render();
  });

  $('gymToggle').addEventListener('change', (e) => { gymSet = e.target.checked; set(gymKey, gymSet); render(); });

  $('reset').addEventListener('click', () => {
    day = {};
    set(dayKey, day);
    for (const r of rows) if (!r.weekly) r.cb.checked = false;
    render();
  });

  $('swap').addEventListener('click', () => { settings.offset = settings.offset ? 0 : 1; set('supp-settings', settings); render(); });

  $('gymDays').addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    const wd = CHIP_ORDER[[...chip.parentNode.children].indexOf(chip)];
    const i = settings.gymDays.indexOf(wd);
    if (i === -1) settings.gymDays.push(wd); else settings.gymDays.splice(i, 1);
    set('supp-settings', settings);
    render();
  });

  const tabs = document.querySelectorAll('nav button');
  const show = (v) => {
    tabs.forEach((t) => t.classList.toggle('on', t.dataset.v === v));
    document.querySelectorAll('.view').forEach((s) => s.classList.toggle('on', s.id === `v-${v}`));
  };
  tabs.forEach((t) => t.addEventListener('click', () => {
    show(t.dataset.v);
    try { history.replaceState(null, '', `#${t.dataset.v}`); } catch {}
  }));
  if (location.hash === '#week') show('week');

  loadDay();
  render();

  // If the page stays open past midnight (or the phone wakes it the next morning), switch to the new day.
  let midnightTimer;
  function checkDay() {
    if (ymd(new Date()) !== ymd(now)) { log('new day, reloading', ymd(now), '->', ymd(new Date())); loadDay(); render(); }
    clearTimeout(midnightTimer);
    const t = new Date();
    t.setHours(24, 0, 1, 0);
    midnightTimer = setTimeout(checkDay, t - new Date());
  }
  document.addEventListener('visibilitychange', () => { if (!document.hidden) checkDay(); });
  addEventListener('focus', checkDay);
  addEventListener('pageshow', checkDay);
  checkDay();

  if ('serviceWorker' in navigator) {
    addEventListener('load', () => navigator.serviceWorker.register(DEBUG ? 'sw.js?debug' : 'sw.js')
      .then((reg) => log('service worker ready', reg?.scope), (e) => log('service worker failed', e)));
  }

  if (DEBUG) window.supp = { state: () => ({ now, dayKey, gymKey, weekKey, day, week, gymSet, settings, mineral: mineralFor(now) }) };
})();
