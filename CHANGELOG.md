# Changelog

## 0.7.0 — 2026-06-02

- **Rebrand:** Product name **Mambo Desktop for Admin2** (Andy/rhuk feedback — avoid confusion with official future Admin2 desktop)
- Admin2 sidebar, menubar, and UI strings updated; plugin slug `grav-desktop-admin2` and API routes `/grav-desktop/*` unchanged

## 0.6.0 — 2026-06-01

- **Phase C — Delight:** Sticky notes on the desktop (draggable, per-user server save)
- Wallpaper **preset strip** above the taskbar (built-ins + JavaBean presets + custom)
- **Custom wallpaper upload** per admin user (WebP, via API)
- User wallpaper prefs API (`GET/PATCH /grav-desktop/wallpaper-prefs`, custom image routes)

## 0.5.0 — 2026-06-01

- **Phase B — Operator power:** Log Tail, Maintenance toggle (`.upgrading`), API Smoke Test, GPM quick search
- Operator app group on desktop + Start menu
- `GET/PATCH /grav-desktop/maintenance` for maintenance flag

## 0.4.0 — 2026-06-01

- Window polish: draggable title bar, resize handle, maximize / restore, Start menu
- **Start menu** on the taskbar — all apps by section
- Window session v2 persists maximized state and geometry after drag / resize

## 0.3.0 — 2026-06-01

- **Phase A:** Site Vitals window (Grav, PHP, theme, pages, cache, site URL; JavaBean preset when available)
- Recent Pages app — last edited routable pages with one-click open in Admin2 Pages editor
- JavaBean wallpaper mode — desktop background follows active JavaBean preset dark tokens
- Spotify embed on by default when a playlist URL is configured
- API routes `/grav-desktop/vitals` and `/grav-desktop/recent-pages`

## 0.2.2 — 2026-06-01

- Menubar shortcut uses `onApiMenubarItems` at runtime (no `admin-next.yaml` writes)

## 0.2.1 — 2026-06-01

- Visual desktop section labels and column dividers (Apps, Admin2, Team DC Arcade, More)
- Full-bleed plugin page chrome — hides only the Mambo Desktop page header, not sidebar titles
- Double-click launch default aligned across PHP config and frontend
- Single-click mode respects drag vs open
- FlapLab in arcade catalog; Lappy Lab removed from bundle script

## 0.2.0 — 2026-05-28

- Grouped desktop sections (Apps, Admin2, Team DC Arcade)
- Wallpaper presets (gradient, Team DC, midnight, plain)
- Double-click icon launch (single-click optional in settings)
- Taskbar live clock
- Explorer reads site page tree via API
- Desktop Clock dashboard widget
- Optional Spotify embed app (off by default)

## 0.1.0 — 2026-05-28

- Initial Mambo Desktop for Admin2
- Icon launcher, windows, taskbar
- Notepad, Clock, Language, Explorer lite
- Team DC Arcade hooks (Invaders, Galaga, Magick Emojis, FlapLab)
- Menubar shortcut option
