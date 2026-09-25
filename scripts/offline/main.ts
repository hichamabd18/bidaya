// النسخة المستقلة — تطبيق كامل بلا خادم ولا شبكة، يعاد استخدام المحرك والبيانات والمخزن نفسها.
import {
  ALGERIAN_WILAYAS,
  MAJOR_ISLAMIC_CITIES,
  Coordinates,
  calculatePrayerTimes,
  coerceCoordinates,
  formatConciseGregorian,
  getHijriDate,
} from '../../lib/prayer';
import {MODULE_1_DAILY_TIMELINE} from '../../lib/data/timeline';
import {MODULE_2_HIJRI_SEASONS} from '../../lib/data/seasons';
import {
  libraryEntries,
  findLibraryEntry,
  libraryGroups,
  entriesByGroup,
} from '../../lib/library';
import {
  AppSettings,
  ThemeName,
  dayKey,
  getDay,
  getWeek,
  loadRawSettings,
  saveRawSettings,
  setDay,
  setWeek,
} from '../../lib/store';
import {feedback} from '../../lib/sound';
import {normalizeAr} from '../../lib/search';

const DEFAULT_LOCATION = ALGERIAN_WILAYAS[15];

const STAGE_DAYPART: Record<string, string> = {
  ST01: 'late', ST02: 'dawn', ST03: 'morning', ST04: 'noon',
  ST05: 'afternoon', ST06: 'dusk', ST07: 'evening', ST08: 'night',
};

const ICON_CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';
const ICON_CHEVRON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" width="18" height="18"><path d="m6 9 6 6 6-6"/></svg>';
const ICON_MOON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" width="18" height="18"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>';
const ICON_SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" width="18" height="18"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
const ICON_COPY = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" width="16" height="16"><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>';

// ——— الحالة ———
let settings: AppSettings = loadRawSettings();
let location: Coordinates = coerceCoordinates(settings.location, DEFAULT_LOCATION);
let tab: 'today' | 'seasons' | 'library' | 'tasbeeh' = 'today';
let day = getDay();
let week = getWeek();
let expanded = new Set<string>();
let reader: {title: string; group: string; scripture?: string; sections: {label: string; text: string}[]; source?: string} | null = null;
let tasbeeh = {preset: 0, customText: '', customTitle: '', count: 0, target: 33, laps: 0};
let filters = {today: '', seasons: '', library: ''};

const PRESETS = [
  {title: 'التسبيح', text: 'سُبْحَانَ اللَّهِ', target: 33},
  {title: 'التحميد', text: 'الْحَمْدُ لِلَّهِ', target: 33},
  {title: 'التكبير', text: 'اللَّهُ أَكْبَرُ', target: 34},
  {title: 'التهليل', text: 'لا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ', target: 100},
  {title: 'الاستغفار', text: 'أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ', target: 100},
  {title: 'الصلاة على النبي ﷺ', text: 'اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ', target: 100},
  {title: 'الحوقلة', text: 'لا حَوْلَ وَلا قُوَّةَ إِلَّا بِاللَّهِ', target: 100},
  {title: 'الكلمتان', text: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ', target: 100},
];

function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]!));
}

function persistSettings() {
  saveRawSettings(settings);
}

function applyTheme() {
  const root = document.documentElement;
  if (settings.theme === 'night') root.setAttribute('data-theme', 'night');
  else root.removeAttribute('data-theme');
}

function applyDaypart(stageId: string) {
  document.documentElement.setAttribute('data-daypart', STAGE_DAYPART[stageId] ?? 'noon');
}

