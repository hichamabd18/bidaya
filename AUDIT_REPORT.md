# Audit Report — «اليوم النبوي ووظائف العام»

**Date:** 2026-09-25 · **Scope:** Full product, UX, design-system, RTL/Arabic, engineering, and dependency audit of `hichamabd18/bidaya` (branch `arena/01a0d8f3-bidaya`, commit `e79b1f7`).
**Mode:** Audit only. No code was modified. (One byproduct: `npm install` produced an untracked `package-lock.json` — committing it is itself Recommendation #1 in Phase 0.)

---

## A. Executive Summary

**What this product is.** A daily spiritual companion for Arabic-speaking (primarily Algerian) Muslims: a prophetic daily timeline (8 stages, ~60 practices), Hijri month/season functions (Ibn Rajab's لطائف المعارف tradition), contextual sunan & duas (~15 categories), a habit tracker (daily/weekly/monthly), an interactive tasbīḥ counter, and astronomically computed prayer times for all 58 Algerian wilayas. It is a **content + ritual + tracking** product — the content is genuinely good: curated, sourced with hadith numbers, with a consistent "spiritual/educational facet" field that is rare even in commercial apps.

**Current state.** One Next.js 15 App Router route, 8 client components (~2,300 LOC), one 1,456-line data module (134 KB / 35.4 KB gzipped — the real asset), a hand-rolled prayer-time/Hijri engine, localStorage persistence, a PWA wrapper (manifest + service worker + "export as single HTML file" feature), and a legacy committed single-file app in `public/`. The build passes. First Load JS: **159 kB**.

**Strongest aspects**
1. **Content depth and sourcing** — the data model (`DailyItem`, `MonthFunctionItem`, … with `source`, `reward_virtue`, `spiritual_and_educational_facet`) is publishable-quality editorial structure. Do not touch the content.
2. **The core visual instinct is already right** — the parchment/copper palette (`#f6f1e7` page, hairline borders `#e4dcc9`, one copper accent `#a97c34`), row-lists instead of card grids, and "max one primary button per screen" invariant are a real design direction, not AI slop. The audit's design work is *finishing* this system, not replacing it.
3. **Sound/haptics engine, wake lock, Web Share with clipboard fallback** — thoughtful mobile-web touches.
4. RTL is structurally correct (`<html lang="ar" dir="rtl">`, logical `border-block`, RTL-aware search icons).

**Biggest problems**
1. **The flagship "download offline PWA" feature ships a corrupted file.** `scripts/generate-single-file.mjs` uses regex to strip TypeScript and produces `const ALGERIAN_WILAYAS[] = [` — a **SyntaxError** (verified with acorn). The committed `public/index.html` users download today is broken (white screen), depends on CDNs (Tailwind CDN, React 18 UMD, Babel standalone) so it isn't offline anyway, and has a **completely different visual identity** (emerald/gold/Cairo) from the app.
2. **Weekly habit progress is silently wiped every day** — restore-from-localStorage is gated on the *daily* date key, so Friday/weekly milestones vanish at midnight. For a habit-tracker, daily data loss destroys the core promise (trust).
3. **Prayer-time correctness bugs outside Algeria** — hardcoded UTC offsets are wrong for daylight-saving cities (Cairo and Jerusalem listed as permanent UTC+3), GPS lookup hardcodes `timezone: 1` for any point on Earth, and Dhuhr has no safety cushion. For a religious app whose header claims «مواقيت موثوقة», this is a credibility risk.
4. **Accessibility fails WCAG AA in measurable ways** — muted text at 2.67–2.84:1 contrast, primary button text at 3.74:1, 24–28 px touch targets, modals with no focus trap/Escape, and primary list rows that are `<div onClick>` (invisible to keyboards and screen readers).
5. **~30 % of declared dependencies are dead or miswired** (`motion`, `@google/genai`, `@hookform/resolvers` without react-hook-form, `class-variance-authority`, `@tailwindcss/typography`, `autoprefixer`, `firebase-tools`), the ESLint setup is doubled and disabled at build time, and **there is no lockfile** — builds float (`^15.4.9` currently resolves to 15.5.26).

**Design maturity: 5.5/10.** A real token seed and several correct invariants, undermined by inconsistent application, dead utility classes, emoji-as-iconography, and four copy-pasted modal implementations.
**Technical maturity: 4/10.** It builds and it works, but reproducibility (no lockfile), data integrity (weekly wipe), export integrity (broken generator), and verification (zero tests, lint disabled) are below the bar for a "serious long-term product."

**Biggest opportunity.** This is one design-system pass + one data-integrity pass away from being a genuinely premium product. The content is the moat; the parchment identity is distinctive; nothing needs a rewrite. The plan below is incremental: Phase 0–1 make it trustworthy, Phase 2–6 make it beautiful and coherent.

---

## B. Current Stack

Versions installed from the committed `package.json` resolved during today's clean `npm install`; "latest" verified against the **npm registry dist-tags on 2026-09-25** and official docs (Next.js 16 upgrade guide fetched from nextjs.org today).

| Technology | Current (installed) | Latest relevant (2026-09-25) | Status | Recommendation | Reason |
|---|---|---|---|---|---|
| Next.js | `^15.4.9` → **15.5.26** (unpinned; 15.x is `backport`-only maintenance) | **16.3.6** | One major behind, on final 15.x | **UPGRADE** (strongly recommended, not urgent) | 15.5.26 still receives backports, but 16 is the mainline. Breaking changes verified: Turbopack default for dev+build — **a custom `webpack` config fails the build** (this repo has one, though it is only an AI-Studio HMR hack → delete it); async request APIs fully removed (unused here → zero impact); `next lint` removed (unused → zero impact); Node ≥ 20.9 (we run 22 → fine). Migration complexity: **low** for this codebase. |
| React / ReactDOM | 19.3.0 | 19.3.0 | Current | **KEEP** | Rides along with the Next upgrade. |
| TypeScript | 5.9.3 | **7.0.2** (native "tsgo" compiler, GA Jul 2026); 6.0 never shipped stable | Current on 5.x | **KEEP 5.9 now; revisit after TS 7.1** | TS 7.0 ships **no JS compiler API**; `typescript-eslint` (used by `eslint-config-next`) cannot run on it until the 7.1 API. Upgrading today would break linting. Zero pressure: 5.9 is fully supported. |
| Tailwind CSS | 4.1.11 | **4.3.3** (v3.4.19 is v3-LTS) | 2 minors behind | **UPGRADE** (trivial) + adopt CSS-first `@theme` | 4.x line is stable and current; the repo already uses v4 (PostCSS plugin, `shadow-2xs`, dynamic spacing like `w-8.5`). But it never registers tokens in `@theme` — utilities are written as `bg-[var(--bg-page)]` everywhere. Migrating tokens into `@theme` makes classes like `bg-page` possible and enforces the scale. |
| @tailwindcss/postcss | 4.1.11 | 4.3.3 | In step | **UPGRADE** with Tailwind | — |
| autoprefixer | 10.4.21 | — | **Redundant** | **REMOVE** | `@tailwindcss/postcss` handles prefixing via Lightning CSS. |
| @tailwindcss/typography | 0.5.20 | — | **Dead** (no `prose` usage anywhere) | **REMOVE** | Reconsider only when the reading-experience phase lands. |
| lucide-react | 0.553.0 | **1.48.0** (1.0 shipped Mar 2026) | Major behind | **UPGRADE** (low risk) | v1 removed brand icons (none used here) and renamed some icons; legacy aliases retained. This repo uses ~40 common icons (Clock, Check, Moon…) → near-zero migration cost, −32 % package weight. |
| motion | 12.43.0 (unused) | 13.4.4 | **Dead** — zero imports; also needlessly in `transpilePackages` | **REMOVE** | If motion is wanted later, prefer CSS transitions for this UI scale; reintroduce deliberately. |
| @google/genai | 2.24.0 (unused) | 2.24.0 | **Dead** — zero imports; AI-Studio scaffold leftover | **REMOVE** (+ `GEMINI_API_KEY` in `.env.example`, `metadata.json` capabilities) | Dead server-capability scaffolding for a fully client-side app. |
| @hookform/resolvers | 5.9.1 | — | **Dead** — `react-hook-form` isn't even a dependency | **REMOVE** | Orphaned transitive stub. |
| class-variance-authority | 0.7.1 (unused) | 0.7.1 | **Dead** | **REMOVE** | Reintroduce only if design-system primitives genuinely need variants (decide in Phase 2). |
| clsx + tailwind-merge | 2.1.1 / 3.3.1 (`cn()` never called) | 2.1.1 / 3.7.0 | Dormant | **KEEP** | `cn()` becomes the backbone of Phase-2 primitives; delete if Phase 2 doesn't use it. |
| tw-animate-css | 1.4.0 | 1.4.0 | **Miswired** — never `@import`ed, so `animate-in slide-in-from-bottom` classes compile to **nothing** (verified in built CSS) | **REMOVE** (or wire properly) | Sheets/modals currently appear with no transition at all — a real (invisible) bug. |
| ESLint | 9.39.1 | 10.11.0 | OK; but **lint disabled at build** (`ignoreDuringBuilds: true`) and **two conflicting configs** (flat `eslint.config.mjs` + inert legacy `.eslintrc.json`) | **UNIFY** first; ESLint 10 optional | `eslint-config-next@16.0.8` is pinned while `next` is 15.5.26 — a version mismatch to resolve when Next is upgraded. |
| firebase-tools | 15.31.0 (devDep) | 15.31.0 | **Dead** — no Firebase config anywhere in repo | **REMOVE** (or move to deploy CI only) | Heavyweight CLI shipped to every contributor's install for no repo usage. |
| @types/node | ^20 | 22/24 | Drift (runtime is Node 22) | **BUMP** | Align types with runtime. |
| npm lockfile | **absent** | — | Non-reproducible builds | **COMMIT `package-lock.json`** (required) | `^` ranges float; a fresh install today already resolved differently than at scaffold time. |
| Node.js | 22.22.3 (sandbox) | 22 LTS | Fine | KEEP | Meets Next 16's ≥ 20.9 floor. |
| Hand-rolled prayer/Hijri engine (`lib/prayer.ts`) | custom | `adhan` **4.4.6** (MIT, actively maintained; IANA timezones, high-latitude rules, madhab Asr options) | Functional but has tz/DST bugs (see C3) | **REPLACE with `adhan`** (recommended) or patch timezone handling | `Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', …)` also verified working today for Hijri — a platform capability that can replace the tabular Hijri math while keeping the manual ±2-day sighting offset. |

Not present (deliberate non-additions): state library (React state suffices at this scale), data-fetching library (no server data), react-hook-form (no forms worth a library), component kit (shadcn/Radix/Base UI — see §F).

---

## C. Problems Found

Severity = user impact × reach × reversibility. Evidence = file:line where practical.

### CRITICAL

**C1. The exported "offline PWA" is a corrupted file — and isn't offline.**
- *Evidence:* `scripts/generate-single-file.mjs:10-23` (`tsToJs` regex stripper) mangles `export const ALGERIAN_WILAYAS: Coordinates[] = [` into `const ALGERIAN_WILAYAS[] = [` → **SyntaxError at line 65** of the inline Babel script (verified with a real parser on both the regenerated file and the committed `public/index.html`). The regex also can't handle optional properties (`dhikr_dua?: string` → `dhikr_dua?`, invalid JS).
- The committed `public/index.html` (2,599 lines) additionally loads `cdn.tailwindcss.com`, React 18.2 UMD, and Babel standalone from CDNs → **requires internet**, contradicting the "100% Offline" promise in the download modal (`app/page.tsx:524-540`).
- It also embeds an entirely different design (emerald `#064e3b` + gold, Cairo font, `user-scalable=no`) — a second, conflicting brand living in the same repo.
- *Impact:* The app's headline feature (nav button + footer link + dedicated modal) delivers a white screen to anyone who downloads it. Trust failure at the moment of highest user goodwill.
- *Fix:* Either (a) rebuild the export properly — bundle `lib/data.ts` + `lib/prayer.ts` + a small vanilla shell with **esbuild/rollup at build time** (no regex, no Babel-in-browser, no CDN, one design system), or (b) remove the feature until it can be rebuilt honestly. Recommendation: (a), in Phase 7; hide the button until then.

**C2. Weekly (and monthly) habit progress is silently erased every day.**
- *Evidence:* `app/page.tsx:62-91` — restore is gated on `savedDate === todayStr` for **all** keys including `weekly_habits_state`; the save effect (`:104-127`) stamps the same daily key. Next day: nothing restores; `HABIT_WEEKLY_MILESTONES` (Friday sunan, Mon/Thu fasting checklist — `lib/data.ts:1421-1445`) resets to zero.
- Related: `handleResetToday` (`:214`) clears daily + timeline but not weekly; there is no week/month key anywhere in the persistence schema.
- *Impact:* The tracker — the product's retention engine — loses history daily. Users cannot trust checkmarks.
- *Fix:* Version the storage schema; key records by period (`day:{YYYY-MM-DD}`, `week:{ISO week}`, `month:{YYYY-MM}`); keep history (enables streaks/history later). Part of Phase 1 (data integrity before redesign).

**C3. Prayer-time correctness bugs beyond Algeria + GPS timezone bug.**
- *Evidence:* `lib/prayer.ts:88-101` — `MAJOR_ISLAMIC_CITIES` hardcodes `timezone: 3` for Cairo and Jerusalem (both observe DST → wrong by 1 h for half the year); Morocco (`timezone: 1`) shifts by 1 h during Ramadan under its current system; `app/page.tsx:163-172` — **any GPS fix on Earth is assigned `timezone: 1`**.
- Dhuhr is printed as exact astronomical noon with no ihtiyāṭ cushion (ministry timetables add minutes); no high-latitude fallback strategy (relevant for European users via GPS).
- *Impact:* A worship-time app printing wrong times is a religious-credibility failure — worse than any UI flaw.
- *Fix:* Move to `adhan@4.4.6` (IANA timezone from GPS coordinates, Parameters: Fajr 18°/Isha 17° to match the Algerian Ministry standard, `midnightMode`, optional manual offsets for ministry alignment), keep the ±2-day Hijri sighting offset concept. If staying hand-rolled: timezone from `Intl.DateTimeFormat().resolvedOptions().timeZone` / `-getTimezoneOffset()`, never constants.

**C4. No lockfile → unreproducible builds and unpinned security surface.**
- *Evidence:* repository root has no `package-lock.json`; `^15.4.9` already drifted to 15.5.26 between scaffold and today.
- *Impact:* "Works on my machine" drift; no auditable dependency tree for a product handling location data; CI impossible to make meaningful.
- *Fix:* Commit the lockfile (already generated during this audit); pin exact majors; add CI (build + lint + typecheck) in Phase 0.

### HIGH

**H1. Measured WCAG AA failures.**
- *Evidence (ratios computed today):* `--ink-muted #9c9484` on surfaces = **2.67–2.84:1** (used for captions, dates, meta — 11 px text, the smallest on screen); white on `--accent #a97c34` (`btn--primary`, 12–13 px labels) = **3.74:1**; night `--ink-muted #726c5d` = **3.16:1**. Passes: `ink-secondary` 5.46:1, `accent-ink` 5.96–6.73:1.
- Touch targets: stage chips, offset steppers (`h-5`), status filters ≈ **24–28 px** (WCAG 2.5.8 minimum 24 px, AAA/best practice 44 px).
- *Fix:* Darken `ink-muted` to ≥ 4.5:1 (or reserve it for decorative only); darken primary button background (e.g. `#8a6426` ≈ 5.3:1 with white); minimum interactive height 44 px on mobile.
  
**H2. Interactive rows are unreachable by keyboard and screen reader.**
- *Evidence:* `DailyTimeline.tsx:268-277`, `HijriSeasons.tsx:180-198`, `ContextualSunan.tsx:158-176` — primary content rows are `<div onClick>` containing a nested `<button>` (invalid nesting of interactive elements; no `role`, no `tabIndex`, no Enter/Space handling). Screen-reader users get silent divs; keyboard users cannot open any devotional sheet.
- *Fix:* Row = `<li>` with a single `<button>` (or `role="button"` + handlers + focus ring) wrapping the row body; checkbox as a separate labeled control.

**H3. Dialogs have no dialog semantics.**
- *Evidence:* 5 modals/sheets (`PrayerBar` location + settings, `InteractiveTasbeeh`, `DevotionalBottomSheet`, page-level PWA modal) are hand-rolled: no `role="dialog"`/`aria-modal`, no focus trap, no Escape, no focus return, body scroll not locked (background scrolls behind sheet on iOS). Backdrop is a `<div onClick>`.
- *Fix:* One shared `<Sheet>`/`<Modal>` primitive (Phase 2) with focus trap, Escape, scroll lock, focus return, `aria-labelledby`. Optionally adopt Base UI's Dialog only for this primitive (see §F) — everything else stays bespoke.

**H4. Dark mode flashes light on every load; theme applied post-hydration with two redundant mechanisms.**
- *Evidence:* theme is read from localStorage inside a `setTimeout(..., 0)` effect (`app/page.tsx:56-96`) and applied by toggling **both** `data-theme="night"` and `class="dark"` (`:143-154`; CSS honors both — `.dark` selectors duplicated throughout `globals.css`). `suppressHydrationWarning` (18 occurrences, 16 in `PrayerBar.tsx` alone) papers over time-dependent SSR instead of isolating it.
- *Impact:* Dark-mode users get a white flash on every cold load (worst on mobile PWA, where the installed app should feel native); the double mechanism invites drift.
- *Fix:* Blocking pre-hydration script setting `data-theme` from localStorage + `prefers-color-scheme` fallback; single `data-theme` mechanism; isolate ticking clock into a leaf component so `suppressHydrationWarning` shrinks to one node.

**H5. Search/filter with no results renders a blank region (missing empty states).**
- *Evidence:* `DailyTimeline.tsx:47-49` and `ContextualSunan.tsx:58-60` filter stages/categories with 0 items then render nothing — a typo in search produces a silently empty screen. No skeletons (acceptable — data is static), no error boundary anywhere, `alert()/confirm()` used for GPS failure and resets (`page.tsx:181,214`, `SpiritualTracker.tsx:131`).
- *Fix:* `<EmptyState>` primitive (icon-less, one line + one action: «لا نتائج لـ"…" — مسح البحث»); replace blocking dialogs with the Phase-2 sheet/toast.

**H6. Tab state is volatile: no URLs, no deep links, scroll/filter loss.**
- *Evidence:* `activeTab` is component state (`page.tsx:36`); switching tabs unmounts content (`page.tsx:361-388`) discarding scroll position, search text, and filters; browser back exits the app; nothing is shareable/bookmarkable.
- *Impact:* On mobile, accidental back-swipe kills the session; users cannot return to «وظائف شهر رمضان» directly.
- *Fix:* Real App Router segments (`/today`, `/seasons`, `/library`, `/progress`) with a shared shell layout — preserves state per segment and gives back/forward for free (Phase 3).

**H7. The 1-second clock re-renders the whole page tree.**
- *Evidence:* `page.tsx:129-134` — `setInterval(1000)` → `currentDateTime` → `prayerTimes`/`hijriDate` recompute (full solar-position math every tick) → re-render of `PrayerBar` + active tab. Only the countdown digits change.
- *Impact:* Wasted CPU on low-end phones, battery cost during the app's primary use (evening/night), and it is why `suppressHydrationWarning` is plastered everywhere.
- *Fix:* Isolate `<NextPrayerCountdown>` as the only time-dependent leaf; compute prayer times once per minute (or per location change) and derive the countdown from raw `Date`s.

**H8. Service worker caching strategy breaks the app after every redeploy.**
- *Evidence:* `public/sw.js:32-52` — cache-first for **all** GETs including navigation HTML; cache version `prophetic-day-v2.1` is a manual string. After any deploy, returning users get stale HTML referencing hashed chunks that no longer exist → white screen until they know to clear storage.
- *Fix:* Network-first for navigations (fallback cache), stale-while-revalidate for `_next/static` (immutable), precache the offline route; version the cache from the build ID at build time.

**H9. ESLint is doubled, misaligned, and disabled where it matters.**
- *Evidence:* `next.config.ts:6-8` `ignoreDuringBuilds: true`; `eslint.config.mjs` (flat, used) vs `.eslintrc.json` (`extends: "next"`, inert under ESLint 9 flat); `eslint-config-next@16.0.8` against `next@15.5.26`.
- *Fix:* Delete `.eslintrc.json`; enable lint in CI at minimum; align `eslint-config-next` with the installed Next major.

**H10. `xs:` breakpoint does not exist — two UI labels are permanently hidden.**
- *Evidence:* `PrayerBar.tsx:192` (`hidden xs:inline` — the Tasbīḥ button's label) and `:269` («المتبقي:»). Tailwind v4 has no `xs` by default and no `@custom-variant` is defined. Similarly `scrollbar-none` (used 3×) is not a core class → scrollbars still show. And `animate-in slide-in-from-bottom` compile to nothing (tw-animate-css never imported).
- *Impact:* Copy the team believes is displayed isn't; inconsistent visual results across screen sizes.
- *Fix:* Define the token or remove the classes; replace `scrollbar-none` with a real utility; delete `tw-animate-css` or import it.

### MEDIUM

**M1. Fonts block rendering and carry dead weight.** `globals.css:2` loads fonts via CSS `@import` (render-blocking chain; no preload; FOUT unmanaged) — 9 files including **Amiri italic ×2** (Arabic doesn't italicize — unused) and 5 IBM Plex Sans Arabic weights. Fix: `next/font/google` (self-hosted, subset `arabic`, preload, zero CLS); trim to 3 UI weights + 1-2 scripture weights.
**M2. Data ships whole to every user on first paint.** `data.ts` (134 KB raw / 35.4 KB gz) is statically imported by every tab component even though `/today` users need only Module 1. Acceptable short-term; with Phase-3 routes, per-segment splitting makes each route pay only its module.
**M3. Content identity = display strings.** Items keyed by `act_name` / `situation` (`HijriSeasons.tsx:166`, `ContextualSunan.tsx:166`) — collision- and i18n-unsafe. Fix: stable IDs in the data model (Phase 5/6; content untouched otherwise).
**M4. localStorage schema is fragmented and unversioned.** 8 independent keys, no namespace, no version, `JSON.parse` guarded by try/catch only at restore. Fix: single versioned namespaced store (`bidaya.v1`) with a tiny typed wrapper.
**M5. `next.config.ts` cruft blocks the future.** Custom `webpack` block (AI-Studio HMR hack) **fails Next 16 builds**; `transpilePackages: ['motion']` for an unused lib; `images.remotePatterns` for picsum.photos while no `<Image>` exists anywhere. Fix: strip all three.
**M6. PWA icon pipeline.** Single SVG declared `any maskable`; `apple-touch-icon` is SVG — iOS doesn't support SVG touch icons → home-screen icon becomes a screenshot; no iOS splash; manifest `theme_color` (`#a97c34`) vs legacy file (`#064e3b`) conflict. Fix: generate real PNG set (192/512 + maskable + 180×180 Apple) at build time from one SVG source.
**M7. God component + prop drilling.** `page.tsx` (575 lines) owns location/theme/sound/offset/tabs/checklists/modals; `PrayerBar` takes 13 props. Fix: `SettingsProvider` (theme/sound/offset/location) + colocation; tab state → routes (H6).
**M8. Duplicated modal scaffolding ×4.** Backdrop + drag-handle + header + close-button + footer copy-pasted in `PrayerBar` (×2), `InteractiveTasbeeh`, `DevotionalBottomSheet`, `page.tsx` (×1) with subtly different paddings/radii — the source of visual inconsistency and the a11y gap (H3).
**M9. Emoji as iconography.** Prayer pills (`🌙 ☀️ 🌤️ 🌇 🌌 ✨`), content meta (`🌿 📖 🤍 ✨`), install banner (`📲`) — cross-platform inconsistent, off-brand, and read aloud awkwardly by screen readers when not `aria-hidden` (some are, some aren't). Fix: one icon set (lucide 1.x) + one custom ritual glyph set where lucide lacks (e.g., a refined miḥrab/verse mark).
**M10. No README, no license, no CI, no tests.** Single squashed commit; the prayer engine — the most correctness-sensitive code — has zero golden tests.
**M11. Metadata gaps.** No `viewport` export (theme-color hardcoded in `<head>`, can't switch for dark); `metadataBase` absent (OG warnings); no structured data; title is one long string on all pages (moot until routing lands).
**M12. `.env.example`/`metadata.json` AI-Studio leftovers.** Suggest a server-side Gemini capability that doesn't exist; `requestFramePermissions: geolocation` only matters on that host. Keep geolocation; delete the rest.

### LOW

- **L1.** Body `line-height: 1.7` for 15 px UI text is loose (1.55–1.6 reads tighter/more premium for UI; scripture keeps 1.9+).
- **L2.** One-off gradient FAB (`page.tsx:451`) contradicts the otherwise flat token system; `w-13/h-13` off-scale.
- **L3.** Hardcoded hexes bypassing tokens (`layout.tsx:33` `selection:bg-[#a97c34]`, `page.tsx:451` `#c59546`).
- **L4.** `html { scroll-behavior: smooth }` with no `prefers-reduced-motion` guard.
- **L5.** Footer duplicates the PWA-download CTA that's already in the nav bar (2 CTAs + 1 modal for one feature).
- **L6.** `any` in `lib/native.ts` (wake lock sentinel) — type it; `navigator.vibrate` guard exists, good.
- **L7.** Stage codes (`ST01`, `WP01`) rendered raw in UI as `font-mono` chips — internal jargon leaking into a devotional UI.
- **L8.** Arabic-Indic vs Western digits: Western digits with `tabular-nums` are correct for Algeria (ar-DZ convention) — document it as a decision so nobody "fixes" it later. `Intl` verified today: `ar-DZ` → «25 سبتمبر 2026».

---

## D. UX Problems

Ordered by how much they hurt a real daily user.

1. **The day has no center of gravity.** The app opens to a header block (brand row + date row + countdown hero + 8 prayer pills ≈ 40–50 % of a small phone's first viewport) *before* any devotional content. The user's question — «ماذا أعمل الآن؟» — is answered only after scrolling into the timeline. The single most important datum ("you are in stage ST05, العصر — here are its 7 practices, 4 already done") is never assembled in one place.
2. **Checkmarks can't be trusted (C2).** Weekly progress resets nightly; the reset button nukes silently (and uses a blocking `confirm()`); there is no history, no "yesterday", no sense of continuation — the tracker is a daily form, not a journey. Streaks/consistency — the honest motivators for this audience — are absent entirely.
3. **Navigation asks the user to know the taxonomy.** Four tabs («المسار الزمني لليوم والليلة», «وظائف الشهور والتقويم الهجري», «المناسبات والأحوال العارضة», «المعين الإيماني ومتتبع السنن») are scholarly categories, not user tasks. Mobile labels («المسار», «المواسم», «المناسبات», «المعين») are better but «المعين» is jargon. Nothing in the IA says "Today" even though that's the product's promise.
4. **Search fails silently (H5)** — one typo in Arabic (hamza variants, تاء مربوطة) yields a blank screen. No normalization (أ/ا, ى/ي, ة/ه), no "did you mean", no empty state.
5. **Content is behind a tap, and context is lost on return.** Every devotional item opens a bottom sheet (good mobile pattern), but the sheet resets scroll & selection each time, tab switches drop everything (H6), and the *same* sheet component is the only reading surface — long hadith + explanation + source in an 88 vh overlay with 13 px body text is a reading experience, crammed.
6. **The countdown demands attention but isn't actionable.** A seconds-precision `04:33:21` board ticks constantly (H7) yet tapping it does nothing; meanwhile «الوقت المتبقي لصلاة X» mixes label+value in one pill. Seconds invite clock-watching, which is the opposite of the product's calm.
7. **Settings live in three places.** Quick toggles (GPS/sound/theme) in the header cluster, hijri-offset stepper *also* on the date row, full settings modal behind a fourth icon — the offset control appears twice in one viewport. Location selection requires opening a modal even though the location name under the logo already looks clickable (it is — two entry points, subtle difference).
8. **Completion feedback is thin.** Toggling a row only strikes it through; the progress bar jumps; there is no moment of satisfaction at completing a stage or the day — and no *undo* affordance beyond re-tapping (fine) paired with no toast confirming what happened for screen-reader users (no `aria-live`).
9. **Feature-first modality.** The PWA-export modal (a developer capability) sits in the primary desktop nav — more prominent than any devotional feature. The iOS install banner (correctly targeted) pushes the whole page down on first visit.
10. **No onboarding, no first-run guidance.** First-time users get location defaults to Tizi Ouzou (wilaya #15) with only an `alert()` if GPS fails; nothing explains the stages concept, the tracker, or the sighting offset in product terms.
11. **Desktop is a stretched phone.** Max-width 7xl with the same stacked cards, chips, and sheets; the desktop FAB (bottom-left) duplicates the header Tasbīḥ button and the mobile FAB. No desktop-specific density (e.g., two-column day view: stages left, detail right).
12. **Micro-copy tone is inconsistent** — scholarly («المقصد التعبدي»), app-store marketing («100% Offline PWA»), and system-speak («تعذر جلب موقع GPS») share the same surfaces.

---

## E. UI / Visual Problems — why it reads "AI-generated"

The honest verdict: **less slop than the brief fears** — someone already fought the default gradient-card aesthetic (the CSS even contains anti-slop comments like «قوائم السنن — صفوف بخطوط فاصلة، ليست بطاقات متكررة»). What remains is the *inconsistency* and *unfinish* that signal generated UI:

| Generated-looking pattern | Where it shows | What it should become |
|---|---|---|
| **Same-sauce headers on every section**: icon-in-accent + bold display title + one-line grey subtitle, inside a bordered rounded-xl box — repeated 6× so every screen opens identically | `DailyTimeline:91-118`, `HijriSeasons:55-84`, `ContextualSunan:36-50`, `SpiritualTracker:38-70` | Real hierarchy: the *page* has one title; sections use typographic headers (no box) and reserve boxes for actual grouping |
| **rounded-xl applied as the default radius of everything** — 21× rounded-xl, 14× rounded-lg, 18× rounded-md with no rule for which goes where | whole codebase | A 3-step radius scale with semantic meaning (control=sm, group=md, overlay=lg); overlays get the largest, content groups the middle, controls the smallest |
| **Badge inflation** — pills for دليل التعبد، الأيام البيض، صيام مسنون، المحطة الحالية، الشهر #N، plus count-chips on every filter, plus target badges on every habit row | `PrayerBar`, `SpiritualTracker`, filters | Badges only for *state the user can act on or must know* (fasting day, current stage); counts become quiet tabular figures, not chips |
| **Icon-before-every-heading** — a 16px accent icon precedes literally every section title | all four tabs | Icons only where they aid recognition (bottom nav, prayer times); headings stand on typography |
| **Emoji doing iconography's job** (M9) | prayer pills, meta rows | Consistent stroke icons; ritual glyphs drawn once, intentionally |
| **Internal IDs as decoration** — `ST01`/`WP01` monospace chips | stage headers, rules | Real ordinal labels («المحطة الأولى · الثلث الأخير من الليل») |
| **Shadows on hairline-aesthetic elements** — shadow-2xs sprinkled on pills/buttons that already have 1px borders; shadow-xl/2xl on all four modals with different radii | 22 shadow usages | One elevation rule: borders for grouping, a single shadow token reserved for overlays and the floating nav |
| **The one gradient in the app is on the least important element** (mobile FAB) — gradient + glow + border-2 + scale animation | `page.tsx:451` | Flat copper, consistent with the token story (or demote the FAB entirely) |
| **Countdown "stadium board"** — giant serif HH:MM:SS ticking every second in a gradient hero box | `PrayerBar:236-266` | Minutes-precision quiet countdown; seconds only in the last minute |
| **Everything is a bordered box, even when stacked inside another box** — progress card inside a stage card inside a section; settings modal = 4 boxes inside a box | `SpiritualTracker`, settings modal | Group with space + rules (hr), not recursive boxes; "one box per level" rule |
| **Suppressive hydration hacks + timing artifacts** (18 `suppressHydrationWarning`) — a dev smell that produces flickery first paint | `PrayerBar` throughout | Isolate the clock; render deterministic shell first |
| **Two brands in one repo** (C1) — parchment/copper app exports an emerald/gold "PWA" | `public/index.html` | One design system, one source of truth |
| **Density without typographic rhythm** — 11/13/15/19/34 px sizes used ad hoc (`text-[10px]` appears 8×), tabular figures only sometimes | whole codebase | A type scale (12/13/15/17/20/24/32) with roles; numbers always tabular |

---

## F. Design System Proposal

One system, named here **«رقّ ٦» (Riqʿ — the parchment folio)**, formalizing what the codebase already gestures at.

### Typography (Arabic-first)
- **UI face:** keep **IBM Plex Sans Arabic** (excellent Arabic hinting, neutral, tabular-friendly) — weights 400/500/600/700 only.
- **Scripture face:** keep **Amiri** but *scope it strictly* to revealed/hadith text (dua, adhkar, hadith, Quran) at 19–22 px, `line-height: 1.95`, generous letter pacing for ḥarakāt; drop italics entirely. Evaluate **Noto Naskh Arabic** as fallback for dense reference text.
- **Scale (px / roles):** 12 caption-secondary · 13 label · 15 body · 17 body-lg/section title · 20 title · 24 page title · 32 display (used once per screen max). All numbers `font-variant-numeric: tabular-nums`, Western digits (ar-DZ convention — L8).
- **Reading measure:** scripture and explanation blocks max 62ch (`max-w-prose` equivalent), centered column on desktop, full-width − 32px on mobile.

### Color (semantic, 2 themes, one accent)
- Keep the parchment identity. Formalize tokens in Tailwind v4 `@theme`:
  - Surfaces: `page / surface / raised / overlay` (4 steps, no gradients).
  - Ink: `primary / secondary / muted` — **muted must clear 4.5:1** (darken to ≈ `#7a7261`); night `muted` up to ≈ 4.5:1.
  - Accent copper `#a97c34` family: `accent` (borders/icons only, ≥3:1), `accent-strong` (~`#8a6426`, fills buttons/progress — white text ≥ 4.5:1), `accent-soft` (tint bg), `accent-ink` (text on soft).
  - Support: `success` moss, `danger` clay, both with `-soft`/`-ink` twins. **No fourth hue.** Time-of-day may shift `page` warmth via one overlay token (Phase 8 option), never new colors.
- Dark theme: keep «سماء هادئة» palette, fix muted contrast, drop the `.dark` duplicate mechanism (single `data-theme`).

### Space / radius / border / elevation
- Space: 4-based scale (4/8/12/16/24/32/48/64) as Tailwind spacing tokens.
- Radius: `sm 6` (controls) · `md 10` (groups/rows containers) · `lg 14` (sheets/modals only) · `pill` (chips/dots). Nothing else — **no rounded-2xl, no mixed radii inside one component.**
- Borders: 1px `hairline` default, `strong` for interactive delimitation. Focus: 2px `accent` offset ring via `:focus-visible` token.
- Elevation: `0` for everything static; one `shadow-overlay` token for sheets/dialogs/floating nav; progress and pills get **0** shadows.

### Components (primitives → patterns)
Primitives (Phase 2, in `components/ui/`): `Button` (primary/secondary/ghost, 40/44px heights), `IconButton` (min 44px touch), `Chip` (filter, with count as plain tabular text), `Panel` (the bordered group, header optional, **no** icon), `RowItem` (checkable and pressable variants, single focusable button semantics), `Progress` (6px track, tabular label), `Sheet`/`Dialog` (focus trap, Escape, scroll lock, drag-handle on mobile, `aria-labelledby`), `EmptyState`, `SectionHeader` (typographic, no box), `Tabs` (roving tabindex, `aria-selected`), `Toast` (polite `aria-live`, for undo/confirm), `Field` (for the location search).
Patterns: PrayerStrip (8 times), StageRow group, ScriptureBlock (Amiri + «» + source line), SourceCitation (hadith reference styling), TrackerRow, MonthPicker.

### Motion
- Durations 120ms (micro) / 200ms (sheet, tab crossfade); easing `cubic-bezier(0.2, 0.8, 0.2, 1)`; `prefers-reduced-motion` disables transforms globally (token).
- Only five animations exist: (1) sheet in/out, (2) check completion (scale+draw, 150ms), (3) progress fill width, (4) tab content fade/slide 8px, (5) toast in. Nothing decorative; no parallax, no floating.

### Iconography
- lucide-react **1.x**, 1.5px stroke, sizes 16/20/24 only, RTL-neutral glyphs (avoid directional arrows inside content; use `chevron-left` for "forward" in RTL deliberately and centrally via a `ChevronForward` alias).
- One custom micro-set (3–4 glyphs: verse marker, tasbih bead ring, crescent-sighting icon, stage sun/moon arc) drawn to match stroke weight — this is the subtle cultural layer; no crescents elsewhere.

### Dark mode
- Single `data-theme` attribute set pre-hydration; `theme-color` meta switches with theme (viewport export); overlay shadow adjusts; contrast re-verified per theme (both palettes documented with ratios in the token file).

---

## G. Visual Concepts

Three directions, all honoring the existing parchment/copper seed. **Direction A is the evolution path** (lowest risk, most evidence); C is presented as the distinctive option.

### A. «رقّ» — Quiet Manuscript *(evolution of current)*
- **Philosophy:** a well-set pocket manuscript: warm paper, hairline rules, ink hierarchy, copper only for the living moment. Reading first, chrome almost absent.
- **Visual traits:** flat parchment `page`; content groups separated by space + hairlines (fewer boxes); scripture in Amiri blocks with copper quotation dashes; row-lists with generous 16px vertical rhythm; stage headers as typographic labels with a thin baseline rule; progress as a 6px copper line under the page title.
- **Advantages:** 70 % already exists; cheapest; most respectful of content; instantly legible in daylight/night.
- **Risks:** can drift bland without disciplined typography; needs the custom glyph set to feel authored.
- **Example screens:** Today = one column: date line (Hijri prominent, Gregorian quiet) → next-prayer line (no box) → «المحطة الحالية» rows with 4/7 done → collapsed later stages. Library = editorial two-level list, scripture blocks set like a muṣḥaf page.

### B. «فجر» — Calm Dawn *(ambient time-aware)*
- **Philosophy:** the interface breathes with the liturgical day: each stage owns a barely-there atmospheric tint (pre-dawn cool → noon clear → night deep) on the `page` surface only.
- **Visual traits:** same components as A, but the page background lerps between 6 stage-tints (tokens, not gradients); the active stage card carries the tint; imagery-free; larger 20px base type; motion slightly softer.
- **Advantages:** deeply "companion-like"; differentiates from every checklist app; strong PWA identity on install (status bar matches the hour).
- **Risks:** time-based theming multiplies QA surface; tint shifts can fight the copper accent; accessibility contrast must be verified ×6 tints ×2 themes.
- **Example screens:** Dawn = cool ivory, Fajr rows lead; Night = deep slate with raised copper — feels like a different room of the same house.

### C. «مكتبة» — Scholar's Library *(premium editorial)*
- **Philosophy:** an Islamic-studies reference that happens to be an app: ivory paper, near-black ink, sharp 6px radii, tabular data, footnote-grade citations, zero ornament.
- **Visual traits:** tighter radii (6/8), stronger type contrast (13 px labels vs 24 px titles), tables/grids for prayer times and month functions, small-caps-style Arabic labels (via weight/size, not fake small-caps), hairline column rules, copper reserved for one rule per screen.
- **Advantages:** most distinctive and "designed by a team"; unmatched content readability and density; ages extremely well.
- **Risks:** furthest from current code (radius/scale changes everywhere); can feel cold without warm paper and the glyph layer; less "app-like" for casual users.
- **Example screens:** Tracker = a month grid of quiet ink dots (no streak flames); Seasons = a year table with month rows and function counts.

**Recommendation (not a decision):** A now, borrowing C's density for tables and B's single time-tint later if users ask for atmosphere. Evidence: existing identity is A; effort ranking A < B < C; risk ranking A < B < C.

---

## H. Information Architecture

Current: 1 route, 4 in-page tabs + 2 global overlays (Tasbīḥ, PWA export) + settings modal + location modal.

**Proposed IA — task-named, URL-addressable:**

```
Shell (header: date line + next prayer line; bottom nav mobile / side-less top nav desktop)
├── اليوم  /today            ← default. The answer to "what now?"
│     ├─ Next prayer + countdown (compact)
│     ├─ Current stage rows (checkable) — auto-scrolled, expanded
│     └─ Rest of day: collapsed stage groups (accordion)
├── المواسم  /seasons        ← Hijri month (default current) + year view + seasons
├── المكتبة  /library        ← contextual sunan/duas + فقه الأذكار + أصول سياسة النفس (merged current tab 3 + tracker's two rule views)
│     └─ /library/[id]      ← full reading page (was: bottom sheet) with share/copy/tasbih
├── تقدّمي  /progress        ← today's checklist summary, weekly plate, month grid (history), streaks-lite
└── Overlays (not routes): المسبحة (global FAB), الإعدادات (sheet: location, theme, sound, sighting offset), تصدير PWA (Phase 7 decision)
```

- **Primary nav:** 4 items + center Tasbīḥ on mobile (keep the elevated center action — it's a good, culturally apt pattern); same 4 + visible labels on desktop, no FAB duplication (H/D12).
- **"What should I do today?"** is answered by the default route itself: current stage auto-selected by the prayer engine (already computed as `activeTimelineStageId`), with the day's completion ring beside the date.
- **Search:** global in the header (⌘K on desktop, tap on mobile) searching across all modules with Arabic normalization (أ/إ/ا، ة/ه، ى/ي) — Phase 6+; per-tab searches retire.
- **Content discovery:** seasons page defaults to *current month* with «this month's functions» as rows and the year as a quiet 12-cell picker (not a carousel — scannable).
- **Personalization (honest):** location, sighting offset, sound, theme; later — choose madhab for Asr? No (Algeria standard fixed); choose "my daily habits" subset in /progress (Phase 5 option).
- **Removed:** the PWA-export CTA from primary nav (moves to settings), the duplicate footer CTA, the second hijri-offset stepper on the date row.

---

## I. Screen-by-Screen Redesign

### 1. Header / PrayerBar (global shell)
- **Current problem:** 40–50 % of the first mobile viewport; brand row + badge + 4-icon cluster + date row + offset stepper + gradient countdown hero + 8 pills = 6 competing zones; `suppressHydrationWarning` ×16.
- **Proposed structure:** two compact lines. Line 1: app name (small) + location (tappable) + settings/theme/sound in a single overflow «⋯» sheet on mobile (GPS stays one tap in the location sheet). Line 2: Hijri date (prominent, Amiri) + quiet Gregorian + day-context chips only when true (الأيام البيض / صيام مسنون) + right-aligned compact countdown «العصر بعد ٣:٢١» (no seconds until < 60s, no box, tap → scrolls to prayer strip).
- **Hierarchy:** date & next prayer first; prayer times become a horizontally scrollable 8-pill strip *inside /today* only — not global chrome on every tab.
- **Components:** `SectionHeader`, `Chip`, `PrayerStrip`, `Countdown` (isolated leaf — fixes H7).
- **Mobile:** single-column, sticky date line only (nav bar is the sticky element, not the header). **Desktop:** line 2 gains the full 8-pill strip inline.
- **Interactions:** location tap → location sheet (search, GPS, recents); countdown tap → expand pill strip.
- **States:** before hydration — deterministic date-less skeleton (kills the flash); GPS denied — inline sheet hint, never `alert()`.

### 2. اليوم /today (DailyTimeline)
- **Current problem:** filter/search/stage-chip cluster inside a card *above* content; stages render as 8 similar boxed lists; current stage doesn't lead; empty search = blank; internal `ST0x` codes shown.
- **Proposed structure:** (a) day progress line: «٤ من ٦٠ — ٧٪» + thin copper fill; (b) **المحطة الحالية** expanded with its practices (auto-selected from `activeTimelineStageId`); (c) remaining stages as collapsed groups (typographic headers + count, tap to expand, «السابق/التالي» affordance); (d) search as icon → expanding input (global search later).
- **Hierarchy:** current stage ≫ next stages ≫ completed; filters demote to a «عرض» popover (الكل/المتبقي/المنجز).
- **Components:** `StageGroup` (accordion), `RowItem` checkable, `Progress`, `EmptyState`.
- **Mobile:** accordion keeps the day scannable; check tap = haptic + 150ms draw + toast «تم — تراجع». **Desktop:** two columns — stage rail (8 stages, current highlighted) left, active stage rows right; the detail sheet becomes a right panel.
- **Interactions:** complete-all-in-stage → stage header draws its rule copper (one quiet celebration). **States:** all-done (subtle «أتممت محطات اليوم» line), empty search, first-run (stage concept explained in one line, dismissible).

### 3. المواسم /seasons (HijriSeasons)
- **Current problem:** month carousel of 12 chips + separate banner card + list card = three boxes for one list; seasons view buries educational content in tinted boxes; «#N» jargon.
- **Proposed structure:** year strip (12 quiet cells, current month filled) → month title as a page-level heading (no banner card) → functions as editorial rows; «فصول العام» as a segmented control above; season blocks read like short essays with one pull-quote-style educational line (typographic, not a tinted box).
- **Hierarchy:** current month ≫ selected month ≫ seasons; Ibn Rajab attribution as a source line under the title (credit visible, not footer-trivia).
- **Components:** `MonthPicker` (grid), `RowItem` pressable, `ScriptureBlock`, `SourceCitation`.
- **Mobile/Desktop:** identical single column (content product); desktop gains max-w-prose centering and margin notes for sources.
- **Interactions:** row → reading page (`/library/[id]` pattern). **States:** none dynamic beyond current-month marker.

### 4. المكتبة /library (ContextualSunan + فقه rules)
- **Current problem:** 15 category chips × horizontal scroll + rows keyed by display strings; three rule-sets scattered (two inside tracker tab); search fails silently.
- **Proposed structure:** sidebar-less two-pane on desktop (categories left, list right); on mobile — categories as a vertical index (not chips) with counts; items open **reading pages** (real routes) with: scripture block → act/sunnah description → virtue → tazkiyah facet → source. الفقه rules become two library sections with proper article pages (expandable inline on mobile, full page on desktop).
- **Hierarchy:** reading page = scripture 20px Amiri ≫ body 15px ≫ source 12px muted-but-4.5:1.
- **Components:** `IndexList`, `Article`, `ScriptureBlock`, `CopyShare` (one control, native share → clipboard fallback), `TasbihLaunch`.
- **Mobile:** full-screen reading page (not sheet) with sticky mini-header (title + back); **Desktop:** 62ch reading column, sources as margin notes.
- **Interactions:** copy → toast «نُسخ النص»; «ابدأ التسبيح» → Tasbīḥ overlay prefilled. **States:** normalized search (M) with result counts; deep-linkable.

### 5. تقدّمي /progress (SpiritualTracker)
- **Current problem:** three sub-tabs (tracker/rules/rules) inside a tab; weekly wipe bug (C2); weekly milestones as nested boxed checklists inside a card; monthly milestones as decorative dots; zero history; reset via `confirm()`.
- **Proposed structure:** (a) Today summary ring + daily habits rows (targets as plain tabular text, not badges); (b) This week: Friday/Mon-Thu checklists as two columns (mobile: segmented); (c) This month: white-days + month functions cross-link; (d) History: quiet 30-day grid (ink dots, no streak flames, no guilt copy — «حفظ الله» tone); (e) rules content moved to /library.
- **Hierarchy:** today ≫ week ≫ month ≫ history; reset = small text action with undo toast (not confirm).
- **Components:** `TrackerRow`, `WeekCard`, `MonthGrid`, `Toast`/undo.
- **Mobile/Desktop:** grid scales 2→4 columns on desktop. **States:** day-with-nothing-done (encouraging one-liner, not zero-shaming), new week/month boundaries handled by period-keyed store (C2 fix).

### 6. المسبحة (InteractiveTasbeeh)
- **Current problem:** strong core (big tactile circle) but preset bar scrolls off, sound toggle duplicated (sheet + header), laps/target as two text rows, `animate-in` no-op, wake-lock silent.
- **Proposed structure:** keep as the elevated center action; the sheet becomes near-fullscreen on mobile: dhikr in Amiri at top, giant ring center (count inside, target as arc stroke around ring — one element fewer), laps/target as one caption line, presets as a compact horizontal chip row that stays, reset = icon with undo toast (misclick-safe: double-tap or hold).
- **Hierarchy:** the ring is the screen.
- **Interactions:** tap anywhere on ring; `aria-live="polite"` announces each 10th; completion = single soft chime + arc completes + lap increments (respect `prefers-reduced-motion`). **States:** custom dhikr prefilled from library; session persists if sheet closed accidentally (Phase 5 store).

### 7. DevotionalBottomSheet → reading surface (see #4)
- **Current problem:** long content in 88vh overlay; no dialog semantics; share button labeled «نسخ» but opens native share; action bar wraps awkwardly on small phones.
- **Proposed:** mobile keeps a true bottom sheet for *preview* with «اقرأ كاملًا» → full page; desktop uses the side panel. One `Sheet` primitive for all (fixes H3/M8).

### 8. Settings & Location sheets
- **Current problem:** settings modal is 4 nested boxes; offset control duplicated in two places; location list = 58+12 buttons in a 3-col grid with search; GPS failure = alert.
- **Proposed:** one settings sheet, list-style rows (theme segmented, sound switch, sighting offset stepper with plain-language consequence «يتقدّم التقويم يومًا»), location as its own sheet with search-first (normalized Arabic), GPS prominent, recents. Everything reachable in ≤ 2 taps from header.

### 9. Footer & PWA export modal
- **Current problem:** footer repeats nav CTA; modal over-promises («100٪ offline») a broken artifact (C1); sources listed as tiny footer text (they deserve better).
- **Proposed:** slim footer: sources as a proper «المصادر» line (links/tooltip), version, theme-aware; PWA export moves to Settings, hidden until rebuilt (or relabeled honestly «تصدير تجريبي» during Phase 7).

---

## J. Technical Modernization

**Current architecture:** one client-everything route; shared state by prop drilling in `page.tsx`; persistence as 8 raw localStorage keys; hand-rolled astronomy/Hijri; hand-rolled modals; hand-rolled SW; regex-based single-file exporter; no tests/CI; lint disabled.

**Target architecture (no rewrite — 6 moves):**

1. **Routing:** App Router segments `/today /seasons /library /progress` + `layout.tsx` shell (header/nav/settings provider). Tab components become route pages with zero logic change initially (Phase 3). Content detail: `/library/[id]` generated from data (static params — fully prerenderable; unlocks per-article metadata/OG).
2. **State:** `SettingsProvider` (location, theme, sound, offset) via context + one typed, versioned storage module (`lib/store.ts`: namespaced `bidaya.v1`, period-keyed records, migration hook). Tab-internal state stays local. No state library.
3. **Domain:** `lib/prayer.ts` → thin adapter over `adhan` (compute once per location/day; expose same `PrayerTimesResult` interface so UI is untouched); `getHijriDate` → `Intl islamic-umalqura` + existing offset, keeping the same `HijriDate` interface. Golden tests pin both engines (Phase 0 baseline captures current outputs first).
4. **UI kit:** `components/ui/*` primitives (§F) replacing copy-pasted scaffolding; data components consume them; migration is per-component and reviewable.
5. **PWA:** SW rewritten to network-first navigations + SWR static, cache versioned by build; real PNG icon set; export feature rebuilt with esbuild producing a genuine single-file (bundled JS, no CDN, inlined fonts subset) — or removed.
6. **Tooling:** lockfile committed; ESLint unified (flat config only), lint in CI; `next.config.ts` stripped (webpack block, transpilePackages, picsum pattern); then Next 16 upgrade (Turbopack default) — verified today against the official upgrade guide; fonts via `next/font`.

**Classification:**
- *Necessary (correctness/trust):* C1 export, C2 persistence, C3 prayer tz, C4 lockfile, H1 contrast, H2/H3 a11y, H8 SW, H10 dead classes.
- *Beneficial (structural):* routing, provider, primitives, adhan/Intl, fonts, Next 16, SW rewrite, per-route data splitting.
- *Optional (later/conditional):* React Compiler (post-Next-16; kills the remaining re-render waste), React 19 View Transitions for tab changes, base-ui Dialog (only if the hand-rolled focus trap proves costly), monthly heatmap, i18n message extraction.

**Migration strategy:** strangler pattern — each phase ships behind working app; interfaces (`PrayerTimesResult`, `HijriDate`, `DailyItem`…) frozen so UI never breaks mid-migration; golden tests before any engine swap; visual QA checklist per phase.

---

## K. Dependency Plan

| Dependency | Current | Action | Why |
|---|---|---|---|
| package-lock.json | absent | **ADD (commit)** | Reproducibility; already generated by this audit's clean install |
| next | 15.5.26 | **UPGRADE → 16.3.x** (Phase 3, after config strip) | 15.x is backport-only; migration cost here is low (verified breaking-change list vs. codebase) |
| react / react-dom | 19.3.0 | **KEEP** | Current; rides with Next |
| typescript | 5.9.3 | **KEEP** | TS 7 breaks typescript-eslint until 7.1 API; zero pressure |
| tailwindcss + @tailwindcss/postcss | 4.1.11 | **UPGRADE → 4.3.x** | Minor-line currency; adopt `@theme` tokens in Phase 2 |
| lucide-react | 0.553.0 | **UPGRADE → 1.x** | Brand-icon removal doesn't affect us; smaller package; aliases ease migration |
| clsx, tailwind-merge | 2.1.1 / 3.3.1 | **KEEP** | Become `cn()` backbone of primitives |
| adhan | — | **ADD 4.4.6** | Replaces bug-prone timezone handling (C3); MIT; battle-tested |
| motion | 12.43.0 | **REMOVE** | Unused; CSS covers our 5 animations |
| @google/genai | 2.24.0 | **REMOVE** | Unused AI-Studio scaffold (+ env example key, metadata.json capability) |
| @hookform/resolvers | 5.9.1 | **REMOVE** | Orphaned (no react-hook-form; no forms worth a lib) |
| class-variance-authority | 0.7.1 | **REMOVE** (re-add only if primitives demand) | Unused |
| tw-animate-css | 1.4.0 | **REMOVE** | Never imported; classes are no-ops; our motion list needs none of it |
| @tailwindcss/typography | 0.5.20 | **REMOVE** | Unused |
| autoprefixer | 10.4.21 | **REMOVE** | Redundant under @tailwindcss/postcss (Lightning CSS) |
| firebase-tools | 15.31.0 | **REMOVE** from devDeps (deploy tooling → CI) | Nothing in repo uses Firebase |
| eslint / eslint-config-next | 9.39.1 / 16.0.8 (mismatched) | **UNIFY** (align to Next major; ESLint 10 optional) | One flat config; enable lint in CI; delete `.eslintrc.json` |
| @types/node | ^20 | **BUMP → 22** | Match runtime |
| base-ui (Dialog) | — | **ADD? optional** | Only if hand-rolled focus-trap maintenance becomes real; decision gate in Phase 2 |
| prettier | — | optional **ADD** | Only if team grows; eslint suffice for now |

---

## L. Performance Plan (measured, not generic)

1. **Kill the 1 Hz full-tree re-render** (H7): isolate `Countdown` leaf; recompute prayer times per minute. Biggest real-world win (battery on the primary evening-use case).
2. **Fonts:** `next/font/google` — removes a render-blocking `@import` chain; subset `arabic`; drop 2 Amiri italics + 1-2 unused Plex weights → ~9 font requests become 3-4 self-hosted preloaded, zero CLS.
3. **First Load JS 159 kB** is acceptable for an app-like PWA; the cheap win is **per-route data splitting** once routes exist (only /today needs Module 1's 24 KB gz initially; library pages load their module). Do *not* prematurely lazy-load tabs before routing lands.
4. **SW strategy** (H8) is also a performance item: stale-while-revalidate for immutable chunks = instant repeat loads without the breakage.
5. **Hydration cost:** after Phase 2/3, most of the shell (header structure, library articles, seasons text) can be server components — the interactive islands (checkboxes, countdown, sheets) stay client. Target: cut client bundle 30-40 % without behavior change.
6. **Render waste on filters:** filter chains recreate arrays each render (fine at this size); if React Compiler lands (optional), re-renders shrink further — measure before adopting.
7. **No images exist** — `next/image`/picsum config is dead config; deleting it removes a config surface, not bytes.

---

## M. Accessibility Plan (concrete)

1. Contrast: darken `--ink-muted` and primary-button fill (targets: text ≥ 4.5:1, UI components ≥ 3:1); re-verify both themes; add ratios as comments in the token file.
2. Rows: convert all `div onClick` rows to single focusable `<button>`/`<a>` semantics (H2); checkbox separate with `aria-pressed`/`aria-label` including state («الاستيقاظ… — منجز/غير منجز»).
3. One `Sheet` primitive with: `role="dialog"`, `aria-modal`, `aria-labelledby`, focus trap, Escape, focus return, scroll lock, and mobile drag-handle that is decorative (`aria-hidden`).
4. Touch targets ≥ 44×44 on mobile for chips/steppers/time pills (padding, not size lies).
5. `aria-live="polite"` regions: tasbīḥ count (throttled), toasts (undo/confirm), GPS errors (replacing `alert`).
6. Keyboard: visible `:focus-visible` ring token; roving-tabindex Tabs; accordion buttons with `aria-expanded`/`aria-controls`; Escape closes sheets; ⌘K search (Phase 6).
7. `prefers-reduced-motion`: global transform/transition guard token; the completion animation becomes a color/opacity swap.
8. Screen-reader pass on Arabic: `lang="ar"` correct; expandable abbreviations («هـ» first use); emoji rendered `aria-hidden` (M9); stage IDs removed from accessible names (L7).
9. Forms: location search gets a `<label>` (visually-hidden), results as `listbox` semantics, empty state announced.
10. Automated: `axe` in CI smoke (Phase 10) + manual VoiceOver/TalkBack pass on the five core flows.

---

## N. Implementation Roadmap

| Phase | Goals | Files likely affected | Depends on | Risk | Expected result |
|---|---|---|---|---|---|
| **0 — Safety & baseline** | Commit lockfile; pin deps; README + license; CI (typecheck+lint+build); golden tests capturing *current* prayer-times/Hijri outputs for 6 cities × 8 dates; git tag `pre-redesign` | `package.json`, `package-lock.json`, `README.md`, `.github/workflows/ci.yml`, `lib/__tests__/golden.*`, `next.config.ts` | — | None | Reproducible, verified baseline; every later diff provable |
| **1 — Correctness foundation** (no visual change) | Fix C2 (period-keyed store + migration), C3 (adhan adapter w/ golden tests), H8 (SW strategy), H10 (xs/scrollbar/animate classes), H5-empty-search states, remove dead deps + configs (M5, M12, H9, K-table), dark-flash pre-hydration script, `viewport` export, fonts → next/font (M1), C1-short-term: hide export CTA | `app/page.tsx`, `lib/store.ts`(new), `lib/prayer.ts`, `public/sw.js`, `app/globals.css`, `app/layout.tsx`, `next.config.ts`, `package.json` | P0 | Medium (persistence + engine swaps) — mitigated by golden tests | App behaves truthfully: no data loss, correct times, no flash, honest UI |
| **2 — Design system «رقّ»** | Tokens → `@theme`; primitives (`ui/*` incl. Sheet with full a11y); migrate the 4 duplicated modals; radius/shadow/type-scale sweep; icon policy (lucide 1.x upgrade, emoji removal); contrast fixes (H1) | `app/globals.css`, `components/ui/*`(new), all 8 components gradually | P1 | Medium (visual QA) | One coherent visual language; a11y primitives everywhere |
| **3 — Navigation & IA** | Routes `/today /seasons /library /progress`; shell layout; strip page.tsx god-state into provider + routes; `next` → 16 upgrade + config modernization; Settings sheet consolidation | `app/**` restructured, `components/*` become pages/sections, `next.config.ts`, `package.json` | P2 | Medium | URL-addressable app; back button works; Next 16/Turbopack |
| **4 — Today experience** | `/today` per §I-2: current-stage-first, day progress line, stage accordions, quiet countdown, prayer strip placement | `app/today/*`, `components/PrayerBar` split, `DailyTimeline` → sections | P3 | Low-Med | "What now?" answered above the fold on any phone |
| **5 — Habits & tracking** | `/progress` per §I-5: targets as text, week columns, month cross-links, history grid, undo toasts, honest consistency language | `app/progress/*`, store extensions | P2 (P3 for route) | Low | A tracker users trust for months |
| **6 — Content experience** | Reading pages `/library/[id]` (+ static params, per-page metadata); scripture typography layer; source citations; normalized search (+ global ⌘K); rules content relocated | `app/library/**`, `lib/data.ts` (IDs only), `components/ScriptureBlock` | P3 | Medium (content routing) | Editorial-grade reading; shareable deeb-linked content |
| **7 — Secondary screens & PWA** | Settings/location polish; Tasbīḥ refinements; iOS banner redesign; real PNG icon set + splash; **rebuild single-file export with esbuild** (or remove); sources footer | `components/*`, `public/*`, `scripts/generate-single-file.mjs` → esbuild pipeline | P2 | Medium (export rebuild) | The offline promise becomes true and on-brand |
| **8 — Motion & polish** | The five sanctioned animations; completion micro-feedback; tab crossfades; reduced-motion tokens; optional single time-tint (Direction B) | `ui/*`, globals | P2-7 | Low | Calm, alive, never decorative |
| **9 — Performance & a11y hardening** | Server-component conversion of static sections; bundle re-measure; full keyboard/SR pass; contrast re-audit; `axe` clean | `app/**`, `components/**` | P3-8 | Low | Faster + provably accessible |
| **10 — Testing & QA** | Unit: store/prayer/Hijri/search-normalizer; Playwright smoke (RTL, mobile+desktop) on 6 core flows; visual regression on tokens; CI gates | `__tests__`, `e2e`, CI | P0+ | Low | Confidence to iterate forever |

---

## O. Prioritized Backlog

| # | Priority | Task | Impact | Effort | Risk | Dependency |
|---|---|---|---|---|---|---|
| 1 | P0 | Commit lockfile, pin versions, CI, README | Trust in every future change | S | None | — |
| 2 | P0 | Golden tests for prayer/Hijri engines | Makes C3 safe | S | None | 1 |
| 3 | P0 | Fix weekly/monthly data wipe (C2) | Core-trust data integrity | S | Med | 1 |
| 4 | P0 | Replace prayer tz logic (adhan) (C3) | Religious credibility | M | Med | 2 |
| 5 | P0 | Neutralize broken export: hide CTA / honest label (C1a) | Stops shipping a broken file | S | None | 1 |
| 6 | P1 | SW strategy + build-versioned cache (H8) | Prevents post-deploy white screens | S | Low | 1 |
| 7 | P1 | Contrast fixes + 44px targets (H1) | WCAG AA floor | S | Low | 2 |
| 8 | P1 | Remove dead deps/configs; unify ESLint; enable lint (K) | Hygiene, smaller install, catches future bugs | S | Low | 1 |
| 9 | P1 | Fix dead classes (`xs:`, `scrollbar-none`, `animate-in`) (H10) | Visible correctness | S | None | — |
| 10 | P1 | Pre-hydration theme script + single mechanism (H4) | Kills dark-mode flash | S | Low | — |
| 11 | P1 | Fonts → next/font, drop italics/weights (M1) | Perceived speed, CLS | S | Low | — |
| 12 | P1 | Empty states + un-block alert/confirm (H5) | Search becomes usable | S | Low | 7 |
| 13 | P2 | Tokens in `@theme` + primitives + Sheet a11y (§F) | Everything downstream | L | Med | 7 |
| 14 | P2 | Modal consolidation ×4 → one Sheet (M8/H3) | Consistency + a11y | M | Med | 13 |
| 15 | P2 | lucide 1.x + icon/emoji policy (M9) | Coherence | S | Low | 13 |
| 16 | P3 | Routes + shell + provider (J1/J2) | IA, back button, state per segment | L | Med | 13 |
| 17 | P3 | Next 16 upgrade + config strip (B) | Mainline platform | S | Low-Med | 8,16 |
| 18 | P3-4 | `/today` current-stage-first redesign (I-2) | The core promise | M | Low-Med | 16 |
| 19 | P5 | `/progress` history + honest streaks (I-5) | Retention | M | Low | 3,16 |
| 20 | P6 | `/library/[id]` reading pages + normalized search (I-4) | Content product maturity | L | Med | 16 |
| 21 | P7 | esbuild single-file export (C1b) | Flagship feature, truthful | M | Med | 13 |
| 22 | P7 | PNG icons + iOS touch icon + splash (M6) | Installed-app quality | S | Low | 13 |
| 23 | P8 | Motion set + reduced-motion (§F) | Feel | S | Low | 13 |
| 24 | P9-10 | RSC conversion, axe CI, E2E smoke | Durability | M | Low | 16+ |

(S = ≤ half day, M = 1–3 days, L = multi-day, at this codebase's size.)

---

## P. Before / After Design Principles

1. Instead of **a boxed icon+title+subtitle header card opening every section** → **typographic section headers with a hairline rule**, because chrome repeated six times reads as template, not hierarchy.
2. Instead of **`rounded-xl` as reflex on every container** → **three semantic radii (6/10/14) with overlays largest**, because radius should encode depth, not habit.
3. Instead of **badges for counts, targets, and states everywhere** → **badges only for actionable state** (صيام مسنون، المحطة الحالية); counts become quiet tabular figures, because badges that mean nothing train users to ignore badges.
4. Instead of **a ticking seconds board for the next prayer** → **a minutes-precision line that gains seconds only under 60s**, because clock anxiety is the opposite of the product's purpose.
5. Instead of **18 `suppressHydrationWarning` band-aids** → **one isolated clock leaf + deterministic shell**, because hacks at the root hide the one component that legitimately needs care.
6. Instead of **emoji prayer/meta icons** → **a 3–4 glyph custom ritual set + lucide 1.x**, because emoji render differently per platform and read aloud badly.
7. Instead of **four copy-pasted modal scaffolds** → **one accessible `Sheet` primitive**, because consistency of overlay behavior *is* the product's reliability story.
8. Instead of **`ST01`-style internal IDs in the UI** → **«المحطة الأولى · الثلث الأخير من الليل»**, because scholarly bookkeeping is not devotional language.
9. Instead of **weekly checklists that reset at midnight** → **period-keyed records with history**, because a tracker that loses data teaches users to stop tracking.
10. Instead of **`alert()` for GPS failure and `confirm()` for resets** → **inline sheet hints and destructive-action + undo toast**, because blocking system dialogs break the calm and aren't RTL-styled.
11. Instead of **silent empty search results** → **«لا نتائج لـ"…" — مسح البحث» with Arabic normalization**, because one hamza typo must not erase the library.
12. Instead of **whitespace-free nested boxes (box in box in box)** → **space + hairlines for grouping, one box per level**, because paper-like calm comes from whitespace, not borders.
13. Instead of **gradient hero + gradient FAB as the only gradients** → **flat copper `accent-strong` fills**, because one flat accent used sparingly reads intentional; two gradients read generated.
14. Instead of **CSS `@import` of 9 font files including Amiri italics** → **`next/font` self-hosted, 3+2 weights, arabic subset**, because scripture typography deserves zero layout shift and no dead styles.
15. Instead of **`div onClick` content rows with a nested button** → **one focusable row button with a separate labeled check control**, because the content *is* the interface; if a keyboard can't reach it, it isn't a feature.
16. Instead of **hand-rolled regex TypeScript-stripper for the export** → **esbuild bundle at build time**, because the flagship feature must be engineered, not improvised.
17. Instead of **hardcoded UTC offsets per city** → **IANA timezone resolution (adhan/Intl)**, because prayer times printed wrong for Cairo in winter is a failure no palette can redeem.
18. Instead of **PWA-export CTA in the primary nav** → **export tucked into Settings, sources promoted to the footer**, because the nav should sell the product's purpose, not its plumbing.

---

## Q. Final Recommendation

**Design statement:**

> This should feel like **a letterpress daily liturgy — a pocket waṣiyya set in warm paper and quiet ink, where copper marks only the living moment and every checkmark can be trusted for a lifetime** — rather than **a feature-stacked dashboard wearing parchment colors, whose counts flicker, whose exports break, and whose boxes reset overnight**.

The product's soul — curated, sourced, tazkiyah-oriented content on a parchment canvas — is already here and already right. The work is disciplined finishing: make the data incorruptible (Phase 0–1), make the language of the interface one coherent system (Phase 2–3), put «ماذا أعمل الآن؟» above the fold (Phase 4–5), give the content the typography of a muṣḥaf (Phase 6), and make the offline promise true (Phase 7). No rewrite. No new frameworks. One direction (A: «رقّ»), ten phases, and the app graduates from "works" to **trusted daily companion**.
