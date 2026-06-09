# Changelog

## 1.0.5 — 2026-06-05

- **Menubar:** Desktop shortcut registers via Operator Dock / JavaBean preferences merge (not broken action-only menubar API)
- **Menubar:** Removed `onApiMenubarItems` URL registration that caused `undefined` action errors

## 1.0.4 — 2026-06-02

- **Fix:** Strip UTF-8 BOM from `blueprints.yaml` — fixes GPM **Blueprints: invalid** on install (rhuk/Andy validator)

## 1.0.3 — 2026-06-04

- **Fix:** Grav 2 plugin bootstrap — `return new GravMamboDesktopAdmin2Plugin($name, $grav)` so Andy slug `mambo-desktop-admin2` loads (fixes “enabled but not found” / missing Admin2 sidebar)

## 1.0.2 — 2026-06-04

- **New:** Classic POST boot sequence — amber BIOS-style overlay on first desktop load (Team DC, narrative RAM test, arcade registry lines)
- **New:** Esc / click to skip; optional **boot every visit** in plugin settings

## 1.0.1 — 2026-06-02

- **Fix:** Strip UTF-8 BOM from all PHP files — fixes PHP 8 namespace fatal on install/load (GPM 1.0.0 shipped with BOM)

## 1.0.0 — 2026-06-02

- **Slug rename (Andy convention):** `mambo-desktop-admin2` — folder, config, GPM slug, API routes `/mambo-desktop/*`
- GitHub repo: `grav-plugin-mambo-desktop-admin2`
- **Breaking:** replace `grav-desktop-admin2` plugin folder; copy `user/data/grav-desktop-admin2/` → `user/data/mambo-desktop-admin2/` to keep notepad/stickies/wallpapers
- Product name: **Mambo Desktop for Admin2**

## 0.7.0 — 2026-06-02

- Display name **Mambo Desktop for Admin2** (slug was still `grav-desktop-admin2` until 1.0.0)

## 0.6.0 — 2026-06-01

- **Phase C — Delight:** Sticky notes on the desktop (draggable, per-user server save)
- Wallpaper **preset strip** above the taskbar (built-ins + JavaBean presets + custom)
- **Custom wallpaper upload** per admin user (WebP, via API)
- User wallpaper prefs API (`GET/PATCH /mambo-desktop/wallpaper-prefs`, custom image routes)

## 0.5.0 — 2026-06-01

- **Phase B — Operator power:** Log Tail, Maintenance toggle (`.upgrading`), API Smoke Test, GPM quick search
- Operator app group on desktop + Start menu
- `GET/PATCH /mambo-desktop/maintenance` for maintenance flag

## 0.4.0 — 2026-06-01

- Window polish: draggable title bar, resize handle, maximize / restore, Start menu
- **Start menu** on the taskbar — all apps by section
- Window session v2 persists maximized state and geometry after drag / resize

## 0.3.0 — 2026-06-01

- **Phase A:** Site Vitals window (Grav, PHP, theme, pages, cache, site URL; JavaBean preset when available)
- Recent Pages app — last edited routable pages with one-click open in Admin2 Pages editor
- JavaBean wallpaper mode — desktop background follows active JavaBean preset dark tokens
- Spotify embed on by default when a playlist URL is configured
- API routes `/mambo-desktop/vitals` and `/mambo-desktop/recent-pages`

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