// ——— الترويسة ———
function renderHeader() {
  const now = new Date();
  const prayer = calculatePrayerTimes(location, now);
  const hijri = getHijriDate(now, settings.hijriOffset);
  const diff = Math.max(0, prayer.nextPrayerDate.getTime() - now.getTime());
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  const countdown = h > 0 ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` : `${m}:${String(s).padStart(2, '0')}`;

  applyDaypart(prayer.activeTimelineStageId);

  const badges = [
    hijri.isWhiteDay ? '<span class="badge">الأيام البيض</span>' : '',
    hijri.isFastingDay ? '<span class="badge success">صيام مسنون</span>' : '',
  ].join('');

  const options = [...ALGERIAN_WILAYAS, ...MAJOR_ISLAMIC_CITIES]
    .map((c) => `<option value="${esc(c.name)}" ${c.name === location.name ? 'selected' : ''}>${esc(c.name)}</option>`)
    .join('');

  const header = document.getElementById('app-header')!;
  header.querySelector('.date-line')!.innerHTML =
    `${esc(hijri.formattedText)}<small>${esc(formatConciseGregorian(now))}</small> ${badges}`;
  header.querySelector('.countdown')!.innerHTML =
    `<span class="dot"></span><strong>${esc(prayer.nextPrayer)}</strong><span class="num">بعد ${countdown}</span>`;
  header.querySelector('#theme-btn')!.innerHTML = settings.theme === 'night' ? ICON_SUN : ICON_MOON;
  header.querySelector('#loc-select')!.innerHTML = options;
  header.querySelector('#loc-label')!.textContent = location.name;
}

// ——— اليوم ———
function todayView(): string {
  const now = new Date();
  const activeStage = calculatePrayerTimes(location, now).activeTimelineStageId;
  const q = normalizeAr(filters.today);

  const all = MODULE_1_DAILY_TIMELINE.flatMap((s) => s.items);
  const done = all.filter((i) => day.timeline[i.id]).length;
  const pct = all.length ? Math.round((done / all.length) * 100) : 0;

  const stages = MODULE_1_DAILY_TIMELINE.map((stage, index) => {
    const isNow = stage.stage_id === activeStage;
    if (!expanded.has(stage.stage_id) && isNow) expanded.add(stage.stage_id);
    const items = q
      ? stage.items.filter((i) => normalizeAr(`${i.title} ${i.act_description} ${i.dhikr_dua} ${i.reward_virtue} ${i.spiritual_and_educational_facet} ${i.source}`).includes(q))
      : stage.items;
    if (q && items.length === 0) return '';
    const doneInStage = stage.items.filter((i) => day.timeline[i.id]).length;
    const open = expanded.has(stage.stage_id);
    const timePart = stage.period_name.includes('(') ? stage.period_name.split('(')[1].replace(')', '') : '';
    return `
      <section class="stage">
        <button class="stage-head" data-stage="${stage.stage_id}" aria-expanded="${open}">
          <span class="dot ${isNow ? 'now' : ''}"></span>
          <span class="t">
            <b>${index + 1}. ${esc(stage.period_name.split('(')[0].trim())}</b>
            <small>${doneInStage} من ${stage.items.length}${timePart ? ' · ' + esc(timePart) : ''}${isNow ? ' — الآن' : ''}</small>
          </span>
          <span class="chev">${ICON_CHEVRON}</span>
        </button>
        <div class="stage-body ${open ? 'open' : ''}">
          <p class="objective"><b>المقصد: </b>${esc(stage.stage_objective)}</p>
          <div class="panel">
            ${items
              .map(
                (item) => `
              <div class="rowi ${day.timeline[item.id] ? 'done' : ''}">
                <button class="check" data-toggle="${item.id}" data-done="${day.timeline[item.id] ? '1' : '0'}" role="checkbox" aria-checked="${Boolean(day.timeline[item.id])}" aria-label="${esc(item.title)}">${ICON_CHECK}</button>
                <button class="body" data-open="${item.id}">
                  <span class="ttl">${esc(item.title)}</span>
                  ${item.dhikr_dua ? `<span class="dhikr">« ${esc(item.dhikr_dua)} »</span>` : `<span class="desc">${esc(item.act_description)}</span>`}
                </button>
              </div>`,
              )
              .join('')}
          </div>
        </div>
      </section>`;
  }).join('');

  return `
    <div class="summary">أنجزت <strong>${done}</strong> من <strong>${all.length}</strong> عملًا · ${pct}٪</div>
    <div class="progress-line"><div style="width:${pct}%"></div></div>
    ${timesStrip()}
    ${stages || '<p class="empty">لا نتائج — جرّب كلمة أقصر</p>'}`;
}

function timesStrip(): string {
  const now = new Date();
  const prayer = calculatePrayerTimes(location, now);
  const rows = [
    ['الإمساك', prayer.imsak], ['الفجر', prayer.fajr], ['الشروق', prayer.sunrise], ['الظهر', prayer.dhuhr],
    ['العصر', prayer.asr], ['المغرب', prayer.maghrib], ['العشاء', prayer.isha], ['ثلث الليل', prayer.lastThird],
  ];
  return `<div class="times">${rows
    .map(([name, val]) => `<div class="time ${name === prayer.nextPrayer ? 'next' : ''}"><span class="name">${name}</span><span class="val">${val}</span></div>`)
    .join('')}</div>`;
}

// ——— المواسم ———
function seasonsView(): string {
  const q = normalizeAr(filters.seasons);
  const months = MODULE_2_HIJRI_SEASONS.months
    .map((month, mi) => {
      const acts = month.acts_and_functions
        .map((act, ai) => ({act, ai}))
        .filter(({act}) => !q || normalizeAr(`${act.act_name} ${act.details} ${act.reward ?? ''} ${act.spiritual_and_educational_facet}`).includes(q));
      if (q && acts.length === 0) return '';
      return `
        <section class="stage">
          <button class="stage-head" data-month="${month.month_number}" aria-expanded="${expanded.has(`M${month.month_number}`)}">
            <span class="t"><b>${esc(month.name)}</b><small>${esc(month.title)}</small></span>
            <span class="chev">${ICON_CHEVRON}</span>
          </button>
          <div class="stage-body ${expanded.has(`M${month.month_number}`) ? 'open' : ''}">
            <div class="panel">
              ${acts
                .map(
                  ({act, ai}) => `
                <button class="rowi" style="width:100%" data-month-act="${month.month_number}-${ai}">
                  <span class="body">
                    <span class="ttl">${esc(act.act_name)}</span>
                    <span class="desc">${esc(act.details)}</span>
                  </span>
                </button>`,
                )
                .join('')}
            </div>
          </div>
        </section>`;
    })
    .join('');
  const seasons = MODULE_2_HIJRI_SEASONS.seasonal_solar_cycles
    .map(
      (s) => `
      <section class="stage">
        <div class="stage-head" style="cursor:default"><span class="t"><b>${esc(s.season_name)}</b></span></div>
        <p class="objective">${esc(s.spiritual_concept_and_functions)}</p>
      </section>`,
    )
    .join('');
  return `${months || '<p class="empty">لا نتائج</p>'}<h2 class="sec-label" style="margin-top:24px">فصول العام والاعتبار</h2>${seasons}`;
}

// ——— الجامع (المكتبة) ———
function libraryView(): string {
  const q = normalizeAr(filters.library);
  const groups = libraryGroups().filter((g) => !g.name.startsWith('وظائف '));
  const sections = groups
    .map((g, gi) => {
      const all = entriesByGroup(g.name);
      const items = all.filter(
        (entry) =>
          !q ||
          normalizeAr(
            `${entry.title} ${entry.scripture ?? ''} ${entry.sections.map((s) => s.text).join(' ')} ${entry.source ?? ''}`,
          ).includes(q),
      );
      if (q && items.length === 0) return '';
      return `
      <section class="stage">
        <button class="stage-head" data-cat="${gi}" aria-expanded="${expanded.has(`C${gi}`)}">
          <span class="t"><b>${esc(g.name)}</b><small>${items.length} موضوع</small></span>
          <span class="chev">${ICON_CHEVRON}</span>
        </button>
        <div class="stage-body ${expanded.has(`C${gi}`) ? 'open' : ''}">
          <div class="panel">
            ${items
              .map(
                (entry) => `
              <button class="rowi" style="width:100%" data-entry-id="${entry.id}">
                <span class="body">
                  <span class="ttl">${esc(entry.title)}</span>
                  ${entry.scripture ? `<span class="dhikr">« ${esc(entry.scripture)} »</span>` : `<span class="desc">${esc(entry.sections[0]?.text.slice(0, 110) ?? '')}...</span>`}
                </span>
              </button>`,
              )
              .join('')}
          </div>
        </div>
      </section>`;
    })
    .join('');
  return sections || '<p class="empty">لا نتائج — جرّب كلمة أقصر</p>';
}

// ——— المسبحة ———
function tasbeehView(): string {
  const t = tasbeeh;
  const activeText = t.customText || PRESETS[t.preset].text;
  const activeTitle = t.customTitle || PRESETS[t.preset].title;
  const R = 46;
  const C = 2 * Math.PI * R;
  const progress = Math.min(1, t.count / t.target);
  return `
    <div class="tasbeeh">
      <div class="presets" role="group" aria-label="الأذكار الجاهزة">
        ${PRESETS.map((p, i) => `<button class="preset" data-preset="${i}" aria-pressed="${!t.customText && t.preset === i}">${p.title}</button>`).join('')}
      </div>
      <p class="dhikr-now">« ${esc(activeText)} »</p>
      <button class="ring-btn" id="ring" aria-label="عدّ — ${t.count} من ${t.target}">
        <svg viewBox="0 0 100 100" aria-hidden="true">
          <circle cx="50" cy="50" r="${R}" fill="none" stroke="var(--hairline)" stroke-width="3"/>
          <circle cx="50" cy="50" r="${R}" fill="none" stroke="var(--accent-strong)" stroke-width="3.5" stroke-linecap="round"
            stroke-dasharray="${progress * C} ${C}"/>
        </svg>
        <span><span class="count">${t.count}</span><br/><span class="sub">من ${t.target} · الدورات ${t.laps}</span></span>
      </button>
      <div class="tasbeeh-foot">
        <div class="targets" role="group" aria-label="الهدف">
          ${[33, 100, 1000].map((n) => `<button class="target" data-target="${n}" aria-pressed="${t.target === n}">${n}</button>`).join('')}
        </div>
        <button class="btn" id="tasbeeh-reset">تصفير</button>
      </div>
      <p class="hint">انقر الحلقة للذكر — تُخفَض الدورة تلقائيًا عند إتمام الهدف</p>
    </div>`;
}

// ——— القارئ ———
function openTimelineItem(id: string) {
  const found = MODULE_1_DAILY_TIMELINE.flatMap((s) => s.items.map((item) => ({item, stage: s}))).find((e) => e.item.id === id);
  if (!found) return;
  const i = found.item;
  reader = {
    title: i.title,
    group: found.stage.period_name.split('(')[0].trim(),
    scripture: i.dhikr_dua,
    sections: [
      {label: 'العمل', text: i.act_description},
      {label: 'الفضل والأثر', text: i.reward_virtue},
      {label: 'المقصد التعبدي وتزكية النفس', text: i.spiritual_and_educational_facet},
    ],
    source: i.source,
  };
  renderReader();
}

function openMonthAct(key: string) {
  const [mi, ai] = key.split('-').map(Number);
  const month = MODULE_2_HIJRI_SEASONS.months.find((m) => m.month_number === mi);
  const act = month?.acts_and_functions[ai];
  if (!month || !act) return;
  reader = {
    title: act.act_name,
    group: `وظائف ${month.name}`,
    scripture: act.dhikr_dua,
    sections: [
      {label: 'التفصيل', text: act.details},
      ...(act.reward ? [{label: 'الفضل والأثر', text: act.reward}] : []),
      {label: 'المقصد التعبدي وتزكية النفس', text: act.spiritual_and_educational_facet},
    ],
    source: act.evidence,
  };
  renderReader();
}

function openLibraryEntry(id: string) {
  const item = findLibraryEntry(id);
  if (!item) return;
  reader = {
    title: item.title,
    group: item.group,
    scripture: item.scripture,
    sections: item.sections,
    source: item.source,
  };
  renderReader();
}

function openContextual(key: string) {
  openLibraryEntry(`ctx-${key}`);
}

function renderReader() {
  const overlay = document.getElementById('reader')!;
  if (!reader) {
    overlay.classList.remove('open');
    return;
  }
  overlay.querySelector('.reader-head')!.innerHTML = `
    <div><h2>${esc(reader.title)}</h2><small>${esc(reader.group)}</small></div>
    <button class="icon-btn" id="reader-close" aria-label="إغلاق">✕</button>`;
  overlay.querySelector('.reader-body')!.innerHTML = `
    ${reader.scripture ? `<div class="scripture">« ${esc(reader.scripture)} »</div>` : ''}
    ${reader.sections.map((s) => `<p class="sec-label">${esc(s.label)}</p><p class="sec-text">${esc(s.text)}</p>`).join('')}
    ${reader.source ? `<p class="src">الإسناد: ${esc(reader.source)}</p>` : ''}`;
  overlay.querySelector('.reader-actions')!.innerHTML = `
    <button class="btn primary" id="reader-copy">${ICON_COPY} نسخ النص</button>`;
  overlay.classList.add('open');
}

// ——— التصيير ———
function render() {
  const main = document.getElementById('main')!;
  if (tab === 'today') main.innerHTML = todayView();
  else if (tab === 'seasons') main.innerHTML = seasonsView();
  else if (tab === 'library') main.innerHTML = libraryView();
  else main.innerHTML = tasbeehView();
  document.querySelectorAll('[role="tab"]').forEach((el) => {
    el.setAttribute('aria-selected', String(el.getAttribute('data-tab') === tab));
  });
  renderHeader();
}

// ——— الأحداث ———
document.addEventListener('click', (e) => {
  const target = e.target as HTMLElement;
  const hit = (sel: string) => target.closest(sel) as HTMLElement | null;

  const tabBtn = hit('[data-tab]');
  if (tabBtn) {
    tab = tabBtn.getAttribute('data-tab') as typeof tab;
    render();
    return;
  }

  const themeBtn = hit('#theme-btn');
  if (themeBtn) {
    settings = {...settings, theme: (settings.theme === 'night' ? 'day' : 'night') as ThemeName};
    persistSettings();
    applyTheme();
    renderHeader();
    return;
  }

  const stageBtn = hit('[data-stage]');
  if (stageBtn) {
    const id = stageBtn.getAttribute('data-stage')!;
    if (expanded.has(id)) expanded.delete(id);
    else expanded.add(id);
    feedback.vibrate(10);
    render();
    return;
  }

  const monthBtn = hit('[data-month]');
  if (monthBtn) {
    const id = `M${monthBtn.getAttribute('data-month')}`;
    if (expanded.has(id)) expanded.delete(id);
    else expanded.add(id);
    render();
    return;
  }

  const catBtn = hit('[data-cat]');
  if (catBtn) {
    const id = `C${catBtn.getAttribute('data-cat')}`;
    if (expanded.has(id)) expanded.delete(id);
    else expanded.add(id);
    render();
    return;
  }

  const toggle = hit('[data-toggle]');
  if (toggle) {
    const id = toggle.getAttribute('data-toggle')!;
    const wasDone = Boolean(day.timeline[id]);
    day = {...day, timeline: {...day.timeline, [id]: !wasDone}};
    setDay(day);
    feedback.vibrate(wasDone ? 12 : [25, 40, 25]);
    feedback.playBeadClick(!wasDone);
    render();
    return;
  }

  const openBtn = hit('[data-open]');
  if (openBtn) {
    openTimelineItem(openBtn.getAttribute('data-open')!);
    return;
  }
  const monthAct = hit('[data-month-act]');
  if (monthAct) {
    openMonthAct(monthAct.getAttribute('data-month-act')!);
    return;
  }
  const entryBtn = hit('[data-entry-id]');
  if (entryBtn) {
    openLibraryEntry(entryBtn.getAttribute('data-entry-id')!);
    return;
  }
  const ctx = hit('[data-ctx]');
  if (ctx) {
    openContextual(ctx.getAttribute('data-ctx')!);
    return;
  }

  const preset = hit('[data-preset]');
  if (preset) {
    const i = Number(preset.getAttribute('data-preset'));
    tasbeeh = {...tasbeeh, preset: i, customText: '', customTitle: '', count: 0, laps: 0, target: PRESETS[i].target};
    render();
    return;
  }
  const targetBtn = hit('[data-target]');
  if (targetBtn) {
    tasbeeh = {...tasbeeh, target: Number(targetBtn.getAttribute('data-target')), count: 0};
    feedback.vibrate(10);
    render();
    return;
  }
  if (hit('#ring')) {
    feedback.playBeadClick(settings.sound);
    feedback.vibrate(12);
    const next = tasbeeh.count + 1;
    if (next >= tasbeeh.target) {
      feedback.playTargetComplete(settings.sound);
      feedback.vibrate([25, 40, 25]);
      tasbeeh = {...tasbeeh, count: 0, laps: tasbeeh.laps + 1};
    } else {
      tasbeeh = {...tasbeeh, count: next};
    }
    render();
    return;
  }
  if (hit('#tasbeeh-reset')) {
    tasbeeh = {...tasbeeh, count: 0, laps: 0};
    feedback.vibrate(25);
    render();
    return;
  }
  if (hit('#reader-close')) {
    reader = null;
    renderReader();
    return;
  }
  if (hit('#reader-copy')) {
    const text = reader ? `« ${reader.scripture ?? reader.title} »\n${reader.sections.map((s) => `${s.label}: ${s.text}`).join('\n')}\nالإسناد: ${reader.source ?? ''}` : '';
    navigator.clipboard?.writeText(text).catch(() => {});
    return;
  }
  if (hit('#reader-tasbeeh')) {
    tasbeeh = {preset: 0, customText: reader?.scripture ?? '', customTitle: reader?.title ?? '', count: 0, target: 33, laps: 0};
    reader = null;
    tab = 'tasbeeh';
    renderReader();
    render();
    return;
  }
  if (target.id === 'reader') {
    reader = null;
    renderReader();
  }
});

document.addEventListener('input', (e) => {
  const input = e.target as HTMLInputElement;
  if (input.matches('[data-filter]')) {
    filters = {...filters, [input.getAttribute('data-filter')!]: input.value};
    const el = document.getElementById('main')!;
    const scroll = el.scrollTop;
    render();
    (document.querySelector(`[data-filter="${input.getAttribute('data-filter')}"]`) as HTMLElement | null)?.focus();
    el.scrollTop = scroll;
  }
});

document.addEventListener('change', (e) => {
  const select = e.target as HTMLSelectElement;
  if (select.id === 'loc-select') {
    const found = [...ALGERIAN_WILAYAS, ...MAJOR_ISLAMIC_CITIES].find((c) => c.name === select.value);
    if (found) {
      location = found;
      settings = {...settings, location: found};
      persistSettings();
      render();
    }
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && reader) {
    reader = null;
    renderReader();
  }
});

// ——— الإقلاع ———
applyTheme();
render();
setInterval(renderHeader, 1000);
